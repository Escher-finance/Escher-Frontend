"use client";

import DefiUniswap from "@/components/page/epoints/defi-uniswap";
import EBabyHodl from "@/components/page/epoints/ebaby-hodl";
import EUHodl from "@/components/page/epoints/eu-hodl";
import { useEscher } from "@/components/providers/escherProvider";
import useDefi from "@/hooks/defi/useDefi";
import { usePoints } from "@/hooks/usePoints";
import { formatNumber } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

const columnSize = [
    "[width:15%]",
    "[width:15%]",
    "[width:21%]",
    "[width:12%]",
    "[width:15%]",
    "[width:22%]"
];

const Page = () => {
    const { account, tokens } = useEscher();
    const defis = useDefi();
    const points = usePoints();

    return (
        <div className="w-full max-w-[1440px] mx-auto flex flex-col text-escher-black dark:text-white px-6 py-10">

            <div className="w-full bg-white dark:bg-escher-darkblue border border-escher-e4e8ed dark:border-escher-darkblue_border rounded-lg flex items-center justify-start p-6 h-[200px] bg-[url('/images/point-banner.png')] bg-right bg-contain bg-no-repeat">
                <div
                    className="font-bold text-[40px] leading-none"
                    onClick={() => console.log({ points })}
                >ePoints Program</div>
            </div>

            <div className="flex flex-col rounded-lg border border-escher-e4e8ed dark:border-escher-darkblue_border bg-white dark:bg-escher-darkblue mt-6">
                <div className="flex justify-between px-6 py-5 leading-none">
                    <div className="flex flex-col gap-1">
                        <div className="text-lg font-medium">ePoints</div>
                        <div className="text-[40px] font-semibold">{formatNumber(points.totalPoints, false, 2)}</div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <Link href={"/epoints/leaderboard"} className="flex items-center gap-2 bg-[linear-gradient(90deg,#FCE39B_0%,#FEEFB6_50%,#FCEAAB_62.5%,#FBE49F_75%,#F4D883_87.5%,#F7E7B8_100%)] transition-all rounded-full p-3 text-sm font-semibold dark:text-black">
                            <Image alt="" src="/icons/rewards_icon-black.svg" width={18} height={18} />
                            <div>Leaderboard</div>
                        </Link>
                        <Link href={"/faq?tab=epoints"} className="flex items-center gap-2 bg-escher-gray100 dark:bg-escher-darkblue_2 hover:bg-escher-gray200 transition-all text-escher-777e90 rounded-full px-4 py-2 text-sm font-semibold">
                            <Image alt="" src="/icons/sidebar/faqs_icon_2.svg" width={24} height={24} />
                            <div>FAQ</div>
                        </Link>
                    </div>
                </div>
                <div className="border-t border-escher-e4e8ed dark:border-escher-darkblue_border flex text-xs text-escher-text4 font-medium py-5 px-6">
                    <div className={`${columnSize[0]}`}>ePoints Bucket</div>
                    <div className={`${columnSize[1]}`}>Type</div>
                    <div className={`${columnSize[2]}`}>Balance</div>
                    <div className={`${columnSize[3]}`}>ePoints</div>
                    <div className={`${columnSize[4]}`}>Speed</div>
                    <div className={`${columnSize[5]}`}>Partner programs</div>
                </div>
            </div>

            <div className="flex flex-col gap-4 mt-4">
                <EBabyHodl
                    columnSize={columnSize}
                    tokens={tokens}
                    isFetched={points.queryPoints.isFetched}
                    points={points.pointBabylon}
                />

                <EUHodl
                    columnSize={columnSize}
                    tokens={tokens}
                    isFetched={points.queryPoints.isFetched}
                    points={points.pointUnion}
                />

                <DefiUniswap
                    columnSize={columnSize}
                    defi={defis.uniswap}
                    isCosmosConnected={account.cosmos?.isConnected ?? false}
                    isPointFetched={points.queryPoints.isFetched}
                    points={[
                        ...(points.pointDefiBabylon ? points.pointDefiBabylon : []),
                        ...(points.pointDefiUnion ? points.pointDefiUnion : []),
                    ]}
                    tokens={tokens}
                />
            </div>
        </div>
    );
}

export default Page;