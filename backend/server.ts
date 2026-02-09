import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

app.get('/', (req: Request, res: Response) => {
  res.send('Deriverse Analytics Backend - Running (Social cards are handled by frontend)');
});

app.listen(PORT, () => {
  console.log(`Deriverse Analytics Backend running on port ${PORT}`);
});
