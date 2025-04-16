const { loggers, resolveSchema } = require("@bluehalo/node-fhir-server-core");
const logger = loggers.get("default");
const supabase = require("../db");

// search
module.exports.search = async (args, context) => {
  try {
    let BundleEntry = resolveSchema(args.base_version, "bundleentry");
    let Bundle = resolveSchema(args.base_version, "bundle");
    let DiagnosticReport = resolveSchema(args.base_version, "diagnosticreport");

    const { data, error } = await supabase.rpc("search_diagnostic_reports");

    if (error) {
      throw error;
    }

    const diagnosticReports = data.map((item) => new DiagnosticReport(item));

    const entries = diagnosticReports.map(
      (diagnosticReport) => new BundleEntry({ resource: diagnosticReport })
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
    const { data, error } = await supabase.rpc(
      "search_diagnostic_report_by_id",
      {
        report_id: args.id,
      }
    );

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      throw new Error("DiagnosticReport not found");
    }

    let reportData = data;

    return new DiagnosticReport(reportData);
  } catch (error) {
    logger.error("Error searching DiagnosticReport by ID", {
      report_id: args.id,
      error: {
        message: error.message,
        stack: error.stack,
      },
    });
    throw new Error("Unable to find diagnostic report");
  }
};

// create
module.exports.create = async (args, context) => {
  let DiagnosticReport = resolveSchema(args.base_version, "diagnosticreport");
  let doc = new DiagnosticReport(context.req.body).toJSON();

  try {
    const { data, error } = await supabase.rpc("create_diagnostic_report", {
      payload: doc,
    });

    if (error) {
      throw error;
    }

    return {
      id: data,
    };
  } catch (err) {
    logger.error("Error creating DiagnosticReport:", err);
    throw new Error(`Failed to create DiagnosticReport: ${err.message}`);
  }
};

// update
module.exports.update = async (args, context) => {
  let DiagnosticReport = resolveSchema(args.base_version, "diagnosticreport");
  let updatedReport = new DiagnosticReport(context.req.body).toJSON();
  try {
    const { data, error } = await supabase.rpc("update_diagnostic_report", {
      report_id: args.id,
      payload: updatedReport,
    });

    if (error) {
      throw error;
    }

    if (!data || data !== args.id) {
      throw new Error("DiagnosticReport not found or update failed");
    }

    return { id: data };
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
