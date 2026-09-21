import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [
    { title: "Log in — FixMyCampus" },
    { name: "description", content: "Log in to the FixMyCampus platform." },
    { property: "og:title", content: "Log in — FixMyCampus" },
    { property: "og:description", content: "Access the FixMyCampus student and administrator platform." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: LoginRoute,
});

function LoginRoute() {
  return <main className="dark flex min-h-screen items-center justify-center bg-background px-5 text-foreground">
    <div className="w-full max-w-md border border-border bg-card p-8 text-center">
      <div className="mx-auto mb-5 flex size-11 items-center justify-center rounded-md bg-primary text-primary-foreground"><LogIn /></div>
      <h1 className="font-display text-3xl font-bold">Platform login</h1>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">The authentication screen is not included in this project checkout. Your existing login can remain connected at this URL.</p>
      <Button asChild variant="outline" className="mt-7 w-full"><Link to="/dashboard"><ArrowLeft /> Back to FixMyCampus</Link></Button>
    </div>
  </main>;
}