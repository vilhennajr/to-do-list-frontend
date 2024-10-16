import { configureStore, combineReducers } from '@reduxjs/toolkit';

import themeConfigSlice from './themeConfigSlice';

const rootReducer = combineReducers({
    themeConfig: themeConfigSlice,
});

export const store = configureStore({
    reducer: rootReducer,
});
