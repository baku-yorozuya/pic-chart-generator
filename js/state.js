/**
 * DataState - 負責管理餅圖的原始數據與比例平衡邏輯
 */
class DataState {
  constructor(initialData) {
    this.data = initialData || [
      {
        percent: 40,
        label: "旅遊生活",
        img: "https://picsum.photos/300/300?random=101",
        zoom: 1,
        dx: 0,
        dy: 0,
      },
      {
        percent: 35,
        label: "科技資訊",
        img: "https://picsum.photos/300/300?random=102",
        zoom: 1,
        dx: 0,
        dy: 0,
      },
      {
        percent: 25,
        label: "美食烹飪",
        img: "https://picsum.photos/300/300?random=103",
        zoom: 1,
        dx: 0,
        dy: 0,
      },
    ];
  }

  addSlice() {
    if (this.data.length > 0) {
      this.data.push({
        percent: 1,
        label: "新項目",
        img: `https://picsum.photos/300/300?random=${Date.now()}`,
      });
    } else {
      this.data.push({
        percent: 100,
        label: "初始項目",
        img: "https://picsum.photos/300/300",
      });
    }
  }

  removeSlice(index) {
    if (this.data.length <= 1) return;
    this.data.splice(index, 1);
  }

  updateItem(index, key, value) {
    this.data[index][key] = value;
  }

  getTotal() {
    // 使用 reduce 加總後，先用 toFixed 轉成字串再轉回數字，消除浮點數二進位誤差
    return parseFloat(
      this.data.reduce((sum, item) => sum + item.percent, 0).toFixed(4)
    );
  }

  updateImageAdjust(index, key, value) {
    this.data[index][key] = parseFloat(value);
  }
}
