import Button from "@/components/global/button";
import Icon from "@/components/global/icons";
import { DialogContent, DialogEmpty, DialogTitle } from "@/components/ui/dialog-empty";
// import { BABYLON_CONTRACTS } from "@/configs/babylon"; // unused
// import { CHAINS } from "@/configs/chains"; // unused
// import { CHAINS } from "@/configs/chains"; // unused
// import { EMV_CHAINS } from "@/configs/wagmi"; // unused
import { getExplorerUrlByChainId } from "@/lib/utils";
import { Action } from "@/types/transaction";
import Link from "next/link";
import { useMemo } from "react";

interface Props {
    operation: Action
    chainId: string | number
    hash: string
    open: boolean
    setOpen(val: boolean): void
}

const Success = (props: Props) => {
    const explorerLink = useMemo(() => {
        return getExplorerUrlByChainId(
            props.chainId,
            "tx",
            props.hash
        );
    }, [props.hash]);

    return (
        <DialogEmpty open={props.open} onOpenChange={props.setOpen}>
            <DialogContent
                className="w-fit rounded-[20px] md:rounded-[20px] lg:rounded-[20px] border border-escher-E4E8ED dark:border-escher-darkblue_border"
                aria-describedby=""
                onPointerDownOutside={e => e.preventDefault()}
            >
                <div className="flex flex-col w-full p-2">
                    <DialogTitle className="hidden"></DialogTitle>
                    <div className={`w-[400px] flex flex-col items-center p-4 leading-none bg-[url('/images/modal-bg.svg')] dark:bg-none bg-cover bg-top bg-no-repeat`}>
                        <button
                            className="self-end rounded-full border border-gray-300 text-gray-400 p-1.5"
                            onClick={() => props.setOpen(false)}
                        >
                            <Icon type="FaTimes" />
                        </button>

                        <div className="bg-escher-dedfff text-escher-electricblue rounded-full p-4">
                            <Icon type="FaCheck" size="lg" />
                        </div>

                        <div className="text-2xl font-bold text-escher-gray800 dark:text-white mt-6">
                            Bridging Successful!
                        </div>
                        <div className="text-sm text-escher-gray500 dark:text-white text-center">
                            You should receive your token soon
                            {(explorerLink) && <>
                                <br />
                                Check status on <Link href={explorerLink} target="_blank" className="text-escher-electricblue dark:text-white font-medium underline underline-offset-1" >explorer</Link>
                            </>}
                        </div>

                        {props.operation === 'bond' ?
                            <Button title="Explore Apps" style="fill" preIcon="FiSearch" className="w-full mt-6 gap-2" type="link" url="/apps" />
                            :
                            <Button title="Close" style="fill" className="w-full mt-6" onClick={() => props.setOpen(false)} />
                        }
                    </div>
                </div>
            </DialogContent>
        </DialogEmpty >
    );
}

export default Success;