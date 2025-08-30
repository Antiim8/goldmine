export type FiltersState = {
  // search
  include: string;
  exclude: string;
  contract: string;

  // generic price/liquidity/sales
  minPrice: string;
  maxPrice: string;
  minLiquidity: string;
  maxLiquidity: string;
  minSales: string;
  minProfit: string;   // keep for now (optional)

  // extra you asked for / typically needed
  marginMin: string;
  marginMax: string;

  buffMin: string;
  buffMax: string;

  csgoTmMin: string;
  csgoTmMax: string;

  youpinMin: string;
  youpinMax: string;

  vol7dMin: string;
  vol7dMax: string;

  maxPriceAge: string;
  marketFee: string;
  maxInflation: string;

  // toggles
  onlyProfitable: boolean;   // margin > 0 (or >= marginMin)
  onlyArbitrage: boolean;    // buff > csgoTm
};

export const initialFilters: FiltersState = {
  include: "",
  exclude: "",
  contract: "All Contracts",

  minPrice: "",
  maxPrice: "",
  minLiquidity: "",
  maxLiquidity: "",
  minSales: "",
  minProfit: "",

  marginMin: "",
  marginMax: "",

  buffMin: "",
  buffMax: "",

  csgoTmMin: "",
  csgoTmMax: "",

  youpinMin: "",
  youpinMax: "",

  vol7dMin: "",
  vol7dMax: "",

  maxPriceAge: "",
  marketFee: "",
  maxInflation: "",

  onlyProfitable: false,
  onlyArbitrage: false,
};
