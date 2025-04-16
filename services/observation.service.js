const { loggers, resolveSchema } = require("@bluehalo/node-fhir-server-core");
const logger = loggers.get("default");
const supabase = require("../db");

// search
module.exports.search = async (args, context) => {
  try {
    let BundleEntry = resolveSchema(args.base_version, "bundleentry");
    let Bundle = resolveSchema(args.base_version, "bundle");
    let Observation = resolveSchema(args.base_version, "observation");

    const { data, error } = await supabase.rpc("search_observations");

    if (error) {
      throw error;
    }

    const observations = data.map((item) => new Observation(item));
    const entries = observations.map(
      (observation) => new BundleEntry({ resource: observation })
    );
    return new Bundle({ entry: entries });
  } catch (error) {
    logger.error("Error searching for observations:", error);
    throw new Error("Unable to locate observations");
  }
};

// searchById
module.exports.searchById = async (args, context) => {
  if (!args || !args.id) {
    throw new Error("Observation ID is required");
  }

  let Observation = resolveSchema(args.base_version, "observation");

  try {
    const { data, error } = await supabase.rpc("search_observation_by_id", {
      observation_id: args.id,
    });

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      throw new Error("Observation not found");
    }

    let observationData = data;
    return new Observation(observationData);
  } catch (error) {
    logger.error("Error searching observation by ID:", error);
    throw new Error("Unable to find observation");
  }
};

// create
module.exports.create = async (args, context) => {
  let Observation = resolveSchema(args.base_version, "observation");
  let doc = new Observation(context.req.body).toJSON();

  try {
    const { data, error } = await supabase.rpc("create_observation", {
      payload: doc,
    });

    if (error) {
      throw error;
    }

    return {
      id: data,
    };
  } catch (err) {
    console.error("Error creating Observation:", err);
    throw new Error(`Failed to create Observation: ${err.message}`);
  }
};

// update
module.exports.update = async (args, context) => {
  let Observation = resolveSchema(args.base_version, "observation");
  let updatedObservation = new Observation(context.req.body).toJSON();
  try {
    const { data, error } = await supabase.rpc("update_observation", {
      payload: updatedObservation,
      observation_id: args.id,
    });

    if (error) {
      throw error;
    }

    if (!data || data !== args.id) {
      throw new Error("Observation not found or update failed");
    }

    return { id: data };
  } catch (err) {
    logger.error("Error updating observation:", err);
    throw new Error(`Failed to update observation: ${err.message}`);
  }
};

// remove
module.exports.remove = async (args, context) => {
  try {
    const { data, error } = await supabase
      .from("observation")
      .delete()
      .eq("id", args.id)
      .select("id");

    if (error) {
      throw new Error(error.message);
    }

    if (!data || data.length === 0) {
      throw new Error("Observation not found or deletion failed");
    }

    return {
      statusCode: 200,
      message: "Observation deleted successfully",
    };
  } catch (err) {
    logger.error("Error deleting observation:", err);
    throw new Error(`Failed to delete observation: ${err.message}`);
  }
};
