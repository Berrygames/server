import "dotenv/config";
import express from "express";
import { Client, GatewayIntentBits, InteractionType } from "discord.js";
import getBerryCommand from "./commands/berry";
import berryLeaderboardCommand from "./commands/berryleaderboard";
import berryRemoveCommand from "./commands/berryremove";
import pingCommand from "./commands/ping";
import { fetch } from "bun";
import berryAddCommand from "./commands/berryadd";
import roleIncomeCommand from "./commands/roleIncome";
import collectCommand from "./commands/collect";
import withdraw from "./commands/withdraw";
import deposit from "./commands/deposit";
import { commands } from "./helper/commands";

const API_URL = "http://localhost:8787";

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

client.on("clientReady", async () => {
    console.log(`Logged in as ${client.user?.tag}!`);

    try {
        const emojis = await client.application?.emojis.fetch();
        const existingEmoji = emojis?.find((emoji) => emoji.name === "berry");

        if (!existingEmoji) {
            const filepath = "assets/berry.png";
            console.log("Full path:", `${process.cwd()}/${filepath}`);
            console.log("File exists:", await Bun.file(filepath).exists());

            const file = Bun.file(filepath);
            const arrayBuffer = await file.arrayBuffer();
            const base64Image = `data:image/png;base64,${Buffer.from(arrayBuffer).toString("base64")}`;

            const response = await fetch(
                `https://discord.com/api/v10/applications/${client.application?.id}/emojis`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        name: "berry",
                        image: base64Image,
                    }),
                },
            );
            const result = await response.json();
            console.log("✅ Created application emoji:", result);
        } else {
            console.log(
                "✅ Application emoji already exists:",
                existingEmoji.id,
            );
        }
    } catch (error) {
        console.error("❌ Error creating application emoji:", error);
    }
});

client.on("messageCreate", async (message) => {
    if (message.author.bot) return;

    if (message.content === "?ping") {
        pingCommand(message);
    }

    /*
        ---------------
        ADMIN COMMANDS
        ---------------
    */
    if (
        message.content.startsWith("?berryadd") ||
        message.content.startsWith("?ba")
    ) {
        berryAddCommand(API_URL, message);
    } else if (
        message.content.startsWith("?berryremove") ||
        message.content.startsWith("?br")
    ) {
        berryRemoveCommand(API_URL, message);
    } else if (message.content.startsWith("?role-income")) {
        roleIncomeCommand(API_URL, message, client);
    }

    /*
        --------------
        USER COMMANDS
        --------------
    */
    // berry leaderboard
    else if (
        commands["leaderboard"].commands.some((cmd) =>
            message.content.startsWith(cmd),
        )
    ) {
        berryLeaderboardCommand(API_URL, message);
    }

    // collect
    else if (
        commands["collect"].commands.some((cmd) =>
            message.content.startsWith(cmd),
        )
    ) {
        collectCommand(API_URL, message, client);
    }

    // withdraw
    else if (
        commands["withdraw"].commands.some((cmd) =>
            message.content.startsWith(cmd),
        )
    ) {
        withdraw(API_URL, message, client);
    }

    // deposit
    else if (
        commands["deposit"].commands.some((cmd) =>
            message.content.startsWith(cmd),
        )
    ) {
        deposit(API_URL, message, client);
    }

    // balance
    else if (
        commands["balance"].commands.some((cmd) =>
            message.content.startsWith(cmd),
        )
    ) {
        getBerryCommand(API_URL, message, client);
    }
});

client.login(process.env.DISCORD_TOKEN);
