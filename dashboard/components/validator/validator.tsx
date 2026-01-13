import useValidators from "@/hooks/useValidators";
import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { useEffect, useMemo, useState } from "react";
import Commission from "./_section/commission";
import Delegated from "./_section/delegated";
import Fee from "./_section/fee";
import ValidatorInfo from "./_section/validator-info";
import Weight from "./_section/weight";
import RevenueValidator from "../shared/revenue-validator";
import useValidatorsUnion from "@/hooks/useValidatorsUnion";

interface Props {
    address: string
}

export const ValidatorBabylonPage = (props: Props) => {

    const rpcEndpoint = "https://babylon.nodes.guru/rpc";
    const lst = "bbn1m7zr5jw4k9z22r9ajggf4ucalwy7uxvu9gkw6tnsmv42lvjpkwasagek5g";
    const rest = "https://babylon.nodes.guru/api";

    const [client, setClient] = useState<CosmWasmClient>();
    const { data: validators } = useValidators({ client, lst, rest });
    const validator = useMemo(() => {
        return validators?.find(v => v.address === props.address);
    }, [validators, props.address]);

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
            <div className="grid grid-cols-2 grid-rows-4 md:grid-cols-4 md:grid-rows-2 gap-4 mt-8">
                <ValidatorInfo
                    validator={validator}
                />
                <Delegated
                    lst="babylon"
                    validator={validator}
                />
                <Weight
                    validator={validator}
                />
                <Commission
                    validator={validator}
                />
                <Fee
                    validator={validator}
                />
            </div >
            <RevenueValidator
                lst="babylon"
                validators={validators}
                activeValidator={validator} />
        </div >
    );
}

export const ValidatorUnionPage = (props: Props) => {
    const { data: validators } = useValidatorsUnion();
    const validator = useMemo(() => {
        return validators?.find(v => v.address === props.address);
    }, [validators, props.address]);

    return (
        <div className="flex flex-col">
            <div className="grid grid-cols-2 grid-rows-4 md:grid-cols-4 md:grid-rows-2 gap-4 mt-8">
                <ValidatorInfo
                    validator={validator}
                />
                <Delegated
                    lst="union"
                    validator={validator}
                />
                <Weight
                    validator={validator}
                />
                <Commission
                    validator={validator}
                />
                <Fee
                    validator={validator}
                />
            </div >
            <RevenueValidator
                lst="union"
                validators={validators}
                activeValidator={validator} />
        </div >
    );
}