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

const customStyles = {
  content: {
    top: "55%",
    left: "50%",
    width: "85%",
    maxWidth: 280,
    height: 220,
    paddingTop: "30px",
    transform: "translate(-50%, -50%)",
  },
};

const NewPost: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const openNewPost = useSelector(selectOpenNewPost);

  const [image, setImage] = useState<File | null>(null);
  const [title, setTitle] = useState("");

  const handlerEditPicture = () => {
    const fileInput = document.getElementById("imageInput");
    // hidden attrで隠しているinput elをclickし、fileを選択する。
    fileInput?.click();
  };

  // New post buttonによるsubmit処理。
  const newPost = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    const packet = { title: title, img: image };
    await dispatch(fetchPostStart());
    await dispatch(fetchAsyncNewPost(packet));
    await dispatch(fetchPostEnd());
    setTitle("");
    setImage(null);
    dispatch(resetOpenNewPost());
  };

  return (
    <>
      <Modal
        isOpen={openNewPost}
        // modal以外の背景部分をclickしたら、modalを閉じる。
        onRequestClose={async () => {
          await dispatch(resetOpenNewPost());
        }}
        style={customStyles}
      >
        <form className={styles.core_register}>
          <h2 className={styles.core_title}>Photo</h2>

          <br />
          <TextField
            placeholder="Please enter caption"
            type="text"
            onChange={(e) => setTitle(e.target.value)}
          />

          {/* hidden attrによって非表示。
            以降のIconButtonによるhandlerEditPicture()によって操作する。 */}
          <input
            type="file"
            id="imageInput"
            // カメラiconのclickによって、img fileを選択するので、input elの実態は隠す。
            hidden={true}
            // fileは複数選択できるが、仕様上1fileのみ有効とするので、index0で指定。
            onChange={(e) => setImage(e.target.files![0])}
          />
          <br />
          <IconButton onClick={handlerEditPicture}>
            <MdAddAPhoto />
          </IconButton>
          <br />
          <Button
            // title, imageどちらも必須項目。未入力の場合はbuttonを押せない。
            disabled={!title || !image}
            variant="contained"
            color="primary"
            onClick={newPost}
          >
            New post
          </Button>
        </form>
      </Modal>
    </>
  );
};

export default NewPost;
