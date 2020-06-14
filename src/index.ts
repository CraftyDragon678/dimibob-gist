import fetch from "node-fetch";
import { resolve } from "path";
import { config } from "dotenv";
import { Octokit } from "@octokit/rest";

config({ path: resolve(__dirname, "../.env") });

const BASE_URL = "https://api.dimigo.in";

interface bob {
  breakfast: string;
  lunch: string;
  dinner: string;
  snack: string;
  date: string;
}

function getYYYYMMDD(date: Date): string {
  let mm = date.getMonth() + 1;
  let dd = date.getDate();

  return `${date.getFullYear()}${mm < 10 ? "0" + mm : mm}${
    dd < 10 ? "0" + dd : dd
  }`;
}

function isTomorrow(date: Date): boolean {
  return date.getHours() > 19;
}

(async () => {
  const today = new Date();

  const getNextDay = isTomorrow(today);

  if (getNextDay) {
    today.setDate(today.getDate() + 1);
  }

  console.log(today);

  const fetched = await fetch(`${BASE_URL}/dimibobs/${getYYYYMMDD(today)}`);
  const data = (await fetched.json()) as bob;

  console.log(
    `${getNextDay ? "내일의 밥" : "오늘의 밥"}\n` +
      `아침🌅 ${data.breakfast}\n` +
      `점심🌞 ${data.lunch}\n` +
      `저녁🌃 ${data.dinner}`
  );
})();
