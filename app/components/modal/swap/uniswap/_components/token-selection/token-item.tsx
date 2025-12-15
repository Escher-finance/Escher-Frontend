import { formatNumber } from "@/lib/number";
import Image from "next/image";

interface Props {
    logo?: string
    symbol: string
    name: string
    balance?: string
    enabled?: boolean
    onSelected(): void
}

const TokenItem = ({ enabled = true, ...props }: Props) => {
    return (
        <button
            onClick={props.onSelected}
            disabled={!enabled}
            className="relative flex gap-2 justify-between items-center hover:bg-escher-gray100 dark:hover:bg-escher-darkblue_5 transition-all p-1.5 rounded-lg"
        >
            {props.logo &&
                <Image src={props.logo} alt="" width={32} height={32} className="" />
            }
            <div className="flex-1 flex flex-col items-start justify-between">
                <div className="text-black dark:text-white text-sm font-semibold">{props.symbol}</div>
                <div className="text-escher-777e90 text-xs">{props.name}</div>
            </div>
            {props.balance && (Number(props.balance) > 0) &&
                <div className="text-escher-gray600 dark:text-white text-xs">{formatNumber(Number(props.balance))} {props.symbol}</div>
            }
            {!enabled &&
                <div className="absolute inset-0 bg-white bg-opacity-70"></div>
            }
        </button>
    );
}

export default TokenItem;