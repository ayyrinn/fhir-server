const { loggers, resolveSchema } = require("@bluehalo/node-fhir-server-core");
const logger = loggers.get("default");
const db = require("../db");

// Simulated database for Location
// const db = {
//   locations: [
//     {
//       _id: "L001",
//       resourceType: "Location",
//       status: "active",
//       name: "Ruangan MR",
//       type: [
//         {
//           coding: [
//             {
//               system:
//                 "http://terminology.hl7.org/CodeSystem/location-physical-type",
//               code: "ward",
//               display: "Ward",
//             },
//           ],
//         },
//       ],
//       extension: [
//         {
//           url: "http://example.org/fhir/StructureDefinition/location-modality",
//           valueCodeableConcept: {
//             coding: [
//               {
//                 system: "http://dicom.nema.org/resources/ontology/DCM",
//                 code: "MR",
//               },
//             ],
//           },
//         },
//       ],
//     },
//     {
//       _id: "L002",
//       resourceType: "Location",
//       status: "active",
//       name: "Ruangan CT",
//       type: [
//         {
//           coding: [
//             {
//               system:
//                 "http://terminology.hl7.org/CodeSystem/location-physical-type",
//               code: "ward",
//               display: "Ward",
//             },
//           ],
//         },
//       ],
//       extension: [
//         {
//           url: "http://example.org/fhir/StructureDefinition/location-modality",
//           valueCodeableConcept: {
//             coding: [
//               {
//                 system: "http://dicom.nema.org/resources/ontology/DCM",
//                 code: "CT",
//               },
//             ],
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
    let Location = resolveSchema(args.base_version, "location");

    const result = await db.query("SELECT id, data FROM Location");

    let locations = result.rows.map((row) => {
      let locationData = row.data;
      locationData.id = row.id;
      return new Location(locationData);
    });

    let entries = locations.map(
      (location) => new BundleEntry({ resource: location })
    );
    return new Bundle({ entry: entries });
  } catch (error) {
    logger.error("Error searching for locations:", error);
    throw new Error("Unable to locate locations");
  }
};

// searchById
module.exports.searchById = async (args, context) => {
  if (!args || !args.id) {
    throw new Error("Location ID is required");
  }
  let Location = resolveSchema(args.base_version, "location");
  try {
    const result = await db.query(
      "SELECT id, data FROM Location WHERE id = $1",
      [args.id]
    );
    if (result.rows.length === 0) {
      throw new Error("Location not found");
    }

    let locationData = result.rows[0].data;
    locationData.id = result.rows[0].id;
    return new Location(locationData);
  } catch (error) {
    logger.error("Error searching location by ID:", error);
    throw new Error("Unable to find location");
  }
};

// create
module.exports.create = async (args, context) => {
  let Location = resolveSchema(args.base_version, "location");
  let doc = new Location(args.resource).toJSON();

  try {
    const result = await db.query(
      "INSERT INTO Location (data) VALUES ($1) RETURNING id",
      [JSON.stringify(doc)]
    );

    return {
      id: result.rows[0].id,
    };
  } catch (err) {
    console.error("Error creating Location:", err);
    throw new Error(`Failed to create Location: ${err.message}`);
  }
};

// update
module.exports.update = async (args, context) => {
  try {
    let Location = resolveSchema(args.base_version, "location");
    let updatedLocation = new Location(args.resource).toJSON();

    const result = await db.query(
      "UPDATE Location SET data = $1 WHERE id = $2 RETURNING id",
      [updatedLocation, args.id]
    );

    if (result.rows.length === 0) {
      throw new Error("Location not found or update failed");
    }

    return { id: args.id };
  } catch (err) {
    logger.error("Error updating location:", err);
    throw new Error(`Failed to update location: ${err.message}`);
  }
};

// remove
module.exports.remove = async (args, context) => {
  try {
    const result = await db.query(
      "DELETE FROM Location WHERE id = $1 RETURNING id",
      [args.id]
    );

    if (result.rows.length === 0) {
      throw new Error("Location not found or deletion failed");
    }

    return {
      statusCode: 200,
      message: "Location deleted successfully",
    };
  } catch (err) {
    logger.error("Error deleting location:", err);
    throw new Error(`Failed to delete location: ${err.message}`);
  }
};
