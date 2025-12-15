import Button from "@/components/global/button"
import Icon from "@/components/global/icons"
import { getExplorerUrlByChainId } from "@/lib/utils"
import { CustomToken } from "@/types/chain"
import Link from "next/link"
import { useMemo } from "react"

interface Props {
    amount0: string
    amount1: string
    token0: CustomToken
    token1: CustomToken
    hash: string
    setOpen?(val: boolean): void
}

const Success = (props: Props) => {
    const explorerLink = useMemo(() => {
        return getExplorerUrlByChainId(
            props.token0.chain.id,
            "tx",
            props.hash
        );
    }, [props.hash, props.token0.chain.id]);

    const valueText = useMemo(() => {
        return `${props.amount0} ${props.token0.symbol} and ${props.amount1} ${props.token1.symbol}`;
    }, [props]);

    return (
        <div className={`w-[400px] bg-white rounded-lg flex flex-col items-center p-4 leading-none bg-[url('/images/modal-bg.svg')] bg-cover bg-top bg-no-repeat`}>
            <button
                className="self-end rounded-full border border-gray-300 text-gray-400 p-1.5"
                onClick={() => props.setOpen && props.setOpen(false)}
            >
                <Icon type="FaTimes" />
            </button>

            <div className="bg-escher-dedfff text-escher-electricblue rounded-full p-4">
                <Icon type="FaCheck" size="lg" />
            </div>

            <div className="text-2xl font-bold text-escher-gray800 dark:text-white mt-6">
                Bridge Completed
            </div>
            <div className="text-sm text-escher-gray500 dark:text-white text-center">
                You have successfully bridged <b>{valueText}</b>
                {explorerLink &&
                    <>
                        <br />
                        Check status on <Link href={explorerLink} target="_blank" className="text-escher-electricblue font-medium underline underline-offset-1" >explorer</Link>
                    </>
                }
            </div>

            <Button title="Continue" style="fill" className="w-full mt-6" onClick={() => props.setOpen && props.setOpen(false)} />
        </div>
    );
}

export default Success;