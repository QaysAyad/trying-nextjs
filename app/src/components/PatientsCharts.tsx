import type { DataPoint, Patient } from "@prisma/client";
import { Chart, type ChartDataPoints } from "~/components/Chart";
import { capitalizeFirstLetter } from "~/utils/string";

// This is called typescript types gymnastic when you want to create a type for your special case.
type OmitUnits<T> = {
    [K in keyof T as K extends `${infer _}_unit` ? never : K]: T[K];
}

type MeasurementKeys =
    keyof OmitUnits<Omit<DataPoint, 'id' | 'patient_id' | 'date_testing'>>;

export const measurementUnitsKeys: Record<MeasurementKeys, `${MeasurementKeys}_unit`> = {
    creatine: "creatine_unit",
    chloride: "chloride_unit",
    fasting_glucose: "fasting_glucose_unit",
    potassium: "potassium_unit",
    sodium: "sodium_unit",
    total_calcium: "total_calcium_unit",
    total_protein: "total_protein_unit"
} as const;

export const measurementKeys = Object.keys(measurementUnitsKeys) as MeasurementKeys[];

export function PatientsCharts(props: { measurementKey: MeasurementKeys, data: Map<Patient['id'], DataPoint[]> }) {
    const { measurementKey } = props;
    const data = Array.from(props.data);
    const unit = data[0]![1][0]![measurementUnitsKeys[measurementKey]];
    return <div
        className="w-min flex flex-col items-center justify-center gap-2 p-8 border"
    >
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
                        currentData.values[dataKey] = point[measurementKey];
                        return;
                    }
                    acc.push({
                        date: point.date_testing.getTime(),
                        keys: [dataKey],
                        values: {
                            [dataKey]: point[measurementKey],
                        }
                    })
                });
                return acc;
            }, [] as ChartDataPoints<string>[])}
        />
        <div className="text-xl font-semibold capitalize text-white">
            {measurementKey.replace("_", " ")}({unit})
        </div>
    </div>;
}
