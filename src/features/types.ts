/**
 * file objectの型定義
 * Blob
 * Binary Large Object。バイナリデータであるため、テキストファイルだけではなく
 * 画像やPDFなどいろいろな形式のファイルを扱うことができる。
 */
export interface File extends Blob {
  readonly lastModified: number;
  readonly name: string;
}

/**
 * authSlice.ts
 */
export interface PROPS_AUTHEN {
  email: string;
  password: string;
}

export interface PROPS_PROFILE {
  id: number;
  nickname: string;
  img_profile: File | null;
}

export interface PROPS_INITPROFILE {
  id: number;
  nickname: string;
}

/**
 * postSlice.ts
 */
export interface PROPS_NEWPOST {
  title: string;
  img: File | null;
}

export interface PROPS_LIKED {
  // login中のuser id
  loginId: number;
  // 投稿のid
  post: number;
}

export interface PROPS_COMMENT {
  // コメント
  text: string;
  // 対象の投稿のid
  post: number;
}

/**
 * Post.tsx
 */
export interface PROPS_POST {
  // 対象の投稿のid
  postId: number;
  // login中のuser id
  loginId: number;
  // 投稿したuserのid
  userPost: number;
  // 投稿のtitle
  title: string;
  // 投稿画像のURL
  imageUrl: string;
}
