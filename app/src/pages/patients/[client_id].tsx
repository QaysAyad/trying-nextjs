import type { GetStaticPaths, GetStaticProps, NextPage } from "next";
import { AllMeasurementsCharts, measurementKeys } from "~/components/MeasurementChart";
import HeadAndBackground from "~/components/HeadAndBackground";
import { ssgHelper } from "~/helpers/ssg";
import { api } from "~/utils/api";
import AuthRenderProtector from "~/components/AuthRenderProtector";
import Loading from "~/components/Loading";
import { Suspense } from "react";
import type { Patient, DataPoint } from "@prisma/client";
import { snakeCaseToText } from "~/utils/string";
import { dayFormatter } from "~/utils/dayjs";
import { Table, TableBody, TableDataCell, TableHeader, TableHeaderColumnCell, TableHeaderRowCell, TableRow, TableRowEvenOdd } from "~/components/Table";

// TODO: Remove this.
// Patient.getInitialProps = (ctx: NextPageContext) => {
//   // TODO: Find a way to get into the session info and create a trpc client then
//   // prefecth patientData and inject it to the page.
//   if (typeof ctx.query.client_id !== "string") throw new Error("no id");
//   return { client_id: ctx.query.client_id }
// }

interface Props { client_id: string }
const PatientPage: NextPage<Props> = ({ client_id }) => {
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
        <h1 className="text-center text-2xl text-white p-10">
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

export default PatientPage;


function AuthPart({ client_id }: Props) {
  const { data, isLoading: isLoadingData } =
    api.patients.getByClientIdWithDataPoints.useQuery({ client_id });
  return (
    <>
      {isLoadingData && <Loading />}
      {data && <h2 className="text-3xl font-semibold text-white">Info</h2>}
      {data && <TableInfo data={data} />}
      {data && <h2 className="text-3xl font-semibold text-white">Data Points</h2>}
      {data && <DataTable data={data.dataPoints} />}
      {data && <AllMeasurementsCharts data={new Map([[data.client_id, data.dataPoints]])} />}
    </>
  );
}

function TableInfo({ data }: { data: Patient }) {
  return <Table>
    <TableHeader>
      <TableRow>
        <TableHeaderColumnCell>
          Birth Date
        </TableHeaderColumnCell>
        <TableHeaderColumnCell>
          Ethnicity
        </TableHeaderColumnCell>
        <TableHeaderColumnCell>
          Gender
        </TableHeaderColumnCell>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRowEvenOdd even>
        <TableDataCell>
          {dayFormatter(data.date_birthdate)}
        </TableDataCell>
        <TableDataCell>
          {/* TODO: Map the enum numbers to text readable values */}
          {data.ethnicity}
        </TableDataCell>
        <TableDataCell>
          {/* TODO: Map the enum numbers to text readable values */}
          {data.gender}
        </TableDataCell>
      </TableRowEvenOdd>
    </TableBody>
  </Table>
}

function DataTable({ data }: { data: DataPoint[] }) {
  return <Table>
    <TableHeader>
      <TableRow>
        <TableHeaderColumnCell>
          Testing Date
        </TableHeaderColumnCell>
        {measurementKeys.map((key) => <TableHeaderColumnCell key={key}>
          {snakeCaseToText(key)}
        </TableHeaderColumnCell>)}
      </TableRow>
    </TableHeader>
    <TableBody>
      {data.map((dataPoint, i) =>
        <TableRowEvenOdd key={i} even={!(i % 2)}>
          <TableHeaderRowCell>
            {/* We shouldn't use utc because it should show the day of the testing corresponding to the system date. */}
            {dayFormatter(dataPoint.date_testing)}
          </TableHeaderRowCell>
          {measurementKeys.map((key) => <TableDataCell key={key}>
            {dataPoint[key]}
          </TableDataCell>)}
        </TableRowEvenOdd>)}
    </TableBody>
  </Table>;
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

