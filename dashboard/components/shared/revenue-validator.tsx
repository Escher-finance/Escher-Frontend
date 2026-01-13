import LdrsAnimation from "@/components/global/ldrsAnimation";
import { APP_CONFIG } from "@/config/app";
import { months } from "@/lib/utils";
import { LiquidStaking, Validator } from "@/types/types";
import { formatDate, formatDecimal, formatNumber } from "@/utils/utils";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useCallback, useMemo, useState } from "react";
import Icon from "../global/icons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface Props {
  lst: LiquidStaking
  validators?: Validator[];
  activeValidator?: Validator;
}

interface RowData {
  date: string;
  amount: number;
  revenue: number;
  fee: number;
}

interface RevenueData {
  date: string;
  withdraw: number;
  withdraw_formatted: string;
  commission: number;
  commission_formatted: string;
  fee: number;
  fee_formatted: string;
  final: number;
  final_formatted: string;
}

function downloadCSV(data: RevenueData[], filename = "escher.csv") {
  const headers = ["Date", "Total amount", "Commission", "Escher Fee", "Final"];
  const subHeaders = ["", "total reward before commission", "amount * commission", "commission * fee", "validator's final revenue (commission - fee)"];
  const csvRows = [
    headers.join(","),
    subHeaders.join(","),
    ...data.map((row) => `${row.date},${row.withdraw},${row.commission},${row.fee},${row.final}`),
  ];
  const csvContent = csvRows.join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

const RevenueValidator = (props: Props) => {
  const [baseApi, decimals, symbol] = props.lst === "babylon" ?
    ["/api", 6, "BABY"] :
    ["/api/union", 18, "U"];

  const [activeValidatorIndex, setActiveValidatorIndex] = useState<number>(0);
  const activeValidator = useMemo(() => {
    if (props.activeValidator) return props.activeValidator;

    if (activeValidatorIndex === undefined) return undefined;
    return props.validators?.at(activeValidatorIndex);
  }, [activeValidatorIndex, props.validators, props.activeValidator]);

  const now = new Date();
  const [month, setMonth] = useState<number>(now.getMonth() + 1);
  const [year, setYear] = useState<number>(now.getFullYear());
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 2 }, (_, i) => currentYear - i);

  // Revenue
  const getRevenueData = useCallback(async () => {
    let url = baseApi +
      "/reward-withdraw-validator?" +
      `validator=${activeValidator?.address}`;

    if (month > 0) {
      const startDate = dayjs(`${year}-${month}-01`)
        .startOf("month")
        .format("YYYY-MM-DD");
      const endDate = dayjs(`${year}-${month}-01`)
        .endOf("month")
        .format("YYYY-MM-DD");
      url += `&date-from=${startDate}&date-to=${endDate}`;
    }

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const result = await response.json();
    return result as { reward_date: string; total_amount: number }[];
  }, [year, month, activeValidator]);

  const queryRevenueData = useQuery({
    queryKey: ["revenueValidator", month, year, activeValidator?.address],
    queryFn: getRevenueData,
    refetchInterval: APP_CONFIG.indexerInterfal,
  });

  const revenueData = useMemo(() => {
    if (queryRevenueData.data === undefined || !activeValidator) return [];

    const result: RevenueData[] = [];

    [...queryRevenueData.data].map((v) => {
      const amount = v.total_amount * (1 / (1 - activeValidator?.commission));
      const commission = amount * activeValidator?.commission;
      const fee = commission * activeValidator?.fee!;
      const final = commission - fee;

      result.push({
        date: formatDate(v.reward_date, "D MMM"),
        withdraw: formatDecimal(amount, -decimals),
        withdraw_formatted: formatNumber(formatDecimal(amount, -decimals)),
        commission: formatDecimal(commission, -decimals),
        commission_formatted: formatNumber(formatDecimal(commission, -decimals)),
        fee: formatDecimal(fee, -decimals),
        fee_formatted: formatNumber(formatDecimal(fee, -decimals)),
        final: formatDecimal(final, -decimals),
        final_formatted: formatNumber(formatDecimal(final, -decimals)),
      });
    });

    return result;
  }, [queryRevenueData.data, activeValidator, props.validators]);

  const allData = useMemo((): RowData[] => {
    const allDataMap = new Map<string, RowData>();

    for (const rev of revenueData) {
      if (!allDataMap.has(rev.date)) {
        allDataMap.set(rev.date, {
          date: rev.date,
          amount: 0,
          revenue: rev.commission,
          fee: rev.commission * (activeValidator?.fee ?? 1),
        });
      } else {
        allDataMap.get(rev.date)!.revenue += rev.commission;
        allDataMap.get(rev.date)!.fee +=
          rev.commission * (activeValidator?.fee ?? 1);
      }
    }

    return Array.from(allDataMap.values()).reverse();
  }, [revenueData, activeValidator]);

  if (!props.validators) {
    return (
      <div className="flex-1 self-stretch flex flex-col bg-slate-800 text-slate-50 rounded p-2 md:p-8 mt-8 leading-none">
        <div className="flex items-center justify-between">
          <div
            className="text-xl font-bold"
            onClick={() => console.log({ queryRevenueData })}
          >
            Validator revenue
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
      <div className="flex items-center justify-between">
        <div className="flex flex-col items-start gap-2">
          <div
            className="text-xl font-bold"
            onClick={() => console.log({ revenueData, allData })}
          >
            Validator revenue
          </div>
          <button
            onClick={() => downloadCSV(revenueData)}
            className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-600 transition-all text-emerald-50 cursor-pointer text-sm font-semibold px-4 py-2 rounded"
          >
            <Icon type="FiDownload" />
            <div>CSV</div>
          </button>
        </div>

        <div className="flex flex-col gap-2 items-end">
          {!props.activeValidator && (
            <Select
              value={activeValidatorIndex?.toString()}
              onValueChange={(v) => {
                setActiveValidatorIndex(Number(v));
              }}
            >
              <SelectTrigger className="w-fit cursor-pointer">
                <SelectValue placeholder="Validators" />
              </SelectTrigger>
              <SelectContent>
                {props.validators?.map((v, k) => (
                  <SelectItem key={k} value={k.toString()}>
                    {v.data.description.moniker}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <div className="flex items-center gap-2">
            <Select
              value={month.toString()}
              onValueChange={(v) => {
                setMonth(Number(v));
              }}
            >
              <SelectTrigger className="w-fit cursor-pointer">
                <SelectValue placeholder="Validators" />
              </SelectTrigger>
              <SelectContent>
                {months.map((month, k) => (
                  <SelectItem key={k} value={month.value.toString()}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={year.toString()}
              onValueChange={(v) => {
                setYear(Number(v));
              }}
            >
              <SelectTrigger className="w-fit cursor-pointer">
                <SelectValue placeholder="Validators" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year, k) => (
                  <SelectItem key={k} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <table className="w-full table-auto mt-4">
        <thead>
          <tr>
            <th className="p-2 text-start">Date</th>
            <th className="p-2 text-start">
              Total amount <br />
              <span className="font-normal text-xs">
                total reward before commission
              </span>
            </th>
            <th className="p-2 text-start">
              Commission
              <br />
              <span className="font-normal text-xs">
                amount * commission (
                {(activeValidator?.commission ?? 0) * 100}%)
              </span>
            </th>
            <th className="p-2 text-start">
              Escher Fee
              <br />
              <span className="font-normal text-xs">
                commission * fee ({(activeValidator?.fee ?? 0) * 100}%)
              </span>
            </th>
            <th className="p-2 text-start">
              Final
              <br />
              <span className="font-normal text-xs">
                validator's final revenue <br />
                (commission - fee)
              </span>
            </th>
          </tr>
        </thead>
        <tbody className="text-slate-300">
          {revenueData.map((v, k) => (
            <tr className="border-t border-slate-700" key={k}>
              <td className="p-3">{v.date}</td>
              <td className="p-3">{v.withdraw_formatted} {symbol}</td>
              <td className="p-3">{v.commission_formatted} {symbol}</td>
              <td className="p-3">{v.fee_formatted} {symbol}</td>
              <td className="p-3">{v.final_formatted} {symbol}</td>
            </tr>
          ))}
          <tr className="border-t border-slate-700">
            <td className="p-3"></td>
            <td className="p-3 font-bold">
              {formatNumber(
                revenueData.reduce((sum, cur) => (sum += cur.withdraw), 0)
              )}{" "}
              {symbol}
            </td>
            <td className="p-3 font-bold">
              {formatNumber(revenueData.reduce((sum, cur) => (sum += cur.commission), 0))}{" "}
              {symbol}
            </td>
            <td className="p-3 font-bold">
              {formatNumber(revenueData.reduce((sum, cur) => (sum += cur.fee), 0))}{" "}
              {symbol}
            </td>
            <td className="p-3 font-bold">
              {formatNumber(revenueData.reduce((sum, cur) => (sum += cur.final), 0))}{" "}
              {symbol}
            </td>
          </tr>
        </tbody>
      </table>

      {queryRevenueData.isPending && (
        <div className="mt-4 flex justify-center">
          <LdrsAnimation />
        </div>
      )}

      {allData.length === 0 && !queryRevenueData.isPending && (
        <div className="text-center mt-4 text-slate-500">--No data--</div>
      )}
    </div>
  );
};

export default RevenueValidator;
