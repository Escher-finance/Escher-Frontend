"use client";

import Button from "@/components/global/button";
import Icon from "@/components/global/icons";
import LdrsAnimation from "@/components/global/ldrsAnimation";
import { useEscher } from "@/components/providers/escherProvider";
import { TNC_DATA } from "@/configs/lottery";
import { useQuery } from "@tanstack/react-query";
import clsx from "clsx";
import { useCallback, useEffect, useState } from "react";
import { DialogContent, DialogEmpty, DialogTitle, DialogTrigger } from "../../ui/dialog-empty";

interface Props {
    className?: string
}

export default function LotteryTnc(props: Props) {
    const { account, setOpenWalletConnection } = useEscher();
    const [open, setOpen] = useState(false);
    const [agree, setAgree] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const getStatus = useCallback(async () => {
        const response = await fetch(`/api/lucky-draw/tnc-status?address=${account.evm?.address}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const jsonResponse = await response.json();
        if (!response.ok) {
            throw new Error(jsonResponse.errors?.[0]?.message || 'Failed to fetch data');
        }

        return (jsonResponse.data as { address: string }[]).length > 0;
    }, [account.evm?.address]);

    const queryStatus = useQuery({
        queryKey: ["lottery", "usertnc", account.evm?.address],
        queryFn: getStatus,
        enabled: !!account.evm?.address
    });

    const fetchCountry = async (): Promise<{ name: string, code: string } | undefined> => {
        try {
            const res = await (await fetch('https://ipwho.is/'))?.json();
            return { name: res.country, code: res.country_code }
        } catch (error) {
            console.log(error);
            return undefined;
        }
    }

    const submit = async () => {
        setIsLoading(true);

        const countryData = await fetchCountry();

        // EVM
        try {
            const response = await fetch('/api/lucky-draw/tnc-accept', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(
                    {
                        address: account.evm?.address.toLowerCase(),
                        cc: countryData?.code,
                        cn: countryData?.name,
                    }),
            });
            console.log({ response });

        } catch (error) {
            console.error(error);
        }

        // Babylon
        try {
            if (account.cosmos?.address.babylon) {
                const response = await fetch('/api/lucky-draw/tnc-accept', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(
                        {
                            address: account.cosmos?.address.babylon.toLowerCase(),
                            cc: countryData?.code,
                            cn: countryData?.name,
                        }),
                });
                console.log({ response });
            }
        } catch (error) {
            console.error(error);
        }

        // router.push("/liquid-staking?liquid=babylon");
        await queryStatus.refetch();
        setIsLoading(false);
        setOpen(false);
    }

    useEffect(() => {
        const manualStatusCheck = async () => {
            if (!account.evm?.address) return;

            const accepted = await getStatus();
            if (!accepted) {
                setOpen(true);
            }
        }

        if (account.evm?.address)
            manualStatusCheck();
    }, [account.evm?.address, getStatus]);

    return (
        <DialogEmpty open={open} onOpenChange={v => setOpen(v)} >
            <DialogTrigger
                className={clsx(
                    "text-escher-electricblue bg-escher-E4E5FF hover:bg-escher-electricblue_light4 rounded-full px-4 py-2.5 font-semibold text-sm leading-none",
                    props.className
                )}
            >
                <div className="flex items-center gap-2">
                    {queryStatus.data === true &&
                        <>
                            <div>T&C Accepted</div>
                            <Icon type="FaCheckCircle" />
                        </>
                    }
                    {queryStatus.data === false &&
                        <div>Accept T&C</div>
                    }
                    {queryStatus.data === undefined &&
                        <LdrsAnimation size={18} color="#0008FE" />
                    }
                </div>
            </DialogTrigger>
            <DialogContent className="flex flex-col w-fit h-[90%] p-6">
                <DialogTitle className="hidden"></DialogTitle>
                <div className="min-w-[640px] h-full flex flex-col text-escher-667085 dark:text-white">
                    <div className="flex justify-between items-center">
                        <div className="text-escher-black dark:text-white text-2xl leading-none font-bold">Escher Lucky Draw - Terms & Conditions</div>
                        <button
                            className="self-end rounded-full border border-gray-300 text-gray-400 p-1.5"
                            onClick={() => setOpen(false)}
                        >
                            <Icon type="FaTimes" />
                        </button>
                    </div>
                    <div className="text-sm mt-4">By participating in the Escher Lucky Draw (the “Promotion”), you agree to the following legally binding terms and conditions. If you do not agree, do not participate</div>

                    <div className="flex-1 overflow-scroll flex flex-col gap-8 bg-escher-F2F4F7 dark:bg-escher-darkblue rounded-lg p-4 mt-6">
                        {TNC_DATA.map((v, k) =>
                            <div key={k} className="flex flex-col gap-4">
                                <div className="text-lg leading-none font-semibold text-escher-37383C dark:text-white">{k + 1}. {v.title}</div>
                                <div className="text-sm">{v.body}</div>
                            </div>
                        )}
                    </div>

                    {!account.evm?.isConnected &&
                        <Button
                            title="Connect Wallet"
                            className="mt-4"
                            onClick={() => setOpenWalletConnection(true)}
                        />
                    }

                    {queryStatus.data === false &&
                        <div className="mt-6 flex flex-col gap-2">
                            <button
                                className="flex items-center gap-2"
                                onClick={() => setAgree(prev => !prev)}
                            >
                                <input type="checkbox" checked={agree} />
                                <div className="font-medium">I Accept the Terms & Conditions of the Escher Lucky Draw</div>
                            </button>
                            <Button
                                title="Proceed"
                                className="py-2"
                                enabled={agree}
                                isLoading={isLoading}
                                onClick={submit}
                            />
                        </div>
                    }
                </div >
            </DialogContent >
        </DialogEmpty >
    );
}