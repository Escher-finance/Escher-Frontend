import { APP_CONFIG } from "@/config/app";
import { VALIDATORS_FEE } from "@/lib/validators";
import { Delegation, Validator } from "@/types/types";
import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { useQuery } from "@tanstack/react-query";

interface Props {
    client?: CosmWasmClient
    lst: string
    rest: string
}

const useValidators = (props: Props) => {
    const getData = async () => {
        const queryValidators = await props.client?.queryContractSmart(
            props.lst,
            {
                validators: {}
            }
        );
        const validators = queryValidators.validators as Validator[];

        const queryDelegation = await fetch(`${props.rest}/cosmos/staking/v1beta1/delegations/${props.lst}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        const delegations = (await queryDelegation.json()).delegation_responses as Delegation[];

        await Promise.all(
            validators.map(async (validator) => {
                const queryValidator = await fetch(`${props.rest}/cosmos/staking/v1beta1/validators/${validator.address}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });

                const validatorResponse = (await queryValidator.json()).validator;
                validator.commission = Number(validatorResponse?.commission?.commission_rates?.rate);
                validator.data = validatorResponse;

                const delegation = delegations.find(v => v.delegation.validator_address === validator.address);
                validator.balance = delegation?.delegation.shares ?? "0";

                validator.fee = VALIDATORS_FEE.find(v => v.address === validator.address)?.fee
            })
        );

        // validators.push({
        //     address: "bbnvaloper1004nqmppj9tvwf0l5gawl747lg452vl35m5x0x",
        //     commission: 0.1,
        //     weight: 0,
        //     data: {
        //         description: { moniker: "figment" }
        //     },
        //     balance: "0",
        //     fee: 0.7
        // });

        return validators;
    }


    return useQuery({
        queryKey: ["validators", "babylon"],
        queryFn: getData,
        refetchInterval: APP_CONFIG.refetchInterfal,
        enabled: !!props.client,
        refetchOnWindowFocus: false
    });
}

export default useValidators;