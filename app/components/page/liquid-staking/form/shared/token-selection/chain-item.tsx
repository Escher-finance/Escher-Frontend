import TokenChain from "@/components/global/tokenChain";
import { formatNumber } from "@/lib/number";
import { CustomToken } from "@/types/chain";

interface Props {
    token: CustomToken
    enabled?: boolean
    onTokenSelected(token: CustomToken): void
}

const ChainItem = ({ enabled = true, ...props }: Props) => {
    return (
        <button
            onClick={() => props.onTokenSelected(props.token)}
            disabled={!enabled}
            className="relative flex gap-2 justify-between items-center hover:bg-escher-gray100 dark:hover:bg-escher-darkblue_5 transition-all p-[6px] rounded-lg"
        >
            <TokenChain
                token={props.token}
            />
            <div className="flex-1 text-escher-black dark:text-white text-sm font-semibold text-start">{props.token.chain.name}</div>
            {props.token.balance &&
                <div className="text-escher-gray600 dark:text-white text-xs my-2">{formatNumber(Number(props.token.balance?.formattedBalance))} {props.token.symbol}</div>
            }
            {!enabled &&
                <div className="absolute inset-0 bg-white/70"></div>
            }
        </button>
    );
}

export default ChainItem;