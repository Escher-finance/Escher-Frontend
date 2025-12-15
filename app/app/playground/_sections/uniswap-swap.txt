import Button from "@/components/global/button";
import Card from "@/components/global/card";
import LdrsAnimation from "@/components/global/ldrsAnimation";
import { useEscher } from "@/components/providers/escherProvider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CHAINS } from "@/configs/chains";
import { useEip7702 } from "@/hooks/useEip7702";
import { getUniswapRoute, unshiftCustomToken, useUniswapRoute } from "@/hooks/useUniswap";
import { useMemo, useState } from "react";

const UniswapSwap = () => {
    const { tokens, account } = useEscher();

    const { swap: eip7702Swap, /* successTxHash, statusOperation, statusPrepare, error: swapError */ } = useEip7702();
    const [amountA, setAmountA] = useState<string>("0");
    const autoSlippage = "5.5";
    const [slippage] = useState<string>(autoSlippage);

    // Tokens
    const swapTokens = useMemo(() => {
        let result = [
            ...tokens.filter(t => t.isUniswap),
            ...tokens.filter(t => (t.symbol === "BABY" || t.symbol === "eBABY") && t.chain.id === CHAINS.mainnet.id)
        ];
        // .filter(v => !["BABY"].includes(v.symbol))
        // .filter(v => Number(v.balance?.value ?? 0) > 0)
        result = result.sort((a, b) => a.symbol.localeCompare(b.symbol));

        if (result) {
            unshiftCustomToken(result, "WETH");
            unshiftCustomToken(result, "USDT");
            unshiftCustomToken(result, "USDC");
            unshiftCustomToken(result, "ETH");
            unshiftCustomToken(result, "BABY");
            unshiftCustomToken(result, "eBABY");
        }

        return result;
    }, [tokens]);

    // Input
    const inputTokens = useMemo(() => {
        const result = swapTokens;
        unshiftCustomToken(result, "BABY");
        unshiftCustomToken(result, "eBABY");

        return result;
    }, [swapTokens]);

    const [selectedInputTokenId, setSelectedInputTokenId] = useState(inputTokens[0].id);
    const selectedInputToken = useMemo(() => (inputTokens.find(v => v.id === selectedInputTokenId) ?? inputTokens[0]),
        [inputTokens, selectedInputTokenId]);


    // Output
    const outputTokens = useMemo(() => {
        const result = swapTokens;
        unshiftCustomToken(result, "eBABY");
        unshiftCustomToken(result, "BABY");

        return result;
    }, [swapTokens]);

    const [selectedOutputTokenId, setSelectedOutputTokenId] = useState(outputTokens[0].id);
    const selectedOutputToken = useMemo(() => (outputTokens.find(v => v.id === selectedOutputTokenId) ?? outputTokens[0]),
        [outputTokens, selectedOutputTokenId]);

    // Uniswap route
    const uniswapRoute = useUniswapRoute({
        userAddress: (account.evm?.address as `0x${string}`) ?? "0x",
        inputToken: selectedInputToken,
        outputToken: selectedOutputToken,
        amount: amountA,
        slippage: slippage,
        forceSwap: true
    });

    const quote = useMemo(() => {
        return uniswapRoute.data ? uniswapRoute.data.quote.toExact() : undefined;
    }, [uniswapRoute.data]);

    const outputAmount = useMemo(() => {
        const baseAmount = quote;
        if (!baseAmount) return undefined;

        const numericAmount = Number(baseAmount);
        return numericAmount.toFixed(selectedOutputToken.decimals).replace(/\.?0+$/, "");
    }, [quote]);

    const submit = async () => {
        if (!uniswapRoute.data) {
            return;
        }
        eip7702Swap({
            amount: amountA,
            inputToken: selectedInputToken,
            route: uniswapRoute.data
        })
    }

    return (
        <Card className="items-start gap-0 text-sm">
            <div className="w-full flex justify-between items-center">
                <div className="text-xl font-semibold text-escher-gray900 dark:text-white">Uniswap Swap</div>
                <button onClick={async () => {
                    console.log({ uniswapRoute: uniswapRoute.data });
                }}>log</button>

                <button onClick={async () => {
                    const res = await getUniswapRoute({
                        userAddress: (account.evm?.address as `0x${string}`) ?? "0x",
                        inputToken: selectedInputToken,
                        outputToken: selectedOutputToken,
                        amount: amountA,
                        slippage: slippage
                    });
                    console.log({ res });

                }}>test</button>
            </div>
            <hr className="border border-t border-escher-gray200 dark:border-escher-darkblue_border w-full mb-4" />

            <div className="flex gap-4">
                <div className="flex flex-col gap-2">
                    <Select value={selectedInputTokenId} onValueChange={v => setSelectedInputTokenId(v)}>
                        <SelectTrigger className="">
                            <SelectValue placeholder="Token" />
                        </SelectTrigger>
                        <SelectContent>
                            {inputTokens.map(t =>
                                <SelectItem value={t.id}>{t.symbol} {(t.balance?.value ?? 0) > 0 ? t.balance?.formattedBalance : ""}</SelectItem>
                            )}
                        </SelectContent>
                    </Select>
                    <input type="number" className="border p-2" value={amountA} onChange={e => setAmountA(e.target.value)} />
                </div>

                <div className="flex flex-col gap-2">
                    <Select value={selectedOutputTokenId} onValueChange={v => setSelectedOutputTokenId(v)}>
                        <SelectTrigger className="">
                            <SelectValue placeholder="Token" />
                        </SelectTrigger>
                        <SelectContent>
                            {outputTokens.map(t =>
                                <SelectItem value={t.id}>{t.symbol} {(t.balance?.value ?? 0) > 0 ? t.balance?.formattedBalance : ""}</SelectItem>
                            )}
                        </SelectContent>
                    </Select>
                    {uniswapRoute.isPending && amountA !== "0" ?
                        <LdrsAnimation />
                        :
                        <input disabled className="border p-2" value={outputAmount ?? 0} />
                    }
                </div>
            </div>
            <hr className="border border-t border-escher-gray200 dark:border-escher-darkblue_border w-full mt-4" />

            <div>1 {selectedInputToken.symbol} : {quote} {selectedOutputToken.symbol}</div>
            <hr className="border border-t border-escher-gray200 dark:border-escher-darkblue_border w-full mt-4" />

            {uniswapRoute.data &&
                <Button title="Swap" onClick={submit} />
            }
        </Card>
    );
};

export default UniswapSwap;