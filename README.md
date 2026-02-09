# Deriverse Trading Analytics Dashboard

A high-performance, full-stack trading analytics suite for the Deriverse ecosystem on Solana. This project provides professional-grade insights, on-chain journaling, and social performance sharing.

## ✨ Features

### 📊 Advanced Analytics
- **PnL & Drawdown**: Real-time tracking of cumulative performance.
- **Risk Profiling**: Dynamic classification (Aggressive/Conservative) based on behavior.
- **Asset Allocation**: Portfolio distribution visualization.
- **Win Rate & Profit Factor**: High-fidelity trading metrics.

### 🛡️ Web3 Backend (On-Chain)
- **Solana Wallet Integration**: Full support for Phantom, Solflare, etc.
- **Trade Journaling**: Anchor program (Rust) logic for saving trade notes directly to the Solana blockchain.
- **Real-Time Hook**: Automatically switches from Demo to Live mode upon wallet connection.

### 🚀 Social Backend (Off-Chain)
- **Performance Card Engine**: Node.js API that generates dynamic sharing images.
- **Share to Socials**: Instantly flaunt your win rate and PnL with structured metadata.

---

## 🛠️ Project Structure

```text
├── src/            # React Frontend (Vite + TS)
├── backend/        # Node.js Social API (Express + Canvas)
├── program/        # Solana Anchor Program (Rust)
└── README.md       # This file
```

---

## 🏃‍♂️ How to Run

### 1. Frontend
```bash
cd deriverse
npm install
npm run dev
```

### 2. Social Backend
```bash
cd deriverse/backend
npm install
npm run start
```

---



Built for the Deriverse Bounty. 🚀
