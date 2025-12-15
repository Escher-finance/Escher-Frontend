"use client";

import { useEscher } from "@/components/providers/escherProvider";
import { DialogContent, DialogEmpty, DialogTitle, DialogTrigger } from "@/components/ui/dialog-empty";
import { CHAINS } from "@/configs/chains";
import { useLocalTransactions } from "@/hooks/local/useLocalTransactions";
import { getDateNow } from "@/lib/date";
import { formatDecimal } from "@/lib/utils";
import { Defi, DefiPool } from "@/types/defi";
import { ExecuteInstruction } from "@cosmjs/cosmwasm-stargate";
import { Buffer } from "buffer";
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

export default function RemoveLiquidityTower(props: Props) {
    const [open, setOpen] = useState(false);

    return (
        <DialogEmpty open={open} onOpenChange={v => setOpen(v)}>
            {props.isApps ?
                <DialogTrigger className="h-6 aspect-square bg-escher-D9DAFF dark:bg-white hover:bg-escher-electricblue_light2 transition-all rounded flex items-center justify-center">
                    <Image alt="" src={"/icons/arrow-up-blue.svg"} />
                </DialogTrigger>
                :
                <DialogTrigger className="text-escher-electricblue dark:text-white bg-escher-electricblue_light7 dark:bg-escher-darkblue_1 dark:border border-escher-darkblue_border rounded-full px-4 py-1 font-semibold text-xs">
                    Remove
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
    const { account } = useEscher();
    const { saveData } = useLocalTransactions();

    const [fPercentage, setFPercentage] = useState('50');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string>();
    const [successHash, setSuccessHash] = useState<string>();

    const submit = async () => {
        setError(undefined);
        setIsLoading(true);
        try {
            const inputPercentage = Number(fPercentage);
            if (inputPercentage <= 0 || inputPercentage > 100) {
                throw ("Invalid amount");
            }

            const signingCosmWasmClient = await account.cosmos?.chainContext?.babylon?.getSigningCosmWasmClient();
            if (
                !signingCosmWasmClient ||
                !account.cosmos?.chainContext?.babylon?.address ||
                !props.pool.incentiveAddress ||
                !props.pool.lpTokenAddress ||
                !props.pool.staked_share_amount
            ) {
                console.error({
                    signingCosmWasmClient,
                    address: account.cosmos?.chainContext?.babylon?.address,
                    incentiveAddress: props.pool.incentiveAddress,
                    lpTokenAddress: !props.pool.lpTokenAddress,
                    staked_share_amount: props.pool.staked_share_amount
                });

                throw "Account not connected";
            }

            const inputAmount = (props.pool.staked_share_amount * (inputPercentage / 100)).toFixed(0);
            const instructions: ExecuteInstruction[] = [
                {
                    contractAddress: props.pool.incentiveAddress,
                    msg: {
                        withdraw: {
                            amount: inputAmount,
                            lp_token: props.pool.lpTokenAddress
                        }
                    },
                    funds: []
                },
                {
                    contractAddress: props.pool.lpTokenAddress,
                    msg: {
                        send: {
                            contract: props.pool.poolAddress,
                            amount: inputAmount,
                            msg: Buffer.from(JSON.stringify({ "withdraw_liquidity": {} }), 'binary').toString('base64')
                        }
                    },
                    funds: []
                }
            ];

            console.log({
                instructions
            });

            const res = await signingCosmWasmClient.executeMultiple(account.cosmos?.chainContext?.babylon?.address, instructions, "auto", undefined);
            console.log({ res });
            setSuccessHash(res.transactionHash);
            saveLocal(res.transactionHash);
        } catch (error) {
            console.error(error);
            setError(String(error));
        }

        setIsLoading(false);
    }

    const saveLocal = (txHash: string) => {
        if (!account.cosmos?.chainContext?.babylon?.address) return;

        try {
            saveData({
                lst: "babylon",
                action: "towerRemove",
                amountA: formatDecimal(((props.pool.tokenAStaked ?? 0) * (Number(fPercentage) / 100)), props.pool.tokenA.decimals).toFixed(0),
                amountB: formatDecimal(((props.pool.tokenBStaked ?? 0) * (Number(fPercentage) / 100)), props.pool.tokenB.decimals).toFixed(0),
                channelId: 0,
                denomA: props.pool.tokenA.denom ?? "",
                denomB: props.pool.tokenB.denom ?? "",
                exchangeRate: undefined,
                hash: txHash,
                source: 'local',
                status: "success",
                submitted: undefined,
                time: getDateNow(),
                userAddress: account.cosmos?.chainContext?.babylon?.address,
                recipient: null,
                recipientChannelId: null,
            });
        } catch (error) {
            console.error(error);
        }
    }

    if (successHash) {
        return <Success
            chainName={CHAINS.babylon.chainName ?? ""}
            fPercentage={fPercentage}
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
                fPercentage={fPercentage}
                isLoading={isLoading}
                setFPercentage={setFPercentage}
                setOpen={props.setOpen}
                submit={submit}
            />
        </>
    );
}