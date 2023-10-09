import type { Patient } from "@prisma/client";
import { type OnSearchCallBack, SearchBox } from "~/components/SearchBox";
import Loading from "./Loading";

interface Props {
    data?: Patient[];
    onSelect: (patient: Patient) => void;
    onSearch: OnSearchCallBack;
}
export const PatientsSelectBox = ({ data, onSelect, onSearch }: Props) => {
    return <>
        <SearchBox onSearch={onSearch} />
        <div className="w-50 h-40 overflow-y-scroll flex flex-col items-stretch">
            {!data && <Loading />}
            {data?.map((patient) => <button
                className="bg-white/10 px-2 font-semibold text-white no-underline transition hover:bg-white/20"
                key={patient.id}
                onClick={() => onSelect(patient)}
            >
                {patient.client_id}
            </button>)}
        </div>
    </>;
};
