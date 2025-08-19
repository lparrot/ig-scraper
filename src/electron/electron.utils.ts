import {Notification, NotificationConstructorOptions} from "electron";

export const ELECTRON_UTILS = {
    notification: {
      send(options?: NotificationConstructorOptions) {
        new Notification(options).show()
        }
    }
}