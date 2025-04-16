const { loggers, resolveSchema } = require("@bluehalo/node-fhir-server-core");
const logger = loggers.get("default");
const supabase = require("../db");

// search
module.exports.search = async (args, context) => {
  try {
    let BundleEntry = resolveSchema(args.base_version, "bundleentry");
    let Bundle = resolveSchema(args.base_version, "bundle");
    let ServiceRequest = resolveSchema(args.base_version, "servicerequest");

    const { data, error } = await supabase.rpc("search_service_request");

    if (error) {
      throw error;
    }

    const serviceRequests = data.map((item) => new ServiceRequest(item));

    const entries = serviceRequests.map(
      (serviceRequest) => new BundleEntry({ resource: serviceRequest })
    );
    return new Bundle({ entry: entries });
  } catch (error) {
    logger.error("Error searching for service requests:", error);
    throw new Error("Unable to locate service requests");
  }
};

// searchById
module.exports.searchById = async (args, context) => {
  if (!args || !args.id) {
    throw new Error("ServiceRequest ID is required");
  }

  let ServiceRequest = resolveSchema(args.base_version, "servicerequest");

  try {
    const { data, error } = await supabase.rpc("search_service_request_by_id", {
      request_id: args.id,
    });

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      throw new Error("ServiceRequest not found");
    }

    let serviceRequestData = data[0];
    return new ServiceRequest(serviceRequestData);
  } catch (error) {
    logger.error("Error searching service request by ID:", error);
    throw new Error("Unable to find service request");
  }
};

// create
module.exports.create = async (args, context) => {
  let ServiceRequest = resolveSchema(args.base_version, "servicerequest");
  let doc = new ServiceRequest(context.req.body).toJSON();

  try {
    const { data, error } = await supabase.rpc("create_service_request", {
      payload: doc,
    });

    if (error) {
      throw error;
    }

    return {
      id: data,
    };
  } catch (err) {
    logger.error("Error creating ServiceRequest:", err);
    throw new Error(`Failed to create ServiceRequest: ${err.message}`);
  }
};

// update
module.exports.update = async (args, context) => {
  let ServiceRequest = resolveSchema(args.base_version, "servicerequest");
  let updatedServiceRequest = new ServiceRequest(context.req.body).toJSON();
  try {
    const { data, error } = await supabase.rpc("update_service_request", {
      payload: updatedServiceRequest,
      service_request_id: args.id,
    });

    if (error) {
      throw error;
    }

    if (!data || data !== args.id) {
      throw new Error("ServiceRequest not found or update failed");
    }

    return { id: data };
  } catch (err) {
    logger.error("Error updating service request:", err);
    throw new Error(`Failed to update service request: ${err.message}`);
  }
};

// remove
module.exports.remove = async (args, context) => {
  try {
    const { data, error } = await supabase
      .from("serviceRequest")
      .delete()
      .eq("id", args.id)
      .select("id");

    if (error) {
      throw new Error(error.message);
    }

    if (!data || data.length === 0) {
      throw new Error("ServiceRequest not found or deletion failed");
    }

    return {
      statusCode: 200,
      message: "ServiceRequest deleted successfully",
    };
  } catch (err) {
    logger.error("Error deleting service request:", err);
    throw new Error(`Failed to delete service request: ${err.message}`);
  }
};
