import { buildEmbed } from "../helper/embed";

export default async function collectCommand(
    url: string,
    message: any,
    client: any,
) {
    const userId = message.author.id;
    const guildId = message.guildId;
    try {
        // Get reward roles from backend
        const rest = await fetch(`${url}/role/income?guildId=${guildId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        // Get emoji
        const berryEmoji = client.application.emojis.cache.find(
            (e: any) => e.name === "berry",
        );
        const emojiString = berryEmoji ? `<:berry:${berryEmoji.id}>` : "🍓";

        const guild_roles = (await rest.json()) as any;

        // Get user's Discord roles
        const userRoles = message.member.roles.cache.map(
            (role: any) => role.id,
        );

        // Filter to roles user actually has
        const eligibleRoles = guild_roles.roles.filter((role: any) =>
            userRoles.includes(role.roleId),
        );

        if (eligibleRoles.length === 0) {
            message.reply(
                buildEmbed({
                    author: message.author,
                    description:
                        "You don't have any roles that generate income. Please acquire a role that generates income to use this command.",
                    color: "#FF0000",
                }),
            );
            return;
        }

        // Collect from eligible roles
        const results = [];
        let totalCollected = 0;

        for (const role of eligibleRoles) {
            const collectResponse = await fetch(`${url}/berry/collect`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    userId,
                    guildId,
                    roleDbId: role.id,
                }),
            });

            const result = (await collectResponse.json()) as any;

            results.push({ role, result });

            if (result.success) {
                totalCollected += role.amount;
            }
        }

        // Build response message
        const succesfulRoles = results.filter((r) => r.result.success);
        const failedRoles = results.filter((r) => !r.result.success);

        if (succesfulRoles.length === 0) {
            // All roles on cooldown
            const cooldownText = failedRoles
                .map(
                    (r, index) =>
                        `${index + 1}. <@&${r.role.roleId}> ${emojiString}${r.role.amount} ${r.result.nextCollectionTimestamp}`,
                )
                .join("\n");

            message.reply(
                buildEmbed({
                    author: message.author,
                    description: `All roles are on cooldown:\n${cooldownText}`,
                    color: "#FFA500",
                }),
            );
            return;
        }

        // Some/ all roles collected successfully
        const successText = succesfulRoles
            .map((r, index) => {
                return `${index + 1}. <@&${r.role.roleId}> | ${emojiString}${r.role.amount}`;
            })
            .join("\n");

        let description = successText;

        if (failedRoles.length > 0) {
            const cooldownText = failedRoles
                .map(
                    (r) =>
                        `${succesfulRoles.length + 1}. <@&${r.role.roleId}> ${emojiString}${r.role.amount} ${r.result.nextCollectionTimestamp}`,
                )
                .join("\n");
            description += `\n${cooldownText}`;
        }

        message.reply(
            buildEmbed({
                author: message.author,
                description,
                color: "#00FF00",
                footer: `New total: ${succesfulRoles[0]?.result.newCount} berries`,
            }),
        );
    } catch (error) {
        console.error("Error collecting role income:", error);
        message.reply(
            buildEmbed({
                author: message.author,
                description:
                    "Failed to collect berries. Please try again later.",
                color: "#FF0000",
            }),
        );
    }
}
