const { loggers, resolveSchema } = require("@bluehalo/node-fhir-server-core");
const logger = loggers.get("default");
const supabase = require("../db");

// search
module.exports.search = async (args, context) => {
  try {
    let BundleEntry = resolveSchema(args.base_version, "bundleentry");
    let Bundle = resolveSchema(args.base_version, "bundle");
    let Procedure = resolveSchema(args.base_version, "procedure");

    const { data, error } = await supabase.rpc("search_procedures");

    if (error) {
      throw error;
    }

    const procedures = data.map((item) => new Procedure(item));

    const entries = procedures.map(
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
  if (!args || !args.id) {
    throw new Error("Procedure ID is required");
  }

  let Procedure = resolveSchema(args.base_version, "procedure");

  try {
    const { data, error } = await supabase.rpc("search_procedure_by_id", {
      procedure_id: args.id,
    });

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      throw new Error("Procedure not found");
    }

    let procedureData = data;
    return new Procedure(procedureData);
  } catch (error) {
    logger.error("Error searching procedure by ID:", error);
    throw new Error("Unable to find procedure");
  }
};

// create
module.exports.create = async (args, context) => {
  let Procedure = resolveSchema(args.base_version, "procedure");
  let doc = new Procedure(context.req.body).toJSON();

  try {
    const { data, error } = await supabase.rpc("create_procedure", {
      payload: doc,
    });

    if (error) {
      throw error;
    }

    return {
      id: data,
    };
  } catch (err) {
    console.error("Error creating Procedure:", err);
    throw new Error(`Failed to create Procedure: ${err.message}`);
  }
};

// update
module.exports.update = async (args, context) => {
  let Procedure = resolveSchema(args.base_version, "procedure");
  let updatedProcedure = new Procedure(context.req.body).toJSON();
  try {
    const { data, error } = await supabase.rpc("update_procedure", {
      payload: updatedProcedure,
      procedure_id: args.id,
    });

    if (error) {
      throw error;
    }

    if (!data || data !== args.id) {
      throw new Error("Procedure not found or update failed");
    }

    return { id: data };
  } catch (err) {
    logger.error("Error updating procedure:", err);
    throw new Error(`Failed to update procedure: ${err.message}`);
  }
};

// remove
module.exports.remove = async (args, context) => {
  try {
    const { data, error } = await supabase
      .from("procedure")
      .delete()
      .eq("id", args.id)
      .select("id");

    if (error) {
      throw new Error(error.message);
    }

    if (!data || data.length === 0) {
      throw new Error("Procedure not found or deletion failed");
    }

    return {
      statusCode: 200,
      message: "Procedure deleted successfully",
    };
  } catch (err) {
    logger.error("Error deleting procedure:", err);
    throw new Error(`Failed to delete procedure: ${err.message}`);
  }
};
