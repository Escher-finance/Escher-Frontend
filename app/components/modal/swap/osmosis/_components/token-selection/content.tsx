import Icon from "@/components/global/icons";
import TokenChain from "@/components/global/tokenChain";
import { DialogTitle } from "@/components/ui/dialog-empty";
import { formatNumber } from "@/lib/utils";
import { CustomToken } from "@/types/chain";
import { useMemo, useState } from "react";

export interface GroupedTokens {
    symbol: string
    name: string
    balance: number
    icon?: string
}

interface Props {
    onTokenSelected(token: CustomToken): void
    setOpen(val: boolean): void
    tokens: CustomToken[]
}

const Content = (props: Props) => {
    const [searchQuery, setSearchQuery] = useState<string>("");

    const filteredTokens = useMemo(() => props.tokens.filter(
        v => v.symbol.toLowerCase().includes(searchQuery.toLowerCase())
    ),
        [searchQuery, props.tokens]
    );

    return (
        <div className="flex flex-col w-full p-4">
            <DialogTitle className="hidden"></DialogTitle>
            {/* header */}
            <div className="flex items-center">
                <button
                    className="text-escher-electricblue dark:text-white bg-escher-gray100 rounded-full flex items-center justify-center w-8 h-8 hover:bg-escher-gray200"
                    onClick={() => props.setOpen(false)}
                >
                    <Icon type="FaArrowLeft" size="sm" />
                </button>
                <div className="flex-1 flex justify-center items-center text-escher-black dark:text-white">
                    Select Token
                </div>
                <div className="w-8"></div>
            </div>

            {/* search */}
            <div className="flex gap-2 mt-6">
                <div className="flex-1 relative flex justify-center items-center h-full">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder='Search token'
                        className="border border-escher-gray200 dark:border-escher-darkblue_border rounded-full w-full p-2 py-1.5 pl-9"
                    />
                    <Icon type="FiSearch" className="text-escher-gray200 absolute left-2" size="lg" />
                </div>
            </div>

            {filteredTokens.length === 0 ?
                <div className="text-center text-sm text-escher-777e90 mt-4">
                    --No token found--
                </div>
                :
                <div className="max-h-[480px] flex flex-col mt-6 overflow-y-scroll">
                    {filteredTokens.map((token, k) =>
                        <button
                            key={k}
                            onClick={() => props.onTokenSelected(token)}
                            className="flex gap-2 justify-between items-center hover:bg-escher-gray100 dark:hover:bg-escher-darkblue_5 transition-all p-1.5 rounded-lg"
                        >

                            {token.icon && !token.icon.includes("ipfs") &&
                                <TokenChain token={token} tokenSize={32} chainSize={18} />
                            }
                            <div className="flex-1 flex flex-col items-start justify-between">
                                <div className="text-black dark:text-white text-sm font-semibold">{token.symbol}</div>
                                <div className="text-escher-777e90 text-xs">{token.name}</div>
                            </div>
                            {token.balance && token.balance.value > 0 &&
                                <div className="text-escher-gray600 dark:text-white text-xs">{formatNumber(Number(token.balance.formattedBalance), false, 4)} {token.symbol}</div>
                            }
                        </button>
                    )}
                </div>
            }
        </div>
    );
}

export default Content;
