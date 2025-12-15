import Card from "@/components/global/card";
import { CHAINS } from "@/configs/chains";
import { useSkipClient, useSkipSimulation } from "@/hooks/useSkip";
import { formatDecimal } from "@/lib/utils";
import { useChain } from "@cosmos-kit/react";
import { RouteRequest } from "@skip-go/client";
import { useMemo, useState } from "react";

const SwapTower = () => {
    const cosmosChain = useChain(CHAINS.babylon.chainName ?? "");
    const cw20 = "cw20:bbn1s7jzz7cyuqmy5xpr07yepka5ngktexsferu2cr4xeww897ftj77sv30f5s";

    const [fInput, setFInput] = useState<string>("0");
    const [error, setError] = useState<string>();
    const [success, setSuccess] = useState<string>();
    const [isLoading, setIsLoading] = useState(false);

    const { skipClient } = useSkipClient();

    const routeRequest = useMemo((): RouteRequest | undefined => {
        if (!fInput || Number(fInput) <= 0) return undefined;

        return {
            swapVenues: [
                {
                    chainID: CHAINS.babylon.id as string,
                    name: "babylon-tower",
                },
            ],
            sourceAssetDenom: cw20,
            sourceAssetChainID: CHAINS.babylon.id as string,
            destAssetDenom: "ubbn",
            destAssetChainID: CHAINS.babylon.id as string,
            amountIn: formatDecimal(Number(fInput), 6).toFixed(0),
            allowSwaps: true,
            allowUnsafe: true,
        };
    }, [fInput]);

    const simulation = useSkipSimulation({
        skipClient, routeRequest
    });

    const errorSimulation = useMemo(() => {
        if (simulation.isSuccess) return undefined;
        return simulation.error?.message;
    }, [simulation.isSuccess, simulation.error]);

    const slippageTolerancePercent = undefined;

    const submit = async () => {
        if (!cosmosChain.address || !simulation.data) return;
        setIsLoading(true);
        setError(undefined);
        setSuccess(undefined);

        try {
            await skipClient?.executeRoute({
                route: simulation.data,
                slippageTolerancePercent,
                userAddresses: simulation.data.requiredChainAddresses.map((chainID) => ({
                    chainID,
                    address: cosmosChain.address ?? "",
                })),
                onTransactionSigned: async ({ chainID }) => {
                    console.log({
                        title: "Succesfully Signed",
                        description: `Transaction signed with chain ID: ${chainID}`,
                    });
                },
                onTransactionCompleted: async (chainID, txHash, status) => {
                    console.log({
                        title: "Success",
                        chainID, txHash, status,
                    });
                    setSuccess(txHash)
                },
            });

        } catch (error) {
            console.error(error);
            setError(String(error));
        }

        setIsLoading(false);
    };

    const submitButton = useMemo((): { active: boolean, text: string } => {
        if (isLoading) {
            return {
                active: false,
                text: "processing..."
            }
        }

        if (!fInput || Number(fInput) <= 0) {
            return {
                active: false,
                text: "Swap"
            }
        }

        if (simulation.isFetching) {
            return {
                active: false,
                text: "Fetching quote"
            }
        }

        if (errorSimulation) {
            if (errorSimulation.includes("no routes found")) {
                return {
                    active: false,
                    text: "No routes found"
                }
            }
            return {
                active: false,
                text: "Swap"
            }
        }

        return {
            active: true,
            text: "Swap"
        }
    }, [isLoading, fInput, simulation.isFetching, errorSimulation]);

    return (
        <Card className="items-start gap-0 text-sm">
            <div className="w-full flex justify-between items-center">
                <div className="text-xl font-semibold text-escher-gray900 dark:text-white">Swap using tower</div>
            </div>
            <hr className="border border-t border-escher-gray200 dark:border-escher-darkblue_border w-full mb-4" />
            <div>eBABY </div>
            <input
                type="number"
                value={fInput}
                onChange={e => setFInput(e.target.value)}
                placeholder="amount"
                className="border border-gray-500 p-2"
            />

            <div className="mt-2">BABY</div>
            <input
                placeholder="estimated amount"
                value={simulation.data?.amountOut ? formatDecimal(Number(simulation.data?.amountOut), -6) : ""}
                readOnly
                className="border border-gray-500 p-2"
            />

            {error &&
                <div className="text-red-500 text-sm font-medium">Error : {error}</div>
            }

            {skipClient && (
                <button
                    className={`${submitButton.active ? "bg-sky-500 hover:bg-sky-400" : "bg-gray-500 hover:bg-gray-400"} text-white rounded p-2 mt-4`}
                    disabled={!submitButton.active}
                    onClick={submit}
                >
                    {submitButton.text}
                </button>
            )}

            {success &&
                <div className="text-green-500 text-sm font-medium">Success : {success}</div>
            }
        </Card>
    );
};

export default SwapTower;