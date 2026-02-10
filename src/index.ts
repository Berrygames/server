import "dotenv/config";
import express from "express";
import { Client, GatewayIntentBits, InteractionType } from "discord.js";

const app = express();
const PORT = process.env.PORT || 3000;

const API_URL = "http://localhost:8787"; // or your ngrok URL

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

client.on("clientReady", () => {
    console.log(`Logged in as ${client.user?.tag}!`);
});

client.on("messageCreate", async (message) => {
    if (message.content === "?berry") {
        const res = fetch(
            `${API_URL}/berry/${message.author.id}?guildId=${message.guildId}`,
        );
        const data = await res.then((res) => res.json());
        message.reply(`You have ${data.berries} berries!`);
    }

    if (message.content.startsWith("?giveberry")) {
        const mentionedUser = message.mentions.users.first();

        if (!mentionedUser) {
            message.reply("Please mention a user to give a berry to.");
            return;
        }
        console.log(
            `Giving berry to ${mentionedUser.username} (${mentionedUser.id}) in guild ${message.guildId}`,
        );

        try {
            const res = await fetch(`${API_URL}/berry/give`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    toUserId: mentionedUser.id,
                    guildId: message.guildId,
                    amount: 100,
                }),
            });

            const data = await res.json();
            console.log(data);
            message.reply(
                `Gave 100 berries to ${mentionedUser.username}! They now have ${data.newCount} berries.`,
            );
        } catch (error) {
            console.error("Error giving berry:", error);
            message.reply("An error occurred while trying to give a berry.");
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
