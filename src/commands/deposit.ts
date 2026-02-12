import { buildEmbed } from "../helper/embed";
import { parseAmount } from "../helper/parseAmount";

export default async function deposit(url: string, message: any, client: any) {
    const input = message.content.split(" ")[1] || "";

    // Get emoji
    const berryEmoji = client.application.emojis.cache.find(
        (e: any) => e.name === "berry",
    );
    const emojiString = berryEmoji ? `<:berry:${berryEmoji.id}>` : "🍓";

    try {
        // Fetch user's current balance
        const balanceResponse = await fetch(
            `${url}/berry/${message.author.id}?guildId=${message.guild.id}`,
        );
        const balanceData = (await balanceResponse.json()) as any;

        if (!balanceResponse.ok || !balanceData.success) {
            message.reply(
                buildEmbed({
                    author: message.author,
                    description: "Could not fetch your balance.",
                    color: "#FF0000",
                }),
            );
            return;
        }

        const cashBalance = balanceData.berriesCash || 0;

        const result = parseAmount({
            input,
            balance: cashBalance,
            commandName: "deposit",
        });
        if (!result.success) {
            message.reply(
                buildEmbed({
                    author: message.author,
                    description: result.error,
                    color: "#FF0000",
                }),
            );
            return;
        }

        // Proceed with deposit
        const response = await fetch(`${url}/berry/deposit`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                guildId: message.guild.id,
                userId: message.author.id,
                amount: result.amount,
            }),
        });
        const data = (await response.json()) as any;

        if (!response.ok || !data.success) {
            message.reply(
                buildEmbed({
                    author: message.author,
                    description: "Failed to deposit berries.",
                    color: "#FF0000",
                }),
            );
            return;
        }

        message.reply(
            buildEmbed({
                author: message.author,
                description: `✅ Deposited ${emojiString}${result.amount?.toLocaleString()} to your bank!`,
                color: "#00FF00",
            }),
        );
    } catch (error) {
        console.error("Error depositing berries:", error);
        message.reply(
            buildEmbed({
                author: message.author,
                description:
                    "An error occurred while trying to deposit berries.",
                color: "#FF0000",
            }),
        );
    }
}
