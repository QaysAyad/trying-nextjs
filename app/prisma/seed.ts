import { PrismaClient, DataPoint } from '@prisma/client';
import { mapAsync } from '../src/utils/array';
const prisma = new PrismaClient();

const dataUrl = 'https://mockapi-furw4tenlq-ez.a.run.app/data';

interface DataPointResponse {
  client_id: string,
  date_testing: string,
  date_birthdate: string,
  gender: number,
  ethnicity: number,
  creatine: number,
  chloride: number,
  fasting_glucose: number,
  potassium: number,
  sodium: number,
  total_calcium: number,
  total_protein: number,
  creatine_unit: string,
  chloride_unit: string,
  fasting_glucose_unit: string,
  potassium_unit: string,
  sodium_unit: string,
  total_calcium_unit: string,
  total_protein_unit: string,
}

const fetchPatientData = () =>
  fetch(dataUrl).then<DataPointResponse>(r => r.json());

async function main() {
  const promises = Array(10).fill(0).map(() => fetchPatientData());
  const responses = (await Promise.allSettled(promises)).map(p =>
    p.status === 'fulfilled'
      ? p.value
      : null
  ).filter(x => x !== null) as unknown as DataPointResponse[][];

  await mapAsync(responses, async r => {
    // I don't think this check is necessary since the case study paper says 
    // at least there should be one datapoint but I am adding it anyway 
    // because it is just safer to add it rather than running into runtime 
    // error one day.
    if (!r.length) return;
    // All the datapoints have the same client_id.
    const client_id = r[0]!.client_id;
    const dataPoint = r.map<Omit<DataPoint, 'id' | 'patient_id'>>(
      ({ client_id: _, ...dp }) => {
        return Object.assign(dp, {
          // TODO: User a better utc date parser.
          date_testing: new Date(dp.date_testing),
          date_birthdate: new Date(dp.date_birthdate),
        });
      });    
    await prisma.patient.upsert({
      where: { client_id: client_id },
      create: {
        client_id: client_id,
        dataPoints: { createMany: { data: dataPoint } }
      },
      update: {
        dataPoints: { createMany: { data: dataPoint } }
      },
    });
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });