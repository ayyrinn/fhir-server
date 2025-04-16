const { loggers, resolveSchema } = require("@bluehalo/node-fhir-server-core");
const logger = loggers.get("default");
const supabase = require("../db");

// search
module.exports.search = async (args, context) => {
  try {
    let BundleEntry = resolveSchema(args.base_version, "bundleentry");
    let Bundle = resolveSchema(args.base_version, "bundle");
    let Patient = resolveSchema(args.base_version, "patient");

    const { data, error } = await supabase.rpc("search_patient");

    if (error) throw error;

    const patients = data.map((item) => new Patient(item));

    const entries = patients.map(
      (patient) => new BundleEntry({ resource: patient })
    );
    return new Bundle({ entry: entries });
  } catch (error) {
    logger.error("Error searching for patients:", error);
    throw new Error("Unable to locate patients");
  }
};

// searchById
module.exports.searchById = async (args, context) => {
  if (!args || !args.id) {
    throw new Error("Patient ID is required");
  }
  let Patient = resolveSchema(args.base_version, "patient");
  try {
    const { data, error } = await supabase.rpc("search_patient_by_id", {
      patient_id: args.id,
    });

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      throw new Error("ServiceRequest not found");
    }

    let patientData = data;

    return new Patient(patientData);
  } catch (error) {
    logger.error("Error searching patient by ID:", error);
    throw new Error("Unable to find patient");
  }
};

// create
module.exports.create = async (args, context) => {
  let Patient = resolveSchema(args.base_version, "patient");
  let patientData = new Patient(context.req.body).toJSON();

  try {
    const { data, error } = await supabase.rpc("create_patient", {
      payload: patientData,
    });

    if (error) {
      throw error;
    }

    return {
      id: data,
    };
  } catch (err) {
    console.error("Error inserting patient:", err);
    throw new Error(`Failed to insert patient: ${err.message}`);
  }
};

// update
module.exports.update = async (args, context) => {
  let Patient = resolveSchema(args.base_version, "patient");
  let updatedPatient = new Patient(context.req.body).toJSON();
  try {
    const { data, error } = await supabase.rpc("update_patient", {
      payload: updatedPatient,
      patient_id: args.id,
    });

    if (error) {
      throw error;
    }

    if (!data || data !== args.id) {
      throw new Error("Patient not found or update failed");
    }

    return { id: data };
  } catch (err) {
    logger.error("Error updating patient:", err);
    throw new Error(`Failed to update patient: ${err.message}`);
  }
};

// remove
module.exports.remove = async (args, context) => {
  try {
    const { data, error } = await supabase
      .from("patient")
      .delete()
      .eq("id", args.id)
      .select("id")
      .single();

    if (error || !data) throw new Error("Patient not found or deletion failed");

    return {
      statusCode: 200,
      message: "Patient deleted successfully",
    };
  } catch (err) {
    logger.error("Error deleting patient:", err);
    throw new Error(`Failed to delete patient: ${err.message}`);
  }
};
