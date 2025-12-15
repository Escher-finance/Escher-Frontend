import Icon from "@/components/global/icons";
import LdrsAnimation from "@/components/global/ldrsAnimation";
import TokenChain from "@/components/global/tokenChain";
import { TraceLine } from "@/components/global/unionTrace/components";
import { DialogContent, DialogEmpty, DialogTitle } from "@/components/ui/dialog-empty";
import { getTotalPhase } from "@/lib/union";
import { CustomToken } from "@/types/chain";
import { ProgressStatus } from "@/types/status";
import { useMemo } from "react";

interface Props {
    open: boolean
    amount: string
    tokenIn: CustomToken
    tokenOut: CustomToken
}

const totalLine = 26;

const Progress = (props: Props) => {
    const totalPhase = getTotalPhase("bridge");
    const curTrace = useMemo(() => {
        return 2 / totalPhase * 100
    }, []);

    return (
        <DialogEmpty open={props.open}>
            <DialogContent
                className="w-fit rounded-[20px] md:rounded-[20px] lg:rounded-[20px] border border-escher-E4E8ED dark:border-escher-darkblue_border dark:text-white"
                aria-describedby=""
                onPointerDownOutside={e => e.preventDefault()}
            >
                <div className="flex flex-col w-full p-2">
                    <DialogTitle className="hidden"></DialogTitle>

                    <div className="min-w-[620px] flex flex-col p-4">
                        {/* <button onClick={() => setSuccessTxHash(props.operation === "bond" ? testBondTx : testUnbondTx)}>skip</button> */}
                        <div className="flex items-center justify-between">
                            <div className="text-xl font-bold">BRIDGE IN PROGRESS</div>
                        </div>

                        <div className="flex flex-col gap-2 rounded-[20px] border border-escher-dedfff dark:border-escher-darkblue_border bg-escher-F5F6F8 dark:bg-escher-darkblue p-2 mt-4">
                            <div className="flex">
                                <div className="w-[30%] bg-white dark:bg-escher-darkblue border border-escher-dedfff dark:border-escher-darkblue_border rounded-xl p-3 flex items-center gap-1">
                                    <div className="text-xl font-semibold flex-1 overflow-hidden">{props.amount}</div>
                                    <TokenChain token={props.tokenIn} tokenSize={28} chainSize={14} />
                                </div>
                                <div className="w-[40%] flex justify-between px-4 relative">
                                    {[...Array(totalLine)].map((_, index) => (
                                        <TraceLine key={index} percentage={curTrace} curLine={index} totalLine={totalLine} isFinished={false} />
                                    ))}
                                </div>
                                <div className="w-[30%] bg-white dark:bg-escher-darkblue border border-escher-dedfff dark:border-escher-darkblue_border rounded-xl p-3 flex items-center gap-1">
                                    <div className="text-xl font-semibold flex-1 overflow-hidden">{props.amount}</div>
                                    <TokenChain token={props.tokenOut} tokenSize={28} />
                                </div>
                            </div>
                            <div className="flex justify-between gap-16 p-2">
                                <Phase
                                    title="STEP 1"
                                    subtitle="Preparing transaction"
                                    status={"success"}
                                    showLine={false}
                                />

                                <Phase
                                    title="STEP 2"
                                    subtitle="Executing transaction"
                                    status={"onProgress"}
                                    showLine={false}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </DialogEmpty >
    );
}

const Phase = (props: { status: ProgressStatus, title: string, subtitle: string, showLine: boolean }) => {
    return (
        <div className="flex gap-2 items-start">
            <div className="flex flex-col gap-1 items-center text-escher-electricblue dark:text-white">
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
                <div className="text-xs text-escher-777e90">{props.subtitle}</div>
            </div>
        </div>
    );
}

export default Progress;