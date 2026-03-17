"use client";

import { motion } from "framer-motion";

const technologies = [
  {
    name: "Next.js 16",
    category: "Framework",
    description: "App Router, Server Components, Edge Runtime",
  },
  {
    name: "TypeScript",
    category: "Language",
    description: "End-to-end type safety across your entire stack",
  },
  {
    name: "Drizzle ORM",
    category: "Database",
    description: "Type-safe SQL queries with zero overhead",
  },
  {
    name: "PostgreSQL",
    category: "Storage",
    description: "Battle-tested relational database with JSON support",
  },
  {
    name: "NextAuth.js",
    category: "Auth",
    description: "Flexible authentication with 50+ providers",
  },
  {
    name: "Stripe",
    category: "Billing",
    description: "Subscriptions, metering, and payment processing",
  },
  {
    name: "Tailwind CSS",
    category: "Styling",
    description: "Utility-first CSS with design system tokens",
  },
  {
    name: "shadcn/ui",
    category: "Components",
    description: "Accessible, customizable component primitives",
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, x: -16 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

export function TechStack() {
  return (
    <section id="stack" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="mb-16 text-center"
        >
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-cyan-400">
            Tech Stack
          </p>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Built on tools you already know
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
            No proprietary frameworks or vendor lock-in. Standard, proven
            technologies that your team can adopt in an afternoon.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid gap-3 sm:grid-cols-2"
        >
          {technologies.map((tech) => (
            <motion.div
              key={tech.name}
              variants={itemVariants}
              className="group flex items-start gap-4 rounded-xl border border-border/50 bg-card/30 p-5 transition-colors hover:border-border hover:bg-card/60"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border/50 bg-background font-mono text-xs font-bold text-muted-foreground transition-colors group-hover:border-cyan-500/30 group-hover:text-cyan-400">
                {tech.category.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="flex items-baseline gap-2">
                  <h3 className="text-sm font-semibold">{tech.name}</h3>
                  <span className="text-xs text-muted-foreground">
                    {tech.category}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {tech.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
