"use client";

import Card from "@/components/global/card";
import AppOsmosis from "@/components/page/apps/app-osmosis";
import AppUniswap from "@/components/page/apps/app-uniswap";
import useDefi from "@/hooks/defi/useDefi";

export type DappChain = 'union' | 'babylon';
export type DappTag = 'lending' | 'yield' | 'pools';
export type Dapp = {
    chain: DappChain
    description: string
    link: string
    linkText: string
    logo: string
    name: string
    tag: DappTag
    value: string
}

const Page = () => {
    const defis = useDefi();
    // const [appTag, setAppTag] = useState<DappTag>();

    return (
        <div className="w-full max-w-[1440px] mx-auto flex flex-col p-8 gap-6">

            {/* header */}
            <Card className="items-center">
                <div className="text-4xl font-semibold text-escher-gray900 dark:text-white">DeFi Connectivity</div>
            </Card>

            {/* <div className="grid grid-cols-3 gap-6"> */}
            <div className="grid grid-cols-3 gap-6">
                {/* 
                    <AppTower
                        defi={defis.tower.info}
                    />
                */}
                <AppUniswap
                    defi={defis.uniswap.info}
                />

                <AppOsmosis
                    defi={defis.osmosis.info}
                />
            </div>
            {/* <Card className="col-span-2 h-[350px] flex items-center justify-center bg-[url('/images/defi-1.svg')] bg-[length:100%_120%] bg-no-repeat bg-center">
                    <div className="text-sm font-bold text-escher-electricblue dark:text-white">Coming soon</div>
                </Card> */}
            {/* </div> */}
        </div >
    );
}

export default Page;


/* filter
<div className="flex justify-between items-center">
    <div className="flex items-center gap-3">
        <Select>
            <SelectTrigger className="flex items-center gap-2 px-4 py-2.5 shadow-sm border border-escher-gray100 dark:border-escher-30425b rounded-lg bg-white hover:bg-escher-purple50 hover:text-escher-electricblue dark:text-white transition-all">
                <Image alt="" src="/images/token/babylon-v2.svg" width={16} height={16} />
                <div>Babylon</div>
            </SelectTrigger>
            <SelectContent className="">
                <SelectItem value="light" >
                    <div className="flex items-center gap-2">
                        <Image alt="" src="/images/token/babylon-v2.svg" width={16} height={16} />
                        <div>Babylon</div>
                    </div>
                </SelectItem>
                <SelectItem value="dark" disabled>
                    <div className="flex items-center gap-2">
                        <Image alt="" src="/images/token/union.svg" width={16} height={16} />
                        <div>Union</div>
                    </div>
                </SelectItem>
            </SelectContent>
        </Select>

        <Select>
            <SelectTrigger className="flex items-center gap-2 px-4 py-2.5 shadow-sm border border-escher-gray100 dark:border-escher-30425b rounded-lg bg-white hover:bg-escher-purple50 hover:text-escher-electricblue dark:text-white transition-all">
                <Image alt="" src="/images/token/e-babylon.svg" width={16} height={16} />
                <div>eBABY</div>
            </SelectTrigger>
            <SelectContent className="">
                <SelectItem value="light" >
                    <div className="flex items-center gap-2">
                        <Image alt="" src="/images/token/e-babylon.svg" width={16} height={16} />
                        <div>eBABY</div>
                    </div>
                </SelectItem>
                <SelectItem value="dark" disabled>
                    <div className="flex items-center gap-2">
                        <Image alt="" src="/images/token/e-union.svg" width={16} height={16} />
                        <div>eUNO</div>
                    </div>
                </SelectItem>
            </SelectContent>
        </Select>
    </div>
    <div className="flex gap-3 font-medium text-sm text-escher-gray800 dark:text-white">
        <button
            className={`px-4 py-2.5 shadow-sm border border-escher-gray100 dark:border-escher-30425b rounded-lg hover:bg-escher-purple50 hover:text-escher-electricblue dark:text-white transition-all ${!appTag ? 'bg-escher-purple50 text-escher-electricblue dark:text-white' : 'bg-white'}`}
            onClick={() => setAppTag(undefined)}
        >All</button>
        <button
            className={`px-4 py-2.5 shadow-sm border border-escher-gray100 dark:border-escher-30425b rounded-lg hover:bg-escher-purple50 hover:text-escher-electricblue dark:text-white transition-all ${(appTag === "lending") ? 'bg-escher-purple50 text-escher-electricblue dark:text-white' : 'bg-white'}`}
            onClick={() => setAppTag("lending")}
        >LENDING</button>
        <button
            className={`px-4 py-2.5 shadow-sm border border-escher-gray100 dark:border-escher-30425b rounded-lg hover:bg-escher-purple50 hover:text-escher-electricblue dark:text-white transition-all ${(appTag === "yield") ? 'bg-escher-purple50 text-escher-electricblue dark:text-white' : 'bg-white'}`}
            onClick={() => setAppTag("yield")}
        >YIELD AGGREGATION</button>
        <button
            className={`px-4 py-2.5 shadow-sm border border-escher-gray100 dark:border-escher-30425b rounded-lg hover:bg-escher-purple50 hover:text-escher-electricblue dark:text-white transition-all ${(appTag === "pools") ? 'bg-escher-purple50 text-escher-electricblue dark:text-white' : 'bg-white'}`}
            onClick={() => setAppTag("pools")}
        >LIQUIDITY POOLS</button>

        <div className="relative h-full flex items-center justify-center">
            <input
                type="text"
                className="h-full w-full bg-white pl-10 pr-4 py-[12px] shadow-sm border border-escher-gray100 dark:border-escher-30425b rounded-lg placeholder-escher-gray400 text-escher-gray800 dark:text-white font-medium text-sm"
                placeholder="Search"
            />
            <Icon type="FiSearch" size="lg" className="text-escher-gray400 dark:text-escher-777e90 absolute left-2" />
        </div>
    </div>
</div>
*/

// const apps: Dapp[] = [
//     {
//         chain: "union",
//         tag: "lending",
//         name: "AAVE",
//         logo: "/images/apps/app-aave.png",
//         description: "Aave Protocol is a non-custodial liquidity protocol. Users can participate as suppliers, borrowers, or liquidators, earning interest on supplied assets and borrowing in an overcollateralized manner.",
//         link: "https://app.aave.com/",
//         linkText: "app.aave.com",
//         value: "$21.232b"
//     },
// {
//     chain: "union",
//     tag: "lending",
//     name: "COMPOUND",
//     logo: "/images/apps/app-compound.png",
//     description: "Compound III is an EVM compatible protocol that enables supplying of crypto assets as collateral in order to borrow the base asset.",
//     link: "https://compound.finance/",
//     linkText: "compound.finance",
//     value: "$2.839b"
// },
// {
//     chain: "union",
//     tag: "lending",
//     name: "MARS PROTOCOL",
//     logo: "/images/apps/app-mars.png",
//     description: "Mars Protocol consists of a money market, called Red Bank, and a generalized credit primitive called Rover.",
//     link: "https://marsprotocol.io/",
//     linkText: "marsprotocol.io",
//     value: "$25.76m"
// },
// {
//     chain: "union",
//     tag: "yield",
//     name: "YEARN",
//     logo: "/images/apps/app-yearn.png",
//     description: "earn finance is a group of protocols running on the Ethereum blockchain that allow users to optimize their earnings on crypto assets through lending and trading services.",
//     link: "https://yearn.fi/",
//     linkText: "yearn.fi",
//     value: "$231.49m"
// },
// {
//     chain: "union",
//     tag: "yield",
//     name: "BEEFY",
//     logo: "/images/apps/app-beefy.png",
//     description: "Beefy is a Decentralized, Multichain Yield Optimizer that allows its users to earn compound interest on their crypto holdings. Beefy earns you the highest APYs with safety and efficiency in mind.",
//     link: "https://beefy.com/",
//     linkText: "beefy.com",
//     value: "$271.53m"
// },
// {
//     chain: "union",
//     tag: "yield",
//     name: "REAPER",
//     logo: "/images/apps/app-reaper.png",
//     description: "Reaper is an auto-compounding yield farm that uses compound interest to maximize user yields.",
//     link: "https://reaper.farm/",
//     linkText: "reaper.farm",
//     value: "$6.65m"
// },
// {
//     chain: "union",
//     tag: "pools",
//     name: "UNISWAP V3",
//     logo: "/images/apps/app-uniswap.png",
//     description: "A suite of persistent, non-upgradable smart contracts that together create an automated market maker, a protocol that facilitates peer-to-peer market making and swapping of ERC-20 tokens on the Ethereum blockchain.",
//     link: "https://uniswap.org/",
//     linkText: "uniswap.org",
//     value: "$3.65b"
// },
// {
//     chain: "union",
//     tag: "pools",
//     name: "BALANCER",
//     logo: "/images/apps/app-balancer.png",
//     description: "DeFi's most extensive AMM product suite—Balancer is a decentralized Automated Market Maker protocol built on Ethereum with a clear focus on fungible.",
//     link: "https://balancer.fi/",
//     linkText: "balancer.fi",
//     value: "$1.086b"
// },
// {
//     chain: "union",
//     tag: "pools",
//     name: "OSMOSIS",
//     logo: "/images/apps/app-osmosis.png",
//     description: "Osmosis is the premier cross-chain DeFi hub. As the liquidity center and primary trading venue of Cosmos.",
//     link: "https://osmosis.zone/",
//     linkText: "osmosis.zone",
//     value: "$111.41m"
// },
// {
//     chain: "babylon",
//     tag: "pools",
//     name: "TOWER",
//     logo: "/images/apps/app-tower.png",
//     description: "Trade smarter, faster, and more securely with the power of Bitcoin-secured Babylon.",
//     link: APP_CONFIG.network === "mainnet" ? "https://app.tower.fi/" : "https://testnet.tower.fi/",
//     linkText: "tower.fi",
//     value: "$na"
// },
// ]