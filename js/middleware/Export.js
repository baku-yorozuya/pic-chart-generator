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
    console.log("[Export] 開始執行 PNG 導出...");
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

    // 3. 【關鍵優化】處理 SVG 內部的所有 <image> 標籤，將路徑轉為 Base64
    // 這是為了確保 Blob 能夠讀取到圖片數據
    const svgClone = this.svg.cloneNode(true);
    const images = svgClone.querySelectorAll("image");
    console.log(`[Export] 找到 ${images.length} 個圖片節點`);
    
    for (let imgNode of images) {
      const href = imgNode.getAttribute("href");
      console.log(`[Export] 處理圖片路徑: ${href}`);
      if (href && !href.startsWith("data:")) {
        try {
          const base64 = await this._imageUrlToBase64(href);
          imgNode.setAttribute("href", base64);
          console.log(`[Export] 圖片成功轉為 Base64 (長度: ${base64.length})`);
        } catch (e) {
          console.error(`[Export] 圖片轉換失敗: ${href}`, e);
        }
      } else {
        console.log(`[Export] 圖片已是 Base64 或路徑為空，跳過。`);
      }
    }

    // 4. 序列化克隆後的 SVG
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgClone);
    const svgBlob = new Blob([svgString], {
      type: "image/svg+xml;charset=utf-8",
    });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      console.log("[Export] SVG Blob 已載入至 Image 物件，開始繪製 Canvas");
      // 繪製白色背景（否則輸出會是透明底）
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // 繪製圖表
      try {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const pngUrl = canvas.toDataURL("image/png");
        console.log("[Export] Canvas 成功轉為 PNG URL");

        const link = document.createElement("a");
        link.href = pngUrl;
        link.download = fileName;
        link.click();
      } catch (err) {
        console.error("[Export] Canvas 繪製或導出時發生安全性錯誤 (可能觸發 Tainted Canvas):", err);
      }

      URL.revokeObjectURL(url);
    };
    img.onerror = (err) => console.error("[Export] SVG Image 載入失敗:", err);
    img.src = url;
  }

  /**
   * @private
   * @description 輔助函式：將圖片路徑轉為 Base64 字串
   */
  _imageUrlToBase64(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous"; // 避免跨域問題
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      };
      img.onerror = reject;
      img.src = url;
    });
  }
};

console.log("[BakuApp] Export module initialized.");
