import { APP_CONFIG } from "@/configs/app";
import { CHAINS } from "@/configs/chains";
import { TOKENS } from "@/configs/token";
import { CustomToken } from "@/types/chain";
import { DefiPool } from "@/types/defi";
import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { calculateFee, GasPrice } from "@cosmjs/stargate";
import { Token } from "@uniswap/sdk-core";
import BigNumber from "bignumber.js";
import { clsx, type ClassValue } from "clsx";
import { MsgExecuteContract } from "cosmjs-types/cosmwasm/wasm/v1/tx";
import { BigDecimal, Schema } from "effect";
import { twMerge } from "tailwind-merge";
import { toHex } from "viem";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getTokensByNetwork() {
  return TOKENS.filter(t =>
    APP_CONFIG.forceAllnetwork || t.chain.network_type === APP_CONFIG.network
  );
}

export function formatNumber(
  value: number | string,
  showSuffix: boolean = true,
  decimals: number = 2,
  minSuffix: "" | "K" | "M" | "B" | "T" = ""
): string {
  value = Number(value);
  if (isNaN(value) || value === null || value === undefined) return "-";
  if (value === 0) return "0";

  const threshold = Math.pow(10, -decimals);
  if (value < threshold) return `<${threshold.toFixed(decimals)}`;

  if (value < 1) {
    return formatWithDecimals(value, decimals);
  }

  const suffixes = ["", "K", "M", "B", "T"];
  const minIndex = suffixes.indexOf(minSuffix);

  let index = 0;
  let scaledValue = value;

  while (scaledValue >= 1000 && index < suffixes.length - 1) {
    scaledValue /= 1000;
    index++;
  }

  if (showSuffix && index >= minIndex) {
    const formatted = addThousandSeparators(formatWithDecimals(scaledValue, decimals));
    return `${formatted} ${suffixes[index]}`.trim();
  }

  return addThousandSeparators(formatWithDecimals(value, decimals));
}

function formatWithDecimals(val: number, decimals: number): string {
  if (decimals === 0) {
    return Math.round(val).toString();
  }
  return val.toFixed(decimals).replace(/\.?0+$/, "");
}

export function addThousandSeparators(input: string): string {
  const [intPart, decimalPart] = input.split(".");
  const intWithCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return decimalPart ? `${intWithCommas}.${decimalPart}` : intWithCommas;
}

export function formatDecimal(value: number, decimals: number): number {
  return BigNumber(value).shiftedBy(decimals).toNumber();
}

export function formatBigDecimal(value: string, decimals: number): BigDecimal.BigDecimal {
  const result = BigDecimal.unsafeFromString(value).pipe(
    BigDecimal.scale(decimals)
  );

  return result;
}

export function getTimeoutInNanoseconds24HoursFromNow(): bigint {
  const millisecondsNow = Date.now() // current time in ms
  const millisecondsIn24Hours = 24 * 60 * 60 * 1000 * 3 // 24 hours in ms * 3
  const totalMilliseconds = millisecondsNow + millisecondsIn24Hours
  return BigInt(totalMilliseconds) * BigInt(1_000_000) // convert ms to ns
}

export function getTimeoutInNanoseconds7DaysFromNow(): bigint {
  const millisecondsNow = Date.now() // current time in ms
  const millisecondsIn7Days = 7 * 24 * 60 * 60 * 1000 * 3 // 24 hours in ms * 3
  const totalMilliseconds = millisecondsNow + millisecondsIn7Days;
  return BigInt(totalMilliseconds) * BigInt(1_000_000) // convert ms to ns
}

export const estimateFee = async<T extends object>(
  client: SigningCosmWasmClient,
  userAddress: string,
  contract: string,
  msg: T,
  funds: {
    amount: string;
    denom: string | undefined;
  }[],
  gasPrice: string,
  buffer: number
) => {
  const msgSim = MsgExecuteContract.fromPartial({
    sender: userAddress,
    contract: contract,
    msg: new TextEncoder().encode(JSON.stringify(msg)),
    funds: funds,
  })

  const gasEstimation = await client.simulate(
    userAddress,
    [{
      typeUrl: "/cosmwasm.wasm.v1.MsgExecuteContract",
      value: msgSim
    }],
    ""
  );

  console.log("Estimated gas:", gasEstimation);
  const gasLimit = Math.ceil(gasEstimation * buffer);
  console.log(`Gas limit with ${buffer}x buffer:`, gasLimit);

  const gasPriceCalc = GasPrice.fromString(gasPrice);
  const fee = calculateFee(gasLimit, gasPriceCalc);
  return fee;
}

export const getChannelIdByChainIds = (sourceChainId: string | number, destinationChainId: string | number): {
  sourceChannelId: number | null;
  destinationChannelId: number | null;
} => {
  if (sourceChainId === destinationChainId) {
    return {
      sourceChannelId: null,
      destinationChannelId: null
    };
  }
  if (sourceChainId === CHAINS.babylon.id as string && destinationChainId === CHAINS.mainnet.id) {
    return {
      sourceChannelId: 3,
      destinationChannelId: 1
    };
  }
  if (sourceChainId === CHAINS.mainnet.id && destinationChainId === CHAINS.babylon.id as string) {
    return {
      sourceChannelId: 1,
      destinationChannelId: 3
    };
  }
  throw Error("getChannelIdByChainId: Unknown chainId");
}

export const getExplorerUrlByChainId = (
  chainId: string | number,
  kind: "address" | "tx",
  content: string
): string | undefined => {
  switch (chainId) {
    case CHAINS.babylon.id:
      return `https://www.mintscan.io/babylon/${kind}/${content}`;

    case CHAINS.osmosis.id:
      return `https://www.mintscan.io/osmosis/${kind}/${content}`;

    case CHAINS.mainnet.id:
      return `https://etherscan.io/${kind}/${content}`;

    case CHAINS.holesky.id:
      return `https://holesky.etherscan.io/${kind}/${content}`;

    default:
      return undefined
  }
}

export const getUniTokenFromEscherToken = (
  token: CustomToken
) => {
  return new Token(
    Number(token.chain.id),
    token.contractAddress!,
    token.decimals,
    token.symbol,
    token.name,
  )
}

export const towerCanClaim = (pool: DefiPool) => {
  return pool.claimable &&
    pool.rewards !== undefined &&
    pool.rewards.length > 0 &&
    pool.incentiveAddress !== undefined &&
    pool.lpTokenAddress !== undefined
  // (pool.rewards?.some(r => r.amount >= 1) ?? false)
}

export const uniswapCanClaim = (pool: DefiPool) => {
  return pool.claimable
  // params: position?: UniswapPosition
  // position?.totalRewardsValue !== undefined &&
  // position.totalRewardsValue > 0
}

export const osmosisCanClaim = (pool: DefiPool) => {
  return pool.claimable &&
    pool.rewards !== undefined &&
    pool.rewards?.length > 0
}

export const JsonFromBase64 = Schema.compose(
  Schema.StringFromBase64,
  Schema.parseJson(),
)

export async function safeJson(res: Response) {
  try { return await res.json(); } catch { return await res.text(); }
}

type QueryParam = {
  key: string;
  value?: string;
};

export function buildUrl(baseUrl: string, params: QueryParam[]): string {
  if (!params || params.length === 0) return baseUrl;

  const filteredParams = params.filter(
    (p) => p.value !== undefined && p.value !== ""
  );

  if (filteredParams.length === 0) return baseUrl;

  const queryString = filteredParams
    .map(({ key, value }) => `${encodeURIComponent(key)}=${encodeURIComponent(value!)}`)
    .join("&");

  const separator = baseUrl.includes("?") ? "&" : "?";
  return `${baseUrl}${separator}${queryString}`;
}

export function safeHex(input: string): `0x${string}` {
  return input.startsWith("0x") ? input as `0x${string}` : toHex(input);
}