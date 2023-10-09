import { CartesianGrid, Legend, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts";
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";
import { dayFormatter } from "~/utils/dayjs";
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


const dataFormatter = (value: ValueType, key: NameType, unit:string) => {
    return `clientId, ${value.toString()}${unit} : reading`;
};

/**
 * date can't be used as a line name.
 */
export function Chart<T extends string>({ lines, unit, data }: { lines: LineData[], unit: string, data: ChartDataPoints<T>[] }) {
    // TODO: Find a way to find the available width to render and change the width dynamic.
    // Maybe: https://stackoverflow.com/questions/49058890/how-to-get-a-react-components-size-height-width-before-render
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
            tickFormatter={dayFormatter} />
        <YAxis domain={['dataMin', 'dataMax']} />
        <Tooltip
            // TODO: Find a way to have full control over the tooltip.
            formatter={(v, k) => dataFormatter(v, k, unit)}
            labelFormatter={dayFormatter}
        />
        <Legend />
        {lines.map((line) =>
            <Line key={line.key} type="monotone" dataKey={line.key} stroke={line.stroke} />)}
    </LineChart>;
}

// // Data retrieved https://en.wikipedia.org/wiki/List_of_cities_by_average_temperature
// Highcharts.chart('container', {
//     chart: {
//         type: 'line'
//     },
//     title: {
//         text: 'Monthly Average Temperature'
//     },
//     subtitle: {
//         text: 'Source: ' +
//             '<a href="https://en.wikipedia.org/wiki/List_of_cities_by_average_temperature" ' +
//             'target="_blank">Wikipedia.com</a>'
//     },
//     xAxis: {
//         categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
//     },
//     yAxis: {
//         title: {
//             text: 'Temperature (°C)'
//         }
//     },
//     plotOptions: {
//         line: {
//             dataLabels: {
//                 enabled: true
//             },
//             enableMouseTracking: false
//         }
//     },
//     series: [{
//         name: 'Reggane',
//         data: [16.0, 18.2, 23.1, 27.9, 32.2, 36.4, 39.8, 38.4, 35.5, 29.2,
//             22.0, 17.8]
//     }, {
//         name: 'Tallinn',
//         data: [-2.9, -3.6, -0.6, 4.8, 10.2, 14.5, 17.6, 16.5, 12.0, 6.5,
//             2.0, -0.9]
//     }]
// });


// // install (please try to align the version of installed @nivo packages)
// // yarn add @nivo/line
// import { ResponsiveLine, type Serie } from '@nivo/line'


// export const Chart = ({ data }: { data: Serie[] }) => (
//     <ResponsiveLine
//         data={data}
//         // margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
//         xScale={{ type: 'point' }}
//         yScale={{
//             type: 'linear',
//             min: 'auto',
//             max: 'auto',
//             stacked: true,
//             reverse: false
//         }}
//         yFormat=" >-.2f"
//         axisTop={null}
//         axisRight={null}
//         axisBottom={{
//             tickSize: 5,
//             tickPadding: 5,
//             tickRotation: 0,
//             legend: 'transportation',
//             legendOffset: 36,
//             legendPosition: 'middle'
//         }}
//         axisLeft={{
//             tickSize: 5,
//             tickPadding: 5,
//             tickRotation: 0,
//             legend: 'count',
//             legendOffset: -40,
//             legendPosition: 'middle'
//         }}
//         pointSize={10}
//         pointColor={{ theme: 'background' }}
//         pointBorderWidth={2}
//         pointBorderColor={{ from: 'serieColor' }}
//         pointLabelYOffset={- 12}
//         useMesh={true}
//         legends={
//             [
//                 {
//                     anchor: 'bottom-right',
//                     direction: 'column',
//                     justify: false,
//                     translateX: 100,
//                     translateY: 0,
//                     itemsSpacing: 0,
//                     itemDirection: 'left-to-right',
//                     itemWidth: 80,
//                     itemHeight: 20,
//                     itemOpacity: 0.75,
//                     symbolSize: 12,
//                     symbolShape: 'circle',
//                     symbolBorderColor: 'rgba(0, 0, 0, .5)',
//                     effects: [
//                         {
//                             on: 'hover',
//                             style: {
//                                 itemBackground: 'rgba(0, 0, 0, .03)',
//                                 itemOpacity: 1
//                             }
//                         }
//                     ]
//                 }
//             ]}
//     />
// )