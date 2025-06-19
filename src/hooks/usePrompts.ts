
"use client";

import { useState, useCallback, useEffect } from 'react';
import type { Prompt, PromptType } from '@/types';
// import { initialMockPrompts } from '@/lib/mock-prompts'; // Will be replaced by Firestore
import { useAuth } from '@/contexts/AuthContext'; // TODO: Implement AuthContext
// TODO: Import Firebase Firestore functions: getFirestore, collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where, orderBy

const generateId = () => 'prompt_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 7);

export function usePrompts() {
  const { currentUser } = useAuth(); // TODO: Implement AuthContext
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [isLoaded, setIsLoaded] = useState(false); // Indicates if prompts are loaded from Firestore
  const [needsUpdate, setNeedsUpdate] = useState(false); // For Tampermonkey script regeneration

  // TODO: const db = getFirestore();

  // Fetch prompts from Firestore when user logs in or changes
  useEffect(() => {
    if (currentUser?.uid) {
      setIsLoaded(false);
      // TODO: Implement fetchPrompts from Firestore
      // const fetchPrompts = async () => {
      //   try {
      //     const q = query(collection(db, "users", currentUser.uid, "prompts"), orderBy("title"));
      //     const querySnapshot = await getDocs(q);
      //     const userPrompts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Prompt));
      //     setPrompts(userPrompts);
      //   } catch (error) {
      //     console.error("Error fetching prompts: ", error);
      //     // Handle error (e.g., show toast)
      //   } finally {
      //     setIsLoaded(true);
      //   }
      // };
      // fetchPrompts();
      setPrompts([]); // For now, set to empty until Firestore is implemented
      setIsLoaded(true); // Simulate loading for now
    } else {
      // No user logged in, clear prompts and set as loaded
      setPrompts([]);
      setIsLoaded(true);
    }
  }, [currentUser]);

  const addPrompt = useCallback(async (newPromptData: Omit<Prompt, 'id'>) => {
    if (!currentUser?.uid) {
      console.error("No user logged in to add prompt.");
      // TODO: Show toast or error message
      return;
    }
    const promptWithIdAndUser = { ...newPromptData, id: generateId(), userId: currentUser.uid };
    
    // TODO: Implement addDoc to Firestore
    // try {
    //   const docRef = await addDoc(collection(db, "users", currentUser.uid, "prompts"), newPromptData);
    //   const newPrompt = { ...newPromptData, id: docRef.id };
    //   setPrompts(prev => [...prev, newPrompt]);
    //   setNeedsUpdate(true);
    //   return newPrompt;
    // } catch (error) {
    //   console.error("Error adding prompt: ", error);
    //   // TODO: Handle error
    //   return;
    // }

    // Temporary local update
    const newPrompt = { ...newPromptData, id: generateId() };
    setPrompts(prev => [...prev, newPrompt]);
    setNeedsUpdate(true);
    return newPrompt;
  }, [currentUser]);

  const updatePrompt = useCallback(async (updatedPrompt: Prompt) => {
    if (!currentUser?.uid || !updatedPrompt.id) {
      console.error("User or prompt ID missing for update.");
      // TODO: Show toast or error message
      return;
    }
    // TODO: Implement updateDoc to Firestore
    // try {
    //   const promptRef = doc(db, "users", currentUser.uid, "prompts", updatedPrompt.id);
    //   await updateDoc(promptRef, updatedPrompt);
    //   setPrompts(prev => prev.map(p => p.id === updatedPrompt.id ? updatedPrompt : p));
    //   setNeedsUpdate(true);
    // } catch (error) {
    //   console.error("Error updating prompt: ", error);
    //   // TODO: Handle error
    // }

    // Temporary local update
    setPrompts(prev => prev.map(p => p.id === updatedPrompt.id ? updatedPrompt : p));
    setNeedsUpdate(true);
  }, [currentUser]);

  const deletePrompt = useCallback(async (promptId: string) => {
    if (!currentUser?.uid || !promptId) {
      console.error("User or prompt ID missing for delete.");
      // TODO: Show toast or error message
      return;
    }
    // TODO: Implement deleteDoc from Firestore
    // try {
    //   const promptRef = doc(db, "users", currentUser.uid, "prompts", promptId);
    //   await deleteDoc(promptRef);
    //   setPrompts(prev => prev.filter(p => p.id !== promptId));
    //   setNeedsUpdate(true);
    // } catch (error) {
    //   console.error("Error deleting prompt: ", error);
    //   // TODO: Handle error
    // }

    // Temporary local update
    setPrompts(prev => prev.filter(p => p.id !== promptId));
    setNeedsUpdate(true);
  }, [currentUser]);

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
