"use client";

import Validators from "@/components/babylon/_sections/validators";
import Header from "@/components/global/header";
import LdrsAnimation from "@/components/global/ldrsAnimation";
import { useAuth } from "@/components/provider/auth";
import Revenue from "@/components/shared/revenue";
import RevenueValidator from "@/components/shared/revenue-validator";
import UnionApr from "@/components/union/apr";
import UnionBonds from "@/components/union/bonds";
import UnionSupply from "@/components/union/ebaby-supply";
import UnionRewardFee from "@/components/union/reward-fee";
import UnionStaked from "@/components/union/staked";
import UnionTotalStakers from "@/components/union/total-stakers";
import UnionTotalHolders from "@/components/union/total-holders";
import UnionTvl from "@/components/union/tvl";
import UnionUnbonds from "@/components/union/unbonds";
import useValidatorsUnion from "@/hooks/useValidatorsUnion";
import ContractInfo from "@/components/union/contract-info";
import UnbondBatch from "@/components/shared/unbond-batch";

export default function UnionPage() {
  const { user, logout } = useAuth();
  const { data: validators } = useValidatorsUnion();

  if (!user) return (
    <div className="w-full h-screen flex items-center justify-center">
      <LdrsAnimation />
    </div>
  );

  return (
    <div className="container px-4 md:px-0 mx-auto py-10 flex flex-col">
      {/* <button onClick={() => console.log({ validators })}>Log</button> */}
      <Header
        role={user.role}
        onLogout={logout}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 mt-8 gap-4">
        {/* Total Stakers */}
        <UnionTotalStakers />

        {/* Total Holders */}
        <UnionTotalHolders />

        {/* APR */}
        <UnionApr />

        {/* TVL */}
        <UnionTvl />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 mt-8 gap-4">
        {/* Staked */}
        <UnionStaked />

        {/* U total supply */}
        <UnionSupply />

        {/* Fee collected */}
        <UnionRewardFee />
      </div>

      <Revenue
        lst="union"
        validators={validators}
      />
      <RevenueValidator
        lst="union"
        validators={validators}
      />

      <UnionBonds />

      <UnionUnbonds />

      <Validators
        lst="union"
        validators={validators}
      />

      <div className="w-full flex flex-col md:flex-row gap-8">
        <UnbondBatch
          lst="union"
          className="w-[35%]"
        />
        <ContractInfo
          className="flex-1"
        />
      </div>
    </div>
  );
}
