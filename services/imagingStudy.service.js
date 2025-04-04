const { loggers, resolveSchema } = require("@bluehalo/node-fhir-server-core");
const logger = loggers.get("default");
const db = require("../db");

// Simulated database for ImagingStudy
// const db = {
//   imagingStudies: [
//     {
//       _id: "I001",
//       resourceType: "ImagingStudy",
//       identifier: [
//         {
//           system: "http://hospital.smarthealth.org/study-id",
//           value:
//             "1.3.6.1.4.1.14519.5.2.1.1188.4001.866856253970500879015300047605",
//         },
//         {
//           system: "http://hospital.smarthealth.org/accession",
//           value: "ACC001",
//         },
//       ],
//       status: "available",
//       modality: [{ code: "MR", display: "Magnetic Resonance Imaging" }],
//       subject: { reference: "Patient/P001" },
//       started: "2025-02-06T03:22:36.595Z",
//     },
//     {
//       _id: "I002",
//       resourceType: "ImagingStudy",
//       identifier: [
//         {
//           system: "http://hospital.smarthealth.org/study-id",
//           value:
//             "1.3.6.1.4.1.14519.5.2.1.1188.4001.866856253970500879015300047606",
//         },
//         {
//           system: "http://hospital.smarthealth.org/accession",
//           value: "ACC002",
//         },
//       ],
//       status: "available",
//       modality: [{ code: "CT", display: "Computed Tomography" }],
//       subject: { reference: "Patient/P002" },
//       started: "2025-02-07T05:15:25.123Z",
//     },
//   ],
// };

// create
module.exports.create = async (args, context) => {
  let ImagingStudy = resolveSchema(args.base_version, "imagingstudy");
  let doc = new ImagingStudy(args.resource).toJSON();

  try {
    const result = await db.query(
      "INSERT INTO ImagingStudy (data) VALUES ($1) RETURNING id",
      [JSON.stringify(doc)]
    );

    return {
      id: result.rows[0].id,
    };
  } catch (err) {
    logger.error("Error creating ImagingStudy:", err);
    throw new Error(`Failed to create ImagingStudy: ${err.message}`);
  }
};

// search
module.exports.search = async (args, context) => {
  try {
    let BundleEntry = resolveSchema(args.base_version, "bundleentry");
    let Bundle = resolveSchema(args.base_version, "bundle");
    let ImagingStudy = resolveSchema(args.base_version, "imagingstudy");

    const result = await db.query("SELECT data FROM ImagingStudy");

    let studies = result.rows.map((row) => new ImagingStudy(row.data));
    let entries = studies.map((study) => new BundleEntry({ resource: study }));

    return new Bundle({ entry: entries });
  } catch (error) {
    logger.error("Error searching for imaging studies:", error);
    throw new Error("Unable to locate imaging studies");
  }
};

// searchById
module.exports.searchById = async (args, context) => {
  let ImagingStudy = resolveSchema(args.base_version, "imagingstudy");

  try {
    const result = await db.query(
      "SELECT data FROM ImagingStudy WHERE id = $1",
      [args.id]
    );

    if (result.rows.length === 0) {
      throw new Error("Imaging study not found");
    }

    return new ImagingStudy(result.rows[0].data);
  } catch (err) {
    throw new Error(`Failed to retrieve ImagingStudy: ${err.message}`);
  }
};

// update
module.exports.update = async (args, context) => {
  let ImagingStudy = resolveSchema(args.base_version, "imagingstudy");
  let updatedDoc = new ImagingStudy(args.resource).toJSON();

  try {
    const result = await db.query(
      "UPDATE ImagingStudy SET data = $1 WHERE id = $2 RETURNING id",
      [JSON.stringify(updatedDoc), args.id]
    );

    if (result.rowCount === 0) {
      throw new Error("ImagingStudy not found");
    }

    return {
      id: args.id,
      resource_version: "2", // Increment the version for updates
    };
  } catch (err) {
    throw new Error(`Failed to update ImagingStudy: ${err.message}`);
  }
};

// remove
module.exports.remove = async (args, context) => {
  try {
    const result = await db.query(
      "DELETE FROM ImagingStudy WHERE id = $1 RETURNING id",
      [args.id]
    );

    if (result.rowCount === 0) {
      throw new Error("ImagingStudy not found");
    }

    return { message: "ImagingStudy deleted successfully" };
  } catch (err) {
    throw new Error(`Failed to delete ImagingStudy: ${err.message}`);
  }
};
