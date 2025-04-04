const { loggers, resolveSchema } = require("@bluehalo/node-fhir-server-core");
const logger = loggers.get("default");
const db = require("../db");

// Simulated database for ServiceRequest
// const db = {
//   serviceRequests: [
//     {
//       _id: "45e8a7f8-8a6d-4a3a-b531-bb9ec7b0c2e1",
//       resourceType: "ServiceRequest",
//       extension: [
//         {
//           url: "http://example.org/fhir/StructureDefinition/modality",
//           valueCodeableConcept: {
//             coding: [
//               {
//                 system: "http://dicom.nema.org/resources/ontology/DCM",
//                 code: "DX",
//               },
//             ],
//           },
//         },
//       ],
//       identifier: [
//         {
//           system: "http://hospital.smarthealth.org/accession",
//           value: "ACC110225",
//         },
//       ],
//       status: "active",
//       priority: "routine",
//       code: {
//         coding: [
//           {
//             system: "http://loinc.org",
//             code: "24531-6",
//             display: "Study",
//           },
//         ],
//       },
//       subject: {
//         reference: "Patient/19",
//         display: "Patient Name",
//       },
//       occurrenceDateTime: "2025-02-14T03:23:00Z",
//       requester: {
//         reference: "Practitioner/260ef5de-d06d-4e38-899b-701a4f217ed0",
//         display: "Referring Doctor",
//       },
//       performer: [
//         {
//           reference: "Practitioner/260ef5de-d06d-4e38-899b-701a4f217ed0",
//           display: "PIC Doctor",
//         },
//       ],
//       reasonCode: [
//         {
//           coding: [
//             {
//               system: "http://snomed.info/sct",
//               code: "386661006",
//               display: "Clinical",
//             },
//           ],
//         },
//       ],
//       insurance: [
//         {
//           display: "BPJS",
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
    let ServiceRequest = resolveSchema(args.base_version, "servicerequest");

    const result = await db.query("SELECT id, data FROM ServiceRequest");

    let serviceRequests = result.rows.map((row) => {
      let serviceRequestData = row.data;
      serviceRequestData.id = row.id;
      return new ServiceRequest(serviceRequestData);
    });

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
  if (!args || !args.id) {
    throw new Error("ServiceRequest ID is required");
  }

  let ServiceRequest = resolveSchema(args.base_version, "servicerequest");

  try {
    const result = await db.query(
      "SELECT id, data FROM ServiceRequest WHERE id = $1",
      [args.id]
    );

    if (result.rows.length === 0) {
      throw new Error("ServiceRequest not found");
    }

    let serviceRequestData = result.rows[0].data;
    serviceRequestData.id = result.rows[0].id;
    return new ServiceRequest(serviceRequestData);
  } catch (error) {
    logger.error("Error searching service request by ID:", error);
    throw new Error("Unable to find service request");
  }
};

// create
module.exports.create = async (args, context) => {
  let ServiceRequest = resolveSchema(args.base_version, "servicerequest");
  let doc = new ServiceRequest(args.resource).toJSON();

  try {
    const result = await db.query(
      "INSERT INTO ServiceRequest (data) VALUES ($1) RETURNING id",
      [JSON.stringify(doc)]
    );

    return {
      id: result.rows[0].id,
    };
  } catch (err) {
    logger.error("Error creating ServiceRequest:", err);
    throw new Error(`Failed to create ServiceRequest: ${err.message}`);
  }
};

// update
module.exports.update = async (args, context) => {
  try {
    let ServiceRequest = resolveSchema(args.base_version, "servicerequest");
    let updatedServiceRequest = new ServiceRequest(args.resource).toJSON();

    const result = await db.query(
      "UPDATE ServiceRequest SET data = $1 WHERE id = $2 RETURNING id",
      [JSON.stringify(updatedServiceRequest), args.id]
    );

    if (result.rows.length === 0) {
      throw new Error("ServiceRequest not found or update failed");
    }

    return { id: args.id };
  } catch (err) {
    logger.error("Error updating service request:", err);
    throw new Error(`Failed to update service request: ${err.message}`);
  }
};

// remove
module.exports.remove = async (args, context) => {
  try {
    const result = await db.query(
      "DELETE FROM ServiceRequest WHERE id = $1 RETURNING id",
      [args.id]
    );

    if (result.rows.length === 0) {
      throw new Error("ServiceRequest not found or deletion failed");
    }

    return {
      statusCode: 200,
      message: "ServiceRequest deleted successfully",
    };
  } catch (err) {
    logger.error("Error deleting service request:", err);
    throw new Error(`Failed to delete service request: ${err.message}`);
  }
};
