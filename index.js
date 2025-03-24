const {
  initialize,
  loggers,
  constants,
} = require("@bluehalo/node-fhir-server-core");
const { VERSIONS } = constants;

let config = {
  profiles: {
    patient: {
      service: "./services/patient.service.js",
      versions: [VERSIONS["4_0_0"]],
    },
    diagnosticreport: {
      service: "./services/diagnosticReport.service.js",
      versions: [VERSIONS["4_0_0"]],
    },
    servicerequest: {
      service: "./services/serviceRequest.service.js",
      versions: [VERSIONS["4_0_0"]],
    },
    imagingstudy: {
      service: "./services/imagingStudy.service.js",
      versions: [VERSIONS["4_0_0"]],
    },
    practitioner: {
      service: "./services/practitioner.service.js",
      versions: [VERSIONS["4_0_0"]],
    },
    location: {
      service: "./services/location.service.js",
      versions: [VERSIONS["4_0_0"]],
    },
    procedure: {
      service: "./services/procedure.service.js",
      versions: [VERSIONS["4_0_0"]],
    },
    observation: {
      service: "./services/observation.service.js",
      versions: [VERSIONS["4_0_0"]],
    },
  },
};

let server = initialize(config);
let logger = loggers.get("default");

server.listen(3000, () => {
  logger.info("✅ FHIR Server started at http://localhost:3000");
});
