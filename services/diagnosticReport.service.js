const { loggers, resolveSchema } = require("@bluehalo/node-fhir-server-core");
const logger = loggers.get("default");

// Simulasi database DiagnosticReport
const db = {
  diagnosticReports: [
    {
      _id: "DR001",
      resourceType: "DiagnosticReport",
      identifier: [
        {
          system: "http://example.org/fhir/StructureDefinition/supporting-info",
          value: "ACC110225-4",
        },
      ],
      status: "final",
      effectiveDateTime: "2025-02-13T07:24:02.529Z",
      conclusion: "Test conclusion 1",
      extension: [
        {
          url: "http://hospital.smarthealth.org/diagnosticreport/findings",
          valueString: "Findings 1",
        },
        {
          url: "http://hospital.smarthealth.org/diagnosticreport/recommendation",
          valueString: "Recommendation 1",
        },
        {
          url: "http://hospital.smarthealth.org/diagnosticreport/isAllDoctor",
          valueBoolean: true,
        },
      ],
      resultsInterpreter: [
        { reference: "Practitioner/123", display: "Dr. John Doe" },
      ],
    },
    {
      _id: "DR002",
      resourceType: "DiagnosticReport",
      identifier: [
        {
          system: "http://example.org/fhir/StructureDefinition/supporting-info",
          value: "ACC110225-5",
        },
      ],
      status: "preliminary",
      effectiveDateTime: "2025-03-01T10:24:02.529Z",
      conclusion: "Test conclusion 2",
      extension: [
        {
          url: "http://hospital.smarthealth.org/diagnosticreport/findings",
          valueString: "Findings 2",
        },
        {
          url: "http://hospital.smarthealth.org/diagnosticreport/recommendation",
          valueString: "Recommendation 2",
        },
        {
          url: "http://hospital.smarthealth.org/diagnosticreport/isAllDoctor",
          valueBoolean: false,
        },
      ],
      resultsInterpreter: [
        { reference: "Practitioner/124", display: "Dr. Jane Smith" },
      ],
    },
  ],
};

// search
module.exports.search = async (args, context) => {
  try {
    let BundleEntry = resolveSchema(args.base_version, "bundleentry");
    let Bundle = resolveSchema(args.base_version, "bundle");
    let DiagnosticReport = resolveSchema(args.base_version, "diagnosticreport");

    let results = db.diagnosticReports;

    let diagnosticReports = results.map(
      (result) => new DiagnosticReport(result)
    );
    let entries = diagnosticReports.map(
      (report) => new BundleEntry({ resource: report })
    );
    return new Bundle({ entry: entries });
  } catch (error) {
    logger.error("Error searching for diagnostic reports:", error);
    throw new Error("Unable to locate diagnostic reports");
  }
};

// searchById
module.exports.searchById = async (args, context) => {
  let DiagnosticReport = resolveSchema(args.base_version, "diagnosticreport");
  let result = db.diagnosticReports.find((report) => report._id === args.id);
  if (!result) {
    throw new Error("Diagnostic report not found");
  }
  return new DiagnosticReport(result);
};

// update (PUT method for DiagnosticReport)
module.exports.update = async (args, context) => {
  try {
    // Periksa apakah args dan args.resource ada
    if (!args || !args.resource) {
      throw new Error("Missing resource data in args");
    }

    // Log args untuk debugging
    logger.info("args received:", JSON.stringify(args, null, 2));
    logger.info("args.resource:", JSON.stringify(args.resource, null, 2));

    // Tentukan schema DiagnosticReport berdasarkan versi
    let DiagnosticReport = resolveSchema(args.base_version, "DiagnosticReport");

    // Konversi data DiagnosticReport yang diterima menjadi format JSON
    let updatedReport = new DiagnosticReport(args.resource).toJSON();
    logger.info("Updated diagnostic report data:", updatedReport);

    // Cari indeks diagnostic report berdasarkan ID
    let index = db.diagnosticReports.findIndex(
      (report) => report._id === args.id
    );

    // Jika diagnostic report tidak ditemukan, lempar error
    if (index === -1) {
      throw new Error("Diagnostic report not found");
    }

    // Log data sebelum update
    logger.info(
      "Diagnostic report before update:",
      db.diagnosticReports[index]
    );

    // Update data berdasarkan fields yang diterima
    if (updatedReport.identifier) {
      db.diagnosticReports[index].identifier = updatedReport.identifier;
    }
    if (updatedReport.status) {
      db.diagnosticReports[index].status = updatedReport.status;
    }
    if (updatedReport.effectiveDateTime) {
      db.diagnosticReports[index].effectiveDateTime =
        updatedReport.effectiveDateTime;
    }
    if (updatedReport.conclusion) {
      db.diagnosticReports[index].conclusion = updatedReport.conclusion;
    }
    if (updatedReport.extension) {
      db.diagnosticReports[index].extension = updatedReport.extension;
    }
    if (updatedReport.resultsInterpreter) {
      db.diagnosticReports[index].resultsInterpreter =
        updatedReport.resultsInterpreter;
    }

    // Log data setelah update
    logger.info("Diagnostic report after update:", db.diagnosticReports[index]);

    // Kembalikan instance DiagnosticReport dengan data baru
    const updatedInstance = new DiagnosticReport(db.diagnosticReports[index]);
    return updatedInstance;
  } catch (err) {
    // Log error jika terjadi masalah
    logger.error("Error updating diagnostic report:", err);

    // Kembalikan error response jika terjadi masalah
    return {
      resourceType: "OperationOutcome",
      issue: [
        {
          severity: "error",
          code: "internal",
          details: {
            text: `Unexpected: ${err.message}`,
          },
        },
      ],
    };
  }
};

// remove
module.exports.remove = async (args, context) => {
  try {
    logger.info("args received:", JSON.stringify(args, null, 2));
    // Filter data diagnostic report dengan ID yang tidak sesuai, artinya report terhapus
    db.diagnosticReports = db.diagnosticReports.filter(
      (report) => report._id !== args.id
    );

    return { message: "Diagnostic report deleted successfully" };
  } catch (err) {
    throw new ServerError(
      `Failed to delete diagnostic report: ${err.message}`,
      {
        statusCode: 409,
        issue: [
          {
            severity: "error",
            code: "internal",
            details: {
              text: err.message,
            },
          },
        ],
      }
    );
  }
};
