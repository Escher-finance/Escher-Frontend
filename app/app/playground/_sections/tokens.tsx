import Button from "@/components/global/button";
import Card from "@/components/global/card";

export const Tokens = () => {
    return (
        <Card className="items-start gap-0 text-sm">
            <div className="w-full flex justify-between items-center">
                <div className="text-xl font-semibold text-escher-gray900 dark:text-white">Defi</div>
            </div>
            <hr className="border border-t border-escher-gray200 dark:border-escher-darkblue_border w-full mb-4" />
            <Button onClick={() => console.log()} title="log" />
        </Card>
    );
}