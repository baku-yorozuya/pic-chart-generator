/**
 * CommentsManager - 負責載入與初始化 Giscus 留言板
 */
class CommentsManager {
  constructor(config = {}) {
    // 預設設定
    this.config = {
      repo: "baku-yorozuya/pic-chart-generator",
      repoId: "R_kgDORI_aMQ", // 從 giscus 官網獲取
      mapping: "number",
      term: "3",
      reactionsEnabled: "1",
      emitMetadata: "0",
      inputPosition: "bottom",
      theme: "preferred_color_scheme",
      lang: "zh-TW",
      crossOrigin: "anonymous",
      ...config
    };
  }

  /**
   * 將 Giscus 注入到指定容器
   * @param {string} containerId - HTML 容器的 ID
   */
  init(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const script = document.createElement("script");
    script.src = "https://giscus.app/client.js";
    script.setAttribute("data-repo", this.config.repo);
    script.setAttribute("data-repo-id", this.config.repoId);
    script.setAttribute("data-mapping", this.config.mapping);
    script.setAttribute("data-term", this.config.term);
    script.setAttribute("data-strict", "0");
    script.setAttribute("data-reactions-enabled", "1");
    script.setAttribute("data-emit-metadata", "0");
    script.setAttribute("data-input-position", "top");
    script.setAttribute("data-theme", this.config.theme);
    script.setAttribute("data-lang", this.config.lang);
    script.setAttribute("data-origin", window.location.origin); // 防止CORS錯誤
    script.crossOrigin = "anonymous";
    script.async = true;

    container.appendChild(script);
  }
}

// 導出 (或直接供全域使用)
window.CommentsManager = CommentsManager;