import React, { useEffect } from "react";
import { MdAddAPhoto } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";

import { Avatar, Badge, Button, CircularProgress, Grid } from "@material-ui/core";
import { createStyles, Theme, withStyles } from "@material-ui/core/styles";

import { AppDispatch } from "../../app/store";
import Auth from "../auth/Auth";
import {
    editNickname, fetchAsyncGetMyProf, fetchAsyncGetProfs, resetOpenProfile, resetOpenSignIn,
    resetOpenSignUp, selectIsLoadingAuth, selectProfile, setOpenProfile, setOpenSignIn,
    setOpenSignUp
} from "../auth/authSlice";
import Post from "../post/Post";
import {
    fetchAsyncGetComments, fetchAsyncGetPosts, resetOpenNewPost, selectIsLoadingPost, selectPosts,
    setOpenNewPost
} from "../post/postSlice";
// cssをmodule化してimport。
// https://create-react-app.dev/docs/adding-a-css-modules-stylesheet/
import styles from "./Core.module.css";
import EditProfile from "./EditProfile";
import NewPost from "./NewPost";

// Material-UI: StyledBadge
// Avatarの画像にログイン中のバッジをつける。
// https://material-ui.com/components/avatars/#with-badge
const StyledBadge = withStyles((theme: Theme) =>
  createStyles({
    badge: {
      backgroundColor: "#44b700",
      color: "#44b700",
      boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
      "&::after": {
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        borderRadius: "50%",
        animation: "$ripple 1.2s infinite ease-in-out",
        border: "1px solid currentColor",
        content: '""',
      },
    },
    "@keyframes ripple": {
      "0%": {
        transform: "scale(.8)",
        opacity: 1,
      },
      "100%": {
        transform: "scale(2.4)",
        opacity: 0,
      },
    },
  })
)(Badge);

const Core: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const profile = useSelector(selectProfile);
  const posts = useSelector(selectPosts);
  const isLoadingPost = useSelector(selectIsLoadingPost);
  const isLoadingAuth = useSelector(selectIsLoadingAuth);

  useEffect(() => {
    const fetchBootLoader = async () => {
      // JWTがすでに設定されている場合
      if (localStorage.localJWT) {
        // sign inのmodalをclose
        dispatch(resetOpenSignIn());
        // sign in userのprofileを取得
        const result = await dispatch(fetchAsyncGetMyProf());
        // JWTが期限切れなどで認証できない場合、sign inのmodalを開き、このfuncを終了する。
        if (fetchAsyncGetMyProf.rejected.match(result)) {
          dispatch(setOpenSignIn());
          return null;
        }
        // 投稿一覧取得
        await dispatch(fetchAsyncGetPosts());
        // profile一覧取得
        await dispatch(fetchAsyncGetProfs());
        // comment一覧取得
        await dispatch(fetchAsyncGetComments());
      }
    };
    fetchBootLoader();
  }, [dispatch]);

  return (
    <div>
      <Auth />
      <EditProfile />
      <NewPost />
      <div className={styles.core_header}>
        <h1 className={styles.core_title}>Photo Views</h1>
        {/* sign inしている時(nickNameが存在する時)のみ表示 */}
        {profile?.nickName ? (
          <>
            {/* 投稿button */}
            <button
              className={styles.core_btnModal}
              onClick={() => {
                // 新規投稿modalを開く
                dispatch(setOpenNewPost());
                dispatch(resetOpenProfile());
              }}
            >
              <MdAddAPhoto />
            </button>
            <div className={styles.core_logout}>
              {/* 投稿中 or 認証中の時、読み込み中の表示を出す。 */}
              {(isLoadingPost || isLoadingAuth) && <CircularProgress />}

              {/* logout button */}
              <Button
                onClick={() => {
                  // JWTを削除
                  localStorage.removeItem("localJWT");
                  // nicknameが編集中の場合は空にする。
                  dispatch(editNickname(""));
                  // profile編集modalをoffにする。
                  dispatch(resetOpenProfile());
                  // 新規投稿modalをoffにする。
                  dispatch(resetOpenNewPost());
                  // sign in modalを開く。
                  dispatch(setOpenSignIn());
                }}
              >
                ログアウト
              </Button>
              <button
                className={styles.core_btnModal}
                onClick={() => {
                  dispatch(setOpenProfile());
                  // 投稿用modalが開いていたらoff。
                  dispatch(resetOpenNewPost());
                }}
              >
                {/* アバター画像 */}
                <StyledBadge
                  overlap="circle"
                  anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "right",
                  }}
                  variant="dot"
                >
                  <Avatar alt="who?" src={profile.img} />{" "}
                </StyledBadge>
              </button>
            </div>
          </>
        ) : (
          // sign inしていない時のみ表示
          <div>
            <Button
              onClick={() => {
                dispatch(setOpenSignIn());
                dispatch(resetOpenSignUp());
              }}
            >
              ログイン
            </Button>
            <Button
              onClick={() => {
                dispatch(setOpenSignUp());
                dispatch(resetOpenSignIn());
              }}
            >
              新規登録
            </Button>
          </div>
        )}
      </div>

      {/* sign inしている時だけ表示。 */}
      {profile?.nickName && (
        <>
          <div className={styles.core_posts}>
            <Grid container spacing={4}>
              {posts
                .slice(0)
                .reverse() // 最新の投稿を先頭に表示
                .map((post) => (
                  <Grid key={post.id} item xs={12} md={4}>
                    {/* 投稿一覧 */}
                    <Post
                      postId={post.id}
                      title={post.title}
                      loginId={profile.userProfile}
                      userPost={post.userPost} // 投稿したuserのid
                      imageUrl={post.img}
                      liked={post.liked} // 投稿にいいねをしたuser idの配列
                    />
                  </Grid>
                ))}
            </Grid>
          </div>
        </>
      )}
    </div>
  );
};

export default Core;
