import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CatalogItemEditor,
  CreateCatalogItemForm,
  SeedCatalogButton,
  type CatalogItemView,
} from "@/components/admin/CatalogManager";
import {
  KeywordRuleEditor,
  CreateKeywordRuleForm,
  ImportKeywordRulesForm,
  type KeywordRuleView,
} from "@/components/admin/KeywordRulesManager";
import { listCatalogItems, listKeywordRules } from "@/lib/db/queries";
import { keywordRuleMap } from "@/lib/keywords";
import { Wrench, BookMarked } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Equipment Catalogue",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

/** Display order of the groups (weapons follow the book's chapters). */
const GROUPS: { key: string; title: string }[] = [
  { key: "weapon:basic", title: "Basic Weapons" },
  { key: "weapon:pistol", title: "Pistols" },
  { key: "weapon:special", title: "Special Weapons" },
  { key: "weapon:heavy", title: "Heavy Weapons" },
  { key: "weapon:close_combat", title: "Close Combat Weapons" },
  { key: "weapon:grenade", title: "Grenades" },
  { key: "weapon:", title: "Other Weapons" },
  { key: "armour", title: "Armour" },
  { key: "wargear", title: "Personal Equipment (Wargear)" },
  { key: "upgrade", title: "Upgrades" },
  { key: "skill", title: "Skills (legacy)" },
];

function groupKey(item: CatalogItemView): string {
  return item.category === "weapon"
    ? `weapon:${item.subcategory ?? ""}`
    : item.category;
}

export default async function CatalogAdminPage() {
  const [items, keywordRulesRows] = (await Promise.all([
    listCatalogItems(),
    listKeywordRules(),
  ])) as [CatalogItemView[], KeywordRuleView[]];
  const rulesMap = keywordRuleMap(keywordRulesRows);

  const byGroup = new Map<string, CatalogItemView[]>();
  for (const item of items) {
    const key = groupKey(item);
    const list = byGroup.get(key) ?? [];
    list.push(item);
    byGroup.set(key, list);
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8">
        <div className="flex flex-wrap items-center gap-3">
          <Wrench className="h-6 w-6 text-hazard" aria-hidden />
          <h1 className="stencil text-2xl font-bold text-ink">
            Equipment Catalogue
          </h1>
          <Badge variant="hazard">{items.length} items</Badge>
          <div className="ml-auto flex gap-2">
            <Link href="/admin">
              <Button variant="ghost">Accounts →</Button>
            </Link>
            <Link href="/admin/campaign">
              <Button variant="ghost">Campaign Panel →</Button>
            </Link>
          </div>
        </div>

        <p className="text-sm text-muted">
          The master list of the Trading Post (Core Rulebook 2023). Players
          and the Arbitrator pick gear from here; each acquisition SNAPSHOTS
          name and cost, so editing or rebalancing an item never changes gear
          a fighter already carries.
        </p>

        {items.length === 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Empty catalogue</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-3 text-sm text-muted">
                Load the official Core Rulebook items to start (you can edit
                every value afterwards), or create items one by one below.
              </p>
              <SeedCatalogButton />
            </CardContent>
          </Card>
        )}

        {GROUPS.map(({ key, title }) => {
          const group = byGroup.get(key);
          if (!group || group.length === 0) return null;
          return (
            <Card key={key}>
              <CardHeader>
                <CardTitle>{title}</CardTitle>
                <span className="ml-auto text-xs text-muted">
                  {group.length} item{group.length === 1 ? "" : "s"}
                </span>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                {group.map((item) => (
                  <CatalogItemEditor
                    key={item.id}
                    item={item}
                    keywordRules={rulesMap}
                  />
                ))}
              </CardContent>
            </Card>
          );
        })}

        {/* ── Keyword glossary (issue #67 follow-up) ─────────────────────
            Rewritten rule summaries stored ONLY in the private database —
            the public repo ships no rule content. */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookMarked className="h-4 w-4 text-hazard" aria-hidden />
              Keyword rules ({keywordRulesRows.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="text-sm text-muted">
              Clickable keywords shown on traits across the app. Summaries
              must be written in YOUR OWN words (function preserved, never
              book text) — they live only in the database, never in the
              public repository.
            </p>
            {keywordRulesRows.length > 0 && (
              <div className="flex flex-col gap-2">
                {keywordRulesRows.map((rule) => (
                  <KeywordRuleEditor key={rule.id} rule={rule} />
                ))}
              </div>
            )}
            <details>
              <summary className="cursor-pointer py-1 font-mono text-xs uppercase tracking-wider text-muted transition-colors hover:text-hazard">
                Add keyword
              </summary>
              <div className="mt-3 border-t border-rivet/50 pt-4">
                <CreateKeywordRuleForm />
              </div>
            </details>
            <details>
              <summary className="cursor-pointer py-1 font-mono text-xs uppercase tracking-wider text-muted transition-colors hover:text-hazard">
                Import from JSON (private file)
              </summary>
              <div className="mt-3 border-t border-rivet/50 pt-4">
                <ImportKeywordRulesForm />
              </div>
            </details>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>New item</CardTitle>
            <span className="ml-auto text-xs text-muted">
              custom gear, house rules, missing official items
            </span>
          </CardHeader>
          <CardContent>
            <CreateCatalogItemForm />
          </CardContent>
        </Card>

        {items.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Official seed</CardTitle>
            </CardHeader>
            <CardContent>
              <SeedCatalogButton />
            </CardContent>
          </Card>
        )}
      </main>
    </>
  );
}
