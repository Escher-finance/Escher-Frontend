"use client";

import { useEscher } from "@/components/providers/escherProvider";
import { DialogContent, DialogEmpty, DialogTitle, DialogTrigger } from "@/components/ui/dialog-empty";
import { APP_CONFIG } from "@/configs/app";
import { useLocalTransactions } from "@/hooks/local/useLocalTransactions";
import { useCw20Allowance } from "@/hooks/useCw20Allowance";
import { sleep } from "@/lib";
import { getDateNow } from "@/lib/date";
import { formatDecimal } from "@/lib/utils";
import { CustomToken } from "@/types/chain";
import { Defi, DefiPool } from "@/types/defi";
import { Coin } from "@cosmjs/stargate";
import { useQuery } from "@tanstack/react-query";
import BigNumber from "bignumber.js";
import Image from "next/image";
import { useCallback, useMemo, useState } from "react";
import Form from "./_components/form";
import Success from "./_components/success";

interface Props {
    defi: Defi
    pool: DefiPool
    isApps?: boolean
    setOpen?(val: boolean): void
}

export default function AddLiquidityTower(props: Props) {
    const [open, setOpen] = useState(false);

    return (
        <DialogEmpty open={open} onOpenChange={v => setOpen(v)}>
            {props.isApps ?
                <DialogTrigger className="h-6 aspect-square bg-escher-D9DAFF dark:bg-white hover:bg-escher-electricblue_light2 transition-all rounded flex items-center justify-center">
                    <Image alt="" src={"/icons/arrow-down-blue.svg"} />
                </DialogTrigger>
                :
                <DialogTrigger className="text-escher-electricblue dark:text-white bg-escher-electricblue_light7 dark:bg-escher-darkblue_1 dark:border border-escher-darkblue_border rounded-full px-4 py-1 font-semibold text-xs">
                    Add
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
    const { increaseAllowance } = useCw20Allowance();
    const { saveData } = useLocalTransactions();

    const [activeToken, setActiveToken] = useState<"tokenA" | "tokenB">("tokenA");
    const [fTokenAmount, setFTokenAmount] = useState('0');
    const [fTokenAAmount, setFTokenAAmount] = useState('0');
    const [fTokenBAmount, setFTokenBAmount] = useState('0');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string>();
    const [successHash, setSuccessHash] = useState<string>();
    const [formType, setFormType] = useState<'single' | 'double'>('double');

    const activeTokenObj = useMemo(() => {
        switch (activeToken) {
            case "tokenA":
                return props.pool.tokenA;

            case "tokenB":
                return props.pool.tokenB;
        }
    }, [activeToken, props.pool.tokenA, props.pool.tokenB]);

    const getRatio = useCallback(async () => {
        try {
            const client = await account.cosmos?.chainContext?.babylon.getCosmWasmClient();
            const assetsResponse = await client?.queryContractSmart(
                props.pool.poolAddress,
                {
                    config: {},
                }
            );
            const params = JSON.parse(atob(assetsResponse.params));
            console.log("ratio", params);

            return {
                priceScale: Number(params.price_scale)
            }

        } catch (error) {
            console.error(error);
            return undefined;
        }
    }, [account.cosmos?.chainContext?.babylon, props.pool.poolAddress]);

    const ratioQuery = useQuery({
        queryKey: ["ratio", props.pool.poolAddress],
        queryFn: getRatio,
        refetchInterval: APP_CONFIG.balanceRefetchInterval,
        staleTime: APP_CONFIG.balanceRefetchInterval,
    });

    const getTokenInfo = (token: CustomToken) => {
        return token.isNative ? {
            "native_token": {
                "denom": token.denom
            }
        } : {
            "token": {
                "contract_addr": token.denom
            }
        }
    }

    const submit = async () => {
        setError(undefined);
        setIsLoading(true);
        try {
            let inputAmount: string | undefined = undefined;
            let inputAAmount: string | undefined = undefined;
            let inputBAmount: string | undefined = undefined;

            if (formType === "double") {
                inputAAmount = BigNumber(fTokenAAmount).shiftedBy(props.pool.tokenA.decimals).toNumber().toFixed(0);
                inputBAmount = BigNumber(fTokenBAmount).shiftedBy(props.pool.tokenB.decimals).toNumber().toFixed(0);
                if (Number(inputAAmount) <= 0 || Number(inputBAmount) <= 0) {
                    throw ("Invalid amount");
                }
                if (
                    Number(inputAAmount) > Number(props.pool.tokenA.balance?.value) ||
                    Number(inputBAmount) > Number(props.pool.tokenB.balance?.value)
                ) {
                    throw "Insufficient balance"
                }
            }

            if (formType === "single") {
                inputAmount = BigNumber(fTokenAmount).shiftedBy(activeTokenObj.decimals).toNumber().toFixed(0);
                if (Number(inputAmount) <= 0) {
                    throw ("Invalid amount");
                }
                if (Number(inputAmount) > Number(activeTokenObj.balance?.value)) {
                    throw "Insufficient balance"
                }
            }

            const signingCosmWasmClient = await account.cosmos?.chainContext?.babylon?.getSigningCosmWasmClient();
            if (!account.cosmos?.chainContext?.babylon?.address || !signingCosmWasmClient) {
                throw "Account not connected";
            }

            let msg;
            const funds: Coin[] = [];
            switch (formType) {
                case "single":
                    {
                        const msgToken = getTokenInfo(activeTokenObj);
                        msg = {
                            "provide_liquidity": {
                                "auto_stake": true,
                                "assets": [
                                    {
                                        "info": msgToken,
                                        "amount": inputAmount
                                    }
                                ],
                                "slippage_tolerance": "0.0004"
                            }
                        };
                        if (activeTokenObj.isNative && inputAmount && activeTokenObj.denom) {
                            funds.push({
                                amount: inputAmount,
                                denom: activeTokenObj.denom
                            });
                        }
                        break;
                    }

                case "double":
                    {
                        const msgAToken = getTokenInfo(props.pool.tokenA);
                        const msgBToken = getTokenInfo(props.pool.tokenB);
                        msg = {
                            "provide_liquidity": {
                                "auto_stake": true,
                                "assets": [
                                    {
                                        "info": msgAToken,
                                        "amount": inputAAmount
                                    },
                                    {
                                        "info": msgBToken,
                                        "amount": inputBAmount
                                    }
                                ],
                                "slippage_tolerance": "0.0004"
                            }
                        };
                        if (props.pool.tokenA.isNative && inputAAmount && props.pool.tokenA.denom) {
                            funds.push({
                                amount: inputAAmount,
                                denom: props.pool.tokenA.denom
                            });
                        }
                        if (props.pool.tokenB.isNative && inputBAmount && props.pool.tokenB.denom) {
                            funds.push({
                                amount: inputBAmount,
                                denom: props.pool.tokenB.denom
                            });
                        }
                        break;
                    }
            }

            console.log({
                msg, funds
            });

            // Allowance
            if (formType === "double") {
                if (props.pool.tokenA.isCw20 && props.pool.tokenA.denom && inputAAmount) {
                    await increaseAllowance({
                        cosmosChain: account.cosmos?.chainContext?.babylon,
                        spender: props.pool.poolAddress,
                        tokenContractAddres: props.pool.tokenA.denom,
                        amount: BigInt(inputAAmount)
                    });
                }
                if (props.pool.tokenB.isCw20 && props.pool.tokenB.denom && inputBAmount) {
                    await increaseAllowance({
                        cosmosChain: account.cosmos?.chainContext?.babylon,
                        spender: props.pool.poolAddress,
                        tokenContractAddres: props.pool.tokenB.denom,
                        amount: BigInt(inputBAmount)
                    });
                }
                sleep(5);
            }
            if (formType === "single") {
                if (activeTokenObj.isCw20 && activeTokenObj.denom && inputAmount) {
                    await increaseAllowance({
                        cosmosChain: account.cosmos?.chainContext?.babylon,
                        spender: props.pool.poolAddress,
                        tokenContractAddres: activeTokenObj.denom,
                        amount: BigInt(inputAmount)
                    });
                }
                sleep(5);
            }

            const res = await signingCosmWasmClient.execute(account.cosmos?.chainContext?.babylon?.address, props.pool.poolAddress, msg, "auto", undefined, funds);
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
                action: "towerAdd",
                amountA: formType === "double" ? formatDecimal(Number(fTokenAAmount), props.pool.tokenA.decimals).toFixed(0) : formatDecimal(Number(fTokenAmount), activeTokenObj.decimals).toFixed(0),
                amountB: formType === "double" ? formatDecimal(Number(fTokenBAmount), props.pool.tokenA.decimals).toFixed(0) : undefined,
                channelId: 0,
                denomA: formType === "double" ? (props.pool.tokenA.denom ?? "") : (activeTokenObj.denom ?? ""),
                denomB: formType === "double" ? (props.pool.tokenB.denom ?? "") : undefined,
                exchangeRate: undefined,
                hash: txHash,
                source: 'local',
                status: "success",
                submitted: undefined,
                time: getDateNow(),
                userAddress: account.cosmos?.chainContext?.babylon?.address,
                recipientChannelId: null,
                recipient: null,
            });
        } catch (error) {
            console.error(error);
        }
    }

    if (successHash) {
        return <Success
            activeTokenObj={activeTokenObj}
            pool={props.pool}
            formType={formType}
            fTokenAAmount={fTokenAAmount}
            fTokenAmount={fTokenAmount}
            fTokenBAmount={fTokenBAmount}
            hash={successHash}
            setOpen={props.setOpen}
        />
    }
    return (
        <Form
            activeToken={activeToken}
            activeTokenObj={activeTokenObj}
            defi={props.defi}
            pool={props.pool}
            error={error}
            formType={formType}
            fTokenAAmount={fTokenAAmount}
            fTokenAmount={fTokenAmount}
            fTokenBAmount={fTokenBAmount}
            isLoading={isLoading}
            ratio={ratioQuery.data?.priceScale}
            setActiveToken={setActiveToken}
            setFormType={setFormType}
            setFTokenAAmount={setFTokenAAmount}
            setFTokenAmount={setFTokenAmount}
            setFTokenBAmount={setFTokenBAmount}
            setOpen={props.setOpen}
            submit={submit}
        />
    );
}