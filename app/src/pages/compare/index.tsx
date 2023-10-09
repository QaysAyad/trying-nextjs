import type { DataPoint, Patient } from "@prisma/client";
import { useMemo, useState } from "react";
import { api } from "~/utils/api";
import HeadAndBackground from "~/components/HeadAndBackground";
import { MeasurementChart, measurementKeys } from "~/components/MeasurementChart";
import AuthRenderProtector from "~/components/AuthRenderProtector";
import Loading from "~/components/Loading";
import { Table, TableBody, TableDataCell, TableHeader, TableHeaderColumnCell, TableHeaderRowCell, TableRow, TableRowEvenOdd } from "~/components/Table";
import { dayFormatter } from "~/utils/dayjs";
import { snakeCaseToText } from "~/utils/string";
import { RejectButton } from "~/components/Buttons";
import { PatientsSelectBox } from "~/components/PatientsSelectBox";

export default function Compare() {

  return (
    <>
      <HeadAndBackground
        title="Compare Patents"
      >
        <AuthRenderProtector>
          <AuthPart />
        </AuthRenderProtector>
      </HeadAndBackground>
    </>
  );
}

type SelectedPatients = [Patient['id'], Patient][];
function AuthPart() {
  const [search, setSearch] = useState('');
  const { data: patients } = api.patients.search.useQuery({ client_id: search });
  const [_selectedPatients, setSelectedPatients] = useState(new Map<Patient['id'], Patient>());
  const selectedPatients = useMemo<SelectedPatients>(() => Array.from(_selectedPatients), [_selectedPatients]);
  return (
    <>
      <div className="flex">
        <div className="flex flex-col">
          <h2 className="text-3xl font-semibold text-white">Patients</h2>
             <PatientsSelectBox
              data={patients}
              onSearch={setSearch}
              onSelect={(patient) => setSelectedPatients((prev) => new Map(prev).set(patient.id, patient))} />
        </div>
      </div>
      {selectedPatients.length && <AllCharts deselect={(id) => setSelectedPatients((prev) => {
        const newMap = new Map(prev);
        newMap.delete(id);
        return newMap;
      })} data={selectedPatients} />}
    </>
  );
}

function SelectedBox({ data, onRemove }: { data: SelectedPatients, onRemove: (id: Patient['id']) => void }) {
  return <div>
    <h2 className="text-3xl font-semibold text-white">Selected</h2>
    <div className="border">
      {data.map(([id, patient]) =>
        <button
          className="bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
          key={id}
          onClick={() => onRemove(id)}
        >
          {patient.client_id} RemoveIcon
        </button>)}
    </div>

  </div>;
}

type PatentsDataPoints = Map<Patient['id'], DataPoint[]>;
export function AllCharts({ data, deselect }: { data: SelectedPatients, deselect: DataTableProps['deselect'] }) {
  const { data: dataPoints } = api.dataPoints.getAllForPatients.useQuery({ patient_ids: data.map(([id]) => id) });
  const mappedDataPoints = useMemo(() => dataPoints &&
    new Map([...dataPoints.entries()].map<[string, DataPoint[]]>(([id, dataPoint]) =>
      [data.find(([idd]) => `${idd}` === `${id}`)![1].client_id, dataPoint])), [dataPoints]);
  
  if (!dataPoints) return <Loading />;

  return <div className="flex flex-col items-center gap-4">
    {data && <h2 className="text-3xl font-semibold text-white">Selected Patients</h2>}
    <div className="w-full">
      {dataPoints && <DataTable deselect={deselect} selectedPatients={data} data={dataPoints} />}
    </div>
    {data && <h2 className="text-3xl font-semibold text-white">Data Points</h2>}
    {mappedDataPoints?.size && measurementKeys.map((key) => <MeasurementChart key={key} measurementKey={key} data={mappedDataPoints} />)}
  </div>;
}

interface DataTableProps {
  selectedPatients: SelectedPatients;
  data: PatentsDataPoints;
  deselect(id: Patient['id']): void;
}

function DataTable({ selectedPatients, data, deselect }: DataTableProps) {
  return <Table>
    <TableHeader>
      <TableRow>
        <TableHeaderColumnCell>
          Client ID
        </TableHeaderColumnCell>
        <TableHeaderColumnCell>
          Birth Date
        </TableHeaderColumnCell>
        <TableHeaderColumnCell>
          Ethnicity
        </TableHeaderColumnCell>
        <TableHeaderColumnCell>
          Gender
        </TableHeaderColumnCell>
        <TableHeaderColumnCell>
          Last Testing Date
        </TableHeaderColumnCell>
        {measurementKeys.map((key) => <TableHeaderColumnCell key={key}>
          {snakeCaseToText(key)}
        </TableHeaderColumnCell>)}
        <TableHeaderColumnCell>
          Action
        </TableHeaderColumnCell>
      </TableRow>
    </TableHeader>
    <TableBody>
      {[...data.keys()].map((id, i) => {
        const patient = selectedPatients.find(([_, p]) => id === p.id)![1];
        const dataPoint = data.get(id)!.slice(-1)[0]!;
        return <TableRowEvenOdd key={i} even={!(i % 2)}>
          <TableHeaderRowCell>
            {patient.client_id}
          </TableHeaderRowCell>
          <TableDataCell>
            {dayFormatter(patient.date_birthdate)}
          </TableDataCell>
          <TableDataCell>
            {/* TODO: Map the enum numbers to text readable values */}
            {patient.ethnicity}
          </TableDataCell>
          <TableDataCell>
            {/* TODO: Map the enum numbers to text readable values */}
            {patient.gender}
          </TableDataCell>
          <TableDataCell>
            {/* We shouldn't use utc because it should show the day of the testing corresponding to the system date. */}
            {dayFormatter(dataPoint.date_testing)}
          </TableDataCell>
          {measurementKeys.map((key) => <TableDataCell key={key}>
            {dataPoint[key]}
          </TableDataCell>)}
          <TableDataCell>
            <RejectButton onClick={() => deselect(id)}>
              Deselect
            </RejectButton>
          </TableDataCell>
        </TableRowEvenOdd>
      })}
    </TableBody>
  </Table>;
}
