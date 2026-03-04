/**
 * @fileoverview js/components/DonationModal.js
 * @description 繼承自 BaseOverlay 的具體組件。
 * 包含贊助彈窗，實作模糊背景下的互動 UI。
 * @version 1.0.0
 * @author Baku Yorozuya Develop
 */

// --- 1. 贊助彈窗組件 ---
BakuApp.Components.DonationModal = class extends (
  BakuApp.Components.BaseOverlay
) {
  constructor(containerId = "donation-modal-container") {
    super(containerId);
    this.renderContent(this._getTemplate());
  }

  _getTemplate() {
    return /*html*/ `
        <div class="modal-content" id="donation-box">
          <button class="close-trigger" style="border:none; background:none; font-size:24px; cursor:pointer;">&times;</button>
          <div class="modal-header">
            <h2>☕ 支持 Baku Yorozuya 🧀</h2>
          </div>
          <p>
            我真的非常餓，如果可以請我吃塊芝士。<br>
            如果您有任何意見，歡迎在<a href="https://github.com/baku-yorozuya/pic-chart-generator/discussions" target="_blank">這裡</a>留下您的建議與意見。<br>
          </p>
          <div class="donation-options">
            <a href="https://www.buymeacoffee.com/baku_yorozuya">
              <img src="https://img.buymeacoffee.com/button-api/?text=Buy me a coffee&emoji=&slug=baku_yorozuya&button_colour=FFDD00&font_colour=000000&font_family=Comic&outline_colour=000000&coffee_colour=ffffff" alt="Buy me a coffee" />
            </a>
          </div>
        </div>
      `;
  }

  onShow() {
    this.container.querySelector("#donation-box").classList.add("active");
  }
  onHide() {
    this.container.querySelector("#donation-box").classList.remove("active");
  }
};

console.log("[BakuApp] DonationModal initialized.");
