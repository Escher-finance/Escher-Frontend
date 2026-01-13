import { NextResponse } from 'next/server';
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request): Promise<Response> {
    try {
        const body = await req.json();

        const { address, cc, cn } = body;

        if (!address) {
            return NextResponse.json(
                { error: 'Missing parameters!' },
                { status: 400 }
            );
        }
        const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
        const { error } = await supabase
            .from('lucky_draw_addresses')
            .insert({
                address: address,
                country_code: cc,
                country_name: cn
            });

        return NextResponse.json({ message: 'ok' });
    } catch (error) {
        console.error('POST error:', error);
        return NextResponse.json(
            { error: (error as Error).message },
            { status: 500 }
        );
    }
}
