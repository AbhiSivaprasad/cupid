import express from 'express';
import { mainThread } from './mainThread';
import dotenv from 'dotenv';
import { getMessage } from './chat';
import { Profile } from './chat/types';

dotenv.config();

const DUMMY_ME: Profile = {
  texts: [
    "I'm a software engineer at OpenAI.",
    'I like to play the piano and go hiking.',
  ],
  images: ['https://example.com/me.jpg'],
};
const DUMMY_THEM: Profile = {
  texts: [
    "I'm a software engineer at Google.",
    'I like to play the guitar and travel the world.',
  ],
  images: ['https://example.com/them.jpg'],
};

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
(async () => {
  console.log('Message:', await getMessage(DUMMY_ME, DUMMY_THEM, [], true));
})();
