"use client";

import Card from "@/components/global/card";
import Icon from "@/components/global/icons";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { FAQ_LIST } from "@/configs/faq";
import { FaqData } from "@/types/faq";
import clsx from "clsx";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { renderToString } from 'react-dom/server';

type Category = 'general' | 'ebaby' | 'eu' | 'security' | 'epoints' | 'luckydraw';

const Faq = ({ data }: { data: FaqData }) => {
    const [openItem, setOpenItem] = useState<string>();

    return (
        <Accordion type="single" collapsible value={openItem} onValueChange={setOpenItem}>
            <AccordionItem value="item-1" className="bg-escher-F5F6F8 dark:bg-escher-darkblue rounded-lg dark:border-none">
                <AccordionTrigger className="dark:text-white p-4 text-lg font-semibold flex items-start justify-between">
                    <div className="flex-1">{data.title}</div>
                    <div className="flex items-center justify-center rounded-full bg-escher-DBDCFF dark:bg-white p-1.5 aspect-square">
                        {openItem ?
                            <Image alt="" src="/icons/minus.svg" />
                            :
                            <Image alt="" src="/icons/plus-blue.svg" />
                        }
                    </div>
                </AccordionTrigger>
                <AccordionContent className="p-4 pt-0 text-escher-gray500 dark:text-white">
                    {data.content}
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
}

interface CategoryButtonProps {
    title: string
    category: Category
    curType: Category
    searchTerms?: string
    setCurType(val: Category): void
}

const CategoryButton = (props: CategoryButtonProps) => {
    return (
        <button
            className={clsx(
                "px-4 py-2 border-[#ffffff10] rounded-lg font-medium text-sm ",
                "bg-white dark:bg-escher-darkblue dark:hover:bg-escher-darkblue_2",
                "dark:text-white dark:hover:text-white hover:text-escher-electricblue",
                "border border-escher-e4e8ed dark:border-escher-darkblue_border",
                (props.curType === props.category && (!props.searchTerms || props.searchTerms === "")) ?
                    "text-escher-electricblue dark:text-white dark:bg-escher-dark_172c4d" :
                    "text-escher-text2 dark:text-white"
            )}
            onClick={() => props.setCurType(props.category)}
        >{props.title}</button>
    );
}

const Page = () => {
    const searchParams = useSearchParams();
    const defaultTab = searchParams.get("tab");
    const isValidTab = (tab: string | null): tab is 'general' | 'ebaby' | 'eu' | 'security' | 'epoints' | 'luckydraw' => {
        return ['general', 'ebaby', 'security', 'epoints', 'luckydraw'].includes(tab as string);
    };

    const [curType, setCurType] = useState<'general' | 'ebaby' | 'eu' | 'security' | 'epoints' | 'luckydraw'>(
        isValidTab(defaultTab) ? defaultTab : 'general'
    );
    const [searchTerms, setSearchTerms] = useState<string>("");
    const filteredFaqs = useMemo(() => {
        if (searchTerms && searchTerms !== "") {
            return FAQ_LIST.filter(v => renderToString(v.title).includes(searchTerms) || renderToString(v.content).includes(searchTerms));
        } else {
            return FAQ_LIST.filter(v => v.type === curType);
        }
    }, [curType, searchTerms]);

    return (
        <div className="container px-24 mx-auto py-8">
            <Card className="relative items-start pl-10 py-[66px]">
                <div className="absolute inset-0 bg-[url('/images/faq-question.svg')] dark:bg-[url('/images/faq-question-dark.svg')] bg-contain bg-no-repeat bg-position-[right_10%_center]" />
                <div className="font-extrabold text-[32px] text-escher-electricblue dark:text-white text-center leading-tight uppercase">Frequently Asked<br />Questions</div>
            </Card>

            <div className="flex items-center justify-between mt-4">
                <div className="flex-1 flex items-center gap-2">
                    <CategoryButton
                        category="general"
                        curType={curType}
                        searchTerms={searchTerms}
                        setCurType={setCurType}
                        title="General Question"
                    />

                    <CategoryButton
                        category="ebaby"
                        curType={curType}
                        searchTerms={searchTerms}
                        setCurType={setCurType}
                        title="eBABY"
                    />


                    <CategoryButton
                        category="eu"
                        curType={curType}
                        searchTerms={searchTerms}
                        setCurType={setCurType}
                        title="eU"
                    />

                    <CategoryButton
                        category="epoints"
                        curType={curType}
                        searchTerms={searchTerms}
                        setCurType={setCurType}
                        title="ePoints"
                    />

                    <CategoryButton
                        category="luckydraw"
                        curType={curType}
                        searchTerms={searchTerms}
                        setCurType={setCurType}
                        title="Lucky Draw"
                    />
                </div>
                <div className="w-[175px] h-[38px] flex items-center pl-4 bg-white dark:bg-escher-darkblue rounded-lg border border-escher-e4e8ed dark:border-escher-darkblue_border dark:text-white">
                    <Icon type="FiSearch" className="text-gray-500" />
                    <input
                        type="text"
                        className="w-full h-full pl-2 pr-4 rounded-lg bg-transparent"
                        placeholder="Search"
                        value={searchTerms}
                        onChange={e => {
                            setSearchTerms(e.target.value);
                        }}
                        onFocus={(e) => e.target.select()}
                    />
                </div>
            </div>

            <Card className="gap-4 mt-4 dark:bg-escher-dark_0c203d">
                {filteredFaqs.map((faq, k) => <Faq key={k} data={faq} />)}
            </Card>
        </div >
    );
}

export default Page;