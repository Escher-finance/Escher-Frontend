import { VALIDATORS_FEE, VALIDATORS_WEIGHT } from "@/lib/validators";
import { Validator } from "@/types/types";
import { NextRequest, NextResponse } from "next/server";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const lcd = searchParams.get('testnet')
      ? 'https://rest.rpc-node.union-testnet-10.union.build'
      : 'https://rest.union.build';

    // default delegator used for Union TVL aggregation
    const delegator = searchParams.get('delegator')
      || 'union19ydrfy0d80vgpvs6p0cljlahgxwrkz54ps8455q7jfdfape7ld7quaq69v';

    const res = await fetch(`${lcd}/cosmos/staking/v1beta1/delegations/${delegator}`);
    if (!res.ok) {
      const detail = await safeJson(res);
      return NextResponse.json({ error: 'delegations_failed', detail }, { status: 502 });
    }
    const delegations = (await res.json()).delegation_responses as {
      "delegation": {
        "delegator_address": string
        "validator_address": string
        "shares": string
      },
      "balance": {
        "denom": string
        "amount": string
      }
    }[];

    const validators: Validator[] = [];

    await Promise.all(
      delegations.map(async (delegation) => {
        const queryValidator = await fetch(`${lcd}/cosmos/staking/v1beta1/validators/${delegation.delegation.validator_address}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        const validatorResponse = (await queryValidator.json()).validator;
        validators.push({
          address: delegation.delegation.validator_address,
          balance: delegation?.delegation.shares ?? "0",
          commission: Number(validatorResponse?.commission?.commission_rates?.rate),
          data: validatorResponse,
          weight: VALIDATORS_WEIGHT.find(v => v.address === delegation.delegation.validator_address)?.weight ?? 0,
          fee: VALIDATORS_FEE.find(v => v.address === delegation.delegation.validator_address)?.fee
        });
      })
    );

    return NextResponse.json(validators);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'unknown' }, { status: 500 });
  }
}

async function safeJson(res: Response) {
  try { return await res.json(); } catch { return await res.text(); }
}


