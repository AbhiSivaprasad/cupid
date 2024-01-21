import dotenv from 'dotenv';
import { getMessage } from './chat';
import { Profile } from './chat/types';
import { DUMMY_IMAGE } from './test/dummy';

dotenv.config();

const DUMMY_ME: Profile = {
  texts: [
    "Bouncing between SF/NYC. I'm a software engineer by day, and a foodie by night. I'm always looking for my next adventure, whether it's trying a new restaurant or taking a spontaneous trip to a foreign country. I'm looking for someone who can keep up and keep me on my toes. I'm a big fan of hiking and playing the piano. I'm also a big fan of dogs, so if you have one, that's a plus!",
    "Two truths and a lie: I have a pet snake, I've been to 10 countries, and I can play the guitar. Guess which one is the lie!",
  ],
  images: [],
};
const DUMMY_THEM: Profile = {
  texts: [
    "Just a small town girl in a lonely world...\n\nThat's right, I'm a local girl, born and raised. I moved away to the city for a while for work but couldn't be happier to be back in town with a new gig and a bit more experience behind me.\n\nI absolutely love sports and am happiest when I'm outside making myself tired. Whether it's hiking, running, or a good game of basketball, I'm always trying to get better at what I do.",
    'I like to play the guitar and travel the world.',
  ],
  images: [DUMMY_IMAGE],
};

(async () => {
  console.log(await getMessage(DUMMY_ME, DUMMY_THEM, [], true));
})();

// (async () => {
//   const SCORE_THRESHOLD = 0.8;

//   let totalSwipes = 0;
//   const driver = await getDriver();
//   let profiles: CandidateProfile[] = [];

//   await driver.get('https://tinder.com/app/recs');
//   await sleep(5_000);

//   while (true) {
//     let profile = await extractProfile(driver);
//     const score = await getScore(profile);
//     profile = await reactToProfile(driver, profile, score > SCORE_THRESHOLD);
//     profiles.push(profile);
//     // writeFileSync('./profiles.json', JSON.stringify(profiles, null, 2));
//     await printProfile(profile);
//     await sleep(2000);

//     // TODO(shaya)
//     // await considerProfileUpdates(profile as any);
//   }
// })();
