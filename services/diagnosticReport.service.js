const { loggers, resolveSchema } = require("@bluehalo/node-fhir-server-core");
const logger = loggers.get("default");
const db = require("../db");

// Simulasi database DiagnosticReport
// const db = {
//   diagnosticReports: [
//     {
//       _id: "DR001",
//       resourceType: "DiagnosticReport",
//       identifier: [
//         {
//           system: "http://example.org/fhir/StructureDefinition/supporting-info",
//           value: "ACC110225-4",
//         },
//       ],
//       status: "final",
//       effectiveDateTime: "2025-02-13T07:24:02.529Z",
//       conclusion: "Test conclusion 1",
//       extension: [
//         {
//           url: "http://hospital.smarthealth.org/diagnosticreport/findings",
//           valueString: "Findings 1",
//         },
//         {
//           url: "http://hospital.smarthealth.org/diagnosticreport/recommendation",
//           valueString: "Recommendation 1",
//         },
//         {
//           url: "http://hospital.smarthealth.org/diagnosticreport/isAllDoctor",
//           valueBoolean: true,
//         },
//       ],
//       resultsInterpreter: [
//         { reference: "Practitioner/123", display: "Dr. John Doe" },
//       ],
//     },
//     {
//       _id: "DR002",
//       resourceType: "DiagnosticReport",
//       identifier: [
//         {
//           system: "http://example.org/fhir/StructureDefinition/supporting-info",
//           value: "ACC110225-5",
//         },
//       ],
//       status: "preliminary",
//       effectiveDateTime: "2025-03-01T10:24:02.529Z",
//       conclusion: "Test conclusion 2",
//       extension: [
//         {
//           url: "http://hospital.smarthealth.org/diagnosticreport/findings",
//           valueString: "Findings 2",
//         },
//         {
//           url: "http://hospital.smarthealth.org/diagnosticreport/recommendation",
//           valueString: "Recommendation 2",
//         },
//         {
//           url: "http://hospital.smarthealth.org/diagnosticreport/isAllDoctor",
//           valueBoolean: false,
//         },
//       ],
//       resultsInterpreter: [
//         { reference: "Practitioner/124", display: "Dr. Jane Smith" },
//       ],
//     },
//   ],
// };

// search
module.exports.search = async (args, context) => {
  try {
    let BundleEntry = resolveSchema(args.base_version, "bundleentry");
    let Bundle = resolveSchema(args.base_version, "bundle");
    let DiagnosticReport = resolveSchema(args.base_version, "diagnosticreport");

    const result = await db.query("SELECT id, data FROM DiagnosticReport");

    let diagnosticReports = result.rows.map((row) => {
      let reportData = row.data;
      reportData.id = row.id;
      return new DiagnosticReport(reportData);
    });

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
  if (!args || !args.id) {
    throw new Error("DiagnosticReport ID is required");
  }

  let DiagnosticReport = resolveSchema(args.base_version, "diagnosticreport");

  try {
    const result = await db.query(
      "SELECT id, data FROM DiagnosticReport WHERE id = $1",
      [args.id]
    );

    if (result.rows.length === 0) {
      throw new Error("Diagnostic report not found");
    }

    let reportData = result.rows[0].data;
    reportData.id = result.rows[0].id;
    return new DiagnosticReport(reportData);
  } catch (error) {
    logger.error("Error searching diagnostic report by ID:", error);
    throw new Error("Unable to find diagnostic report");
  }
};

// create
module.exports.create = async (args, context) => {
  let DiagnosticReport = resolveSchema(args.base_version, "diagnosticreport");
  let doc = new DiagnosticReport(args.resource).toJSON();

  try {
    const result = await db.query(
      "INSERT INTO DiagnosticReport (data) VALUES ($1) RETURNING id",
      [JSON.stringify(doc)]
    );

    return {
      id: result.rows[0].id,
    };
  } catch (err) {
    logger.error("Error creating DiagnosticReport:", err);
    throw new Error(`Failed to create DiagnosticReport: ${err.message}`);
  }
};

// update
module.exports.update = async (args, context) => {
  try {
    let DiagnosticReport = resolveSchema(args.base_version, "diagnosticreport");
    let updatedReport = new DiagnosticReport(args.resource).toJSON();

    const result = await db.query(
      "UPDATE DiagnosticReport SET data = $1 WHERE id = $2 RETURNING id",
      [JSON.stringify(updatedReport), args.id]
    );

    if (result.rows.length === 0) {
      throw new Error("Diagnostic report not found or update failed");
    }

    return { id: args.id };
  } catch (err) {
    logger.error("Error updating diagnostic report:", err);
    throw new Error(`Failed to update diagnostic report: ${err.message}`);
  }
};

// remove
module.exports.remove = async (args, context) => {
  try {
    const result = await db.query(
      "DELETE FROM DiagnosticReport WHERE id = $1 RETURNING id",
      [args.id]
    );

    if (result.rows.length === 0) {
      throw new Error("Diagnostic report not found or deletion failed");
    }

    return {
      statusCode: 200,
      message: "Diagnostic report deleted successfully",
    };
  } catch (err) {
    logger.error("Error deleting diagnostic report:", err);
    throw new Error(`Failed to delete diagnostic report: ${err.message}`);
  }
};
