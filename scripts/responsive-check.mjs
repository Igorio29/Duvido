import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const viewports = [
  { name: "mobile-320", width: 320, height: 700 },
  { name: "mobile-375", width: 375, height: 812 },
  { name: "tablet-768", width: 768, height: 1024 },
  { name: "desktop-1440", width: 1440, height: 900 }
];

await mkdir(".artifacts/responsive", { recursive: true });
const browser = await chromium.launch({ headless: true });
for (const viewport of viewports) {
  const page = await browser.newPage({ viewport });
  await page.route("**/api/questions", route => route.fulfill({
    status: 201, contentType: "application/json",
    body: JSON.stringify({ roundId: "round-token", question: "Quantas ilhas aproximadamente existem no Japão?", category: "Geografia", difficulty: "medium" })
  }));
  await page.route("**/api/questions/round-token/reveal", route => route.fulfill({
    status: 200, contentType: "application/json",
    body: JSON.stringify({ answer: 6852, explanation: "O Japão é um arquipélago formado por milhares de ilhas, segundo o levantamento geoespacial mais recente adotado para este fato.", lastGuess: 7000, challengeWasCorrect: true })
  }));
  await page.goto("http://localhost:5173", { waitUntil: "networkidle" });
  await page.screenshot({ path: `.artifacts/responsive/${viewport.name}-home.png`, fullPage: true });
  await page.getByLabel("Jogador 1").fill("Igor");
  await page.getByLabel("Jogador 2").fill("Julia");
  await page.getByRole("button", { name: /começar partida/i }).click();
  await page.getByText(/quantas ilhas/i).waitFor();
  await page.screenshot({ path: `.artifacts/responsive/${viewport.name}-game.png`, fullPage: true });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  if (overflow) throw new Error(`Overflow horizontal em ${viewport.name}`);
  await page.getByPlaceholder("Digite seu palpite").fill("7000");
  await page.getByRole("button", { name: /dar palpite/i }).click();
  await page.getByRole("button", { name: /duvido/i }).click();
  await page.getByText(/resposta correta/i).waitFor();
  await page.waitForTimeout(650);
  await page.screenshot({ path: `.artifacts/responsive/${viewport.name}-result.png`, fullPage: true });
  await page.close();
}
await browser.close();
console.log(`Responsividade validada em ${viewports.map(v => `${v.width}x${v.height}`).join(", ")}.`);
