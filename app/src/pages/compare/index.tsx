import type { Patient } from "@prisma/client";
import { Suspense, useRef } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { use, useEffect, useMemo, useState } from "react";
import { Chart, type ChartDataPoints } from "~/components/Chart";
import { api } from "~/utils/api";
import HeadAndBackground from "~/components/HeadAndBackground";
import { PatientsCharts } from "~/components/PatientsCharts";

export default function Compare() {

  return (
    <>
      <HeadAndBackground
        title="Compare Patents"
      >
        <AuthPart />
      </HeadAndBackground>
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
  return <PatientsCharts pointKey="chloride" data={dataPoints} />;
}