"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useTheme } from "../providers/themeProvider";
import { DialogContent, DialogEmpty, DialogTitle, DialogTrigger } from "../ui/dialog-empty";
import Icon from "./icons";

const App = (props: { title: string, image: string, link: string }) => {
    return (
        <Link href={props.link} target="_blank" className="flex items-center gap-1.5 rounded-full border border-escher-electricblue dark:border-escher-darkblue_border p-2 hover:bg-escher-electricblue_light6 dark:hover:bg-escher-darkblue_4 transition-all">
            <Image src={props.image} alt="" width={24} height={24} />
            <div className="text-escher-text2 dark:text-white">{props.title}</div>
            <Icon type="BsArrowUp" className="text-escher-electricblue dark:text-white" />
        </Link>
    );
}

export default function BabyDeposit() {
    const [open, setOpen] = useState(false);
    const { themeIsDark } = useTheme();

    return (
        <DialogEmpty open={open} onOpenChange={v => setOpen(v)}>
            <DialogTrigger
                className="flex items-center font-semibold text-escher-electricblue dark:text-white border border-escher-e4e8ed dark:border-escher-darkblue_border rounded-lg px-4 dark:bg-escher-darkblue_3 hover:dark:bg-escher-darkblue_border hover:bg-escher-electricblue_light9 transition-all"
            >
                <Image src={themeIsDark ? "/images/token/babylon.png" : "/images/token/babylon-v2.svg"} width={24} height={24} alt="" className="" />
                <Image src={"/images/token/union.svg"} width={24} height={24} alt="" className="" />
                <div className="ml-2">Get Tokens</div>
            </DialogTrigger>
            <DialogContent className="flex flex-col gap-2 min-w-[585px] p-4">
                <DialogTitle className="hidden"></DialogTitle>
                <div className="flex justify-between items-center">
                    <div className="text-escher-black dark:text-white text-2xl font-semibold leading-none">Get Tokens</div>
                    <button
                        className="self-end rounded-full border border-gray-300 text-gray-400 p-1.5"
                        onClick={() => setOpen(false)}
                    >
                        <Icon type="FaTimes" />
                    </button>
                </div>

                <div className="flex flex-col p-4 border border-escher-e4e8ed dark:border-none dark:bg-escher-darkblue rounded-lg mt-2">
                    <div className="flex items-center justify-between">
                        <div className="text-escher-777e90 text-sm">Bridge with</div>
                        <div className="text-escher-electricblue dark:text-white text-xs rounded-full px-2 py-1 bg-[#EDEEFF] dark:bg-escher-darkblue_1 border border-[#D0D1FF] dark:border-escher-darkblue_border">Bridge</div>
                    </div>
                    <div className="flex gap-4 mt-2 flex-nowrap">
                        <App
                            title={"Cosmos"}
                            image={"/images/apps/app-cosmos.png"}
                            link={"https://go.cosmos.network/"}
                        />
                        <App
                            title={"Union"}
                            image={"/images/apps/app-union.png"}
                            link={"https://btc.union.build/transfer"}
                        />
                        <App
                            title={"Squid"}
                            image={"/images/apps/app-squid.png"}
                            link={"https://app.squidrouter.com/"}
                        />
                    </div>
                </div>

                <div className="flex flex-col p-4 border border-escher-e4e8ed dark:border-none dark:bg-escher-darkblue rounded-lg">
                    <div className="flex items-center justify-between">
                        <div className="text-escher-777e90 text-sm">Swap with</div>
                        <div className="text-escher-electricblue dark:text-white text-xs rounded-full px-2 py-1 bg-[#EDEEFF] dark:bg-escher-darkblue_1 border border-[#D0D1FF] dark:border-escher-darkblue_border">DEX</div>
                    </div>
                    <div className="flex gap-4 mt-2 flex-nowrap">
                        <App
                            title={"Uniswap"}
                            image={"/images/apps/app-uniswap-circle-2.svg"}
                            link={"https://app.uniswap.org/"}
                        />
                        <App
                            title={"Osmosis"}
                            image={"/images/apps/app-osmosis-main.png"}
                            link={"https://app.osmosis.zone/"}
                        />
                    </div>
                </div>

                <div className="flex flex-col p-4 border border-escher-e4e8ed dark:border-none dark:bg-escher-darkblue rounded-lg">
                    <div className="flex items-center justify-between">
                        <div className="text-escher-777e90 text-sm">Buy with</div>
                        <div className="text-escher-electricblue dark:text-white text-xs rounded-full px-2 py-1 bg-[#EDEEFF] dark:bg-escher-darkblue_1 border border-[#D0D1FF] dark:border-escher-darkblue_border">CEX</div>
                    </div>
                    <div className="flex gap-4 mt-2 flex-nowrap">
                        <App
                            title={"Binance"}
                            image={"/images/apps/app-binance.png"}
                            link={"https://www.binance.com/"}
                        />
                        <App
                            title={"Bybit"}
                            image={"/images/apps/app-bybit.png"}
                            link={"https://www.bybit.com/"}
                        />
                        <App
                            title={"OKX"}
                            image={"/images/apps/app-okx.png"}
                            link={"https://www.okx.com/"}
                        />
                        <App
                            title={"Bitget"}
                            image={"/images/apps/app-bitget.png"}
                            link={"https://www.bitget.com/"}
                        />
                    </div>
                </div>
            </DialogContent>
        </DialogEmpty>
    );
}