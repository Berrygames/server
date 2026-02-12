import { buildEmbed } from "../helper/embed";

export default async function berryRemoveCommand(url: string, message: any) {
    const mentionedUser = message.mentions.users.first();
    const location = message.content.split(" ")[2] || "cash";
    const amount = parseInt(message.content.split(" ")[3] || "", 10) || 100; // Default to 100 if no amount provided

    if (!mentionedUser) {
        message.reply(
            buildEmbed({
                author: message.author,
                description: "Please mention a user to remove a berry from.",
                color: "#FF0000",
            }),
        );
    }

    if (location !== "cash" && location !== "bank") {
        message.reply(
            buildEmbed({
                author: message.author,
                description: "Please specify a valid location (cash or bank).",
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
                    "Please specify a valid amount of berries to remove.",
                color: "#FF0000",
            }),
        );
        return;
    }

    try {
        const res = await fetch(`${url}/berry/remove`, {
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
                description: `Removed ${amount} berries from ${mentionedUser.username}'s ${data.location}!\nThey now have ${data.newCount} berries in their ${data.location}.`,
                color: "#00FF00",
            }),
        );
    } catch (error) {
        console.error("Error removing berry:", error);
        message.reply(
            buildEmbed({
                author: message.author,
                description:
                    "An error occurred while trying to remove a berry.",
                color: "#FF0000",
            }),
        );
    }
}
