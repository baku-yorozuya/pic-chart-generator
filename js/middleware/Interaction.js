/**
 * @fileoverview js/middleware/Interaction.js
 * @description 互動處理器。
 * 已移除全域縮放平移，改為專注於處理切片內圖片的位移編輯。
 * @version 2.0.0
 */

BakuApp.Middleware.Interaction = class {
  /**
   * @param {SVGElement} svgElement - 目標 SVG 元素
   * @param {Object} chartInstance - PicChart 的實例
   */
  constructor(svgElement, chartInstance) {
    this.svg = svgElement;
    this.chart = chartInstance;

    // 內部狀態追蹤
    this.dragData = { active: false, lastX: 0, lastY: 0 };
    this.isEditingImage = false;
    this.activeSegId = null;

    this._initEvents();
    this._initModeListeners();
  }

  /**
   * @private
   * @description 監聽來自全域的模式切換事件
   */
  _initModeListeners() {
    // 進入圖片編輯模式
    BakuApp.Instances.eventEmitter.on("ENTER_IMAGE_EDIT", (data) => {
      this.isEditingImage = true;
      this.activeSegId = data.id;

      // 1. 推入虛擬歷史紀錄，支援手機返回鍵退出
      history.pushState({ mode: "image-edit" }, "");

      // 2. UI 反饋
      document.body.classList.add("is-editing-photo");
      this.svg.style.cursor = "move";
      console.log("[BakuApp] 模式切換：進入圖片編輯模式", data.id);
    });

    // 監聽手機返回鍵 (popstate)
    window.addEventListener("popstate", () => {
      if (this.isEditingImage) {
        this._handleExit();
      }
    });
  }

  /**
   * @private
   * @description 初始化互動事件
   */
  _initEvents() {
    // 滑鼠事件
    this.svg.addEventListener("mousedown", (e) => this._onMouseDown(e));
    window.addEventListener("mousemove", (e) => this._onMouseMove(e));
    window.addEventListener("mouseup", () => this._onMouseUp());

    // 觸控事件
    this.svg.addEventListener("touchstart", (e) => this._onTouchStart(e), {
      passive: false,
    });
    this.svg.addEventListener("touchmove", (e) => this._onTouchMove(e), {
      passive: false,
    });
    this.svg.addEventListener("touchend", () => this._onTouchEnd());

    this.svg.addEventListener("wheel", (e) => this._onWheel(e), {
      passive: false,
    });

    // 退出機制：鍵盤 Esc
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.isEditingImage) {
        BakuApp.Instances.eventEmitter.emit("EXIT_IMAGE_EDIT");
        this._handleExit();
      }
    });

    // 退出機制：點擊畫布背景 (非切片區域)
    this.svg.addEventListener("click", (e) => {
      // 如果點擊的是 SVG 本身而非內部的 path，則退出
      if (e.target === this.svg && this.isEditingImage) {
        BakuApp.Instances.eventEmitter.emit("EXIT_IMAGE_EDIT");
        this._handleExit();
      }
    });
  }

  /**
   * @private
   * @description 統一處理座標更新邏輯
   */
  _processMove(clientX, clientY) {
    if (!this.isEditingImage || !this.dragData.active) return;

    // 1. 計算位移變化量 (Delta)
    const dx = clientX - this.dragData.lastX;
    const dy = clientY - this.dragData.lastY;

    // 2. 更新數據中心 (State) 中的 Offset
    // 這裡直接呼叫 state 的更新方法，該方法內應執行 segment.imageOffset.x += dx
    BakuApp.Instances.state.updateImageOffset(this.activeSegId, dx, dy);

    // 3. 通知 Chart 即時局部更新 Pattern，不重新 render 整張圖
    this.chart.updatePatternPosition(this.activeSegId);

    // 4. 更新基準點
    this.dragData.lastX = clientX;
    this.dragData.lastY = clientY;
  }

  /**
   * @private
   */
  _onMouseDown(e) {
    if (e.button !== 0 || !this.isEditingImage) return;
    this.dragData.active = true;
    this.dragData.lastX = e.clientX;
    this.dragData.lastY = e.clientY;
  }

  /**
   * @private
   */
  _onMouseMove(e) {
    this._processMove(e.clientX, e.clientY);
  }

  /**
   * @private
   */
  _onMouseUp() {
    this.dragData.active = false;
  }

  /**
   * @private
   */
  _onTouchStart(e) {
    if (e.touches.length === 1 && this.isEditingImage) {
      this.dragData.active = true;
      this.dragData.lastX = e.touches[0].clientX;
      this.dragData.lastY = e.touches[0].clientY;
    }
  }

  /**
   * @private
   */
  _onTouchMove(e) {
    if (this.isEditingImage) {
      e.preventDefault(); // 防止手機畫面捲動
      this._processMove(e.touches[0].clientX, e.touches[0].clientY);
    }
  }

  /**
   * @private
   */
  _onTouchEnd() {
    this.dragData.active = false;
  }

  /**
   * @private
   */
  _onWheel(e) {
    if (this.isEditingImage) {
      e.preventDefault(); // 禁止網頁捲動

      // 判斷滾輪方向計算縮放倍率
      const delta = e.deltaY < 0 ? 1.1 : 0.9;

      BakuApp.Instances.state.updateImageScale(this.activeSegId, delta);
      this.chart.updatePatternPosition(this.activeSegId);
    }
  }

  /**
   * @private
   * @description 支援手機兩指縮放圖片
   */
  _onTouchMove(e) {
    if (this.isEditingImage) {
      e.preventDefault();

      if (e.touches.length === 2) {
        // 計算兩指當前距離
        const dist = this._getTouchDist(e.touches);
        if (this.lastTouchDist > 0) {
          const factor = dist / this.lastTouchDist;
          BakuApp.Instances.state.updateImageScale(this.activeSegId, factor);
          this.chart.updatePatternPosition(this.activeSegId);
        }
        this.lastTouchDist = dist;
      } else if (e.touches.length === 1) {
        this._processMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    }
  }

  /**
   * @private
   * @description 退出圖片編輯模式的清理與儲存邏輯
   */
  _handleExit() {
    if (!this.isEditingImage) return;

    console.log(`[BakuApp] 退出編輯模式，儲存項目 ${this.activeSegId}`);

    this.isEditingImage = false;
    document.body.classList.remove("is-editing-photo");
    this.svg.style.cursor = "default";

    BakuApp.Instances.eventEmitter.emit("IMAGE_EDIT_COMPLETED", {
      id: this.activeSegId,
    });

    this.activeSegId = null;
  }
};

console.log(
  "[BakuApp] Interaction handler initialized (Image-Drag only mode)."
);
