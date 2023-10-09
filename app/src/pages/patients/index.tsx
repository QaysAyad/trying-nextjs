import { useRouter } from "next/router";
import { Suspense, useState } from "react";
import AuthRenderProtector from "~/components/AuthRenderProtector";
import HeadAndBackground from "~/components/HeadAndBackground";
import Loading from "~/components/Loading";
import { PatientsSelectBox } from "~/components/PatientsSelectBox";

import { api } from "~/utils/api";

export default function Patients() {
  return <HeadAndBackground
    title="Patents"
  >
    <AuthRenderProtector>
      <Suspense fallback={<Loading />}>
        <AuthPart />
      </Suspense>
    </AuthRenderProtector>
  </HeadAndBackground>;
}

function AuthPart() {
  const [search, setSearch] = useState('');
  const router = useRouter();
  const { data: patients } = api.patients.search.useQuery({ client_id: search });
  return (
    <div className="flex flex-col">
      <h2 className="text-3xl font-semibold text-white">Patients</h2>
      <PatientsSelectBox
        data={patients}
        onSearch={setSearch}
        onSelect={(patient) => void router.push(`/patients/${patient.client_id}`)} />
    </div>
  );
}

