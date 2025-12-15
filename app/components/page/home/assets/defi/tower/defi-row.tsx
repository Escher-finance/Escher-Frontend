import Icon from "@/components/global/icons";
import LdrsAnimation from "@/components/global/ldrsAnimation";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { DefiTowerQuery } from "@/hooks/defi/tower/useTowerDefi";
import { formatNumber } from "@/lib/utils";
import Image from "next/image";
import { useState } from "react";
import AssetsDefiRowDetail from "./defi-row-detail";

interface Props {
    defi: DefiTowerQuery
    isCosmosConnected: boolean
}

const AssetsDefiRowTower = (props: Props) => {
    const [open, setOpen] = useState<string>();

    return (
        <Accordion type="single" collapsible onValueChange={v => setOpen(v)}>
            <AccordionItem value="item-1">
                <AccordionTrigger
                    className="flex px-6 py-0 border-t border-escher-gray100 dark:border-escher-30425B hover:bg-escher-gray50 dark:hover:bg-escher-112441 transition-all text-left text-sm"
                >
                    <div className="flex-1 flex items-center">
                        <div className="w-[40%] py-4 flex items-center gap-2">
                            <div className="relative">
                                <Image src={props.defi.info.logoURI} width={20} height={20} alt="" />
                                {props.defi.info.chain.icon &&
                                    <Image src={props.defi.info.chain.icon} width={10} height={10} alt="" className="absolute -top-0.5 -right-0.5 border border-white rounded-full" />
                                }
                            </div>
                            <div className="font-semibold text-escher-gray800 dark:text-white">{props.defi.info.name}</div>
                        </div>
                        <div className="w-[30%] py-4 flex flex-col items-start">
                            {props.isCosmosConnected ? <>
                                {props.defi.isUserDataFetched ?
                                    <div className="font-semibold text-escher-gray800 dark:text-white">${formatNumber(props.defi.info.position ?? 0)}</div>
                                    :
                                    <LdrsAnimation size={18} />
                                }
                            </> :
                                <>-</>
                            }
                        </div>
                        <div className="w-[30%] py-4 font-semibold text-escher-gray800 dark:text-white flex items-center justify-between gap-6">
                            {props.defi.info.tvl ?
                                <div className="">${formatNumber(props.defi.info.tvl ?? 0)}</div>
                                :
                                <LdrsAnimation size={18} />
                            }
                            <Icon type="FaChevronRight" className={`text-escher-gray400 dark:text-escher-777e90 ${open && 'rotate-90'} transition-all`} size="sm" />
                        </div>
                    </div>
                </AccordionTrigger>
                <AccordionContent
                    className="grid grid-cols-[auto,auto,auto,auto] gap-x-4 gap-y-2 items-center bg-escher-electricblue_light5 dark:bg-escher-darkblue px-6 py-4 text-xs"
                >
                    <div className=" text-escher-electricblue dark:text-white font-medium" onClick={() => console.log({ defi: props.defi })}>Assets</div>
                    <div className=" text-escher-electricblue dark:text-white font-medium">APR (24h)</div>
                    <div className=" text-escher-electricblue dark:text-white font-medium">Liquidity</div>
                    <div className=" text-escher-electricblue dark:text-white font-medium">Rewards</div>
                    {props.defi.pools.map((pool, key) =>
                        <AssetsDefiRowDetail
                            key={key}
                            defi={props.defi.info}
                            isCosmosConnected={props.isCosmosConnected}
                            isDefiFetched={pool.queryUserData.isFetched}
                            pool={pool.data}
                        />
                    )}
                </AccordionContent>
            </AccordionItem>
        </Accordion >
    );
}

export default AssetsDefiRowTower;