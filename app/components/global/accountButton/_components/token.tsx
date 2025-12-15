import { formatNumber } from "@/lib/utils";
import { CustomToken } from "@/types/chain";
import TokenChain from "../../tokenChain";

export default function Token(props: {
    token: CustomToken
}) {
    return (
        <div className="flex justify-between items-center px-4 py-2 dark:text-white">
            <div className="flex gap-2 items-center">
                <TokenChain token={props.token} />
                <div className="flex flex-col gap-1">
                    <div className="text-sm font-semibold leading-none">{props.token.symbol}</div>
                    <div className="text-xs leading-none text-escher-777e90">{props.token.chain.name}</div>
                </div>
            </div>
            <div className="flex flex-col gap-1 items-end justify-between">
                <div className="text-sm font-semibold leading-none">{formatNumber(Number(props.token.balance?.formattedBalance), false, 4)}</div>
                {(props.token.balance?.dollarValue !== undefined && props.token.balance.dollarValue > 0) &&
                    <div className="text-xs leading-none text-escher-777e90">${formatNumber(props.token.balance.dollarValue)}</div>
                }
            </div>
        </div>
    );
}