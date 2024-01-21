import * as fs from 'fs';
import * as path from 'path';
import {
  Browser,
  Builder,
  By,
  Capabilities,
  Key,
  WebDriver,
  WebElement,
} from 'selenium-webdriver';
import { Options } from 'selenium-webdriver/chrome';
import { sleep } from '../utils';

const BROWSER_DATA_DIR_NAME = 'browser_data';
const BROWSER_DATA_PATH = path.resolve(path.join('./', BROWSER_DATA_DIR_NAME));
const TMP_DIR_NAME = 'temp';

try {
  fs.mkdirSync(TMP_DIR_NAME);
} catch (e) {}

(async function example() {
  const driver = await getDriver();

  let profiles: CandidateProfile[] = [];

  await driver.get('https://tinder.com/app/recs');
  await sleep(5_000);

  while (true) {
    let profile = await extractProfile(driver);
    profile = await reactToProfile(driver, profile, true);
    profiles.push(profile);
    fs.writeFileSync('./profiles.json', JSON.stringify(profiles, null, 2));
    await printProfile(profile);
    await sleep(2000);
  }

  // await driver.findElement(By.name('q')).sendKeys('webdriver', Key.RETURN);
  // await driver.wait(until.titleIs('webdriver - Google Search'), 1000);
  await sleep(5000000);
})();

// Interact with Tinder App
//
//  extract_profile: extract all information from candidate profile
//    output: images, text, information with ordering
//
//  do_swipe: actually swipe
//    input: yes_or_no
//
//  set_profile: set all information from profile
//
//  input: ordered images, text, information
//
//  check_matches -> Receives ordered list of matches
//
//  click_on_match(match_name)
//
//  click_match_profile()
//
//  send_chat(text)
//
//  change_settings:
//
//  input: settings object
//

export function getDriver(): Promise<WebDriver> {
  var chromeCapabilities = Capabilities.chrome();
  //setting chrome options to start the browser fully maximized
  var chromeOptions = {
    args: ['--test-type', '--start-maximized'],
  };
  chromeCapabilities.set('chromeOptions', chromeOptions);

  const options = new Options();
  // options.windowSize({ width: 100, height: 100 });
  options.addArguments(`user-data-dir=${BROWSER_DATA_PATH}`);

  return new Builder()
    .withCapabilities(chromeCapabilities)
    .setChromeOptions(options)
    .forBrowser(Browser.CHROME)
    .build();
}

/**
 * Profile of someone we're currently looking at and need to decide
 * whether we're swiping right or left on.
 */
export interface CandidateProfile {
  name?: string;
  age?: string;
  images: string[]; // base64 encoded pngs, only scanning the first one
  liked?: boolean;

  // everything below here not figured out yet
  job?: string;
  height?: string;
  education?: string;
  description?: string;

  // fields below are optional to implement
  lookingFor?: string;
}

export async function getExpandButton(driver: WebDriver): Promise<WebElement> {
  const expand = await driver.findElement(
    By.css('.D\\(f\\).Ai\\(c\\).Miw\\(0\\)'),
  );

  return expand;
}

export async function getFirstProfileInfoContainer(
  driver: WebDriver,
): Promise<WebElement> {
  const info = await driver.findElement(
    By.css('.D\\(f\\).Jc\\(sb\\).Us\\(n\\).Px\\(16px\\).Py\\(10px\\)'),
  );

  return info;
}

export async function extractInfoFromFirstContainer(
  driver: WebDriver,
  firstContainer: WebElement,
): Promise<{ name: string; age: string }> {
  let name = 'unknown';
  let age = 'unknown';

  try {
    const nameContainer = await firstContainer.findElement(
      By.css('div div div h1'),
    );
    name = await nameContainer.getText();
  } catch (e) {}

  try {
    const ageContainer = await firstContainer.findElement(
      By.css('div div span'),
    ); // age
    age = await ageContainer.getText();
  } catch (e) {}

  return { name, age };
}

export async function getSecondProfileInfoContainer(
  driver: WebDriver,
): Promise<WebElement> {
  const info = await driver.findElement(
    By.css(
      '.Px\\(16px\\).Py\\(12px\\).Us\\(t\\).C\\(\\$c-ds-text-secondary\\).BreakWord.Whs\\(pl\\).Typs\\(body-1-regular\\)',
    ),
  );

  return info;
}

export async function getPhotosCount(driver: WebDriver): Promise<number> {
  const scrollerContainerCandidates = await driver.findElements(
    By.css('div.CenterAlign'),
  );

  let lastQuantity = 0;

  for (const candidate of scrollerContainerCandidates) {
    try {
      const attr = await candidate.getAttribute('aria-label');
      if (attr.includes("'s photos")) {
        const buttons = await candidate.findElements(By.css('button.bullet'));
        const quantity = buttons.length;
        lastQuantity = quantity;
      }
    } catch (e) {}
  }

  if (lastQuantity === 0) {
    throw new Error('unable to find photo quantity');
  }

  return lastQuantity;
}

/**
 * Returns an array of base64 encoded png images from the current profile.
 *
 * currently only returns first image.
 *
 * @todo: make it return other images too.
 */
export async function getCurrentProfileImages(
  driver: WebDriver,
): Promise<string[]> {
  const slider = await driver.findElement(By.css('.keen-slider'));
  const children = await slider.findElements(By.css('*'));
  const screenshots: string[] = [];
  const photosCount = await getPhotosCount(driver);

  for (let i = 0; i < photosCount; i++) {
    const screenshot = await children[0].takeScreenshot();
    fs.writeFileSync(`./temp/encoded_${i}.txt`, screenshot);
    screenshots.push(screenshot);
    await driver.actions().sendKeys(Key.SPACE).perform();
    await sleep(250);
  }

  return screenshots;
}

export async function clickOnElement(
  driver: WebDriver,
  element: WebElement,
): Promise<void> {
  await driver.executeScript('return arguments[0].click()', element);
}

export async function getLikeButton(driver: WebDriver): Promise<WebElement> {
  const buttons = await driver.findElements(By.css('button'));

  for (const button of buttons) {
    try {
      const path = await button.findElement(By.css('span span svg path'));
      const d = await path.getAttribute('d');
      if (
        d ===
        'M21.994 10.225c0-3.598-2.395-6.212-5.72-6.212-1.78 0-2.737.647-4.27 2.135C10.463 4.66 9.505 4 7.732 4 4.407 4 2 6.62 2 10.231c0 1.52.537 2.95 1.533 4.076l8.024 7.357c.246.22.647.22.886 0l7.247-6.58.44-.401.162-.182.168-.174a6.152 6.152 0 0 0 1.54-4.09'
      ) {
        return button;
      }
    } catch (e) {}
  }

  throw new Error('unable to find like button');
}

export async function getDislikeButton(driver: WebDriver): Promise<WebElement> {
  const buttons = await driver.findElements(By.css('button'));

  for (const button of buttons) {
    try {
      const path = await button.findElement(By.css('span span svg path'));
      const d = await path.getAttribute('d');
      if (
        d ===
        'm15.44 12 4.768 4.708c1.056.977 1.056 2.441 0 3.499-.813 1.057-2.438 1.057-3.413 0L12 15.52l-4.713 4.605c-.975 1.058-2.438 1.058-3.495 0-1.056-.813-1.056-2.44 0-3.417L8.47 12 3.874 7.271c-1.138-.976-1.138-2.44 0-3.417a1.973 1.973 0 0 1 3.25 0L12 8.421l4.713-4.567c.975-1.139 2.438-1.139 3.413 0 1.057.814 1.057 2.44 0 3.417L15.44 12Z'
      ) {
        return button;
      }
    } catch (e) {}
  }

  throw new Error('unable to find dislike button');
}

export async function extractProfile(
  driver: WebDriver,
): Promise<CandidateProfile> {
  const profile: Partial<CandidateProfile> = {};

  try {
    const images = await getCurrentProfileImages(driver);
    profile.images = images;
  } catch (e) {
    console.log('failed to get profile images', e);
  }

  const moreInfoButton = await getExpandButton(driver);
  await clickOnElement(driver, moreInfoButton);

  console.log('');

  try {
    const firstProfileElement = await getFirstProfileInfoContainer(driver);
    const firstProfileInfo = await extractInfoFromFirstContainer(
      driver,
      firstProfileElement,
    );
    profile.name = firstProfileInfo.name;
    profile.age = firstProfileInfo.age;
  } catch (e) {
    // console.log("failed to get first profile element", e);
  }
  console.log('');

  try {
    const secondProfileElement = await getSecondProfileInfoContainer(driver);
    const secondProfileText = await secondProfileElement.getText();
    // console.log("******");
    // console.log(secondProfileText);
    // console.log("******");
  } catch (e) {
    // console.log("failed to get second profile element", e);
  }

  return profile as CandidateProfile;
}

export async function reactToProfile(
  driver: WebDriver,
  profile: CandidateProfile,
  like: boolean,
): Promise<CandidateProfile> {
  profile.liked = like;
  if (like) {
    const likeButton = await getLikeButton(driver);
    await clickOnElement(driver, likeButton);
  } else {
    const dislikeButton = await getDislikeButton(driver);
    await clickOnElement(driver, dislikeButton);
  }

  return profile;
}

export async function printProfile(profile: CandidateProfile): Promise<void> {
  console.log('-----------');
  console.log('name   : ', profile.name);
  console.log('age    : ', profile.age);
  console.log('desc   : ', profile.description);
  console.log('images : ', profile.images.length);
  console.log('liked  : ', profile.liked);
  console.log('-----------');
}
