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

enum Meal {
  breakfast = "아침🌅",
  lunch = "점심🌞",
  dinner = "저녁🌃",
}

function getYYYYMMDD(date: Date = new Date()): string {
  let mm = date.getMonth() + 1;
  let dd = date.getDate();

  return `${date.getFullYear()}${mm < 10 ? "0" + mm : mm}${
    dd < 10 ? "0" + dd : dd
  }`;
}

function isTomorrow(date: Date = new Date()): boolean {
  return date.getHours() * 100 + date.getMinutes() > 1920;
}

function getMeal(date: Date = new Date()): Meal {
  const time = date.getHours() * 100 + date.getMinutes();

  if (816 <= time && time <= 1340) return Meal.lunch;
  else if (time <= 1920) return Meal.dinner;

  return Meal.breakfast;
}

function seperateLine(
  str: string,
  width: number = 35,
  char: string = "/"
): string {
  const arr = str.split(char);
  let result = "";
  let start = 0;

  for (let i = 0; i < 4; ++i) {
    for (let end = start; end <= arr.length; ++end) {
      const currentLine = arr.slice(start, end).join(char);
      if (currentLine.length > width || end === arr.length) {
        start = end;
        result += currentLine;
        break;
      }
    }
    result += "\n";
  }

  return result.trim();
}

(async () => {
  const datetime = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Seoul" })
  );

  const getNextDay = isTomorrow(datetime);

  if (getNextDay) {
    datetime.setDate(datetime.getDate() + 1);
  }

  const fetched = await fetch(`${BASE_URL}/dimibobs/${getYYYYMMDD(datetime)}`);
  const data = (await fetched.json()) as bob;
  const meal = getMeal(datetime);

  const content = seperateLine(
    meal === Meal.breakfast
      ? data.breakfast
      : meal === Meal.lunch
      ? data.lunch
      : data.dinner
  );

  const title = `${getNextDay ? "내일의 밥" : "오늘의 밥"} - ${meal}`;

  const octokit = new Octokit({ auth: `token ${process.env.GH_TOKEN}` });
  const gist = await octokit.gists
    .get({ gist_id: process.env.GIST_ID! })
    .catch((e) => console.error("can't get gist. please check it's valid id."));
  if (!gist) return;

  const filename = Object.keys(gist.data.files)[0];
  await octokit.gists
    .update({
      gist_id: process.env.GIST_ID!,
      files: {
        [filename]: {
          filename: title,
          content: content,
        },
      },
    })
    .catch((e) => console.error("can't update gist"));
})();
