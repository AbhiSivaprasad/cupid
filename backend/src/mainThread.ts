import axios from 'axios';
import {
  ProfileInfo,
  doSwipe,
  extractProfile,
  goToMyProfile,
  go_to_candidates,
} from './improve-profile/stubbedfunctions';
import { delay } from './utils';
export function doSetup() {
  // add all the setup you need here so that all of the functions in stubbedFunctions are fully callable.
}

export function getAttractiveness(profile: ProfileInfo): number {
  const response = axios.post(
    'http://localhost:5000/get_profile_attractiveness',
    profile,
  );
  return response;
}

export async function considerProfileUpdates(): Promise<void> {
    await goToMyProfile()
    await extractProfile()
}

export async function mainThread(options: {
  swipesPerRound: number;
  attractionBar: number;
  maxTotalSwipes: number;
  waitBetweenRoundsSeconds: number;
}) {
  let totalSwipes = 0;
  while (true) {
    const startTime = Date.now();
    go_to_candidates();
    for (const i of Array.from({ length: options.swipesPerRound })) {
      const profile = await extractProfile()
      const attraction = await getAttractiveness(profile)
      if (attraction > options.attractionBar){
        doSwipe("yes")
       // addSwipe
      } else{
        doSwipe("no")
      }
      totalSwipes += 1
      if (totalSwipes >= options.maxTotalSwipes){
        return;
      }
    }
    await delay(options.waitBetweenRoundsSeconds * 1000)
    await considerProfileUpdates()
  }
}
