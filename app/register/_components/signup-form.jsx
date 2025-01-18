"use client";

import Link from "next/link";

import { AlertDestructive } from "@/components/alert-destructive";
import { ButtonLoading } from "@/components/button-loading";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function SignupForm({ role }) {
  const router = useRouter();

  const [loader, setLoader] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (event) => {
    event.preventDefault();
    setLoader(true);

    try {
      const formData = new FormData(event.currentTarget);

      const firstName = formData.get("first-name");
      const lastName = formData.get("last-name");
      const email = formData.get("email");
      const password = formData.get("password");
      const confirmPassword = formData.get("confirmPassword");

      const userRole = role === "student" || "instructor" ? role : "student";

      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password,
          confirmPassword,
          userRole,
        }),
      });

      const responseText = await response.text();

      if (response.ok) {
        setError("");
        router.push("/login");
      } else {
        setError(responseText);
      }

      // response.status === 201 && router.push("/login");
    } catch (e) {
      console.log(e.message);
    } finally {
      setLoader(false);
    }
  };

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-xl">Sign Up</CardTitle>
        <CardDescription>
          Enter your information to create an account
        </CardDescription>
        {error && <AlertDestructive>{error}</AlertDestructive>}
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit}>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="first-name">First name</Label>
                <Input
                  id="first-name"
                  name="first-name"
                  placeholder="Max"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="last-name">Last name</Label>
                <Input
                  id="last-name"
                  name="last-name"
                  placeholder="Robinson"
                  required
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="m@example.com"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
              />
            </div>
            {loader ? (
              <ButtonLoading />
            ) : (
              <Button type="submit" className="w-full">
                Create an account
              </Button>
            )}
          </div>
        </form>
        <div className="mt-4 text-center text-sm">
          Already have an account?{" "}
          <Link href="/login" className="underline">
            Sign in
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}