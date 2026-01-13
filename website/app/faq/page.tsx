"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { FAQ_LIST, FaqData } from "@/config/faq";
import { useMemo, useState } from "react";
import { renderToString } from "react-dom/server";

const Faq = ({ data }: { data: FaqData }) => {
    const [openItem, setOpenItem] = useState<string>();

    return (
        <Accordion type="single" collapsible value={openItem} onValueChange={setOpenItem}>
            <AccordionItem value="item-1" className="">
                <AccordionTrigger className="p-4 text-xl font-semibold rounded-none flex items-start justify-between cursor-pointer hover:no-underline border-b hover:bg-gray-50">
                    {data.title}
                </AccordionTrigger>
                <AccordionContent className="p-4 text-text-light">
                    {data.content}
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
}

export default function Page() {
    const [curType, setCurType] = useState<'general' | 'ebaby' | 'security' | 'epoints'>('general');
    const [searchTerms, setSearchTerms] = useState<string>("");
    const filteredFaqs = useMemo(() => {
        if (searchTerms && searchTerms !== "") {
            return FAQ_LIST.filter(v => renderToString(v.title).includes(searchTerms) || renderToString(v.content).includes(searchTerms));
        } else {
            return FAQ_LIST.filter(v => v.type === curType);
        }
    }, [curType, searchTerms]);

    const classCache = <div className="list-outside list-decimal" />

    return (
        <div className="flex flex-col bg-white z-10">
            <div className="container mx-auto mt-4">
                <img src="/images/faq.svg" />
            </div>

            <div className="container max-w-[856px] mx-auto flex flex-col mt-10">
                <div className="relative">
                    <input
                        type="text"
                        className="w-full border border-gray-300 rounded-lg px-11 py-2"
                        placeholder="Search"
                        value={searchTerms}
                        onChange={e => {
                            setSearchTerms(e.target.value);
                        }}
                        onFocus={(e) => e.target.select()}
                    />
                    <div className="flex flex-col h-full items-start justify-center absolute top-0 left-4 bottom-0">
                        <img src="/icons/search-lg.svg" className="" />
                    </div>
                </div>

                <div className="flex items-center gap-2 text-text font-medium text-sm my-4">
                    <button
                        className={`border border-gray-300 rounded-full px-6 py-2 hover:bg-custom-e1e2ff hover:text-primary transition-all cursor-pointer ${(curType === "general" && (!searchTerms || searchTerms === "")) ? "text-primary bg-custom-ebecff" : "text-text bg-white"}`}
                        onClick={() => setCurType('general')}
                    >General Question</button>
                    <button
                        className={`border border-gray-300 rounded-full px-6 py-2 hover:bg-custom-e1e2ff hover:text-primary transition-all cursor-pointer ${(curType === "ebaby" && (!searchTerms || searchTerms === "")) ? "text-primary bg-custom-ebecff" : "text-text bg-white"}`}
                        onClick={() => setCurType('ebaby')}
                    >eBABY</button>
                    <button
                        className={`border border-gray-300 rounded-full px-6 py-2 hover:bg-custom-e1e2ff hover:text-primary transition-all cursor-pointer ${(curType === "security" && (!searchTerms || searchTerms === "")) ? "text-primary bg-custom-ebecff" : "text-text bg-white"}`}
                        onClick={() => setCurType('security')}
                    >Security & Risk</button>
                    <button
                        className={`border border-gray-300 rounded-full px-6 py-2 hover:bg-custom-e1e2ff hover:text-primary transition-all cursor-pointer ${(curType === "epoints" && (!searchTerms || searchTerms === "")) ? "text-primary bg-custom-ebecff" : "text-text bg-white"}`}
                        onClick={() => setCurType('epoints')}
                    >ePoints</button>
                </div>

                {filteredFaqs.map(faq => <Faq data={faq} />)}

                <div className="mb-10" />
            </div>
        </div>
    );
}
