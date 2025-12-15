import { NextResponse } from 'next/server';
import { createClient } from "@supabase/supabase-js";

export async function GET(req: Request): Promise<Response> {
    try {
        const { searchParams } = new URL(req.url);
        const address = searchParams.get('address')?.toLowerCase();
        if (!address) {
            throw "Invalid address";
        }

        if (!address) {
            return NextResponse.json(
                { error: 'Missing parameters!' },
                { status: 400 }
            );
        }

        const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
        const result = await supabase
            .from('lucky_draw_addresses')
            .select("address")
            .filter("address", "eq", address);

        return NextResponse.json(result);
    } catch (error) {
        console.error('POST error:', error);
        return NextResponse.json(
            { error: (error as Error).message },
            { status: 500 }
        );
    }
}
