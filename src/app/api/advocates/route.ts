import db from "../../../db";
import { advocates } from "../../../db/schema";
import { advocateData } from "../../../db/seed/advocates";

export async function GET() {
  try {
    // if docker does not work this
    //const data = advocateData;
    // Uncomment this line to use a database
    const dataFromDB = await db.select().from(advocates);

    const formattedData = dataFromDB.map((advocate) => ({
      firstName: advocate.firstName,
      lastName: advocate.lastName,
      city: advocate.city,
      degree: advocate.degree,
      specialties: advocate.specialties as string[],
      yearsOfExperience: advocate.yearsOfExperience.toString(),
      phoneNumber: advocate.phoneNumber.toString(),
    }));

    return Response.json({ data: formattedData });
  } catch (error) {
    console.error("Error fetching advocates:", error);
    return Response.json(
      { error: "Failed to fetch advocates" },
      { status: 500 }
    );
  }
}
