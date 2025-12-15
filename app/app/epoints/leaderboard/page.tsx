"use client";

import Icon from "@/components/global/icons";
import LdrsAnimation from "@/components/global/ldrsAnimation";
import NoData from "@/components/global/noData";
import { useTheme } from "@/components/providers/themeProvider";
import { useLeaderboard } from "@/hooks/usePoints";
import { shortenAddress } from "@/lib/text";
import { formatNumber } from "@/lib/utils";
import clsx from "clsx";
import Link from "next/link";
import { useState } from "react";

const Page = () => {
    const { themeIsDark } = useTheme();
    const [address, setAddress] = useState<string>();
    const [queryType, setQueryType] = useState<string>("all");
    const leaderBoard = useLeaderboard({
        address: address,
        type: queryType
    });

    return (
        <div className="w-full max-w-[1440px] mx-auto flex flex-col text-escher-black dark:text-white px-6 py-10">
            <div className="w-full bg-white dark:bg-escher-darkblue border border-escher-E4E8ED dark:border-escher-darkblue_border rounded-lg flex items-center justify-start p-6 h-[200px] bg-[url('/images/point-banner.png')] bg-right bg-contain bg-no-repeat">
                <div className="font-bold text-[40px] leading-none" onClick={() => console.log({ leaderBoard })}>ePoints Program</div>
            </div>
            <div className="w-full flex items-start gap-6 mt-6">
                <Link href={"/epoints"} className="flex items-center gap-2 text-escher-electricblue dark:text-white font-medium mt-2 hover:underline">
                    <Icon type="FaArrowLeft" size="sm" />
                    <div>back</div>
                </Link>
                <div className="flex-1 flex items-center justify-center">
                    <div className="flex flex-col gap-4">
                        <div className="flex gap-2 relative">
                            <input
                                type="text"
                                placeholder="Search address"
                                className="p-2 pl-10 border border-gray-300 dark:border-escher-darkblue_border rounded-lg w-fit dark:bg-escher-darkblue dark:text-white"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                            />
                            <div className="absolute left-0 top-0 bottom-0 flex items-center justify-center pl-4">
                                <Icon type="FiSearch" className="text-gray-400" />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 bg-gray-100 dark:bg-escher-darkblue_2 p-1 rounded self-start text-sm font-medium leading-none">
                            <FilterButton
                                onclick={() => setQueryType("all")}
                                title="All"
                                type="all"
                                curType={queryType}
                            />
                            <FilterButton
                                onclick={() => setQueryType("cosmos")}
                                title="Cosmos"
                                type="cosmos"
                                curType={queryType}
                            />
                            <FilterButton
                                onclick={() => setQueryType("evm")}
                                title="EVM"
                                type="evm"
                                curType={queryType}
                            />
                        </div>

                        <div className="w-[640px] bg-white dark:bg-escher-dark_0c203d border border-escher-dedfff dark:border-escher-darkblue_border rounded-lg overflow-hidden flex flex-col gap-2">
                            <table className="w-full table-auto">
                                <thead className="text-escher-electricblue dark:text-white">
                                    <tr className="text-left text-sm bg-escher-fafbfc dark:bg-escher-darkblue_2">
                                        <th className="font-medium p-4">#</th>
                                        <th className="font-medium p-4"></th>
                                        <th className="font-medium p-4">USER</th>
                                        <th className="font-medium p-4 text-end">TOTAL POINTS</th>
                                    </tr>
                                </thead>
                                {leaderBoard.isFetched && ((leaderBoard.data?.length ?? 0) > 0) &&
                                    <tbody className="py-2">
                                        {leaderBoard.data?.map((v, key) =>
                                            <tr
                                                key={key}
                                                className={clsx(
                                                    "font-semibold text-sm border-t border-escher-dedfff dark:border-escher-darkblue_border",
                                                    v.rank <= 3 && "bg-escher-electricblue bg-opacity-[0.03]"
                                                )}
                                            >
                                                <td className="p-4">{(v.total_points ?? 0) > 0 ? v.rank : "-"}</td>
                                                <td className="">
                                                    <div className="flex items-end justify-end">
                                                        {v.rank <= 3 && (v.total_points ?? 0) > 0 &&
                                                            <Image alt="" src={themeIsDark ? `/images/points/medal-${v.rank}-dark.svg` : `/images/points/medal-${v.rank}.svg`} />
                                                        }
                                                    </div>
                                                </td>
                                                <td className="p-4">{shortenAddress(v.user_address, 10, 10)}</td>
                                                <td className="p-4 text-end">{formatNumber((v.total_points ?? 0), false, 0)}</td>
                                            </tr>
                                        )}
                                    </tbody>
                                }
                            </table>

                            {!leaderBoard.isFetched &&
                                <div className="py-4 text-center w-full">
                                    <LdrsAnimation />
                                </div>
                            }

                            {leaderBoard.isFetched && ((leaderBoard.data?.length ?? 0) === 0) &&
                                <NoData />
                            }
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Page;

const FilterButton = (props: { onclick(): void, curType: string, type: string, title: string }) => {
    return (
        <button
            onClick={props.onclick}
            className={clsx(
                "bg-white hover:bg-escher-electricblue_light2 transition-all rounded border border-gray-200 py-2 px-3",
                "dark:bg-escher-darkblue_2 dark:border-escher-darkblue_border",
                props.curType === props.type ? "text-escher-electricblue dark:text-white dark:bg-gray-400" : "text-gray-400"
            )}
        >{props.title}</button>
    );
}