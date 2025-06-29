"use client";

import type { Prompt, PromptType } from "@/types";
import { PROMPT_TEMPLATES, PROMPT_TYPE_NAMES } from "@/types";
import PromptList from "./PromptList";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { copyToClipboard as copyUtil } from "@/lib/utils";
import { CopyPlus } from "lucide-react";

interface PromptCategorySectionProps {
  title: string;
  prompts: Prompt[];
  promptType: PromptType;
  onEditPrompt: (prompt: Prompt) => void;
  onDeletePrompt: (promptId: string) => void;
  onIncrementCopyCount: (promptId: string) => void;
}

export default function PromptCategorySection({ title, prompts, promptType, onEditPrompt, onDeletePrompt, onIncrementCopyCount }: PromptCategorySectionProps) {
  const { toast } = useToast();

  const handleCopyTemplate = () => {
    const templateString = PROMPT_TEMPLATES[promptType];
    const templateName = PROMPT_TYPE_NAMES[promptType];
    copyUtil(
      templateString,
      `${templateName} template copied. Paste it into your Tampermonkey script's initialPrompts array and edit.`,
      `Failed to copy ${templateName} template.`,
      toast
    );
  };
  
  return (
    <section className="mb-12">
      <div className="flex justify-between items-center mb-6 pb-2 border-b">
        <h2 className="text-3xl font-semibold">{title}</h2>
        <Button variant="outline" onClick={handleCopyTemplate}>
         <CopyPlus className="mr-2 h-4 w-4" /> Copy {PROMPT_TYPE_NAMES[promptType]} Template
        </Button>
      </div>
      <PromptList
        prompts={prompts}
        onEditPrompt={onEditPrompt}
        onDeletePrompt={onDeletePrompt}
        onIncrementCopyCount={onIncrementCopyCount}
      />
    </section>
  );
}
