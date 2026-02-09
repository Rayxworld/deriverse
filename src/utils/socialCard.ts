/**
 * Utility for generating the social sharing card entirely in the browser.
 */

export interface CardStats {
  winRate: string;
  totalPnL: string;
  trades: string;
  wallet: string;
  avatarUrl?: string;
}

export const generateSocialCard = async (stats: CardStats): Promise<string> => {
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 630;
  const ctx = canvas.getContext('2d');

  if (!ctx) throw new Error('Could not get canvas context');

  // 1. Draw Background
  const grad = ctx.createLinearGradient(0, 0, 1200, 630);
  grad.addColorStop(0, '#0a0b10');
  grad.addColorStop(1, '#161b22');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1200, 630);

  // 2. Add Decorative brand glow
  ctx.beginPath();
  const glowGrad = ctx.createRadialGradient(1000, 100, 0, 1000, 100, 400);
  glowGrad.addColorStop(0, 'rgba(0, 255, 163, 0.15)');
  glowGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = glowGrad;
  ctx.arc(1000, 100, 400, 0, Math.PI * 2);
  ctx.fill();

  // 3. Draw Brand Name
  ctx.fillStyle = '#00ffa3';
  ctx.font = 'bold 48px Inter, Arial';
  ctx.fillText('DERIVERSE', 80, 100);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.font = '24px Inter, Arial';
  ctx.fillText('SOLANA TRADING ANALYTICS', 80, 140);

  // 4. Draw Main Stats
  // Win Rate
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.font = '32px Inter, Arial';
  ctx.fillText('WIN RATE', 80, 300);
  
  ctx.fillStyle = '#00ffa3';
  ctx.font = 'bold 96px Inter, Arial';
  ctx.fillText(`${stats.winRate}%`, 80, 400);

  // PnL
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.font = '32px Inter, Arial';
  ctx.fillText('TOTAL PNL', 500, 300);
  
  const pnlVal = parseFloat(stats.totalPnL);
  ctx.fillStyle = pnlVal >= 0 ? '#00ffa3' : '#ff4d4d';
  ctx.font = 'bold 96px Inter, Arial';
  ctx.fillText(`$${stats.totalPnL}`, 500, 400);

  // Trades
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.font = '32px Inter, Arial';
  ctx.fillText('TOTAL TRADES', 950, 300);
  
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 96px Inter, Arial';
  ctx.fillText(stats.trades, 950, 400);

  // 5. Draw Avatar
  const avatarX = 1050;
  const avatarY = 120;
  const avatarSize = 80;

  // Mask for avatar
  ctx.save();
  ctx.beginPath();
  ctx.arc(avatarX, avatarY, avatarSize, 0, Math.PI * 2);
  ctx.clip();

  if (stats.avatarUrl) {
    try {
      const img = await loadImage(stats.avatarUrl);
      // Draw image to cover circular clipping
      const scale = (avatarSize * 2) / Math.min(img.width, img.height);
      const w = img.width * scale;
      const h = img.height * scale;
      ctx.drawImage(img, avatarX - w / 2, avatarY - h / 2, w, h);
    } catch (e) {
      drawDefaultAvatar(ctx, avatarX, avatarY, avatarSize, stats.wallet);
    }
  } else {
    drawDefaultAvatar(ctx, avatarX, avatarY, avatarSize, stats.wallet);
  }
  ctx.restore();

  // Glow/Border around avatar
  ctx.beginPath();
  ctx.arc(avatarX, avatarY, avatarSize, 0, Math.PI * 2);
  ctx.strokeStyle = '#00ffa3';
  ctx.lineWidth = 4;
  ctx.stroke();

  // 6. Footer Wallet
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.font = '24px Inter, Arial';
  ctx.textAlign = 'right';
  ctx.fillText(stats.wallet, 1120, 580);

  return canvas.toDataURL('image/png');
};

const loadImage = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous'; // Crucial for DataURL export
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
};

const drawDefaultAvatar = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, wallet: string) => {
  const grad = ctx.createRadialGradient(x, y, 0, x, y, size);
  grad.addColorStop(0, '#00ffa3');
  grad.addColorStop(1, '#00a372');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(x, y, size, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#0a0b10';
  ctx.font = `bold ${size}px Inter, Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(wallet.charAt(0).toUpperCase(), x, y);
};
