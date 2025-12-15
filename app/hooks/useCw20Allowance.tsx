import { ChainContext } from "@cosmos-kit/core";

interface Props {
    cosmosChain: ChainContext
    tokenContractAddres: string
    spender: string
    amount: bigint
}

export function useCw20Allowance() {
    const increaseAllowance = async (props: Props) => {
        if (!props.cosmosChain.address) throw "Account not connected";

        try {
            const client = await props.cosmosChain.getSigningCosmWasmClient();

            const { allowance } = await client.queryContractSmart(
                props.tokenContractAddres,
                {
                    allowance: {
                        owner: props.cosmosChain.address, //Owner
                        spender: props.spender
                    },
                }
            );

            console.log({ allowance });
            if (BigInt(allowance) >= props.amount) return true;

            const msg = {
                increase_allowance: {
                    spender: props.spender,
                    amount: Number(props.amount).toFixed(0),
                },
            }
            console.log({ allowanceRequest: msg });
            const res = await client.execute(props.cosmosChain.address, props.tokenContractAddres, msg, "auto");
            console.log({ allowanceResult: res });

            return true;

        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    return {
        increaseAllowance
    }
}