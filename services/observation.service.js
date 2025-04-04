const { loggers, resolveSchema } = require("@bluehalo/node-fhir-server-core");
const logger = loggers.get("default");
const db = require("../db");

// Simulated database for Observation
// const db = {
//   observations: [
//     {
//       _id: "O001",
//       resourceType: "Observation",
//       partOf: [
//         {
//           reference: "Procedure/PROC-987654",
//           display: "CT Scan Procedure",
//         },
//       ],
//       status: "final",
//       subject: {
//         reference: "Patient/12345",
//         display: "John Doe",
//       },
//       effectiveDateTime: "2024-02-12T12:00:00Z",
//       performer: [
//         {
//           reference: "Practitioner/45678",
//           display: "Dr. Smith",
//         },
//       ],
//       component: [
//         {
//           code: {
//             coding: [
//               {
//                 system: "http://loinc.org",
//                 code: "113733",
//                 display: "CT Dose Length Product",
//               },
//             ],
//           },
//           valueQuantity: {
//             value: 120.5,
//             unit: "mGy·cm",
//             system: "http://unitsofmeasure.org",
//             code: "mGy·cm",
//           },
//         },
//         {
//           code: {
//             coding: [
//               {
//                 system: "http://loinc.org",
//                 code: "113730",
//                 display: "CT Tube Current",
//               },
//             ],
//           },
//           valueQuantity: {
//             value: 250,
//             unit: "mA",
//             system: "http://unitsofmeasure.org",
//             code: "mA",
//           },
//         },
//         {
//           code: {
//             coding: [
//               {
//                 system: "http://loinc.org",
//                 code: "113731",
//                 display: "CT Exposure Time",
//               },
//             ],
//           },
//           valueQuantity: {
//             value: 1.5,
//             unit: "s",
//             system: "http://unitsofmeasure.org",
//             code: "s",
//           },
//         },
//       ],
//     },
//     {
//       _id: "O002",
//       resourceType: "Observation",
//       partOf: [
//         {
//           reference: "Procedure/PROC-987655",
//           display: "X-Ray Procedure",
//         },
//       ],
//       status: "preliminary",
//       subject: {
//         reference: "Patient/67890",
//         display: "Jane Doe",
//       },
//       effectiveDateTime: "2024-02-13T14:00:00Z",
//       performer: [
//         {
//           reference: "Practitioner/12345",
//           display: "Dr. John",
//         },
//       ],
//       component: [
//         {
//           code: {
//             coding: [
//               {
//                 system: "http://loinc.org",
//                 code: "113734",
//                 display: "X-Ray Dose Length Product",
//               },
//             ],
//           },
//           valueQuantity: {
//             value: 150.3,
//             unit: "mGy·cm",
//             system: "http://unitsofmeasure.org",
//             code: "mGy·cm",
//           },
//         },
//         {
//           code: {
//             coding: [
//               {
//                 system: "http://loinc.org",
//                 code: "113732",
//                 display: "X-Ray Tube Current",
//               },
//             ],
//           },
//           valueQuantity: {
//             value: 200,
//             unit: "mA",
//             system: "http://unitsofmeasure.org",
//             code: "mA",
//           },
//         },
//         {
//           code: {
//             coding: [
//               {
//                 system: "http://loinc.org",
//                 code: "113735",
//                 display: "X-Ray Exposure Time",
//               },
//             ],
//           },
//           valueQuantity: {
//             value: 2.0,
//             unit: "s",
//             system: "http://unitsofmeasure.org",
//             code: "s",
//           },
//         },
//       ],
//     },
//   ],
// };

// search
module.exports.search = async (args, context) => {
  try {
    let BundleEntry = resolveSchema(args.base_version, "bundleentry");
    let Bundle = resolveSchema(args.base_version, "bundle");
    let Observation = resolveSchema(args.base_version, "observation");

    const result = await db.query("SELECT id, data FROM Observation");

    let observations = result.rows.map((row) => {
      let observationData = row.data;
      observationData.id = row.id;
      return new Observation(observationData);
    });

    let entries = observations.map(
      (observation) => new BundleEntry({ resource: observation })
    );
    return new Bundle({ entry: entries });
  } catch (error) {
    logger.error("Error searching for observations:", error);
    throw new Error("Unable to locate observations");
  }
};

// searchById
module.exports.searchById = async (args, context) => {
  if (!args || !args.id) {
    throw new Error("Observation ID is required");
  }

  let Observation = resolveSchema(args.base_version, "observation");

  try {
    const result = await db.query(
      "SELECT id, data FROM Observation WHERE id = $1",
      [args.id]
    );

    if (result.rows.length === 0) {
      throw new Error("Observation not found");
    }

    let observationData = result.rows[0].data;
    observationData.id = result.rows[0].id;
    return new Observation(observationData);
  } catch (error) {
    logger.error("Error searching observation by ID:", error);
    throw new Error("Unable to find observation");
  }
};

// create
module.exports.create = async (args, context) => {
  let Observation = resolveSchema(args.base_version, "observation");
  let doc = new Observation(args.resource).toJSON();

  try {
    const result = await db.query(
      "INSERT INTO Observation (data) VALUES ($1) RETURNING id",
      [JSON.stringify(doc)]
    );

    return {
      id: result.rows[0].id,
    };
  } catch (err) {
    console.error("Error creating Observation:", err);
    throw new Error(`Failed to create Observation: ${err.message}`);
  }
};

// update
module.exports.update = async (args, context) => {
  try {
    let Observation = resolveSchema(args.base_version, "observation");
    let updatedObservation = new Observation(args.resource).toJSON();

    const result = await db.query(
      "UPDATE Observation SET data = $1 WHERE id = $2 RETURNING id",
      [updatedObservation, args.id]
    );

    if (result.rows.length === 0) {
      throw new Error("Observation not found or update failed");
    }

    return { id: args.id };
  } catch (err) {
    logger.error("Error updating observation:", err);
    throw new Error(`Failed to update observation: ${err.message}`);
  }
};

// remove
module.exports.remove = async (args, context) => {
  try {
    const result = await db.query(
      "DELETE FROM Observation WHERE id = $1 RETURNING id",
      [args.id]
    );

    if (result.rows.length === 0) {
      throw new Error("Observation not found or deletion failed");
    }

    return {
      statusCode: 200,
      message: "Observation deleted successfully",
    };
  } catch (err) {
    logger.error("Error deleting observation:", err);
    throw new Error(`Failed to delete observation: ${err.message}`);
  }
};
