const { Bot } = require('grammy');
const { webhookCallback } = require("grammy");
const fetch = require('node-fetch');

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

bot.command("photo", async ctx => {
    const response = await fetch("https://aws.random.cat/meow");
    const data = await response.json();
    return ctx.replyWithPhoto(data.file);
});









