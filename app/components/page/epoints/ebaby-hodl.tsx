import Icon from "@/components/global/icons";
import LdrsAnimation from "@/components/global/ldrsAnimation";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BABYLON_CONTRACTS } from "@/configs/babylon";
import { CHAINS } from "@/configs/chains";
import { formatDecimal, formatNumber } from "@/lib/utils";
import { CustomToken } from "@/types/chain";
import { Point } from "@/types/points";
import Image from "next/image";
import { useMemo, useState } from "react";

interface Props {
    columnSize: string[]
    tokens: CustomToken[]
    isFetched: boolean
    points?: Point[]
}

const EBabyHodl = (props: Props) => {
    const [open, setOpen] = useState(false);

    const eBabyToken = useMemo(() => {
        return props.tokens.find(v => v.id === `${CHAINS.babylon.id}_${BABYLON_CONTRACTS.liquidTokenAddress.babylon}`);
    }, [props.tokens]);

    const points = useMemo(() => props.points?.map(point => (
        {
            ...point,
            token: point.chainId === CHAINS.mainnet.id ?
                props.tokens.find(t => t.id === `${CHAINS.mainnet.id}_0x70dF20655b3e294facB436383435754dbee3CD70`) :
                props.tokens.find(t => t.id === `${CHAINS.babylon.id}_${BABYLON_CONTRACTS.liquidTokenAddress.babylon}`),
        })), [props.points, props.tokens])

    const totalValues = useMemo(() => ({
        balance: points?.reduce((sum, point) => sum += formatDecimal(Number(point.token?.balance?.value ?? 0), -(point.token?.decimals ?? 0)), 0),
        point: points?.reduce((sum, point) => sum += (point.points ?? 0), 0),
        speed: points?.reduce((sum, point) => sum += (point.speed ?? 0), 0),
    }), [points]);

    return (
        <Accordion type="single" collapsible onValueChange={v => setOpen(v === 'item-1')}>
            <AccordionItem value="item-1" className={`rounded-lg border ${open ? 'border-escher-electricblue dark:border-escher-darkblue_border' : 'border-escher-dedfff dark:border-escher-darkblue_border'}`}>
                <AccordionTrigger
                    className={`group w-full hover:bg-escher-F1F2FB ${open ? 'rounded-t-lg bg-escher-F1F2FB dark:bg-escher-dark_0c203d' : 'rounded-lg bg-white dark:bg-escher-dark_0c203d'} flex px-6 py-2 items-center transition-all text-escher-black dark:text-white text-sm font-semibold min-h-[70px]`}
                >
                    <div className={`${props.columnSize[0]}`}>eBABY HODL</div>
                    <div className={`${props.columnSize[1]}`}>Escher LST</div>
                    <div className={`${props.columnSize[2]} flex items-start`}>
                        <div className={`flex items-center gap-1 border border-escher-dedfff dark:border-escher-darkblue_border rounded-full bg-white dark:bg-escher-dark_0c203d p-1 pr-2`}>
                            {eBabyToken?.icon &&
                                <Image src={eBabyToken?.icon} alt="" width={16} height={16} />
                            }
                            {totalValues.balance ?
                                <div>{formatNumber(totalValues.balance)}</div>
                                : <LdrsAnimation size={18} />
                            }
                        </div>
                    </div>
                    <div className={`${props.columnSize[3]} flex items-start`}>
                        <div className={`flex items-center gap-1`}>
                            <Image src={"/images/epoint.svg"} alt="" width={16} height={16} />
                            {props.isFetched ?
                                <div>{formatNumber((totalValues.point ?? 0), false)}</div>
                                : <LdrsAnimation size={18} />
                            }
                        </div>
                    </div>
                    <div className={`${props.columnSize[4]} flex items-start`}>
                        <div className={`flex items-center gap-1 border border-escher-dedfff dark:border-escher-darkblue_border rounded-full bg-white dark:bg-escher-dark_0c203d py-1 px-2`}>
                            {props.isFetched ?
                                <div>{formatNumber((totalValues.speed ?? 0), false)} points / h</div>
                                : <LdrsAnimation size={18} />
                            }
                        </div>
                    </div>
                    <div className={`${props.columnSize[5]} flex justify-end`}>
                        <Icon type="FaChevronDown" size="sm" className={`text-escher-141B34 transition-all ${open && 'rotate-180'}`} />
                    </div>
                </AccordionTrigger>
                <AccordionContent className="p-6 grid grid-cols-4 gap-y-2 text-escher-black dark:text-white">
                    {points?.map(point => <>
                        <div className="flex flex-col gap-1">
                            <div className="font-medium text-sm">Sub-bucket</div>
                            <div className="text-xs text-escher-electricblue dark:text-white flex items-center gap-1">
                                {point.token?.chain.icon &&
                                    <Image alt="" src={point.token?.chain.icon} className="w-4 h-4" width={16} height={16} />
                                }
                                <div>{point.token?.chain.name}</div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-1">
                            <div className="font-medium text-sm">Multiplier</div>
                            <div className="text-xs text-escher-electricblue dark:text-white">1x</div>
                        </div>

                        <div className="flex flex-col gap-1">
                            <div className="font-medium text-sm">Token Balance</div>
                            {point.token?.balance?.formattedBalance ?
                                <div className="text-xs text-escher-electricblue dark:text-white">{formatNumber(point.token?.balance?.formattedBalance)}</div>
                                : <LdrsAnimation size={18} />
                            }
                        </div>

                        <div className="flex flex-col gap-1">
                            <div className="font-medium text-sm">ePoints Balance</div>
                            {props.isFetched ?
                                <div className="text-xs text-escher-electricblue dark:text-white">{formatNumber((point.points ?? 0), false)}</div>
                                : <LdrsAnimation size={18} />
                            }
                        </div>
                    </>)}
                </AccordionContent>
            </AccordionItem>
        </Accordion >
    );
}

export default EBabyHodl;