import React, { useEffect, useState } from "react";
import { MdAddAPhoto } from "react-icons/md";
import Modal from "react-modal";
import { useDispatch, useSelector } from "react-redux";

import { Button, IconButton, TextField } from "@material-ui/core";

import { AppDispatch } from "../../app/store";
import {
    fetchAsyncUpdateProf, fetchProfileEnd, fetchProfileStart, resetOpenProfile, selectOpenProfile,
    selectProfile
} from "../auth/authSlice";
import { File } from "../types";
import styles from "./Core.module.css";

const customStyles = {
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

const EditProfile: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const openProfile = useSelector(selectOpenProfile);
  const profile = useSelector(selectProfile);
  const [nickname, setNickname] = useState(profile.nickname);
  const [image, setImage] = useState<File | null>(null);

  // console.log("profile.nickname: ", profile.nickname);
  // console.log("nickname: ", nickname);

  useEffect(() => {
    setNickname(profile.nickname);
  }, [profile]);

  const handlerEditPicture = () => {
    const fileInput = document.getElementById("imageProfile");
    // hidden attrで隠しているinput elをclickし、fileを選択する。
    fileInput?.click();
  };

  // submit
  const updateProfile = async (e: React.MouseEvent<HTMLElement>) => {
    // formのdefaultアクションによる再renderを抑止する。
    e.preventDefault();
    dispatch(fetchProfileStart());
    // modalを閉じる。
    dispatch(resetOpenProfile());
    const packet = {
      id: profile.id,
      nickname: nickname,
      img_profile: image,
    };
    // JWTの認証エラー時のために、formを初期化。
    setNickname(profile.nickname);
    setImage(null);
    // profile更新
    await dispatch(fetchAsyncUpdateProf(packet));
    dispatch(fetchProfileEnd());
  };

  return (
    <>
      <Modal
        isOpen={openProfile}
        // modal以外の背景部分をclickしたら、modalを閉じる。
        onRequestClose={async () => {
          await dispatch(resetOpenProfile());
          // 変更をキャンセル。
          setNickname(profile.nickname);
          setImage(null);
        }}
        style={customStyles}
      >
        <form className={styles.core_register}>
          <h2 className={styles.core_title}>Profile</h2>

          <p className={styles.core_paragraph}>
            プロフィール変更画面です。ニックネームとアバター画像を設定できます。
            <br />
            アバターの画像は、カメラポタンから選択できます（JPEG画像またはPNG画像）。
            <br />
            キャンセルする場合は、背景部分をタッチしてください。
          </p>
          <br />

          {/* nickname */}
          <TextField
            label="ニックネーム（最大20文字）"
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />

          {/* hidden attrによって非表示。
            以降のIconButtonによるhandlerEditPicture()によって操作する。 */}
          <input
            type="file"
            id="imageProfile"
            name="imageProfile"
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
            // nicknameが空の場合はdisabled
            disabled={!nickname || nickname.length > 20}
            variant="contained"
            color="primary"
            type="submit"
            onClick={updateProfile}
          >
            プロフィールを更新
          </Button>
        </form>
      </Modal>
    </>
  );
};

export default EditProfile;
