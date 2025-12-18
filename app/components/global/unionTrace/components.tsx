import { CHAINS } from "@/configs/chains"
import { formatDate } from "@/lib/date"
import { shortenAddress } from "@/lib/text"
import { formatNumber, getExplorerUrlByChainId } from "@/lib/utils"
import { CustomToken } from "@/types/chain"
import { UnionTrace } from "@/types/trace"
import Image from "next/image"
import Link from "next/link"
import Icon from "../icons"
import LdrsAnimation from "../ldrsAnimation"
import TokenChain from "../tokenChain"

interface TraceCompProps {
    border: 'left' | 'right'
    isTransactionPage?: boolean
    prevType?: string
    showLine?: boolean
    title: string
    traces?: UnionTrace[]
    type: string
}

export const TraceComp = (props: TraceCompProps) => {
    const prevTrace = props.traces?.find(v => v.type === props.prevType);
    const trace = props.traces?.find(v => v.type === props.type);
    let txLink;
    let formattedHash;

    if (trace && trace?.transaction_hash !== undefined && trace?.transaction_hash !== null) {
        switch (trace?.universal_chain_id) {
            case "ethereum.1":
                txLink = `https://etherscan.io/tx/${trace?.transaction_hash}`;
                formattedHash = trace?.transaction_hash;
                break;

            case "union.union-1":
                txLink = `https://explorer.union.build/union/tx/${trace?.transaction_hash.slice(2, trace?.transaction_hash.length).toUpperCase()}`
                formattedHash = trace?.transaction_hash.toUpperCase().slice(2, trace?.transaction_hash.length);
                break;

            case "babylon.bbn-1":
                formattedHash = trace?.transaction_hash.toUpperCase().slice(2, trace?.transaction_hash.length);
                txLink = getExplorerUrlByChainId(CHAINS.babylon.id, "tx", formattedHash)
                break;

            case "osmosis.osmosis-1":
                formattedHash = trace?.transaction_hash.toUpperCase().slice(2, trace?.transaction_hash.length);
                txLink = getExplorerUrlByChainId(CHAINS.osmosis.id, "tx", formattedHash)
                break;

            // Testnet
            case "ethereum.17000":
                txLink = `https://holesky.etherscan.io/tx/${trace?.transaction_hash}`;
                formattedHash = trace?.transaction_hash;
                break;

            case "union.union-testnet-10":
                txLink = `https://testnet.explorer.union.build/union/tx/${trace?.transaction_hash.slice(2, trace?.transaction_hash.length).toUpperCase()}`
                formattedHash = trace?.transaction_hash.toUpperCase().slice(2, trace?.transaction_hash.length);
                break;
        }
    }

    let status: 'pending' | 'onProgress' | 'success' = 'pending';
    if (trace?.transaction_hash) {
        status = 'success';
    } else {
        if (prevTrace?.transaction_hash) {
            status = "onProgress";
        }
    }

    let date;
    if (trace?.timestamp) {
        try {
            date = formatDate(trace?.timestamp);
        } catch (error) {
            console.error(error);
        }
    }

    const padding = props.isTransactionPage ? "4" : "4";

    return (
        <div className={`flex flex-col ${(props.showLine ?? true) ? 'min-h-16' : 'h-fit'} border-escher-e4e8ed dark:border-escher-darkblue_border ${props.border === "left" ? `pr-${padding}` : `pl-${padding} border-l-2`}`}>
            <div className={`flex gap-2 items-center`}>
                <div className="flex flex-col items-center">
                    {status === 'pending' &&
                        <Icon type="FaCircle" className="text-escher-gray400 dark:text-escher-777e90" />
                    }
                    {status === 'onProgress' &&
                        <LdrsAnimation type="ring2" size={16} />
                    }
                    {status === 'success' &&
                        <Icon type="FaCheckCircle" className="text-escher-electricblue dark:text-white" />
                    }
                </div>
                <div className="flex-1 flex flex-col leading-none">
                    <div className="text-sm font-medium text-escher-gray800 dark:text-white">{props.title}</div>
                    {txLink && formattedHash &&
                        <Link href={txLink} target="_blank" className="text-[10px] text-escher-gray500 dark:text-white underline underline-offset-1">{shortenAddress(formattedHash)}</Link>
                    }
                </div>
                {date &&
                    <div className="text-escher-electricblue dark:text-white bg-escher-purple50 dark:bg-escher-darkblue_2 px-2 py-0.5 text-[8px] font-medium rounded-full">{date}</div>
                }
            </div>
            {(props.showLine ?? true) &&
                <>
                    {status === 'pending' &&
                        <div className="w-[3px] h-full ml-1.5 bg-escher-gray400" />
                    }
                    {status === 'onProgress' &&
                        <div className="w-[3px] h-full ml-1.5 bg-escher-gray400" />
                    }
                    {status === 'success' &&
                        <div className="w-[3px] h-full ml-1.5 bg-escher-electricblue dark:bg-white" />
                    }
                </>
            }
        </div>
    );
}

interface TraceLineProps {
    percentage: number
    curLine: number
    totalLine: number
    isFinished: boolean
}

export const TraceLine = (props: TraceLineProps) => {
    const curPercentage = (props.curLine / props.totalLine) * 100;
    let isLast = curPercentage < props.percentage && ((props.curLine + 1) / props.totalLine) * 100 >= props.percentage;

    if (props.percentage === 100) {
        isLast = false;
    }

    let classA = `w-full h-full ${isLast ? 'bg-escher-electricblue' : curPercentage < props.percentage ? 'bg-escher-959aff animate-blink' : 'bg-escher-e6e8ec dark:bg-gray-500'}`;
    if (props.isFinished) {
        classA = `w-full h-full ${isLast ? 'bg-escher-electricblue' : curPercentage < props.percentage ? 'bg-escher-959aff' : 'bg-escher-e6e8ec'}`;
    }

    return (
        <div className={`${isLast ? 'py-2' : 'py-2.5'} w-0.5 h-full`}>
            <div
                className={classA}
                style={{
                    animationDelay: `${props.curLine * 100}ms`,
                }}
            />
        </div>
    );
}

export const ChainTrace = (props: { lst: "babylon" | "union", token: CustomToken, tokenReceive: CustomToken, dest: 'send' | 'recv' }) => {
    let chainLogo = "";
    switch (props.lst) {
        case "babylon":
            chainLogo = "/images/token/babylon.png";
            break;
        case "union":
            chainLogo = "/images/token-u.png";
            break;
    }

    if (props.dest === "send") {
        if (props.token.chain.network === "evm") {
            return (
                <div className="p-1 rounded-full border border-escher-E7E8FE dark:border-escher-darkblue_border flex items-center gap-2 text-escher-electricblue dark:text-white">
                    <Image alt="" src={"https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png"} className="w-4 h-4" width={16} height={16} />
                    <Icon type="BsArrowRight" size="sm" />
                    <Image alt="" src={chainLogo} className="w-4 h-4" width={16} height={16} />
                </div>
            );
        } else {
            return (
                <div className="p-1 rounded-full border border-escher-E7E8FE dark:border-escher-darkblue_border flex items-center gap-2 text-escher-electricblue dark:text-white">
                    <Image alt="" src={chainLogo} className="w-4 h-4" width={16} height={16} />
                    <Icon type="BsArrowRight" size="sm" />
                    <Image alt="" src={"https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png"} className="w-4 h-4" width={16} height={16} />
                </div>
            );
        }
    }
    if (props.dest === "recv") {
        return (
            <div className="p-1 rounded-full border border-escher-E7E8FE dark:border-escher-darkblue_border flex items-center gap-2 text-escher-electricblue dark:text-white">
                <Image alt="" src={chainLogo} className="w-4 h-4" width={16} height={16} />
                <Icon type="BsArrowRight" size="sm" />
                <Image alt="" src={props.tokenReceive.chain.icon ?? ""} className="w-4 h-4" width={16} height={16} />
            </div>
        );
    }
}

interface TokenAnimationProps {
    amount: string
    estimateReceive?: string
    isFinished: boolean
    isTransactionPage?: boolean
    percentage: number
    tokenReceive: CustomToken
    totalLine: number
    token: CustomToken
}

export const TokenAnimation = (props: TokenAnimationProps) => {
    return (
        <div className={`w-full ${!props.isTransactionPage && "mt-9"} flex rounded-[20px] border border-escher-dedfff dark:border-escher-darkblue_border bg-escher-f5f6f8 dark:bg-escher-darkblue p-2`}>
            <div className="w-[30%] bg-white dark:bg-escher-dark_0c203d border border-escher-dedfff dark:border-escher-darkblue_border rounded-xl p-3 flex items-center gap-1">
                <div className="text-xl font-semibold flex-1 overflow-hidden">{formatNumber(Number(props.amount))}</div>
                <TokenChain token={props.token} tokenSize={28} chainSize={14} />
            </div>
            <div className="w-[40%] flex justify-between px-4 relative">
                {[...Array(props.totalLine)].map((_, index) => (
                    <TraceLine key={index} percentage={props.percentage} curLine={index} totalLine={props.totalLine} isFinished={props.isFinished} />
                ))}
            </div>
            <div className="w-[30%] bg-white dark:bg-escher-dark_0c203d border border-escher-dedfff dark:border-escher-darkblue_border rounded-xl p-3 flex items-center gap-1">
                {props.estimateReceive ?
                    <div className="text-xl font-semibold flex-1 overflow-hidden">{formatNumber(Number(props.estimateReceive))}</div> :
                    <div className="text-xl font-semibold flex-1">-</div>
                }
                <TokenChain token={props.tokenReceive} tokenSize={28} />
            </div>
        </div>
    );
}