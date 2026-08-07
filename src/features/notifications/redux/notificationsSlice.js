/**
 * Notifications Slice
 */
import apiClient from '@lib/apiClient';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

const BASE = '/notifications';

export const notificationsService = {
  getAll:      (params) => apiClient.get(BASE, { params }),
  markRead:    (id)     => apiClient.patch(`${BASE}/${id}/read`),
  markAllRead: ()       => apiClient.patch(`${BASE}/read-all`),
  delete:      (id)     => apiClient.delete(`${BASE}/${id}`),
  clearAll:    ()       => apiClient.delete(`${BASE}/clear-all`),
  triggerCron: ()       => apiClient.post(`${BASE}/trigger-cron`),
};

export const fetchNotifications = createAsyncThunk('notifications/fetchAll',
  async (params, { rejectWithValue }) => {
    try { return await notificationsService.getAll(params); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const markNotificationRead = createAsyncThunk('notifications/markRead',
  async (id, { rejectWithValue }) => {
    try { return await notificationsService.markRead(id); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const markAllNotificationsRead = createAsyncThunk('notifications/markAllRead',
  async (_, { rejectWithValue }) => {
    try { return await notificationsService.markAllRead(); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const deleteNotification = createAsyncThunk('notifications/delete',
  async (id, { rejectWithValue }) => {
    try {
      await notificationsService.delete(id);
      return id;
    } catch (err) { return rejectWithValue(err); }
  }
);

export const clearAllNotifications = createAsyncThunk('notifications/clearAll',
  async (_, { rejectWithValue }) => {
    try { return await notificationsService.clearAll(); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const triggerCronJob = createAsyncThunk('notifications/triggerCron',
  async (_, { rejectWithValue }) => {
    try { return await notificationsService.triggerCron(); }
    catch (err) { return rejectWithValue(err); }
  }
);

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: {
    notifications: [],
    unreadCount:   0,
    status:        'idle',
    error:         null,
  },
  reducers: {
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload);
      state.unreadCount += 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.fulfilled, (s, { payload }) => {
        const raw = payload?.data || payload || {};
        s.status        = 'succeeded';
        s.notifications = Array.isArray(raw.notifications) ? raw.notifications : Array.isArray(payload) ? payload : [];
        s.unreadCount   = raw.unreadCount ?? s.notifications.filter(n => !n.isRead).length;
      });

    builder.addCase(markNotificationRead.fulfilled, (s, { payload }) => {
      const data = payload?.data || payload || {};
      const id = data.notification?._id || payload;
      const n = s.notifications.find(item => item._id === id);
      if (n && !n.isRead) {
        n.isRead = true;
        s.unreadCount = Math.max(0, s.unreadCount - 1);
      }
    });

    builder.addCase(markAllNotificationsRead.fulfilled, (s) => {
      s.notifications.forEach(n => { n.isRead = true; });
      s.unreadCount = 0;
    });

    builder.addCase(deleteNotification.fulfilled, (s, { payload: id }) => {
      const target = s.notifications.find(n => n._id === id);
      if (target && !target.isRead) {
        s.unreadCount = Math.max(0, s.unreadCount - 1);
      }
      s.notifications = s.notifications.filter(n => n._id !== id);
    });

    builder.addCase(clearAllNotifications.fulfilled, (s) => {
      s.notifications = [];
      s.unreadCount = 0;
    });
  },
});

export const { addNotification } = notificationsSlice.actions;

export const selectNotifications = (s) => s.notifications.notifications || [];
export const selectUnreadCount   = (s) => s.notifications.unreadCount || 0;
export const selectNotifStatus   = (s) => s.notifications.status;

export default notificationsSlice.reducer;
