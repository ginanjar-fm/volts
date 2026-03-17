"use client";

import { motion } from "framer-motion";
import {
  Bot,
  CreditCard,
  Lock,
  Users,
  Blocks,
  Gauge,
  Database,
  Palette,
} from "lucide-react";

const features = [
  {
    icon: Bot,
    title: "AI-Native Patterns",
    description:
      "Built-in LLM integration with OpenAI and Anthropic. Streaming, tool calling, and prompt management ready to go.",
  },
  {
    icon: Lock,
    title: "Complete Auth Suite",
    description:
      "Magic link, OAuth (GitHub, Google), and email/password auth. Role-based access control included.",
  },
  {
    icon: CreditCard,
    title: "Stripe Billing",
    description:
      "Subscriptions and usage-based metering with Stripe. Webhooks, customer portal, and invoice management.",
  },
  {
    icon: Users,
    title: "Multi-Tenancy",
    description:
      "Team workspaces with member management, invitations, and per-tenant data isolation.",
  },
  {
    icon: Database,
    title: "Drizzle ORM + Postgres",
    description:
      "Type-safe database queries with Drizzle. Migrations, seeding, and schema management built in.",
  },
  {
    icon: Blocks,
    title: "Modular Architecture",
    description:
      "Clean, composable codebase. Add or remove features without fighting the framework.",
  },
  {
    icon: Gauge,
    title: "Performance First",
    description:
      "Server components, edge-ready API routes, and optimized bundle size. Lighthouse 90+ out of the box.",
  },
  {
    icon: Palette,
    title: "Tailwind + shadcn/ui",
    description:
      "Beautiful, accessible components with dark mode. Customize the entire design system in minutes.",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

export function Features() {
  return (
    <section id="features" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="mb-16 text-center"
        >
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-cyan-400">
            Features
          </p>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need to ship
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
            Stop rebuilding auth, billing, and infrastructure. Start with a
            production-ready foundation and focus on what makes your product
            unique.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={cardVariants}
              className="group relative rounded-xl border border-border/50 bg-card/50 p-6 transition-colors hover:border-cyan-500/20 hover:bg-card"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg border border-border/50 bg-background transition-colors group-hover:border-cyan-500/30 group-hover:bg-cyan-500/5">
                <feature.icon className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-cyan-400" />
              </div>
              <h3 className="mb-2 text-sm font-semibold">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
