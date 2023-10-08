import { PrismaClient, type DataPoint, type Patient } from '@prisma/client';
import dayjs from "dayjs";
import utc from 'dayjs/plugin/utc';
import { mapAsync } from '../src/utils/array';
dayjs.extend(utc);

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
    const firstDatePoint = r[0]!;
    // All the datapoints have belong to the same user.
    const patient: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'> = {
      client_id: firstDatePoint.client_id,
      date_birthdate: dayjs.utc(firstDatePoint.date_birthdate).toDate(),
      gender: firstDatePoint.gender,
      ethnicity: firstDatePoint.ethnicity,
    };
    const client_id = patient.client_id;
    const dataPoint = r.map<Omit<DataPoint, 'id' | 'patient_id'>>(({
      client_id: _,
      date_birthdate: __,
      gender: ___,
      ethnicity: ____,
      ...dp
    }) => Object.assign(dp, {
      date_testing: dayjs.utc(dp.date_testing).toDate(),
    }));
    await prisma.patient.upsert({
      where: { client_id: client_id },
      create: {
        ...patient,
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