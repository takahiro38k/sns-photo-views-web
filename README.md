## Photo Views とは？

画像を投稿し、シェアできるアプリケーションです。<br />
https://photo-views.apps38k.work/

### AWS構成図

https://github.com/takahiro38k/sns-photo-views-api/blob/master/docs/AWS-photo_views.png

### ER図

https://github.com/takahiro38k/sns-photo-views-api/blob/master/docs/ERD-photo_views.png

### ソースコード

フロントエンド: https://github.com/takahiro38k/sns-photo-views-web<br />
バックエンド（API）: https://github.com/takahiro38k/sns-photo-views-api

### 言語

PHP, TypeScript, HTML, CSS

### データベース

MySQL（AWS: RDS）

### ライブラリ・フレームワーク

Laravel, React, Redux Toolkit, axios, Formik, Yup, react-modal, Material-UI

### プラットフォーム

AWS: EC2, RDS, CloudFront, S3, ALB, Route 53<br />
その他: Docker

<br />
※以降は、Create React App にデフォルトで記載されている README.md の内容です。

***

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app), using the [Redux](https://redux.js.org/) and [Redux Toolkit](https://redux-toolkit.js.org/) template.

## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `yarn test`

Launches the test runner in the interactive watch mode.<br />
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `yarn build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `yarn eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
