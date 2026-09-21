import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [
    { title: "Create account — FixMyCampus" },
    { name: "description", content: "Create a FixMyCampus student account." },
    { property: "og:title", content: "Create account — FixMyCampus" },
    { property: "og:description", content: "Join FixMyCampus to report and track campus maintenance issues." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: RegisterRoute,
});

function RegisterRoute() {
  return <main className="dark flex min-h-screen items-center justify-center bg-background px-5 text-foreground">
    <div className="w-full max-w-md border border-border bg-card p-8 text-center">
      <div className="mx-auto mb-5 flex size-11 items-center justify-center rounded-md bg-primary text-primary-foreground"><UserPlus /></div>
      <h1 className="font-display text-3xl font-bold">Create an account</h1>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">The registration screen is not included in this project checkout. Your existing registration can remain connected at this URL.</p>
      <Button asChild variant="outline" className="mt-7 w-full"><Link to="/dashboard"><ArrowLeft /> Back to FixMyCampus</Link></Button>
    </div>
  </main>;
}