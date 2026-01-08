'use client';

import { useEscher } from "@/components/providers/escherProvider";
import { useTheme } from "@/components/providers/themeProvider";
import { APP_CONFIG } from "@/configs/app";
import useDefi from "@/hooks/defi/useDefi";
import { formatNumber } from "@/lib/utils";
import clsx from "clsx";
import Image from "next/image";
import { useMemo, useState } from "react";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "../accountSidebar";
import Icon from "../icons";
import LdrsAnimation from "../ldrsAnimation";
import { TabTypes } from "../walletConnection/components";
import WalletConnection from "../walletConnection/walletConnection";
import DefiOsmosis from "./_components/defi/osmosis/defi";
import DefiUniswap from "./_components/defi/uniswap/defi";
import GroupedTokens2 from "./_components/groupedTokens2";
import Tokens from "./_components/tokens";

const AccountButton = () => {
    const { openAccountSidebar, setOpenAccountSidebar, isSafe } = useEscher();
    const { themeIsDark } = useTheme();
    const [tab, setTab] = useState<TabTypes>("all");

    const { tokens, account } = useEscher();
    const defis = useDefi();

    const totalDollarValue = useMemo(() => {
        let _tokens = tokens;
        if (tab === "evm") {
            _tokens = tokens.filter(t => t.chain.network === "evm");
        }
        if (tab === "cosmos") {
            _tokens = tokens.filter(t => t.chain.network === "cosmos");
        }
        return _tokens?.reduce((sum, t) => sum += (t.balance?.dollarValue ?? 0), 0);
    }, [tokens, tab]);

    const tokensLiquid = useMemo(() => {
        return tokens.filter(t => t.isLiquid && (["all", t.chain.network].includes(tab)));
    }, [tokens, tab]);
    const tokensNative = useMemo(() => {
        let res = tokens.filter(t => !t.isLiquid && (["all", t.chain.network].includes(tab)) && Number(t.balance?.value) > 0);

        if (tab === "all") {
            res = res.filter(t => !["BABY", "U"].includes(t.symbol));
        }
        return res;
    }, [tokens, tab]);

    const tokensEscher = useMemo(() => ({
        baby: tokens.filter(t => t.symbol === "BABY"),
        ebaby: tokens.filter(t => t.symbol === "eBABY"),

        u: tokens.filter(t => t.symbol === "U"),
        eu: tokens.filter(t => t.symbol === "eU"),
    }), [tokens]);

    return (
        <Sheet open={openAccountSidebar} onOpenChange={v => setOpenAccountSidebar(v)}>
            <SheetTrigger
                className={clsx(
                    "bg-escher-electricblue_light9 dark:bg-escher-darkblue_3 hover:dark:bg-escher-darkblue_border hover:bg-escher-electricblue_light7 transition-all rounded-full flex items-center justify-center",
                    APP_CONFIG.enableEvm ? "px-4" : "aspect-square"
                )}
            >
                <Image src={themeIsDark ? '/icons/wallet-white.svg' : '/icons/wallet-blue.svg'} alt="" width={20} height={20} />
                {!isSafe && <>
                    <Icon type="FaCircle" className={`w-1.5 h-1.5 ml-1.5 ${account.evm?.isConnected ? "text-green-500" : "text-gray-400"}`} />
                    <Icon type="FaCircle" className={`w-1.5 h-1.5 ml-1 ${account.cosmos?.isConnected ? "text-green-500" : "text-gray-400"}`} />
                </>}
            </SheetTrigger>
            <SheetContent>
                <SheetTitle></SheetTitle>
                <WalletConnection isSidebar={true} onTabSelected={setTab} initialTab={tab} />
                <hr className="border-escher-gray200 dark:border-escher-darkblue_border mt-4" />

                <div className="flex flex-col mt-4" onClick={() => console.log({ tokens })}>
                    <div className="text-xs text-escher-777e90">My Position</div>
                    <div className="font-bold text-2xl dark:text-white">{(totalDollarValue !== undefined) ? `$${formatNumber(totalDollarValue)}` : <LdrsAnimation />}</div>
                </div>

                <div className="flex-1 relative my-4 h-full overflow-y-scroll flex flex-col gap-4">
                    {tab === "all" ?
                        <GroupedTokens2
                            tokens={tokensEscher}
                        />
                        :
                        <Tokens title="Liquid Token" tokens={tokensLiquid} />
                    }

                    {/* Native */}
                    <Tokens title="Other Tokens" tokens={tokensNative} />

                    {["evm", "all"].includes(tab) &&
                        <DefiUniswap
                            defi={defis.uniswap}
                        />
                    }

                    {!APP_CONFIG.networkIsTestnet && !isSafe && <>
                        {
                            ["cosmos", "all"].includes(tab) &&
                            <DefiOsmosis
                                defi={defis.osmosis}
                            />
                        }
                    </>}
                </div>
            </SheetContent>
        </Sheet >

    );
}

export default AccountButton;
