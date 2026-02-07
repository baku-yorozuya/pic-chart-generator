/**
 * @fileoverview js/middleware/Export.js
 * @description 影像導出模組。
 * 負責將 SVG 畫布內容序列化，轉換為 Canvas 渲染，並輸出為具有透明背景的 PNG 格式。
 * @version 1.0.0
 * @author Baku Yorozuya Develop
 */

BakuApp.Middleware.Export = class {
  /**
   * @param {SVGElement} svgElement - 要導出的 SVG 元素實例
   */
  constructor(svgElement) {
    this.svg = svgElement;
  }

  /**
   * @public
   * @description 執行導出流程
   * @param {string} fileName - 下載的檔案名稱
   */
  async exportToPng(fileName = "pic-chart.png") {
    // 1. 取得 SVG 當前的 viewBox 數值
    const vb = this.svg.viewBox.baseVal;
    const svgWidth = vb.width;
    const svgHeight = vb.height;

    // 2. 建立 Canvas，寬高比例必須與 viewBox 完全一致
    const canvas = document.createElement("canvas");
    // 設定輸出解析度（例如放大 2 倍以獲得高畫質）
    const scale = 2;
    canvas.width = svgWidth * scale;
    canvas.height = svgHeight * scale;

    const ctx = canvas.getContext("2d");

    // 3. 序列化 SVG
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(this.svg);
    const svgBlob = new Blob([svgString], {
      type: "image/svg+xml;charset=utf-8",
    });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      // 4. 繪製到畫布時，確保不使用固定數值，而是填滿 canvas
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // 5. 下載
      const pngUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = pngUrl;
      link.download = fileName;
      link.click();

      URL.revokeObjectURL(url);
    };
    img.src = url;
  }

  /**
   * @private
   * @description 將 SVG 物件轉換為包含命名空間的 XML 字串
   */
  _serializeSvg() {
    const serializer = new XMLSerializer();
    let source = serializer.serializeToString(this.svg);

    // 強制添加 XML 命名空間，否則 Canvas Image 無法讀取
    if (!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
      source = source.replace(
        /^<svg/,
        '<svg xmlns="http://www.w3.org/2000/svg"'
      );
    }
    if (
      !source.match(
        /^<svg[^>]+xmlns\:xlink="http\:\/\/www\.w3\.org\/1999\/xlink"/
      )
    ) {
      source = source.replace(
        /^<svg/,
        '<svg xmlns:xlink="http://www.w3.org/1999/xlink"'
      );
    }

    return '<?xml version="1.0" standalone="no"?>\r\n' + source;
  }

  /**
   * @private
   * @description 使用 Canvas 作為中介，將 SVG 字串渲染為點陣圖形
   */
  _renderToCanvas(svgData) {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      // 設定 Canvas 尺寸與 SVG 視窗一致
      const rect = this.svg.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;

      const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);

      img.onload = () => {
        // 核心：保持透明背景（不填充 fillRect）
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);
        resolve(canvas);
      };

      img.onerror = (err) => {
        URL.revokeObjectURL(url);
        reject(err);
      };

      img.src = url;
    });
  }

  /**
   * @private
   * @description 觸發瀏覽器下載行為
   */
  _download(canvas, fileName) {
    const link = document.createElement("a");
    link.download = fileName;
    link.href = canvas.toDataURL("image/png");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

console.log("[BakuApp] Export module initialized.");
