import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { Avatar, Checkbox, Divider } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { Favorite, FavoriteBorder } from "@material-ui/icons";
import AvatarGroup from "@material-ui/lab/AvatarGroup";

import { AppDispatch } from "../../app/store";
import { selectProfiles } from "../auth/authSlice";
import { PROPS_POST } from "../types";
import styles from "./Post.module.css";
import {
    fetchAsyncPatchLiked, fetchAsyncPostComment, fetchPostEnd, fetchPostStart, selectComments
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
  liked,
}) => {
  const classes = useStyles();
  const dispatch: AppDispatch = useDispatch();
  const profiles = useSelector(selectProfiles);
  const comments = useSelector(selectComments);
  const [text, setText] = useState("");

  // 対象の投稿に結びつくcommentを抽出
  const commentsOnPost = comments.filter((com) => {
    return com.post === postId;
  });

  // 投稿したuserのprofileを抽出
  const prof = profiles.filter((prof) => {
    return prof.userProfile === userPost;
  });

  // 投稿に対するcommentの実行
  const postComment = async (e: React.MouseEvent<HTMLElement>) => {
    // 無駄なrefreshを無効化
    e.preventDefault();
    const packet = { text: text, post: postId };
    await dispatch(fetchPostStart());
    await dispatch(fetchAsyncPostComment(packet));
    await dispatch(fetchPostEnd());
    setText("");
  };

  // 投稿に対するいいねの実行
  const handlerLiked = async () => {
    const packet = {
      id: postId,
      title: title,
      current: liked,
      new: loginId, // いいねをしたuserのid = login userのid
    };
    await dispatch(fetchPostStart());
    await dispatch(fetchAsyncPatchLiked(packet));
    await dispatch(fetchPostEnd());
  };

  // 投稿の有無でreturnを条件分岐

  // 投稿がある(投稿のtitleが存在する)場合
  if (title) {
    return (
      <div className={styles.post}>
        <div className={styles.post_header}>
          {/* 投稿したuserのアバター情報 */}
          <Avatar className={styles.post_avatar} src={prof[0]?.img} />
          <h3>{prof[0]?.nickName}</h3>
        </div>
        {/* 投稿された画像 */}
        <img className={styles.post_image} src={imageUrl} alt="" />

        <h4 className={styles.post_text}>
          {/* いいねbutton */}
          <Checkbox
            className={styles.post_checkBox}
            icon={<FavoriteBorder />}
            checkedIcon={<Favorite />}
            /**
             * Array.prototype.some()
             * 配列の各要素に対してcallback(条件式)を実行し、
             * ひとつ以上の要素が条件を満たせばtrueを返す。
             */
            // trueの時、いいねがついた状態。
            checked={liked.some((like) => like === loginId)}
            onChange={handlerLiked}
          />
          {/* いいねの隣に表示する投稿userのnickname */}
          <strong> {prof[0]?.nickName}</strong> {title}
          {/* いいねをしたuserのアバター一覧 */}
          {/* max => アバター画像の表示上限。上限を超える分は"+n"の形式で表示される。 */}
          <AvatarGroup max={7}>
            {liked.map((like) => (
              <Avatar
                className={styles.post_avatarGroup}
                key={like} // いいねをしたuserのidをkeyとする。
                src={profiles.find((prof) => prof.userProfile === like)?.img}
              />
            ))}
          </AvatarGroup>
        </h4>

        <Divider />
        <div className={styles.post_comments}>
          {/* commentsOnPost => 投稿に対するcommentの一覧 */}
          {commentsOnPost.map((comment) => (
            <div key={comment.id} className={styles.post_comment}>
              <Avatar
                src={
                  /**
                   * Array.prototype.find()
                   * 1st paramに指定したテスト関数を満たす最初の要素の値を返す。
                   */
                  // profileの一覧からcommentしたuserのidを調べ、アバター画像を取得。
                  profiles.find(
                    (prof) => prof.userProfile === comment.userComment
                  )?.img
                }
                className={classes.small}
              />
              <p>
                <strong className={styles.post_strong}>
                  {
                    // profileの一覧からcommentしたuserのidを調べ、nicknameを取得。
                    profiles.find(
                      (prof) => prof.userProfile === comment.userComment
                    )?.nickName
                  }
                </strong>
                {comment.text}
              </p>
            </div>
          ))}
        </div>

        {/* comment投稿form */}
        <form className={styles.post_commentBox}>
          <input
            className={styles.post_input}
            type="text"
            placeholder="add a comment"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button
            // text(入力comment)が空の場合、buttonを押せなくする。
            disabled={!text.length}
            className={styles.post_button}
            type="submit"
            onClick={postComment}
          >
            Post
          </button>
        </form>
      </div>
    );
  }
  // 投稿がひとつもない場合。
  return null;
};

export default Post;
