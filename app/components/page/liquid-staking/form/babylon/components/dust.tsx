import { useEscher } from "@/components/providers/escherProvider";
import { useBabylonDust, useBabylonDustRecovery } from "@/hooks/liquidStakingContract/babylon/dust";
import { useMemo, useState } from "react";
import SharedDust from "../../shared/dust";
import { ButtonStatus } from "../../shared/shared";

interface Props {
    exchangeRate?: number
}

const Dust = (props: Props) => {
    const { escherTokens } = useEscher();
    const queryDust = useBabylonDust();
    const { dustRecovery } = useBabylonDustRecovery();
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

        if (queryDust.isPending) {
            return {
                enabled: false,
                text: "Fetching dust"
            }
        }

        if (queryDust.data && queryDust.data.amountRaw <= BigInt(0)) {
            return {
                enabled: false,
                text: "No Dust Available"
            }
        }

        return {
            enabled,
            text
        }
    }, [queryDust.data, queryDust.isPending, isPending]);

    const submit = async () => {
        setSuccessHash(undefined);
        setIsPending(true);
        try {
            if (!queryDust.data?.amountRaw) throw "No dust"

            const res = await dustRecovery({
                dustAmountRaw: queryDust.data?.amountRaw
            });
            queryDust.refetch();
            setSuccessHash(res);
        } catch (error) {
            console.error(error);
        }
        setIsPending(false);
    }

    return (
        <SharedDust
            buttonStatus={buttonStatus}
            exchangeRate={props.exchangeRate}
            liquidToken={escherTokens.evm.ebaby}
            lst={"babylon"}
            nativeToken={escherTokens.evm.baby}
            onSubmit={submit}
            setSuccessHash={setSuccessHash}
            successHash={successHash}
            query={{
                amount: queryDust.data?.amount,
                isFetched: queryDust.isFetched,
                refetch: queryDust.refetch
            }}
            onClick={() => console.log({ queryDust: queryDust.data })}
        />
    );
}

export default Dust;