import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { Note } from '../../features/domain/entities/Note';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export const requestNotificationPermissions = async () => {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus === 'granted' && Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#007AFF',
            sound: 'notification.wav',
        });
    }

    return finalStatus === 'granted';
};

export const scheduleNoteNotifications = async (note: Note) => {
    try {
        if (note.type === 'note' || !note.reminder_at) {
            return null;
        }

        await cancelNoteNotifications(note.id);

        const date = new Date(note.reminder_at);
        date.setSeconds(0);
        date.setMilliseconds(0);

        const reminderTimeId = `reminder-${note.id}`;
        const reminderTimeId15 = `reminder-${note.id}-15`;

        if (date.getTime() > Date.now()) {
            await Notifications.scheduleNotificationAsync({
                identifier: reminderTimeId,
                content: {
                    title: 'Reminder',
                    body: note.title || 'You have a reminder',
                    data: { noteId: note.id },
                    sound: 'notification.wav',
                },
                trigger: {
                    date: date,
                    type: Notifications.SchedulableTriggerInputTypes.DATE,
                    channelId: 'default',
                } as any,
            });

            const fifteenBefore = new Date(date.getTime() - 15 * 60 * 1000);

            if (fifteenBefore.getTime() > Date.now()) {
                await Notifications.scheduleNotificationAsync({
                    identifier: reminderTimeId15,
                    content: {
                        title: 'Upcoming Reminder',
                        body: `In 15 mins: ${note.title}`,
                        data: { noteId: note.id },
                        sound: 'notification.wav',
                    },
                    trigger: {
                        date: fifteenBefore,
                        type: Notifications.SchedulableTriggerInputTypes.DATE,
                        channelId: 'default',
                    } as any,
                });
            }
        }

        return { reminderTimeId, reminderTimeId15 };
    } catch (error) {
        console.log('❌ Schedule error:', error);
        return null;
    }
};

export const cancelNoteNotifications = async (noteId: string) => {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const n of scheduled) {
        if (n.identifier.includes(noteId)) {
            await Notifications.cancelScheduledNotificationAsync(n.identifier);
        }
    }
};
