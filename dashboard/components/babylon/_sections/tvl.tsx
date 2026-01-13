import LdrsAnimation from "@/components/global/ldrsAnimation";
import { APP_CONFIG } from "@/config/app";
import { Liquidity } from "@/types/types";
import { formatNumber } from "@/utils/utils";
import { useQuery } from "@tanstack/react-query";
import { useCallback } from "react";

interface Props {
    liquidity?: Liquidity
    lst: string
}

const Tvl = (props: Props) => {

    const getData = useCallback(async () => {
        if (!props.liquidity) return undefined;

        const responseCoin = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=babylon&vs_currencies=usd`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        const babyPrice = (await responseCoin.json()).babylon.usd;
        const ebabyPrice = babyPrice * Number(props.liquidity.exchange_rate);

        const tvl = (Number(props.liquidity.total_supply) / 10 ** 6) * ebabyPrice;

        return (tvl);
    }, [props.liquidity]);

    const queryData = useQuery({
        queryKey: ["tvl", JSON.stringify(props.liquidity)],
        queryFn: getData,
        refetchInterval: APP_CONFIG.refetchInterfal,
        enabled: !!props.liquidity
    });

    return (
        <div className="flex flex-col items-center gap-1 bg-violet-900 text-violet-50 rounded py-8">
            <div className="flex-1">
                {queryData.data ?
                    <div className="text-xl md:text-5xl font-bold">{`$${formatNumber(queryData.data)}`}</div>
                    :
                    <LdrsAnimation />
                }
            </div>
            <div className="text-sm font-medium opacity-80">TVL</div>
        </div>
    );
}

export default Tvl;