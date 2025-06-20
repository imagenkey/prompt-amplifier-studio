
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

  return (
    <Card className={cn(
      "flex flex-col h-full shadow-lg hover:shadow-xl transition-shadow duration-300",
      prompt.category ? "bg-secondary/30" : ""
    )}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg truncate" title={prompt.title}>{prompt.title}</CardTitle>
          {prompt.category && (
            <Badge variant="secondary" className="ml-2 whitespace-nowrap shrink-0">
              {prompt.category}
            </Badge>
          )}
        </div>
        {/* Redundant prompt type description removed as requested */}
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
