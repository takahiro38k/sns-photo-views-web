import { Action, configureStore, ThunkAction } from "@reduxjs/toolkit";

import authReducer from "../features/auth/authSlice";
import postReducer from "../features/post/postSlice";

// configureStore()
// 作成したsliceをstoreに登録する。
// https://redux-toolkit.js.org/api/configureStore
export const store = configureStore({
  reducer: {
    auth: authReducer,
    post: postReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;

// dispatchの型定義
export type AppDispatch = typeof store.dispatch;
