# 🚀 Deriverse Deployment Guide

This guide provides step-by-step instructions for hosting your codebase on GitHub and deploying the Deriverse platform.

## 1. Hosting on GitHub

### Create a Repository
1. Go to [github.com/new](https://github.com/new).
2. Name your repository (e.g., `deriverse`).
3. Keep it Public or Private as per your preference.
4. **Do not** initialize with a README, license, or gitignore (since you already have them).
5. Click **Create repository**.

### Push Your Local Code
Open your terminal in the project root and run:
```bash
git init
git add .
git commit -m "Initial commit: Deriverse Analytics Platform"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/deriverse.git
git push -u origin main
```

---

## 2. Deploying the Frontend (GitHub Pages)

The frontend is built with Vite and can be easily deployed using GitHub Actions.

### Automated Deployment with GitHub Actions
1. In your repository, go to **Settings > Pages**.
2. Under **Build and deployment > Source**, select **GitHub Actions**.
3. Create a new file at `.github/workflows/deploy.yml`:

```yaml
name: Deploy Frontend

on:
  push:
    branches: ["main"]

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Set up Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - name: Install dependencies
        run: npm install
      - name: Build
        run: npm run build
      - name: Setup Pages
        uses: actions/configure-pages@v4
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### Vite Configuration Note
Ensure your `vite.config.ts` includes the base path if you are not using a custom domain:
```typescript
export default defineConfig({
  base: '/deriverse/', // Replace with your repo name
  plugins: [react()],
})
```

---

## 3. Deploying the Backend (Node.js)

Since GitHub Pages only hosts static content, you need a cloud provider for the Node.js backend.

### Recommended Providers
- **Render.com** (Free tier available, easy GitHub integration)
- **Railway.app** (Great for small/medium scale)

### Deployment Steps (Render Example)
1. Sign in to [Render](https://render.com).
2. Click **New > Web Service**.
3. Connect your GitHub repository.
4. Set the following:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npx ts-node server.ts` (or build to JS first)
5. Add your Environment Variables in the Render dashboard.

---

## 4. Solana Program Deployment

1. Ensure you have the Solana CLI and Anchor installed.
2. Build the program: `anchor build`
3. Deploy to Devnet: `anchor deploy --provider.cluster devnet`
4. Update the `programId` in your frontend code with the output from the deployment.

---

## 5. Security & Environment Variables

**Never** commit `.env` files to GitHub. Instead:
1. Use **GitHub Secrets** for CI/CD variables (Actions > Secrets and variables > Actions).
2. Use the provider's dashboard (Render/Vercel/Railway) for runtime backend variables.

---

## 6. Summary Checklist
- [ ] Code pushed to GitHub
- [ ] GitHub Action configured for Frontend
- [ ] Backend deployed to Render/Railway
- [ ] Solana program deployed to Devnet
- [ ] Frontend updated with live Backend URL & Program ID
