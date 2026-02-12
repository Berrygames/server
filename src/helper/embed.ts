import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    type ColorResolvable,
} from "discord.js";

interface EmbedButton {
    customId: string;
    label: string;
    style: ButtonStyle;
}

interface BuildEmbedOptions {
    author: any; // Discord message.author object
    description: string;
    color?: ColorResolvable;
    buttons?: EmbedButton[];
    title?: string;
    footer?: string;
}

export function buildEmbed(options: BuildEmbedOptions) {
    const {
        author,
        description,
        color = "#FF0000",
        buttons = [],
        title,
        footer,
    } = options;

    const embed = new EmbedBuilder()
        .setColor(color)
        .setAuthor({
            name: author.username,
            iconURL: author.displayAvatarURL(),
        })
        .setDescription(description)
        .setTimestamp();

    if (title) embed.setTitle(title);
    if (footer) embed.setFooter({ text: footer });

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
