# NERO robotic arm - research log

Static site documenting the RDP 2026 AI data-pipeline research for the NERO robotic arm:
training-policy reading list (ACT vs Diffusion vs GR00T), initial literature notes, and the
ideation/development plan (dataset auditing, trajectory cleaning, RGB vs RGB-D).

Plain HTML/CSS/JS, no build step. Open `index.html` directly, or serve the folder:

```bash
python3 -m http.server
```

To publish on GitHub Pages: Settings -> Pages -> deploy from branch `main` (root). The site is four static pages (`index.html`, `research.html`, `learnt.html`, `ideation.html`) sharing `styles.css` and `script.js`; media lives in `assets/`.
