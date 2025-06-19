
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut, // Renamed to avoid conflict
  type UserCredential,
  type AuthError
} from 'firebase/auth';
import { auth } from './firebase'; // Your Firebase initialization

// Sign Up
export const signUp = async (email: string, password: string): Promise<UserCredential | AuthError> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential;
  } catch (error) {
    return error as AuthError;
  }
};

// Log In
export const logIn = async (email: string, password: string): Promise<UserCredential | AuthError> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential;
  } catch (error) {
    return error as AuthError;
  }
};

// Log Out
export const signOut = async (): Promise<void | AuthError> => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    return error as AuthError;
  }
};

// You can also export onAuthStateChanged if needed elsewhere, or use the AuthContext
export { onAuthStateChanged } from 'firebase/auth';
