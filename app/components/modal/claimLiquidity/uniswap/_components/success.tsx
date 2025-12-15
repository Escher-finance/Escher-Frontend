import Button from "@/components/global/button"
import Icon from "@/components/global/icons"
import { useTheme } from "@/components/providers/themeProvider"
import { CHAINS } from "@/configs/chains"
import { getExplorerUrlByChainId } from "@/lib/utils"
import clsx from "clsx"
import Link from "next/link"
import { useMemo } from "react"

interface Props {
    chainName: string
    hash?: string
    setOpen?(val: boolean): void
}

const Success = (props: Props) => {
    const { themeIsDark } = useTheme();

    const explorerLink = useMemo(() => {
        if (props.hash)
            return getExplorerUrlByChainId(
                CHAINS.mainnet.id,
                "tx",
                props.hash
            );

        return undefined;
    }, [props.hash]);

    return (
        <div className={clsx(
            "w-[400px] flex flex-col items-center p-4 leading-none bg-white dark:bg-escher-darkblue bg-cover bg-top bg-no-repeat rounded",
            !themeIsDark && "bg-[url('/images/modal-bg.svg')]"
        )}>
            <button
                className="self-end rounded-full border border-gray-300 text-gray-400 p-1.5"
                onClick={() => props.setOpen && props.setOpen(false)}
            >
                <Icon type="FaTimes" />
            </button>

            <div className="bg-escher-dedfff dark:bg-escher-darkblue_2 text-escher-electricblue dark:text-white rounded-full p-4">
                <Icon type="FaCheck" size="lg" />
            </div>

            <div className="text-2xl font-bold text-escher-gray800 dark:text-white mt-6">
                Claim incentives completed
            </div>
            <div className="text-sm text-escher-gray500 dark:text-white text-center">
                You have successfully claimed your incentives
                {explorerLink &&
                    <>
                        <br />
                        Check status on <Link href={explorerLink} target="_blank" className="text-escher-electricblue dark:text-white font-medium underline underline-offset-1" >explorer</Link>
                    </>
                }
            </div>

            <Button type="link" url="/liquid-staking" title="Liquid stake your BABY" style="fill" className="w-full mt-6" />
        </div>
    );
}

export default Success;