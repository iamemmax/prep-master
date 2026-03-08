import toast from "react-hot-toast";

export type ToastNotification = 'success' | 'error' | 'neutral';

const getNotificationColor = (notificationType: ToastNotification) => {
  switch (notificationType) {
    case 'success':
      return '#065f46'; // green
    case 'error':
      return '#b91c1c'; // red
    case 'neutral':
      return '#032282'; // blue
    default:
      throw new Error(`Unsupported notification type: ${notificationType}`);
  }
};

export const launchNotification = (type: ToastNotification, text: string) => {
  toast(text, {
    // style: {
    //   padding: '8px 20px',
    //   backgroundColor: getNotificationColor(type),
    //   color: '#ffffff',
    //   textAlign: 'center',
    //   overflowWrap: 'break-word',
    //   overflow: 'auto',
    //   bottom: '32px',
    //   fontSize: '14px',
    // },
    // iconTheme: {
    //   primary: '#ffffff',
    //   secondary: getNotificationColor(type),
    // },
  });
};
