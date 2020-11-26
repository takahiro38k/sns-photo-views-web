import React, { useEffect, useRef, useState } from "react";
import { MdAddAPhoto } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";

import {
  Avatar,
  Badge,
  Button,
  CircularProgress,
  ClickAwayListener,
  Grid,
  Grow,
  MenuItem,
  MenuList,
  Paper,
  Popper,
} from "@material-ui/core";
import { createStyles, Theme, withStyles } from "@material-ui/core/styles";

import { AppDispatch } from "../../app/store";
import Auth from "../auth/Auth";
import {
  editNickname,
  fetchAsyncGetMyProf,
  fetchAsyncGetProfs,
  fetchAuthChecked,
  fetchCredEnd,
  fetchCredStart,
  resetLoginError,
  resetOpenLogin,
  resetOpenProfile,
  resetOpenRegister,
  resetRegisterCorrect,
  resetRegisterError,
  selectIsAuthChecked,
  selectIsLoadingAuth,
  selectProfile,
  setOpenLogin,
  setOpenProfile,
  setOpenRegister,
  selectIsLoadingProfile,
} from "../auth/authSlice";
import Post from "../post/Post";
import {
  fetchAsyncGetComments,
  fetchAsyncGetLikes,
  fetchAsyncGetPosts,
  resetOpenNewPost,
  selectIsLoadingPost,
  selectPosts,
  setOpenNewPost,
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
  const isAuthChecked = useSelector(selectIsAuthChecked);
  const isLoadingProfile = useSelector(selectIsLoadingProfile);

  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLButtonElement>(null);

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event: React.MouseEvent<EventTarget>) => {
    if (
      anchorRef.current &&
      anchorRef.current.contains(event.target as HTMLElement)
    ) {
      return;
    }
    setOpen(false);
  };

  function handleListKeyDown(event: React.KeyboardEvent) {
    if (event.key === "Tab") {
      event.preventDefault();
      setOpen(false);
    }
  }

  useEffect(() => {
    const fetchBootLoader = async () => {
      // JWTがすでに設定されている場合
      if (localStorage.localJWT) {
        // 認証状態をon。
        dispatch(fetchCredStart());
        // login modalをclose
        dispatch(resetOpenLogin());
        // login userのprofileを取得
        const result = await dispatch(fetchAsyncGetMyProf());
        if (fetchAsyncGetMyProf.rejected.match(result)) {
          // JWTが期限切れなどで認証できない場合、login modalを開く。
          dispatch(setOpenLogin());
        } else {
          // 並列処理
          // https://qiita.com/rana_kualu/items/e6c5c0e4f60b0d18799d#lets-fix-the-examples
          // profile一覧取得
          const getProfs = dispatch(fetchAsyncGetProfs());
          // 投稿一覧取得
          const getPosts = dispatch(fetchAsyncGetPosts());
          // comment一覧取得
          const getComments = dispatch(fetchAsyncGetComments());
          // お気に入り一覧取得
          const getLikes = dispatch(fetchAsyncGetLikes());
          await getProfs;
          await getPosts;
          await getComments;
          await getLikes;
        }
        // 認証状態をoff。
        dispatch(fetchCredEnd());
      }
      // 認証checkをtrue。
      dispatch(fetchAuthChecked());
    };
    fetchBootLoader();
  }, [dispatch]);

  return (
    <div>
      {/* modals */}
      {/* 以下3つのcomponentsはすべてmodal。
        状態管理によって表示するmodalを選定する。*/}
      <Auth />
      <EditProfile />
      <NewPost />

      {/* header */}
      <div className={styles.core_header}>
        <h1 className={styles.core_title}>Photo Views</h1>

        {/* 認証check前(最初のrender直後)はmenu非表示 */}
        {!isAuthChecked ? (
          <div></div>
        ) : profile?.nickname && !isLoadingAuth ? (
          <>
            {/* login時(nicknameが存在する時)かつ認証中でない場合、
              投稿ポタンとアバターmenuを表示。 */}
            <div className={styles.core_menu}>
              {/* 投稿button */}
              {/* api処理中はbuttonを非表示とし、読み込みマークを表示 */}
              {!isLoadingPost ? (
                <button
                  className={styles.core_btnModal}
                  onClick={() => {
                    // profile modalが開いていたらoff。
                    dispatch(resetOpenProfile());
                    // 投稿modalをon。
                    dispatch(setOpenNewPost());
                  }}
                >
                  <MdAddAPhoto />
                </button>
              ) : (
                <div className={styles.core_menu_postProgress}>
                  <CircularProgress size={26} />
                </div>
              )}

              {/* アバター画像ボタン */}
              {/* api処理中はbuttonを非表示とし、読み込みマークを表示 */}
              {!isLoadingProfile ? (
                <div className={styles.core_menu_avatar}>
                  <Button
                    className={styles.core_btnModal}
                    disabled={isLoadingAuth}
                    ref={anchorRef}
                    aria-controls={open ? "menu-list-grow" : undefined}
                    aria-haspopup="true"
                    onClick={handleToggle}
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
                      <Avatar alt="who?" src={profile.img_profile} />{" "}
                    </StyledBadge>
                  </Button>

                  {/* listメニュー */}
                  <Popper
                    open={open}
                    anchorEl={anchorRef.current}
                    role={undefined}
                    transition
                    disablePortal
                    // Popperの表示position
                    // https://material-ui.com/ja/components/popper/#scroll-playground
                    placement="bottom-end"
                  >
                    {({ TransitionProps }) => (
                      <Grow {...TransitionProps}>
                        <Paper>
                          <ClickAwayListener onClickAway={handleClose}>
                            <MenuList
                              autoFocusItem={open}
                              id="menu-list-grow"
                              onKeyDown={handleListKeyDown}
                            >
                              {/* profile */}
                              <MenuItem
                                onClick={() => {
                                  setOpen(false);
                                  // 投稿modalが開いていたらoff。
                                  dispatch(resetOpenNewPost());
                                  // profile modalをon。
                                  dispatch(setOpenProfile());
                                }}
                              >
                                プロフィール
                              </MenuItem>

                              {/* logout */}
                              <MenuItem
                                onClick={() => {
                                  setOpen(false);
                                  // JWTを削除
                                  localStorage.removeItem("localJWT");
                                  // nicknameが編集中の場合は空にする。
                                  dispatch(editNickname(""));
                                  // profile編集modalをoffにする。
                                  dispatch(resetOpenProfile());
                                  // 新規投稿modalをoffにする。
                                  dispatch(resetOpenNewPost());
                                  // login modalを開く。
                                  dispatch(setOpenLogin());
                                }}
                              >
                                ログアウト
                              </MenuItem>
                            </MenuList>
                          </ClickAwayListener>
                        </Paper>
                      </Grow>
                    )}
                  </Popper>
                </div>
              ) : (
                <div className={styles.core_menu_profileProgress}>
                  <CircularProgress size={26} />
                </div>
              )}
            </div>
          </>
        ) : (
          <div>
            {/* loginしていない状態では、ログインと新規登録menuを表示。 */}
            <Button
              onClick={() => {
                dispatch(setOpenLogin());
                dispatch(resetOpenRegister());
                // messageが表示されている場合を考慮し、submitのmessageを初期化。
                dispatch(resetLoginError());
              }}
              disabled={isLoadingAuth}
            >
              ログイン
            </Button>
            <Button
              onClick={() => {
                dispatch(setOpenRegister());
                dispatch(resetOpenLogin());
                // messageが表示されている場合を考慮し、submitのmessageを初期化。
                dispatch(resetRegisterCorrect());
                dispatch(resetRegisterError());
              }}
              disabled={isLoadingAuth}
            >
              新規登録
            </Button>
          </div>
        )}
      </div>

      {/* 認証中の読み込み表示 */}
      {isLoadingAuth && (
        <>
          <div className={styles.core_progress}>
            <CircularProgress size={34} />
          </div>
          <p className={styles.core_progress_text}>Now Loading...</p>
        </>
      )}

      {/* 投稿一覧 */}
      {/* loginしている時だけ表示。 */}
      {isAuthChecked && profile?.nickname && (
        <>
          <div className={styles.core_posts}>
            <Grid container spacing={3}>
              {posts
                .slice(0)
                .reverse() // 最新の投稿を先頭に表示
                .map((post) => (
                  <Grid key={post.id} item xs={12} sm={6} md={4} lg={3}>
                    {/* 投稿一覧 */}
                    <Post
                      postId={post.id}
                      title={post.title}
                      loginId={profile.user_id}
                      userPost={post.user_id} // 投稿したuserのid
                      imageUrl={post.img_post}
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
