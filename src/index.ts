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

function getYYYYMMDD(date: Date = new Date()): string {
  let mm = date.getMonth() + 1;
  let dd = date.getDate();

  return `${date.getFullYear()}${mm < 10 ? "0" + mm : mm}${
    dd < 10 ? "0" + dd : dd
  }`;
}

function isTomorrow(date: Date = new Date()): boolean {
  return date.getHours() > 19;
}

(async () => {
  const today = new Date();

  const getNextDay = isTomorrow(today);

  if (getNextDay) {
    today.setDate(today.getDate() + 1);
  }

  const fetched = await fetch(`${BASE_URL}/dimibobs/${getYYYYMMDD(today)}`);
  const data = (await fetched.json()) as bob;

  const output =
    `${getNextDay ? "내일의 밥" : "오늘의 밥"}\n` +
    `아침🌅 ${data.breakfast}\n` +
    `점심🌞 ${data.lunch}\n` +
    `저녁🌃 ${data.dinner}`;

  const octokit = new Octokit({ auth: `token ${process.env.GH_TOKEN}` });
  const gist = await octokit.gists
    .get({ gist_id: process.env.GIST_ID! })
    .catch((e) => console.error("can't get gist. please check it's valid id."));
  if (!gist) return;

  const filename = Object.keys(gist.data.files)[0];
  await octokit.gists.update({
    gist_id: process.env.GIST_ID!,
    files: {
      [filename]: {
        filename: "dimibob",
        content: output,
      },
    },
  });
})();
