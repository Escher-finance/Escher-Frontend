"use client";

import Button from "@/components/global/button";
import FirstDraw from "@/components/page/lucky-draw/first-draw";
import Header from "@/components/page/lucky-draw/header";
import HolidayDraw from "@/components/page/lucky-draw/holiday-draw";
import Minted from "@/components/page/lucky-draw/minted";
import Position from "@/components/page/lucky-draw/position";
import Tickets from "@/components/page/lucky-draw/tickets";
import { useEscher } from "@/components/providers/escherProvider";
import { useMemo, useState } from "react";

// debug addres
// babylon : "bbn1fmxjzd8ngplrnwv33rey48apctqlfrjrcsgvud"
// babylon with lp : "bbn1khj9dqpgg5w4z3khdrswzwkh6n0dv9xadcdpzl"
// ethereum: "0xfade236faa8c35d721aa01480497a07e23a29d19"
// ethereum with lp : "0xff4a9aaac97c17c9e71a87678e5fff1e2262dfc1"
const debug = false;

export interface AddressLuckyDraw { babylon?: string, ethereum?: string }

const Page = () => {
    const { account } = useEscher();
    const [debugAddress, setDebugAddress] = useState<AddressLuckyDraw>({ babylon: undefined, ethereum: undefined });
    const [debugAddressForm, setDebugAddressForm] = useState<AddressLuckyDraw>({ babylon: undefined, ethereum: undefined });

    const address = useMemo(() => ({
        babylon: (debugAddress?.babylon !== undefined && debugAddress?.babylon !== "") ?
            debugAddress?.babylon :
            account.cosmos?.address.babylon,
        ethereum: (debugAddress?.ethereum !== undefined && debugAddress?.ethereum !== "") ?
            debugAddress?.ethereum :
            account.evm?.address,
    }), [account.cosmos?.address, account.evm?.address, debugAddress]);

    return (
        <div className="container mx-auto px-8 py-10 flex flex-col gap-6">
            <Header />

            {debug &&
                <div className="bg-escher-darkblue_2 border border-escher-darkblue_border text-slate-100 p-3 rounded flex flex-col gap-2 self-center">
                    <input
                        type="text"
                        placeholder="babylon address"
                        className="text-black p-1"
                        value={debugAddressForm.babylon ?? ""}
                        onChange={v => setDebugAddressForm(prev => ({ ...prev, babylon: v.target.value }))}
                    />
                    <input
                        type="text"
                        placeholder="ethereum address"
                        className="text-black p-1"
                        value={debugAddressForm.ethereum ?? ""}
                        onChange={v => setDebugAddressForm(prev => ({ ...prev, ethereum: v.target.value }))}
                    />
                    <Button title="Set debug address" onClick={() => {
                        setDebugAddress(debugAddressForm)
                    }} />
                </div>
            }

            <div className="
                grid gap-6
                grid-cols-2 grid-rows-3
                xl1250:grid-cols-3 xl1250:grid-rows-2 xl1250:grid-flow-col
            ">
                <div className="row-span-2 flex flex-col gap-6">
                    <Tickets address={address} />
                    <Minted />
                </div>
                <Position address={address} />
                <div className="row-span-2 flex flex-col gap-6">
                    <FirstDraw />
                    <HolidayDraw />
                </div>
            </div>
        </div>
    );
}

export default Page;