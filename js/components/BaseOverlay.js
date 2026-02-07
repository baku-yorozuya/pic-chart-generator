/**
 * @fileoverview js/components/BaseOverlay.js
 * @description 抽象父類別：負責處理所有覆蓋層（Modal 與 Drawer）的共通行為。
 * 包含：背景模糊/變暗效果、點擊外部關閉、Esc 鍵盤監聽。
 * @version 1.0.0
 * @author Baku Yorozuya Develop
 */

BakuApp.Components.BaseOverlay = class {
  /**
   * @param {string} containerId - 掛載內容的容器 ID
   * @param {string} maskId - 全域背景遮罩的 ID
   */
  constructor(containerId, maskId = "app-overlay") {
    this.container = document.getElementById(containerId);
    this.mask = document.getElementById(maskId);
    this.isOpen = false;

    // 初始化基礎事件
    this._bindBaseEvents();
  }

  /**
   * @private
   * @description 綁定關閉邏輯：點擊遮罩或按下 Esc
   */
  _bindBaseEvents() {
    // 點擊版面外區域（遮罩）以隱藏
    if (this.mask) {
      this.mask.addEventListener("click", () => {
        if (this.isOpen) this.hide();
      });
    }

    // 按下 Esc 鍵關閉
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.isOpen) {
        this.hide();
      }
    });
  }

  /**
   * @public
   * @description 顯示覆蓋層，觸發背景模糊與變暗
   */
  show() {
    this.isOpen = true;
    if (this.mask) this.mask.classList.add("active");
    this.onShow(); // 鉤子函數：供子類別實作特定顯示邏輯
  }

  /**
   * @public
   * @description 隱藏覆蓋層
   */
  hide() {
    this.isOpen = false;
    if (this.mask) this.mask.classList.remove("active");
    this.onHide(); // 鉤子函數：供子類別實作特定隱藏邏輯
  }

  /**
   * @abstract 需由子類別重寫
   */
  onShow() {}

  /**
   * @abstract 需由子類別重寫
   */
  onHide() {}

  /**
   * @protected
   * @description 渲染內容並自動綁定內部的關閉按鈕
   */
  renderContent(htmlContent) {
    this.container.innerHTML = htmlContent;
    const closeBtns = this.container.querySelectorAll(".close-trigger");
    closeBtns.forEach((btn) => {
      btn.addEventListener("click", () => this.hide());
    });
  }
};

console.log("[BakuApp] BaseOverlay class defined.");
