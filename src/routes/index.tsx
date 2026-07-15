import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeftRight,
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Bell,
  Boxes,
  Check,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Clock,
  Container,
  Cpu,
  Database,
  FileText,
  Gauge,
  Globe,
  Landmark,
  LifeBuoy,
  Lock,
  Mail,
  MapPin,
  Moon,
  PackageCheck,
  Plug,
  ScrollText,
  ShieldCheck,
  Ship,
  Sparkles,
  Sun,
  Table2,
  Truck,
  User,
  Users,
  Wand2,
  Warehouse,
  Workflow,
  X,
  XCircle,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { ApiError, api } from "../api";
import { IntegrationLogo } from "../components/common/IntegrationLogo";
import { LogoLockup } from "../components/common/LogoLockup";
import { setStoredIndustry } from "../lib/industries";
import { ThemeProvider, useTheme } from "../lib/theme";
import { cn } from "../lib/utils";

export const Route = createFileRoute("/")({
  component: Index,
});

// ---------------- Content config ----------------

type WorkflowStep = { label: string; detail: string };
type WorkflowContent = {
  title: string;
  before: string;
  after: string;
  steps: WorkflowStep[];
};

const HERO = {
  tagline: "The AI operating system for logistics & supply chain.",
  sub: "Automate purchase orders, shipment tracking, supplier onboarding, invoice matching, and warehouse documents. AI extracts, validates, and drafts every action — your team reviews and approves before anything is written back to your ERP.",
};

// The single, logistics-specific workflow shown in the before/after section.
const CLOSE_WORKFLOW: WorkflowContent = {
  title: "Purchase order to approval, done in minutes.",
  before: "45+ minutes per PO, keying data across email, drive, and your ERP.",
  after: "5 minutes: AI extracts, validates, and matches — you review and approve.",
  steps: [
    { label: "PO arrives", detail: "A supplier emails a purchase order into your operations inbox." },
    { label: "Extract", detail: "Eagle Doc reads line items, totals, and supplier details." },
    { label: "Validate", detail: "Supplier lookup, duplicate check, and pricing validation." },
    { label: "Summarize", detail: "AI drafts a plain-language validation summary for review." },
    { label: "Approve", detail: "Procurement reviews the draft and approves in one click." },
    { label: "Write back", detail: "PO created in NetSuite/Odoo or stored in Google Sheets." },
  ],
};

// ---------------- Copilot library (interactive catalog) ----------------

type CopilotGroup = "procure" | "operations" | "warehouse";

type Copilot = {
  group: CopilotGroup;
  label: string;
  title: string;
  goal: string;
  persona: string;
  approver: string;
  trigger: string;
  actions: string[];
  value: string[];
  // The live trace shown in the modal — each line mirrors what the copilot does.
  trace: { kind: "run" | "ok" | "wait" | "done"; text: string }[];
  runtime: string;
};

const COPILOT_GROUPS: { slug: CopilotGroup | "all"; label: string }[] = [
  { slug: "all", label: "All" },
  { slug: "procure", label: "Procurement & Finance" },
  { slug: "operations", label: "Shipments & Delivery" },
  { slug: "warehouse", label: "Warehouse & Insights" },
];

const GROUP_META: Record<CopilotGroup, { label: string; accent: string }> = {
  // Restrained, logistics-appropriate accents so each family reads distinctly.
  procure: { label: "Procurement & Finance", accent: "#3b82f6" },
  operations: { label: "Shipments & Delivery", accent: "#f4c430" },
  warehouse: { label: "Warehouse & Insights", accent: "#38bdf8" },
};

const COPILOTS: Copilot[] = [
  {
    group: "procure",
    label: "Procurement & Finance",
    title: "Purchase Order Processing Copilot",
    goal: "Extract supplier POs, validate suppliers and pricing, catch duplicates, and route for procurement approval.",
    persona: "Procurement Officer",
    approver: "Procurement Manager",
    trigger: "A supplier emails a purchase order to your operations inbox.",
    actions: [
      "Extracts line items, totals, and supplier details with Eagle Doc",
      "Validates the supplier against your ERP records",
      "Detects duplicate purchase orders",
      "Validates line items and pricing against agreed terms",
      "Writes a plain-language AI validation summary",
    ],
    value: [
      "No manual PO data entry",
      "Duplicate and mispriced POs caught before creation",
      "Faster procurement approval cycles",
      "A clean, auditable trail on every order",
    ],
    runtime: "2m 38s",
    trace: [
      { kind: "run", text: "connecting to Gmail…" },
      { kind: "ok", text: "reading PO_ACME_0417.pdf" },
      { kind: "ok", text: "matched supplier: Acme Freight Co." },
      { kind: "ok", text: "no duplicate PO found" },
      { kind: "ok", text: "line items + pricing validated" },
      { kind: "ok", text: "AI summary ready" },
      { kind: "wait", text: "waiting on approval (Procurement Manager)" },
      { kind: "ok", text: "approved by A. Reyes" },
      { kind: "ok", text: "PO created in NetSuite · docs archived to Drive" },
      { kind: "done", text: "done in 2m 38s" },
    ],
  },
  {
    group: "operations",
    label: "Shipments & Delivery",
    title: "Shipment Tracking Copilot",
    goal: "Monitor shipment progress, predict updated ETAs, detect delays and exceptions, and notify customers before issues escalate.",
    persona: "Logistics Coordinator",
    approver: "Operations Manager",
    trigger: "A shipment is created in your ERP, or on a tracking sync.",
    actions: [
      "Retrieves live shipment data from NetSuite/Odoo",
      "Predicts an updated ETA with AI",
      "Detects delivery delays and operational exceptions",
      "Runs route risk analysis on active lanes",
      "Notifies customers and operations proactively",
    ],
    value: [
      "Customers hear about delays first, from you",
      "Fewer escalations and service failures",
      "ETAs that reflect reality",
      "Operations see risk before it lands",
    ],
    runtime: "1m 52s",
    trace: [
      { kind: "run", text: "connecting to ERP…" },
      { kind: "ok", text: "retrieved 128 active shipments" },
      { kind: "ok", text: "ETA re-predicted for 19 loads" },
      { kind: "ok", text: "3 delays + 1 exception detected" },
      { kind: "ok", text: "route risk analysis complete" },
      { kind: "wait", text: "waiting on approval (Operations Manager)" },
      { kind: "ok", text: "customers emailed · #ops-alerts pinged" },
      { kind: "done", text: "done in 1m 52s" },
    ],
  },
  {
    group: "procure",
    label: "Procurement & Finance",
    title: "Supplier Onboarding Copilot",
    goal: "Collect onboarding information, validate tax and banking documents, check for duplicate suppliers, and create supplier records.",
    persona: "Supplier Relationship Manager",
    approver: "Procurement Team",
    trigger: "A supplier submits the registration form (Google Forms).",
    actions: [
      "Reads submitted tax documents and banking details",
      "Verifies banking details and validates tax documents",
      "Detects duplicate suppliers against your ERP",
      "Runs an AI risk assessment on the new supplier",
      "Drafts the supplier master record for approval",
    ],
    value: [
      "Faster, compliant supplier onboarding",
      "No duplicate supplier records",
      "Risk flagged before the first order",
      "Complete documentation on file",
    ],
    runtime: "2m 20s",
    trace: [
      { kind: "run", text: "connecting to Google Forms…" },
      { kind: "ok", text: "registration + documents received" },
      { kind: "ok", text: "tax docs validated · banking verified" },
      { kind: "ok", text: "no duplicate supplier found" },
      { kind: "ok", text: "AI risk assessment: low" },
      { kind: "wait", text: "waiting on approval (Procurement Team)" },
      { kind: "ok", text: "supplier created · docs stored to Drive" },
      { kind: "done", text: "done in 2m 20s" },
    ],
  },
  {
    group: "operations",
    label: "Shipments & Delivery",
    title: "Delivery Exception Copilot",
    goal: "Identify delivery failures — delays, wrong addresses, failed deliveries — classify them, and initiate corrective action while keeping customers informed.",
    persona: "Operations Manager",
    approver: "Operations Manager",
    trigger: "A delivery update arrives from your ERP.",
    actions: [
      "Detects delays and failed deliveries automatically",
      "Flags incorrect or undeliverable addresses",
      "Classifies each exception by type and severity",
      "Drafts the corrective action and customer message",
      "Updates the ERP once operations approves",
    ],
    value: [
      "Delivery failures caught and resolved faster",
      "Customers kept informed automatically",
      "Consistent exception handling",
      "Fewer repeat delivery attempts",
    ],
    runtime: "1m 34s",
    trace: [
      { kind: "run", text: "connecting to ERP…" },
      { kind: "ok", text: "delivery updates ingested" },
      { kind: "ok", text: "2 delays · 1 wrong address detected" },
      { kind: "ok", text: "exceptions classified" },
      { kind: "ok", text: "corrective actions + messages drafted" },
      { kind: "wait", text: "waiting on approval (Operations Manager)" },
      { kind: "ok", text: "customers notified · ERP updated" },
      { kind: "done", text: "done in 1m 34s" },
    ],
  },
  {
    group: "procure",
    label: "Procurement & Finance",
    title: "Invoice Matching Copilot",
    goal: "Run automated three-way matching between supplier invoices, purchase orders, and goods receipts to catch discrepancies before finance approval.",
    persona: "Accounts Payable Specialist",
    approver: "Finance Manager",
    trigger: "A supplier invoice arrives in your inbox.",
    actions: [
      "Extracts the invoice with Eagle Doc",
      "Retrieves the matching PO and goods receipt",
      "Compares quantities and prices across all three",
      "Detects and explains any variance",
      "Writes an AI validation summary for finance",
    ],
    value: [
      "Overbilling caught before payment",
      "Three-way match with no manual keying",
      "Faster, cleaner finance approvals",
      "A defensible audit trail",
    ],
    runtime: "2m 05s",
    trace: [
      { kind: "run", text: "connecting to Gmail…" },
      { kind: "ok", text: "reading INV_ACME_8841.pdf" },
      { kind: "ok", text: "PO-2214 + goods receipt retrieved" },
      { kind: "ok", text: "quantities compared · 1 variance found" },
      { kind: "ok", text: "variance summary drafted" },
      { kind: "wait", text: "waiting on approval (Finance Manager)" },
      { kind: "ok", text: "approved · ERP updated" },
      { kind: "done", text: "done in 2m 05s" },
    ],
  },
  {
    group: "warehouse",
    label: "Warehouse & Insights",
    title: "Inventory Monitoring Copilot",
    goal: "Continuously monitor inventory levels, spot shortages and excess, flag slow-moving items, and recommend replenishment.",
    persona: "Inventory Planner",
    approver: "Supply Chain Manager",
    trigger: "On a scheduled trigger, or on demand.",
    actions: [
      "Retrieves current inventory from NetSuite/Odoo",
      "Detects low-stock and overstock positions",
      "Identifies slow-moving items",
      "Generates reorder recommendations",
      "Sends a Slack alert with a purchase recommendation",
    ],
    value: [
      "Stockouts avoided with earlier warning",
      "Working capital freed from excess stock",
      "Replenishment decisions made with data",
      "Procurement looped in automatically",
    ],
    runtime: "1m 40s",
    trace: [
      { kind: "run", text: "scheduled trigger fired…" },
      { kind: "ok", text: "inventory retrieved · 1,240 SKUs" },
      { kind: "ok", text: "17 low-stock · 6 overstock detected" },
      { kind: "ok", text: "9 slow-moving items flagged" },
      { kind: "ok", text: "reorder recommendations generated" },
      { kind: "wait", text: "waiting on approval (Supply Chain Manager)" },
      { kind: "ok", text: "#inventory-alerts pinged · PO recommended" },
      { kind: "done", text: "done in 1m 40s" },
    ],
  },
  {
    group: "warehouse",
    label: "Warehouse & Insights",
    title: "Warehouse Document Copilot",
    goal: "Extract structured data from packing lists, goods receipts, and delivery notes to eliminate manual warehouse data entry.",
    persona: "Warehouse Supervisor",
    approver: "Operations Team",
    trigger: "A document is uploaded to Google Drive.",
    actions: [
      "Extracts packing lists with Eagle Doc",
      "Extracts goods receipts and validates delivery notes",
      "Generates document metadata automatically",
      "Stores metadata to Google Sheets",
      "Notifies the warehouse team on Slack",
    ],
    value: [
      "Manual warehouse data entry eliminated",
      "Accurate, searchable document metadata",
      "Received goods reconciled faster",
      "Warehouse team notified in real time",
    ],
    runtime: "1m 12s",
    trace: [
      { kind: "run", text: "watching Google Drive…" },
      { kind: "ok", text: "reading packing_list_5521.pdf" },
      { kind: "ok", text: "goods receipt extracted" },
      { kind: "ok", text: "delivery note validated" },
      { kind: "ok", text: "metadata written to Google Sheets" },
      { kind: "ok", text: "#warehouse pinged" },
      { kind: "done", text: "done in 1m 12s" },
    ],
  },
  {
    group: "warehouse",
    label: "Warehouse & Insights",
    title: "Logistics Executive Reporting Copilot",
    goal: "Generate AI-powered performance reports covering delivery metrics, supplier performance, inventory trends, and cost analysis.",
    persona: "Supply Chain Director",
    approver: "Finance Leadership",
    trigger: "On a scheduled reporting trigger.",
    actions: [
      "Retrieves operational data from your ERP",
      "Analyzes delivery and supplier performance",
      "Compiles inventory KPIs and cost analysis",
      "Writes an AI executive summary",
      "Generates the report and emails leadership",
    ],
    value: [
      "Board-ready logistics reporting on demand",
      "One view across delivery, suppliers, and inventory",
      "Less time assembling spreadsheets",
      "Earlier visibility into cost and performance",
    ],
    runtime: "3m 08s",
    trace: [
      { kind: "run", text: "scheduled trigger fired…" },
      { kind: "ok", text: "operational data retrieved" },
      { kind: "ok", text: "delivery + supplier performance analyzed" },
      { kind: "ok", text: "inventory KPIs + cost analysis compiled" },
      { kind: "ok", text: "AI executive summary drafted" },
      { kind: "wait", text: "waiting on approval (Finance Leadership)" },
      { kind: "ok", text: "report stored to Drive · leadership emailed" },
      { kind: "done", text: "done in 3m 08s" },
    ],
  },
];

// ---------------- Integrations (logistics-focused) ----------------

type LandingIntegrationCategory =
  | "ERP"
  | "Email & Docs"
  | "Collaboration"
  | "Forms & Sheets";

type LandingIntegration = {
  slug: string;
  name: string;
  domain: string;
  category: LandingIntegrationCategory;
  logo?: string;
};

const INTEGRATION_CATEGORIES: LandingIntegrationCategory[] = [
  "ERP",
  "Email & Docs",
  "Collaboration",
  "Forms & Sheets",
];

const LANDING_INTEGRATIONS: LandingIntegration[] = [
  // ERP
  { slug: "netsuite", name: "NetSuite", domain: "netsuite.com", category: "ERP" },
  { slug: "odoo", name: "Odoo", domain: "odoo.com", category: "ERP" },
  { slug: "dynamics-365", name: "Microsoft Dynamics 365", domain: "microsoft.com", category: "ERP" },
  { slug: "salesforce", name: "Salesforce", domain: "salesforce.com", category: "ERP" },

  // Email & Docs
  { slug: "gmail", name: "Gmail", domain: "gmail.com", category: "Email & Docs" },
  { slug: "outlook", name: "Outlook", domain: "outlook.com", category: "Email & Docs" },
  { slug: "google-drive", name: "Google Drive", domain: "drive.google.com", category: "Email & Docs" },
  { slug: "sharepoint", name: "SharePoint", domain: "microsoft.com", category: "Email & Docs" },
  { slug: "dropbox", name: "Dropbox", domain: "dropbox.com", category: "Email & Docs" },

  // Collaboration
  { slug: "slack", name: "Slack", domain: "slack.com", category: "Collaboration" },
  { slug: "teams", name: "Microsoft Teams", domain: "microsoft.com", category: "Collaboration" },
  { slug: "google-calendar", name: "Google Calendar", domain: "calendar.google.com", category: "Collaboration" },

  // Forms & Sheets
  { slug: "google-forms", name: "Google Forms", domain: "docs.google.com", category: "Forms & Sheets" },
  { slug: "typeform", name: "Typeform", domain: "typeform.com", category: "Forms & Sheets" },
  { slug: "google-sheets", name: "Google Sheets", domain: "sheets.google.com", category: "Forms & Sheets" },
  { slug: "docusign", name: "DocuSign", domain: "docusign.com", category: "Forms & Sheets" },
];

// ---------------- Photography ----------------

// Logistics stock photos (Unsplash). Each <SectionPhoto> degrades to a warm
// brand gradient + icon if the image can't load, so the layout never breaks.
const PHOTOS = {
  truck: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=1600&q=80",
  truckHighway: "https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=1400&q=80",
  containers: "https://images.unsplash.com/photo-1605902711622-cfb43c4437b5?auto=format&fit=crop&w=1200&q=80",
  port: "https://images.unsplash.com/photo-1494412651409-8963ce7935a7?auto=format&fit=crop&w=1200&q=80",
  warehouse: "https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=1200&q=80",
  aircargo: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200&q=80",
  ocean: "https://images.unsplash.com/photo-1577416412292-747c6607f055?auto=format&fit=crop&w=1200&q=80",
  cargoBoxes: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80",
} as const;

function SectionPhoto({
  src,
  icon: Icon = Container,
  className,
  imgClassName,
}: {
  src: string;
  icon?: LucideIcon;
  className?: string;
  imgClassName?: string;
}) {
  const [failed, setFailed] = useState(false);
  return (
    <div className={cn("relative overflow-hidden bg-surface-2", className)}>
      {!failed ? (
        <img
          src={src}
          alt=""
          loading="lazy"
          onError={() => setFailed(true)}
          className={cn("h-full w-full object-cover", imgClassName)}
        />
      ) : (
        <div className="brand-gradient grid h-full w-full place-items-center">
          <Icon className="h-10 w-10 text-primary-foreground/70" />
        </div>
      )}
    </div>
  );
}

// ---------------- Page ----------------

function Index() {
  // The landing page owns its own theme state (light/dark) via the shared
  // ThemeProvider, so the toggle in the nav can switch the whole marketing page.
  return (
    <ThemeProvider>
      <IndexContent />
    </ThemeProvider>
  );
}

function IndexContent() {
  const [authOpen, setAuthOpen] = useState(false);
  const navigate = useNavigate();
  const { theme } = useTheme();

  const onAuthenticated = () => {
    // The app is scoped to logistics & supply chain.
    setStoredIndustry("logistics");
    navigate({ to: "/app" });
  };

  const onBookDemo = () => navigate({ to: "/demo" });

  return (
    <div
      className={cn(
        "landing-root min-h-screen bg-background text-foreground",
        theme === "dark" && "dark",
      )}
    >
      <Nav onLogin={() => setAuthOpen(true)} onBookDemo={onBookDemo} />
      <Hero onBookDemo={onBookDemo} />
      <ControlTowerSection />
      <WhyUs />
      <TrustBand />
      <FlowDiagram />
      <PhotoServices onBookDemo={onBookDemo} />
      <LandingWorkflows />
      <AboutSection onBookDemo={onBookDemo} />
      <IntegrationCatalog />
      <CopilotLibrary />
      <CoreDiagram />
      <FaqSection />
      <CTASection onBookDemo={onBookDemo} />
      <Footer />
      {authOpen && (
        <AuthModal onClose={() => setAuthOpen(false)} onAuthenticated={onAuthenticated} />
      )}
    </div>
  );
}

// ---------------- Scroll-reveal wrapper ----------------

// Wraps children in a scroll-triggered reveal. `pop` uses a slight scale-in.
function Reveal({
  children,
  className,
  delay = 0,
  pop = false,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  pop?: boolean;
}) {
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={cn(pop ? "reveal-pop" : "reveal", inView && "in-view", className)}
      style={{ transitionDelay: inView ? `${delay}ms` : "0ms" }}
    >
      {children}
    </div>
  );
}

// ---------------- Wired data-flow diagram ----------------

type FlowNode = {
  id: string;
  label: string;
  sub: string;
  icon: LucideIcon;
  y: number;
  accent: string;
};

const FLOW_SOURCES: FlowNode[] = [
  { id: "inbox", label: "Email", sub: "POs & invoices", icon: Mail, y: 26, accent: "#3b82f6" },
  { id: "erp", label: "ERP", sub: "NetSuite · Odoo", icon: Database, y: 104, accent: "#6366f1" },
  { id: "forms", label: "Forms", sub: "Supplier onboarding", icon: ClipboardList, y: 182, accent: "#06b6d4" },
  { id: "docs", label: "Warehouse Docs", sub: "Packing lists, receipts", icon: Boxes, y: 260, accent: "#f59e0b" },
];

const FLOW_OUTPUTS: FlowNode[] = [
  { id: "erpwrite", label: "ERP Updates", sub: "POs & shipments", icon: PackageCheck, y: 26, accent: "#10b981" },
  { id: "sheets", label: "Google Sheets", sub: "Fallback records", icon: Table2, y: 104, accent: "#22c55e" },
  { id: "alerts", label: "Slack Alerts", sub: "Ops & warehouse", icon: Bell, y: 182, accent: "#a855f7" },
  { id: "approvals", label: "Approvals", sub: "Human sign-off", icon: BadgeCheck, y: 260, accent: "#0ea5e9" },
];

const FLOW_DETAIL: Record<string, string> = {
  inbox: "Supplier POs and invoices land in your inbox and are read, validated, and matched automatically.",
  erp: "Live shipment, order, and inventory data is pulled from NetSuite or Odoo — no CSV exports.",
  forms: "Supplier registration and onboarding submissions are captured and verified automatically.",
  docs: "Packing lists, goods receipts, and delivery notes are turned into structured data with confidence scores.",
  core: "The logistics core reads every document, validates suppliers, pricing, and shipments, applies your rules, and drafts each action — nothing is written back without approval.",
  erpwrite: "Approved purchase orders, suppliers, and shipment records are written straight back to NetSuite or Odoo.",
  sheets: "When no ERP connector is available, records are stored in Google Sheets — the same workflow, no change to the logic.",
  alerts: "Delays, exceptions, and low-stock alerts are pushed to the right operations and warehouse channels.",
  approvals: "Every drafted action routes to the right approver before it touches your systems of record.",
};

const FLOW_W = 900;
const CARD_W = 168;
const CARD_H = 56;
const CORE = { left: 366, top: 132, w: 168, h: 96 };

function FlowDiagram() {
  const [active, setActive] = useState<string | null>(null);
  const { ref, inView } = useInView<HTMLDivElement>();

  const srcRightX = 24 + CARD_W;
  const coreLeftX = CORE.left;
  const coreRightX = CORE.left + CORE.w;
  const outLeftX = FLOW_W - 24 - CARD_W;
  const coreCY = CORE.top + CORE.h / 2;

  const wireIn = (n: FlowNode) => {
    const y1 = n.y + CARD_H / 2;
    const dx = (coreLeftX - srcRightX) / 2;
    return `M ${srcRightX} ${y1} C ${srcRightX + dx} ${y1}, ${coreLeftX - dx} ${coreCY}, ${coreLeftX} ${coreCY}`;
  };
  const wireOut = (n: FlowNode) => {
    const y2 = n.y + CARD_H / 2;
    const dx = (outLeftX - coreRightX) / 2;
    return `M ${coreRightX} ${coreCY} C ${coreRightX + dx} ${coreCY}, ${outLeftX - dx} ${y2}, ${outLeftX} ${y2}`;
  };

  const isActive = (side: "in" | "out", id: string) =>
    active === null || active === "core" || active === id
      ? true
      : side === "in"
        ? FLOW_SOURCES.some((s) => s.id === active)
          ? active === id
          : false
        : FLOW_OUTPUTS.some((o) => o.id === active)
          ? active === id
          : false;

  return (
    <section className="relative border-b border-border/60 py-20">
      <div className="mx-auto max-w-7xl px-5">
        <Reveal className="mx-auto mb-12 flex max-w-2xl flex-col items-center gap-3 text-center">
          <span className="font-mono text-xs uppercase tracking-wider text-primary">
            The data flow
          </span>
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Your systems in. Reviewed, approved actions out.
          </h2>
          <p className="text-sm text-muted-foreground md:text-base">
            Every source connects into one logistics core that reads, validates, and drafts — then
            writes approved records back. Tap any node to see what it does.
          </p>
        </Reveal>

        <Reveal pop>
          <div className="no-scrollbar relative overflow-x-auto rounded-2xl border border-border bg-gradient-to-br from-surface to-surface-2/60 p-4 shadow-sm md:p-6">
            <div
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl"
            />
            <div
              ref={ref}
              className="grid-bg relative mx-auto rounded-xl"
              style={{ width: FLOW_W, height: CORE.top + CORE.h + 60 }}
            >
              {/* column captions */}
              <div className="absolute left-6 top-0 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Sources
              </div>
              <div
                className="absolute font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground"
                style={{ left: CORE.left, width: CORE.w, textAlign: "center", top: 0 }}
              >
                AI Core
              </div>
              <div
                className="absolute font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground"
                style={{ right: 24, top: 0 }}
              >
                Outputs
              </div>

              {/* wires */}
              <svg
                className="absolute inset-0"
                width={FLOW_W}
                height={CORE.top + CORE.h + 60}
                fill="none"
              >
                {FLOW_SOURCES.map((s) => {
                  const on = isActive("in", s.id);
                  return (
                    <path
                      key={`in-${s.id}`}
                      d={wireIn(s)}
                      className={cn(
                        on ? "stroke-primary" : "stroke-border",
                        inView && on && "wire-flow",
                      )}
                      strokeWidth={on ? 2 : 1.25}
                      strokeOpacity={on ? 0.9 : 0.5}
                    />
                  );
                })}
                {FLOW_OUTPUTS.map((o) => {
                  const on = isActive("out", o.id);
                  return (
                    <path
                      key={`out-${o.id}`}
                      d={wireOut(o)}
                      className={cn(
                        on ? "stroke-primary" : "stroke-border",
                        inView && on && "wire-flow",
                      )}
                      strokeWidth={on ? 2 : 1.25}
                      strokeOpacity={on ? 0.9 : 0.5}
                    />
                  );
                })}
              </svg>

              {/* source nodes */}
              {FLOW_SOURCES.map((n) => (
                <FlowCard
                  key={n.id}
                  node={n}
                  left={24}
                  active={active === n.id}
                  onClick={() => setActive((c) => (c === n.id ? null : n.id))}
                />
              ))}

              {/* core */}
              <button
                type="button"
                onClick={() => setActive((c) => (c === "core" ? null : "core"))}
                style={{ left: CORE.left, top: CORE.top, width: CORE.w, height: CORE.h }}
                className={cn(
                  "brand-gradient absolute grid place-items-center rounded-2xl text-primary-foreground shadow-xl shadow-primary/40 ring-1 ring-white/10 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
                  active === "core"
                    ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                    : "core-pulse",
                )}
              >
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/15">
                  <Cpu className="h-5 w-5" />
                </span>
                <span className="mt-1.5 text-sm font-semibold">Logistics Core</span>
                <span className="text-[10px] opacity-80">read · validate · draft</span>
              </button>

              {/* output nodes */}
              {FLOW_OUTPUTS.map((n) => (
                <FlowCard
                  key={n.id}
                  node={n}
                  left={outLeftX}
                  active={active === n.id}
                  onClick={() => setActive((c) => (c === n.id ? null : n.id))}
                />
              ))}
            </div>
          </div>
        </Reveal>

        {/* detail caption */}
        <div className="mt-4 flex min-h-[2.5rem] items-center justify-center rounded-xl border border-border bg-surface-2/50 px-4 py-3 text-center text-sm text-muted-foreground">
          {active ? (
            <span className="text-foreground/90">{FLOW_DETAIL[active]}</span>
          ) : (
            <span>Tap a source, the core, or an output to trace what happens at each step.</span>
          )}
        </div>
      </div>
    </section>
  );
}

function FlowCard({
  node,
  left,
  active,
  onClick,
}: {
  node: FlowNode;
  left: number;
  active: boolean;
  onClick: () => void;
}) {
  const Icon = node.icon;
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        left,
        top: node.y,
        width: CARD_W,
        height: CARD_H,
        borderColor: active ? node.accent : undefined,
        boxShadow: active ? `0 0 0 1px ${node.accent}, 0 8px 24px -10px ${node.accent}` : undefined,
      }}
      className={cn(
        "group absolute flex items-center gap-3 overflow-hidden rounded-xl border bg-card px-3 text-left shadow-sm transition focus:outline-none",
        !active && "border-border hover:-translate-y-0.5 hover:shadow-md",
      )}
    >
      {/* accent rail */}
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 w-1 rounded-l-xl"
        style={{ backgroundColor: node.accent, opacity: active ? 1 : 0.5 }}
      />
      <span
        className="grid h-9 w-9 shrink-0 place-items-center rounded-lg transition group-hover:scale-105"
        style={{ backgroundColor: `${node.accent}1f`, color: node.accent }}
      >
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold text-foreground">{node.label}</span>
        <span className="block truncate text-[11px] text-muted-foreground">{node.sub}</span>
      </span>
    </button>
  );
}

// ---------------- Why us ----------------

const WHY_US: { icon: LucideIcon; title: string; desc: string; featured?: boolean }[] = [
  {
    icon: Truck,
    title: "Built for Logistics",
    desc: "Purpose-built for how operations, procurement, and warehouse teams work — POs, shipments, and receipts baked into every workflow.",
  },
  {
    icon: Cpu,
    title: "AI at the Core",
    desc: "Copilots automate document-driven logistics busywork using Eagle Doc document intelligence and the Logistics AI Engine.",
    featured: true,
  },
  {
    icon: Plug,
    title: "Connector-First",
    desc: "Runs on the enterprise systems you already use — ERP, email, storage, forms, and Slack — through Nango connectors.",
  },
  {
    icon: Gauge,
    title: "Accuracy & Validation",
    desc: "Supplier, pricing, duplicate, and three-way-match checks on every document, so nothing bad flows downstream.",
  },
  {
    icon: Lock,
    title: "Confidentiality & Security",
    desc: "Enterprise-grade encryption, role-based access, and SOC 2 controls protect your operational data.",
  },
  {
    icon: LifeBuoy,
    title: "Support When You Need It",
    desc: "Reach our team over email, Slack, and Microsoft Teams — plus docs and in-app help.",
  },
];

function WhyUs() {
  return (
    <section id="why-us" className="relative overflow-hidden border-b border-border/60 py-20">
      <FinanceGlyphs />
      <div className="relative mx-auto max-w-7xl px-5">
        <Reveal className="mb-12 text-center">
          <span className="font-mono text-xs uppercase tracking-wider text-primary">Why us</span>
          <h2 className="mx-auto mt-2 max-w-2xl text-3xl font-semibold tracking-tight md:text-4xl">
            Why logistics teams choose us
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
            Deep logistics expertise, modern automation, and the connectors your operation already
            runs on — under one roof.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {WHY_US.map((w, i) => {
            const Icon = w.icon;
            return (
              <Reveal key={w.title} pop delay={(i % 3) * 90}>
                <div
                  className={cn(
                    "flex h-full flex-col rounded-2xl border p-6 transition duration-300 hover:-translate-y-1",
                    w.featured
                      ? "brand-gradient border-transparent text-primary-foreground shadow-lg shadow-primary/30"
                      : "border-border bg-surface hover:border-primary/40 hover:shadow-md",
                  )}
                >
                  <span
                    className={cn(
                      "grid h-11 w-11 place-items-center rounded-xl",
                      w.featured
                        ? "bg-white/15 text-primary-foreground"
                        : "bg-primary/10 text-primary ring-1 ring-primary/15",
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 text-base font-semibold">{w.title}</h3>
                  <p
                    className={cn(
                      "mt-1.5 text-sm leading-relaxed",
                      w.featured ? "text-primary-foreground/85" : "text-muted-foreground",
                    )}
                  >
                    {w.desc}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ---------------- Our services (teal band) ----------------

const SERVICES: { icon: LucideIcon; title: string; points: string[] }[] = [
  { icon: FileText, title: "Purchase Orders", points: ["PO extraction", "Supplier & pricing validation", "Duplicate detection"] },
  { icon: Ship, title: "Shipment Tracking", points: ["ETA prediction", "Delay & exception detection", "Route risk analysis"] },
  { icon: Users, title: "Supplier Onboarding", points: ["Document validation", "Duplicate supplier checks", "AI risk assessment"] },
  { icon: PackageCheck, title: "Invoice Matching", points: ["Three-way matching", "Variance detection", "Finance approval"] },
  { icon: Boxes, title: "Inventory Monitoring", points: ["Low-stock detection", "Overstock & slow movers", "Reorder recommendations"] },
  { icon: BarChart3, title: "Executive Reporting", points: ["Delivery & supplier KPIs", "Inventory trends", "Cost analysis"] },
];

function ServicesBand() {
  return (
    <section id="services" className="relative overflow-hidden brand-gradient py-20 text-primary-foreground">
      <FinanceGlyphs onTeal />
      <div className="relative mx-auto max-w-7xl px-5">
        <Reveal className="mb-10 flex flex-col items-center gap-2 text-center">
          <span className="font-mono text-xs uppercase tracking-wider text-primary-foreground/80">
            Coverage
          </span>
          <h2 className="max-w-2xl text-3xl font-semibold tracking-tight md:text-4xl">
            One platform for every logistics workflow
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s, i) => {
            const Icon = s.icon;
            return (
              <Reveal key={s.title} pop delay={(i % 3) * 90}>
                <div className="flex h-full flex-col rounded-2xl border border-border bg-surface p-6 text-foreground shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 text-base font-semibold">{s.title}</h3>
                  <ul className="mt-3 space-y-2">
                    {s.points.map((p) => (
                      <li key={p} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Check className="h-4 w-4 shrink-0 text-primary" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            );
          })}
        </div>

        <div className="mt-10 flex justify-center">
          <a
            href="#copilots"
            className="inline-flex items-center gap-1.5 rounded-lg bg-surface px-6 py-3 text-sm font-semibold text-primary shadow-sm transition hover:-translate-y-0.5"
          >
            View all copilots
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
}

// ---------------- About ----------------

const ABOUT_POINTS = [
  "Designed with operations and supply chain teams, for real logistics work",
  "Configurable to your suppliers, lanes, and approval policies",
  "Your team reviews and approves before anything is written back",
];

function AboutSection({ onBookDemo }: { onBookDemo: () => void }) {
  return (
    <section id="about" className="border-b border-border/60 py-20">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 lg:grid-cols-2">
        {/* Copy */}
        <Reveal>
          <span className="font-mono text-xs uppercase tracking-wider text-primary">About us</span>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
            Built for logistics & supply chain teams
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
            Our copilots handle the document-driven busywork across purchase orders, shipments,
            supplier onboarding, and warehouse operations, so your team can focus on moving freight.
            Everything is configurable to your systems — with a full audit trail on every action.
          </p>
          <ul className="mt-5 space-y-2.5">
            {ABOUT_POINTS.map((p) => (
              <li key={p} className="flex items-start gap-2.5 text-sm text-foreground/90">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                {p}
              </li>
            ))}
          </ul>
          <button
            onClick={onBookDemo}
            className="brand-gradient mt-7 inline-flex items-center gap-1.5 rounded-lg px-6 py-3 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/25 transition hover:-translate-y-0.5"
          >
            Read more
            <ArrowRight className="h-4 w-4" />
          </button>
        </Reveal>

        {/* Framed visual (teal L-brackets, like the reference) */}
        <Reveal pop className="relative mx-auto w-full max-w-md">
          <span
            aria-hidden
            className="absolute -right-3 -top-3 h-24 w-24 rounded-tr-2xl border-r-2 border-t-2 border-primary"
          />
          <span
            aria-hidden
            className="absolute -bottom-3 -left-3 h-24 w-24 rounded-bl-2xl border-b-2 border-l-2 border-primary"
          />
          <div className="relative overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl">
            <div className="grid-bg flex items-center justify-between border-b border-border px-5 py-4">
              <div className="flex items-center gap-2">
                <span className="brand-gradient grid h-7 w-7 place-items-center rounded-md text-primary-foreground">
                  <Sparkles className="h-4 w-4" />
                </span>
                <span className="text-sm font-semibold">This week at a glance</span>
              </div>
              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-500">
                On track
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 p-5">
              {[
                { k: "On-time delivery", v: "94.2%", s: "+2.1 pts" },
                { k: "POs processed", v: "1,284", s: "+8% WoW" },
                { k: "Avg PO cycle", v: "5.2 min", s: "−41 min" },
                { k: "Open exceptions", v: "4", s: "−6 WoW" },
              ].map((m) => (
                <div key={m.k} className="rounded-xl border border-border bg-card p-3">
                  <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{m.k}</div>
                  <div className="mt-1 text-lg font-semibold tabular-nums">{m.v}</div>
                  <div className="text-[11px] font-medium text-emerald-500">{m.s}</div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ---------------- Workflows (same as the in-app Workflows page) ----------------

type WfStepKind = "trigger" | "extract" | "match" | "validate" | "approve" | "output";
type WfStep = { label: string; system: string; kind: WfStepKind };
type LandingWf = { id: string; name: string; flow: WfStep[] };

const WF_KIND: Record<WfStepKind, { label: string; dot: string; ring: string; text: string }> = {
  trigger: { label: "Trigger", dot: "bg-amber-400", ring: "border-amber-400/50", text: "text-amber-400" },
  extract: { label: "Extract", dot: "bg-sky-400", ring: "border-sky-400/50", text: "text-sky-400" },
  match: { label: "Match", dot: "bg-cyan-400", ring: "border-cyan-400/50", text: "text-cyan-400" },
  validate: { label: "Validate", dot: "bg-violet-400", ring: "border-violet-400/50", text: "text-violet-400" },
  approve: { label: "Approve", dot: "bg-indigo-400", ring: "border-indigo-400/50", text: "text-indigo-400" },
  output: { label: "Output", dot: "bg-emerald-400", ring: "border-emerald-400/50", text: "text-emerald-400" },
};

const LANDING_WORKFLOWS: LandingWf[] = [
  {
    id: "wf_po_0417",
    name: "Purchase Order Processing",
    flow: [
      { label: "Supplier sends PO", system: "Gmail", kind: "trigger" },
      { label: "Extract PO data", system: "Eagle Doc", kind: "extract" },
      { label: "Validate supplier", system: "NetSuite", kind: "match" },
      { label: "Duplicate + pricing check", system: "Rules Engine", kind: "validate" },
      { label: "Procurement approval", system: "Approvals", kind: "approve" },
      { label: "Create PO", system: "NetSuite", kind: "output" },
    ],
  },
  {
    id: "wf_shipment_track",
    name: "Shipment Tracking",
    flow: [
      { label: "Shipment created", system: "NetSuite", kind: "trigger" },
      { label: "Retrieve shipment data", system: "Odoo", kind: "extract" },
      { label: "Predict ETA", system: "AI Engine", kind: "match" },
      { label: "Delay + exception detection", system: "AI Engine", kind: "validate" },
      { label: "Notify customer", system: "Gmail", kind: "output" },
      { label: "Notify operations", system: "Slack", kind: "output" },
    ],
  },
  {
    id: "wf_supplier_onboard",
    name: "Supplier Onboarding",
    flow: [
      { label: "Registration submitted", system: "Google Forms", kind: "trigger" },
      { label: "Extract documents", system: "Eagle Doc", kind: "extract" },
      { label: "Verify tax + banking", system: "AI Engine", kind: "validate" },
      { label: "Duplicate supplier check", system: "NetSuite", kind: "match" },
      { label: "Approval", system: "Approvals", kind: "approve" },
      { label: "Create supplier", system: "NetSuite", kind: "output" },
    ],
  },
  {
    id: "wf_delivery_exception",
    name: "Delivery Exception",
    flow: [
      { label: "Delivery update", system: "NetSuite", kind: "trigger" },
      { label: "Detect delay / failure", system: "AI Engine", kind: "extract" },
      { label: "Classify exception", system: "AI Engine", kind: "validate" },
      { label: "Operations approval", system: "Approvals", kind: "approve" },
      { label: "Notify customer", system: "Gmail", kind: "output" },
      { label: "Update ERP", system: "Odoo", kind: "output" },
    ],
  },
  {
    id: "wf_invoice_match",
    name: "Invoice Matching",
    flow: [
      { label: "Invoice received", system: "Gmail", kind: "trigger" },
      { label: "Extract invoice", system: "Eagle Doc", kind: "extract" },
      { label: "Retrieve PO + receipt", system: "NetSuite", kind: "match" },
      { label: "Detect variance", system: "AI Engine", kind: "validate" },
      { label: "Finance approval", system: "Approvals", kind: "approve" },
      { label: "Update ERP", system: "NetSuite", kind: "output" },
    ],
  },
  {
    id: "wf_inventory_monitor",
    name: "Inventory Monitoring",
    flow: [
      { label: "Scheduled trigger", system: "Scheduler", kind: "trigger" },
      { label: "Retrieve inventory", system: "Odoo", kind: "extract" },
      { label: "Low-stock detection", system: "AI Engine", kind: "match" },
      { label: "Reorder recommendations", system: "AI Engine", kind: "validate" },
      { label: "Slack alert", system: "Slack", kind: "output" },
      { label: "Purchase recommendation", system: "Gmail", kind: "output" },
    ],
  },
  {
    id: "wf_warehouse_doc",
    name: "Warehouse Document",
    flow: [
      { label: "Document uploaded", system: "Google Drive", kind: "trigger" },
      { label: "Extract packing list", system: "Eagle Doc", kind: "extract" },
      { label: "Validate delivery note", system: "AI Engine", kind: "validate" },
      { label: "Store metadata", system: "Google Sheets", kind: "output" },
      { label: "Notify warehouse", system: "Slack", kind: "output" },
    ],
  },
  {
    id: "wf_exec_report",
    name: "Logistics Executive Reporting",
    flow: [
      { label: "Scheduled trigger", system: "Scheduler", kind: "trigger" },
      { label: "Retrieve operational data", system: "NetSuite", kind: "extract" },
      { label: "Compile KPIs", system: "AI Engine", kind: "match" },
      { label: "AI executive summary", system: "AI Engine", kind: "validate" },
      { label: "Store report", system: "Google Drive", kind: "output" },
      { label: "Email leadership", system: "Gmail", kind: "output" },
    ],
  },
];

// Flow-graph geometry (mirrors the in-app Workflows page).
const WF_STEP_W = 138;
const WF_STEP_H = 52;
const WF_SYS_W = 116;
const WF_SYS_H = 36;
const WF_STEP_Y = 88;
const WF_SYS_Y = 258;
const WF_PAD = 24;
const WF_STEP_GAP = 168;

function LandingWorkflows() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = LANDING_WORKFLOWS.find((w) => w.id === activeId) ?? null;

  return (
    <section id="workflow" className="border-b border-border/60 bg-surface-2/40 py-20">
      <div className="mx-auto max-w-7xl px-5">
        <Reveal className="mx-auto mb-10 flex max-w-2xl flex-col items-center gap-3 text-center">
          <span className="font-mono text-xs uppercase tracking-wider text-primary">Workflows</span>
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Watch a workflow run end to end
          </h2>
          <p className="text-sm text-muted-foreground md:text-base">
            The same workflows that run inside the app. Pick one to trace every step and the systems
            it connects.
          </p>
        </Reveal>

        {/* Compact workflow boxes — click one to open its flow in a popup */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {LANDING_WORKFLOWS.map((w) => {
            const systems = new Set(w.flow.map((s) => s.system)).size;
            return (
              <Reveal key={w.id} pop>
                <button
                  onClick={() => setActiveId(w.id)}
                  className="group flex w-full items-center gap-3 rounded-xl border border-border bg-surface p-4 text-left transition duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15">
                    <Workflow className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-foreground">{w.name}</div>
                    <div className="mt-0.5 text-[11px] text-muted-foreground">
                      {w.flow.length} steps · {systems} systems
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" />
                </button>
              </Reveal>
            );
          })}
        </div>
      </div>

      {active && <WorkflowModal wf={active} onClose={() => setActiveId(null)} />}
    </section>
  );
}

function WorkflowModal({ wf, onClose }: { wf: LandingWf; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-8 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${wf.name} workflow`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="nice-scroll max-h-[88vh] w-full max-w-5xl overflow-y-auto rounded-2xl border border-border bg-surface shadow-2xl"
      >
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between gap-4 border-b border-border bg-surface px-6 py-4">
          <div className="flex items-center gap-2.5">
            <span className="brand-gradient grid h-8 w-8 place-items-center rounded-lg text-primary-foreground shadow-sm shadow-primary/25">
              <Workflow className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-base font-semibold tracking-tight">{wf.name}</h3>
              <p className="font-mono text-[11px] text-muted-foreground">{wf.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 rounded-lg p-2 text-muted-foreground transition hover:bg-surface-2 hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Flow */}
        <div className="nice-scroll overflow-x-auto p-6">
          <LandingWorkflowGraph flow={wf.flow} />
        </div>
      </div>
    </div>
  );
}

function LandingWorkflowGraph({ flow }: { flow: WfStep[] }) {
  const stepX = flow.map((_, i) => WF_PAD + WF_STEP_W / 2 + i * WF_STEP_GAP);
  const canvasW = WF_PAD * 2 + WF_STEP_W + (flow.length - 1) * WF_STEP_GAP;
  const systems = Array.from(new Set(flow.map((s) => s.system)));
  const sysX = (name: string) => {
    const i = systems.indexOf(name);
    if (systems.length === 1) return canvasW / 2;
    const usable = canvasW - WF_PAD * 2 - WF_SYS_W;
    return WF_PAD + WF_SYS_W / 2 + (i * usable) / (systems.length - 1);
  };
  const seqPath = (i: number) => {
    const x1 = stepX[i] + WF_STEP_W / 2;
    const x2 = stepX[i + 1] - WF_STEP_W / 2;
    const dx = (x2 - x1) / 2;
    return `M ${x1} ${WF_STEP_Y} C ${x1 + dx} ${WF_STEP_Y}, ${x2 - dx} ${WF_STEP_Y}, ${x2} ${WF_STEP_Y}`;
  };
  const downPath = (i: number, name: string) => {
    const x1 = stepX[i];
    const y1 = WF_STEP_Y + WF_STEP_H / 2;
    const x2 = sysX(name);
    const y2 = WF_SYS_Y - WF_SYS_H / 2;
    const dy = (y2 - y1) / 2;
    return `M ${x1} ${y1} C ${x1} ${y1 + dy}, ${x2} ${y2 - dy}, ${x2} ${y2}`;
  };
  const CANVAS_H = WF_SYS_Y + WF_SYS_H / 2 + 28;

  return (
    <div className="mx-auto" style={{ width: canvasW }}>
      <div className="relative" style={{ width: canvasW, height: CANVAS_H + 24 }}>
        <div className="absolute left-0 top-0 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          Flow
        </div>
        <div
          className="absolute left-0 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground"
          style={{ top: WF_SYS_Y - WF_SYS_H / 2 - 42 }}
        >
          Connectors
        </div>

        <svg className="absolute inset-0" width={canvasW} height={CANVAS_H + 24} fill="none">
          {flow.slice(0, -1).map((_, i) => (
            <path key={`seq-${i}`} d={seqPath(i)} className="stroke-primary/70" strokeWidth={1.75} />
          ))}
          {flow.map((s, i) => (
            <path key={`down-${i}`} d={downPath(i, s.system)} className="stroke-primary/25" strokeWidth={1.25} />
          ))}
        </svg>

        {flow.map((s, i) => {
          const meta = WF_KIND[s.kind];
          return (
            <div
              key={`step-${i}`}
              style={{ left: stepX[i] - WF_STEP_W / 2, top: WF_STEP_Y - WF_STEP_H / 2, width: WF_STEP_W, height: WF_STEP_H }}
              className={cn("absolute flex flex-col justify-center rounded-md border bg-card px-2.5 shadow-sm", meta.ring)}
            >
              <div className="flex items-center gap-1.5">
                <span className={cn("grid h-4 w-4 shrink-0 place-items-center rounded-full text-[9px] font-semibold text-background", meta.dot)}>
                  {i + 1}
                </span>
                <span className="truncate text-[11px] font-semibold text-foreground">{s.label}</span>
              </div>
              <span className={cn("mt-0.5 pl-[22px] text-[9px] font-medium uppercase tracking-wide", meta.text)}>
                {meta.label}
              </span>
            </div>
          );
        })}

        {systems.map((name) => (
          <div
            key={`sys-${name}`}
            style={{ left: sysX(name) - WF_SYS_W / 2, top: WF_SYS_Y - WF_SYS_H / 2, width: WF_SYS_W, height: WF_SYS_H }}
            className="absolute flex items-center gap-1.5 rounded-md border border-orange-400/50 bg-card px-2.5 shadow-sm"
          >
            <Plug className="h-3 w-3 shrink-0 text-orange-400" />
            <span className="truncate text-[11px] font-medium text-foreground">{name}</span>
          </div>
        ))}
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5">
        {(Object.keys(WF_KIND) as WfStepKind[]).map((k) => (
          <span key={k} className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
            <span className={cn("h-2 w-2 rounded-full", WF_KIND[k].dot)} />
            {WF_KIND[k].label}
          </span>
        ))}
        <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
          <span className="h-2 w-2 rounded-full bg-orange-400" />
          Connector
        </span>
      </div>
    </div>
  );
}

// ---------------- Nav ----------------

function Nav({ onLogin, onBookDemo }: { onLogin: () => void; onBookDemo: () => void }) {
  const { theme, toggle } = useTheme();
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5">
        <a href="#" className="flex items-center">
          <LogoLockup className="ml-2" />
        </a>
        <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
          <a href="#why-us" className="transition hover:text-foreground">
            Why us
          </a>
          <a href="#services" className="transition hover:text-foreground">
            Services
          </a>
          <a href="#about" className="transition hover:text-foreground">
            About
          </a>
          <a href="#copilots" className="transition hover:text-foreground">
            Copilots
          </a>
        </nav>
        <div className="flex items-center gap-2">
          <button
            onClick={toggle}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            className="rounded-lg p-2 text-muted-foreground transition hover:bg-secondary hover:text-foreground"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <button
            onClick={onLogin}
            className="rounded-lg px-3.5 py-1.5 text-sm font-medium text-foreground transition hover:bg-secondary"
          >
            Log in
          </button>
          <button
            onClick={onBookDemo}
            className="brand-gradient rounded-lg px-4 py-1.5 text-sm font-semibold text-primary-foreground shadow-sm shadow-primary/30 transition hover:opacity-90"
          >
            Book a demo
          </button>
        </div>
      </div>
    </header>
  );
}

// ---------------- Hero ----------------

// Decorative logistics motifs — faint trucks, ships, containers, and route icons
// that sit behind a section's content (pointer-events-none) to give a logistics
// identity without affecting layout. Set `onTeal` for a brand-gradient background.
function FinanceGlyphs({ onTeal = false }: { onTeal?: boolean }) {
  const tone = onTeal ? "text-primary-foreground/10" : "text-primary/[0.07]";
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <Truck className={cn("absolute left-[4%] top-[20%] h-16 w-16 -rotate-6", tone)} />
      <Ship className={cn("absolute right-[7%] top-[16%] h-14 w-14", tone)} />
      <Container className={cn("absolute left-[13%] bottom-[16%] h-12 w-12", tone)} />
      <MapPin className={cn("absolute right-[15%] bottom-[26%] h-9 w-9", tone)} />
      <Warehouse className={cn("absolute left-[46%] top-[12%] h-12 w-12", tone)} />
      <Globe className={cn("absolute right-[40%] bottom-[14%] h-12 w-12", tone)} />
      <ArrowLeftRight className={cn("absolute left-[28%] bottom-[34%] h-9 w-9", tone)} />
    </div>
  );
}

// A faint upward "market line" chart, drawn edge-to-edge along the bottom of a section.
function MarketLine({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      className={cn("pointer-events-none absolute inset-x-0 bottom-0 h-40 w-full", className)}
      viewBox="0 0 1200 160"
      preserveAspectRatio="none"
      fill="none"
    >
      <polyline
        points="0,120 90,104 180,112 270,74 360,92 450,54 540,68 630,34 720,58 810,28 900,44 990,18 1080,36 1200,14"
        stroke="currentColor"
        strokeWidth="2"
      />
      <polyline
        points="0,140 90,132 180,136 270,116 360,124 450,104 540,112 630,92 720,104 810,86 900,96 990,78 1080,90 1200,72"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeOpacity="0.6"
        strokeDasharray="4 5"
      />
    </svg>
  );
}

const HERO_TRUST: { icon: LucideIcon; label: string }[] = [
  { icon: Landmark, label: "Works with NetSuite, Odoo & Google Sheets" },
  { icon: ShieldCheck, label: "Human approval before anything is written back" },
  { icon: ScrollText, label: "Full audit trail on every action" },
];

function Hero({ onBookDemo }: { onBookDemo: () => void }) {
  return (
    <section className="relative overflow-hidden border-b border-border/60">
      {/* Decorative layer is clipped on its own so it never overflows the section. */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        {/* Full-section background image — auto-switches with the active theme. */}
        <img
          src="/Background-light.png"
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-center dark:hidden"
        />
        <img
          src="/Background-dark.png"
          alt=""
          className="absolute inset-0 hidden h-full w-full object-cover object-center dark:block"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/40 to-background/80 dark:from-background/40 dark:via-background/30 dark:to-background/80" />
        <div className="absolute -top-44 left-1/2 h-[30rem] w-[60rem] -translate-x-1/2 rounded-full bg-primary/25 blur-3xl" />
        <div className="absolute -top-10 right-0 h-80 w-80 rounded-full bg-primary-2/20 blur-3xl" />
        {/* faint logistics motifs — left side, clear of the product card */}
        <Container className="absolute left-[3%] top-[20%] h-10 w-10 text-primary/[0.08]" />
        <Ship className="absolute left-[16%] top-[12%] hidden h-12 w-12 text-primary/[0.07] lg:block" />
        <Truck className="absolute bottom-[24%] left-[6%] h-14 w-14 -rotate-6 text-primary/[0.07]" />
        <MapPin className="absolute bottom-[16%] left-[24%] hidden h-8 w-8 text-primary/[0.08] lg:block" />
        <MarketLine className="text-primary/[0.08]" />
      </div>
      <div className="relative mx-auto max-w-7xl px-5 py-16 md:py-24">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
          {/* Left — copy */}
          <div className="max-w-xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Built for operations, procurement & supply chain teams
            </div>
            <h1 className="text-4xl font-semibold leading-[1.05] tracking-tight md:text-5xl lg:text-6xl">
              {HERO.tagline}
            </h1>
            <p className="mt-5 text-base leading-relaxed text-muted-foreground md:text-lg">
              {HERO.sub}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={onBookDemo}
                className="brand-gradient inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition hover:-translate-y-0.5 hover:opacity-95"
              >
                Book a demo
                <ArrowRight className="h-4 w-4" />
              </button>
              <a
                href="#copilots"
                className="inline-flex items-center justify-center rounded-xl border border-border bg-surface px-6 py-3 text-sm font-semibold text-foreground transition hover:border-primary hover:text-primary"
              >
                See the copilots
              </a>
            </div>

            {/* trust chips */}
            <div className="mt-8 flex flex-wrap gap-2">
              {HERO_TRUST.map((t) => {
                const Icon = t.icon;
                return (
                  <span
                    key={t.label}
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-muted-foreground"
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0 text-primary" />
                    {t.label}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Right — photographic hero visual */}
          <HeroVisual />
        </div>
      </div>
    </section>
  );
}

// A framed photographic hero visual with floating stat chips — fills the hero's
// right column with real logistics imagery instead of a product card.
function HeroVisual() {
  return (
    <div className="relative">
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-4 rounded-[32px] bg-primary/10 blur-2xl"
      />
      <div className="relative">
        <SectionPhoto
          src={PHOTOS.truck}
          icon={Truck}
          className="aspect-[4/3] w-full rounded-3xl border border-border shadow-2xl"
        />
        {/* route chip */}
        <div className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-background/85 px-3 py-1.5 text-xs font-medium text-primary shadow-lg backdrop-blur">
          <Ship className="h-3.5 w-3.5" /> Air · Ocean · Road
        </div>
      </div>
    </div>
  );
}

// A realistic logistics product preview — the operations touch: shipment KPIs,
// a live shipment tracking list, and a drafted purchase order awaiting approval.
function HeroPreview() {
  return (
    <div className="relative">
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-4 rounded-[28px] bg-primary/10 blur-2xl"
      />


      <div className="relative rounded-2xl border border-border bg-surface shadow-2xl">
        {/* window chrome */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="grid h-6 w-6 place-items-center rounded-md brand-gradient text-primary-foreground">
              <Sparkles className="h-3.5 w-3.5" />
            </span>
            <span className="text-sm font-semibold">Operations control tower</span>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-500">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" /> Live
          </span>
        </div>

        <div className="space-y-4 p-4">
          {/* KPI tiles */}
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { label: "Active shipments", value: "128", tone: "text-foreground" },
              { label: "On-time", value: "94.2%", tone: "text-emerald-500" },
              { label: "Exceptions", value: "4", tone: "text-amber-500" },
            ].map((k) => (
              <div key={k.label} className="rounded-xl border border-border bg-card p-3">
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  {k.label}
                </div>
                <div className={cn("mt-1 text-lg font-semibold tabular-nums", k.tone)}>
                  {k.value}
                </div>
              </div>
            ))}
          </div>

          {/* Shipment tracking list */}
          <div className="rounded-xl border border-border bg-card p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                Shipment tracking
              </span>
              <span className="text-[10px] text-muted-foreground">124 / 128 on track</span>
            </div>
            <ul className="space-y-1.5">
              {[
                { d: "SHP-4471 · Rotterdam → Chicago", a: "ETA Jul 18", ok: true },
                { d: "SHP-4468 · Shenzhen → LA", a: "ETA Jul 19", ok: true },
                { d: "SHP-4459 · Hamburg → Newark", a: "Delayed 2d", ok: false },
              ].map((r) => (
                <li key={r.d} className="flex items-center justify-between gap-3 text-[12px]">
                  <span className="flex min-w-0 items-center gap-2">
                    {r.ok ? (
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                    ) : (
                      <Clock className="h-3.5 w-3.5 shrink-0 text-amber-500" />
                    )}
                    <span className="truncate font-mono text-muted-foreground">{r.d}</span>
                  </span>
                  <span className="shrink-0 font-mono tabular-nums text-foreground">{r.a}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Drafted purchase order */}
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-wider text-primary">
                Drafted purchase order · PO-2214
              </span>
              <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Needs approval
              </span>
            </div>
            <table className="w-full text-[12px]">
              <tbody className="font-mono">
                <tr>
                  <td className="py-0.5 text-foreground/90">Pallet racking — 48u</td>
                  <td className="py-0.5 text-right tabular-nums text-muted-foreground">120 units</td>
                  <td className="py-0.5 text-right tabular-nums text-foreground">$12,900.00</td>
                </tr>
                <tr>
                  <td className="py-0.5 text-foreground/90">Stretch wrap — rolls</td>
                  <td className="py-0.5 text-right tabular-nums text-muted-foreground">300 units</td>
                  <td className="py-0.5 text-right tabular-nums text-foreground">$1,380.00</td>
                </tr>
                <tr>
                  <td className="py-0.5 text-foreground/90">Supplier · Acme Freight Co.</td>
                  <td className="py-0.5 text-right tabular-nums text-emerald-500">Validated ✓</td>
                  <td className="py-0.5 text-right tabular-nums text-foreground">$14,280.00</td>
                </tr>
              </tbody>
            </table>
            <div className="mt-3 flex items-center gap-2">
              <button className="brand-gradient inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[11px] font-semibold text-primary-foreground">
                <CheckCircle2 className="h-3.5 w-3.5" /> Approve & create
              </button>
              <button className="rounded-md border border-border bg-surface px-3 py-1.5 text-[11px] font-medium text-muted-foreground">
                Review
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------- Control tower section (houses the product preview) ----------------

const CONTROL_TOWER_POINTS: { icon: LucideIcon; title: string; desc: string }[] = [
  {
    icon: Ship,
    title: "Live shipment tracking",
    desc: "Every active load with a predicted ETA, and delays flagged the moment they appear.",
  },
  {
    icon: FileText,
    title: "Drafted, not posted",
    desc: "AI extracts and validates each PO and invoice, then waits for your approval.",
  },
  {
    icon: CheckCircle2,
    title: "One-click approvals",
    desc: "Approve and write back to your ERP — or fall back to Google Sheets — in a single click.",
  },
];

function ControlTowerSection() {
  return (
    <section className="border-b border-border/60 bg-surface-2/40 py-20">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 lg:grid-cols-[0.95fr_1.05fr]">
        {/* Copy */}
        <Reveal>
          <span className="font-mono text-xs uppercase tracking-wider text-primary">
            Operations control tower
          </span>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
            Your whole operation on one screen.
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
            Shipments, exceptions, and every drafted purchase order and invoice — surfaced in real
            time, with a human in control of every action before it touches your systems.
          </p>
          <ul className="mt-6 space-y-4">
            {CONTROL_TOWER_POINTS.map((p) => {
              const Icon = p.icon;
              return (
                <li key={p.title} className="flex gap-3.5">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <div className="text-sm font-semibold text-foreground">{p.title}</div>
                    <div className="mt-0.5 text-sm text-muted-foreground">{p.desc}</div>
                  </div>
                </li>
              );
            })}
          </ul>
        </Reveal>

        {/* Product preview card */}
        <Reveal pop>
          <HeroPreview />
        </Reveal>
      </div>
    </section>
  );
}

// ---------------- Trust band (photo-led) ----------------

const TRUST_POINTS = [
  "Connector-first — runs on the enterprise systems you already use",
  "AI extracts and validates; your team approves every action",
  "Works ERP-connected or ERP-independent, with the same workflow",
];

function TrustBand() {
  return (
    <section className="border-b border-border/60 py-20">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 lg:grid-cols-[0.9fr_1.1fr]">
        {/* Photo collage */}
        <Reveal pop className="order-2 lg:order-1">
          <div className="relative grid grid-cols-5 grid-rows-6 gap-3" style={{ minHeight: 380 }}>
            <SectionPhoto
              src={PHOTOS.ocean}
              icon={Ship}
              className="col-span-3 row-span-6 rounded-2xl border border-border shadow-lg"
            />
            <SectionPhoto
              src={PHOTOS.containers}
              icon={Container}
              className="col-span-2 row-span-3 rounded-2xl border border-border shadow-lg"
            />
            <SectionPhoto
              src={PHOTOS.warehouse}
              icon={Warehouse}
              className="col-span-2 row-span-3 rounded-2xl border border-border shadow-lg"
            />
          </div>
        </Reveal>

        {/* Copy */}
        <Reveal className="order-1 lg:order-2">
          <span className="font-mono text-xs uppercase tracking-wider text-primary">
            Built on trust &amp; reliability
          </span>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
            Move goods faster, with fewer surprises.
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
            We simplify complex supply chains by combining document intelligence, the Logistics AI
            Engine, and your existing connectors — so purchase orders, shipments, and invoices flow
            through automatically, and a human signs off before anything is written back.
          </p>
          <ul className="mt-6 space-y-3">
            {TRUST_POINTS.map((p) => (
              <li key={p} className="flex items-start gap-2.5 text-sm text-foreground/90">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                {p}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}

// ---------------- Photographic services ----------------

const SERVICE_PHOTOS = [
  PHOTOS.cargoBoxes,
  PHOTOS.truckHighway,
  PHOTOS.port,
  PHOTOS.containers,
  PHOTOS.warehouse,
  PHOTOS.ocean,
];

function PhotoServices({ onBookDemo }: { onBookDemo: () => void }) {
  return (
    <section id="services" className="border-b border-border/60 bg-surface-2/50 py-20">
      <div className="mx-auto max-w-7xl px-5">
        <Reveal className="mb-12 flex flex-col items-center gap-3 text-center">
          <span className="font-mono text-xs uppercase tracking-wider text-primary">Services</span>
          <h2 className="max-w-2xl text-3xl font-semibold tracking-tight md:text-4xl">
            We provide the best logistics services
          </h2>
          <p className="max-w-xl text-sm text-muted-foreground">
            Reliable, efficient automation to move your goods safely — by air, sea, or land — and
            keep every document, order, and shipment under control.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s, i) => {
            const Icon = s.icon;
            return (
              <Reveal key={s.title} pop delay={(i % 3) * 90}>
                <div className="group h-full overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg">
                  <div className="relative h-44 overflow-hidden">
                    <SectionPhoto
                      src={SERVICE_PHOTOS[i]}
                      icon={Icon}
                      className="h-full w-full"
                      imgClassName="transition duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                    <span className="absolute left-4 top-4 grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground shadow-lg">
                      <Icon className="h-5 w-5" />
                    </span>
                    <h3 className="absolute bottom-3 left-4 right-4 text-lg font-semibold text-white">
                      {s.title}
                    </h3>
                  </div>
                  <ul className="space-y-2 p-5">
                    {s.points.map((p) => (
                      <li key={p} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Check className="h-4 w-4 shrink-0 text-primary" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            );
          })}
        </div>

        <div className="mt-10 flex justify-center">
          <a
            href="#copilots"
            className="brand-gradient inline-flex items-center gap-1.5 rounded-xl px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition hover:-translate-y-0.5"
          >
            View all copilots
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
}

// ---------------- FAQ ----------------

const FAQS: { q: string; a: string }[] = [
  {
    q: "What logistics workflows does the AI OS automate?",
    a: "Eight document-driven workflows out of the box: purchase order processing, shipment tracking, supplier onboarding, delivery exceptions, invoice matching, inventory monitoring, warehouse document extraction, and executive reporting.",
  },
  {
    q: "Do I need a dedicated TMS or WMS to use it?",
    a: "No. The AI OS is connector-first — it runs on the enterprise systems you already use (ERP, email, storage, forms, and Slack) through Nango connectors, and can be extended to specialized logistics platforms later without changing the workflows.",
  },
  {
    q: "What happens if my ERP isn't connected?",
    a: "The Connector Decision Layer writes approved records to your ERP (NetSuite or Odoo) when it's connected, and falls back to Google Sheets when it isn't — the same workflow logic and approvals either way.",
  },
  {
    q: "Does the AI act on its own?",
    a: "Never without sign-off. Each copilot extracts, validates, and drafts an action, then pauses for the right approver — procurement, finance, warehouse, or operations — before anything is written back, with a full audit trail.",
  },
  {
    q: "How does it read documents?",
    a: "Eagle Doc handles OCR, classification, and structured extraction for POs, invoices, packing lists, goods receipts, and delivery notes — with a confidence score on every field so low-confidence extractions are flagged for review.",
  },
];

function FaqSection() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="border-b border-border/60 py-20">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 lg:grid-cols-[0.8fr_1.2fr]">
        <Reveal>
          <span className="font-mono text-xs uppercase tracking-wider text-primary">FAQ</span>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
            Frequently asked questions
          </h2>
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">
            Clear answers on connectors, approvals, and how the Logistics AI OS fits your stack.
          </p>
          <SectionPhoto
            src={PHOTOS.truck}
            icon={Truck}
            className="mt-6 hidden h-48 rounded-2xl border border-border shadow-lg lg:block"
          />
        </Reveal>

        <Reveal pop className="space-y-3">
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <div
                key={f.q}
                className="overflow-hidden rounded-xl border border-border bg-surface transition hover:border-primary/40"
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span className="text-sm font-semibold text-foreground">{f.q}</span>
                  <ChevronRight
                    className={cn(
                      "h-4 w-4 shrink-0 text-primary transition",
                      isOpen && "rotate-90",
                    )}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-4 text-sm leading-relaxed text-muted-foreground">
                    {f.a}
                  </div>
                )}
              </div>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
}

// ---------------- Core diagram ----------------

type CoreCapability = {
  name: string;
  icon: LucideIcon;
  desc: string;
  detail: string;
  points: string[];
};

const CORE_CAPABILITIES: CoreCapability[] = [
  {
    name: "Eagle Doc",
    icon: FileText,
    desc: "OCR, classification, and structured extraction from any logistics document.",
    detail:
      "Turns any inbound document — POs, invoices, packing lists, goods receipts, delivery notes — into structured, ready-to-use data without manual keying. Every field comes with a confidence score, so low-confidence extractions are flagged for a human instead of processed blindly.",
    points: [
      "OCR for POs, invoices, and warehouse documents",
      "Document classification and structured extraction",
      "Line-item, total, and supplier parsing",
      "Confidence scoring with human review on exceptions",
    ],
  },
  {
    name: "Logistics AI Engine",
    icon: Cpu,
    desc: "Supplier validation, shipment analysis, inventory insights, ETA prediction, and document validation.",
    detail:
      "The shared intelligence behind every workflow. It validates suppliers, analyzes shipments, predicts ETAs, surfaces inventory insights, and validates documents — reusable across purchase orders, tracking, onboarding, and warehouse operations.",
    points: [
      "Supplier validation and duplicate detection",
      "Shipment analysis and ETA prediction",
      "Inventory insights and reorder recommendations",
      "Document validation across every workflow",
    ],
  },
  {
    name: "Approval Engine",
    icon: ShieldCheck,
    desc: "Procurement, finance, warehouse, and operations approvals before anything is written back.",
    detail:
      "Every action a copilot proposes runs through your approvals before it touches a system of record. Routing, thresholds, and role-based sign-off are enforced automatically for procurement, finance, warehouse, and operations teams.",
    points: [
      "Configurable approval routing and thresholds",
      "Procurement, finance, warehouse & ops approvals",
      "Role-based sign-off enforced by policy",
      "Human sign-off required before write-back",
    ],
  },
  {
    name: "Business Rules Engine",
    icon: Gauge,
    desc: "Duplicate detection, pricing validation, and policy enforcement on every document.",
    detail:
      "Applies your operational rules to every document a copilot handles — catching duplicate purchase orders, mispriced line items, and policy violations before they flow downstream into your ERP.",
    points: [
      "Duplicate PO and supplier detection",
      "Pricing and line-item validation",
      "Company policy enforcement",
      "Configurable rules per workflow",
    ],
  },
  {
    name: "Connector Decision Layer",
    icon: Plug,
    desc: "Writes to your ERP when connected; otherwise stores records in Google Sheets.",
    detail:
      "Keeps every workflow unchanged regardless of the connected backend. When an ERP connector is available, approved records write straight to NetSuite or Odoo; when it isn't, the same records land in Google Sheets — no change to the AI logic or approvals.",
    points: [
      "Writes to NetSuite / Odoo when connected",
      "Falls back to Google Sheets automatically",
      "Same workflow logic regardless of backend",
      "Future-ready for TMS, WMS & carrier systems",
    ],
  },
  {
    name: "Reporting Engine",
    icon: BarChart3,
    desc: "KPI generation and executive summaries across delivery, suppliers, and inventory.",
    detail:
      "Turns your operational data into executive-ready reporting on demand. Delivery and supplier performance, inventory trends, and cost analysis are compiled and explained in plain language — ready for leadership to review.",
    points: [
      "Delivery and supplier performance KPIs",
      "Inventory trend and cost analysis",
      "AI-written executive summaries",
      "Leadership-ready exports",
    ],
  },
];

function CoreDiagram() {
  const [selected, setSelected] = useState<CoreCapability | null>(null);
  return (
    <section id="platform" className="border-b border-border/60 py-20">
      <div className="mx-auto max-w-7xl px-5">
        <Reveal className="mx-auto mb-12 flex max-w-2xl flex-col items-center gap-3 text-center">
          <span className="font-mono text-xs uppercase tracking-wider text-primary">
            The logistics core
          </span>
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Every copilot runs on the same logistics operating system.
          </h2>
          <p className="text-sm text-muted-foreground md:text-base">
            Instead of rebuilding the basics for every task, each copilot inherits the same reusable
            building blocks — Eagle Doc, the Logistics AI Engine, the Approval Engine, business
            rules, the Connector Decision Layer, and reporting — already wired together and tuned for
            logistics. Click any block to see what it does.
          </p>
        </Reveal>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-3">
          {CORE_CAPABILITIES.map((s, i) => {
            const Icon = s.icon;
            return (
              <button
                key={s.name}
                type="button"
                onClick={() => setSelected(s)}
                aria-label={`Learn more about ${s.name}`}
                className="group flex h-full flex-col rounded-xl border border-border bg-surface p-5 text-left transition duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 md:p-6"
              >
                <div className="mb-4 flex items-center justify-between">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15 transition group-hover:bg-primary group-hover:text-primary-foreground group-hover:ring-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">0{i + 1}</span>
                </div>
                <div className="text-base font-semibold md:text-[17px]">{s.name}</div>
                <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {s.desc}
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-primary opacity-0 transition group-hover:opacity-100">
                  Learn more
                  <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                </span>
              </button>
            );
          })}
        </div>
      </div>
      {selected && <CoreModal capability={selected} onClose={() => setSelected(null)} />}
    </section>
  );
}

function CoreModal({ capability, onClose }: { capability: CoreCapability; onClose: () => void }) {
  const Icon = capability.icon;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-8 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="core-title"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="nice-scroll max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-surface shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-border p-6">
          <div className="flex items-center gap-4">
            <span className="brand-gradient grid h-12 w-12 shrink-0 place-items-center rounded-xl text-primary-foreground shadow-md shadow-primary/25">
              <Icon className="h-6 w-6" />
            </span>
            <div>
              <span className="font-mono text-[10px] font-medium uppercase tracking-wider text-primary">
                Logistics core
              </span>
              <h3 id="core-title" className="mt-0.5 text-xl font-semibold tracking-tight">
                {capability.name}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 rounded-lg p-2 text-muted-foreground transition hover:bg-surface-2 hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-6 p-6">
          <p className="text-sm leading-relaxed text-foreground/90">{capability.detail}</p>
          <div>
            <div className="mb-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              What it does
            </div>
            <ul className="space-y-2">
              {capability.points.map((p) => (
                <li key={p} className="flex gap-2.5 text-sm text-foreground/90">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  {p}
                </li>
              ))}
            </ul>
          </div>
          <a
            href="#copilots"
            onClick={onClose}
            className="brand-gradient inline-flex w-full items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/25 transition hover:opacity-95"
          >
            See the copilots that use it
          </a>
        </div>
      </div>
    </div>
  );
}

// ---------------- Workflow ----------------

// Adds an `in-view` class the first time the element scrolls into the viewport,
// so CSS-driven reveal/draw animations fire on scroll. No-op re-observes after.
function useInView<T extends HTMLElement>(rootMargin = "0px 0px -12% 0px") {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { rootMargin, threshold: 0.15 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [rootMargin]);
  return { ref, inView };
}

function WorkflowSection({ content }: { content: WorkflowContent }) {
  const workflow = content;
  const heading = useInView<HTMLDivElement>();
  const before = useInView<HTMLDivElement>();
  const after = useInView<HTMLDivElement>();
  const timeline = useInView<HTMLDivElement>();

  return (
    <section
      id="workflow"
      className="relative overflow-hidden border-b border-border/60 bg-surface-2 py-20"
    >
      {/* soft ambient glow behind the section */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-80 w-[46rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl"
      />
      <div className="relative mx-auto max-w-5xl px-5">
        <div
          ref={heading.ref}
          className={cn(
            "reveal mb-12 flex flex-col items-center gap-3 text-center",
            heading.inView && "in-view",
          )}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/5 px-3 py-1 font-mono text-xs uppercase tracking-wider text-primary">
            <Sparkles className="h-3 w-3" /> How it works
          </span>
          <h2 className="max-w-2xl text-3xl font-semibold tracking-tight md:text-4xl">
            {workflow.title}
          </h2>
          <p className="max-w-xl text-sm text-muted-foreground">
            The same six steps every time — AI does the work, your team stays in control.
          </p>
        </div>

        {/* Before → After contrast */}
        <div className="relative mb-16 grid items-stretch gap-4 md:grid-cols-[1fr_auto_1fr]">
          <div
            ref={before.ref}
            className={cn(
              "reveal rounded-2xl border border-border bg-surface/40 p-6 transition duration-300 hover:-translate-y-1 hover:border-border/80",
              before.inView && "in-view",
            )}
          >
            <div className="mb-3 flex items-center gap-2">
              <XCircle className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Before
              </span>
            </div>
            <p className="text-sm text-foreground/80">{workflow.before}</p>
          </div>
          <div className="flex items-center justify-center py-2 md:py-0">
            {/* dashed connector + arrow node */}
            <span
              aria-hidden
              className="absolute left-1/2 hidden h-px w-24 -translate-x-1/2 border-t border-dashed border-border md:block"
            />
            <div className="relative z-10 grid h-11 w-11 place-items-center rounded-full border border-primary/40 bg-background text-primary shadow-[0_0_0_5px_var(--surface-2)]">
              <ArrowRight className="arrow-float h-5 w-5" />
            </div>
          </div>
          <div
            ref={after.ref}
            className={cn(
              "reveal rounded-2xl border border-primary/40 bg-primary/5 p-6 shadow-[0_0_30px_-8px_var(--primary)] transition duration-300 hover:-translate-y-1",
              after.inView && "in-view",
            )}
            style={{ transitionDelay: after.inView ? "120ms" : "0ms" }}
          >
            <div className="mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                After
              </span>
            </div>
            <p className="text-sm text-foreground/90">{workflow.after}</p>
          </div>
        </div>

        {/* Connected step timeline */}
        <div ref={timeline.ref} className="relative">
          {/* far-left vertical rail + terminating arrow */}
          <span
            aria-hidden
            className={cn(
              "rail-draw absolute left-[19px] top-5 bottom-8 w-0.5 bg-gradient-to-b from-primary/50 via-border to-border",
              timeline.inView && "in-view",
            )}
          />

          <ol className="relative space-y-3">
            {workflow.steps.map((s, i) => {
              const Icon = STEP_ICONS[i] ?? Sparkles;
              return (
                <li key={s.label} className="relative flex items-center gap-3">
                  {/* numbered badge sitting on the rail */}
                  <div className="relative z-10 flex w-10 shrink-0 justify-center">
                    <span
                      className={cn(
                        "reveal grid h-8 w-8 place-items-center rounded-full border border-primary/50 bg-background text-xs font-semibold text-primary shadow-[0_0_0_4px_var(--surface-2),0_0_12px_-2px_var(--primary)]",
                        timeline.inView && "in-view",
                      )}
                      style={{ transitionDelay: `${i * 80}ms` }}
                    >
                      {i + 1}
                    </span>
                  </div>
                  {/* connector dot */}
                  <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary/50" />
                  {/* step card */}
                  <div
                    className={cn(
                      "reveal grid flex-1 grid-cols-1 overflow-hidden rounded-xl border border-border/70 bg-gradient-to-br from-surface/70 to-surface-2/50 transition duration-300 hover:-translate-y-0.5 hover:border-primary/30 sm:grid-cols-[minmax(180px,240px)_1fr]",
                      timeline.inView && "in-view",
                    )}
                    style={{ transitionDelay: `${i * 80 + 60}ms` }}
                  >
                    <div className="flex items-center gap-4 px-5 py-4">
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-border bg-background/60 text-muted-foreground">
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="text-[15px] font-semibold text-foreground">{s.label}</span>
                    </div>
                    <div className="flex items-center border-t border-border/60 px-5 py-4 text-sm text-muted-foreground sm:border-l sm:border-t-0">
                      {s.detail}
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}

// Icons for the six-step flow, assigned by position (intake → extract → match →
// validate → approve → post).
const STEP_ICONS: LucideIcon[] = [Mail, FileText, Workflow, Wand2, User, CheckCircle2];

// ---------------- Copilot library (interactive catalog + modal) ----------------

function CopilotLibrary() {
  const [active, setActive] = useState<CopilotGroup | "all">("all");
  const [selected, setSelected] = useState<Copilot | null>(null);

  const items = useMemo(
    () => (active === "all" ? COPILOTS : COPILOTS.filter((c) => c.group === active)),
    [active],
  );

  return (
    <section id="copilots" className="border-b border-border/60 bg-surface-2/40 py-20">
      <div className="mx-auto max-w-7xl px-5">
        <Reveal className="mx-auto mb-10 flex max-w-2xl flex-col items-center gap-2 text-center">
          <span className="font-mono text-xs uppercase tracking-wider text-primary">
            Copilot library
          </span>
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Pick the copilot for the work you want off your plate.
          </h2>
          <p className="text-sm text-muted-foreground">
            Every copilot follows the same shape: it starts on a trigger, handles the busywork with
            AI, and stops for your approval before anything posts. Click any card to see how it
            runs.
          </p>
        </Reveal>

        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-5">
          <div className="flex flex-wrap gap-1.5">
            {COPILOT_GROUPS.map((g) => (
              <CatalogChip
                key={g.slug}
                label={g.label}
                active={active === g.slug}
                onClick={() => setActive(g.slug)}
              />
            ))}
          </div>
          <div className="font-mono text-xs text-muted-foreground">
            Showing <b className="font-medium text-primary">{items.length}</b> of {COPILOTS.length}{" "}
            copilots
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((c) => (
            <button
              key={c.title}
              onClick={() => setSelected(c)}
              className="group flex flex-col gap-3 rounded-2xl border border-border bg-surface p-5 text-left transition hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <span
                  className="font-mono text-[10px] font-medium uppercase tracking-wider"
                  style={{ color: GROUP_META[c.group].accent }}
                >
                  {c.label}
                </span>
                <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" />
              </div>
              <h3 className="text-[17px] font-semibold leading-snug tracking-tight">{c.title}</h3>
              <p className="flex-1 text-sm text-muted-foreground">{c.goal}</p>
              <div className="flex items-center justify-between border-t border-dashed border-border pt-3 font-mono text-[11px] text-muted-foreground">
                <span>{c.persona}</span>
                <span className="flex items-center gap-1 text-primary">
                  <ShieldCheck className="h-3 w-3" />
                  {c.approver}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {selected && <CopilotModal copilot={selected} onClose={() => setSelected(null)} />}
    </section>
  );
}

function CopilotModal({ copilot, onClose }: { copilot: Copilot; onClose: () => void }) {
  const [step, setStep] = useState(0);
  const reduceMotion =
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const accent = GROUP_META[copilot.group].accent;

  // Reveal the run trace line by line so the flow reads as something that
  // actually executes, not a static list.
  useEffect(() => {
    setStep(0);
    if (reduceMotion) {
      setStep(copilot.trace.length);
      return;
    }
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setStep(i);
      if (i >= copilot.trace.length) clearInterval(id);
    }, 340);
    return () => clearInterval(id);
  }, [copilot, reduceMotion]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-8 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="copilot-title"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="nice-scroll max-h-[88vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-border bg-surface shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-border p-6">
          <div>
            <span
              className="font-mono text-[10px] font-medium uppercase tracking-wider"
              style={{ color: accent }}
            >
              {copilot.label}
            </span>
            <h3 id="copilot-title" className="mt-1.5 text-2xl font-semibold tracking-tight">
              {copilot.title}
            </h3>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">{copilot.goal}</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 rounded-lg p-2 text-muted-foreground transition hover:bg-surface-2 hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid gap-0 md:grid-cols-[1fr_320px]">
          {/* Left: explanation */}
          <div className="space-y-6 p-6">
            <div>
              <div className="mb-2 flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                <Zap className="h-3.5 w-3.5" style={{ color: accent }} /> Starts when
              </div>
              <p className="text-sm text-foreground/90">{copilot.trigger}</p>
            </div>

            <div>
              <div className="mb-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                What the AI does
              </div>
              <ul className="space-y-2">
                {copilot.actions.map((a) => (
                  <li key={a} className="flex gap-2.5 text-sm text-foreground/90">
                    <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color: accent }} />
                    {a}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-center gap-2.5 rounded-lg border border-primary/25 bg-primary/5 px-4 py-3 text-sm text-foreground/90">
              <ShieldCheck className="h-4 w-4 shrink-0 text-primary" />
              You stay in control — <b className="font-semibold text-primary">
                {copilot.approver}
              </b>{" "}
              approves before anything posts.
            </div>

            <div>
              <div className="mb-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                What you get
              </div>
              <ul className="grid gap-2 sm:grid-cols-2">
                {copilot.value.map((v) => (
                  <li key={v} className="flex gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {v}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right: live run trace */}
          <div className="border-t border-border bg-surface-2/60 p-6 md:border-l md:border-t-0">
            <div className="mb-3 flex items-center justify-between">
              <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                Live run
              </span>
              <span className="font-mono text-[11px] text-primary">{copilot.runtime}</span>
            </div>
            <div className="space-y-2 font-mono text-[12.5px] leading-relaxed">
              {copilot.trace.map((line, i) => {
                const shown = i < step;
                return (
                  <div
                    key={i}
                    className={cn(
                      "flex items-start gap-2 transition-opacity duration-300",
                      shown ? "opacity-100" : "opacity-0",
                    )}
                  >
                    <TraceIcon kind={line.kind} />
                    <span
                      className={cn(
                        line.kind === "wait" && "text-amber-500 dark:text-amber-400",
                        line.kind === "done" && "font-semibold text-foreground",
                        line.kind === "run" && "text-muted-foreground",
                        line.kind === "ok" && "text-foreground/80",
                      )}
                    >
                      {line.text}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex flex-col gap-2">
              <a
                href="#cta"
                onClick={onClose}
                className="brand-gradient inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/25 transition hover:opacity-95"
              >
                Get this copilot
              </a>
              <button
                onClick={onClose}
                className="inline-flex items-center justify-center rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-medium text-foreground transition hover:border-primary/50"
              >
                Browse more
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TraceIcon({ kind }: { kind: Copilot["trace"][number]["kind"] }) {
  if (kind === "wait")
    return <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500 dark:text-amber-400" />;
  if (kind === "done") return <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />;
  if (kind === "run")
    return <span className="mt-1 h-3.5 w-3.5 shrink-0 text-muted-foreground">▸</span>;
  return <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />;
}

// ---------------- Integration catalog ----------------

function IntegrationCatalog() {
  const [active, setActive] = useState<LandingIntegrationCategory | "all">("all");

  const items = useMemo(
    () =>
      active === "all"
        ? LANDING_INTEGRATIONS
        : LANDING_INTEGRATIONS.filter((i) => i.category === active),
    [active],
  );

  return (
    <section id="integrations" className="border-b border-border/60 py-20">
      <div className="mx-auto max-w-7xl px-5">
        <div className="mb-8 flex flex-col gap-2 text-center">
          <span className="font-mono text-xs uppercase tracking-wider text-primary">
            Integrations
          </span>
          <h2 className="mx-auto max-w-2xl text-3xl font-semibold tracking-tight md:text-4xl">
            16+ enterprise systems your copilots can talk to.
          </h2>
          <p className="mx-auto max-w-2xl text-sm text-muted-foreground">
            Connect once through Nango. Read and act everywhere — no dedicated TMS or WMS required.
          </p>
        </div>

        <div className="mb-8 flex flex-wrap justify-center gap-1.5">
          <CatalogChip label="All" active={active === "all"} onClick={() => setActive("all")} />
          {INTEGRATION_CATEGORIES.map((c) => (
            <CatalogChip key={c} label={c} active={active === c} onClick={() => setActive(c)} />
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {items.map((i) => (
            <div
              key={i.slug}
              className="flex flex-col items-center gap-3 rounded-xl border border-border bg-surface p-5 text-center transition hover:border-primary/50 hover:shadow-sm"
            >
              <IntegrationLogo
                name={i.name}
                domain={i.domain}
                logo={i.logo}
                className="h-12 w-12"
              />
              <div className="min-w-0">
                <div className="text-sm font-medium break-words">{i.name}</div>
                <div className="text-[11px] text-muted-foreground">{i.category}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CatalogChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-surface text-muted-foreground hover:border-primary/40 hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
}

// ---------------- CTA ----------------

function CTASection({ onBookDemo }: { onBookDemo: () => void }) {
  return (
    <section id="cta" className="px-5 py-20">
      <Reveal pop className="mx-auto max-w-6xl">
        <div className="relative overflow-hidden rounded-3xl border border-border shadow-2xl">
          <SectionPhoto src={PHOTOS.truckHighway} icon={Truck} className="absolute inset-0 h-full w-full" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/30" />
          <div className="relative max-w-xl px-6 py-16 md:px-12 md:py-20">
            <span className="font-mono text-xs uppercase tracking-wider text-primary">
              Join thousands moving goods
            </span>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
              Give your operations team back their day.
            </h2>
            <p className="mt-3 text-sm text-muted-foreground md:text-base">
              See how purchase order, shipment tracking, and invoice matching copilots run on your
              own stack — with faster deliveries, smarter routing, and complete visibility.
            </p>
            <button
              onClick={onBookDemo}
              className="brand-gradient mt-7 inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition hover:-translate-y-0.5 hover:opacity-95"
            >
              Get started now
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

// ---------------- Footer ----------------

function Footer() {
  const columns: { title: string; links: string[] }[] = [
    { title: "Product", links: ["Copilots", "Platform", "Integrations", "Security"] },
    { title: "Solutions", links: ["Purchase orders", "Shipment tracking", "Supplier onboarding", "Inventory & warehouse"] },
    { title: "Company", links: ["About", "Customers", "Careers", "Contact"] },
  ];
  return (
    <footer className="border-t border-border bg-surface-2">
      <div className="mx-auto max-w-7xl px-5 py-14">
        <div className="grid gap-10 md:grid-cols-[1.5fr_repeat(3,1fr)]">
          <div>
            <div className="flex items-center">
              <LogoLockup />
            </div>
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              The AI operating system for logistics & supply chain — purchase orders, shipments,
              onboarding, and warehouse operations, with a human in control of every action.
            </p>
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-foreground">
                {col.title}
              </div>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                {col.links.map((l) => (
                  <li key={l}>
                    <a href="#" className="transition hover:text-foreground">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground md:flex-row">
          <div>© {new Date().getFullYear()} Logistics AI OS. All rights reserved.</div>
          <div className="font-mono">The AI operating system for logistics</div>
        </div>
      </div>
    </footer>
  );
}

// ---------------- Auth modal ----------------

function AuthModal({
  onClose,
  onAuthenticated,
}: {
  onClose: () => void;
  onAuthenticated: () => void;
}) {
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [status, setStatus] = useState<null | string>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab" && dialogRef.current) {
        const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    firstFieldRef.current?.focus();
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  useEffect(() => {
    firstFieldRef.current?.focus();
    setStatus(null);
  }, [tab]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-title"
    >
      <div
        ref={dialogRef}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl"
      >
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h2 id="auth-title" className="text-lg font-semibold">
              {tab === "login" ? "Welcome back" : "Create your account"}
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {tab === "login"
                ? "Sign in to your workspace."
                : "Get access to your logistics copilots."}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1 text-muted-foreground hover:bg-surface-2 hover:text-foreground"
          >
            ✕
          </button>
        </div>

        <div className="mb-5 grid grid-cols-2 gap-1 rounded-lg bg-background p-1">
          <button
            onClick={() => setTab("login")}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
              tab === "login" ? "bg-surface text-foreground" : "text-muted-foreground"
            }`}
          >
            Log in
          </button>
          <button
            onClick={() => setTab("signup")}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
              tab === "signup" ? "bg-surface text-foreground" : "text-muted-foreground"
            }`}
          >
            Sign up
          </button>
        </div>

        {status ? (
          <div className="rounded-lg border border-primary/40 bg-primary/5 p-4 text-sm">
            {status}
            <div className="mt-4">
              <button
                onClick={onClose}
                className="w-full rounded-md bg-primary py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
              >
                Close
              </button>
            </div>
          </div>
        ) : tab === "login" ? (
          <LoginForm firstFieldRef={firstFieldRef} onAuthenticated={onAuthenticated} />
        ) : (
          <SignupForm firstFieldRef={firstFieldRef} onAuthenticated={onAuthenticated} />
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="mb-1.5 text-xs font-medium text-muted-foreground">{label}</div>
      {children}
      {error && <div className="mt-1 text-xs text-destructive">{error}</div>}
    </label>
  );
}

const inputCls =
  "w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-1 focus:ring-primary";

function isEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

function LoginForm({
  firstFieldRef,
  onAuthenticated,
}: {
  firstFieldRef: React.RefObject<HTMLInputElement | null>;
  onAuthenticated: () => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: typeof errors = {};
    if (!email) errs.email = "Email is required";
    else if (!isEmail(email)) errs.email = "Enter a valid email";
    if (!password) errs.password = "Password is required";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setLoading(true);
    try {
      await api.login(email, password);
      onAuthenticated(); // navigates into the workspace (/app)
    } catch (err) {
      let msg = "Could not reach the platform. Is the backend running?";
      if (err instanceof ApiError) {
        // The backend replied — show why (bad credentials, no tenant/org, etc.).
        msg = err.status === 401 ? "Invalid email or password." : err.message;
      }
      setErrors({ form: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3" noValidate>
      <Field label="Work email" error={errors.email}>
        <input
          ref={firstFieldRef}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputCls}
          placeholder="you@company.com"
          autoComplete="email"
        />
      </Field>
      <Field label="Password" error={errors.password}>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputCls}
          placeholder="••••••••"
          autoComplete="current-password"
        />
      </Field>
      <div className="flex items-center justify-between">
        <button type="button" className="text-xs text-muted-foreground hover:text-foreground">
          Forgot password?
        </button>
      </div>
      {errors.form && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {errors.form}
        </div>
      )}
      <button
        type="submit"
        disabled={loading}
        className="mt-2 w-full rounded-md bg-primary py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
      >
        {loading ? "Signing in…" : "Log in"}
      </button>
      <div className="relative my-3">
        <div className="absolute inset-0 flex items-center">
          <div className="h-px w-full bg-border" />
        </div>
        <div className="relative text-center">
          <span className="bg-surface px-2 text-[11px] uppercase tracking-wider text-muted-foreground">
            or
          </span>
        </div>
      </div>
      <button
        type="button"
        onClick={() => setErrors({ form: "SSO isn't wired yet — sign in with email + password." })}
        className="w-full rounded-md border border-border bg-background py-2 text-sm font-medium hover:border-primary"
      >
        Continue with SSO
      </button>
    </form>
  );
}

function SignupForm({
  firstFieldRef,
  onAuthenticated,
}: {
  firstFieldRef: React.RefObject<HTMLInputElement | null>;
  onAuthenticated: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "Name is required";
    if (!email) errs.email = "Email is required";
    else if (!isEmail(email)) errs.email = "Enter a valid work email";
    if (!company.trim()) errs.company = "Company is required";
    if (!password || password.length < 8) errs.password = "Password must be at least 8 characters";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setLoading(true);
    try {
      await api.signup({ name, email, company, password });
      onAuthenticated(); // account created + signed in — go straight into /app
    } catch (err) {
      const msg =
        err instanceof ApiError ? err.message : "Could not create your account. Try again.";
      setErrors({ form: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3" noValidate>
      <Field label="Full name" error={errors.name}>
        <input
          ref={firstFieldRef}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputCls}
          placeholder="Ada Lovelace"
        />
      </Field>
      <Field label="Work email" error={errors.email}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputCls}
          placeholder="you@company.com"
          autoComplete="email"
        />
      </Field>
      <Field label="Company" error={errors.company}>
        <input
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          className={inputCls}
          placeholder="Acme LLP"
        />
      </Field>
      <Field label="Password" error={errors.password}>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputCls}
          placeholder="At least 8 characters"
          autoComplete="new-password"
        />
      </Field>
      {errors.form && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {errors.form}
        </div>
      )}
      <button
        type="submit"
        disabled={loading}
        className="mt-2 w-full rounded-md bg-primary py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
      >
        {loading ? "Creating account…" : "Create account"}
      </button>
    </form>
  );
}
