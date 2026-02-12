import { buildEmbed } from "../helper/embed";

export default async function berryAddCommand(url: string, message: any) {
    const mentionedUser = message.mentions.users.first();
    const amount = parseInt(message.content.split(" ")[2] || "", 10) || 100; // Default to 100 if no amount provided

    if (!mentionedUser) {
        message.reply(
            buildEmbed({
                author: message.author,
                description: "Please mention a user to give a berry to.",
                color: "#FF0000",
            }),
        );
        return;
    }

    if (amount <= 0) {
        message.reply(
            buildEmbed({
                author: message.author,
                description:
                    "Please specify a valid amount of berries to give.",
                color: "#FF0000",
            }),
        );
        return;
    }

    try {
        const res = await fetch(`${url}/berry/add`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                toUserId: mentionedUser.id,
                guildId: message.guildId,
                amount: amount,
            }),
        });

        const data = (await res.json()) as any;
        message.reply(
            buildEmbed({
                author: message.author,
                description: `Gave ${amount} berries to ${mentionedUser.username}! They now have ${data.newCount} berries.`,
                color: "#00FF00",
            }),
        );
    } catch (error) {
        console.error("Error giving berry:", error);
        message.reply(
            buildEmbed({
                author: message.author,
                description: "An error occurred while trying to give a berry.",
                color: "#FF0000",
            }),
        );
    }
}
