import * as React from 'react';
import { useForm } from '@tanstack/react-form';
import { z } from 'zod';

export type DealsFilterValues = {
  q: string;
  minPrice: string;
  maxPrice: string;
};

const schema = z.object({
  q: z.string().optional(),
  minPrice: z.string().regex(/^\d*(\.\d+)?$/, { message: 'Zahl' }).optional().or(z.literal('')),
  maxPrice: z.string().regex(/^\d*(\.\d+)?$/, { message: 'Zahl' }).optional().or(z.literal('')),
});

export function DealsFilter(props: { initial?: Partial<DealsFilterValues>; onChange: (v: DealsFilterValues) => void }) {
  const form = useForm<DealsFilterValues>({
    defaultValues: { q: '', minPrice: '', maxPrice: '', ...(props.initial ?? {}) },
    onSubmit: ({ value }) => props.onChange(value),
  });

  React.useEffect(() => {
    const v = form.getValues();
    const ok = schema.safeParse(v).success;
    if (ok) props.onChange(v);
  }, [form.store.values]);

  return (
    <form onSubmit={(e)=>{ e.preventDefault(); form.handleSubmit(); }} style={{display:'flex', gap:12, alignItems:'center', flexWrap:'wrap', margin:'12px 0'}}>
      <form.Field name="q">
        {(field) => (
          <label>Suche:&nbsp;
            <input value={field.state.value} onChange={(e)=>field.handleChange(e.target.value)} placeholder="Titel enthält…" />
          </label>
        )}
      </form.Field>
      <form.Field name="minPrice">
        {(field) => (
          <label>Min €:&nbsp;
            <input inputMode="decimal" value={field.state.value} onChange={(e)=>field.handleChange(e.target.value)} placeholder="0" style={{width:90}} />
          </label>
        )}
      </form.Field>
      <form.Field name="maxPrice">
        {(field) => (
          <label>Max €:&nbsp;
            <input inputMode="decimal" value={field.state.value} onChange={(e)=>field.handleChange(e.target.value)} placeholder="999" style={{width:90}} />
          </label>
        )}
      </form.Field>
      <button type="submit">Anwenden</button>
    </form>
  );
}
