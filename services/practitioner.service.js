const { loggers, resolveSchema } = require("@bluehalo/node-fhir-server-core");
const logger = loggers.get("default");
const db = require("../db");

// Simulated database for Practitioner
// const db = {
//   practitioners: [
//     {
//       _id: "14873fcd-b52c-471c-8b65-56ab2e532b84",
//       resourceType: "Practitioner",
//       extension: [
//         {
//           url: "http://example.org/fhir/StructureDefinition/practitioner-role",
//           valueCoding: {
//             system: "http://example.org/fhir/practitioner-roles",
//             display: "superadmin",
//           },
//         },
//         {
//           url: "http://example.org/fhir/StructureDefinition/optional-1",
//           valueString: "Optional 1",
//         },
//         {
//           url: "http://example.org/fhir/StructureDefinition/optional-2",
//           valueString: "Optional 2",
//         },
//         {
//           url: "http://example.org/fhir/StructureDefinition/optional-3",
//           valueString: "Optional 3",
//         },
//       ],
//       active: true,
//       name: [
//         {
//           use: "official",
//           family: "superadmin",
//           given: ["superadmin"],
//         },
//       ],
//     },
//     {
//       _id: "12345abc-de67-890f-gh12-ijklmn34opqr",
//       resourceType: "Practitioner",
//       extension: [
//         {
//           url: "http://example.org/fhir/StructureDefinition/practitioner-role",
//           valueCoding: {
//             system: "http://example.org/fhir/practitioner-roles",
//             display: "admin",
//           },
//         },
//         {
//           url: "http://example.org/fhir/StructureDefinition/optional-1",
//           valueString: "Optional 4",
//         },
//         {
//           url: "http://example.org/fhir/StructureDefinition/optional-2",
//           valueString: "Optional 5",
//         },
//       ],
//       active: true,
//       name: [
//         {
//           use: "official",
//           family: "admin",
//           given: ["admin"],
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
    let Practitioner = resolveSchema(args.base_version, "practitioner");

    const result = await db.query("SELECT id, data FROM Practitioner");

    let practitioners = result.rows.map((row) => {
      let practitionerData = row.data;
      practitionerData.id = row.id;
      return new Practitioner(practitionerData);
    });

    let entries = practitioners.map(
      (practitioner) => new BundleEntry({ resource: practitioner })
    );

    return new Bundle({ entry: entries });
  } catch (error) {
    logger.error("Error searching for practitioners:", error);
    throw new Error("Unable to locate practitioners");
  }
};

// searchById
module.exports.searchById = async (args, context) => {
  if (!args || !args.id) {
    throw new Error("Practitioner ID is required");
  }

  let Practitioner = resolveSchema(args.base_version, "practitioner");

  try {
    const result = await db.query(
      "SELECT id, data FROM Practitioner WHERE id = $1",
      [args.id]
    );

    if (result.rows.length === 0) {
      throw new Error("Practitioner not found");
    }

    let practitionerData = result.rows[0].data;
    practitionerData.id = result.rows[0].id;
    return new Practitioner(practitionerData);
  } catch (error) {
    logger.error("Error searching practitioner by ID:", error);
    throw new Error("Unable to find practitioner");
  }
};

// create
module.exports.create = async (args, context) => {
  let Practitioner = resolveSchema(args.base_version, "practitioner");
  let doc = new Practitioner(args.resource).toJSON();

  try {
    const result = await db.query(
      "INSERT INTO Practitioner (data) VALUES ($1) RETURNING id",
      [JSON.stringify(doc)]
    );

    return {
      id: result.rows[0].id,
    };
  } catch (err) {
    console.error("Error creating Practitioner:", err);
    throw new Error(`Failed to create Practitioner: ${err.message}`);
  }
};

// update
module.exports.update = async (args, context) => {
  try {
    let Practitioner = resolveSchema(args.base_version, "practitioner");
    let updatedPractitioner = new Practitioner(args.resource).toJSON();

    const result = await db.query(
      "UPDATE Practitioner SET data = $1 WHERE id = $2 RETURNING id",
      [JSON.stringify(updatedPractitioner), args.id]
    );

    if (result.rows.length === 0) {
      throw new Error("Practitioner not found or update failed");
    }

    return { id: args.id };
  } catch (err) {
    logger.error("Error updating practitioner:", err);
    throw new Error(`Failed to update practitioner: ${err.message}`);
  }
};

// remove
module.exports.remove = async (args, context) => {
  try {
    const result = await db.query(
      "DELETE FROM Practitioner WHERE id = $1 RETURNING id",
      [args.id]
    );

    if (result.rows.length === 0) {
      throw new Error("Practitioner not found or deletion failed");
    }

    return {
      statusCode: 200,
      message: "Practitioner deleted successfully",
    };
  } catch (err) {
    logger.error("Error deleting practitioner:", err);
    throw new Error(`Failed to delete practitioner: ${err.message}`);
  }
};
