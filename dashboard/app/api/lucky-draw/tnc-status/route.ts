import { NextResponse } from 'next/server';
import { createClient } from "@supabase/supabase-js";

export async function GET(req: Request): Promise<Response> {
    try {
        const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
        const result = await supabase
            .from('lucky_draw_addresses')
            .select("*").limit(1000);

        return NextResponse.json(result);
    } catch (error) {
        console.error('POST error:', error);
        return NextResponse.json(
            { error: (error as Error).message },
            { status: 500 }
        );
    }
}
