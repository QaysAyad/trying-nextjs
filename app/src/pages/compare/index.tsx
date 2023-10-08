import type { Patient } from "@prisma/client";
import { Suspense } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { use, useEffect, useMemo, useState } from "react";
import { Chart, type ChartDataPoints } from "~/components/Chart";

import { api } from "~/utils/api";

export default function Compare() {

  return (
    <>
      <Head>
        <title>Compare Patents</title>
        <meta name="description" content="Know Patents App" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <AuthPart />
      </main>
    </>
  );
}
function AuthPart() {
  const [search, setSearch] = useState('');
  const { data: sessionData } = useSession();
  const { data: patients, isLoading: isLoadingPatients } = api.patients.search.useQuery({ client_id: search });
  const [_selectedPatients, setSelectedPatients] = useState(new Map<Patient['id'], Patient>());
  const selectedPatients = useMemo(() => Array.from(_selectedPatients), [_selectedPatients]);

  // if (typeof window === "undefined") return null

  // if (!sessionData) return <p>Access Denied</p>

  return (
    <>
      <div className="flex">
        <div className="flex flex-col">
          <h2 className="text-3xl font-semibold text-white">Patients</h2>
          <input
            placeholder="Search with Client ID"
            className="grow bg-transparent outline-none"
            type="text"
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="w-50 h-40  overflow-scroll flex flex-col items-stretch">
            {isLoadingPatients && <div>Loading...</div>}
            {patients?.map((patient) =>
              <button
                className="bg-white/10 px-2 font-semibold text-white no-underline transition hover:bg-white/20"
                key={patient.id}
                onClick={() =>
                  setSelectedPatients((prev) => new Map(prev).set(patient.id, patient))}
              >
                {patient.client_id}
              </button>)}
          </div>
        </div>
        <SelectedBox
          data={selectedPatients}
          onRemove={(id) => setSelectedPatients((prev) => {
            const newMap = new Map(prev);
            newMap.delete(id);
            return newMap;
          })}
        />
      </div>
      <ChartBox data={selectedPatients} />
    </>
  );
}

function SelectedBox({ data, onRemove }: { data: [Patient['id'], Patient][], onRemove: (id: Patient['id']) => void }) {
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

function ChartBox({ data }: { data: [Patient['id'], Patient][] }) {
  const { data: dataPoints } = api.dataPoints.getAllForPatients.useQuery({ patient_ids: data.map(([id]) => id) });
  if (!dataPoints) return <div>Loading...</div>;
  return <div style={{ height: '20rem', width: '20rem', backgroundColor: 'white' }}>
    <Chart
      lines={data.map(([id]) => ({
        key: `${id}`,
        stroke: `#${Math.floor((Math.abs(Math.sin(id) * 16777215))).toString(16)}`,
      }))}
      data={Array.from(dataPoints).reduce((acc, [id, data]) => {
        const dataKey = `${id}`;
        data.forEach((data) => {
          const currentData = acc.find((accData) => accData.date === data.date_testing.getTime());
          if (currentData) {
            !currentData.keys.includes(dataKey) && currentData.keys.push(dataKey);
            currentData.values[dataKey] = data.chloride;
            return;
          }
          acc.push({
            date: data.date_testing.getTime(),
            keys: [dataKey],
            values: {
              [dataKey]: data.chloride,
            }
          })
        });
        return acc;
      }, [] as ChartDataPoints<string>[])}
    />
  </div>;
}