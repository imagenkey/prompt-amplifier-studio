
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { Prompt } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { copyToClipboard as copyUtil } from "@/lib/utils";
import { Edit3, Trash2, Copy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PromptCardProps {
  prompt: Prompt;
  onEdit: (prompt: Prompt) => void;
  onDelete: (promptId: string) => void;
}

// Predefined styles for categories
const categoryStyles = [
  { card: "bg-sky-50 border-sky-200 hover:border-sky-300 dark:bg-sky-900/30 dark:border-sky-700 dark:hover:border-sky-600", badge: "bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-800 dark:text-sky-100 dark:border-sky-700" },
  { card: "bg-emerald-50 border-emerald-200 hover:border-emerald-300 dark:bg-emerald-900/30 dark:border-emerald-700 dark:hover:border-emerald-600", badge: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-800 dark:text-emerald-100 dark:border-emerald-700" },
  { card: "bg-amber-50 border-amber-200 hover:border-amber-300 dark:bg-amber-900/30 dark:border-amber-700 dark:hover:border-amber-600", badge: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-800 dark:text-amber-100 dark:border-amber-700" },
  { card: "bg-rose-50 border-rose-200 hover:border-rose-300 dark:bg-rose-900/30 dark:border-rose-700 dark:hover:border-rose-600", badge: "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-800 dark:text-rose-100 dark:border-rose-700" },
  { card: "bg-violet-50 border-violet-200 hover:border-violet-300 dark:bg-violet-900/30 dark:border-violet-700 dark:hover:border-violet-600", badge: "bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-800 dark:text-violet-100 dark:border-violet-700" },
  { card: "bg-pink-50 border-pink-200 hover:border-pink-300 dark:bg-pink-900/30 dark:border-pink-700 dark:hover:border-pink-600", badge: "bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-800 dark:text-pink-100 dark:border-pink-700" },
  { card: "bg-teal-50 border-teal-200 hover:border-teal-300 dark:bg-teal-900/30 dark:border-teal-700 dark:hover:border-teal-600", badge: "bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-800 dark:text-teal-100 dark:border-teal-700" },
  { card: "bg-fuchsia-50 border-fuchsia-200 hover:border-fuchsia-300 dark:bg-fuchsia-900/30 dark:border-fuchsia-700 dark:hover:border-fuchsia-600", badge: "bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200 dark:bg-fuchsia-800 dark:text-fuchsia-100 dark:border-fuchsia-700" },
  { card: "bg-indigo-50 border-indigo-200 hover:border-indigo-300 dark:bg-indigo-900/30 dark:border-indigo-700 dark:hover:border-indigo-600", badge: "bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-800 dark:text-indigo-100 dark:border-indigo-700" },
  { card: "bg-lime-50 border-lime-200 hover:border-lime-300 dark:bg-lime-900/30 dark:border-lime-700 dark:hover:border-lime-600", badge: "bg-lime-100 text-lime-800 border-lime-200 dark:bg-lime-800 dark:text-lime-100 dark:border-lime-700" },
];

function getCategoryStyle(categoryName?: string): { card: string; badge: string } | null {
  if (!categoryName || categoryName.trim() === "") {
    return null;
  }
  let hash = 0;
  for (let i = 0; i < categoryName.length; i++) {
    const char = categoryName.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  const index = Math.abs(hash) % categoryStyles.length;
  return categoryStyles[index];
}


export default function PromptCard({ prompt, onEdit, onDelete }: PromptCardProps) {
  const { toast } = useToast();

  const handleCopyContent = () => {
    copyUtil(
      prompt.content,
      `Content of '${prompt.title}' copied.`,
      `Failed to copy content of '${prompt.title}'.`,
      toast
    );
  };

  const currentCategoryStyle = getCategoryStyle(prompt.category);

  return (
    <Card className={cn(
      "flex flex-col h-full shadow-lg hover:shadow-xl transition-shadow duration-300",
      currentCategoryStyle ? currentCategoryStyle.card : "bg-card dark:bg-card" // Apply category-specific card class or default
    )}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg truncate" title={prompt.title}>{prompt.title}</CardTitle>
          {prompt.category && (
            <Badge 
              className={cn(
                "ml-2 whitespace-nowrap shrink-0",
                currentCategoryStyle ? currentCategoryStyle.badge : "" // Apply category-specific badge class
              )}
              variant={!currentCategoryStyle ? "secondary" : undefined} // Use "secondary" if no specific style
            >
              {prompt.category}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden">
        <p className="text-sm text-muted-foreground line-clamp-3 font-code" title={prompt.content}>
          {prompt.content}
        </p>
      </CardContent>
      <CardFooter className="flex justify-end gap-2 pt-4 border-t">
        <Button variant="ghost" size="sm" onClick={handleCopyContent} title="Copy Content">
          <Copy className="mr-1 h-4 w-4" /> Copy
        </Button>
        <Button variant="outline" size="sm" onClick={() => onEdit(prompt)} title="Edit Prompt">
          <Edit3 className="mr-1 h-4 w-4" /> Edit
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm" title="Delete Prompt">
              <Trash2 className="mr-1 h-4 w-4" /> Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the prompt titled "{prompt.title}".
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => onDelete(prompt.id)}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
}
