import { NextResponse } from 'next/server';

export function GET() {
    const res = NextResponse.json({ success: true });
    res.cookies.set('auth', '', { path: '/', maxAge: 0 });
    res.cookies.set('user', '', { path: '/', maxAge: 0 });
    return res;
}
