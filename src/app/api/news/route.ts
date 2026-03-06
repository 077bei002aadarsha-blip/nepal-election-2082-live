// app/api/news/route.ts — Live election news ticker items

import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const revalidate = 60; // Cache for 60s

export interface NewsItem {
  id: string;
  titleNe: string;
  titleEn: string;
  hot: boolean;
  category: "declared" | "close" | "trend" | "update";
  timestamp: string;
}

const NEWS_ITEMS: NewsItem[] = [
  {
    id: "n1",
    titleNe: "🔥 बालेन शाह KTM-6 +14,839 मतले विजयी घोषित",
    titleEn: "🔥 Balen Shah KTM-6 DECLARED winner by +14,839 votes",
    hot: true,
    category: "declared",
    timestamp: new Date().toISOString(),
  },
  {
    id: "n2",
    titleNe: "⚔️ काठमाडौं ५: एमाले केवल +186 मतले अग्रणी — तीव्र प्रतिस्पर्धा!",
    titleEn: "⚔️ Kathmandu-5: UML leads by only +186 votes — knife-edge race!",
    hot: true,
    category: "close",
    timestamp: new Date().toISOString(),
  },
  {
    id: "n3",
    titleNe: "📈 रास्वपा बागमती प्रदेशमा १०/२६ क्षेत्र जित्दै",
    titleEn: "📈 RSP sweeping Bagmati — 10/26 seats leading",
    hot: true,
    category: "trend",
    timestamp: new Date().toISOString(),
  },
  {
    id: "n4",
    titleNe: "📊 धादिङ १: आशिका तामाङ +२,२८१ अग्रणी — उलटफेर सम्भव",
    titleEn: "📊 Dhading-1: Aashika Tamang leads +2,281 — surprise result",
    hot: false,
    category: "trend",
    timestamp: new Date().toISOString(),
  },
  {
    id: "n5",
    titleNe: "🗳️ झापा ५: जम्मा मतगणनाको ६२% पूरा — काँग्रेस अग्रणी",
    titleEn: "🗳️ Jhapa-5: 62% counted — NC leading with early advantage",
    hot: false,
    category: "update",
    timestamp: new Date().toISOString(),
  },
  {
    id: "n6",
    titleNe: "🔥 रवि लामिछाने चितवन २ मा +4,200 मतले विजयी",
    titleEn: "🔥 Rabi Lamichhane wins Chitwan-2 by +4,200 votes — RSP holds",
    hot: true,
    category: "declared",
    timestamp: new Date().toISOString(),
  },
  {
    id: "n7",
    titleNe: "📉 मधेश प्रदेश: राजपा र एमाले कडा प्रतिस्पर्धामा",
    titleEn: "📉 Madhesh Province: RJP vs UML in tight battle for 8 seats",
    hot: false,
    category: "trend",
    timestamp: new Date().toISOString(),
  },
  {
    id: "n8",
    titleNe: "⚡ राष्ट्रिय: ६५.३% मतगणना पूरा — रास्वपा राष्ट्रिय अग्रणी बनाम",
    titleEn: "⚡ National: 65.3% counted — RSP national popular vote leader",
    hot: true,
    category: "update",
    timestamp: new Date().toISOString(),
  },
];

export async function GET() {
  return NextResponse.json(NEWS_ITEMS, {
    status: 200,
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30",
      "Content-Type": "application/json",
    },
  });
}
