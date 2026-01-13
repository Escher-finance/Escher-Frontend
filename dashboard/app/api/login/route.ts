import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/auth';

export async function POST(req: Request) {
    const { email, password } = await req.json();
    const user = authenticate(email, password);

    if (user) {
        const res = NextResponse.json({ success: true });
        res.cookies.set('auth', 'true', { path: '/' });
        res.cookies.set('user', JSON.stringify(user), { path: '/' });
        return res;
    }

    return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
}
