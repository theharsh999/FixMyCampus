import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    throw redirect({ to: "/dashboard" });
  },
  head: () => ({
    meta: [
      { title: "FixMyCampus — Campus Issue Management" },
      { name: "description", content: "A centralized platform for reporting and resolving campus maintenance issues." },
      { property: "og:title", content: "FixMyCampus — Campus Issue Management" },
      { property: "og:description", content: "Report, track and resolve campus issues through one accountable platform." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});
