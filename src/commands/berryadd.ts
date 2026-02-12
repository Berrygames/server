import { buildEmbed } from "../helper/embed";

export default async function berryAddCommand(url: string, message: any) {
    const mentionedUser = message.mentions.users.first();
    const location = message.content.split(" ")[2] || "cash";
    const amount = parseInt(message.content.split(" ")[3] || "", 10) || 100;

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
                location,
                amount: amount,
            }),
        });

        const data = (await res.json()) as any;
        message.reply(
            buildEmbed({
                author: message.author,
                description: `Gave ${amount} berries to ${mentionedUser.username}'s ${data.location}!\nThey now have ${data.newCount} berries in their ${data.location}.`,
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
