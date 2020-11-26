import axios from "axios";

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { RootState } from "../../app/store";
import { PROPS_COMMENT, PROPS_LIKED, PROPS_NEWPOST } from "../types";

// top階層の.envで環境変数を設定。
// REACT_APP_ で定義したものを環境変数として使用できる。
const apiUrlPost = `${process.env.REACT_APP_LARAVEL_API_URL}/api/posts`;
const apiUrlComment = `${process.env.REACT_APP_LARAVEL_API_URL}/api/comments`;
const apiUrlLike = `${process.env.REACT_APP_LARAVEL_API_URL}/api/likes`;

// 非同期関数
// ※非同期関数はcreateSlice()の外に書く。
// createAsyncThunk
// https://redux-toolkit.js.org/api/createAsyncThunk

// 投稿一覧取得
export const fetchAsyncGetPosts = createAsyncThunk("posts/get", async () => {
  const res = await axios.get(apiUrlPost, {
    headers: {
      // prettier-ignore
      "Authorization": `Bearer ${localStorage.localJWT}`,
    },
  });
  return res.data;
});

// 投稿作成
export const fetchAsyncNewPost = createAsyncThunk(
  "post/post",
  async (newPost: PROPS_NEWPOST) => {
    /**
     * FormData()
     * サーバーにデータを送信する際に使用するbuilt-inコンストラクタ。下記2とおりの使い方がある。
     *   1. フォームの内容をキャプチャする
     *   2. 空の FormData インスタンスを作成して、それにデータを設定、変更する。
     * 今回は2の使い方。
     * インスタンス化したら append() メソッドを呼び出すことでフィールドを追加できる。
     */
    // uploadするデータの箱。
    const uploadData = new FormData();
    uploadData.append("title", newPost.title);
    /**
     * formData.append(name, blob, fileName)
     * フィールドを追加。3つ目の引数 fileName はファイル名を設定する(フィールド名ではない)。
     * 参照
     * https://ja.javascript.info/formdata
     */
    // imgを追加(必須項目)。
    newPost.img && uploadData.append("img", newPost.img, newPost.img.name);

    const res = await axios.post(apiUrlPost, uploadData, {
      headers: {
        "Content-Type": "application/json",
        // prettier-ignore
        "Authorization": `Bearer ${localStorage.localJWT}`,
      },
    });
    return res.data;
  }
);

// コメント一覧取得
export const fetchAsyncGetComments = createAsyncThunk(
  "comments/get",
  async () => {
    const res = await axios.get(apiUrlComment, {
      headers: {
        // prettier-ignore
        "Authorization": `Bearer ${localStorage.localJWT}`,
      },
    });
    return res.data;
  }
);

// コメント作成
export const fetchAsyncPostComment = createAsyncThunk(
  "comment/post",
  async (comment: PROPS_COMMENT) => {
    const res = await axios.post(apiUrlComment, comment, {
      headers: {
        "Content-Type": "application/json",
        // prettier-ignore
        "Authorization": `Bearer ${localStorage.localJWT}`,
      },
    });
    return res.data;
  }
);

// お気に入り一覧取得
export const fetchAsyncGetLikes = createAsyncThunk("likes/get", async () => {
  const res = await axios.get(apiUrlLike, {
    headers: {
      // prettier-ignore
      "Authorization": `Bearer ${localStorage.localJWT}`,
    },
  });
  return res.data;
});

// お気に入り登録
export const fetchAsyncPostLike = createAsyncThunk(
  "like/post",
  async (like: PROPS_LIKED) => {
    const res = await axios.post(apiUrlLike, like, {
      headers: {
        "Content-Type": "application/json",
        // prettier-ignore
        "Authorization": `Bearer ${localStorage.localJWT}`,
      },
    });
    return res.data;
  }
);

// お気に入り削除
export const fetchAsyncDeleteLike = createAsyncThunk(
  "like/delete",
  async (like: PROPS_LIKED) => {
    const res = await axios.delete(
      `${apiUrlLike}/${like.post}-${like.loginId}`,
      // deleteはpostなどとは違い、2nd paramにdataを指定して渡せない。
      // headersなどと同じように、objectの中にdataプロパティとして格納すると渡すことができる。
      {
        data: { like },
        headers: {
          "Content-Type": "application/json",
          // prettier-ignore
          "Authorization": `Bearer ${localStorage.localJWT}`,
        },
      }
    );
    return res.data;
  }
);

// createSlice
// https://redux-toolkit.js.org/api/createSlice
export const postSlice = createSlice({
  name: "post",
  initialState: {
    // 投稿の進行状態
    isLoadingPost: false,
    // 投稿modalの状態
    openNewPost: false,
    // 投稿
    posts: [
      {
        id: 0,
        user_id: 0,
        title: "",
        img_post: "",
        created_at: "",
        updated_at: "",
      },
    ],
    // コメント
    comments: [
      {
        user_id: 0,
        post_id: 0,
        text: "",
        updated_at: "",
        created_at: "",
        id: 0,
      },
    ],
    // お気に入り
    likes: [
      {
        user_id: 0,
        post_id: 0,
        updated_at: "",
        created_at: "",
      },
    ],
  },
  // reducers
  // https://redux-toolkit.js.org/api/createSlice#reducers
  reducers: {
    // 各reducerの引数は、stateのみ、またはstateとaction両方を持つことができる。
    // 投稿の進行状態管理
    fetchPostStart(state) {
      state.isLoadingPost = true;
    },
    fetchPostEnd(state) {
      state.isLoadingPost = false;
    },
    // 投稿modalの状態管理
    setOpenNewPost(state) {
      state.openNewPost = true;
    },
    resetOpenNewPost(state) {
      state.openNewPost = false;
    },
  },
  // extraReducers
  // https://redux-toolkit.js.org/api/createSlice#extrareducers
  // 上記createAsyncThunkで定義した非同期処理の後続処理をreducerに組み込む。
  extraReducers: (builder) => {
    // builder.addCase
    // https://redux-toolkit.js.org/api/createReducer#builderaddcase
    // 投稿一覧取得
    builder.addCase(fetchAsyncGetPosts.fulfilled, (state, action) => {
      // action.payload => createAsyncThunk()の2nd paramである非同期関数の返り値。
      return {
        ...state,
        posts: action.payload,
      };
    });
    // 投稿作成
    builder.addCase(fetchAsyncNewPost.fulfilled, (state, action) => {
      return {
        ...state,
        posts: [...state.posts, action.payload],
      };
    });
    // コメント一覧取得
    builder.addCase(fetchAsyncGetComments.fulfilled, (state, action) => {
      return {
        ...state,
        comments: action.payload,
      };
    });
    // コメント作成
    builder.addCase(fetchAsyncPostComment.fulfilled, (state, action) => {
      return {
        ...state,
        comments: [...state.comments, action.payload],
      };
    });
    // お気に入り一覧取得
    builder.addCase(fetchAsyncGetLikes.fulfilled, (state, action) => {
      return {
        ...state,
        likes: action.payload,
      };
    });
    // お気に入り登録
    builder.addCase(fetchAsyncPostLike.fulfilled, (state, action) => {
      return {
        ...state,
        likes: [...state.likes, action.payload],
      };
    });
    // お気に入り削除
    builder.addCase(fetchAsyncDeleteLike.fulfilled, (state, action) => {
      return {
        ...state,
        likes: state.likes.filter(
          (like) =>
            like.user_id !== action.payload.loginId ||
            like.post_id !== action.payload.post
        ),
      };
    });
  },
});

// reducersをexport。
export const {
  fetchPostStart,
  fetchPostEnd,
  setOpenNewPost,
  resetOpenNewPost,
} = postSlice.actions;

// useSelectorでアクセスできるよう定義。
// RootState => storeのすべてのsliceを含んだ型
// post => src/app/store.tsのconfigureStore()で定義した名前
export const selectIsLoadingPost = (state: RootState) =>
  state.post.isLoadingPost;
export const selectOpenNewPost = (state: RootState) => state.post.openNewPost;
export const selectPosts = (state: RootState) => state.post.posts;
export const selectComments = (state: RootState) => state.post.comments;
export const selectLikes = (state: RootState) => state.post.likes;

export default postSlice.reducer;
