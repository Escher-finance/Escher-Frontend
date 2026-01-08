import { CustomToken } from "@/types/chain";
import { useMemo } from "react";
import { GroupedTokens } from "../assets";
import AssetsLiquidRow from "./liquid-row";

interface Props {
    tokens: CustomToken[]
    rates: {
        babylon: number | undefined
        union: number | undefined
    }
    unionTvl: number | undefined // temporary
}

const AssetsLiquid = (props: Props) => {
    const groupedTokens: GroupedTokens[] = useMemo(() => {
        const result: GroupedTokens[] = [];

        props.tokens.map((t) => {
            if (t.isLiquid) {
                const found = result.findIndex(r => r.symbol == t.symbol);

                // Rate
                let rate: number | undefined;
                if (t.lst?.includes("babylon")) rate = props.rates.babylon;
                if (t.lst?.includes("union")) rate = props.rates.union;

                // TVL
                let tvl = t.tvl ?? 0;
                if (t.lst?.includes("union")) tvl = props.unionTvl ?? 0;

                if (found == -1) {
                    result.push({
                        symbol: t.symbol,
                        name: t.name,
                        balance: Number(t.balance?.formattedBalance ?? 0),
                        balanceDollar: t.balance?.dollarValue && Number(t.balance.dollarValue),
                        tvl: tvl,
                        rate: Number(rate),
                        icon: t.icon,
                        type: t.isLiquid ? 'liquid' : 'native',
                        tokens: [t]
                    })
                } else {
                    result[found].tvl = (result[found].tvl ?? 0) + tvl;
                    result[found].balance = Number(result[found].balance) + Number(t.balance?.formattedBalance ?? 0);
                    if (t.balance?.dollarValue) {
                        result[found].balanceDollar = (Number(result[found].balanceDollar ?? 0)) + Number(t.balance.dollarValue);
                    }
                    result[found].tokens?.push(t);
                }
            }
        });

        return result;
    }, [props.tokens, props.rates, props.unionTvl]);

    return (
        <div className="flex flex-col">
            {/* header */}
            <div
                className="flex px-6 text-xs font-medium border-t bg-escher-gray25 dark:bg-escher-1a2d49 border-escher-gray300 dark:border-none text-escher-gray500 dark:text-white"
            >
                <div className="flex-1 flex items-center py-4">
                    <div className="w-[20%]">Staked Positions</div>
                    <div className="w-[20%]">Total Balance</div>
                    <div className="w-[20%]">TVL</div>
                    <div className="w-[20%]">Ratio</div>
                    <div className="w-[20%]">Points</div>
                </div>
            </div>
            {/* content */}
            <div className="flex w-full flex-col">
                {groupedTokens.map((t, key) =>
                    <AssetsLiquidRow
                        key={key}
                        groupedToken={t}
                    />
                )}
                {/* <AssetsLiquidRowDummy
                    logo={"/images/token/e-union.svg"}
                    name={"eU"}
                    balance={"20"}
                    value={"$60.00"}
                    tvl={"$65.10M"}
                    ratio={"1eUNO=1.5UNO"}
                /> */}
            </div>
        </div>
    );
}

export default AssetsLiquid;