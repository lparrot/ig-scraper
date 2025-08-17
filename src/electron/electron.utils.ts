import {Notification, NotificationConstructorOptions} from "electron";

export const IGS_ELECTRON = {
    notification: {
        send(title?: string, body?: string, options?: Partial<NotificationConstructorOptions>) {
            new Notification({
                title,
                body,
                ...options
            }).show()
        }
    }
}