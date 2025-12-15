import Icon from "@/components/global/icons";
import LdrsAnimation from "@/components/global/ldrsAnimation";
import { UNION_CONTRACTS } from "@/configs/union";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

export const totalLine = 50;

export const Line = (props: { percentage: number; curLine: number }) => {
    const curPercentage = (props.curLine / totalLine) * 100;
    let isLast = curPercentage < props.percentage && ((props.curLine + 1) / totalLine) * 100 >= props.percentage;

    if (props.percentage === 100) {
        isLast = false;
    }

    return (
        <div className={`${isLast ? 'py-2' : 'py-2.5'} w-0.5 h-full`}>
            <div
                className={`w-full h-full ${isLast ? 'bg-escher-electricblue' : curPercentage < props.percentage ? 'bg-escher-959aff animate-blink' : 'bg-escher-e6e8ec'}`}
                style={{
                    animationDelay: `${props.curLine * 100}ms`,
                }}
            />
        </div>
    );
};


export const PillSuccess = ({ text }: { text: string }) => {
    return (
        <div className="flex items-center gap-2 bg-green-100 dark:bg-[#0b3b42] px-3 py-1 rounded-full text-green-700 dark:text-[#01ff95]">
            <Icon type="FaRegCheckCircle" size="sm" />
            <div className="text-xs font-medium">{text}</div>
        </div>
    );
}

export const PillPending = ({ text }: { text: string }) => {
    return (
        <div className="flex items-center gap-2 bg-orange-100 dark:bg-[#262937] px-3 py-1 rounded-full text-orange-500 dark:text-[#f76d01]">
            <Icon type="FaRegDotCircle" size="sm" />
            <div className="text-xs font-medium">{text}</div>
        </div>
    );
}

export const StatusIndexer = ({ hash }: { hash: string }) => {

    const formattedHash = useMemo(() => hash.startsWith("0x") ? hash : `0x${hash}`, [hash]);

    const getData = async () => {
        const response = await fetch(UNION_CONTRACTS.mainnet.indexer, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: `
                    query SearchPacket {
                        v2_transfers(args: {p_transaction_hash: "${formattedHash}"}) {
                            success
                        }
                    }
                `
            })
        })

        const responseJson = (await response.json())
        const result = responseJson.data.v2_transfers as { success: boolean | null }[] | undefined;

        return result?.at(0)?.success ?? false;
    };

    const query = useQuery({
        queryKey: ["union", "indexer", "status-by-hash", hash],
        queryFn: getData
    });

    // return <button onClick={() => query.refetch()}>test</button>
    if (query.isPending)
        return <LdrsAnimation />

    if (query.isFetched && query.data)
        return <PillSuccess text="Success" />;

    return <PillPending text="On progress" />;
}