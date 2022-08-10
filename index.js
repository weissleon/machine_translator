const puppeteer = require("puppeteer");

const url = "https://papago.naver.com/";

const sources = [
  "Hi",
  `The narrator of The Great Gatsby is a young man from Minnesota named Nick Carraway. He not only narrates the story but casts himself as the book’s author. He begins by commenting on himself, stating that he learned from his father to reserve judgment about other people, because if he holds them up to his own moral standards, he will misunderstand them. He characterizes himself as both highly moral and highly tolerant. He briefly mentions the hero of his story, Gatsby, saying that Gatsby represented everything he scorns, but that he exempts Gatsby completely from his usual judgments. Gatsby’s personality was nothing short of “gorgeous.”`,
  `In the summer of 1922, Nick writes, he had just arrived in New York, where he moved to work in the bond business, and rented a house on a part of Long Island called West Egg. Unlike the conservative, aristocratic East Egg, West Egg is home to the “new rich,” those who, having made their fortunes recently, have neither the social connections nor the refinement to move among the East Egg set. West Egg is characterized by lavish displays of wealth and garish poor taste. Nick’s comparatively modest West Egg house is next door to Gatsby’s mansion, a sprawling Gothic monstrosity.`,
];

async function translate(page, text) {
  // Select input
  const srcInput = await page.$("#txtSource");

  //   Clear input
  console.log("Clearing input...");
  await srcInput.click({ clickCount: 3 });
  await srcInput.press("Backspace");

  //   Type text
  console.log("Entering input...");
  await srcInput.type(text);

  console.log("Waiting for response...");
  await page.waitForResponse(async (res) =>
    res.url().includes("translate")
      ? (await res.json()).dict !== undefined
      : false
  );

  // Extract result
  const element = await page.$("#txtTarget>span");
  const translation = await element.evaluate((el) => el.textContent);

  return translation;
}

async function run() {
  // Set up a broswer and open a new page
  console.log("Opening Browser...");
  const browser = await puppeteer.launch({ slowMo: 0 });
  await browser
    .defaultBrowserContext()
    .overridePermissions(url, ["clipboard-read", "clipboard-write"]);
  const page = await browser.newPage();
  // Set window size
  await page.setViewport({ width: 1920, height: 1080 });
  //   Go to the website.
  console.log("Navigating to the page...");
  await page.goto(url, { waitUntil: "networkidle0" });

  //   Translate each line
  for (const [index, src] of sources.entries()) {
    console.log(`[Translating ${index + 1}/${sources.length}]`);
    const text = await translate(page, src);
    console.log(`--------------------`);
    console.log(text);
    console.log(`--------------------`, "\n");
  }

  //   Close the browser
  await browser.close();
}

// code runs here
(async () => {
  await run();
})();
