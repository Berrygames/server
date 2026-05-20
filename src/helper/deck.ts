const SUITS = ['♠️', '♥️', '♦️', '♣️'];
const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
function getValue(rank: string): number {
    if (['J', 'Q', 'K'].includes(rank)) return 10;
    if (rank === 'A') return 11;
    return parseInt(rank);
}
export function getHandValue(hand: Card[]): number {
    let total = hand.reduce((sum, card) => sum + card.value, 0);
    let aces = hand.filter(card => card.rank === 'A').length;
    
    while (total > 21 && aces > 0) {
        total -= 10;
        aces--;
    }
    
    return total;
}

export type Card = {
    rank: string;
    suit: string;
    value: number;
}

export class Deck {
    private cards: Card[];

    constructor(numDecks: number = 1) {
        this.cards = [];

        for (let d = 0; d < numDecks; d++) {
            for (const suit of SUITS) {
                for (const rank of RANKS) {
                    this.cards.push({
                        rank,
                        suit,
                        value: getValue(rank)
                    })
                }
            }
        }

        this.shuffle()
    }

    draw(): Card {
        if (this.cards.length === 0) {
            this.shuffle()
        }
        return this.cards.pop()!
    }

    shuffle(): void {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j: number = Math.floor(Math.random() * (i + 1)) as number
            [this.cards[i]!, this.cards[j]!] = [this.cards[j]!, this.cards[i]!]
        }
    }

    get remaining(): number {
        return this.cards.length
    }

}