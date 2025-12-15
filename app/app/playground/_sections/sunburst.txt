import Card from "@/components/global/card";
import { ResponsiveSunburst } from '@nivo/sunburst';

interface SunburstNode {
    name: string;
    value?: number;
    color?: string;
    children?: SunburstNode[];
}

const colors = {
    colorRed: "#FA2C37",
    colorOrange: "#FF6900",
    colorGreen: "#7BCE00",
    colorBlue: "#00B8DB",
    colorPurple: "#8D51FF",
    colorPink: "#F6339A",
    colorGray: "#44556C",
    colorBlueDark: "#2B7FFF",

}

const dataToken = {
    name: 'root',
    children: [
        {
            name: 'Staked UNO',
            color: colors.colorRed,
            value: (80 - 30),
            children: [
                {
                    name: 'Liquid Staked',
                    color: colors.colorGreen,
                    value: 30,
                    children: []
                },
            ]
        }
    ]
};

const dataValue = {
    name: 'root',
    children: [
        {
            name: 'Staked UNO',
            color: colors.colorRed,
            value: (500 - 250),
            children: [
                {
                    name: 'eUNO',
                    color: colors.colorGreen,
                    children: [
                        {
                            name: 'Sepolia',
                            color: colors.colorPurple,
                            value: 50,
                        },
                        {
                            name: 'Holesky',
                            color: colors.colorOrange,
                            value: 50,
                        },
                        {
                            name: 'Union',
                            color: colors.colorGray,
                            value: 150,
                        },
                    ]
                },
            ]
        }
    ]
};

const Sunburst = () => {
    return (
        <Card className="items-start gap-2 text-sm max-w-[500px]">
            <div className="w-full flex justify-between items-center">
                <div className="text-xl font-semibold text-escher-gray900 dark:text-white">Sunburst demo</div>
            </div>
            <hr className="border border-t border-escher-gray200 dark:border-escher-darkblue_border w-full" />

            <div className="flex w-full gap-2">
                <div className="flex-1">
                    <div className="w-full aspect-square">
                        <ResponsiveSunburst
                            data={dataToken}
                            id="name"
                            value="value"
                            colors={(node) => (node.data as SunburstNode).color || '#ccc'}
                            inheritColorFromParent={false}
                            borderWidth={4}
                            cornerRadius={8}
                            enableArcLabels={false}
                            arcLabel="id" // Uses the node name as the label
                            arcLabelsSkipAngle={0} // Avoids cluttering by skipping small segments
                            arcLabelsTextColor={{ from: 'color', modifiers: [['darker', 2]] }}
                        />
                    </div>
                </div>
                <div className="flex-1 flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full bg-[${colors.colorRed}]`} />
                        <div className="font-semibold">Uno - Staked</div>
                    </div>

                    <div className="flex items-center gap-2 ml-6">
                        <div className={`w-4 h-4 rounded-full bg-[${colors.colorGreen}]`} />
                        <div className="font-semibold">Liquid Staked</div>
                    </div>
                </div>
            </div>

            <hr className="border border-t border-escher-gray200 dark:border-escher-darkblue_border w-full" />

            <div className="flex w-full gap-2">
                <div className="flex-1">
                    <div className="w-full aspect-square">
                        <ResponsiveSunburst
                            data={dataValue}
                            id="name"
                            value="value"
                            colors={(node) => (node.data as SunburstNode).color || '#ccc'}
                            inheritColorFromParent={false}
                            borderWidth={4}
                            cornerRadius={8}
                            enableArcLabels={false}
                            arcLabel="id" // Uses the node name as the label
                            arcLabelsSkipAngle={0} // Avoids cluttering by skipping small segments
                            arcLabelsTextColor={{ from: 'color', modifiers: [['darker', 2]] }}
                        />
                    </div>
                </div>
                <div className="flex-1 flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full bg-[${colors.colorRed}]`} />
                        <div className="font-semibold">Uno - Staked</div>
                    </div>

                    <div className="flex items-center gap-2 ml-6">
                        <div className={`w-4 h-4 rounded-full bg-[${colors.colorGreen}]`} />
                        <div className="font-semibold">eUNO</div>
                    </div>

                    <div className="flex items-center gap-2 ml-12">
                        <div className={`w-4 h-4 rounded-full bg-[${colors.colorPurple}]`} />
                        <div className="font-semibold">Sepolia</div>
                    </div>

                    <div className="flex items-center gap-2 ml-12">
                        <div className={`w-4 h-4 rounded-full bg-[${colors.colorOrange}]`} />
                        <div className="font-semibold">Holesky</div>
                    </div>

                    <div className="flex items-center gap-2 ml-12">
                        <div className={`w-4 h-4 rounded-full bg-[${colors.colorGray}]`} />
                        <div className="font-semibold">Union</div>
                    </div>
                </div>
            </div>

        </Card>
    );
}

export default Sunburst;