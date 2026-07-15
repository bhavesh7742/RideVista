import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/authSlice';
import notificationReducer from '../features/notificationSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    notification: notificationReducer,
    // future slices will go here, e.g. vehicles: vehicleReducer, etc.
  },
});

export default store;
