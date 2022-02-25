const { Bot } = require('grammy');
const { webhookCallback } = require("grammy");
const fetch = require('node-fetch');
const fs = require('fs');
const jsdom = require("jsdom");
const path = require('path');
const { JSDOM } = jsdom;
const pdfConverter = require("pdf-poppler");

function convertImage(pdfPath) {
    let option = {
        format: 'jpeg',
        out_dir: './ttpics',
        out_prefix: path.basename(pdfPath, path.extname(pdfPath)),
        page: 0
    }
    pdfConverter.convert(pdfPath, option)
        .then(() => {
            console.log('file converted')
        })
        .catch(err => {
            console.log('an error has occurred in the pdf converter ' + err)
        })
}

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
    const link = dom.window.document.getElementById("rasp").href;
    return link;
}
link = getTT("https://www.mrk-bsuir.by/ru");

setTimeout(async function check() {
    try {
        const newlink = getTT("https://www.mrk-bsuir.by/ru");
        if (newlink != await link) {
            link = newlink;
            bot.api.sendMessage(977463270, `Расписание обновилось`)

            const response = await fetch(link);
            const data = await response.buffer();
            fs.writeFileSync("rasp.pdf", data);

            //bot.api.sendDocument(977463270, "https://www.mrk-bsuir.by/files/7726.02.2022.pdf")

        }
    } catch (e) {
        console.log(e)
    }
    setTimeout(check, 300000)
}, 300000)

bot.command("timetable", async ctx => {
    return ctx.replyWithDocument(await link);
});

/*bot.command("get", async ctx => {
    console.log("oh")
    ctx.replyWithPhoto(977463270, "./ttpics/rasp-3.jpg");
});*/







