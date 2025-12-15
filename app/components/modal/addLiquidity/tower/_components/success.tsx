import Button from "@/components/global/button"
import Icon from "@/components/global/icons"
import { BABYLON_CONTRACTS } from "@/configs/babylon"
import { CHAINS } from "@/configs/chains"
import { CustomToken } from "@/types/chain"
import { DefiPool } from "@/types/defi"
import Link from "next/link"
import { useMemo } from "react"

interface Props {
    activeTokenObj: CustomToken
    pool: DefiPool
    formType: 'single' | 'double'
    fTokenAAmount: string
    fTokenAmount: string
    fTokenBAmount: string
    hash?: string
    setOpen?(val: boolean): void
}

const Success = (props: Props) => {
    const explorerLink = useMemo(() => {
        if (!props.hash || !props.activeTokenObj.chain.chainName) {
            return undefined;
        }

        switch (props.activeTokenObj.chain.chainName) {
            case CHAINS.babylon.chainName ?? "":
                return BABYLON_CONTRACTS.tx_page.replace("${txHash}", props.hash);
        }

        return undefined;
    }, [props.hash, props.activeTokenObj]);

    const valueText = useMemo(() => {
        switch (props.formType) {
            case "single":
                return `${props.fTokenAmount} ${props.activeTokenObj.symbol}`;
            case "double":
                return `${props.fTokenAAmount} ${props.pool.tokenA.symbol} and ${props.fTokenBAmount} ${props.pool.tokenB.symbol}`;
        }
    }, [props.activeTokenObj.symbol, props.fTokenAAmount, props.fTokenAmount, props.fTokenBAmount, props.formType, props.pool.tokenA.symbol, props.pool.tokenB.symbol]);

    return (
        <div className={`w-[400px] flex flex-col items-center p-4 leading-none bg-[url('/images/modal-bg.svg')] bg-cover bg-top bg-no-repeat`}>
            <button
                className="self-end rounded-full border border-gray-300 text-gray-400 p-1.5"
                onClick={() => props.setOpen && props.setOpen(false)}
            >
                <Icon type="FaTimes" />
            </button>

            <div className="bg-escher-dedfff text-escher-electricblue dark:text-white rounded-full p-4">
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
                        Check status on <Link href={explorerLink} target="_blank" className="text-escher-electricblue dark:text-white font-medium underline underline-offset-1" >explorer</Link>
                    </>
                }
            </div>

            <Button title="Continue" style="fill" className="w-full mt-6" onClick={() => props.setOpen && props.setOpen(false)} />
        </div>
    );
}

export default Success;