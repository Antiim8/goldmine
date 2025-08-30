package main

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"flag"
	"fmt"
	"io"
	"net"
	"net/http"
	"os"
	"sync"
	"time"
)

type Deal struct {
	ID        int     `json:"id"`
	Name      string  `json:"name"`
	Liquidity int     `json:"liquidity"`
	Buff      float64 `json:"buff"`
	CsgoTm    float64 `json:"csgoTm"`
	Vol7d     int     `json:"vol7d"`
	Purch     int     `json:"purch"`
	Target    float64 `json:"target"`
	Youpin    float64 `json:"youpin"`
	Margin    float64 `json:"margin"`
	SKU       string  `json:"sku,omitempty"`
}

// Derive a stable numeric ID if you don't have one
func DeriveID(sku, name string) int {
	key := name
	if sku != "" {
		key = sku
	}
	const offset64, prime64 = 1469598103934665603, 1099511628211
	var h uint64 = offset64
	for i := 0; i < len(key); i++ {
		h ^= uint64(key[i])
		h *= prime64
	}
	return int(h & 0x7FFFFFFF)
}

type Client struct {
	BaseURL string
	HTTP    *http.Client
}

func NewClient(baseURL string, timeout time.Duration) *Client {
	tr := &http.Transport{
		Proxy:                 http.ProxyFromEnvironment,
		ForceAttemptHTTP2:     true,
		MaxIdleConns:          100,
		IdleConnTimeout:       90 * time.Second,
		TLSHandshakeTimeout:   10 * time.Second,
		ExpectContinueTimeout: 1 * time.Second,
	}
	return &Client{
		BaseURL: baseURL,
		HTTP: &http.Client{
			Transport: tr,
			Timeout:   timeout,
		},
	}
}

var transientStatus = map[int]bool{
	408: true, 500: true, 502: true, 503: true, 504: true,
}

func (c *Client) UpsertDeal(ctx context.Context, d Deal) (suppressed bool, err error) {
	buf, _ := json.Marshal(d)
	req, err := http.NewRequestWithContext(ctx, "POST", c.BaseURL+"/api/deals", bytes.NewReader(buf))
	if err != nil {
		return false, err
	}
	req.Header.Set("Content-Type", "application/json")
 	if v := os.Getenv("API_KEY"); v != "" { req.Header.Set("X-API-Key", v) }

	var resp *http.Response
	for attempt := 0; attempt < 4; attempt++ {
		resp, err = c.HTTP.Do(req)
		if err != nil {
			if isNetTransient(err) && attempt < 3 {
				time.Sleep(backoff(attempt))
				continue
			}
			return false, err
		}
		defer resp.Body.Close()

		if resp.StatusCode == 200 {
			io.Copy(io.Discard, resp.Body)
			return false, nil
		}
		if resp.StatusCode == 202 {
			io.Copy(io.Discard, resp.Body)
			return true, nil
		}
		if transientStatus[resp.StatusCode] && attempt < 3 {
			time.Sleep(backoff(attempt))
			continue
		}
		b, _ := io.ReadAll(resp.Body)
		return false, fmt.Errorf("upsert failed: %s (%d)", string(b), resp.StatusCode)
	}
	return false, errors.New("exhausted retries")
}

func isNetTransient(err error) bool {
	var ne net.Error
	if errors.As(err, &ne) && ne.Timeout() {
		return true
	}
	var opErr *net.OpError
	if errors.As(err, &opErr) {
		return true
	}
	return false
}

func backoff(attempt int) time.Duration {
	base := 200 * time.Millisecond
	d := base << attempt
	j := time.Duration(int64(d) / 5) // ±20%
	return d - j + time.Duration(int64(j)*time.Now().UnixNano()%2)
}

type BulkStats struct {
	Total      int
	Sent       int
	Suppressed int
	Failed     int
}

func (c *Client) UpsertDealsBulk(ctx context.Context, deals []Deal, concurrency, rps int) BulkStats {
	var st BulkStats
	st.Total = len(deals)

	sem := make(chan struct{}, concurrency)
	var rl <-chan time.Time
	if rps > 0 {
		t := time.NewTicker(time.Second / time.Duration(rps))
		defer t.Stop()
		rl = t.C
	}

	var mu sync.Mutex
	var wg sync.WaitGroup
	for _, d := range deals {
		d := d
		wg.Add(1)
		go func() {
			defer wg.Done()

			if rl != nil {
				select {
				case <-ctx.Done():
					return
				case <-rl:
				}
			}

			select {
			case sem <- struct{}{}:
				defer func() { <-sem }()
			case <-ctx.Done():
				return
			}

			supp, err := c.UpsertDeal(ctx, d)
			mu.Lock()
			defer mu.Unlock()
			if err != nil {
				st.Failed++
				fmt.Printf("FAIL id=%d name=%q err=%v\n", d.ID, d.Name, err)
				return
			}
			if supp {
				st.Suppressed++
				fmt.Printf("SUPP id=%d name=%q (blacklist)\n", d.ID, d.Name)
			} else {
				st.Sent++
			}
		}()
	}
	wg.Wait()
	return st
}

func main() {
	var (
		apiURL      = flag.String("api", getenv("GOLDMINE_API_URL", "http://localhost:3001"), "API base URL")
		file        = flag.String("file", "", "Path to deals.json (array)")
		timeout     = flag.Duration("timeout", 8*time.Second, "HTTP timeout")
		concurrency = flag.Int("concurrency", 8, "Parallel requests")
		rps         = flag.Int("rps", 10, "Requests per second (0 = unlimited)")
		derive      = flag.Bool("derive-id", true, "Derive ID from sku/name when id=0")
	)
	flag.Parse()

	if *file == "" {
		fmt.Println("Usage: go run . -file ./deals.json [-api http://localhost:3001]")
		os.Exit(2)
	}

	var deals []Deal
	b, err := os.ReadFile(*file)
	check(err)
	check(json.Unmarshal(b, &deals))

	if *derive {
		for i := range deals {
			if deals[i].ID == 0 {
				deals[i].ID = DeriveID(deals[i].SKU, deals[i].Name)
			}
		}
	}

	client := NewClient(*apiURL, *timeout)

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	st := client.UpsertDealsBulk(ctx, deals, *concurrency, *rps)
	fmt.Printf("DONE total=%d sent=%d suppressed=%d failed=%d\n", st.Total, st.Sent, st.Suppressed, st.Failed)
}

func getenv(k, def string) string {
	if v := os.Getenv(k); v != "" {
		return v
	}
	return def
}
func check(err error) {
	if err != nil {
		fmt.Fprintln(os.Stderr, "error:", err)
		os.Exit(1)
	}
}
