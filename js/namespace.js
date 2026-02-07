/**
 * @fileoverview js/namespace.js
 * @description 初始化全域命名空間，作為所有核心邏輯與組件的容器。
 * 這是專案中最先被載入的檔案，用以在無模組環境下實現物件導向封裝。
 * @version 1.0.0
 * @author Baku Yorozuya Develop
 * @license MIT
 */

/**
 * @namespace BakuApp
 * @description 核心命名空間，將所有類別與實例隔離，避免污染全域作用域。
 */
window.BakuApp = {
  /**
   * @namespace Core
   * @description 存放系統核心邏輯，如數據管理、事件通訊與導出模組。
   */
  Core: {},

  /**
   * @namespace Components
   * @description 存放 UI 組件類別，如 PicChart、Toolbar 與彈窗。
   */
  Components: {},

  /**
   * @namespace Middleware
   * @description 存放處理互動與中間層邏輯的類別。
   */
  Middleware: {},

  /**
   * @namespace Instances
   * @description 存放初始化後的單例物件，便於跨組件存取與除錯。
   */
  Instances: {},
};

console.log("[BakuApp] Namespace initialized. Ready to load components.");
