import Button from "@/components/global/button";
import Icon from "@/components/global/icons";
import { getExplorerUrlByChainId } from "@/lib/utils";
import Link from "next/link";
import { useMemo } from "react";

interface Props {
    onClose(): void
    chainId: string | number
    hash?: string
}

const Success = (props: Props) => {

    const explorerLink = useMemo(() => {
        if (!props.hash) return undefined;
        return getExplorerUrlByChainId(
            props.chainId,
            "tx",
            props.hash
        );
    }, [props.chainId, props.hash]);

    return (
        <div className={`w-[400px] flex flex-col items-center p-4 leading-none bg-[url('/images/modal-bg.svg')] dark:bg-none bg-cover bg-top bg-no-repeat`}>
            <button
                className="self-end rounded-full border border-gray-300 text-gray-400 p-1.5"
                onClick={props.onClose}
            >
                <Icon type="FaTimes" />
            </button>

            <div className="bg-escher-dedfff dark:bg-escher-darkblue text-escher-electricblue dark:text-white rounded-full p-4">
                <Icon type="FaCheck" size="lg" />
            </div>

            <div className="text-2xl font-bold text-escher-gray800 dark:text-white mt-6">
                Tokens claimed
            </div>
            <div className="text-sm text-escher-gray500 dark:text-white text-center">
                You should receive your unbonded token soon
                {explorerLink && <>
                    <br />
                    Check status on <Link href={explorerLink} target="_blank" className="text-escher-electricblue dark:text-white font-medium underline underline-offset-1" >explorer</Link>
                </>}
            </div>

            <Button title="Close" style="fill" className="w-full mt-6" onClick={props.onClose} />

        </div>
    );
}

export default Success;