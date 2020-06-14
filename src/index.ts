import fetch from "node-fetch";

const BASE_URL = "https://api.dimigo.in";

function getYYYYMMDD(date: Date): string {
  let mm = date.getMonth() + 1;
  let dd = date.getDate();

  return `${date.getFullYear()}${mm < 10 ? "0" + mm : mm}${
    dd < 10 ? "0" + dd : dd
  }`;
}

(async () => {
  const today = new Date();
  const data = await fetch(`${BASE_URL}/dimibobs/${getYYYYMMDD(today)}`);
  const jsonData = await data.json();
})();
