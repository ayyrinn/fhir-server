const { loggers, resolveSchema } = require("@bluehalo/node-fhir-server-core");
const logger = loggers.get("default");
const db = require("../db");

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

    // let results = db.patients;
    // let patients = results.map((result) => new Patient(result));

    const result = await db.query("SELECT id, data FROM Patient");
    let patients = result.rows.map((row) => {
      let patientData = row.data;
      patientData.id = row.id;
      return new Patient(patientData);
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
    const result = await db.query(
      "SELECT id, data FROM Patient WHERE id = $1",
      [args.id]
    );
    if (result.rows.length === 0) {
      throw new Error("Patient not found");
    }

    let patientData = result.rows[0].data;
    patientData.id = result.rows[0].id;
    return new Patient(patientData);
  } catch (error) {
    logger.error("Error searching patient by ID:", error);
    throw new Error("Unable to find patient");
  }
};

// create
module.exports.create = async (args, context) => {
  try {
    console.log("🟡 Full Args Object:", args);
    console.log("🟢 Request Body:", context);

    if (!context.req.body || Object.keys(context.req.body).length === 0) {
      throw new Error("❌ Missing patient resource data.");
    }

    console.log("✅ Data received", context.req.body);

    let Patient = resolveSchema(args.base_version, "patient");

    console.log("Resolved Patient Schema:", Patient);

    console.log("Raw Patient Data Before Creating Instance:", args); // Directly using args

    let patientData = (patientData = new Patient(args.resource).toJSON());

    console.log("Converted Patient Data:", patientData);

    const query = `INSERT INTO Patient (data) VALUES ($1) RETURNING id`;
    const values = [JSON.stringify(patientData)];

    const result = await db.query(query, values);

    return { id: result.rows[0].id };
  } catch (err) {
    console.error("Error inserting patient:", err);
    throw new Error(`Failed to insert patient: ${err.message}`);
  }
};

// update
module.exports.update = async (args, context) => {
  try {
    let Patient = resolveSchema(args.base_version, "patient");
    let updatedPatient = new Patient(args.resource).toJSON();

    const result = await db.query(
      "UPDATE Patient SET data = $1 WHERE id = $2 RETURNING id",
      [updatedPatient, args.id]
    );

    if (result.rows.length === 0) {
      throw new Error("Patient not found or update failed");
    }

    return { id: args.id };
  } catch (err) {
    logger.error("Error updating patient:", err);
    throw new Error(`Failed to update patient: ${err.message}`);
  }
};

// remove
module.exports.remove = async (args, context) => {
  try {
    const result = await db.query(
      "DELETE FROM Patient WHERE id = $1 RETURNING id",
      [args.id]
    );

    if (result.rows.length === 0) {
      throw new Error("Patient not found or deletion failed");
    }

    return {
      statusCode: 200,
      message: "Patient deleted successfully",
    };
  } catch (err) {
    logger.error("Error deleting patient:", err);
    throw new Error(`Failed to delete patient: ${err.message}`);
  }
};
