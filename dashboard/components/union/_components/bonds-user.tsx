import Icon from "@/components/global/icons";
import LdrsAnimation from "@/components/global/ldrsAnimation";
import { formatDecimal, formatNumber } from "@/utils/utils";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";

interface Data {
    staker: string
    amount: number
    count: number
}

const UnionBondsUsers = () => {

    const [address, setAddress] = useState<string>("");
    const [debouncedAddress, setDebouncedAddress] = useState(address);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedAddress(address.toLowerCase());
        }, 500);

        return () => {
            clearTimeout(handler);
        };
    }, [address]);

    const getData = useCallback(async () => {
        const url = (debouncedAddress && debouncedAddress !== "")
            ? `/api/union/bonds-user?address=${encodeURIComponent(debouncedAddress)}`
            : `/api/union/bonds-user`;

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        const result = (await response.json() as Data[]);

        return result;
    }, [debouncedAddress]);

    const queryData = useQuery({
        queryKey: ["bondsUser", debouncedAddress],
        queryFn: getData,
    });

    return (
        <div className="w-full h-full mt-8 overflow-x-auto">
            <div className="relative w-1/2">
                <div className="flex justify-center items-center absolute left-2 top-0 bottom-0">
                    <Icon type="FiSearch" className="text-sky-700" />
                </div>
                <input
                    type="text"
                    placeholder="user / staker address"
                    className="bg-sky-100 rounded pl-8 pr-4 py-2 text-sky-900 w-full"
                    value={address}
                    onChange={v => setAddress(v.target.value ?? "")}
                />
            </div>
            <table className="w-full table-auto mt-4">
                <thead>
                    <tr>
                        <th className="p-2 text-start">No</th>
                        <th className="p-2 text-start">User / staker</th>
                        <th className="p-2 text-start">Bonds total amount</th>
                        <th className="p-2 text-start">Bonds count</th>
                    </tr>
                </thead>
                <tbody className="text-slate-300">
                    {queryData.data?.map((v, k) =>
                        <tr key={k} className="border-t border-slate-700">
                            <td className="p-3">{k + 1}</td>
                            <td className="p-3">{v.staker}</td>
                            <td className="p-3">{formatNumber(formatDecimal(v.amount, -18), false, 0)} U</td>
                            <td className="p-3">{v.count}</td>
                        </tr>
                    )}
                </tbody>
            </table>
            {queryData.isLoading &&
                <div className="mt-4">
                    <LdrsAnimation />
                </div>
            }
        </div >
    );
}

export default UnionBondsUsers;