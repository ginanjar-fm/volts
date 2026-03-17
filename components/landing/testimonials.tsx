"use client";

import { motion } from "framer-motion";

const testimonials = [
  {
    quote:
      "Volts saved me weeks of boilerplate. I had my AI writing app live with Stripe billing in a weekend.",
    author: "Alex Chen",
    role: "Indie Hacker",
    avatar: "AC",
  },
  {
    quote:
      "The Drizzle + Postgres setup alone is worth it. Clean migrations, type-safe queries, and sensible defaults.",
    author: "Sarah Kim",
    role: "Full-Stack Developer",
    avatar: "SK",
  },
  {
    quote:
      "Finally a starter kit that doesn't force vendor lock-in. Self-hosted, open stack, no surprises.",
    author: "Marco Rossi",
    role: "CTO, Startup",
    avatar: "MR",
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

export function Testimonials() {
  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="mb-16 text-center"
        >
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-cyan-400">
            Testimonials
          </p>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Loved by builders
          </h2>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid gap-6 md:grid-cols-3"
        >
          {testimonials.map((t) => (
            <motion.div
              key={t.author}
              variants={cardVariants}
              className="flex flex-col rounded-xl border border-border/50 bg-card/30 p-6"
            >
              <p className="flex-1 text-sm leading-relaxed text-muted-foreground">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="mt-6 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-cyan-500/10 text-xs font-bold text-cyan-400">
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-medium">{t.author}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
