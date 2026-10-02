import { createFileRoute } from "@tanstack/react-router";
import { Wordmark } from "@/components/brand/Logo";
import { PageHeader, Panel } from "@/components/common/ui-bits";
import { Explain } from "@/components/common/Explain";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — FOXWANA" },
      { name: "description", content: "FOXWANA CRT Market Intelligence, created by Fokosa Paul Lekwana, built around Candle Range Theory." },
      { property: "og:title", content: "About FOXWANA" },
      { property: "og:description", content: "The story and Candle Range Theory philosophy behind FOXWANA." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <>
      <PageHeader title="About FOXWANA" description="CRT Market Intelligence" />
      <Panel>
        <Wordmark />
        <p className="mt-4 text-sm text-foreground">
          FOXWANA — CRT Market Intelligence was created by <strong>Fokosa Paul Lekwana</strong>.
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          FOXWANA puts Candle Range Theory at the centre. CRT identifies the opportunity; market structure, liquidity,
          order blocks, fair value gaps, historical reaction areas and fundamentals confirm where and whether to act.
          When the rules are not met, FOXWANA says NO TRADE instead of forcing a direction.
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          FOXWANA analyses and prepares trade plans. It never executes a trade automatically, and nothing it shows is a
          guarantee of profit.
        </p>
      </Panel>
      <div className="grid gap-2 md:grid-cols-2">
        <Explain term="CRT" />
        <Explain term="FVG" />
        <Explain term="OB" />
        <Explain term="SPIKE" />
      </div>
    </>
  );
}
