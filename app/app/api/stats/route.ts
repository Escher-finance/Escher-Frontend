import { BABYLON_CONTRACTS } from "@/configs/babylon";
import { Tokenomics, Validator } from "@/types/chain";
import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";

async function getInflation(): Promise<number | undefined> {
  try {
    // Annual infation rate
    const queryInflation = await fetch(
      `${BABYLON_CONTRACTS.rest}/cosmos/mint/v1beta1/inflation_rate`,
    );
    const inflation = Number((await queryInflation.json()).inflation_rate) / 2; // half to bitcoin, and baby staker
    return inflation;
  } catch {
    return undefined;
  }
}

async function getTotalSupply(): Promise<number | undefined> {
  try {
    const querySupply = await fetch(
      `${BABYLON_CONTRACTS.rest}/cosmos/bank/v1beta1/supply`,
    );
    const totalSupply = Number(
      (await querySupply.json()).supply.find((v: { denom: string; amount: string }) => v.denom === "ubbn")
        .amount ?? "0",
    );
    return totalSupply;
  } catch {
    return undefined;
  }
}

async function getTokenomics(
  totalSupply: number,
): Promise<Tokenomics | undefined> {
  try {
    const response = await fetch(
      `${BABYLON_CONTRACTS.rest}/cosmos/staking/v1beta1/pool`,
    );

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.errors?.[0]?.message || "Failed to fetch data");
    }

    return {
      total_supply: totalSupply.toString(),
      not_bonded_tokens: result.pool.not_bonded_tokens ?? 0,
      bonded_tokens: result.pool.bonded_tokens ?? 0,
      delegated: result.pool.delegated ?? 0,
    };
  } catch {
    return undefined;
  }
}

export async function GET(req: Request) {
  const reqUrl = new URL(req.url);
  const key = reqUrl.searchParams.get("key");
  const apiKeys = process.env.API_KEYS?.split(",");
  if (
    apiKeys === undefined ||
    apiKeys.length === 0 ||
    key === null ||
    !apiKeys.includes(key)
  ) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { rpc, lst } = BABYLON_CONTRACTS;
  const client = await CosmWasmClient.connect(rpc);
  const {
    validators,
  }: {
    validators: {
      address: string;
      weight: number;
      rate: number;
    }[];
  } = await client.queryContractSmart(lst, {
    validators: {},
  });
  await Promise.all(
    validators.map(async (validator) => {
      const queryValidator = await fetch(
        `${BABYLON_CONTRACTS.rest}/cosmos/staking/v1beta1/validators/${validator.address}`,
      );
      const validatorResponse = (await queryValidator.json())
        .validator as Validator;
      validator.rate = Number(
        validatorResponse?.commission?.commission_rates?.rate,
      );
    }),
  );
  let c = 0;
  const totalWeight = validators.reduce((sum, v) => sum + v.weight, 0);
  validators.map((v) => {
    c += v.rate * v.weight;
  });
  c /= totalWeight;

  const inflation = await getInflation();
  if (inflation === undefined) {
    return Response.json({ error: "Failed to get inflation" }, { status: 500 });
  }

  const totalSupply = await getTotalSupply();
  if (totalSupply === undefined) {
    return Response.json(
      { error: "Failed to get total supply" },
      { status: 500 },
    );
  }

  const tokenomics = await getTokenomics(totalSupply);
  if (tokenomics === undefined) {
    return Response.json(
      { error: "Failed to get tokenomics" },
      { status: 500 },
    );
  }
  const ratio =
    Number(tokenomics.bonded_tokens) /
    (Number(tokenomics.bonded_tokens) + Number(totalSupply));
  const apr = (inflation / ratio) * (1 - c) * 0.9;

  return Response.json({ ratio, apr });
}
