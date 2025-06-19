"use client";

import type { Prompt } from "@/types";
import PromptCard from "./PromptCard";

interface PromptListProps {
  prompts: Prompt[];
  onEditPrompt: (prompt: Prompt) => void;
  onDeletePrompt: (promptId: string) => void;
}

export default function PromptList({ prompts, onEditPrompt, onDeletePrompt }: PromptListProps) {
  if (prompts.length === 0) {
    return <p className="text-muted-foreground italic text-center py-8">No prompts in this category yet.</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {prompts.map((prompt) => (
        <PromptCard
          key={prompt.id}
          prompt={prompt}
          onEdit={onEditPrompt}
          onDelete={onDeletePrompt}
        />
      ))}
    </div>
  );
}
