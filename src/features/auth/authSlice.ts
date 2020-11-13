import axios from "axios";

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { RootState } from "../../app/store";
import { PROPS_AUTHEN, PROPS_NICKNAME, PROPS_PROFILE } from "../types";

// top階層の.envで環境変数を設定。
// REACT_APP_ で定義したものを環境変数として使用できる。
const apiUrl = process.env.REACT_APP_DEV_API_URL;

// 非同期関数

// login
export const fetchAsyncLogin = createAsyncThunk(
  // action名
  "auth/post",
  async (authen: PROPS_AUTHEN) => {
    const res = await axios.post(`${apiUrl}authen/jwt/create`, authen, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    // JWTのtokenを返す。
    return res.data;
  }
);

// register
export const fetchAsyncRegister = createAsyncThunk(
  "auth/register",
  async (auth: PROPS_AUTHEN) => {
    const res = await axios.post(`${apiUrl}api/register/`, auth, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return res.data;
  }
);

// profile作成
// profile作成時、imgはnullとするため、nickNameのみとする。
export const fetchAsyncCreateProf = createAsyncThunk(
  "profile/post",
  async (nickName: PROPS_NICKNAME) => {
    const res = await axios.post(`${apiUrl}api/profile/`, nickName, {
      headers: {
        "Content-Type": "application/json",
        // JWTによる認証
        Authorization: `JWT ${localStorage.localJWT}`,
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
    uploadData.append("nickName", profile.nickName);
    // imgがある場合のみ、追加。
    profile.img && uploadData.append("img", profile.img, profile.img.name);
    const res = await axios.put(
      `${apiUrl}api/profile/${profile.id}/`,
      uploadData,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `JWT ${localStorage.localJWT}`,
        },
      }
    );
    return res.data;
  }
);

// login userのprofile取得
export const fetchAsyncGetMyProf = createAsyncThunk("profile/get", async () => {
  const res = await axios.get(`${apiUrl}api/myprofile/`, {
    headers: {
      Authorization: `JWT ${localStorage.localJWT}`,
    },
  });
  // Djangoでfilter()を実行しているため、index[0]を指定して取得。
  return res.data[0];
});

// 全profile取得
export const fetchAsyncGetProfs = createAsyncThunk("profiles/get", async () => {
  const res = await axios.get(`${apiUrl}api/profile/`, {
    headers: {
      Authorization: `JWT ${localStorage.localJWT}`,
    },
  });
  return res.data;
});

export const authSlice = createSlice({
  name: "auth",
  initialState: {
    // login modal toggle
    // trueによって、sign inのmodalが初期表示される。
    openSignIn: true,
    // register modal toggle
    openSignUp: false,
    // profile modal toggle
    openProfile: false,
    // api loading toggle
    isLoadingAuth: false,
    myprofile: {
      id: 0,
      nickName: "",
      userProfile: 0,
      created_on: "",
      img: "",
    },
    profiles: [
      {
        id: 0,
        nickName: "",
        userProfile: 0,
        created_on: "",
        img: "",
      },
    ],
  },
  reducers: {
    // actions

    // api loading制御
    // Cred => credentials(証明)
    fetchCredStart(state) {
      state.isLoadingAuth = true;
    },
    // Cred => credentials(証明)
    fetchCredEnd(state) {
      state.isLoadingAuth = false;
    },

    // login modal制御
    setOpenSignIn(state) {
      state.openSignIn = true;
    },
    resetOpenSignIn(state) {
      state.openSignIn = false;
    },

    // register modal制御
    setOpenSignUp(state) {
      state.openSignUp = true;
    },
    resetOpenSignUp(state) {
      state.openSignUp = false;
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
      state.myprofile.nickName = action.payload;
    },
  },
  // createAsyncThunkで定義した非同期関数の後続処理
  extraReducers: (builder) => {
    // JWTの取得が成功(fulfilled)した時、localStorageにJWTの値を格納する。
    builder.addCase(fetchAsyncLogin.fulfilled, (state, action) => {
      // action.payload => fetchAsyncLoginの返り値
      // JWTはaccessとrefreshがあるが、アクセス認証に必要なaccessの方を格納する。
      localStorage.setItem("localJWT", action.payload.access);
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

export const {
  fetchCredStart,
  fetchCredEnd,
  setOpenSignIn,
  resetOpenSignIn,
  setOpenSignUp,
  resetOpenSignUp,
  setOpenProfile,
  resetOpenProfile,
  editNickname,
} = authSlice.actions;

// useSelectorでアクセスできるよう定義。

// RootState => storeのすべてのsliceを含んだ型
// auth => src/app/store.tsのconfigureStore()で定義した名前
export const selectIsLoadingAuth = (state: RootState) =>
  state.auth.isLoadingAuth;
export const selectOpenSignIn = (state: RootState) => state.auth.openSignIn;
export const selectOpenSignUp = (state: RootState) => state.auth.openSignUp;
export const selectOpenProfile = (state: RootState) => state.auth.openProfile;
export const selectProfile = (state: RootState) => state.auth.myprofile;
export const selectProfiles = (state: RootState) => state.auth.profiles;

export default authSlice.reducer;
