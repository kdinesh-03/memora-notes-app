import * as Notifications from 'expo-notifications';
import { Note } from '../../features/domain/entities/Note';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
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
    return finalStatus === 'granted';
};

const getExpoDay = (index: number): number | null => {
    const days = [1, 2, 3, 4, 5, 6, 7];
    return days[index];
};

export const scheduleNoteNotifications = async (note: Note) => {
    if (note.type === 'note' || !note.reminder_at) {
        await cancelNoteNotifications(note.id);
        return;
    }

    await cancelNoteNotifications(note.id);

    const date = new Date(note.reminder_at);
    date.setSeconds(0);
    date.setMilliseconds(0);
    const hour = date.getHours();
    const minute = date.getMinutes();

    const reminderTimeId = `reminder-${note.id}`;
    const reminderTimeId15 = `reminder-${note.id}-15`;

    if (!note.repeat_days || note.repeat_days.trim() === '') {
        if (note.reminder_at > Date.now()) {
            await Notifications.scheduleNotificationAsync({
                identifier: reminderTimeId,
                content: {
                    title: 'Reminder',
                    body: note.title || 'You have a reminder',
                    data: { noteId: note.id },
                },
                trigger: {
                    date: date,
                    type: Notifications.SchedulableTriggerInputTypes.DATE,
                } as any,
            });

            const fifteenBefore = new Date(note.reminder_at - 15 * 60 * 1000);
            if (fifteenBefore.getTime() > Date.now()) {
                await Notifications.scheduleNotificationAsync({
                    identifier: reminderTimeId15,
                    content: {
                        title: 'Upcoming Reminder',
                        body: `In 15 mins: ${note.title}`,
                        data: { noteId: note.id },
                    },
                    trigger: {
                        date: fifteenBefore,
                        type: Notifications.SchedulableTriggerInputTypes.DATE,
                    } as any,
                });
            }
        }
    } else {
        const daysChars = note.repeat_days.split('');
        for (let i = 0; i < daysChars.length; i++) {
            const char = daysChars[i];
            if (char !== '-') {
                const weekday = getExpoDay(i);
                if (weekday) {
                    await Notifications.scheduleNotificationAsync({
                        identifier: `${reminderTimeId}-${i}`,
                        content: {
                            title: 'Reminder',
                            body: note.title || 'You have a reminder',
                            data: { noteId: note.id },
                        },
                        trigger: {
                            type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
                            weekday,
                            hour,
                            minute,
                        } as any,
                    });

                    let prevHour = hour;
                    let prevMinute = minute - 15;
                    if (prevMinute < 0) {
                        prevMinute += 60;
                        prevHour -= 1;
                    }
                    let adjustedWeekday = weekday;
                    if (prevHour < 0) {
                        prevHour += 24;
                        adjustedWeekday = weekday - 1;
                        if (adjustedWeekday < 1) adjustedWeekday = 7;
                    }

                    await Notifications.scheduleNotificationAsync({
                        identifier: `${reminderTimeId15}-${i}`,
                        content: {
                            title: 'Upcoming Reminder',
                            body: `In 15 mins: ${note.title}`,
                            data: { noteId: note.id },
                        },
                        trigger: {
                            type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
                            weekday: adjustedWeekday,
                            hour: prevHour,
                            minute: prevMinute,
                        } as any,
                    });
                }
            }
        }
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
