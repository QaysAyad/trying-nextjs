import { getSession, signIn, signOut, useSession } from "next-auth/react";
import { AllMeasurementsCharts } from "~/components/MeasurementChart";
import HeadAndBackground from "~/components/HeadAndBackground";
import { api } from "~/utils/api";
import { type NextPageContext } from 'next'
import AuthRenderProtector from "~/components/AuthRenderProtector";
import Loading from "~/components/loading";

Patient.getInitialProps = (ctx: NextPageContext) => {
  // TODO: Find a way to get into the session info and create a trpc client then
  // prefecth patientData and inject it to the page.
  if (typeof ctx.query.clientId !== "string") throw new Error("no id");
  return { clientId: ctx.query.clientId }
}

export default function Patient({ clientId }: { clientId: string }) {
  const { data: patientData, isLoading } =
    api.patients.getByClientIdWithDataPoints.useQuery({ client_id: clientId });
  if (isLoading) return <Loading />;
  if (!patientData) return <div>404</div>;

  return (
    <HeadAndBackground
      title={`Know Patents App - ${patientData.client_id}`}
      content={`Patent ${patientData.client_id} page`}
      meta={[{ name: "description", content: `Patent ${patientData.client_id} info` }]}
    >
      <AuthRenderProtector>
        {<AllMeasurementsCharts data={new Map([[patientData.id, patientData.dataPoints]])} />}
      </AuthRenderProtector>
    </HeadAndBackground>
  );
}
