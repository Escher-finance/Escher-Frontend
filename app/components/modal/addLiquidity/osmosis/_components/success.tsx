import Button from "@/components/global/button"
import Icon from "@/components/global/icons"
import { CHAINS } from "@/configs/chains";
import { getExplorerUrlByChainId } from "@/lib/utils"
import { DefiPool } from "@/types/defi"
import Link from "next/link"
import { useMemo } from "react"

interface Props {
    pool: DefiPool
    fTokenAAmount: string
    fTokenBAmount: string
    hash: string
    setOpen?(val: boolean): void
}

const Success = (props: Props) => {
    const explorerLink = useMemo(() => {
        return getExplorerUrlByChainId(
            CHAINS.mainnet.id,
            "tx",
            props.hash
        );
    }, [props.hash]);

    const valueText = useMemo(() => {
        return `${props.fTokenAAmount} ${props.pool.tokenA.symbol} and ${props.fTokenBAmount} ${props.pool.tokenB.symbol}`;
    }, [props.fTokenAAmount, props.fTokenBAmount, props.pool]);

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
                Deposit Completed
            </div>
            <div className="text-sm text-escher-gray500 dark:text-white text-center">
                You have successfully deposited <b>{valueText}</b>
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