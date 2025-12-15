import { AddressLuckyDraw } from "@/app/lucky-draw/page";
import Button from "@/components/global/button";
import Card from "@/components/global/card";
import LdrsAnimation from "@/components/global/ldrsAnimation";
import { useEscher } from "@/components/providers/escherProvider";
import { useTheme } from "@/components/providers/themeProvider";
import { BABYLON_CONTRACTS } from "@/configs/babylon";
import { shortenAddress } from "@/lib/text";
import { buildUrl, formatNumber } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";

interface Props {
    address: AddressLuckyDraw
}

export default function Tickets(props: Props) {
    const { themeIsDark } = useTheme();
    const { setOpenWalletConnection } = useEscher();
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yy = String(today.getFullYear()).slice(-2);
    const formatted = `${dd}.${mm}.${yy}`;

    const getUserTickets = async () => {
        const response = await fetch(buildUrl("/api/lucky-draw/user-total", [
            { key: "babylon", value: props.address.babylon },
            { key: "ethereum", value: props.address.ethereum }
        ]), {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });

        const result = (await response.json()) as { babylon: number, ethereum: number };
        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }

        return result.babylon + result.ethereum;
    }

    const queryUserTickets = useQuery({
        queryKey: ["luckydraw", "user-total", props.address.babylon, props.address.ethereum],
        queryFn: getUserTickets,
        enabled: !!props.address.babylon || !!props.address.ethereum
    });

    // Countdown 
    const [countdown, setCountdown] = useState<number>(0);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const { data: remainingSeconds } = useQuery({
        queryKey: ['lottery', 'remaining'],
        queryFn: getRemainingMintSeconds,
        refetchOnWindowFocus: false,
        refetchInterval: 3 * 60 * 1000,
    });

    useEffect(() => {
        if (!remainingSeconds) return

        setCountdown(remainingSeconds)

        if (intervalRef.current) clearInterval(intervalRef.current)

        intervalRef.current = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(intervalRef.current!)
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current)
        }
    }, [remainingSeconds]);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const countdownData = useMemo(() => {
        if (countdown <= 0) return null
        return convertSecondsToTimeParts(countdown)
    }, [countdown]);

    return (
        <Card className="text-sm dark:bg-escher-dark_0c203d min-h-[280px]">
            <div
                className="text-escher-667085 dark:text-white"
                onClick={() => console.log({ queryUserTickets })}
            >My Total Number of Tickets</div>

            {props.address.babylon || props.address.ethereum ?
                <div
                    className="flex-1 flex flex-col justify-between px-4 pb-3 rounded-lg mt-4 
                    bg-[url('/images/lottery/bg-tickets.png?v=1')] dark:bg-[url('/images/lottery/bg-tickets-dark.jpeg')] bg-cover 
                    shadow-lg hover:shadow-xl hover:shadow-escher-electricblue_light4 transition-all shadow-escher-electricblue_light4 dark:shadow-[#1c2f4b]
                    dark:border dark:border-[#ffffff10] 
                    hover:scale-[1.025]"
                >

                    <div className="flex justify-between items-center text-escher-electricblue dark:text-white font-medium mt-4">
                        <Image alt="" src={themeIsDark ? "/images/lottery/clover-white.svg" : "/images/lottery/clover.svg"} alt="" className="w-8 h-8" />
                        {/* 
                        <div className="flex flex-col gap-1 items-end">
                            <div className="flex items-center gap-1">
                                <div className="text-[8px] leading-none">Next ticket minting</div>
                                <TooltipProvider>
                                    <Tooltip delayDuration={0}>
                                        <TooltipTrigger>
                                            <Icon type="FiInfo" size="xs" />
                                        </TooltipTrigger>
                                        <TooltipContent className="bg-white text-escher-text2 shadow-lg border max-w-[250px]">
                                            <div>Tickets are minted every 24 hours based on your average eBABY balance (in USD equivalent) over the past day.</div>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                            {countdownData ?
                                <div className="font-semibold text-sm leading-none">{countdownData.hours}h:{countdownData.minutes}m:{countdownData.seconds}s</div>
                                :
                                <div className={clsx(
                                    "mt-1 font-medium text-[8px] bg-opacity-70 rounded-full p-1 flex items-center gap-1",
                                    isFetched && "bg-escher-electricblue_light7"
                                )}>
                                    {isFetched &&
                                        <div className="leading-none">minting in progress</div>
                                    }
                                    <LdrsAnimation size={18} />
                                </div>
                            }
                        </div>
                         */}
                    </div>

                    {queryUserTickets.isFetched ?
                        <div className="font-bold text-[32px] text-escher-electricblue dark:text-white leading-none">{formatNumber(Number(queryUserTickets.data ?? 0), false)}</div>
                        :
                        <div className="mt-2">
                            <LdrsAnimation />
                        </div>
                    }
                    <div className="flex items-end justify-between mt-4">
                        <div className="flex justify-between items-start">
                            <div className="flex flex-col">
                                {props.address.babylon &&
                                    <div className="text-escher-electricblue dark:text-white font-semibold text-xs">{shortenAddress(props.address.babylon)}</div>
                                }
                                {props.address.ethereum &&
                                    <div className="text-escher-electricblue dark:text-white font-semibold text-xs">{shortenAddress(props.address.ethereum)}</div>
                                }
                                <div className="text-xs text-gray-500">{formatted}</div>
                            </div>
                        </div>
                        <Image alt="" src={themeIsDark ? "/images/escher-white.svg" : "/images/escher-blue.svg"} className="w-6 h-6" />
                    </div>
                </div>
                :
                <Button
                    title="Connect Wallet"
                    className="mt-4"
                    onClick={() => setOpenWalletConnection(true)}
                />
            }
        </Card>
    );
}

function convertSecondsToTimeParts(totalSeconds: number) {
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = Math.floor(totalSeconds % 60)

    return {
        hours: String(hours).padStart(2, '0'),
        minutes: String(minutes).padStart(2, '0'),
        seconds: String(seconds).padStart(2, '0'),
    }
}

const getRemainingMintSeconds = async () => {
    // sleep(3);
    const [babylonRes, lotteryRes] = await Promise.all([
        fetch(`${BABYLON_CONTRACTS.rpc}/status`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        }),
        fetch(`/api/lucky-draw/latest`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        }),
    ]);

    const latestHeight = Number((await babylonRes.json()).result.sync_info.latest_block_height);
    const lotteryHeight = Number((await lotteryRes.json())[0].height);

    const blocksPerDay = 360 * 24;
    const nextMintBlock = lotteryHeight + blocksPerDay;
    const remainingBlocks = nextMintBlock - latestHeight;
    const seconds = remainingBlocks * 10;

    return seconds
}
