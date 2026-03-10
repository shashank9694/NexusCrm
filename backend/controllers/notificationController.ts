import { Notification } from "../models/Notification.ts";

export const createNotification = async (userId: string, message: string, type: string) => {
  try {
    await Notification.create({
      user_id: userId,
      message,
      type
    });
  } catch (err: any) {
    console.error('Error creating notification:', err.message);
  }
};

export const getNotifications = async (req: any, res: any) => {
  try {
    const notifications = await Notification.find({ user_id: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(notifications.map((n: any) => ({
      ...n.toObject(),
      id: n._id
    })));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const markAsRead = async (req: any, res: any) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, user_id: req.user.id },
      { is_read: true }
    );
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};
