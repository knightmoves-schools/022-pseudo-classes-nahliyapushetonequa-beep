const http = require("http");
const fs = require("fs");
const puppeteer = require("puppeteer");

let server;
let browser;
let page;

beforeAll(async () => {
  server = http.createServer((req, res) => {
    fs.readFile(__dirname + "/.." + req.url, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end(JSON.stringify(err));
        return;
      }
      res.writeHead(200);
      res.end(data);
    });
  });
  server.listen(process.env.PORT || 3000);
});

afterAll(() => {
  server.close();
});

beforeEach(async () => {
  browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  page = await browser.newPage();
  await page.goto("http://localhost:3000/index.html");
});


afterEach(async () => {
  await browser.close();
});

describe("hovering over the anchor", () => {
  it("should turn the anchor text purple", async () => {
    const matches = await page.$eval("style", (style) => {
      return (
        style.innerHTML.match(/a:hover.*{[\s\S][^}]*color.*:.*purple.*;/g) || []
      ).length;
    });
    expect(matches).toEqual(1);
  });
});

describe("initially the paragraph tooltip", () => {
  it("should not be visible", async () => {
    const display = await page.$eval("div p", (paragraph) => {
      return window.getComputedStyle(paragraph).getPropertyValue("display");
    });
    expect(display).toBe("none");
  });
});

describe('hovering over the "Hover over me." text', () => {
  it("should display the paragraph tooltip", async () => {
    const matches = await page.$eval("style", (style) => {
      return (
        style.innerHTML.match(/div:hover.*p {[\s\S][^}]*display.*:.*block.*;/g) || []
      ).length;
    });
    expect(matches).toEqual(1);
  });
});

