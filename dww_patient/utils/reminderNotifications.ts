import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';


const configureNotificationChannel = async () => {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default Channel',
      importance: Notifications.AndroidImportance.MAX,
      sound: 'default',
      enableVibrate: true,
      enableLights: true,
      vibrationPattern: [500, 500, 500, 500],
    });
  }
};

configureNotificationChannel();

export const scheduleNotification = async (reminder: Reminder) => {
  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) return [];
  await cancelAllNotifications();

  const weekdayMap: { [key: string]: number } = {
    "Sunday": 1,
    "Monday": 2,
    "Tuesday": 3,
    "Wednesday": 4,
    "Thursday": 5,
    "Friday": 6,
    "Saturday": 7,
  };

  const notificationIds = await Promise.all(
    reminder.days.map(async (day) => {
      const targetWeekday = weekdayMap[day];
      if (targetWeekday === undefined) {
        return null;
      }

      const [hours, minutes] = reminder.time.split(":").map(Number);

      const trigger: Notifications.NotificationTriggerInput = {
        hour: hours,
        minute: minutes,
        weekday: targetWeekday,
        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
      };

      try {
        const notificationId = await Notifications.scheduleNotificationAsync({
          content: {
            title: "Dry Weight Watchers",
            body: "Don't forget to record your dry weight!",
            data: { reminderId: reminder.id },
            sound: "default",
          },
          trigger,
        });

        return notificationId;
      } catch (error) {
        console.error("Error scheduling notification:", error);
        return null;
      }
    })
  );
  return notificationIds.filter(Boolean);
};

type Reminder = {
  id: number;
  time: string;
  days: string[];
};

export const cancelAllNotifications = async () => {
  const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
  for (const notification of scheduledNotifications) {
    await Notifications.cancelScheduledNotificationAsync(notification.identifier);
  }
};

export const requestNotificationPermissions = async () => {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
};