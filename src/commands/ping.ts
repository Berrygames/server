export default async function pingCommand(message: any) {
    const sent = await message.reply("Pinging...");
    const ping = sent.createdTimestamp - message.createdTimestamp;

    sent.edit(`Pong! Latency: ${ping}ms`);
}
