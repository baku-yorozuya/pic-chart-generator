/**
 * @fileoverview Loads Google AdSense when a real publisher ID is configured.
 * Auto ads are enabled via the client script; manual units fill only when slot IDs exist.
 */
(function () {
  var cfg = window.BAKU_ADS;
  if (!cfg || !cfg.enabled) return;

  var pub = cfg.publisherId || "";
  if (!pub || pub.indexOf("XXXX") !== -1) {
    console.warn(
      "[BakuApp] AdSense skipped: set a real publisherId in js/ads-config.js"
    );
    return;
  }

  if (!document.querySelector('meta[name="google-adsense-account"]')) {
    var meta = document.createElement("meta");
    meta.name = "google-adsense-account";
    meta.content = pub;
    document.head.appendChild(meta);
  }

  var script = document.createElement("script");
  script.async = true;
  script.src =
    "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=" +
    encodeURIComponent(pub);
  script.crossOrigin = "anonymous";
  document.head.appendChild(script);

  function fillUnit(selector, slotId) {
    if (!slotId) return;
    var el = document.querySelector(selector);
    if (!el) return;

    var host = el.closest(".ad-slot");
    if (host) host.removeAttribute("hidden");

    el.setAttribute("data-ad-client", pub);
    el.setAttribute("data-ad-slot", slotId);
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.warn("[BakuApp] AdSense push failed", err);
    }
  }

  function initUnits() {
    var slots = cfg.slots || {};
    fillUnit(".adsbygoogle[data-baku-ad='top-banner']", slots.topBanner);
  }

  script.addEventListener("load", initUnits);
})();
