
"use client";

import { useState, useCallback, useEffect } from 'react';
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
  orderBy,
  where
} from 'firebase/firestore';
import { db } from '@/lib/firebase'; // Import db from firebase setup

const generateIdForLocalFallback = () => 'prompt_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 7);

export function usePrompts() {
  const { currentUser } = useAuth();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [needsUpdate, setNeedsUpdate] = useState(false);

  const getPromptsCollectionRef = useCallback(() => {
    if (!currentUser?.uid) return null;
    // Prompts will be stored in a subcollection under the user's document
    // or a top-level collection filtered by userId.
    // Let's use a top-level collection 'prompts' and filter by userId.
    // This allows for easier admin access if needed later.
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
          // Query prompts for the current user, ordered by title
          const q = query(promptsColRef, where("userId", "==", currentUser.uid), orderBy("title"));
          const querySnapshot = await getDocs(q);
          const userPrompts = querySnapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as Prompt));
          setPrompts(userPrompts);
        } catch (error) {
          console.error("Error fetching prompts: ", error);
          // TODO: Show toast for error fetching prompts
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

  const addPrompt = useCallback(async (newPromptData: Omit<Prompt, 'id'>) => {
    if (!currentUser?.uid) {
      console.error("No user logged in to add prompt.");
      // TODO: Show toast or error message
      return;
    }
    const promptsColRef = getPromptsCollectionRef();
    if (!promptsColRef) {
      console.error("Prompts collection reference not available.");
      return;
    }

    const promptWithUser = { ...newPromptData, userId: currentUser.uid };
    
    try {
      // Firestore will generate the ID
      const docRef = await addDoc(promptsColRef, promptWithUser);
      const newPrompt = { ...promptWithUser, id: docRef.id };
      setPrompts(prev => [...prev, newPrompt].sort((a, b) => a.title.localeCompare(b.title)));
      setNeedsUpdate(true);
      return newPrompt;
    } catch (error) {
      console.error("Error adding prompt: ", error);
      // TODO: Handle error (e.g., show toast)
      return;
    }
  }, [currentUser, getPromptsCollectionRef]);

  const updatePrompt = useCallback(async (updatedPrompt: Prompt) => {
    if (!currentUser?.uid || !updatedPrompt.id) {
      console.error("User or prompt ID missing for update.");
      // TODO: Show toast or error message
      return;
    }
    const promptsColRef = getPromptsCollectionRef();
    if (!promptsColRef) {
      console.error("Prompts collection reference not available.");
      return;
    }
    
    try {
      const promptRef = doc(db, "prompts", updatedPrompt.id);
      // Ensure userId is not accidentally changed or removed if it's part of updatedPrompt
      const dataToUpdate = { ...updatedPrompt, userId: currentUser.uid };
      delete (dataToUpdate as any).id; // Do not store id field itself in the document if id is the doc id

      await updateDoc(promptRef, dataToUpdate);
      setPrompts(prev => prev.map(p => p.id === updatedPrompt.id ? { ...dataToUpdate, id: updatedPrompt.id } : p).sort((a,b) => a.title.localeCompare(b.title)));
      setNeedsUpdate(true);
    } catch (error) {
      console.error("Error updating prompt: ", error);
      // TODO: Handle error
    }
  }, [currentUser, getPromptsCollectionRef]);

  const deletePrompt = useCallback(async (promptId: string) => {
    if (!currentUser?.uid || !promptId) {
      console.error("User or prompt ID missing for delete.");
      // TODO: Show toast or error message
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
      // TODO: Handle error
    }
  }, [currentUser, getPromptsCollectionRef]);

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
