import TokenChain from "@/components/global/tokenChain";
import { formatNumber } from "@/lib/utils";
import { CustomToken } from "@/types/chain";

interface Props {
    token: CustomToken
    enabled?: boolean
    onSelected(): void
}

const TokenSingle = ({ enabled = true, ...props }: Props) => {
    return (
        <button
            onClick={props.onSelected}
            disabled={!enabled}
            className="relative flex gap-2 justify-between items-center hover:bg-escher-gray100 dark:hover:bg-escher-darkblue_5 transition-all p-[6px] rounded-lg"
        >

            {props.token.icon && !props.token.icon.includes("ipfs") &&
                <TokenChain token={props.token} tokenSize={32} chainSize={18} />
            }
            <div className="flex-1 flex flex-col items-start justify-between">
                <div className="text-black dark:text-white text-sm font-semibold">{props.token.symbol}</div>
                <div className="text-escher-777e90 text-xs">{props.token.name}</div>
            </div>
            {props.token.balance &&
                <div className="text-escher-gray600 dark:text-white text-xs">{formatNumber(Number(props.token.balance.formattedBalance), false, 4)} {props.token.symbol}</div>
            }
            {!enabled &&
                <div className="absolute inset-0 bg-white/70"></div>
            }
        </button>
    );
}

export default TokenSingle;