const { loggers, resolveSchema } = require("@bluehalo/node-fhir-server-core");
const logger = loggers.get("default");

// Simulated database for Practitioner
const db = {
  practitioners: [
    {
      _id: "14873fcd-b52c-471c-8b65-56ab2e532b84",
      resourceType: "Practitioner",
      extension: [
        {
          url: "http://example.org/fhir/StructureDefinition/practitioner-role",
          valueCoding: {
            system: "http://example.org/fhir/practitioner-roles",
            display: "superadmin",
          },
        },
        {
          url: "http://example.org/fhir/StructureDefinition/optional-1",
          valueString: "Optional 1",
        },
        {
          url: "http://example.org/fhir/StructureDefinition/optional-2",
          valueString: "Optional 2",
        },
        {
          url: "http://example.org/fhir/StructureDefinition/optional-3",
          valueString: "Optional 3",
        },
      ],
      active: true,
      name: [
        {
          use: "official",
          family: "superadmin",
          given: ["superadmin"],
        },
      ],
    },
    {
      _id: "12345abc-de67-890f-gh12-ijklmn34opqr",
      resourceType: "Practitioner",
      extension: [
        {
          url: "http://example.org/fhir/StructureDefinition/practitioner-role",
          valueCoding: {
            system: "http://example.org/fhir/practitioner-roles",
            display: "admin",
          },
        },
        {
          url: "http://example.org/fhir/StructureDefinition/optional-1",
          valueString: "Optional 4",
        },
        {
          url: "http://example.org/fhir/StructureDefinition/optional-2",
          valueString: "Optional 5",
        },
      ],
      active: true,
      name: [
        {
          use: "official",
          family: "admin",
          given: ["admin"],
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
    let Practitioner = resolveSchema(args.base_version, "practitioner");

    let results = db.practitioners;

    let practitioners = results.map((result) => new Practitioner(result));
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
  let Practitioner = resolveSchema(args.base_version, "practitioner");
  let result = db.practitioners.find(
    (practitioner) => practitioner._id === args.id
  );
  if (!result) {
    throw new Error("Practitioner not found");
  }
  return new Practitioner(result);
};

// remove
module.exports.remove = async (args, context) => {
  try {
    logger.info("args received:", JSON.stringify(args, null, 2));
    // Filter data practitioner with non-matching ID to effectively delete it
    db.practitioners = db.practitioners.filter(
      (practitioner) => practitioner._id !== args.id
    );

    return { message: "Practitioner deleted successfully" };
  } catch (err) {
    throw new Error(`Failed to delete practitioner: ${err.message}`);
  }
};
