// lib/types.ts — All TypeScript interfaces for Nepal Election 2082

export type PartyCode =
  | "nc"
  | "uml"
  | "maoist"
  | "rpp"
  | "rastriya"
  | "janajati"
  | "rjp"
  | "lsp"
  | "independent"
  | "other";

export interface PartyInfo {
  code: PartyCode;
  nameEn: string;
  nameNe: string;
  shortNe: string;
  shortEn: string;
  color: string;
  bgColor: string;
  textColor: string;
}

export type CandidateStatus = "leading" | "trailing" | "won" | "lost" | "counting";

export interface Candidate {
  id: string;
  name: string;
  nameEn: string;
  party: PartyCode;
  votes: number;
  percentage: number;
  status: CandidateStatus;
  isLeading: boolean;
  isWinner?: boolean;
  leadBy?: number;
}

export type ConstituencyStatus = "counting" | "leading" | "declared" | "not_started";

export interface Constituency {
  id: string;
  no: number;
  nameNe: string;
  nameEn: string;
  totalVotesCounted: number;
  totalRegisteredVoters: number;
  turnoutPercentage: number;
  status: ConstituencyStatus;
  candidates: Candidate[];
  leadingParty: PartyCode;
  leadingMargin: number;
  lastUpdated: string;
}

export interface District {
  id: string;
  nameNe: string;
  nameEn: string;
  constituencies: Constituency[];
}

export interface ProvinceResult {
  id: string;
  nameEn: string;
  nameNe: string;
  totalSeats: number;
  seatsReported: number;
  totalVotes: number;
  leadingParty: PartyCode;
  partySeats: Partial<Record<PartyCode, number>>;
  districts: District[];
}

export interface ElectionProgress {
  counted: number;
  total: number;
  percentage: number;
  seatsReported: number;
  totalSeats: number;
  totalVoters: number;
}

export interface ElectionResults {
  timestamp: string;
  lastUpdated: string;
  progress: ElectionProgress;
  totalSeats: number;
  seatsReported: number;
  seatsLeading: number;
  totalVotesCounted: number;
  totalRegisteredVoters: number;
  overallTurnout: number;
  isLive: boolean;
  countingStatus: string;
  provinces: ProvinceResult[];
  nationalTotals: Partial<Record<PartyCode, { seats: number; votes: number; percentage: number }>>;
}

export interface AppTranslations {
  title: string;
  subtitle: string;
  live: string;
  totalVotes: string;
  seatsReported: string;
  seatsLeading: string;
  province: string;
  district: string;
  constituency: string;
  party: string;
  votes: string;
  margin: string;
  turnout: string;
  status: string;
  searchPlaceholder: string;
  lastUpdated: string;
  counting: string;
  declared: string;
  leading: string;
  notStarted: string;
  getAlerts: string;
  emailPlaceholder: string;
  subscribe: string;
  disclaimer: string;
  disclaimerText: string;
}

export type Language = "en" | "ne";
