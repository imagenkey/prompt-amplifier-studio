
"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import { HelpCircle, FilePlus2, Copy, Rocket, Settings } from "lucide-react";

interface HelpDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  trigger?: React.ReactNode;
}

export function HelpDialog({ isOpen, onOpenChange, trigger }: HelpDialogProps) {
  const content = (
    <div className="space-y-6 text-sm">
      <h3 className="text-lg font-semibold text-primary">🚀 Quick Start Guide</h3>
      <p>
        Welcome to Prompt Amplifier! This guide will walk you through turning your LLMs (like ChatGPT or Gemini) into specialized "apps" with your own custom prompts.
      </p>

      <ol className="space-y-4 list-decimal list-inside">
        <li>
          <div className="font-semibold flex items-center gap-2"><FilePlus2 className="h-5 w-5 text-primary" /> Create Your Prompts</div>
          <p className="ml-7 text-muted-foreground">
            Use the "Add New Prompt" button to create powerful, reusable prompts. Organize them with categories to build your personal library.
          </p>
        </li>
        <li>
          <div className="font-semibold flex items-center gap-2"><Copy className="h-5 w-5 text-primary" /> Copy the Tampermonkey Script</div>
          <p className="ml-7 text-muted-foreground">
            Once you have some prompts, click the main "Copy Prompts for Script" button in the header. This generates and copies a complete Tampermonkey script containing all your prompts and the necessary UI logic.
          </p>
        </li>
        <li>
          <div className="font-semibold flex items-center gap-2"><Rocket className="h-5 w-5 text-primary" /> Install in Tampermonkey</div>
          <p className="ml-7 text-muted-foreground">
            Open your Tampermonkey extension dashboard, create a new script, and paste the code you just copied. Save it.
          </p>
        </li>
        <li>
          <div className="font-semibold flex items-center gap-2"><Settings className="h-5 w-5 text-primary" /> (Optional but Recommended) Set your Script URL</div>
          <p className="ml-7 text-muted-foreground">
            After saving the script in Tampermonkey, copy its edit URL from your browser's address bar. Click the <Settings className="inline h-4 w-4" /> icon in this app's header, paste the URL in the Settings dialog, and save. This lets you quickly copy your edit URL later.
          </p>
        </li>
      </ol>

      <h3 className="text-lg font-semibold text-primary">What Happens Next?</h3>
      <p>
        Visit a supported LLM site (like ChatGPT, Gemini, etc.). You'll see a new floating panel with your prompts. Click a button to see your prompt list, then click a prompt to instantly copy its content.
      </p>
    </div>
  );

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      {trigger && <SheetTrigger asChild>{trigger}</SheetTrigger>}
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>How to Use Prompt Amplifier</SheetTitle>
          <SheetDescription>
            A quick guide to get you started.
          </SheetDescription>
        </SheetHeader>
        <div className="py-4">
          {content}
        </div>
      </SheetContent>
    </Sheet>
  );
}
