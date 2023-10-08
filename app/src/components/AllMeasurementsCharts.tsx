import type { Patient } from "@prisma/client";
import { api } from "~/utils/api";
import { MeasurementChart, measurementKeys } from "~/components/MeasurementChart";

export function AllMeasurementsCharts({ data }: { data: [Patient['id'], Patient][] }) {
    const { data: dataPoints } = api.dataPoints.getAllForPatients.useQuery({ patient_ids: data.map(([id]) => id) });
    if (!dataPoints) return <div>Loading...</div>;
    return <div className="flex flex-col items-center">
        {measurementKeys.map((key) => <MeasurementChart key={key} measurementKey={key} data={dataPoints} />)}
    </div>;
}