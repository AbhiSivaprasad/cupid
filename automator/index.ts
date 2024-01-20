import {Builder, Browser, By, Key, until} from 'selenium-webdriver';
import { sleep } from './util';

(async function example() {
  let driver = await new Builder().forBrowser(Browser.CHROME).build();

  try {
    await driver.get('https://www.google.com/ncr');
    await driver.findElement(By.name('q')).sendKeys('webdriver', Key.RETURN);
    await driver.wait(until.titleIs('webdriver - Google Search'), 1000);
    await sleep(5000);
  } finally {
    await driver.quit();
  }
})();