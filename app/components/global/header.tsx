import { APP_CONFIG } from "@/configs/app";
import useDefi from "@/hooks/defi/useDefi";
import { usePoints } from "@/hooks/usePoints";
import { formatNumber } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { useTheme } from "../providers/themeProvider";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import AccountButton from "./accountButton/accountButton";
import BabyDeposit from "./babyDeposit";
import Icon from "./icons";

const Header = () => {
    const { themeIsDark } = useTheme();
    const pathName = usePathname();
    const { queryPoints, totalPoints } = usePoints();
    const { uniswap } = useDefi();

    const title = useMemo(() => {
        switch (pathName) {
            case '/':
                return 'Home';

            case '/liquid-staking':
                return 'Liquid Staking';

            case '/native-staking':
                return 'Native Staking';

            case '/apps':
                return 'Apps';

            case '/playground':
                return 'Playground';

            default:
                return '';
        }
    }, [pathName]);

    const inRange = useMemo(() => {
        // DEBUG
        // return false;

        let res = true;
        uniswap.pools.map(v => {
            if (v.position?.isInRange === false) {
                res = false;
            }
        })
        return res;
    }, [uniswap]);

    return (
        <section className="bg-white dark:bg-escher-darkblue_1 dark:text-white border-b border-escher-gray200 dark:border-escher-darkblue_border flex items-center justify-between px-8 py-4">
            <div
                className="font-bold text-2xl"
                onClick={() => console.log({ uniswap })}
            >{title}</div>
            <div className="flex gap-6 h-12">
                {!inRange &&
                    <TooltipProvider>
                        <Tooltip delayDuration={0}>
                            <TooltipTrigger
                                className="flex self-center items-center font-semibold text-sm px-2 py-2 rounded gap-2 bg-yellow-600 text-yellow-50"
                            >
                                <Icon type={"FaExclamationTriangle"} size="sm" />
                                <div className="leading-none">LP out of range</div>
                            </TooltipTrigger>
                            <TooltipContent
                                className="bg-white flex flex-col gap-2 text-escher-black border border-escher-electricblue px-4 py-3 font-medium"
                            >
                                <div className="text-sm max-w-[360px]">
                                    Looks like one or more of your LP positions have moved out of range. You can manage them in your DeFi Hub.
                                </div>
                                <Link
                                    href={"/defi-hub?tab=lp"}
                                    className="bg-escher-electricblue hover:bg-escher-electricblue_light1 rounded p-2 self-end text-white font-semibold flex items-center gap-2"
                                >
                                    <div>Go to DeFi Hub</div>
                                    <Icon type="FiExternalLink" size="sm" />
                                </Link>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                }
                {!APP_CONFIG.networkIsTestnet &&
                    <div className="flex items-center gap-1 text-escher-electricblue dark:text-white font-medium" onClick={() => console.log({ query: queryPoints.data })}>
                        <Image src={themeIsDark ? "/images/epoint-white.svg" : "/images/epoint.svg"} alt="" width={20} height={20} />
                        <div>{formatNumber((totalPoints), false)} ePoints</div>
                    </div>
                }
                {/* 
                    {APP_CONFIG.network === "testnet" &&
                        <Faucet />
                    }
                 */}
                {!APP_CONFIG.networkIsTestnet &&
                    <BabyDeposit />
                }

                <AccountButton />
            </div>
        </section >
    );
}

export default Header;