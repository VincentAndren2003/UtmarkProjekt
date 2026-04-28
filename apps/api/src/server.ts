import express from 'express';
import greenAreaRoutes from './routes/greenAreaRoutes';
import routeCreator from './routes/routeCreator';

const app = express();
const PORT = 3000;

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/green-areas', greenAreaRoutes);
app.use('/api/routes', routeCreator);

app.listen(PORT, () => {
  console.log(`Server körs på http://localhost:${PORT}`);
});
