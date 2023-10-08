import type { DataPoint, Patient } from "@prisma/client";
import { Chart, type ChartDataPoints } from "~/components/Chart";

export function PatientsCharts({ data: _data }: { data: Map<Patient['id'], DataPoint[]> }) {
    const data = Array.from(_data);
    return <div style={{ height: '20rem', width: '20rem', backgroundColor: 'white' }}>
        <Chart
            lines={data.map(([id]) => ({
                key: `${id}`,
                stroke: `#${Math.floor((Math.abs(Math.sin(id) * 16777215))).toString(16)}`,
            }))}
            // TODO: This is a cpu intensive operation, if the data is too big, 
            // we either need to do it on the server with a special endpoint 
            // so migrating to use another charting library will be easier or 
            // we find a way to cache it on the client so we don't need to redo it at every render.
            data={data.reduce((acc, [id, points]) => {
                const dataKey = `${id}`;
                points.forEach((point) => {
                    const currentData = acc.find((accData) => accData.date === point.date_testing.getTime());
                    if (currentData) {
                        !currentData.keys.includes(dataKey) && currentData.keys.push(dataKey);
                        currentData.values[dataKey] = point.chloride;
                        return;
                    }
                    acc.push({
                        date: point.date_testing.getTime(),
                        keys: [dataKey],
                        values: {
                            [dataKey]: point.chloride,
                        }
                    })
                });
                return acc;
            }, [] as ChartDataPoints<string>[])}
        />
    </div>;
}