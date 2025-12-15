import Button from "@/components/global/button";
import Card from "@/components/global/card";
import { useBabylonDust, useBabylonDustRecovery } from "@/hooks/liquidStakingContract/babylon/dust";
import { getUnionPacketStatus } from "@/hooks/unionIndexer/packet";

export const Dust = () => {
    const queryUnionDust = useBabylonDust();
    const { dustRecovery } = useBabylonDustRecovery();

    const submit = async () => {
        if (!queryUnionDust.data?.amountRaw) throw "No dust";

        const res = await dustRecovery({
            dustAmountRaw: queryUnionDust.data?.amountRaw
        });

        console.log({ res });

    }

    const test = async () => {
        const res = await getUnionPacketStatus("0x700ea1bdd03da4063d1955cace7d69fc4f0f6b0aeb256a545b6c47d09acc928a");
        console.log({ res });
    }

    return (
        <Card className="items-start gap-2 text-sm">
            <div className="w-full flex justify-between items-center">
                <div className="text-xl font-semibold text-escher-gray900 dark:text-white">eBaby Dust_</div>
            </div>
            <hr className="border border-t border-escher-gray200 dark:border-escher-darkblue_border w-full mb-4" />
            <div>
                Dust : {queryUnionDust.data?.amount ?? "-"} <br />
                Dust raw : {queryUnionDust.data?.amountRaw.toString() ?? "-"} <br />
                <hr />
                Dust chain : {queryUnionDust.data?.chainDust.toString() ?? "-"} <br />
                Local dust : {queryUnionDust.data?.localDust ?? "-"} <br />
            </div>
            <Button onClick={() => console.log(queryUnionDust.data)} title="Log" />
            <Button onClick={submit} title="Recover dust" />
            <Button onClick={() => queryUnionDust.refetch()} title="Refetch dust" />
            <Button onClick={test} title="Test" />
        </Card>
    );
}