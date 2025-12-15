import Button from "@/components/global/button";
import Card from "@/components/global/card";
import Icon from "@/components/global/icons";
import { useEscher } from "@/components/providers/escherProvider";
import { CHAINS } from "@/configs/chains";
import useStorageContract from "@/hooks/useStorageContract";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useChainId, usePublicClient, useSwitchChain, useWalletClient } from "wagmi";

const SepoliaStorageDemo = () => {
    const {
        tokens, refetchTokens
    } = useEscher();

    const chainId = useChainId();
    const { switchChain } = useSwitchChain();
    const publicClient = usePublicClient();
    const { data: walletClient } = useWalletClient();

    const { retrieve } = useStorageContract({
        publicClient,
        walletClient
    });

    const queryRetrieve = useQuery({
        queryKey: ["useStorageContract", retrieve],
        queryFn: retrieve
    });

    const sepoliaTokens = useMemo(() => ({
        native: tokens.find(t => t.id === `${CHAINS.sepolia.id}`),
    }), [tokens]);

    const test = async () => { // eslint-disable-line @typescript-eslint/no-unused-vars
        const res = await retrieve();
        console.log({ res });
    }

    const [amount, setAmount] = useState("0");

    return (
        <Card className="items-start gap-2 text-sm">
            <div className="w-full flex justify-between items-center">
                <div className="text-xl font-semibold text-escher-gray900 dark:text-white">Sepolia storage contract demo</div>
            </div>
            <hr className="border border-t border-escher-gray200 dark:border-escher-darkblue_border w-full mb-4" />

            <div>Active chain ID : {chainId}</div>

            <div className="grid grid-cols-2 gap-2 p-4 border border-gray-200">
                <div className="font-bold text-gray-700">Token</div>
                <div className="flex items-center gap-1">
                    <div className="font-bold text-gray-700">Balance</div>
                    <button onClick={refetchTokens}>
                        <Icon type="IoMdRefresh" />
                    </button>
                </div>

                <div className="py-2 border-t border-gray-200">{sepoliaTokens.native?.name}</div>
                <div className="py-2 border-t border-gray-200">{sepoliaTokens.native?.balance?.formattedBalance} {sepoliaTokens.native?.symbol}</div>
            </div>

            {chainId !== sepoliaTokens.native?.chain.id ?
                <Button title="Switch chain" onClick={() => switchChain({ chainId: Number(sepoliaTokens.native?.id) })} />
                :
                <>
                    <div className="flex flex-col gap-2 p-4 bg-slate-300">
                        <div className="flex items-center gap-4">
                            <div>Current value : {queryRetrieve.data ?? '-'}</div>
                            <button onClick={() => queryRetrieve.refetch()}>
                                <Icon type="IoMdRefresh" />
                            </button>
                        </div>
                        <input type="number" className="bg-white" placeholder="amount" value={amount} onChange={e => setAmount(e.target.value)} />
                        <div className="flex gap-2 justify-between">
                            {/* <Button title="Store" onClick={eipStore} isLoading={isPending} /> */}
                        </div>
                        {/* <Button title="Test" onClick={test} /> */}
                        {/* <Button title="Test" onClick={() => runPromise(getSendbackCall)} /> */}
                    </div>
                </>
            }
        </Card>
    );
};

export default SepoliaStorageDemo;