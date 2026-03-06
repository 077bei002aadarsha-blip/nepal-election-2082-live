// lib/ecn-parser.ts — Real ECN scraper + helpers
// Data source: https://result.election.gov.np/ElectionResultCentral2082.aspx
// Strategy: 1) GET main page for CSRF cookie  2) Fetch JSON with CSRF header

import { generateMockData } from "./mock-data";
import type {
  ElectionResults, ProvinceResult, District, Constituency,
  Candidate, PartyCode,
} from "./types";

// ─── Cache ─────────────────────────────────────────────────────────────────
let cache: { data: ElectionResults; timestamp: number } | null = null;
const CACHE_TTL = 30 * 1000; // 30s cache

const ECN_BASE   = "https://result.election.gov.np";
const ECN_PAGE   = `${ECN_BASE}/ElectionResultCentral2082.aspx`;
const ECN_DATA   = `${ECN_BASE}/Handlers/SecureJson.ashx?file=JSONFiles/ElectionResultCentral2082.txt`;

// ─── ECN raw row shape ─────────────────────────────────────────────────────
interface EcnRow {
  CandidateID:        number;
  CandidateName:      string;
  Gender:             string;
  Age:                number;
  PoliticalPartyName: string;
  PartyID:            number;
  SymbolName:         string;
  StateName:          string;
  State:              number;   // 1-7 province number
  DistrictName:       string;
  DistrictCd:         number;
  SCConstID:          string;   // "1","2", … constituency number within district
  TotalVoteReceived:  number;
  Rank:               string;   // "1" = leading/winner
  Remarks:            string | null; // "Elected" = declared winner
}

// ─── Province metadata ─────────────────────────────────────────────────────
const PROVINCE_META: Record<number, { id: string; nameNe: string; nameEn: string; totalSeats: number }> = {
  1: { id: "koshi",        nameNe: "कोशी प्रदेश",       nameEn: "Koshi Province",         totalSeats: 28 },
  2: { id: "madhesh",      nameNe: "मधेश प्रदेश",       nameEn: "Madhesh Province",       totalSeats: 32 },
  3: { id: "bagmati",      nameNe: "बागमती प्रदेश",      nameEn: "Bagmati Province",       totalSeats: 26 },
  4: { id: "gandaki",      nameNe: "गण्डकी प्रदेश",      nameEn: "Gandaki Province",       totalSeats: 18 },
  5: { id: "lumbini",      nameNe: "लुम्बिनी प्रदेश",    nameEn: "Lumbini Province",       totalSeats: 26 },
  6: { id: "karnali",      nameNe: "कर्णाली प्रदेश",      nameEn: "Karnali Province",       totalSeats: 16 },
  7: { id: "sudurpaschim", nameNe: "सुदूरपश्चिम प्रदेश",  nameEn: "Sudurpashchim Province", totalSeats: 24 },
};

// ─── Party name → PartyCode ────────────────────────────────────────────────
function mapParty(name: string): PartyCode {
  if (!name) return "other";
  const n = name.trim();
  // Order matters — more specific checks first
  if (n.includes("नेपाली काँग्रेस") || n.includes("Nepali Congress")) return "nc";
  if (n.includes("एमाले") || n.includes("UML"))                        return "uml";
  if (n.includes("माओवादी") || n.includes("Maoist"))                   return "maoist";
  if (n.includes("राष्ट्रिय स्वतन्त्र") || n.includes("Rastriya Swatantra")) return "rastriya";
  if (n.includes("राष्ट्रिय प्रजातान्त्रिक") || n.includes("RPP"))    return "rpp";
  if (n.includes("जनजाति"))                                             return "janajati";
  if (n.includes("लोकतान्त्रिक समाजवादी") || n.includes("LSP"))       return "lsp";
  if (n.includes("जनता पार्टी नेपाल") || n.includes("राजपा"))         return "rjp";
  if (n === "स्वतन्त्र" || n === "Independent")                        return "independent";
  return "other";
}

// ─── Transliterate Nepali district/const names to rough English ───────────
// Simple lookup for known districts (ECN Nepali → English)
const DISTRICT_EN: Record<string, string> = {
  "ताप्लेजुङ":"Taplejung","पाँचथर":"Panchthar","इलाम":"Ilam","झापा":"Jhapa",
  "मोरङ":"Morang","सुनसरी":"Sunsari","धनकुटा":"Dhankuta","तेह्रथुम":"Terhathum",
  "सङ्खुवासभा":"Sankhuwasabha","भोजपुर":"Bhojpur","सोलुखुम्बु":"Solukhumbu",
  "ओखलढुङ्गा":"Okhaldhunga","खोटाङ":"Khotang","उदयपुर":"Udayapur",
  "सप्तरी":"Saptari","सिरहा":"Siraha","धनुषा":"Dhanusa","महोत्तरी":"Mahottari",
  "सर्लाही":"Sarlahi","रौतहट":"Rautahat","बारा":"Bara","पर्सा":"Parsa",
  "काठमाडौं":"Kathmandu","भक्तपुर":"Bhaktapur","ललितपुर":"Lalitpur",
  "काभ्रेपलाञ्चोक":"Kavrepalanchok","सिन्धुली":"Sindhuli","रामेछाप":"Ramechhap",
  "दोलखा":"Dolakha","सिन्धुपाल्चोक":"Sindhupalchok","नुवाकोट":"Nuwakot",
  "रसुवा":"Rasuwa","धादिङ":"Dhading","चितवन":"Chitwan","मकवानपुर":"Makwanpur",
  "कास्की":"Kaski","तनहुँ":"Tanahun","गोर्खा":"Gorkha","लमजुङ":"Lamjung",
  "स्याङ्जा":"Syangja","पर्वत":"Parbat","बागलुङ":"Baglung","म्याग्दी":"Myagdi",
  "मुस्ताङ":"Mustang","मनाङ":"Manang","नवलपुर":"Nawalpur",
  "रुपन्देही":"Rupandehi","कपिलवस्तु":"Kapilvastu","नवलपरासी":"Nawalparasi",
  "पाल्पा":"Palpa","गुल्मी":"Gulmi","अर्घाखाँची":"Arghakhanchi",
  "प्युठान":"Pyuthan","रोल्पा":"Rolpa","रुकुम पूर्व":"Rukum East",
  "दाङ":"Dang","बाँके":"Banke","बर्दिया":"Bardiya",
  "सुर्खेत":"Surkhet","दैलेख":"Dailekh","जाजरकोट":"Jajarkot","डोल्पा":"Dolpa",
  "हुम्ला":"Humla","मुगु":"Mugu","कालिकोट":"Kalikot","जुम्ला":"Jumla",
  "रुकुम पश्चिम":"Rukum West","सल्यान":"Salyan",
  "कैलाली":"Kailali","कञ्चनपुर":"Kanchanpur","डडेलधुरा":"Dadeldhura",
  "डोटी":"Doti","बैतडी":"Baitadi","दार्चुला":"Darchula","बझाङ":"Bajhang",
  "बाजुरा":"Bajura","अछाम":"Achham",
};

function districtEn(nameNe: string): string {
  return DISTRICT_EN[nameNe.trim()] ?? nameNe.trim();
}

// ─── STEP 1: Get CSRF token from main page ────────────────────────────────
async function getCsrfToken(): Promise<{ csrfToken: string; sessionCookie: string }> {
  const res = await fetch(ECN_PAGE, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      "Accept": "text/html,application/xhtml+xml",
    },
    redirect: "follow",
  });

  const setCookieHeader = res.headers.get("set-cookie") ?? "";
  const csrfMatch = setCookieHeader.match(/CsrfToken=([a-f0-9]+)/i);
  const sessMatch  = setCookieHeader.match(/ASP\.NET_SessionId=([^;]+)/i);

  if (!csrfMatch) throw new Error("CsrfToken cookie not found in ECN response");

  return {
    csrfToken:     csrfMatch[1],
    sessionCookie: `ASP.NET_SessionId=${sessMatch?.[1] ?? ""}; CsrfToken=${csrfMatch[1]}`,
  };
}

// ─── STEP 2: Fetch raw data rows ──────────────────────────────────────────
async function fetchEcnRows(): Promise<EcnRow[]> {
  const { csrfToken, sessionCookie } = await getCsrfToken();

  const res = await fetch(ECN_DATA, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      "X-CSRF-Token": csrfToken,
      "Cookie":       sessionCookie,
      "Referer":      ECN_PAGE,
      "Origin":       ECN_BASE,
      "Accept":       "application/json, text/plain, */*",
    },
  });

  if (!res.ok) throw new Error(`ECN data fetch failed: ${res.status}`);

  const json = await res.json() as EcnRow[];
  if (!Array.isArray(json)) throw new Error("ECN returned non-array JSON");
  return json;
}

// ─── STEP 3: Parse rows → ElectionResults ─────────────────────────────────
function parseRows(rows: EcnRow[]): ElectionResults {
  // Group: stateNo → districtCd → constId → candidates[]
  const tree = new Map<number, Map<number, Map<string, { rows: EcnRow[]; distNameNe: string }>>>();

  for (const row of rows) {
    if (!row.State || !row.DistrictCd || !row.SCConstID) continue;

    if (!tree.has(row.State)) tree.set(row.State, new Map());
    const stateMap = tree.get(row.State)!;

    if (!stateMap.has(row.DistrictCd)) stateMap.set(row.DistrictCd, new Map());
    const distMap = stateMap.get(row.DistrictCd)!;

    const cKey = row.SCConstID.toString();
    if (!distMap.has(cKey)) distMap.set(cKey, { rows: [], distNameNe: row.DistrictName });
    distMap.get(cKey)!.rows.push(row);
  }

  const provinces: ProvinceResult[] = [];
  let totalVotesCounted = 0;
  let totalSeatsReported = 0;

  for (const [stateNo, stateMap] of tree) {
    const pm = PROVINCE_META[stateNo];
    if (!pm) continue;

    const districts: District[] = [];
    const provPartySeats: Partial<Record<PartyCode, number>> = {};
    let provVotes = 0;
    let provSeatsReported = 0;

    for (const [distCd, distMap] of stateMap) {
      const firstDist = distMap.values().next().value;
      const distNameNe = firstDist?.distNameNe ?? "";
      const distNameEn = districtEn(distNameNe);
      const distId = `${pm.id}-d${distCd}`;

      const constituencies: Constituency[] = [];

      for (const [constId, { rows: cRows }] of distMap) {
        // Sort by Rank ascending ("1" first)
        cRows.sort((a, b) => parseInt(a.Rank) - parseInt(b.Rank));

        const totalVotes = cRows.reduce((s, r) => s + (r.TotalVoteReceived ?? 0), 0);

        const candidates: Candidate[] = cRows.map((r, i) => {
          const isFirst  = i === 0;
          const declared = r.Remarks === "Elected";
          return {
            id:         `ecn-${r.CandidateID}`,
            name:       r.CandidateName ?? "",
            nameEn:     r.CandidateName ?? "",   // ECN only provides Nepali; same value used for both
            party:      mapParty(r.PoliticalPartyName ?? ""),
            votes:      r.TotalVoteReceived ?? 0,
            percentage: totalVotes > 0 ? Math.round(((r.TotalVoteReceived ?? 0) / totalVotes) * 1000) / 10 : 0,
            isLeading:  isFirst,
            isWinner:   declared,
            status:     declared ? "won"
                        : (isFirst && (r.TotalVoteReceived ?? 0) > 0) ? "leading"
                        : (r.TotalVoteReceived ?? 0) > 0 ? "trailing"
                        : "counting",
            leadBy:     isFirst ? (cRows[0].TotalVoteReceived ?? 0) - (cRows[1]?.TotalVoteReceived ?? 0) : 0,
          };
        });

        const isDeclared = cRows.some(r => r.Remarks === "Elected");
        const hasCounting = cRows.some(r => (r.TotalVoteReceived ?? 0) > 0);
        const constStatus: Constituency["status"] = isDeclared ? "declared"
          : hasCounting ? "counting" : "not_started";

        const leadingParty = candidates[0]?.party ?? "other";

        if (isDeclared) {
          provPartySeats[leadingParty] = (provPartySeats[leadingParty] ?? 0) + 1;
          provSeatsReported++;
          totalSeatsReported++;
        }

        provVotes += totalVotes;
        totalVotesCounted += totalVotes;

        constituencies.push({
          id:                    `${pm.id}-d${distCd}-c${constId}`,
          no:                    parseInt(constId, 10),
          nameNe:                `${distNameNe} ${constId}`,
          nameEn:                `${distNameEn} ${constId}`,
          totalVotesCounted:     totalVotes,
          totalRegisteredVoters: 0, // ECN doesn't provide in this file
          turnoutPercentage:     0,
          status:                constStatus,
          candidates,
          leadingParty,
          leadingMargin:         candidates[0]?.leadBy ?? 0,
          lastUpdated:           new Date().toISOString(),
        });
      }

      districts.push({
        id:            distId,
        nameNe:        distNameNe,
        nameEn:        distNameEn,
        constituencies,
      });
    }

    provinces.push({
      id:            pm.id,
      nameNe:        pm.nameNe,
      nameEn:        pm.nameEn,
      totalSeats:    pm.totalSeats,
      seatsReported: provSeatsReported,
      totalVotes:    provVotes,
      leadingParty:  (Object.entries(provPartySeats).sort(([,a],[,b]) => b-a)[0]?.[0] ?? "other") as PartyCode,
      partySeats:    provPartySeats,
      districts,
    });
  }

  const totalSeats = 165;
  const nationalTotals: ElectionResults["nationalTotals"] = {};

  for (const p of provinces) {
    for (const d of p.districts) {
      for (const con of d.constituencies) {
        for (const cand of con.candidates) {
          if (!nationalTotals[cand.party]) nationalTotals[cand.party] = { seats: 0, votes: 0, percentage: 0 };
          nationalTotals[cand.party]!.votes += cand.votes;
          if (cand.isWinner) nationalTotals[cand.party]!.seats += 1;
        }
      }
    }
  }

  for (const p of Object.values(nationalTotals)) {
    if (p && totalVotesCounted > 0) {
      p.percentage = Math.round((p.votes / totalVotesCounted) * 1000) / 10;
    }
  }

  const counted = Math.max(totalSeatsReported, provinces.flatMap(p => p.districts.flatMap(d => d.constituencies)).filter(c => c.status !== "not_started").length);

  return {
    timestamp:             new Date().toISOString(),
    lastUpdated:           new Date().toLocaleString("en-US", {
      timeZone: "Asia/Kathmandu", hour12: true,
      hour: "2-digit", minute: "2-digit", second: "2-digit",
    }),
    progress: {
      counted,
      total:       totalSeats,
      percentage:  Math.round((counted / totalSeats) * 1000) / 10,
      seatsReported: totalSeatsReported,
      totalSeats,
      totalVoters: 0,
    },
    totalSeats,
    seatsReported:         totalSeatsReported,
    seatsLeading:          totalSeats - totalSeatsReported,
    totalVotesCounted,
    totalRegisteredVoters: 0,
    overallTurnout:        0,
    isLive:                true,
    countingStatus:        `${counted}/${totalSeats} क्षेत्रमा मतगणना`,
    provinces,
    nationalTotals,
  };
}

// ─── Public API ───────────────────────────────────────────────────────────
export async function fetchElectionResults(): Promise<ElectionResults> {
  if (cache && Date.now() - cache.timestamp < CACHE_TTL) return cache.data;

  try {
    const rows = await fetchEcnRows();
    const data = parseRows(rows);
    cache = { data, timestamp: Date.now() };
    return data;
  } catch (err) {
    console.error("[ECN scraper] falling back to mock data:", err);
    // Fall back to mock data if ECN is unreachable
    if (cache) return cache.data;
    const data = generateMockData();
    cache = { data, timestamp: Date.now() - (CACHE_TTL - 10_000) }; // recheck soon
    return data;
  }
}

// ─── UI helpers (used by components) ─────────────────────────────────────
export function getStatusBadge(status: string) {
  const map: Record<string, { label: string; labelNe: string; color: string }> = {
    counting:    { label: "Counting",  labelNe: "मतगणना",    color: "bg-yellow-500 text-black" },
    leading:     { label: "Leading",   labelNe: "अग्रणी",    color: "bg-blue-500 text-white"   },
    declared:    { label: "Declared",  labelNe: "घोषित",     color: "bg-green-600 text-white"  },
    not_started: { label: "Awaiting",  labelNe: "प्रतीक्षारत", color: "bg-slate-500 text-white" },
    won:         { label: "Elected",   labelNe: "निर्वाचित", color: "bg-green-600 text-white"  },
    trailing:    { label: "Trailing",  labelNe: "पछि",       color: "bg-gray-400 text-white"   },
    lost:        { label: "Lost",      labelNe: "पराजित",    color: "bg-red-500 text-white"    },
  };
  return map[status] ?? map.not_started;
}

export function getPartyColorClass(party: string): string {
  const m: Record<string, string> = {
    nc: "bg-blue-600", uml: "bg-red-600", maoist: "bg-orange-600",
    rpp: "bg-green-600", rastriya: "bg-violet-600", janajati: "bg-cyan-600",
    rjp: "bg-amber-600", lsp: "bg-pink-600",
    independent: "bg-gray-500", other: "bg-gray-400",
  };
  return m[party] ?? "bg-gray-400";
}


