import {
  BarChart3,
  Brain,
  Database,
  FileText,
  Home,
  LineChart,
  Lock,
  Settings,
  Shield,
  Sparkles,
  Upload,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

const modelStats = [
  ["AUC", "0.693"],
  ["Accuracy", "69.3%"],
  ["AIC", "470.517"],
  ["Observations", "400"],
]

const oddsRatios = [
  ["GRE", "1.002", "[1.000, 1.004]"],
  ["GPA", "2.235", "[1.166, 4.282]"],
  ["RANK 1 vs 4", "4.718", "[2.080, 10.701]"],
  ["RANK 2 vs 4", "2.401", "[1.170, 4.927]"],
  ["RANK 3 vs 4", "1.235", "[0.572, 2.668]"],
]

const features = [
  {
    title: "Multiple Tool Support",
    text: "Python, SAS, R, Tableau, Excel and more.",
    icon: Database,
  },
  {
    title: "Structured Understanding",
    text: "Transforms raw outputs into structured, queryable artifacts.",
    icon: FileText,
  },
  {
    title: "Trust & Transparency",
    text: "See sources, confidence, detectors, and reasoning for every answer.",
    icon: Shield,
  },
  {
    title: "Enterprise Ready",
    text: "Secure, extensible, and designed for real analytics teams.",
    icon: Lock,
  },
]

export default function AnalyticsPage() {
  return (
    <main className="min-h-screen bg-[#050816] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(124,58,237,0.25),transparent_45%)] pointer-events-none" />

      <section className="relative z-10 mx-auto max-w-7xl px-6 py-10">
        <div className="text-center">
          <h1 className="text-6xl font-bold tracking-tight md:text-7xl">
            Marginalia{" "}
            <span className="text-violet-400">Analytics</span>
          </h1>

          <p className="mt-4 text-2xl text-gray-200">
            Next.js RAG Trust System for ML, Statistical & BI Interpretation
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-5">
          <TopPrinciple title="INTERPRET" text="Transform complex outputs from ML, stats & BI tools into clear explanations." icon={Sparkles} />
          <TopPrinciple title="TRUST" text="Not just answers — evidence, confidence, and reasoning you can inspect." icon={Shield} />
          <TopPrinciple title="TRACE" text="Every insight is grounded in source output with lineage and replay." icon={FileText} />
          <TopPrinciple title="ADAPT" text="Works with Python, SAS, Tableau, Excel and more." icon={Settings} />
          <TopPrinciple title="REFUSE" text="Weak-context detection ensures we say not enough evidence when needed." icon={Lock} />
        </div>

        <Card className="mt-10 overflow-hidden border-white/10 bg-[#07101f]/95 backdrop-blur-xl">
          <CardContent className="grid p-0 lg:grid-cols-[260px_1fr]">
            <aside className="border-r border-white/10 p-6">
              <div className="mb-8 flex items-center gap-3">
                <div className="text-4xl font-serif text-violet-400">M</div>
                <div>
                  <div className="text-xl font-bold">Marginalia</div>
                  <div className="text-violet-300">Analytics</div>
                </div>
              </div>

              <div className="space-y-3 text-sm text-gray-300">
                <SideItem icon={Home} text="Home" active />
                <SideItem icon={Upload} text="New Analysis" />
                <SideItem icon={FileText} text="My Analyses" />
                <SideItem icon={Database} text="Datasets" />
                <SideItem icon={BarChart3} text="Models & Tools" />
                <SideItem icon={Shield} text="Trust Center" />
                <SideItem icon={Settings} text="Settings" />
              </div>

              <div className="mt-12 rounded-xl border border-white/10 bg-white/5 p-4 text-sm">
                <div className="flex items-center gap-2 text-green-300">
                  <span className="h-2 w-2 rounded-full bg-green-400" />
                  System Status
                </div>
                <p className="mt-2 text-xs text-gray-400">
                  All systems operational
                </p>
                <p className="mt-6 text-xs text-gray-400">
                  Core v1.0.0
                  <br />
                  Analytics v1.0.0
                </p>
              </div>
            </aside>

            <section>
              <nav className="flex justify-end gap-8 border-b border-white/10 px-8 py-5 text-sm text-gray-300">
                <span>Docs</span>
                <span>Examples</span>
                <span>Integrations</span>
                <span>About</span>
                <Button className="bg-violet-600 hover:bg-violet-500">
                  Sign In
                </Button>
              </nav>

              <div className="grid gap-10 p-8 lg:grid-cols-2">
                <div className="flex flex-col justify-center">
                  <h2 className="text-5xl font-bold leading-tight">
                    Make sense of your
                    <br />
                    <span className="text-violet-400">
                      models and data.
                    </span>
                  </h2>

                  <p className="mt-6 max-w-xl text-lg leading-relaxed text-gray-300">
                    Marginalia Analytics is a trust-first AI system that
                    interprets machine learning, statistical, and BI outputs
                    with evidence, clarity, and actionable insight.
                  </p>

                  <div className="mt-8 flex gap-4">
                    <Button size="lg" className="bg-violet-600 hover:bg-violet-500">
                      Start New Analysis
                    </Button>

                    <Button size="lg" variant="outline" className="border-white/10 bg-white/5 text-white">
                      Explore Examples
                    </Button>
                  </div>

                  <div className="mt-6 flex items-center gap-2 text-sm text-gray-300">
                    <Shield className="h-4 w-4 text-green-400" />
                    Trust-first by design. We show our work.
                  </div>
                </div>

                <ModelPreview />
              </div>

              <div className="grid gap-4 px-8 pb-8 md:grid-cols-4">
                {features.map((feature) => {
                  const Icon = feature.icon
                  return (
                    <div
                      key={feature.title}
                      className="rounded-xl border border-white/10 bg-white/5 p-5"
                    >
                      <Icon className="mb-4 h-8 w-8 text-violet-300" />
                      <h3 className="font-semibold">{feature.title}</h3>
                      <p className="mt-3 text-sm leading-relaxed text-gray-300">
                        {feature.text}
                      </p>
                    </div>
                  )
                })}
              </div>

              <footer className="flex justify-between border-t border-white/10 px-8 py-6 text-sm text-gray-400">
                <span>© 2025 Marginalia Analytics. All rights reserved.</span>
                <span>Privacy • Terms • Contact</span>
              </footer>
            </section>
          </CardContent>
        </Card>

        <p className="mt-8 text-center text-2xl text-violet-400">
          Evidence before answer. Clarity before confidence.
        </p>
      </section>
    </main>
  )
}

function TopPrinciple({
  title,
  text,
  icon: Icon,
}: {
  title: string
  text: string
  icon: typeof Shield
}) {
  return (
    <div className="border-r border-white/10 pr-6 last:border-r-0">
      <Icon className="mb-4 h-7 w-7 text-violet-400" />
      <h3 className="font-semibold tracking-wide">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-gray-300">{text}</p>
    </div>
  )
}

function SideItem({
  icon: Icon,
  text,
  active = false,
}: {
  icon: typeof Home
  text: string
  active?: boolean
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-lg px-3 py-2 ${
        active ? "bg-violet-600/40 text-white" : "hover:bg-white/5"
      }`}
    >
      <Icon className="h-4 w-4" />
      <span>{text}</span>
    </div>
  )
}

function ModelPreview() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-2xl shadow-violet-500/20">
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <h3 className="font-semibold">Model Summary</h3>
          <p className="text-sm text-gray-400">Logistic Regression</p>

          <div className="mt-4 grid grid-cols-4 gap-2">
            {modelStats.map(([label, value]) => (
              <div key={label} className="rounded-lg bg-white/5 p-3">
                <div className="text-xs text-gray-400">{label}</div>
                <div className="mt-1 font-semibold">{value}</div>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="text-sm font-medium">ROC Curve</div>
            <div className="mt-4 flex h-40 items-end gap-1 border-l border-b border-white/20 p-2">
              {[10, 28, 39, 48, 55, 63, 70, 76, 82, 88, 92, 96].map((h, i) => (
                <div
                  key={i}
                  className="w-full rounded-t bg-violet-400/70"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-semibold">Odds Ratios</h3>

          <div className="mt-4 space-y-2 text-sm">
            {oddsRatios.map(([effect, or, ci]) => (
              <div
                key={effect}
                className="grid grid-cols-3 gap-2 rounded-lg bg-white/5 px-3 py-2"
              >
                <span>{effect}</span>
                <span>{or}</span>
                <span className="text-gray-300">{ci}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4">
            <h4 className="font-semibold">Key Insight</h4>
            <p className="mt-2 text-sm leading-relaxed text-gray-300">
              GPA and RANK are strong predictors of admission. GRE has a small
              but statistically significant effect.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}