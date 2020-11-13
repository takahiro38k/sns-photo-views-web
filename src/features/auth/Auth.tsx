import { Formik } from "formik";
import React from "react";
import Modal from "react-modal";
import { useDispatch, useSelector } from "react-redux";
import * as Yup from "yup";

import { Button, CircularProgress, TextField } from "@material-ui/core";

import { AppDispatch } from "../../app/store";
import { fetchAsyncGetComments, fetchAsyncGetPosts } from "../post/postSlice";
import styles from "./Auth.module.css";
import {
  fetchAsyncCreateProf,
  fetchAsyncGetMyProf,
  fetchAsyncGetProfs,
  fetchAsyncLogin,
  fetchAsyncRegister,
  fetchCredEnd,
  fetchCredStart,
  resetOpenSignIn,
  resetOpenSignUp,
  selectIsLoadingAuth,
  selectOpenSignIn,
  selectOpenSignUp,
  setOpenSignIn,
  setOpenSignUp,
} from "./authSlice";

// Modalのstyle
const customStyles = {
  // modal以外の部分(背景)
  overlay: {
    backgroundColor: "#777777",
  },
  content: {
    top: "55%",
    left: "50%",
    width: 280,
    height: 350,
    padding: "50px",
    transform: "translate(-50%, -50%)",
  },
};

const Auth: React.FC = () => {
  // Modalを使うためにDOMのidを指定する。
  Modal.setAppElement("#root");

  // storeから各stateを取得
  const openSignIn = useSelector(selectOpenSignIn);
  const openSignUp = useSelector(selectOpenSignUp);
  const isLoadingAuth = useSelector(selectIsLoadingAuth);

  const dispatch: AppDispatch = useDispatch();

  return (
    <>
      {/* sign up(register) modal */}
      <Modal
        isOpen={openSignUp}
        // modal以外の部分をclickすると実行
        onRequestClose={async () => {
          await dispatch(resetOpenSignUp());
        }}
        style={customStyles}
      >
        {/* formik
          https://formik.org/docs/overview */}
        <Formik
          initialErrors={{ email: "required" }}
          initialValues={{ email: "", password: "" }}
          // 入力値(email, password)がobjestとしてvaluesに渡される。
          onSubmit={async (values) => {
            await dispatch(fetchCredStart());
            // エンドポイントにアクセス
            const resultReg = await dispatch(fetchAsyncRegister(values));
            if (fetchAsyncRegister.fulfilled.match(resultReg)) {
              // アカウント作成が成功したらlogin => JWTを取得 => localStorageにJWTを格納
              await dispatch(fetchAsyncLogin(values));
              // defaultのprofileを作成
              await dispatch(fetchAsyncCreateProf({ nickName: "anonymous" }));

              // profileの一覧を取得
              await dispatch(fetchAsyncGetProfs());
              await dispatch(fetchAsyncGetPosts());
              await dispatch(fetchAsyncGetComments());

              // login userのprofileを取得
              await dispatch(fetchAsyncGetMyProf());
            }
            await dispatch(fetchCredEnd());
            // modalを閉じる。
            await dispatch(resetOpenSignUp());
          }}
          // Yup
          // https://github.com/jquense/yup
          validationSchema={Yup.object().shape({
            // validationしたいparamを表記する。
            email: Yup.string()
              // 複数条件のvalidationを.で連結できる。
              // validationがNGだった場合のmassageを()に記載
              // emailはYupで用意されているEメール用のvalidation
              .email("email format is wrong")
              .required("email is must"),
            password: Yup.string().required("password is must").min(4),
          })}
        >
          {({
            handleSubmit,
            handleChange,
            handleBlur,
            values,
            errors,
            touched, // formがフォーカスされたらtrue
            isValid, // validationがOKならtrue
          }) => (
            <div>
              <form onSubmit={handleSubmit}>
                <div className={styles.auth_signUp}>
                  <h1 className={styles.auth_title}>Photo Views</h1>
                  <br />
                  <div className={styles.auth_progress}>
                    {/* CircularProgress => 読込中のanimation */}
                    {isLoadingAuth && <CircularProgress />}
                  </div>
                  <br />

                  {/* email form */}
                  <TextField
                    placeholder="Eメール"
                    type="input"
                    name="email"
                    onChange={handleChange}
                    // 入力中のformからフォーカスが外れるとvalidationを実行する。
                    onBlur={handleBlur}
                    value={values.email}
                  />
                  <br />
                  {touched.email && errors.email ? (
                    <div className={styles.auth_error}>{errors.email}</div>
                  ) : null}

                  {/* password form */}
                  <TextField
                    placeholder="パスワード"
                    type="password"
                    name="password"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.password}
                  />
                  {touched.password && errors.password ? (
                    <div className={styles.auth_error}>{errors.password}</div>
                  ) : null}
                  <br />
                  <br />

                  <Button
                    variant="contained"
                    color="primary"
                    disabled={!isValid}
                    type="submit"
                  >
                    新規登録
                  </Button>
                  <br />
                  <br />
                  <span
                    className={styles.auth_text}
                    onClick={async () => {
                      // login用のmodalを開く
                      await dispatch(setOpenSignIn());
                      // register用のmodalを閉じる
                      await dispatch(resetOpenSignUp());
                    }}
                  >
                    ログインはこちら
                  </span>
                </div>
              </form>
            </div>
          )}
        </Formik>
      </Modal>

      {/* sign in(login) modal */}
      <Modal
        isOpen={openSignIn}
        onRequestClose={async () => {
          await dispatch(resetOpenSignIn());
        }}
        style={customStyles}
      >
        <Formik
          initialErrors={{ email: "required" }}
          initialValues={{ email: "", password: "" }}
          onSubmit={async (values) => {
            await dispatch(fetchCredStart());
            const result = await dispatch(fetchAsyncLogin(values));
            if (fetchAsyncLogin.fulfilled.match(result)) {
              await dispatch(fetchAsyncGetProfs());
              await dispatch(fetchAsyncGetPosts());
              await dispatch(fetchAsyncGetComments());
              await dispatch(fetchAsyncGetMyProf());
            }
            await dispatch(fetchCredEnd());
            await dispatch(resetOpenSignIn());
          }}
          validationSchema={Yup.object().shape({
            email: Yup.string()
              .email("email format is wrong")
              .required("email is must"),
            password: Yup.string().required("password is must").min(4),
          })}
        >
          {({
            handleSubmit,
            handleChange,
            handleBlur,
            values,
            errors,
            touched,
            isValid,
          }) => (
            <div>
              <form onSubmit={handleSubmit}>
                <div className={styles.auth_signUp}>
                  <h1 className={styles.auth_title}>Photo Views</h1>
                  <br />
                  <div className={styles.auth_progress}>
                    {isLoadingAuth && <CircularProgress />}
                  </div>
                  <br />

                  <TextField
                    placeholder="Eメール"
                    type="input"
                    name="email"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.email}
                  />

                  {touched.email && errors.email ? (
                    <div className={styles.auth_error}>{errors.email}</div>
                  ) : null}
                  <br />

                  <TextField
                    placeholder="パスワード"
                    type="password"
                    name="password"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.password}
                  />
                  {touched.password && errors.password ? (
                    <div className={styles.auth_error}>{errors.password}</div>
                  ) : null}
                  <br />
                  <br />
                  <Button
                    variant="contained"
                    color="primary"
                    disabled={!isValid}
                    type="submit"
                  >
                    ログイン
                  </Button>
                  <br />
                  <br />
                  <span
                    className={styles.auth_text}
                    onClick={async () => {
                      await dispatch(resetOpenSignIn());
                      await dispatch(setOpenSignUp());
                    }}
                  >新規登録はこちら</span>
                </div>
              </form>
            </div>
          )}
        </Formik>
      </Modal>
    </>
  );
};

export default Auth;
