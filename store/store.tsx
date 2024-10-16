import { configureStore, combineReducers } from '@reduxjs/toolkit';
import scrumboardReducer from './features/scrumboardSlice'
import themeConfigSlice from './themeConfigSlice';

const rootReducer = combineReducers({
    themeConfig: themeConfigSlice,
  user: scrumboardReducer,
});

export const store = configureStore({
  reducer: rootReducer,
});
