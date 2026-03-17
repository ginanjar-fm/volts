"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const errors: Record<string, string> = {
  Configuration: "There is a problem with the server configuration.",
  AccessDenied: "Access denied. You do not have permission to sign in.",
  Verification: "The verification link has expired or has already been used.",
  Default: "An unexpected error occurred.",
};

export default function AuthErrorPage() {
  return (
    <Suspense>
      <AuthErrorContent />
    </Suspense>
  );
}

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const errorType = searchParams.get("error") ?? "Default";
  const message = errors[errorType] ?? errors.Default;

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Authentication Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{message}</p>
        </CardContent>
        <CardFooter>
          <Link href="/auth/signin" className="w-full">
            <Button variant="outline" className="w-full">
              Back to sign in
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
