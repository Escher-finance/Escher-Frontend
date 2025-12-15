import Icon from "@/components/global/icons";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Image from "next/image";
import { useState } from "react";
import AssetsNativeRowChain from "./native-row-chain";

interface Props {
    logo: string
    name: string
    balance: string
    value: string
    reward: string
    apr: string
}

const AssetsNativeRow = (props: Props) => {
    const [open, setOpen] = useState<string>();

    return (
        <Accordion type="single" collapsible onValueChange={v => setOpen(v)}>
            <AccordionItem value="item-1">
                <AccordionTrigger
                    className="flex px-6 py-0 border-t border-escher-gray300 dark:border-none hover:bg-escher-gray50 transition-all text-left text-sm"
                >
                    <div className="flex-1 flex items-center">
                        <div className="w-[28%] py-4 flex items-center gap-2">
                            <Image src={props.logo} width={23} height={23} alt="" />
                            <div className="font-semibold text-escher-gray800 dark:text-white">{props.name}</div>
                        </div>
                        <div className="w-[24%] py-4 flex flex-col items-start">
                            <div className="font-semibold text-escher-gray800 dark:text-white">{props.balance}</div>
                            <div className="text-xs text-escher-gray400 dark:text-escher-777e90">{props.value}</div>
                        </div>
                        <div className="w-[24%] py-4 font-semibold text-escher-gray800 dark:text-white">{props.reward}</div>
                        <div className="w-[24%] py-4 font-semibold text-escher-gray800 dark:text-white flex items-center justify-between gap-6">
                            <div className="flex-1 overflow-hidden">{props.apr}</div>
                            <Icon type="FaChevronRight" className={`text-escher-gray400 dark:text-escher-777e90 ${open && 'rotate-90'} transition-all`} size="sm" />
                        </div>
                    </div>
                </AccordionTrigger>
                <AccordionContent
                    className="flex flex-col bg-escher-electricblue_light5 px-6 text-xs"
                >
                    {/* <div className="flex items-center py-4 text-escher-gray400 dark:text-escher-777e90">
                        <div className="w-[28%]">Controlling chain</div>
                        <div className="w-[24%]">Validator</div>
                        <div className="w-[16%]">Balance</div>
                        <div className="w-[16%]">Commission</div>
                        <div className="w-[16%]">Reward</div>
                    </div> */}
                    <table className="w-full">
                        <tbody>
                            <tr className="text-escher-gray400 dark:text-escher-777e90">
                                <td className="py-4">Controlling chain</td>
                                <td className="py-4">Validator</td>
                                <td className="py-4">Balance</td>
                                <td className="py-4">Commission</td>
                                <td className="py-4">Reward</td>
                            </tr>
                            <AssetsNativeRowChain
                                chainLogo={"/images/token-u.png"}
                                chainName={'Union'}
                                validatorLogo={"/images/valid-cosmostation.png"}
                                validatorName={"Cosmostation"}
                                balance={"10"}
                                commision={"5%"}
                                reward={"5"}
                            />
                            <AssetsNativeRowChain
                                chainLogo={"/images/token-bera.png"}
                                chainName={'Berachain'}
                                validatorLogo={"/images/valid-stakely.png"}
                                validatorName={"Stakely"}
                                balance={"20"}
                                commision={"5%"}
                                reward={"8"}
                            />
                            <AssetsNativeRowChain
                                chainLogo={"/images/token-arbitrum.png"}
                                chainName={'Arbitrum'}
                                validatorLogo={"/images/valid-crosnet.png"}
                                validatorName={"Crosnet"}
                                balance={"10"}
                                commision={"5%"}
                                reward={"7"}
                            />
                        </tbody>
                    </table>
                </AccordionContent>
            </AccordionItem>
        </Accordion >
    );
}

export default AssetsNativeRow;