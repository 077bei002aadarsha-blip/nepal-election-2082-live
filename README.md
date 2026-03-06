# 🇳🇵 Nepal Election 2082 — LIVE Results Dashboard

A real-time, bilingual (Nepali/English) election results dashboard for **Nepal's 2082 Parliamentary Elections**, powered by live data from the [Election Commission Nepal (ECN)](https://result.election.gov.np).

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-38bdf8?logo=tailwindcss)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔴 **Live Data** | Auto-fetches results from ECN every 30 seconds |
| 🗳️ **165 FPTP Constituencies** | All constituencies across 7 provinces and 77 districts |
| 📊 **CNN-Level Hero Dashboard** | Declared seats, leading seats, total votes, progress % |
| 🎯 **Candidate Battle Cards** | Top 3 candidates with vote bars, margins, and party labels |
| 🔍 **Instant Search** | Search by constituency name, district, or province |
| 🏆 **Closest Races Widget** | Live-sorted battles by smallest margin first |
| 📈 **Party Vote Share Chart** | Horizontal bars with seat badges for top parties |
| 🗺️ **Province Status Heatmap** | 7-province grid with leading party, seats, and progress |
| 📡 **Live Trends Carousel** | Rotating ticker with declared winners, knife-edge races, province leaders |
| ⏱️ **Progress Strip** | Seats declared counter with circular progress and WhatsApp share |
| 🌍 **Bilingual** | Full Nepali (नेपाली) and English language toggle |
| 🌙 **Dark / Light Mode** | Theme toggle — dark default, full light mode support |
| 📱 **Fully Responsive** | Mobile-first design, works on all screen sizes |
| 📲 **WhatsApp Share** | Share constituency results or national summary instantly |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- npm or yarn

### Installation

```bash
git clone https://github.com/077bei002aadarsha-blip/nepal-election-2082-live.git
cd nepal-election-2082-live
npm install
```

### Development

```bash
npm run dev
# or on a specific port:
npx next dev -p 3002
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

---

## 🏗️ Project Structure

```
src/
├── app/
│   ├── api/scrape/route.ts      # ECN data scraper API (30s cache)
│   ├── results/[id]/            # Individual constituency detail page
│   ├── layout.tsx               # Root layout with fonts + Footer
│   ├── page.tsx                 # Main dashboard page
│   ├── providers.tsx            # React Query + Theme + Language providers
│   └── globals.css              # Global styles, dark mode, animations
├── components/
│   ├── HeroDashboard.tsx        # Main above-fold hero: stats, bars, search
│   ├── NationalSummary.tsx      # Party table with seat/vote totals
│   ├── ProvinceCard.tsx         # Expandable province → district → constituency
│   ├── CandidateBattleCard.tsx  # Head-to-head candidate view (compact + full)
│   ├── PartyBarChart.tsx        # Horizontal national vote-share chart
│   ├── ProvinceHeatmap.tsx      # 7-province clickable status grid
│   ├── LiveTrendsCarousel.tsx   # Auto-rotating live news ticker
│   ├── ClosestRacesWidget.tsx   # Closest battles sorted by margin
│   ├── CountdownWidget.tsx      # Progress strip with circular ring
│   ├── ProvinceTabCarousel.tsx  # Sticky province tab navigation
│   ├── LiveIndicators.tsx       # StatusPill, VoteGap, LiveDot components
│   ├── LiveCounter.tsx          # Animated number counter
│   ├── WhatsAppShareButton.tsx  # WhatsApp share with formatted text
│   ├── ThemeToggle.tsx          # Dark/Light mode toggle
│   ├── LanguageToggle.tsx       # Nepali/English language toggle
│   ├── DisclaimerButton.tsx     # Floating info/disclaimer modal
│   └── Footer.tsx               # Bilingual footer with credits
└── lib/
    ├── mock-data.ts             # PARTY_INFO registry + 165 constituency data
    ├── scraper.ts               # ECN HTTP scraper (CSRF-aware)
    ├── types.ts                 # All TypeScript interfaces
    └── translations.ts          # i18n strings for EN/NE
```

---

## ⚙️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 15](https://nextjs.org) (App Router) |
| Language | TypeScript 5 (strict) |
| Styling | [TailwindCSS v3](https://tailwindcss.com) + CSS custom properties |
| Animations | [Framer Motion v11](https://www.framer.com/motion/) |
| Data Fetching | [TanStack Query v5](https://tanstack.com/query) |
| Fonts | [Noto Sans Devanagari](https://fonts.google.com/noto/specimen/Noto+Sans+Devanagari) + Inter (via `next/font`) |
| Theme | [next-themes](https://github.com/pacocoursey/next-themes) |
| Data Source | [Election Commission Nepal](https://result.election.gov.np) |

---

## 🔌 Data Source & API

The `/api/scrape` route fetches live data from ECN, transforms it into a structured `ElectionResults` object, and caches it for 30 seconds. All 165 constituencies are mapped to real districts and provinces.

```
GET /api/scrape
→ ElectionResults (165 constituencies, 7 provinces, national totals)
```

> **Note:** This project is independent and is not officially affiliated with the Election Commission Nepal. Data is displayed for informational purposes only.

---

## 🌐 Supported Languages

| Language | Toggle |
|---|---|
| English | Default |
| नेपाली (Nepali) | Available via language toggle in header |

All labels, party names, constituency names, and UI strings are fully bilingual.

---

## 🙌 Contributing

Contributions, issues and feature requests are welcome!

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'feat: add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 👤 Developer

**Aadarsha Thapa Magar**

- Email: [thapamagaraadarsha97@gmail.com](mailto:thapamagaraadarsha97@gmail.com)
- GitHub: [@077bei002aadarsha-blip](https://github.com/077bei002aadarsha-blip)

---

## ⚠️ Disclaimer

- Data is fetched live from ECN (Election Commission Nepal) and auto-updates every 30 seconds.
- This site is **not officially affiliated** with ECN — data is displayed independently.
- For official results, visit: [result.election.gov.np](https://result.election.gov.np)
- This site is for **informational purposes only** and is not responsible for any decisions made based on the displayed data.

---

*Built with ❤️ for the people of Nepal 🇳🇵*

# 2. Start dev server
npm run dev

# 3. Open http://localhost:3000
```

## ⚡ Deploy to Vercel (5 minutes)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Then set these environment variables in Vercel Dashboard:
- `NEXT_PUBLIC_SITE_URL` → your Vercel URL
- `GOOGLE_SITE_VERIFICATION` → from Google Search Console
- `NEXT_PUBLIC_ADSENSE_ID` → your Google AdSense ID

## 🔄 Live Updates – How They Work

1. `/api/scrape` polls ECN every 30 seconds (serverless)
2. React Query auto-refetches in the background
3. `LiveCounter` animates vote numbers ticking up
4. `ProvinceMap` colors shift as parties take leads
5. Zero user interaction needed – fully automatic

## 💰 Monetization Setup

### Adsaro Nepal
1. Sign up at [adsaro.com](https://adsaro.com)
2. Get your ad slot IDs
3. Replace `AdSlot` component content with real Adsaro tags

### Khalti + eSewa
- Update links in `DonateSection.tsx` with your merchant URLs

### Google AdSense
- Add `NEXT_PUBLIC_ADSENSE_ID=ca-pub-XXXX` to env vars

## 🔍 SEO Features

- Dynamic `<title>` + `<meta description>` per constituency
- Schema.org structured data (Dataset + NewsArticle)
- Open Graph + Twitter Cards
- Auto-generated sitemap with all 165 constituency pages
- Robots.txt optimized for Googlebot crawling
- Featured snippet table on homepage

## 🔧 Replace Mock Data with Real Scraper

Edit `src/lib/ecn-parser.ts`:

```typescript
// Uncomment and implement:
const response = await axios.get("https://election.gov.np/result");
const $ = cheerio.load(response.data);
// Parse the HTML and return ElectionResults
```

## 📱 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Data | React Query (30s auto-refresh) |
| Scraper | Cheerio + Axios |
| Deploy | Vercel (sin1 + bom1 regions) |

## 🏆 Performance Targets

- LCP < 1.2s
- INP < 2.5s
- Mobile Lighthouse 95+

## 📊 Province Coverage

All 7 provinces + 165 constituencies:
- Koshi (28 seats)
- Madhesh (32 seats)
- Bagmati (21 seats)
- Gandaki (18 seats)
- Lumbini (26 seats)
- Karnali (16 seats)
- Sudurpashchim (24 seats)
