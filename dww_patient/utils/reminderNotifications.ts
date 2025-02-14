import * as Notifications from 'expo-notifications';

export const scheduleNotification = async (reminder: Reminder) => {
  const weekdayMap: { [key: string]: number } = { //this sucks. i cant believe i have to do this. why does weekday have to be a number????
    'Sunday': 1,
    'Monday': 2,
    'Tuesday': 3,
    'Wednesday': 4,
    'Thursday': 5,
    'Friday': 6,
    'Saturday': 7,
  };

  const notificationIds = await Promise.all(
    reminder.days.map(async (day) => {
      const [hours, minutes] = reminder.time.split(':').map(Number);
      
      const trigger = {
        type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
        weekday: weekdayMap[day],
        hour: hours,
        minute: minutes,
        repeats: true,
      } as Notifications.CalendarTriggerInput;

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: "Dry Weight Watchers",
          body: "Don't forget to record your dry weight!",
          data: { reminderId: reminder.id },
        },
        trigger,
      });

      return notificationId;
    })
  );

  return notificationIds;
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