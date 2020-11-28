import React, { useState } from "react";
import { MdAddAPhoto } from "react-icons/md";
import Modal from "react-modal";
import { useDispatch, useSelector } from "react-redux";

import { Button, IconButton, TextField } from "@material-ui/core";

import { AppDispatch } from "../../app/store";
import {
    fetchAsyncNewPost, fetchPostEnd, fetchPostStart, resetOpenNewPost, selectOpenNewPost
} from "../post/postSlice";
import { File } from "../types";
import styles from "./Core.module.css";

// Modalのstyle
const customStyles = {
  overlay: {
    // Material-UIのiconなど、z-index設定がないとmodalより優先される要素が存在する。
    zIndex: 100,
  },
  content: {
    top: "55%",
    left: "50%",
    width: "85%",
    maxWidth: 380,
    height: "55%",
    paddingTop: "20px",
    transform: "translate(-50%, -50%)",
  },
};

const NewPost: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const openNewPost = useSelector(selectOpenNewPost);

  const [image, setImage] = useState<File | null>(null);
  const [title, setTitle] = useState("");

  const handlerEditPicture = () => {
    const fileInput = document.getElementById("imagePost");
    // hidden attrで隠しているinput elをclickし、fileを選択する。
    fileInput?.click();
  };

  // submit
  const newPost = async (e: React.MouseEvent<HTMLElement>) => {
    // formのdefaultアクションによる再renderを抑止する。
    e.preventDefault();
    // 投稿状態をon。
    dispatch(fetchPostStart());
    // modalを閉じる。
    dispatch(resetOpenNewPost());
    const packet = { title: title, img: image };
    // JWTの認証エラー時のために、formを初期化。
    setTitle("");
    setImage(null);
    // 投稿
    await dispatch(fetchAsyncNewPost(packet));
    // 投稿状態をoff。
    dispatch(fetchPostEnd());
  };

  return (
    <>
      <Modal
        isOpen={openNewPost}
        // modal以外の背景部分をclickしたら、modalを閉じる。
        onRequestClose={async () => {
          await dispatch(resetOpenNewPost());
          // 変更をキャンセル。
          setTitle("");
          setImage(null);
        }}
        style={customStyles}
      >
        <form className={styles.core_register}>
          <h2 className={styles.core_title}>Photo</h2>

          <p className={styles.core_paragraph}>
            投稿画面です。
            <br />
            カメラポタンから投稿したい画像を選択できます（JPEG画像またはPNG画像）。タイトル、画像、ともに必須項目です。
            <br />
            キャンセルする場合は、背景部分をタッチしてください。
          </p>
          <br />

          {/* 投稿タイトル */}
          <TextField
            label="タイトル（最大50文字）"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          {/* hidden attrによって非表示。
            以降のIconButtonによるhandlerEditPicture()によって操作する。 */}
          <input
            type="file"
            id="imagePost"
            name="imagePost"
            value=""
            // カメラiconのclickによって、img fileを選択するので、input elの実態は隠す。
            hidden={true}
            // 選択できるfileを指定。W3Cの推奨に基づき、MIMEタイプと拡張子、両方を記載。
            //   ※拡張子の大文字・小文字は区別されない。
            // accept="image/*"
            accept=".png, .jpg, .jpeg, image/png, image/jpeg"
            // fileは複数選択できるが、仕様上1fileのみ有効とするので、index0で指定。
            onChange={(e) => setImage(e.target.files![0])}
          />
          <br />

          {/* 画像選択 */}
          <IconButton onClick={handlerEditPicture}>
            <MdAddAPhoto />
          </IconButton>
          <p>{image ? `選択ファイル: ${image.name}` : ""}</p>
          <br />

          <Button
            // title, imageどちらも必須項目。未入力の場合はbuttonを押せない。
            disabled={!title || title.length > 50 || !image}
            variant="contained"
            color="primary"
            type="submit"
            onClick={newPost}
          >
            画像を投稿
          </Button>
        </form>
      </Modal>
    </>
  );
};

export default NewPost;
