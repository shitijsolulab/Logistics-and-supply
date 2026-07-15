import { createFileRoute } from "@tanstack/react-router";
import {
  AlertTriangle,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Circle,
  ClipboardCheck,
  ClipboardList,
  Download,
  FileStack,
  FileText,
  PackageCheck,
  Printer,
  ScanLine,
  ScrollText,
  Search,
  Send,
  Share2,
  Sparkles,
  Table2,
  Truck,
  User,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useMemo, useState } from "react";

import { cn } from "../lib/utils";

export const Route = createFileRoute("/app/document-intelligence")({
  component: DocumentIntelligencePage,
});

/* ─────────────────────────  Dummy data (logistics)  ───────────────────────── */

type DocType =
  | "purchase-order"
  | "invoice"
  | "packing-list"
  | "goods-receipt"
  | "delivery-note"
  | "bill-of-lading";
type Tone = "good" | "warn" | "bad" | "neutral";

interface Field {
  label: string;
  value: string;
  confidence: number; // 0-100
}
interface MatchLine {
  item: string;
  source: string;
  qty?: string;
  unitPrice?: string;
  lineTotal?: string;
}
interface DocRisk {
  severity: "low" | "medium" | "high";
  text: string;
}
interface DocActionItem {
  text: string;
  owner: string;
  due: string;
  done: boolean;
}
interface DocumentItem {
  id: string;
  type: DocType;
  title: string;
  vendor: string;
  category: string;
  status: string;
  statusTone: Tone;
  date: string;
  author: string;
  pages: number;
  sizeKb: number;
  amount: string;
  confidence: number; // overall extraction confidence 0-100
  tags: string[];
  previewLines: string[];
  fields: Field[];
  gl?: MatchLine[];
  aiSummary: { text: string; bullets: string[] };
  risks: DocRisk[];
  actionItems: DocActionItem[];
  relatedIds: string[];
}

const docTypeMeta: Record<DocType, { label: string; plural: string }> = {
  "purchase-order": { label: "Purchase Order", plural: "POs" },
  invoice: { label: "Invoice", plural: "Invoices" },
  "packing-list": { label: "Packing List", plural: "Packing Lists" },
  "goods-receipt": { label: "Goods Receipt", plural: "Goods Receipts" },
  "delivery-note": { label: "Delivery Note", plural: "Delivery Notes" },
  "bill-of-lading": { label: "Bill of Lading", plural: "Bills of Lading" },
};

const docTypeIcon: Record<DocType, LucideIcon> = {
  "purchase-order": ClipboardCheck,
  invoice: FileText,
  "packing-list": ClipboardList,
  "goods-receipt": PackageCheck,
  "delivery-note": Truck,
  "bill-of-lading": ScrollText,
};

const docTypeColor: Record<DocType, string> = {
  "purchase-order": "text-amber-500",
  invoice: "text-sky-500",
  "packing-list": "text-violet-500",
  "goods-receipt": "text-emerald-500",
  "delivery-note": "text-primary",
  "bill-of-lading": "text-rose-500",
};

const severityTone: Record<DocRisk["severity"], Tone> = {
  low: "good",
  medium: "warn",
  high: "bad",
};

const documents: DocumentItem[] = [
  {
    id: "po-2214",
    type: "purchase-order",
    title: "PO-2214 — Acme Freight Co.",
    vendor: "Acme Freight Co.",
    category: "Procurement",
    status: "Needs Approval",
    statusTone: "warn",
    date: "Jul 08, 2026",
    author: "Operations Inbox",
    pages: 2,
    sizeKb: 486,
    amount: "$14,280.00",
    confidence: 97,
    tags: ["procurement", "inbound", "DC-West"],
    previewLines: [
      "PURCHASE ORDER",
      "Acme Freight Co. · PO-2214",
      "Ship to: DC-West Warehouse · Incoterms: DAP",
      "Order date: Jul 08, 2026 · Delivery: Jul 22, 2026",
      "LINE ITEMS",
      "Pallet racking — 120 units — $8,400.00",
      "Stretch wrap — 200 rolls — $4,700.00",
      "Freight & handling — $1,180.00",
      "TOTAL COMMITTED",
      "$14,280.00",
    ],
    fields: [
      { label: "Supplier", value: "Acme Freight Co.", confidence: 99 },
      { label: "PO number", value: "PO-2214", confidence: 99 },
      { label: "Order date", value: "Jul 08, 2026", confidence: 98 },
      { label: "Delivery date", value: "Jul 22, 2026", confidence: 97 },
      { label: "Pallet racking", value: "120 units", confidence: 96 },
      { label: "Stretch wrap", value: "200 rolls", confidence: 95 },
      { label: "Unit price (racking)", value: "$70.00", confidence: 94 },
      { label: "Freight", value: "$1,180.00", confidence: 71 },
      { label: "Total", value: "$14,280.00", confidence: 99 },
      { label: "Incoterms", value: "DAP", confidence: 93 },
      { label: "Ship-to warehouse", value: "DC-West", confidence: 95 },
    ],
    gl: [
      { item: "Pallet racking", source: "120 units", qty: "120", unitPrice: "$70.00", lineTotal: "$8,400.00" },
      { item: "Stretch wrap", source: "200 rolls", qty: "200", unitPrice: "$23.50", lineTotal: "$4,700.00" },
      { item: "Freight & handling", source: "1 lot", qty: "1", unitPrice: "$1,180.00", lineTotal: "$1,180.00" },
    ],
    aiSummary: {
      text: "This **purchase order** commits **$14,280.00** to Acme Freight Co. for pallet racking and stretch wrap, shipping DAP to DC-West. Copilot validated the supplier and checked pricing against agreed terms.",
      bullets: [
        "Supplier validated against the approved vendor master.",
        "No duplicate PO found for this supplier in the last 90 days.",
        "Unit pricing is within the agreed rate card tolerance.",
      ],
    },
    risks: [
      { severity: "medium", text: "Freight charge of $1,180.00 is not itemized on the rate card." },
      { severity: "low", text: "Requested delivery date leaves a 3-day buffer before the dock slot." },
    ],
    actionItems: [
      { text: "Confirm freight terms with Acme Freight Co.", owner: "A. Reyes", due: "Jul 12", done: false },
      { text: "Route to Procurement Manager for approval.", owner: "Ops Copilot", due: "Jul 12", done: false },
    ],
    relatedIds: ["gr-4482", "inv-8841"],
  },
  {
    id: "inv-8841",
    type: "invoice",
    title: "INV-8841 — Globex Logistics",
    vendor: "Globex Logistics",
    category: "Accounts Payable",
    status: "Duplicate Flagged",
    statusTone: "bad",
    date: "Jul 09, 2026",
    author: "Operations Inbox",
    pages: 1,
    sizeKb: 312,
    amount: "$6,540.00",
    confidence: 88,
    tags: ["invoice", "duplicate", "3-way match"],
    previewLines: [
      "INVOICE",
      "Globex Logistics · Invoice INV-8841",
      "Bill to: Northwind LLP · Terms: Net 15",
      "Reference PO: PO-8790",
      "Ocean freight — Shanghai to Long Beach",
      "TOTAL DUE",
      "$6,540.00 — due Jul 24, 2026",
    ],
    fields: [
      { label: "Supplier", value: "Globex Logistics", confidence: 98 },
      { label: "Invoice #", value: "INV-8841", confidence: 97 },
      { label: "Invoice date", value: "Jul 09, 2026", confidence: 96 },
      { label: "Due date", value: "Jul 24, 2026", confidence: 95 },
      { label: "PO reference", value: "PO-8790", confidence: 82 },
      { label: "Total due", value: "$6,540.00", confidence: 99 },
      { label: "Terms", value: "Net 15", confidence: 93 },
    ],
    gl: [
      { item: "Ocean freight (invoice)", source: "INV-8841", qty: "1 container", unitPrice: "$6,540.00", lineTotal: "$6,540.00" },
      { item: "Ocean freight (PO)", source: "PO-8790", qty: "1 container", unitPrice: "$6,200.00", lineTotal: "$6,200.00" },
      { item: "Ocean freight (goods receipt)", source: "GR-8790", qty: "1 container", unitPrice: "—", lineTotal: "$6,200.00" },
    ],
    aiSummary: {
      text: "This **invoice** from Globex Logistics for **$6,540.00** closely matches a previously posted invoice and exceeds the PO by $340.00. Copilot flagged it as a **likely duplicate** with a three-way-match variance.",
      bullets: [
        "Amount and supplier match invoice INV-8798 posted on Jun 28, 2026.",
        "Invoice total is $340.00 over PO-8790 and the goods receipt.",
        "Held from the payment run pending human confirmation.",
      ],
    },
    risks: [{ severity: "high", text: "Potential duplicate payment of $6,540.00 if approved without review." }],
    actionItems: [
      { text: "Compare against INV-8798 and confirm with the supplier.", owner: "J. Lin", due: "Jul 11", done: false },
      { text: "Resolve the $340.00 three-way-match variance.", owner: "AP Lead", due: "Jul 11", done: false },
    ],
    relatedIds: ["po-2214"],
  },
  {
    id: "pl-0912",
    type: "packing-list",
    title: "Packing List — SO-0912, Meridian Retail",
    vendor: "Meridian Retail",
    category: "Outbound",
    status: "Matched",
    statusTone: "good",
    date: "Jul 05, 2026",
    author: "Google Drive",
    pages: 1,
    sizeKb: 92,
    amount: "$4,182.00",
    confidence: 93,
    tags: ["outbound", "SKU", "cartons"],
    previewLines: [
      "PACKING LIST",
      "Sales Order SO-0912 · Meridian Retail",
      "Ship from: DC-West · 6 cartons",
      "SKU MRD-100 — 240 units",
      "SKU MRD-205 — 120 units",
      "SKU MRD-330 — 60 units",
      "TOTAL PACKED",
      "420 units · 6 cartons",
    ],
    fields: [
      { label: "Customer", value: "Meridian Retail", confidence: 96 },
      { label: "Sales order", value: "SO-0912", confidence: 97 },
      { label: "SKU MRD-100", value: "240 units", confidence: 95 },
      { label: "SKU MRD-205", value: "120 units", confidence: 92 },
      { label: "SKU MRD-330", value: "60 units", confidence: 88 },
      { label: "Carton count", value: "6", confidence: 99 },
      { label: "Total units", value: "420", confidence: 98 },
    ],
    gl: [
      { item: "SKU MRD-100", source: "Ordered 240", qty: "240 / 240", unitPrice: "$9.00", lineTotal: "$2,160.00" },
      { item: "SKU MRD-205", source: "Ordered 120", qty: "120 / 120", unitPrice: "$12.50", lineTotal: "$1,500.00" },
      { item: "SKU MRD-330", source: "Ordered 60", qty: "60 / 60", unitPrice: "$8.70", lineTotal: "$522.00" },
    ],
    aiSummary: {
      text: "A **packing list** for sales order SO-0912 covering **420 units across 6 cartons** for Meridian Retail. Copilot matched packed quantities against the order line by line.",
      bullets: [
        "All 3 SKUs packed at ordered quantity — no shortfall.",
        "Carton count of 6 matches the manifest.",
        "Ready to generate the delivery note and bill of lading.",
      ],
    },
    risks: [{ severity: "low", text: "SKU MRD-330 confidence is 88% — verify the case count on carton 6." }],
    actionItems: [{ text: "Attach carton photos for the outbound audit trail.", owner: "M. Okafor", due: "Jul 10", done: true }],
    relatedIds: ["dn-118"],
  },
  {
    id: "gr-4482",
    type: "goods-receipt",
    title: "Goods Receipt GR-4482 — Nucor Steel",
    vendor: "Nucor Steel",
    category: "Inbound",
    status: "Received",
    statusTone: "neutral",
    date: "Jul 01, 2026",
    author: "Gmail",
    pages: 2,
    sizeKb: 254,
    amount: "$28,900.00",
    confidence: 96,
    tags: ["inbound", "GRN", "PO-4482"],
    previewLines: [
      "GOODS RECEIPT",
      "GR-4482 · Nucor Steel",
      "Against PO-4482 · Received at DC-West Yard 3",
      "Rebar — 40 tons expected / 39 tons received",
      "Delivery surcharge — $2,900.00",
      "RECEIVED VALUE",
      "$28,900.00",
    ],
    fields: [
      { label: "GRN number", value: "GR-4482", confidence: 99 },
      { label: "Supplier", value: "Nucor Steel", confidence: 98 },
      { label: "PO reference", value: "PO-4482", confidence: 97 },
      { label: "Received at", value: "DC-West Yard 3", confidence: 94 },
      { label: "Expected qty", value: "40 tons", confidence: 96 },
      { label: "Received qty", value: "39 tons", confidence: 90 },
      { label: "Received value", value: "$28,900.00", confidence: 92 },
    ],
    gl: [
      { item: "Rebar", source: "PO-4482", qty: "40 tons", unitPrice: "$650.00", lineTotal: "$26,000.00" },
      { item: "Rebar", source: "GR-4482 received", qty: "39 tons", unitPrice: "$650.00", lineTotal: "$25,350.00" },
      { item: "Delivery surcharge", source: "GR-4482", qty: "1 lot", unitPrice: "$2,900.00", lineTotal: "$2,900.00" },
    ],
    aiSummary: {
      text: "**Goods receipt** GR-4482 records a delivery from Nucor Steel against PO-4482 at DC-West Yard 3. Copilot detected a **1-ton short receipt** versus the PO quantity.",
      bullets: [
        "39 of 40 tons received — a 1-ton (2.5%) shortfall was logged.",
        "Delivery surcharge matches the master supply agreement.",
        "Linked to PO-4482 for downstream invoice matching.",
      ],
    },
    risks: [{ severity: "medium", text: "1-ton short receipt needs a shortage claim before the invoice is paid." }],
    actionItems: [{ text: "Raise a short-shipment claim with Nucor Steel.", owner: "Receiving", due: "Jul 07", done: false }],
    relatedIds: ["po-2214"],
  },
  {
    id: "dn-118",
    type: "delivery-note",
    title: "Delivery Note DN-118 — Meridian Retail",
    vendor: "Meridian Retail",
    category: "Outbound",
    status: "Needs Approval",
    statusTone: "warn",
    date: "Jul 06, 2026",
    author: "R. Danforth",
    pages: 1,
    sizeKb: 240,
    amount: "$4,182.00",
    confidence: 91,
    tags: ["outbound", "POD", "last-mile"],
    previewLines: [
      "DELIVERY NOTE",
      "DN-118 · Meridian Retail",
      "Deliver to: 44 Harbor Rd, Long Beach CA",
      "SKU MRD-100 — 240 units",
      "SKU MRD-205 — 120 units",
      "SKU MRD-330 — 60 units",
      "PROOF OF DELIVERY",
      "Pending signature",
    ],
    fields: [
      { label: "Delivery note", value: "DN-118", confidence: 97 },
      { label: "Customer", value: "Meridian Retail", confidence: 99 },
      { label: "Delivery address", value: "44 Harbor Rd, Long Beach CA", confidence: 95 },
      { label: "Total units", value: "420", confidence: 96 },
      { label: "Cartons", value: "6", confidence: 88 },
      { label: "Carrier", value: "SwiftLine Last-Mile", confidence: 93 },
      { label: "POD status", value: "Pending", confidence: 90 },
    ],
    gl: [
      { item: "SKU MRD-100", source: "Delivered", qty: "240", unitPrice: "$9.00", lineTotal: "$2,160.00" },
      { item: "SKU MRD-205", source: "Delivered", qty: "120", unitPrice: "$12.50", lineTotal: "$1,500.00" },
      { item: "SKU MRD-330", source: "Delivered", qty: "60", unitPrice: "$8.70", lineTotal: "$522.00" },
    ],
    aiSummary: {
      text: "A **delivery note** for DN-118 shipping **420 units** to Meridian Retail in Long Beach. Copilot confirmed the line items against the packing list but the **proof of delivery is still pending**.",
      bullets: [
        "Delivery lines match packing list PL-0912 exactly.",
        "Carrier SwiftLine assigned for last-mile delivery.",
        "POD signature not yet captured from the consignee.",
      ],
    },
    risks: [{ severity: "medium", text: "Proof of delivery is unsigned — cannot close the shipment or invoice." }],
    actionItems: [
      { text: "Chase carrier for the signed POD.", owner: "Ops Desk", due: "Jul 10", done: false },
      { text: "Confirm delivery window with Meridian Retail.", owner: "Ops Desk", due: "Jul 10", done: false },
    ],
    relatedIds: ["pl-0912", "gr-4482"],
  },
  {
    id: "bol-8790",
    type: "bill-of-lading",
    title: "Bill of Lading BOL-8790 — Globex Logistics",
    vendor: "Globex Logistics",
    category: "Inbound",
    status: "In Transit",
    statusTone: "neutral",
    date: "Jun 22, 2026",
    author: "Operations Inbox",
    pages: 2,
    sizeKb: 640,
    amount: "$6,200.00",
    confidence: 94,
    tags: ["ocean", "container", "PO-8790"],
    previewLines: [
      "BILL OF LADING",
      "BOL-8790 · Globex Logistics",
      "Shanghai → Long Beach · 1 x 40ft container",
      "Container: GLBU-4471820",
      "Vessel: MV Northwind · ETA Jul 03, 2026",
      "FREIGHT",
      "$6,200.00 · Incoterms FOB",
    ],
    fields: [
      { label: "BOL number", value: "BOL-8790", confidence: 98 },
      { label: "Carrier", value: "Globex Logistics", confidence: 97 },
      { label: "Container", value: "GLBU-4471820", confidence: 95 },
      { label: "Vessel", value: "MV Northwind", confidence: 92 },
      { label: "Route", value: "Shanghai → Long Beach", confidence: 96 },
      { label: "ETA", value: "Jul 03, 2026", confidence: 90 },
      { label: "Freight", value: "$6,200.00", confidence: 94 },
      { label: "Incoterms", value: "FOB", confidence: 93 },
    ],
    gl: [
      { item: "Ocean freight", source: "BOL-8790", qty: "1 x 40ft", unitPrice: "$6,200.00", lineTotal: "$6,200.00" },
    ],
    aiSummary: {
      text: "**Bill of lading** BOL-8790 covers one 40ft container from Shanghai to Long Beach on MV Northwind under FOB terms. Copilot linked it to PO-8790 and the incoming Globex invoice.",
      bullets: [
        "Container GLBU-4471820 matches the booking confirmation.",
        "ETA of Jul 03 aligns with the DC-West receiving slot.",
        "Freight of $6,200.00 ties to PO-8790 for invoice matching.",
      ],
    },
    risks: [{ severity: "low", text: "Vessel ETA has slipped 2 days from the original booking." }],
    actionItems: [
      { text: "Book the DC-West unloading slot for the revised ETA.", owner: "Inbound Team", due: "Jul 02", done: false },
      { text: "Pre-clear customs paperwork for container GLBU-4471820.", owner: "Inbound Team", due: "Jul 02", done: false },
    ],
    relatedIds: ["inv-8841", "gr-4482"],
  },
];

function getDocumentsByIds(ids: string[]): DocumentItem[] {
  return ids.map((id) => documents.find((d) => d.id === id)).filter((d): d is DocumentItem => Boolean(d));
}

/* ─────────────────────────  Shared helpers  ───────────────────────── */

const PANEL = "rounded-2xl border border-border bg-surface";

function toneBadgeCls(tone: Tone) {
  switch (tone) {
    case "good":
      return "bg-emerald-500/10 border-emerald-500/30 text-emerald-500";
    case "warn":
      return "bg-amber-500/10 border-amber-500/30 text-amber-500";
    case "bad":
      return "bg-destructive/10 border-destructive/30 text-destructive";
    default:
      return "bg-muted border-border text-foreground";
  }
}

function confColor(c: number) {
  return c >= 90 ? "text-emerald-500" : c >= 75 ? "text-amber-500" : "text-destructive";
}
function confBar(c: number) {
  return c >= 90 ? "bg-emerald-500" : c >= 75 ? "bg-amber-500" : "bg-destructive";
}

function SectionHeader({
  icon: Icon,
  title,
  hint,
  right,
}: {
  icon: LucideIcon;
  title: string;
  hint?: string;
  right?: React.ReactNode;
}) {
  return (
    <header className="flex items-center justify-between border-b border-border px-5 py-4">
      <div className="flex items-center gap-2.5">
        <div className="grid h-8 w-8 place-items-center rounded-md border border-border bg-surface-2">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h2 className="text-sm font-semibold">{title}</h2>
          {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
        </div>
      </div>
      {right}
    </header>
  );
}

function ConfidenceRing({ value, size = 44 }: { value: number; size?: number }) {
  const r = (size - 6) / 2;
  const c = 2 * Math.PI * r;
  const off = c * (1 - value / 100);
  const stroke = value >= 90 ? "stroke-emerald-500" : value >= 75 ? "stroke-amber-500" : "stroke-destructive";
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} className="stroke-surface-2" strokeWidth={3} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          className={cn(stroke, "transition-all")}
          strokeWidth={3}
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={off}
          strokeLinecap="round"
        />
      </svg>
      <span className={cn("absolute text-[11px] font-semibold tabular-nums", confColor(value))}>{value}</span>
    </div>
  );
}

/* ─────────────────────────  Page  ───────────────────────── */

function DocumentIntelligencePage() {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | DocType>("all");
  const [selectedId, setSelectedId] = useState<string>(documents[0].id);
  const [aiOpen, setAiOpen] = useState(false);

  const filtered = useMemo(() => {
    let list = documents;
    if (typeFilter !== "all") list = list.filter((d) => d.type === typeFilter);
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (d) =>
          d.title.toLowerCase().includes(q) ||
          d.vendor.toLowerCase().includes(q) ||
          d.category.toLowerCase().includes(q) ||
          d.tags.some((t) => t.toLowerCase().includes(q)),
      );
    }
    return list;
  }, [query, typeFilter]);

  const selected = documents.find((d) => d.id === selectedId) ?? filtered[0] ?? documents[0];

  const totalValue = documents.length;
  const needApproval = documents.filter((d) => d.status.includes("Approval")).length;
  const avgConf = Math.round(documents.reduce((s, d) => s + d.confidence, 0) / documents.length);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
            Document Intelligence
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">Document workspace</h1>
          <p className="mt-1.5 max-w-xl text-sm text-muted-foreground">
            AI reads purchase orders, invoices, packing lists, and shipping docs — extracting clean,
            supply-chain-ready data with a confidence score on every field.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="h-9 rounded-lg border border-border bg-surface px-3.5 text-xs font-medium transition hover:border-primary/50 hover:text-primary">
            Upload document
          </button>
          <button
            onClick={() => setAiOpen((o) => !o)}
            aria-pressed={aiOpen}
            className={cn(
              "inline-flex h-9 items-center gap-1.5 rounded-lg px-3.5 text-xs font-semibold shadow-sm transition",
              aiOpen
                ? "brand-gradient text-primary-foreground shadow-primary/25 hover:opacity-90"
                : "border border-border bg-surface text-foreground hover:border-primary/50 hover:text-primary",
            )}
          >
            <Sparkles className="h-3.5 w-3.5" />
            {aiOpen ? "Hide AI Copilot" : "Ask AI Copilot"}
          </button>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MiniKpi icon={FileStack} label="Indexed" value={String(totalValue)} />
        <MiniKpi icon={ClipboardCheck} label="Need approval" value={String(needApproval)} tone="text-amber-500" />
        <MiniKpi icon={ScanLine} label="Avg. confidence" value={`${avgConf}%`} tone={confColor(avgConf)} />
        <MiniKpi icon={CheckCircle2} label="Auto-matched" value="96%" tone="text-emerald-500" />
      </div>

      {/* Workspace — responsive grid: fixed rail · fluid center · dockable AI panel */}
      <div
        className={cn(
          "grid grid-cols-1 items-start gap-6 lg:gap-8",
          aiOpen
            ? "lg:grid-cols-[272px_minmax(0,1fr)_360px]"
            : "lg:grid-cols-[272px_minmax(0,1fr)]",
        )}
      >
        {/* Left rail — document list */}
        <div className="lg:sticky lg:top-6">
          <DocumentBrowser
            query={query}
            setQuery={setQuery}
            typeFilter={typeFilter}
            setTypeFilter={setTypeFilter}
            documentsList={filtered}
            selectedId={selected.id}
            onSelect={setSelectedId}
          />
        </div>

        {/* Center — the document (primary focus) */}
        <div className="min-w-0 space-y-6">
          <DocumentViewer doc={selected} />
          <ExtractedFieldsCard doc={selected} />
          {selected.gl && <GlCodingCard doc={selected} />}
          <AiSummaryCard doc={selected} />
          <ExtractedRisksCard doc={selected} />
          <ActionItemsCard doc={selected} />
          <RelatedDocumentsCard doc={selected} onSelect={setSelectedId} />
        </div>

        {/* Right — dockable AI copilot */}
        {aiOpen && (
          <div className="min-w-0 lg:sticky lg:top-6">
            <AskAiPanel doc={selected} onClose={() => setAiOpen(false)} />
          </div>
        )}
      </div>

      {/* Floating AI Copilot launcher — opens the dockable panel */}
      {!aiOpen && (
        <button
          type="button"
          onClick={() => setAiOpen(true)}
          aria-label="Open AI Copilot"
          className="brand-gradient group fixed bottom-6 right-6 z-40 inline-flex items-center gap-2 rounded-full py-3 pl-3 pr-4 text-sm font-semibold text-primary-foreground shadow-xl shadow-primary/30 ring-1 ring-white/10 transition hover:-translate-y-0.5 hover:opacity-95"
        >
          <span className="grid h-8 w-8 place-items-center rounded-full bg-white/15">
            <Sparkles className="h-4 w-4" />
          </span>
          <span className="hidden sm:inline">Ask AI Copilot</span>
        </button>
      )}
    </div>
  );
}

function MiniKpi({
  icon: Icon,
  label,
  value,
  tone = "text-foreground",
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  tone?: string;
}) {
  return (
    <div className={cn(PANEL, "flex items-center gap-3 p-3")}>
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <div className="truncate text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
        <div className={cn("text-lg font-semibold tabular-nums", tone)}>{value}</div>
      </div>
    </div>
  );
}

/* ─────────────────────────  Left: Smart Search + Browser  ───────────────────────── */

function DocumentBrowser({
  query,
  setQuery,
  typeFilter,
  setTypeFilter,
  documentsList,
  selectedId,
  onSelect,
}: {
  query: string;
  setQuery: (v: string) => void;
  typeFilter: "all" | DocType;
  setTypeFilter: (v: "all" | DocType) => void;
  documentsList: DocumentItem[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const types: DocType[] = [
    "purchase-order",
    "invoice",
    "packing-list",
    "goods-receipt",
    "delivery-note",
    "bill-of-lading",
  ];

  return (
    <section className={cn(PANEL, "flex max-h-[calc(100vh-7rem)] flex-col overflow-hidden")}>
      <div className="space-y-3 border-b border-border p-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Smart search — supplier, type, tag…"
            className="h-9 w-full rounded-md border border-border bg-surface pl-9 pr-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <FilterChip active={typeFilter === "all"} onClick={() => setTypeFilter("all")}>
            All
          </FilterChip>
          {types.map((t) => (
            <FilterChip key={t} active={typeFilter === t} onClick={() => setTypeFilter(t)}>
              {docTypeMeta[t].plural}
            </FilterChip>
          ))}
        </div>
        <div className="text-[11px] text-muted-foreground">
          {documentsList.length} result{documentsList.length === 1 ? "" : "s"}
        </div>
      </div>
      <ul className="nice-scroll flex-1 divide-y divide-border overflow-y-auto">
        {documentsList.map((d) => {
          const Icon = docTypeIcon[d.type];
          const active = d.id === selectedId;
          return (
            <li key={d.id}>
              <button
                onClick={() => onSelect(d.id)}
                className={cn(
                  "flex w-full gap-3 border-l-2 px-4 py-3 text-left transition-colors",
                  active ? "border-l-primary bg-surface-2" : "border-l-transparent hover:bg-surface-2/60",
                )}
              >
                <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", docTypeColor[d.type])} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{d.title}</div>
                  <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <span className="truncate">{d.vendor}</span>
                    <span>·</span>
                    <span className="font-mono">{d.amount}</span>
                  </div>
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <span
                      className={cn(
                        "inline-block rounded border px-1.5 py-0.5 text-[9px] uppercase tracking-wider",
                        toneBadgeCls(d.statusTone),
                      )}
                    >
                      {d.status}
                    </span>
                    <span className={cn("text-[9px] font-semibold tabular-nums", confColor(d.confidence))}>
                      {d.confidence}%
                    </span>
                  </div>
                </div>
              </button>
            </li>
          );
        })}
        {documentsList.length === 0 && (
          <li className="px-4 py-10 text-center text-sm text-muted-foreground">
            No documents match this search.
          </li>
        )}
      </ul>
    </section>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border text-muted-foreground hover:bg-surface-2 hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

/* ─────────────────────────  Center: Document Viewer  ───────────────────────── */

function DocumentViewer({ doc }: { doc: DocumentItem }) {
  const Icon = docTypeIcon[doc.type];
  return (
    <section className={cn(PANEL, "overflow-hidden")}>
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-border px-5 py-4">
        <div className="flex min-w-0 items-start gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-border bg-surface-2">
            <Icon className={cn("h-5 w-5", docTypeColor[doc.type])} />
          </div>
          <div className="min-w-0">
            <h2 className="text-base font-semibold leading-snug">{doc.title}</h2>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <Building2 className="h-3 w-3" /> {doc.vendor}
              </span>
              <span className="text-border">·</span>
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" /> {doc.author}
              </span>
              <span className="text-border">·</span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" /> {doc.date}
              </span>
              <span className="text-border">·</span>
              <span className="flex items-center gap-1">
                <FileStack className="h-3 w-3" /> {doc.pages}pg · {(doc.sizeKb / 1024).toFixed(1)}MB
              </span>
            </div>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <div className="flex items-center gap-2">
            <ConfidenceRing value={doc.confidence} />
            <div className="hidden sm:block">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Extraction</div>
              <div className={cn("text-xs font-semibold", confColor(doc.confidence))}>confidence</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {[Download, Printer, Share2].map((Btn, i) => (
              <button
                key={i}
                className="grid h-8 w-8 place-items-center rounded-md border border-border text-muted-foreground transition hover:bg-surface-2 hover:text-foreground"
              >
                <Btn className="h-3.5 w-3.5" />
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="bg-surface-2/40 p-6">
        <TextPreview doc={doc} />
      </div>

      <div className="flex flex-wrap items-center gap-1.5 border-t border-border px-5 py-2.5">
        <span
          className={cn(
            "rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wider",
            toneBadgeCls(doc.statusTone),
          )}
        >
          {doc.status}
        </span>
        {doc.tags.map((t) => (
          <span key={t} className="rounded-full border border-border px-2 py-0.5 text-[10px] text-muted-foreground">
            {t}
          </span>
        ))}
      </div>
    </section>
  );
}

function TextPreview({ doc }: { doc: DocumentItem }) {
  return (
    <div className="min-h-[240px] w-full rounded-md border border-border bg-card p-8 shadow-md">
      <div className="mb-4 flex items-center justify-between">
        <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          {docTypeMeta[doc.type].label} · {doc.id.toUpperCase()}
        </div>
        <div className="font-mono text-sm font-semibold text-primary">{doc.amount}</div>
      </div>
      <div className="space-y-3">
        {doc.previewLines.map((line, i) => {
          const isHeading = line === line.toUpperCase() && line.length < 40;
          return (
            <p
              key={i}
              className={
                isHeading
                  ? "pt-2 text-xs font-semibold tracking-wider text-primary"
                  : "text-sm leading-relaxed text-foreground/90"
              }
            >
              {line}
            </p>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────────────────────  Extracted Fields  ───────────────────────── */

function ExtractedFieldsCard({ doc }: { doc: DocumentItem }) {
  const low = doc.fields.filter((f) => f.confidence < 80).length;
  return (
    <section className={cn(PANEL, "overflow-hidden")}>
      <SectionHeader
        icon={ScanLine}
        title="Extracted Fields"
        hint={`${doc.fields.length} fields · ${low} need review`}
        right={
          <span className="rounded-full border border-border bg-surface-2 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            OCR + AI
          </span>
        }
      />
      <div className="grid grid-cols-1 gap-x-8 gap-y-4 p-5 sm:grid-cols-2 xl:grid-cols-3">
        {doc.fields.map((f) => (
          <div key={f.label} className="min-w-0">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-[11px] uppercase tracking-wide text-muted-foreground">{f.label}</span>
              <span className={cn("text-[10px] font-semibold tabular-nums", confColor(f.confidence))}>
                {f.confidence}%
              </span>
            </div>
            <div className="mt-0.5 truncate text-sm font-medium text-foreground">{f.value}</div>
            <div className="mt-1 h-1 overflow-hidden rounded-full bg-surface-2">
              <div className={cn("h-full rounded-full", confBar(f.confidence))} style={{ width: `${f.confidence}%` }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─────────────────────────  GL Coding  ───────────────────────── */

function GlCodingCard({ doc }: { doc: DocumentItem }) {
  if (!doc.gl) return null;
  return (
    <section className={cn(PANEL, "overflow-hidden")}>
      <SectionHeader icon={Table2} title="Line-Item Validation" hint="Three-way match — review before approval" />
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-[10px] uppercase tracking-wider text-muted-foreground">
              <th className="px-5 py-2 font-medium">Item</th>
              <th className="px-5 py-2 font-medium">Source</th>
              <th className="px-5 py-2 text-right font-medium">Qty</th>
              <th className="px-5 py-2 text-right font-medium">Unit price</th>
              <th className="px-5 py-2 text-right font-medium">Line total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {doc.gl.map((l, i) => (
              <tr key={i}>
                <td className="px-5 py-2 font-medium">{l.item}</td>
                <td className="px-5 py-2 font-mono text-xs text-muted-foreground">{l.source}</td>
                <td className="px-5 py-2 text-right font-mono tabular-nums">{l.qty ?? "—"}</td>
                <td className="px-5 py-2 text-right font-mono tabular-nums">{l.unitPrice ?? "—"}</td>
                <td className="px-5 py-2 text-right font-mono tabular-nums">{l.lineTotal ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/* ─────────────────────────  AI Summary  ───────────────────────── */

function renderBold(text: string) {
  return text.split(/(\*\*.+?\*\*)/g).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-primary">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

function AiSummaryCard({ doc }: { doc: DocumentItem }) {
  return (
    <section className={cn(PANEL, "overflow-hidden")}>
      <SectionHeader icon={Sparkles} title="AI Summary" hint="Synthesized directly from this document" />
      <div className="p-5">
        <p className="text-sm leading-relaxed">{renderBold(doc.aiSummary.text)}</p>
        <ul className="mt-3 space-y-1.5">
          {doc.aiSummary.bullets.map((b, i) => (
            <li key={i} className="flex gap-2 text-xs leading-relaxed text-foreground/90">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ─────────────────────────  Extracted Risks  ───────────────────────── */

function ExtractedRisksCard({ doc }: { doc: DocumentItem }) {
  return (
    <section className={cn(PANEL, "overflow-hidden")}>
      <SectionHeader
        icon={AlertTriangle}
        title="Extracted Risks"
        hint={`${doc.risks.length} risk signal(s) found by Copilot`}
      />
      <ul className="divide-y divide-border">
        {doc.risks.map((r, i) => (
          <li key={i} className="flex items-start gap-3 px-5 py-3">
            <span
              className={cn(
                "mt-0.5 shrink-0 rounded border px-1.5 py-0.5 text-[9px] uppercase tracking-wider",
                toneBadgeCls(severityTone[r.severity]),
              )}
            >
              {r.severity}
            </span>
            <p className="text-xs leading-relaxed text-foreground/90">{r.text}</p>
          </li>
        ))}
        {doc.risks.length === 0 && (
          <li className="px-5 py-6 text-center text-xs text-muted-foreground">
            No risks were extracted from this document.
          </li>
        )}
      </ul>
    </section>
  );
}

/* ─────────────────────────  Action Items  ───────────────────────── */

function ActionItemsCard({ doc }: { doc: DocumentItem }) {
  const [done, setDone] = useState<Set<number>>(
    () => new Set(doc.actionItems.map((a, i) => (a.done ? i : -1)).filter((i) => i >= 0)),
  );

  return (
    <section className={cn(PANEL, "overflow-hidden")}>
      <SectionHeader icon={CheckCircle2} title="Action Items" hint="Tracked to closure by Copilot" />
      <ul className="divide-y divide-border">
        {doc.actionItems.map((a, i) => {
          const isDone = done.has(i);
          return (
            <li key={i} className="flex items-start gap-3 px-5 py-3">
              <button
                onClick={() =>
                  setDone((s) => {
                    const next = new Set(s);
                    if (next.has(i)) next.delete(i);
                    else next.add(i);
                    return next;
                  })
                }
                className="mt-0.5 shrink-0"
                aria-label={isDone ? "Mark as not done" : "Mark as done"}
              >
                {isDone ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                ) : (
                  <Circle className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                )}
              </button>
              <div className="min-w-0 flex-1">
                <p className={cn("text-sm", isDone ? "text-muted-foreground line-through" : "text-foreground/90")}>
                  {a.text}
                </p>
                <div className="mt-0.5 text-[11px] text-muted-foreground">
                  {a.owner} · Due {a.due}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/* ─────────────────────────  Related Documents  ───────────────────────── */

function RelatedDocumentsCard({ doc, onSelect }: { doc: DocumentItem; onSelect: (id: string) => void }) {
  const related = getDocumentsByIds(doc.relatedIds);
  return (
    <section className={cn(PANEL, "overflow-hidden")}>
      <SectionHeader icon={FileStack} title="Related Documents" hint="Linked by vendor and category" />
      <div className="grid grid-cols-1 gap-2.5 p-4 md:grid-cols-3">
        {related.map((r) => {
          const Icon = docTypeIcon[r.type];
          return (
            <button
              key={r.id}
              onClick={() => onSelect(r.id)}
              className="rounded-lg border border-border bg-surface-2/40 p-3 text-left transition hover:-translate-y-0.5 hover:border-primary/40"
            >
              <Icon className={cn("h-4 w-4", docTypeColor[r.type])} />
              <div className="mt-2 line-clamp-2 text-xs font-medium leading-snug">{r.title}</div>
              <div className="mt-1 truncate text-[10px] text-muted-foreground">{r.vendor}</div>
            </button>
          );
        })}
        {related.length === 0 && (
          <div className="col-span-full py-4 text-center text-sm text-muted-foreground">
            No related documents found for this item.
          </div>
        )}
      </div>
    </section>
  );
}

/* ─────────────────────────  Right: Ask AI About This Document  ───────────────────────── */

interface AssistantMsg {
  role: "user" | "assistant";
  text: string;
}

function AskAiPanel({ doc, onClose }: { doc: DocumentItem; onClose?: () => void }) {
  const [messages, setMessages] = useState<AssistantMsg[]>([]);
  const [input, setInput] = useState("");

  const reply = (q: string): string => {
    const p = q.toLowerCase();
    if (p.includes("risk"))
      return doc.risks.length
        ? `${doc.risks.length} risk(s) found: ${doc.risks.map((r) => r.text).join(" ")}`
        : "No risks were extracted from this document.";
    if (p.includes("action") || p.includes("todo") || p.includes("next"))
      return `${doc.actionItems.length} action item(s): ${doc.actionItems
        .map((a) => `${a.text} (owner: ${a.owner}, due ${a.due})`)
        .join(" ")}`;
    if (p.includes("match") || p.includes("line") || p.includes("validation") || p.includes("item"))
      return doc.gl
        ? `Line-item validation: ${doc.gl
            .map((l) => `${l.item} [${l.source}] ${l.qty ?? "—"} @ ${l.unitPrice ?? "—"} = ${l.lineTotal ?? "—"}`)
            .join("; ")}.`
        : "No line-item validation was generated for this document type.";
    if (p.includes("amount") || p.includes("total") || p.includes("how much"))
      return `The total on this ${docTypeMeta[doc.type].label.toLowerCase()} is ${doc.amount}.`;
    if (p.includes("confidence") || p.includes("sure") || p.includes("accurate"))
      return `Overall extraction confidence is ${doc.confidence}%. Lowest-confidence field: ${
        doc.fields.reduce((a, b) => (b.confidence < a.confidence ? b : a)).label
      }.`;
    if (p.includes("summary") || p.includes("about") || p.includes("what is"))
      return doc.aiSummary.text.replace(/\*\*/g, "");
    if (p.includes("related") || p.includes("similar"))
      return `Related documents: ${
        getDocumentsByIds(doc.relatedIds)
          .map((r) => r.title)
          .join(", ") || "none found"
      }.`;
    if (p.includes("status"))
      return `This document is currently "${doc.status}", last touched ${doc.date} by ${doc.author}.`;
    return doc.aiSummary.text.replace(/\*\*/g, "");
  };

  const send = (text?: string) => {
    const q = (text ?? input).trim();
    if (!q) return;
    setMessages((m) => [...m, { role: "user", text: q }, { role: "assistant", text: reply(q) }]);
    setInput("");
  };

  const suggestions = ["Summarize this", "Any risks?", "Show the line-item match", "How confident are you?"];

  return (
    <section className={cn(PANEL, "flex max-h-[calc(100vh-7rem)] flex-col overflow-hidden")}>
      <SectionHeader
        icon={Sparkles}
        title="Ask AI About This Document"
        hint={doc.title}
        right={
          onClose ? (
            <button
              onClick={onClose}
              aria-label="Close AI Copilot"
              className="shrink-0 rounded-lg p-1.5 text-muted-foreground transition hover:bg-surface-2 hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          ) : undefined
        }
      />
      <div className="nice-scroll flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 && (
          <div className="space-y-2">
            <p className="text-xs leading-relaxed text-muted-foreground">
              Ask Copilot anything about{" "}
              <span className="font-medium text-foreground">{doc.title}</span> — try one of these:
            </p>
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="flex w-full items-center justify-between rounded-md border border-border px-3 py-2 text-left text-xs transition-colors hover:border-primary/40 hover:bg-surface-2"
              >
                {s}
                <ChevronRight className="h-3 w-3 text-muted-foreground" />
              </button>
            ))}
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
            <div
              className={cn(
                "max-w-[90%] rounded-lg px-3 py-2 text-xs leading-relaxed",
                m.role === "user"
                  ? "rounded-tr-sm bg-primary text-primary-foreground"
                  : "rounded-tl-sm border border-border bg-surface-2",
              )}
            >
              {m.text}
            </div>
          </div>
        ))}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        className="flex items-center gap-2 border-t border-border p-3"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about this document…"
          className="h-9 flex-1 rounded-md border border-border bg-surface px-3 text-xs outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="brand-gradient grid h-9 w-9 shrink-0 place-items-center rounded-md text-primary-foreground shadow-sm shadow-primary/25 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Send className="h-3.5 w-3.5" />
        </button>
      </form>
    </section>
  );
}
