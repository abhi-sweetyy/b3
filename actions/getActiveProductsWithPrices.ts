import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { ProductWithPrice } from "../types";

const getActiveProductsWithPrices = async (): Promise<ProductWithPrice[]> => {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            get(name: string) {
              return cookieStore.get(name)?.value
            },
          },
        }
      );

    const { data, error } = await supabase
        .from('products')
        .select('*, prices(*)')
        .eq('active', true)
        .eq('prices.active', true)
        .order('metadata->index')
        .order('unit_amount', { foreignTable: 'prices' });

    if (error) {
        console.log(error.message);
    }

    return (data as any) || [];
}

export default getActiveProductsWithPrices;