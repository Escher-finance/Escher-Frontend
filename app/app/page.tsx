'use client';

import Assets from "@/components/page/home/assets";
import Liquid from "@/components/page/home/liquid";
import Overview from "@/components/page/home/overview";
import PointsProgram from "@/components/page/home/points-program";
import Unstakes from "@/components/page/home/unstakes";
import { useEscher } from "@/components/providers/escherProvider";
import { APP_CONFIG } from "@/configs/app";
import useDefi from "@/hooks/defi/useDefi";
import { useUnionExchangeRate } from "@/hooks/liquidStakingContract/union/rate";
import useBabylonCosmosContract from "@/hooks/useBabylonCosmosContract";
import useSuggestToken from "@/hooks/useSuggestToken";
import { useEffect, useMemo, useState } from "react";

const Home = () => {
  const { account } = useEscher();
  const { suggestToken } = useSuggestToken();
  useEffect(() => {
    suggestToken();
  }, [suggestToken]);

  const { tokens } = useEscher();
  const defis = useDefi();

  // LIQUIDTOKENS
  const {
    queryLiquidity: queryLiquidityBabylon,
    queryTokenomics: queryTokenomicsBabylon,
    queryApr: queryAprBabylon
  } = useBabylonCosmosContract();
  const queryUnionExchangeRate = useUnionExchangeRate();

  const exchangeRates = useMemo(() => ({
    babylon: queryLiquidityBabylon.data?.exchange_rate ? Number(queryLiquidityBabylon.data?.exchange_rate) : undefined,
    union: queryUnionExchangeRate.data?.redemption_rate ? Number(queryUnionExchangeRate.data.redemption_rate) : undefined,
  }), [queryLiquidityBabylon.data, queryUnionExchangeRate.data]);

  const liquidities = useMemo(() => {
    return {
      babylon: queryLiquidityBabylon.data,
    };
  }, [queryLiquidityBabylon.data]);

  const tokenomics = useMemo(() => {
    return {
      babylon: queryTokenomicsBabylon.data,
    };
  }, [queryTokenomicsBabylon.data]);

  const aprs = useMemo(() => {
    return {
      babylon: queryAprBabylon.data,
    };
  }, [queryAprBabylon.data]);

  const [tab, setTab] = useState<'liquid' | 'defi'>('liquid');

  return (
    <div className="container mx-auto flex flex-col p-6 gap-6">
      <Overview
        defis={defis}
        apr={aprs.babylon}
        liquidity={liquidities.babylon}
        tokenomics={tokenomics.babylon}
        tokens={tokens}
      />
      <div className="flex gap-6 w-full">
        <Liquid />
        {!APP_CONFIG.networkIsTestnet &&
          <PointsProgram />
        }
      </div>
      {/* <Promo /> */}
      <div className="flex gap-6 items-start">
        <Assets
          defis={defis}
          rates={exchangeRates}
          isCosmosConnected={account.cosmos?.isConnected ?? false}
          isEvmConnected={account.evm?.isConnected ?? false}
          setTab={setTab}
          tab={tab}
          tokens={tokens}
        />
        <Unstakes
          tokens={tokens}
        />
      </div>

      {/* <AutoReconnect /> */}
    </div>
  );
}

export default Home;