import useCompetitors from "@/hooks/useCompetitors";
import useLiquidity from "@/hooks/useLiquidity";
import useValidators from "@/hooks/useValidators";
import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { useEffect, useState } from "react";
import Bonds from "../shared/bonds/bonds";
import Revenue from "../shared/revenue";
import RevenueValidator from "../shared/revenue-validator";
import UnbondBatch from "../shared/unbond-batch";
import Unbonds from "../shared/unbonds/unbonds";
import Apr from "./_sections/apr";
import Competitors from "./_sections/competitors";
import ContractInfo from "./_sections/contract-info";
import EBabySupply from "./_sections/ebaby-supply";
import RewardFee from "./_sections/reward-fee";
import StakedBaby from "./_sections/staked-baby";
import TotalHolders from "./_sections/totalHolders";
import TotalStakers from "./_sections/totalStakers";
import Tvl from "./_sections/tvl";
import Validators from "./_sections/validators";

const BabylonHome = () => {

    const rpcEndpoint = "https://babylon.nodes.guru/rpc";
    const lst = "bbn1m7zr5jw4k9z22r9ajggf4ucalwy7uxvu9gkw6tnsmv42lvjpkwasagek5g";
    const rest = "https://babylon.nodes.guru/api";
    const cw20 = "bbn1s7jzz7cyuqmy5xpr07yepka5ngktexsferu2cr4xeww897ftj77sv30f5s"

    const [client, setClient] = useState<CosmWasmClient>();
    const { data: validators } = useValidators({ client, lst, rest });
    const { data: liquidity } = useLiquidity({ client, lst });
    const { data: competitors } = useCompetitors({ client, lst });

    useEffect(() => {
        const initClient = async () => {
            const _client = await CosmWasmClient.connect(rpcEndpoint);
            if (_client) {
                setClient(_client);
            }
        }
        initClient();
    }, []);

    return (
        <div className="flex flex-col">
            <div className="grid grid-cols-2 md:grid-cols-4 mt-8 gap-4">
                <TotalStakers />
                <TotalHolders />

                <Apr
                    validators={validators}
                    rest={rest}
                    liquidity={liquidity}
                />

                <Tvl
                    liquidity={liquidity}
                    lst={lst}
                />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 mt-8 gap-4">
                <StakedBaby
                    liquidity={liquidity}
                    lst={lst}
                />
                <EBabySupply
                    liquidity={liquidity}
                    lst={lst}
                />

                <RewardFee />
            </div>

            <Revenue
                lst="babylon"
                validators={validators}
            />
            <RevenueValidator
                lst="babylon"
                validators={validators}
            />

            <Validators
                lst="babylon"
                validators={validators}
            />

            <Bonds />
            <Unbonds />

            <div className="w-full flex flex-col md:flex-row gap-8">
                <UnbondBatch lst="babylon" className="w-[35%]" />
                <Competitors className="flex-1"
                    competitors={competitors}
                />
            </div>

            <ContractInfo
                cw20={cw20}
                lst={lst}
                client={client}
            />
        </div >
    );
}

export default BabylonHome;