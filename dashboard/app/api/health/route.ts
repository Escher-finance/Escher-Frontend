import { NextResponse } from "next/server";
import { pgHealthcheck } from "@/lib/db";

export async function GET() {
  try {
    const ok = await pgHealthcheck();
    return NextResponse.json({ ok });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "unknown" }, { status: 500 });
  }
}


