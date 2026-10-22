// ETW — De-Basement Module Type Definitions
// Legal Money Regularization & Financial Transparency Knowledge Hub

export const DEBASEMENT_VERSION = "2026.1";

export interface OfficialSource {
  name: string;
  authority: string;
  url: string;
  citationDate: string;
  statutoryReference?: string;
}

export interface ComparisonTableRow {
  parameter: string;
  undeclaredIncome: string;
  taxEvasion: string;
  legitimateTaxPlanning: string;
  moneyLaundering: string;
}

export interface GenericTableRow {
  dimension: string;
  specification: string;
  statutoryRule: string;
  complianceRequirement: string;
}

export interface StepProcedureItem {
  stepNumber: number;
  title: string;
  timeframe: string;
  applicableLaw: string;
  actionRequired: string;
  requiredDocuments: string[];
  officialResource: string;
  potentialCostsOrPenalties?: string;
  commonMistakesOrRisks: string;
}

export interface ChecklistItem {
  id: string;
  documentName: string;
  issuingAuthority: string;
  purpose: string;
  statutoryRequirement: string;
  isMandatory: boolean;
  notes?: string;
}

export interface DocumentChecklist {
  id: string;
  title: string;
  targetProcedure: string;
  statutoryReference: string;
  items: ChecklistItem[];
  verificationGuidance: string;
}

export interface LegalCaseStudy {
  id: string;
  slug: string;
  title: string;
  courtOrAgency: string;
  citation: string;
  year: number;
  statutesInvoked: string[];
  factsEstablished: string[];
  legalIssue: string;
  findingsAndJudgment: string;
  financialPenaltiesOrRecovery: string;
  complianceLessons: string[];
  status: "FINAL_JUDGMENT" | "ATTACHED_PENDING_TRIAL" | "SPECIAL_COURT_DECREE" | "SETTLED_CONFIRMED";
  sources: OfficialSource[];
}

export interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
  statutoryCitation: string;
  keyRuleSummary: string;
  officialReferenceUrl?: string;
}

export interface KnowledgeArticle {
  id: string;
  slug: string;
  sectionNumber: number;
  sectionTitle: string;
  title: string;
  subtitle: string;
  readingTimeMinutes: number;
  lastVerifiedDate: string;
  verificationBadge: "STATUTORY_VERIFIED" | "OFFICIAL_CBDT_CIRCULAR" | "RBI_MASTER_DIRECTION";
  summary: string;
  keyTakeaways: string[];
  officialSources: OfficialSource[];
  contentHtml?: string;
  comparisonTables?: {
    title: string;
    description: string;
    headers: string[];
    rows: Record<string, string | number | boolean>[];
  }[];
  stepProcedures?: StepProcedureItem[];
  checklists?: DocumentChecklist[];
  caseStudies?: LegalCaseStudy[];
  faqs?: FAQItem[];
  relatedSlugs: string[];
}

export interface OfficialDirectoryEntry {
  title: string;
  category: "INCOME_TAX" | "BANKING_RBI" | "FINANCIAL_INTELLIGENCE" | "CORPORATE_AFFAIRS" | "JUDICIAL" | "UAE_REGULATORY";
  authority: string;
  description: string;
  officialUrl: string;
  applicableAct: string;
  primaryService: string;
}
