
"use client";

import { useState } from "react";
import { usePrompts } from "@/hooks/usePrompts";
import PromptCategorySection from "./PromptCategorySection";
import PromptFormDialog from "./PromptFormDialog";
import SettingsDialog from "./SettingsDialog";
import { HelpDialog } from "@/components/layout/HelpDialog";
import type { Prompt } from "@/types";
import { PROMPT_TYPES, PROMPT_TYPE_NAMES } from "@/types";
import AppHeader from "@/components/layout/AppHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserPreferences } from "@/hooks/useUserPreferences";

export default function PromptWorkspace() {
  const { 
    prompts, 
    addPrompt, 
    updatePrompt, 
    deletePrompt, 
    incrementCopyCount,
    getPromptsByType,
    isLoaded,
    needsUpdate,
    setNeedsUpdate
  } = usePrompts();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | undefined>(undefined);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const { tampermonkeyUrl, isLoaded: prefsLoaded } = useUserPreferences();

  const handleOpenForm = (prompt?: Prompt) => {
    setEditingPrompt(prompt);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingPrompt(undefined);
  };

  const handleSavePrompt = (promptData: Prompt | Omit<Prompt, 'id'>) => {
    if ('id' in promptData) {
      updatePrompt(promptData as Prompt);
    } else {
      addPrompt(promptData);
    }
  };

  if (!isLoaded || !prefsLoaded) {
    return (
      <div className="flex flex-col flex-grow">
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between">
                <div className="flex items-center gap-2">
                    <Skeleton className="h-7 w-7 rounded-full" />
                    <Skeleton className="h-6 w-48" />
                </div>
                <div className="flex items-center gap-2">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <Skeleton className="h-10 w-40" />
                    <Skeleton className="h-10 w-48" />
                    <Skeleton className="h-10 w-48" />
                </div>
            </div>
        </header>
        <main className="container mx-auto px-4 py-8 flex-grow">
          <div className="mb-12">
            <Skeleton className="h-8 w-1/4 mb-6" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1,2,3].map(i => <Skeleton key={i} className="h-48 rounded-lg" />)}
            </div>
          </div>
           <div>
            <Skeleton className="h-8 w-1/3 mb-6" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1,2].map(i => <Skeleton key={i} className="h-48 rounded-lg" />)}
            </div>
          </div>
        </main>
      </div>
    );
  }

  const systemPrompts = getPromptsByType(PROMPT_TYPES.SYSTEM as 'SYSTEM_PROMPT');
  const appStarterPrompts = getPromptsByType(PROMPT_TYPES.APP_STARTER as 'APP_STARTER_PROMPT');
  const quickActionPrompts = getPromptsByType(PROMPT_TYPES.QUICK_ACTION as 'QUICK_ACTION');

  return (
    <div className="flex flex-col flex-grow">
      <AppHeader 
        prompts={prompts} 
        onAddNewPrompt={() => handleOpenForm()}
        needsUpdate={needsUpdate}
        setNeedsUpdate={setNeedsUpdate}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
        tampermonkeyUrl={tampermonkeyUrl}
      />
      <main className="container mx-auto px-4 py-8 flex-grow">
        <PromptCategorySection
          title={PROMPT_TYPE_NAMES.QUICK_ACTION}
          prompts={quickActionPrompts}
          promptType={PROMPT_TYPES.QUICK_ACTION as 'QUICK_ACTION'}
          onEditPrompt={handleOpenForm}
          onDeletePrompt={deletePrompt}
          onIncrementCopyCount={incrementCopyCount}
        />
        <PromptCategorySection
          title={PROMPT_TYPE_NAMES.SYSTEM_PROMPT}
          prompts={systemPrompts}
          promptType={PROMPT_TYPES.SYSTEM as 'SYSTEM_PROMPT'}
          onEditPrompt={handleOpenForm}
          onDeletePrompt={deletePrompt}
          onIncrementCopyCount={incrementCopyCount}
        />
        <PromptCategorySection
          title={PROMPT_TYPE_NAMES.APP_STARTER_PROMPT}
          prompts={appStarterPrompts}
          promptType={PROMPT_TYPES.APP_STARTER as 'APP_STARTER_PROMPT'}
          onEditPrompt={handleOpenForm}
          onDeletePrompt={deletePrompt}
          onIncrementCopyCount={incrementCopyCount}
        />
      </main>
      <PromptFormDialog
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSave={handleSavePrompt}
        prompt={editingPrompt}
      />
      <SettingsDialog
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
      <HelpDialog
        isOpen={isHelpOpen}
        onOpenChange={setIsHelpOpen}
      />
       <footer className="py-6 md:px-8 md:py-0 border-t bg-background/80">
          <div className="container flex flex-col items-center justify-center gap-4 md:h-20 md:flex-row">
            <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
              Built with love for prompt engineering.
            </p>
          </div>
        </footer>
    </div>
  );
}
