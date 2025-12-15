"use client";

import Card from "@/components/global/card";
import NoData from "@/components/global/noData";
import OsmosisPool from "@/components/page/defi-hubs/osmosis/pool";
import OsmosisSwap from "@/components/page/defi-hubs/osmosis/swap";
import UniswapPool from "@/components/page/defi-hubs/uniswap/pool";
import UniswapSwap from "@/components/page/defi-hubs/uniswap/swap";
import { useEscher } from "@/components/providers/escherProvider";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { CHAINS } from "@/configs/chains";
import { OsmosisPoolResult } from "@/hooks/defi/osmosis/useOsmosisDefi";
import { UniswapPoolResult } from "@/hooks/defi/uniswap/useUniswapDefi";
import useDefi from "@/hooks/defi/useDefi";
import { useSkipClient } from "@/hooks/useSkip";
import { LiquidStaking } from "@/types/chain";
import { Defi, DefiPool } from "@/types/defi";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { zeroAddress } from "viem";

type DefiType = 'lp' | 'swap';
const DEFI_TYPES: Record<DefiType, string> = {
    lp: "LP",
    swap: "SWAP"
}

type DefiProtocol = 'uniswap' | 'osmosis';
interface DefiProtocolData { name: string, logo: string }
const DEFI_PROTOCOLS: Record<DefiProtocol, DefiProtocolData> = {
    uniswap: {
        name: "Uniswap",
        logo: "/images/apps/app-uniswap-circle-2.svg"
    },
    osmosis: {
        name: "Osmosis",
        logo: "/images/apps/app-osmosis-circle-2.svg"
    },
}

type DefiChain = 'babylon' | 'ethereum' | 'osmosis';
interface DefiChainData { name: string, logo: string, chainId: string | number }
const DEFI_CHAINS: Record<DefiChain, DefiChainData> = {
    babylon: {
        name: "Babylon",
        logo: "/images/defi-hub/defi-chain-baby.svg",
        chainId: CHAINS.babylon.id
    },
    ethereum: {
        name: "Ethereum",
        logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png",
        chainId: CHAINS.mainnet.id
    },
    osmosis: {
        name: "Osmosis",
        logo: "/images/apps/app-osmosis-circle-2.svg",
        chainId: CHAINS.osmosis.id
    },
}

const Page = () => {
    const { account } = useEscher();
    const defis = useDefi();
    const { skipClient } = useSkipClient();

    // Type
    const router = useRouter();
    const searchParams = useSearchParams();
    const defaultTab = searchParams.get("tab");
    const isValidTab = (tab: string | null): tab is DefiType => {
        return ['lp', 'swap'].includes(tab as string);
    };
    const [defiType, setDefiType] = useState<DefiType>(
        isValidTab(defaultTab) ? defaultTab : 'lp'
    );

    // Protocols
    const [defiProtocol, setDefiProtocol] = useState<DefiProtocolData>();

    // Chains
    const [defiChain, setDefiChain] = useState<DefiChainData>();

    // LST
    const [defiLst, setDefiLst] = useState<LiquidStaking>();

    // LP position
    const [defiPosition, setDefiPosition] = useState<boolean>();

    const pools = useMemo((): { defi: Defi, pool: UniswapPoolResult | OsmosisPoolResult | DefiPool }[] => {
        // UNISWAP
        const uniswapDefi = defis.uniswap;
        const uniswapPools = uniswapDefi.pools.map(pool => ({ pool: pool, defi: uniswapDefi.info }));

        // OSMOSIS
        const osmosisDefi = defis.osmosis;
        const osmosisPools = osmosisDefi.pools.map(pool => ({ pool: pool, defi: osmosisDefi.info }));

        if (defiPosition !== undefined) {
            return uniswapPools.filter(v => v.pool.position?.isInRange === defiPosition);
        }

        return [
            ...uniswapPools,
            ...osmosisPools
        ].filter(p =>
            (defiProtocol ? p.defi.name === defiProtocol.name : true) &&
            (defiChain ? p.defi.chain.id === defiChain.chainId : true)
        );
    }, [defis, defiProtocol, defiChain, defiPosition]);

    const swaps = useMemo(() => {
        const uniswapDefi = defis.uniswap;
        const uniswapSwaps = uniswapDefi.info.swaps?.map(swap => ({ ...swap, defi: uniswapDefi }));

        const osmosisDefi = defis.osmosis;
        const osmosisSwaps = osmosisDefi.info.swaps?.map(swap => ({ ...swap, defi: osmosisDefi }));

        return [
            ...(uniswapSwaps ? uniswapSwaps : []),
            ...(osmosisSwaps ? osmosisSwaps : []),
        ].filter(p =>
            (defiProtocol ? p.defi.info.name === defiProtocol.name : true) &&
            (defiChain ? p.defi.info.chain.id === defiChain.chainId : true) &&
            (defiLst ? p.lst === defiLst : true)
        );
    }, [defis, defiProtocol, defiChain, defiLst]);

    return (
        <div className="w-full max-w-[1440px] mx-auto flex flex-col p-8 gap-6">

            {/* header */}
            <Card className="items-center p-6 leading-none dark:bg-escher-dark_0c203d">
                <div
                    className="text-[40px] font-bold text-black dark:text-white"
                    onClick={() => console.log({ defis, pools })}
                >DeFi Hub</div>
                {/*
                <div className="text-xl font-medium text-escher-text2 dark:text-white">From DeFi Chaos to Curated Clarity.</div>
                 <div className="text-sm font-medium text-escher-777e90 text-center">Explore the top destinations where Escher's LSTs are actively put to work — spanning<br />chains, protocols, and high-performing strategies.</div> 
                <div className="bg-[url('/images/defi-hub/header.jpg')] h-[180px] w-full bg-no-repeat bg-[0%_100%] bg-cover" />
                */}
            </Card>

            {/* control */}
            <div className="flex items-center gap-2">

                {/* Operation */}
                <Select onValueChange={v => {
                    setDefiType(v as DefiType);
                    router.push(`/defi-hub?tab=${v}`);
                }}>
                    <SelectTrigger
                        className="w-fit border border-escher-dedfff dark:border-escher-darkblue_border py-1.5 text-escher-text4 dark:text-white rounded-full hover:bg-gray-100 dark:hover:bg-escher-darkblue_2 transition-all"
                    >
                        {DEFI_TYPES[defiType]}
                    </SelectTrigger>
                    <SelectContent className="dark:bg-escher-dark_0c203d dark:border-escher-darkblue_border">
                        <SelectItem value="lp" >
                            Liquidity Pools
                        </SelectItem>
                        <SelectItem value="swap">
                            Swap
                        </SelectItem>
                    </SelectContent>
                </Select>

                {/* Protocol */}
                <Select onValueChange={v => {
                    switch (v) {
                        case "uniswap":
                            setDefiProtocol(DEFI_PROTOCOLS.uniswap);
                            break;
                        case "osmosis":
                            setDefiProtocol(DEFI_PROTOCOLS.osmosis);
                            break;
                        case "all":
                            setDefiProtocol(undefined);
                            break;
                    }
                }}>
                    <SelectTrigger
                        className="w-fit border border-escher-dedfff dark:border-escher-darkblue_border py-1.5 text-escher-text4 dark:text-white rounded-full hover:bg-gray-100 dark:hover:bg-escher-darkblue_2 transition-all flex items-center"
                    >
                        {defiProtocol ?
                            <Image alt="" src={defiProtocol.logo} className="w-4 h-4" width={16} height={16} />
                            :
                            <div className="flex items-center">
                                <Image alt="" src={DEFI_PROTOCOLS.uniswap.logo} className="w-5 h-5 -ml-2" width={20} height={20} />
                                <Image alt="" src={DEFI_PROTOCOLS.osmosis.logo} className="w-5 h-5 -ml-2" width={20} height={20} />
                            </div>
                        }
                        <div>PROTOCOLS</div>
                    </SelectTrigger>
                    <SelectContent className="dark:bg-escher-dark_0c203d dark:border-escher-darkblue_border">
                        <SelectItem value="all">
                            <div className="flex items-center gap-2 text-escher-777e90">
                                <div>-- All protocols --</div>
                            </div>
                        </SelectItem>
                        <SelectItem value="uniswap">
                            <div className="flex items-center gap-2">
                                <Image alt="" src={DEFI_PROTOCOLS.uniswap.logo} className="w-4 h-4" width={16} height={16} />
                                <div>{DEFI_PROTOCOLS.uniswap.name}</div>
                            </div>
                        </SelectItem>
                        <SelectItem value="osmosis">
                            <div className="flex items-center gap-2">
                                <Image alt="" src={DEFI_PROTOCOLS.osmosis.logo} className="w-4 h-4" width={16} height={16} />
                                <div>{DEFI_PROTOCOLS.osmosis.name}</div>
                            </div>
                        </SelectItem>
                    </SelectContent>
                </Select>

                {/* Chain */}
                <Select onValueChange={v => {
                    switch (v) {
                        case "babylon":
                            setDefiChain(DEFI_CHAINS.babylon);
                            break;
                        case "osmosis":
                            setDefiChain(DEFI_CHAINS.osmosis);
                            break;
                        case "ethereum":
                            setDefiChain(DEFI_CHAINS.ethereum);
                            break;
                        case "all":
                            setDefiChain(undefined);
                            break;
                    }
                }}>
                    <SelectTrigger
                        className="w-fit border border-escher-dedfff dark:border-escher-darkblue_border py-1.5 text-escher-text4 dark:text-white rounded-full hover:bg-gray-100 dark:hover:bg-escher-darkblue_2 transition-all flex items-center"
                    >
                        {defiChain ?
                            <Image alt="" src={defiChain.logo} className="w-5 h-5" width={20} height={20} />
                            :
                            <div className="flex items-center">
                                <Image alt="" src={DEFI_CHAINS.babylon.logo} className="w-5 h-5" width={20} height={20} />
                                <Image alt="" src={DEFI_CHAINS.osmosis.logo} className="w-5 h-5 -ml-2" width={20} height={20} />
                                <Image alt="" src={DEFI_CHAINS.ethereum.logo} className="w-5 h-5 -ml-2" width={20} height={20} />
                            </div>
                        }
                        <div>BLOCKCHAINS</div>
                    </SelectTrigger>
                    <SelectContent className="dark:bg-escher-dark_0c203d dark:border-escher-darkblue_border">
                        <SelectItem value="all">
                            <div className="flex items-center gap-2 text-escher-777e90">
                                <div>-- All chains --</div>
                            </div>
                        </SelectItem>
                        <SelectItem value="babylon" >
                            <div className="flex items-center gap-2">
                                <Image alt="" src={DEFI_CHAINS.babylon.logo} className="w-5 h-5" width={20} height={20} />
                                <div>{DEFI_CHAINS.babylon.name}</div>
                            </div>
                        </SelectItem>
                        <SelectItem value="osmosis" >
                            <div className="flex items-center gap-2">
                                <Image alt="" src={DEFI_CHAINS.osmosis.logo} className="w-5 h-5" width={20} height={20} />
                                <div>{DEFI_CHAINS.osmosis.name}</div>
                            </div>
                        </SelectItem>
                        <SelectItem value="ethereum" >
                            <div className="flex items-center gap-2">
                                <Image alt="" src={DEFI_CHAINS.ethereum.logo} className="w-5 h-5" width={20} height={20} />
                                <div>{DEFI_CHAINS.ethereum.name}</div>
                            </div>
                        </SelectItem>
                    </SelectContent>
                </Select>

                {/* LST */}
                <Select onValueChange={v => {
                    switch (v) {
                        case "babylon":
                            setDefiLst("babylon");
                            break;
                        case "union":
                            setDefiLst("union");
                            break;
                        default:
                            setDefiLst(undefined);
                            break;
                    }
                }}>
                    <SelectTrigger
                        className="w-fit border border-escher-dedfff dark:border-escher-darkblue_border py-1.5 text-escher-text4 dark:text-white rounded-full hover:bg-gray-100 dark:hover:bg-escher-darkblue_2 transition-all flex items-center"
                    >
                        <div className="flex items-center">
                            {defiLst ?
                                <>
                                    {defiLst === "babylon" &&
                                        <Image alt="" src={"/images/token/e-babylon.svg"} className="w-5 h-5" width={20} height={20} />
                                    }
                                    {defiLst === "union" &&
                                        <Image alt="" src={"/images/token/e-union.svg"} className="w-5 h-5" width={20} height={20} />
                                    }
                                </>
                                :
                                <>
                                    <Image alt="" src={"/images/token/e-babylon.svg"} className="w-5 h-5" width={20} height={20} />
                                    <Image alt="" src={"/images/token/e-union.svg"} className="w-5 h-5 -ml-2" width={20} height={20} />
                                </>
                            }
                        </div>
                        <div>LST</div>
                    </SelectTrigger>
                    <SelectContent className="dark:bg-escher-dark_0c203d dark:border-escher-darkblue_border">
                        <SelectItem value="all">
                            <div className="flex items-center gap-2 text-escher-777e90">
                                <div>-- All LST --</div>
                            </div>
                        </SelectItem>
                        <SelectItem value="babylon" >
                            <div className="flex items-center gap-2">
                                <Image alt="" src={"/images/token/e-babylon.svg"} className="w-5 h-5" width={20} height={20} />
                                <div>Babylon</div>
                            </div>
                        </SelectItem>
                        <SelectItem value="union" >
                            <div className="flex items-center gap-2">
                                <Image alt="" src={"/images/token/e-union.svg"} className="w-5 h-5" width={20} height={20} />
                                <div>Union</div>
                            </div>
                        </SelectItem>
                    </SelectContent>
                </Select>

                {/* LP position */}
                <Select onValueChange={v => {
                    let val: boolean | undefined = undefined;
                    switch (v) {
                        case "all":
                            val = undefined;
                            break;
                        case "true":
                            val = true;
                            break;
                        case "false":
                            val = false;
                            break;
                    }
                    setDefiPosition(val);
                }}>
                    <SelectTrigger
                        className="w-fit border border-escher-dedfff dark:border-escher-darkblue_border py-1.5 text-escher-text4 dark:text-white rounded-full hover:bg-gray-100 dark:hover:bg-escher-darkblue_2 transition-all"
                    >
                        {defiPosition === undefined && "LP positions"}
                        {defiPosition === true && "In range"}
                        {defiPosition === false && "Out of range"}
                    </SelectTrigger>
                    <SelectContent className="dark:bg-escher-dark_0c203d dark:border-escher-darkblue_border">
                        <SelectItem value="all" >
                            <div className="text-escher-777e90">-- All positions --</div>
                        </SelectItem>
                        <SelectItem value="true" >
                            In range
                        </SelectItem>
                        <SelectItem value="false">
                            Out of range
                        </SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {defiType === "swap" && <>
                <div className="grid grid-cols-3 gap-6">
                    {swaps.map((swap, k) => {
                        switch (swap.defi.info.name) {
                            case "Uniswap":
                                return (
                                    <UniswapSwap
                                        key={k}
                                        defi={swap.defi.info}
                                        swap={swap}
                                        isCosmosConnected={account.cosmos?.isConnected ?? false}
                                        skipClient={skipClient}
                                        userAddress={(account.evm?.address as `0x${string}` | undefined) ?? zeroAddress}
                                    />
                                );

                            case "Osmosis":
                                return (
                                    <OsmosisSwap
                                        key={k}
                                        defi={swap.defi.info}
                                        swap={swap}
                                    />
                                );

                            default:
                                return <></>
                        }
                    }
                    )}
                </div>
            </>}

            {defiType === "lp" &&
                <>
                    <div className="w-full bg-white dark:bg-escher-dark_0c203d border border-escher-dedfff dark:border-escher-darkblue_border rounded-lg">
                        <table className="w-full">
                            <thead>
                                <tr className="text-xs text-escher-777e90">
                                    <td className="py-4 px-2 pl-4">Pool</td>
                                    <td className="py-4 px-2">Protocol</td>
                                    <td className="py-4 px-2">TVL</td>
                                    <td className="py-4 px-2">APR</td>
                                    <td className="py-4 px-2">Volume (24h)</td>
                                    <td className="py-4 px-2">Points</td>
                                    <td className="py-4 px-2">My Position</td>
                                    <td className="py-4 px-2">Rewards</td>
                                    <td className="py-4 px-2 pr-4">Actions</td>
                                </tr>
                            </thead>
                            <tbody>
                                {pools.map((pool, k) => {
                                    switch (pool.defi.name) {
                                        case "Uniswap":
                                            if (!defiLst || (pool.pool as UniswapPoolResult).defiPool.lst === defiLst)
                                                return (
                                                    <UniswapPool
                                                        key={k}
                                                        defi={pool.defi}
                                                        pool={pool.pool as UniswapPoolResult}
                                                    />
                                                );
                                            break;

                                        case "Osmosis":
                                            if (!defiLst || (pool.pool as OsmosisPoolResult).pool.lst === defiLst)
                                                return (
                                                    <OsmosisPool
                                                        key={k}
                                                        defi={pool.defi}
                                                        pool={pool.pool as OsmosisPoolResult}
                                                        type="row"
                                                    />
                                                );
                                            break;

                                        default:
                                            return <></>
                                    }
                                })}
                            </tbody>
                        </table>
                    </div>
                    {pools.length === 0 &&
                        <NoData
                            className="mt-0"
                        />
                    }
                </>
            }
        </div>
    );
}

export default Page;