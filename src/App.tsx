import axios from "axios";
import React from "react";

import styles from "./App.module.css";
import Core from "./features/core/Core";

// backendでAjax通信以外のアクセスを遮断しているため、axiosを常にAjax通信とする。
axios.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";

function App() {
  return (
    <div className={styles.app}>
      <Core />
    </div>
  );
}

export default App;
