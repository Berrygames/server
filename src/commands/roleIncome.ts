import { buildEmbed } from "../helper/embed";

export default async function roleIncomeCommand(
    url: string,
    message: any,
    client: any,
) {
    const berryEmoji = client.application.emojis.cache.find(
        (e: any) => e.name === "berry",
    );
    const emojiString = berryEmoji ? `<:berry:${berryEmoji.id}>` : " ";

    if (!message.member.permissions.has("MANAGE_ROLES")) {
        message.reply(
            buildEmbed({
                author: message.author,
                title: "Permission Denied",
                description: "You do not have permission to manage roles.",
                color: "#FF0000",
            }),
        );
        return;
    }

    if (message.content.split(" ").length < 2) {
        message.reply(
            buildEmbed({
                author: message.author,
                title: "Invalid Command",
                description:
                    "Usage: `role-income <add | remove | list> @role [amount] [interval]`",
                color: "#FF0000",
            }),
        );
        return;
    }

    const method = message.content.split(" ")[1];

    if (method === "list") {
        try {
            const res = await fetch(
                `${url}/role/income?guildId=${message.guildId}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                },
            );

            const data = (await res.json()) as any;
            console.log("Fetched role income list:", data);

            message.reply(
                buildEmbed({
                    author: message.author,
                    title: "Role Income List",
                    description: data.roles
                        .map(
                            (role: any, index: number) =>
                                `${index + 1}. <@&${role.roleId}> | ${emojiString}${role.amount} every ${role.interval}h`,
                        )
                        .join("\n"),
                    color: "#FFAC1C",
                }),
            );
        } catch (error) {
            console.error("Error fetching role income list:", error);
            message.reply(
                buildEmbed({
                    author: message.author,
                    title: "Error",
                    description:
                        "An error occurred while fetching the role income list.",
                    color: "#FF0000",
                }),
            );
        }
    } else if (method === "remove") {
        try {
            const roleMention = message.mentions.roles.first();

            const res = await fetch(`${url}/role/income`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    method: "remove",
                    guildId: message.guildId,
                    roleId: roleMention.id,
                }),
            });

            const data = (await res.json()) as any;
            console.log("Removed role income:", data);

            message.reply(
                buildEmbed({
                    author: message.author,
                    title: "Role Income Removed",
                    description: `Removed role income for <@&${roleMention.id}>.`,
                    color: "#00FF00",
                }),
            );
        } catch (error) {
            console.error("Error removing role income:", error);
            message.reply(
                buildEmbed({
                    author: message.author,
                    title: "Error",
                    description:
                        "An error occurred while removing the role income.",
                    color: "#FF0000",
                }),
            );
        }
    } else if (method === "add") {
        try {
            const roleMention = message.mentions.roles.first();
            const amount = parseInt(message.content.split(" ")[3] || "", 10);
            const interval = parseInt(message.content.split(" ")[4] || "", 10);

            if (isNaN(amount) || isNaN(interval)) {
                message.reply(
                    buildEmbed({
                        author: message.author,
                        title: "Invalid Command",
                        description:
                            "Amount and interval must be valid numbers.",
                        color: "#FF0000",
                    }),
                );
                return;
            }

            const res = await fetch(`${url}/role/income`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    method: "add",
                    guildId: message.guildId,
                    roleId: roleMention.id,
                    amount: amount,
                    interval: interval,
                }),
            });
            const data = (await res.json()) as any;
            console.log("Added role income:", data);

            message.reply(
                buildEmbed({
                    author: message.author,
                    title: "Role Income Added",
                    description: `Added role income for <@&${roleMention.id}>: ${emojiString}${amount} every ${interval}h.`,
                    color: "#00FF00",
                }),
            );
        } catch (error) {
            console.error("Error adding role income:", error);
            message.reply(
                buildEmbed({
                    author: message.author,
                    title: "Error",
                    description:
                        "An error occurred while adding the role income.",
                    color: "#FF0000",
                }),
            );
        }
    }
}
