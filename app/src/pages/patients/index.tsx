import { useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { useState } from "react";

import { api } from "~/utils/api";

export default function Patients() {
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
              <Link
                key={patient.id}
                href={`/patients/${patient.client_id}`}
                className="bg-white/10 px-2 font-semibold text-white no-underline transition hover:bg-white/20"
              >
                {patient.client_id}
              </Link>)}
          </div>
        </div>
      </div>
    </>
  );
}