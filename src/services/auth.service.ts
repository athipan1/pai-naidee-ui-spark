import { supabase } from './supabase.service';
import type { SignUpWithPasswordCredentials, SignInWithPasswordCredentials, AuthChangeEvent, Session } from '@supabase/supabase-js';

/**
 * Signs up a new user with email and password.
 * @param credentials - The user's email and password.
 * @returns The newly created user's session.
 */
export const signUp = async (credentials: SignUpWithPasswordCredentials) => {
  const { data, error } = await supabase.auth.signUp(credentials);
  if (error) {
    console.error('Error signing up:', error.message);
    throw new Error(`Sign up failed: ${error.message}`);
  }
  // Supabase sends a confirmation email. The user object is available but session is null until confirmed.
  return data;
};

/**
 * Signs in a user with email and password.
 * @param credentials - The user's email and password.
 * @returns The user's session data.
 */
export const signInWithPassword = async (credentials: SignInWithPasswordCredentials) => {
  const { data, error } = await supabase.auth.signInWithPassword(credentials);
  if (error) {
    console.error('Error signing in:', error.message);
    throw new Error(`Sign in failed: ${error.message}`);
  }
  return data;
};

/**
 * Signs out the currently logged-in user.
 */
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Error signing out:', error.message);
    throw new Error(`Sign out failed: ${error.message}`);
  }
};

/**
 * Gets the current user session.
 * @returns The current session, or null if not logged in.
 */
export const getSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) {
    console.error('Error getting session:', error.message);
    return null;
  }
  return session;
};

/**
 * Listens for changes in the authentication state.
 * @param callback - A function to handle the auth change event and session.
 * @returns A subscription object that can be used to unsubscribe.
 */
export const onAuthStateChange = (callback: (event: AuthChangeEvent, session: Session | null) => void) => {
  const { data: { subscription } } = supabase.auth.onAuthStateChanged(callback);
  return subscription;
};

/**
 * Gets the current logged-in user.
 * @returns The current user object, or null if not logged in.
 */
export const getCurrentUser = async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
        console.error('Error fetching user:', error.message);
        return null;
    }
    return user;
};