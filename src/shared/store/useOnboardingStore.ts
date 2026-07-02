import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { secureStorage } from '@/infrastructure/secure-store/zustandStorage';

interface OnboardingState {
    onboardingCompleted: boolean;
    completeOnboarding: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(
    persist(
        (set) => ({
            onboardingCompleted: false,
            completeOnboarding: () => set({ onboardingCompleted: true }),
        }),
        {
            name: 'onboarding_completed_preference',
            storage: createJSONStorage(() => secureStorage),
            partialize: (state) => ({
                onboardingCompleted: state.onboardingCompleted
            })
        }
    )
);
