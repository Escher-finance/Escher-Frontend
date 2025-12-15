/* eslint-disable @typescript-eslint/no-explicit-any */
// reason : playground files

import Button from "@/components/global/button";
import Card from "@/components/global/card";
import { useEscher } from "@/components/providers/escherProvider";
import { CHAINS } from "@/configs/chains";
import { UNISWAP_POOLS } from "@/hooks/defi/uniswap/useUniswapDefi";
import { Call } from "@/hooks/useEip7702";
import { useQuery } from "@tanstack/react-query";
import { useList } from "@uidotdev/usehooks";
import { CurrencyAmount, Percent, Token } from "@uniswap/sdk-core";
import IUniswapV3PoolABI from '@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json';
import { AddLiquidityOptions, CollectOptions, MintOptions, nearestUsableTick, NonfungiblePositionManager, Pool, Position, RemoveLiquidityOptions, TickMath } from "@uniswap/v3-sdk";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Address, Calls, encodeFunctionData, erc20Abi, formatUnits, getContract, Hex, Narrow, parseUnits, toHex, zeroAddress } from "viem";
import { mainnet, sepolia } from "viem/chains";
import { useAccount, usePublicClient, useSendCalls, useSwitchChain, useWalletClient } from "wagmi";

interface PositionInfo {
  tokenId: bigint;
  amount0: bigint;
  amount1: bigint;
  token0: Address;
  token1: Address;
  fee: number;
  tickLower: number;
  tickUpper: number;
  liquidity: bigint;
  feeGrowthInside0LastX128: bigint;
  feeGrowthInside1LastX128: bigint;
  tokensOwed0: bigint;
  tokensOwed1: bigint;
}

const UniswapPool = () => {
  const { tokens: appTokens, escherTokens, account } = useEscher();
  const { chain } = useAccount();
  const { switchChain } = useSwitchChain();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const [amountA, setAmountA] = useState<string>("0");
  const [amountB, setAmountB] = useState<string>("0");
  const { sendCalls, /* data: sendCallsData */ } = useSendCalls();
  const [positionInfos, positionInfosController] = useList<PositionInfo>();
  const [selectedPositionTokenId, setSelectedPositionTokenId] = useState("");
  const [removePercentage, setRemovePercentage] = useState("50");

  const accountAddress = account.evm?.address as Address | undefined;
  const chainId = chain?.id;
  const isMainnet = chainId === mainnet.id;

  const pools = UNISWAP_POOLS.filter((p) => p.chainId === chainId);
  const [selectedPoolAddress, setSelectedPoolAddress] = useState(pools.at(0)?.address);
  const pool = pools.find((p) => p.address === selectedPoolAddress);

  const nonfungiblePositionManagerContractAddress = isMainnet ? "0xC36442b4a4522E871399CD717aBDD847Ab11FE88" : "0x1238536071E1c677A632429e3655c799b22cDA52";
  const wethAddress = isMainnet ? "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2" : "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14";

  useEffect(() => {
    if (queryPool.data?.ratio) {
      setAmountB((
        Number(amountA) * queryPool.data.ratio
      ).toFixed(18));
    }
  }, [amountA]);

  const tokens = useMemo(() => ({
    a: appTokens.find(t => t.id === pool?.token0Id),
    b: appTokens.find(t => t.id === pool?.token1Id),
  }), [appTokens, pool]);

  const uniTokens = useMemo(() => {
    if (!tokens.a || !tokens.b) {
      return undefined;
    }
    return {
      a: new Token(
        Number(tokens.a.chain.id),
        tokens.a.contractAddress!,
        tokens.a.decimals,
        tokens.a.symbol,
        tokens.a.name,
      ),
      b: new Token(
        Number(tokens.b.chain.id),
        tokens.b.contractAddress!,
        tokens.b.decimals,
        tokens.b.symbol,
        tokens.b.name,
      ),
    };
  }, [tokens]);

  const getPoolTick = async () => {
    if (
      !publicClient ||
      !walletClient ||
      !account.evm?.address ||
      !pool
    ) {
      console.error({
        publicClient,
        walletClient,
        address: account.evm?.address
      });

      return;
    }

    const [liquidityResp, slot0Resp] = await publicClient.multicall({
      contracts: [
        {
          address: pool.address,
          abi: IUniswapV3PoolABI.abi,
          functionName: 'liquidity',
        },
        {
          address: pool.address,
          abi: IUniswapV3PoolABI.abi,
          functionName: 'slot0',
        },
      ]
    });

    const liquidity = liquidityResp.result as bigint;
    const sqrtPriceX96 = (slot0Resp.result as any[])[0] as bigint;
    const tick = (slot0Resp.result as any[])[1] as number;

    const configuredPool = uniTokens ? new Pool(
      uniTokens.a,
      uniTokens.b,
      pool.fee,
      sqrtPriceX96.toString(),
      liquidity.toString(),
      tick
    ) : undefined;

    // https://ethereum.stackexchange.com/questions/161745/how-to-calculate-sqrtpricex96-for-uniswap-pool-creation
    const decimalAdjustment = uniTokens ? 10 ** (uniTokens.a.decimals - uniTokens.b.decimals) : 0;
    const ratio = Number(sqrtPriceX96) ** 2 / 2 ** 192 * decimalAdjustment;

    console.log({
      pool: configuredPool,
      tick: tick,
      ratio,
    });

    return {
      pool: configuredPool,
      tick: tick,
      ratio
    };
  }

  const queryPool = useQuery({
    queryKey: ["uniswapPool", escherTokens.evm.ebaby.symbol, escherTokens.evm.baby.symbol, pool?.address ?? '0x', chainId],
    queryFn: getPoolTick,
    enabled: !!publicClient && !!walletClient && !!account.evm?.address
  });

  const handleFetchPositions = useCallback(async () => {
    if (!publicClient || !accountAddress) {
      return;
    }
    const contract = getContract({
      address: nonfungiblePositionManagerContractAddress,
      abi: INONFUNGIBLE_POSITION_MANAGER_ABI,
      client: publicClient,
    });
    const positionCount = await contract.read.balanceOf([accountAddress]);
    const positionIdCalls = []
    for (let i = BigInt(0); i < positionCount; i++) {
      positionIdCalls.push(contract.read.tokenOfOwnerByIndex([accountAddress, i]));
    }
    const positionIds = await Promise.all(positionIdCalls);

    const positionCalls = []
    for (const id of positionIds) {
      positionCalls.push(
        contract.read.positions([id])
      );
    }
    const callResponses = await Promise.all(positionCalls);
    const _positionInfos = callResponses.map((position, i) => {
      const tickLower = position[5];
      const tickUpper = position[6];
      const liquidity = position[7];
      let amount0 = BigInt(0);
      let amount1 = BigInt(0);
      if (queryPool.data?.pool) {
        const p = new Position({
          pool: queryPool.data.pool,
          liquidity: liquidity.toString(),
          tickLower,
          tickUpper,
        });
        amount0 = BigInt(p.amount0.numerator.toString());
        amount1 = BigInt(p.amount1.numerator.toString());
      }
      return {
        tokenId: positionIds[i],
        amount0,
        amount1,
        token0: position[2],
        token1: position[3],
        fee: position[4],
        tickLower,
        tickUpper,
        liquidity,
        feeGrowthInside0LastX128: position[8],
        feeGrowthInside1LastX128: position[9],
        tokensOwed0: position[10],
        tokensOwed1: position[11],
      }
    });
    positionInfosController.set(
      _positionInfos.filter((p) => {
        return p.liquidity > BigInt(0) && p.amount0 > BigInt(0) && p.amount1 > BigInt(0);
      })
    );
    console.log({ _positionInfos })
  }, [publicClient, accountAddress, queryPool.data]);

  useEffect(() => {
    positionInfosController.set([]);
    handleFetchPositions()
  }, [handleFetchPositions, chainId, pool?.address])

  useEffect(() => {
    if (selectedPositionTokenId === "" && positionInfos.length > 0) {
      setSelectedPositionTokenId(positionInfos[0].tokenId.toString())
    }
  }, [selectedPositionTokenId, positionInfos])

  const handleMintPosition = async () => {
    if (
      !publicClient ||
      !walletClient ||
      !account.evm?.address ||
      !queryPool.data?.pool ||
      !uniTokens
    ) {
      console.error({
        publicClient,
        walletClient,
        address: account.evm?.address,
        queryPool: queryPool.data
      });

      return;
    }

    const inputAmount = {
      a: parseUnits(amountA, uniTokens.a.decimals),
      b: parseUnits(amountB, uniTokens.b.decimals),
    }

    const pool = await getPoolTick();
    if (!pool) {
      console.error({ pool });
      return;
    }

    console.log({
      pool,
      inputAmount
    });

    const positionToMint = constructPosition(
      CurrencyAmount.fromRawAmount(
        uniTokens.a,
        inputAmount.a.toString()
      ),
      CurrencyAmount.fromRawAmount(
        uniTokens.b,
        inputAmount.b.toString()
      ),
      queryPool.data.pool
    )

    console.log({
      positionToMint
    });

    const mintOptions: MintOptions = {
      recipient: account.evm.address,
      deadline: Math.floor(Date.now() / 1000) + 60 * 20,
      slippageTolerance: new Percent(50, 10_000),
    }

    // get calldata for minting a position
    const { calldata } = NonfungiblePositionManager.addCallParameters(
      positionToMint,
      mintOptions
    );

    console.log({
      mintOptions,
      calldata
    });

    const calls: Call[] = [];

    const aIsEth = uniTokens.a.address === zeroAddress || uniTokens.a.address === wethAddress;
    const bIsEth = uniTokens.b.address === zeroAddress || uniTokens.b.address === wethAddress;

    if (!aIsEth) {
      calls.push({
        to: uniTokens.a.address as Address,
        data: encodeFunctionData({
          abi: erc20Abi,
          functionName: "approve",
          args: [nonfungiblePositionManagerContractAddress, inputAmount.a]
        })
      })
    }
    if (!bIsEth) {
      calls.push({
        to: uniTokens.b.address as Address,
        data: encodeFunctionData({
          abi: erc20Abi,
          functionName: "approve",
          args: [nonfungiblePositionManagerContractAddress, inputAmount.b]
        })
      })
    }

    calls.push({
      to: nonfungiblePositionManagerContractAddress,
      data: calldata as Hex,
      value: aIsEth ? toHex(inputAmount.a) : bIsEth ? toHex(inputAmount.b) : undefined,
    })

    sendCalls({
      account: account.evm.address as Address,
      chainId,
      calls: calls as Calls<Narrow<readonly unknown[]>>
    })
  }

  const handleAddPosition = async () => {
    if (!accountAddress || !queryPool.data?.pool || selectedPositionTokenId === "" || !uniTokens) {
      return;
    }

    const inputAmount = {
      a: parseUnits(amountA, uniTokens.a.decimals),
      b: parseUnits(amountB, uniTokens.b.decimals),
    }

    const positionToAdd = constructPosition(
      CurrencyAmount.fromRawAmount(
        uniTokens.a,
        inputAmount.a.toString()
      ),
      CurrencyAmount.fromRawAmount(
        uniTokens.b,
        inputAmount.b.toString()
      ),
      queryPool.data.pool
    )

    const addLiquidityOptions: AddLiquidityOptions = {
      deadline: Math.floor(Date.now() / 1000) + 60 * 20,
      slippageTolerance: new Percent(50, 10_000),
      tokenId: selectedPositionTokenId
    }

    const { calldata } = NonfungiblePositionManager.addCallParameters(
      positionToAdd,
      addLiquidityOptions
    )

    const calls: Call[] = [];

    const aIsEth = uniTokens.a.address === zeroAddress || uniTokens.a.address === wethAddress;
    const bIsEth = uniTokens.b.address === zeroAddress || uniTokens.b.address === wethAddress;

    if (!aIsEth) {
      calls.push({
        to: uniTokens.a.address as Address,
        data: encodeFunctionData({
          abi: erc20Abi,
          functionName: "approve",
          args: [nonfungiblePositionManagerContractAddress, inputAmount.a]
        })
      })
    }
    if (!bIsEth) {
      calls.push({
        to: uniTokens.b.address as Address,
        data: encodeFunctionData({
          abi: erc20Abi,
          functionName: "approve",
          args: [nonfungiblePositionManagerContractAddress, inputAmount.b]
        })
      })
    }

    calls.push({
      to: nonfungiblePositionManagerContractAddress,
      data: calldata as Hex,
      value: aIsEth ? toHex(inputAmount.a) : bIsEth ? toHex(inputAmount.b) : undefined,
    })

    sendCalls({
      account: accountAddress,
      chainId,
      calls: calls as Calls<Narrow<readonly unknown[]>>
    })
  }

  const handleRemovePosition = async () => {
    if (!accountAddress || !queryPool.data?.pool || !uniTokens || !removePercentage || selectedPositionTokenId === "") {
      return;
    }

    const positionInfo = positionInfos.find((p) => p.tokenId === BigInt(selectedPositionTokenId));
    if (!positionInfo) {
      return;
    }

    const positionToRemove = constructPosition(
      CurrencyAmount.fromRawAmount(
        uniTokens.a,
        positionInfo.amount0.toString()
      ),
      CurrencyAmount.fromRawAmount(
        uniTokens.b,
        positionInfo.amount1.toString()
      ),
      queryPool.data.pool
    )

    const removeLiquidityOptions: RemoveLiquidityOptions = {
      deadline: Math.floor(Date.now() / 1000) + 60 * 20,
      slippageTolerance: new Percent(50, 10_000),
      tokenId: selectedPositionTokenId,
      liquidityPercentage: new Percent(Number(removePercentage), 100),
      collectOptions: {
        expectedCurrencyOwed0: CurrencyAmount.fromRawAmount(
          uniTokens.a,
          positionInfo.tokensOwed0.toString()
        ),
        expectedCurrencyOwed1: CurrencyAmount.fromRawAmount(
          uniTokens.b,
          positionInfo.tokensOwed1.toString()
        ),
        recipient: accountAddress
      }
    };

    const { calldata } = NonfungiblePositionManager.removeCallParameters(
      positionToRemove,
      removeLiquidityOptions
    )

    const calls: Call[] = [];

    calls.push({
      to: nonfungiblePositionManagerContractAddress,
      data: calldata as Hex,
    })

    sendCalls({
      account: accountAddress,
      chainId,
      calls: calls as Calls<Narrow<readonly unknown[]>>
    })
  }

  const handleCollectFees = async () => {
    if (!accountAddress || !queryPool.data || !uniTokens || selectedPositionTokenId === "") {
      return;
    }

    const positionInfo = positionInfos.find((p) => p.tokenId === BigInt(selectedPositionTokenId));
    if (!positionInfo) {
      return;
    }

    const collectOptions: CollectOptions = {
      tokenId: positionInfo.tokenId.toString(),
      expectedCurrencyOwed0: CurrencyAmount.fromRawAmount(
        uniTokens.a,
        positionInfo.tokensOwed0.toString(),
      ),
      expectedCurrencyOwed1: CurrencyAmount.fromRawAmount(
        uniTokens.b,
        positionInfo.tokensOwed1.toString(),
      ),
      recipient: accountAddress
    };

    const { calldata } = NonfungiblePositionManager.collectCallParameters(collectOptions)

    const calls: Call[] = [];

    calls.push({
      to: nonfungiblePositionManagerContractAddress,
      data: calldata as Hex,
    })

    sendCalls({
      account: accountAddress,
      chainId,
      calls: calls as Calls<Narrow<readonly unknown[]>>
    })
  }

  if (!chainId || chainId !== CHAINS.mainnet.id && chainId !== CHAINS.sepolia.id) {
    return (
      <Card className="items-start gap-0 text-sm">
        <div className="w-full flex justify-between items-center">
          <div className="text-xl font-semibold text-escher-gray900 dark:text-white">Uniswap Pool</div>
        </div>
        <div className="flex flex-row gap-2">
          Wrong chain
          <Button onClick={() => switchChain({ chainId: mainnet.id })} title="Switch to mainnet" size="sm" />
          <Button onClick={() => switchChain({ chainId: sepolia.id })} title="Switch to testnet" size="sm" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="items-start gap-0 text-sm">
      <div className="w-full flex flex-row justify-between">
        <select className="h-fit" value={selectedPoolAddress} onChange={e => setSelectedPoolAddress(e.currentTarget.value as Address)}>
          {pools.map((p) => (
            <option id={p.address} value={p.address}>
              Pool {p.address}
            </option>
          ))}
        </select>
        <div className="flex flex-col items-center">
          <div>{chain.name} Chain</div>
          {isMainnet ? (
            <Button onClick={() => switchChain({ chainId: sepolia.id })} title="Switch to testnet" size="sm" />
          ) : (
            <Button onClick={() => switchChain({ chainId: mainnet.id })} title="Switch to mainnet" size="sm" />
          )}
        </div>
      </div>
      <div className="w-full flex justify-between items-center">
        <a
          target="_blank"
          href={`https://app.uniswap.org/explore/pools/ethereum${chainId === CHAINS.sepolia.id ? "_sepolia" : ""}/${pool?.address}`}
          className="underline text-xl font-semibold text-escher-gray900 dark:text-white"
        >
          Uniswap V3 Pool
        </a>
      </div>
      <hr className="border border-t border-escher-gray200 dark:border-escher-darkblue_border w-full mb-4" />

      <div>Balance</div>
      <div>{tokens.a?.balance?.formattedBalance} {tokens.a?.symbol}</div>
      <div>{tokens.b?.balance?.formattedBalance} {tokens.b?.symbol}</div>
      <hr className="w-full my-2" />

      <div>Ratio</div>
      <div>1 {uniTokens?.a.symbol} : {queryPool.data?.ratio} {uniTokens?.b.symbol}</div>
      <hr className="w-full my-2" />
      <div className="font-bold">Mint / Add</div>
      <div className="flex gap-4">
        <div className="flex flex-col gap-2">
          <div>{uniTokens?.a.symbol}</div>
          <input type="number" className="border" value={amountA} onChange={v => setAmountA(v.target.value)} />
        </div>
        <div className="flex flex-col gap-2">
          <div>{uniTokens?.b.symbol}</div>
          <input type="number" className="border" value={amountB} onChange={v => setAmountB(v.target.value)} />
        </div>
      </div>
      <hr className="w-full my-2" />
      <div className="flex flex-col gap-2">
        <div className="font-bold">Remove</div>
        <div className="flex flex-row gap-2">
          <input type="range" min={1} max={100} value={removePercentage} onChange={v => setRemovePercentage(v.target.value)} />
          <div>{removePercentage}%</div>
        </div>
      </div>
      <hr className="w-full my-2" />
      <div className="flex flex-row gap-2">
        <div className="font-bold">Position</div>
        {positionInfos.length > 0 && (
          <select value={selectedPositionTokenId} onChange={e => setSelectedPositionTokenId(e.currentTarget.value)}>
            {positionInfos.map((p) => (
              <option id={p.tokenId.toString()} value={p.tokenId.toString()}>
                {p.tokenId}
              </option>
            ))}
          </select>
        )}
      </div>
      <hr className="w-full my-2" />
      <table className="border-spacing-x-4 border-separate">
        <tr>
          <th>Position ID</th>
          <th>Liquidity</th>
          <th>{uniTokens?.a.symbol}</th>
          <th>{uniTokens?.b.symbol}</th>
          <th>Fees</th>
        </tr>
        {
          positionInfos.map((p) => {
            return (
              <tr id={p.tokenId.toString()}>
                <td>{p.tokenId}</td>
                <td>{p.liquidity}</td>
                <td>{formatUnits(p.amount0, uniTokens?.a.decimals ?? 0)}</td>
                <td>{formatUnits(p.amount1, uniTokens?.b.decimals ?? 0)}</td>
                <td>{formatUnits(p.tokensOwed0, uniTokens?.a.decimals ?? 0)} {uniTokens?.a.symbol} + {formatUnits(p.tokensOwed1, uniTokens?.b.decimals ?? 0)} {uniTokens?.b.symbol}</td>
              </tr>
            )
          })
        }
      </table>
      <hr className="w-full my-2" />
      <div className="flex items-center gap-2">
        <Button onClick={() => getPoolTick()} title="Reload pool" size="sm" />
        {/* <Button onClick={() => console.log({ queryPool: queryPool.data })} title="Log" size="sm" /> */}
        <Button onClick={handleFetchPositions} title="Reload positions" size="sm" />
        <Button onClick={handleMintPosition} title="Mint position" size="sm" />
        <Button onClick={handleAddPosition} title="Add to position" size="sm" />
        <Button onClick={handleRemovePosition} title="Remove from position" size="sm" />
        <Button onClick={handleCollectFees} title="Collect fees from position" size="sm" />
      </div>
    </Card>
  );
};

export default UniswapPool;

function constructPosition(
  token0Amount: CurrencyAmount<Token>,
  token1Amount: CurrencyAmount<Token>,
  poolInfo: Pool
): Position {
  return Position.fromAmounts({
    pool: poolInfo,
    tickLower: nearestUsableTick(TickMath.MIN_TICK, poolInfo.tickSpacing),
    tickUpper: nearestUsableTick(TickMath.MAX_TICK, poolInfo.tickSpacing),
    amount0: token0Amount.quotient,
    amount1: token1Amount.quotient,
    useFullPrecision: true,
  })
}

const INONFUNGIBLE_POSITION_MANAGER_ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_factory",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_WETH9",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_tokenDescriptor_",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "approved",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "Approval",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "operator",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "bool",
        "name": "approved",
        "type": "bool"
      }
    ],
    "name": "ApprovalForAll",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "recipient",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount0",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount1",
        "type": "uint256"
      }
    ],
    "name": "Collect",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint128",
        "name": "liquidity",
        "type": "uint128"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount0",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount1",
        "type": "uint256"
      }
    ],
    "name": "DecreaseLiquidity",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint128",
        "name": "liquidity",
        "type": "uint128"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount0",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount1",
        "type": "uint256"
      }
    ],
    "name": "IncreaseLiquidity",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "Transfer",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "DOMAIN_SEPARATOR",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "PERMIT_TYPEHASH",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "WETH9",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "approve",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      }
    ],
    "name": "balanceOf",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "baseURI",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "burn",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "recipient",
            "type": "address"
          },
          {
            "internalType": "uint128",
            "name": "amount0Max",
            "type": "uint128"
          },
          {
            "internalType": "uint128",
            "name": "amount1Max",
            "type": "uint128"
          }
        ],
        "internalType": "struct INonfungiblePositionManager.CollectParams",
        "name": "params",
        "type": "tuple"
      }
    ],
    "name": "collect",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "amount0",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "amount1",
        "type": "uint256"
      }
    ],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "token0",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "token1",
        "type": "address"
      },
      {
        "internalType": "uint24",
        "name": "fee",
        "type": "uint24"
      },
      {
        "internalType": "uint160",
        "name": "sqrtPriceX96",
        "type": "uint160"
      }
    ],
    "name": "createAndInitializePoolIfNecessary",
    "outputs": [
      {
        "internalType": "address",
        "name": "pool",
        "type": "address"
      }
    ],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
          },
          {
            "internalType": "uint128",
            "name": "liquidity",
            "type": "uint128"
          },
          {
            "internalType": "uint256",
            "name": "amount0Min",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "amount1Min",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "deadline",
            "type": "uint256"
          }
        ],
        "internalType": "struct INonfungiblePositionManager.DecreaseLiquidityParams",
        "name": "params",
        "type": "tuple"
      }
    ],
    "name": "decreaseLiquidity",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "amount0",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "amount1",
        "type": "uint256"
      }
    ],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "factory",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "getApproved",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "amount0Desired",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "amount1Desired",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "amount0Min",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "amount1Min",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "deadline",
            "type": "uint256"
          }
        ],
        "internalType": "struct INonfungiblePositionManager.IncreaseLiquidityParams",
        "name": "params",
        "type": "tuple"
      }
    ],
    "name": "increaseLiquidity",
    "outputs": [
      {
        "internalType": "uint128",
        "name": "liquidity",
        "type": "uint128"
      },
      {
        "internalType": "uint256",
        "name": "amount0",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "amount1",
        "type": "uint256"
      }
    ],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "operator",
        "type": "address"
      }
    ],
    "name": "isApprovedForAll",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "token0",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "token1",
            "type": "address"
          },
          {
            "internalType": "uint24",
            "name": "fee",
            "type": "uint24"
          },
          {
            "internalType": "int24",
            "name": "tickLower",
            "type": "int24"
          },
          {
            "internalType": "int24",
            "name": "tickUpper",
            "type": "int24"
          },
          {
            "internalType": "uint256",
            "name": "amount0Desired",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "amount1Desired",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "amount0Min",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "amount1Min",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "recipient",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "deadline",
            "type": "uint256"
          }
        ],
        "internalType": "struct INonfungiblePositionManager.MintParams",
        "name": "params",
        "type": "tuple"
      }
    ],
    "name": "mint",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      },
      {
        "internalType": "uint128",
        "name": "liquidity",
        "type": "uint128"
      },
      {
        "internalType": "uint256",
        "name": "amount0",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "amount1",
        "type": "uint256"
      }
    ],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes[]",
        "name": "data",
        "type": "bytes[]"
      }
    ],
    "name": "multicall",
    "outputs": [
      {
        "internalType": "bytes[]",
        "name": "results",
        "type": "bytes[]"
      }
    ],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "name",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "ownerOf",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "spender",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "deadline",
        "type": "uint256"
      },
      {
        "internalType": "uint8",
        "name": "v",
        "type": "uint8"
      },
      {
        "internalType": "bytes32",
        "name": "r",
        "type": "bytes32"
      },
      {
        "internalType": "bytes32",
        "name": "s",
        "type": "bytes32"
      }
    ],
    "name": "permit",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "positions",
    "outputs": [
      {
        "internalType": "uint96",
        "name": "nonce",
        "type": "uint96"
      },
      {
        "internalType": "address",
        "name": "operator",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "token0",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "token1",
        "type": "address"
      },
      {
        "internalType": "uint24",
        "name": "fee",
        "type": "uint24"
      },
      {
        "internalType": "int24",
        "name": "tickLower",
        "type": "int24"
      },
      {
        "internalType": "int24",
        "name": "tickUpper",
        "type": "int24"
      },
      {
        "internalType": "uint128",
        "name": "liquidity",
        "type": "uint128"
      },
      {
        "internalType": "uint256",
        "name": "feeGrowthInside0LastX128",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "feeGrowthInside1LastX128",
        "type": "uint256"
      },
      {
        "internalType": "uint128",
        "name": "tokensOwed0",
        "type": "uint128"
      },
      {
        "internalType": "uint128",
        "name": "tokensOwed1",
        "type": "uint128"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "refundETH",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "safeTransferFrom",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      },
      {
        "internalType": "bytes",
        "name": "_data",
        "type": "bytes"
      }
    ],
    "name": "safeTransferFrom",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "token",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "deadline",
        "type": "uint256"
      },
      {
        "internalType": "uint8",
        "name": "v",
        "type": "uint8"
      },
      {
        "internalType": "bytes32",
        "name": "r",
        "type": "bytes32"
      },
      {
        "internalType": "bytes32",
        "name": "s",
        "type": "bytes32"
      }
    ],
    "name": "selfPermit",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "token",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "nonce",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "expiry",
        "type": "uint256"
      },
      {
        "internalType": "uint8",
        "name": "v",
        "type": "uint8"
      },
      {
        "internalType": "bytes32",
        "name": "r",
        "type": "bytes32"
      },
      {
        "internalType": "bytes32",
        "name": "s",
        "type": "bytes32"
      }
    ],
    "name": "selfPermitAllowed",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "token",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "nonce",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "expiry",
        "type": "uint256"
      },
      {
        "internalType": "uint8",
        "name": "v",
        "type": "uint8"
      },
      {
        "internalType": "bytes32",
        "name": "r",
        "type": "bytes32"
      },
      {
        "internalType": "bytes32",
        "name": "s",
        "type": "bytes32"
      }
    ],
    "name": "selfPermitAllowedIfNecessary",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "token",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "deadline",
        "type": "uint256"
      },
      {
        "internalType": "uint8",
        "name": "v",
        "type": "uint8"
      },
      {
        "internalType": "bytes32",
        "name": "r",
        "type": "bytes32"
      },
      {
        "internalType": "bytes32",
        "name": "s",
        "type": "bytes32"
      }
    ],
    "name": "selfPermitIfNecessary",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "operator",
        "type": "address"
      },
      {
        "internalType": "bool",
        "name": "approved",
        "type": "bool"
      }
    ],
    "name": "setApprovalForAll",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes4",
        "name": "interfaceId",
        "type": "bytes4"
      }
    ],
    "name": "supportsInterface",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "token",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amountMinimum",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "recipient",
        "type": "address"
      }
    ],
    "name": "sweepToken",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "symbol",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "index",
        "type": "uint256"
      }
    ],
    "name": "tokenByIndex",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "index",
        "type": "uint256"
      }
    ],
    "name": "tokenOfOwnerByIndex",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "tokenURI",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "transferFrom",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "amount0Owed",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "amount1Owed",
        "type": "uint256"
      },
      {
        "internalType": "bytes",
        "name": "data",
        "type": "bytes"
      }
    ],
    "name": "uniswapV3MintCallback",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "amountMinimum",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "recipient",
        "type": "address"
      }
    ],
    "name": "unwrapWETH9",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "stateMutability": "payable",
    "type": "receive"
  }
] as const;
