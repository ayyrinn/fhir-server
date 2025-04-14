const { loggers, resolveSchema } = require("@bluehalo/node-fhir-server-core");
const logger = loggers.get("default");
const supabase = require("../db");

// Simulasi database pasien
// const db = {
//   patients: [
//     {
//       _id: "P001",
//       resourceType: "Patient",
//       identifier: [
//         { system: "http://hospital.smarthealth.org/mrn", value: "MRN001" },
//       ],
//       name: [{ use: "official", given: ["John"], family: "Doe" }],
//       gender: "male",
//       birthDate: "1990-01-01",
//     },
//     {
//       _id: "P002",
//       resourceType: "Patient",
//       identifier: [
//         { system: "http://hospital.smarthealth.org/mrn", value: "MRN002" },
//       ],
//       name: [{ use: "official", given: ["Jane"], family: "Smith" }],
//       gender: "female",
//       birthDate: "1990-05-15",
//     },
//   ],
// };

// search
module.exports.search = async (args, context) => {
  try {
    let BundleEntry = resolveSchema(args.base_version, "bundleentry");
    let Bundle = resolveSchema(args.base_version, "bundle");
    let Patient = resolveSchema(args.base_version, "patient");

    const { data, error } = await supabase.from("patient").select("*");

    if (error) throw error;

    const patients = data.map((row) => {
      const resource = {
        resourceType: "Patient",
        identifier: row.identifier,
        name: [{ family: row.familyName, given: row.given }],
        gender: row.gender,
        birthDate: row.birthDate,
        id: row.id,
      };
      return new Patient(resource);
    });

    let entries = patients.map(
      (patient) => new BundleEntry({ resource: patient })
    );
    return new Bundle({ entry: entries });
  } catch (error) {
    logger.error("Error searching for patients:", error);
    throw new Error("Unable to locate patients");
  }
};

// searchById
module.exports.searchById = async (args, context) => {
  if (!args || !args.id) {
    throw new Error("Patient ID is required");
  }
  let Patient = resolveSchema(args.base_version, "patient");
  try {
    const { data, error } = await supabase
      .from("patient")
      .select("*")
      .eq("id", args.id)
      .single();

    if (error || !data) throw new Error("Patient not found");

    const resource = {
      resourceType: "Patient",
      identifier: data.identifier,
      name: [{ family: data.familyName, given: data.given }],
      gender: data.gender,
      birthDate: data.birthDate,
      id: data.id,
    };

    return new Patient(resource);
  } catch (error) {
    logger.error("Error searching patient by ID:", error);
    throw new Error("Unable to find patient");
  }
};

// create
module.exports.create = async (args, context) => {
  try {
    console.log("🟡 Full Args Object:", body);
    console.log("🟢 Request Body:", context);

    if (!context.req.body || Object.keys(context.req.body).length === 0) {
      throw new Error("❌ Missing patient resource data.");
    }

    console.log("✅ Data received", context.req.body);

    let Patient = resolveSchema(args.base_version, "patient");

    let patientData = (patientData = new Patient(context.req.body).toJSON());

    console.log("Converted Patient Data:", patientData);

    const identifier = resource.identifier || [];
    const name = resource.name?.[0] || {};
    const familyName = name.family || null;
    const given = name.given || [];
    const gender = resource.gender || null;
    const birthDate = resource.birthDate || null;

    const { data, error } = await supabase.from("patient").insert([
      {
        identifier,
        familyName,
        given,
        gender,
        birthDate,
      },
    ]);

    if (error) throw error;

    logger.info("✅ Patient created", data);

    return { id: data?.[0]?.id };
  } catch (err) {
    console.error("Error inserting patient:", err);
    throw new Error(`Failed to insert patient: ${err.message}`);
  }
};

// update
module.exports.update = async (args, context) => {
  try {
    let Patient = resolveSchema(args.base_version, "patient");
    let updatedPatient = new Patient(context.req.body).toJSON();

    const identifier = updatedPatient.identifier || [];
    const name = updatedPatient.name?.[0] || {};
    const familyName = name.family || null;
    const given = name.given || [];
    const gender = updatedPatient.gender || null;
    const birthDate = updatedPatient.birthDate || null;

    const { data, error } = await supabase
      .from("patient")
      .update({
        identifier,
        familyName,
        given,
        gender,
        birthDate,
        updated_at: new Date(),
      })
      .eq("id", args.id)
      .select("id")
      .single();

    if (error || !data) throw new Error("Patient not found or update failed");
    logger.info(`✅ Updated patient with ID: ${data.id}`);
    return { id: data.id };
  } catch (err) {
    logger.error("Error updating patient:", err);
    throw new Error(`Failed to update patient: ${err.message}`);
  }
};

// remove
module.exports.remove = async (args, context) => {
  try {
    const { data, error } = await supabase
      .from("patient")
      .delete()
      .eq("id", args.id)
      .select("id")
      .single();

    if (error || !data) throw new Error("Patient not found or deletion failed");

    return {
      statusCode: 200,
      message: "Patient deleted successfully",
    };
  } catch (err) {
    logger.error("Error deleting patient:", err);
    throw new Error(`Failed to delete patient: ${err.message}`);
  }
};
