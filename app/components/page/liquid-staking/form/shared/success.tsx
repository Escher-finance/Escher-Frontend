import Button from "@/components/global/button";
import Icon from "@/components/global/icons";
import { getExplorerUrlByChainId } from "@/lib/utils";
import { LiquidStaking } from "@/types/chain";
import { Action } from "@/types/transaction";
import Link from "next/link";
import { useMemo } from "react";

interface Props {
    chainId: string | number
    hash?: string
    lst: LiquidStaking
    onClose(): void
    operation: Action
    unbondingTime: string
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
        <div className={`${props.operation === 'bond' ? "w-[400px]" : "w-[550px]"} flex flex-col items-center p-4 leading-none bg-[url('/images/modal-bg.svg')] dark:bg-none bg-cover bg-top bg-no-repeat`}>
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
                {props.operation === 'bond' ? 'Staking Successful' : 'Unstake requested'}
            </div>
            <div className="text-sm text-escher-gray500 dark:text-white text-center">
                {props.operation === 'bond' ? 'You should receive your liquid staking token soon' : <>
                    Unstaking requires an unbonding period of approximately {props.unbondingTime}.
                    {props.lst === "babylon" && <>
                        <br />
                        After that, <b>your tokens will be automatically deposited into your wallet.</b>
                    </>}
                </>}
                {explorerLink && <>
                    <br />
                    Check status on <Link href={explorerLink} target="_blank" className="text-escher-electricblue dark:text-white font-medium underline underline-offset-1" >explorer</Link>
                </>}
            </div>

            {props.operation === 'bond' ?
                <Button title="Explore Apps" style="fill" preIcon="FiSearch" className="w-full mt-6 gap-2" type="link" url="/apps" />
                :
                <Button title="Close" style="fill" className="w-full mt-6" onClick={props.onClose} />
            }
        </div>
    );
}

export default Success;