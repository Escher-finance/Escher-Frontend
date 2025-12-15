import { LiquidStaking } from "@/types/chain"
import dayjs from "dayjs"

export interface ButtonStatus {
    enabled: boolean
    text: string
}

export const getRemainingMintSeconds = async (lst: LiquidStaking) => {
    const res = await fetch(`/api/unbond-next-batch?lst=${lst}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    }).then(v => v.json()) as {
        id: number
        submitted: string
        released: string | null
        undelegate_amount: string
        unstake_amount: string
    }[]

    if (res.length === 0) return undefined;

    const nextBatchSubmitted = res[0].submitted;
    const diffInSeconds = dayjs().diff(dayjs(nextBatchSubmitted), 'seconds');

    return diffInSeconds;
}
