# NERO robotic arm — research log

Static site documenting the RDP 2026 AI data-pipeline research for the NERO robotic arm:
training-policy comparison (ACT vs Diffusion vs GR00T), what we learnt, and the
ideation/development roadmap (dataset auditing, trajectory cleaning, RGB vs RGB-D).

Plain HTML/CSS/JS — no build step. Open `index.html` directly, or serve the folder:

```bash
python3 -m http.server
```

To publish on GitHub Pages: Settings → Pages → deploy from branch `main` (root).
