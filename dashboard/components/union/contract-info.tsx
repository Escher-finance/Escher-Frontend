import { shortenAddress } from "@/lib/utils";
import { formatDecimal, formatNumber } from "@/utils/utils";
import { useQuery } from "@tanstack/react-query";
import LdrsAnimation from "../global/ldrsAnimation";
import clsx from "clsx";

const lcd = "https://rest.union.build";
const addressProxy = "union1z048ya7xwcp8fj9eg87tm5v33ph0gunk70yzqa";

interface Props {
    className?: string
}

export default function ContractInfo(props: Props) {
    const fetchData = async () => {
        const response = await fetch(`${lcd}/cosmos/bank/v1beta1/balances/${addressProxy}`);
        const result = await response.json() as { balances: { "denom": string, "amount": string }[] };
        return {
            proxy: {
                address: addressProxy,
                balance: formatDecimal(Number(result.balances.find(v => v.denom == "au")?.amount ?? 0), -18)
            }
        }
    }

    const query = useQuery({
        queryKey: ["union", "contract-info"],
        queryFn: fetchData
    });

    return (
        <div className={clsx(
            "flex flex-col bg-sky-100 text-slate-900 rounded p-8 mt-8 self-start leading-none overflow-x-scroll",
            props.className
        )}>
            <div className="font-bold">Tracked Balances</div>

            <div className="grid grid-cols-[auto_auto_auto] gap-2 mt-4">
                <div></div>
                <div className="font-medium text-gray-500">Address</div>
                <div className="font-medium text-gray-500">Balance</div>

                <div className="font-medium text-gray-500">Authz proxy</div>
                <div>{shortenAddress(query.data?.proxy.address ?? "", 10, 10)}</div>
                {query.data ?
                    <div className="text-sky-700 font-bold">{formatNumber(query.data?.proxy.balance)} U</div>
                    :
                    <LdrsAnimation color="#000" />
                }
            </div>
        </div>
    );
}