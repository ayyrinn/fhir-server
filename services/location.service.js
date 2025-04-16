const { loggers, resolveSchema } = require("@bluehalo/node-fhir-server-core");
const logger = loggers.get("default");
const supabase = require("../db");

// search
module.exports.search = async (args, context) => {
  try {
    let BundleEntry = resolveSchema(args.base_version, "bundleentry");
    let Bundle = resolveSchema(args.base_version, "bundle");
    let Location = resolveSchema(args.base_version, "location");

    const { data, error } = await supabase.rpc("search_locations");

    if (error) {
      throw error;
    }

    const locations = data.map((item) => new Location(item));

    const entries = locations.map(
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
  if (!args || !args.id) {
    throw new Error("Location ID is required");
  }
  let Location = resolveSchema(args.base_version, "location");
  try {
    const { data, error } = await supabase.rpc("search_location_by_id", {
      location_id: args.id,
    });

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      throw new Error("Location not found");
    }

    let locationData = data;
    return new Location(locationData);
  } catch (error) {
    logger.error("Error searching location by ID:", error);
    throw new Error("Unable to find location");
  }
};

// create
module.exports.create = async (args, context) => {
  let Location = resolveSchema(args.base_version, "location");
  let doc = new Location(context.req.body).toJSON();

  try {
    const { data, error } = await supabase.rpc("create_location", {
      payload: doc,
    });

    if (error) {
      throw error;
    }

    return {
      id: data,
    };
  } catch (err) {
    console.error("Error creating Location:", err);
    throw new Error(`Failed to create Location: ${err.message}`);
  }
};

// update
module.exports.update = async (args, context) => {
  let Location = resolveSchema(args.base_version, "location");
  let updatedLocation = new Location(context.req.body).toJSON();
  try {
    const { data, error } = await supabase.rpc("update_location", {
      payload: updatedLocation,
      location_id: args.id,
    });

    if (error) {
      throw error;
    }

    if (!data || data !== args.id) {
      throw new Error("Location not found or update failed");
    }

    return { id: data };
  } catch (err) {
    logger.error("Error updating location:", err);
    throw new Error(`Failed to update location: ${err.message}`);
  }
};

// remove
module.exports.remove = async (args, context) => {
  try {
    const { data, error } = await supabase
      .from("location")
      .delete()
      .eq("id", args.id)
      .select("id");

    if (error) {
      throw new Error(error.message);
    }

    if (!data || data.length === 0) {
      throw new Error("Location not found or deletion failed");
    }

    return {
      statusCode: 200,
      message: "Location deleted successfully",
    };
  } catch (err) {
    logger.error("Error deleting location:", err);
    throw new Error(`Failed to delete location: ${err.message}`);
  }
};
