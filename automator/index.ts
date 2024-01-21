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
    console.log(`got profile: ${JSON.stringify(profile, null, 2)}`);

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

export async function clickOnElement(
  driver: WebDriver,
  element: WebElement
): Promise<void> {
  await driver.executeScript("return arguments[0].click()", element);
}

export async function extractCurrentProfile(
  driver: WebDriver
): Promise<CandidateProfile> {
  const moreInfoButton = await getExpandButton(driver);
  await clickOnElement(driver, moreInfoButton);

  const firstProfileElement = await getFirstProfileInfoContainer(driver);
  const firstProfileText = await firstProfileElement.getText();
  console.log(firstProfileText);

  const secondProfileElement = await getSecondProfileInfoContainer(driver);
  const secondProfileText = await secondProfileElement.getText();
  console.log(secondProfileText);

  return {
    images: [],
  };
}
