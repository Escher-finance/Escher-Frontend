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
            <div className="text-sky-800 bg-sky-200 p-2 rounded text-sm">
                <p>Date: <b>{`${label}`}</b></p>
                <p>Total volumes: <b>{`${formatNumber(Number(payload[0].value))}`}</b> BABY</p>
            </div>
        );
    }

    return null;
};

interface Props {
    weight?: number
}

interface Data {
    bond_date: string
    total_bond_amount?: number
    total_bond_amount_formatted?: string
}

const BondsAmount = (props: Props) => {

    const getData = useCallback(async () => {
        const response = await fetch(`/api/bonds-amount`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        const responseJson = (await response.json() as { bond_date: string, total_bond_amount: number }[]);

        const result: Data[] = [];
        responseJson.map(v => {
            let amount = v.total_bond_amount;
            if (amount >= 9_999_000_000_000) {
                amount -= 9_999_000_000_000;
            }
            if (props.weight) {
                amount = props.weight / 100 * amount
            }

            result.push({
                bond_date: formatDate(v.bond_date, "D MMM"),
                total_bond_amount: formatDecimal(amount, -6),
                total_bond_amount_formatted: formatNumber(formatDecimal(amount, -6)),
            });
        });

        return result;
    }, [props.weight]);

    const queryData = useQuery({
        queryKey: ["bondsAmountHistory", props.weight],
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
            return {
                bond_date: date,
                total_bond_amount: data?.total_bond_amount,
                total_bond_amount_formatted: data?.total_bond_amount_formatted
            }
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
                            dataKey="bond_date"
                        />
                        <YAxis type="number" padding={{ top: 0, bottom: 0 }} width={30}
                            tickFormatter={(value) => {
                                return formatNumber(Number(value), true, 0);
                            }} />
                        <Tooltip content={<CustomTooltip />} cursor={false} />
                        <Bar
                            dataKey="total_bond_amount"
                            fill="#0ea5e9" label={({ x, y, value, width }) => (
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
                            activeBar={<Rectangle fill="#7dd3fc" stroke="0ea5e9" />}
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

export default BondsAmount;