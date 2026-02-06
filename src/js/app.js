/**
 * AppController - 應用程式中樞
 */
class AppController {
  constructor() {
    this.state = new DataState();
    this.renderer = new ChartRenderer(document.querySelector('svg'));
    this.inputsContainer = document.getElementById('inputs');
    this.totalInfo = document.getElementById('totalInfo');
    this.fileInput = document.getElementById('fileInput');
    this.activeInputInfo = { id: null };
    this.modal = document.getElementById('donation-modal');
    this.drawer = document.getElementById('comment-drawer');
    this.giscusLoaded = false;
    setTimeout(() => this.openModal(), 500);
    this.initOverlayClicks();
    this.initUXListeners();
    this.init();
  }

  init() {
    this.fileInput.onchange = (e) => this.handleFileChange(e);
    this.render();
  }

  initUXListeners() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeModal();
        this.closeDrawer();
      }
    });
  }

  /**
   * 初始化遮罩點擊監聽
   */
  initOverlayClicks() {
    // 點擊 Modal 遮罩關閉
    this.modal.addEventListener('click', (e) => {
      // 關鍵：確保點擊的是「遮罩層」本人，而不是內部的「內容框」
      if (e.target === this.modal) {
        this.closeModal();
      }
    });

    // 點擊 Drawer 遮罩關閉
    this.drawer.addEventListener('click', (e) => {
      if (e.target === this.drawer) {
        this.closeDrawer();
      }
    });
  }

  openDrawer() {
    this.drawer.classList.add('active');
    
    // 延遲加載 Giscus 以優化性能
    if (!this.giscusLoaded) {
      this.initGiscus();
      this.giscusLoaded = true;
    }
  }

  closeDrawer() {
    this.drawer.classList.remove('active');
  }

  initGiscus() {
    const comments = new CommentsManager({});
    comments.init('giscus-container');
  }

  openModal() {
    this.modal.classList.add('active');
  }

  closeModal() {
    this.modal.classList.remove('active');
    // 可選：紀錄在 localStorage，讓使用者今天內不會再看到第二次
    localStorage.setItem('modalDismissed', Date.now());
  }

  render() {
    this.saveFocus();
    const total = this.state.getTotal();
    this.updateStatusUI(total);
    this.renderer.draw(this.state.data, (i) => this.openFilePicker(i));
    this.renderInputs();
    this.restoreFocus();
  }

  saveFocus() {
    const el = document.activeElement;
    if (el && el.id) this.activeInputInfo = { id: el.id, type: el.type };
  }

  restoreFocus() {
    const el = document.getElementById(this.activeInputInfo.id);
    if (!el) return;
    el.focus();
    const len = el.value.length;
    if (el.type === 'text') {
      el.setSelectionRange(len, len);
    } else if (el.type === 'number') {
      el.type = 'text'; el.setSelectionRange(len, len); el.type = 'number';
    }
  }

  renderInputs() {
    this.inputsContainer.innerHTML = '';
    this.state.data.forEach((item, i) => {
      const div = document.createElement('div');
      div.className = 'input-group';
      div.innerHTML = `
        <span>#${i+1}</span>
        <input type="text" id="txt-${i}" value="${item.label}">
        <input type="number" id="num-${i}" value="${item.percent}" step="any"> %
        <button class="btn btn-del" onclick="app.handleRemove(${i})">✕</button>
      `;

      // 文字更新邏輯不變
      div.querySelector(`#txt-${i}`).oninput = (e) => { 
        this.state.updateItem(i, 'label', e.target.value); 
        this.render(); 
      };

      // 數字更新邏輯：確保捕捉到小數
      div.querySelector(`#num-${i}`).oninput = (e) => { 
        const rawValue = e.target.value;
        // 更新 state 中的數值 (轉換為浮點數供運算)
        this.state.updateItem(i, 'percent', parseFloat(rawValue) || 0);
        
        // 關鍵：不要在這裡重新呼叫 this.render()，除非你想即時更新圖表
        // 但為了讓使用者能打出 ".5"，我們需要一個折衷方案：
        this.renderer.draw(this.state.data, (i) => this.openFilePicker(i));
        this.updateStatusUI(this.state.getTotal());
        // 注意：我們此時不重繪整個 Input 列表，以免失去輸入狀態
      };
      this.inputsContainer.appendChild(div);
    });
  }

  updateStatusUI(total) {
    this.totalInfo.innerText = `總合預覽: ${total}%`;
    const ok = Math.abs(total - 100) < 0.01;
    this.totalInfo.style.backgroundColor = ok ? "#e6fffa" : "#fff1f0";
    this.totalInfo.style.color = ok ? "#00a76f" : "#f5222d";
  }

  handleAdd() { this.state.addSlice(); this.render(); }
  handleRemove(i) { this.state.removeSlice(i); this.render(); }
  openFilePicker(i) { this.activeIndex = i; this.fileInput.click(); }
  handleFileChange(e) {
    if (e.target.files[0]) {
      this.state.updateItem(this.activeIndex, 'img', URL.createObjectURL(e.target.files[0]));
      this.render();
    }
  }
}

const app = new AppController();