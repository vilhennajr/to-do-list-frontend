import { combineReducers, configureStore } from '@reduxjs/toolkit';
import themeConfigSlice from './themeConfigSlice';
import scrumboardSlice from './features/scrumboardSlice';

const rootReducer = combineReducers({
    themeConfig: themeConfigSlice,
    scrumboard: scrumboardSlice,
});

export default configureStore({
    reducer: rootReducer,
});

export type IRootState = ReturnType<typeof rootReducer>;
