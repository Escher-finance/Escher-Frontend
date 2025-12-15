import ComingSoon from "@/components/global/comingSoon";
import clsx from "clsx";
import Image from "next/image";
import { useMemo } from "react";

interface Props {
    symbol: string
    name: string
    logo: string
    enabled: boolean
    active?: boolean
    details?: {
        apr: string
        tvl: string
        ratio: string
    }
    showDetails?: boolean
    onClick?(): void
    themeIsDark: boolean
}

const Token = (props: Props) => {

    const icons = useMemo(() => {
        if (!props.active) {
            return {
                apr: "/icons/chart-03.svg",
                tvl: "/icons/square-lock-check-02.svg",
                ratio: "/icons/coins-swap.svg"
            }
        } else {
            if (props.themeIsDark) {
                return {
                    apr: "/icons/chart-03-white.svg",
                    tvl: "/icons/square-lock-check-02-white.svg",
                    ratio: "/icons/coins-swap-white.svg"
                }
            } else {
                return {
                    apr: "/icons/chart-03-blue.svg",
                    tvl: "/icons/square-lock-check-02-blue.svg",
                    ratio: "/icons/coins-swap-blue.svg"
                }
            }
        }
    }, [props.themeIsDark, props.active]);

    return (
        <button
            className={clsx(
                'flex-1 flex flex-col transition-all rounded-lg px-3 py-4 relative border border-escher-border dark:border-escher-darkblue_border hover:bg-escher-electricblue_light9',
                props.active ? "bg-escher-electricblue_light9 dark:bg-escher-darkblue_2" : "bg-white dark:bg-escher-darkblue"
            )}
            onClick={props.onClick}
        >
            <div className="flex gap-2">
                <Image src={props.logo} alt="" width={32} height={32} className="h-full w-auto" />
                <div className="flex flex-col gap-0 items-start leading-none">
                    <div className="text-sm text-escher-black dark:text-white font-semibold">{props.symbol}</div>
                    <div className="text-xs text-escher-777e90">{props.name}</div>
                </div>
            </div>
            {props.showDetails &&
                <div className={`flex flex-col gap-3 text-[10px] font-semibold mt-3 ${props.active ? 'text-escher-electricblue dark:text-white' : 'text-escher-777e90'}`}>
                    <div className="flex items-center gap-1">
                        <Image src={icons.apr} alt="" height={16} width={16} />
                        <div className="flex-1 text-start">APR</div>
                        <div>{props.details?.apr}</div>
                    </div>
                    <div className="flex items-center gap-1">
                        <Image src={icons.tvl} alt="" height={16} width={16} />
                        <div className="flex-1 text-start">TVL</div>
                        <div>${props.details?.tvl}</div>
                    </div>
                    <div className="flex items-center gap-1">
                        <Image src={icons.ratio} alt="" height={16} width={16} />
                        <div className="flex-1 text-start">Ratio</div>
                        <div>{props.details?.ratio}</div>
                    </div>
                </div>
            }
            {!props.enabled &&
                <ComingSoon brightness="light" />
            }
        </button>
    );
}

export default Token;