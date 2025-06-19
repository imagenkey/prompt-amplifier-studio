"use client";

import { useState, useCallback, useEffect } from 'react';
import type { Prompt, PromptType } from '@/types';
import { initialMockPrompts } from '@/lib/mock-prompts';

const generateId = () => 'prompt_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 7);

export function usePrompts() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [needsUpdate, setNeedsUpdate] = useState(false);

  useEffect(() => {
    const loadedPrompts = initialMockPrompts.map(p => ({...p, id: p.id || generateId()}));
    setPrompts(loadedPrompts);
    setIsLoaded(true);
  }, []);

  const addPrompt = useCallback((newPromptData: Omit<Prompt, 'id'>) => {
    const promptWithId = { ...newPromptData, id: generateId() };
    setPrompts(prev => [...prev, promptWithId]);
    setNeedsUpdate(true);
    return promptWithId;
  }, []);

  const updatePrompt = useCallback((updatedPrompt: Prompt) => {
    setPrompts(prev => prev.map(p => p.id === updatedPrompt.id ? updatedPrompt : p));
    setNeedsUpdate(true);
  }, []);

  const deletePrompt = useCallback((promptId: string) => {
    setPrompts(prev => prev.filter(p => p.id !== promptId));
    setNeedsUpdate(true);
  }, []);

  const getPromptsByType = useCallback((type: PromptType) => {
    return prompts.filter(p => p.type === type);
  }, [prompts]);

  return { 
    prompts, 
    addPrompt, 
    updatePrompt, 
    deletePrompt, 
    getPromptsByType,
    isLoaded, 
    needsUpdate, 
    setNeedsUpdate 
  };
}
