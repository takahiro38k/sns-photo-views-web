import axios from "axios";

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { RootState } from "../../app/store";
import { PROPS_AUTHEN, PROPS_INITPROFILE, PROPS_PROFILE } from "../types";

// top階層の.envで環境変数を設定。
// REACT_APP_ で定義したものを環境変数として使用できる。
const apiUrl = process.env.REACT_APP_LARAVEL_API_URL;

// 非同期関数
// ※非同期関数はcreateSlice()の外に書く。
// createAsyncThunk
// https://redux-toolkit.js.org/api/createAsyncThunk

// login
export const fetchAsyncLogin = createAsyncThunk(
  // action名
  "auth/login",
  async (authen: PROPS_AUTHEN) => {
    const res = await axios.post(`${apiUrl}/api/auth/login`, authen, {
      headers: {
        "Content-Type": "application/json",
      },
    })
    // JWTのtokenを返す。
    return res.data;
  }
);

// register
export const fetchAsyncRegister = createAsyncThunk(
  "auth/register",
  async (auth: PROPS_AUTHEN) => {
    const res = await axios.post(`${apiUrl}/api/register`, auth, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return res.data;
  }
);

// profile作成
// profile作成時、imgはnullとするため、nicknameのみとする。
export const fetchAsyncCreateProf = createAsyncThunk(
  "profile/post",
  async (initProfile: PROPS_INITPROFILE) => {
    const res = await axios.post(`${apiUrl}/api/profiles`, initProfile, {
      headers: {
        "Content-Type": "application/json",
        // JWTによる認証
        Authorization: `Bearer ${localStorage.localJWT}`,
      },
    });
    return res.data;
  }
);

// profile更新
export const fetchAsyncUpdateProf = createAsyncThunk(
  "profile/put",
  async (profile: PROPS_PROFILE) => {
    const uploadData = new FormData();
    uploadData.append("nickname", profile.nickname);
    // imgがある場合のみ、追加。
    profile.img_profile && uploadData.append("img", profile.img_profile, profile.img_profile.name);
    const res = await axios.put(
      `${apiUrl}/api/profile/${profile.id}/`,
      uploadData,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.localJWT}`,
        },
      }
    );
    return res.data;
  }
);

// profile取得
export const fetchAsyncGetMyProf = createAsyncThunk("profile/get", async () => {
  const res = await axios.get(`${apiUrl}/api/profiles/me`, {
    headers: {
      Authorization: `Bearer ${localStorage.localJWT}`,
    },
  });
  return res.data;
});

// profile一覧取得
export const fetchAsyncGetProfs = createAsyncThunk("profiles/get", async () => {
  const res = await axios.get(`${apiUrl}/api/profiles`, {
    headers: {
      Authorization: `Bearer ${localStorage.localJWT}`,
    },
  });
  return res.data;
});

// createSlice
// https://redux-toolkit.js.org/api/createSlice
export const authSlice = createSlice({
  name: "auth",
  initialState: {
    // login modal toggle
    // trueによって、login modalが初期表示される。
    openLogin: true,
    // register modal toggle
    openRegister: false,
    // register submit result toggle
    registerCorrect: false,
    registerError: false,
    // login submit result toggle
    loginError: false,
    // profile modal toggle
    openProfile: false,
    // api loading toggle
    isLoadingAuth: false,
    myprofile: {
      id: 0,
      user_id: 0,
      nickname: "",
      img_profile: "",
      created_at: "",
      updated_at: "",
    },
    profiles: [
      {
        id: 0,
        user_id: 0,
        nickname: "",
        img_profile: "",
        created_at: "",
        updated_at: "",
      },
    ],
  },
  // reducers
  // https://redux-toolkit.js.org/api/createSlice#reducers
  reducers: {
    // 各reducerの引数は、stateのみ、またはstateとaction両方を持つことができる。
    // api loading制御(Cred: credentials)
    fetchCredStart(state) {
      state.isLoadingAuth = true;
    },
    fetchCredEnd(state) {
      state.isLoadingAuth = false;
    },

    // login modal制御
    setOpenLogin(state) {
      state.openLogin = true;
    },
    resetOpenLogin(state) {
      state.openLogin = false;
    },

    // register modal制御
    setOpenRegister(state) {
      state.openRegister = true;
    },
    resetOpenRegister(state) {
      state.openRegister = false;
    },

    // register submit correct制御
    setRegisterCorrect(state) {
      state.registerCorrect = true;
    },
    resetRegisterCorrect(state) {
      state.registerCorrect = false;
    },

    // register submit error制御
    setRegisterError(state) {
      state.registerError = true;
    },
    resetRegisterError(state) {
      state.registerError = false;
    },

    // register submit error制御
    setLoginError(state) {
      state.loginError = true;
    },
    resetLoginError(state) {
      state.loginError = false;
    },

    // profile modal制御
    setOpenProfile(state) {
      state.openProfile = true;
    },
    resetOpenProfile(state) {
      state.openProfile = false;
    },

    // nickname変更
    editNickname(state, action) {
      state.myprofile.nickname = action.payload;
    },
  },
  // extraReducers
  // https://redux-toolkit.js.org/api/createSlice#extrareducers
  // 上記createAsyncThunkで定義した非同期処理の後続処理をreducerに組み込む。
  extraReducers: (builder) => {
    // builder.addCase
    // https://redux-toolkit.js.org/api/createReducer#builderaddcase
    // JWTの取得が成功(fulfilled)した時、localStorageにJWTの値を格納する。
    builder.addCase(fetchAsyncLogin.fulfilled, (state, action) => {
      // action.payload => createAsyncThunk()の2nd paramである非同期関数の返り値。
      localStorage.setItem("localJWT", action.payload.access_token);
    });
    builder.addCase(fetchAsyncCreateProf.fulfilled, (state, action) => {
      state.myprofile = action.payload;
    });
    builder.addCase(fetchAsyncGetMyProf.fulfilled, (state, action) => {
      state.myprofile = action.payload;
    });
    builder.addCase(fetchAsyncGetProfs.fulfilled, (state, action) => {
      state.profiles = action.payload;
    });
    builder.addCase(fetchAsyncUpdateProf.fulfilled, (state, action) => {
      state.myprofile = action.payload;
      state.profiles = state.profiles.map((prof) =>
        // 変更箇所のみ更新
        prof.id === action.payload.id ? action.payload : prof
      );
    });
  },
});

// reducersをexport。
export const {
  fetchCredStart,
  fetchCredEnd,
  setOpenLogin,
  resetOpenLogin,
  setOpenRegister,
  resetOpenRegister,
  setRegisterCorrect,
  resetRegisterCorrect,
  setRegisterError,
  resetRegisterError,
  setOpenProfile,
  resetOpenProfile,
  editNickname,
  setLoginError,
  resetLoginError,
} = authSlice.actions;

// useSelectorでアクセスできるよう定義。
// RootState => storeのすべてのsliceを含んだ型
// auth => src/app/store.tsのconfigureStore()で定義した名前
export const selectIsLoadingAuth = (state: RootState) =>
  state.auth.isLoadingAuth;
export const selectOpenLogin = (state: RootState) => state.auth.openLogin;
export const selectOpenRegister  = (state: RootState) => state.auth.openRegister;
export const selectRegisterCorrect = (state: RootState) => state.auth.registerCorrect;
export const selectRegisterError = (state: RootState) => state.auth.registerError;
export const selectLoginError = (state: RootState) => state.auth.loginError;
export const selectOpenProfile = (state: RootState) => state.auth.openProfile;
export const selectProfile = (state: RootState) => state.auth.myprofile;
export const selectProfiles = (state: RootState) => state.auth.profiles;

export default authSlice.reducer;
