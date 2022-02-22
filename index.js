const { Bot } = require('grammy');
const { webhookCallback } = require("grammy");
const fetch = require('node-fetch');
const fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const express = require("express");


let bot;
if (process.env.NODE_ENV === 'production') {
    bot = new Bot(process.env.BOT_TOKEN);

    const port = process.env.PORT || 8443;
    const secretPath = String(process.env.BOT_TOKEN);
    const app = express();

    app.use(express.json());
    app.use(`/${secretPath}`, webhookCallback(bot, "express"));

    app.get('/', (req, res) => {
        res.status(200).json({ message: 'Hello from aqz89😳' });
    });

    app.listen(Number(port), async () => {
        console.log(`\n\nServer running on port ${port}.\n\n`);
        await bot.api.setWebhook(`https://${process.env.DOMAIN}/${secretPath}`);
    });
} else {
    bot = new Bot(require('./src/token'))

    bot.catch(err => console.error(err))

    bot.start();
}

//Вывод в консоль
async function idAndMessage(ctx, next) {
    try {
        if (ctx.message) console.log(`${ctx.from.first_name ? ctx.from.first_name : ctx.from.id}: ${ctx.message.text}`)
        else console.log(`${ctx.from.first_name ? ctx.from.first_name : ctx.from.id}: ${ctx.callbackQuery ? `(cbq)` + ctx.callbackQuery.data : "unknown"}`)
        await next();
    } catch (e) {
        console.log(e);
    }
}
bot.use(idAndMessage);

let link = "https://www.mrk-bsuir.by/files/bbb22.02.2022.pdf";

async function getTT(url) {
    const response = await fetch(url);
    const data = await response.text();

    const dom = new JSDOM(data);
    link = dom.window.document.getElementById("rasp").href;
}

getTT("https://www.mrk-bsuir.by/ru");

bot.command("timetable", async ctx => {
    return ctx.reply(`Последнее расписание: ${link}`);
});

setTimeout(async function check() {
    try {
        const response = await fetch("https://www.mrk-bsuir.by/ru");
        const data = await response.text();

        const dom = new JSDOM(data);
        const newlink = dom.window.document.getElementById("rasp").href;
        if (newlink == link);
        else {
            link = newlink;
            bot.api.sendMessage(977463270, `Расписание обновилось: ${link}`)
        }
    } catch (e) {
        console.log(e)
    }
    setTimeout(check, 300000)
}, 300000)









