import express from 'express';
import { mainThread } from './mainThread';

const app = express();
const PORT = 3000;

app.get('/', (req, res) => {
  res.send('hello world!');
});

// Handle 404s
app.use((req, res) => {
  console.error(`404: ${req.method} ${req.url}`);
  return res.status(404).json({ message: 'Not Found' });
});

// Handle server errors
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    console.error('\x1b[31m', err.stack, '\x1b[0m');
    res.status(err.status || 500).json({ message: err.message, error: err });
  },
);

app.listen(PORT, () => {
  console.info(`Listening on port ${PORT}...`);
});

mainThread({
  attractionBar: 5,
  maxTotalSwipes: 1000,
  swipesPerRound: 50,
  waitBetweenRoundsSeconds: 50,
});
