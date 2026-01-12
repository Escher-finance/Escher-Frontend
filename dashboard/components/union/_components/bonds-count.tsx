"use client";

import LdrsAnimation from "@/components/global/ldrsAnimation";
import { APP_CONFIG } from "@/config/app";
import { formatDate } from "@/utils/utils";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useCallback, useMemo } from "react";
import { Bar, BarChart, CartesianGrid, Rectangle, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="text-sky-800 bg-sky-200 p-2 rounded text-sm">
                <p>Date: <b>{`${label}`}</b></p>
                <p>Total bonds: <b>{`${payload[0].value}`}</b></p>
            </div>
        );
    }
    return null;
};

interface Data {
    bond_date: string
    total_bond?: number
}

const UnionBondsCount = () => {
    const getData = useCallback(async () => {
        const response = await fetch(`/api/union/bonds`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        const responseJson = (await response.json() as { bond_date: string, total_bond: number }[]);
        const result: Data[] = [];
        responseJson.map(v => {
            result.push({
                bond_date: formatDate(v.bond_date, "D MMM"),
                total_bond: Number(v.total_bond)
            });
        });
        return result;
    }, []);

    const queryData = useQuery({
        queryKey: ["unionBondsHistory"],
        queryFn: getData,
        refetchInterval: APP_CONFIG.indexerInterfal
    });

    const data = useMemo((): Data[] | undefined => {
        if (!queryData.data) return undefined;
        const today = dayjs();
        const dbMap = new Map(queryData.data?.map(item => [item.bond_date, item]));
        const result: Data[] = Array.from({ length: 30 }, (_, i) => {
            const date = today.subtract(i, 'day').format('D MMM');
            const data = dbMap.get(date);
            return { bond_date: date, total_bond: data?.total_bond };
        }).reverse();
        return result
    }, [queryData.data]);

    const maxData = useMemo(() => {
        if (!queryData.data) return 0;
        return Math.max(...queryData.data.map(v => (v.total_bond ?? 0))) + 5;
    }, [queryData.data]);

    return (
        <div className="w-full h-full mt-8">
            {(data !== undefined) ?
                <ResponsiveContainer height={450}>
                    <BarChart data={data} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#000000" />
                        <XAxis dataKey="bond_date" />
                        <YAxis domain={[0, maxData]} type="number" padding={{ top: 0, bottom: 0 }} width={30} />
                        <Tooltip content={<CustomTooltip />} cursor={false} />
                        <Bar dataKey="total_bond" fill="#0ea5e9" label={{ position: 'top' }} activeBar={<Rectangle fill="#7dd3fc" stroke="0ea5e9" />} />
                    </BarChart>
                </ResponsiveContainer>
                :
                <div className="mt-8">
                    <LdrsAnimation />
                </div>
            }
        </div>
    );
}

export default UnionBondsCount;


