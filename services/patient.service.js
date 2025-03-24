const { loggers, resolveSchema } = require("@bluehalo/node-fhir-server-core");
const logger = loggers.get("default");

// Simulasi database pasien
const db = {
  patients: [
    {
      _id: "P001",
      resourceType: "Patient",
      identifier: [
        { system: "http://hospital.smarthealth.org/mrn", value: "MRN001" },
      ],
      name: [{ use: "official", given: ["John"], family: "Doe" }],
      gender: "male",
      birthDate: "1990-01-01",
    },
    {
      _id: "P002",
      resourceType: "Patient",
      identifier: [
        { system: "http://hospital.smarthealth.org/mrn", value: "MRN002" },
      ],
      name: [{ use: "official", given: ["Jane"], family: "Smith" }],
      gender: "female",
      birthDate: "1990-05-15",
    },
  ],
};

// search
module.exports.search = async (args, context) => {
  try {
    let BundleEntry = resolveSchema(args.base_version, "bundleentry");
    let Bundle = resolveSchema(args.base_version, "bundle");
    let Patient = resolveSchema(args.base_version, "patient");

    let results = db.patients;

    let patients = results.map((result) => new Patient(result));
    let entries = patients.map(
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
  let result = db.patients.find((patient) => patient._id === args.id);
  if (!result) {
    throw new Error("Patient not found");
  }
  return new Patient(result);
};

// update
module.exports.update = async (args, context) => {
  try {
    // Resolve schema Patient berdasarkan versi
    let Patient = resolveSchema(args.base_version, "patient");

    // Konversi resource yang diterima ke format JSON
    let updatedPatient = new Patient(args.resource).toJSON();

    // Cari indeks pasien berdasarkan ID
    let index = db.patients.findIndex((patient) => patient._id === args.id);

    // Jika pasien tidak ditemukan, buat pasien baru (upsert)
    if (index === -1) {
      // Tambahkan ID ke resource jika tidak ada
      updatedPatient._id = args.id;
      db.patients.push(updatedPatient);
    } else {
      // Update data pasien yang sudah ada
      db.patients[index] = { ...db.patients[index], ...updatedPatient };
    }

    // Kembalikan response dengan ID dan versi resource
    return {
      id: args.id,
    };
  } catch (err) {
    // Tangani error
    logger.error("Error updating patient:", err);
    throw new Error(`Failed to update patient: ${err.message}`);
  }
};

// remove
module.exports.remove = async (args, context) => {
  try {
    logger.info("args received:", JSON.stringify(args, null, 2));
    // Filter data pasien dengan ID yang tidak sesuai, artinya pasien terhapus
    db.patients = db.patients.filter((patient) => patient._id !== args.id);

    return {
      statusCode: 200,
      message: "Patient deleted successfully",
    };
  } catch (err) {
    throw new ServerError(`Failed to delete patient: ${err.message}`, {
      statusCode: 409,
      issue: [
        {
          severity: "error",
          code: "internal",
          details: {
            text: err.message,
          },
        },
      ],
    });
  }
};
