/**
 * @fileoverview js/components/CommentDrawer.js
 * @description 繼承自 BaseOverlay 的具體組件。
 * 包含 Giscus 留言側欄，實作模糊背景下的互動 UI。
 * @version 1.0.0
 * @author Baku Yorozuya Develop
 */

// --- 2. 留言側欄組件 ---
BakuApp.Components.CommentDrawer = class extends (
  BakuApp.Components.BaseOverlay
) {
  constructor(containerId = "drawer-container") {
    super(containerId);
    this.renderContent(this._getTemplate());
    this.config = {
      repo: "baku-yorozuya/pic-chart-generator",
      repoId: "R_kgDORI_aMQ",
      mapping: "number",
      term: "3",
      reactionsEnabled: "1",
      emitMetadata: "0",
      inputPosition: "bottom",
      theme: "preferred_color_scheme",
      lang: "zh-TW",
      crossOrigin: "anonymous",
    };
  }

  _getTemplate() {
    return /*html*/ `
          <div class="drawer-content" id="comment-box">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                  <h2>💬 社群討論</h2>
                  <button class="close-trigger" style="border:none; background:none; font-size:24px; cursor:pointer;">&times;</button>
              </div>
              <div class="drawer-body">
                  <div class="giscus"></div>
              </div>
          </div>
      `;
  }

  _loadGiscus() {
    if (this.container.querySelector("script")) return;
    const script = document.createElement("script");
    script.src = "https://giscus.app/client.js";
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
    this.container.querySelector(".giscus").appendChild(script);
  }

  onShow() {
    this.container.querySelector("#comment-box").classList.add("active");
    this._loadGiscus();
  }
  onHide() {
    this.container.querySelector("#comment-box").classList.remove("active");
  }
};

console.log("[BakuApp] CommentDrawer initialized.");
