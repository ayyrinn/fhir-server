const { loggers, resolveSchema } = require("@bluehalo/node-fhir-server-core");
const logger = loggers.get("default");

// Simulated database for Observation
const db = {
  observations: [
    {
      _id: "O001",
      resourceType: "Observation",
      partOf: [
        {
          reference: "Procedure/PROC-987654",
          display: "CT Scan Procedure",
        },
      ],
      status: "final",
      subject: {
        reference: "Patient/12345",
        display: "John Doe",
      },
      effectiveDateTime: "2024-02-12T12:00:00Z",
      performer: [
        {
          reference: "Practitioner/45678",
          display: "Dr. Smith",
        },
      ],
      component: [
        {
          code: {
            coding: [
              {
                system: "http://loinc.org",
                code: "113733",
                display: "CT Dose Length Product",
              },
            ],
          },
          valueQuantity: {
            value: 120.5,
            unit: "mGy·cm",
            system: "http://unitsofmeasure.org",
            code: "mGy·cm",
          },
        },
        {
          code: {
            coding: [
              {
                system: "http://loinc.org",
                code: "113730",
                display: "CT Tube Current",
              },
            ],
          },
          valueQuantity: {
            value: 250,
            unit: "mA",
            system: "http://unitsofmeasure.org",
            code: "mA",
          },
        },
        {
          code: {
            coding: [
              {
                system: "http://loinc.org",
                code: "113731",
                display: "CT Exposure Time",
              },
            ],
          },
          valueQuantity: {
            value: 1.5,
            unit: "s",
            system: "http://unitsofmeasure.org",
            code: "s",
          },
        },
      ],
    },
    {
      _id: "O002",
      resourceType: "Observation",
      partOf: [
        {
          reference: "Procedure/PROC-987655",
          display: "X-Ray Procedure",
        },
      ],
      status: "preliminary",
      subject: {
        reference: "Patient/67890",
        display: "Jane Doe",
      },
      effectiveDateTime: "2024-02-13T14:00:00Z",
      performer: [
        {
          reference: "Practitioner/12345",
          display: "Dr. John",
        },
      ],
      component: [
        {
          code: {
            coding: [
              {
                system: "http://loinc.org",
                code: "113734",
                display: "X-Ray Dose Length Product",
              },
            ],
          },
          valueQuantity: {
            value: 150.3,
            unit: "mGy·cm",
            system: "http://unitsofmeasure.org",
            code: "mGy·cm",
          },
        },
        {
          code: {
            coding: [
              {
                system: "http://loinc.org",
                code: "113732",
                display: "X-Ray Tube Current",
              },
            ],
          },
          valueQuantity: {
            value: 200,
            unit: "mA",
            system: "http://unitsofmeasure.org",
            code: "mA",
          },
        },
        {
          code: {
            coding: [
              {
                system: "http://loinc.org",
                code: "113735",
                display: "X-Ray Exposure Time",
              },
            ],
          },
          valueQuantity: {
            value: 2.0,
            unit: "s",
            system: "http://unitsofmeasure.org",
            code: "s",
          },
        },
      ],
    },
  ],
};

// search
module.exports.search = async (args, context) => {
  try {
    let BundleEntry = resolveSchema(args.base_version, "bundleentry");
    let Bundle = resolveSchema(args.base_version, "bundle");
    let Observation = resolveSchema(args.base_version, "observation");

    let results = db.observations;

    let observations = results.map((result) => new Observation(result));
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
  let Observation = resolveSchema(args.base_version, "observation");
  let result = db.observations.find(
    (observation) => observation._id === args.id
  );
  if (!result) {
    throw new Error("Observation not found");
  }
  return new Observation(result);
};

// remove
module.exports.remove = async (args, context) => {
  try {
    logger.info("args received:", JSON.stringify(args, null, 2));
    // Filter data observation with non-matching ID to effectively delete it
    db.observations = db.observations.filter(
      (observation) => observation._id !== args.id
    );

    return { message: "Observation deleted successfully" };
  } catch (err) {
    throw new Error(`Failed to delete observation: ${err.message}`);
  }
};
