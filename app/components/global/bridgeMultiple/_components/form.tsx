import Button from "@/components/global/button";
import Icon from "@/components/global/icons";
import LdrsAnimation from "@/components/global/ldrsAnimation";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { textToNumberRegex } from "@/lib/text";
import { addThousandSeparators, formatNumber } from "@/lib/utils";
import { CustomToken } from "@/types/chain";
import { Defi, DefiPool } from "@/types/defi";
import Image from "next/image";
import Link from "next/link";

interface Props {
    activeToken: string
    activeTokenObj: CustomToken
    defi: Defi
    pool: DefiPool
    error?: string
    formType: 'single' | 'double'
    fTokenAAmount: string
    fTokenAmount: string
    fTokenBAmount: string
    isLoading: boolean
    ratio?: number
    setActiveToken(val: "tokenA" | "tokenB"): void
    setFormType(val: 'single' | 'double'): void
    setFTokenAAmount(val: string): void
    setFTokenAmount(val: string): void
    setFTokenBAmount(val: string): void
    setOpen?(val: boolean): void
    submit(): void
}

const Form = (props: Props) => {
    return (
        <div className="min-w-[585px] flex flex-col">
            <div className="flex justify-between items-center bg-linear-to-r from-[#FBEBC8] to-transparent rounded-t-lg p-6">
                <div className="flex-1 flex items-center gap-2 leading-none">
                    <div className="text-escher-black dark:text-white text-xl font-bold">Add Liquidity</div>
                    <div className="flex items-center gap-1.5 rounded-full p-1 pr-2 bg-[#FAE5B9]">
                        <Image src={props.defi.logoURI} alt="" width={16} height={16} className="border border-white rounded-full" />
                        <div className="text-escher-text2 dark:text-white text-sm font-medium">{props.defi.name}</div>
                    </div>
                </div>
                <button
                    className="self-end rounded-full border border-gray-300 text-gray-400 p-1.5"
                    onClick={() => props.setOpen && props.setOpen(false)}
                >
                    <Icon type="FaTimes" />
                </button>
            </div>
            <div className="flex flex-col p-6">

                <div className="flex items-center justify-between p-6 border border-[#e4e8ed] rounded-lg">
                    <div className="flex items-center">
                        {props.pool.tokenA.icon &&
                            <Image src={props.pool.tokenA.icon} alt="" width={24} height={24} className="z-10" />
                        }
                        {props.pool.tokenB.icon &&
                            <Image src={props.pool.tokenB.icon} alt="" width={24} height={24} className="-ml-2" />
                        }
                        <div className="flex flex-col ml-4">
                            <div className="text-sm font-medium text-escher-black dark:text-white">
                                {props.pool.tokenA.symbol} / {props.pool.tokenB.symbol}
                            </div>
                            <div className="flex items-center gap-1 font-medium text-escher-777e90 text-sm">
                                <Image src={props.defi.logoURI} width={18} height={18} alt="" />
                                <div>{props.defi.name}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="text-sm text-escher-777e90 leading-none mt-10">Deposit Amount</div>

                {
                    props.formType === "double" &&
                    <>
                        {props.ratio ?
                            <>
                                {/* Token A */}
                                <div className="flex flex-col p-6 border border-[#e4e8ed] rounded-lg mt-2">
                                    <div className="flex justify-between">
                                        <div className="w-fit flex items-center  gap-2 border border-escher-e4e8ed dark:border-escher-darkblue_border rounded-full bg-escher-F5F6F8 dark:bg-escher-darkblue p-3 pr-4">
                                            {props.pool.tokenA.icon &&
                                                <Image src={props.pool.tokenA.icon} alt="" width={24} height={24} />
                                            }
                                            <div className="text-xl font-semibold text-escher-black dark:text-white">{props.pool.tokenA.symbol}</div>
                                        </div>

                                        <div className="w-1/2 relative self-stretch flex items-center justify-center">
                                            <input
                                                type="text"
                                                placeholder="0"
                                                value={props.fTokenAAmount}
                                                onChange={e => {
                                                    const input = textToNumberRegex(e.target.value);
                                                    if (input) {
                                                        props.setFTokenAAmount(input);
                                                        props.setFTokenBAmount(parseFloat((Number(input) / (props.ratio ?? 1)).toFixed(6)).toString());
                                                    }
                                                }}
                                                onFocus={(e) => e.target.select()}
                                                className="border border-escher-dedfff bg-escher-f5f5ff text-escher-gray900 dark:text-white rounded-full h-full px-4 font-semibold text-2xl w-full"
                                            />
                                            <button
                                                onClick={() => {
                                                    if (props.pool.tokenA.balance) {
                                                        props.setFTokenAAmount(props.pool.tokenA.balance.formattedBalance);
                                                        props.setFTokenBAmount(parseFloat((Number(props.pool.tokenA.balance.formattedBalance) * (props.ratio ?? 1)).toFixed(6)).toString());
                                                    }
                                                }}
                                                className="absolute right-2 text-escher-electricblue bg-escher-dedfff hover:bg-escher-electricblue_light8 transition-all rounded-full px-2 py-1 text-xs font-semibold"
                                            >MAX</button>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center mt-3 text-escher-777e90 text-sm">
                                        <div className="flex items-center gap-2">
                                            <img src="/icons/wallet.svg" />
                                            {props.pool.tokenA.balance?.formattedBalance ?
                                                <div>{addThousandSeparators(props.pool.tokenA.balance?.formattedBalance)}</div>
                                                :
                                                <LdrsAnimation size={10} />
                                            }
                                        </div>
                                        {props.pool.tokenA.balance?.dollarValue ?
                                            <div>${formatNumber(Number(props.pool.tokenA.balance?.dollarValue))}</div>
                                            :
                                            <LdrsAnimation size={10} />
                                        }
                                    </div>
                                </div>

                                {/* Token B */}
                                <div className="flex flex-col p-6 border border-[#e4e8ed] rounded-lg mt-2">
                                    <div className="flex justify-between">
                                        <div className="w-fit flex items-center  gap-2 border border-escher-e4e8ed dark:border-escher-darkblue_border rounded-full bg-escher-F5F6F8 dark:bg-escher-darkblue p-3 pr-4">
                                            {props.pool.tokenB.icon &&
                                                <Image src={props.pool.tokenB.icon} alt="" width={24} height={24} />
                                            }
                                            <div className="text-xl font-semibold text-escher-black dark:text-white">{props.pool.tokenB.symbol}</div>
                                        </div>

                                        <div className="w-1/2 relative self-stretch flex items-center justify-center">
                                            <input
                                                type="text"
                                                placeholder="0"
                                                value={props.fTokenBAmount}
                                                onChange={e => {
                                                    const input = textToNumberRegex(e.target.value);
                                                    if (input) {
                                                        props.setFTokenBAmount(input);
                                                        props.setFTokenAAmount(parseFloat((Number(input) * (props.ratio ?? 1)).toFixed(6)).toString());
                                                    }
                                                }}
                                                onFocus={(e) => e.target.select()}
                                                className="border border-escher-dedfff bg-escher-f5f5ff text-escher-gray900 dark:text-white rounded-full h-full px-4 font-semibold text-2xl w-full"
                                            />
                                            <button
                                                onClick={() => {
                                                    if (props.pool.tokenB.balance) {
                                                        props.setFTokenBAmount(props.pool.tokenB.balance.formattedBalance);
                                                        props.setFTokenAAmount(parseFloat((Number(props.pool.tokenB.balance.formattedBalance) / (props.ratio ?? 1)).toFixed(6)).toString());
                                                    }
                                                }}
                                                className="absolute right-2 text-escher-electricblue bg-escher-dedfff hover:bg-escher-electricblue_light8 transition-all rounded-full px-2 py-1 text-xs font-semibold"
                                            >MAX</button>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center mt-3 text-escher-777e90 text-sm">
                                        <div className="flex items-center gap-2">
                                            <img src="/icons/wallet.svg" />
                                            {props.pool.tokenB.balance?.formattedBalance ?
                                                <div>{addThousandSeparators(props.pool.tokenB.balance?.formattedBalance)}</div>
                                                :
                                                <LdrsAnimation size={10} />
                                            }
                                        </div>
                                        {props.pool.tokenB.balance?.dollarValue ?
                                            <div>${formatNumber(Number(props.pool.tokenB.balance?.dollarValue))}</div>
                                            :
                                            <LdrsAnimation size={10} />
                                        }
                                    </div>
                                </div>
                            </>
                            :
                            <div className="flex items-center justify-center my-4">
                                <LdrsAnimation />
                            </div>
                        }
                    </>
                }

                {
                    props.formType === "single" &&
                    <div className="flex flex-col p-6 border border-[#e4e8ed] rounded-lg mt-2">
                        <div className="flex justify-between">
                            <Select
                                onValueChange={v => {
                                    switch (v) {
                                        case "tokenA":
                                            props.setActiveToken("tokenA");
                                            break;
                                        case "tokenB":
                                            props.setActiveToken("tokenB");
                                            break;
                                    }
                                }}
                                defaultValue="tokenA"
                            >
                                <SelectTrigger className="w-fit flex items-center  gap-2 border border-escher-e4e8ed dark:border-escher-darkblue_border rounded-full bg-escher-F5F6F8 dark:bg-escher-darkblue p-3 pr-4">
                                    {props.activeTokenObj.icon &&
                                        <Image src={props.activeTokenObj.icon} alt="" width={24} height={24} />
                                    }
                                    <div className="text-xl font-semibold text-escher-black dark:text-white">{props.activeTokenObj.symbol}</div>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="tokenA" className="cursor-pointer">
                                        <div className="flex items-center gap-2">
                                            {props.pool.tokenA.icon &&
                                                <Image src={props.pool.tokenA.icon} alt="" width={24} height={24} />
                                            }
                                            <div className="text-xl font-semibold text-escher-black dark:text-white">{props.pool.tokenA.symbol}</div>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="tokenB" className="cursor-pointer">
                                        <div className="flex items-center gap-2">
                                            {props.pool.tokenB.icon &&
                                                <Image src={props.pool.tokenB.icon} alt="" width={24} height={24} />
                                            }
                                            <div className="text-xl font-semibold text-escher-black dark:text-white">{props.pool.tokenB.symbol}</div>
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            <div className="w-1/2 relative self-stretch flex items-center justify-center">
                                <input
                                    type="text"
                                    placeholder="0"
                                    value={props.fTokenAmount}
                                    onChange={e => {
                                        const input = textToNumberRegex(e.target.value);
                                        if (input) {
                                            props.setFTokenAmount(input);
                                        }
                                    }}
                                    onFocus={(e) => e.target.select()}
                                    className="border border-escher-dedfff bg-escher-f5f5ff text-escher-gray900 dark:text-white rounded-full h-full px-4 font-semibold text-2xl w-full"
                                />
                                <button
                                    onClick={() => {
                                        if (props.activeTokenObj.balance) {
                                            props.setFTokenAmount(props.activeTokenObj.balance.formattedBalance);
                                        }
                                    }}
                                    className="absolute right-2 text-escher-electricblue bg-escher-dedfff hover:bg-escher-electricblue_light8 transition-all rounded-full px-2 py-1 text-xs font-semibold"
                                >MAX</button>
                            </div>
                        </div>
                        <div className="flex justify-between items-center mt-3 text-escher-777e90 text-sm">
                            <div className="flex items-center gap-2">
                                <img src="/icons/wallet.svg" />
                                {props.activeTokenObj.balance?.formattedBalance ?
                                    <div>{addThousandSeparators(props.activeTokenObj.balance?.formattedBalance)}</div>
                                    :
                                    <LdrsAnimation size={10} />
                                }
                            </div>
                            {props.activeTokenObj.balance?.dollarValue ?
                                <div>${formatNumber(Number(props.activeTokenObj.balance?.dollarValue))}</div>
                                :
                                <LdrsAnimation size={10} />
                            }
                        </div>
                    </div>
                }

                {
                    props.error &&
                    <div className="bg-red-100 text-red-900 p-2 font-medium rounded-lg flex items-center gap-2">
                        <Icon type="FaExclamationTriangle" />
                        <div className="max-h-[100px] overflow-scroll">{props.error}</div>
                    </div>
                }

                {(props.formType === "single" || (props.formType === "double" && props.ratio)) &&
                    <>
                        <Button onClick={props.submit} title="Add Liquidity" isLoading={props.isLoading} className="mt-10" />
                        <div className="text-sm text-escher-777e90 mt-2 text-center">LP interaction executed via <Link href={props.defi.link} className="text-escher-electricblue" target="_blank">{props.defi.name}</Link> DEX, a third-party service provider.</div>
                    </>
                }
            </div >
        </div >
    );
}

export default Form;