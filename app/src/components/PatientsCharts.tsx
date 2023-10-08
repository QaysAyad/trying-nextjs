import type { DataPoint, Patient } from "@prisma/client";
import { Chart, type ChartDataPoints } from "~/components/Chart";

// This is called typescript types gymnastic when you want to create a type for your special case.
type OmitUnits<T> = {
    [K in keyof T as K extends `${infer _}_unit` ? never : K]: T[K];
}

type PointKeys =
    keyof OmitUnits<Omit<DataPoint, 'id' | 'patient_id' | 'date_testing'>>;

const pointUnitsKeys: Record<PointKeys, `${PointKeys}_unit`> = {
    creatine: "creatine_unit",
    chloride: "chloride_unit",
    fasting_glucose: "fasting_glucose_unit",
    potassium: "potassium_unit",
    sodium: "sodium_unit",
    total_calcium: "total_calcium_unit",
    total_protein: "total_protein_unit"
} as const;

export function PatientsCharts({ data: _data, pointKey }: { pointKey: PointKeys, data: Map<Patient['id'], DataPoint[]> }) {
    const data = Array.from(_data);
    const unit = data[0]![1][0]![pointUnitsKeys[pointKey]];
    return <div style={{ height: '20rem', width: '20rem', backgroundColor: 'white' }}>
        <Chart
            unit={unit}
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
                        currentData.values[dataKey] = point[pointKey];
                        return;
                    }
                    acc.push({
                        date: point.date_testing.getTime(),
                        keys: [dataKey],
                        values: {
                            [dataKey]: point[pointKey],
                        }
                    })
                });
                return acc;
            }, [] as ChartDataPoints<string>[])}
        />
    </div>;
}