import Button from "@/components/global/button";
import Card from "@/components/global/card";
import LdrsAnimation from "@/components/global/ldrsAnimation";
import { useEscher } from "@/components/providers/escherProvider";
import { useOsmosisSqsDirect } from "@/hooks/defi/osmosis/useOsmosisSqs";
import { formatDecimal } from "@/lib/utils";
import { SigningStargateClient } from "@cosmjs/stargate";
import { FEES } from '@osmonauts/utils';
import { getSigningOsmosisClient, osmosis } from "osmojs";
import { Pool as CLPool } from "osmojs/osmosis/concentratedliquidity/v1beta1/pool";
import { MsgSwapExactAmountIn } from "osmojs/osmosis/gamm/v1beta1/tx";
import { useEffect, useState } from "react";
import { assets } from "chain-registry";

const POOL_ID = 3055;

const Osmoswap = () => {
    const { account, escherTokens } = useEscher();

    const [osmoClient, setOsmoClient] = useState<SigningStargateClient>();

    const denoms = {
        baby: "ibc/EC3A4ACBA1CFBEE698472D3563B70985AEA5A7144C319B61B3EBDFB57B5E1535",
        ebaby: "factory/osmo12r3yc76u9lxe33yemstatnw8602culdjzrtr8lmnpycmd3z7d4jsxx60kc/FwNhFaW3zLxoLUgXCdWjqBzcvGNPaB7B2XZqm2xgrB93"
    }

    const [inputAmount, setInputAmount] = useState("0.01");
    const route = useOsmosisSqsDirect({
        amount: inputAmount,
        poolID: "3055",
        tokenIn: escherTokens.osmosis.ebaby,
        tokenOut: escherTokens.osmosis.baby
    });

    useEffect(() => {
        const getOsmoClient = async () => {
            const rpcEndpoint = await account.cosmos?.chainContext?.osmosis?.getRpcEndpoint();
            const signer = account.cosmos?.chainContext?.osmosis?.getOfflineSigner();

            if (!rpcEndpoint || !signer) {
                return undefined;
            }

            const client = await getSigningOsmosisClient({
                rpcEndpoint: rpcEndpoint,
                signer
            });

            // reason : osmojs's SigningStargateClient can't be used, probably different version
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setOsmoClient(client as any);
        }
        if (!osmoClient && account.cosmos?.chainContext) {
            getOsmoClient();
        }
        if (account.cosmos?.chainContext === undefined) {
            setOsmoClient(undefined);
        }
    }, [account.cosmos?.chainContext]);


    const fetchPoolInfo = async () => {
        try {
            const rpcEndpoint = await account.cosmos?.chainContext?.osmosis?.getRpcEndpoint();
            const queryClient = await osmosis.ClientFactory.createRPCQueryClient({ rpcEndpoint: rpcEndpoint! });
            // const p = await queryClient.osmosis.poolmanager.v1beta1.pool({ poolId: BigInt(POOL_ID) });
            const p = await queryClient.osmosis.gamm.v1beta1.pool({ poolId: BigInt(POOL_ID) });
            // console.log({ p });

            if (!p.pool) {
                return undefined;
            }
            return p.pool as CLPool;
        } catch (e) {
            console.error(e);
        }
    }

    const submit = async () => {
        if (!account.cosmos?.address.osmosis) return;

        const fee = FEES.osmosis.swapExactAmountIn();

        // Assume tokenInIndex = 0, tokenOutIndex = 1
        const msgSwapExactAmountIn = MsgSwapExactAmountIn.fromPartial({
            sender: account.cosmos?.address.osmosis,
            tokenIn: {
                amount: formatDecimal(Number(inputAmount), 6).toFixed(0),
                denom: denoms.ebaby
            },
            // TODO get proper expected amount
            tokenOutMinAmount: route.data?.route.amount_out,
            routes: [{
                poolId: BigInt(3055),
                tokenOutDenom: denoms.baby
            }]
        });
        const msg = {
            typeUrl: "/osmosis.gamm.v1beta1.MsgSwapExactAmountIn",
            value: msgSwapExactAmountIn,
        };

        // console.log({ osmoClient, msg });

        const res = await osmoClient?.signAndBroadcast(account.cosmos?.address.osmosis, [msg], fee, "Osmosis swap ebaby -> baby");
        console.log({ msg, res });

    }

    const test = async () => {
        const osmoAssets = assets.find(a => a.chain_name === "osmosis");
        console.log({ osmoAssets });
    }

    return (
        <Card className="items-start gap-2 text-sm">
            <div className="w-full flex justify-between items-center">
                <div className="text-xl font-semibold text-escher-gray900 dark:text-white">Osmosis swap</div>
            </div>
            <hr className="border border-t border-escher-gray200 dark:border-escher-darkblue_border w-full mb-4" />
            <Button onClick={fetchPoolInfo} title="Pool Info" />
            <Button onClick={test} title="Test" />

            <div className="flex flex-col gap-2 p-4 rounded bg-slate-300">
                <div>eBABY input</div>
                <input type="number" value={inputAmount} onChange={e => setInputAmount(e.target.value ?? "0")} className="border rounded p-1" />
                <br />
                <div>expected BABY</div>
                {route.isFetching ?
                    <LdrsAnimation />
                    :
                    <input type="number" value={route.data?.amount_out_formatted} disabled className="border rounded p-1" />
                }
                <Button onClick={submit} title="Swap to BABY" />
            </div>
        </Card>
    );
}

export default Osmoswap;
