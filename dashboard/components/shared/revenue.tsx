import LdrsAnimation from "@/components/global/ldrsAnimation";
import { APP_CONFIG } from "@/config/app";
import { LiquidStaking, Validator } from "@/types/types";
import { formatDate, formatDecimal, formatNumber } from "@/utils/utils";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

interface TotalData {
  total_commission_fee: number // percentage of escher fee from validator's commission 
  total_commission_fee_formatted: string
  total_reward: number // our reward, from indexer's fee column
  total_reward_formatted: string
  total_revenue: number // sum of both value
  total_revenue_formatted: string
}

interface HistoricData extends TotalData {
  reward_date: string
}

interface Props {
  lst: LiquidStaking
  validators?: Validator[]
}

type TAB = 'total' | 'reward' | 'commission';
const TAB_DESCRIPTION: Record<TAB, { description: string, dataKey: string }> = {
  total: {
    description: "Total revenue",
    dataKey: "total_revenue"
  },
  reward: {
    description: "Total reward",
    dataKey: "total_reward"
  },
  commission: {
    description: "Total escher fee we get from validator's commision",
    dataKey: "total_commission_fee"
  }
}

const Revenue = (props: Props) => {
  const [baseApi, decimals, symbol] = props.lst === "babylon" ?
    ["/api", 6, "BABY"] :
    ["/api/union", 18, "U"];

  const [tab, setTab] = useState<'total' | 'reward' | 'commission'>('total');
  const [activeValidatorIndex, setActiveValidatorIndex] = useState<number>();
  const activeValidator = useMemo(() => {
    if (activeValidatorIndex === undefined) return undefined;
    return props.validators?.at(activeValidatorIndex);
  }, [activeValidatorIndex, props.validators]);

  const getData = useCallback(async () => {
    const responseHistoric = await fetch(`${baseApi}/reward-historic`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    const historic = await responseHistoric.json() as { reward_date: string, total_amount: number, total_fee: number, total_withdraw: number }[];

    const responseWithdraw = await fetch(`${baseApi}/reward-withdraw`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    const withdraw = await responseWithdraw.json() as { reward_date: string, total_amount: number }[];
    historic.map(v => {
      v.total_withdraw = withdraw.find(w => w.reward_date === v.reward_date)?.total_amount ?? 0
    })

    const responseTotal = await fetch(`${baseApi}/reward-total`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    const total = (await responseTotal.json() as { total_amount: number, total_fee: number }[])[0];

    return {
      historic,
      total
    }
  }, []);

  const queryData = useQuery({
    queryKey: ["revenue", props.lst],
    queryFn: getData,
    refetchInterval: APP_CONFIG.indexerInterfal
  });

  const calculateEscherFee = (totalAmount: number, validator: Validator) => {
    const amount = totalAmount * (validator.weight / 100) * (1 / (1 - validator.commission));
    const commission = amount * validator.commission;
    const fee = commission * (validator.fee ?? 0);
    return fee;
  }

  const historicData = useMemo(() => {
    const result: HistoricData[] = [];
    [...(queryData.data?.historic ?? [])].reverse().map(v => {
      let escherCommission = 0;
      if (activeValidator !== undefined) {
        escherCommission = calculateEscherFee(v.total_withdraw, activeValidator);
      } else {
        escherCommission = props.validators?.reduce((sum, validator) => sum + calculateEscherFee(v.total_withdraw, validator), 0) ?? 0;
      }
      result.push({
        reward_date: formatDate(v.reward_date, "D MMM"),
        total_commission_fee: formatDecimal(escherCommission, -decimals),
        total_commission_fee_formatted: formatNumber(formatDecimal(escherCommission, -decimals)),
        total_reward: formatDecimal(Number(v.total_fee), -decimals),
        total_reward_formatted: formatNumber(formatDecimal(Number(v.total_fee), -decimals)),
        total_revenue: formatDecimal(Number(v.total_fee) + escherCommission, -decimals),
        total_revenue_formatted: formatNumber(formatDecimal(Number(v.total_fee) + escherCommission, -decimals))
      });
    });

    return result;
  }, [queryData.data, activeValidator, props.validators]);

  const totalData = useMemo(() => {
    let result: TotalData | undefined = undefined;

    if (queryData.data?.total?.total_amount === undefined) return undefined;
    const totalResponse = queryData.data.total;

    let escherCommission = 0;
    if (activeValidator !== undefined) {
      escherCommission = calculateEscherFee(totalResponse.total_amount, activeValidator);
    } else {
      escherCommission = props.validators?.reduce((sum, validator) => sum + calculateEscherFee((totalResponse.total_amount ?? 0), validator), 0) ?? 0;
    }
    result = {
      total_commission_fee: formatDecimal(escherCommission, -decimals),
      total_commission_fee_formatted: formatNumber(formatDecimal(escherCommission, -decimals)),
      total_reward: formatDecimal(Number(totalResponse.total_fee), -decimals),
      total_reward_formatted: formatNumber(formatDecimal(Number(totalResponse.total_fee), -decimals)),
      total_revenue: formatDecimal(Number(totalResponse.total_fee) + escherCommission, -decimals),
      total_revenue_formatted: formatNumber(formatDecimal(Number(totalResponse.total_fee) + escherCommission, -decimals))
    }
    return result;
  }, [queryData.data, activeValidator, props.validators]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="text-sky-800 bg-sky-200 p-2 rounded text-sm">
          <p>Date: <b>{`${label}`}</b></p>
          <p>Total revenue: <b>{`${formatNumber(Number(payload[0].value))}`}</b> {symbol}</p>
        </div>
      );
    }

    return null;
  };

  const totalDataTab = useMemo(() => {
    switch (tab) {
      case "total": return totalData?.total_revenue_formatted;
      case "reward": return totalData?.total_reward_formatted;
      case "commission": return totalData?.total_commission_fee_formatted;
    }
  }, [tab, totalData]);

  useEffect(() => {
    if (tab !== "commission") {
      setActiveValidatorIndex(undefined);
    }
  }, [tab]);

  if (!props.validators) {
    return (
      <div className="flex-1 self-stretch flex flex-col bg-slate-800 text-slate-50 rounded p-2 md:p-8 mt-8 leading-none">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-0">
            <div className="text-xl font-bold" onClick={() => console.log({ queryData, historicData, totalData })}>Revenue</div>
            <div className="text-slate-400 text-sm">{TAB_DESCRIPTION[tab].description}</div>
          </div>
        </div>

        <div className="mt-4 w-full flex justify-center">
          <LdrsAnimation />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 self-stretch flex flex-col bg-slate-800 text-slate-50 rounded p-2 md:p-8 mt-8 leading-none">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-0">
          <div className="text-xl font-bold" onClick={() => console.log({ queryData, historicData, totalData })}>Revenue</div>
          <div className="text-slate-400 text-sm">{TAB_DESCRIPTION[tab].description}</div>
        </div>
        <div className="flex flex-col gap-4 items-end">
          <div className="flex gap-4 bg-slate-700 px-2 py-1.5 rounded leading-none text-sm font-semibold">
            <button
              className={`hover:bg-sky-800 p-2 cursor-pointer rounded ${tab === "total" ? "bg-sky-800" : ""}`}
              onClick={() => setTab("total")}
            >Total Revenue</button>
            <button
              className={`hover:bg-sky-800 p-2 cursor-pointer rounded ${tab === "reward" ? "bg-sky-800" : ""}`}
              onClick={() => setTab("reward")}
            >Reward</button>
            <button
              className={`hover:bg-sky-800 p-2 cursor-pointer rounded ${tab === "commission" ? "bg-sky-800" : ""}`}
              onClick={() => setTab("commission")}
            >Commission</button>
          </div>

          {tab === "commission" &&
            <Select
              value={(activeValidatorIndex !== undefined) ? activeValidatorIndex?.toString() : "none"}
              onValueChange={v => {
                console.log({ v });

                if (v === "none") {
                  setActiveValidatorIndex(undefined);
                } else {
                  setActiveValidatorIndex(Number(v));
                }
              }}
            >
              <SelectTrigger className="w-fit cursor-pointer">
                <SelectValue placeholder="--All Validators--" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">--All Validators--</SelectItem>
                {props.validators?.map((v, k) =>
                  <SelectItem key={k} value={k.toString()}>{v.data.description.moniker}</SelectItem>
                )}
              </SelectContent>
            </Select>
          }
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-4 mt-4">
        <div className="w-full md:w-[25%]">
          <div className="flex flex-col items-center gap-1 bg-emerald-900 text-emerald-50 rounded py-4">
            <div className="flex-1 flex flex-col items-center">
              {totalDataTab ?
                <>
                  <div className="text-3xl md:text-lg font-bold">{totalDataTab} {symbol}</div>
                </>
                :
                <LdrsAnimation />
              }
            </div>
            <div className="text-sm font-medium opacity-80">Total revenue</div>
          </div>
          {activeValidator &&
            <div className="flex flex-col bg-sky-100 text-slate-900 rounded p-4 mt-4 self-start leading-none overflow-x-scroll">
              <div className="font-medium text-sm text-gray-500">Validator</div>
              <div className="text-sky-700 font-bold">{activeValidator?.data.description.moniker}</div>

              <div className="font-medium text-sm text-gray-500 mt-4">Weight</div>
              <div className="text-sky-700 font-bold">{activeValidator?.weight}</div>

              <div className="font-medium text-sm text-gray-500 mt-4">Commission</div>
              <div className="text-sky-700 font-bold">{(activeValidator?.commission ?? 0) * 100}%</div>

              <div className="font-medium text-sm text-gray-500 mt-4">Escher Fee</div>
              <div className="text-sky-700 font-bold">{(activeValidator?.fee ?? 0) * 100}%</div>
            </div>
          }
        </div>
        <div className="w-full mt-8">
          {(historicData !== undefined) ?
            <ResponsiveContainer height={300}>
              <LineChart
                data={historicData}
                margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#000000" />
                <XAxis
                  dataKey="reward_date"
                />
                <Tooltip content={<CustomTooltip />} cursor={false} />
                <Line
                  dataKey={TAB_DESCRIPTION[tab].dataKey}
                  type="linear"
                  strokeWidth={3}
                  stroke="#10b981"
                />
              </LineChart>
            </ResponsiveContainer>
            :
            <div className="mt-8">
              <LdrsAnimation />
            </div>
          }
        </div>
      </div>
    </div>
  );
}

export default Revenue;