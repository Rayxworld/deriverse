import express, { Request, Response } from 'express';
import cors from 'cors';
import { createCanvas, loadImage } from 'canvas';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

// Endpoint to generate a performance card image
app.get('/api/share/:wallet', async (req: Request, res: Response) => {
  const { wallet } = req.params;
  const { winRate, totalPnL, trades, avatar } = req.query;

  try {
    const width = 1200;
    const height = 630;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Background - Dark Gradient
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#0a0b10');
    gradient.addColorStop(1, '#161b22');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Profile Picture Circle (Top Right)
    const avatarX = 1000;
    const avatarY = 120;
    const avatarSize = 100;

    ctx.save();
    ctx.beginPath();
    ctx.arc(avatarX, avatarY, avatarSize, 0, Math.PI * 2);
    ctx.clip();

    if (avatar && typeof avatar === 'string' && avatar.startsWith('http')) {
      try {
        const userImg = await loadImage(avatar);
        ctx.drawImage(userImg, avatarX - avatarSize, avatarY - avatarSize, avatarSize * 2, avatarSize * 2);
      } catch (e) {
        drawDefaultAvatar(ctx, avatarX, avatarY, avatarSize, wallet);
      }
    } else {
      drawDefaultAvatar(ctx, avatarX, avatarY, avatarSize, wallet);
    }
    ctx.restore();

    // Border for Avatar
    ctx.beginPath();
    ctx.arc(avatarX, avatarY, avatarSize, 0, Math.PI * 2);
    ctx.strokeStyle = '#00ffa)3';
    ctx.lineWidth = 5;
    ctx.stroke();

    // Brand Header
    ctx.fillStyle = '#00ffa3';
    ctx.font = 'bold 40px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('DERIVERSE', 60, 80);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = '24px Arial';
    ctx.fillText('TRADING ANALYTICS', 300, 78);

    // ... rest of stats drawing ...
    // Wallet Address (Truncated)
    const truncatedWallet = `${wallet.slice(0, 6)}...${wallet.slice(-4)}`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '20px Arial';
    ctx.fillText(truncatedWallet, 60, 130);

    // Stats Section
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px Arial';
    ctx.fillText('Performance Summary', 60, 250);

    // PnL
    ctx.fillStyle = (Number(totalPnL) >= 0) ? '#00ffa3' : '#ff4d4d';
    ctx.font = 'bold 80px Arial';
    ctx.fillText(`$${totalPnL}`, 60, 350);
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = '24px Arial';
    ctx.fillText('Net Profit / Loss', 60, 390);

    // Win Rate Box
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.beginPath();
    ctx.roundRect(800, 250, 300, 250, 20);
    ctx.fill();

    ctx.fillStyle = '#00ffa3';
    ctx.font = 'bold 70px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${winRate}%`, 950, 380);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = '24px Arial';
    ctx.fillText('WIN RATE', 950, 420);

    // Footer
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.font = '18px Arial';
    ctx.fillText(`Analyzed over ${trades} real on-chain trades. Verify at deriverse.io`, 60, 580);

    const buffer = canvas.toBuffer('image/png');
    res.set('Content-Type', 'image/png');
    res.send(buffer);
  } catch (error) {
    console.error('Error generating image:', error);
    res.status(500).send('Generation failed');
  }
});

function drawDefaultAvatar(ctx: any, x: number, y: number, size: number, wallet: string) {
  // Artistic default circle
  const grad = ctx.createRadialGradient(x, y, 0, x, y, size);
  grad.addColorStop(0, '#00ffa3');
  grad.addColorStop(1, '#00a372');
  ctx.fillStyle = grad;
  ctx.fillRect(x - size, y - size, size * 2, size * 2);

  // Initial from wallet
  ctx.fillStyle = '#0a0b10';
  ctx.font = `bold ${size}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(wallet.charAt(0).toUpperCase(), x, y);
}

app.listen(PORT, () => {
  console.log(`Deriverse Analytics Backend running on port ${PORT}`);
});
