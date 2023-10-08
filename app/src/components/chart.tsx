import dayjs from "dayjs";
import { CartesianGrid, Legend, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts";
// This is called typescript types gymnastic when you want to create a type for your special case.
export type ChartDataPoints<T extends string, Y extends string = T extends 'date' ? never : T> = {
    date: number;
    keys: Y[];
    values: { [K in Y]?: number };
}

export interface LineData {
    key: string;
    stroke: string;
}

const dateFormatter = (date: Date) => {
    return dayjs(date).format('DD/MM/YYYY');
};

/**
 * date can't be used as a line name.
 */
export function Chart<T extends string>({ lines, data }: { lines: LineData[], data: ChartDataPoints<T>[] }) {
    return <LineChart
        width={730}
        height={250}
        data={data.map((d) => ({ date: d.date, ...d.values }))}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        {/* https://stackoverflow.com/questions/61016420/how-to-use-utc-date-string-as-recharts-axis-and-distribute-it-evenly */}
        <XAxis
            dataKey={'date'}
            domain={['dataMin', 'dataMax']}
            scale="time"
            type="number"
            tickFormatter={dateFormatter} />
        <YAxis domain={['dataMin', 'dataMax']} />
        <Tooltip labelFormatter={dateFormatter} />
        <Legend />
        {lines.map((line) =>
            <Line key={line.key} type="monotone" dataKey={line.key} stroke={line.stroke} />)}
    </LineChart>;
}

