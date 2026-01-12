"use client";

import { formatDecimal, formatNumber } from "@/utils/utils";
import { useQuery } from "@tanstack/react-query";
import { createPublicClient, erc20Abi, http } from "viem";
import { mainnet } from "viem/chains";
import LdrsAnimation from "../global/ldrsAnimation";

const UnionSupply = () => {

    const getData = async () => {
        const client = createPublicClient({
            chain: mainnet,
            transport: http("https://rpc.ankr.com/eth/18947e49f3f2e53534da7c68fd7584d7e93b02f1abcf295a4c90cfdd1951d166")
        });

        const res = await client.readContract({
            address: "0xe5cf13c84c0fea3236c101bd7d743d30366e5cf1",
            abi: erc20Abi,
            functionName: "totalSupply" as const,
            args: [],
        });

        return formatDecimal(Number(res), -18);
    }

    const queryData = useQuery({
        queryKey: ["union", "supply", "eu"],
        queryFn: getData
    });

    return (
        <div className="flex flex-col items-center gap-1 bg-sky-900 text-sky-50 rounded py-8">
            <div className="flex-1">
                {queryData.data !== undefined && queryData.data !== null ?
                    <div className="text-xl md:text-5xl font-bold">
                        {formatNumber(queryData.data ?? 0)}
                    </div>
                    :
                    <LdrsAnimation />
                }
            </div>
            <div className="text-sm font-medium opacity-80">eU total supply</div>
        </div>
    );
}

export default UnionSupply;


