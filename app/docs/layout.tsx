import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { source } from "@/lib/source";
import { RootProvider } from "fumadocs-ui/provider/next";
import type { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <RootProvider>
      <DocsLayout
        tree={source.getPageTree()}
        nav={{
          title: "Volts Docs",
        }}
      >
        {children}
      </DocsLayout>
    </RootProvider>
  );
}
