import { useQuery } from "@tanstack/react-query";
import Icon from "../global/icons";
import { useMemo } from "react";
import clsx from "clsx";

interface ParticipantData {
    address: string
    country_name: string
    country_code: string
}

function downloadCSV(data: ParticipantData[], filename = "escher-lucky-draw.csv") {
    const headers = ["Address", "Country Code", "Country"];

    const csvRows = [
        headers.join(","),
        ...data.map((row) => `${row.address},${row.country_code},${row.country_name}`),
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

const Participants = () => {

    const getData = async () => {
        const response = await fetch(`/api/lucky-draw/tnc-status`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        let result = await response.json();
        if (!response.ok) {
            throw new Error(result.errors?.[0]?.message || 'Failed to fetch data');
        }

        if (result.length === 0) {
            return [];
        }

        return result.data as ParticipantData[];
    }

    const queryData = useQuery({
        queryKey: ["luckydraw", "tnc-status"],
        queryFn: getData,
    });

    const countryDatas = useMemo(() => {
        if (queryData.data === undefined) return [];

        return Object.values(
            queryData.data.reduce((acc, curr) => {
                if (!acc[curr.country_name]) {
                    acc[curr.country_name] = { country_name: curr.country_name, count: 0 };
                }
                acc[curr.country_name].count++;
                return acc;
            }, {} as Record<string, { country_name: string; count: number }>)
        ).sort((a, b) => b.count - a.count);
    }, [queryData.data]);

    return (
        <div className="flex-1 self-stretch flex flex-col bg-slate-800 text-slate-50 rounded p-2 md:p-8 mt-8 leading-none">
            <div className="flex gap-4 items-center justify-between">
                <div
                    className="text-xl font-bold"
                    onClick={() => console.log(countryDatas)}
                >
                    Participants (user accepted the T&C)
                </div>
                <div className="bg-orange-500 text-orange-50 font-semibold rounded px-2 py-1">Total : {queryData.data?.length}</div>
                <div className="flex-1" />

                {queryData.data &&
                    <button
                        onClick={() => downloadCSV(queryData.data)}
                        className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-600 transition-all text-emerald-50 cursor-pointer text-sm font-semibold px-4 py-2 rounded"
                    >
                        <Icon type="FiDownload" />
                        <div>CSV</div>
                    </button>
                }
                <button
                    onClick={() => queryData.refetch()}
                    className="flex items-center gap-2 bg-sky-700 hover:bg-sky-600 transition-all text-sky-50 cursor-pointer text-sm font-semibold px-4 py-2 rounded"
                >
                    <Icon type="FiRefreshCw" className={clsx(
                        queryData.isLoading ? "animate-spin" : ""
                    )} />
                </button>
            </div>

            <div className="flex gap-4 items-start mt-4">
                <div className="w-1/2 border border-slate-500 rounded-lg">
                    <table className="w-full table-auto mt-4">
                        <thead>
                            <tr>
                                <th className="p-2 text-start">Address</th>
                                <th className="p-2 text-start">Country</th>
                            </tr>
                        </thead>
                        <tbody className="text-slate-300">
                            {queryData.data?.map((v, k) => (
                                <tr className="border-t border-slate-700" key={k}>
                                    <td className="p-3">{v.address}</td>
                                    <td className="p-3">{v.country_name}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="flex-1 border border-slate-500 rounded-lg">
                    <table className="w-full table-auto mt-4">
                        <thead>
                            <tr>
                                <th className="p-2 text-start">Country</th>
                                <th className="p-2 text-start">Count</th>
                            </tr>
                        </thead>
                        <tbody className="text-slate-300">
                            {countryDatas.map((v, k) => (
                                <tr className="border-t border-slate-700" key={k}>
                                    <td className="p-3">{v.country_name}</td>
                                    <td className="p-3">{v.count}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default Participants;