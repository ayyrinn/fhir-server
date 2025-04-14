const { loggers, resolveSchema } = require("@bluehalo/node-fhir-server-core");
const logger = loggers.get("default");
const supabase = require("../db");

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

    const { data, error } = await supabase.from("diagnosticReport").select("*");

    if (error) throw error;

    const reports = data.map((row) => {
      const basedOn = row.basedOn
        ? [
            {
              reference: `ServiceRequest/${row.basedOn}`,
            },
          ]
        : [];
      const resultInterpreter = row.resultInterpreter
        ? [
            {
              reference: `Practitioner/${row.resultInterpreter}`,
            },
          ]
        : [];

      const resource = {
        resourceType: "DiagnosticReport",
        id: row.id,
        conclusion: row.findings,
        recommendations: row.recommendations,
        isAllDoctor: row.isAllDoctor,
        identifier: row.identifier,
        basedOn: basedOn,
        status: row.status,
        effectiveDateTime: row.effective_dateTime,
        resultsInterpreter: resultInterpreter,
      };
      return new DiagnosticReport(resource);
    });

    let entries = reports.map(
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
    const { data, error } = await supabase
      .from("diagnosticReport")
      .select("*")
      .eq("id", args.id)
      .single();

    if (error || !data) {
      throw new Error("Diagnostic report not found");
    }

    const basedOn = data.basedOn
      ? [{ reference: `ServiceRequest/${data.basedOn}` }]
      : [];

    const resultInterpreter = data.resultInterpreter
      ? [{ reference: `Practitioner/${data.resultInterpreter}` }]
      : [];

    const reportData = {
      resourceType: "DiagnosticReport",
      id: data.id,
      conclusion: data.findings,
      recommendations: data.recommendations,
      isAllDoctor: data.isAllDoctor,
      identifier: data.identifier ? data.identifier : [],
      basedOn: basedOn,
      status: data.status,
      effectiveDateTime: data.effective_dateTime,
      resultsInterpreter: resultInterpreter,
    };

    return new DiagnosticReport(reportData);
  } catch (error) {
    logger.error("Error searching diagnostic report by ID:", error);
    throw new Error("Unable to find diagnostic report");
  }
};

// create
module.exports.create = async (args, context) => {
  let DiagnosticReport = resolveSchema(args.base_version, "diagnosticreport");
  let doc = new DiagnosticReport(context.req.body).toJSON();

  try {
    const {
      identifier,
      findings,
      recommendations,
      isAllDoctor,
      basedOn,
      status,
      effectiveDateTime,
      resultInterpreter,
    } = doc;

    // Insert data into Supabase
    const { data, error } = await supabase.from("diagnosticReport").insert([
      {
        identifier,
        findings,
        recommendations,
        isAllDoctor,
        basedOn,
        status,
        effectiveDateTime,
        resultInterpreter,
      },
    ]);

    if (error) throw error;

    logger.info("✅ Diagnostic report created", data);

    return { id: data?.[0]?.id };
  } catch (err) {
    logger.error("Error creating DiagnosticReport:", err);
    throw new Error(`Failed to create DiagnosticReport: ${err.message}`);
  }
};

// update
module.exports.update = async (args, context) => {
  try {
    let DiagnosticReport = resolveSchema(args.base_version, "diagnosticreport");
    let updatedReport = new DiagnosticReport(context.req.body).toJSON();

    const {
      identifier,
      findings,
      recommendations,
      isAllDoctor,
      basedOn,
      status,
      effectiveDateTime,
      resultInterpreter,
    } = updatedReport;

    // Update the diagnostic report in Supabase
    const { data, error } = await supabase
      .from("diagnosticReport")
      .update({
        identifier,
        findings,
        recommendations,
        isAllDoctor,
        basedOn,
        status,
        effectiveDateTime,
        resultInterpreter,
        updated_at: new Date(),
      })
      .eq("id", args.id)
      .select("id")
      .single();

    if (error || !data)
      throw new Error("Diagnostic report not found or update failed");

    logger.info(`✅ Updated diagnostic report with ID: ${data.id}`);
    return { id: data.id };
  } catch (err) {
    logger.error("Error updating diagnostic report:", err);
    throw new Error(`Failed to update diagnostic report: ${err.message}`);
  }
};

// remove
module.exports.remove = async (args, context) => {
  try {
    const { data, error } = await supabase
      .from("diagnosticReport")
      .delete()
      .eq("id", args.id)
      .select("id")
      .single();

    if (error || !data) throw new Error("Delete failed or report not found");

    return {
      statusCode: 200,
      message: "Diagnostic report deleted successfully",
    };
  } catch (err) {
    logger.error("Error deleting diagnostic report:", err);
    throw new Error(`Failed to delete diagnostic report: ${err.message}`);
  }
};
