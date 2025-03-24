const { loggers, resolveSchema } = require("@bluehalo/node-fhir-server-core");
const logger = loggers.get("default");

// Simulated database for Location
const db = {
  locations: [
    {
      _id: "L001",
      resourceType: "Location",
      status: "active",
      name: "Ruangan MR",
      type: [
        {
          coding: [
            {
              system:
                "http://terminology.hl7.org/CodeSystem/location-physical-type",
              code: "ward",
              display: "Ward",
            },
          ],
        },
      ],
      extension: [
        {
          url: "http://example.org/fhir/StructureDefinition/location-modality",
          valueCodeableConcept: {
            coding: [
              {
                system: "http://dicom.nema.org/resources/ontology/DCM",
                code: "MR",
              },
            ],
          },
        },
      ],
    },
    {
      _id: "L002",
      resourceType: "Location",
      status: "active",
      name: "Ruangan CT",
      type: [
        {
          coding: [
            {
              system:
                "http://terminology.hl7.org/CodeSystem/location-physical-type",
              code: "ward",
              display: "Ward",
            },
          ],
        },
      ],
      extension: [
        {
          url: "http://example.org/fhir/StructureDefinition/location-modality",
          valueCodeableConcept: {
            coding: [
              {
                system: "http://dicom.nema.org/resources/ontology/DCM",
                code: "CT",
              },
            ],
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
    let Location = resolveSchema(args.base_version, "location");

    let results = db.locations;

    let locations = results.map((result) => new Location(result));
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
  let Location = resolveSchema(args.base_version, "location");
  let result = db.locations.find((location) => location._id === args.id);
  if (!result) {
    throw new Error("Location not found");
  }
  return new Location(result);
};

// remove
module.exports.remove = async (args, context) => {
  try {
    logger.info("args received:", JSON.stringify(args, null, 2));
    // Filter data location with non-matching ID to effectively delete it
    db.locations = db.locations.filter((location) => location._id !== args.id);

    return { message: "Location deleted successfully" };
  } catch (err) {
    throw new Error(`Failed to delete location: ${err.message}`);
  }
};
