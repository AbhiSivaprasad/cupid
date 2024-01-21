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

(async () => {
  console.log('Message:', await getMessage(DUMMY_ME, DUMMY_THEM, [], true));
})();
