/**
 * @fileoverview js/core/EventEmitter.js
 * @description 輕量級發佈/訂閱 (Pub/Sub) 模式實作。
 * 掛載於 BakuApp.Core 命名空間，用於組件間的低耦合通訊。
 * @version 1.0.0
 * @author Baku Yorozuya Develop
 * @license MIT
 */

BakuApp.Core.EventEmitter = class {
  constructor() {
    /** @type {Object.<string, Function[]>} */
    this.events = {};
  }

  /**
   * @public
   * @param {string} event - 事件名稱
   * @param {Function} listener - 回調函數
   * @description 訂閱事件
   */
  on(event, listener) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(listener);

    // 回傳取消訂閱的函數
    return () => this.off(event, listener);
  }

  /**
   * @public
   * @param {string} event - 事件名稱
   * @param {any} data - 傳遞給回調函數的數據
   * @description 觸發事件
   */
  emit(event, data) {
    if (!this.events[event]) return;
    this.events[event].forEach((listener) => listener(data));
  }

  /**
   * @public
   * @param {string} event - 事件名稱
   * @param {Function} listenerToRemove - 要移除的回調函數
   * @description 取消訂閱
   */
  off(event, listenerToRemove) {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter(
      (listener) => listener !== listenerToRemove
    );
  }

  /**
   * @public
   * @param {string} event - 事件名稱
   * @param {Function} listener - 只執行一次的回調函數
   * @description 訂閱一次性事件
   */
  once(event, listener) {
    const remove = this.on(event, (data) => {
      remove();
      listener(data);
    });
  }
};

// 初始化全域事件總線實例
BakuApp.Instances.eventEmitter = new BakuApp.Core.EventEmitter();

console.log("[BakuApp] EventEmitter initialized.");
