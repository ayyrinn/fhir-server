const { loggers, resolveSchema } = require("@bluehalo/node-fhir-server-core");
const logger = loggers.get("default");

// Simulated database for ServiceRequest
const db = {
  serviceRequests: [
    {
      _id: "45e8a7f8-8a6d-4a3a-b531-bb9ec7b0c2e1",
      resourceType: "ServiceRequest",
      extension: [
        {
          url: "http://example.org/fhir/StructureDefinition/modality",
          valueCodeableConcept: {
            coding: [
              {
                system: "http://dicom.nema.org/resources/ontology/DCM",
                code: "DX",
              },
            ],
          },
        },
      ],
      identifier: [
        {
          system: "http://hospital.smarthealth.org/accession",
          value: "ACC110225",
        },
      ],
      status: "active",
      priority: "routine",
      code: {
        coding: [
          {
            system: "http://loinc.org",
            code: "24531-6",
            display: "Study",
          },
        ],
      },
      subject: {
        reference: "Patient/19",
        display: "Patient Name",
      },
      occurrenceDateTime: "2025-02-14T03:23:00Z",
      requester: {
        reference: "Practitioner/260ef5de-d06d-4e38-899b-701a4f217ed0",
        display: "Referring Doctor",
      },
      performer: [
        {
          reference: "Practitioner/260ef5de-d06d-4e38-899b-701a4f217ed0",
          display: "PIC Doctor",
        },
      ],
      reasonCode: [
        {
          coding: [
            {
              system: "http://snomed.info/sct",
              code: "386661006",
              display: "Clinical",
            },
          ],
        },
      ],
      insurance: [
        {
          display: "BPJS",
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
    let ServiceRequest = resolveSchema(args.base_version, "servicerequest");

    let results = db.serviceRequests;

    let serviceRequests = results.map((result) => new ServiceRequest(result));
    let entries = serviceRequests.map(
      (serviceRequest) => new BundleEntry({ resource: serviceRequest })
    );
    return new Bundle({ entry: entries });
  } catch (error) {
    logger.error("Error searching for service requests:", error);
    throw new Error("Unable to locate service requests");
  }
};

// searchById
module.exports.searchById = async (args, context) => {
  let ServiceRequest = resolveSchema(args.base_version, "servicerequest");
  let result = db.serviceRequests.find(
    (serviceRequest) => serviceRequest._id === args.id
  );
  if (!result) {
    throw new Error("ServiceRequest not found");
  }
  return new ServiceRequest(result);
};

// remove
module.exports.remove = async (args, context) => {
  try {
    logger.info("args received:", JSON.stringify(args, null, 2));
    // Filter out the service request with the non-matching ID to delete it
    db.serviceRequests = db.serviceRequests.filter(
      (serviceRequest) => serviceRequest._id !== args.id
    );

    return { message: "ServiceRequest deleted successfully" };
  } catch (err) {
    throw new Error(`Failed to delete ServiceRequest: ${err.message}`);
  }
};
