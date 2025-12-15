import { formatNumber } from "@/lib/utils";
import { CustomToken } from "@/types/chain";
import TokenChain from "../../tokenChain";

interface Props {
    title: string
    tokens: CustomToken[]
}

const Tokens = (props: Props) => {
    return (
        <div className="flex flex-col gap-4 bg-escher-f5f6f8 dark:bg-escher-darkblue dark:text-white rounded-lg p-4">
            <div className="flex items-center gap-2">
                <div className="text-xs text-escher-gray800 dark:text-white">{props.title}</div>
                <div className="text-[8px] text-escher-electricblue bg-escher-electricblue_light4 aspect-square flex items-center  justify-center w-3 h-3 rounded-full">{props.tokens.length}</div>
            </div>
            {props.tokens.map((t, k) =>
                <div key={k} className="flex justify-between items-center">
                    <div className="flex gap-2 items-center">
                        <TokenChain token={t} />
                        <div className="flex flex-col gap-1">
                            <div className="text-sm font-semibold leading-none">{t.symbol}</div>
                            <div className="text-xs leading-none text-escher-777e90">{t.chain.name}</div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-1 items-end justify-between">
                        <div className="text-sm font-semibold leading-none">{formatNumber(Number(t.balance?.formattedBalance), false, 4)}</div>
                        {(t.balance?.dollarValue !== undefined && t.balance.dollarValue > 0) &&
                            <div className="text-xs leading-none text-escher-777e90">${formatNumber(t.balance.dollarValue)}</div>
                        }
                    </div>
                </div>
            )}
        </div>
    );
}

export default Tokens;