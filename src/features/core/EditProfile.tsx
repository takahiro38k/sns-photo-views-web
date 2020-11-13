import React, { useState } from "react";
import { MdAddAPhoto } from "react-icons/md";
import Modal from "react-modal";
import { useDispatch, useSelector } from "react-redux";

import { Button, IconButton, TextField } from "@material-ui/core";

import { AppDispatch } from "../../app/store";
import {
    editNickname, fetchAsyncUpdateProf, fetchCredEnd, fetchCredStart, resetOpenProfile,
    selectOpenProfile, selectProfile
} from "../auth/authSlice";
import { File } from "../types";
import styles from "./Core.module.css";

const customStyles = {
  content: {
    top: "55%",
    left: "50%",

    width: 280,
    height: 220,
    padding: "50px",

    transform: "translate(-50%, -50%)",
  },
};

const EditProfile: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const openProfile = useSelector(selectOpenProfile);
  const profile = useSelector(selectProfile);
  // profileの画像img
  const [image, setImage] = useState<File | null>(null);

  // profileのupdate buttonで実行
  const updateProfile = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    const packet = { id: profile.id, nickName: profile.nickName, img: image };

    await dispatch(fetchCredStart());
    await dispatch(fetchAsyncUpdateProf(packet));
    await dispatch(fetchCredEnd());
    await dispatch(resetOpenProfile());
  };

  const handlerEditPicture = () => {
    const fileInput = document.getElementById("imageInput");
    // hidden attrで隠しているinput elをclickし、fileを選択する。
    fileInput?.click();
  };

  return (
    <>
      <Modal
        isOpen={openProfile}
        // modal以外の背景部分をclickしたら、modalを閉じる。
        onRequestClose={async () => {
          await dispatch(resetOpenProfile());
        }}
        style={customStyles}
      >
        <form className={styles.core_signUp}>
          <h1 className={styles.core_title}>Photo Views</h1>

          <br />
          {/* nickname変更 */}
          <TextField
            placeholder="nickname"
            type="text"
            value={profile?.nickName}
            onChange={(e) => dispatch(editNickname(e.target.value))}
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
            // nicknameが空の場合はbuttonを押せないぬ
            disabled={!profile?.nickName}
            variant="contained"
            color="primary"
            type="submit"
            onClick={updateProfile}
          >
            Update
          </Button>
        </form>
      </Modal>
    </>
  );
};

export default EditProfile;
