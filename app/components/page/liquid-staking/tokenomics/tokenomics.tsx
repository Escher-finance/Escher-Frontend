import Card from "@/components/global/card";
import LdrsAnimation from "@/components/global/ldrsAnimation";
import { CHAINS } from "@/configs/chains";
import { formatDecimal, formatNumber } from "@/lib/utils";
import { Tokenomics as TokenomicsType } from "@/types/chain";
import { ChainName } from "@cosmos-kit/core";
import { ResponsiveSunburst } from "@nivo/sunburst";
import BigNumber from "bignumber.js";
import clsx from "clsx";
import { useMemo } from "react";

interface SunburstNode {
    name: string;
    value?: number;
    color?: string;
    children?: SunburstNode[];
}

// reason : this for tailwind cache
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const cacheClass = <div className={clsx("bg-[#0008FF]", "bg-[#155EEF]", "bg-[#528BFF]", "bg-[#84ADFF]", "bg-[#B2CCFF]", "bg-[#D1E0FF]")} />

const colors = {
    uno: "#0008FF",
    unoStaked: "#155EEF",
    eUno: "#528BFF",
    sepolia: "#84ADFF",
    holesky: "#B2CCFF",
    union: "#D1E0FF",

}

interface Props {
    liquidToken: ChainName
    tokenomics?: TokenomicsType
}

const Tokenomics = (props: Props) => {

    const texts = useMemo(() => {
        switch (props.liquidToken) {
            case CHAINS.babylon.chainName ?? "":
                return {
                    token: "BABY",
                    tokenStaked: "BABY - Staked",
                    tokenLiquid: "BABY Liquid Staked"
                };
        }
    }, [props.liquidToken]);

    const data = useMemo(() => {
        return {
            name: 'root',
            children: [
                {
                    name: texts?.token,
                    color: colors.uno,
                    value: formatDecimal(Number((props.tokenomics?.total_supply ?? "0")), -6)
                },
                {
                    name: texts?.tokenStaked,
                    color: colors.unoStaked,
                    value: (BigNumber(props.tokenomics?.bonded_tokens ?? "0").shiftedBy(-6).toNumber() - BigNumber(props.tokenomics?.delegated ?? "0").shiftedBy(-6).toNumber()),
                    children: [
                        {
                            name: texts?.tokenLiquid,
                            color: colors.eUno,
                            value: BigNumber(props.tokenomics?.delegated ?? "0").shiftedBy(-6).toNumber(),
                        }
                    ]
                }
            ]
        };
    }, [props.tokenomics, texts]);

    return (
        <Card className="text-escher-gray600 dark:text-white text-sm font-medium gap-0 dark:bg-escher-dark_0c203d">
            <div className="text-sm font-semibold" onClick={() => console.log(props.tokenomics)}>Tokenomics</div>

            <hr className="border border-t border-escher-gray200 dark:border-escher-darkblue_border w-full mt-4" />

            {props.tokenomics ?
                <div className="flex flex-col w-full gap-4 mt-4">
                    <div className="w-1/2 mx-auto">
                        <div className="w-full aspect-square dark:text-escher-black">
                            <ResponsiveSunburst
                                data={data}
                                id="name"
                                value="value"
                                colors={(node) => (node.data as SunburstNode).color || '#ccc'}
                                inheritColorFromParent={false}
                                borderWidth={0}
                                cornerRadius={0}
                                enableArcLabels={false}
                                arcLabel="id"
                                arcLabelsSkipAngle={0}
                                arcLabelsTextColor={{ from: 'color', modifiers: [['darker', 2]] }}
                            />
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-x-6 gap-y-2 items-center">
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                                <div className={`w-4 h-4 bg-[${colors.uno}]`} />
                                <div className="font-semibold">{texts?.token}</div>
                            </div>
                            <div className="text-xs font-semibold">
                                {formatNumber(BigNumber(props.tokenomics?.total_supply ?? "0").shiftedBy(-6).toNumber())} <span className="text-escher-gray400 dark:text-escher-777e90 text-xs font-bold">{texts?.token}</span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                                <div className={`w-4 h-4 bg-[${colors.unoStaked}]`} />
                                <div className="font-semibold">{texts?.tokenStaked}</div>
                            </div>
                            <div className="text-xs font-semibold">
                                {formatNumber(BigNumber(props.tokenomics?.bonded_tokens ?? "0").shiftedBy(-6).toNumber())} <span className="text-escher-gray400 dark:text-escher-777e90 text-xs font-bold">{texts?.token}</span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                                <div className={`w-4 h-4 bg-[${colors.eUno}]`} />
                                <div className="font-semibold">{texts?.tokenLiquid}</div>
                            </div>
                            {props.tokenomics?.delegated ?
                                <div className="text-xs font-semibold">
                                    {formatNumber(BigNumber(props.tokenomics?.delegated ?? "0").shiftedBy(-6).toNumber())} <span className="text-escher-gray400 dark:text-escher-777e90 text-xs font-bold">{texts?.token}</span>
                                </div>
                                :
                                <LdrsAnimation />
                            }
                        </div>
                    </div>
                </div>
                :
                <div className="flex items-center justify-center py-4">
                    <LdrsAnimation />
                </div>
            }
        </Card >
    );
}

export default Tokenomics;