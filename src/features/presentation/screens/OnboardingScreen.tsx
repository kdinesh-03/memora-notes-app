import React, { useRef, useState } from 'react';
import {
    NativeScrollEvent,
    NativeSyntheticEvent,
    Pressable,
    ScrollView,
    Text,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/shared/theme/colors';
import { useOnboardingStore } from '@/shared/store/useOnboardingStore';
import { styles, WINDOW_WIDTH } from '../styles/OnboardingScreen.styles';
import {
    CaptureNotesIllustration,
    RemindersIllustration,
    SyncSecureIllustration,
} from '../components/onboarding/Illustrations';

type SlideItem = {
    id: number;
    title: string;
    subtitle: string;
    illustration: React.ReactNode;
};

export const OnboardingScreen = () => {
    const colors = useColors();
    const { top, bottom } = useSafeAreaInsets();
    const { completeOnboarding } = useOnboardingStore();

    const [activeIndex, setActiveIndex] = useState(0);
    const scrollViewRef = useRef<ScrollView>(null);

    const slides: SlideItem[] = [
        {
            id: 0,
            title: 'Capture Your Thoughts',
            subtitle: 'Create rich notes with quick checklists, task types, and custom formatting options to organize your life.',
            illustration: <CaptureNotesIllustration />,
        },
        {
            id: 1,
            title: 'Never Miss a Beat',
            subtitle: 'Add timely alerts and location or time-based reminders directly to your notes and stay productive.',
            illustration: <RemindersIllustration />,
        },
        {
            id: 2,
            title: 'Secure & Synced',
            subtitle: 'Secure sensitive logs with a device-level lock, and sync notes to the cloud to access them anywhere.',
            illustration: <SyncSecureIllustration />,
        },
    ];

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const contentOffsetX = event.nativeEvent.contentOffset.x;
        const index = Math.round(contentOffsetX / WINDOW_WIDTH);
        if (index !== activeIndex && index >= 0 && index < slides.length) {
            setActiveIndex(index);
            Haptics.selectionAsync().catch(() => { });
        }
    };

    const handleNext = () => {
        if (activeIndex < slides.length - 1) {
            scrollViewRef.current?.scrollTo({
                x: (activeIndex + 1) * WINDOW_WIDTH,
                animated: true,
            });
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => { });
        } else {
            handleFinish();
        }
    };

    const handleSkip = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => { });
        handleFinish();
    };

    const handleFinish = () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => { });
        completeOnboarding();
    };

    const isLastPage = activeIndex === slides.length - 1;

    return (
        <View style={[styles.container, { backgroundColor: colors.background, paddingTop: top }]}>
            <View style={styles.header}>
                {!isLastPage && (
                    <Pressable
                        onPress={handleSkip}
                        style={({ pressed }) => [
                            styles.skipButton,
                            pressed && { backgroundColor: colors.accentLight },
                        ]}
                    >
                        <Text style={[styles.skipText, { color: colors.textSecondary }]}>Skip</Text>
                    </Pressable>
                )}
            </View>

            <Text style={[styles.memoraLabel, { color: colors.accent }]}>
                MEMORA
            </Text>

            <ScrollView
                ref={scrollViewRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                contentContainerStyle={styles.scrollContent}
            >
                {slides.map((slide, i) => {
                    return (
                        <View key={slide.id} style={styles.slide}>
                            <View style={styles.illustrationContainer}>
                                {slide.illustration}
                            </View>
                            <View style={styles.textContainer}>
                                <Text style={[styles.title, { color: colors.text }]}>
                                    {slide.title}
                                </Text>
                                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                                    {slide.subtitle}
                                </Text>
                            </View>
                        </View>
                    );
                })}
            </ScrollView>

            <View style={[styles.footer, { paddingBottom: bottom }]}>
                <View style={styles.dotsContainer}>
                    {slides.map((_, index) => {
                        const isActive = index === activeIndex;
                        return (
                            <Pressable
                                key={index}
                                onPress={() => {
                                    scrollViewRef.current?.scrollTo({
                                        x: index * WINDOW_WIDTH,
                                        animated: true,
                                    });
                                    Haptics.selectionAsync().catch(() => { });
                                }}
                                style={[
                                    styles.dot,
                                    {
                                        width: isActive ? 20 : 8,
                                        backgroundColor: isActive ? colors.accent : colors.borderDark,
                                        opacity: isActive ? 1 : 0.4,
                                    },
                                ]}
                            />
                        );
                    })}
                </View>

                <View style={styles.buttonContainer}>
                    <Pressable
                        onPress={handleNext}
                        style={({ pressed }) => [
                            styles.button,
                            { backgroundColor: colors.accent },
                            pressed && styles.buttonPressed,
                        ]}
                    >
                        <Text style={styles.buttonText}>
                            {isLastPage ? 'Get Started' : 'Next'}
                        </Text>
                    </Pressable>
                </View>
            </View>
        </View>
    );
};

export default OnboardingScreen;
