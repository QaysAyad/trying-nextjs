import type { Patient } from "@prisma/client";
import { type OnSearchCallBack, SearchBox } from "~/components/SearchBox";
import Loading from "./Loading";

interface Props {
    data?: Patient[];
    onSelect: (patient: Patient) => void;
    onSearch: OnSearchCallBack;
}
export const PatientsSelectBox = ({ data, onSelect, onSearch }: Props) => {
    return <div className="p-6">
        <SearchBox onSearch={onSearch} />
        <div className="w-full flex flex-col items-stretch">
            {!data && <Loading />}
            <div>
                <h4 className="py-4 font-semibold text-white">Click the name to select</h4>
                <div className="flex flex-wrap gap-4 p-4 rounded-lg border">
                    {data?.map((patient) => <button
                        className="bg-white/10 px-10 py-3 rounded-lg font-semibold text-white no-underline transition hover:bg-white/20"
                        key={patient.id}
                        onClick={() => onSelect(patient)}
                    >
                        {patient.client_id}
                    </button>)}
                </div>

            </div>
        </div>
    </div>;
};