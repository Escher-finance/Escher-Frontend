import Button from "@/components/global/button";
import Icon from "@/components/global/icons";
import LdrsAnimation from "@/components/global/ldrsAnimation";
import TokenChain from "@/components/global/tokenChain";
import { formatNumber } from "@/lib/utils";
import { CustomToken, LiquidStaking } from "@/types/chain";
import DustTraces from "./dust/traces";
import { ButtonStatus } from "./shared";

interface Props {
    buttonStatus: ButtonStatus
    exchangeRate?: number
    liquidToken: CustomToken
    nativeToken: CustomToken
    lst: LiquidStaking
    onSubmit(): void
    onClick?(): void
    setSuccessHash(val: string | undefined): void
    successHash?: string
    query: {
        amount?: number
        isFetched: boolean
        refetch(): void
    }
}

const SharedDust = (props: Props) => {
    return (
        <div className="flex flex-col mt-4 gap-4 dark:text-white">
            <div
                className="flex justify-between border border-escher-dedfff dark:border-escher-darkblue_border rounded-lg py-2 px-3 items-center"
                onClick={props.onClick}
            >
                <TokenChain token={props.liquidToken} tokenSize={35} chainSize={20} />
                {props.query.isFetched ?
                    <div className="flex flex-col items-end">
                        <div className="font-bold">{formatNumber((props.query.amount ?? 0), true, 6)} {props.liquidToken.symbol}</div>
                        {props.exchangeRate &&
                            <div className="font-semibold text-sm text-gray-500">≈ {
                                formatNumber(Number(props.exchangeRate ?? 0) * (props.query.amount ?? 0), true, 6)
                            } {props.nativeToken.symbol}</div>
                        }
                    </div>
                    :
                    <LdrsAnimation size={18} />
                }
            </div>
            <div className="flex gap-2 border border-escher-dedfff dark:border-escher-darkblue_border rounded-lg p-2 items-center bg-slate-100 dark:bg-slate-800">
                <div className="p-1 bg-slate-400 text-white rounded">
                    <Icon type="FiInfo" />
                </div>
                <div className="flex flex-col">
                    <div className="font-semibold text-sm text-slate-800 dark:text-slate-100">{props.buttonStatus.enabled ? "Ready to recover dust" : "Dust appears here when you stake with slippage protection"}</div>
                    <div className="text-xs text-slate-500">Recover {props.liquidToken.symbol} tokens from your proxy contract</div>
                </div>
            </div>
            <Button title={props.buttonStatus.text} enabled={props.buttonStatus.enabled} onClick={props.onSubmit} />

            <DustTraces
                amount={formatNumber(props.query.amount ?? 0)}
                onClose={() => {
                    props.setSuccessHash(undefined);
                    props.query.refetch();
                }}
                operation="dust"
                token={props.liquidToken}
                successTxHash={props.successHash}
            />
        </div>
    );
}

export default SharedDust;