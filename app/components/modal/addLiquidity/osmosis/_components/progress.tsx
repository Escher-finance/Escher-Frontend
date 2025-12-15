import Icon from "@/components/global/icons";
import LdrsAnimation from "@/components/global/ldrsAnimation";
import TokenChain from "@/components/global/tokenChain";
import { TraceLine } from "@/components/global/unionTrace/components";
import { CustomToken } from "@/types/chain";
import { Defi } from "@/types/defi";
import { ProgressStatus } from "@/types/status";
import Image from "next/image";
import { useMemo } from "react";

interface Props {
    defi: Defi
    tokenA: CustomToken
    tokenB: CustomToken
    inputAmount: string
    outputAmount: string
    statusPrepare: ProgressStatus
    statusOperation: ProgressStatus
}

const totalLine = 28;

const Phase = (props: { status: ProgressStatus, title: string, subtitle: string, showLine: boolean }) => {
    return (
        <div className="flex gap-2 items-start">
            <div className="flex flex-col gap-1 items-center text-escher-electricblue">
                <div className="w-px h-1.5" />
                {props.status === 'pending' &&
                    <Icon type="FaRegCircle" />
                }
                {props.status === 'onProgress' &&
                    <LdrsAnimation type="ring2" size={16} />
                }
                {props.status === 'success' &&
                    <Icon type="FaCheckCircle" />
                }
                {props.showLine &&
                    <div className="w-px h-10 bg-escher-electricblue" />
                }
            </div>
            <div className="flex flex-col leading-none">
                <div className="text-sm text-escher-text2 dark:text-white font-medium">{props.title}</div>
                <div className="text-[10px] text-escher-777e90">{props.subtitle}</div>
            </div>
        </div>
    );
}

const Progress = (props: Props) => {
    const totalPhase = 2;
    const curTrace = useMemo(() => {

        if (props.statusPrepare === "onProgress") {
            return 0 / totalPhase * 100;
        }

        if (props.statusOperation === "onProgress") {
            return 1 / totalPhase * 100
        }

        return 0;
    }, [props.statusPrepare, props.statusOperation]);

    return (
        <div className="w-[400px] flex flex-col bg-white rounded-[20px]">
            <div className="flex justify-between items-center bg-linear-to-r from-[#FFDDF5] to-transparent rounded-t-[20px] p-4">
                <div className="flex-1 flex items-center gap-2 leading-none">
                    <div className="text-escher-black dark:text-white text-xl font-bold">Add Liquidity</div>
                    <div className="flex items-center gap-1.5 rounded-full p-1 pr-2 bg-[#fdc3ec]">
                        <Image src="/images/apps/app-uniswap-circle-2.svg" alt="" width={16} height={16} className="border border-white rounded-full" />
                        <div className="text-escher-text2 dark:text-white text-sm font-medium">Uniswap</div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-2 rounded-[20px] border border-escher-dedfff dark:border-escher-darkblue_border bg-escher-f5f6f8 dark:bg-escher-darkblue p-4 m-2 mb-0">

                <div className="bg-white border border-escher-dedfff dark:border-escher-darkblue_border rounded-xl flex items-stretch gap-1">
                    {/* <div className="text-xl font-semibold flex-1 overflow-hidden">{props.inputAmount}</div> */}
                    <div className="p-2 flex items-center gap-1">
                        <TokenChain token={props.tokenA} tokenSize={32} />
                        <TokenChain token={props.tokenB} tokenSize={32} />
                    </div>
                    <div className="flex-1 flex justify-between px-0 relative">
                        {[...Array(totalLine)].map((_, index) => (
                            <TraceLine key={index} percentage={curTrace} curLine={index} totalLine={totalLine} isFinished={false} />
                        ))}
                    </div>
                    <div className="p-2">
                        <Image alt="" src={props.defi.logoURI} className="w-8 h-8" />
                    </div>
                </div>
                <div className="flex justify-between gap-16 p-2">
                    <Phase
                        title="STEP 1"
                        subtitle="Preparing transaction"
                        status={props.statusPrepare}
                        showLine={false}
                    />

                    <Phase
                        title="STEP 2"
                        subtitle="Executing transaction"
                        status={props.statusOperation}
                        showLine={false}
                    />
                </div>
            </div>

            <div className="flex items-center justify-center my-4 leading-none">
                <div className="text-xl font-bold">TRANSACTION IN PROGRESS</div>
            </div>
        </div>
    );
}

export default Progress