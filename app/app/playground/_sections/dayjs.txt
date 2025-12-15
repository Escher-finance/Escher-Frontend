import Card from '@/components/global/card'
import Button from '@/components/global/button'
import { BABYLON_CONTRACTS } from '@/configs/babylon';
import { useEffect, useMemo, useRef, useState } from 'react';
import LdrsAnimation from '@/components/global/ldrsAnimation';
import { useQuery } from '@tanstack/react-query'

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

const Dayjs = () => {
    const [countdown, setCountdown] = useState<number>(0);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const { data: remainingSeconds, refetch } = useQuery({
        queryKey: ['lottery', 'remaining'],
        queryFn: getRemainingMintSeconds,
        refetchOnWindowFocus: false,
        refetchInterval: 5 * 60 * 1000,
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

    const display = useMemo(() => {
        if (countdown <= 0) return null
        return convertSecondsToTimeParts(countdown)
    }, [countdown]);

    return (
        <Card className="items-start gap-0 text-sm">
            <div className="w-full flex justify-between items-center">
                <div className="text-xl font-semibold text-escher-gray900 dark:text-white">Lottery height</div>
            </div>
            <hr className="border border-t border-escher-gray200 dark:border-escher-darkblue_border w-full mb-4" />
            <Button onClick={() => refetch()} title="Test" />
            {display ? (
                <div>Mint in: {display.hours}:{display.minutes}:{display.seconds}</div>
            ) : (
                <LdrsAnimation />
            )}
        </Card>
    )
}

export default Dayjs