"use client";

import Icon from "@/components/global/icons";
import { DialogContent, DialogEmpty, DialogTitle, DialogTrigger } from "@/components/ui/dialog-empty";
import { Defi, DefiPool } from "@/types/defi";
import Image from "next/image";
import Link from "next/link";
import { ReactNode, useMemo, useState } from "react";
import BridgeMultiple from "../../../global/bridgeMultiple/bridgeMultiple";

interface Props {
    defi: Defi
    pool: DefiPool
    isApps?: boolean
    type: "add" | "remove" | "claim"
    setOpen?(val: boolean): void
}

export default function AddLiquidityOsmosis(props: Props) {
    const [open, setOpen] = useState(false);

    const Trigger = useMemo((): ReactNode => {
        switch (props.type) {
            case "add": return <>
                {props.isApps ?
                    <DialogTrigger className="h-6 aspect-square bg-escher-D9DAFF dark:bg-white hover:bg-escher-electricblue_light2 transition-all rounded flex items-center justify-center">
                        <Image alt="" src={"/icons/arrow-down-blue.svg"} width={18} height={18} />
                    </DialogTrigger>
                    :
                    <DialogTrigger className="text-escher-electricblue dark:text-white bg-escher-electricblue_light7 dark:bg-escher-darkblue_1 dark:border border-escher-darkblue_border rounded-full px-4 py-1 font-semibold text-xs">
                        Add
                    </DialogTrigger>
                }
            </>
            case "remove": return <>
                {props.isApps ?
                    <DialogTrigger className="h-6 aspect-square bg-escher-D9DAFF dark:bg-white hover:bg-escher-electricblue_light2 transition-all rounded flex items-center justify-center">
                        <Image alt="" src={"/icons/arrow-up-blue.svg"} width={18} height={18} />
                    </DialogTrigger>
                    :
                    <DialogTrigger className="text-escher-electricblue dark:text-white bg-escher-electricblue_light7 dark:bg-escher-darkblue_1 dark:border border-escher-darkblue_border rounded-full px-4 py-1 font-semibold text-xs">
                        Remove
                    </DialogTrigger>
                }
            </>
            case "claim": return <>
                {props.isApps ?
                    <DialogTrigger className="h-6 aspect-square bg-white border border-escher-dedfff dark:border-escher-darkblue_border hover:bg-escher-electricblue_light2 transition-all rounded flex items-center justify-center">
                        <Image alt="" src={"/icons/arrow-turn-up-blue.svg"} width={18} height={18} />
                    </DialogTrigger>
                    :
                    <DialogTrigger className="text-escher-electricblue dark:text-white bg-escher-electricblue_light7 dark:bg-escher-darkblue_1 dark:border border-escher-darkblue_border rounded-full px-4 py-1 font-semibold text-xs">
                        Claim
                    </DialogTrigger>
                }
            </>
        }
    }, [props.isApps, props.type]);

    return (
        <DialogEmpty open={open} onOpenChange={v => setOpen(v)}>
            {Trigger}
            <DialogContent className="flex flex-col gap-3 w-fit p-0 bg-transparent border-none">
                <DialogTitle className="hidden"></DialogTitle>
                <Content
                    defi={props.defi}
                    pool={props.pool}
                    type={props.type}
                    setOpen={setOpen}
                />
            </DialogContent>
        </DialogEmpty>
    );
}

const Content = (props: Props) => {
    const [showBridge, setShowBridge] = useState(false);

    const typeText = useMemo(() => {
        switch (props.type) {
            case "add": return { title: "Add", subtitle: "Add liquidity on" };
            case "remove": return { title: "Remove", subtitle: "Remove liquidity on" };
            case "claim": return { title: "Claim", subtitle: "Claim rewards on" };
        }
    }, [props.type]);

    if (showBridge) {
        return (
            <BridgeMultiple
                setOpen={v => setShowBridge(v)}
            />
        );
    }

    return (
        <div className="w-[536px] flex flex-col bg-white dark:bg-escher-darkblue rounded-lg">
            <div className="flex justify-between items-center rounded-t-lg p-6 border-b dark:border-escher-darkblue_border">
                <div className="flex-1 flex items-center gap-2 leading-none">
                    <div className="text-escher-black dark:text-white text-xl font-bold">{typeText.title} Liquidity</div>
                </div>
                <button
                    className="self-end rounded-full border border-gray-300 dark:border-escher-darkblue_border text-gray-400 p-1.5"
                    onClick={() => props.setOpen && props.setOpen(false)}
                >
                    <Icon type="FaTimes" />
                </button>
            </div>
            <div className="flex flex-col gap-6 p-6">
                <Link
                    href={"https://app.osmosis.zone/pool/3055"}
                    target="_blank"
                    className="flex-1 flex items-center gap-2 p-6 border border-escher-e4e8ed dark:border-escher-darkblue_border rounded-lg bg-linear-to-r from-[#ded7f3] to-75% hover:to-100% transition-all to-transparent cursor-pointer"
                >
                    <div className="flex-1 flex items-center gap-2 leading-none">
                        <div className="text-escher-black text-xl font-bold">{typeText.subtitle}</div>
                        <div className="flex items-center gap-1.5 rounded-full p-1 pr-2 bg-[#c7b5f8]">
                            <Image src={props.defi.logoURI} alt="" width={16} height={16} className="border border-white rounded-full" />
                            <div className="text-escher-text2 text-sm font-medium">{props.defi.name}</div>
                        </div>
                    </div>
                    <div className="bg-escher-E2E3FF text-escher-electricblue rounded-full aspect-square flex items-center justify-center p-1">
                        <Icon type="LuMoveUpRight" />
                    </div>
                </Link>
                {/* 
                <div className="flex gap-2 px-6 py-5 bg-escher-f5f5ff dark:bg-escher-dark_0c203d border border-escher-dedfff dark:border-escher-darkblue_border rounded-lg">
                    <Image alt="" src="/icons/sidebar/bridge_icon.svg" alt="" className="w-7 h-7" />
                    <div className="flex flex-col items-start gap-2 leading-none pt-1">
                        <div className="font-semibold text-escher-black dark:text-white">Bridge from Babylon to Osmosis</div>
                        <div className="text-escher-777e90 text-sm">If you have BABY and eBABY deposited on Babylon, they can be bridged to Osmosis in simple steps.</div>
                        <button
                            onClick={() => setShowBridge(true)}
                            className="flex items-center gap-2 mt-2 text-escher-electricblue rounded-full bg-escher-E5E8FF p-2 pr-4"
                        >
                            <div className="bg-escher-electricblue rounded-full flex items-center justify-center p-1">
                                <Icon type="BsArrowRight" className="text-white w-3 h-3" />
                            </div>
                            <div>Bridge Now</div>
                        </button>
                    </div>
                </div>
                */}
                <div className="text-sm text-escher-777e90 mt-2 text-center">LP interaction executed via <Link href={props.defi.link} className="text-escher-electricblue" target="_blank">{props.defi.name}</Link> DEX, a third-party service provider.</div>
            </div >
        </div >
    );
}