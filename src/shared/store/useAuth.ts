import { create } from 'zustand';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../../infrastructure/supabase/supabase';
import { initialSync } from '../../infrastructure/sync/syncEngine';

interface AuthState {
    user: User | null;
    session: Session | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    signUp: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    signOut: () => Promise<void>;
    restoreSession: () => Promise<void>;
    setSession: (session: Session | null) => void;
    clearError: () => void;
    changePassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
    resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
    deleteAccount: () => Promise<{ success: boolean; error?: string }>;
}

export const useAuth = create<AuthState>((set, get) => ({
    user: null,
    session: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,

    signUp: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
            });

            if (error) {
                set({ isLoading: false, error: error.message });
                return { success: false, error: error.message };
            }

            if (data.user && data.session) {
                set({
                    user: data.user,
                    session: data.session,
                    isAuthenticated: true,
                    isLoading: false,
                });

                // Run initial sync to push existing local notes
                try {
                    await initialSync(data.user.id);
                } catch (e) {
                    console.log('Initial sync after signup failed:', e);
                }
            } else {
                set({ isLoading: false });
            }

            return { success: true };
        } catch (error: any) {
            const msg = error?.message || 'Sign up failed';
            set({ isLoading: false, error: msg });
            return { success: false, error: msg };
        }
    },

    signIn: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                set({ isLoading: false, error: error.message });
                return { success: false, error: error.message };
            }

            if (data.user && data.session) {
                set({
                    user: data.user,
                    session: data.session,
                    isAuthenticated: true,
                    isLoading: false,
                });
            }

            return { success: true };
        } catch (error: any) {
            const msg = error?.message || 'Sign in failed';
            set({ isLoading: false, error: msg });
            return { success: false, error: msg };
        }
    },

    signOut: async () => {
        set({ isLoading: true });
        try {
            await supabase.auth.signOut();
        } catch (error) {
            console.log('Sign out error:', error);
        } finally {
            set({
                user: null,
                session: null,
                isAuthenticated: false,
                isLoading: false,
                error: null,
            });
        }
    },

    restoreSession: async () => {
        set({ isLoading: true });
        try {
            const {
                data: { session },
            } = await supabase.auth.getSession();

            if (session?.user) {
                set({
                    user: session.user,
                    session,
                    isAuthenticated: true,
                    isLoading: false,
                });
            } else {
                set({ isLoading: false });
            }
        } catch (error) {
            console.log('Session restore error:', error);
            set({ isLoading: false });
        }
    },

    setSession: (session) => {
        if (session?.user) {
            set({
                user: session.user,
                session,
                isAuthenticated: true,
            });
        } else {
            set({
                user: null,
                session: null,
                isAuthenticated: false,
            });
        }
    },

    clearError: () => set({ error: null }),

    changePassword: async (newPassword: string) => {
        try {
            const { error } = await supabase.auth.updateUser({ password: newPassword });
            if (error) return { success: false, error: error.message };
            return { success: true };
        } catch (e: any) {
            return { success: false, error: e?.message || 'Failed to change password' };
        }
    },

    resetPassword: async (email: string) => {
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: 'memora://reset-password',
            });
            if (error) return { success: false, error: error.message };
            return { success: true };
        } catch (e: any) {
            return { success: false, error: e?.message || 'Failed to send reset email' };
        }
    },

    deleteAccount: async () => {
        try {
            const { error } = await supabase.rpc('delete_user');
            if (error) return { success: false, error: error.message };
            set({
                user: null,
                session: null,
                isAuthenticated: false,
                isLoading: false,
                error: null,
            });
            return { success: true };
        } catch (e: any) {
            return { success: false, error: e?.message || 'Failed to delete account' };
        }
    },
}));
