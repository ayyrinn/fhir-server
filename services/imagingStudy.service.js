const { loggers, resolveSchema } = require("@bluehalo/node-fhir-server-core");
const logger = loggers.get("default");

// Simulated database for ImagingStudy
const db = {
  imagingStudies: [
    {
      _id: "I001",
      resourceType: "ImagingStudy",
      identifier: [
        {
          system: "http://hospital.smarthealth.org/study-id",
          value:
            "1.3.6.1.4.1.14519.5.2.1.1188.4001.866856253970500879015300047605",
        },
        {
          system: "http://hospital.smarthealth.org/accession",
          value: "ACC001",
        },
      ],
      status: "available",
      modality: [{ code: "MR", display: "Magnetic Resonance Imaging" }],
      subject: { reference: "Patient/P001" },
      started: "2025-02-06T03:22:36.595Z",
    },
    {
      _id: "I002",
      resourceType: "ImagingStudy",
      identifier: [
        {
          system: "http://hospital.smarthealth.org/study-id",
          value:
            "1.3.6.1.4.1.14519.5.2.1.1188.4001.866856253970500879015300047606",
        },
        {
          system: "http://hospital.smarthealth.org/accession",
          value: "ACC002",
        },
      ],
      status: "available",
      modality: [{ code: "CT", display: "Computed Tomography" }],
      subject: { reference: "Patient/P002" },
      started: "2025-02-07T05:15:25.123Z",
    },
  ],
};

// search
module.exports.search = async (args, context) => {
  try {
    let BundleEntry = resolveSchema(args.base_version, "bundleentry");
    let Bundle = resolveSchema(args.base_version, "bundle");
    let ImagingStudy = resolveSchema(args.base_version, "imagingstudy");

    let results = db.imagingStudies;

    let studies = results.map((result) => new ImagingStudy(result));
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
  let result = db.imagingStudies.find((study) => study._id === args.id);
  if (!result) {
    throw new Error("Imaging study not found");
  }
  return new ImagingStudy(result);
};

// remove
module.exports.remove = async (args, context) => {
  try {
    logger.info("args received:", JSON.stringify(args, null, 2));
    // Filter data imaging study with non-matching ID to effectively delete it
    db.imagingStudies = db.imagingStudies.filter(
      (study) => study._id !== args.id
    );

    return { message: "Imaging study deleted successfully" };
  } catch (err) {
    throw new Error(`Failed to delete imaging study: ${err.message}`);
  }
};
