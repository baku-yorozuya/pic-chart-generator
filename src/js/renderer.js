/**
 * ChartRenderer - 專責 SVG 幾何計算、標籤防碰撞與畫布自動縮放
 */
class ChartRenderer {
  constructor(svgElement) {
    this.svg = svgElement;
    this.patterns = svgElement.querySelector('#patterns');
    this.segments = svgElement.querySelector('#pie-segments');
    this.labels = svgElement.querySelector('#labels-layer');
    
    // 繪圖常數設定
    this.config = {
      centerX: 100,
      centerY: 100,
      radius: 50,
      circumference: 2 * Math.PI * 50, // 約 314.159
      labelStartRadius: 88,            // 線條起點 (接近餅塊邊緣)
      labelEndRadius: 115,             // 線條轉折點
      labelFlexOffset: 18,             // 水平延伸線長度
      minLabelGap: 22,                 // 標籤最小垂直間距
      padding: 0                      // 畫布邊緣留白
    };
  }

  /**
   * 主渲染入口
   * @param {Array} data - 餅圖數據
   * @param {Function} onSegmentClick - 點擊餅塊回調
   */
  draw(data, onSegmentClick) {
    // 1. 初始化畫布
    this.patterns.innerHTML = '';
    this.segments.innerHTML = '';
    this.labels.innerHTML = '';
    
    // 2. 初始化邊界追蹤 (預設包含圓餅圖主體)
    const bounds = {
      xMin: 50, xMax: 150,
      yMin: 50, yMax: 150
    };

    let currentOffset = 0;
    const labelPositions = [];

    // 3. 遍歷數據繪製各組件
    data.forEach((item, i) => {
      if (item.percent <= 0) return;

      // A. 建立圖片填充模式
      this._createPattern(i, item.img);

      // B. 繪製餅塊扇區
      this._drawSegment(item, i, currentOffset, onSegmentClick);

      // C. 繪製標籤並追蹤邊界
      this._drawLabel(item, i, currentOffset, labelPositions, bounds);

      currentOffset += item.percent;
    });

    // 4. 根據最終邊界自動調整畫布可視範圍
    this._adjustViewBox(bounds);
  }

  /**
   * 私有方法：畫出圓餅圖的其中一塊肉
   */
  _drawSegment(item, index, offset, onClick) {
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    
    circle.setAttribute("cx", this.config.centerX);
    circle.setAttribute("cy", this.config.centerY);
    circle.setAttribute("r", this.config.radius);
    circle.setAttribute("stroke", `url(#p${index})`);
    
    const dash = (item.percent * this.config.circumference) / 100;
    circle.setAttribute("stroke-dasharray", `${dash} ${this.config.circumference}`);
    circle.setAttribute("stroke-dashoffset", -(offset * this.config.circumference) / 100);

    // 點擊事件交互
    circle.onclick = (e) => {
      e.stopPropagation();
      if (onClick) onClick(index);
    };

    this.segments.appendChild(circle);
  }

  /**
   * 私有方法：建立圖片 Pattern 並抵消旋轉
   */
  _createPattern(index, imgUrl) {
    const pattern = document.createElementNS("http://www.w3.org/2000/svg", "pattern");
    pattern.setAttribute("id", `p${index}`);
    pattern.setAttribute("patternUnits", "userSpaceOnUse");
    pattern.setAttribute("width", "200");
    pattern.setAttribute("height", "200");

    const image = document.createElementNS("http://www.w3.org/2000/svg", "image");
    image.setAttributeNS("http://www.w3.org/1999/xlink", "href", imgUrl);
    image.setAttribute("width", "240");
    image.setAttribute("height", "240");
    image.setAttribute("x", "-20");
    image.setAttribute("y", "-20");
    image.setAttribute("preserveAspectRatio", "xMidYMid slice");
    
    // 關鍵：抵消外層 group 的 rotate(-90)
    image.setAttribute("transform", "rotate(90 100 100)");

    pattern.appendChild(image);
    this.patterns.appendChild(pattern);
  }

  /**
   * 私有方法：標籤繪製與邊界計算
   */
  _drawLabel(item, index, offset, labelPositions, bounds) {
    const angle = (offset + item.percent / 2) * 3.6 * (Math.PI / 180) - (Math.PI / 2);
    const isRight = Math.cos(angle) > 0;

    let y_end = this.config.centerY + Math.sin(angle) * this.config.labelEndRadius;
    
    // 改良後的防重疊：確保在連續 1% 時，y_end 穩定推移
    labelPositions.forEach(pos => {
      if (pos.isRight === isRight && Math.abs(pos.y - y_end) < this.config.minLabelGap) {
        // 根據象限推移：上半圓向上擠，下半圓向下擠
        const direction = y_end < this.config.centerY ? -1 : 1;
        y_end = pos.y + (this.config.minLabelGap * direction);
      }
    });
    labelPositions.push({ y: y_end, isRight: isRight });

    const x_start = 100 + Math.cos(angle) * this.config.labelStartRadius;
    const y_start = 100 + Math.sin(angle) * this.config.labelStartRadius;
    const x_end = 100 + Math.cos(angle) * this.config.labelEndRadius;
    const x_flex = x_end + (isRight ? this.config.labelFlexOffset : -this.config.labelFlexOffset);

    // 繪製線條
    const line = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
    line.setAttribute("points", `${x_start},${y_start} ${x_end},${y_end} ${x_flex},${y_end}`);
    line.setAttribute("class", "label-line");
    this.labels.appendChild(line);

    // 繪製文字
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    const textX = x_flex + (isRight ? 6 : -6);
    text.setAttribute("x", textX);
    text.setAttribute("y", y_end + 5);
    text.setAttribute("text-anchor", isRight ? "start" : "end");
    text.setAttribute("class", "label-text");

    const displayPercent = Number.isInteger(item.percent) ? item.percent : parseFloat(item.percent.toFixed(2));
    text.textContent = `${item.label} (${displayPercent}%)`;
    this.labels.appendChild(text);

    // 【關鍵】使用抽象化後的方法更新邊界
    this._updateBounds(bounds, textX, y_end, item.label.length, x_start, y_start);
  }

  /**
   * 私有方法：更新畫布邊界 (新增安全檢查)
   */
  _updateBounds(bounds, textX, y_end, labelLength, x_start, y_start) {
    // 防錯檢查：如果任何數值是 NaN，則跳過更新，避免破壞 viewBox
    if ([textX, y_end, x_start, y_start].some(val => isNaN(val))) return;

    const charWidth = 8; 
    const estimatedTextWidth = labelLength * charWidth + 40; 
    
    const isRight = textX > this.config.centerX;
    const textEdgeX = isRight ? textX + estimatedTextWidth : textX - estimatedTextWidth;

    // 更新極值
    bounds.xMin = Math.min(bounds.xMin, textEdgeX, x_start);
    bounds.xMax = Math.max(bounds.xMax, textEdgeX, x_start);
    bounds.yMin = Math.min(bounds.yMin, y_end - 15, y_start);
    bounds.yMax = Math.max(bounds.yMax, y_end + 15, y_start);
  }

  /**
   * 私有方法：動態調整 viewBox
   */
  _adjustViewBox(bounds) {
    const p = this.config.padding;
    // 檢查 bounds 是否包含有效數值，若無則給予預設值
    const x = isNaN(bounds.xMin) ? 0 : bounds.xMin - p;
    const y = isNaN(bounds.yMin) ? 0 : bounds.yMin - p;
    const w = isNaN(bounds.xMax - bounds.xMin) ? 200 : (bounds.xMax - bounds.xMin) + p * 2;
    const h = isNaN(bounds.yMax - bounds.yMin) ? 200 : (bounds.yMax - bounds.yMin) + p * 2;
  
    this.svg.setAttribute('viewBox', `${x} ${y} ${w} ${h}`);
  }
}