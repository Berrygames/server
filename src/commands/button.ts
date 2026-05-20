import { ButtonStyle, ComponentType } from "discord.js";
import { buildEmbed } from "../helper/embed";

export default async function button(url: string, message: any, client: any) {
      const embedData = buildEmbed({
            author: message.author,
            title: "Button Command",
            color: "#FF0000",
            description: `This is a button command! You have ${Math.floor(Math.random() * 100)}.`,
            buttons: [
                  {
                        label: "Click Me",
                        customId: "button_click",
                        style: ButtonStyle.Primary,
                  },
            ],
      });

      await message.reply({ ...embedData });
}
