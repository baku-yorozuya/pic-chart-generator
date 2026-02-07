/**
 * @fileoverview js/components/Toolbar.js
 * @description 修正浮點數編輯問題，確保小數點輸入不被吃掉。
 */

BakuApp.Components.Toolbar = class {
  constructor(containerId = "toolbar-container") {
    this.container = document.getElementById(containerId);
    this.state = BakuApp.Instances.state;
    this.emitter = BakuApp.Instances.eventEmitter;

    this._init();
    this.emitter.on("STATE_CHANGED", (data) => this.render(data));
  }

  _init() {
    this.render(this.state.getData());
  }

  render(data) {
    const { segments, totalRatio } = data;
    const isError = Math.abs(totalRatio - 100) > 0.01;

    // 1. 紀錄當前焦點位置與游標位置
    const activeEl = document.activeElement;
    const activeId = activeEl
      ? activeEl.closest(".segment-card")?.dataset.id
      : null;
    const activeClassName = activeEl ? activeEl.className : null;
    const selectionPos = activeEl ? activeEl.selectionStart : 0;

    this.container.innerHTML = /*html*/ `
    <div class="toolbar-inner">
      <div class="toolbar-header-wrapper">
        <div class="total-status ${isError ? "status-error" : "status-ok"}">
          <span class="status-dot"></span>
          總合佔比: <strong>${totalRatio.toFixed(2)}%</strong>
          ${
            isError
              ? '<small style="margin-left:8px">(需調整至 100%)</small>'
              : ""
          }
        </div>
      </div>

      <div id="segment-list">
        ${segments
          .map(
            (seg) => /*html*/ `
          <div class="segment-card" data-id="${seg.id}">
            <div class="img-upload-container">
              <button class="img-preview-btn" 
                      style="background-image: url('${seg.imageUrl || ""}')" 
                      onclick="this.nextElementSibling.click()">
                ${!seg.imageUrl ? '<span class="no-img">📷</span>' : ""}
                <div class="img-overlay">更換</div>
              </button>
              <input type="file" accept="image/*" class="input-file" style="display:none">
            </div>

            <div class="card-inputs">
              <input type="text" class="input-name" value="${
                seg.name
              }" placeholder="項目名稱">
              <div class="ratio-wrapper">
                <input type="text" inputmode="decimal" class="input-ratio" value="${
                  seg.ratio
                }">
                <span class="unit">%</span>
              </div>
            </div>

            <button class="btn-del" title="刪除">&times;</button>
          </div>
        `
          )
          .join("")}
      </div>

      <div class="toolbar-footer">
        <button class="btn-add-main">+ 新增餅塊項目</button>
      </div>
    </div>
  `;

    this._bindEvents();

    // 2. 恢復焦點與游標精確位置
    if (activeId && activeClassName) {
      const targetCard = this.container.querySelector(
        `.segment-card[data-id="${activeId}"]`
      );
      if (targetCard) {
        const input = targetCard.querySelector(
          `.${activeClassName.split(" ").join(".")}`
        );
        if (input) {
          input.focus();
          try {
            input.setSelectionRange(selectionPos, selectionPos);
          } catch (e) {}
        }
      }
    }
  }

  _bindEvents() {
    this.container.querySelector(".btn-add-main").onclick = () =>
      this.state.addSegment();

    this.container.querySelectorAll(".segment-card").forEach((card) => {
      const id = card.dataset.id;
      const nameInp = card.querySelector(".input-name");
      const ratioInp = card.querySelector(".input-ratio");
      const fileInp = card.querySelector(".input-file");
      const delBtn = card.querySelector(".btn-del");

      nameInp.oninput = () =>
        this.state.updateSegment(id, { name: nameInp.value });

      ratioInp.oninput = (e) => {
        const rawValue = ratioInp.value;

        // 允許輸入小數點開頭或結尾 (例如 "12." 或 ".")，暫不觸發 state 更新以避免被強制轉型
        if (rawValue === "" || rawValue.endsWith(".") || rawValue === "-") {
          return;
        }

        const val = parseFloat(rawValue);
        if (!isNaN(val)) {
          // 只有當數值合法時才更新 State
          this.state.updateSegment(id, { ratio: val });
        }
      };

      // 當失去焦點時，強制同步一次正確的數值格式
      ratioInp.onblur = () => {
        const val = parseFloat(ratioInp.value) || 0;
        this.state.updateSegment(id, { ratio: val });
      };

      delBtn.onclick = () => this.state.removeSegment(id);

      fileInp.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            this.state.updateSegment(id, { imageUrl: event.target.result });
          };
          reader.readAsDataURL(file);
        }
      };
    });
  }
};
