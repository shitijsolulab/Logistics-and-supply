import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowLeft,
  BookOpen,
  ClipboardCheck,
  Clock,
  FileText,
  Landmark,
  Receipt,
  ScrollText,
  Search,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useMemo, useState } from "react";

import { cn } from "../lib/utils";

export const Route = createFileRoute("/app/knowledge")({ component: Knowledge });

/* ─────────────────────────  Knowledge base (dummy data)  ───────────────────────── */

type Category =
  | "Procurement"
  | "Shipment & Delivery"
  | "Inventory & Warehouse"
  | "Supplier Management"
  | "Operations & SOPs";

const CATEGORIES: Category[] = [
  "Procurement",
  "Shipment & Delivery",
  "Inventory & Warehouse",
  "Supplier Management",
  "Operations & SOPs",
];

type Section = { heading: string; body: string; bullets?: string[] };

type Article = {
  id: string;
  title: string;
  category: Category;
  icon: LucideIcon;
  excerpt: string;
  readMin: number;
  updated: string;
  tags: string[];
  sections: Section[];
};

const ARTICLES: Article[] = [
  {
    id: "three-way-match",
    title: "Three-way match: how invoices are validated",
    category: "Procurement",
    icon: ClipboardCheck,
    excerpt:
      "How a supplier invoice is matched to its purchase order and goods receipt before it's cleared for payment — and what to do when a line doesn't match.",
    readMin: 4,
    updated: "Jul 08, 2026",
    tags: ["invoice", "matching", "procurement"],
    sections: [
      {
        heading: "What a three-way match is",
        body: "A three-way match compares three documents before a supplier invoice is approved for payment: the supplier invoice, the purchase order (PO) that authorized the buy, and the goods receipt confirming what actually arrived at the dock.",
      },
      {
        heading: "What the copilot checks",
        body: "For each invoice line, the copilot verifies quantity, unit price, and line total against the PO and the goods receipt, then flags anything outside tolerance.",
        bullets: [
          "Quantity billed ≤ quantity received",
          "Unit price matches the PO within tolerance",
          "Line and invoice totals recalculate correctly",
          "No duplicate invoice number for the supplier",
          "Freight and duties are expected for the ship-to location",
        ],
      },
      {
        heading: "When a line doesn't match",
        body: "Mismatches are grouped as exceptions with a plain-language reason. Common cases: freight not on the PO, a partial or short shipment, or a price change since the PO was cut. Resolve by confirming with procurement or the supplier, then re-run the match.",
      },
    ],
  },
  {
    id: "po-processing",
    title: "Purchase order processing, end to end",
    category: "Procurement",
    icon: ScrollText,
    excerpt:
      "The standard sequence for turning an inbound supplier PO into a validated, approved order in your ERP.",
    readMin: 6,
    updated: "Jul 01, 2026",
    tags: ["purchase-order", "procurement", "checklist"],
    sections: [
      {
        heading: "How a PO arrives",
        body: "Suppliers email the PO as a PDF or attachment. Eagle Doc extracts the header and line items — supplier, PO number, SKUs, quantities, unit prices, and requested dates — into structured data the copilot can validate.",
      },
      {
        heading: "The core checklist",
        body: "Work the steps in order — each depends on the one before it.",
        bullets: [
          "Extract PO fields with Eagle Doc",
          "Validate the supplier against the supplier master",
          "Check pricing against the agreed price list",
          "Screen for a duplicate PO number",
          "Route to procurement for approval",
          "Create the order in the connected system",
        ],
      },
      {
        heading: "Where the order is created",
        body: "The connector-decision layer writes the approved order to NetSuite or Odoo when an ERP is connected; if none is connected, it appends the order to the configured Google Sheet so nothing is lost.",
      },
      {
        heading: "Tracking what's outstanding",
        body: "The copilot reports blockers in real time — an unknown supplier, an off-contract price, or an unsigned approval — so nothing posts to the ERP before it's cleared.",
      },
    ],
  },
  {
    id: "shipment-tracking",
    title: "Shipment tracking & ETA prediction SOP",
    category: "Shipment & Delivery",
    icon: FileText,
    excerpt:
      "How live shipment data is retrieved, an ETA is predicted, and delays are surfaced to customers and operations.",
    readMin: 5,
    updated: "Jun 24, 2026",
    tags: ["shipment", "tracking", "SOP"],
    sections: [
      {
        heading: "Retrieve shipment data",
        body: "The copilot pulls the latest status, location, and milestone events from the carrier or forwarder for each active shipment, then reconciles them against the order and expected transit lane.",
      },
      {
        heading: "Predict the ETA",
        body: "Using origin, destination, carrier performance, and current position, the copilot predicts an arrival window and compares it to the promised date.",
        bullets: [
          "Detect delays and exceptions against the plan",
          "Run route risk analysis for weather, ports, and customs",
          "Recompute the ETA as new milestones arrive",
        ],
      },
      {
        heading: "Notify and escalate",
        body: "When an ETA slips or an exception is detected, the copilot notifies the customer and operations with the revised window and the reason, so the right people can act before the miss becomes a complaint.",
      },
    ],
  },
  {
    id: "delivery-exceptions",
    title: "Handling delivery exceptions",
    category: "Shipment & Delivery",
    icon: Landmark,
    excerpt:
      "How delays, wrong addresses, and failed deliveries are detected, classified, and driven to resolution.",
    readMin: 4,
    updated: "Jul 02, 2026",
    tags: ["delivery", "exception", "operations"],
    sections: [
      {
        heading: "Detection",
        body: "The copilot watches milestone events for signs of trouble — a stalled shipment, a bad or incomplete address, or a failed delivery attempt — and opens an exception the moment one appears.",
      },
      {
        heading: "Classify and correct",
        body: "Each exception is classified and paired with a corrective action so operations know exactly what to do.",
        bullets: [
          "Delay: confirm new ETA and reschedule if needed",
          "Wrong address: correct with the customer and re-dispatch",
          "Failed delivery: arrange redelivery or pickup",
        ],
      },
      {
        heading: "Keep everyone informed",
        body: "The customer is kept informed at each step, and the resolution is written back to the connected ERP — or to the configured Google Sheet if no ERP is connected — so the order record stays accurate.",
      },
    ],
  },
  {
    id: "inventory-monitoring",
    title: "Inventory monitoring & replenishment",
    category: "Inventory & Warehouse",
    icon: Wallet,
    excerpt: "How low-stock, overstock, and slow-moving items are detected and turned into reorder recommendations.",
    readMin: 3,
    updated: "Jun 30, 2026",
    tags: ["inventory", "replenishment", "warehouse"],
    sections: [
      {
        heading: "What the copilot watches",
        body: "The copilot monitors on-hand quantities against reorder points and demand, flagging items that need attention before they cause a stockout or tie up working capital.",
      },
      {
        heading: "Signals it detects",
        body: "Each SKU is classified so the right action is obvious.",
        bullets: [
          "Low stock below the reorder point",
          "Overstock above the target ceiling",
          "Slow-moving items with little recent demand",
        ],
      },
      {
        heading: "Recommendations and alerts",
        body: "For low-stock items the copilot computes a reorder quantity from lead time and demand, then sends a Slack alert to procurement with the recommendation so a buyer can approve and raise the PO.",
      },
    ],
  },
  {
    id: "supplier-onboarding",
    title: "Supplier onboarding & document validation",
    category: "Supplier Management",
    icon: Receipt,
    excerpt: "The documentation and checks required before a new supplier can be transacted with.",
    readMin: 4,
    updated: "Jul 05, 2026",
    tags: ["supplier", "onboarding", "compliance"],
    sections: [
      {
        heading: "Collect registration",
        body: "New suppliers submit their details through a Google Form — legal name, tax registration, banking details, and supporting documents — which lands as structured data for the copilot to validate.",
      },
      {
        heading: "Validate and screen",
        body: "The copilot validates the submitted documents and runs the required checks before a record is created.",
        bullets: [
          "Verify tax documents and registration numbers",
          "Confirm banking details are complete and consistent",
          "Run a duplicate-supplier check against the master",
          "Score supplier risk with an AI assessment",
        ],
      },
      {
        heading: "Create the supplier record",
        body: "Once checks pass, the copilot drafts the supplier record and writes it to the connected ERP — or to the configured Google Sheet if none is connected — for a final human approval before the supplier becomes active.",
      },
    ],
  },
];

/* ─────────────────────────  Page  ───────────────────────── */

function Knowledge() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category | "all">("all");
  const [openId, setOpenId] = useState<string | null>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ARTICLES.filter((a) => {
      const matchesCat = category === "all" || a.category === category;
      const matchesQ =
        !q ||
        a.title.toLowerCase().includes(q) ||
        a.excerpt.toLowerCase().includes(q) ||
        a.tags.some((t) => t.toLowerCase().includes(q));
      return matchesCat && matchesQ;
    });
  }, [query, category]);

  const open = openId ? ARTICLES.find((a) => a.id === openId) ?? null : null;

  if (open) {
    const related = ARTICLES.filter((a) => a.category === open.category && a.id !== open.id).slice(0, 3);
    return <ArticleReader article={open} related={related} onBack={() => setOpenId(null)} onOpen={setOpenId} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          <BookOpen className="h-3.5 w-3.5 text-primary" />
          Knowledge Base
        </div>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
          Logistics knowledge base
        </h1>
        <p className="mt-1.5 max-w-xl text-sm text-muted-foreground">
          Policies, SOPs, and how-to guides for your procurement, shipment, inventory, and supplier workflows.
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-xl">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search articles, policies, and SOPs…"
          className="w-full rounded-lg border border-border bg-surface py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-1.5">
        <Chip label="All" active={category === "all"} onClick={() => setCategory("all")} />
        {CATEGORIES.map((c) => (
          <Chip key={c} label={c} active={category === c} onClick={() => setCategory(c)} />
        ))}
      </div>

      {/* Results */}
      {results.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border py-16 text-center">
          <div className="grid h-11 w-11 place-items-center rounded-full bg-muted text-muted-foreground">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">No articles found</p>
            <p className="mt-1 text-sm text-muted-foreground">Nothing matches “{query}”.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((a) => (
            <ArticleCard key={a.id} article={a} onOpen={() => setOpenId(a.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1 text-xs font-medium transition",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-surface text-muted-foreground hover:border-primary/40 hover:text-foreground",
      )}
    >
      {label}
    </button>
  );
}

function ArticleCard({ article, onOpen }: { article: Article; onOpen: () => void }) {
  const Icon = article.icon;
  return (
    <button
      onClick={onOpen}
      className="group flex h-full flex-col rounded-2xl border border-border bg-card p-5 text-left transition hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-sm"
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15">
          <Icon className="h-4 w-4" />
        </span>
        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          {article.category}
        </span>
      </div>
      <h3 className="text-[15px] font-semibold leading-snug text-foreground">{article.title}</h3>
      <p className="mt-1.5 flex-1 text-sm text-muted-foreground">{article.excerpt}</p>
      <div className="mt-4 flex items-center gap-3 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" /> {article.readMin} min read
        </span>
        <span>Updated {article.updated}</span>
      </div>
    </button>
  );
}

/* ─────────────────────────  Article reader  ───────────────────────── */

function ArticleReader({
  article,
  related,
  onBack,
  onOpen,
}: {
  article: Article;
  related: Article[];
  onBack: () => void;
  onOpen: (id: string) => void;
}) {
  const Icon = article.icon;
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to knowledge base
      </button>

      {/* Article header */}
      <div>
        <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.18em] text-primary">
          <Icon className="h-3.5 w-3.5" />
          {article.category}
        </div>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
          {article.title}
        </h1>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" /> {article.readMin} min read
          </span>
          <span>Updated {article.updated}</span>
          <div className="flex flex-wrap gap-1.5">
            {article.tags.map((t) => (
              <span key={t} className="rounded-full border border-border px-2 py-0.5 text-[10px] text-muted-foreground">
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Body */}
      <article className="space-y-6 rounded-2xl border border-border bg-card p-6">
        {article.sections.map((s) => (
          <section key={s.heading}>
            <h2 className="text-sm font-semibold text-foreground">{s.heading}</h2>
            <p className="mt-2 text-sm leading-relaxed text-foreground/90">{s.body}</p>
            {s.bullets && (
              <ul className="mt-3 space-y-1.5">
                {s.bullets.map((b) => (
                  <li key={b} className="flex gap-2 text-sm text-foreground/90">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </article>

      {/* Related */}
      {related.length > 0 && (
        <div>
          <h2 className="mb-3 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Related in {article.category}
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {related.map((r) => {
              const RIcon = r.icon;
              return (
                <button
                  key={r.id}
                  onClick={() => onOpen(r.id)}
                  className="rounded-xl border border-border bg-surface p-4 text-left transition hover:-translate-y-0.5 hover:border-primary/40"
                >
                  <RIcon className="h-4 w-4 text-primary" />
                  <div className="mt-2 text-sm font-medium leading-snug text-foreground">{r.title}</div>
                  <div className="mt-1 text-[11px] text-muted-foreground">{r.readMin} min read</div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
