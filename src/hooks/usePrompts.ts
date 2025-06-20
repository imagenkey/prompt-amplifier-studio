
"use client";

import { useState, useCallback, useEffect, useMemo } from 'react';
import type { Prompt, PromptType } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  deleteField
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export function usePrompts() {
  const { currentUser } = useAuth();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [needsUpdate, setNeedsUpdate] = useState(false);

  const getPromptsCollectionRef = useCallback(() => {
    if (!currentUser?.uid) return null;
    return collection(db, "prompts");
  }, [currentUser?.uid]);

  useEffect(() => {
    if (currentUser?.uid) {
      setIsLoaded(false);
      const promptsColRef = getPromptsCollectionRef();
      if (!promptsColRef) {
        setPrompts([]);
        setIsLoaded(true);
        return;
      }

      const fetchPrompts = async () => {
        try {
          const q = query(promptsColRef, where("userId", "==", currentUser.uid));
          const querySnapshot = await getDocs(q);
          const userPromptsData = querySnapshot.docs.map(docSnap => {
            const data = docSnap.data();
            return {
              id: docSnap.id,
              title: data.title || '',
              type: data.type || 'APP_STARTER_PROMPT',
              content: data.content || '',
              category: data.category || '',
              userId: data.userId
            } as Prompt;
          });
          userPromptsData.sort((a, b) => a.title.localeCompare(b.title));
          setPrompts(userPromptsData);
        } catch (error) {
          console.error("Error fetching prompts: ", error);
        } finally {
          setIsLoaded(true);
        }
      };
      fetchPrompts();
    } else {
      setPrompts([]);
      setIsLoaded(true);
    }
  }, [currentUser, getPromptsCollectionRef]);

  const addPrompt = useCallback(async (newPromptData: Omit<Prompt, 'id' | 'userId'> & { category?: string }) => {
    if (!currentUser?.uid) {
      console.error("No user logged in to add prompt.");
      return;
    }
    const promptsColRef = getPromptsCollectionRef();
    if (!promptsColRef) {
      console.error("Prompts collection reference not available.");
      return;
    }

    const dataToSave: Omit<Prompt, 'id'> & { category?: string } = {
      ...newPromptData,
      userId: currentUser.uid,
    };

    if (newPromptData.category && newPromptData.category.trim() !== "") {
      dataToSave.category = newPromptData.category.trim();
    } else {
      delete dataToSave.category; 
    }

    try {
      const docRef = await addDoc(promptsColRef, dataToSave);
      const newPrompt = { ...dataToSave, id: docRef.id, category: dataToSave.category || '' } as Prompt;
      setPrompts(prev => [...prev, newPrompt].sort((a, b) => a.title.localeCompare(b.title)));
      setNeedsUpdate(true);
      return newPrompt;
    } catch (error) {
      console.error("Error adding prompt: ", error);
      return;
    }
  }, [currentUser, getPromptsCollectionRef]);

  const updatePrompt = useCallback(async (updatedPrompt: Prompt) => {
    if (!currentUser?.uid || !updatedPrompt.id) {
      console.error("User or prompt ID missing for update.");
      return;
    }
    const promptsColRef = getPromptsCollectionRef();
    if (!promptsColRef) {
      console.error("Prompts collection reference not available.");
      return;
    }

    try {
      const promptRef = doc(db, "prompts", updatedPrompt.id);

      const dataToUpdate: {
        title: string;
        type: PromptType;
        content: string;
        userId: string;
        category?: string | ReturnType<typeof deleteField>;
      } = {
        title: updatedPrompt.title,
        type: updatedPrompt.type,
        content: updatedPrompt.content,
        userId: currentUser.uid
      };

      if (updatedPrompt.category && updatedPrompt.category.trim() !== "") {
        dataToUpdate.category = updatedPrompt.category.trim();
      } else {
        dataToUpdate.category = deleteField();
      }

      await updateDoc(promptRef, dataToUpdate);

      const newLocalPrompt = {
        ...updatedPrompt,
        category: (updatedPrompt.category && updatedPrompt.category.trim() !== "") ? updatedPrompt.category.trim() : '',
      };

      setPrompts(prev => prev.map(p => p.id === updatedPrompt.id ? newLocalPrompt : p).sort((a,b) => a.title.localeCompare(b.title)));
      setNeedsUpdate(true);
    } catch (error) {
      console.error("Error updating prompt: ", error);
    }
  }, [currentUser, getPromptsCollectionRef, db]);

  const deletePrompt = useCallback(async (promptId: string) => {
    if (!currentUser?.uid || !promptId) {
      console.error("User or prompt ID missing for delete.");
      return;
    }
    const promptsColRef = getPromptsCollectionRef();
    if (!promptsColRef) {
      console.error("Prompts collection reference not available.");
      return;
    }

    try {
      const promptRef = doc(db, "prompts", promptId);
      await deleteDoc(promptRef);
      setPrompts(prev => prev.filter(p => p.id !== promptId));
      setNeedsUpdate(true);
    } catch (error) {
      console.error("Error deleting prompt: ", error);
    }
  }, [currentUser, getPromptsCollectionRef, db]);

  const getPromptsByType = useCallback((type: PromptType) => {
    return prompts.filter(p => p.type === type);
  }, [prompts]);

  const getUniqueCategories = useMemo(() => {
    const categories = new Set<string>();
    prompts.forEach(prompt => {
      if (prompt.category && prompt.category.trim() !== "") {
        categories.add(prompt.category.trim());
      }
    });
    return Array.from(categories).sort((a,b) => a.localeCompare(b));
  }, [prompts]);

  return {
    prompts,
    addPrompt,
    updatePrompt,
    deletePrompt,
    getPromptsByType,
    getUniqueCategories,
    isLoaded,
    needsUpdate,
    setNeedsUpdate
  };
}
