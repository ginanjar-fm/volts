"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

const tiers = [
  {
    name: "Starter",
    price: 149,
    description: "Core features for solo builders getting started.",
    features: [
      "Next.js 16 + TypeScript boilerplate",
      "Email/password & magic link auth",
      "Stripe subscription billing",
      "PostgreSQL + Drizzle ORM",
      "Tailwind CSS + shadcn/ui",
      "Docker deployment config",
      "6 months of updates",
    ],
    cta: "Get Starter",
    highlighted: false,
  },
  {
    name: "Pro",
    price: 249,
    description: "AI patterns and advanced auth for serious products.",
    features: [
      "Everything in Starter",
      "LLM integration patterns (OpenAI, Anthropic)",
      "Streaming + tool calling examples",
      "OAuth providers (GitHub, Google)",
      "Usage-based billing / metering",
      "Admin dashboard",
      "Email templates (transactional)",
      "12 months of updates",
      "Priority Discord support",
    ],
    cta: "Get Pro",
    highlighted: true,
  },
  {
    name: "Team",
    price: 349,
    description: "Multi-tenancy and white-label for scaling teams.",
    features: [
      "Everything in Pro",
      "Multi-tenant workspaces",
      "Team member management & invites",
      "Role-based access control",
      "White-label / custom branding",
      "CI/CD pipeline templates",
      "Lifetime updates",
      "Priority support + 1:1 onboarding",
    ],
    cta: "Get Team",
    highlighted: false,
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

export function Pricing() {
  return (
    <section id="pricing" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="mb-16 text-center"
        >
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-cyan-400">
            Pricing
          </p>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            One purchase. Unlimited projects.
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
            Buy once, build forever. No subscriptions, no per-seat fees. Use
            Volts for every SaaS you launch.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid gap-6 lg:grid-cols-3"
        >
          {tiers.map((tier) => (
            <motion.div
              key={tier.name}
              variants={cardVariants}
              className={`relative flex flex-col rounded-2xl border p-8 ${
                tier.highlighted
                  ? "border-cyan-500/30 bg-card shadow-[0_0_40px_-12px_rgba(0,200,255,0.15)]"
                  : "border-border/50 bg-card/30"
              }`}
            >
              {tier.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-cyan-500 px-3 py-0.5 text-xs font-semibold text-black">
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-semibold">{tier.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {tier.description}
                </p>
              </div>

              <div className="mb-8">
                <span className="text-4xl font-bold">${tier.price}</span>
                <span className="ml-1 text-sm text-muted-foreground">
                  one-time
                </span>
              </div>

              <ul className="mb-8 flex flex-1 flex-col gap-3">
                {tier.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-3 text-sm text-muted-foreground"
                  >
                    <Check
                      className={`mt-0.5 h-4 w-4 shrink-0 ${tier.highlighted ? "text-cyan-400" : "text-muted-foreground/60"}`}
                    />
                    {feature}
                  </li>
                ))}
              </ul>

              <a
                href="#waitlist"
                className={`inline-flex h-11 items-center justify-center rounded-xl text-sm font-semibold transition-all ${
                  tier.highlighted
                    ? "bg-cyan-500 text-black hover:bg-cyan-400 hover:shadow-[0_0_20px_rgba(0,200,255,0.3)]"
                    : "border border-border bg-background text-foreground hover:bg-accent"
                }`}
              >
                {tier.cta}
              </a>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
