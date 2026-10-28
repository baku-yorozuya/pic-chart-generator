# 📸 Pic-chart Generator

An advanced, browser-based tool to create stunning pie charts with image-filled segments. Good for infographics, presentations, and social media content.

[**Live Demo**](WIP) | [**Issues**](issues)

## ✨ Key Features

- 🎨 **Image Fill**: Use any image as the background for your pie chart segments.
- ⚖️ **Auto-Balance**: Adding new segments automatically balances the total ratio to 100%.
- 🏷️ **Smart Labels**: Anti-collision algorithm ensures text labels never overlap.
- ⚡ **Zero Dependencies**: Built with pure Vanilla JS and SVG. No heavy libraries required.
- 📱 **Interactive UI**: Real-time editing with persistent focus for a smooth experience.

## 🚀 Quick Start
1. Clone the repo.
2. Open `index.html` in any browser.
3. Start creating and customizing your chart!

## 📢 Google AdSense setup
1. Create / open an [AdSense](https://www.google.com/adsense/) account and add `pic-chart-generator.vercel.app`.
2. Put your publisher ID in **two** places:
   - `js/ads-config.js` → `publisherId: "ca-pub-…"`
   - `ads.txt` → `google.com, pub-…, DIRECT, f08c47fec0942fa0` (numbers only after `pub-`)
3. In AdSense, turn on **Auto ads** for the site (works without manual slots).
4. Optional: create a Display ad unit, paste the slot ID into `slots.topBanner` in `js/ads-config.js`.
5. Redeploy so `https://your-domain/ads.txt` is publicly reachable.

Privacy policy page (often required for approval): `/privacy.html`.

## 📜 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Acknowledgments
Co-created with **Gemini** (Google AI).
