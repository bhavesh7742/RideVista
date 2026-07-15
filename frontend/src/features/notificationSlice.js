import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  toasts: [], // Array of { id, message, type }
};

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    showToast: (state, action) => {
      const { message, type = 'info', id = Date.now().toString() } = action.payload;
      state.toasts.push({ id, message, type });
    },
    hideToast: (state, action) => {
      state.toasts = state.toasts.filter((toast) => toast.id !== action.payload);
    },
  },
});

export const { showToast, hideToast } = notificationSlice.actions;
export default notificationSlice.reducer;
