/**
 * @fileoverview Google AdSense configuration.
 * Replace publisherId with your real ca-pub-… ID from AdSense → Account → Account information.
 * Leave enabled=false until the ID is set and the site is approved.
 */
window.BAKU_ADS = {
  enabled: true,
  /** e.g. "ca-pub-1234567890123456" — must match ads.txt */
  publisherId: "ca-pub-5004676349461383",
  /**
   * Optional manual unit slot IDs from AdSense → Ads → By ad unit.
   * Leave empty to rely on Auto ads only (recommended to start).
   */
  slots: {},
};
