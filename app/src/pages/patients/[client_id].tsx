import type { GetStaticPaths, GetStaticProps, NextPage } from "next";
import { AllMeasurementsCharts } from "~/components/MeasurementChart";
import HeadAndBackground from "~/components/HeadAndBackground";
import { ssgHelper } from "~/helpers/ssg";
import { api } from "~/utils/api";
import AuthRenderProtector from "~/components/AuthRenderProtector";
import Loading from "~/components/loading";
import { Suspense } from "react";
import type { DataPoint } from "@prisma/client";
import dayjs from "dayjs";
import { snakeCaseToText } from "~/utils/string";

// TODO: Remove this.
// Patient.getInitialProps = (ctx: NextPageContext) => {
//   // TODO: Find a way to get into the session info and create a trpc client then
//   // prefecth patientData and inject it to the page.
//   if (typeof ctx.query.client_id !== "string") throw new Error("no id");
//   return { client_id: ctx.query.client_id }
// }

interface Props { client_id: string }
const Patient: NextPage<Props> = ({ client_id }) => {
  const { data: patientData, isLoading } = api.patients.getPublic.useQuery({ client_id });
  if (isLoading) return <Loading />;
  if (!patientData) return <div>404</div>;
  return (
    <HeadAndBackground
      title={`Know Patents App - ${patientData.client_id}`}
      content={`Patent ${patientData.client_id} page`}
      meta={[{ name: "description", content: `Patent ${patientData.client_id} info` }]}
    >
      <div className="flex flex-col items-center justify-center gap-4">
        <h1 className="text-center text-2xl text-white">
          <span>Patient: {patientData.client_id}</span>
        </h1>
        <br />
        <AuthRenderProtector>
          <Suspense fallback={<Loading />}>
            <AuthPart client_id={client_id} />
          </Suspense>
        </AuthRenderProtector>
      </div>
    </HeadAndBackground>
  );
}

export default Patient;


function AuthPart({ client_id }: Props) {
  const { data, isLoading: isLoadingData } =
    api.patients.getByClientIdWithDataPoints.useQuery({ client_id });
  return (
    <>
      {isLoadingData && <Loading />}
      {data && <Table data={data.dataPoints} />}
      {data && <AllMeasurementsCharts data={new Map([[data.id, data.dataPoints]])} />}
    </>
  );
}

function Table({ data }: { data: DataPoint[] }) {
  return <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
      <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
        <tr>
          <th scope="col" className="px-6 py-3">
            Testing Date
          </th>
          {measurementKeys.map((key) => <th key={key} scope="col" className="px-6 py-3">
            {snakeCaseToText(key)}
          </th>)}
        </tr>
      </thead>
      <tbody>
        {data.map((dataPoint, i) =>
          <tr key={i} className={`border-b dark:border-gray-700 ${i % 2 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'}`}>
            <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
              {/* We shouldn't use utc because it should show the day of the testing corresponding to the system date. */}
              {dayjs(dataPoint.date_testing).format("YYYY-MM-DD")}
            </th>
            {measurementKeys.map((key) => <td key={key} className="px-6 py-4">
              {dataPoint[key]}
            </td>)}
          </tr>)}
      </tbody>
    </table>
  </div>
}

export const getStaticProps: GetStaticProps = async (context) => {
  const client_id = context.params?.client_id;

  if (typeof client_id !== "string") throw new Error("no id");


  await ssgHelper.patients.getPublic.prefetch({ client_id: client_id });

  return {
    props: {
      trpcState: ssgHelper.dehydrate(),
      client_id,
    },
    // Next.js will attempt to re-generate the page:
    // - When a request comes in
    // - At most once every 60 seconds
    revalidate: 60,
  };
};


// This function gets called at build time on server-side.
// It may be called again, on a serverless function, if
// the path has not been generated.
export const getStaticPaths: GetStaticPaths = async () => {
  const patients = await ssgHelper.patients.getAllPublic.fetch();
  const paths = patients.map((patient) => ({
    params: { client_id: patient.client_id },
  }))

  // We'll pre-render only these paths at build time.
  // { fallback: 'blocking' } will server-render pages
  // on-demand if the path doesn't exist.
  return { paths, fallback: 'blocking' }
}

