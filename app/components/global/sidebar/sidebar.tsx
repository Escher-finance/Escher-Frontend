import { useTheme } from "@/components/providers/themeProvider";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { APP_CONFIG } from "@/configs/app";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import Icon from "../icons";
import SidebarMenu from "./sidebar-menu";
import SidebarMenuMulti from "./sidebar-menu-multi";
import { useEscher } from "@/components/providers/escherProvider";

const ExtraLink = (props: { url: string, text: string, image: string }) => {
    return (
        <Link href={props.url} target="_blank" className="flex items-center gap-3 px-4 py-2 rounded bg-escher-gray100 dark:bg-escher-dark_0c203d hover:bg-escher-gray200 dark:hover:bg-escher-darkblue_2 transition-all">
            <Image src={props.image} width={18} height={18} alt={props.text} />
            <div className="text-sm font-semibold text-escher-777e90 dark:text-white">{props.text}</div>
        </Link>
    );
}

const Sidebar = () => {
    const { isSafe } = useEscher();
    const { themeIsDark, toggleTheme } = useTheme();
    const pathName = usePathname();
    const searchParams = useSearchParams();
    const tab = searchParams.get("tab");

    return (
        <section className="bg-white dark:bg-escher-darkblue_1 flex flex-col px-4 py-7 border-r border-escher-gray200 dark:border-escher-darkblue_border min-w-[250px]">
            <Link href={'/'} className="px-4">
                <Image src={themeIsDark ? '/images/escher-transparent-white.svg' : '/images/escher-transparent.svg'} alt="" width={25} height={25} className="w-auto h-[25px]" />
            </Link>
            <div className="flex-1 flex flex-col w-full mt-8 gap-2">
                <SidebarMenu
                    url={"/"}
                    title={"Home"}
                    icon={"/icons/sidebar/home_gray.svg"}
                    iconActive={"/icons/sidebar/home_blue.svg"}
                    iconDarkActive={"/icons/sidebar/home_white.svg"}
                    active={pathName === '/'}
                />

                <SidebarMenu
                    url={"/liquid-staking"}
                    title={"Staking"}
                    active={["/liquid-staking", "/native-staking"].includes(pathName)}
                    icon={"/icons/sidebar/staking_icon_2.svg"}
                    iconActive={"/icons/sidebar/staking_icon_2-blue.svg"}
                    iconDarkActive={"/icons/sidebar/stake-white.svg"}
                />

                <SidebarMenu
                    url={"/transactions"}
                    title={"Transactions"}
                    active={pathName === '/transactions'}
                    icon={"/icons/sidebar/transactions_icon_2.svg"}
                    iconActive={"/icons/sidebar/transactions_icon_2-blue.svg"}
                    iconDarkActive={"/icons/sidebar/transactions-white.svg"}
                />

                {(!APP_CONFIG.networkIsTestnet) && <>
                    {!isSafe &&
                        <SidebarMenu
                            url={"/bridge"}
                            title={"Bridge"}
                            active={pathName === '/bridge'}
                            icon={"/icons/sidebar/bridge-gray.svg?v=2"}
                            iconActive={"/icons/sidebar/bridge-blue.svg"}
                            iconDarkActive={"/icons/sidebar/bridge-white.svg"}
                        />
                    }

                    <SidebarMenu
                        url={"/epoints"}
                        title={"ePoints"}
                        active={["/epoints", "/epoints/leaderboard"].includes(pathName)}
                        icon={"/icons/sidebar/epoints.svg"}
                        iconActive={"/icons/sidebar/epoints-blue.svg"}
                        iconDarkActive={"/icons/sidebar/epoints-white-1.svg"}
                    />

                    <SidebarMenuMulti
                        child={[
                            {
                                title: "Swap",
                                url: "/defi-hub?tab=swap",
                                active: ["/defi-hub"].includes(pathName) && tab === "swap",
                                enabled: true,
                            },
                            {
                                title: "Liquidity Pools",
                                url: "/defi-hub?tab=lp",
                                active: ["/defi-hub"].includes(pathName) && tab === "lp",
                                enabled: true,
                            },
                            {
                                title: "Vaults (coming soon)",
                                url: "#",
                                active: ["/defi-hub"].includes(pathName) && tab === "restaking",
                                enabled: false,
                            },
                        ]}
                        title={"DeFi Hub"}
                        icon={"/icons/sidebar/assets.svg"}
                        iconActive={"/icons/sidebar/assets-blue.svg"}
                        iconDarkActive={"/icons/sidebar/assets-white.svg"}
                        active={pathName === '/defi-hub'}
                    />

                    <SidebarMenu
                        url={"/apps"}
                        title={"Apps"}
                        icon={"/icons/sidebar/apps_icon_2.svg"}
                        iconActive={"/icons/sidebar/apps_icon_2-blue.svg"}
                        iconDarkActive={"/icons/sidebar/apps-white.svg"}
                        active={pathName === '/apps'}
                    />

                    <SidebarMenu
                        url={"/faq"}
                        title={"FAQs"}
                        icon={"/icons/sidebar/faqs_icon_2.svg"}
                        iconActive={"/icons/sidebar/faqs_icon_2-blue.svg"}
                        iconDarkActive={"/icons/sidebar/faq-white.svg"}
                        active={pathName === '/faq'}
                    />
                </>}

                {APP_CONFIG.enablePlayground &&
                    <SidebarMenu
                        url={"/playground"}
                        title={"Playground"}
                        icon={"/icons/sidebar/faqs_icon_2.svg"}
                        iconActive={"/icons/sidebar/faqs_icon_2-blue.svg"}
                        iconDarkActive={"/icons/sidebar/faqs-white.svg"}
                    />
                }
            </div>

            <div className="flex justify-between items-center">
                {(APP_CONFIG.enableTheme) &&
                    <button
                        className="
                        flex gap-1 rounded-full border p-1 transition-all
                        bg-escher-f5f5ff
                        hover:bg-escher-dedfff dark:hover:bg-escher-darkblue_border
                        border-escher-dedfff dark:border-escher-darkblue_border dark:bg-escher-darkblue_border
                    "
                        onClick={toggleTheme}
                    >
                        <div
                            className="
                            rounded-full aspect-square p-1 text-escher-electricblue
                            dark:bg-white
                        "
                        >
                            <Icon type="AiOutlineMoon" />
                        </div>

                        <div
                            className="
                            rounded-full aspect-square p-1 text-white
                            bg-escher-electricblue dark:bg-transparent
                        "
                        >
                            <Icon type="AiOutlineSun" />
                        </div>
                    </button>
                }

                <Popover>
                    <PopoverTrigger className="text-escher-electricblue dark:text-white">
                        <Icon type="BsThreeDots" size="lg" />
                    </PopoverTrigger>
                    <PopoverContent className="p-2 rounded-lg flex flex-col gap-2 border border-escher-dedfff dark:border-escher-darkblue_border dark:bg-escher-darkblue ml-4">
                        <ExtraLink
                            url={APP_CONFIG.urls.discordSupport}
                            text={"Support"}
                            image={"/icons/customer-support.svg"}
                        />
                        <ExtraLink
                            url={APP_CONFIG.urls.privacyPolicy}
                            text={"Privacy Policy"}
                            image={"/icons/security-block.svg"}
                        />
                        <ExtraLink
                            url={APP_CONFIG.urls.docs}
                            text={"Escher Docs"}
                            image={"/icons/assets_icon.svg"}
                        />
                    </PopoverContent>
                </Popover>
            </div>
        </section>
    );
}

export default Sidebar;