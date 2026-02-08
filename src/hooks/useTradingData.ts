import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import type { Trade } from '../types';
import { generateMockTrades } from '../utils/mockData';
import { deriverseService } from '../services/deriverse';

export const useTradingData = () => {
  const { publicKey, connected, disconnect } = useWallet();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(true);

  const walletAddress = publicKey?.toBase58() || null;

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      if (isDemo && !connected) {
        // Use high-fidelity mock data for demo
        setTrades(generateMockTrades(50));
      } else if (connected && walletAddress) {
        // Auto-switch to live if connected, unless manually toggled back
        const realTrades = await deriverseService.getTradeHistory(walletAddress);
        setTrades(realTrades);
        setIsDemo(false);
      } else {
        // Not connected and not in demo = empty
        setTrades([]);
      }
      setLoading(false);
    };

    loadData();
  }, [isDemo, connected, walletAddress]);

  const connectWallet = async () => {
    if (connected) {
      await disconnect();
    } else {
      // This will trigger the modal because of WalletModalProvider
      // We don't call select() directly usually, but letting the button do it
    }
  };

  return { 
    trades, 
    loading, 
    isDemo, 
    setIsDemo, 
    connectWallet, 
    walletAddress,
    connected 
  };
};
