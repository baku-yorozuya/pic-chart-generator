/**
 * SvgExporter - 負責將 SVG 元素轉換為圖片格式並下載
 */
class SvgExporter {
  /**
   * 將指定 SVG 下載為 PNG
   * @param {SVGElement} svgElement - 要轉換的 SVG 元素
   * @param {string} fileName - 下載的檔名
   */
  static async exportToPng(svgElement, fileName = "chart.png") {
    try {
      // 1. 取得 SVG 數據並處理樣式
      const svgData = new XMLSerializer().serializeToString(svgElement);
      console.log("序列化後的 SVG 字串：", svgData);
      const svgBlob = new Blob([svgData], {
        type: "image/svg+xml;charset=utf-8",
      });
      const url = URL.createObjectURL(svgBlob);

      // 2. 建立虛擬畫布與圖片物件
      const canvas = document.createElement("canvas");
      const img = new Image();

      // 取得 SVG 的 viewBox 或實際寬高作為畫布尺寸
      const bbox = svgElement.getBBox();
      const viewBox = svgElement.viewBox.baseVal;
      const width = viewBox.width || bbox.width || 800;
      const height = viewBox.height || bbox.height || 800;

      // 增加解析度 (例如 2 倍) 以確保圖片清晰
      const scale = 2;
      canvas.width = width * scale;
      canvas.height = height * scale;

      const ctx = canvas.getContext("2d");
      ctx.scale(scale, scale);

      img.onload = () => {
        // 3. 將圖片繪製到畫布
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, width, height);

        // 4. 觸發下載
        const pngUrl = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.href = pngUrl;
        downloadLink.download = fileName;
        downloadLink.click();

        // 5. 釋放記憶體
        URL.revokeObjectURL(url);
      };

      img.src = url;
    } catch (err) {
      console.error("Export failed:", err);
    }
  }
}
