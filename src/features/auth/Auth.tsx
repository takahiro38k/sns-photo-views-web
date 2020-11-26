import { Formik } from "formik";
import React from "react";
import Modal from "react-modal";
import { useDispatch, useSelector } from "react-redux";
import * as Yup from "yup";

import {
  Button,
  CircularProgress,
  Divider,
  TextField,
} from "@material-ui/core";

import { AppDispatch } from "../../app/store";
import {
  fetchAsyncGetComments,
  fetchAsyncGetLikes,
  fetchAsyncGetPosts,
} from "../post/postSlice";
import styles from "./Auth.module.css";
import {
  fetchAsyncCreateProf,
  fetchAsyncGetMyProf,
  fetchAsyncGetProfs,
  fetchAsyncLogin,
  fetchAsyncRegister,
  fetchCredEnd,
  fetchCredStart,
  resetLoginError,
  resetOpenLogin,
  resetRegisterCorrect,
  resetRegisterError,
  selectIsLoadingAuth,
  selectLoginError,
  selectOpenLogin,
  selectOpenRegister,
  selectRegisterCorrect,
  selectRegisterError,
  setLoginError,
  setRegisterCorrect,
  setRegisterError,
  fetchCredGuestStart,
  fetchCredGuestEnd,
  selectIsGuestLoadingAuth,
} from "./authSlice";

// top階層の.envで環境変数を設定。
// REACT_APP_ で定義したものを環境変数として使用できる。
// ! ブラウザに反映するには yarn start のやり直しが必要。
const guestEmail = process.env.REACT_APP_GUEST_EMAIL;
const guestPass = process.env.REACT_APP_GUEST_PASS;

// Modalのstyle
const customStyles = {
  // modal以外の部分(背景)
  overlay: {
    backgroundColor: "#bbdbf3",
  },
  content: {
    top: "55%",
    left: "50%",
    width: "85%",
    maxWidth: 380,
    height: "70%",
    paddingTop: "30px",
    transform: "translate(-50%, -50%)",
  },
};

const Auth: React.FC = () => {
  // Modalを使うためにDOMのidを指定する。
  Modal.setAppElement("#root");

  // storeから各stateを取得
  const openLogin = useSelector(selectOpenLogin);
  const openRegister = useSelector(selectOpenRegister);
  const isLoadingAuth = useSelector(selectIsLoadingAuth);
  const isGuestLoadingAuth = useSelector(selectIsGuestLoadingAuth);
  const registerCorrect = useSelector(selectRegisterCorrect);
  const registerError = useSelector(selectRegisterError);
  const loginError = useSelector(selectLoginError);

  const dispatch: AppDispatch = useDispatch();

  // guest用login処理
  const guestOnSubmit = async () => {
    const values = { email: guestEmail!, password: guestPass! };
    // 認証状態をon。
    dispatch(fetchCredStart());
    // 認証状態をon(guest用)。
    dispatch(fetchCredGuestStart());
    // submitのmessageを初期化。
    dispatch(resetLoginError());
    // login - JWT取得
    const result = await dispatch(fetchAsyncLogin(values));

    if (fetchAsyncLogin.fulfilled.match(result)) {
      // * login成功時
      // modalを閉じる。
      dispatch(resetOpenLogin());
      // values(各formの値)を初期化
      // * 並列処理。
      // https://qiita.com/rana_kualu/items/e6c5c0e4f60b0d18799d#lets-fix-the-examples
      // profile取得
      const getMyProf = dispatch(fetchAsyncGetMyProf());
      // profile一覧取得
      const getProfs = dispatch(fetchAsyncGetProfs());
      // 投稿一覧取得
      const getPosts = dispatch(fetchAsyncGetPosts());
      // comment一覧取得
      const getComments = dispatch(fetchAsyncGetComments());
      // お気に入り一覧取得
      const getLikes = dispatch(fetchAsyncGetLikes());
      await getMyProf;
      await getProfs;
      await getPosts;
      await getComments;
      await getLikes;
    } else {
      // * login失敗時
      // loginエラーを表示。
      dispatch(setLoginError());
    }
    // 認証状態をoff(guest用)。
    dispatch(fetchCredGuestEnd());
    // 認証状態をoff。
    dispatch(fetchCredEnd());
  };

  return (
    <>
      {/* register modal */}
      <Modal
        isOpen={openRegister}
        // modal以外の部分をclickすると実行
        // onRequestClose={async () => {
        //   await dispatch(resetOpenRegister());
        // }}
        style={customStyles}
      >
        {/* formik
          https://formik.org/docs/overview */}
        <Formik
          // errors propの初期値。
          // この初期値によってisValid propをfalseとし、新規登録Buttonを無効化する。
          initialErrors={{ email: "required" }}
          // values propの初期値。
          // password_confirmationはapiに合わせてスネークケース。
          initialValues={{ email: "", password: "", password_confirmation: "" }}
          // <form>内の type="submit" Buttonが押された時の処理を定義する。
          // TextFieldへの入力によって、initialValuesの値が更新され、valuesとして渡される。
          // resetForm => formの初期化を実行できる。
          onSubmit={async (values, { resetForm }) => {
            // submitのmessageを初期化。
            dispatch(resetRegisterCorrect());
            // error messageをクリア。
            dispatch(resetRegisterError());
            // 認証状態をon。
            dispatch(fetchCredStart());
            // register
            const result = await dispatch(fetchAsyncRegister(values));

            // console.log(result.payload);
            // console.log(result.payload.id);

            // match()
            // https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/String/match
            if (fetchAsyncRegister.fulfilled.match(result)) {
              // fetchAsyncRegister()が正常終了した場合の処理。
              if (
                result.payload.email[0] === "The email has already been taken."
              ) {
                // Emailがすでに登録されている場合。
                // error messageをon。
                dispatch(setRegisterError());
              } else {
                // 正常に登録できた場合。
                // profile作成。nicknameはdefault値で"ユーザー"とする。login後、変更可能。
                await dispatch(
                  fetchAsyncCreateProf({
                    id: result.payload.id,
                    nickname: "ユーザー",
                  })
                );
                // 正常終了messageをon。
                dispatch(setRegisterCorrect());
                // values(各formの値)を初期化
                resetForm();
              }
            }
            // 認証状態をoff。
            dispatch(fetchCredEnd());
          }}
          // Yup
          // https://github.com/jquense/yup
          validationSchema={Yup.object().shape({
            // validationしたいparamを表記する。
            email: Yup.string()
              // 複数条件のvalidationを.で連結できる。
              // validationがNGだった場合のmassageを()に記載
              // emailはYupで用意されているEメール用のvalidation
              .email("正しい形式のEメールを入力してください。")
              .required("必須項目です。"),
            password: Yup.string()
              .required("必須項目です。")
              // 正規表現によるvalidation
              .matches(/^[a-zA-Z0-9]+$/, "半角英数字で設定してください。")
              .min(8, "8文字以上で設定してください。")
              .max(64, "64文字以下で設定してください。"),
            password_confirmation: Yup.string()
              .required("必須項目です。")
              // Yup.ref()
              // https://til.hashrocket.com/posts/vahuw4phan-check-the-password-confirmation-with-yup
              .oneOf([Yup.ref("password")], "パスワードが一致しません。"),
          })}
        >
          {({
            handleSubmit, // <form>のonSubmitに渡すことで、type="submit"ボタンclick時に、<Formik>のonSubmitを実行。
            handleChange, // onChangeに渡すことで、入力値を管理する。
            handleBlur, // onBlurに渡すことで、touchedを判定できる。
            values, // 値
            errors, // validationに一致しなければtrue(値ごとに定義)
            touched, // formがフォーカスされたらtrue(値ごとに定義)
            isValid, // validationがOKならtrue(全体)
            isSubmitting, // submitの処理中はtrue
          }) => (
            <div>
              <form onSubmit={handleSubmit}>
                <div className={styles.auth_register}>
                  <h2 className={styles.auth_title}>Register</h2>
                  <p className={styles.auth_paragraph}>
                    Eメールとパスワードを入力して、アカウントを登録できます。
                  </p>

                  {/* email form */}
                  <TextField
                    placeholder="Eメール"
                    type="input"
                    name="email"
                    onChange={handleChange}
                    // 入力中のformからフォーカスが外れるとvalidationを実行する。
                    onBlur={handleBlur}
                    // initialValuesで定義した値を更新する。
                    value={values.email}
                  />
                  {touched.email && errors.email ? (
                    <div className={styles.auth_error}>{errors.email}</div>
                  ) : null}
                  <br />

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

                  {/* password form(確認) */}
                  <TextField
                    placeholder="パスワード（確認）"
                    type="password"
                    name="password_confirmation"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.password_confirmation}
                  />
                  {touched.password_confirmation &&
                  errors.password_confirmation ? (
                    <div className={styles.auth_error}>
                      {errors.password_confirmation}
                    </div>
                  ) : null}
                  <br />
                  <br />

                  {/* loading and message */}
                  <div className={styles.auth_progress}>
                    {/* CircularProgress => loadingのanimation */}
                    {isLoadingAuth && <CircularProgress size={34} />}
                    {registerCorrect && (
                      <p className={styles.auth_submit_correct}>
                        登録しました。「ログイン」メニューからログインできます。
                      </p>
                    )}
                    {registerError && (
                      <p className={styles.auth_submit_error}>
                        すでに登録されているEメールです。
                      </p>
                    )}
                  </div>

                  <Button
                    variant="contained"
                    color="primary"
                    disabled={!isValid || isSubmitting}
                    type="submit"
                  >
                    新規登録
                  </Button>

                  <p className={styles.auth_paragraph}>
                    アカウント登録済みの方は、右上の「ログイン」よりログインしてください。
                  </p>
                  {/* <p className={styles.auth_paragraph}>
                    アカウント登録済みの方は、下記よりログインしてください。
                  </p>
                  <span
                    className={styles.auth_text}
                    onClick={async () => {
                      // open login modal
                      await dispatch(setOpenLogin());
                      // close register modal
                      await dispatch(resetOpenRegister());
                      // messageが表示されている場合を考慮し、submitのmessageを初期化。
                      await dispatch(resetLoginError());
                    }}
                  >
                    ログインはこちら
                  </span> */}
                </div>
              </form>
            </div>
          )}
        </Formik>
      </Modal>

      {/* login modal */}
      {/* ※各項目の説明はregister modalを参照。 */}
      <Modal
        isOpen={openLogin}
        // modal以外の部分をclickすると実行
        // onRequestClose={async () => {
        //   await dispatch(resetOpenLogin());
        // }}
        style={customStyles}
      >
        <Formik
          initialErrors={{ email: "required" }}
          initialValues={{ email: "", password: "" }}
          onSubmit={async (values, { resetForm }) => {
            // const startTime = performance.now(); // 開始時間
            // 認証状態をon。
            dispatch(fetchCredStart());
            // submitのmessageを初期化。
            dispatch(resetLoginError());
            // login - JWT取得
            const result = await dispatch(fetchAsyncLogin(values));

            if (fetchAsyncLogin.fulfilled.match(result)) {
              // * login成功時
              // modalを閉じる。
              dispatch(resetOpenLogin());
              // values(各formの値)を初期化
              resetForm();

              // // profile取得
              // await dispatch(fetchAsyncGetMyProf());
              // // profile一覧取得
              // await dispatch(fetchAsyncGetProfs());
              // // 投稿一覧取得
              // await dispatch(fetchAsyncGetPosts());
              // // comment一覧取得
              // await dispatch(fetchAsyncGetComments());
              // // お気に入り一覧取得
              // await dispatch(fetchAsyncGetLikes());

              // * 上記だと直列処理となりperformanceが悪いので、下記のとおり並列処理とする。
              // https://qiita.com/rana_kualu/items/e6c5c0e4f60b0d18799d#lets-fix-the-examples
              // profile取得
              const getMyProf = dispatch(fetchAsyncGetMyProf());
              // profile一覧取得
              const getProfs = dispatch(fetchAsyncGetProfs());
              // 投稿一覧取得
              const getPosts = dispatch(fetchAsyncGetPosts());
              // comment一覧取得
              const getComments = dispatch(fetchAsyncGetComments());
              // お気に入り一覧取得
              const getLikes = dispatch(fetchAsyncGetLikes());
              await getMyProf;
              await getProfs;
              await getPosts;
              await getComments;
              await getLikes;
            } else {
              // * login失敗時
              // loginエラーを表示。
              dispatch(setLoginError());
            }
            // 認証状態をoff。
            dispatch(fetchCredEnd());
            // const endTime = performance.now(); // 終了時間
            // console.log(endTime - startTime); // 何ミリ秒かかったかを表示する
          }}
          validationSchema={Yup.object().shape({
            email: Yup.string()
              .email("正しい形式のEメールを入力してください。")
              .required("必須項目です。"),
            password: Yup.string()
              .required("必須項目です。")
              // 正規表現によるvalidation
              .matches(/^[a-zA-Z0-9]+$/, "パスワードは半角英数字です。")
              .min(8, "パスワードは8文字以上です。")
              .max(64, "パスワードは64文字以内です。"),
          })}
        >
          {({
            handleSubmit, // <form>のonSubmitに渡すことで、type="submit"ボタンclick時に、<Formik>のonSubmitを実行。
            handleChange, // onChangeに渡すことで、入力値を管理する。
            handleBlur, // onBlurに渡すことで、touchedを判定できる。
            values, // 値
            errors, // validationに一致しなければtrue(値ごとに定義)
            touched, // formがフォーカスされたらtrue(値ごとに定義)
            isValid, // validationがOKならtrue(全体)
            isSubmitting, // submitの処理中はtrue
          }) => (
            <div>
              <form onSubmit={handleSubmit}>
                <div className={styles.auth_register}>
                  <h2 className={styles.auth_title}>Login</h2>

                  <p className={styles.auth_paragraph}>
                    アカウントを登録せずにご利用になる場合は、下記のボタンからゲストとしてログインしてください。
                    <br />
                    <span className={styles.auth_paragraphSpan}>
                      ゲストアカウントは不特定多数の方がご利用になれますので、予期せぬデータ更新があり得ること、ご留意ください。
                    </span>
                  </p>

                  {/* loading */}
                  <div className={styles.auth_progress}>
                    {isGuestLoadingAuth && <CircularProgress size={34} />}
                  </div>

                  <Button
                    variant="contained"
                    color="secondary"
                    size="large"
                    fullWidth
                    disabled={isLoadingAuth}
                    onClick={guestOnSubmit}
                  >
                    <span className={styles.auth_guest_btn}>
                      ゲストとしてログイン
                    </span>
                  </Button>
                  <div className={styles.auth_divider}>
                    <Divider />
                  </div>

                  <p className={styles.auth_paragraph}>
                    ゲスト以外の方のログインはこちらです。
                  </p>

                  {/* email form */}
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

                  {/* loading and message */}
                  <div className={styles.auth_progress}>
                    {isLoadingAuth && !isGuestLoadingAuth && (
                      <CircularProgress size={34} />
                    )}
                    {loginError && (
                      <p className={styles.auth_submit_error}>
                        ログインできませんでした。Eメールとパスワードを確認してください。
                      </p>
                    )}
                  </div>

                  <Button
                    variant="contained"
                    color="primary"
                    disabled={!isValid || isSubmitting || isLoadingAuth}
                    type="submit"
                  >
                    ログイン
                  </Button>

                  <p className={styles.auth_paragraph}>
                    アカウント未登録の方は、右上の「新規登録」より登録できます。
                  </p>
                  {/* <p className={styles.auth_paragraph}>
                    アカウント未登録の方は、下記より登録できます。
                  </p>
                  <span
                    className={styles.auth_text}
                    onClick={async () => {
                      // open register modal
                      await dispatch(setOpenRegister());
                      // close login modal
                      await dispatch(resetOpenLogin());
                      // messageが表示されている場合を考慮し、submitのmessageを初期化。
                      await dispatch(resetRegisterCorrect());
                      await dispatch(resetRegisterError());
                    }}
                  >
                    新規登録はこちら
                  </span> */}
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
