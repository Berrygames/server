import { buildEmbed } from "../helper/embed";

export default async function getBerryCommand(
    url: string,
    message: any,
    client: any,
) {
    const userId = message.mentions.users.first()?.id || message.author.id;
    console.log("Checking ", userId, "'s balance.");
    const res = fetch(
        `${url}/berry?userId=${userId}&guildId=${message.guildId}`,
    );
    const data = (await res.then((res) => res.json())) as any;

    // Get emoji
    const berryEmoji = client.application.emojis.cache.find(
        (e: any) => e.name === "berry",
    );
    const emojiString = berryEmoji ? `<:berry:${berryEmoji.id}>` : "🍓";

    const fields = [
        {
            name: "Cash:",
            value: `${emojiString}${data.berriesCash}`,
            inline: false,
        },

        {
            name: "Bank:",
            value: `${emojiString}${data.berriesBank}`,
            inline: false,
        },

        {
            name: "Total:",
            value: `${emojiString}${data.berriesCash + data.berriesBank}`,
            inline: false,
        },
    ];

    message.reply(
        buildEmbed({
            author: message.author,
            fields,
            color: "#FFAC1C",
        }),
    );
}
