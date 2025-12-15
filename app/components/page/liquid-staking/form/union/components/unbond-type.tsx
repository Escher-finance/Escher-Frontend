import LdrsAnimation from "@/components/global/ldrsAnimation";
import { UNION_CONTRACTS } from "@/configs/union";
import { convertSecondsToTimeParts } from "@/lib/date";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { getRemainingMintSeconds } from "../../shared/shared";
import UnbondTypeOption from "../../shared/unbond-type-option";

interface Props {
    setUnbondWait(val: boolean): void
    unbondWait: boolean
}

const UnbondType = (props: Props) => {
    const [countdown, setCountdown] = useState<number>(0);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const { data: oldestBatchSeconds } = useQuery({
        queryKey: ['unbond-next-batch', 'union'],
        queryFn: () => getRemainingMintSeconds("union"),
        refetchOnWindowFocus: false,
        refetchInterval: 3 * 60 * 1000,
    });

    const remainingSeconds = useMemo(() => {
        if (!oldestBatchSeconds) return undefined;
        const res = UNION_CONTRACTS.mainnet.unbondingPeriod - oldestBatchSeconds;
        if (res <= 0) return undefined;
        return res;
    }, [oldestBatchSeconds]);

    const countdownData = useMemo(() => {
        if (countdown <= 0) return undefined;

        return convertSecondsToTimeParts(countdown)
    }, [countdown]);

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

    return (
        <div className="flex flex-col gap-2 mt-6">
            <div className="border border-gray-300 dark:border-escher-darkblue_border px-3 py-2 rounded-lg self-start flex flex-col gap-2 mb-2 font-medium text-sm">
                <div
                    className="text-xs text-escher-text4 dark:text-gray-500 leading-none"
                    onClick={() => { }}
                >Next unbonding batch :</div>
                {countdownData ?
                    <div className="text-gray-500 dark:text-gray-300 leading-none font-semibold">
                        {String(countdownData.days)}d<span className="text-gray-400 dark:text-gray-500 mx-0.5">:</span>
                        {String(countdownData.hours).padStart(2, "0")}h<span className="text-gray-400 dark:text-gray-500 mx-0.5">:</span>
                        {String(countdownData.minutes).padStart(2, "0")}m<span className="text-gray-400 dark:text-gray-500 mx-0.5">:</span>
                        {String(countdownData.seconds).padStart(2, "0")}s
                    </div>
                    :

                    <LdrsAnimation size={18} />
                }
            </div>
            <div className="text-sm text-escher-text4 dark:text-white">Select a swap method</div>
            <div className="flex items-center justify-between gap-4">
                <UnbondTypeOption
                    active={props.unbondWait}
                    title="Standard"
                    subtitle="27 - 31 days unbonding"
                    onClick={() => props.setUnbondWait(true)}
                />

                <UnbondTypeOption
                    active={!props.unbondWait}
                    title="Immediate Swap"
                    subtitle="Swap your eU into U"
                    onClick={() => props.setUnbondWait(false)}
                />
            </div>
        </div>
    );
}

export default UnbondType;