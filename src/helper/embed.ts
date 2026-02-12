import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    User,
    type ColorResolvable,
} from "discord.js";

interface EmbedButton {
    customId: string;
    label: string;
    style: ButtonStyle;
}

interface BuildEmbedOptions {
    author: User;
    description?: string;
    color?: ColorResolvable;
    buttons?: EmbedButton[];
    title?: string;
    footer?: string;
    fields?: { name: string; value: string; inline?: boolean }[];
}

export function buildEmbed(options: BuildEmbedOptions) {
    const {
        author,
        description,
        color = "#FF0000",
        buttons = [],
        title,
        footer,
        fields,
    } = options;

    const embed = new EmbedBuilder()
        .setColor(color)
        .setAuthor({
            name: author.username,
            iconURL: author.displayAvatarURL(),
        })
        .setTimestamp();

    if (description) embed.setDescription(description);
    if (title) embed.setTitle(title);
    if (footer) embed.setFooter({ text: footer });
    if (fields) embed.addFields(fields);

    const components = [];
    if (buttons.length > 0) {
        const row = new ActionRowBuilder<ButtonBuilder>();

        for (const button of buttons) {
            row.addComponents(
                new ButtonBuilder()
                    .setCustomId(button.customId)
                    .setLabel(button.label)
                    .setStyle(button.style || ButtonStyle.Primary),
            );
        }
        components.push(row);
    }

    return { embeds: [embed], components };
}
