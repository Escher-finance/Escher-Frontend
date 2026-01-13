import LdrsAnimation from "@/components/global/ldrsAnimation"
import { APP_CONFIG } from "@/config/app"
import { shortenAddress } from "@/lib/utils"
import { formatDecimal } from "@/utils/utils"
import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate"
import { useQuery } from "@tanstack/react-query"


const feePayer = "bbn1fh0yyvuxz7l0vcusq5jc9zvzpm8ec2auvvkh44";
const rewardExecutor = "bbn1hcu30dadwphf89u3x3u6j2z58r37c9akhxfcs0";
const proxyExecutor = "bbn1z048ya7xwcp8fj9eg87tm5v33ph0gunkrx5m34";

interface Props {
    lst: string
    cw20: string
    client?: CosmWasmClient
}

const ContractInfo = (props: Props) => {
    const getFeePayerBalance = async () => {
        if (!props.client) return undefined;

        const balances = await Promise.all([
            await props.client.getBalance(feePayer, "ubbn"),
            await props.client.getBalance(rewardExecutor, "ubbn"),
            await props.client.getBalance(proxyExecutor, "ubbn"),
        ]);
        console.log({ balances });

        return balances;
    }

    const queryFeePayerBalance = useQuery({
        queryKey: ["trackedBalances"],
        queryFn: getFeePayerBalance,
        refetchInterval: APP_CONFIG.indexerInterfal,
        staleTime: APP_CONFIG.indexerInterfal,
        enabled: !!props.client
    });

    return (
        <div className="flex gap-4">
            <div className="w-[55%] flex flex-col bg-sky-100 text-slate-900 rounded p-8 mt-8 self-start leading-none overflow-x-scroll">
                <div className="font-bold">Tracked Balances</div>

                <div className="grid grid-cols-[auto_auto_auto] gap-2 mt-4">
                    <div></div>
                    <div className="font-medium text-gray-500">Address</div>
                    <div className="font-medium text-gray-500">Balance</div>

                    <div className="font-medium text-gray-500">Fee payer</div>
                    <div>{shortenAddress(feePayer, 10, 10)}</div>
                    {queryFeePayerBalance.data ?
                        <div className="text-sky-700 font-bold">{formatDecimal(Number(queryFeePayerBalance.data?.[0]?.amount), -6).toFixed(6)} BABY</div>
                        :
                        <LdrsAnimation color="#000" />
                    }

                    <div className="font-medium text-gray-500">Normalize reward executor</div>
                    <div>{shortenAddress(rewardExecutor, 10, 10)}</div>
                    {queryFeePayerBalance.data ?
                        <div className="text-sky-700 font-bold">{formatDecimal(Number(queryFeePayerBalance.data?.[1]?.amount), -6).toFixed(6)} BABY</div>
                        :
                        <LdrsAnimation color="#000" />
                    }

                    <div className="font-medium text-gray-500">Authz proxy executor</div>
                    <div>{shortenAddress(proxyExecutor, 10, 10)}</div>
                    {queryFeePayerBalance.data ?
                        <div className="text-sky-700 font-bold">{formatDecimal(Number(queryFeePayerBalance.data?.[2]?.amount), -6).toFixed(6)} BABY</div>
                        :
                        <LdrsAnimation color="#000" />
                    }
                </div>
            </div>

            <div className="flex-1 flex flex-col bg-sky-100 text-slate-900 rounded p-8 mt-8 self-start leading-none overflow-x-scroll">
                <div className="font-bold">Contract Info</div>

                <div className="font-medium text-gray-500 mt-4 text-sm">Liquid staking contract address</div>
                <div className="text-sky-700 font-bold">{props.lst}</div>

                <div className="font-medium text-gray-500 mt-4 text-sm">eBABY contract address</div>
                <div className="text-sky-700 font-bold">{props.cw20}</div>
            </div>
        </div>
    );
}

export default ContractInfo;