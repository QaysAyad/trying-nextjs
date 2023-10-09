import type { GetStaticPaths, GetStaticProps, NextPage } from "next";
import { AllMeasurementsCharts } from "~/components/MeasurementChart";
import HeadAndBackground from "~/components/HeadAndBackground";
import { ssgHelper } from "~/helpers/ssg";
import { api } from "~/utils/api";
import AuthRenderProtector from "~/components/AuthRenderProtector";
import Loading from "~/components/loading";

// TODO: Remove this.
// Patient.getInitialProps = (ctx: NextPageContext) => {
//   // TODO: Find a way to get into the session info and create a trpc client then
//   // prefecth patientData and inject it to the page.
//   if (typeof ctx.query.client_id !== "string") throw new Error("no id");
//   return { client_id: ctx.query.client_id }
// }

interface Props { client_id: string  }
const Patient: NextPage<Props> = ({ client_id }) => {
  const { data: patientData, isLoading } = api.patients.getPublic.useQuery({ client_id });
  if (isLoading) return <Loading />;
  if (!patientData) return <div>404</div>;

  const { data, isLoading: isLoadingData } =
    api.patients.getByClientIdWithDataPoints.useQuery({ client_id });

  return (
    <HeadAndBackground
      title={`Know Patents App - ${patientData.client_id}`}
      content={`Patent ${patientData.client_id} page`}
      meta={[{ name: "description", content: `Patent ${patientData.client_id} info` }]}
    >
      <AuthRenderProtector>
        {isLoadingData && <Loading />}
        {data && <AllMeasurementsCharts data={new Map([[patientData.id, data.dataPoints]])} />}
      </AuthRenderProtector>
    </HeadAndBackground>
  );
}

export default Patient;

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

