import axios from 'axios';
import { randomNormal } from 'd3-random';
import TinderMongoClient, { ImageCandidate } from './db/client';
import {
  ProfileInfo,
  doSwipe,
  extractProfile,
  goToCandidates,
  goToMyProfile,
} from './improve-profile/stubbedfunctions';
import { sleep } from './utils';

const client = new TinderMongoClient(
  'mongodb+srv://hingebot.nuxwjjl.mongodb.net/',
  'prod',
);
export function doSetup() {
  // add all the setup you need here so that all of the functions in stubbedFunctions are fully callable.
}

export function getAttractiveness(profile: ProfileInfo): number {
  const response = axios.post(
    'http://localhost:5000/get_profile_attractiveness',
    profile,
  );
  return response as any;
}

// For now, we will only consider updating the first image in the profile.
export async function considerProfileUpdates(userId: string): Promise<void> {
  await goToMyProfile();
  await extractProfile();

  const allCandidates = await client.getImageCandidateEmbeddings();
  const totalSwipes = (await client.getSwipes(userId)).length;
  const totalMatches = (await client.getSwipes(userId)).length;

  const scaledTotalSwipes = Math.min(totalSwipes, 100);
  const scaledTotalMatches = (totalMatches * scaledTotalSwipes) / totalSwipes;

  // Run a simulation where for each of the images, take its posterior mean and
  // edit it based  on its variance. Choose the output with the highest match rate.
  const sampledMatchRate = allCandidates.map((candidate) => {
    const matchRate = candidate.swipesWithImage / candidate.matchesWithImage;
    const posteriorMatchRate =
      (totalMatches + scaledTotalMatches) / (totalSwipes + scaledTotalSwipes);
    const variance = posteriorMatchRate * (1 - posteriorMatchRate); // This is approximate

    const randomSample = randomNormal(
      posteriorMatchRate,
      Math.sqrt(variance),
    )();
    return { candidate, randomSample };
  });
  sampledMatchRate.sort((a, b) => a.randomSample - b.randomSample);
  const newExperiment = sampledMatchRate.at(-1)!;
  updateTopPhoto(newExperiment.candidate);
}

export async function updateTopPhoto(candidate: ImageCandidate) {
  const candidateWithData = await client.getImageData(candidate._id);
  await goToMyProfile();
  const myProfile = await extractProfile();
  if (myProfile.images[0] === candidateWithData.imageData) {
    await goToCandidates();
    return;
  }

  // Once ivan has it, update the top photo
}

export async function mainThread(options: {
  swipesPerRound: number;
  attractionBar: number;
  maxTotalSwipes: number;
  waitBetweenRoundsSeconds: number;
  userId: string;
}) {
  let totalSwipes = 0;
  while (true) {
    const startTime = Date.now();
    goToCandidates();
    for (const i of Array.from({ length: options.swipesPerRound })) {
      const profile = await extractProfile();
      const attraction = await getAttractiveness(profile);
      if (attraction > options.attractionBar) {
        doSwipe('yes');
        // addSwipe
      } else {
        doSwipe('no');
      }
      totalSwipes += 1;
      if (totalSwipes >= options.maxTotalSwipes) {
        return;
      }
    }
    await sleep(options.waitBetweenRoundsSeconds * 1000);
    await considerProfileUpdates(options.userId);
  }
}
