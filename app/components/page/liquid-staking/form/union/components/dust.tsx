import { useEscher } from "@/components/providers/escherProvider";
import { useUnionDust, useUnionDustRecovery } from "@/hooks/liquidStakingContract/union/dust";
import { UnionRate } from "@/hooks/liquidStakingContract/union/rate";
import { useMemo, useState } from "react";
import SharedDust from "../../shared/dust";
import { ButtonStatus } from "../../shared/shared";

interface Props {
    exchangeRate?: UnionRate
}

const Dust = (props: Props) => {
    const { escherTokens } = useEscher();
    const queryUnionDust = useUnionDust();
    const { dustRecovery } = useUnionDustRecovery();
    const [successHash, setSuccessHash] = useState<string>();
    const [isPending, setIsPending] = useState(false);

    const buttonStatus = useMemo((): ButtonStatus => {
        const enabled = true;
        const text = `Recover Dust to Wallet`;

        if (isPending) {
            return {
                enabled: false,
                text: "Processing"
            }
        }

        if (queryUnionDust.isPending) {
            return {
                enabled: false,
                text: "Fetching dust"
            }
        }

        if (queryUnionDust.data && queryUnionDust.data.amountRaw <= BigInt(0)) {
            return {
                enabled: false,
                text: "No Dust Available"
            }
        }

        return {
            enabled,
            text
        }
    }, [queryUnionDust.data, queryUnionDust.isPending, isPending]);

    const submit = async () => {
        setSuccessHash(undefined);
        setIsPending(true);
        try {
            if (!queryUnionDust.data?.amountRaw) throw "No dust"

            const res = await dustRecovery({
                dustAmountRaw: queryUnionDust.data?.amountRaw
            });
            queryUnionDust.refetch();
            setSuccessHash(res);
        } catch (error) {
            console.error(error);
        }
        setIsPending(false);
    }

    return (
        <SharedDust
            buttonStatus={buttonStatus}
            exchangeRate={props.exchangeRate?.redemption_rate ? Number(props.exchangeRate?.redemption_rate) : undefined}
            liquidToken={escherTokens.evm.eU}
            lst={"union"}
            nativeToken={escherTokens.evm.u}
            onSubmit={submit}
            setSuccessHash={setSuccessHash}
            successHash={successHash}
            query={{
                amount: queryUnionDust.data?.amount,
                isFetched: queryUnionDust.isFetched,
                refetch: queryUnionDust.refetch
            }}
        />
    );
}

export default Dust;