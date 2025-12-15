import Button from "@/components/global/button";
import Icon from "@/components/global/icons";
import { formatNumber, towerCanClaim } from "@/lib/utils";
import { Defi, DefiPool } from "@/types/defi";
import Image from "next/image";
import { useMemo } from "react";

interface Props {
    defi: Defi
    pool: DefiPool
    isLoading: boolean
    error?: string
    setOpen?(val: boolean): void
    submit(): void
}

const Form = (props: Props) => {

    const canClaim = useMemo(() => {
        return towerCanClaim(props.pool)
    }, [props.pool]);

    return (
        <div className="min-w-[250px] flex flex-col p-4 gap-2 dark:text-white">
            <div className="text-sm font-medium">Total incentives</div>
            {props.pool.rewards?.map((v, k) =>
                <div key={k} className="w-full bg-escher-f5f6f8 dark:bg-escher-darkblue rounded-lg p-2 flex items-center gap-1">
                    {v.token.icon &&
                        <Image alt="" src={v.token.icon} width={16} height={16} />
                    }
                    <div className="flex-1 font-medium text-escher-black dark:text-white">{v.token.symbol}</div>
                    <div className="font-bold text-escher-black dark:text-white">{formatNumber(v.amount)}</div>
                </div>
            )}
            {props.error &&
                <div className="bg-red-100 text-red-900 p-2 font-medium rounded-lg flex items-center gap-2">
                    <Icon type="FaExclamationTriangle" />
                    <div className="max-h-[100px] overflow-scroll">{props.error}</div>
                </div>
            }
            {!canClaim && <>
                <div className="w-full bg-escher-f5f6f8 dark:bg-escher-darkblue rounded-lg p-2 flex items-center gap-1">
                    {props.pool.tokenA.icon &&
                        <Image alt="" src={props.pool.tokenA.icon} width={16} height={16} />
                    }
                    <div className="flex-1 font-medium text-escher-black dark:text-white">{props.pool.tokenA.symbol}</div>
                    <div className="font-bold text-escher-black dark:text-white">0</div>
                </div>
                <div className="w-full bg-escher-f5f6f8 dark:bg-escher-darkblue rounded-lg p-2 flex items-center gap-1">
                    {props.pool.tokenB.icon &&
                        <Image alt="" src={props.pool.tokenB.icon} width={16} height={16} />
                    }
                    <div className="flex-1 font-medium text-escher-black dark:text-white">{props.pool.tokenB.symbol}</div>
                    <div className="font-bold text-escher-black dark:text-white">0</div>
                </div>
            </>}
            <Button
                onClick={props.submit}
                title={canClaim ? "Claim Incentives" : "No claimable reward"}
                isLoading={props.isLoading}
                className="mt-2"
                enabled={canClaim} />
        </div>
    );
}

export default Form;