import { buildEmbed } from "../helper/embed";

export default async function berryLeaderboardCommand(
    url: string,
    message: any,
) {
    const res = await fetch(
        `${url}/berry/leaderboard?guildId=${message.guildId}&limit=10`,
    );

    const data = (await res.json()) as any;

    if (!data || !data.leaderboard || data.leaderboard.length === 0) {
        message.reply(
            buildEmbed({
                author: message.author,
                description: "The leaderboard is empty!",
                color: "#FF0000",
            }),
        );
        return;
    }

    const leaderboardText = data.leaderboard
        .map(
            (entry: any, index: number) =>
                `${index + 1}. <@${entry.userId}> - ${entry.count} berries`,
        )
        .join("\n");

    message.reply(
        buildEmbed({
            author: message.author,
            description: `Berry Leaderboard:\n${leaderboardText}`,
            color: "#FFAC1C",
        }),
    );
}
