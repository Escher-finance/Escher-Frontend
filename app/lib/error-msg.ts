export const getErrorMessage = (error: string | undefined) => {
    if (!error) return undefined;
    try {
        const errorString: string = error.toString();

        const errorMessages: { [key: string]: string[] } = {
            "User rejected the request":
                ["Request rejected."],

            "Request rejected":
                ["Request rejected."],

            "Withdrawal rate limit exceeded":
                ["You can only request tokens once every 24 hours. Please try again later!"],

            "Insufficient time elapsed since last withdrawal":
                ["You can only request tokens once every 24 hours. Please try again later!"],

            "does not exist on chain":
                ["Your account doesn't exist on chain. Please send some tokens there first!"],

            "of executing this transaction exceeds the balance of the account":
                ["Insufficient native token for gas. Please add native token to your account!"],

            "out of gas":
                [
                    "Your transaction ran out of gas!",
                    "It looks like the gas limit set for this transaction was too low. Please increase the gas limit in your wallet settings and try again."
                ],

            "insufficient funds":
                [
                    "Insufficient balance!",
                    "You don't have enough balance for gas and funds. Please reduce the amount and try again."
                ],
        };

        for (const [key, message] of Object.entries(errorMessages)) {
            if (errorString.includes(key)) {
                return message;
            }
        }

        return ["Something went wrong!"];
    } catch (err) {
        console.error(err);
        return undefined;
    }
};
