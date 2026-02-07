/**
 * @fileoverview js/core/State.js
 * @description 集中式狀態管理中心。
 * 維護餅塊數據、處理比例邏輯、計算總合佔比，並在變動時通知訂閱者。
 * @version 1.0.0
 * @author Baku Yorozuya Develop
 */

BakuApp.Core.State = class {
  constructor() {
    /**
     * @property {Array} segments - 餅塊數據陣列
     * @property {string} segments.id - 唯一 ID
     * @property {string} segments.name - 項目名稱
     * @property {number} segments.ratio - 佔比 (float)
     * @property {string} segments.imageUrl - 圖片 DataURL 或路徑
     */
    this.segments = [
      {
        id: "seg-init-1",
        name: "項目 1",
        ratio: 40.0,
        imageUrl: "https://picsum.photos/300/300?random=101",
        imageScale: 1.0, // 1.0 代表原始大小（例如 400px）
        imageOffset: { x: 0, y: 0 },
      },
      {
        id: "seg-init-2",
        name: "項目 2",
        ratio: 30.0,
        imageUrl: "https://picsum.photos/300/300?random=102",
        imageScale: 1.0,
        imageOffset: { x: 0, y: 0 },
      },
      {
        id: "seg-init-3",
        name: "項目 3",
        ratio: 30.0,
        imageUrl: "https://picsum.photos/300/300?random=103",
        imageScale: 1.0,
        imageOffset: { x: 0, y: 0 },
      },
    ];

    // 綁定 EventEmitter 以進行全域通訊
    this.emitter = BakuApp.Instances.eventEmitter;
  }

  /**
   * @public
   * @description 獲取當前數據快照
   */
  getData() {
    return {
      segments: JSON.parse(JSON.stringify(this.segments)),
      totalRatio: this.getTotalRatio(),
    };
  }

  /**
   * @public
   * @description 獲取總合佔比
   */
  getTotalRatio() {
    return this.segments.reduce(
      (sum, s) => sum + (parseFloat(s.ratio) || 0),
      0
    );
  }

  /**
   * @public
   * @description 新增餅塊，預設佔比為 1%
   */
  addSegment() {
    const newSeg = {
      id: "seg-" + Date.now(),
      name: "新項目",
      ratio: 1.0, // Default percentage is 1
      imageUrl: `https://picsum.photos/500/500?random=${Date.now()}`,
      imageScale: 1.0,
      imageOffset: { x: 0, y: 0 },
    };
    this.segments.push(newSeg);
    this._notify();
  }

  /**
   * @public
   * @description 移除餅塊
   */
  removeSegment(id) {
    this.segments = this.segments.filter((s) => s.id !== id);
    this._notify();
  }

  /**
   * @public
   * @description 更新單一餅塊數據 (名字、比例、圖片)
   */
  updateSegment(id, newData) {
    const index = this.segments.findIndex((s) => s.id === id);
    if (index !== -1) {
      // 如果更新的是比例，確保轉為 float
      if (newData.ratio !== undefined) {
        newData.ratio = parseFloat(newData.ratio) || 0;
      }
      this.segments[index] = { ...this.segments[index], ...newData };
      this._notify();
    }
  }

  /**
   * @public
   * @param {string} id - 餅塊的唯一 ID
   * @param {number} dx - 水平位移增量
   * @param {number} dy - 垂直位移增量
   * @description 更新特定餅塊內圖片的偏移座標
   */
  updateImageOffset(id, dx, dy) {
    const segment = this.segments.find((s) => s.id === id);
    if (segment) {
      // 如果數據中還沒有 imageOffset，先初始化它
      if (!segment.imageOffset) {
        segment.imageOffset = { x: 0, y: 0 };
      }

      // 累加位移
      segment.imageOffset.x += dx;
      segment.imageOffset.y += dy;

      // 注意：為了效能，在拖動過程中我們通常不呼叫 _notify()，
      // 因為 _notify() 會觸發全域重新渲染，導致標籤和圖表重畫。
      // 即時渲染交給 Interaction 直接對 PicChart 操作。
    }
  }

  /**
   * @public
   * @description 更新特定餅塊內圖片的縮放比例
   */
  updateImageScale(id, factor) {
    const segment = this.segments.find((s) => s.id === id);
    if (segment) {
      segment.imageScale *= factor;
      // 限制縮放範圍，防止圖片過小消失或過大導致卡頓
      segment.imageScale = Math.min(Math.max(segment.imageScale, 0.1), 10);
    }
  }

  /**
   * @private
   * @description 發出數據變更信號
   */
  _notify() {
    const data = this.getData();
    this.emitter.emit("STATE_CHANGED", data);
  }
};

// 初始化 State 單例
BakuApp.Instances.state = new BakuApp.Core.State();

console.log("[BakuApp] State initialized.");
