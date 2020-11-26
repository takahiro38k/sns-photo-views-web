import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  Avatar,
  Button,
  Checkbox,
  Divider,
  CircularProgress,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { Favorite, FavoriteBorder } from "@material-ui/icons";
import AvatarGroup from "@material-ui/lab/AvatarGroup";

import { AppDispatch } from "../../app/store";
import { selectProfiles } from "../auth/authSlice";
import { PROPS_POST } from "../types";
import styles from "./Post.module.css";
import {
  fetchAsyncPostLike,
  fetchAsyncPostComment,
  selectComments,
  selectLikes,
  fetchAsyncDeleteLike,
} from "./postSlice";

// 投稿に対するcommentのアバター画像を小さくするためのstyle
// https://material-ui.com/components/avatars/#sizes
const useStyles = makeStyles((theme) => ({
  small: {
    width: theme.spacing(3),
    height: theme.spacing(3),
    marginRight: theme.spacing(1),
  },
}));

const Post: React.FC<PROPS_POST> = ({
  postId,
  loginId,
  userPost,
  title,
  imageUrl,
}) => {
  const classes = useStyles();
  const dispatch: AppDispatch = useDispatch();

  const profiles = useSelector(selectProfiles);
  const comments = useSelector(selectComments);
  const likes = useSelector(selectLikes);

  const [text, setText] = useState("");
  const [isLoadingComment, setIsLoadingComment] = useState(false);
  const [isLoadingLike, setIsLoadingLike] = useState(false);

  // filter()
  // https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Array/filter
  // 投稿したuserのprofileを抽出
  const prof = profiles.filter((prof) => {
    return prof.user_id === userPost;
  });

  // 対象の投稿に結びつくcommentを抽出
  const commentsOnPost = comments.filter((com) => {
    return com.post_id === postId;
  });

  // 対象の投稿に結びつくlikeを抽出
  const likesOnPost = likes.filter((like) => {
    return like.post_id === postId;
  });

  // お気に入りbuttonのtoggle。すでにお気に入りならtrue。
  const likeChecked = likesOnPost.some((like) => like.user_id === loginId);

  // 投稿に対するcommentの実行
  const postComment = async (e: React.MouseEvent<HTMLElement>) => {
    // formのdefaultアクションによる再renderを抑止する。
    e.preventDefault();
    setIsLoadingComment(true);
    const packet = { text: text, post: postId };
    setText("");
    // コメントをpost。
    await dispatch(fetchAsyncPostComment(packet));
    setIsLoadingComment(false);
  };

  // 投稿に対するお気に入りの実行
  const handlerLiked = async () => {
    setIsLoadingLike(true);
    const packet = {
      loginId: loginId,
      post: postId,
    };
    if (!likeChecked) {
      // お気に入りをon(post)
      await dispatch(fetchAsyncPostLike(packet));
    } else if (likeChecked) {
      // お気に入りをoff(delete)
      await dispatch(fetchAsyncDeleteLike(packet));
    }
    setIsLoadingLike(false);
  };

  // 投稿の有無でreturnを条件分岐
  // 投稿がある(投稿のtitleが存在する)場合
  if (title) {
    return (
      <div className={styles.post}>
        <div className={styles.post_header}>
          {/* 投稿したuserのアバター情報 */}
          <Avatar className={styles.post_avatar} src={prof[0]?.img_profile} />
          <p>{prof[0]?.nickname}</p>
        </div>
        <h3 className={styles.post_text}>{title}</h3>

        {/* 投稿された画像 */}
        <img
          className={styles.post_image}
          src={imageUrl}
          alt={`image_${title}`}
        />

        <div className={styles.post_checkBox}>
          {/* お気に入りbutton */}
          {/* api処理中はbuttonを非表示とし、読み込みマークを表示 */}
          {!isLoadingLike ? (
            <Checkbox
              icon={<FavoriteBorder />}
              checkedIcon={<Favorite />}
              /**
               * Array.prototype.some()
               * 配列の各要素に対してcallback(条件式)を実行し、
               * ひとつ以上の要素が条件を満たせばtrueを返す。
               */
              // trueの時、お気に入りがついた状態。
              checked={likeChecked}
              onChange={handlerLiked}
            />
          ) : (
            <CircularProgress size={20} />
          )}
        </div>

        {/* お気に入りをしたuserのアバター一覧 */}
        <div className={styles.post_liked}>
          <p className={styles.post_explanation}>お気に入りを押したユーザー</p>
          {/* max => アバター画像の表示上限。上限を超える分は"+n"の形式で表示される。 */}
          <AvatarGroup max={7}>
            {likesOnPost.map((like) => (
              <Avatar
                className={styles.post_avatarGroup}
                key={like.user_id} // お気に入りをしたuserのidをkeyとする。
                src={
                  profiles.find((prof) => prof.user_id === like.user_id)
                    ?.img_profile
                }
              />
            ))}
          </AvatarGroup>
        </div>

        <Divider />

        {/* commentsOnPost => 投稿に対するcommentの一覧 */}
        <div className={styles.post_comments}>
          <p className={styles.post_explanation}>コメント一覧</p>
          {commentsOnPost.map((comment) => (
            <div key={comment.id} className={styles.post_comment}>
              <Avatar
                src={
                  /**
                   * Array.prototype.find()
                   * 1st paramに指定したテスト関数を満たす最初の要素の値を返す。
                   */
                  // profileの一覧からcommentしたuserの要素を取得し、アバター画像を取得。
                  profiles.find((prof) => prof.user_id === comment.user_id)
                    ?.img_profile
                }
                className={classes.small}
              />
              <p className={styles.post_comment_user}>
                {
                  // profileの一覧からcommentしたuserの要素を取得し、nicknameを取得。
                  profiles.find((prof) => prof.user_id === comment.user_id)
                    ?.nickname
                }
                &ensp;{comment.text}
              </p>
            </div>
          ))}
        </div>
        <Divider variant="middle" />

        {/* comment投稿form */}
        <form className={styles.post_commentBox}>
          <input
            className={styles.post_input}
            type="text"
            placeholder="投稿にコメント(最大100文字)"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          {/* comment button */}
          {/* api処理中はbuttonを非表示とし、読み込みマークを表示 */}
          {!isLoadingComment ? (
            <Button
              color="primary"
              size="small"
              // text(入力comment)が空の場合、または100文字を超えた場合、無効化。
              disabled={!text.length || text.length > 100}
              type="submit"
              onClick={postComment}
            >
              <span className={styles.post_comment_btn}>追加</span>
            </Button>
          ) : (
            <div className={styles.post_progress_small}>
              <CircularProgress size={20} />
            </div>
          )}
        </form>
      </div>
    );
  }
  // 投稿がひとつもない場合。
  return null;
};

export default Post;
