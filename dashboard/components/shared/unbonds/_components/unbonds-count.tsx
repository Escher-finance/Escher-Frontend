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
                <p>Total unbonds: <b>{`${payload[0].value}`}</b></p>
            </div>
        );
    }

    return null;
};

const UnbondsCount = () => {

    const getData = useCallback(async () => {
        const response = await fetch(`/api/unbonds`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        const responseJson = (await response.json() as { unbond_date: string, total_unbond: number }[]);
        const result: { unbond_date: string, total_unbond: number }[] = [];
        responseJson.map(v => {
            result.push({
                unbond_date: formatDate(v.unbond_date, "D MMM"),
                total_unbond: Number(v.total_unbond)
            });
        });

        return result;
    }, []);

    const queryData = useQuery({
        queryKey: ["unbondshistory"],
        queryFn: getData,
        refetchInterval: APP_CONFIG.indexerInterfal
    });

    const data = useMemo(() => {
        if (!queryData.data) return undefined;

        const today = dayjs();
        const dbMap = new Map(queryData.data?.map(item => [item.unbond_date, item]));

        const result = Array.from({ length: 30 }, (_, i) => {
            const date = today.subtract(i, 'day').format('D MMM')
            return {
                unbond_date: date,
                total_unbond: dbMap.get(date)?.total_unbond,
            }
        }).reverse()

        return result

    }, [queryData.data]);

    const maxData = useMemo(() => {
        if (!queryData.data) return 0;
        return Math.max(...queryData.data.map(v => v.total_unbond)) + 5;
    }, [queryData.data]);

    return (
        <div className="w-full h-full mt-8">
            {(data !== undefined) ?
                <ResponsiveContainer height={450}>
                    <BarChart
                        data={data}
                        margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#000000" />
                        <XAxis
                            dataKey="unbond_date"
                        />
                        <YAxis domain={[0, maxData]} type="number" padding={{ top: 0, bottom: 0 }} width={30} />
                        <Tooltip content={<CustomTooltip />} cursor={false} />
                        <Bar
                            dataKey="total_unbond"
                            fill="#f97316"
                            label={{ position: 'top' }}
                            activeBar={<Rectangle fill="#fdba74" stroke="#f97316" />}
                        />
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

export default UnbondsCount;