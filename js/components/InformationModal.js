/**
 * @fileoverview js/components/InformationModal.js
 * @description 繼承自 BaseOverlay 的具體組件。
 * 包含資訊彈窗，實作模糊背景下的互動 UI。
 * @version 1.0.0
 * @author Baku Yorozuya Develop
 */

// --- 1. 資訊彈窗組件 ---
BakuApp.Components.InformationModal = class extends (
  BakuApp.Components.BaseOverlay
) {
  constructor(containerId = "information-modal-container") {
    super(containerId);
    this.renderContent();
  }

  onShow() {
    this.container.querySelector("#information-box").classList.add("active");
  }
  onHide() {
    this.container.querySelector("#information-box").classList.remove("active");
  }
};

console.log("[BakuApp] InformationModal initialized.");
