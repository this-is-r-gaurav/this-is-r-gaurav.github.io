# Dynamic Resume (Astro Edition)

A modern, high-performance resume website built with Astro.

## ✏️ How to Update Your Resume

**The only file you ever need to edit is `src/data/resume.yaml`.**

No coding knowledge required. Just edit the YAML fields, save, and the site updates.

---

## 💻 Local Development

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the dev server:
   ```bash
   npm run dev
   ```
3. Open **http://localhost:3500** in your browser.

---

## 🚀 Deployment to GitHub Pages

I recommend using the [Astro GitHub Actions deploy](https://docs.astro.build/en/guides/deploy/github/) to automate this.

1. Create a GitHub Repository.
2. Push your code.
3. In GitHub, go to **Settings → Pages**.
4. Set **Build and deployment → Source** to **GitHub Actions**.
5. Astro will handle the rest!

---

## 📄 PDF Export

Click the **PDF** button in the bottom-right corner to download a clean A4 PDF of your resume.

---

## 🎨 Features
- **Zero-JS by default** (except for theme toggle and PDF export).
- **Astro Components**: Clean, modular architecture.
- **Fast Refresh**: Instant feedback when editing `resume.yaml`.
- **Dark Mode**: Persisted in local storage.
- **Print Optimized**: Automatic PDF layout via CSS `@media print`.
