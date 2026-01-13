import { APP_CONFIG } from "@/config/app";
import { Competitor, Delegation, Validator } from "@/types/types";
import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { useQuery } from "@tanstack/react-query";

interface Props {
    client?: CosmWasmClient
    lst: string
}

const competitors: Competitor[] = [
    {
        name: "Cube Baby",
        address: "bbn17y5zvse30629t7r37xsdj73xsqp7qsdr7gpnh966wf5aslpn66rq5ekwsz",
        logo: "https://raw.githubusercontent.com/cosmostation/chainlist/master/chain/babylon/asset/cbaby.png",
        description: "Liquid staking token from Cube by SatLayer"
    }
];

const useCompetitors = (props: Props) => {
    const getData = async () => {
        const result = await Promise.all(
            competitors.map(async (competitor) => {
                const tokenInfo = await props.client?.queryContractSmart(
                    competitor.address,
                    {
                        token_info: {}
                    }
                );

                return {
                    ...competitor,
                    totalSupply: Number(tokenInfo.total_supply),
                    symbol: tokenInfo.symbol
                };
            })
        );
        return result;
    }


    return useQuery({
        queryKey: ["competitors"],
        queryFn: getData,
        refetchInterval: APP_CONFIG.refetchInterfal,
        enabled: !!props.client,
        refetchOnWindowFocus: false,
        initialData: competitors
    });
}

export default useCompetitors;