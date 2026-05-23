import {
  ArrowRight,
  BarChart3,
  Brain,
  CheckCircle2,
  Database,
  FileText,
  Grid2X2,
  Heart,
  Home,
  Lock,
  Menu,
  Puzzle,
  Shield,
  Sparkles,
  Wallet,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

const domains = [
  {
    title: "Lit",
    icon: Sparkles,
    description: "Literary interpretation and thematic analysis with contextual depth.",
    color: "text-purple-300",
    bg: "from-purple-500/20 to-purple-950/20",
  },
  {
    title: "Analytics",
    icon: BarChart3,
    description: "ML, statistical & BI outputs explained with clarity and rigor.",
    color: "text-blue-300",
    bg: "from-blue-500/20 to-blue-950/20",
  },
  {
    title: "Finance",
    icon: Wallet,
    description: "Personal finance planning, investing and scenario analysis.",
    color: "text-green-300",
    bg: "from-green-500/20 to-green-950/20",
  },
  {
    title: "Mind",
    icon: Brain,
    description: "Cognitive tools for decision clarity, reflection & focus.",
    color: "text-yellow-300",
    bg: "from-yellow-500/20 to-yellow-950/20",
  },
  {
    title: "Dating",
    icon: Heart,
    description: "Relationship insights and communication with empathy & trust.",
    color: "text-pink-300",
    bg: "from-pink-500/20 to-pink-950/20",
  },
  {
    title: "Custom",
    icon: Grid2X2,
    description: "Build your own domain with our extensible framework.",
    color: "text-gray-300",
    bg: "from-gray-500/20 to-gray-950/20",
  },
]

const metrics = [
  ["Analyses Run", "48", "↑ 24%"],
  ["Avg. Trust Score", "87%", "↑ 8%"],
  ["Sources Used", "362", "↑ 31%"],
  ["Refusals", "12", "↓ 15%"],
  ["User Satisfaction", "4.8/5", "↑ 6%"],
]

const analyses = [
  ["Q2 Revenue Forecast Model", "Analytics", "92%", "High", "Completed"],
  ["Logistic Regression Risk Model", "Analytics", "89%", "High", "Completed"],
  ["Retirement Plan Scenario", "Finance", "94%", "High", "Completed"],
  ["Hamlet Theme Exploration", "Lit", "91%", "High", "Completed"],
  ["Mind Clarity Reflection", "Mind", "86%", "Medium", "Completed"],
  ["Dating Conversation Review", "Dating", "83%", "Medium", "Completed"],
]

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#050816] text-white overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(79,70,229,0.24),transparent_45%)] pointer-events-none" />

      <nav className="relative z-20 border-b border-white/10 bg-[#050816]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="text-4xl font-serif text-violet-400">M</div>
            <div className="text-xl font-bold tracking-wide">MARGINALIA</div>
          </div>

          <div className="hidden items-center gap-8 text-sm text-gray-300 md:flex">
            <span>Platform</span>
            <span>Domains</span>
            <span>Solutions</span>
            <span>Resources</span>
            <span>Pricing</span>
            <span>Company</span>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <Button variant="ghost" className="text-white hover:bg-white/10">
              Sign In
            </Button>
            <Button className="rounded-xl bg-violet-600 hover:bg-violet-500">
              Get Started
            </Button>
          </div>

          <Menu className="md:hidden" />
        </div>
      </nav>

      <section className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 px-6 py-16 lg:grid-cols-2">
        <div>
          <Badge className="mb-6 border-white/10 bg-white/5 text-gray-200">
            <Shield className="mr-2 h-3 w-3" />
            TRUST-FIRST AI PLATFORM
          </Badge>

          <h1 className="text-5xl font-bold leading-tight tracking-tight md:text-6xl">
            Interpret with trust.
            <br />
            Decide with <span className="text-violet-400">confidence.</span>
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-gray-300">
            Marginalia is a Next.js RAG Trust System that turns complex outputs
            into clear, evidence-backed, actionable understanding.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Button size="lg" className="rounded-xl bg-violet-600 hover:bg-violet-500">
              Explore the Platform <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" className="rounded-xl border-white/15 bg-white/5 text-white hover:bg-white/10">
              See It in Action
            </Button>
          </div>

          <div className="mt-8 flex flex-wrap gap-6 text-sm text-gray-300">
            <Feature text="Evidence before answer" />
            <Feature text="Transparent reasoning" />
            <Feature text="Refuses weak context" />
          </div>
        </div>

        <HeroShield />
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-6">
        <Card className="border-white/10 bg-white/[0.03] backdrop-blur-xl">
          <CardContent className="grid gap-4 p-5 md:grid-cols-7">
            <div className="md:col-span-1">
              <h2 className="text-xl font-semibold">All Domains. One Trust Engine.</h2>
              <p className="mt-3 text-sm text-gray-300">
                Specialized modules unified by the Marginalia Trust Layer.
              </p>
            </div>

            {domains.map((domain) => {
              const Icon = domain.icon
              return (
                <div
                  key={domain.title}
                  className={`rounded-xl border border-white/10 bg-gradient-to-br ${domain.bg} p-5`}
                >
                  <Icon className={`mb-4 h-7 w-7 ${domain.color}`} />
                  <h3 className={`font-semibold ${domain.color}`}>{domain.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-gray-300">
                    {domain.description}
                  </p>
                  <div className="mt-4 flex items-center gap-2 text-sm text-gray-200">
                    Explore <ArrowRight className="h-3 w-3" />
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-6 pb-16 pt-3">
        <Card className="border-white/10 bg-[#07101f]/90">
          <CardContent className="grid gap-4 p-0 lg:grid-cols-[230px_1fr]">
            <aside className="border-r border-white/10 p-5">
              <div className="mb-6 flex items-center gap-3">
                <div className="text-3xl font-serif text-violet-400">M</div>
                <div>
                  <div className="font-bold">MARGINALIA</div>
                  <div className="text-xs text-gray-400">Trusted Intelligence Hub</div>
                </div>
              </div>

              <div className="space-y-3 text-sm text-gray-300">
                <SideItem icon={Home} text="Home" active />
                <SideItem icon={FileText} text="My Analyses" />
                <SideItem icon={Database} text="Datasets" />
                <SideItem icon={BarChart3} text="Models & Tools" />
                <SideItem icon={Shield} text="Trust Center" />
              </div>

              <div className="mt-8 rounded-xl border border-white/10 bg-white/5 p-4 text-sm">
                <div className="flex items-center gap-2 text-green-300">
                  <span className="h-2 w-2 rounded-full bg-green-400" />
                  System Status
                </div>
                <p className="mt-2 text-xs text-gray-400">All systems operational</p>
              </div>
            </aside>

            <div className="p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-semibold">Welcome back, Alpho</h2>
                  <p className="text-sm text-gray-400">
                    Here’s what’s happening across your analyses.
                  </p>
                </div>
                <Badge className="bg-violet-500/20 text-violet-200">30D</Badge>
              </div>

              <div className="grid gap-3 md:grid-cols-5">
                {metrics.map(([label, value, change]) => (
                  <div key={label} className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <div className="text-xs text-gray-300">{label}</div>
                    <div className="mt-2 text-3xl font-semibold">{value}</div>
                    <div className="mt-1 text-xs text-green-300">{change} vs last 30 days</div>
                  </div>
                ))}
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-[1.5fr_1fr]">
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <h3 className="mb-4 font-semibold">Recent Analyses</h3>
                  <div className="space-y-3">
                    {analyses.map(([name, domain, score, confidence, status]) => (
                      <div key={name} className="grid grid-cols-5 gap-3 text-sm text-gray-300">
                        <span className="col-span-2 text-white">{name}</span>
                        <Badge variant="outline" className="w-fit border-blue-400/40 text-blue-300">
                          {domain}
                        </Badge>
                        <span>{score}</span>
                        <span className={confidence === "High" ? "text-green-300" : "text-yellow-300"}>
                          {confidence}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4">
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <h3 className="font-semibold">Trust Overview</h3>
                    <div className="mt-5 flex items-center gap-5">
                      <div className="flex h-28 w-28 items-center justify-center rounded-full border-[12px] border-green-400/70 text-3xl font-bold">
                        87
                      </div>
                      <div className="space-y-2 text-sm text-gray-300">
                        <div>High: 68%</div>
                        <div>Medium: 24%</div>
                        <div>Low: 8%</div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <h3 className="font-semibold">Top Evidence Sources</h3>
                    <div className="mt-4 space-y-2 text-sm text-gray-300">
                      <Source label="Model Output" value="128" />
                      <Source label="Statistical Tables" value="96" />
                      <Source label="Academic Papers" value="62" />
                      <Source label="Datasets" value="44" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-5">
                <h3 className="mb-5 font-semibold">Trust Layer in Action</h3>
                <div className="grid gap-4 text-center text-sm text-gray-300 md:grid-cols-6">
                  {["Ingest", "Retrieve", "Assess", "Interpret", "Verify", "Respond"].map((step) => (
                    <div key={step}>
                      <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full border border-blue-400/60">
                        <Shield className="h-5 w-5 text-blue-300" />
                      </div>
                      <div className="font-medium text-white">{step}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 grid gap-6 border-t border-white/10 pt-8 text-sm text-gray-300 md:grid-cols-3">
          <BottomFeature icon={Shield} title="Enterprise Ready" text="Secure. Scalable. Compliant." />
          <BottomFeature icon={Puzzle} title="Fully Extensible" text="APIs, plugins & custom domains." />
          <BottomFeature icon={Lock} title="Privacy First" text="Your data stays your data." />
        </div>
      </section>
    </main>
  )
}

function Feature({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2">
      <CheckCircle2 className="h-4 w-4 text-green-400" />
      <span>{text}</span>
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
        active ? "bg-violet-500/20 text-violet-200" : ""
      }`}
    >
      <Icon className="h-4 w-4" />
      <span>{text}</span>
    </div>
  )
}

function Source({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span>{label}</span>
      <span className="text-white">{value}</span>
    </div>
  )
}

function BottomFeature({
  icon: Icon,
  title,
  text,
}: {
  icon: typeof Shield
  title: string
  text: string
}) {
  return (
    <div className="flex items-start gap-4">
      <Icon className="h-7 w-7 text-gray-300" />
      <div>
        <div className="font-semibold text-white">{title}</div>
        <div>{text}</div>
      </div>
    </div>
  )
}

function HeroShield() {
  return (
    <div className="relative min-h-[360px]">
      <div className="absolute inset-0 rounded-full bg-violet-600/20 blur-3xl" />

      <div className="absolute left-10 top-10 rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
        <div className="text-sm text-gray-300">Evidence</div>
        <div className="text-3xl font-semibold">128</div>
        <div className="text-xs text-gray-400">Sources</div>
      </div>

      <div className="absolute right-16 top-12 rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
        <div className="text-sm text-gray-300">Confidence</div>
        <div className="text-3xl font-semibold">92%</div>
        <div className="text-xs text-gray-400">High</div>
      </div>

      <div className="absolute left-0 top-36 rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
        <div className="text-sm text-gray-300">Detections</div>
        <div className="text-3xl font-semibold">3</div>
        <div className="text-xs text-gray-400">Flags Reviewed</div>
      </div>

      <div className="absolute right-0 top-40 rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
        <div className="text-sm text-gray-300">Trust Score</div>
        <div className="text-3xl font-semibold">A</div>
        <div className="text-xs text-gray-400">Very Strong</div>
      </div>

      <div className="absolute left-1/2 top-20 flex h-56 w-56 -translate-x-1/2 items-center justify-center rounded-[3rem] border border-violet-300/30 bg-violet-500/10 shadow-2xl shadow-violet-500/30">
        <div className="text-8xl font-serif text-violet-300">M</div>
      </div>
    </div>
  )
}