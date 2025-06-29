
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
import { Edit3, Trash2, Copy, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PromptCardProps {
  prompt: Prompt;
  onEdit: (prompt: Prompt) => void;
  onDelete: (promptId: string) => void;
  onIncrementCopyCount: (promptId: string) => void;
}

// Predefined styles for categories - Expanded to 15+
const categoryStyles = [
  // Blues
  { card: "bg-sky-50 border-sky-200 hover:border-sky-300 dark:bg-sky-900/30 dark:border-sky-700 dark:hover:border-sky-600", badge: "bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-800 dark:text-sky-100 dark:border-sky-700" },
  { card: "bg-blue-50 border-blue-200 hover:border-blue-300 dark:bg-blue-900/30 dark:border-blue-700 dark:hover:border-blue-600", badge: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-800 dark:text-blue-100 dark:border-blue-700" },
  { card: "bg-indigo-50 border-indigo-200 hover:border-indigo-300 dark:bg-indigo-900/30 dark:border-indigo-700 dark:hover:border-indigo-600", badge: "bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-800 dark:text-indigo-100 dark:border-indigo-700" },
  // Greens
  { card: "bg-emerald-50 border-emerald-200 hover:border-emerald-300 dark:bg-emerald-900/30 dark:border-emerald-700 dark:hover:border-emerald-600", badge: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-800 dark:text-emerald-100 dark:border-emerald-700" },
  { card: "bg-green-50 border-green-200 hover:border-green-300 dark:bg-green-900/30 dark:border-green-700 dark:hover:border-green-600", badge: "bg-green-100 text-green-800 border-green-200 dark:bg-green-800 dark:text-green-100 dark:border-green-700" },
  { card: "bg-lime-50 border-lime-200 hover:border-lime-300 dark:bg-lime-900/30 dark:border-lime-700 dark:hover:border-lime-600", badge: "bg-lime-100 text-lime-800 border-lime-200 dark:bg-lime-800 dark:text-lime-100 dark:border-lime-700" },
  { card: "bg-teal-50 border-teal-200 hover:border-teal-300 dark:bg-teal-900/30 dark:border-teal-700 dark:hover:border-teal-600", badge: "bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-800 dark:text-teal-100 dark:border-teal-700" },
  { card: "bg-cyan-50 border-cyan-200 hover:border-cyan-300 dark:bg-cyan-900/30 dark:border-cyan-700 dark:hover:border-cyan-600", badge: "bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-800 dark:text-cyan-100 dark:border-cyan-700" },
  // Yellows/Oranges
  { card: "bg-amber-50 border-amber-200 hover:border-amber-300 dark:bg-amber-900/30 dark:border-amber-700 dark:hover:border-amber-600", badge: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-800 dark:text-amber-100 dark:border-amber-700" },
  { card: "bg-yellow-50 border-yellow-200 hover:border-yellow-300 dark:bg-yellow-900/30 dark:border-yellow-700 dark:hover:border-yellow-600", badge: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-800 dark:text-yellow-100 dark:border-yellow-700" },
  { card: "bg-orange-50 border-orange-200 hover:border-orange-300 dark:bg-orange-900/30 dark:border-orange-700 dark:hover:border-orange-600", badge: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-800 dark:text-orange-100 dark:border-orange-700" },
  // Reds/Pinks/Purples
  { card: "bg-rose-50 border-rose-200 hover:border-rose-300 dark:bg-rose-900/30 dark:border-rose-700 dark:hover:border-rose-600", badge: "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-800 dark:text-rose-100 dark:border-rose-700" },
  { card: "bg-red-50 border-red-200 hover:border-red-300 dark:bg-red-900/30 dark:border-red-700 dark:hover:border-red-600", badge: "bg-red-100 text-red-800 border-red-200 dark:bg-red-800 dark:text-red-100 dark:border-red-700" },
  { card: "bg-pink-50 border-pink-200 hover:border-pink-300 dark:bg-pink-900/30 dark:border-pink-700 dark:hover:border-pink-600", badge: "bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-800 dark:text-pink-100 dark:border-pink-700" },
  { card: "bg-fuchsia-50 border-fuchsia-200 hover:border-fuchsia-300 dark:bg-fuchsia-900/30 dark:border-fuchsia-700 dark:hover:border-fuchsia-600", badge: "bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200 dark:bg-fuchsia-800 dark:text-fuchsia-100 dark:border-fuchsia-700" },
  { card: "bg-purple-50 border-purple-200 hover:border-purple-300 dark:bg-purple-900/30 dark:border-purple-700 dark:hover:border-purple-600", badge: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-800 dark:text-purple-100 dark:border-purple-700" },
  { card: "bg-violet-50 border-violet-200 hover:border-violet-300 dark:bg-violet-900/30 dark:border-violet-700 dark:hover:border-violet-600", badge: "bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-800 dark:text-violet-100 dark:border-violet-700" },
  // Grays (less colorful, for more neutral categories if needed)
  { card: "bg-slate-50 border-slate-200 hover:border-slate-300 dark:bg-slate-900/30 dark:border-slate-700 dark:hover:border-slate-600", badge: "bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700" },
  { card: "bg-gray-50 border-gray-200 hover:border-gray-300 dark:bg-gray-900/30 dark:border-gray-700 dark:hover:border-gray-600", badge: "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700" },
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


export default function PromptCard({ prompt, onEdit, onDelete, onIncrementCopyCount }: PromptCardProps) {
  const { toast } = useToast();

  const handleCopyContent = () => {
    copyUtil(
      prompt.content,
      `Content of '${prompt.title}' copied.`,
      `Failed to copy content of '${prompt.title}'.`,
      toast
    );
    onIncrementCopyCount(prompt.id);
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
      <CardFooter className="flex justify-between items-center gap-2 pt-4 border-t">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <TrendingUp className="h-4 w-4" />
          <span>{prompt.copyCount || 0}</span>
        </div>
        <div className="flex gap-2">
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
        </div>
      </CardFooter>
    </Card>
  );
}
