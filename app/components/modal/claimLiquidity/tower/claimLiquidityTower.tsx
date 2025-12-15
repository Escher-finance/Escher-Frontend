"use client";

import { DialogContent, DialogEmpty, DialogTitle, DialogTrigger } from "@/components/ui/dialog-empty";
import { CHAINS } from "@/configs/chains";
import { useDefiTowerClaim } from "@/hooks/useDefiTower";
import { Defi, DefiPool } from "@/types/defi";
import Image from "next/image";
import { useState } from "react";
import Form from "./_components/form";
import Success from "./_components/success";

interface Props {
    defi: Defi
    pool: DefiPool
    isApps?: boolean
    setOpen?(val: boolean): void
}

export default function ClaimLiquidityTower(props: Props) {
    const [open, setOpen] = useState(false);

    return (
        <DialogEmpty open={open} onOpenChange={v => setOpen(v)}>
            {props.isApps ?
                <DialogTrigger className="h-6 aspect-square bg-white border border-escher-dedfff dark:border-escher-darkblue_border hover:bg-escher-electricblue_light2 transition-all rounded flex items-center justify-center">
                    <Image alt="" src={"/icons/arrow-turn-up-blue.svg"} />
                </DialogTrigger>
                :
                <DialogTrigger className="text-escher-electricblue dark:text-white bg-escher-electricblue_light7 dark:bg-escher-darkblue_1 dark:border border-escher-darkblue_border rounded-full px-4 py-1 font-semibold text-xs">
                    Claim
                </DialogTrigger>
            }
            <DialogContent className="flex flex-col gap-3 w-fit">
                <DialogTitle className="hidden"></DialogTitle>
                <Content
                    defi={props.defi}
                    pool={props.pool}
                    setOpen={setOpen}
                />
            </DialogContent>
        </DialogEmpty>
    );
}

const Content = (props: Props) => {

    const [error, setError] = useState<string>();
    const [successHash, setSuccessHash] = useState<string>();

    const defiTowerClaim = useDefiTowerClaim({
        onMutate: () => {
            setError(undefined);
        },
        onSuccess: (data) => {
            console.log(data);
            setSuccessHash(data);
        },
        onError: (error) => {
            console.error(error);
            setError(error.message);
        }
    });

    const submit = () => {
        if (
            !props.pool.incentiveAddress ||
            !props.pool.lpTokenAddress
        ) {
            console.error(props.pool);
            return;
        }
        defiTowerClaim.mutate({ incentive_address: props.pool.incentiveAddress, lp_token: props.pool.lpTokenAddress })
    }

    if (successHash) {
        return <Success
            chainName={CHAINS.babylon.chainName ?? ""}
            hash={successHash}
            setOpen={props.setOpen}
        />
    }
    return (
        <>
            <Form
                defi={props.defi}
                pool={props.pool}
                error={error}
                isLoading={defiTowerClaim.isPending}
                setOpen={props.setOpen}
                submit={submit}
            />
        </>
    );
}