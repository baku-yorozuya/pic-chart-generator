/**
 * @fileoverview js/components/PicChart.js
 * @description 圓餅圖核心渲染組件。
 * 負責 SVG 生成、圖片路徑填充、以及標籤防撞演算法。
 * @version 1.0.0
 * @author Baku Yorozuya Develop
 */

BakuApp.Components.PicChart = class {
  constructor(svgId = "main-svg-canvas") {
    this.svg = document.getElementById(svgId);
    this.defs = null;
    this.chartGroup = null;
    this.labelGroup = null;

    // 基礎繪圖配置 (參考 B 的 config)
    this.config = {
      centerX: 400,
      centerY: 300,
      radius: 180,
      labelStartRadius: 140, // 線條起點 (小於半徑)
      labelEndRadius: 230, // 線條轉折點
      labelFlexOffset: 20, // 水平延伸線長度
      minLabelGap: 24, // 標籤最小垂直間距
      padding: 40, // 畫布邊緣留白
    };

    // 內部狀態
    this.state = { scale: 1.0 };

    this._initCanvas();
  }

  _initCanvas() {
    // 初始化結構
    this.defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    this.chartGroup = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "g"
    );
    this.labelGroup = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "g"
    );

    this.svg.appendChild(this.defs);
    this.svg.appendChild(this.chartGroup);
    this.svg.appendChild(this.labelGroup);
  }

  /**
   * @public
   */
  render(segments) {
    this._clear();

    // 初始化邊界追蹤與標籤位置陣列 (代碼 B 關鍵)
    const bounds = {
      xMin: this.config.centerX - this.config.radius,
      xMax: this.config.centerX + this.config.radius,
      yMin: this.config.centerY - this.config.radius,
      yMax: this.config.centerY + this.config.radius,
    };
    const labelPositions = [];

    let currentAngle = -90;
    const totalRatio = segments.reduce(
      (sum, s) => sum + (parseFloat(s.ratio) || 0),
      0
    );

    segments.forEach((seg) => {
      const sliceAngle = (seg.ratio / (totalRatio || 1)) * 360;
      const patternId = `pattern-${seg.id}`;

      // 1. 處理圖片填充 (使用 userSpaceOnUse)
      if (seg.imageUrl) {
        this._createPattern(patternId, seg);
      }

      // 2. 繪製餅塊
      this._drawSlice(
        this.config.centerX,
        this.config.centerY,
        this.config.radius,
        currentAngle,
        sliceAngle,
        patternId,
        seg
      );

      // 3. 繪製標籤並更新邊界 (代碼 B 核心邏輯)
      this._drawLabel(currentAngle, sliceAngle, seg, labelPositions, bounds);

      currentAngle += sliceAngle;
    });

    // 4. 動態調整 ViewBox (代碼 B 的自動適應)
    this._adjustViewBox(bounds);
  }

  /**
   * @private
   */
  _drawLabel(startAngle, angle, seg, labelPositions, bounds) {
    const midAngle = startAngle + angle / 2;
    const rad = (midAngle * Math.PI) / 180;
    const isRight = Math.cos(rad) > 0;

    // 計算初始預期 Y
    let y_end =
      this.config.centerY + Math.sin(rad) * this.config.labelEndRadius;

    // 防重疊推移
    labelPositions.forEach((pos) => {
      if (
        pos.isRight === isRight &&
        Math.abs(pos.y - y_end) < this.config.minLabelGap
      ) {
        const direction = y_end < this.config.centerY ? -1 : 1;
        y_end = pos.y + this.config.minLabelGap * direction;
      }
    });
    labelPositions.push({ y: y_end, isRight: isRight });

    // 穩定座標連動
    const x_start =
      this.config.centerX + Math.cos(rad) * this.config.labelStartRadius;
    const y_start =
      this.config.centerY + Math.sin(rad) * this.config.labelStartRadius;
    const x_end =
      this.config.centerX + Math.cos(rad) * this.config.labelEndRadius;
    const x_flex =
      x_end +
      (isRight ? this.config.labelFlexOffset : -this.config.labelFlexOffset);

    // 1. 繪製線條
    const polyline = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "polyline"
    );
    polyline.setAttribute(
      "points",
      `${x_start},${y_start} ${x_end},${y_end} ${x_flex},${y_end}`
    );
    polyline.setAttribute("fill", "none");
    polyline.setAttribute("stroke", "#95a5a6");
    polyline.setAttribute("stroke-width", "1");
    this.labelGroup.appendChild(polyline);

    // 2. 繪製文字
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    const textX = x_flex + (isRight ? 6 : -6);
    text.setAttribute("x", textX);
    text.setAttribute("y", y_end);
    text.setAttribute("text-anchor", isRight ? "start" : "end");
    text.setAttribute("alignment-baseline", "middle");
    text.setAttribute("class", "chart-label");
    text.textContent = `${seg.name} (${seg.ratio}%)`;
    this.labelGroup.appendChild(text);

    // 3. 更新邊界 (參考文字長度)
    const labelLength = seg.name.length + 8;
    this._updateBounds(bounds, textX, y_end, labelLength, x_start, y_start);
  }

  _updateBounds(bounds, textX, y_end, labelLength, x_start, y_start) {
    const charWidth = 9;
    const estimatedWidth = labelLength * charWidth;
    const isRight = textX > this.config.centerX;
    const textEdgeX = isRight ? textX + estimatedWidth : textX - estimatedWidth;

    bounds.xMin = Math.min(bounds.xMin, textEdgeX, x_start);
    bounds.xMax = Math.max(bounds.xMax, textEdgeX, x_start);
    bounds.yMin = Math.min(bounds.yMin, y_end - 20, y_start);
    bounds.yMax = Math.max(bounds.yMax, y_end + 20, y_start);
  }

  _adjustViewBox(bounds) {
    const p = this.config.padding;
    const x = bounds.xMin - p;
    const y = bounds.yMin - p;
    const w = bounds.xMax - bounds.xMin + p * 2;
    const h = bounds.yMax - bounds.yMin + p * 2;
    this.svg.setAttribute("viewBox", `${x} ${y} ${w} ${h}`);
  }

  _drawSlice(cx, cy, r, startAngle, angle, fillId, seg) {
    if (angle >= 360) angle = 359.99;
    const x1 = cx + r * Math.cos((Math.PI * startAngle) / 180);
    const y1 = cy + r * Math.sin((Math.PI * startAngle) / 180);
    const x2 = cx + r * Math.cos((Math.PI * (startAngle + angle)) / 180);
    const y2 = cy + r * Math.sin((Math.PI * (startAngle + angle)) / 180);
    const largeArc = angle > 180 ? 1 : 0;
    const d = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", d);
    path.setAttribute("fill", `url(#${fillId})`);
    path.setAttribute("stroke", "#ffffff");
    path.setAttribute("stroke-width", "2");

    path.addEventListener("click", (e) => {
      e.stopPropagation();
      BakuApp.Instances.eventEmitter.emit("ENTER_IMAGE_EDIT", { id: seg.id });
    });
    this.chartGroup.appendChild(path);
  }

  /**
   * @private
   */
  _createPattern(id, seg) {
    const pattern = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "pattern"
    );
    pattern.setAttribute("id", id);
    pattern.setAttribute("patternUnits", "userSpaceOnUse");

    // 設定 pattern 的大小與畫布一致
    pattern.setAttribute("width", "2000");
    pattern.setAttribute("height", "2000");

    const image = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "image"
    );
    image.setAttributeNS("http://www.w3.org/1999/xlink", "href", seg.imageUrl);

    // 1. 計算圖片縮放後的尺寸
    const baseSize = 400;
    const currentSize = baseSize * (seg.imageScale || 1);

    // 2. 關鍵修正：計算「居中偏移量」
    // 我們要讓圖片的中心點 (currentSize/2) 對齊餅圖的中心 (centerX, centerY)
    // 公式：中心點 - (圖片尺寸 / 2) + 使用者自定義的位移
    const centerX = this.config.centerX;
    const centerY = this.config.centerY;

    const initialX = centerX - currentSize / 2;
    const initialY = centerY - currentSize / 2;

    image.setAttribute("id", `img-node-${seg.id}`);
    image.setAttribute("width", currentSize);
    image.setAttribute("height", currentSize);

    // 最終座標 = 居中起始點 + 使用者的拖拽位移
    image.setAttribute("x", initialX + (seg.imageOffset.x || 0));
    image.setAttribute("y", initialY + (seg.imageOffset.y || 0));

    image.setAttribute("preserveAspectRatio", "xMidYMid slice");

    pattern.appendChild(image);
    this.defs.appendChild(pattern);
  }

  /**
   * @public
   */
  updatePatternPosition(id) {
    const segment = BakuApp.Instances.state.segments.find((s) => s.id === id);
    const imgElement = document.getElementById(`img-node-${id}`);

    if (imgElement && segment) {
      const currentSize = 400 * (segment.imageScale || 1);

      // 同樣套用居中公式
      const initialX = this.config.centerX - currentSize / 2;
      const initialY = this.config.centerY - currentSize / 2;

      imgElement.setAttribute("x", initialX + segment.imageOffset.x);
      imgElement.setAttribute("y", initialY + segment.imageOffset.y);
      imgElement.setAttribute("width", currentSize);
      imgElement.setAttribute("height", currentSize);
    }
  }

  _clear() {
    this.defs.innerHTML = "";
    this.chartGroup.innerHTML = "";
    this.labelGroup.innerHTML = "";
  }
};
