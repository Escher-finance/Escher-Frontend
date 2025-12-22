import Button from "@/components/global/button";
import Icon from "@/components/global/icons";
import { useEscher } from "@/components/providers/escherProvider";
import { Slider } from "@/components/ui/slider";
import { formatNumber } from "@/lib/utils";
import { Defi, DefiPool } from "@/types/defi";
import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";

interface Props {
    defi: Defi
    error?: string
    fPercentage: string
    isLoading: boolean
    pool: DefiPool
    setFPercentage(val: string): void
    setOpen?(val: boolean): void
    submit(): void
}

const Form = (props: Props) => {
    const { account, setOpenWalletConnection } = useEscher();

    const result = useMemo(() => {
        return {
            tokenA: (props.pool.tokenAStaked ?? 0) * (Number(props.fPercentage) / 100),
            tokenB: (props.pool.tokenBStaked ?? 0) * (Number(props.fPercentage) / 100)
        }
    }, [props.fPercentage, props.pool.tokenAStaked, props.pool.tokenBStaked]);

    return (
        <div className="min-w-[536px] flex flex-col">
            <div className="flex justify-between items-center bg-linear-to-r from-[#FBEBC8] to-transparent rounded-t-lg p-6">
                <div className="flex-1 flex items-center gap-2 leading-none">
                    <div className="text-escher-black text-xl font-bold">Remove Liquidity</div>
                    <div className="flex items-center gap-1.5 rounded-full p-1 pr-2 bg-[#FAE5B9]">
                        <Image src="/images/apps/app-tower-circle.png" alt="" width={16} height={16} className="border border-white rounded-full" />
                        <div className="text-escher-text2 text-sm font-medium">Tower</div>
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

                <div className="flex items-center">
                    {props.pool.tokenA.icon &&
                        <Image src={props.pool.tokenA.icon} alt="" width={28} height={28} className="z-10" />
                    }
                    {props.pool.tokenB.icon &&
                        <Image src={props.pool.tokenB.icon} alt="" width={28} height={28} className="-ml-2" />
                    }
                    <div className="flex flex-col ml-4">
                        <div className="text-xl font-semibold text-escher-black dark:text-white">
                            {props.pool.tokenA.symbol} / {props.pool.tokenB.symbol}
                        </div>
                    </div>
                </div>

                <div className="mt-8 text-escher-777e90 text-sm">Available Staked Deposit</div>
                <div className="grid grid-cols-2 gap-2 text-escher-black dark:text-white mt-2">
                    <div className="flex flex-col gap-3 p-4 border border-escher-e4e8ed dark:border-escher-darkblue_border rounded-lg">
                        <div className="flex items-center gap-2">
                            {props.pool.tokenA.icon &&
                                <Image src={props.pool.tokenA.icon} alt="" width={24} height={24} />
                            }
                            <div className="text-sm font-medium">{props.pool.tokenA.symbol}</div>
                        </div>
                        <div className="text-xl font-semibold">{formatNumber(props.pool.tokenAStaked ?? 0)}</div>
                    </div>

                    <div className="flex flex-col gap-3 p-4 border border-escher-e4e8ed dark:border-escher-darkblue_border rounded-lg">
                        <div className="flex items-center gap-2">
                            {props.pool.tokenB.icon &&
                                <Image src={props.pool.tokenB.icon} alt="" width={24} height={24} />
                            }
                            <div className="text-sm font-medium">{props.pool.tokenB.symbol}</div>
                        </div>
                        <div className="text-xl font-semibold">{formatNumber(props.pool.tokenBStaked ?? 0)}</div>
                    </div>
                </div>

                <div className="mt-8 text-escher-777e90 text-sm">Remove Liquidity</div>
                <div className="flex items-center self-start w-[110px] text-xl bg-escher-f5f5ff dark:bg-escher-darkblue border border-escher-dedfff dark:border-escher-darkblue_border rounded-full px-3 py-2 mt-2">
                    <div className="flex-1">
                        <input
                            type="number"
                            placeholder="0"
                            value={props.fPercentage}
                            onChange={e => {
                                props.setFPercentage(e.target.value);
                            }}
                            onFocus={(e) => e.target.select()}
                            className="w-full text-escher-black dark:text-white font-semibold bg-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:hidden [&::-webkit-inner-spin-button]:hidden outline-none focus:ring-0 focus:border-transparent"
                        />
                    </div>
                    <div className="text-escher-electricblue dark:text-white opacity-20 font-bold border-l-2 border-escher-electricblue border-opacity-50 pl-2">%</div>
                </div>
                <Slider
                    defaultValue={[Number(props.fPercentage)]}
                    value={[Number(props.fPercentage)]}
                    onValueChange={v => props.setFPercentage(v[0].toFixed(0))}
                    max={100}
                    step={1}
                    className="mt-4"
                />
                <div className="flex items-center justify-between mt-3 text-escher-777e90 text-sm">
                    <div>0%</div>
                    <div>25%</div>
                    <div>50%</div>
                    <div>75%</div>
                    <div>100%</div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-escher-777e90 mt-8">
                    <div className="flex flex-col gap-3 p-4 border border-escher-e4e8ed dark:border-escher-darkblue_border rounded-lg bg-escher-f5f6f8 dark:bg-escher-darkblue">
                        <div className="flex items-center gap-2">
                            {props.pool.tokenA.icon &&
                                <Image src={props.pool.tokenA.icon} alt="" width={24} height={24} />
                            }
                            <div className="text-sm font-medium">{props.pool.tokenA.symbol}</div>
                        </div>
                        <div className="text-xl font-semibold">{formatNumber(result.tokenA)}</div>
                    </div>

                    <div className="flex flex-col gap-3 p-4 border border-escher-e4e8ed dark:border-escher-darkblue_border rounded-lg bg-escher-f5f6f8 dark:bg-escher-darkblue">
                        <div className="flex items-center gap-2">
                            {props.pool.tokenB.icon &&
                                <Image src={props.pool.tokenB.icon} alt="" width={24} height={24} />
                            }
                            <div className="text-sm font-medium">{props.pool.tokenB.symbol}</div>
                        </div>
                        <div className="text-xl font-semibold">{formatNumber(result.tokenB)}</div>
                    </div>
                </div>

                {props.error &&
                    <div className="bg-red-100 text-red-900 p-2 font-medium rounded-lg flex items-center gap-2 mt-8">
                        <Icon type="FaExclamationTriangle" />
                        <div>{props.error}</div>
                    </div>
                }

                {account.cosmos?.isConnected ?
                    <Button onClick={props.submit} title="Remove Liquidity" isLoading={props.isLoading} className="mt-8" />
                    :
                    <Button onClick={() => setOpenWalletConnection(true)} title="Connect Wallet" />
                }
                <div className="text-sm text-escher-777e90 mt-2 text-center">LP interaction executed via <Link href={"https://app.tower.fi/pools"} className="text-escher-electricblue dark:text-white" target="_blank">Tower</Link> DEX, a third-party service provider.</div>
            </div>
        </div>
    );
}

export default Form;