export let commands = {
    balance: {
        name: "check balance",
        permissions: "any",
        commands: ["?berry", "?b"],
        description: "checks user's current balance in their cash and bank.",
    },
    leaderboard: {
        name: "berry leaderboard",
        permissions: "any",
        commands: ["?berryleaderboard", "?berrylb", "?lb"],
        description: ["checks guild's berry leaderboard."],
    },
    collect: {
        name: "collect income",
        permissions: "any",
        commands: ["?collect"],
        description: "collect your role's income(s).",
    },
    withdraw: {
        name: "withdraw",
        permissions: "any",
        commands: ["?withdraw", "?with"],
        description: "moves money from your bank to ur cash.",
    },
    deposit: {
        name: "deposit",
        permissions: "any",
        commands: ["?deposit", "?dep"],
        description: "moves money from your cash to ur bank.",
    },
};
