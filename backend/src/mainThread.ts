import axios from 'axios';
import { randomNormal } from 'd3-random';
import { CandidateProfile } from './automator';
import TinderMongoClient, { ImageCandidate } from './db/client';
import {
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

export function getScore(profile: CandidateProfile): number {
  const response = axios.post(
    'http://localhost:5000/ratingPrediction',
    profile,
  );
  return response as any;
}

function getUnitDifference(a: number[], b: number[]): number[] {
  const difference = a.map((num, index) => b[index] - num);
  const magnitude = Math.sqrt(
    difference.reduce((sum, num) => sum + num ** 2, 0),
  );
  const unitVector = difference.map((num) => num / magnitude);
  return unitVector;
}

const getDistance = (a: number[], b: number[]) => {
  const squaredDifferences = a.map((value, index) => (value - b[index]) ** 2);
  const sumOfSquaredDifferences = squaredDifferences.reduce(
    (sum, num) => sum + num,
    0,
  );
  const distance = Math.sqrt(sumOfSquaredDifferences);
  return distance;
};

// For now, we will only consider updating the first image in the profile.
export async function considerProfileUpdates(userId: string): Promise<void> {
  await goToMyProfile();
  await extractProfile();

  const allCandidates = await client.getImageCandidateEmbeddings(userId);
  const totalSwipes = (await client.getSwipes(userId)).length;
  const totalMatches = (await client.getSwipes(userId)).length;

  const scaledTotalSwipes = Math.min(totalSwipes, 100);
  const scaledTotalMatches = (totalMatches * scaledTotalSwipes) / totalSwipes;

  const vettedCandidates = allCandidates.filter(
    (candidate) => candidate.swipesWithImage > 50,
  );
  const unexploredCandidates = allCandidates.filter(
    (candidate) => candidate.swipesWithImage <= 50,
  );

  // Run a simulation where for each of the images, take its posterior mean and
  // edit it based  on its variance. Choose the output with the highest match rate.
  const sampledMatchRate = vettedCandidates.map((candidate) => {
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

  const percentExplored = vettedCandidates.length / allCandidates.length;
  if (Math.random() > percentExplored || vettedCandidates.length < 2) {
    const selection =
      unexploredCandidates[
        Math.floor(Math.random() * unexploredCandidates.length)
      ];
    updateTopPhoto(selection);
  } else {
    const best = sampledMatchRate.at(-1)!;
    const secondBest = sampledMatchRate.at(-2)!;
    const embeddingDirection = getUnitDifference(
      best.candidate.embedding,
      secondBest.candidate.embedding,
    );
    const learningRate = 0.1;
    const newEmbedding = best.candidate.embedding.map(
      (value, index) => value + embeddingDirection[index] * learningRate,
    );
    const candidatesWithDistances = unexploredCandidates.map((candidate) => ({
      candidate,
      distance: getDistance(candidate.embedding, newEmbedding),
    }));
    const sortedCandidatesWithDistances = candidatesWithDistances.sort(
      (a, b) => a.distance - b.distance,
    );
    updateTopPhoto(sortedCandidatesWithDistances[0].candidate);
  }
}

export async function updateTopPhoto(candidate: ImageCandidate) {
  const candidateWithData = await client.getImageData(candidate._id);
  await goToMyProfile();
  const myProfile = await extractProfile();
  if (myProfile.images[0] === candidateWithData.imageData) {
    await goToCandidates();
    return;
  }

  console.log("TRYING THE PHOTO WITH ID", candidate._id)
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
      const attraction = await getScore(profile);
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
