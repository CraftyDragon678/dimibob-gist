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
function getYYYYMMDD(date) {
    let mm = date.getMonth() + 1;
    let dd = date.getDate();
    return `${date.getFullYear()}${mm < 10 ? "0" + mm : mm}${dd < 10 ? "0" + dd : dd}`;
}
function isTomorrow(date) {
    return date.getHours() > 19;
}
(() => __awaiter(void 0, void 0, void 0, function* () {
    const today = new Date();
    const getNextDay = isTomorrow(today);
    if (getNextDay) {
        today.setDate(today.getDate() + 1);
    }
    const fetched = yield node_fetch_1.default(`${BASE_URL}/dimibobs/${getYYYYMMDD(today)}`);
    const data = (yield fetched.json());
    const output = `${getNextDay ? "내일의 밥" : "오늘의 밥"}\n` +
        `아침🌅 ${data.breakfast}\n` +
        `점심🌞 ${data.lunch}\n` +
        `저녁🌃 ${data.dinner}`;
    const octokit = new rest_1.Octokit({ auth: `token ${process.env.GH_TOKEN}` });
    const gist = yield octokit.gists
        .get({ gist_id: process.env.GIST_ID })
        .catch((e) => console.error("can't get gist. please check it's valid id."));
    if (!gist)
        return;
    const filename = Object.keys(gist.data.files)[0];
    yield octokit.gists.update({
        gist_id: process.env.GIST_ID,
        files: {
            [filename]: {
                filename: "dimibob",
                content: output,
            },
        },
    });
}))();
