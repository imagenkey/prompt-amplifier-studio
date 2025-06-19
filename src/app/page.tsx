
"use client";

import PromptWorkspace from "@/components/prompts/PromptWorkspace";
import { useAuth } from "@/contexts/AuthContext";
import LoginForm from "@/components/auth/LoginForm";
import SignUpForm from "@/components/auth/SignUpForm";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import LogoIcon from "@/components/icons/LogoIcon";

export default function HomePage() {
  const { currentUser, loading } = useAuth();
  const [showLogin, setShowLogin] = useState(true);

  if (loading) {
    return (
      <div className="flex flex-col flex-grow items-center justify-center min-h-screen bg-background">
        <LogoIcon className="h-16 w-16 text-primary animate-pulse" />
        <p className="text-muted-foreground mt-4">Loading...</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="flex flex-col flex-grow items-center justify-center min-h-screen bg-gradient-to-br from-background to-secondary/30 p-4">
        <Card className="w-full max-w-md shadow-2xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <LogoIcon className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-3xl font-bold text-primary">Welcome to Prompt Amplifier</CardTitle>
            <CardDescription className="text-muted-foreground">
              {showLogin ? "Log in to manage your prompts." : "Sign up to get started."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {showLogin ? <LoginForm /> : <SignUpForm />}
            <Button variant="link" onClick={() => setShowLogin(!showLogin)} className="mt-4 w-full">
              {showLogin ? "Need an account? Sign Up" : "Already have an account? Log In"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
      <PromptWorkspace />
  );
}
