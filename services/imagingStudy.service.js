const { loggers, resolveSchema } = require("@bluehalo/node-fhir-server-core");
const logger = loggers.get("default");
const supabase = require("../db");

// search
module.exports.search = async (args, context) => {
  try {
    let BundleEntry = resolveSchema(args.base_version, "bundleentry");
    let Bundle = resolveSchema(args.base_version, "bundle");
    let ImagingStudy = resolveSchema(args.base_version, "imagingstudy");

    const { data, error } = await supabase.rpc("search_imaging_study");

    if (error) {
      throw error;
    }

    const studies = data.map((item) => new ImagingStudy(item));
    const entries = studies.map(
      (study) => new BundleEntry({ resource: study })
    );

    return new Bundle({ entry: entries });
  } catch (error) {
    logger.error("Error searching for imaging studies:", error);
    throw new Error("Unable to locate imaging studies");
  }
};

// searchById
module.exports.searchById = async (args, context) => {
  if (!args || !args.id) {
    throw new Error("ImagingStudy ID is required");
  }

  let ImagingStudy = resolveSchema(args.base_version, "imagingstudy");

  try {
    const { data, error } = await supabase.rpc("search_imaging_study_by_id", {
      study_id: args.id,
    });

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      throw new Error("ImagingStudy not found");
    }

    let imagingStudyData = data;
    return new ImagingStudy(imagingStudyData);
  } catch (err) {
    throw new Error(`Failed to retrieve ImagingStudy: ${err.message}`);
  }
};

// create
module.exports.create = async (args, context) => {
  let ImagingStudy = resolveSchema(args.base_version, "imagingstudy");
  let doc = new ImagingStudy(context.req.body).toJSON();

  try {
    const { data, error } = await supabase.rpc("create_imaging_study", {
      payload: doc,
    });

    if (error) {
      throw error;
    }

    return {
      id: data,
    };
  } catch (err) {
    logger.error("Error creating ImagingStudy:", err);
    throw new Error(`Failed to create ImagingStudy: ${err.message}`);
  }
};

// update
module.exports.update = async (args, context) => {
  let ImagingStudy = resolveSchema(args.base_version, "imagingstudy");
  let updatedStudy = new ImagingStudy(context.req.body).toJSON();

  try {
    const { data, error } = await supabase.rpc("update_imaging_study", {
      payload: updatedStudy,
      imaging_study_id: args.id,
    });

    if (error) {
      throw error;
    }

    if (!data || data !== args.id) {
      throw new Error("ImagingStudy not found or update failed");
    }

    return { id: data };
  } catch (err) {
    throw new Error(`Failed to update ImagingStudy: ${err.message}`);
  }
};

// remove
module.exports.remove = async (args, context) => {
  try {
    const { data, error } = await supabase
      .from("imagingStudy")
      .delete()
      .eq("id", args.id)
      .select("id");

    if (error) {
      throw new Error(error.message);
    }

    if (!data || data.length === 0) {
      throw new Error("ImagingStudy not found or deletion failed");
    }

    return {
      statusCode: 200,
      message: "ImagingStudy deleted successfully",
    };
  } catch (err) {
    throw new Error(`Failed to delete ImagingStudy: ${err.message}`);
  }
};
