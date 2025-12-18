import LdrsAnimation from "@/components/global/ldrsAnimation";
import { useTheme } from "@/components/providers/themeProvider";
import { formatNumber } from "@/lib/utils";
import Image from "next/image";
import { useMemo, useState } from "react";

interface Props {
    tvl?: number
    apr?: number
    exchangeRate?: { rate: number, baseSymbol: string, liquidSymbol: string }
}

const RateApr = (props: Props) => {
    const { themeIsDark } = useTheme();
    const [ratioIsLiquid, setRatioIsLiquid] = useState(true);

    const icons = useMemo(() => {
        if (themeIsDark) {
            return {
                apr: "/icons/chart-03-white.svg",
                tvl: "/icons/square-lock-check-02-white.svg",
                ratio: "/icons/coins-swap-white.svg"
            }
        } else {
            return {
                apr: "/icons/staking/apr_icon.svg",
                tvl: "/icons/staking/tvl_icon.svg",
                ratio: "/icons/staking/ratio_icon.svg"
            }
        }

    }, [themeIsDark]);

    const ratioText = useMemo(() => {
        if (ratioIsLiquid) {
            return {
                symbol: props.exchangeRate?.baseSymbol,
                ratio: `1 : ${parseFloat(Number(props.exchangeRate?.rate ?? 0).toFixed(4)).toString()}`
            }
        } else {
            return {
                symbol: props.exchangeRate?.liquidSymbol,
                ratio: `1 : ${parseFloat(Number(1 / (props.exchangeRate?.rate ?? 0)).toFixed(4)).toString()}`
            }
        }
    }, [props.exchangeRate, ratioIsLiquid]);

    return (
        <div className="flex gap-2">
            {/* TVL */}
            <div className="flex-1 flex flex-col items-center font-semibold bg-white dark:bg-escher-dark_0c203d rounded-lg border border-escher-e4e8ed dark:border-escher-darkblue_border px-4 py-3">
                <Image src={icons.tvl} alt="" width={24} height={24} />
                <div className="text-escher-electricblue dark:text-white text-sm">TVL</div>
                {props.tvl ?
                    <div className="text-escher-black dark:text-white text-xl mt-2">${formatNumber(props.tvl)}</div>
                    :
                    <div className="mt-2">
                        <LdrsAnimation />
                    </div>
                }
            </div>

            {/* APR */}
            <div className="flex-1 flex flex-col items-center font-semibold bg-white dark:bg-escher-dark_0c203d rounded-lg border border-escher-e4e8ed dark:border-escher-darkblue_border px-4 py-3">
                <Image src={icons.apr} alt="" width={24} height={24} />
                <div className="text-escher-electricblue dark:text-white text-sm">APR</div>
                {props.apr ?
                    <div className="text-escher-black dark:text-white text-xl mt-2">{props.apr?.toFixed(2)}%</div>
                    :
                    <div className="mt-2">
                        <LdrsAnimation />
                    </div>
                }
            </div>

            {/* RATIO */}
            <button
                className="flex-1 flex flex-col items-center font-semibold bg-white dark:bg-escher-dark_0c203d hover:bg-escher-electricblue_light9 transition-all rounded-lg border border-escher-e4e8ed dark:border-escher-darkblue_border px-4 py-3"
                onClick={() => setRatioIsLiquid(prev => !prev)}
            >
                <Image src={icons.ratio} alt="" width={24} height={24} />
                <div className="text-escher-electricblue dark:text-white text-sm">RATIO TO {ratioText.symbol}</div>
                {props.exchangeRate?.rate ?
                    <div className="text-escher-black dark:text-white text-xl mt-2 whitespace-nowrap">
                        {ratioText.ratio}
                    </div>
                    :
                    <div className="mt-2">
                        <LdrsAnimation />
                    </div>
                }
            </button>
        </div>
    );
}

export default RateApr;