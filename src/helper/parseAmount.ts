interface ParseAmountOptions {
    input: string;
    balance: number;
    commandName?: string;
}

interface ParseAmountResult {
    success: boolean;
    amount?: number;
    error?: string;
}

export function parseAmount(options: ParseAmountOptions): ParseAmountResult {
    const { input, balance, commandName = "command" } = options;

    if (!input) {
        return {
            success: false,
            error: `Please specify an amount, percentage, or 'all'.\nExamples: \`?${commandName} 1000\`, \`?${commandName} 50%\`, \`?${commandName} all\``,
        };
    }

    let amount: number;

    // Handle "all"
    if (input.toLowerCase() === "all") {
        amount = balance;
    }
    // Handle percentage
    else if (input.endsWith("%")) {
        const percentage = parseInt(input.slice(0, -1), 10);
        if (isNaN(percentage) || percentage <= 0 || percentage > 100) {
            return {
                success: false,
                error: "Please specify a valid percentage between 1% and 100%.",
            };
        }
        amount = Math.floor((balance * percentage) / 100);
    }
    // Handle regular number
    else {
        amount = parseInt(input, 10);
        if (isNaN(amount) || amount <= 0) {
            return {
                success: false,
                error: "Please specify a valid amount.",
            };
        }
    }

    // Check if amount is 0
    if (amount === 0) {
        return {
            success: false,
            error: "Amount cannot be zero.",
        };
    }

    // Check if amount exceeds balance
    if (amount > balance) {
        return {
            success: false,
            error: `You don't have enough berries. Your balance is **${balance.toLocaleString()}**.`,
        };
    }

    return {
        success: true,
        amount,
    };
}
