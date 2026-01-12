"use client";

import LdrsAnimation from "@/components/global/ldrsAnimation";
import { APP_CONFIG } from "@/config/app";
import { formatDate, formatDecimal, formatNumber } from "@/utils/utils";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useCallback, useMemo } from "react";
import { Bar, BarChart, CartesianGrid, Rectangle, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="text-amber-800 bg-amber-200 p-2 rounded text-sm">
                <p>Date: <b>{`${label}`}</b></p>
                <p>Total volumes: <b>{`${formatNumber(Number(payload[0].value))}`}</b> U</p>
            </div>
        );
    }
    return null;
};

interface Props { weight?: number }

interface Data {
    unbond_date: string
    total_unbond_amount?: number
    total_unbond_amount_formatted?: string
}

const UnionUnbondsAmount = (props: Props) => {
    const getData = useCallback(async () => {
        const response = await fetch(`/api/union/unbonds-amount`, { headers: { 'Content-Type': 'application/json' } });
        const responseJson = (await response.json() as { unbond_date: string, total_unbond_amount: string }[]);

        const result: Data[] = [];
        responseJson.map(v => {
            let amount = Number(v.total_unbond_amount);
            if (props.weight) amount = props.weight / 100 * amount;
            result.push({
                unbond_date: formatDate(v.unbond_date, "D MMM"),
                total_unbond_amount: formatDecimal(amount, -18),
                total_unbond_amount_formatted: formatNumber(formatDecimal(amount, -18)),
            });
        });
        return result;
    }, [props.weight]);

    const queryData = useQuery({
        queryKey: ["unionUnbondsAmountHistory", props.weight],
        queryFn: getData,
        refetchInterval: APP_CONFIG.indexerInterfal
    });

    const data = useMemo((): Data[] | undefined => {
        if (!queryData.data) return undefined;
        const today = dayjs();
        const dbMap = new Map(queryData.data?.map(item => [item.unbond_date, item]));
        const result: Data[] = Array.from({ length: 30 }, (_, i) => {
            const date = today.subtract(i, 'day').format('D MMM');
            const data = dbMap.get(date);
            return { unbond_date: date, total_unbond_amount: data?.total_unbond_amount, total_unbond_amount_formatted: data?.total_unbond_amount_formatted };
        }).reverse();
        return result
    }, [queryData.data]);

    return (
        <div className="w-full h-full mt-8">
            {(data !== undefined) ?
                <ResponsiveContainer height={450}>
                    <BarChart
                        data={data}
                        margin={{ top: 0, right: 0, bottom: 0, left: 20 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#000000" />
                        <XAxis
                            dataKey="unbond_date"
                        />
                        <YAxis type="number" padding={{ top: 0, bottom: 0 }} width={30}
                            tickFormatter={(value) => {
                                return formatNumber(Number(value), true, 0);
                            }} />
                        <Tooltip content={<CustomTooltip />} cursor={false} />
                        <Bar
                            dataKey="total_unbond_amount"
                            fill="#f97316" label={({ x, y, value, width }) => (
                                <text
                                    x={x! + width! / 2}
                                    y={y! - 5}
                                    fill="#fff"
                                    textAnchor="middle"
                                    fontSize={12}
                                >
                                    {value ? formatNumber(Number(value)) : ""}
                                </text>
                            )}
                            activeBar={<Rectangle fill="#fdba74" stroke="#f97316" />}
                        />
                    </BarChart>
                </ResponsiveContainer>
                :
                <div className="mt-8"><LdrsAnimation /></div>
            }
        </div>
    );
}

export default UnionUnbondsAmount;


