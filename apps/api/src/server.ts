import express from 'express';
import greenAreaRoutes from './routes/greenAreaRoutes';

const app = express();
const PORT = 3000;

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/green-areas', greenAreaRoutes);

app.listen(PORT, () => {
  console.log(`Server körs på http://localhost:${PORT}`);
});
