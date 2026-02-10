import "dotenv";

export default async function registerCommands(appId: string, commands: any) {
    const url = `https://discord.com/api/v10/applications/${appId}/guilds/${process.env.GUILD_ID}/commands`;

    try {
        const res = await fetch(url, {
            headers: {
                Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
                "Content-Type": "application/json; charset=UTF-8",
            },
            method: "PUT",
            body: JSON.stringify(commands),
        });
        console.log("body: ", commands);
        console.log("Commands registered:", await res.json());
    } catch (err) {
        console.error("Error registering commands:", err);
    }
}
