import { useEffect, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight, BellRing, Camera, Check, CheckCircle2, ChevronRight, ClipboardCheck,
  Clock3, Copy, FileText, Flag, Lightbulb, ListChecks, Mail, MapPin, Menu, MessageCircle,
  Moon, PanelTop, ShieldCheck, Sun, TicketCheck, UserCheck, Users, Wrench, X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [
    { title: "FixMyCampus — Report. Track. Resolve." },
    { name: "description", content: "FixMyCampus centralizes campus complaints so students can report issues and administrators can resolve them efficiently." },
    { property: "og:title", content: "FixMyCampus — Report. Track. Resolve." },
    { property: "og:description", content: "One accountable platform for campus complaints and maintenance." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: DashboardLanding,
});

const issues = [
  { title: "Water leakage", place: "Lab B04", status: "In progress", tone: "text-warning bg-warning/10" },
  { title: "Broken projector", place: "Room 201", status: "Pending", tone: "text-muted-foreground bg-muted" },
  { title: "Streetlight", place: "Main Gate", status: "Resolved", tone: "text-positive bg-positive/10" },
];

const featureList: Array<{ icon: LucideIcon; title: string; copy: string }> = [
  { icon: Flag, title: "Smart Priority", copy: "Urgent complaints are surfaced using priority and keyword logic." },
  { icon: Clock3, title: "Real-Time Status Tracking", copy: "Students follow each issue from pending through resolution." },
  { icon: Camera, title: "Photo-Based Reporting", copy: "Images give maintenance teams immediate visual context." },
  { icon: UserCheck, title: "Staff Assignment", copy: "Administrators assign clear responsibility for every ticket." },
  { icon: MapPin, title: "Location-Based Reporting", copy: "Every issue is tied to the campus location that needs attention." },
];

const workflow = [
  { icon: BellRing, title: "Report", copy: "Students submit an issue with its location and details." },
  { icon: TicketCheck, title: "Ticket", copy: "A trackable complaint becomes the single source of truth." },
  { icon: ClipboardCheck, title: "Manage", copy: "Admins prioritize, assign and update responsible staff." },
  { icon: Wrench, title: "Resolve", copy: "Progress stays visible until the issue is completed." },
];

function Logo() {
  return <span className="inline-flex items-center gap-2.5 font-display text-base font-bold">
    <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground"><Wrench className="size-4" /></span>
    FixMyCampus
  </span>;
}

function SectionHeading({ eyebrow, title, copy }: { eyebrow: string; title: string; copy: string }) {
  return <div className="max-w-2xl">
    <p className="mb-3 text-xs font-bold uppercase text-primary">{eyebrow}</p>
    <h2 className="font-display text-3xl font-bold leading-tight sm:text-4xl">{title}</h2>
    <p className="mt-4 text-base leading-7 text-muted-foreground">{copy}</p>
  </div>;
}

function DashboardLanding() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  const copyText = async (value: string, key: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(key);
    window.setTimeout(() => setCopied(null), 1200);
  };

  return <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1180px] items-center justify-between px-5 sm:px-6">
        <a href="#top" aria-label="FixMyCampus home"><Logo /></a>
        <nav className="hidden items-center gap-7 md:flex" aria-label="Primary navigation">
          <a href="#problem" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Problem</a>
          <a href="#features" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Features</a>
          <a href="#demo" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Demo</a>
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          <Button variant="ghost" size="icon" onClick={() => setIsDark((value) => !value)} aria-label={isDark ? "Use light theme" : "Use dark theme"} title={isDark ? "Use light theme" : "Use dark theme"}>
            {isDark ? <Sun /> : <Moon />}
          </Button>
          <Button asChild variant="ghost"><Link to="/login">Log in</Link></Button>
          <Button asChild><Link to="/register">Create Account</Link></Button>
        </div>
        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMenuOpen((value) => !value)} aria-label="Toggle navigation" aria-expanded={menuOpen}>{menuOpen ? <X /> : <Menu />}</Button>
      </div>
      {menuOpen && <div className="border-t border-border bg-background px-5 py-4 md:hidden">
        <nav className="mx-auto flex max-w-[1180px] flex-col gap-1" aria-label="Mobile navigation">
          {[["Problem", "#problem"], ["Features", "#features"], ["Demo", "#demo"]].map(([label, href]) => <a key={href} href={href} onClick={() => setMenuOpen(false)} className="py-3 text-sm text-muted-foreground">{label}</a>)}
          <div className="mt-2 grid grid-cols-[44px_1fr_1fr] gap-2 border-t border-border pt-4">
            <Button variant="outline" size="icon" onClick={() => setIsDark((value) => !value)} aria-label="Toggle theme">{isDark ? <Sun /> : <Moon />}</Button>
            <Button asChild variant="outline"><Link to="/login">Log in</Link></Button>
            <Button asChild><Link to="/register">Create Account</Link></Button>
          </div>
        </nav>
      </div>}
    </header>

    <main id="top">
      <section className="border-b border-border py-16 sm:py-20 lg:py-24">
        <div className="mx-auto grid max-w-[1180px] items-center gap-12 px-5 sm:px-6 lg:grid-cols-[1.05fr_.95fr] lg:gap-16">
          <div>
            <p className="mb-5 flex items-center gap-2 text-xs font-bold uppercase text-primary"><span className="h-px w-6 bg-primary" /> Campus infrastructure platform</p>
            <h1 className="font-display text-4xl font-extrabold leading-[1.08] sm:text-5xl lg:text-6xl">Fix Campus Issues.<br /><span className="text-primary">Faster. Smarter.<br />Transparently.</span></h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">FixMyCampus is a centralized complaint and maintenance platform that helps students report campus issues and gives administrators the tools to manage and resolve them efficiently.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg"><Link to="/login">Get Started <ArrowRight /></Link></Button>
              <Button asChild size="lg" variant="outline"><Link to="/register">Create Account</Link></Button>
            </div>
            <div className="mt-8 flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:flex-wrap sm:gap-6">
              {["Centralized reporting", "Real-time status tracking", "Clear accountability"].map((item) => <span key={item} className="flex items-center gap-2"><Check className="size-4 text-primary" />{item}</span>)}
            </div>
          </div>
          <div className="relative border border-border bg-card p-5 shadow-2xl shadow-primary/5 sm:p-6">
            <div className="mb-5 flex items-center justify-between border-b border-border pb-4">
              <div><p className="font-display font-bold">Recent Campus Issues</p><p className="mt-1 text-xs text-muted-foreground">Live complaint overview</p></div>
              <span className="flex items-center gap-2 text-xs text-muted-foreground"><span className="size-2 rounded-full bg-positive" /> Live</span>
            </div>
            <div className="space-y-2">
              {issues.map((issue, index) => <div key={issue.title} className="grid grid-cols-[36px_1fr_auto] items-center gap-3 border border-border bg-surface p-3.5">
                <span className="flex size-9 items-center justify-center rounded-md bg-background text-primary">{index === 0 ? <Wrench className="size-4" /> : index === 1 ? <PanelTop className="size-4" /> : <Lightbulb className="size-4" />}</span>
                <div><p className="text-sm font-semibold">{issue.title}</p><p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="size-3" /> {issue.place}</p></div>
                <span className={`rounded-sm px-2 py-1 text-[10px] font-bold uppercase ${issue.tone}`}>{issue.status}</span>
              </div>)}
            </div>
            <div className="mt-5 flex items-center justify-between border-t border-border pt-5 text-[10px] font-bold uppercase text-muted-foreground sm:text-xs">
              {['Report', 'Track', 'Manage', 'Resolve'].map((step, index) => <div key={step} className="flex items-center gap-2"><span className={index === 3 ? "text-primary" : ""}>{step}</span>{index < 3 && <ChevronRight className="size-3" />}</div>)}
            </div>
          </div>
        </div>
      </section>

      <section id="problem" className="scroll-mt-16 py-16 sm:py-20">
        <div className="mx-auto max-w-[1180px] px-5 sm:px-6">
          <SectionHeading eyebrow="The problem" title="Campus issues shouldn't disappear in chats." copy="Traditional campus maintenance relies on scattered communication, making complaints difficult to track, prioritize and resolve." />
          <div className="mt-10 border-y border-border py-8">
            <div className="grid gap-8 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
              <div className="grid grid-cols-2 gap-2">
                {[[MessageCircle, "WhatsApp"], [Mail, "Email"], [Users, "Verbal Reports"], [FileText, "Notice Boards"]].map(([Icon, label]) => { const ChannelIcon = Icon as LucideIcon; return <div key={label as string} className="flex items-center gap-3 bg-surface p-4 text-sm font-medium"><ChannelIcon className="size-4 text-muted-foreground" />{label as string}</div>; })}
              </div>
              <ArrowRight className="mx-auto hidden text-primary lg:block" />
              <div className="flex flex-col gap-2">
                {["Scattered Reports", "Manual Follow-up", "Delayed Resolution"].map((item, index) => <div key={item} className="flex items-center gap-4 border border-border bg-card p-3"><span className="flex size-7 items-center justify-center rounded-sm bg-primary/10 text-xs font-bold text-primary">0{index + 1}</span><span className="text-sm font-semibold">{item}</span>{index < 2 && <ChevronRight className="ml-auto hidden size-4 text-muted-foreground lg:block" />}</div>)}
              </div>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-5 border-t border-border pt-6 lg:grid-cols-4">
              {["Duplicate Complaints", "Unclear Ownership", "Limited Visibility", "Manual Tracking"].map((item) => <div key={item} className="flex items-center gap-2 text-sm text-muted-foreground"><X className="size-4 text-destructive" />{item}</div>)}
            </div>
          </div>

          <div className="mt-16">
            <p className="font-display text-2xl font-bold sm:text-3xl">One platform. One ticket. <span className="text-primary">One clear path to resolution.</span></p>
            <div className="mt-8 grid gap-px bg-border md:grid-cols-4">
              {workflow.map(({ icon: Icon, title, copy }, index) => <div key={title} className="relative bg-background p-6">
                <div className="mb-8 flex items-center justify-between"><span className="text-xs font-bold text-primary">0{index + 1}</span><Icon className="size-5 text-primary" /></div>
                <h3 className="font-display text-lg font-bold uppercase">{title}</h3><p className="mt-3 text-sm leading-6 text-muted-foreground">{copy}</p>
              </div>)}
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="scroll-mt-16 border-y border-border bg-surface py-16 sm:py-20">
        <div className="mx-auto max-w-[1180px] px-5 sm:px-6">
          <SectionHeading eyebrow="Built for action" title="Everything needed to manage campus issues." copy="Purpose-built for reporting, prioritizing and resolving campus maintenance problems." />
          <div className="mt-10 grid gap-8 lg:grid-cols-[.9fr_1.1fr]">
            <div className="flex min-h-72 flex-col justify-between border border-primary/30 bg-card p-7 sm:p-8">
              <div className="flex size-11 items-center justify-center rounded-md bg-primary text-primary-foreground"><ListChecks /></div>
              <div className="mt-12"><p className="text-xs font-bold uppercase text-primary">Core system</p><h3 className="mt-3 font-display text-2xl font-bold">Centralized complaint management</h3><p className="mt-4 leading-7 text-muted-foreground">Every campus issue is captured in one centralized system instead of being scattered across messages, emails and manual records.</p></div>
            </div>
            <div className="grid gap-x-8 gap-y-0 sm:grid-cols-2">
              {featureList.map(({ icon: Icon, title, copy }) => <div key={title} className="flex gap-4 border-b border-border py-5 first:pt-0 sm:first:pt-5">
                <Icon className="mt-1 size-5 shrink-0 text-primary" /><div><h3 className="font-display font-bold">{title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{copy}</p></div>
              </div>)}
            </div>
          </div>
        </div>
      </section>

      <section id="demo" className="scroll-mt-16 py-16 sm:py-20">
        <div className="mx-auto max-w-[1180px] px-5 sm:px-6">
          <SectionHeading eyebrow="Demo access" title="Try FixMyCampus" copy="Explore the platform using the demo accounts below." />
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {[{ type: "Student", email: "harsh@gmail.com", icon: Users }, { type: "Admin", email: "mayank@gmail.com", icon: ShieldCheck }].map(({ type, email, icon: Icon }) => <article key={type} className="border border-border bg-card p-6 sm:p-7">
              <div className="mb-6 flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary"><Icon /></span><div><p className="text-xs font-bold uppercase text-primary">{type} demo</p><h3 className="font-display text-lg font-bold">{type} access</h3></div></div>
              <div className="divide-y divide-border border-y border-border">
                {[{ label: "Email", value: email, key: `${type}-email` }, { label: "Password", value: "1234", key: `${type}-password` }].map((field) => <div key={field.key} className="grid grid-cols-[72px_1fr_36px] items-center gap-2 py-3"><span className="text-xs text-muted-foreground">{field.label}</span><code className="overflow-hidden text-ellipsis text-sm font-semibold">{field.value}</code><Button variant="ghost" size="icon" onClick={() => copyText(field.value, field.key)} aria-label={`Copy ${field.label.toLowerCase()}`} title={`Copy ${field.label.toLowerCase()}`}>{copied === field.key ? <Check className="text-positive" /> : <Copy />}</Button></div>)}
              </div>
              <Button asChild className="mt-6 w-full"><Link to="/login">Login as {type} <ArrowRight /></Link></Button>
            </article>)}
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-surface py-14">
        <div className="mx-auto flex max-w-[1180px] flex-col gap-8 px-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div><h2 className="font-display text-3xl font-bold sm:text-4xl">Make your campus better,<br /><span className="text-primary">one issue at a time.</span></h2><p className="mt-4 text-muted-foreground">Report, track and resolve campus maintenance issues through one centralized platform.</p></div>
          <div className="flex flex-wrap gap-3"><Button asChild size="lg"><Link to="/register">Create Account</Link></Button><Button asChild size="lg" variant="outline"><Link to="/login">Login</Link></Button></div>
        </div>
      </section>
    </main>

    <footer className="py-10">
      <div className="mx-auto max-w-[1180px] px-5 sm:px-6">
        <div className="grid gap-10 border-b border-border pb-10 sm:grid-cols-[1fr_auto_auto] sm:gap-16">
          <div><Logo /><p className="mt-4 max-w-xs text-sm leading-6 text-muted-foreground">A centralized campus complaint and maintenance platform.</p></div>
          <div><p className="text-xs font-bold uppercase">Platform</p><div className="mt-4 flex flex-col gap-3 text-sm text-muted-foreground"><a href="#problem">Problem</a><a href="#features">Features</a><a href="#demo">Demo</a></div></div>
          <div><p className="text-xs font-bold uppercase">Account</p><div className="mt-4 flex flex-col gap-3 text-sm text-muted-foreground"><Link to="/login">Login</Link><Link to="/register">Register</Link></div></div>
        </div>
        <p className="pt-6 text-xs text-muted-foreground">© 2026 FixMyCampus. Built for Hackathon.</p>
      </div>
    </footer>
  </div>;
}