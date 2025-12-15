"use client";

import { useEscher } from "@/components/providers/escherProvider";
import {
    DialogContent,
    DialogEmpty,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog-empty";
import { useUniswapClaimReward } from "@/hooks/defi/uniswap/useUniswapClaimReward";
import { useUniswapPool } from "@/hooks/defi/uniswap/useUniswapDefi";
import { getErrorMessage } from "@/lib/error-msg";
import { uniswapCanClaim } from "@/lib/utils";
import { Defi, DefiPool } from "@/types/defi";
import Image from "next/image";
import { useMemo, useState } from "react";
import { Address } from "viem";
import { usePublicClient, useWalletClient } from "wagmi";
import Form from "./_components/form";
import Success from "./_components/success";

interface Props {
    defi: Defi;
    pool: DefiPool;
    isApps?: boolean;
    setOpen?(val: boolean): void;
}

export default function ClaimLiquidityUniswap(props: Props) {
    const [open, setOpen] = useState(false);

    const canClaim = useMemo(() => {
        return uniswapCanClaim(props.pool);
    }, [props.pool]);

    if (!canClaim) {
        return <></>;
    }

    return (
        <DialogEmpty open={open} onOpenChange={(v) => setOpen(v)}>
            {props.isApps ? (
                <DialogTrigger className="h-6 aspect-square bg-white border border-escher-dedfff dark:border-escher-darkblue_border hover:bg-escher-electricblue_light2 transition-all rounded flex items-center justify-center">
                    <Image alt="" src={"/icons/arrow-turn-up-blue.svg"} />
                </DialogTrigger>
            ) : (
                <DialogTrigger className="text-escher-electricblue dark:text-white bg-escher-electricblue_light7 dark:bg-escher-darkblue_1 dark:border border-escher-darkblue_border rounded-full px-4 py-1 font-semibold text-xs">
                    Claim
                </DialogTrigger>
            )}
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
    const { account } = useEscher();
    const publicClient = usePublicClient();
    const { data: walletClient } = useWalletClient();

    const queryPool = useUniswapPool({
        address: account.evm?.address as `0x${string}` | undefined,
        pool: props.pool,
        publicClient: publicClient,
    });

    // TODO: Use statuses here
    const { claimRewards } = useUniswapClaimReward();
    const [successTxHash, setSuccessTxHash] = useState<string>();
    const [isPending, setIsPending] = useState(false);
    const [error, setError] = useState<string>();

    const submit = async () => {
        if (
            !publicClient ||
            !queryPool.position ||
            !account.evm?.address ||
            !publicClient ||
            !walletClient
        ) {
            throw "invalid data";
        }

        setIsPending(true);
        try {
            const hash = await claimRewards({
                address: account.evm.address as Address,
                pool: props.pool,
                position: queryPool.position,
                publicClient,
                walletClient,
            });
            setSuccessTxHash(hash);
        } catch (error) {
            setError(getErrorMessage(String(error))?.join(". "));
        }
        setIsPending(false);
    };

    if (successTxHash) {
        return (
            <Success
                chainName={walletClient?.chain.name ?? ""}
                hash={successTxHash}
                setOpen={props.setOpen}
            />
        );
    }
    return (
        <>
            <Form
                defi={props.defi}
                pool={props.pool}
                position={queryPool.position}
                error={error}
                isLoading={isPending}
                setOpen={props.setOpen}
                submit={submit}
            />
        </>
    );
};

