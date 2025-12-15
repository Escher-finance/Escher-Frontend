import Card from "@/components/global/card";
import { useAppTokens } from "@/hooks/useAppTokens/useAppTokens";
import { formatDecimal, formatNumber } from "@/lib/utils";

const TokenBalance = () => {
    const { data: tokens, refetch } = useAppTokens();

    return (
        <Card className="w-full items-start gap-2 text-sm">
            <div className="w-full flex justify-between items-center">
                <div className="text-xl font-semibold text-escher-gray900 dark:text-white">App tokens</div>
            </div>
            <hr className="border border-t border-escher-gray200 dark:border-escher-darkblue_border w-full" />
            <button onClick={() => console.log({
                tokens,
            })}>log</button>

            <button onClick={() => {
                refetch();
            }}>refetch</button>

            <div className="grid grid-cols-6 gap-y-2 gap-x-4">
                <div>Chain</div>
                <div>Symbol</div>
                <div>Supply</div>
                <div>Balance</div>
                <div>Value</div>
                <div>Log</div>

                {tokens.map((t, k) =>
                    <>
                        <div key={k}>{t.chain.name}</div>
                        <div>{t.symbol}</div>
                        <div>{t.totalSupply && formatNumber(formatDecimal(t.totalSupply, -t.decimals), false, 4)}</div>
                        <div>{t.balance?.formattedBalance && formatNumber(t.balance?.formattedBalance, false, 4)}</div>
                        <div>{t.balance?.dollarValue ? `$${formatNumber(t.balance?.dollarValue)}` : ""}</div>
                        <div onClick={() => console.log(t)}>Log</div>
                    </>
                )}
            </div>
        </Card>
    );
}

export default TokenBalance;