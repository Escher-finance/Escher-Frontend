import { BABYLON_CONTRACTS } from "@/configs/babylon";
import { CHAINS_NAME, PRIMARY_CHAIN } from "@/configs/cosmos-chain";
import { useChains } from "@cosmos-kit/react";
import { useCallback } from "react";

const useSuggestToken = () => {
    const cosmosChains = useChains(CHAINS_NAME);

    const suggestToken = useCallback(async () => {
        try {
            const walletName = cosmosChains[PRIMARY_CHAIN.name].wallet?.name;
            switch (walletName) {
                case "keplr-extension":
                    {
                        const keplr = (window as { keplr?: { suggestToken: (chainId: string, contractAddress: string) => Promise<void> } })?.keplr; // injected by Keplr extension
                        if (keplr) {
                            await keplr.suggestToken(PRIMARY_CHAIN.id, BABYLON_CONTRACTS.liquidTokenAddress.babylon);
                        }
                    }
                    break;

                // Add more wallet
            }
        } catch {
            // console.error(error);
        }
    }, [cosmosChains]);

    return {
        suggestToken
    };
}

export default useSuggestToken;