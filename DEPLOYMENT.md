# 🚀 Deriverse: Complete Deployment Guide

Follow these steps to deploy your full-stack Solana application. We will use **Railway** for the backend, **Vercel** for the frontend, and **Solana Devnet** for the smart contract.

---

## 0. Prerequisites (Windows)
Before you can run `anchor build`, you must install the following tools:

### 1. Rust
Follow the instructions at [rustup.rs](https://rustup.rs/) to install Rust. When asked, choose the default installation.

### 2. Solana CLI
If the automated scripts fail, try these alternatives in order:

#### Option A: Versioned Installer (Native Windows)
Explicitly provide the version so the script doesn't have to fetch it:
```powershell
Invoke-WebRequest -Uri "https://release.solana.com/v1.18.15/install.bat" -OutFile "install.bat"; .\install.bat v1.18.15
```

#### Option B: WSL (Highly Recommended)
Solana development is most stable on **Windows Subsystem for Linux (WSL)**.
1.  Open PowerShell as Admin: `wsl --install` (Restart PC if needed).
2.  Open your WSL terminal (e.g., Ubuntu).
3.  Run: `sh -c "$(curl -sSfL https://release.solana.com/v1.18.15/install)"`

#### Option C: Solana Playground (No Install - Fastest!)
If you want to skip all local installation (Rust, Solana CLI, Anchor), use the web IDE:

1.  **Open Playground**: Go to [beta.solpg.io](https://beta.solpg.io/).
2.  **Create Project**: 
    - Click **"Create a new project"** (top left).
    - Name it `deriverse`.
    - Select **"Anchor"** as the framework.
3.  **Bring Your Code**:
    - **Upload**: In the Playground sidebar, right-click the `src` folder, select **"Upload"**, and choose your local file: `program/src/lib.rs`.
    - **OR Copy-Paste**: Open `program/src/lib.rs` on your computer, copy all the text, and paste it into the `lib.rs` file inside Solana Playground.
4.  **Build**:
    - Click the **Build & Deploy** icon in the left sidebar (wrench icon).
    - Click the **"Build"** button.
5.  **Deploy**:
    - Ensure you are on **Devnet** (Check the bottom right corner).
    - Click **"Deploy"**.
    - If it asks for SOL, click the **Playground Wallet** (bottom left) and click **"Airdrop"**.
    - **Airdrop Failing? (Troubleshooting):** Devnet faucets are often down. If the button fails:
      1. Copy your **Playground Wallet Address** (bottom left).
      2. Go to the [Solana Faucet](https://faucet.solana.com/) or [LST Faucet](https://solfaucet.com/).
      3. Paste your address and request 2 SOL.
      4. Go back to Playground and try to **Deploy** again.
6.  **Get ID**: Your Program ID will be printed in the Playground terminal. Copy it for your Vercel Environment Variables!

> [!IMPORTANT]
> **Wallet Clarity:** 
> - **Playground Wallet:** This is a temporary wallet in your browser used ONLY for deploying the code. It uses **Devnet SOL** (which is free/fake). You don't need your real Phantom SOL for this.
> - **Your Phantom Wallet:** Once the app is live on Vercel, you (and your users) will use your real Phantom wallet to interact with it. 
> - **Note on Metamask:** Metamask is for Ethereum. Phantom is the correct choice for Solana. Your app is already configured to use Phantom!

### 3. Anchor (avm) - OPTIONAL
> [!NOTE]
> Skip this if you are using **Option C: Solana Playground**. You only need this if you want to develop and build locally on your own computer.

Anchor is best installed via `avm` (Anchor Version Manager):
```powershell
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install latest
avm use latest
```

---

## 💡 Troubleshooting: "Virus Detected" Error (os error 225)
Windows Defender sometimes mistakenly flags Rust/Solana binaries as a virus. This is a common **false positive**.

**To fix this:**
1.  Open **Windows Security** (Search in Start Menu).
2.  Go to **Virus & threat protection > Manage settings**.
3.  Scroll down to **Exclusions** and click **Add or remove exclusions**.
4.  Click **Add an exclusion > Folder** and add these two folders:
    -   `C:\Users\YOUR_USERNAME\.cargo`
    -   `C:\Users\YOUR_USERNAME\.rustup`
5.  Try the `cargo install` command again.

**Still having trouble?** Use **Option C (Solana Playground)** below. It's the most frictionless way to deploy without worrying about your computer's security settings!

---

## Part 1: Smart Contract (Solana On-Chain)
Smart contracts (programs) are NOT hosted on a website. They live directly on the Solana blockchain.

1.  **Build**: In your terminal, run `anchor build`.
2.  **Deploy**: Run `anchor deploy --provider.cluster devnet`.
3.  **Find your ID**: Look for the `Program Id` in the terminal output.
4.  **Save it**: Copy this ID. You will need it for the frontend environment variables.

---

## Part 2: Backend (Railway)
Railway gives you a live URL for your Node.js API.

1.  **Connect**: Go to [Railway.app](https://railway.app), login, and click **New Project > Deploy from GitHub**.
2.  **Select Repo**: Select your `deriverse` repository.

### Step B: Setup the Backend Service
1. In your project dashboard, Railway might automatically detect the root. We need to create two services.
2. For the **Backend**:
   - Go to **Settings**.
   - Set **Root Directory** to `backend`.
   - Railway will use the `package.json` in that folder.
   - **Start Command**: `npm run start`.
   - Add your environment variables in the **Variables** tab.

### 🔍 How to find your Railway Backend URL:
1. In your Railway project, click on your **Backend service**.
2. Go to the **Settings** tab.
3. Look for the **"Public Networking"** section.
4. Click **"Generate Domain"** (if you haven't yet).
5. The URL that appears (e.g., `https://backend-production.up.railway.app`) is your **Railway Public Link**.
    - **This is your Backend URL** (e.g., `https://backend-production.up.railway.app`). Copy it!

---

## Part 3: Frontend (Vercel)
Vercel will host your user interface and connect it to your Backend and Solana.

1.  **Connect**: Go to [Vercel.com](https://vercel.com), login, and click **Add New > Project**.
2.  **Import**: Select your `deriverse` repository.
3.  **Framework**: It should auto-detect **Vite**.
4.  **Environment Variables**: This is the most important step! Add these:
    - `VITE_BACKEND_URL`: Paste your **Railway Link** here.
    - `VITE_PROGRAM_ID`: Paste your **Solana Program Id** here.
5.  **Deploy**: Click **Deploy**. Vercel will give you a link (e.g., `https://deriverse.vercel.app`).

---

## Part 4: Connecting the Dots
| Where is it? | How do I update it? |
| :--- | :--- |
| **Logic/Program** | Deploy via Anchor CLI |
| **API/Backend** | Pushing code to GitHub updates Railway automatically |
| **UI/Frontend** | Pushing code to GitHub updates Vercel automatically |

**Confused about the "Link"?**
- **Railway** link = The engine's location. You give this to the Frontend.
- **Vercel** link = The shop's front door. You give this to your users.
