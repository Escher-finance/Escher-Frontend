import BigNumber from 'bignumber.js';
import { Buffer } from 'buffer';
import https from 'https';
import { NextRequest, NextResponse } from 'next/server';
import fetch from 'node-fetch';

// Ensure Node.js runtime (Buffer, AbortController, etc.)
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Example CLI reference:
// uniond query wasm contract-state smart <contract> '{"accounting_state":{}}' --node https://rpc.union.build:443

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;

        // Contract
        const contract = searchParams.get('contract') || 'union1d2r4ecsuap4pujrlf3nz09vz8eha8y0z25knq0lfxz4yzn83v6kq0jxsmk';
        if (!contract) {
            return NextResponse.json({ error: 'Missing contract address' }, { status: 400 });
        }

        const delegator = searchParams.get('delegator');

        // Prefer LCD for compatibility; default to mainnet REST endpoint
        const lcdUrls = {
            mainnet: 'https://rest.union.build',
            testnet: 'https://rest.rpc-node.union-testnet-10.union.build',
        }
        const lcd = searchParams.get('testnet') ? lcdUrls.testnet : lcdUrls.mainnet;

        const httpsAgent = new https.Agent({
            rejectUnauthorized: false,
        });
        const abortController = new AbortController();

        const contractData = await getContractData({
            abortController,
            contract,
            debug: searchParams.get('test') === '1',
            httpsAgent,
            lcd
        });

        // Add network info if requested
        const networkData = ((searchParams.get('network') === '1') || delegator) ? await getNetworkData({
            httpsAgent,
            lcd
        }) : undefined;

        // Add network info if requested
        const delegatorData = delegator ? await getDelegatorData({
            httpsAgent,
            lcd,
            delegator,
            networkData
        }) : undefined;

        return NextResponse.json({ contract, contractData, networkData, delegatorData });
    } catch (error) {
        console.error('Union accounting_state query error:', error);
        return NextResponse.json({
            error: String((error as Error)?.message || error), name: (error as Error)?.name, url: undefined
        }, { status: 500 });
    }
}

const getContractData = async ({ lcd, contract, debug, httpsAgent, abortController }:
    {
        lcd: string
        contract: string
        debug: boolean
        httpsAgent: https.Agent
        abortController: AbortController
    }
) => {

    const query = { accounting_state: {} } as const;
    const encoded = Buffer.from(JSON.stringify(query)).toString('base64');
    const url = `${lcd.replace(/\/$/, '')}/cosmwasm/wasm/v1/contract/${contract}/smart/${encoded}`;

    // Optional: return constructed URL for debugging
    if (debug) {
        return { contract, lcd, url };
    }

    // Add timeout to avoid hanging requests
    const timeout = setTimeout(() => abortController.abort(), 15000);
    const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: abortController.signal,
        agent: httpsAgent
    }).finally(() => clearTimeout(timeout));
    const json = await response.json();

    if (!response.ok) {
        return { error: json, url };
    }

    // Debug logging to understand response structure
    if (debug) {
        // console.log('Union API response structure:', JSON.stringify(json, null, 2));
    }

    // LCD returns base64-encoded bytes under `data`
    const jsonData = json as { data?: string; smart_contract_state?: { data: string } };
    const base64Data = jsonData?.data || jsonData?.smart_contract_state?.data;
    let result = json;

    // Only try to decode if we have a valid base64 string
    if (base64Data && typeof base64Data === 'string' && base64Data.length > 0) {
        try {
            // Validate that it's actually base64
            const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
            if (base64Regex.test(base64Data)) {
                const decoded = Buffer.from(base64Data, 'base64').toString('utf8');
                result = JSON.parse(decoded);
            } else {
                // console.log('Union API: base64Data is not valid base64, using raw data');
                result = base64Data;
            }
        } catch (error) {
            console.error('Union API error:', error);
            result = base64Data;
        }
    } else {
        // console.log('Union API: No valid base64 data found, using raw response');
    }
    return result;
}

const getNetworkData = async ({ lcd, httpsAgent }:
    {
        lcd: string
        httpsAgent: https.Agent
    }
) => {
    try {
        const [stakingResponse, inflationResponse, supplyResponse] = await Promise.all([
            fetch(`${lcd}/cosmos/staking/v1beta1/pool`, { agent: httpsAgent }),
            fetch(`${lcd}/cosmos/mint/v1beta1/inflation`, { agent: httpsAgent }),
            fetch(`${lcd}/cosmos/bank/v1beta1/supply`, { agent: httpsAgent })
        ]);

        const stakingData = await stakingResponse.json() as { pool?: { bonded_tokens?: string; not_bonded_tokens?: string } };
        const inflationData = await inflationResponse.json() as { inflation?: string };
        const supplyData = await supplyResponse.json() as { supply?: { amount?: string }[] };

        const networkInfo = {
            bonded_tokens: stakingData.pool?.bonded_tokens || "0",
            not_bonded_tokens: stakingData.pool?.not_bonded_tokens || "0",
            inflation: inflationData.inflation || "0",
            total_supply: supplyData.supply?.[0]?.amount || "0"
        };

        return networkInfo;
    } catch (networkError) {
        console.error('Network error:', networkError);
        return undefined;
    }
}

const getDelegatorData = async ({ lcd, httpsAgent, delegator, networkData }:
    {
        lcd: string
        httpsAgent: https.Agent
        delegator: string
        networkData?: {
            bonded_tokens: string;
            not_bonded_tokens: string;
            inflation: string;
            total_supply: string;
        }
    }
) => {
    try {
        const [delegationsRes, rewardsRes, unbondingRes] = await Promise.all([
            fetch(`${lcd}/cosmos/staking/v1beta1/delegations/${delegator}`, { agent: httpsAgent }),
            fetch(`${lcd}/cosmos/distribution/v1beta1/delegators/${delegator}/rewards`, { agent: httpsAgent }),
            fetch(`${lcd}/cosmos/staking/v1beta1/delegators/${delegator}/unbonding_delegations`, { agent: httpsAgent })
        ]);

        const delegationsJson = await delegationsRes.json() as { delegation_responses?: Array<{ delegation?: { validator_address: string }; balance?: { amount: string } }> };
        const rewardsJson = await rewardsRes.json() as { total?: Array<{ amount?: string }> };
        const unbondingJson = await unbondingRes.json() as { unbonding_responses?: Array<{ entries?: Array<{ balance?: string }> }> };

        const delegations = Array.isArray(delegationsJson?.delegation_responses) ? delegationsJson.delegation_responses : [];
        const bondedTokens = delegations.reduce((sum: bigint, d) => {
            const v = BigInt(d?.balance?.amount || "0");
            return sum + v;
        }, BigInt(0));

        const validators = delegations.map((d) => ({
            address: d?.delegation?.validator_address,
            balance: d?.balance,
            rate: d?.balance?.amount ? (BigNumber(d?.balance?.amount).dividedBy(BigNumber(bondedTokens))).toString() : "0",
            commissionRate: "0"
        })).filter(Boolean);

        await Promise.all(
            validators.map(async (validator) => {
                if (!validator.address) return;

                const queryValidator = await fetch(`${lcd}/cosmos/staking/v1beta1/validators/${validator.address}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });

                const validatorResponse = await queryValidator.json() as { validator?: { commission?: { commission_rates?: { rate: string } } } };
                validator.commissionRate = Number(validatorResponse?.validator?.commission?.commission_rates?.rate || 0).toString();
            })
        );

        // Total rewards (sum all denom amounts)
        const totalRewards = (rewardsJson?.total ?? []).reduce((sum: bigint, r) => {
            const v = BigInt(Math.trunc(Number(r?.amount || 0)));
            return sum + v;
        }, BigInt(0));

        // Unbonding tokens total
        const unbondingTokens = (unbondingJson?.unbonding_responses ?? []).reduce((sum: bigint, resp) => {
            const entries = resp?.entries ?? [];
            const subtotal = entries.reduce((s: bigint, e) => s + BigInt(e?.balance || "0"), BigInt(0));
            return sum + subtotal;
        }, BigInt(0));

        // APR
        let inflation;
        let ratio;
        const injection = 0;
        let apr;
        let c = 0;

        // c calculation
        validators.forEach((v) => {
            // commissionRate : validator's commission rate
            // rate : validator's delegated amount / total bonded
            c += (Number(v.commissionRate) * Number(v.rate));
        });

        if (networkData?.inflation && networkData?.bonded_tokens && networkData?.total_supply) {
            inflation = Number(networkData.inflation);
            ratio = BigNumber(networkData.bonded_tokens).dividedBy(BigNumber(networkData.total_supply)).toNumber();
            apr = ((inflation / ratio) * (1 - c)) + injection;
        }

        return {
            delegator,
            validators,
            bonded_tokens: bondedTokens.toString(),
            unbonding_tokens: unbondingTokens.toString(),
            total_rewards: totalRewards.toString(),
            apr: {
                apr,
                inflation,
                ratio,
                injection,
                c
            },
            raw: {
                delegations: delegationsJson,
                rewards: rewardsJson,
                unbonding: unbondingJson,
            }
        }
    } catch (stakingError) {
        return stakingError;
    }
}