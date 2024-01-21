import {
  Builder,
  Browser,
  By,
  Key,
  until,
  WebDriver,
  ChromiumWebDriver,
  Capabilities,
  WebElement,
  Actions,
  Origin,
} from "selenium-webdriver";
import { sleep } from "./util";
import { Options } from "selenium-webdriver/chrome.js";
import * as fs from "fs";
import * as path from "path";
import { isNamespaceExport } from "typescript";

const BROWSER_DATA_DIR_NAME = "browser_data";
const BROWSER_DATA_PATH = path.resolve(path.join("./", BROWSER_DATA_DIR_NAME));

(async function example() {
  var chromeCapabilities = Capabilities.chrome();
  //setting chrome options to start the browser fully maximized
  var chromeOptions = {
    args: ["--test-type", "--start-maximized"],
  };
  chromeCapabilities.set("chromeOptions", chromeOptions);

  const options = new Options();
  // options.windowSize({ width: 100, height: 100 });
  options.addArguments(`user-data-dir=${BROWSER_DATA_PATH}`);

  let driver = await new Builder()
    .withCapabilities(chromeCapabilities)
    .setChromeOptions(options)
    .forBrowser(Browser.CHROME)
    .build();

  try {
    await driver.get("https://tinder.com/app/recs");

    await sleep(5_000);
    const profile = await extractCurrentProfile(driver);
    await printProfile(profile);

    // await driver.findElement(By.name('q')).sendKeys('webdriver', Key.RETURN);
    // await driver.wait(until.titleIs('webdriver - Google Search'), 1000);
    await sleep(5000000);
  } finally {
    // await driver.quit();
  }
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

/**
 * Profile of someone we're currently looking at and need to decide
 * whether we're swiping right or left on.
 */
export interface CandidateProfile {
  name?: string;
  age?: string;
  images: string[]; // base64 encoded jpgs
  job?: string;
  height?: string;
  education?: string;
  description?: string;

  // fields below are optional to implement
  lookingFor?: string;
}

export async function getExpandButton(driver: WebDriver): Promise<WebElement> {
  const expand = await driver.findElement(
    By.css(".D\\(f\\).Ai\\(c\\).Miw\\(0\\)")
  );

  return expand;
}

export async function getFirstProfileInfoContainer(
  driver: WebDriver
): Promise<WebElement> {
  const info = await driver.findElement(
    By.css(".D\\(f\\).Jc\\(sb\\).Us\\(n\\).Px\\(16px\\).Py\\(10px\\)")
  );

  return info;
}

export async function extractInfoFromFirstContainer(
  driver: WebDriver,
  firstContainer: WebElement
): Promise<{ name: string; age: string }> {
  let name = "unknown";
  let age = "unknown";

  try {
    const nameContainer = await firstContainer.findElement(
      By.css("div div div h1")
    );
    name = await nameContainer.getText();
  } catch (e) {}

  try {
    const ageContainer = await firstContainer.findElement(
      By.css("div div span")
    ); // age
    age = await ageContainer.getText();
  } catch (e) {}

  return { name, age };
}

export async function getSecondProfileInfoContainer(
  driver: WebDriver
): Promise<WebElement> {
  const info = await driver.findElement(
    By.css(
      ".Px\\(16px\\).Py\\(12px\\).Us\\(t\\).C\\(\\$c-ds-text-secondary\\).BreakWord.Whs\\(pl\\).Typs\\(body-1-regular\\)"
    )
  );

  return info;
}

/**
 * Returns an array of base64 encoded png images from the current profile.
 *
 * currently only returns first image.
 *
 * @todo: make it return other images too.
 */
export async function getCurrentProfileImages(
  driver: WebDriver
): Promise<string[]> {
  const slider = await driver.findElement(By.css(".keen-slider"));
  const children = await slider.findElements(By.css("*"));

  // await clickOnElement(driver, children[0]);
  const screenshot = await children[0].takeScreenshot();
  fs.writeFileSync(`./temp/encoded.txt`, screenshot);

  return [screenshot];
}

export async function clickOnElement(
  driver: WebDriver,
  element: WebElement
): Promise<void> {
  await driver.executeScript("return arguments[0].click()", element);
}

export async function getLikeButton(driver: WebDriver): Promise<WebElement> {
  return null;
}

export async function getDislikeButton(driver: WebDriver): Promise<WebElement> {
  const buttons = await driver.findElements(By.css("button"));

  for (const button of buttons) {
    try {
      const path = await button.findElement(By.css("span span svg path"));
      const d = await path.getAttribute("d");
      if (
        d ===
        "m15.44 12 4.768 4.708c1.056.977 1.056 2.441 0 3.499-.813 1.057-2.438 1.057-3.413 0L12 15.52l-4.713 4.605c-.975 1.058-2.438 1.058-3.495 0-1.056-.813-1.056-2.44 0-3.417L8.47 12 3.874 7.271c-1.138-.976-1.138-2.44 0-3.417a1.973 1.973 0 0 1 3.25 0L12 8.421l4.713-4.567c.975-1.139 2.438-1.139 3.413 0 1.057.814 1.057 2.44 0 3.417L15.44 12Z"
      ) {
        return button;
      }
    } catch (e) {}
  }

  throw new Error("unable to find dislike button");
}

export async function likeOrDislike(like: true): Promise<void> {
  if (like) {
  } else {
  }
}

export async function extractCurrentProfile(
  driver: WebDriver
): Promise<CandidateProfile> {
  const profile: Partial<CandidateProfile> = {};

  try {
    const images = await getCurrentProfileImages(driver);
    profile.images = images;
  } catch (e) {
    // console.log("failed to get profile images", e);
  }

  const moreInfoButton = await getExpandButton(driver);
  await clickOnElement(driver, moreInfoButton);

  console.log("");

  try {
    const firstProfileElement = await getFirstProfileInfoContainer(driver);
    const firstProfileInfo = await extractInfoFromFirstContainer(
      driver,
      firstProfileElement
    );
    profile.name = firstProfileInfo.name;
    profile.age = firstProfileInfo.age;
  } catch (e) {
    // console.log("failed to get first profile element", e);
  }
  console.log("");

  try {
    const secondProfileElement = await getSecondProfileInfoContainer(driver);
    const secondProfileText = await secondProfileElement.getText();
    console.log("******");
    console.log(secondProfileText);
    console.log("******");
  } catch (e) {
    // console.log("failed to get second profile element", e);
  }

  try {
    const dislikeButton = await getDislikeButton(driver);
    await clickOnElement(driver, dislikeButton);
  } catch (e) {
    // console.log("failed to click on the dislike button", e);
  }

  return profile as CandidateProfile;
}

export async function printProfile(profile: CandidateProfile): Promise<void> {
  console.log("name   : ", profile.name);
  console.log("age    : ", profile.age);
  console.log("desc   : ", profile.description);
  console.log("images : ", profile.images.length);
}
