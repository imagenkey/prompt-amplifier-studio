
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Prompt, PromptType } from "@/types";
import { PROMPT_TYPES, PROMPT_TYPE_NAMES } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { suggestPromptName, SuggestPromptNameInput } from "@/ai/flows/suggest-prompt-name";
import { usePrompts } from "@/hooks/usePrompts"; // Import usePrompts
import { Loader2, Wand2 } from "lucide-react";
import { CreatableCombobox } from "@/components/ui/creatable-combobox";

interface PromptFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (prompt: Prompt | Omit<Prompt, 'id'>) => void;
  prompt?: Prompt; // Existing prompt for editing
}

export default function PromptFormDialog({ isOpen, onClose, onSave, prompt }: PromptFormDialogProps) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<PromptType>(PROMPT_TYPES.SYSTEM as PromptType);
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [isSuggestingName, setIsSuggestingName] = useState(false);
  const { toast } = useToast();
  const { getUniqueCategories } = usePrompts(); // Get unique categories

  const uniqueCategories = getUniqueCategories; // Use directly from the hook

  useEffect(() => {
    if (prompt) {
      setTitle(prompt.title);
      setType(prompt.type);
      setContent(prompt.content);
      setCategory(prompt.category || "");
    } else {
      // Reset for new prompt
      setTitle("");
      setType(PROMPT_TYPES.SYSTEM as PromptType);
      setContent("");
      setCategory("");
    }
  }, [prompt, isOpen]);

  const handleSuggestName = async () => {
    if (!content.trim()) {
      toast({
        title: "Content required",
        description: "Please enter some prompt content before suggesting a name.",
        variant: "destructive",
      });
      return;
    }
    setIsSuggestingName(true);
    try {
      const input: SuggestPromptNameInput = { promptContent: content };
      const result = await suggestPromptName(input);
      if (result.promptName) {
        setTitle(result.promptName);
        toast({
          title: "Name Suggested",
          description: `AI suggested name: "${result.promptName}"`,
        });
      } else {
         toast({ title: "Suggestion Failed", description: "AI could not suggest a name.", variant: "destructive" });
      }
    } catch (error) {
      console.error("Error suggesting prompt name:", error);
      toast({
        title: "Error",
        description: "Failed to suggest a name. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSuggestingName(false);
    }
  };

  const handleSubmit = () => {
    if (!title.trim() || !content.trim()) {
      toast({
        title: "Validation Error",
        description: "Title and Content cannot be empty.",
        variant: "destructive",
      });
      return;
    }
    const trimmedCategory = category.trim();
    const promptData = { 
      title, 
      type, 
      content, 
      category: trimmedCategory || undefined 
    };
    if (prompt && prompt.id) {
      onSave({ ...promptData, id: prompt.id });
    } else {
      onSave(promptData);
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] bg-card text-card-foreground">
        <DialogHeader>
          <DialogTitle>{prompt ? "Edit Prompt" : "Add New Prompt"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Title
            </Label>
            <div className="col-span-3 flex items-center gap-2">
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="flex-grow"
                placeholder="Enter prompt title"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleSuggestName}
                disabled={isSuggestingName}
                title="Suggest name with AI (in Japanese)"
              >
                {isSuggestingName ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right">
              Type
            </Label>
            <Select value={type} onValueChange={(value: string) => setType(value as PromptType)}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select prompt type" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(PROMPT_TYPES).map((promptTypeKey) => (
                  <SelectItem key={promptTypeKey} value={promptTypeKey}>
                    {PROMPT_TYPE_NAMES[promptTypeKey as PromptType]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">
              Category
            </Label>
            <div className="col-span-3">
              <CreatableCombobox
                value={category}
                onChange={setCategory}
                options={uniqueCategories.map(cat => ({ value: cat, label: cat }))}
                placeholder="Select or create a category"
              />
            </div>
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="content" className="text-right pt-2">
              Content
            </Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="col-span-3 min-h-[200px] font-code"
              placeholder="Enter prompt content here..."
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit" onClick={handleSubmit}>Save Prompt</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
