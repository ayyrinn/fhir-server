const { loggers, resolveSchema } = require("@bluehalo/node-fhir-server-core");
const logger = loggers.get("default");
const supabase = require("../db");

// search
module.exports.search = async (args, context) => {
  try {
    let BundleEntry = resolveSchema(args.base_version, "bundleentry");
    let Bundle = resolveSchema(args.base_version, "bundle");
    let Practitioner = resolveSchema(args.base_version, "practitioner");

    const { data, error } = await supabase.rpc("search_practitioner");

    if (error) {
      throw error;
    }

    const practitioners = data.map((item) => new Practitioner(item));

    const entries = practitioners.map(
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
  if (!args || !args.id) {
    throw new Error("Practitioner ID is required");
  }

  let Practitioner = resolveSchema(args.base_version, "practitioner");

  try {
    const { data, error } = await supabase.rpc("search_practitioner_by_id", {
      practitioner_id: args.id,
    });

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      throw new Error("Practitioner not found");
    }

    let practitionerData = data;
    return new Practitioner(practitionerData);
  } catch (error) {
    logger.error("Error searching practitioner by ID:", error);
    throw new Error("Unable to find practitioner");
  }
};

// create
module.exports.create = async (args, context) => {
  let Practitioner = resolveSchema(args.base_version, "practitioner");
  let doc = new Practitioner(context.req.body).toJSON();

  try {
    const { data, error } = await supabase.rpc("create_practitioner", {
      payload: doc,
    });

    if (error) {
      throw error;
    }

    return {
      id: data,
    };
  } catch (err) {
    console.error("Error creating Practitioner:", err);
    throw new Error(`Failed to create Practitioner: ${err.message}`);
  }
};

// update
module.exports.update = async (args, context) => {
  let Practitioner = resolveSchema(args.base_version, "practitioner");
  let updatedPractitioner = new Practitioner(context.req.body).toJSON();
  try {
    const { data, error } = await supabase.rpc("update_practitioner", {
      payload: updatedPractitioner,
      practitioner_id: args.id,
    });

    if (error) {
      throw error;
    }

    if (!data || data !== args.id) {
      throw new Error("Practitioner not found or update failed");
    }

    return { id: data };
  } catch (err) {
    logger.error("Error updating practitioner:", err);
    throw new Error(`Failed to update practitioner: ${err.message}`);
  }
};

// remove
module.exports.remove = async (args, context) => {
  try {
    const { data, error } = await supabase
      .from("practitioner")
      .delete()
      .eq("id", args.id)
      .select("id");

    if (error) {
      throw new Error(error.message);
    }

    if (!data || data.length === 0) {
      throw new Error("Practitioner not found or deletion failed");
    }

    return {
      statusCode: 200,
      message: "Practitioner deleted successfully",
    };
  } catch (err) {
    logger.error("Error deleting practitioner:", err);
    throw new Error(`Failed to delete practitioner: ${err.message}`);
  }
};
