import fetch from "node-fetch";

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

(async () => {
  const today = new Date();
  const fetched = await fetch(`${BASE_URL}/dimibobs/${getYYYYMMDD(today)}`);
  const data = (await fetched.json()) as bob;

  console.log(
    `아침🌅 ${data.breakfast}\n점심🌞 ${data.lunch}\n저녁🌃 ${data.dinner}`
  );
})();
