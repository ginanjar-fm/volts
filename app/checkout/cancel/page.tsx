"use client";

import Link from "next/link";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function CheckoutCancelPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-destructive/10">
            <XCircle className="size-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Payment Cancelled</CardTitle>
        </CardHeader>
        <CardContent className="text-center text-muted-foreground">
          <p>
            Your payment was cancelled. No charges were made. You can try
            again whenever you&apos;re ready.
          </p>
        </CardContent>
        <CardFooter className="justify-center gap-3">
          <Link href="/pricing">
            <Button>Back to Pricing</Button>
          </Link>
          <Link href="/">
            <Button variant="outline">Go Home</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
