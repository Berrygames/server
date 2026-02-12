import { buildEmbed } from "../helper/embed";

export default async function getBerryCommand(
    url: string,
    message: any,
    client: any,
) {
    const res = fetch(
        `${url}/berry/${message.author.id}?guildId=${message.guildId}`,
    );
    const data = (await res.then((res) => res.json())) as any;

    // Get emoji
    const berryEmoji = client.application.emojis.cache.find(
        (e: any) => e.name === "berry",
    );
    const emojiString = berryEmoji ? `<:berry:${berryEmoji.id}>` : "🍓";

    message.reply(
        buildEmbed({
            author: message.author,
            description: `${emojiString} You have **${data.berries}** berry!`,
            color: "#FFAC1C",
        }),
    );
}
