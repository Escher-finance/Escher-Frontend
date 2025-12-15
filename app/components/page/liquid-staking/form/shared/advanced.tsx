import Icon from "@/components/global/icons";
import LdrsAnimation from "@/components/global/ldrsAnimation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { APP_CONFIG } from "@/configs/app";
import { BABY_FEE } from "@/hooks/useUniswap";
import { textToNumberRegex } from "@/lib/text";
import { formatDecimal, formatNumber } from "@/lib/utils";
import { CustomToken } from "@/types/chain";
import { Action } from "@/types/transaction";
import { useState } from "react";

interface Props {
    autoSlippage: string
    feeTokenIsBaby: boolean
    feeTokens?: CustomToken[]
    operation: Action
    priceImpact?: number
    quote?: string
    fInputAmount: string
    selectedFeeToken?: CustomToken
    selectedInputToken: CustomToken
    selectedOutputToken: CustomToken
    setSelectedFeeTokenId(val: string): void
    setSlippage(val: string): void
    slippage: string
    unionFeeAmount?: bigint
}

const Advanced = (props: Props) => {
    const [showAdvance, setShowAdvance] = useState(false);
    const [slippageInput, setSlippageInput] = useState(props.autoSlippage);

    const handleSlippageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target.value;
        if (textToNumberRegex(input) === undefined) return;

        const num = Number(input);
        if (num > 100 || num < 0) return;

        setSlippageInput(input);
        props.setSlippage(input);
    };

    if (!(APP_CONFIG.enableEvm &&
        ["bond", "unbond"].includes(props.operation) &&
        (props.selectedInputToken.isUniswap || props.selectedOutputToken.chain.network === "evm")
    )) {
        return null;
    }

    return (
        <div className="flex flex-col mt-6">
            <button
                onClick={() => setShowAdvance(prev => !prev)}
                className="flex justify-between items-center text-escher-777e90 hover:text-escher-electricblue dark:text-white text-sm"
            >
                <div>Transaction details</div>
                {showAdvance ?
                    <Icon type="FaChevronDown" className="text-escher-electricblue dark:text-white" size="sm" />
                    :
                    <Icon type="FaChevronDown" className="text-escher-electricblue dark:text-white rotate-180" size="sm" />
                }
            </button>
            {showAdvance &&
                <div className="w-full flex flex-col gap-2 mt-6">
                    {props.selectedInputToken.isUniswap && (
                        <>
                            {props.priceImpact &&
                                <div className="flex items-center justify-between">
                                    <div className="text-escher-141416 dark:text-white text-sm font-semibold">
                                        Price impact
                                    </div>
                                    <div className="text-escher-electricblue dark:text-white text-sm">
                                        {props.priceImpact.toFixed(2)} %
                                    </div>
                                </div>
                            }
                            <div className="flex items-center justify-between">
                                <div className="text-escher-141416 dark:text-white text-sm font-semibold">Slippage</div>
                                <div className="relative font-medium text-sm">
                                    <input
                                        type="text"
                                        value={slippageInput}
                                        onChange={handleSlippageChange}
                                        onFocus={(e) => e.target.select()}
                                        className="w-[120px] text-end border border-escher-E4E8ED dark:border-escher-darkblue_border rounded-full p-3 pr-6"
                                    />
                                    <button
                                        className={`font-semibold absolute hover:bg-escher-electricblue_light4 rounded-full px-3 top-2 bottom-2 left-2 ${props.slippage === props.autoSlippage ? "text-escher-electricblue dark:text-white bg-escher-DFE0FF" : "text-white bg-gray-300"}`}
                                        onClick={() => {
                                            props.setSlippage(props.autoSlippage);
                                            setSlippageInput(props.autoSlippage);
                                        }}
                                    >
                                        Auto
                                    </button>
                                    <div className="absolute top-0 bottom-0 right-2 flex items-center">%</div>
                                </div>
                            </div>
                        </>
                    )}

                    {props.selectedOutputToken.chain.network === "evm" && (
                        <>
                            <div className="flex items-center justify-between">
                                <div
                                    className="text-escher-141416 dark:text-white text-sm font-semibold"
                                    onClick={() => console.log({ props })}
                                >
                                    Relayer fee
                                </div>
                                <div className="text-escher-electricblue dark:text-white text-sm">
                                    {props.feeTokenIsBaby ?
                                        <>{BABY_FEE} BABY</>
                                        :
                                        <>
                                            {props.unionFeeAmount && props.selectedFeeToken ?
                                                <>
                                                    {formatNumber(
                                                        formatDecimal(Number(props.unionFeeAmount), -props.selectedFeeToken.decimals),
                                                        false, 6
                                                    )} {props.selectedFeeToken?.symbol}
                                                </>
                                                :
                                                <LdrsAnimation size={18} />
                                            }
                                        </>
                                    }
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="text-escher-141416 dark:text-white text-sm font-semibold">Pay fee with</div>
                                <Select value={props.selectedFeeToken?.id} onValueChange={val => props.setSelectedFeeTokenId(val)}>
                                    <SelectTrigger className="w-fit border-escher-E4E8ED dark:border-escher-darkblue_border rounded-full hover:bg-slate-50">
                                        <SelectValue placeholder="Token" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {props.feeTokens?.map((token, key) =>
                                            <SelectItem value={token.id} key={key}>
                                                <div className="flex items-center gap-2 font-semibold text-sm">
                                                    {token.icon && token.icon !== "" && !token.icon.includes("ipfs") &&
                                                        <Image alt="" src={token.icon} className="w-6 h-6" />
                                                    }
                                                    <div>{token.symbol}</div>
                                                </div>
                                            </SelectItem>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                        </>
                    )}
                </div>
            }
        </div>
    );
}

export default Advanced;
