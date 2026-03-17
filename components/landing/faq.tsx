"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "Is this a subscription or a one-time purchase?",
    answer:
      "One-time purchase. You get the full source code and can use it for unlimited projects. Updates are included for the duration specified in your tier.",
  },
  {
    question: "Can I use Volts for client projects?",
    answer:
      "Yes. Your license covers unlimited projects, including client work. You can build and deploy as many SaaS products as you want.",
  },
  {
    question: "What databases are supported?",
    answer:
      "Volts ships with PostgreSQL via Drizzle ORM. The schema and migrations are set up for Postgres, but Drizzle supports MySQL and SQLite if you want to swap.",
  },
  {
    question: "Do I need to know AI/LLM concepts to use this?",
    answer:
      "No. The AI integration patterns are optional modules with clear documentation. You can use Volts as a standard SaaS starter and add AI features when you're ready.",
  },
  {
    question: "How is this different from other SaaS boilerplates?",
    answer:
      "Volts is AI-native from day one. Instead of bolting on AI as an afterthought, it includes production patterns for streaming, tool calling, and prompt management. It's also self-hosted first — no vendor lock-in.",
  },
  {
    question: "What kind of support do I get?",
    answer:
      "All tiers include access to the Discord community. Pro includes priority support, and Team includes a 1:1 onboarding call to help you set up your project.",
  },
];

function FaqItem({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-border/50">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-5 text-left"
      >
        <span className="pr-4 text-sm font-medium">{question}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-sm leading-relaxed text-muted-foreground">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FAQ() {
  return (
    <section id="faq" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-2xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-cyan-400">
            FAQ
          </p>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Common questions
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="divide-y-0"
        >
          {faqs.map((faq) => (
            <FaqItem
              key={faq.question}
              question={faq.question}
              answer={faq.answer}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
