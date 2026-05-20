import { ButtonStyle, ComponentType } from "discord.js";
import { Deck, getHandValue, type Card } from "../helper/deck";
import { buildEmbed } from "../helper/embed";
import { activeGames } from "..";

const sharedDeck = new Deck(3);
export { sharedDeck };

function formatHand(hand: Card[]): string {
    return hand.map((card) => `${card.rank}${card.suit}`).join(" ");
}

export default async function blackjack(
    url: string,
    message: any,
    client: any,
) {
    let input = message.content.split(" ")[1] as string;

    // Get emoji
    const berryEmoji = client.application.emojis.cache.find(
        (e: any) => e.name === "berry",
    );
    const emojiString = berryEmoji ? `<:berry:${berryEmoji.id}>` : "🍓";

    try {
        const balanceResponse = await fetch(
            `${url}/berry?userId=${message.author.id}&guildId=${message.guild.id}`,
        );
        const balanceData = (await balanceResponse.json()) as any;

        if (!balanceResponse.ok || !balanceData.success) {
            message.reply("Could not fetch your balance.");
            return;
        }

        let bet = input === "all" ? balanceData.berriesCash : parseInt(input);

        if (isNaN(bet) || bet <= 0) {
            message.reply("Please provide a valid bet amount.");
            return;
        }

        if (balanceData.berriesCash < bet) {
            message.reply(
                `You don't have enough ${emojiString} to place that bet.`,
            );
            return;
        }

        const deductResponse = await fetch(`${url}/berry/remove`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                toUserId: message.author.id,
                guildId: message.guild.id,
                location: "cash",
                amount: bet,
            }),
        });
        const deductData = (await deductResponse.json()) as any;

        if (!deductResponse.ok || !deductData.success) {
            message.reply("Could not deduct your bet.");
            return;
        }

        const state = {
            playerHand: [sharedDeck.draw(), sharedDeck.draw()],
            dealerHand: [sharedDeck.draw(), sharedDeck.draw()],
            bet,
            done: false,
        };

        const embedData = buildEmbed({
            author: message.author,
            title: "Blackjack",
            color: "#FFAC1C",
            fields: [
                {
                    name: "Your hand",
                    value: `${formatHand(state.playerHand)} (${getHandValue(state.playerHand)})`,
                },
                {
                    name: "Dealer Hand",
                    value: `${state.dealerHand[0]?.rank}${state.dealerHand[0]?.suit} 🂠`,
                },
                { name: "Bet", value: `${bet} ${emojiString}` },
            ],
            buttons: [
                {
                    customId: "bj_hit",
                    label: "Hit",
                    style: ButtonStyle.Primary,
                },
                { customId: "bj_stand", label: "Stand", style: 1 },
                { customId: "bj_double", label: "Double", style: 1 },
            ],
        });

        const sentMessage = await message.reply({ ...embedData });

        activeGames.set(sentMessage.id, async (interaction: any) => {
            if (state.done) {
                await interaction.deferUpdate();
                return;
            }

            if (interaction.customId === "bj_hit") {
                state.playerHand.push(sharedDeck.draw());
                const value = getHandValue(state.playerHand);

                if (value > 21) {
                    state.done = true;
                    activeGames.delete(sentMessage.id);
                    await interaction.update(
                        buildEmbed({
                            author: message.author,
                            title: "Blackjack — Bust!",
                            color: "#FF0000",
                            fields: [
                                {
                                    name: "Your Hand",
                                    value: `${formatHand(state.playerHand)} (${value})`,
                                },
                                {
                                    name: "Dealer Hand",
                                    value: `${formatHand(state.dealerHand)} (${getHandValue(state.dealerHand)})`,
                                },
                                {
                                    name: "Result",
                                    value: `You busted! Lost ${state.bet} ${emojiString}`,
                                },
                            ],
                        }),
                    );
                } else {
                    await interaction.update(
                        buildEmbed({
                            author: message.author,
                            title: "Blackjack",
                            color: "#FFAC1C",
                            fields: [
                                {
                                    name: "Your Hand",
                                    value: `${formatHand(state.playerHand)} (${value})`,
                                },
                                {
                                    name: "Dealer Hand",
                                    value: `${state.dealerHand[0]?.rank}${state.dealerHand[0]?.suit} 🂠`,
                                },
                                {
                                    name: "Bet",
                                    value: `${state.bet} ${emojiString}`,
                                },
                            ],
                            buttons: [
                                {
                                    customId: "bj_hit",
                                    label: "Hit",
                                    style: ButtonStyle.Primary,
                                },
                                {
                                    customId: "bj_stand",
                                    label: "Stand",
                                    style: 1,
                                },
                            ],
                        }),
                    );
                }
            } else if (
                interaction.customId === "bj_stand" ||
                interaction.customId === "bj_double"
            ) {
                if (interaction.customId === "bj_double") {
                    // deduct extra bet
                    await fetch(`${url}/berry/remove`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            toUserId: message.author.id,
                            guildId: message.guild.id,
                            location: "cash",
                            amount: state.bet,
                        }),
                    });
                    state.bet *= 2;
                    state.playerHand.push(sharedDeck.draw());
                }

                // dealer plays out
                while (getHandValue(state.dealerHand) < 17) {
                    state.dealerHand.push(sharedDeck.draw());
                }

                const playerValue = getHandValue(state.playerHand);
                const dealerValue = getHandValue(state.dealerHand);
                state.done = true;
                activeGames.delete(sentMessage.id);

                let resultText: string;
                let payout = 0;

                if (playerValue > 21) {
                    resultText = `You busted! Lost ${state.bet} ${emojiString}`;
                } else if (dealerValue > 21 || playerValue > dealerValue) {
                    payout = state.bet * 2;
                    resultText = `You won ${state.bet} ${emojiString}!`;
                } else if (playerValue === dealerValue) {
                    payout = state.bet; // push, return bet
                    resultText = `Push! Bet returned.`;
                } else {
                    resultText = `Dealer wins! Lost ${state.bet} ${emojiString}`;
                }

                if (payout > 0) {
                    await fetch(`${url}/berry/add`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            toUserId: message.author.id,
                            guildId: message.guild.id,
                            location: "cash",
                            amount: payout,
                        }),
                    });
                }

                await interaction.update(
                    buildEmbed({
                        author: message.author,
                        title: "Blackjack — Result",
                        color:
                            payout > state.bet
                                ? "#00FF00"
                                : payout === state.bet
                                  ? "#FFFF00"
                                  : "#FF0000",
                        fields: [
                            {
                                name: "Your Hand",
                                value: `${formatHand(state.playerHand)} (${playerValue})`,
                            },
                            {
                                name: "Dealer Hand",
                                value: `${formatHand(state.dealerHand)} (${dealerValue})`,
                            },
                            { name: "Result", value: resultText },
                        ],
                    }),
                );
            }
        });

        // clean up when game ends
        setTimeout(() => {
            activeGames.delete(sentMessage.id);
        }, 120_000); // 2 minute timeout for the game
    } catch (err) {
        console.error("Error playing blackjack:", err);
        message.reply(
            buildEmbed({
                author: message.author,
                description:
                    "An error occurred while trying to play blackjack.",
                color: "#FF0000",
            }),
        );
    }
}
