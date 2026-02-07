/**
 * @fileoverview js/app.js
 * @description 應用程式啟動器。
 * 負責實例化所有組件，並將數據中心、渲染引擎與互動邏輯串接在一起。
 * @version 1.0.0
 * @author Baku Yorozuya Develop
 */

(function() {
  /**
   * @class App
   * @description 負責協調整個應用程式的生命週期
   */
  class App {
      constructor() {
          // 引用已在 Instances 載入的單例
          this.state = BakuApp.Instances.state;
          this.emitter = BakuApp.Instances.eventEmitter;
          
          this.init();
      }

      /**
       * @description 初始化所有組件與中間件
       */
      init() {
          // 1. 初始化核心渲染器
          BakuApp.Instances.chart = new BakuApp.Components.PicChart('main-svg-canvas');

          // 2. 初始化互動中間件 (注入渲染器實例)
          BakuApp.Instances.interaction = new BakuApp.Middleware.Interaction(
              document.getElementById('main-svg-canvas'),
              BakuApp.Instances.chart
          );

          // 3. 初始化導出模組
          BakuApp.Instances.exporter = new BakuApp.Middleware.Export(
              document.getElementById('main-svg-canvas')
          );

          // 4. 初始化 UI 組件
          BakuApp.Instances.toolbar = new BakuApp.Components.Toolbar('toolbar-container');
          BakuApp.Instances.donation = new BakuApp.Components.DonationModal('modal-container');
          BakuApp.Instances.comments = new BakuApp.Components.CommentDrawer('drawer-container');

          this.bindGlobalEvents();
          this.firstRender();
      }

      /**
       * @description 綁定全域 UI 按鈕與數據訂閱
       */
      bindGlobalEvents() {
          // 訂閱狀態變更，當數據更新時自動重新渲染圖表
          this.emitter.on('STATE_CHANGED', (data) => {
              BakuApp.Instances.chart.render(data.segments);
          });

          // 贊助按鈕
          document.getElementById('btn-donation').onclick = () => {
              BakuApp.Instances.donation.show();
          };

          // 留言按鈕
          document.getElementById('btn-comments').onclick = () => {
              BakuApp.Instances.comments.show();
          };

          // 導出 PNG 按鈕
          document.getElementById('btn-export').onclick = () => {
              BakuApp.Instances.exporter.exportToPng('my-awesome-pie-chart.png');
          };
      }

      /**
       * @description 執行首次渲染，確保畫面不留白
       */
      firstRender() {
          const initialData = this.state.getData();
          BakuApp.Instances.chart.render(initialData.segments);
          console.log("[BakuApp] Application successfully bootstrapped.");
      }
  }

  // 當 DOM 準備就緒後啟動
  window.onload = () => {
      BakuApp.Instances.mainApp = new App();
  };
})();