
"use client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { generateTampermonkeyScript, copyToClipboard as copyUtil } from "@/lib/utils";
import type { Prompt } from "@/types";
import { FilePlus2, Copy, ExternalLink, AlertTriangle, Settings } from "lucide-react"; // Import Settings
import LogoIcon from "@/components/icons/LogoIcon";
import AuthStatus from "@/components/auth/AuthStatus";

interface AppHeaderProps {
  prompts: Prompt[];
  onAddNewPrompt: () => void;
  needsUpdate: boolean;
  setNeedsUpdate: (value: boolean) => void;
  onOpenSettings: () => void; // New prop
  tampermonkeyUrl: string; // New prop
}

export default function AppHeader({ 
  prompts, 
  onAddNewPrompt, 
  needsUpdate, 
  setNeedsUpdate,
  onOpenSettings,
  tampermonkeyUrl
}: AppHeaderProps) {
  const { toast } = useToast();

  const handleCopyScript = () => {
    const scriptString = generateTampermonkeyScript(prompts);
    copyUtil(
      scriptString,
      "Complete Tampermonkey script copied! Paste it into a new script in Tampermonkey.",
      "Failed to copy Tampermonkey script.",
      toast
    );
    setNeedsUpdate(false);
  };

  const handleCopyTmEditUrl = () => {
    if (!tampermonkeyUrl) {
      toast({
        title: 'URL Not Set',
        description: 'Please set your Tampermonkey URL in the settings first.',
        variant: 'destructive'
      });
      return;
    }
    copyUtil(
      tampermonkeyUrl,
      "Tampermonkey script edit URL copied.",
      "Failed to copy Tampermonkey edit URL.",
      toast
    );
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <LogoIcon className="h-7 w-7 text-primary" />
          <h1 className="text-2xl font-bold text-primary">Prompt Amplifier</h1>
        </div>
        <div className="flex items-center gap-2">
          <AuthStatus />
          <Button variant="ghost" size="icon" onClick={onOpenSettings} title="Settings">
            <Settings className="h-5 w-5" />
          </Button>
          <Button variant="outline" onClick={onAddNewPrompt}>
            <FilePlus2 className="mr-2 h-4 w-4" /> Add New Prompt
          </Button>
          <Button 
            onClick={handleCopyScript} 
            className={needsUpdate ? "animate-pulse-more ring-2 ring-accent ring-offset-2" : ""}
            title="Copy full Tampermonkey script with all prompts and UI logic"
          >
            {needsUpdate && <AlertTriangle className="mr-2 h-4 w-4 text-accent-foreground" />}
            <Copy className="mr-2 h-4 w-4" /> Copy Prompts for Script
          </Button>
          <Button 
            variant="secondary" 
            onClick={handleCopyTmEditUrl} 
            title="Copy your saved Tampermonkey Edit URL"
            disabled={!tampermonkeyUrl}
          >
            <ExternalLink className="mr-2 h-4 w-4" /> Copy TM Edit URL
          </Button>
        </div>
      </div>
    </header>
  );
}
