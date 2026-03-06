// app/api/scrape/route.ts — Serverless scraper API
// Polls ECN every 30s, returns cached JSON

import { NextResponse } from "next/server";
import { fetchElectionResults } from "@/lib/ecn-parser";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const data = await fetchElectionResults();

    return NextResponse.json(data, {
      status: 200,
      headers: {
        "Cache-Control": "no-store, must-revalidate",
        "Content-Type": "application/json",
        "X-Data-Source": "ECN Live - result.election.gov.np (mock fallback on error)",
        "X-Last-Updated": data.timestamp,
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const stack   = err instanceof Error ? err.stack   : undefined;
    console.error("[/api/scrape] UNHANDLED ERROR:", message, stack);
    return NextResponse.json(
      { error: "Failed to fetch election results", detail: message, timestamp: new Date().toISOString() },
      { status: 500 }
    );
  }
}

// Preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
    },
  });
}
