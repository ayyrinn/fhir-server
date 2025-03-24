const { loggers, resolveSchema } = require("@bluehalo/node-fhir-server-core");
const logger = loggers.get("default");

// Simulated database for Procedure
const db = {
  procedures: [
    {
      _id: "d7a7e7be-8c7d-4b1c-9885-e7a6d8eb5827",
      resourceType: "Procedure",
      identifier: [
        {
          system: "http://hospital.smarthealth.org/accession",
          value: "ACC110225",
        },
        {
          system: "http://hospital.smarthealth.org/sps-id",
          value: "SPS-00000051",
        },
        {
          system: "http://hospital.smarthealth.org/study-id",
          value: "2.25.51861836573944328365770086254210863534",
        },
        {
          system: "http://hospital.smarthealth.org/rp-id",
          value: "RP-00000051",
        },
      ],
      basedOn: [
        {
          reference: "ServiceRequest/id",
        },
      ],
      status: "in-progress",
      performedDateTime: "2025-02-11T02:53:36.583Z",
      performer: [
        {
          function: {
            coding: [
              {
                system:
                  "http://terminology.hl7.org/CodeSystem/procedure-performer",
                code: "Radiografer",
                display: "Radiografer",
              },
            ],
          },
          actor: {
            reference: "Practitioner/997556f5-87e7-47d6-9fab-f36e615849be",
            display: "Radiographer",
          },
        },
        {
          function: {
            coding: [
              {
                system:
                  "http://terminology.hl7.org/CodeSystem/procedure-performer",
                code: "Operator",
                display: "Operator",
              },
            ],
          },
          actor: {
            reference: "Practitioner/14873fcd-b52c-471c-8b65-56ab2e532b84",
            display: "Operator",
          },
        },
      ],
      location: {
        reference: "Location/dx",
        display: "Ruangan DX",
      },
    },
    {
      _id: "d9b9e9ce-8d7c-4b2c-9876-c1f8e2e66291",
      resourceType: "Procedure",
      identifier: [
        {
          system: "http://hospital.smarthealth.org/accession",
          value: "ACC110226",
        },
        {
          system: "http://hospital.smarthealth.org/sps-id",
          value: "SPS-00000052",
        },
        {
          system: "http://hospital.smarthealth.org/study-id",
          value: "2.25.51861836573944328365770086254210863535",
        },
        {
          system: "http://hospital.smarthealth.org/rp-id",
          value: "RP-00000052",
        },
      ],
      basedOn: [
        {
          reference: "ServiceRequest/id",
        },
      ],
      status: "completed",
      performedDateTime: "2025-02-12T08:53:36.583Z",
      performer: [
        {
          function: {
            coding: [
              {
                system:
                  "http://terminology.hl7.org/CodeSystem/procedure-performer",
                code: "Radiografer",
                display: "Radiografer",
              },
            ],
          },
          actor: {
            reference: "Practitioner/997556f5-87e7-47d6-9fab-f36e615849be",
            display: "Radiographer",
          },
        },
      ],
      location: {
        reference: "Location/dx",
        display: "Ruangan DX",
      },
    },
  ],
};

// search
module.exports.search = async (args, context) => {
  try {
    let BundleEntry = resolveSchema(args.base_version, "bundleentry");
    let Bundle = resolveSchema(args.base_version, "bundle");
    let Procedure = resolveSchema(args.base_version, "procedure");

    let results = db.procedures;

    let procedures = results.map((result) => new Procedure(result));
    let entries = procedures.map(
      (procedure) => new BundleEntry({ resource: procedure })
    );
    return new Bundle({ entry: entries });
  } catch (error) {
    logger.error("Error searching for procedures:", error);
    throw new Error("Unable to locate procedures");
  }
};

// searchById
module.exports.searchById = async (args, context) => {
  let Procedure = resolveSchema(args.base_version, "procedure");
  let result = db.procedures.find((procedure) => procedure._id === args.id);
  if (!result) {
    throw new Error("Procedure not found");
  }
  return new Procedure(result);
};

// remove
module.exports.remove = async (args, context) => {
  try {
    logger.info("args received:", JSON.stringify(args, null, 2));
    // Filter data procedure with non-matching ID to effectively delete it
    db.procedures = db.procedures.filter(
      (procedure) => procedure._id !== args.id
    );

    return { message: "Procedure deleted successfully" };
  } catch (err) {
    throw new Error(`Failed to delete procedure: ${err.message}`);
  }
};
