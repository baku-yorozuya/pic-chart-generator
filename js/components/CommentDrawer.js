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
  }

  _getTemplate() {
    return /*html*/ `
          <div class="drawer-content" id="comment-box">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                  <h3>💬 社群討論</h3>
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
    script.dataset.repo = "[YOUR_REPO]";
    script.dataset.category = "Announcements";
    script.dataset.mapping = "pathname";
    script.dataset.theme = "light";
    script.dataset.lang = "zh-TW";
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
