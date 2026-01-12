import { APP_CONFIG } from "@/config/app";
import { Validator } from "@/types/types";
import { useQuery } from "@tanstack/react-query";

const useValidatorsUnion = () => {
    const getData = async () => {
        const reponse = await fetch(`/api/union/validators`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        const validators = (await reponse.json()) as Validator[];
        return validators;
    }


    return useQuery({
        queryKey: ["validators", "union"],
        queryFn: getData,
        refetchInterval: APP_CONFIG.refetchInterfal,
        refetchOnWindowFocus: false
    });
}

export default useValidatorsUnion;