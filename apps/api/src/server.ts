import express from 'express';
import greenAreaRoutes from './routes/greenAreaRoutes';

const app = express();
const PORT = 3000;

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/green-areas', greenAreaRoutes);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server körs på http://207.127.88.152:${PORT}`);
});
