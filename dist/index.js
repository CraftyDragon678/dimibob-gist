"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_fetch_1 = __importDefault(require("node-fetch"));
const path_1 = require("path");
const dotenv_1 = require("dotenv");
const rest_1 = require("@octokit/rest");
dotenv_1.config({ path: path_1.resolve(__dirname, "../.env") });
const BASE_URL = "https://api.dimigo.in";
var Meal;
(function (Meal) {
    Meal["breakfast"] = "\uC544\uCE68\uD83C\uDF05";
    Meal["lunch"] = "\uC810\uC2EC\uD83C\uDF1E";
    Meal["dinner"] = "\uC800\uB141\uD83C\uDF03";
})(Meal || (Meal = {}));
function getYYYYMMDD(date = new Date()) {
    let mm = date.getMonth() + 1;
    let dd = date.getDate();
    return `${date.getFullYear()}${mm < 10 ? "0" + mm : mm}${dd < 10 ? "0" + dd : dd}`;
}
function isTomorrow(date = new Date()) {
    return date.getHours() > 19;
}
function getMeal(date = new Date()) {
    const time = date.getHours() * 100 + date.getMinutes();
    if (816 <= time && time <= 1340)
        return Meal.lunch;
    else if (time <= 1920)
        return Meal.dinner;
    return Meal.breakfast;
}
function seperateLine(str, width = 35, char = "/") {
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
(() => __awaiter(void 0, void 0, void 0, function* () {
    const datetime = new Date();
    const getNextDay = isTomorrow(datetime);
    if (getNextDay) {
        datetime.setDate(datetime.getDate() + 1);
    }
    const fetched = yield node_fetch_1.default(`${BASE_URL}/dimibobs/${getYYYYMMDD(datetime)}`);
    const data = (yield fetched.json());
    const meal = getMeal(datetime);
    const content = seperateLine(meal === Meal.breakfast
        ? data.breakfast
        : meal === Meal.lunch
            ? data.lunch
            : data.dinner);
    const title = `${getNextDay ? "내일의 밥" : "오늘의 밥"} - ${meal}`;
    const octokit = new rest_1.Octokit({ auth: `token ${process.env.GH_TOKEN}` });
    const gist = yield octokit.gists
        .get({ gist_id: process.env.GIST_ID })
        .catch((e) => console.error("can't get gist. please check it's valid id."));
    if (!gist)
        return;
    const filename = Object.keys(gist.data.files)[0];
    yield octokit.gists
        .update({
        gist_id: process.env.GIST_ID,
        files: {
            [filename]: {
                filename: title,
                content: content,
            },
        },
    })
        .catch((e) => console.error("can't update gist"));
}))();
