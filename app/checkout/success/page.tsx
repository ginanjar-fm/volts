"use client";

import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function CheckoutSuccessPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10">
            <CheckCircle className="size-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Payment Successful!</CardTitle>
        </CardHeader>
        <CardContent className="text-center text-muted-foreground">
          <p>
            Thank you for your purchase. Your account has been upgraded and
            you now have access to all features included in your plan.
          </p>
        </CardContent>
        <CardFooter className="justify-center gap-3">
          <Link href="/dashboard/billing">
            <Button>View Billing</Button>
          </Link>
          <Link href="/">
            <Button variant="outline">Go Home</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
