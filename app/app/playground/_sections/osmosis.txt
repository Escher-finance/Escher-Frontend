import Button from "@/components/global/button";
import Card from "@/components/global/card";
import { useEscher } from "@/components/providers/escherProvider";
import { SigningStargateClient } from "@cosmjs/stargate";
import { getSigningOsmosisClient, osmosis } from 'osmojs';
import { Pool as CLPool } from "osmojs/osmosis/concentratedliquidity/v1beta1/pool";
import { FullPositionBreakdown } from "osmojs/osmosis/concentratedliquidity/v1beta1/position";
import { MsgCreatePosition } from "osmojs/osmosis/concentratedliquidity/v1beta1/tx";
import { useEffect, useMemo, useState } from "react";

const POOL_ID = 3055;
// const AGGRESSIVE_STRATEGY_MULTIPLIER = 0.05; // unused
const BASE_TOKEN = "factory/osmo12r3yc76u9lxe33yemstatnw8602culdjzrtr8lmnpycmd3z7d4jsxx60kc/FwNhFaW3zLxoLUgXCdWjqBzcvGNPaB7B2XZqm2xgrB93";
const QUOTE_TOKEN = "ibc/EC3A4ACBA1CFBEE698472D3563B70985AEA5A7144C319B61B3EBDFB57B5E1535";

interface Position extends FullPositionBreakdown {
    inRange: boolean
}

const Osmosis = () => {
    const { account } = useEscher();

    const address = useMemo(() => account.cosmos?.address.osmosis, [account.cosmos?.address.osmosis]);

    const [osmoClient, setOsmoClient] = useState<SigningStargateClient>();
    const [positions, setPositions] = useState<Position[]>([]);

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

    const fetchHistoricalPrices = async () => {
        const response = await fetch(`/api/osmosis/historical-prices?poolId=${POOL_ID.toString()}&baseCoinMinimalDenom=${BASE_TOKEN}&quoteCoinMinimalDenom=${QUOTE_TOKEN}&timeDuration=7d`);
        const jsonResponse = await response.json();
        console.log({ jsonResponse });
    }

    const fetchPoolInfo = async () => {
        try {
            const rpcEndpoint = await account.cosmos?.chainContext?.osmosis?.getRpcEndpoint();
            const queryClient = await osmosis.ClientFactory.createRPCQueryClient({ rpcEndpoint: rpcEndpoint! });
            const p = await queryClient.osmosis.poolmanager.v1beta1.pool({ poolId: BigInt(POOL_ID) });
            if (!p.pool) {
                return null;
            }
            return p.pool as CLPool;
        } catch (e) {
            console.error(e);
        }
    }

    const fetchUserPositions = async () => {
        console.log('fetchUserPositions', address);

        if (!address || !osmoClient) return;
        try {
            const rpcEndpoint = await account.cosmos?.chainContext?.osmosis?.getRpcEndpoint();
            const queryClient = await osmosis.ClientFactory.createRPCQueryClient({ rpcEndpoint: rpcEndpoint! });

            const positionsResponse = await queryClient.osmosis.concentratedliquidity.v1beta1.userPositions({
                poolId: BigInt(POOL_ID),
                address
            });
            console.log({ positionsResponse });


            const pool = await fetchPoolInfo();
            if (!pool) throw Error('no pool');
            const currentTick = pool.currentTick;

            setPositions(positionsResponse.positions.map(p => ({
                inRange: currentTick >= p.position.lowerTick && currentTick < p.position.upperTick,
                ...p
            })));
        } catch (err) {
            // setError('Failed to fetch user positions: ' + (err.message ?? String(err)));
            console.error(err);

        }
    };

    const createPosition = async () => {
        try {
            if (
                !address
            ) {
                console.error({
                    address: address
                });

                throw "Invalid data";
            }

            const fee = {
                amount: [
                    {
                        denom: 'uosmo',
                        amount: '2500',
                    },
                ],
                gas: '500000',
            };

            const msgCreatePosition = MsgCreatePosition.fromPartial({
                poolId: BigInt(3055),
                sender: address,
                tokenMinAmount0: "8500",
                tokenMinAmount1: "58140",
                lowerTick: BigInt(53600),
                upperTick: BigInt(54600),
                tokensProvided: [
                    {
                        amount: "10000",
                        denom: BASE_TOKEN,
                    },
                    {
                        amount: "68401",
                        denom: QUOTE_TOKEN,
                    }
                ]
            });
            const msg = {
                typeUrl: "/osmosis.concentratedliquidity.v1beta1.MsgCreatePosition",
                value: msgCreatePosition,
            };

            console.log({ osmoClient, msg });

            const res = await osmoClient?.signAndBroadcast(address, [msg], fee, "Osmosis provide liquidity");
            console.log({ msg, res });
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <Card className="items-start gap-0 text-sm">
            <div className="w-full flex justify-between items-center">
                <div className="text-xl font-semibold text-escher-gray900 dark:text-white">Osmosis</div>
            </div>
            <hr className="border border-t border-escher-gray200 dark:border-escher-darkblue_border w-full mb-4" />
            <Button onClick={createPosition} title="Create position" />
            <br />
            <Button onClick={fetchUserPositions} title="Fetch positions" />
            <br />
            <Button onClick={fetchHistoricalPrices} title="Fetch historical prices" />
            <br />
            {positions.length > 0 && (
                <table className="border-spacing-x-4 border-separate">
                    <tr>
                        <th>Pool ID</th>
                        <th>Position ID</th>
                        <th>Range</th>
                        <th>Liquidity</th>
                        <th>Created At</th>
                        <th>Claimable Incentives</th>
                        <th>Claimable Rewards</th>
                    </tr>
                    {
                        positions.map((p) => {
                            const positionId = p.position.positionId.toString();
                            return (
                                <tr id={positionId}>
                                    <td>{p.position.poolId.toString()}</td>
                                    <td>{positionId}</td>
                                    <td>{p.inRange ? 'true' : 'false'}</td>
                                    <td>{p.position.liquidity}</td>
                                    <td>{p.position.joinTime.toLocaleString()}</td>
                                    <td>{p.claimableIncentives.map(({ denom, amount }) => `${amount}${denom}`).join(',')}</td>
                                    <td>{p.claimableSpreadRewards.map(({ denom, amount }) => `${amount}${denom}`).join(',')}</td>
                                </tr>
                            )
                        })
                    }
                </table>
            )}
        </Card>
    );
}

export default Osmosis;
