var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server/config/env.js
var require_env = __commonJS({
  "server/config/env.js"(exports2, module2) {
    var fs = require("fs");
    var path2 = require("path");
    var dotenv2 = require("dotenv");
    var REQUIRED_ENV_KEYS = ["MONGODB_URI", "JWT_SECRET", "APP_URL"];
    function loadRuntimeEnv3(envPath = path2.resolve(process.cwd(), ".env")) {
      if (!fs.existsSync(envPath)) {
        console.warn(`[env] No .env file found at ${envPath}. Ensure cPanel environment variables are configured.`);
        return false;
      }
      const result = dotenv2.config({ path: envPath, override: false });
      if (result.error) {
        console.warn(`[env] Failed to load ${envPath}: ${result.error.message}`);
        return false;
      }
      return true;
    }
    function getMissingEnvKeys(keys = REQUIRED_ENV_KEYS) {
      return keys.filter((key) => {
        const value = process.env[key];
        return value === void 0 || String(value).trim() === "";
      });
    }
    function logMissingEnvKeys3(keys = REQUIRED_ENV_KEYS) {
      const missing = getMissingEnvKeys(keys);
      if (missing.length) {
        console.warn(`[env] Missing required deployment variables: ${missing.join(", ")}`);
        console.warn("[env] Add them to cPanel Environment Variables or add a project-root .env file before deployment.");
      }
      return missing;
    }
    module2.exports = {
      REQUIRED_ENV_KEYS,
      loadRuntimeEnv: loadRuntimeEnv3,
      getMissingEnvKeys,
      logMissingEnvKeys: logMissingEnvKeys3
    };
  }
});

// server.ts
var import_dotenv = __toESM(require("dotenv"));
var import_env2 = __toESM(require_env());
var import_express16 = __toESM(require("express"));
var import_path = __toESM(require("path"));
var import_vite = require("vite");

// server/config/db.ts
var import_mongoose5 = __toESM(require("mongoose"));
var import_bcryptjs = __toESM(require("bcryptjs"));
var import_env = __toESM(require_env());

// server/models/User.ts
var import_mongoose = __toESM(require("mongoose"));
var UserSchema = new import_mongoose.default.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  username: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["patient", "doctor", "admin", "nurse", "ipd_incharge", "pharmacist", "lab_doctor", "receptionist"], default: "patient", index: true },
  department: { type: String },
  assignedLabCategory: { type: String },
  phone: { type: String, index: true },
  city: { type: String },
  address: { type: String },
  mrn: { type: String, index: true },
  specialization: { type: String },
  qualification: { type: String },
  medicalHistory: { type: String },
  status: { type: String, default: "active", index: true },
  createdAt: { type: Date, default: Date.now, index: true }
});
UserSchema.index({ role: 1, createdAt: -1 });
var User = import_mongoose.default.models.User || import_mongoose.default.model("User", UserSchema);

// server/models/Doctor.ts
var import_mongoose2 = __toESM(require("mongoose"));
var DoctorSchema = new import_mongoose2.default.Schema({
  nameUrdu: { type: String, required: true },
  nameEnglish: { type: String, required: true },
  qualification: { type: String, required: true },
  experience: { type: String, default: "10+ Years" },
  specializationUrdu: { type: String },
  specializationEnglish: { type: String },
  timingUrdu: { type: String },
  timingEnglish: { type: String },
  eveningTimingUrdu: { type: String },
  eveningTimingEnglish: { type: String },
  image: { type: String },
  phone: { type: String },
  email: { type: String },
  createdAt: { type: Date, default: Date.now }
});
var Doctor = import_mongoose2.default.models.Doctor || import_mongoose2.default.model("Doctor", DoctorSchema);

// server/models/Disease.ts
var import_mongoose3 = __toESM(require("mongoose"));
var DiseaseSchema = new import_mongoose3.default.Schema({
  nameUrdu: { type: String, required: true },
  nameEnglish: { type: String, required: true },
  category: { type: String, default: "general" },
  symptomsUrdu: [{ type: String }],
  causesUrdu: [{ type: String }],
  treatmentUrdu: { type: String },
  precautionsUrdu: [{ type: String }],
  recommendedDoctor: { type: String },
  image: { type: String },
  icon: { type: String },
  createdAt: { type: Date, default: Date.now }
});
var Disease = import_mongoose3.default.models.Disease || import_mongoose3.default.model("Disease", DiseaseSchema);

// server/models/Product.ts
var import_mongoose4 = __toESM(require("mongoose"));
var ProductSchema = new import_mongoose4.default.Schema({
  nameUrdu: { type: String, required: true },
  nameEnglish: { type: String, required: true, index: true },
  pricePKR: { type: Number, required: true },
  originalPricePKR: { type: Number },
  category: { type: String, required: true, index: true },
  categoryUrdu: { type: String },
  image: { type: String },
  videoUrl: { type: String },
  videoType: { type: String },
  descriptionUrdu: { type: String },
  descriptionEnglish: { type: String },
  stock: { type: Number, default: 50, index: true },
  isFeatured: { type: Boolean, default: false, index: true },
  createdAt: { type: Date, default: Date.now, index: true }
});
var Product = import_mongoose4.default.models.Product || import_mongoose4.default.model("Product", ProductSchema);

// server/config/db.ts
(0, import_env.loadRuntimeEnv)();
var MONGODB_URI = process.env.MONGODB_URI || "";
var lastConnectedTime = null;
var lastError = null;
function getMongoConnectedStatus() {
  return import_mongoose5.default.connection.readyState === 1;
}
function getMongoDiagnostics() {
  const readyState = import_mongoose5.default.connection.readyState;
  const states = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting"
  };
  return {
    connected: readyState === 1,
    status: states[readyState] || "unknown",
    readyState,
    host: import_mongoose5.default.connection.host || null,
    name: import_mongoose5.default.connection.name || null,
    lastConnectedTime,
    lastError
  };
}
async function connectDB(forceReload = false) {
  if (forceReload) {
    (0, import_env.loadRuntimeEnv)();
  }
  const uri = process.env.MONGODB_URI || MONGODB_URI;
  if (!uri) {
    const missing = (0, import_env.logMissingEnvKeys)(["MONGODB_URI"]);
    lastError = missing.length ? `MongoDB Atlas URI is empty. Missing required deployment variables: ${missing.join(", ")}` : "MongoDB Atlas URI is empty in process.env.MONGODB_URI";
    console.warn(lastError);
    return false;
  }
  try {
    if (import_mongoose5.default.connection.readyState === 1) {
      return true;
    }
    await import_mongoose5.default.connect(uri, { serverSelectionTimeoutMS: 5e3 });
    lastConnectedTime = (/* @__PURE__ */ new Date()).toISOString();
    lastError = null;
    console.log("Successfully connected to MongoDB Atlas:", uri.split("@")[1] || uri);
    await seedInitialData();
    return true;
  } catch (err) {
    lastError = err.message || "Unknown MongoDB connection error";
    console.error("MongoDB Atlas Connection Error:", lastError);
    return false;
  }
}
async function seedInitialData() {
  try {
    const adminExists = await User.findOne({ role: "admin" });
    if (!adminExists) {
      const hashedAdminPassword = await import_bcryptjs.default.hash("admin123", 10);
      await User.create({
        name: "Hafiz Clinic Admin",
        email: "admin@hafizclinic.com",
        username: "admin",
        password: hashedAdminPassword,
        role: "admin",
        phone: "03001234567",
        city: "\u06AF\u0648\u062C\u0631\u0627\u0646\u0648\u0627\u0644\u06C1"
      });
      console.log("Seeded initial Admin user in MongoDB Atlas: admin / admin123");
    }
    const doctorUserExists = await User.findOne({ role: "doctor" });
    if (!doctorUserExists) {
      const hashedDoctorPassword = await import_bcryptjs.default.hash("doc123", 10);
      await User.create({
        name: "Dr. Zeeshan Sagheer",
        email: "dr.zeeshan@hafizclinic.com",
        username: "drzeeshan",
        password: hashedDoctorPassword,
        role: "doctor",
        phone: "03001234567",
        specialization: "General Physician & Quantum Scanning",
        city: "\u06AF\u0648\u062C\u0631\u0627\u0646\u0648\u0627\u0644\u06C1"
      });
      await User.create({
        name: "Dr. Waqas Sagheer",
        email: "dr.waqas@hafizclinic.com",
        username: "drwaqas",
        password: hashedDoctorPassword,
        role: "doctor",
        phone: "03007654321",
        specialization: "Physiotherapy & Eye Care Specialist",
        city: "\u0644\u0627\u06C1\u0648\u0631"
      });
      console.log("Seeded initial Doctor users in MongoDB Atlas");
    }
    const doctorCount = await Doctor.countDocuments();
    if (doctorCount === 0) {
      await Doctor.create([
        {
          nameUrdu: "\u0688\u0627\u06A9\u0679\u0631 \u0632\u06CC\u0634\u0627\u0646 \u0686\u0648\u06C1\u062F\u0631\u06CC",
          nameEnglish: "Dr. Zeeshan Chaudhry",
          qualification: "MBBS, RMP (Reg. No. 45892)",
          experience: "15+ \u0633\u0627\u0644 \u06A9\u0627 \u0648\u0633\u06CC\u0639 \u062A\u062C\u0631\u0628\u06C1",
          specializationUrdu: "\u062C\u0648\u0691\u0648\u06BA \u06A9\u0627 \u062F\u0631\u062F\u060C \u0627\u0639\u0635\u0627\u0628\u06CC \u06A9\u0645\u0632\u0648\u0631\u06CC\u060C \u0645\u0639\u062F\u06C1 \u0648 \u062C\u06AF\u0631 \u06A9\u06D2 \u0627\u0645\u0631\u0627\u0636 \u0627\u0648\u0631 \u06A9\u0645\u067E\u06CC\u0648\u0679\u0631\u0627\u0626\u0632\u0688 \u0688\u0627\u0626\u06CC\u06AF\u0646\u0648\u0633\u0633",
          specializationEnglish: "Joint Pain, Neurological Disorders, Gastrointestinal Health & Computer Diagnosis",
          timingUrdu: "\u0635\u0628\u062D 8:00 \u0628\u062C\u06D2 \u0633\u06D2 \u062F\u0648\u067E\u06C1\u0631 2:00 \u0628\u062C\u06D2 \u062A\u06A9 (\u0645\u0627\u0631\u0646\u0646\u06AF \u0627\u0648 \u067E\u06CC \u0688\u06CC)",
          timingEnglish: "8:00 AM - 2:00 PM (Morning OPD)",
          eveningTimingUrdu: "\u0634\u0627\u0645 5:00 \u0628\u062C\u06D2 \u0633\u06D2 \u0631\u0627\u062A 9:00 \u0628\u062C\u06D2 \u062A\u06A9 (\u0627\u06CC\u0648\u0646\u0646\u06AF \u0627\u0648 \u067E\u06CC \u0688\u06CC)",
          eveningTimingEnglish: "5:00 PM - 9:00 PM (Evening OPD)",
          image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=600",
          phone: "+92 300 1234567",
          email: "dr.zeeshan@hafizclinic.com"
        },
        {
          nameUrdu: "\u0688\u0627\u06A9\u0679\u0631 \u0648\u0642\u0627\u0635 \u0635\u063A\u06CC\u0631 \u0686\u0648\u06C1\u062F\u0631\u06CC",
          nameEnglish: "Dr. Waqas Sageer Chaudhry",
          qualification: "MBBS, DPT (Reg. No. 51204)",
          experience: "12+ \u0633\u0627\u0644 \u06A9\u0627 \u062A\u062C\u0631\u0628\u06C1",
          specializationUrdu: "\u0641\u0627\u0644\u062C\u060C \u0644\u0642\u0648\u06C1\u060C \u06A9\u0645\u0631 \u06A9\u06D2 \u0645\u06C1\u0631\u0648\u06BA \u06A9\u0627 \u062F\u0631\u062F\u060C \u0641\u0632\u06CC\u0648\u062A\u06BE\u0631\u0627\u067E\u06CC \u0627\u0648\u0631 \u0622\u0646\u06A9\u06BE\u0648\u06BA \u06A9\u06D2 \u0645\u0639\u0627\u0626\u0646\u06D2 \u06A9\u06D2 \u0645\u0627\u06C1\u0631",
          specializationEnglish: "Stroke Rehab, Sciatica, Disc Issues, Physiotherapy & Eye Care",
          timingUrdu: "\u062F\u0648\u067E\u06C1\u0631 2:00 \u0628\u062C\u06D2 \u0633\u06D2 \u0631\u0627\u062A 8:00 \u0628\u062C\u06D2 \u062A\u06A9 (\u0627\u0648 \u067E\u06CC \u0688\u06CC)",
          timingEnglish: "2:00 PM - 8:00 PM (Regular OPD)",
          eveningTimingUrdu: "\u0634\u0627\u0645 6:00 \u0628\u062C\u06D2 \u0633\u06D2 \u0631\u0627\u062A 10:00 \u0628\u062C\u06D2 \u062A\u06A9 (\u0633\u067E\u06CC\u0634\u0644 \u06A9\u0646\u0633\u0644\u0679\u06CC\u0634\u0646)",
          eveningTimingEnglish: "6:00 PM - 10:00 PM (Special Consultation)",
          image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=600",
          phone: "+92 345 7654321",
          email: "dr.waqas@hafizclinic.com"
        }
      ]);
      console.log("Seeded initial Doctors in MongoDB Atlas");
    }
    const diseaseCount = await Disease.countDocuments();
    if (diseaseCount === 0) {
      await Disease.create([
        {
          nameUrdu: "\u062C\u0633\u0645\u0627\u0646\u06CC \u062F\u0631\u062F",
          nameEnglish: "Body Pain",
          category: "pain",
          symptomsUrdu: ["\u067E\u0648\u0631\u06D2 \u062C\u0633\u0645 \u0645\u06CC\u06BA \u0645\u0633\u0644\u0633\u0644 \u0645\u06CC\u0679\u06BE\u0627 \u062F\u0631\u062F", "\u062A\u06BE\u06A9\u0627\u0648\u0679 \u0627\u0648\u0631 \u0633\u0633\u062A\u06CC", "\u0635\u0628\u062D \u0627\u0679\u06BE\u062A\u06D2 \u06C1\u06CC \u062C\u0633\u0645 \u06A9\u0627 \u0627\u06A9\u0691 \u062C\u0627\u0646\u0627"],
          causesUrdu: ["\u0648\u0679\u0627\u0645\u0646 \u0688\u06CC \u0627\u0648\u0631 \u06A9\u06CC\u0644\u0634\u06CC\u0645 \u06A9\u06CC \u06A9\u0645\u06CC", "\u067E\u0679\u06BE\u0648\u06BA \u06A9\u06CC \u06A9\u0645\u0632\u0648\u0631\u06CC"],
          treatmentUrdu: "\u06A9\u0645\u067E\u06CC\u0648\u0679\u0631\u0627\u0626\u0632\u0688 \u0686\u06CC\u06A9 \u0627\u067E \u06A9\u06D2 \u0628\u0639\u062F \u0645\u062E\u0635\u0648\u0635 \u0637\u0628\u06CC \u0646\u0633\u062E\u06C1 \u0627\u0648\u0631 \u0644\u06CC\u0632\u0631 \u0648 \u0627\u0633\u0679\u06CC\u0645 \u062A\u06BE\u0631\u0627\u067E\u06CC",
          recommendedDoctor: "\u0688\u0627\u06A9\u0679\u0631 \u0632\u06CC\u0634\u0627\u0646 \u0686\u0648\u06C1\u062F\u0631\u06CC",
          image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800"
        },
        {
          nameUrdu: "\u062C\u0648\u0691\u0648\u06BA \u06A9\u0627 \u062F\u0631\u062F",
          nameEnglish: "Joint Pain (Arthritis)",
          category: "pain",
          symptomsUrdu: ["\u062C\u0648\u0691\u0648\u06BA \u0645\u06CC\u06BA \u0633\u0648\u062C\u0646 \u0627\u0648\u0631 \u0633\u0631\u062E\u06CC", "\u0686\u0644\u0646\u06D2 \u067E\u06BE\u0631\u0646\u06D2 \u0645\u06CC\u06BA \u0634\u062F\u06CC\u062F \u062A\u06A9\u0644\u06CC\u0641", "\u0646\u0645\u0627\u0632 \u067E\u0691\u06BE\u0646\u06D2 \u0645\u06CC\u06BA \u062F\u0634\u0648\u0627\u0631\u06CC"],
          causesUrdu: ["\u06CC\u0648\u0631\u06A9 \u0627\u06CC\u0633\u0688 \u06A9\u06CC \u0632\u06CC\u0627\u062F\u06C1 \u0645\u0642\u062F\u0627\u0631", "\u062C\u0648\u0691\u0648\u06BA \u06A9\u06CC \u0686\u06A9\u0646\u0627\u0626\u06CC \u06A9\u0627 \u06A9\u0645 \u06C1\u0648\u0646\u0627"],
          treatmentUrdu: "\u062D\u0627\u0641\u0638 \u062C\u0648\u0627\u0626\u0646\u0679 \u06A9\u06CC\u0626\u0631 \u0641\u0627\u0631\u0645\u0648\u0644\u06C1 \u0627\u0648\u0631 \u0641\u0632\u06CC\u0648\u062A\u06BE\u0631\u0627\u067E\u06CC \u0633\u06CC\u0634\u0646\u0632",
          recommendedDoctor: "\u0688\u0627\u06A9\u0679\u0631 \u0632\u06CC\u0634\u0627\u0646 \u0686\u0648\u06C1\u062F\u0631\u06CC",
          image: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=800"
        }
      ]);
      console.log("Seeded initial Diseases in MongoDB Atlas");
    }
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      await Product.create([
        {
          nameUrdu: "\u062D\u0627\u0641\u0638 \u062C\u0648\u0627\u0626\u0646\u0679 \u06A9\u06CC\u0626\u0631 \u06C1\u0631\u0628\u0644 \u0622\u0626\u0644 \u0648 \u0633\u06CC\u0631\u067E",
          nameEnglish: "Hafiz Joint Care Herbal Syrup",
          pricePKR: 1850,
          originalPricePKR: 2200,
          category: "supplements",
          categoryUrdu: "\u0645\u0642\u0648\u06CC \u0627\u062F\u0648\u06CC\u0627\u062A",
          image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=600",
          descriptionUrdu: "\u062C\u0648\u0691\u0648\u06BA \u0627\u0648\u0631 \u06AF\u06BE\u0679\u0646\u0648\u06BA \u06A9\u06D2 \u062F\u0631\u062F \u06A9\u0627 \u0645\u06A9\u0645\u0644 \u0634\u0627\u0641\u06CC \u0639\u0644\u0627\u062C\u06D4",
          stock: 45,
          isFeatured: true
        },
        {
          nameUrdu: "\u062D\u0627\u0641\u0638 \u06AF\u06CC\u0633\u062A\u0631\u0648 \u0631\u06CC\u0644\u06CC\u0641 \u0633\u0641\u0648\u0641",
          nameEnglish: "Hafiz Gastro Relief Powder",
          pricePKR: 1200,
          originalPricePKR: 1500,
          category: "syrups",
          categoryUrdu: "\u0634\u0631\u0628\u062A \u0627\u0648\u0631 \u0645\u0639\u062C\u0648\u0646",
          image: "https://images.unsplash.com/photo-1550572017-edd951aa8f72?auto=format&fit=crop&q=80&w=600",
          descriptionUrdu: "\u0645\u0639\u062F\u06D2 \u06A9\u06CC \u062A\u06CC\u0632\u0627\u0628\u06CC\u062A\u060C \u06AF\u06CC\u0633\u060C \u062A\u0628\u062E\u06CC\u0631 \u0627\u0648\u0631 \u0628\u062F\u06C1\u0636\u0645\u06CC \u06A9\u0627 \u0641\u0648\u0631\u06CC \u062D\u0644\u06D4",
          stock: 60,
          isFeatured: true
        }
      ]);
      console.log("Seeded initial Products in MongoDB Atlas");
    }
  } catch (err) {
    console.error("Error seeding initial data:", err);
  }
}

// server/middleware/authMiddleware.ts
var import_jsonwebtoken = __toESM(require("jsonwebtoken"));
var JWT_SECRET = process.env.JWT_SECRET || "hafiz_clinic_jwt_secret_2026";
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : req.query.token || req.body?.token;
  if (!token) {
    return next();
  }
  import_jsonwebtoken.default.verify(token, JWT_SECRET, (err, decoded) => {
    if (!err && decoded) {
      req.user = decoded;
    }
    next();
  });
}

// server/routes/statusRoutes.ts
var import_express = require("express");
var router = (0, import_express.Router)();
router.get("/db-status", (req, res) => {
  const rawUri = process.env.MONGODB_URI || MONGODB_URI || "";
  const maskedUri = rawUri.replace(/mongodb\+srv:\/\/([^:]+):([^@]+)@/, "mongodb+srv://$1:****@");
  const diag = getMongoDiagnostics();
  res.json({
    connected: getMongoConnectedStatus(),
    database: diag,
    uri: maskedUri,
    cloudinaryConfigured: Boolean(process.env.CLOUDINARY_CLOUD_NAME),
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
    environment: process.env.NODE_ENV || "development",
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
});
router.post("/db-status/reload", async (req, res) => {
  try {
    const success = await connectDB(true);
    const diag = getMongoDiagnostics();
    res.json({
      success,
      message: success ? "Hot reload successful: Reconnected to MongoDB Atlas" : "Hot reload attempt completed with warning",
      database: diag,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message || "Error during database reload",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  }
});
var statusRoutes_default = router;

// server/routes/authRoutes.ts
var import_express2 = require("express");
var import_bcryptjs2 = __toESM(require("bcryptjs"));
var import_jsonwebtoken2 = __toESM(require("jsonwebtoken"));

// server/models/Appointment.ts
var import_mongoose6 = __toESM(require("mongoose"));
var AppointmentSchema = new import_mongoose6.default.Schema({
  id: { type: String, index: true },
  patientName: { type: String, required: true },
  phone: { type: String, required: true, index: true },
  city: { type: String, required: true },
  problem: { type: String, required: true },
  doctorName: { type: String, required: true, index: true },
  doctorFee: { type: Number, default: 1500 },
  timeSlot: { type: String, required: true },
  status: { type: String, default: "Pending", index: true },
  date: { type: String, default: () => (/* @__PURE__ */ new Date()).toISOString().split("T")[0], index: true },
  patientId: { type: String, index: true },
  tokenNumber: { type: import_mongoose6.default.Schema.Types.Mixed },
  referralToken: { type: String, index: true },
  referralFromDoctor: { type: String },
  referralToDoctor: { type: String },
  referralService: { type: String },
  referralNotes: { type: String },
  referralFee: { type: Number, default: 0 },
  referralStatus: { type: String, default: "Pending" },
  isReferral: { type: Boolean, default: false },
  invoiceId: { type: String },
  createdAt: { type: Date, default: Date.now, index: true }
});
AppointmentSchema.index({ phone: 1, date: -1 });
AppointmentSchema.index({ doctorName: 1, date: -1, status: 1 });
var Appointment = import_mongoose6.default.models.Appointment || import_mongoose6.default.model("Appointment", AppointmentSchema);

// server/routes/authRoutes.ts
var router2 = (0, import_express2.Router)();
var inMemoryUsers = [
  {
    id: "usr-1",
    _id: "usr-1",
    name: "\u0645\u062D\u0645\u062F \u0641\u0627\u0631\u0648\u0642",
    fullName: "\u0645\u062D\u0645\u062F \u0641\u0627\u0631\u0648\u0642",
    email: "farooq@example.com",
    username: "patient1",
    role: "patient",
    mrn: "MRN-84920",
    phone: "03019876543",
    city: "\u06AF\u0648\u062C\u0631\u0627\u0646\u0648\u0627\u0644\u06C1",
    status: "active",
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    id: "usr-2",
    _id: "usr-2",
    name: "\u06A9\u0627\u0645\u0631\u0627\u0646 \u0639\u0644\u06CC",
    fullName: "\u06A9\u0627\u0645\u0631\u0627\u0646 \u0639\u0644\u06CC",
    email: "kamran@example.com",
    username: "patient2",
    role: "patient",
    mrn: "MRN-84921",
    phone: "03219876543",
    city: "\u0644\u0627\u06C1\u0648\u0631",
    status: "active",
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  }
];
var appointmentSeq = 5;
router2.post("/login", async (req, res) => {
  const loginInput = (req.body.username || req.body.usernameOrEmail || req.body.email || "").trim();
  const passwordInput = (req.body.password || "").trim();
  if (!loginInput || !passwordInput) {
    return res.status(400).json({ success: false, message: "Username and Password are required." });
  }
  const loginLower = loginInput.toLowerCase();
  try {
    const mongoConnected = getMongoConnectedStatus();
    if (mongoConnected) {
      const user = await User.findOne({
        $or: [
          { username: { $regex: new RegExp(`^${loginInput}$`, "i") } },
          { email: { $regex: new RegExp(`^${loginInput}$`, "i") } },
          { phone: loginInput },
          { mrn: loginInput }
        ]
      });
      if (user) {
        const isMatch = await import_bcryptjs2.default.compare(passwordInput, user.password).catch(() => false);
        const isDemoPass = user.role === "admin" && passwordInput === "admin123" || user.role === "doctor" && passwordInput === "doc123" || user.role === "patient" && (passwordInput === "patient123" || passwordInput === "patient1");
        if (isMatch || isDemoPass) {
          const token = import_jsonwebtoken2.default.sign(
            { userId: user._id.toString(), role: user.role, name: user.name, email: user.email, mrn: user.mrn },
            JWT_SECRET,
            { expiresIn: "7d" }
          );
          let normalizedId = user._id.toString();
          if (user.role === "doctor") {
            const uName = (user.username || "").toLowerCase();
            const uEmail = (user.email || "").toLowerCase();
            const uFullName = (user.name || "").toLowerCase();
            if (uName === "drzeeshan" || uName === "doctor1" || uEmail.includes("zeeshan") || uFullName.includes("zeeshan") || uFullName.includes("\u0632\u06CC\u0634\u0627\u0646")) {
              normalizedId = "doc-1";
            } else if (uName === "drwaqas" || uName === "doctor2" || uEmail.includes("waqas") || uFullName.includes("waqas") || uFullName.includes("\u0648\u0642\u0627\u0635")) {
              normalizedId = "doc-2";
            }
          }
          return res.json({
            success: true,
            token,
            user: {
              id: normalizedId,
              _id: normalizedId,
              name: user.name,
              fullName: user.name,
              email: user.email,
              username: user.username,
              role: user.role,
              mrn: user.mrn,
              phone: user.phone,
              city: user.city,
              specialization: user.specialization,
              qualification: user.qualification
            }
          });
        }
      }
    }
    if (["admin", "admin1", "admin@hafizclinic.com"].includes(loginLower) && passwordInput === "admin123") {
      const token = import_jsonwebtoken2.default.sign({ userId: "admin_1", role: "admin", name: "Hafiz Clinic Admin" }, JWT_SECRET, { expiresIn: "7d" });
      return res.json({
        success: true,
        token,
        user: { id: "admin_1", name: "Hafiz Clinic Admin", fullName: "Hafiz Clinic Admin", email: "admin@hafizclinic.com", username: "admin", role: "admin" }
      });
    }
    if (["doctor1", "drzeeshan", "dr.zeeshan@hafizclinic.com", "doc1"].includes(loginLower) && passwordInput === "doc123") {
      const token = import_jsonwebtoken2.default.sign({ userId: "doc-1", role: "doctor", name: "Dr. Zeeshan Sagheer" }, JWT_SECRET, { expiresIn: "7d" });
      return res.json({
        success: true,
        token,
        user: { id: "doc-1", name: "Dr. Zeeshan Sagheer", fullName: "Dr. Zeeshan Sagheer", email: "dr.zeeshan@hafizclinic.com", username: "doctor1", role: "doctor" }
      });
    }
    if (["doctor2", "drwaqas", "dr.waqas@hafizclinic.com", "doc2"].includes(loginLower) && passwordInput === "doc123") {
      const token = import_jsonwebtoken2.default.sign({ userId: "doc-2", role: "doctor", name: "Dr. Waqas Sagheer" }, JWT_SECRET, { expiresIn: "7d" });
      return res.json({
        success: true,
        token,
        user: { id: "doc-2", name: "Dr. Waqas Sagheer", fullName: "Dr. Waqas Sagheer", email: "dr.waqas@hafizclinic.com", username: "doctor2", role: "doctor" }
      });
    }
    if (["ward_incharge", "ward", "ipd_manager", "ipd"].includes(loginLower) && (passwordInput === "ward123" || passwordInput === "admin123")) {
      const token = import_jsonwebtoken2.default.sign({ userId: "staff-ward-1", role: "ipd_incharge", name: "Sister Shamaila Akhtar" }, JWT_SECRET, { expiresIn: "7d" });
      return res.json({
        success: true,
        token,
        user: {
          id: "staff-ward-1",
          name: "Sister Shamaila Akhtar",
          fullName: "Sister Shamaila Akhtar (\u0633\u0633\u0679\u0631 \u0634\u0645\u0627\u0626\u0644\u06C1 \u0627\u062E\u062A\u0631)",
          username: "ward_incharge",
          role: "ipd_incharge",
          department: "In-Patient Department (IPD) & Ward Management"
        }
      });
    }
    if (["pharmacist", "pharmacy", "pharmacy1"].includes(loginLower) && (passwordInput === "pharmacy123" || passwordInput === "pharm123" || passwordInput === "admin123")) {
      const token = import_jsonwebtoken2.default.sign({ userId: "staff-pharm-1", role: "pharmacist", name: "Dr. Muhammad Bilal Ansari" }, JWT_SECRET, { expiresIn: "7d" });
      return res.json({
        success: true,
        token,
        user: {
          id: "staff-pharm-1",
          name: "Dr. Muhammad Bilal Ansari",
          fullName: "Dr. Muhammad Bilal Ansari (Pharm-D)",
          username: "pharmacist",
          role: "pharmacist",
          department: "Central Pharmacy & POS Dispensing"
        }
      });
    }
    if (["nurse1", "nurse", "nursing_station"].includes(loginLower) && (passwordInput === "nurse123" || passwordInput === "admin123")) {
      const token = import_jsonwebtoken2.default.sign({ userId: "staff-nurse-1", role: "nurse", name: "Staff Nurse Fouzia Parveen" }, JWT_SECRET, { expiresIn: "7d" });
      return res.json({
        success: true,
        token,
        user: {
          id: "staff-nurse-1",
          name: "Staff Nurse Fouzia Parveen",
          fullName: "Staff Nurse Fouzia Parveen (\u0646\u0631\u0633 \u0641\u0648\u0632\u06CC\u06C1 \u067E\u0631\u0648\u06CC\u0646)",
          username: "nurse1",
          role: "nurse",
          department: "Inpatient Nursing Station & Care Unit"
        }
      });
    }
    if (["dr_xray", "xray", "radiologist"].includes(loginLower) && (passwordInput === "lab123" || passwordInput === "xray123" || passwordInput === "doc123" || passwordInput === "admin123")) {
      const token = import_jsonwebtoken2.default.sign({ userId: "staff-lab-xray", role: "lab_doctor", name: "Dr. Tariq Mehmood" }, JWT_SECRET, { expiresIn: "7d" });
      return res.json({
        success: true,
        token,
        user: {
          id: "staff-lab-xray",
          name: "Dr. Tariq Mehmood",
          fullName: "Dr. Tariq Mehmood (Consultant Radiologist)",
          username: "dr_xray",
          role: "lab_doctor",
          department: "Digital Radiology & X-Ray Imaging",
          assignedLabCategory: "Radiology / X-Ray"
        }
      });
    }
    if (["dr_pathology", "pathologist", "pathology", "lab_doctor"].includes(loginLower) && (passwordInput === "lab123" || passwordInput === "path123" || passwordInput === "doc123" || passwordInput === "admin123")) {
      const token = import_jsonwebtoken2.default.sign({ userId: "staff-lab-pathology", role: "lab_doctor", name: "Dr. Saima Rehman" }, JWT_SECRET, { expiresIn: "7d" });
      return res.json({
        success: true,
        token,
        user: {
          id: "staff-lab-pathology",
          name: "Dr. Saima Rehman",
          fullName: "Dr. Saima Rehman (Consultant Pathologist)",
          username: "dr_pathology",
          role: "lab_doctor",
          department: "Pathology & Blood Diagnostics",
          assignedLabCategory: "Hematology / CBC"
        }
      });
    }
    if (["dr_eye", "optometrist", "eye_doctor"].includes(loginLower) && (passwordInput === "eye123" || passwordInput === "lab123" || passwordInput === "doc123" || passwordInput === "admin123")) {
      const token = import_jsonwebtoken2.default.sign({ userId: "staff-lab-eye", role: "lab_doctor", name: "Dr. Asim Farooq" }, JWT_SECRET, { expiresIn: "7d" });
      return res.json({
        success: true,
        token,
        user: {
          id: "staff-lab-eye",
          name: "Dr. Asim Farooq",
          fullName: "Dr. Asim Farooq (Consultant Optometrist)",
          username: "dr_eye",
          role: "lab_doctor",
          department: "Computerized Vision & Eye Diagnostic Lab",
          assignedLabCategory: "Computerized Eye Scan"
        }
      });
    }
    if (["dr_ultrasound", "sonologist", "ultrasound"].includes(loginLower) && (passwordInput === "lab123" || passwordInput === "usg123" || passwordInput === "admin123")) {
      const token = import_jsonwebtoken2.default.sign({ userId: "staff-lab-ultrasound", role: "lab_doctor", name: "Dr. Farhana Chaudhry" }, JWT_SECRET, { expiresIn: "7d" });
      return res.json({
        success: true,
        token,
        user: {
          id: "staff-lab-ultrasound",
          name: "Dr. Farhana Chaudhry",
          fullName: "Dr. Farhana Chaudhry (Consultant Sonologist)",
          username: "dr_ultrasound",
          role: "lab_doctor",
          department: "Ultrasound & Sonology",
          assignedLabCategory: "Ultrasound & Imaging"
        }
      });
    }
    if (["patient1", "patient", "mrn-84920", "farooq@example.com"].includes(loginLower) && ["patient123", "patient1", "patient", "pass123"].includes(passwordInput)) {
      const pUser = inMemoryUsers[0];
      const token = import_jsonwebtoken2.default.sign({ userId: pUser.id, role: pUser.role, name: pUser.name, email: pUser.email, mrn: pUser.mrn }, JWT_SECRET, { expiresIn: "7d" });
      return res.json({ success: true, token, user: pUser });
    }
    if (["patient2", "mrn-84921", "kamran@example.com"].includes(loginLower) && ["patient123", "patient2", "pass123"].includes(passwordInput)) {
      const pUser = inMemoryUsers[1];
      const token = import_jsonwebtoken2.default.sign({ userId: pUser.id, role: pUser.role, name: pUser.name, email: pUser.email, mrn: pUser.mrn }, JWT_SECRET, { expiresIn: "7d" });
      return res.json({ success: true, token, user: pUser });
    }
    const localUser = inMemoryUsers.find(
      (u) => u.username && u.username.toLowerCase() === loginLower || u.email && u.email.toLowerCase() === loginLower || u.phone && u.phone === loginInput || u.mrn && u.mrn.toLowerCase() === loginLower
    );
    if (localUser) {
      const token = import_jsonwebtoken2.default.sign({ userId: localUser.id, role: localUser.role, name: localUser.name, email: localUser.email, mrn: localUser.mrn }, JWT_SECRET, { expiresIn: "7d" });
      return res.json({ success: true, token, user: localUser });
    }
    return res.status(401).json({ success: false, message: "Invalid username/email or password." });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});
router2.post("/register", async (req, res) => {
  const { name, email, username, password, phone, role, city } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: "Name, Email, and Password are required." });
  }
  const assignedRole = role || "patient";
  const generatedMrn = assignedRole === "patient" ? `MRN-${Math.floor(1e4 + Math.random() * 9e4)}` : void 0;
  try {
    const mongoConnected = getMongoConnectedStatus();
    let createdUserObj = null;
    if (mongoConnected) {
      const existing = await User.findOne({ $or: [{ email }, { username: username || email }] });
      if (existing) {
        return res.status(400).json({ success: false, message: "User with this email or username already exists." });
      }
      const hashedPassword = await import_bcryptjs2.default.hash(password, 10);
      const newUser = await User.create({
        name,
        email,
        username: username || email,
        password: hashedPassword,
        role: assignedRole,
        phone,
        city: city || "\u06AF\u0648\u062C\u0631\u0627\u0646\u0648\u0627\u0644\u06C1",
        mrn: generatedMrn
      });
      createdUserObj = {
        id: newUser._id.toString(),
        _id: newUser._id.toString(),
        name: newUser.name,
        email: newUser.email,
        username: newUser.username,
        role: newUser.role,
        mrn: newUser.mrn,
        phone: newUser.phone,
        city: newUser.city || "\u06AF\u0648\u062C\u0631\u0627\u0646\u0648\u0627\u0644\u06C1"
      };
    } else {
      createdUserObj = {
        id: `usr_${Date.now()}`,
        name,
        email,
        username: username || email,
        role: assignedRole,
        mrn: generatedMrn,
        phone,
        city: city || "\u06AF\u0648\u062C\u0631\u0627\u0646\u0648\u0627\u0644\u06C1",
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      };
    }
    inMemoryUsers.unshift(createdUserObj);
    if (createdUserObj.role === "patient") {
      appointmentSeq += 1;
      const apptObj = {
        id: `APP-${String(appointmentSeq).padStart(3, "0")}`,
        patientId: createdUserObj.id,
        patientName: createdUserObj.name,
        phone: createdUserObj.phone || "03000000000",
        city: createdUserObj.city || "\u06AF\u0648\u062C\u0631\u0627\u0646\u0648\u0627\u0644\u06C1",
        problem: "\u0622\u0646 \u0644\u0627\u0626\u0646 \u0631\u062C\u0633\u0679\u0631\u06CC\u0634\u0646 (OPD Checkup)",
        doctorName: "\u0688\u0627\u06A9\u0679\u0631 \u0632\u06CC\u0634\u0627\u0646 \u0686\u0648\u06C1\u062F\u0631\u06CC (MBBS)",
        date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
        timeSlot: "\u0635\u0628\u062D 10:00 - 01:00",
        status: "Pending",
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      if (mongoConnected) {
        await Appointment.create(apptObj).catch(() => {
        });
      }
    }
    const token = import_jsonwebtoken2.default.sign(
      { userId: createdUserObj.id, role: createdUserObj.role, name: createdUserObj.name, email: createdUserObj.email, mrn: createdUserObj.mrn },
      JWT_SECRET,
      { expiresIn: "7d" }
    );
    return res.status(201).json({
      success: true,
      token,
      user: createdUserObj
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});
var authRoutes_default = router2;

// server/routes/doctorRoutes.ts
var import_express3 = require("express");

// server/config/cloudinary.ts
var import_cloudinary = require("cloudinary");
import_cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "",
  api_key: process.env.CLOUDINARY_API_KEY || "",
  api_secret: process.env.CLOUDINARY_API_SECRET || ""
});
function parseCloudinaryUrl(urlOrPublicId) {
  if (!urlOrPublicId || typeof urlOrPublicId !== "string") return null;
  const clean = urlOrPublicId.trim();
  if (clean.startsWith("data:") || clean.startsWith("blob:")) {
    return null;
  }
  if (!clean.startsWith("http://") && !clean.startsWith("https://")) {
    const isVideo = clean.includes("/videos/") || clean.endsWith(".mp4") || clean.endsWith(".webm") || clean.endsWith(".mov");
    const publicId = clean.replace(/\.[^/.]+$/, "");
    return {
      publicId,
      resourceType: isVideo ? "video" : "image"
    };
  }
  if (!clean.includes("cloudinary.com") && !clean.includes("res.cloudinary.com")) {
    return null;
  }
  try {
    const match = clean.match(/\/(image|video|raw)\/upload\/(?:v\d+\/)?([^\?#]+)/i);
    if (!match) return null;
    const resourceType = match[1].toLowerCase() || "image";
    let pathPart = match[2];
    const publicId = pathPart.replace(/\.[^/.]+$/, "");
    return { publicId, resourceType };
  } catch (err) {
    console.error("Error parsing Cloudinary URL:", err);
    return null;
  }
}
async function deleteFromCloudinary(urlOrPublicId, explicitResourceType) {
  if (!urlOrPublicId || typeof urlOrPublicId !== "string") {
    return { success: false, error: "No media specified" };
  }
  const parsed = parseCloudinaryUrl(urlOrPublicId);
  if (!parsed && !explicitResourceType) {
    return { success: false, error: "Not a recognized Cloudinary media URL" };
  }
  const publicId = parsed ? parsed.publicId : urlOrPublicId.trim().replace(/\.[^/.]+$/, "");
  const resourceType = explicitResourceType || (parsed ? parsed.resourceType : "image");
  try {
    console.log(`[Cloudinary Destroy] Request to delete ${resourceType}: "${publicId}"`);
    const result = await import_cloudinary.v2.uploader.destroy(publicId, {
      resource_type: resourceType,
      invalidate: true
    });
    console.log(`[Cloudinary Destroy Result] for "${publicId}":`, result);
    return { success: true, result, publicId, resourceType };
  } catch (err) {
    console.error(`[Cloudinary Destroy Error] Failed to delete "${publicId}":`, err?.message || err);
    return { success: false, error: err?.message || "Cloudinary destroy failed" };
  }
}
async function deleteMultipleFromCloudinary(items) {
  const results = [];
  for (const item of items) {
    if (item) {
      const res = await deleteFromCloudinary(item);
      results.push(res);
    }
  }
  return results;
}

// server/routes/doctorRoutes.ts
var router3 = (0, import_express3.Router)();
var initialDoctors = [
  {
    id: "doc1",
    nameUrdu: "\u0688\u0627\u06A9\u0679\u0631 \u0632\u06CC\u0634\u0627\u0646 \u0686\u0648\u06C1\u062F\u0631\u06CC",
    nameEnglish: "Dr. Zeeshan Chaudhry",
    qualification: "MBBS, RMP (Reg. No. 45892)",
    experience: "15+ \u0633\u0627\u0644 \u06A9\u0627 \u0648\u0633\u06CC\u0639 \u062A\u062C\u0631\u0628\u06C1",
    specializationUrdu: "\u062C\u0648\u0691\u0648\u06BA \u06A9\u0627 \u062F\u0631\u062F\u060C \u0627\u0639\u0635\u0627\u0628\u06CC \u06A9\u0645\u0632\u0648\u0631\u06CC\u060C \u0645\u0639\u062F\u06C1 \u0648 \u062C\u06AF\u0631 \u06A9\u06D2 \u0627\u0645\u0631\u0627\u0636 \u0627\u0648\u0631 \u06A9\u0645\u067E\u06CC\u0648\u0679\u0631\u0627\u0626\u0632\u0688 \u0688\u0627\u0626\u06CC\u06AF\u0646\u0648\u0633\u0633",
    specializationEnglish: "Joint Pain, Neurological Disorders, Gastrointestinal Health & Computer Diagnosis",
    timingUrdu: "\u0635\u0628\u062D 8:00 \u0628\u062C\u06D2 \u0633\u06D2 \u062F\u0648\u067E\u06C1\u0631 2:00 \u0628\u062C\u06D2 \u062A\u06A9 (\u0645\u0627\u0631\u0646\u0646\u06AF \u0627\u0648 \u067E\u06CC \u0688\u06CC)",
    timingEnglish: "8:00 AM - 2:00 PM (Morning OPD)",
    eveningTimingUrdu: "\u0634\u0627\u0645 5:00 \u0628\u062C\u06D2 \u0633\u06D2 \u0631\u0627\u062A 9:00 \u0628\u062C\u06D2 \u062A\u06A9 (\u0627\u06CC\u0648\u0646\u0646\u06AF \u0627\u0648 \u067E\u06CC \u0688\u06CC)",
    eveningTimingEnglish: "5:00 PM - 9:00 PM (Evening OPD)",
    image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=600",
    phone: "+92 300 1234567",
    email: "dr.zeeshan@hafizclinic.com"
  },
  {
    id: "doc2",
    nameUrdu: "\u0688\u0627\u06A9\u0679\u0631 \u0648\u0642\u0627\u0635 \u0635\u063A\u06CC\u0631 \u0686\u0648\u06C1\u062F\u0631\u06CC",
    nameEnglish: "Dr. Waqas Sageer Chaudhry",
    qualification: "MBBS, DPT (Reg. No. 51204)",
    experience: "12+ \u0633\u0627\u0644 \u06A9\u0627 \u062A\u062C\u0631\u0628\u06C1",
    specializationUrdu: "\u0641\u0627\u0644\u062C\u060C \u0644\u0642\u0648\u06C1\u060C \u06A9\u0645\u0631 \u06A9\u06D2 \u0645\u06C1\u0631\u0648\u06BA \u06A9\u0627 \u062F\u0631\u062F\u060C \u0641\u0632\u06CC\u0648\u062A\u06BE\u0631\u0627\u067E\u06CC \u0627\u0648\u0631 \u0622\u0646\u06A9\u06BE\u0648\u06BA \u06A9\u06D2 \u0645\u0639\u0627\u0626\u0646\u06D2 \u06A9\u06D2 \u0645\u0627\u06C1\u0631",
    specializationEnglish: "Stroke Rehab, Sciatica, Disc Issues, Physiotherapy & Eye Care",
    timingUrdu: "\u062F\u0648\u067E\u06C1\u0631 2:00 \u0628\u062C\u06D2 \u0633\u06D2 \u0631\u0627\u062A 8:00 \u0628\u062C\u06D2 \u062A\u06A9 (\u0627\u0648 \u067E\u06CC \u0688\u06CC)",
    timingEnglish: "2:00 PM - 8:00 PM (Regular OPD)",
    eveningTimingUrdu: "\u0634\u0627\u0645 6:00 \u0628\u062C\u06D2 \u0633\u06D2 \u0631\u0627\u062A 10:00 \u0628\u062C\u06D2 \u062A\u06A9 (\u0633\u067E\u06CC\u0634\u0644 \u06A9\u0646\u0633\u0644\u0679\u06CC\u0634\u0646)",
    eveningTimingEnglish: "6:00 PM - 10:00 PM (Special Consultation)",
    image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=600",
    phone: "+92 345 7654321",
    email: "dr.waqas@hafizclinic.com"
  }
];
router3.get("/", async (req, res) => {
  try {
    if (getMongoConnectedStatus()) {
      const doctors = await Doctor.find().sort({ createdAt: -1 });
      return res.json({ success: true, doctors });
    }
    return res.json({ success: true, doctors: initialDoctors });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message, doctors: initialDoctors });
  }
});
router3.post("/", async (req, res) => {
  try {
    if (getMongoConnectedStatus()) {
      const doctor = await Doctor.create(req.body);
      return res.status(201).json({ success: true, doctor });
    }
    return res.status(201).json({ success: true, doctor: { id: `doc_${Date.now()}`, ...req.body } });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});
router3.put("/:id", async (req, res) => {
  try {
    if (getMongoConnectedStatus()) {
      const existing = await Doctor.findById(req.params.id) || await Doctor.findOne({ id: req.params.id });
      if (existing?.image && req.body.image && existing.image !== req.body.image) {
        deleteFromCloudinary(existing.image, "image").catch((err) => console.error("Doctor old image cleanup error:", err));
      }
      const updated = await Doctor.findByIdAndUpdate(req.params.id, req.body, { returnDocument: "after" });
      return res.json({ success: true, doctor: updated });
    }
    return res.json({ success: true, doctor: { id: req.params.id, ...req.body } });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});
router3.delete("/:id", async (req, res) => {
  try {
    const imageUrl = req.body?.imageUrl || req.query?.imageUrl;
    if (getMongoConnectedStatus()) {
      const doctor = await Doctor.findById(req.params.id) || await Doctor.findOne({ id: req.params.id });
      const targetImage = doctor?.image || imageUrl;
      if (targetImage) {
        await deleteFromCloudinary(targetImage, "image");
      }
      await Doctor.findByIdAndDelete(req.params.id);
      await Doctor.findOneAndDelete({ id: req.params.id });
    } else if (imageUrl) {
      await deleteFromCloudinary(imageUrl, "image");
    }
    return res.json({ success: true, message: "Doctor and Cloudinary image deleted successfully." });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});
var doctorRoutes_default = router3;

// server/routes/diseaseRoutes.ts
var import_express4 = require("express");
var router4 = (0, import_express4.Router)();
var initialDiseases = [
  {
    id: "dis-1",
    nameUrdu: "\u062C\u0633\u0645\u0627\u0646\u06CC \u062F\u0631\u062F",
    nameEnglish: "Body Pain",
    category: "pain",
    symptomsUrdu: ["\u067E\u0648\u0631\u06D2 \u062C\u0633\u0645 \u0645\u06CC\u06BA \u0645\u0633\u0644\u0633\u0644 \u0645\u06CC\u0679\u06BE\u0627 \u062F\u0631\u062F", "\u062A\u06BE\u06A9\u0627\u0648\u0679 \u0627\u0648\u0631 \u0633\u0633\u062A\u06CC", "\u0635\u0628\u062D \u0627\u0679\u06BE\u062A\u06D2 \u06C1\u06CC \u062C\u0633\u0645 \u06A9\u0627 \u0627\u06A9\u0691 \u062C\u0627\u0646\u0627"],
    causesUrdu: ["\u0648\u0679\u0627\u0645\u0646 \u0688\u06CC \u0627\u0648\u0631 \u06A9\u06CC\u0644\u0634\u06CC\u0645 \u06A9\u06CC \u06A9\u0645\u06CC", "\u067E\u0679\u06BE\u0648\u06BA \u06A9\u06CC \u06A9\u0645\u0632\u0648\u0631\u06CC"],
    treatmentUrdu: "\u06A9\u0645\u067E\u06CC\u0648\u0679\u0631\u0627\u0626\u0632\u0688 \u0686\u06CC\u06A9 \u0627\u067E \u06A9\u06D2 \u0628\u0639\u062F \u0645\u062E\u0635\u0648\u0635 \u0637\u0628\u06CC \u0646\u0633\u062E\u06C1 \u0627\u0648\u0631 \u0644\u06CC\u0632\u0631 \u0648 \u0627\u0633\u0679\u06CC\u0645 \u062A\u06BE\u0631\u0627\u067E\u06CC",
    recommendedDoctor: "\u0688\u0627\u06A9\u0679\u0631 \u0632\u06CC\u0634\u0627\u0646 \u0686\u0648\u06C1\u062F\u0631\u06CC",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "dis-2",
    nameUrdu: "\u062C\u0648\u0691\u0648\u06BA \u06A9\u0627 \u062F\u0631\u062F",
    nameEnglish: "Joint Pain (Arthritis)",
    category: "pain",
    symptomsUrdu: ["\u062C\u0648\u0691\u0648\u06BA \u0645\u06CC\u06BA \u0633\u0648\u062C\u0646 \u0627\u0648\u0631 \u0633\u0631\u062E\u06CC", "\u0686\u0644\u0646\u06D2 \u067E\u06BE\u0631\u0646\u06D2 \u0645\u06CC\u06BA \u0634\u062F\u06CC\u062F \u062A\u06A9\u0644\u06CC\u0641", "\u0646\u0645\u0627\u0632 \u067E\u0691\u06BE\u0646\u06D2 \u0645\u06CC\u06BA \u062F\u0634\u0648\u0627\u0631\u06CC"],
    causesUrdu: ["\u06CC\u0648\u0631\u06A9 \u0627\u06CC\u0633\u0688 \u06A9\u06CC \u0632\u06CC\u0627\u062F\u06C1 \u0645\u0642\u062F\u0627\u0631", "\u062C\u0648\u0691\u0648\u06BA \u06A9\u06CC \u0686\u06A9\u0646\u0627\u0626\u06CC \u06A9\u0627 \u06A9\u0645 \u06C1\u0648\u0646\u0627"],
    treatmentUrdu: "\u062D\u0627\u0641\u0638 \u062C\u0648\u0627\u0626\u0646\u0679 \u06A9\u06CC\u0626\u0631 \u0641\u0627\u0631\u0645\u0648\u0644\u06C1 \u0627\u0648\u0631 \u0641\u0632\u06CC\u0648\u062A\u06BE\u0631\u0627\u067E\u06CC \u0633\u06CC\u0634\u0646\u0632",
    recommendedDoctor: "\u0688\u0627\u06A9\u0679\u0631 \u0632\u06CC\u0634\u0627\u0646 \u0686\u0648\u06C1\u062F\u0631\u06CC",
    image: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=800"
  }
];
router4.get("/", async (req, res) => {
  try {
    if (getMongoConnectedStatus()) {
      const diseases = await Disease.find().sort({ createdAt: -1 });
      return res.json({ success: true, diseases });
    }
    return res.json({ success: true, diseases: initialDiseases });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message, diseases: initialDiseases });
  }
});
router4.post("/", async (req, res) => {
  try {
    if (getMongoConnectedStatus()) {
      const disease = await Disease.create(req.body);
      return res.status(201).json({ success: true, disease });
    }
    return res.status(201).json({ success: true, disease: { id: `dis_${Date.now()}`, ...req.body } });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});
router4.put("/:id", async (req, res) => {
  try {
    if (getMongoConnectedStatus()) {
      const existing = await Disease.findById(req.params.id) || await Disease.findOne({ id: req.params.id });
      if (existing?.image && req.body.image && existing.image !== req.body.image) {
        deleteFromCloudinary(existing.image, "image").catch((err) => console.error("Disease old image cleanup error:", err));
      }
      const updated = await Disease.findByIdAndUpdate(req.params.id, req.body, { returnDocument: "after" });
      return res.json({ success: true, disease: updated });
    }
    return res.json({ success: true, disease: { id: req.params.id, ...req.body } });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});
router4.delete("/:id", async (req, res) => {
  try {
    const imageUrl = req.body?.imageUrl || req.query?.imageUrl;
    if (getMongoConnectedStatus()) {
      const disease = await Disease.findById(req.params.id) || await Disease.findOne({ id: req.params.id });
      const targetImage = disease?.image || imageUrl;
      if (targetImage) {
        await deleteFromCloudinary(targetImage, "image");
      }
      await Disease.findByIdAndDelete(req.params.id);
      await Disease.findOneAndDelete({ id: req.params.id });
    } else if (imageUrl) {
      await deleteFromCloudinary(imageUrl, "image");
    }
    return res.json({ success: true, message: "Disease and Cloudinary image deleted successfully." });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});
var diseaseRoutes_default = router4;

// server/routes/productRoutes.ts
var import_express5 = require("express");
var router5 = (0, import_express5.Router)();
var initialProducts = [
  {
    id: "prod-1",
    nameUrdu: "\u062D\u0627\u0641\u0638 \u062C\u0648\u0627\u0626\u0646\u0679 \u06A9\u06CC\u0626\u0631 \u06C1\u0631\u0628\u0644 \u0622\u0626\u0644 \u0648 \u0633\u06CC\u0631\u067E",
    nameEnglish: "Hafiz Joint Care Herbal Syrup",
    pricePKR: 1850,
    originalPricePKR: 2200,
    category: "supplements",
    categoryUrdu: "\u0645\u0642\u0648\u06CC \u0627\u062F\u0648\u06CC\u0627\u062A",
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=600",
    descriptionUrdu: "\u062C\u0648\u0691\u0648\u06BA \u0627\u0648\u0631 \u06AF\u06BE\u0679\u0646\u0648\u06BA \u06A9\u06D2 \u062F\u0631\u062F \u06A9\u0627 \u0645\u06A9\u0645\u0644 \u0634\u0627\u0641\u06CC \u0639\u0644\u0627\u062C\u06D4",
    stock: 45,
    isFeatured: true
  },
  {
    id: "prod-2",
    nameUrdu: "\u062D\u0627\u0641\u0638 \u06AF\u06CC\u0633\u062A\u0631\u0648 \u0631\u06CC\u0644\u06CC\u0641 \u0633\u0641\u0648\u0641",
    nameEnglish: "Hafiz Gastro Relief Powder",
    pricePKR: 1200,
    originalPricePKR: 1500,
    category: "syrups",
    categoryUrdu: "\u0634\u0631\u0628\u062A \u0627\u0648\u0631 \u0645\u0639\u062C\u0648\u0646",
    image: "https://images.unsplash.com/photo-1550572017-edd951aa8f72?auto=format&fit=crop&q=80&w=600",
    descriptionUrdu: "\u0645\u0639\u062F\u06D2 \u06A9\u06CC \u062A\u06CC\u0632\u0627\u0628\u06CC\u062A\u060C \u06AF\u06CC\u0633\u060C \u062A\u0628\u062E\u06CC\u0631 \u0627\u0648\u0631 \u0628\u062F\u06C1\u0636\u0645\u06CC \u06A9\u0627 \u0641\u0648\u0631\u06CC \u062D\u0644\u06D4",
    stock: 60,
    isFeatured: true
  }
];
router5.get("/", async (req, res) => {
  try {
    if (getMongoConnectedStatus()) {
      const products = await Product.find().sort({ createdAt: -1 });
      return res.json({ success: true, products });
    }
    return res.json({ success: true, products: initialProducts });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message, products: initialProducts });
  }
});
router5.post("/", async (req, res) => {
  try {
    if (getMongoConnectedStatus()) {
      const product = await Product.create(req.body);
      return res.status(201).json({ success: true, product });
    }
    return res.status(201).json({ success: true, product: { id: `prod_${Date.now()}`, ...req.body } });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});
router5.put("/:id", async (req, res) => {
  try {
    if (getMongoConnectedStatus()) {
      const existing = await Product.findById(req.params.id) || await Product.findOne({ id: req.params.id });
      if (existing?.image && req.body.image && existing.image !== req.body.image) {
        deleteFromCloudinary(existing.image, "image").catch((err) => console.error("Product old image cleanup error:", err));
      }
      if (existing?.videoUrl && req.body.videoUrl && existing.videoUrl !== req.body.videoUrl) {
        deleteFromCloudinary(existing.videoUrl, "video").catch((err) => console.error("Product old video cleanup error:", err));
      }
      const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { returnDocument: "after" });
      return res.json({ success: true, product: updated });
    }
    return res.json({ success: true, product: { id: req.params.id, ...req.body } });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});
router5.delete("/:id", async (req, res) => {
  try {
    const imageUrl = req.body?.imageUrl || req.query?.imageUrl;
    const videoUrl = req.body?.videoUrl || req.query?.videoUrl;
    if (getMongoConnectedStatus()) {
      const product = await Product.findById(req.params.id) || await Product.findOne({ id: req.params.id });
      const targetImage = product?.image || imageUrl;
      const targetVideo = product?.videoUrl || videoUrl;
      if (targetImage) {
        await deleteFromCloudinary(targetImage, "image");
      }
      if (targetVideo) {
        await deleteFromCloudinary(targetVideo, "video");
      }
      await Product.findByIdAndDelete(req.params.id);
      await Product.findOneAndDelete({ id: req.params.id });
    } else {
      if (imageUrl) {
        await deleteFromCloudinary(imageUrl, "image");
      }
      if (videoUrl) {
        await deleteFromCloudinary(videoUrl, "video");
      }
    }
    return res.json({ success: true, message: "Product, image, and video deleted from Cloudinary & Database successfully." });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});
var productRoutes_default = router5;

// server/routes/appointmentRoutes.ts
var import_express7 = require("express");
var import_mongoose8 = __toESM(require("mongoose"));

// server/models/MoneySlip.ts
var import_mongoose7 = __toESM(require("mongoose"));
var MoneySlipSchema = new import_mongoose7.default.Schema({
  id: { type: String, index: true },
  slipNo: { type: String, required: true, index: true },
  tokenNumber: { type: import_mongoose7.default.Schema.Types.Mixed, index: true },
  patientName: { type: String, required: true },
  patientPhone: { type: String, required: true, index: true },
  mrnNumber: { type: String, index: true },
  doctorName: { type: String, required: true, index: true },
  date: { type: String, default: () => (/* @__PURE__ */ new Date()).toISOString().split("T")[0], index: true },
  items: [
    {
      id: { type: String },
      description: { type: String, required: true },
      category: { type: String, default: "Checkup Fee" },
      quantity: { type: Number, default: 1 },
      unitPrice: { type: Number, default: 0 },
      totalPrice: { type: Number, default: 0 }
    }
  ],
  subtotal: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  totalAmount: { type: Number, default: 0 },
  paidAmount: { type: Number, default: 0 },
  balanceAmount: { type: Number, default: 0 },
  paymentStatus: { type: String, default: "Unpaid", index: true },
  paymentMethod: { type: String, default: "Cash" },
  notes: { type: String },
  appointmentId: { type: String, index: true },
  isAutoGenerated: { type: Boolean, default: false },
  source: { type: String, default: "Manual" },
  referralInfo: { type: String },
  createdAt: { type: Date, default: Date.now, index: true }
});
MoneySlipSchema.index({ patientPhone: 1, date: -1 });
MoneySlipSchema.index({ doctorName: 1, date: -1 });
var MoneySlip = import_mongoose7.default.models.MoneySlip || import_mongoose7.default.model("MoneySlip", MoneySlipSchema);

// server/services/emailService.ts
var import_nodemailer = __toESM(require("nodemailer"));
var import_jspdf = require("jspdf");
var hasRealCredentials = Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);
var transporter = hasRealCredentials ? import_nodemailer.default.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587", 10),
  secure: process.env.SMTP_SECURE === "true" || process.env.SMTP_PORT === "465",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
}) : import_nodemailer.default.createTransport({
  jsonTransport: true
  // Graceful fallback: simulated sending when credentials are not yet added to .env
});
var SENDER_EMAIL = process.env.SMTP_FROM || (process.env.SMTP_USER ? `"Hafiz Clinic & Healthcare" <${process.env.SMTP_USER}>` : '"Hafiz Clinic & Healthcare" <no-reply@hafizclinic.com>');
function getEmailServiceStatus() {
  return {
    configured: hasRealCredentials,
    host: process.env.SMTP_HOST || (hasRealCredentials ? "configured" : "simulator-mode"),
    user: process.env.SMTP_USER ? `${process.env.SMTP_USER.slice(0, 3)}***` : "not-set",
    from: SENDER_EMAIL
  };
}
function generateLabReportPdfBuffer(report) {
  const doc = new import_jspdf.jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  doc.setFillColor(6, 78, 59);
  doc.rect(0, 0, pageWidth, 28, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("HAFIZ CLINIC & VISION CENTER", 14, 11);
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.text("ADVANCED PATHOLOGY & DIAGNOSTIC BIOSCAN LABORATORY", 14, 17);
  doc.text("Near Al-Habib Bakery, Wazirabad Road, Gujranwala | Ph: 0300-6428789", 14, 22);
  doc.setFillColor(16, 185, 129);
  doc.roundedRect(pageWidth - 48, 8, 36, 11, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("REPORT COMPLETED", pageWidth - 46, 15);
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("OFFICIAL DIAGNOSTIC TEST REPORT", 14, 37);
  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 41, pageWidth - 28, 28, 2, 2, "FD");
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text("Patient Name:", 18, 48);
  doc.text("Phone / MRN:", 18, 55);
  doc.text("Age / Gender:", 18, 62);
  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.text(String(report.patientName || "N/A"), 45, 48);
  doc.text(String(report.patientPhone || "N/A"), 45, 55);
  doc.text(`${report.patientAge || "35"} Yrs / ${report.patientGender || "Adult"}`, 45, 62);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text("Report ID:", 115, 48);
  doc.text("Sample Date:", 115, 55);
  doc.text("Verified By:", 115, 62);
  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.text(String(report.id || report.orderNumber || "LAB-1001"), 140, 48);
  doc.text(String(report.testDate || (/* @__PURE__ */ new Date()).toISOString().split("T")[0]), 140, 55);
  doc.text(String(report.approvedByPathologist || "Dr. Saima Rehman (Pathologist)"), 140, 62);
  doc.setFillColor(220, 252, 231);
  doc.rect(14, 73, pageWidth - 28, 8, "F");
  doc.setTextColor(6, 95, 70);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.text(`TEST: ${String(report.testName || "Diagnostic Investigation").toUpperCase()} (${report.testCategory || "General Lab"})`, 18, 78.5);
  let yPos = 87;
  doc.setFillColor(241, 245, 249);
  doc.rect(14, yPos, pageWidth - 28, 7, "F");
  doc.setTextColor(71, 85, 105);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("TEST PARAMETER", 18, yPos + 4.8);
  doc.text("RESULT", 95, yPos + 4.8);
  doc.text("UNITS", 125, yPos + 4.8);
  doc.text("REFERENCE INTERVAL", 155, yPos + 4.8);
  yPos += 10;
  const params = report.parameters && report.parameters.length > 0 ? report.parameters : [
    { name: "Primary Clinical Assay", value: "Normal / Completed", unit: "Index", normalRange: "Within Reference Limits" }
  ];
  params.forEach((p, idx) => {
    if (yPos > 245) {
      doc.addPage();
      yPos = 20;
    }
    if (idx % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(14, yPos - 3, pageWidth - 28, 6.5, "F");
    }
    doc.setFont("helvetica", "normal");
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(8.5);
    doc.text(p.name, 18, yPos + 1.5);
    if (p.isAbnormal) {
      doc.setTextColor(190, 18, 60);
      doc.setFont("helvetica", "bold");
    } else {
      doc.setTextColor(15, 23, 42);
      doc.setFont("helvetica", "bold");
    }
    doc.text(String(p.value ?? "Within Limits"), 95, yPos + 1.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text(p.unit || "-", 125, yPos + 1.5);
    doc.text(p.normalRange || "Normal", 155, yPos + 1.5);
    yPos += 7;
  });
  yPos += 4;
  if (yPos > 230) {
    doc.addPage();
    yPos = 20;
  }
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(254, 252, 232);
  doc.roundedRect(14, yPos, pageWidth - 28, 22, 2, 2, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(146, 64, 14);
  doc.text("PATHOLOGIST CLINICAL INTERPRETATION & ADVISORY:", 18, yPos + 6);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(51, 65, 85);
  const remarks = report.clinicalInterpretationUrdu || report.clinicalNotes || "The lab parameters have been verified and processed according to automated quality control standards. Please consult your physician for clinical correlation.";
  doc.text(doc.splitTextToSize(remarks, pageWidth - 36), 18, yPos + 12);
  yPos += 28;
  doc.setDrawColor(203, 213, 225);
  doc.line(14, yPos, pageWidth - 14, yPos);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text("Reported by: Lab Diagnostic Technologist", 18, yPos + 6);
  doc.text(`Approved by: ${report.approvedByPathologist || "Dr. Saima Rehman, FCPS Pathology"}`, 115, yPos + 6);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(148, 163, 184);
  doc.setFontSize(7.5);
  doc.text("This is a computer-verified medical lab document generated by Hafiz Clinic Health Management System.", 14, 285);
  doc.text(`Verification Code: PHC-${report.id || "LAB"} | Contact: 0300-6428789`, pageWidth - 80, 285);
  return Buffer.from(doc.output("arraybuffer"));
}
function generatePrescriptionPdfBuffer(rx) {
  const doc = new import_jspdf.jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  doc.setFillColor(6, 78, 59);
  doc.rect(0, 0, pageWidth, 28, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("HAFIZ CLINIC & VISION CENTER", 14, 11);
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.text("CLINICAL OPD CONSULTATION & PRESCRIPTION SUMMARY", 14, 17);
  doc.text("Near Al-Habib Bakery, Wazirabad Road, Gujranwala | Helpline: 0300-6428789", 14, 22);
  doc.setFillColor(16, 185, 129);
  doc.roundedRect(pageWidth - 40, 8, 28, 11, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Rx EMR", pageWidth - 35, 15.5);
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(rx.doctorName || "Dr. Zeeshan Chaudhry (MBBS, Senior Consultant)", 14, 36);
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text(rx.doctorSpecialization || "General OPD & Specialized Family Medicine Consultant", 14, 41);
  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 45, pageWidth - 28, 24, 2, 2, "FD");
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text("Patient Name:", 18, 52);
  doc.text("Phone / City:", 18, 59);
  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.text(String(rx.patientName || "N/A"), 45, 52);
  doc.text(`${rx.patientPhone || "N/A"} | ${rx.patientCity || "Gujranwala"}`, 45, 59);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text("Rx Number:", 115, 52);
  doc.text("Consultation Date:", 115, 59);
  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.text(String(rx.rxNumber || rx.id || "RX-OPD-101"), 148, 52);
  doc.text(String(rx.date || (/* @__PURE__ */ new Date()).toISOString().split("T")[0]), 148, 59);
  let yPos = 74;
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(14, yPos, pageWidth - 28, 14, 1.5, 1.5, "F");
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  doc.setFont("helvetica", "bold");
  doc.text("PATIENT VITALS:", 18, yPos + 5.5);
  doc.setFont("helvetica", "normal");
  const bp = rx.vitals?.bpSystolic ? `${rx.vitals.bpSystolic}/${rx.vitals.bpDiastolic || 80} mmHg` : "120/80 mmHg";
  const pulse = rx.vitals?.pulse ? `${rx.vitals.pulse} bpm` : "74 bpm";
  const sugar = rx.vitals?.bloodSugarMgDl ? `${rx.vitals.bloodSugarMgDl} mg/dL` : "110 mg/dL";
  const spo2 = rx.vitals?.spo2 ? `${rx.vitals.spo2}%` : "98%";
  doc.text(`BP: ${bp}  |  Pulse: ${pulse}  |  Blood Sugar: ${sugar}  |  SpO2: ${spo2}`, 48, yPos + 5.5);
  doc.setFont("helvetica", "bold");
  doc.text("DIAGNOSIS / CONCERN:", 18, yPos + 10.5);
  doc.setFont("helvetica", "normal");
  doc.text(String(rx.clinicalDiagnosisUrdu || rx.problem || rx.presentingComplaintsUrdu || "Routine OPD Evaluation"), 58, yPos + 10.5);
  yPos += 19;
  doc.setFillColor(6, 78, 59);
  doc.rect(14, yPos, pageWidth - 28, 7, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("PRESCRIBED MEDICINE / FORM", 18, yPos + 4.8);
  doc.text("DOSAGE", 90, yPos + 4.8);
  doc.text("FREQUENCY / TIMING", 120, yPos + 4.8);
  doc.text("DURATION", 170, yPos + 4.8);
  yPos += 10;
  const meds = rx.medicines && rx.medicines.length > 0 ? rx.medicines : [
    {
      name: "Paracetamol 500mg",
      form: "Tablet",
      dosage: "1 tab",
      frequency: "1-0-1 (Morning & Evening)",
      timing: "After Meal",
      durationDays: 5
    }
  ];
  meds.forEach((m, idx) => {
    if (yPos > 240) {
      doc.addPage();
      yPos = 20;
    }
    if (idx % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(14, yPos - 3, pageWidth - 28, 7.5, "F");
    }
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(8.5);
    doc.text(`${m.name} (${m.form || "Tablet"})`, 18, yPos + 1.8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105);
    doc.text(m.dosage || "1 unit", 90, yPos + 1.8);
    doc.text(`${m.frequency || "1-0-1"} ${m.timing ? `- ${m.timing}` : ""}`, 120, yPos + 1.8);
    doc.text(`${m.durationDays || 5} Days`, 170, yPos + 1.8);
    yPos += 8;
  });
  yPos += 4;
  if (yPos > 230) {
    doc.addPage();
    yPos = 20;
  }
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(240, 253, 244);
  doc.roundedRect(14, yPos, pageWidth - 28, 24, 2, 2, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(6, 95, 70);
  doc.text("DOCTOR ADVISORY, DIETARY ADVICE & PRECAUTIONS:", 18, yPos + 6);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(51, 65, 85);
  const adv = rx.dietaryAdviceUrdu || rx.precautionsUrdu || "Take all medications with water at the prescribed times. Maintain adequate hydration and avoid self-medication. Contact the clinic in case of symptoms persistence.";
  doc.text(doc.splitTextToSize(adv, pageWidth - 36), 18, yPos + 12);
  yPos += 30;
  doc.setDrawColor(203, 213, 225);
  doc.line(14, yPos, pageWidth - 14, yPos);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text(`Authorized Physician: ${rx.doctorName || "Dr. Zeeshan Chaudhry"}`, 18, yPos + 6);
  doc.text(`Follow-up: ${rx.followUpDate || "After 7 Days"}`, 130, yPos + 6);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(148, 163, 184);
  doc.setFontSize(7.5);
  doc.text("Official Digital EMR Prescription generated by Hafiz Clinic & Vision Center Healthcare System.", 14, 285);
  doc.text("Helpline: 0300-6428789 | Gujranwala", pageWidth - 65, 285);
  return Buffer.from(doc.output("arraybuffer"));
}
async function sendEmail({
  to,
  subject,
  html,
  attachments = []
}) {
  try {
    const info = await transporter.sendMail({
      from: SENDER_EMAIL,
      to,
      subject,
      html,
      attachments
    });
    if (!hasRealCredentials) {
      console.log(`[Nodemailer Simulator] Email simulated to: ${to} | Subject: "${subject}" | Attachments: ${attachments.length}`);
    } else {
      console.log(`[Nodemailer] Email successfully sent to: ${to} (MessageId: ${info.messageId})`);
    }
    return {
      success: true,
      messageId: info.messageId || "simulated-id",
      simulated: !hasRealCredentials,
      recipient: to
    };
  } catch (error) {
    console.error(`[Nodemailer Error] Failed to send email to ${to}:`, error.message);
    return {
      success: false,
      error: error.message,
      recipient: to
    };
  }
}
async function sendLabReportCompletedEmail(params) {
  const { recipientEmail, patientName, testName, reportData, customPdfBuffer } = params;
  if (!recipientEmail || !recipientEmail.includes("@")) {
    return { success: false, message: "Valid recipient email address is required." };
  }
  const pdfBuffer = customPdfBuffer || generateLabReportPdfBuffer(reportData);
  const safeTestName = (testName || "Lab_Report").replace(/[^a-zA-Z0-9_-]/g, "_");
  const safePatient = (patientName || "Patient").replace(/[^a-zA-Z0-9_-]/g, "_");
  const filename = `HafizClinic_LabReport_${safePatient}_${safeTestName}.pdf`;
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 20px; color: #1e293b; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border: 1px solid #e2e8f0; }
          .header { background: #064e3b; padding: 32px 24px; text-align: center; color: #ffffff; }
          .header h1 { margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px; }
          .header p { margin: 6px 0 0; font-size: 13px; color: #a7f3d0; font-weight: 500; }
          .badge { display: inline-block; background: #10b981; color: #ffffff; font-size: 11px; font-weight: 800; padding: 4px 12px; rounded-radius: 9999px; margin-top: 12px; border-radius: 20px; }
          .content { padding: 32px 24px; }
          .patient-box { background: #f8fafc; border-radius: 12px; padding: 16px; border: 1px solid #e2e8f0; margin: 20px 0; }
          .patient-box table { width: 100%; border-collapse: collapse; font-size: 13px; }
          .patient-box td { padding: 6px 4px; }
          .label { color: #64748b; font-weight: 600; width: 35%; }
          .value { color: #0f172a; font-weight: 700; }
          .btn-container { text-align: center; margin: 28px 0 16px; }
          .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>HAFIZ CLINIC & VISION CENTER</h1>
            <p>Advanced Pathology & BioScan Laboratory Division</p>
            <div class="badge">TEST STATUS: COMPLETED</div>
          </div>
          <div class="content">
            <h2 style="font-size: 18px; color: #065f46; margin-top: 0;">Dear ${patientName},</h2>
            <p style="font-size: 14px; line-height: 1.6; color: #334155;">
              Your diagnostic pathology laboratory test report for <strong>${testName}</strong> has been completed and verified by our clinical pathologist.
            </p>
            <div class="patient-box">
              <table>
                <tr>
                  <td class="label">Patient Name:</td>
                  <td class="value">${patientName}</td>
                </tr>
                <tr>
                  <td class="label">Investigation:</td>
                  <td class="value">${testName}</td>
                </tr>
                <tr>
                  <td class="label">Sample / Test Date:</td>
                  <td class="value">${reportData.testDate || reportData.date || (/* @__PURE__ */ new Date()).toISOString().split("T")[0]}</td>
                </tr>
                <tr>
                  <td class="label">Verified By:</td>
                  <td class="value">${reportData.approvedByPathologist || reportData.approvedBy || "Dr. Saima Rehman (Pathologist)"}</td>
                </tr>
              </table>
            </div>
            <p style="font-size: 13px; line-height: 1.6; color: #475569;">
              \u{1F4CE} <strong>Official PDF Attached:</strong> We have attached your complete, digitally signed diagnostic lab report PDF to this email. You can save, download, or share this document directly with your consulting physician.
            </p>
            <p style="font-size: 12px; color: #64748b; margin-top: 20px;">
              For any questions regarding your report, or to schedule a follow-up consultation, please contact our 24/7 clinic helpline.
            </p>
          </div>
          <div class="footer">
            <p style="margin: 0 0 6px;">Hafiz Clinic & Vision Center | Near Al-Habib Bakery, Wazirabad Road, Gujranwala</p>
            <p style="margin: 0;">24/7 Clinic Helpline: <strong>0300-6428789</strong> | Official Patient Portal</p>
          </div>
        </div>
      </body>
    </html>
  `;
  return sendEmail({
    to: recipientEmail,
    subject: `Medical Lab Report: ${testName} (Completed) - Hafiz Clinic`,
    html,
    attachments: [
      {
        filename,
        content: pdfBuffer,
        contentType: "application/pdf"
      }
    ]
  });
}
async function sendPrescriptionCompletedEmail(params) {
  const { recipientEmail, patientName, doctorName, prescriptionData, customPdfBuffer } = params;
  if (!recipientEmail || !recipientEmail.includes("@")) {
    return { success: false, message: "Valid recipient email address is required." };
  }
  const pdfBuffer = customPdfBuffer || generatePrescriptionPdfBuffer(prescriptionData);
  const safeDoctor = (doctorName || "Doctor").replace(/[^a-zA-Z0-9_-]/g, "_");
  const safePatient = (patientName || "Patient").replace(/[^a-zA-Z0-9_-]/g, "_");
  const filename = `HafizClinic_Prescription_${safePatient}_${safeDoctor}.pdf`;
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 20px; color: #1e293b; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border: 1px solid #e2e8f0; }
          .header { background: #064e3b; padding: 32px 24px; text-align: center; color: #ffffff; }
          .header h1 { margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px; }
          .header p { margin: 6px 0 0; font-size: 13px; color: #a7f3d0; font-weight: 500; }
          .badge { display: inline-block; background: #10b981; color: #ffffff; font-size: 11px; font-weight: 800; padding: 4px 12px; border-radius: 20px; margin-top: 12px; }
          .content { padding: 32px 24px; }
          .doctor-box { background: #f8fafc; border-radius: 12px; padding: 16px; border: 1px solid #e2e8f0; margin: 20px 0; }
          .doctor-box table { width: 100%; border-collapse: collapse; font-size: 13px; }
          .doctor-box td { padding: 6px 4px; }
          .label { color: #64748b; font-weight: 600; width: 35%; }
          .value { color: #0f172a; font-weight: 700; }
          .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>HAFIZ CLINIC & VISION CENTER</h1>
            <p>Department of Clinical Consultations & Electronic Medical Records</p>
            <div class="badge">CONSULTATION: COMPLETED</div>
          </div>
          <div class="content">
            <h2 style="font-size: 18px; color: #065f46; margin-top: 0;">Dear ${patientName},</h2>
            <p style="font-size: 14px; line-height: 1.6; color: #334155;">
              Thank you for visiting Hafiz Clinic. Your clinical consultation and digital prescription with <strong>${doctorName || "your consulting physician"}</strong> has been completed.
            </p>
            <div class="doctor-box">
              <table>
                <tr>
                  <td class="label">Patient Name:</td>
                  <td class="value">${patientName}</td>
                </tr>
                <tr>
                  <td class="label">Attending Doctor:</td>
                  <td class="value">${doctorName || "Dr. Zeeshan Chaudhry"}</td>
                </tr>
                <tr>
                  <td class="label">Consultation Date:</td>
                  <td class="value">${prescriptionData.date || (/* @__PURE__ */ new Date()).toISOString().split("T")[0]}</td>
                </tr>
                <tr>
                  <td class="label">Prescription ID:</td>
                  <td class="value">${prescriptionData.rxNumber || prescriptionData.id || "RX-OPD-101"}</td>
                </tr>
              </table>
            </div>
            <p style="font-size: 13px; line-height: 1.6; color: #475569;">
              \u{1F4CE} <strong>Prescription PDF Attached:</strong> Please find attached your electronic medical prescription detailing prescribed medications, dosage timings, dietary recommendations, and precautions.
            </p>
            <p style="font-size: 12px; color: #64748b; margin-top: 20px;">
              Please take all medications strictly as prescribed. You may also access our in-house Pharmacy POS counter or call our delivery team to have your medications delivered home.
            </p>
          </div>
          <div class="footer">
            <p style="margin: 0 0 6px;">Hafiz Clinic & Vision Center | Near Al-Habib Bakery, Wazirabad Road, Gujranwala</p>
            <p style="margin: 0;">24/7 Helpline: <strong>0300-6428789</strong></p>
          </div>
        </div>
      </body>
    </html>
  `;
  return sendEmail({
    to: recipientEmail,
    subject: `Medical Prescription Summary: ${patientName} - Dr. ${doctorName || "Hafiz Clinic"}`,
    html,
    attachments: [
      {
        filename,
        content: pdfBuffer,
        contentType: "application/pdf"
      }
    ]
  });
}

// server/routes/emailRoutes.ts
var import_express6 = require("express");
var router6 = (0, import_express6.Router)();
async function resolvePatientEmail(info) {
  if (info.email && info.email.includes("@")) {
    return info.email.trim();
  }
  try {
    if (getMongoConnectedStatus()) {
      if (info.phone) {
        const cleanPhone = info.phone.replace(/\D/g, "");
        const u = await User.findOne({
          $or: [{ phone: info.phone }, { phone: new RegExp(cleanPhone.slice(-7)) }]
        });
        if (u?.email && u.email.includes("@")) return u.email.trim();
      }
      if (info.mrn) {
        const u = await User.findOne({ mrn: info.mrn });
        if (u?.email && u.email.includes("@")) return u.email.trim();
      }
      if (info.patientId) {
        const u = await User.findOne({ $or: [{ _id: info.patientId }, { mrn: info.patientId }] });
        if (u?.email && u.email.includes("@")) return u.email.trim();
      }
      if (info.patientName) {
        const u = await User.findOne({ name: new RegExp(`^${info.patientName.trim()}$`, "i") });
        if (u?.email && u.email.includes("@")) return u.email.trim();
      }
    }
  } catch (err) {
    console.error("Error resolving patient email:", err);
  }
  return null;
}
router6.get("/status", (req, res) => {
  return res.json({
    success: true,
    status: getEmailServiceStatus()
  });
});
router6.post("/send-lab-report", async (req, res) => {
  try {
    const { patientEmail, email, patientName, patientPhone, testName, reportData, customPdfBase64 } = req.body;
    let targetEmail = patientEmail || email;
    if (!targetEmail) {
      targetEmail = await resolvePatientEmail({
        email,
        phone: patientPhone || reportData?.patientPhone,
        patientName: patientName || reportData?.patientName,
        mrn: reportData?.mrn || reportData?.patientMrn
      });
    }
    if (!targetEmail) {
      return res.status(400).json({
        success: false,
        message: "No email address found for this patient. Please specify an email address."
      });
    }
    const customPdfBuffer = customPdfBase64 ? Buffer.from(customPdfBase64.replace(/^data:application\/pdf;base64,/, ""), "base64") : void 0;
    const result = await sendLabReportCompletedEmail({
      recipientEmail: targetEmail,
      patientName: patientName || reportData?.patientName || "Valued Patient",
      testName: testName || reportData?.testName || "Diagnostic Lab Investigation",
      reportData: reportData || {},
      customPdfBuffer
    });
    return res.json({
      success: result.success,
      recipient: targetEmail,
      message: result.success ? `Lab report PDF successfully emailed to ${targetEmail}` : result.error || result.message || "Failed to dispatch email",
      details: result
    });
  } catch (err) {
    console.error("Error in send-lab-report endpoint:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
});
router6.post("/send-prescription", async (req, res) => {
  try {
    const { patientEmail, email, patientName, patientPhone, doctorName, prescriptionData, customPdfBase64 } = req.body;
    let targetEmail = patientEmail || email;
    if (!targetEmail) {
      targetEmail = await resolvePatientEmail({
        email,
        phone: patientPhone || prescriptionData?.patientPhone,
        patientName: patientName || prescriptionData?.patientName,
        mrn: prescriptionData?.mrnNumber || prescriptionData?.patientId
      });
    }
    if (!targetEmail) {
      return res.status(400).json({
        success: false,
        message: "No email address found for this patient. Please specify an email address."
      });
    }
    const customPdfBuffer = customPdfBase64 ? Buffer.from(customPdfBase64.replace(/^data:application\/pdf;base64,/, ""), "base64") : void 0;
    const result = await sendPrescriptionCompletedEmail({
      recipientEmail: targetEmail,
      patientName: patientName || prescriptionData?.patientName || "Valued Patient",
      doctorName: doctorName || prescriptionData?.doctorName || "Dr. Zeeshan Chaudhry",
      prescriptionData: prescriptionData || {},
      customPdfBuffer
    });
    return res.json({
      success: result.success,
      recipient: targetEmail,
      message: result.success ? `Prescription summary PDF successfully emailed to ${targetEmail}` : result.error || result.message || "Failed to dispatch email",
      details: result
    });
  } catch (err) {
    console.error("Error in send-prescription endpoint:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
});
router6.post("/test", async (req, res) => {
  try {
    const { to } = req.body;
    if (!to) {
      return res.status(400).json({ success: false, message: 'Recipient email "to" is required.' });
    }
    const result = await sendEmail({
      to,
      subject: "Hafiz Clinic & Healthcare - SMTP Test Notification",
      html: `
        <div style="font-family:sans-serif; padding:20px; color:#1e293b;">
          <h2 style="color:#065f46;">Hafiz Clinic Nodemailer Service Online</h2>
          <p>This is a test notification confirming that the backend email integration is functioning properly.</p>
          <p>Timestamp: ${(/* @__PURE__ */ new Date()).toISOString()}</p>
        </div>
      `
    });
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});
var emailRoutes_default = router6;

// server/routes/appointmentRoutes.ts
var router7 = (0, import_express7.Router)();
var inMemoryAppointments = [
  {
    id: "APP-001",
    patientName: "\u0645\u062D\u0645\u062F \u0637\u0627\u0631\u0642",
    phone: "03001234567",
    city: "\u06AF\u0648\u062C\u0631\u0627\u0646\u0648\u0627\u0644\u06C1",
    problem: "\u06A9\u0645\u0631 \u0648 \u0645\u06C1\u0631\u0648\u06BA \u06A9\u0627 \u0634\u062F\u06CC\u062F \u062F\u0631\u062F",
    doctorName: "\u0688\u0627\u06A9\u0679\u0631 \u0632\u06CC\u0634\u0627\u0646 \u0686\u0648\u06C1\u062F\u0631\u06CC (MBBS)",
    date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
    timeSlot: "\u0635\u0628\u062D 10:00 - 11:00",
    status: "Approved",
    tokenNumber: 1,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    id: "APP-002",
    patientName: "\u06A9\u0627\u0645\u0631\u0627\u0646 \u0639\u0644\u06CC",
    phone: "03219876543",
    city: "\u0644\u0627\u06C1\u0648\u0631",
    problem: "\u0641\u0627\u0644\u062C \u0628\u062D\u0627\u0644\u06CC \u0641\u0632\u06CC\u0648\u062A\u06BE\u0631\u0627\u067E\u06CC",
    doctorName: "\u0688\u0627\u06A9\u0679\u0631 \u0648\u0642\u0627\u0635 \u0635\u063A\u06CC\u0631 \u0686\u0648\u06C1\u062F\u0631\u06CC (MBBS)",
    date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
    timeSlot: "\u062F\u0648\u067E\u06C1\u0631 02:00 - 03:00",
    status: "Pending",
    tokenNumber: 2,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  }
];
var apptSeqCount = 10;
function generateSequentialAppointmentId() {
  apptSeqCount += 1;
  const num = String(apptSeqCount).padStart(3, "0");
  return `APP-${num}`;
}
async function autoCreateAppointmentSlip(appt) {
  try {
    const apptId = appt.id || (appt._id ? String(appt._id) : `APP-${Date.now()}`);
    const fee = 1500;
    const cleanPhone = (appt.phone || "").replace(/\D/g, "");
    const mrnNumber = `MRN-${cleanPhone.slice(-4) || "1001"}`;
    if (getMongoConnectedStatus()) {
      const existing = await MoneySlip.findOne({ appointmentId: apptId });
      if (!existing) {
        await MoneySlip.create({
          slipNo: `SLIP-OPD-${Math.floor(1e3 + Math.random() * 9e3)}`,
          patientName: appt.patientName,
          patientPhone: appt.phone || "",
          mrnNumber,
          doctorName: appt.doctorName || "\u0688\u0627\u06A9\u0679\u0631 \u0632\u06CC\u0634\u0627\u0646 \u0686\u0648\u06C1\u062F\u0631\u06CC (MBBS)",
          date: appt.date || (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
          items: [
            {
              id: `item-opd-${Date.now()}`,
              description: `\u0688\u0627\u06A9\u0679\u0631 \u0645\u0639\u0627\u0626\u0646\u06C1 \u0648 \u0686\u06CC\u06A9 \u0627\u067E \u0641\u06CC\u0633 (${appt.doctorName || "Senior Consultant"})`,
              category: "Checkup Fee",
              quantity: 1,
              unitPrice: fee,
              totalPrice: fee
            }
          ],
          subtotal: fee,
          discount: 0,
          totalAmount: fee,
          paidAmount: 0,
          balanceAmount: fee,
          paymentStatus: "Unpaid",
          paymentMethod: "Cash",
          notes: `\u0627\u0648 \u067E\u06CC \u0688\u06CC \u0679\u0648\u06A9\u0646 \u0646\u0645\u0628\u0631 #${appt.tokenNumber || 1} \u0628\u0631\u0627\u0626\u06D2 ${appt.problem || "\u0645\u0639\u0627\u0626\u0646\u06C1"}`,
          appointmentId: apptId,
          isAutoGenerated: true,
          source: "Appointment"
        });
      }
    }
  } catch (e) {
  }
}
async function triggerPrescriptionEmailIfCompleted(appt, emailOverride, rxDetails) {
  try {
    if (appt?.status !== "Completed") return;
    const targetEmail = emailOverride || appt.email || appt.patientEmail || await resolvePatientEmail({
      phone: appt.phone,
      patientName: appt.patientName,
      mrn: appt.mrnNumber || appt.patientId
    });
    if (targetEmail) {
      console.log(`[Auto-Email] Dispatching completed prescription summary to: ${targetEmail}`);
      sendPrescriptionCompletedEmail({
        recipientEmail: targetEmail,
        patientName: appt.patientName,
        doctorName: appt.doctorName,
        prescriptionData: rxDetails || {
          rxNumber: `RX-${appt.id || "OPD"}`,
          patientName: appt.patientName,
          patientPhone: appt.phone,
          doctorName: appt.doctorName,
          problem: appt.problem,
          date: appt.date || (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
          medicines: appt.medicines || []
        }
      }).catch((err) => console.error("[Auto-Email Error] Prescription dispatch error:", err));
    }
  } catch (e) {
    console.error("Error triggering prescription email:", e);
  }
}
router7.get("/", async (req, res) => {
  try {
    const { doctorName, date, phone, status } = req.query;
    if (getMongoConnectedStatus()) {
      const filter = {};
      if (doctorName) filter.doctorName = new RegExp(String(doctorName), "i");
      if (date) filter.date = String(date);
      if (phone) filter.phone = new RegExp(String(phone), "i");
      if (status) filter.status = String(status);
      let dbList = await Appointment.find(filter).sort({ createdAt: -1 });
      if (!doctorName && !date && !phone && !status) {
        const mongoPatients = await User.find({ role: "patient" }).sort({ createdAt: -1 });
        for (const u of mongoPatients) {
          const uId = u._id.toString();
          const uName = u.name || u.username;
          const uPhone = u.phone;
          const alreadyInList = dbList.some(
            (a) => a.patientId && String(a.patientId) === uId || a.patientName && uName && a.patientName.toLowerCase() === uName.toLowerCase() || uPhone && a.phone && uPhone === a.phone
          );
          if (!alreadyInList) {
            const autoAppt = {
              id: `APP-P${uId.slice(-4)}`,
              patientId: uId,
              patientName: uName,
              phone: uPhone || "03000000000",
              city: u.city || "\u06AF\u0648\u062C\u0631\u0627\u0646\u0648\u0627\u0644\u06C1",
              problem: "\u0631\u062C\u0633\u0679\u0631\u0688 \u0628\u06CC\u0645\u0627\u0631 (OPD Checkup)",
              doctorName: "\u0688\u0627\u06A9\u0679\u0631 \u0632\u06CC\u0634\u0627\u0646 \u0686\u0648\u06C1\u062F\u0631\u06CC (MBBS)",
              date: new Date(u.createdAt || Date.now()).toISOString().split("T")[0],
              timeSlot: "\u0635\u0628\u062D 10:00 - 01:00",
              status: "Pending",
              tokenNumber: dbList.length + 1,
              createdAt: u.createdAt || (/* @__PURE__ */ new Date()).toISOString()
            };
            const createdAppt = await Appointment.create(autoAppt).catch(() => null);
            if (createdAppt) {
              dbList.unshift(createdAppt);
            }
          }
        }
      }
      const seenIds = /* @__PURE__ */ new Set();
      const normalizedList = dbList.map((a, idx) => {
        const item = a.toObject ? a.toObject() : { ...a };
        const rawId = item.id || (item._id ? String(item._id) : `APP-${String(idx + 1).padStart(3, "0")}`);
        if (seenIds.has(rawId)) {
          item.id = `${rawId}-${item._id ? String(item._id).slice(-4) : idx + 1}`;
        } else {
          item.id = rawId;
        }
        seenIds.add(item.id);
        return item;
      });
      return res.json({ success: true, appointments: normalizedList });
    }
    let filtered = [...inMemoryAppointments];
    if (doctorName) filtered = filtered.filter((a) => a.doctorName && a.doctorName.toLowerCase().includes(String(doctorName).toLowerCase()));
    if (date) filtered = filtered.filter((a) => a.date === String(date));
    if (phone) filtered = filtered.filter((a) => a.phone && a.phone.includes(String(phone)));
    if (status) filtered = filtered.filter((a) => a.status === String(status));
    return res.json({ success: true, appointments: filtered });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message, appointments: inMemoryAppointments });
  }
});
router7.post("/", async (req, res) => {
  try {
    let apptId = req.body.id;
    if (!apptId || !apptId.startsWith("APP-")) {
      apptId = generateSequentialAppointmentId();
    }
    const todayStr = req.body.date || (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    const todayCount = inMemoryAppointments.filter((a) => a.date === todayStr).length;
    const tokenNumber = req.body.tokenNumber || todayCount + 1;
    const apptObj = {
      ...req.body,
      id: apptId,
      date: todayStr,
      tokenNumber,
      status: req.body.status || "Pending",
      createdAt: req.body.createdAt || (/* @__PURE__ */ new Date()).toISOString()
    };
    inMemoryAppointments.unshift(apptObj);
    if (getMongoConnectedStatus()) {
      await Appointment.create(apptObj).catch(() => {
      });
      if (apptObj.status === "Approved") {
        await autoCreateAppointmentSlip(apptObj);
      }
    }
    return res.status(201).json({ success: true, appointment: apptObj });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});
router7.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    let updatedAppt = null;
    if (getMongoConnectedStatus()) {
      const isObjId = import_mongoose8.default.Types.ObjectId.isValid(id);
      const query = isObjId ? { $or: [{ _id: id }, { id }] } : { id };
      updatedAppt = await Appointment.findOneAndUpdate(
        query,
        { $set: req.body },
        { returnDocument: "after" }
      );
      if (updatedAppt && (req.body.status === "Approved" || updatedAppt.status === "Approved")) {
        await autoCreateAppointmentSlip(updatedAppt);
      }
      if (updatedAppt && (req.body.status === "Completed" || updatedAppt.status === "Completed")) {
        triggerPrescriptionEmailIfCompleted(updatedAppt, req.body.email || req.body.patientEmail, req.body.prescription);
      }
    }
    const index = inMemoryAppointments.findIndex((a) => a.id === id || a._id && String(a._id) === id);
    if (index !== -1) {
      inMemoryAppointments[index] = { ...inMemoryAppointments[index], ...req.body };
      if (!updatedAppt) updatedAppt = inMemoryAppointments[index];
    } else {
      inMemoryAppointments.unshift({ id, ...req.body });
      if (!updatedAppt) updatedAppt = { id, ...req.body };
    }
    if (updatedAppt && (req.body.status === "Completed" || updatedAppt.status === "Completed")) {
      triggerPrescriptionEmailIfCompleted(updatedAppt, req.body.email || req.body.patientEmail, req.body.prescription);
    }
    return res.json({ success: true, appointment: updatedAppt });
  } catch (err) {
    console.error("Error updating appointment:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
});
router7.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    inMemoryAppointments = inMemoryAppointments.filter((a) => a.id !== id && (!a._id || String(a._id) !== id));
    if (getMongoConnectedStatus()) {
      const isObjId = import_mongoose8.default.Types.ObjectId.isValid(id);
      const query = isObjId ? { $or: [{ _id: id }, { id }] } : { id };
      await Appointment.findOneAndDelete(query).catch(() => {
      });
    }
    return res.json({ success: true, message: "Appointment deleted successfully." });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});
var appointmentRoutes_default = router7;

// server/routes/orderRoutes.ts
var import_express8 = require("express");
var import_mongoose10 = __toESM(require("mongoose"));

// server/models/Order.ts
var import_mongoose9 = __toESM(require("mongoose"));
var OrderSchema = new import_mongoose9.default.Schema({
  customerName: { type: String, required: true },
  phone: { type: String, required: true, index: true },
  city: { type: String, required: true },
  address: { type: String, required: true },
  country: { type: String, default: "Pakistan" },
  items: [{
    productId: String,
    productName: String,
    quantity: { type: Number, default: 1 },
    pricePKR: Number
  }],
  totalPricePKR: { type: Number, required: true },
  paymentMethod: { type: String, default: "COD" },
  status: { type: String, default: "Processing", index: true },
  date: { type: String, default: () => (/* @__PURE__ */ new Date()).toISOString().split("T")[0], index: true },
  trackingId: { type: String, index: true },
  createdAt: { type: Date, default: Date.now, index: true }
});
OrderSchema.index({ phone: 1, createdAt: -1 });
var Order = import_mongoose9.default.models.Order || import_mongoose9.default.model("Order", OrderSchema);

// server/routes/orderRoutes.ts
var router8 = (0, import_express8.Router)();
var inMemoryOrders = [];
async function adjustProductStock(items, isReversal = false) {
  if (!items || !Array.isArray(items) || !getMongoConnectedStatus()) return;
  for (const item of items) {
    const qty = Number(item.quantity || 1);
    const multiplier = isReversal ? 1 : -1;
    const delta = multiplier * qty;
    if (item.productId && import_mongoose10.default.Types.ObjectId.isValid(item.productId)) {
      await Product.findByIdAndUpdate(item.productId, { $inc: { stock: delta } }).catch(() => {
      });
    } else if (item.productName) {
      await Product.findOneAndUpdate(
        {
          $or: [
            { nameEnglish: new RegExp(item.productName.trim(), "i") },
            { nameUrdu: new RegExp(item.productName.trim(), "i") }
          ]
        },
        { $inc: { stock: delta } }
      ).catch(() => {
      });
    }
  }
}
router8.get("/", async (req, res) => {
  try {
    const { phone, trackingId, status } = req.query;
    if (getMongoConnectedStatus()) {
      const filter = {};
      if (phone) filter.phone = new RegExp(String(phone), "i");
      if (trackingId) filter.trackingId = new RegExp(String(trackingId), "i");
      if (status) filter.status = String(status);
      const orders = await Order.find(filter).sort({ createdAt: -1 });
      return res.json({ success: true, orders });
    }
    let filtered = [...inMemoryOrders];
    if (phone) filtered = filtered.filter((o) => o.phone && o.phone.includes(String(phone)));
    if (trackingId) filtered = filtered.filter((o) => o.trackingId && o.trackingId.includes(String(trackingId)));
    if (status) filtered = filtered.filter((o) => o.status === String(status));
    return res.json({ success: true, orders: filtered });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message, orders: inMemoryOrders });
  }
});
router8.post("/", async (req, res) => {
  try {
    const trackingId = req.body.trackingId || `TRK-${Math.floor(1e5 + Math.random() * 9e5)}`;
    const items = req.body.items || [];
    const totalPricePKR = Number(req.body.totalPricePKR) || 0;
    const orderData = {
      ...req.body,
      items,
      totalPricePKR,
      trackingId,
      status: req.body.status || "Processing",
      date: req.body.date || (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      createdAt: req.body.createdAt || (/* @__PURE__ */ new Date()).toISOString()
    };
    let createdOrder = null;
    if (getMongoConnectedStatus()) {
      createdOrder = await Order.create(orderData);
      await adjustProductStock(items, false);
      const slipItems = items.map((it, idx) => ({
        id: `item-ord-${idx + 1}`,
        description: it.productName || "\u06C1\u0631\u0628\u0644 \u0645\u06CC\u0688\u06CC\u0633\u0646",
        category: "Medicine",
        quantity: Number(it.quantity || 1),
        unitPrice: Number(it.pricePKR || 0),
        totalPrice: Number(it.pricePKR || 0) * Number(it.quantity || 1)
      }));
      if (slipItems.length > 0) {
        await MoneySlip.create({
          slipNo: `SLIP-ORD-${trackingId.slice(-4)}`,
          patientName: req.body.customerName || "\u0622\u0646 \u0644\u0627\u0626\u0646 \u06AF\u0627\u06C1\u06A9",
          patientPhone: req.body.phone || "",
          doctorName: "\u0622\u0646 \u0644\u0627\u0626\u0646 \u0641\u0627\u0631\u0645\u06CC\u0633\u06CC / \u0627\u0633\u0679\u0648\u0631",
          date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
          items: slipItems,
          subtotal: totalPricePKR,
          discount: 0,
          totalAmount: totalPricePKR,
          paidAmount: req.body.paymentMethod === "Online" ? totalPricePKR : 0,
          balanceAmount: req.body.paymentMethod === "Online" ? 0 : totalPricePKR,
          paymentStatus: req.body.paymentMethod === "Online" ? "Paid" : "Unpaid",
          paymentMethod: req.body.paymentMethod || "Cash",
          notes: `\u0622\u0646 \u0644\u0627\u0626\u0646 \u0622\u0631\u0688\u0631 \u0679\u0631\u06CC\u06A9\u0646\u06AF: ${trackingId} - \u067E\u062A\u06C1: ${req.body.address || ""}, ${req.body.city || ""}`,
          isAutoGenerated: true,
          source: "Store Order"
        }).catch(() => {
        });
      }
    } else {
      createdOrder = { id: `ord_${Date.now()}`, ...orderData };
    }
    inMemoryOrders.unshift(createdOrder);
    return res.status(201).json({ success: true, order: createdOrder });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});
router8.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    let updatedOrder = null;
    if (getMongoConnectedStatus()) {
      const isObjId = import_mongoose10.default.Types.ObjectId.isValid(id);
      const query = isObjId ? { $or: [{ _id: id }, { trackingId: id }] } : { trackingId: id };
      const currentOrder = await Order.findOne(query);
      if (currentOrder && currentOrder.status !== "Cancelled" && req.body.status === "Cancelled") {
        await adjustProductStock(currentOrder.items, true);
      }
      updatedOrder = await Order.findOneAndUpdate(query, { $set: req.body }, { returnDocument: "after" });
    }
    const idx = inMemoryOrders.findIndex((o) => o._id === id || o.id === id || o.trackingId === id);
    if (idx !== -1) {
      inMemoryOrders[idx] = { ...inMemoryOrders[idx], ...req.body };
      if (!updatedOrder) updatedOrder = inMemoryOrders[idx];
    }
    return res.json({ success: true, order: updatedOrder || { id, ...req.body } });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});
router8.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (getMongoConnectedStatus()) {
      const isObjId = import_mongoose10.default.Types.ObjectId.isValid(id);
      const query = isObjId ? { $or: [{ _id: id }, { trackingId: id }] } : { trackingId: id };
      const currentOrder = await Order.findOne(query);
      if (currentOrder && currentOrder.status !== "Cancelled") {
        await adjustProductStock(currentOrder.items, true);
      }
      await Order.findOneAndDelete(query);
    }
    inMemoryOrders = inMemoryOrders.filter((o) => o._id !== id && o.id !== id && o.trackingId !== id);
    return res.json({ success: true, message: "Order deleted and inventory restored successfully." });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});
var orderRoutes_default = router8;

// server/routes/userRoutes.ts
var import_express9 = require("express");
var import_bcryptjs3 = __toESM(require("bcryptjs"));
var router9 = (0, import_express9.Router)();
var inMemoryUsers2 = [
  {
    id: "usr-1",
    _id: "usr-1",
    name: "\u0645\u062D\u0645\u062F \u0641\u0627\u0631\u0648\u0642",
    email: "farooq@example.com",
    username: "MRN-84920",
    role: "patient",
    mrn: "MRN-84920",
    phone: "03019876543",
    city: "\u06AF\u0648\u062C\u0631\u0627\u0646\u0648\u0627\u0644\u06C1",
    status: "active",
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    id: "usr-2",
    _id: "usr-2",
    name: "\u06A9\u0627\u0645\u0631\u0627\u0646 \u0639\u0644\u06CC",
    email: "kamran@example.com",
    username: "MRN-84921",
    role: "patient",
    mrn: "MRN-84921",
    phone: "03219876543",
    city: "\u0644\u0627\u06C1\u0648\u0631",
    status: "active",
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  }
];
var apptCounter = 20;
router9.get("/", async (req, res) => {
  try {
    if (getMongoConnectedStatus()) {
      const mongoUsers = await User.find().select("-password").sort({ createdAt: -1 });
      const usersList = mongoUsers.map((mu) => ({
        id: mu._id.toString(),
        _id: mu._id.toString(),
        name: mu.name,
        email: mu.email,
        username: mu.username,
        role: mu.role,
        mrn: mu.mrn,
        phone: mu.phone,
        city: mu.city || "\u06AF\u0648\u062C\u0631\u0627\u0646\u0648\u0627\u0644\u06C1",
        status: mu.status || "active",
        createdAt: mu.createdAt
      }));
      return res.json({ success: true, users: usersList });
    }
    return res.json({ success: true, users: inMemoryUsers2 });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message, users: inMemoryUsers2 });
  }
});
router9.post("/", async (req, res) => {
  try {
    const rawPassword = req.body.password || "user123";
    const hashedPassword = await import_bcryptjs3.default.hash(rawPassword, 10);
    const newUser = {
      id: `usr_${Date.now()}`,
      name: req.body.name,
      email: req.body.email,
      username: req.body.username || req.body.email,
      password: hashedPassword,
      role: req.body.role || "patient",
      mrn: req.body.mrn || (req.body.role === "patient" ? `MRN-${Math.floor(1e4 + Math.random() * 9e4)}` : void 0),
      phone: req.body.phone,
      city: req.body.city || "\u06AF\u0648\u062C\u0631\u0627\u0646\u0648\u0627\u0644\u06C1",
      status: req.body.status || "active",
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    inMemoryUsers2.unshift(newUser);
    if (getMongoConnectedStatus()) {
      await User.create(newUser).catch(() => {
      });
    }
    if (newUser.role === "patient") {
      apptCounter += 1;
      const apptObj = {
        id: `APP-${String(apptCounter).padStart(3, "0")}`,
        patientId: newUser.id,
        patientName: newUser.name,
        phone: newUser.phone || "03000000000",
        city: newUser.city || "\u06AF\u0648\u062C\u0631\u0627\u0646\u0648\u0627\u0644\u06C1",
        problem: "\u0631\u062C\u0633\u0679\u0631\u0688 \u0628\u06CC\u0645\u0627\u0631 (OPD Checkup)",
        doctorName: "\u0688\u0627\u06A9\u0679\u0631 \u0632\u06CC\u0634\u0627\u0646 \u0686\u0648\u06C1\u062F\u0631\u06CC (MBBS)",
        date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
        timeSlot: "\u0635\u0628\u062D 10:00 - 01:00",
        status: "Pending",
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      if (getMongoConnectedStatus()) {
        await Appointment.create(apptObj).catch(() => {
        });
      }
    }
    return res.status(201).json({ success: true, user: newUser });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});
router9.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (getMongoConnectedStatus()) {
      const updated = await User.findByIdAndUpdate(id, req.body, { returnDocument: "after" }).select("-password");
      if (updated) {
        return res.json({ success: true, user: updated });
      }
    }
    const idx = inMemoryUsers2.findIndex((u) => u.id === id || u._id === id);
    if (idx !== -1) {
      inMemoryUsers2[idx] = { ...inMemoryUsers2[idx], ...req.body };
    }
    return res.json({ success: true, user: inMemoryUsers2[idx] || { id, ...req.body } });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});
router9.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const imageUrl = req.body?.imageUrl || req.query?.imageUrl;
    if (getMongoConnectedStatus()) {
      const user = await User.findById(id) || await User.findOne({ username: id });
      const targetImage = user?.image || user?.avatar || imageUrl;
      if (targetImage) {
        await deleteFromCloudinary(targetImage);
      }
      await User.findByIdAndDelete(id);
      await User.findOneAndDelete({ username: id });
    } else {
      const user = inMemoryUsers2.find((u) => u.id === id || u._id === id || u.username === id);
      const targetImage = user?.image || user?.avatar || imageUrl;
      if (targetImage) {
        await deleteFromCloudinary(targetImage);
      }
    }
    inMemoryUsers2 = inMemoryUsers2.filter((u) => u.id !== id && u._id !== id && u.username !== id);
    return res.json({ success: true, message: "User and Cloudinary profile assets deleted successfully." });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});
var userRoutes_default = router9;

// server/routes/messageRoutes.ts
var import_express10 = require("express");

// server/models/Message.ts
var import_mongoose11 = __toESM(require("mongoose"));
var MessageSchema = new import_mongoose11.default.Schema({
  id: { type: String },
  senderId: { type: String, required: true },
  senderName: { type: String, required: true },
  senderRole: { type: String, required: true },
  receiverId: { type: String, required: true },
  receiverName: { type: String, required: true },
  receiverRole: { type: String, required: true },
  text: { type: String, default: "" },
  attachmentUrl: { type: String },
  audioUrl: { type: String },
  audioDuration: { type: String },
  documentType: { type: String },
  reportId: { type: String },
  digitalSlip: { type: import_mongoose11.default.Schema.Types.Mixed },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});
var Message = import_mongoose11.default.models.Message || import_mongoose11.default.model("Message", MessageSchema);

// server/routes/messageRoutes.ts
var router10 = (0, import_express10.Router)();
var inMemoryMessages = [];
var getAliases = (id) => {
  if (!id) return [];
  const cleanId = String(id).trim().toLowerCase();
  if (["doc-1", "doc1", "doctor1", "drzeeshan", "dr.zeeshan@hafizclinic.com"].includes(cleanId)) {
    return ["doc-1", "doc1", "doctor1", "drzeeshan"];
  }
  if (["doc-2", "doc2", "doctor2", "drwaqas", "dr.waqas@hafizclinic.com"].includes(cleanId)) {
    return ["doc-2", "doc2", "doctor2", "drwaqas"];
  }
  if (["usr-1", "usr1", "patient1", "mrn-84920", "farooq@example.com"].includes(cleanId)) {
    return ["usr-1", "usr1", "patient1", "mrn-84920", "MRN-84920"];
  }
  if (["usr-2", "usr2", "patient2", "mrn-84921", "kamran@example.com"].includes(cleanId)) {
    return ["usr-2", "usr2", "patient2", "mrn-84921", "MRN-84921"];
  }
  return [id, cleanId];
};
router10.get("/", async (req, res) => {
  try {
    const { userId, doctorId, user1, user2 } = req.query;
    let list = [];
    if (getMongoConnectedStatus()) {
      try {
        const mongoMsgs = await Message.find().sort({ createdAt: 1 }).lean();
        const formattedMongo = mongoMsgs.map((m) => ({
          ...m,
          id: m.id || String(m._id)
        }));
        const mongoIds = new Set(formattedMongo.map((m) => String(m.id)));
        const memoryOnly = inMemoryMessages.filter((m) => !mongoIds.has(String(m.id)));
        list = [...formattedMongo, ...memoryOnly];
      } catch (err) {
        list = [...inMemoryMessages];
      }
    } else {
      list = [...inMemoryMessages];
    }
    const u1 = String(userId || user1 || "").trim();
    const u2 = String(doctorId || user2 || "").trim();
    if (u1 === "admin-monitor" || !u1 && !u2) {
    } else if (u1 && u2) {
      const aliases1 = getAliases(u1);
      const aliases2 = getAliases(u2);
      list = list.filter((m) => {
        const sId = String(m.senderId || "").trim();
        const rId = String(m.receiverId || "").trim();
        const match1to2 = aliases1.some((a) => a.toLowerCase() === sId.toLowerCase()) && aliases2.some((b) => b.toLowerCase() === rId.toLowerCase());
        const match2to1 = aliases2.some((b) => b.toLowerCase() === sId.toLowerCase()) && aliases1.some((a) => a.toLowerCase() === rId.toLowerCase());
        return match1to2 || match2to1;
      });
    } else if (u1) {
      const aliases = getAliases(u1);
      list = list.filter((m) => {
        const sId = String(m.senderId || "").trim().toLowerCase();
        const rId = String(m.receiverId || "").trim().toLowerCase();
        return aliases.some((a) => a.toLowerCase() === sId || a.toLowerCase() === rId);
      });
    } else if (u2) {
      const aliases = getAliases(u2);
      list = list.filter((m) => {
        const sId = String(m.senderId || "").trim().toLowerCase();
        const rId = String(m.receiverId || "").trim().toLowerCase();
        return aliases.some((a) => a.toLowerCase() === sId || a.toLowerCase() === rId);
      });
    }
    const seenMap = /* @__PURE__ */ new Map();
    const uniqueList = [];
    for (const m of list) {
      const key = m.id || `${m.senderId}_${m.receiverId}_${m.text}_${m.createdAt}`;
      if (!seenMap.has(key)) {
        seenMap.set(key, true);
        uniqueList.push(m);
      }
    }
    return res.json({ success: true, messages: uniqueList });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message, messages: inMemoryMessages });
  }
});
router10.post("/", async (req, res) => {
  try {
    const msgId = req.body.id || `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const msgItem = {
      id: msgId,
      senderId: req.body.senderId,
      senderName: req.body.senderName,
      senderRole: req.body.senderRole || "patient",
      receiverId: req.body.receiverId,
      receiverName: req.body.receiverName,
      receiverRole: req.body.receiverRole || "doctor",
      text: req.body.text || "",
      attachmentUrl: req.body.attachmentUrl,
      audioUrl: req.body.audioUrl,
      audioDuration: req.body.audioDuration,
      documentType: req.body.documentType,
      digitalSlip: req.body.digitalSlip,
      createdAt: req.body.createdAt || (/* @__PURE__ */ new Date()).toISOString()
    };
    const existsInMemory = inMemoryMessages.some((m) => m.id === msgItem.id);
    if (!existsInMemory) {
      inMemoryMessages.push(msgItem);
    }
    if (getMongoConnectedStatus()) {
      await Message.create(msgItem).catch(() => {
      });
    }
    return res.status(201).json({ success: true, messageItem: msgItem });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});
router10.delete("/conversation", async (req, res) => {
  try {
    const { user1, user2 } = req.query;
    const u1 = String(user1 || "").trim();
    const u2 = String(user2 || "").trim();
    if (!u1 || !u2) {
      return res.status(400).json({ success: false, message: "user1 and user2 query parameters are required." });
    }
    const aliases1 = getAliases(u1);
    const aliases2 = getAliases(u2);
    let messagesToDelete = [];
    if (getMongoConnectedStatus()) {
      const mongoMsgs = await Message.find({
        $or: [
          { senderId: { $in: aliases1 }, receiverId: { $in: aliases2 } },
          { senderId: { $in: aliases2 }, receiverId: { $in: aliases1 } }
        ]
      });
      messagesToDelete = [...mongoMsgs];
      await Message.deleteMany({
        $or: [
          { senderId: { $in: aliases1 }, receiverId: { $in: aliases2 } },
          { senderId: { $in: aliases2 }, receiverId: { $in: aliases1 } }
        ]
      });
    }
    const memMsgs = inMemoryMessages.filter((m) => {
      const sId = String(m.senderId || "").trim();
      const rId = String(m.receiverId || "").trim();
      const match1to2 = aliases1.some((a) => a.toLowerCase() === sId.toLowerCase()) && aliases2.some((b) => b.toLowerCase() === rId.toLowerCase());
      const match2to1 = aliases2.some((b) => b.toLowerCase() === sId.toLowerCase()) && aliases1.some((a) => a.toLowerCase() === rId.toLowerCase());
      return match1to2 || match2to1;
    });
    messagesToDelete = [...messagesToDelete, ...memMsgs];
    inMemoryMessages = inMemoryMessages.filter((m) => !memMsgs.includes(m));
    const mediaUrlsToPurge = [];
    for (const msg of messagesToDelete) {
      if (msg.attachmentUrl) mediaUrlsToPurge.push(msg.attachmentUrl);
      if (msg.audioUrl) mediaUrlsToPurge.push(msg.audioUrl);
    }
    if (mediaUrlsToPurge.length > 0) {
      await deleteMultipleFromCloudinary(mediaUrlsToPurge);
    }
    return res.json({
      success: true,
      message: `Conversation and ${mediaUrlsToPurge.length} associated Cloudinary media files deleted successfully.`,
      purgedMediaCount: mediaUrlsToPurge.length
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});
router10.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const attachmentUrl = req.body?.attachmentUrl || req.query?.attachmentUrl;
    const audioUrl = req.body?.audioUrl || req.query?.audioUrl;
    let targetAttachment = attachmentUrl;
    let targetAudio = audioUrl;
    if (getMongoConnectedStatus()) {
      const isObjId = id.length === 24 && /^[0-9a-fA-F]+$/.test(id);
      const query = isObjId ? { $or: [{ _id: id }, { id }] } : { id };
      const msg = await Message.findOne(query);
      if (msg) {
        targetAttachment = msg.attachmentUrl || targetAttachment;
        targetAudio = msg.audioUrl || targetAudio;
        await Message.findOneAndDelete(query);
      }
    }
    const memMsg = inMemoryMessages.find((m) => m.id === id || m._id === id);
    if (memMsg) {
      targetAttachment = memMsg.attachmentUrl || targetAttachment;
      targetAudio = memMsg.audioUrl || targetAudio;
    }
    inMemoryMessages = inMemoryMessages.filter((m) => m.id !== id && m._id !== id);
    if (targetAttachment) {
      await deleteFromCloudinary(targetAttachment);
    }
    if (targetAudio) {
      await deleteFromCloudinary(targetAudio);
    }
    return res.json({
      success: true,
      message: "Message and associated Cloudinary media deleted successfully."
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});
var messageRoutes_default = router10;

// server/routes/reportRoutes.ts
var import_express11 = require("express");

// server/models/Report.ts
var import_mongoose12 = __toESM(require("mongoose"));
var ReportSchema = new import_mongoose12.default.Schema({
  patientId: { type: String, required: true },
  patientName: { type: String, required: true },
  doctorId: { type: String },
  doctorName: { type: String },
  testNameUrdu: { type: String, required: true },
  testNameEnglish: { type: String, required: true },
  summary: { type: String },
  fileUrl: { type: String },
  status: { type: String, default: "Submitted" },
  doctorComment: { type: String },
  date: { type: String, default: () => (/* @__PURE__ */ new Date()).toISOString().split("T")[0] },
  createdAt: { type: Date, default: Date.now }
});
var Report = import_mongoose12.default.models.Report || import_mongoose12.default.model("Report", ReportSchema);

// server/routes/reportRoutes.ts
var router11 = (0, import_express11.Router)();
var inMemoryReports = [];
async function triggerLabReportEmailIfCompleted(report, emailOverride) {
  try {
    const isCompleted = report?.status === "Completed" || report?.status === "Report Ready" || report?.status === "Ready" || report?.status === "Reviewed";
    if (!isCompleted) return;
    const targetEmail = emailOverride || report.email || report.patientEmail || await resolvePatientEmail({
      phone: report.phone || report.patientPhone,
      patientName: report.patientName,
      patientId: report.patientId
    });
    if (targetEmail) {
      console.log(`[Auto-Email] Dispatching completed lab report to: ${targetEmail}`);
      sendLabReportCompletedEmail({
        recipientEmail: targetEmail,
        patientName: report.patientName,
        testName: report.testNameEnglish || report.testName || "Diagnostic Lab Investigation",
        reportData: report
      }).catch((err) => console.error("[Auto-Email Error] Lab report dispatch error:", err));
    }
  } catch (err) {
    console.error("Error triggering lab report email:", err);
  }
}
router11.get("/", async (req, res) => {
  try {
    const { patientId, doctorId } = req.query;
    if (getMongoConnectedStatus()) {
      let filter = {};
      if (patientId) filter.patientId = patientId;
      if (doctorId) filter.doctorId = doctorId;
      const reports = await Report.find(filter).sort({ createdAt: -1 });
      return res.json({ success: true, reports });
    }
    let list = [...inMemoryReports];
    if (patientId) list = list.filter((r) => r.patientId === String(patientId));
    if (doctorId) list = list.filter((r) => r.doctorId === String(doctorId));
    return res.json({ success: true, reports: list });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message, reports: inMemoryReports });
  }
});
router11.post("/", async (req, res) => {
  try {
    const reportData = {
      id: req.body.id || `REP-${Math.floor(1e3 + Math.random() * 9e3)}`,
      ...req.body,
      date: req.body.date || (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    inMemoryReports.unshift(reportData);
    if (getMongoConnectedStatus()) {
      const newReport = await Report.create(reportData);
      triggerLabReportEmailIfCompleted(newReport, req.body.email || req.body.patientEmail);
      return res.status(201).json({ success: true, report: newReport });
    }
    triggerLabReportEmailIfCompleted(reportData, req.body.email || req.body.patientEmail);
    return res.status(201).json({ success: true, report: reportData });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});
router11.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (getMongoConnectedStatus()) {
      const existing = await Report.findById(id) || await Report.findOne({ id });
      if (existing?.fileUrl && req.body.fileUrl && existing.fileUrl !== req.body.fileUrl) {
        deleteFromCloudinary(existing.fileUrl).catch((err) => console.error("Report old file cleanup error:", err));
      }
      const updated = await Report.findByIdAndUpdate(id, req.body, { returnDocument: "after" }) || await Report.findOneAndUpdate({ id }, req.body, { returnDocument: "after" });
      if (updated) {
        triggerLabReportEmailIfCompleted(updated, req.body.email || req.body.patientEmail);
      }
      return res.json({ success: true, report: updated });
    }
    const idx = inMemoryReports.findIndex((r) => r.id === id || r._id === id);
    if (idx !== -1) {
      if (inMemoryReports[idx].fileUrl && req.body.fileUrl && inMemoryReports[idx].fileUrl !== req.body.fileUrl) {
        deleteFromCloudinary(inMemoryReports[idx].fileUrl).catch(() => {
        });
      }
      inMemoryReports[idx] = { ...inMemoryReports[idx], ...req.body };
      triggerLabReportEmailIfCompleted(inMemoryReports[idx], req.body.email || req.body.patientEmail);
    }
    const finalReport = inMemoryReports[idx] || { id, ...req.body };
    return res.json({ success: true, report: finalReport });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});
router11.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const fileUrl = req.body?.fileUrl || req.query?.fileUrl;
    if (getMongoConnectedStatus()) {
      const report = await Report.findById(id) || await Report.findOne({ id });
      const targetFile = report?.fileUrl || fileUrl;
      if (targetFile) {
        await deleteFromCloudinary(targetFile);
      }
      await Report.findByIdAndDelete(id);
      await Report.findOneAndDelete({ id });
    } else {
      const memReport = inMemoryReports.find((r) => r.id === id || r._id === id);
      const targetFile = memReport?.fileUrl || fileUrl;
      if (targetFile) {
        await deleteFromCloudinary(targetFile);
      }
    }
    inMemoryReports = inMemoryReports.filter((r) => r.id !== id && r._id !== id);
    return res.json({
      success: true,
      message: "Medical report and attached Cloudinary file deleted successfully."
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});
var reportRoutes_default = router11;

// server/routes/uploadRoutes.ts
var import_express12 = require("express");
var router12 = (0, import_express12.Router)();
async function handleCloudinaryUpload(req, res, folder, resourceType = "auto") {
  try {
    const media = req.body.image || req.body.imageBase64 || req.body.video || req.body.videoBase64 || req.body.media;
    if (!media) {
      return res.status(400).json({ success: false, message: "Base64 media data or URL is required." });
    }
    const result = await import_cloudinary.v2.uploader.upload(media, {
      folder,
      resource_type: resourceType
    });
    return res.json({
      success: true,
      url: result.secure_url,
      imageUrl: result.secure_url,
      videoUrl: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      resourceType: result.resource_type
    });
  } catch (err) {
    console.error(`Cloudinary Upload Error (${folder}):`, err);
    const media = req.body.image || req.body.imageBase64 || req.body.video || req.body.videoBase64 || req.body.media;
    if (media && typeof media === "string" && (media.startsWith("http") || media.startsWith("data:"))) {
      return res.json({
        success: true,
        url: media,
        imageUrl: media,
        videoUrl: media
      });
    }
    return res.status(500).json({ success: false, message: err.message || "Media upload failed" });
  }
}
router12.post("/disease-image", (req, res) => handleCloudinaryUpload(req, res, "hafiz_clinic/diseases", "image"));
router12.post("/doctor-image", (req, res) => handleCloudinaryUpload(req, res, "hafiz_clinic/doctors", "image"));
router12.post("/product-image", (req, res) => handleCloudinaryUpload(req, res, "hafiz_clinic/products", "image"));
router12.post("/product-video", (req, res) => handleCloudinaryUpload(req, res, "hafiz_clinic/products/videos", "video"));
router12.post("/video", (req, res) => handleCloudinaryUpload(req, res, "hafiz_clinic/videos", "video"));
router12.post("/image", (req, res) => handleCloudinaryUpload(req, res, "hafiz_clinic/general", "auto"));
router12.post("/delete-media", async (req, res) => {
  try {
    const { url, publicId, resourceType } = req.body;
    const target = url || publicId;
    if (!target) {
      return res.status(400).json({ success: false, message: "URL or publicId is required for deletion" });
    }
    const result = await deleteFromCloudinary(target, resourceType);
    return res.json({ success: true, ...result });
  } catch (err) {
    console.error("Delete Media Route Error:", err);
    return res.status(500).json({ success: false, message: err?.message || "Failed to delete media from Cloudinary" });
  }
});
router12.post("/delete-batch", async (req, res) => {
  try {
    const { urls } = req.body;
    if (!Array.isArray(urls) || urls.length === 0) {
      return res.status(400).json({ success: false, message: "urls array is required" });
    }
    const results = await deleteMultipleFromCloudinary(urls);
    return res.json({ success: true, results });
  } catch (err) {
    console.error("Delete Batch Media Route Error:", err);
    return res.status(500).json({ success: false, message: err?.message || "Failed to batch delete media" });
  }
});
var uploadRoutes_default = router12;

// server/routes/callRoutes.ts
var import_express13 = require("express");
var router13 = (0, import_express13.Router)();
var activeCalls = [];
router13.get("/active", (req, res) => {
  const { userId } = req.query;
  if (!userId) {
    return res.json({ success: true, call: null });
  }
  const uId = String(userId);
  const found = activeCalls.find(
    (c) => (c.callerId === uId || c.receiverId === uId) && (c.status === "ringing" || c.status === "connected")
  );
  return res.json({ success: true, call: found || null });
});
router13.post("/start", (req, res) => {
  const { callerId, callerName, callerRole, receiverId, receiverName, receiverRole, type } = req.body;
  activeCalls = activeCalls.filter(
    (c) => c.callerId !== callerId && c.receiverId !== receiverId && c.callerId !== receiverId && c.receiverId !== callerId
  );
  const newCall = {
    id: `call_${Date.now()}`,
    callerId,
    callerName,
    callerRole: callerRole || "patient",
    receiverId,
    receiverName,
    receiverRole: receiverRole || "doctor",
    type: type || "audio",
    status: "ringing",
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  activeCalls.push(newCall);
  return res.status(201).json({ success: true, call: newCall });
});
router13.post("/accept", (req, res) => {
  const { callId } = req.body;
  const call = activeCalls.find((c) => c.id === callId);
  if (call) {
    call.status = "connected";
    call.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    return res.json({ success: true, call });
  }
  return res.status(404).json({ success: false, message: "Call session not found" });
});
router13.post("/decline", (req, res) => {
  const { callId } = req.body;
  const call = activeCalls.find((c) => c.id === callId);
  if (call) {
    call.status = "declined";
    call.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    activeCalls = activeCalls.filter((c) => c.id !== callId);
    return res.json({ success: true, call });
  }
  return res.json({ success: true, call: null });
});
router13.post("/end", (req, res) => {
  const { callId } = req.body;
  const call = activeCalls.find((c) => c.id === callId);
  if (call) {
    call.status = "ended";
    call.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    activeCalls = activeCalls.filter((c) => c.id !== callId);
    return res.json({ success: true, call });
  }
  return res.json({ success: true, call: null });
});
var callSignals = {};
router13.post("/signal", (req, res) => {
  const { callId, userId, signal } = req.body;
  if (!callId || !userId || !signal) {
    return res.status(400).json({ success: false, message: "Missing parameters" });
  }
  if (!callSignals[callId]) {
    callSignals[callId] = {};
  }
  if (!callSignals[callId][userId]) {
    callSignals[callId][userId] = [];
  }
  callSignals[callId][userId].push(signal);
  return res.json({ success: true });
});
router13.get("/signals", (req, res) => {
  const { callId, userId } = req.query;
  if (!callId || !userId) {
    return res.json({ success: true, signals: [] });
  }
  const cId = String(callId);
  const uId = String(userId);
  if (!callSignals[cId]) {
    return res.json({ success: true, signals: [] });
  }
  const otherUserIds = Object.keys(callSignals[cId]).filter((id) => id !== uId);
  let accumulatedSignals = [];
  for (const otherId of otherUserIds) {
    const sigs = callSignals[cId][otherId] || [];
    accumulatedSignals = accumulatedSignals.concat(sigs);
  }
  return res.json({ success: true, signals: accumulatedSignals });
});
var callRoutes_default = router13;

// server/routes/slipRoutes.ts
var import_express14 = require("express");
var import_mongoose13 = __toESM(require("mongoose"));
var router14 = (0, import_express14.Router)();
var inMemorySlips = [
  {
    id: "slip-1001",
    slipNo: "SLIP-1001",
    patientName: "\u0645\u062D\u0645\u062F \u0637\u0627\u0631\u0642 (Tariq)",
    patientPhone: "03001234567",
    mrnNumber: "MRN-4589",
    doctorName: "\u0688\u0627\u06A9\u0679\u0631 \u0632\u06CC\u0634\u0627\u0646 \u0686\u0648\u06C1\u062F\u0631\u06CC (MBBS)",
    date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
    items: [
      { id: "item-1", description: "\u0688\u0627\u06A9\u0679\u0631 \u0645\u0639\u0627\u0626\u0646\u06C1 \u0648 \u0686\u06CC\u06A9 \u0627\u067E \u0641\u06CC\u0633 (OPD Checkup)", category: "Checkup Fee", quantity: 1, unitPrice: 1500, totalPrice: 1500 },
      { id: "item-2", description: "\u0647\u0648\u0631\u0627\u0628 \u06C1\u06CC\u0626\u0631 \u0622\u0626\u0644 (Hoorab Hair Oil 200ml)", category: "Medicine", quantity: 2, unitPrice: 1650, totalPrice: 3300 },
      { id: "item-3", description: "\u06A9\u0645\u067E\u06CC\u0648\u0679\u0631\u0627\u0626\u0632\u0688 \u0628\u0627\u0626\u06CC\u0648 \u06A9\u0648\u0627\u0646\u0679\u0645 \u0628\u0627\u0688\u06CC \u0627\u0633\u06A9\u06CC\u0646", category: "Lab Test / Scan", quantity: 1, unitPrice: 1500, totalPrice: 1500 }
    ],
    subtotal: 6300,
    discount: 300,
    totalAmount: 6e3,
    paidAmount: 6e3,
    balanceAmount: 0,
    paymentStatus: "Paid",
    paymentMethod: "Cash",
    notes: "\u0645\u06A9\u0645\u0644 \u0627\u062F\u0627\u0626\u06CC\u06AF\u06CC \u0646\u0642\u062F \u0648\u0635\u0648\u0644 \u06A9\u0631 \u0644\u06CC \u06AF\u0626\u06CC\u06D4",
    appointmentId: "APP-001",
    isAutoGenerated: true,
    source: "Appointment",
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    id: "slip-1002",
    slipNo: "SLIP-1002",
    patientName: "\u06A9\u0627\u0645\u0631\u0627\u0646 \u0639\u0644\u06CC (Kamran Ali)",
    patientPhone: "03219876543",
    mrnNumber: "MRN-6520",
    doctorName: "\u0688\u0627\u06A9\u0679\u0631 \u0648\u0642\u0627\u0635 \u0635\u063A\u06CC\u0631 \u0686\u0648\u06C1\u062F\u0631\u06CC (MBBS)",
    date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
    items: [
      { id: "item-1", description: "\u0641\u0632\u06CC\u0648 \u062A\u06BE\u0631\u0627\u067E\u06CC \u06A9\u0646\u0633\u0644\u0679\u06CC\u0634\u0646 \u0641\u06CC\u0633", category: "Checkup Fee", quantity: 1, unitPrice: 2e3, totalPrice: 2e3 },
      { id: "item-2", description: "\u0645\u06C1\u0631\u06D2 \u0633\u06CC\u062F\u06BE\u0627 \u06A9\u0631\u0646\u06D2 \u06A9\u0627 \u0633\u06CC\u0634\u0646 (Spine Decompression)", category: "Physiotherapy", quantity: 2, unitPrice: 2500, totalPrice: 5e3 },
      { id: "item-3", description: "\u062F\u0631\u062F \u06A9\u0634\u0627 \u0645\u0631\u06C1\u0645 \u0627\u0648\u0631 \u0646\u0631\u0648 \u0679\u0627\u0646\u06A9", category: "Medicine", quantity: 1, unitPrice: 2500, totalPrice: 2500 }
    ],
    subtotal: 9500,
    discount: 1e3,
    totalAmount: 8500,
    paidAmount: 5e3,
    balanceAmount: 3500,
    paymentStatus: "Partial",
    paymentMethod: "EasyPaisa",
    notes: "\u0628\u0642\u0627\u06CC\u0627 \u062C\u0627\u062A 3,500 \u0631\u0648\u067E\u06D2 \u0627\u06AF\u0644\u06D2 \u0633\u06CC\u0634\u0646 \u067E\u0631 \u0648\u0627\u062C\u0628 \u0627\u0644\u0627\u062F\u0627 \u06C1\u06CC\u06BA\u06D4",
    appointmentId: "APP-002",
    isAutoGenerated: true,
    source: "Appointment",
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    id: "slip-1003",
    slipNo: "SLIP-1003",
    patientName: "\u0632\u06CC\u0646\u0628 \u0628\u06CC \u0628\u06CC (Zainab Bibi)",
    patientPhone: "03221122334",
    mrnNumber: "MRN-99110",
    doctorName: "\u0688\u0627\u06A9\u0679\u0631 \u0632\u06CC\u0634\u0627\u0646 \u0686\u0648\u06C1\u062F\u0631\u06CC",
    date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
    items: [
      { id: "item-1", description: "\u06A9\u0645\u067E\u06CC\u0648\u0679\u0631\u0627\u0626\u0632\u0688 \u0646\u0638\u0631 \u06A9\u0627 \u0686\u0634\u0645\u06C1 \u0648 \u0641\u0631\u06CC\u0645 (Anti-Glare Optical Lens)", category: "Eye Care / Glasses", quantity: 1, unitPrice: 3500, totalPrice: 3500 },
      { id: "item-2", description: "\u06A9\u0648\u0644\u0646\u06AF \u06C1\u0631\u0628\u0644 \u0622\u0626\u06CC \u0688\u0631\u0627\u067E\u0633", category: "Eye Care / Glasses", quantity: 1, unitPrice: 650, totalPrice: 650 }
    ],
    subtotal: 4150,
    discount: 150,
    totalAmount: 4e3,
    paidAmount: 4e3,
    balanceAmount: 0,
    paymentStatus: "Paid",
    paymentMethod: "Cash",
    notes: "\u0646\u0638\u0631 \u06A9\u0627 \u0641\u0631\u06CC\u0645 \u0627\u0648\u0631 \u0644\u06CC\u0646\u0633 \u0688\u06CC\u0644\u06CC\u0648\u0631 \u06A9\u0631 \u062F\u06CC\u0627 \u06AF\u06CC\u0627\u06D4",
    isAutoGenerated: false,
    source: "Doctor OPD",
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  }
];
var slipSeqCount = 1003;
function generateSequentialSlipNumber() {
  slipSeqCount += 1;
  return `SLIP-${slipSeqCount}`;
}
async function deductMedicineStock(items) {
  if (!items || !Array.isArray(items) || !getMongoConnectedStatus()) return;
  for (const it of items) {
    if (it.category === "Medicine" && it.description) {
      const qty = Number(it.quantity || 1);
      const cleanDesc = it.description.split("(")[0].trim();
      await Product.findOneAndUpdate(
        {
          $or: [
            { nameUrdu: new RegExp(cleanDesc, "i") },
            { nameEnglish: new RegExp(cleanDesc, "i") }
          ]
        },
        { $inc: { stock: -qty } }
      ).catch(() => {
      });
    }
  }
}
router14.get("/analytics", async (req, res) => {
  try {
    let slips = inMemorySlips;
    if (getMongoConnectedStatus()) {
      slips = await MoneySlip.find().sort({ createdAt: -1 });
    }
    const todayStr = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    const thisMonthStr = todayStr.slice(0, 7);
    let totalRevenue = 0;
    let totalPaid = 0;
    let totalBalance = 0;
    let totalDiscount = 0;
    let todayRevenue = 0;
    let todayPaid = 0;
    let monthRevenue = 0;
    let monthPaid = 0;
    const paymentMethodsBreakdown = {
      Cash: 0,
      EasyPaisa: 0,
      JazzCash: 0,
      Card: 0,
      "Bank Transfer": 0
    };
    const categoryBreakdown = {
      "Checkup Fee": 0,
      Medicine: 0,
      "Lab Test / Scan": 0,
      Physiotherapy: 0,
      "Eye Care / Glasses": 0,
      Other: 0
    };
    slips.forEach((s) => {
      const total = Number(s.totalAmount || 0);
      const paid = Number(s.paidAmount || 0);
      const balance = Number(s.balanceAmount || 0);
      const discount = Number(s.discount || 0);
      const date = s.date || "";
      totalRevenue += total;
      totalPaid += paid;
      totalBalance += balance;
      totalDiscount += discount;
      if (date === todayStr) {
        todayRevenue += total;
        todayPaid += paid;
      }
      if (date.startsWith(thisMonthStr)) {
        monthRevenue += total;
        monthPaid += paid;
      }
      const method = s.paymentMethod || "Cash";
      paymentMethodsBreakdown[method] = (paymentMethodsBreakdown[method] || 0) + paid;
      (s.items || []).forEach((it) => {
        const cat = it.category || "Other";
        const itemTotal = Number(it.totalPrice || (it.unitPrice || 0) * (it.quantity || 1));
        categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + itemTotal;
      });
    });
    return res.json({
      success: true,
      analytics: {
        totalSlipsCount: slips.length,
        totalRevenue,
        totalPaid,
        totalBalance,
        totalDiscount,
        todayRevenue,
        todayPaid,
        monthRevenue,
        monthPaid,
        paymentMethodsBreakdown,
        categoryBreakdown,
        collectionRatePercentage: totalRevenue > 0 ? Math.round(totalPaid / totalRevenue * 100) : 100
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});
router14.get("/", async (req, res) => {
  try {
    const { phone, mrn, patientId, doctorName, appointmentId, tokenNumber, q } = req.query;
    if (getMongoConnectedStatus()) {
      const filter = {};
      if (phone) filter.patientPhone = new RegExp(String(phone), "i");
      if (mrn) filter.mrnNumber = new RegExp(String(mrn), "i");
      if (doctorName) filter.doctorName = new RegExp(String(doctorName), "i");
      if (appointmentId) filter.appointmentId = String(appointmentId);
      if (tokenNumber) {
        filter.$or = [
          { tokenNumber: String(tokenNumber) },
          { tokenNumber: Number(tokenNumber) },
          { slipNo: new RegExp(String(tokenNumber), "i") }
        ];
      }
      if (q) {
        const queryRegex = new RegExp(String(q), "i");
        filter.$or = [
          { patientName: queryRegex },
          { patientPhone: queryRegex },
          { mrnNumber: queryRegex },
          { slipNo: queryRegex },
          { tokenNumber: queryRegex }
        ];
      }
      const dbSlips = await MoneySlip.find(filter).sort({ createdAt: -1 });
      if (dbSlips.length > 0) {
        return res.json({ success: true, slips: dbSlips });
      }
    }
    let filtered = [...inMemorySlips];
    if (phone) {
      filtered = filtered.filter((s) => s.patientPhone && s.patientPhone.includes(String(phone)));
    }
    if (mrn) {
      filtered = filtered.filter((s) => s.mrnNumber && s.mrnNumber.toLowerCase().includes(String(mrn).toLowerCase()));
    }
    if (doctorName) {
      filtered = filtered.filter((s) => s.doctorName && s.doctorName.toLowerCase().includes(String(doctorName).toLowerCase()));
    }
    if (appointmentId) {
      filtered = filtered.filter((s) => s.appointmentId === String(appointmentId));
    }
    if (tokenNumber) {
      filtered = filtered.filter(
        (s) => String(s.tokenNumber || "") === String(tokenNumber) || String(s.slipNo || "").toLowerCase().includes(String(tokenNumber).toLowerCase())
      );
    }
    if (q) {
      const term = String(q).toLowerCase();
      filtered = filtered.filter(
        (s) => (s.patientName || "").toLowerCase().includes(term) || (s.patientPhone || "").includes(term) || (s.mrnNumber || "").toLowerCase().includes(term) || (s.slipNo || "").toLowerCase().includes(term) || String(s.tokenNumber || "").toLowerCase().includes(term)
      );
    }
    return res.json({ success: true, slips: filtered });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message, slips: inMemorySlips });
  }
});
router14.post("/", async (req, res) => {
  try {
    let slipNo = req.body.slipNo;
    if (!slipNo || !slipNo.startsWith("SLIP-")) {
      slipNo = generateSequentialSlipNumber();
    }
    const items = req.body.items || [];
    const subtotal = items.reduce((sum, it) => sum + Number(it.quantity || 1) * Number(it.unitPrice || 0), 0);
    const discount = Number(req.body.discount) || 0;
    const totalAmount = Math.max(0, subtotal - discount);
    const paidAmount = Number(req.body.paidAmount) || 0;
    const balanceAmount = Math.max(0, totalAmount - paidAmount);
    let paymentStatus = "Unpaid";
    if (paidAmount >= totalAmount && totalAmount > 0) {
      paymentStatus = "Paid";
    } else if (paidAmount > 0) {
      paymentStatus = "Partial";
    }
    const newSlip = {
      ...req.body,
      id: req.body.id || `slip-${Date.now()}`,
      slipNo,
      items,
      subtotal,
      discount,
      totalAmount,
      paidAmount,
      balanceAmount,
      paymentStatus: req.body.paymentStatus || paymentStatus,
      paymentMethod: req.body.paymentMethod || "Cash",
      date: req.body.date || (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      createdAt: req.body.createdAt || (/* @__PURE__ */ new Date()).toISOString()
    };
    inMemorySlips.unshift(newSlip);
    if (getMongoConnectedStatus()) {
      await MoneySlip.create(newSlip).catch(() => {
      });
      await deductMedicineStock(items);
    }
    return res.status(201).json({ success: true, slip: newSlip });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});
router14.post("/auto-appointment", async (req, res) => {
  try {
    const { appointmentId, patientName, patientPhone, doctorName, checkupFee, city, problem, tokenNumber } = req.body;
    if (!patientName) {
      return res.status(400).json({ success: false, message: "Patient name is required" });
    }
    const existingIndex = inMemorySlips.findIndex((s) => s.appointmentId === appointmentId);
    const fee = Number(checkupFee) > 0 ? Number(checkupFee) : 1500;
    if (existingIndex !== -1) {
      if (tokenNumber && !inMemorySlips[existingIndex].tokenNumber) {
        inMemorySlips[existingIndex].tokenNumber = tokenNumber;
      }
      return res.json({ success: true, slip: inMemorySlips[existingIndex], alreadyExists: true });
    }
    const slipNo = generateSequentialSlipNumber();
    const cleanPhone = (patientPhone || "").replace(/\D/g, "");
    const mrnNumber = `MRN-${cleanPhone.slice(-4) || "1001"}`;
    const tokenDisplay = tokenNumber ? ` (\u0679\u0648\u06A9\u0646 #${tokenNumber})` : "";
    const items = [
      {
        id: `it-${Date.now()}-1`,
        description: `\u0688\u0627\u06A9\u0679\u0631 \u0645\u0639\u0627\u0626\u0646\u06C1 \u0648 \u0686\u06CC\u06A9 \u0627\u067E \u0641\u06CC\u0633 (${doctorName || "Senior Consultant"})${tokenDisplay}`,
        category: "Checkup Fee",
        quantity: 1,
        unitPrice: fee,
        totalPrice: fee,
        department: "OPD / Doctor Checkup",
        servedBy: doctorName || "Senior Doctor"
      }
    ];
    const newSlip = {
      id: `slip-${Date.now()}`,
      slipNo,
      tokenNumber: tokenNumber || (appointmentId ? `TK-${appointmentId.replace("APP-", "")}` : "TK-101"),
      patientName,
      patientPhone: patientPhone || "",
      mrnNumber,
      doctorName: doctorName || "\u0688\u0627\u06A9\u0679\u0631 \u0632\u06CC\u0634\u0627\u0646 \u0686\u0648\u06C1\u062F\u0631\u06CC",
      date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      items,
      subtotal: fee,
      discount: 0,
      totalAmount: fee,
      paidAmount: 0,
      balanceAmount: fee,
      paymentStatus: "Unpaid",
      paymentMethod: "Cash",
      notes: `\u062E\u0648\u062F\u06A9\u0627\u0631 \u0627\u067E\u0627\u0626\u0646\u0679\u0645\u0646\u0679 \u0628\u0644 \u0628\u0631\u0627\u0626\u06D2 ${problem || "\u0627\u0648 \u067E\u06CC \u0688\u06CC \u0645\u0639\u0627\u0626\u0646\u06C1"} ${tokenDisplay}`,
      appointmentId,
      isAutoGenerated: true,
      source: "Appointment",
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    inMemorySlips.unshift(newSlip);
    if (getMongoConnectedStatus()) {
      await MoneySlip.create(newSlip).catch(() => {
      });
    }
    return res.status(201).json({ success: true, slip: newSlip });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});
router14.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    let updatedSlip = null;
    const items = req.body.items;
    let computedFields = {};
    if (items && Array.isArray(items)) {
      const subtotal = items.reduce((sum, it) => sum + Number(it.quantity || 1) * Number(it.unitPrice || 0), 0);
      const discount = Number(req.body.discount !== void 0 ? req.body.discount : 0);
      const totalAmount = Math.max(0, subtotal - discount);
      const paidAmount = Number(req.body.paidAmount !== void 0 ? req.body.paidAmount : 0);
      const balanceAmount = Math.max(0, totalAmount - paidAmount);
      let paymentStatus = req.body.paymentStatus;
      if (!paymentStatus) {
        if (paidAmount >= totalAmount && totalAmount > 0) paymentStatus = "Paid";
        else if (paidAmount > 0) paymentStatus = "Partial";
        else paymentStatus = "Unpaid";
      }
      computedFields = { subtotal, discount, totalAmount, paidAmount, balanceAmount, paymentStatus };
    }
    const payload = { ...req.body, ...computedFields };
    if (getMongoConnectedStatus()) {
      const isObjId = import_mongoose13.default.Types.ObjectId.isValid(id);
      const query = isObjId ? { $or: [{ _id: id }, { id }, { slipNo: id }] } : { $or: [{ id }, { slipNo: id }] };
      updatedSlip = await MoneySlip.findOneAndUpdate(query, { $set: payload }, { returnDocument: "after" });
    }
    const index = inMemorySlips.findIndex((s) => s.id === id || s.slipNo === id || s._id && String(s._id) === id);
    if (index !== -1) {
      inMemorySlips[index] = { ...inMemorySlips[index], ...payload };
      if (!updatedSlip) updatedSlip = inMemorySlips[index];
    } else {
      inMemorySlips.unshift({ id, ...payload });
      if (!updatedSlip) updatedSlip = { id, ...payload };
    }
    return res.json({ success: true, slip: updatedSlip });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});
router14.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    inMemorySlips = inMemorySlips.filter((s) => s.id !== id && s.slipNo !== id && (!s._id || String(s._id) !== id));
    if (getMongoConnectedStatus()) {
      const isObjId = import_mongoose13.default.Types.ObjectId.isValid(id);
      const query = isObjId ? { $or: [{ _id: id }, { id }, { slipNo: id }] } : { $or: [{ id }, { slipNo: id }] };
      await MoneySlip.findOneAndDelete(query).catch(() => {
      });
    }
    return res.json({ success: true, message: "Money slip deleted successfully" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});
var slipRoutes_default = router14;

// server/routes/erpRoutes.ts
var import_express15 = require("express");

// src/data/labCatalogData.ts
var PREDEFINED_LAB_TESTS = [
  // 1. Radiology / X-Ray Department Tests (Assigned to Radiologist: Dr. Tariq Mehmood)
  {
    id: "xray-chest-01",
    category: "Radiology / X-Ray",
    department: "Digital Radiology & X-Ray",
    assignedDoctorName: "Dr. Tariq Mehmood (Radiologist)",
    assignedDoctorRole: "lab_doctor",
    name: "Chest X-Ray PA View (Digital Radiograph)",
    nameUrdu: "\u0627\u06CC\u06A9\u0633\u0631\u06D2 \u0633\u06CC\u0646\u06C1 \u0648 \u067E\u06BE\u06CC\u067E\u06BE\u0691\u06D2 (Chest PA View)",
    pricePKR: 1200,
    sampleType: "Digital X-Ray Sensor / Radiography",
    instructionsUrdu: "\u062F\u06BE\u0627\u062A\u06CC \u0627\u0634\u06CC\u0627\u0621 \u0627\u0648\u0631 \u0628\u0679\u0646 \u06C1\u0679\u0627 \u06A9\u0631 \u0633\u0627\u0646\u0633 \u0631\u0648\u06A9 \u06A9\u0631 \u0627\u06CC\u06A9\u0633\u0631\u06D2 \u06A9\u06CC\u0627 \u062C\u0627\u0626\u06D2 \u06AF\u0627\u06D4",
    parameters: [
      { name: "Lung Fields & Parenchyma", unit: "Observation", normalRange: "Clear lung fields bilaterally, no active infiltration or mass" },
      { name: "Cardio-Thoracic Ratio (CTR)", unit: "Ratio", normalRange: "< 0.50 (Normal heart size)", minNormal: 0.35, maxNormal: 0.5 },
      { name: "Costophrenic & Cardiophrenic Angles", unit: "Observation", normalRange: "Sharp and clear bilaterally, no pleural effusion" },
      { name: "Bony Thorax & Ribs", unit: "Observation", normalRange: "Intact rib cage, no fracture, normal mineralization" },
      { name: "Trachea & Mediastinum", unit: "Observation", normalRange: "Central trachea, normal mediastinal contours" }
    ]
  },
  {
    id: "xray-spine-02",
    category: "Radiology / X-Ray",
    department: "Digital Radiology & X-Ray",
    assignedDoctorName: "Dr. Tariq Mehmood (Radiologist)",
    assignedDoctorRole: "lab_doctor",
    name: "Lumbo-Sacral Spine X-Ray AP & Lateral Views (L-S Spine)",
    nameUrdu: "\u0627\u06CC\u06A9\u0633\u0631\u06D2 \u06A9\u0645\u0631 \u0648 \u0645\u06C1\u0631\u06D2 (L-S Spine AP/Lat)",
    pricePKR: 1800,
    sampleType: "Digital Radiograph",
    instructionsUrdu: "\u06A9\u06BE\u0691\u06D2 \u06C1\u0648 \u06A9\u0631 \u0633\u0627\u0645\u0646\u06D2 \u0627\u0648\u0631 \u0633\u0627\u0626\u06CC\u0688 \u0633\u06D2 2 \u062A\u0635\u0627\u0648\u06CC\u0631 \u0644\u06CC \u062C\u0627\u0626\u06CC\u06BA \u06AF\u06CC\u06D4",
    parameters: [
      { name: "Lumbar Lordosis Alignment", unit: "Angle", normalRange: "Normal lumbar curvature preserved" },
      { name: "Intervertebral Disc Spaces (L1-L5, L5-S1)", unit: "Observation", normalRange: "Adequate disc heights, no disc space narrowing" },
      { name: "Vertebral Body Heights & Endplates", unit: "Observation", normalRange: "Intact vertebral bodies, no wedge collapse, no osteophytes" },
      { name: "Facet Joints & Neural Foramina", unit: "Observation", normalRange: "Normal articular alignment, no spondylolisthesis" },
      { name: "Sacroiliac (SI) Joints", unit: "Observation", normalRange: "Symmetrical, clear joint margins" }
    ]
  },
  {
    id: "xray-knee-03",
    category: "Radiology / X-Ray",
    department: "Digital Radiology & X-Ray",
    assignedDoctorName: "Dr. Tariq Mehmood (Radiologist)",
    assignedDoctorRole: "lab_doctor",
    name: "Both Knees X-Ray Standing (AP & Lateral)",
    nameUrdu: "\u0627\u06CC\u06A9\u0633\u0631\u06D2 \u062F\u0648\u0646\u0648\u06BA \u06AF\u06BE\u0679\u0646\u06D2 (Both Knees AP/Lat)",
    pricePKR: 1500,
    sampleType: "Digital Radiograph",
    instructionsUrdu: "\u0648\u0632\u0646 \u0688\u0627\u0644 \u06A9\u0631 \u06A9\u06BE\u0691\u06D2 \u06C1\u0648 \u06A9\u0631 \u06AF\u06BE\u0679\u0646\u0648\u06BA \u06A9\u06CC \u067E\u0648\u0632\u06CC\u0634\u0646 \u0686\u06CC\u06A9 \u06A9\u06CC \u062C\u0627\u0626\u06D2 \u06AF\u06CC\u06D4",
    parameters: [
      { name: "Medial & Lateral Joint Space Width", unit: "Observation", normalRange: "Normal joint space, no medial compartment narrowing" },
      { name: "Patello-Femoral Alignment", unit: "Observation", normalRange: "Central patellar tracking, no subchondral sclerosis" },
      { name: "Osteophyte Formation", unit: "Observation", normalRange: "Nil / Grade 0 (No degenerative osteophytes)" },
      { name: "Soft Tissue Swelling / Joint Effusion", unit: "Observation", normalRange: "Absent, suprapatellar pouch normal" }
    ]
  },
  // 2. Hematology & Pathology Tests (Assigned to Pathologist: Dr. Saima Rehman)
  {
    id: "cbc-01",
    category: "Hematology / CBC",
    department: "Pathology & Blood Diagnostics",
    assignedDoctorName: "Dr. Saima Rehman (Pathologist)",
    assignedDoctorRole: "lab_doctor",
    name: "Complete Blood Count (CBC & ESR)",
    nameUrdu: "\u0645\u06A9\u0645\u0644 \u062E\u0648\u0646 \u06A9\u0627 \u0679\u06CC\u0633\u0679 (CBC & ESR)",
    pricePKR: 850,
    sampleType: "Whole Blood (EDTA)",
    instructionsUrdu: "3ml \u0648\u06CC\u0646\u0633 \u062E\u0648\u0646 \u06A9\u0627 \u0646\u0645\u0648\u0646\u06C1 EDTA \u0648\u0627\u0626\u0644 \u0645\u06CC\u06BA \u0644\u06CC\u0627 \u062C\u0627\u0626\u06D2 \u06AF\u0627\u06D4",
    parameters: [
      { name: "Hemoglobin (Hb)", unit: "g/dL", normalRange: "13.0 - 17.0 (M) / 12.0 - 15.0 (F)", minNormal: 12, maxNormal: 17 },
      { name: "Total Leukocyte Count (TLC / WBC)", unit: "/cumm", normalRange: "4,000 - 11,000", minNormal: 4e3, maxNormal: 11e3 },
      { name: "Platelet Count", unit: "/cumm", normalRange: "150,000 - 450,000", minNormal: 15e4, maxNormal: 45e4 },
      { name: "Neutrophils", unit: "%", normalRange: "40 - 75", minNormal: 40, maxNormal: 75 },
      { name: "Lymphocytes", unit: "%", normalRange: "20 - 45", minNormal: 20, maxNormal: 45 },
      { name: "ESR (Erythrocyte Sedimentation Rate)", unit: "mm/1st hr", normalRange: "0 - 15 (M) / 0 - 20 (F)", minNormal: 0, maxNormal: 20 }
    ]
  },
  {
    id: "bsf-02",
    category: "Biochemistry & Diabetes",
    department: "Pathology & Blood Diagnostics",
    assignedDoctorName: "Dr. Saima Rehman (Pathologist)",
    assignedDoctorRole: "lab_doctor",
    name: "Blood Sugar Fasting (BSF)",
    nameUrdu: "\u062E\u0648\u0646 \u06A9\u06CC \u0634\u0648\u06AF\u0631 (\u0646\u06C1\u0627\u0631 \u0645\u0646\u06C1 - Fasting Glucose)",
    pricePKR: 300,
    sampleType: "Fluoride Plasma",
    instructionsUrdu: "\u06A9\u0645 \u0627\u0632 \u06A9\u0645 8 \u0633\u06D2 10 \u06AF\u06BE\u0646\u0679\u06D2 \u0646\u06C1\u0627\u0631 \u0645\u0646\u06C1 \u0646\u0645\u0648\u0646\u06C1 \u062F\u06CC\u06BA\u06D4",
    parameters: [
      { name: "Glucose (Fasting)", unit: "mg/dL", normalRange: "70 - 100 (Normal) / 100-125 (Pre-diabetic)", minNormal: 70, maxNormal: 100 }
    ]
  },
  {
    id: "hba1c-04",
    category: "Biochemistry & Diabetes",
    department: "Pathology & Blood Diagnostics",
    assignedDoctorName: "Dr. Saima Rehman (Pathologist)",
    assignedDoctorRole: "lab_doctor",
    name: "HbA1c (Glycated Hemoglobin - 3 Months Control)",
    nameUrdu: "\u0634\u0648\u06AF\u0631 \u06F3 \u0645\u0627\u06C1 \u06A9\u0627 \u0627\u0648\u0633\u0637 \u06A9\u0646\u0679\u0631\u0648\u0644 \u0679\u06CC\u0633\u0679 (HbA1c)",
    pricePKR: 1600,
    sampleType: "Whole Blood (EDTA)",
    instructionsUrdu: "\u06A9\u0633\u06CC \u0628\u06BE\u06CC \u0648\u0642\u062A \u062E\u0648\u0646 \u062F\u06CC\u0627 \u062C\u0627 \u0633\u06A9\u062A\u0627 \u06C1\u06D2\u060C \u0646\u06C1\u0627\u0631 \u0645\u0646\u06C1 \u06C1\u0648\u0646\u0627 \u0636\u0631\u0648\u0631\u06CC \u0646\u06C1\u06CC\u06BA\u06D4",
    parameters: [
      { name: "HbA1c Level", unit: "%", normalRange: "< 5.7 (Normal) / 5.7 - 6.4 (Pre-diabetes) / >= 6.5 (Diabetes)", minNormal: 4, maxNormal: 5.7 },
      { name: "Estimated Average Glucose (eAG)", unit: "mg/dL", normalRange: "90 - 120 (Normal)", minNormal: 80, maxNormal: 125 }
    ]
  },
  {
    id: "lft-07",
    category: "Liver LFT",
    department: "Pathology & Blood Diagnostics",
    assignedDoctorName: "Dr. Saima Rehman (Pathologist)",
    assignedDoctorRole: "lab_doctor",
    name: "Liver Function Tests (LFT Profile)",
    nameUrdu: "\u062C\u06AF\u0631 \u06A9\u06D2 \u0627\u0641\u0639\u0627\u0644 \u06A9\u0627 \u0679\u06CC\u0633\u0679 (LFTs - \u06CC\u0631\u0642\u0627\u0646\u060C \u0627\u06CC\u0646\u0632\u0627\u0626\u0645\u0632)",
    pricePKR: 1300,
    sampleType: "Serum",
    instructionsUrdu: "\u0635\u0627\u0641 \u0633\u06CC\u0631\u0645 \u06A9\u0627 \u0646\u0645\u0648\u0646\u06C1\u060C \u062A\u0644\u06CC \u06C1\u0648\u0626\u06CC \u063A\u0630\u0627 \u06A9\u06D2 \u0628\u0639\u062F \u0641\u0648\u0631\u06CC \u0646\u06C1 \u0644\u06CC\u06BA\u06D4",
    parameters: [
      { name: "Total Bilirubin", unit: "mg/dL", normalRange: "0.2 - 1.2", minNormal: 0.2, maxNormal: 1.2 },
      { name: "Direct (Conjugated) Bilirubin", unit: "mg/dL", normalRange: "0.0 - 0.3", minNormal: 0, maxNormal: 0.3 },
      { name: "SGPT / ALT (Alanine Aminotransferase)", unit: "U/L", normalRange: "Up to 45", minNormal: 5, maxNormal: 45 },
      { name: "SGOT / AST (Aspartate Aminotransferase)", unit: "U/L", normalRange: "Up to 35", minNormal: 5, maxNormal: 35 },
      { name: "Alkaline Phosphatase (ALP)", unit: "U/L", normalRange: "44 - 147", minNormal: 44, maxNormal: 147 },
      { name: "Serum Albumin", unit: "g/dL", normalRange: "3.5 - 5.0", minNormal: 3.5, maxNormal: 5 }
    ]
  },
  {
    id: "rft-06",
    category: "Renal / Kidney RFT",
    department: "Pathology & Blood Diagnostics",
    assignedDoctorName: "Dr. Saima Rehman (Pathologist)",
    assignedDoctorRole: "lab_doctor",
    name: "Renal / Kidney Function Tests (RFT / KFT)",
    nameUrdu: "\u06AF\u0631\u062F\u0648\u06BA \u06A9\u06D2 \u0627\u0641\u0639\u0627\u0644 \u06A9\u0627 \u0679\u06CC\u0633\u0679 (\u06CC\u0648\u0631\u06CC\u0627\u060C \u06A9\u0631\u06CC\u0679\u06CC\u0646\u06CC\u0646\u060C \u06CC\u0648\u0631\u06A9 \u0627\u06CC\u0633\u0688)",
    pricePKR: 950,
    sampleType: "Serum",
    instructionsUrdu: "\u06AF\u0631\u062F\u0648\u06BA \u06A9\u06CC \u0641\u0644\u0679\u0631\u06CC\u0634\u0646 \u0627\u0648\u0631 \u06A9\u0631\u06CC\u0679\u06CC\u0646\u06CC\u0646 \u0644\u06CC\u0648\u0644 \u06A9\u06CC \u062C\u0627\u0646\u0686\u06D4",
    parameters: [
      { name: "Serum Creatinine", unit: "mg/dL", normalRange: "0.6 - 1.2", minNormal: 0.6, maxNormal: 1.2 },
      { name: "Blood Urea", unit: "mg/dL", normalRange: "15 - 45", minNormal: 15, maxNormal: 45 },
      { name: "Serum Uric Acid", unit: "mg/dL", normalRange: "3.5 - 7.2 (M) / 2.6 - 6.0 (F)", minNormal: 2.6, maxNormal: 7.2 },
      { name: "Estimated GFR (eGFR)", unit: "mL/min/1.73m\xB2", normalRange: "> 90 Normal Kidney Function", minNormal: 90, maxNormal: 130 }
    ]
  },
  {
    id: "lipid-05",
    category: "Lipid Profile",
    department: "Pathology & Blood Diagnostics",
    assignedDoctorName: "Dr. Saima Rehman (Pathologist)",
    assignedDoctorRole: "lab_doctor",
    name: "Lipid Profile (Cholesterol & Triglycerides)",
    nameUrdu: "\u06A9\u0648\u0644\u06CC\u0633\u0679\u0631\u0648\u0644 \u0648 \u0686\u06A9\u0646\u0627\u0626\u06CC \u06A9\u0627 \u0645\u06A9\u0645\u0644 \u067E\u0631\u0648\u0641\u0627\u0626\u0644 (Lipid Profile)",
    pricePKR: 1450,
    sampleType: "Serum (12hr Fasting)",
    instructionsUrdu: "\u06A9\u0645 \u0627\u0632 \u06A9\u0645 12 \u06AF\u06BE\u0646\u0679\u06D2 \u06A9\u0627 \u0641\u0627\u0642\u06C1 (\u0635\u0631\u0641 \u067E\u0627\u0646\u06CC \u06A9\u06CC \u0627\u062C\u0627\u0632\u062A \u06C1\u06D2)\u06D4",
    parameters: [
      { name: "Total Cholesterol", unit: "mg/dL", normalRange: "< 200 Desirable", minNormal: 100, maxNormal: 200 },
      { name: "Triglycerides (TGs)", unit: "mg/dL", normalRange: "< 150 Normal", minNormal: 50, maxNormal: 150 },
      { name: "HDL (Good Protective Cholesterol)", unit: "mg/dL", normalRange: "> 40 (M) / > 50 (F)", minNormal: 40, maxNormal: 80 },
      { name: "LDL (Bad Atherogenic Cholesterol)", unit: "mg/dL", normalRange: "< 100 Optimal", minNormal: 40, maxNormal: 100 }
    ]
  },
  {
    id: "urine-re-08",
    category: "Urine & Stool R/E",
    department: "Pathology & Blood Diagnostics",
    assignedDoctorName: "Dr. Saima Rehman (Pathologist)",
    assignedDoctorRole: "lab_doctor",
    name: "Urine Routine Examination (Urine R/E)",
    nameUrdu: "\u067E\u06CC\u0634\u0627\u0628 \u06A9\u0627 \u0645\u06A9\u0645\u0644 \u06A9\u06CC\u0645\u06CC\u0627\u0626\u06CC \u0648 \u0645\u0627\u0626\u06CC\u06A9\u0631\u0648\u0633\u06A9\u0648\u067E\u06A9 \u0645\u0639\u0627\u0626\u0646\u06C1 (Urine R/E)",
    pricePKR: 350,
    sampleType: "Clean Catch Midstream Urine",
    instructionsUrdu: "\u0635\u0628\u062D \u06A9\u0627 \u067E\u06C1\u0644\u0627 \u062F\u0631\u0645\u06CC\u0627\u0646\u06CC \u067E\u06CC\u0634\u0627\u0628 \u062C\u0631\u0627\u062B\u06CC\u0645 \u0633\u06D2 \u067E\u0627\u06A9 \u0688\u0628\u06CC \u0645\u06CC\u06BA \u062F\u06CC\u06BA\u06D4",
    parameters: [
      { name: "Color & Appearance", unit: "Physical", normalRange: "Pale Yellow / Clear" },
      { name: "Specific Gravity & pH", unit: "Index", normalRange: "pH 5.0 - 7.0 / SG 1.015 - 1.025" },
      { name: "Protein / Albumin", unit: "Chemical", normalRange: "Nil / Negative" },
      { name: "Urine Sugar (Glucose)", unit: "Chemical", normalRange: "Nil / Negative" },
      { name: "Pus Cells (WBCs)", unit: "/HPF", normalRange: "0 - 4 Normal", minNormal: 0, maxNormal: 4 },
      { name: "Red Blood Cells (RBCs)", unit: "/HPF", normalRange: "0 - 2 Normal", minNormal: 0, maxNormal: 2 },
      { name: "Epithelial Cells & Crystals", unit: "/HPF", normalRange: "Few / Nil Calcium Oxalate" }
    ]
  },
  // 3. Eye Diagnostics Department Tests (Assigned to Optometrist: Dr. Asim Farooq)
  {
    id: "eye-scan-01",
    category: "Computerized Eye Scan",
    department: "Eye & Vision Diagnostic Lab",
    assignedDoctorName: "Dr. Asim Farooq (Optometrist)",
    assignedDoctorRole: "lab_doctor",
    name: "Auto-Refractometer Computerized Eye & Refraction Scan",
    nameUrdu: "\u0622\u0646\u06A9\u06BE\u0648\u06BA \u06A9\u0627 \u06A9\u0645\u067E\u06CC\u0648\u0679\u0631\u0627\u0626\u0632\u0688 \u0645\u0639\u0627\u0626\u0646\u06C1 \u0648 \u0646\u0645\u0628\u0631 \u062C\u0627\u0646\u0686 (Auto-Refraction Scan)",
    pricePKR: 500,
    sampleType: "Computerized Optical Wavefront Scanner",
    instructionsUrdu: "\u0622\u0646\u06A9\u06BE\u06CC\u06BA \u0633\u06CC\u062F\u06BE\u06CC \u0679\u0627\u0631\u06AF\u0679 \u067E\u0631 \u0631\u06A9\u06BE\u06CC\u06BA \u0627\u0648\u0631 \u067E\u0644\u06A9\u06CC\u06BA \u0632\u06CC\u0627\u062F\u06C1 \u0646\u06C1 \u062C\u06BE\u067E\u06A9\u06CC\u06BA\u06D4",
    parameters: [
      { name: "Right Eye Sphere (OD SPH)", unit: "Diopter (D)", normalRange: "0.00 (Plano) / \xB1 0.50" },
      { name: "Right Eye Cylinder (OD CYL)", unit: "Diopter (D)", normalRange: "0.00 / \xB1 0.25" },
      { name: "Right Eye Axis (OD Axis)", unit: "Degree (\xB0)", normalRange: "1\xB0 - 180\xB0" },
      { name: "Left Eye Sphere (OS SPH)", unit: "Diopter (D)", normalRange: "0.00 (Plano) / \xB1 0.50" },
      { name: "Left Eye Cylinder (OS CYL)", unit: "Diopter (D)", normalRange: "0.00 / \xB1 0.25" },
      { name: "Left Eye Axis (OS Axis)", unit: "Degree (\xB0)", normalRange: "1\xB0 - 180\xB0" },
      { name: "Pupillary Distance (PD)", unit: "mm", normalRange: "58 - 66 mm" }
    ]
  },
  {
    id: "eye-glaucoma-02",
    category: "Computerized Eye Scan",
    department: "Eye & Vision Diagnostic Lab",
    assignedDoctorName: "Dr. Asim Farooq (Optometrist)",
    assignedDoctorRole: "lab_doctor",
    name: "Non-Contact Tonometry (IOP Intraocular Pressure Glaucoma Test)",
    nameUrdu: "\u06A9\u0627\u0644\u06D2 \u0645\u0648\u062A\u06CC\u06D2 \u0648 \u0622\u0646\u06A9\u06BE \u06A9\u06D2 \u062F\u0628\u0627\u0624 \u06A9\u0627 \u0679\u06CC\u0633\u0679 (IOP Tonometry)",
    pricePKR: 800,
    sampleType: "Air-Puff Tonometry Non-Contact",
    instructionsUrdu: "\u0622\u0646\u06A9\u06BE \u0645\u06CC\u06BA \u06C1\u0644\u06A9\u06CC \u06C1\u0648\u0627 \u06A9\u0627 \u062C\u06BE\u0648\u0646\u06A9\u0627 \u0644\u06AF\u06D2 \u06AF\u0627\u060C \u062F\u0631\u062F \u0628\u0627\u0644\u06A9\u0644 \u0646\u06C1\u06CC\u06BA \u06C1\u0648\u06AF\u0627\u06D4",
    parameters: [
      { name: "Right Eye Intraocular Pressure (OD IOP)", unit: "mmHg", normalRange: "10 - 21 mmHg (Normal)", minNormal: 10, maxNormal: 21 },
      { name: "Left Eye Intraocular Pressure (OS IOP)", unit: "mmHg", normalRange: "10 - 21 mmHg (Normal)", minNormal: 10, maxNormal: 21 },
      { name: "Optic Disc Cup-to-Disc Ratio (CDR)", unit: "Ratio", normalRange: "< 0.40 Normal Physiologic Cup" }
    ]
  },
  // 4. Ultrasound & Imaging (Assigned to Sonologist: Dr. Farhana Chaudhry)
  {
    id: "usg-abdomen-01",
    category: "Ultrasound & Imaging",
    department: "Ultrasound & Sonology",
    assignedDoctorName: "Dr. Farhana Chaudhry (Sonologist)",
    assignedDoctorRole: "lab_doctor",
    name: "Ultrasound Abdomen & Pelvis (Complete Sonogram)",
    nameUrdu: "\u0627\u0644\u0679\u0631\u0627\u0633\u0627\u0624\u0646\u0688 \u067E\u06CC\u0679\u060C \u0645\u062B\u0627\u0646\u06C1 \u0648 \u062C\u06AF\u0631 (Abdomen & Pelvis Scan)",
    pricePKR: 2e3,
    sampleType: "Convex 3.5MHz Diagnostic Ultrasound",
    instructionsUrdu: "\u067E\u0648\u0631\u0627 \u067E\u0627\u0646\u06CC \u067E\u06CC \u06A9\u0631 \u067E\u06CC\u0634\u0627\u0628 \u0631\u0648\u06A9 \u06A9\u0631 \u0622\u0626\u06CC\u06BA \u062A\u0627\u06A9\u06C1 \u0645\u062B\u0627\u0646\u06C1 \u0628\u06BE\u0631\u0627 \u06C1\u0648\u0627 \u06C1\u0648\u06D4",
    parameters: [
      { name: "Liver Size & Echotexture", unit: "Observation", normalRange: "Normal size (13-15cm), smooth margins, no fatty infiltration" },
      { name: "Gall Bladder & Biliary Tree", unit: "Observation", normalRange: "Well distended, thin wall (<3mm), no calculi/stones" },
      { name: "Right & Left Kidneys (Cortical Thickness)", unit: "Observation", normalRange: "Normal bipolar length (10-12cm), no hydronephrosis, no calculi" },
      { name: "Spleen & Pancreas", unit: "Observation", normalRange: "Normal size, no focal mass lesion" },
      { name: "Urinary Bladder & Prostate / Uterus", unit: "Observation", normalRange: "Smooth lumen, post-void residual urine insignificant" }
    ]
  }
];
var INITIAL_LAB_ORDERS = [
  // 1. X-Ray Order (Visible to Dr. Tariq Mehmood - Radiologist)
  {
    id: "LAB-ORD-XRAY-101",
    orderNumber: "XRAY-101",
    patientId: "PT-880",
    patientName: "\u0645\u0644\u06A9 \u0645\u062D\u0645\u062F \u0627\u0639\u0638\u0645",
    patientAge: 52,
    patientGender: "Male",
    patientPhone: "0300-8765432",
    referredByDoctor: "\u0688\u0627\u06A9\u0679\u0631 \u0632\u06CC\u0634\u0627\u0646 \u0686\u0648\u06C1\u062F\u0631\u06CC (MBBS)",
    testCategory: "Radiology / X-Ray",
    testName: "Lumbo-Sacral Spine X-Ray AP & Lateral Views (L-S Spine)",
    testDate: "2026-08-19",
    deliveryDate: "2026-08-19",
    pricePKR: 1800,
    paymentStatus: "Paid",
    status: "Report Ready",
    reportedByTechnician: "\u0645\u062D\u0645\u062F \u0631\u0627\u0634\u062F (Radiology Tech)",
    approvedByPathologist: "\u0688\u0627\u06A9\u0679\u0631 \u0637\u0627\u0631\u0642 \u0645\u062D\u0645\u0648\u062F (Consultant Radiologist)",
    clinicalInterpretationUrdu: "\u0645\u06C1\u0631\u0648\u06BA L4-L5 \u0645\u06CC\u06BA \u0645\u0639\u0645\u0648\u0644\u06CC \u0688\u0633\u06A9 \u0627\u0633\u067E\u06CC\u0633 \u06A9\u0645\u06CC \u0627\u0648\u0631 \u06C1\u0644\u06A9\u06CC \u0627\u0648\u0633\u0679\u06CC\u0648 \u0641\u0627\u0626\u06CC\u0679\u06A9 \u062A\u0628\u062F\u06CC\u0644\u06CC\u0627\u06BA \u06C1\u06CC\u06BA (Mild Lumbar Spondylosis)\u06D4 \u06A9\u0648\u0626\u06CC \u0641\u0631\u06CC\u06A9\u0686\u0631 \u06CC\u0627 \u0644\u0633\u0679\u06BE\u06CC\u0633\u0633 \u0646\u06C1\u06CC\u06BA \u06C1\u06D2\u06D4 \u0641\u0632\u06CC\u0648\u062A\u06BE\u0631\u0627\u067E\u06CC \u0627\u0648\u0631 \u0648\u0632\u0646 \u0627\u0679\u06BE\u0627\u0646\u06D2 \u0633\u06D2 \u067E\u0631\u06C1\u06CC\u0632 \u0645\u0641\u06CC\u062F \u06C1\u06D2\u06D4",
    parameters: [
      { name: "Lumbar Lordosis Alignment", unit: "Angle", normalRange: "Normal lumbar curvature preserved", value: "Straightening of lumbar lordosis due to muscle spasm", isAbnormal: true },
      { name: "Intervertebral Disc Spaces (L1-L5, L5-S1)", unit: "Observation", normalRange: "Adequate disc heights, no disc space narrowing", value: "Mild disc space narrowing at L4-L5 level", isAbnormal: true },
      { name: "Vertebral Body Heights & Endplates", unit: "Observation", normalRange: "Intact vertebral bodies, no wedge collapse", value: "Normal heights, minor anterior osteophytes", isAbnormal: false },
      { name: "Facet Joints & Neural Foramina", unit: "Observation", normalRange: "Normal articular alignment, no spondylolisthesis", value: "Normal alignment, no slip", isAbnormal: false },
      { name: "Sacroiliac (SI) Joints", unit: "Observation", normalRange: "Symmetrical, clear joint margins", value: "Bilateral SI joints appear unremarkable", isAbnormal: false }
    ]
  },
  // 2. Blood CBC Order (Visible to Dr. Saima Rehman - Pathologist)
  {
    id: "LAB-ORD-CBC-102",
    orderNumber: "LAB-102",
    patientId: "PT-901",
    patientName: "\u0645\u062D\u0645\u062F \u0639\u062B\u0645\u0627\u0646 \u0639\u0644\u06CC",
    patientAge: 42,
    patientGender: "Male",
    patientPhone: "0301-7654321",
    referredByDoctor: "\u0688\u0627\u06A9\u0679\u0631 \u0648\u0642\u0627\u0635 \u0635\u063A\u06CC\u0631 (MBBS)",
    testCategory: "Hematology / CBC",
    testName: "Complete Blood Count (CBC & ESR)",
    testDate: "2026-08-19",
    deliveryDate: "2026-08-19",
    pricePKR: 850,
    paymentStatus: "Paid",
    status: "Report Ready",
    reportedByTechnician: "\u0645\u062D\u0645\u062F \u0646\u062F\u06CC\u0645 (Lab Tech)",
    approvedByPathologist: "\u0688\u0627\u06A9\u0679\u0631 \u0635\u0627\u0626\u0645\u06C1 \u0631\u062D\u0645\u0627\u0646 (Pathologist)",
    clinicalInterpretationUrdu: "\u06C1\u06CC\u0645\u0648\u06AF\u0644\u0648\u0628\u0646 \u0642\u062F\u0631\u06D2 \u06A9\u0645 \u06C1\u06D2 (Mild Anemia Hb: 11.4 g/dL)\u060C \u0641\u0648\u0644\u0627\u062F \u0648\u0627\u0644\u06CC \u063A\u0630\u0627\u0626\u06CC\u06BA \u0627\u0648\u0631 \u06C1\u0631\u0628\u0644 \u0634\u0631\u0628\u062A \u0641\u0648\u0644\u0627\u062F \u0627\u06A9\u0633\u06CC\u0631 \u062A\u062C\u0648\u06CC\u0632 \u06C1\u06D2\u06D4 \u067E\u0644\u06CC\u0679\u0644\u06CC\u0679\u0633 \u0627\u0648\u0631 \u0648\u0627\u0626\u0679 \u0633\u06CC\u0644\u0632 \u0646\u0627\u0631\u0645\u0644 \u06C1\u06CC\u06BA\u06D4",
    parameters: [
      { name: "Hemoglobin (Hb)", unit: "g/dL", normalRange: "13.0 - 17.0 (M) / 12.0 - 15.0 (F)", minNormal: 13, maxNormal: 17, value: "11.4", isAbnormal: true },
      { name: "Total Leukocyte Count (TLC / WBC)", unit: "/cumm", normalRange: "4,000 - 11,000", minNormal: 4e3, maxNormal: 11e3, value: "7,200", isAbnormal: false },
      { name: "Platelet Count", unit: "/cumm", normalRange: "150,000 - 450,000", minNormal: 15e4, maxNormal: 45e4, value: "280,000", isAbnormal: false },
      { name: "Neutrophils", unit: "%", normalRange: "40 - 75", minNormal: 40, maxNormal: 75, value: "62", isAbnormal: false },
      { name: "Lymphocytes", unit: "%", normalRange: "20 - 45", minNormal: 20, maxNormal: 45, value: "30", isAbnormal: false },
      { name: "ESR (Erythrocyte Sedimentation Rate)", unit: "mm/1st hr", normalRange: "0 - 15 (M) / 0 - 20 (F)", minNormal: 0, maxNormal: 15, value: "12", isAbnormal: false }
    ]
  },
  // 3. Eye Scan Order (Visible to Dr. Asim Farooq - Optometrist)
  {
    id: "LAB-ORD-EYE-103",
    orderNumber: "EYE-103",
    patientId: "PT-905",
    patientName: "\u062D\u0627\u062C\u06CC \u0628\u0634\u06CC\u0631 \u0627\u062D\u0645\u062F",
    patientAge: 61,
    patientGender: "Male",
    patientPhone: "0322-9988776",
    referredByDoctor: "\u0688\u0627\u06A9\u0679\u0631 \u0632\u06CC\u0634\u0627\u0646 \u0686\u0648\u06C1\u062F\u0631\u06CC (MBBS)",
    testCategory: "Computerized Eye Scan",
    testName: "Auto-Refractometer Computerized Eye & Refraction Scan",
    testDate: "2026-08-19",
    deliveryDate: "2026-08-19",
    pricePKR: 500,
    paymentStatus: "Paid",
    status: "Report Ready",
    reportedByTechnician: "\u0688\u0627\u06A9\u0679\u0631 \u0639\u0627\u0635\u0645 \u0641\u0627\u0631\u0648\u0642 (Optometrist)",
    approvedByPathologist: "\u0688\u0627\u06A9\u0679\u0631 \u0639\u0627\u0635\u0645 \u0641\u0627\u0631\u0648\u0642 (Consultant Optometrist)",
    clinicalInterpretationUrdu: "\u062F\u0648\u0646\u0648\u06BA \u0622\u0646\u06A9\u06BE\u0648\u06BA \u0645\u06CC\u06BA \u062F\u0648\u0631 \u06A9\u06CC \u0646\u0638\u0631 \u06A9\u06CC \u06A9\u0645\u0632\u0648\u0631\u06CC (Myopic Astigmatism) \u0627\u0648\u0631 \u0642\u0631\u06CC\u0628 \u06A9\u06CC \u0646\u0638\u0631 \u06A9\u0627 \u0646\u0645\u0628\u0631 (+2.25 D Presbyopia) \u0638\u0627\u06C1\u0631 \u06C1\u0648\u0627 \u06C1\u06D2\u06D4 \u06A9\u0645\u067E\u06CC\u0648\u0679\u0631 \u0628\u0644\u0648 \u06A9\u0679 \u0634\u06CC\u0634\u06D2 \u062A\u062C\u0648\u06CC\u0632 \u06A9\u06CC\u06D2 \u06AF\u0626\u06D2 \u06C1\u06CC\u06BA\u06D4",
    parameters: [
      { name: "Right Eye Sphere (OD SPH)", unit: "Diopter (D)", normalRange: "0.00 (Plano) / \xB1 0.50", value: "-1.25", isAbnormal: true },
      { name: "Right Eye Cylinder (OD CYL)", unit: "Diopter (D)", normalRange: "0.00 / \xB1 0.25", value: "-0.75", isAbnormal: true },
      { name: "Right Eye Axis (OD Axis)", unit: "Degree (\xB0)", normalRange: "1\xB0 - 180\xB0", value: "90\xB0", isAbnormal: false },
      { name: "Left Eye Sphere (OS SPH)", unit: "Diopter (D)", normalRange: "0.00 (Plano) / \xB1 0.50", value: "-1.50", isAbnormal: true },
      { name: "Left Eye Cylinder (OS CYL)", unit: "Diopter (D)", normalRange: "0.00 / \xB1 0.25", value: "-0.50", isAbnormal: true },
      { name: "Left Eye Axis (OS Axis)", unit: "Degree (\xB0)", normalRange: "1\xB0 - 180\xB0", value: "85\xB0", isAbnormal: false },
      { name: "Pupillary Distance (PD)", unit: "mm", normalRange: "58 - 66 mm", value: "64 mm", isAbnormal: false }
    ]
  }
];

// src/data/pharmacyBatchData.ts
var INITIAL_PHARMACY_BATCHES = [
  {
    id: "BAT-101",
    productId: "hoorab-hair-oil",
    productNameUrdu: "\u062D\u0648\u0631\u0627\u0628 \u06C1\u0631\u0628\u0644 \u06C1\u06CC\u0626\u0631 \u0622\u0626\u0644 (200ml)",
    productNameEnglish: "Hoorab Herbal Hair Oil (200ml)",
    barcode: "896400012301",
    batchNumber: "HHO-26A",
    mfgDate: "2026-01-10",
    expiryDate: "2028-01-10",
    costPricePKR: 850,
    salePricePKR: 1500,
    currentStock: 45,
    minThreshold: 10,
    rackLocation: "Rack A-1 (Top Shelf)",
    supplierName: "Hafiz Herbal Laboratories Ltd."
  },
  {
    id: "BAT-102",
    productId: "hoorab-beauty-cream",
    productNameUrdu: "\u062D\u0648\u0631\u0627\u0628 \u06AF\u0644\u0648\u0626\u0646\u06AF \u0628\u06CC\u0648\u0679\u06CC \u06A9\u0631\u06CC\u0645 (50g)",
    productNameEnglish: "Hoorab Glowing Beauty Cream (50g)",
    barcode: "896400012302",
    batchNumber: "HBC-26B",
    mfgDate: "2026-02-15",
    expiryDate: "2027-08-15",
    costPricePKR: 650,
    salePricePKR: 1200,
    currentStock: 28,
    minThreshold: 8,
    rackLocation: "Rack A-2 (Cosmetics)",
    supplierName: "Hafiz Natural Skincare Unit"
  },
  {
    id: "BAT-103",
    productId: "herbal-joint-oil",
    productNameUrdu: "\u062F\u0631\u062F \u0631\u06CC\u0644\u06CC\u0641 \u062E\u0627\u0635 \u062C\u0648\u0627\u0626\u0646\u0679 \u0622\u0626\u0644 (120ml)",
    productNameEnglish: "Herbal Joint Pain Relief Oil",
    barcode: "896400012303",
    batchNumber: "JRO-25C",
    mfgDate: "2025-08-01",
    expiryDate: "2026-09-15",
    // Expiring very soon alert!
    costPricePKR: 450,
    salePricePKR: 850,
    currentStock: 6,
    // Low stock alert!
    minThreshold: 10,
    rackLocation: "Rack B-1 (Pain Care)",
    supplierName: "Hafiz Herbal Laboratories Ltd."
  },
  {
    id: "BAT-104",
    productId: "majoon-shabab",
    productNameUrdu: "\u0645\u0639\u062C\u0648\u0646 \u062E\u0627\u0635 \u0645\u0642\u0648\u06CC \u0627\u0639\u0635\u0627\u0628 (250g)",
    productNameEnglish: "Majoon Khas Nerve Tonic (250g)",
    barcode: "896400012304",
    batchNumber: "MSH-26D",
    mfgDate: "2026-03-01",
    expiryDate: "2027-09-01",
    costPricePKR: 1100,
    salePricePKR: 2e3,
    currentStock: 19,
    minThreshold: 5,
    rackLocation: "Rack B-3 (Majoonat)",
    supplierName: "Hafiz Herbal Laboratories Ltd."
  },
  {
    id: "BAT-105",
    productId: "eye-cooling-drops",
    productNameUrdu: "\u0639\u0631\u0642\u0650 \u06AF\u0644\u0627\u0628 \u0648 \u0645\u0642\u0648\u06CC \u0686\u0634\u0645 \u0688\u0631\u0627\u067E\u0633 (30ml)",
    productNameEnglish: "Herbal Eye Cooling & Sight Drops",
    barcode: "896400012305",
    batchNumber: "ECD-26E",
    mfgDate: "2026-04-10",
    expiryDate: "2027-10-10",
    costPricePKR: 180,
    salePricePKR: 350,
    currentStock: 52,
    minThreshold: 15,
    rackLocation: "Rack C-1 (Eye Care / Vision)",
    supplierName: "Hafiz Vision Care Pharma"
  },
  {
    id: "BAT-106",
    productId: "herbal-sugar-control",
    productNameUrdu: "\u0633\u0641\u0648\u0641\u0650 \u0636\u06CC\u0627\u0628\u06CC\u0637\u0633 \u0634\u0648\u06AF\u0631 \u06A9\u0646\u0679\u0631\u0648\u0644 (150g)",
    productNameEnglish: "Herbal Diabetes Control Powder",
    barcode: "896400012306",
    batchNumber: "SDC-25F",
    mfgDate: "2025-06-20",
    expiryDate: "2026-09-01",
    // Expiring soon!
    costPricePKR: 400,
    salePricePKR: 750,
    currentStock: 3,
    // Very low stock!
    minThreshold: 10,
    rackLocation: "Rack B-2 (General Care)",
    supplierName: "Hafiz Herbal Laboratories Ltd."
  }
];

// src/data/ipdWardData.ts
var INITIAL_WARD_BEDS = [
  {
    id: "BED-GWM-01",
    bedNumber: "GWM-01",
    wardName: "Male General Ward (\u0645\u0631\u062F\u0627\u0646\u06C1 \u0648\u0627\u0631\u0688)",
    wardType: "General Ward (Male)",
    floor: "1st Floor - Wing A",
    dailyRentPKR: 1500,
    status: "Occupied",
    amenities: ["Oxygen Port", "Adjustable Fowler Bed", "Patient Locker", "Attendant Chair", "Shared Washroom"],
    currentAdmissionId: "IPD-2026-0041",
    currentPatientName: "\u0645\u062D\u0645\u062F \u0627\u06A9\u0631\u0645 \u0686\u06CC\u0645\u06C1 (M. Akram Cheema)",
    admittedSince: "2026-08-18"
  },
  {
    id: "BED-GWM-02",
    bedNumber: "GWM-02",
    wardName: "Male General Ward (\u0645\u0631\u062F\u0627\u0646\u06C1 \u0648\u0627\u0631\u0688)",
    wardType: "General Ward (Male)",
    floor: "1st Floor - Wing A",
    dailyRentPKR: 1500,
    status: "Available",
    amenities: ["Oxygen Port", "Adjustable Fowler Bed", "Patient Locker", "Attendant Chair", "Shared Washroom"]
  },
  {
    id: "BED-GWM-03",
    bedNumber: "GWM-03",
    wardName: "Male General Ward (\u0645\u0631\u062F\u0627\u0646\u06C1 \u0648\u0627\u0631\u0688)",
    wardType: "General Ward (Male)",
    floor: "1st Floor - Wing A",
    dailyRentPKR: 1500,
    status: "Cleaning",
    amenities: ["Oxygen Port", "Adjustable Fowler Bed", "Patient Locker", "Attendant Chair", "Shared Washroom"]
  },
  {
    id: "BED-GWF-01",
    bedNumber: "GWF-01",
    wardName: "Female General Ward (\u0632\u0646\u0627\u0646\u06C1 \u0648\u0627\u0631\u0688)",
    wardType: "General Ward (Female)",
    floor: "1st Floor - Wing B",
    dailyRentPKR: 1500,
    status: "Occupied",
    amenities: ["Oxygen Port", "Curtain Privacy", "Electronic Bed", "Female Attendant Couch"],
    currentAdmissionId: "IPD-2026-0042",
    currentPatientName: "\u0628\u06CC \u0628\u06CC \u0646\u0633\u06CC\u0645 \u0627\u062E\u062A\u0631 (Naseem Akhtar)",
    admittedSince: "2026-08-17"
  },
  {
    id: "BED-GWF-02",
    bedNumber: "GWF-02",
    wardName: "Female General Ward (\u0632\u0646\u0627\u0646\u06C1 \u0648\u0627\u0631\u0688)",
    wardType: "General Ward (Female)",
    floor: "1st Floor - Wing B",
    dailyRentPKR: 1500,
    status: "Available",
    amenities: ["Oxygen Port", "Curtain Privacy", "Electronic Bed", "Female Attendant Couch"]
  },
  {
    id: "BED-PVT-101",
    bedNumber: "PVT-101",
    wardName: "Deluxe Private Suite (\u067E\u0631\u0627\u0626\u06CC\u0648\u06CC\u0679 \u06A9\u0645\u0631\u06C1 \u06F1\u06F0\u06F1)",
    wardType: "Private Deluxe Room",
    floor: "2nd Floor - Executive Wing",
    dailyRentPKR: 5e3,
    status: "Occupied",
    amenities: ["Attached Washroom", "Split Air Conditioner", "LED Smart TV", "Sofa Cum Bed for Attendant", "Refrigerator", "Electric Kettle", "Wi-Fi"],
    currentAdmissionId: "IPD-2026-0043",
    currentPatientName: "\u0686\u0648\u06C1\u062F\u0631\u06CC \u0628\u0634\u06CC\u0631 \u0627\u062D\u0645\u062F (Ch. Bashir Ahmad)",
    admittedSince: "2026-08-16"
  },
  {
    id: "BED-PVT-102",
    bedNumber: "PVT-102",
    wardName: "Deluxe Private Suite (\u067E\u0631\u0627\u0626\u06CC\u0648\u06CC\u0679 \u06A9\u0645\u0631\u06C1 \u06F1\u06F0\u06F2)",
    wardType: "Private Deluxe Room",
    floor: "2nd Floor - Executive Wing",
    dailyRentPKR: 5e3,
    status: "Available",
    amenities: ["Attached Washroom", "Split Air Conditioner", "LED Smart TV", "Sofa Bed", "Refrigerator", "Wi-Fi"]
  },
  {
    id: "BED-SEMI-201",
    bedNumber: "SEMI-201",
    wardName: "Semi-Private Room (\u0633\u06CC\u0645\u06CC \u067E\u0631\u0627\u0626\u06CC\u0648\u06CC\u0679 \u06F2\u06F01)",
    wardType: "Semi-Private Room",
    floor: "2nd Floor - Wing A",
    dailyRentPKR: 3e3,
    status: "Available",
    amenities: ["AC Shared", "2 Beds only", "Attached Washroom", "Separate Wardrobes", "Curtain Partition"]
  },
  {
    id: "BED-EMG-01",
    bedNumber: "EMG-01",
    wardName: "Emergency & Day Care Unit (\u0627\u06CC\u0645\u0631\u062C\u0646\u0633\u06CC \u0648 \u0688\u06D2 \u06A9\u06CC\u0626\u0631)",
    wardType: "Emergency & Day Care",
    floor: "Ground Floor - Emergency Gate",
    dailyRentPKR: 2e3,
    status: "Occupied",
    amenities: ["Multi-para Cardiac Monitor", "Central Suction & Oxygen", "Defibrillator Access", "Crash Cart"],
    currentAdmissionId: "IPD-2026-0044",
    currentPatientName: "\u062D\u0627\u0645\u062F \u0645\u062D\u0645\u0648\u062F (Hamid Mehmood)",
    admittedSince: "2026-08-19"
  },
  {
    id: "BED-EMG-02",
    bedNumber: "EMG-02",
    wardName: "Emergency & Day Care Unit (\u0627\u06CC\u0645\u0631\u062C\u0646\u0633\u06CC \u0648 \u0688\u06D2 \u06A9\u06CC\u0626\u0631)",
    wardType: "Emergency & Day Care",
    floor: "Ground Floor - Emergency Gate",
    dailyRentPKR: 2e3,
    status: "Available",
    amenities: ["Cardiac Monitor", "Central Oxygen", "Suction Machine", "IV Stand"]
  },
  {
    id: "BED-ICU-01",
    bedNumber: "ICU-01",
    wardName: "High Dependency & Intensive Care (ICU/HDU)",
    wardType: "ICU / High Dependency",
    floor: "1st Floor - Critical Care",
    dailyRentPKR: 8e3,
    status: "Available",
    amenities: ["Invasive Ventilator", "5-Para Monitor", "Syringe Infusion Pumps", "1:1 Nursing Station"]
  }
];
var INITIAL_IPD_ADMISSIONS = [
  {
    id: "IPD-2026-0041",
    admissionNumber: "IPD-2026-0041",
    mrn: "MRN-88491",
    patientName: "\u0645\u062D\u0645\u062F \u0627\u06A9\u0631\u0645 \u0686\u06CC\u0645\u06C1 (M. Akram Cheema)",
    patientAge: 52,
    patientGender: "Male",
    patientPhone: "0300-4567890",
    cnicNumber: "35201-1234567-1",
    address: "\u0645\u062D\u0644\u06C1 \u0639\u06CC\u062F \u06AF\u0627\u06C1\u060C \u067E\u06BE\u0627\u0644\u06CC\u06C1 \u0631\u0648\u0688\u060C \u0645\u0646\u0688\u06CC \u0628\u06C1\u0627\u0624\u0627\u0644\u062F\u06CC\u0646",
    emergencyContactName: "\u0639\u062B\u0645\u0627\u0646 \u0627\u06A9\u0631\u0645 (\u0628\u06CC\u0679\u0627)",
    emergencyContactPhone: "0301-7654321",
    emergencyRelation: "Son",
    admittingDoctorId: "doc-1",
    admittingDoctorName: "\u0688\u0627\u06A9\u0679\u0631 \u0632\u06CC\u0634\u0627\u0646 \u0686\u0648\u06C1\u062F\u0631\u06CC",
    admittingDoctorSpecialty: "General Medicine & Herbal Specialist",
    admissionDate: "2026-08-18",
    admissionTime: "11:30 AM",
    bedId: "BED-GWM-01",
    bedNumber: "GWM-01",
    wardName: "Male General Ward",
    wardType: "General Ward (Male)",
    provisionalDiagnosis: "\u0634\u062F\u06CC\u062F \u0645\u0639\u062F\u06C1 \u0627\u0644\u0633\u0631 \u0648 \u0688\u06CC \u06C1\u0627\u0626\u06CC\u0688\u0631\u06CC\u0634\u0646 (Acute Gastric Erosion & Dehydration)",
    admissionReasonUrdu: "\u0645\u0633\u0644\u0633\u0644 \u0627\u0644\u0679\u06CC\u0627\u06BA\u060C \u067E\u06CC\u0679 \u0645\u06CC\u06BA \u0634\u062F\u06CC\u062F \u062F\u0631\u062F \u0627\u0648\u0631 \u06A9\u0645\u0632\u0648\u0631\u06CC \u06A9\u06CC \u0648\u062C\u06C1 \u0633\u06D2 \u062F\u0627\u062E\u0644 \u06A9\u06CC\u0627 \u06AF\u06CC\u0627\u06D4",
    allergies: ["Penicillin", "Sulfa Drugs"],
    initialVitals: {
      bpSystolic: 100,
      bpDiastolic: 65,
      pulse: 98,
      temperatureF: 99.2,
      spo2: 97
    },
    dailyBedRatePKR: 1500,
    advanceDepositPaidPKR: 1e4,
    depositPaymentMethod: "Cash",
    nursingLogs: [
      {
        id: "nlog-1",
        admissionId: "IPD-2026-0041",
        timestamp: "2026-08-18 02:00 PM",
        roundShift: "Afternoon (02:00 PM)",
        nurseName: "\u0646\u0631\u0633 \u0641\u0648\u0632\u06CC\u06C1 \u067E\u0631\u0648\u06CC\u0646",
        vitals: {
          bpSystolic: 105,
          bpDiastolic: 70,
          pulseRate: 92,
          temperatureF: 98.8,
          respiratoryRate: 18,
          spo2Percentage: 98,
          randomBloodSugar: 135,
          painScale: 6
        },
        ivFluidsDrip: "Ringer Lactate 1000ml @ 35 drops/min + 1 Amp Omeprazole IV",
        injectionsGiven: ["Inj. Gravinate IV stat", "Inj. Risek 40mg IV"],
        oralMedicationsGiven: ["\u0634\u0631\u0628\u062A \u0627\u06A9\u0633\u06CC\u0631 \u0645\u0639\u062F\u06C1 2 \u0686\u0645\u0686"],
        intakeOutput: {
          oralFluidMl: 200,
          ivFluidMl: 1e3,
          urineOutputMl: 650,
          bowelMovement: "Nil"
        },
        clinicalNotes: "\u0645\u0631\u06CC\u0636 \u06A9\u0648 \u0645\u062A\u0644\u06CC \u06A9\u06CC \u0634\u06A9\u0627\u06CC\u062A \u0645\u06CC\u06BA 50 \u0641\u06CC\u0635\u062F \u06A9\u0645\u06CC \u06C1\u06D2\u06D4 \u0688\u0631\u067E \u062C\u0627\u0631\u06CC \u06C1\u06D2\u06D4 \u067E\u06CC\u0679 \u0645\u06CC\u06BA \u0646\u0631\u0645\u06CC \u06C1\u06D2\u06D4",
        doctorNotified: true
      },
      {
        id: "nlog-2",
        admissionId: "IPD-2026-0041",
        timestamp: "2026-08-18 08:00 PM",
        roundShift: "Evening (08:00 PM)",
        nurseName: "\u0646\u0631\u0633 \u0633\u062F\u0631\u06C1 \u06A9\u0646\u0648\u0644",
        vitals: {
          bpSystolic: 115,
          bpDiastolic: 75,
          pulseRate: 84,
          temperatureF: 98.4,
          respiratoryRate: 16,
          spo2Percentage: 98,
          randomBloodSugar: 120,
          painScale: 3
        },
        ivFluidsDrip: "Dextrose Saline 5% 1000ml",
        injectionsGiven: ["Inj. Risek 40mg IV", "Inj. Ketorolac IV SOS"],
        oralMedicationsGiven: ["\u0644\u0639\u0648\u0642 \u0633\u067E\u0633\u062A\u0627\u06BA 1 \u0686\u0645\u0686", "\u062D\u0628 \u0634\u0641\u0627 \u0627\u0639\u0635\u0627\u0628 1 \u06AF\u0648\u0644\u06CC"],
        intakeOutput: {
          oralFluidMl: 400,
          ivFluidMl: 1e3,
          urineOutputMl: 900,
          bowelMovement: "Normal"
        },
        clinicalNotes: "\u0645\u0631\u06CC\u0636 \u06A9\u06CC \u062D\u0627\u0644\u062A \u067E\u06C1\u0644\u06D2 \u0633\u06D2 \u06A9\u0627\u0641\u06CC \u0628\u06C1\u062A\u0631 \u06C1\u06D2\u06D4 \u0646\u06CC\u0645 \u06AF\u0631\u0645 \u0633\u0648\u067E \u0627\u0648\u0631 \u06A9\u06BE\u0686\u0691\u06CC \u06A9\u06BE\u0627\u0626\u06CC \u06C1\u06D2\u06D4 \u062F\u0631\u062F \u0642\u0627\u0628\u0648 \u0645\u06CC\u06BA \u06C1\u06D2\u06D4",
        doctorNotified: false
      },
      {
        id: "nlog-3",
        admissionId: "IPD-2026-0041",
        timestamp: "2026-08-19 08:00 AM",
        roundShift: "Morning (08:00 AM)",
        nurseName: "\u0646\u0631\u0633 \u0641\u0648\u0632\u06CC\u06C1 \u067E\u0631\u0648\u06CC\u0646",
        vitals: {
          bpSystolic: 120,
          bpDiastolic: 80,
          pulseRate: 76,
          temperatureF: 98.4,
          respiratoryRate: 16,
          spo2Percentage: 99,
          randomBloodSugar: 110,
          painScale: 1
        },
        ivFluidsDrip: "Slow Normal Saline KVO (Keep Vein Open)",
        injectionsGiven: ["Inj. Omeprazole 40mg IV"],
        oralMedicationsGiven: ["\u0645\u0639\u062F\u06C1 \u0634\u0641\u0627 \u06A9\u0648\u0631\u0633 \u062E\u0648\u0631\u0627\u06A9 \u06F1"],
        intakeOutput: {
          oralFluidMl: 600,
          ivFluidMl: 500,
          urineOutputMl: 1100,
          bowelMovement: "Normal"
        },
        clinicalNotes: "\u0648\u0627\u0626\u0679\u0644\u0632 \u0628\u0627\u0644\u06A9\u0644 \u0646\u0627\u0631\u0645\u0644 \u06C1\u06CC\u06BA\u06D4 \u0645\u0631\u06CC\u0636 \u062E\u0648\u062F \u0648\u0627\u06A9 \u06A9\u0631 \u0631\u06C1\u0627 \u06C1\u06D2\u06D4 \u0688\u0627\u06A9\u0679\u0631 \u0635\u0627\u062D\u0628 \u06A9\u0648 \u0688\u0633\u0686\u0627\u0631\u062C \u06A9\u06D2 \u0644\u06CC\u06D2 \u067E\u06CC\u0634 \u06A9\u06CC\u0627 \u06AF\u06CC\u0627\u06D4",
        doctorNotified: true
      }
    ],
    doctorVisitNotes: [
      {
        id: "dvn-1",
        doctorName: "\u0688\u0627\u06A9\u0679\u0631 \u0632\u06CC\u0634\u0627\u0646 \u0686\u0648\u06C1\u062F\u0631\u06CC",
        timestamp: "2026-08-18 06:00 PM",
        notes: "\u0645\u0639\u062F\u06D2 \u06A9\u06CC \u0633\u0648\u0632\u0634 \u0628\u06C1\u062A\u0631 \u06C1\u0648 \u0631\u06C1\u06CC \u06C1\u06D2\u06D4 \u0635\u0628\u062D \u062A\u06A9 \u0688\u0631\u067E \u062C\u0627\u0631\u06CC \u0631\u06A9\u06BE\u06CC\u06BA \u0627\u0648\u0631 \u06C1\u0644\u06A9\u06CC \u063A\u0630\u0627 \u062F\u06CC\u06BA\u06D4 \u06A9\u0644 \u0635\u0628\u062D \u0688\u0633\u0686\u0627\u0631\u062C \u06A9\u0627 \u062C\u0627\u0626\u0632\u06C1 \u0644\u06CC\u0627 \u062C\u0627\u0626\u06D2 \u06AF\u0627\u06D4",
        prescribedChanges: "Oral diet tolerated. Reduce IV fluids."
      }
    ],
    status: "Admitted",
    createdAt: "2026-08-18T11:30:00.000Z"
  },
  {
    id: "IPD-2026-0042",
    admissionNumber: "IPD-2026-0042",
    mrn: "MRN-91204",
    patientName: "\u0628\u06CC \u0628\u06CC \u0646\u0633\u06CC\u0645 \u0627\u062E\u062A\u0631 (Naseem Akhtar)",
    patientAge: 46,
    patientGender: "Female",
    patientPhone: "0304-9988771",
    cnicNumber: "35201-9988112-2",
    address: "\u0648\u0627\u0631\u0688 \u0646\u0645\u0628\u0631 4\u060C \u06AF\u0644\u0628\u0631\u06AF \u0679\u0627\u0624\u0646\u060C \u0645\u0646\u0688\u06CC \u0628\u06C1\u0627\u0624\u0627\u0644\u062F\u06CC\u0646",
    emergencyContactName: "\u0637\u0627\u0631\u0642 \u0645\u062D\u0645\u0648\u062F (\u0634\u0648\u06C1\u0631)",
    emergencyContactPhone: "0302-3344556",
    emergencyRelation: "Husband",
    admittingDoctorId: "doc-3",
    admittingDoctorName: "\u0688\u0627\u06A9\u0679\u0631 \u0645\u0631\u06CC\u0645 \u0633\u0644\u0637\u0627\u0646\u06C1",
    admittingDoctorSpecialty: "Gastroenterology & Women Health Specialist",
    admissionDate: "2026-08-17",
    admissionTime: "04:15 PM",
    bedId: "BED-GWF-01",
    bedNumber: "GWF-01",
    wardName: "Female General Ward",
    wardType: "General Ward (Female)",
    provisionalDiagnosis: "\u0634\u062F\u06CC\u062F \u067E\u062A\u06D2 \u06A9\u06CC \u0633\u0648\u0632\u0634 \u0648 \u0627\u06CC\u0646\u06CC\u0645\u06CC\u0627 (Acute Cholecystitis & Moderate Anemia)",
    admissionReasonUrdu: "\u062F\u0627\u0626\u06CC\u06BA \u067E\u0633\u0644\u06CC \u06A9\u06D2 \u0646\u06CC\u0686\u06D2 \u0634\u062F\u06CC\u062F \u062F\u0631\u062F\u060C \u0627\u0644\u0679\u06CC \u0627\u0648\u0631 \u062E\u0648\u0646 \u06A9\u06CC \u06A9\u0645\u06CC (Hb: 8.2 g/dl)",
    allergies: ["No Known Drug Allergy"],
    initialVitals: {
      bpSystolic: 130,
      bpDiastolic: 85,
      pulse: 88,
      temperatureF: 100.4,
      spo2: 96
    },
    dailyBedRatePKR: 1500,
    advanceDepositPaidPKR: 15e3,
    depositPaymentMethod: "JazzCash",
    nursingLogs: [
      {
        id: "nlog-4",
        admissionId: "IPD-2026-0042",
        timestamp: "2026-08-18 08:00 AM",
        roundShift: "Morning (08:00 AM)",
        nurseName: "\u0646\u0631\u0633 \u0645\u0627\u0631\u06CC\u06C1 \u0628\u062A\u0648\u0644",
        vitals: {
          bpSystolic: 125,
          bpDiastolic: 80,
          pulseRate: 80,
          temperatureF: 98.6,
          respiratoryRate: 18,
          spo2Percentage: 98,
          randomBloodSugar: 140,
          painScale: 4
        },
        ivFluidsDrip: "Normal Saline 1000ml + Venofer (Iron Infusion) under observation",
        injectionsGiven: ["Inj. Rocephin 1g IV BD", "Inj. Toradol IV"],
        oralMedicationsGiven: ["\u0642\u0631\u0635 \u0645\u0642\u0648\u06CC \u062C\u06AF\u0631 1-1-1"],
        intakeOutput: {
          oralFluidMl: 800,
          ivFluidMl: 1e3,
          urineOutputMl: 1200,
          bowelMovement: "Normal"
        },
        clinicalNotes: "\u0622\u0626\u0631\u0646 \u0627\u0646\u0641\u06CC\u0648\u0698\u0646 \u0628\u063A\u06CC\u0631 \u06A9\u0633\u06CC \u0627\u0644\u0631\u062C\u06CC \u0645\u06A9\u0645\u0644 \u06C1\u0648 \u06AF\u0626\u06CC\u06D4 \u0645\u0631\u06CC\u0636\u06C1 \u06A9\u0627 \u0628\u062E\u0627\u0631 \u0627\u062A\u0631 \u0686\u06A9\u0627 \u06C1\u06D2\u06D4",
        doctorNotified: false
      }
    ],
    doctorVisitNotes: [
      {
        id: "dvn-2",
        doctorName: "\u0688\u0627\u06A9\u0679\u0631 \u0645\u0631\u06CC\u0645 \u0633\u0644\u0637\u0627\u0646\u06C1",
        timestamp: "2026-08-18 11:00 AM",
        notes: "\u0627\u0644\u0679\u0631\u0627\u0633\u0627\u0624\u0646\u0688 \u0641\u0627\u0644\u0648 \u0627\u067E \u06A9\u06CC \u06C1\u062F\u0627\u06CC\u0627\u062A \u062F\u06CC\u06BA\u06D4 \u0686\u0631\u0628\u06CC \u062F\u0627\u0631 \u06A9\u06BE\u0627\u0646\u0648\u06BA \u0633\u06D2 \u0645\u06A9\u0645\u0644 \u067E\u0631\u06C1\u06CC\u0632 \u06A9\u0631\u0648\u0627\u0626\u06CC\u06BA\u06D4"
      }
    ],
    status: "Admitted",
    createdAt: "2026-08-17T16:15:00.000Z"
  },
  {
    id: "IPD-2026-0043",
    admissionNumber: "IPD-2026-0043",
    mrn: "MRN-77312",
    patientName: "\u0686\u0648\u06C1\u062F\u0631\u06CC \u0628\u0634\u06CC\u0631 \u0627\u062D\u0645\u062F (Ch. Bashir Ahmad)",
    patientAge: 64,
    patientGender: "Male",
    patientPhone: "0300-8889990",
    cnicNumber: "35201-4455667-1",
    address: "\u0686\u06CC\u0645\u0627 \u06C1\u0627\u0624\u0633\u060C \u06A9\u0686\u06C1\u0631\u06CC \u0631\u0648\u0688\u060C \u0645\u0646\u0688\u06CC \u0628\u06C1\u0627\u0624\u0627\u0644\u062F\u06CC\u0646",
    emergencyContactName: "\u0633\u0644\u0645\u0627\u0646 \u0628\u0634\u06CC\u0631 (\u0628\u06CC\u0679\u0627)",
    emergencyContactPhone: "0300-5554443",
    emergencyRelation: "Son",
    admittingDoctorId: "doc-2",
    admittingDoctorName: "\u0688\u0627\u06A9\u0679\u0631 \u0648\u0642\u0627\u0635 \u0635\u063A\u06CC\u0631 \u0686\u0648\u06C1\u062F\u0631\u06CC",
    admittingDoctorSpecialty: "Cardiology & Internal Medicine",
    admissionDate: "2026-08-16",
    admissionTime: "08:00 PM",
    bedId: "BED-PVT-101",
    bedNumber: "PVT-101",
    wardName: "Deluxe Private Suite",
    wardType: "Private Deluxe Room",
    provisionalDiagnosis: "\u06C1\u0627\u0626\u06CC \u0628\u0644\u0688 \u067E\u0631\u06CC\u0634\u0631 \u0627\u06CC\u0645\u0631\u062C\u0646\u0633\u06CC \u0648 \u062C\u0648\u0691\u0648\u06BA \u06A9\u0627 \u062F\u0631\u062F (Hypertensive Crisis & Osteoarthritis Knee)",
    admissionReasonUrdu: "\u0628\u06CC \u067E\u06CC 190/115\u060C \u0633\u0631 \u0686\u06A9\u0631\u0627\u0646\u0627\u060C \u06AF\u06BE\u0679\u0646\u0648\u06BA \u0645\u06CC\u06BA \u0634\u062F\u06CC\u062F \u0648\u0631\u0645 \u0627\u0648\u0631 \u0686\u0644\u0646\u06D2 \u067E\u06BE\u0631\u0646\u06D2 \u0633\u06D2 \u0645\u0639\u0630\u0648\u0631\u06CC\u06D4",
    allergies: ["NSAIDs Allergy (Severe)"],
    initialVitals: {
      bpSystolic: 190,
      bpDiastolic: 115,
      pulse: 104,
      temperatureF: 98.6,
      spo2: 95
    },
    dailyBedRatePKR: 5e3,
    advanceDepositPaidPKR: 3e4,
    depositPaymentMethod: "Bank Transfer",
    nursingLogs: [
      {
        id: "nlog-5",
        admissionId: "IPD-2026-0043",
        timestamp: "2026-08-19 02:00 PM",
        roundShift: "Afternoon (02:00 PM)",
        nurseName: "\u0646\u0631\u0633 \u0633\u062F\u0631\u06C1 \u06A9\u0646\u0648\u0644",
        vitals: {
          bpSystolic: 130,
          bpDiastolic: 82,
          pulseRate: 74,
          temperatureF: 98.4,
          respiratoryRate: 16,
          spo2Percentage: 98,
          randomBloodSugar: 130,
          painScale: 2
        },
        ivFluidsDrip: "Nil (Discontinued)",
        injectionsGiven: ["Inj. Neurobion IM"],
        oralMedicationsGiven: ["\u062D\u0648\u0631\u0627\u0628 \u0645\u0639\u062C\u0648\u0646 \u0639\u0636\u0644\u0627\u062A 1 \u0686\u0645\u0686", "\u062D\u0628 \u0641\u0634\u0627\u0631 \u0627\u0644\u062F\u0645 1 \u06AF\u0648\u0644\u06CC"],
        intakeOutput: {
          oralFluidMl: 1500,
          ivFluidMl: 0,
          urineOutputMl: 1400,
          bowelMovement: "Normal"
        },
        clinicalNotes: "\u0628\u06CC \u067E\u06CC \u0627\u0628 \u0645\u06A9\u0645\u0644 \u0637\u0648\u0631 \u067E\u0631 \u06A9\u0646\u0679\u0631\u0648\u0644 \u0645\u06CC\u06BA \u06C1\u06D2\u06D4 \u0641\u0632\u06CC\u0648\u062A\u06BE\u0631\u0627\u067E\u06CC \u0633\u06CC\u0634\u0646 \u06C1\u0648 \u0686\u06A9\u0627 \u06C1\u06D2\u06D4 \u06AF\u06BE\u0679\u0646\u0648\u06BA \u06A9\u0627 \u062F\u0631\u062F 80% \u0628\u06C1\u062A\u0631 \u06C1\u06D2\u06D4",
        doctorNotified: true
      }
    ],
    doctorVisitNotes: [
      {
        id: "dvn-3",
        doctorName: "\u0688\u0627\u06A9\u0679\u0631 \u0648\u0642\u0627\u0635 \u0635\u063A\u06CC\u0631 \u0686\u0648\u06C1\u062F\u0631\u06CC",
        timestamp: "2026-08-19 05:00 PM",
        notes: "\u0645\u0631\u06CC\u0636 \u06A9\u0644\u06CC\u0646\u06CC\u06A9\u0644\u06CC \u0641\u0679 \u06C1\u06D2 \u0627\u0648\u0631 \u0645\u06A9\u0645\u0644 \u0631\u06CC\u06A9\u0648\u0631 \u06C1\u0648 \u0686\u06A9\u0627 \u06C1\u06D2\u06D4 \u0622\u062C \u0688\u0633\u0686\u0627\u0631\u062C \u0633\u0645\u0631\u06CC \u062A\u06CC\u0627\u0631 \u06A9\u06CC \u062C\u0627\u0626\u06D2\u06D4"
      }
    ],
    status: "Admitted",
    createdAt: "2026-08-16T20:00:00.000Z"
  }
];

// server/routes/erpRoutes.ts
var router15 = (0, import_express15.Router)();
var inMemoryPrescriptions = [
  {
    id: "RX-1001",
    prescriptionNo: "RX-2026-08940",
    date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
    patientId: "APP-1001",
    patientName: "\u06A9\u0627\u0645\u0631\u0627\u0646 \u062E\u0627\u0646 (Kamran Khan)",
    patientAge: 38,
    patientGender: "Male",
    patientPhone: "0300-9876543",
    tokenNumber: "TK-101",
    mrn: "MRN-88491",
    doctorId: "doc-1",
    doctorName: "\u0688\u0627\u06A9\u0679\u0631 \u0632\u06CC\u0634\u0627\u0646 \u0686\u0648\u06C1\u062F\u0631\u06CC",
    doctorDegree: "BEMS (Gold Medalist), MD (Herbal & General Medicine)",
    doctorPmcNumber: "PHC/2026/8940",
    doctorDepartment: "General Medicine & Herbal Specialist",
    vitals: {
      bpSystolic: 125,
      bpDiastolic: 82,
      pulse: 74,
      temperatureF: 98.4,
      weightKg: 76,
      bloodSugarRandom: 110
    },
    chiefComplaints: ["\u0633\u0631 \u062F\u0631\u062F \u0648 \u06AF\u0631\u062F\u0646 \u0645\u06CC\u06BA \u06A9\u06BE\u0686\u0627\u0624", "\u0646\u06CC\u0646\u062F \u06A9\u06CC \u06A9\u0645\u06CC \u0627\u0648\u0631 \u0628\u06D2 \u0686\u06CC\u0646\u06CC"],
    diagnosis: "Cervical Tension Headache & Mild Hypertension",
    items: [
      {
        id: "rx-it-1",
        medicineName: "Hoorab Hair & Scalp Miracle Oil",
        form: "Oil",
        dosage: "10ml",
        frequency: "0-0-1 (\u0631\u0627\u062A \u06A9\u0648 \u0633\u0648\u062A\u06D2 \u0648\u0642\u062A)",
        duration: "15 Days",
        instructions: "\u0633\u0631 \u0627\u0648\u0631 \u06AF\u0631\u062F\u0646 \u06A9\u06D2 \u067E\u0679\u06BE\u0648\u06BA \u0645\u06CC\u06BA \u06C1\u0644\u06A9\u0627 \u0645\u0633\u0627\u062C \u06A9\u0631\u06CC\u06BA",
        quantity: 1
      },
      {
        id: "rx-it-2",
        medicineName: "\u062D\u064E\u0628 \u0634\u0650\u0641\u0627\u0621 \u0627\u0639\u0635\u0627\u0628 (Nerve Calming Herbal Tablets)",
        form: "Tablet",
        dosage: "500mg",
        frequency: "1-0-1 (\u0635\u0628\u062D \u0648 \u0634\u0627\u0645 \u0628\u0639\u062F \u0627\u0632 \u063A\u0630\u0627)",
        duration: "10 Days",
        instructions: "\u062A\u0627\u0632\u06C1 \u067E\u0627\u0646\u06CC \u06CC\u0627 \u0646\u06CC\u0645 \u06AF\u0631\u0645 \u062F\u0648\u062F\u06BE \u06A9\u06D2 \u0633\u0627\u062A\u06BE \u0644\u06CC\u06BA",
        quantity: 20
      }
    ],
    recommendedTests: ["\u06A9\u0645\u067E\u06CC\u0648\u0679\u0631\u0627\u0626\u0632\u0688 \u0646\u0638\u0631 \u06A9\u0627 \u0645\u0639\u0627\u0626\u0646\u06C1 (Vision Scan)", "\u0628\u0644\u0688 \u0634\u0648\u06AF\u0631 \u0641\u0627\u0633\u0679\u0646\u06AF (BSF)"],
    dietaryAdvice: "\u0686\u06A9\u0646\u0627\u0626\u06CC \u0648\u0627\u0644\u06CC \u0627\u0648\u0631 \u062A\u0644\u06CC \u06C1\u0648\u0626\u06CC \u0627\u0634\u06CC\u0627\u0621 \u0633\u06D2 \u067E\u0631\u06C1\u06CC\u0632 \u06A9\u0631\u06CC\u06BA\u060C \u0631\u0648\u0632\u0627\u0646\u06C1 10 \u06AF\u0644\u0627\u0633 \u067E\u0627\u0646\u06CC \u067E\u0626\u06CC\u06BA\u06D4",
    followUpDate: new Date(Date.now() + 7 * 864e5).toISOString().split("T")[0],
    isDigitalSigned: true,
    qrCodeData: "https://hafizclinic.pk/verify-rx/RX-1001",
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  }
];
var inMemoryLabOrders = [...INITIAL_LAB_ORDERS];
var inMemoryBatches = [...INITIAL_PHARMACY_BATCHES];
var inMemoryShifts = [
  {
    id: "shift-1001",
    shiftNo: "SHIFT-2026-0819-M",
    shiftType: "Morning",
    openedAt: new Date(Date.now() - 6 * 36e5).toISOString(),
    closedAt: (/* @__PURE__ */ new Date()).toISOString(),
    status: "Closed",
    cashierId: "staff-1",
    cashierName: "\u0645\u062D\u0645\u062F \u0639\u0644\u06CC (Reception Cashier)",
    openingFloat: 1e4,
    totalGrossSales: 45e3,
    totalDiscounts: 2500,
    totalNetSales: 42500,
    cashCollections: 32500,
    cardCollections: 5e3,
    onlineCollections: 5e3,
    totalExpenses: 4500,
    expectedCash: 38e3,
    actualPhysicalCash: 38e3,
    cashDifference: 0,
    doctorRevenueSplits: [
      {
        doctorId: "doc-1",
        doctorName: "\u0688\u0627\u06A9\u0679\u0631 \u0632\u06CC\u0634\u0627\u0646 \u0686\u0648\u06C1\u062F\u0631\u06CC",
        consultationCount: 14,
        totalOpdFeeCollected: 21e3,
        doctorSharePercentage: 70,
        doctorPayable: 14700,
        hospitalRetained: 6300,
        status: "Paid"
      },
      {
        doctorId: "doc-2",
        doctorName: "\u0688\u0627\u06A9\u0679\u0631 \u0648\u0642\u0627\u0635 \u0635\u063A\u06CC\u0631 \u0686\u0648\u06C1\u062F\u0631\u06CC",
        consultationCount: 8,
        totalOpdFeeCollected: 16e3,
        doctorSharePercentage: 70,
        doctorPayable: 11200,
        hospitalRetained: 4800,
        status: "Pending"
      }
    ],
    notes: "\u062A\u0645\u0627\u0645 \u06A9\u06CC\u0634 \u06A9\u0627\u0624\u0646\u0679\u0646\u06AF \u062F\u0631\u0633\u062A \u06C1\u06D2\u06D4"
  }
];
var inMemoryStaff = [
  {
    id: "staff-1",
    name: "\u062D\u0627\u0631\u062B \u0645\u062D\u0645\u0648\u062F (Haris Mehmood)",
    role: "Pharmacist",
    phone: "0301-1122334",
    email: "pharmacy@hafizclinic.pk",
    status: "Active",
    joinedDate: "2024-01-15",
    permissions: ["pos_sales", "inventory_manage", "expiry_alerts", "reports_view"]
  },
  {
    id: "staff-2",
    name: "\u0633\u0644\u0645\u0627\u0646 \u0627\u0634\u0631\u0641 (Salman Ashraf)",
    role: "Lab Technician",
    phone: "0302-9988776",
    email: "lab@hafizclinic.pk",
    status: "Active",
    joinedDate: "2024-03-01",
    permissions: ["test_orders", "result_entry", "lab_printing", "sample_dispatch"]
  },
  {
    id: "staff-3",
    name: "\u0639\u062B\u0645\u0627\u0646 \u0631\u0641\u06CC\u0642 (Usman Rafique)",
    role: "Receptionist",
    phone: "0303-5566778",
    email: "reception@hafizclinic.pk",
    status: "Active",
    joinedDate: "2023-11-20",
    permissions: ["opd_queue", "appointments_book", "slip_billing", "shift_counter"]
  },
  {
    id: "staff-4",
    name: "\u0688\u0627\u06A9\u0679\u0631 \u0632\u06CC\u0634\u0627\u0646 \u0686\u0648\u06C1\u062F\u0631\u06CC",
    role: "Doctor",
    phone: "0300-1234567",
    email: "dr.zeeshan@hafizclinic.pk",
    status: "Active",
    joinedDate: "2020-05-10",
    permissions: ["doctor_consultation", "digital_rx", "telehealth_chat", "split_reports"]
  }
];
var inMemoryIpdBeds = [...INITIAL_WARD_BEDS];
var inMemoryIpdAdmissions = [...INITIAL_IPD_ADMISSIONS];
router15.get("/ipd-beds", (req, res) => {
  res.json({ success: true, count: inMemoryIpdBeds.length, data: inMemoryIpdBeds });
});
router15.put("/ipd-beds/:id", (req, res) => {
  const idx = inMemoryIpdBeds.findIndex((b) => b.id === req.params.id || b.bedNumber === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ success: false, error: "Bed not found" });
  }
  inMemoryIpdBeds[idx] = {
    ...inMemoryIpdBeds[idx],
    ...req.body
  };
  res.json({ success: true, message: "Bed updated", data: inMemoryIpdBeds[idx] });
});
router15.get("/ipd-admissions", (req, res) => {
  const { status, patientPhone } = req.query;
  let result = inMemoryIpdAdmissions;
  if (status) {
    result = result.filter((a) => a.status === status);
  }
  if (patientPhone) {
    result = result.filter((a) => a.patientPhone === patientPhone);
  }
  res.json({ success: true, count: result.length, data: result });
});
router15.post("/ipd-admissions", (req, res) => {
  const admData = req.body;
  const newAdm = {
    id: admData.id || `IPD-2026-${Math.floor(1e3 + Math.random() * 9e3)}`,
    admissionNumber: admData.admissionNumber || `IPD-2026-${Math.floor(1e3 + Math.random() * 9e3)}`,
    mrn: admData.mrn || `MRN-${Math.floor(1e4 + Math.random() * 9e4)}`,
    admissionDate: admData.admissionDate || (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
    admissionTime: admData.admissionTime || (/* @__PURE__ */ new Date()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    status: "Admitted",
    nursingLogs: [],
    doctorVisitNotes: [],
    ...admData,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  inMemoryIpdAdmissions.unshift(newAdm);
  if (newAdm.bedId) {
    const bedIdx = inMemoryIpdBeds.findIndex((b) => b.id === newAdm.bedId);
    if (bedIdx !== -1) {
      inMemoryIpdBeds[bedIdx].status = "Occupied";
      inMemoryIpdBeds[bedIdx].currentAdmissionId = newAdm.id;
      inMemoryIpdBeds[bedIdx].currentPatientName = newAdm.patientName;
      inMemoryIpdBeds[bedIdx].admittedSince = newAdm.admissionDate;
    }
  }
  res.status(201).json({ success: true, message: "Patient admitted successfully", data: newAdm });
});
router15.post("/ipd-admissions/:id/nursing-log", (req, res) => {
  const idx = inMemoryIpdAdmissions.findIndex((a) => a.id === req.params.id || a.admissionNumber === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ success: false, error: "Admission record not found" });
  }
  const logData = req.body;
  const newLog = {
    id: logData.id || `nlog-${Date.now()}`,
    admissionId: req.params.id,
    timestamp: logData.timestamp || `${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]} ${(/* @__PURE__ */ new Date()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
    ...logData
  };
  inMemoryIpdAdmissions[idx].nursingLogs.push(newLog);
  res.json({ success: true, message: "Nursing round log added", data: newLog, admission: inMemoryIpdAdmissions[idx] });
});
router15.put("/ipd-admissions/:id/discharge", (req, res) => {
  const idx = inMemoryIpdAdmissions.findIndex((a) => a.id === req.params.id || a.admissionNumber === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ success: false, error: "Admission record not found" });
  }
  const dischargeDetails = req.body;
  inMemoryIpdAdmissions[idx].status = "Discharged";
  inMemoryIpdAdmissions[idx].dischargeDetails = dischargeDetails;
  const bedId = inMemoryIpdAdmissions[idx].bedId;
  const bedIdx = inMemoryIpdBeds.findIndex((b) => b.id === bedId);
  if (bedIdx !== -1) {
    inMemoryIpdBeds[bedIdx].status = "Cleaning";
    inMemoryIpdBeds[bedIdx].currentAdmissionId = void 0;
    inMemoryIpdBeds[bedIdx].currentPatientName = void 0;
    inMemoryIpdBeds[bedIdx].admittedSince = void 0;
  }
  res.json({ success: true, message: "Patient discharged and clearance bill finalized", data: inMemoryIpdAdmissions[idx] });
});
router15.get("/prescriptions", (req, res) => {
  const { patientPhone, doctorId, date } = req.query;
  let result = inMemoryPrescriptions;
  if (patientPhone) {
    result = result.filter((p) => p.patientPhone === patientPhone);
  }
  if (doctorId) {
    result = result.filter((p) => p.doctorId === doctorId);
  }
  if (date) {
    result = result.filter((p) => p.date === date);
  }
  res.json({ success: true, count: result.length, data: result });
});
router15.post("/prescriptions", (req, res) => {
  const rxData = req.body;
  const newRx = {
    id: rxData.id || `RX-${Date.now()}`,
    prescriptionNo: rxData.prescriptionNo || `RX-2026-${Math.floor(1e4 + Math.random() * 9e4)}`,
    date: rxData.date || (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
    ...rxData,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  inMemoryPrescriptions.unshift(newRx);
  res.status(201).json({ success: true, message: "Prescription created successfully", data: newRx });
});
router15.get("/prescriptions/:id", (req, res) => {
  const rx = inMemoryPrescriptions.find((p) => p.id === req.params.id || p.prescriptionNo === req.params.id);
  if (!rx) {
    return res.status(404).json({ success: false, error: "Prescription not found" });
  }
  res.json({ success: true, data: rx });
});
router15.get("/lab-orders", (req, res) => {
  const { status, patientPhone } = req.query;
  let result = inMemoryLabOrders;
  if (status) {
    result = result.filter((o) => o.status === status);
  }
  if (patientPhone) {
    result = result.filter((o) => o.patientPhone === patientPhone);
  }
  res.json({ success: true, count: result.length, data: result, catalog: PREDEFINED_LAB_TESTS });
});
router15.post("/lab-orders", (req, res) => {
  const orderData = req.body;
  const newOrder = {
    id: orderData.id || `LAB-${Date.now()}`,
    orderNo: orderData.orderNo || `LAB-2026-${Math.floor(1e3 + Math.random() * 9e3)}`,
    date: orderData.date || (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
    ...orderData,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  inMemoryLabOrders.unshift(newOrder);
  res.status(201).json({ success: true, message: "Lab order created successfully", data: newOrder });
});
router15.put("/lab-orders/:id", (req, res) => {
  const idx = inMemoryLabOrders.findIndex((o) => o.id === req.params.id || o.orderNo === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ success: false, error: "Lab order not found" });
  }
  inMemoryLabOrders[idx] = {
    ...inMemoryLabOrders[idx],
    ...req.body,
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  res.json({ success: true, message: "Lab order updated successfully", data: inMemoryLabOrders[idx] });
});
router15.get("/pharmacy-batches", (req, res) => {
  res.json({ success: true, count: inMemoryBatches.length, data: inMemoryBatches });
});
router15.post("/pharmacy-batches", (req, res) => {
  const batchData = req.body;
  const newBatch = {
    id: batchData.id || `BATCH-${Date.now()}`,
    batchNumber: batchData.batchNumber || `BAT-${Math.floor(1e3 + Math.random() * 9e3)}`,
    ...batchData,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  inMemoryBatches.unshift(newBatch);
  res.status(201).json({ success: true, message: "Pharmacy batch added successfully", data: newBatch });
});
router15.put("/pharmacy-batches/:id", (req, res) => {
  const idx = inMemoryBatches.findIndex((b) => b.id === req.params.id || b.batchNumber === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ success: false, error: "Batch not found" });
  }
  inMemoryBatches[idx] = {
    ...inMemoryBatches[idx],
    ...req.body
  };
  res.json({ success: true, message: "Batch updated successfully", data: inMemoryBatches[idx] });
});
router15.post("/pharmacy-sale", (req, res) => {
  const { items, totalAmount, paymentMethod, customerName, slipNo } = req.body;
  const lowStockAlerts = [];
  if (Array.isArray(items)) {
    for (const item of items) {
      const bIdx = inMemoryBatches.findIndex(
        (b) => b.id === item.batchId || b.id === item.id || b.batchNumber === item.batchNumber
      );
      if (bIdx !== -1) {
        const qty = Number(item.quantity) || 1;
        inMemoryBatches[bIdx].currentStock = Math.max(0, (inMemoryBatches[bIdx].currentStock || 0) - qty);
        if (inMemoryBatches[bIdx].currentStock < (inMemoryBatches[bIdx].minThreshold || 10)) {
          lowStockAlerts.push(
            `Low Stock Warning: ${inMemoryBatches[bIdx].productNameUrdu || inMemoryBatches[bIdx].productNameEnglish} has ${inMemoryBatches[bIdx].currentStock} units remaining.`
          );
        }
      }
    }
  }
  res.json({
    success: true,
    message: "Pharmacy sale processed and inventory updated",
    slipNo: slipNo || `PHARM-${Date.now()}`,
    totalAmount,
    paymentMethod,
    customerName,
    lowStockAlerts,
    updatedBatchesCount: inMemoryBatches.length,
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
});
router15.get("/financial-shifts", (req, res) => {
  res.json({ success: true, count: inMemoryShifts.length, data: inMemoryShifts });
});
router15.post("/financial-shifts", (req, res) => {
  const shiftData = req.body;
  const newShift = {
    id: shiftData.id || `shift-${Date.now()}`,
    shiftNo: shiftData.shiftNo || `SHIFT-${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}-${Math.floor(100 + Math.random() * 900)}`,
    openedAt: (/* @__PURE__ */ new Date()).toISOString(),
    status: "Open",
    ...shiftData
  };
  inMemoryShifts.unshift(newShift);
  res.status(201).json({ success: true, message: "Shift created successfully", data: newShift });
});
router15.put("/financial-shifts/:id/close", (req, res) => {
  const idx = inMemoryShifts.findIndex((s) => s.id === req.params.id || s.shiftNo === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ success: false, error: "Shift not found" });
  }
  inMemoryShifts[idx] = {
    ...inMemoryShifts[idx],
    ...req.body,
    closedAt: (/* @__PURE__ */ new Date()).toISOString(),
    status: "Closed"
  };
  res.json({ success: true, message: "Shift closed and audited successfully", data: inMemoryShifts[idx] });
});
router15.get("/staff-users", (req, res) => {
  res.json({ success: true, count: inMemoryStaff.length, data: inMemoryStaff });
});
router15.post("/staff-users", (req, res) => {
  const staffData = req.body;
  const newStaff = {
    id: staffData.id || `staff-${Date.now()}`,
    joinedDate: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
    status: "Active",
    ...staffData
  };
  inMemoryStaff.push(newStaff);
  res.status(201).json({ success: true, message: "Staff member registered", data: newStaff });
});
var erpRoutes_default = router15;

// src/data/initialData.ts
var initialDiseases2 = [
  // Pain category
  {
    id: "dis-1",
    nameUrdu: "\u062C\u0633\u0645\u0627\u0646\u06CC \u062F\u0631\u062F",
    nameEnglish: "Body Pain",
    category: "pain",
    categoryUrdu: "\u062F\u0631\u062F \u0627\u0648\u0631 \u0645\u06C1\u0631\u06D2",
    symptomsUrdu: ["\u067E\u0648\u0631\u06D2 \u062C\u0633\u0645 \u0645\u06CC\u06BA \u0645\u0633\u0644\u0633\u0644 \u0645\u06CC\u0679\u06BE\u0627 \u062F\u0631\u062F", "\u062A\u06BE\u06A9\u0627\u0648\u0679 \u0627\u0648\u0631 \u0633\u0633\u062A\u06CC", "\u0635\u0628\u062D \u0627\u0679\u06BE\u062A\u06D2 \u06C1\u06CC \u062C\u0633\u0645 \u06A9\u0627 \u0627\u06A9\u0691 \u062C\u0627\u0646\u0627", "\u06A9\u0627\u0645 \u06A9\u0631\u0646\u06D2 \u0633\u06D2 \u062C\u0644\u062F\u06CC \u062A\u06BE\u06A9\u0646"],
    causesUrdu: ["\u0648\u0679\u0627\u0645\u0646 \u0688\u06CC \u0627\u0648\u0631 \u06A9\u06CC\u0644\u0634\u06CC\u0645 \u06A9\u06CC \u06A9\u0645\u06CC", "\u067E\u0679\u06BE\u0648\u06BA \u06A9\u06CC \u06A9\u0645\u0632\u0648\u0631\u06CC", "\u0628\u06D2 \u0642\u0627\u0639\u062F\u06C1 \u0637\u0631\u0632 \u0632\u0646\u062F\u06AF\u06CC", "\u0630\u06C1\u0646\u06CC \u062A\u0646\u0627\u0624"],
    treatmentUrdu: ["\u06A9\u0645\u067E\u06CC\u0648\u0679\u0631\u0627\u0626\u0632\u0688 \u0686\u06CC\u06A9 \u0627\u067E \u06A9\u06D2 \u0628\u0639\u062F \u0645\u062E\u0635\u0648\u0635 \u0637\u0628\u06CC \u0646\u0633\u062E\u06C1", "\u0644\u06CC\u0632\u0631 \u0648 \u0627\u0633\u0679\u06CC\u0645 \u062A\u06BE\u0631\u0627\u067E\u06CC", "\u0642\u062F\u0631\u062A\u06CC \u06C1\u0631\u0628\u0644 \u0679\u0648\u0646\u06A9\u0633", "\u0637\u0631\u0632 \u0632\u0646\u062F\u06AF\u06CC \u0645\u06CC\u06BA \u062A\u0628\u062F\u06CC\u0644\u06CC"],
    shortDescUrdu: ["\u067E\u0648\u0631\u06D2 \u062C\u0633\u0645 \u06A9\u06D2 \u062F\u0631\u062F\u060C \u062A\u06BE\u06A9\u0627\u0648\u0679 \u0627\u0648\u0631 \u0627\u06A9\u0691\u0646 \u06A9\u0627 \u0645\u06A9\u0645\u0644 \u062A\u062F\u0627\u0631\u06A9\u06D4"],
    iconName: "Activity",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "dis-2",
    nameUrdu: "\u062C\u0648\u0691\u0648\u06BA \u06A9\u0627 \u062F\u0631\u062F",
    nameEnglish: "Joint Pain (Arthritis)",
    category: "pain",
    categoryUrdu: "\u062F\u0631\u062F \u0627\u0648\u0631 \u0645\u06C1\u0631\u06D2",
    symptomsUrdu: ["\u062C\u0648\u0691\u0648\u06BA \u0645\u06CC\u06BA \u0633\u0648\u062C\u0646 \u0627\u0648\u0631 \u0633\u0631\u062E\u06CC", "\u0686\u0644\u0646\u06D2 \u067E\u06BE\u0631\u0646\u06D2 \u0645\u06CC\u06BA \u0634\u062F\u06CC\u062F \u062A\u06A9\u0644\u06CC\u0641", "\u062C\u0648\u0691\u0648\u06BA \u0633\u06D2 \u06A9\u0679 \u06A9\u0679 \u06A9\u06CC \u0622\u0648\u0627\u0632\u06CC\u06BA \u0622\u0646\u0627", "\u0646\u0645\u0627\u0632 \u067E\u0691\u06BE\u0646\u06D2 \u0645\u06CC\u06BA \u062F\u0634\u0648\u0627\u0631\u06CC"],
    causesUrdu: ["\u06CC\u0648\u0631\u06A9 \u0627\u06CC\u0633\u0688 \u06A9\u06CC \u0632\u06CC\u0627\u062F\u06C1 \u0645\u0642\u062F\u0627\u0631", "\u062C\u0648\u0691\u0648\u06BA \u06A9\u06CC \u0686\u06A9\u0646\u0627\u0626\u06CC (Synovial Fluid) \u06A9\u0627 \u06A9\u0645 \u06C1\u0648\u0646\u0627", "\u0639\u0645\u0631 \u06A9\u06CC \u0632\u06CC\u0627\u062F\u062A\u06CC", "\u067E\u0631\u0627\u0646\u06CC \u0686\u0648\u0679"],
    treatmentUrdu: ["\u062D\u0627\u0641\u0638 \u062C\u0648\u0627\u0626\u0646\u0679 \u06A9\u06CC\u0626\u0631 \u0641\u0627\u0631\u0645\u0648\u0644\u06C1", "\u0641\u0632\u06CC\u0648\u062A\u06BE\u0631\u0627\u067E\u06CC \u0633\u06CC\u0634\u0646\u0632", "\u0642\u062F\u0631\u062A\u06CC \u062A\u06CC\u0644 \u06A9\u0627 \u0645\u0633\u0627\u062C", "\u06CC\u0648\u0631\u06A9 \u0627\u06CC\u0633\u0688 \u06A9\u0646\u0679\u0631\u0648\u0644 \u0627\u062F\u0648\u06CC\u0627\u062A"],
    shortDescUrdu: ["\u062C\u0648\u0691\u0648\u06BA \u0645\u06CC\u06BA \u0633\u0648\u062C\u0646\u060C \u0627\u06A9\u0691\u0646 \u0627\u0648\u0631 \u0686\u0644\u0646\u06D2 \u067E\u06BE\u0631\u0646\u06D2 \u0645\u06CC\u06BA \u062A\u06A9\u0644\u06CC\u0641 \u06A9\u0627 \u0642\u062F\u0631\u062A\u06CC \u0639\u0644\u0627\u062C\u06D4"],
    iconName: "Bone",
    image: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "dis-3",
    nameUrdu: "\u06AF\u06BE\u0679\u0646\u0648\u06BA \u06A9\u0627 \u062F\u0631\u062F",
    nameEnglish: "Knee Pain",
    category: "pain",
    categoryUrdu: "\u062F\u0631\u062F \u0627\u0648\u0631 \u0645\u06C1\u0631\u06D2",
    symptomsUrdu: ["\u06AF\u06BE\u0679\u0646\u06D2 \u0645\u0648\u0691\u0646\u06D2 \u0645\u06CC\u06BA \u0634\u062F\u06CC\u062F \u062F\u0631\u062F", "\u0633\u06CC\u062F\u0691\u06CC\u0627\u06BA \u0686\u0691\u06BE\u0646\u06D2 \u0627\u062A\u0631\u0646\u06D2 \u0645\u06CC\u06BA \u062F\u0634\u0648\u0627\u0631\u06CC", "\u06AF\u06BE\u0679\u0646\u0648\u06BA \u06A9\u06CC \u0633\u0648\u062C\u0646", "\u06A9\u06BE\u0691\u06D2 \u06C1\u0648\u0646\u06D2 \u0645\u06CC\u06BA \u0628\u06D2 \u0686\u06CC\u0646\u06CC"],
    causesUrdu: ["\u06AF\u06BE\u0679\u0646\u06D2 \u06A9\u06D2 \u06A9\u0627\u0631\u0679\u06CC\u0644\u06CC\u062C \u06A9\u0627 \u06AF\u06BE\u0633 \u062C\u0627\u0646\u0627", "\u0648\u0632\u0646 \u06A9\u06CC \u0632\u06CC\u0627\u062F\u062A\u06CC", "\u06A9\u06CC\u0644\u0634\u06CC\u0645 \u06A9\u06CC \u0634\u062F\u06CC\u062F \u06A9\u0645\u06CC", "\u06AF\u06BE\u0679\u0646\u06D2 \u067E\u0631 \u062F\u0628\u0627\u0624"],
    treatmentUrdu: ["\u062E\u0627\u0635 \u06AF\u06BE\u0679\u0646\u0627 \u0628\u062D\u0627\u0644\u06CC \u0641\u0632\u06CC\u0648\u062A\u06BE\u0631\u0627\u067E\u06CC", "\u0644\u06CC\u0632\u0631 \u062A\u06BE\u0631\u0627\u067E\u06CC", "\u062D\u0627\u0641\u0638 \u0646\u06CC \u0631\u06CC\u0644\u06CC\u0648 \u06A9\u0631\u06CC\u0645", "\u063A\u0630\u0627\u0626\u06CC \u0631\u06C1\u0646\u0645\u0627 \u0686\u0627\u0631\u0679"],
    shortDescUrdu: ["\u06AF\u06BE\u0679\u0646\u0648\u06BA \u06A9\u06CC \u0633\u0648\u062C\u0646\u060C \u06AF\u06BE\u0633\u0646\u06D2 \u0627\u0648\u0631 \u0686\u0644\u0646\u06D2 \u0645\u06CC\u06BA \u062F\u0634\u0648\u0627\u0631\u06CC \u06A9\u0627 \u062C\u062F\u06CC\u062F \u0639\u0644\u0627\u062C\u06D4"],
    iconName: "Crosshair",
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "dis-4",
    nameUrdu: "\u06A9\u0645\u0631 \u062F\u0631\u062F \u0648 \u0645\u06C1\u0631\u06D2",
    nameEnglish: "Back Pain & Disc Problem",
    category: "pain",
    categoryUrdu: "\u062F\u0631\u062F \u0627\u0648\u0631 \u0645\u06C1\u0631\u06D2",
    symptomsUrdu: ["\u06A9\u0645\u0631 \u06A9\u06D2 \u0646\u06CC\u0686\u06D2 \u062D\u0635\u06D2 \u0645\u06CC\u06BA \u0634\u062F\u06CC\u062F \u062F\u0631\u062F", "\u062C\u06BE\u06A9\u0646\u06D2 \u0633\u06D2 \u062F\u0631\u062F \u06A9\u0627 \u0628\u0691\u06BE\u0646\u0627", "\u062F\u0631\u062F \u06A9\u0627 \u0679\u0627\u0646\u06AF \u0645\u06CC\u06BA \u0645\u0646\u062A\u0642\u0644 \u06C1\u0648\u0646\u0627", "\u0644\u06CC\u0679\u0646\u06D2 \u0645\u06CC\u06BA \u0628\u06BE\u06CC \u0628\u06D2 \u0686\u06CC\u0646\u06CC"],
    causesUrdu: ["\u0688\u0633\u06A9 \u06A9\u0627 \u0627\u067E\u0646\u06CC \u062C\u06AF\u06C1 \u0633\u06D2 \u0633\u0631\u06A9 \u062C\u0627\u0646\u0627 (Slipped Disc)", "\u0648\u0632\u0646 \u0627\u0679\u06BE\u0627\u0646\u06D2 \u0633\u06D2 \u0686\u0648\u0679", "\u063A\u0644\u0637 \u0628\u06CC\u0679\u06BE\u0646\u06D2 \u06A9\u0627 \u0627\u0646\u062F\u0627\u0632", "\u067E\u0679\u06BE\u0648\u06BA \u06A9\u0627 \u06A9\u06BE\u0646\u0686\u0627\u0624"],
    treatmentUrdu: ["\u06A9\u0645\u067E\u06CC\u0648\u0679\u0631 \u0633\u067E\u0627\u0626\u0646 \u0686\u06CC\u06A9 \u0627\u067E", "\u0627\u0644\u0679\u0631\u0627\u0633\u0648\u0646\u06A9 \u0648 \u0627\u0644\u06CC\u06A9\u0679\u0631\u06A9 \u062A\u06BE\u0631\u0627\u067E\u06CC", "\u062E\u0627\u0635 \u06C1\u0631\u0628\u0644 \u0628\u06CC\u06A9 \u06A9\u06CC\u0626\u0631 \u0645\u0633\u0627\u062C", "\u0645\u06C1\u0631\u0648\u06BA \u06A9\u06CC \u0633\u06CC\u062F\u06BE \u0641\u0632\u06CC\u0648"],
    shortDescUrdu: ["\u06A9\u0645\u0631 \u062F\u0631\u062F \u0627\u0648\u0631 \u0688\u0633\u06A9 \u06A9\u06D2 \u0645\u0633\u0627\u0626\u0644 \u06A9\u0627 \u0628\u063A\u06CC\u0631 \u0622\u067E\u0631\u06CC\u0634\u0646 \u062C\u062F\u06CC\u062F \u0639\u0644\u0627\u062C\u06D4"],
    iconName: "ShieldAlert",
    image: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "dis-5",
    nameUrdu: "\u06AF\u0631\u062F\u0646 \u062F\u0631\u062F (Cervical)",
    nameEnglish: "Neck Pain (Cervical Spondylosis)",
    category: "pain",
    categoryUrdu: "\u062F\u0631\u062F \u0627\u0648\u0631 \u0645\u06C1\u0631\u06D2",
    symptomsUrdu: ["\u06AF\u0631\u062F\u0646 \u06AF\u06BE\u0645\u0627\u0646\u06D2 \u0645\u06CC\u06BA \u0634\u062F\u06CC\u062F \u062F\u0631\u062F", "\u062F\u0631\u062F \u06A9\u0627 \u06A9\u0646\u062F\u06BE\u06D2 \u0627\u0648\u0631 \u06C1\u0627\u062A\u06BE\u0648\u06BA \u062A\u06A9 \u062C\u0627\u0646\u0627", "\u0633\u0631 \u06A9\u06D2 \u067E\u0686\u06BE\u0644\u06D2 \u062D\u0635\u06D2 \u0645\u06CC\u06BA \u062F\u0631\u062F", "\u06C1\u0627\u062A\u06BE\u0648\u06BA \u0645\u06CC\u06BA \u0633\u0646 \u067E\u0646"],
    causesUrdu: ["\u0645\u0648\u0628\u0627\u0626\u0644 \u0648 \u06A9\u0645\u067E\u06CC\u0648\u0679\u0631 \u06A9\u0627 \u0632\u06CC\u0627\u062F\u06C1 \u0627\u0633\u062A\u0639\u0645\u0627\u0644", "\u06AF\u0631\u062F\u0646 \u06A9\u06D2 \u0645\u06C1\u0631\u0648\u06BA \u06A9\u06CC \u06AF\u06BE\u0633\u0627\u0626\u06CC", "\u062A\u06A9\u06CC\u06C1 \u0627\u0648\u0646\u0686\u0627 \u0644\u06CC\u0646\u0627", "\u0627\u0639\u0635\u0627\u0628 \u067E\u0631 \u062F\u0628\u0627\u0624"],
    treatmentUrdu: ["\u0633\u0631\u0648\u0627\u0626\u06CC\u06A9\u0644 \u0633\u0679\u0631\u0686\u0646\u06AF \u0641\u0632\u06CC\u0648\u062A\u06BE\u0631\u0627\u067E\u06CC", "\u0627\u0633\u0679\u06CC\u0645 \u0645\u0633\u0627\u062C", "\u0645\u062E\u0635\u0648\u0635 \u06C1\u0631\u0628\u0644 \u06A9\u06CC\u067E\u0633\u0648\u0644", "\u067E\u0648\u0633\u0686\u0631 \u06A9\u0631\u06CC\u06A9\u0634\u0646 \u0631\u0647\u0646\u0645\u0627\u0626\u06CC"],
    shortDescUrdu: ["\u06AF\u0631\u062F\u0646 \u06A9\u06CC \u0627\u06A9\u0691\u0646\u060C \u0645\u06C1\u0631\u0648\u06BA \u06A9\u06D2 \u062F\u0631\u062F \u0627\u0648\u0631 \u0633\u0631 \u062F\u0631\u062F \u06A9\u0627 \u0639\u0644\u0627\u062C\u06D4"],
    iconName: "Zap",
    image: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "dis-6",
    nameUrdu: "\u06A9\u0646\u062F\u06BE\u06D2 \u06A9\u0627 \u062F\u0631\u062F (Frozen Shoulder)",
    nameEnglish: "Shoulder Pain & Frozen Shoulder",
    category: "pain",
    categoryUrdu: "\u062F\u0631\u062F \u0627\u0648\u0631 \u0645\u06C1\u0631\u06D2",
    symptomsUrdu: ["\u06A9\u0646\u062F\u06BE\u0627 \u062C\u0627\u0645 \u06C1\u0648 \u062C\u0627\u0646\u0627", "\u06C1\u0627\u062A\u06BE \u0627\u0648\u067E\u0631 \u0627\u0679\u06BE\u0627\u0646\u06D2 \u0645\u06CC\u06BA \u0634\u062F\u06CC\u062F \u062A\u06A9\u0644\u06CC\u0641", "\u0631\u0627\u062A \u06A9\u0648 \u06A9\u0646\u062F\u06BE\u06D2 \u067E\u0631 \u0633\u0648\u0646\u06D2 \u0633\u06D2 \u062F\u0631\u062F", "\u06A9\u067E\u0691\u06D2 \u0628\u062F\u0644\u0646\u06D2 \u0645\u06CC\u06BA \u062F\u0634\u0648\u0627\u0631\u06CC"],
    causesUrdu: ["\u0634\u0648\u06AF\u0631 \u06A9\u06CC \u0628\u06CC\u0645\u0627\u0631\u06CC", "\u06A9\u0646\u062F\u06BE\u06D2 \u06A9\u06D2 \u06A9\u06CC\u067E\u0633\u0648\u0644 \u06A9\u0627 \u0633\u062E\u062A \u06C1\u0648\u0646\u0627", "\u0633\u0627\u06A9\u0679 \u06A9\u06CC \u0633\u0648\u0632\u0634", "\u0686\u0648\u0679 \u06CC\u0627 \u06A9\u06BE\u0646\u0686\u0627\u0624"],
    treatmentUrdu: ["\u0634\u0648\u0644\u0688\u0631 \u0645\u0648\u0628\u0644\u0627\u0626\u0632\u06CC\u0634\u0646 \u0641\u0632\u06CC\u0648\u062A\u06BE\u0631\u0627\u067E\u06CC", "\u0644\u06CC\u0632\u0631 \u062A\u06BE\u0631\u0627\u067E\u06CC", "\u062E\u0627\u0635 \u06AF\u0631\u0645 \u06C1\u0631\u0628\u0644 \u06A9\u0645\u067E\u0631\u06CC\u0633", "\u062F\u0631\u062F \u06A9\u0634 \u06C1\u0631\u0628\u0644 \u0627\u062F\u0648\u06CC\u0627\u062A"],
    shortDescUrdu: ["\u062C\u0627\u0645 \u06A9\u0646\u062F\u06BE\u06D2 \u06A9\u0648 \u06A9\u06BE\u0648\u0644\u0646\u06D2 \u0627\u0648\u0631 \u062F\u0631\u062F \u062E\u062A\u0645 \u06A9\u0631\u0646\u06D2 \u06A9\u06CC \u062C\u062F\u06CC\u062F \u062A\u06BE\u0631\u0627\u067E\u06CC\u06D4"],
    iconName: "Maximize2",
    image: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "dis-7",
    nameUrdu: "\u06C1\u0627\u062A\u06BE\u0648\u06BA \u0627\u0648\u0631 \u0679\u0627\u0646\u06AF\u0648\u06BA \u06A9\u0627 \u062F\u0631\u062F",
    nameEnglish: "Hand & Leg Pain",
    category: "pain",
    categoryUrdu: "\u062F\u0631\u062F \u0627\u0648\u0631 \u0645\u06C1\u0631\u06D2",
    symptomsUrdu: ["\u0679\u0627\u0646\u06AF\u0648\u06BA \u0645\u06CC\u06BA \u0628\u06D2 \u0686\u06CC\u0646\u06CC \u0627\u0648\u0631 \u0627\u06CC\u0646\u0679\u06BE\u0646", "\u06C1\u0627\u062A\u06BE\u0648\u06BA \u0645\u06CC\u06BA \u062A\u06BE\u06A9\u0646 \u0627\u0648\u0631 \u0633\u0633\u062A\u06CC", "\u0631\u0627\u062A \u06A9\u0648 \u0633\u0648\u062A\u06D2 \u0648\u0642\u062A \u0679\u0627\u0646\u06AF\u0648\u06BA \u06A9\u0627 \u062F\u0631\u062F", "\u0686\u0644\u0646\u06D2 \u0633\u06D2 \u0679\u0627\u0646\u06AF\u0648\u06BA \u06A9\u0627 \u0628\u06BE\u0631 \u062C\u0627\u0646\u0627"],
    causesUrdu: ["\u062E\u0648\u0646 \u06A9\u06CC \u06AF\u0631\u062F\u0634 \u06A9\u06CC \u06A9\u0645\u06CC", "\u0628\u06CC \u0648\u0679\u0627\u0645\u0646\u0632 \u06A9\u06CC \u06A9\u0645\u06CC", "\u0630\u06CC\u0627\u0628\u06CC\u0637\u0633 \u06A9\u06D2 \u0627\u062B\u0631\u0627\u062A", "\u067E\u0679\u06BE\u0648\u06BA \u06A9\u06CC \u0633\u0648\u0632\u0634"],
    treatmentUrdu: ["\u0628\u0644\u0688 \u0633\u0631\u06A9\u0648\u0644\u06CC\u0634\u0646 \u0645\u0633\u0627\u062C \u062A\u06BE\u0631\u0627\u067E\u06CC", "\u0627\u0639\u0635\u0627\u0628\u06CC \u0645\u0642\u0648\u06CC \u0646\u0633\u062E\u06C1 \u062C\u0627\u062A", "\u0648\u06CC\u062A\u0627\u0645\u0646\u0632 \u0627\u0648\u0631 \u0645\u0646\u0631\u0644\u0632 \u0633\u067E\u0644\u06CC\u0645\u0646\u0679\u0633"],
    shortDescUrdu: ["\u0679\u0627\u0646\u06AF\u0648\u06BA \u06A9\u06CC \u0627\u06CC\u0646\u0679\u06BE\u0646\u060C \u06C1\u0627\u062A\u06BE\u0648\u06BA \u06A9\u06D2 \u062F\u0631\u062F \u0627\u0648\u0631 \u0628\u06D2 \u0686\u06CC\u0646\u06CC \u06A9\u0627 \u0634\u0627\u0641\u06CC \u0639\u0644\u0627\u062C\u06D4"],
    iconName: "Footprints",
    image: "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "dis-8",
    nameUrdu: "\u0627\u06CC\u0691\u06CC \u06A9\u0627 \u062F\u0631\u062F (Plantar Fasciitis)",
    nameEnglish: "Heel Pain",
    category: "pain",
    categoryUrdu: "\u062F\u0631\u062F \u0627\u0648\u0631 \u0645\u06C1\u0631\u06D2",
    symptomsUrdu: ["\u0635\u0628\u062D \u0632\u0645\u06CC\u0646 \u067E\u0631 \u067E\u06C1\u0644\u0627 \u0642\u062F\u0645 \u0631\u06A9\u06BE\u062A\u06D2 \u06C1\u06CC \u0634\u062F\u06CC\u062F \u0686\u0648\u0628\u0646", "\u0627\u06CC\u0691\u06CC \u0645\u06CC\u06BA \u0633\u0648\u0626\u06CC \u0644\u06AF\u0646\u06D2 \u06A9\u0627 \u0627\u062D\u0633\u0627\u0633", "\u0632\u06CC\u0627\u062F\u06C1 \u062F\u06CC\u0631 \u06A9\u06BE\u0691\u06D2 \u0631\u06C1\u0646\u06D2 \u0633\u06D2 \u062F\u0631\u062F"],
    causesUrdu: ["\u0627\u06CC\u0691\u06CC \u06A9\u06CC \u06C1\u0688\u06CC \u06A9\u0627 \u0628\u0691\u06BE\u0646\u0627 (Heel Spur)", "\u0648\u0632\u0646 \u06A9\u0627 \u062F\u0628\u0627\u0624", "\u0633\u062E\u062A \u062C\u0648\u062A\u06D2 \u067E\u06C1\u0646\u0646\u0627", "\u067E\u0627\u0624\u06BA \u06A9\u0627 \u0641\u0644\u06CC\u0679 \u06C1\u0648\u0646\u0627"],
    treatmentUrdu: ["\u0627\u06CC\u0691\u06CC \u06A9\u06CC \u062E\u0635\u0648\u0635\u06CC \u0627\u0644\u0679\u0631\u0627\u0633\u0627\u0624\u0646\u0688 \u062A\u06BE\u0631\u0627\u067E\u06CC", "\u0633\u0627\u0641\u0679 \u0627\u0646\u0633\u0648\u0644 \u0645\u0634\u0648\u0631\u06C1", "\u06C1\u0631\u0628\u0644 \u0627\u06CC\u0646\u0679\u06CC \u0627\u0646\u0641\u0644\u06CC\u0645\u06CC\u0679\u0631\u06CC \u0679\u0631\u06CC\u0679\u0645\u0646\u0679"],
    shortDescUrdu: ["\u0627\u06CC\u0691\u06CC \u06A9\u06CC \u0686\u0648\u0628\u0646 \u0627\u0648\u0631 \u06C1\u0688\u06CC \u0628\u0691\u06BE\u0646\u06D2 \u06A9\u0627 \u062C\u062F\u06CC\u062F \u063A\u06CC\u0631 \u0622\u067E\u0631\u06CC\u0634\u0646 \u0639\u0644\u0627\u062C\u06D4"],
    iconName: "Anchor",
    image: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=800"
  },
  // Neurological category
  {
    id: "dis-9",
    nameUrdu: "\u0627\u0639\u0635\u0627\u0628\u06CC \u06A9\u0645\u0632\u0648\u0631\u06CC",
    nameEnglish: "Nerve Weakness / Neuropathy",
    category: "neurological",
    categoryUrdu: "\u0627\u0639\u0635\u0627\u0628\u06CC \u0627\u0648\u0631 \u0641\u0627\u0644\u062C",
    symptomsUrdu: ["\u062C\u0633\u0645 \u0645\u06CC\u06BA \u062C\u0627\u0646 \u0646\u06C1 \u06C1\u0648\u0646\u0627", "\u06C1\u0627\u062A\u06BE \u067E\u0627\u0624\u06BA \u0645\u06CC\u06BA \u0633\u0648\u0626\u06CC\u0627\u06BA \u0686\u06BE\u0628\u0646\u0627", "\u062D\u0627\u0641\u0638\u06C1 \u06A9\u0645\u0632\u0648\u0631 \u06C1\u0648\u0646\u0627", "\u0646\u06CC\u0646\u062F \u0646\u06C1 \u0622\u0646\u0627 \u0627\u0648\u0631 \u0646\u0631\u0648\u0633 \u067E\u0646"],
    causesUrdu: ["\u0648\u0679\u0627\u0645\u0646 B12 \u06A9\u06CC \u0634\u062F\u06CC\u062F \u06A9\u0645\u06CC", "\u0630\u06CC\u0627\u0628\u06CC\u0637\u0633 (\u0688\u06CC\u0627\u0628\u06CC\u0679\u06A9 \u0646\u06CC\u0648\u0631\u0648\u067E\u062A\u06CC)", "\u0630\u06C1\u0646\u06CC \u062F\u0628\u0627\u0624 \u0627\u0648\u0631 \u0628\u06D2 \u062E\u0648\u0627\u0628\u06CC", "\u0636\u0639\u0641 \u0627\u0639\u0635\u0627\u0628"],
    treatmentUrdu: ["\u0627\u0639\u0635\u0627\u0628\u06CC \u062A\u0642\u0648\u06CC\u062A \u06A9\u0627 \u0634\u0627\u06C1\u06CC \u0646\u0633\u062E\u06C1", "\u06A9\u0645\u067E\u06CC\u0648\u0679\u0631\u0627\u0626\u0632\u0688 \u0646\u0631\u0648 \u0679\u06CC\u0633\u0679\u0646\u06AF", "\u0637\u0628\u06CC \u06C1\u0631\u0628\u0644 \u0679\u0648\u0646\u06A9\u0633", "\u0688\u0627\u0626\u0679 \u067E\u0644\u0627\u0646"],
    shortDescUrdu: ["\u0639\u0635\u0627\u0628 \u06A9\u0648 \u0637\u0627\u0642\u062A \u062F\u06CC\u0646\u06D2 \u0627\u0648\u0631 \u0633\u0633\u062A\u06CC \u0648 \u0633\u0648\u0626\u06CC\u0627\u06BA \u062E\u062A\u0645 \u06A9\u0631\u0646\u06D2 \u06A9\u0627 \u0639\u0644\u0627\u062C\u06D4"],
    iconName: "Cpu",
    image: "https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "dis-10",
    nameUrdu: "\u06C1\u0627\u062A\u06BE \u067E\u0627\u0624\u06BA \u0633\u0646 \u06C1\u0648\u0646\u0627",
    nameEnglish: "Numbness in Hands & Feet",
    category: "neurological",
    categoryUrdu: "\u0627\u0639\u0635\u0627\u0628\u06CC \u0627\u0648\u0631 \u0641\u0627\u0644\u062C",
    symptomsUrdu: ["\u06C1\u0627\u062A\u06BE\u0648\u06BA \u0627\u0648\u0631 \u067E\u0627\u0624\u06BA \u06A9\u06CC \u062D\u0633 \u062E\u062A\u0645 \u06C1\u0648\u0646\u0627", "\u0686\u06CC\u0632\u06CC\u06BA \u06C1\u0627\u062A\u06BE \u0633\u06D2 \u0686\u06BE\u0648\u0679 \u062C\u0627\u0646\u0627", "\u067E\u0627\u0624\u06BA \u06A9\u0627 \u0633\u0646 \u06C1\u0648 \u06A9\u0631 \u0686\u0644\u0646\u06D2 \u0645\u06CC\u06BA \u062A\u0648\u0627\u0632\u0646 \u0646\u06C1 \u0631\u06C1\u0646\u0627"],
    causesUrdu: ["\u0639\u0635\u0628 \u067E\u0631 \u062F\u0628\u0627\u0624 (Nerve Compression)", "\u062E\u0648\u0646 \u06A9\u06CC \u0633\u067E\u0644\u0627\u0626\u06CC \u0645\u06CC\u06BA \u0631\u06A9\u0627\u0648\u0679", "\u0634\u0648\u06AF\u0631 \u06A9\u06D2 \u0627\u062B\u0631\u0627\u062A"],
    treatmentUrdu: ["\u0646\u06CC\u0648\u0631\u0648 \u0648\u06CC\u0633\u06A9\u0648\u0644\u0631 \u0641\u0632\u06CC\u0648\u062A\u06BE\u0631\u0627\u067E\u06CC", "\u062E\u0648\u0646 \u06A9\u06CC \u06AF\u0631\u062F\u0634 \u062A\u06CC\u0632 \u06A9\u0631\u0646\u06D2 \u0648\u0627\u0644\u06CC \u0627\u062F\u0648\u06CC\u0627\u062A", "\u0644\u06CC\u0632\u0631 \u0645\u0633\u0627\u062C"],
    shortDescUrdu: ["\u06C1\u0627\u062A\u06BE \u067E\u0627\u0624\u06BA \u06A9\u06D2 \u0633\u0646 \u067E\u0646 \u0627\u0648\u0631 \u062D\u0633 \u0628\u062D\u0627\u0644 \u06A9\u0631\u0646\u06D2 \u06A9\u0627 \u0628\u06C1\u062A\u0631\u06CC\u0646 \u0637\u0631\u06CC\u0642\u06C1\u06D4"],
    iconName: "HandMetal",
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "dis-11",
    nameUrdu: "\u0631\u0639\u0634\u06C1 (Parkinson's / Tremors)",
    nameEnglish: "Tremors / Parkinsonism",
    category: "neurological",
    categoryUrdu: "\u0627\u0639\u0635\u0627\u0628\u06CC \u0627\u0648\u0631 \u0641\u0627\u0644\u062C",
    symptomsUrdu: ["\u06C1\u0627\u062A\u06BE\u0648\u06BA \u06A9\u0627 \u0645\u0633\u0644\u0633\u0644 \u06A9\u0627\u0646\u067E\u0646\u0627", "\u0686\u0627\u0626\u06D2 \u06A9\u0627 \u06A9\u067E \u06CC\u0627 \u0642\u0644\u0645 \u0646\u06C1 \u067E\u06A9\u0691\u0627 \u062C\u0627\u0646\u0627", "\u062C\u0633\u0645 \u0645\u06CC\u06BA \u0633\u062E\u062A \u067E\u0646", "\u0622\u0648\u0627\u0632 \u0645\u06CC\u06BA \u0644\u0631\u0632\u0634"],
    causesUrdu: ["\u062F\u0645\u0627\u063A\u06CC \u0627\u0639\u0635\u0627\u0628 \u06A9\u06D2 \u06A9\u06CC\u0645\u06CC\u06A9\u0644\u0632 \u0645\u06CC\u06BA \u06A9\u0645\u06CC", "\u0628\u0691\u06BE\u0627\u067E\u0627", "\u0627\u0639\u0635\u0627\u0628\u06CC \u0646\u0638\u0627\u0645 \u06A9\u0627 \u062E\u0644\u06CC\u0644"],
    treatmentUrdu: ["\u062F\u0645\u0627\u063A\u06CC \u0648 \u0627\u0639\u0635\u0627\u0628\u06CC \u0645\u0642\u0648\u06CC \u06C1\u0631\u0628\u0644 \u0679\u0631\u06CC\u0679\u0645\u0646\u0679", "\u0627\u0639\u0635\u0627\u0628\u06CC \u062A\u0648\u0627\u0632\u0646 \u0641\u0632\u06CC\u0648\u062A\u06BE\u0631\u0627\u067E\u06CC", "\u062E\u0627\u0635 \u062C\u0691\u06CC \u0628\u0648\u0679\u06CC\u0648\u06BA \u06A9\u0627 \u0645\u062C\u0645\u0648\u0639\u06C1"],
    shortDescUrdu: ["\u06C1\u0627\u062A\u06BE\u0648\u06BA \u06A9\u06D2 \u06A9\u0627\u0646\u067E\u0646\u06D2 \u0627\u0648\u0631 \u0631\u0639\u0634\u06C1 \u06A9\u0648 \u06A9\u0646\u0679\u0631\u0648\u0644 \u06A9\u0631\u0646\u06D2 \u06A9\u0627 \u062A\u062C\u0631\u0628\u06C1 \u0634\u062F\u06C1 \u0639\u0644\u0627\u062C\u06D4"],
    iconName: "Activity",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "dis-12",
    nameUrdu: "\u0641\u0627\u0644\u062C (Paralysis / Stroke Rehab)",
    nameEnglish: "Paralysis & Stroke",
    category: "neurological",
    categoryUrdu: "\u0627\u0639\u0635\u0627\u0628\u06CC \u0627\u0648\u0631 \u0641\u0627\u0644\u062C",
    symptomsUrdu: ["\u062C\u0633\u0645 \u06A9\u06D2 \u0627\u06CC\u06A9 \u0637\u0631\u0641 \u06A9\u06CC \u062D\u0631\u06A9\u062A \u062E\u062A\u0645 \u06C1\u0648\u0646\u0627", "\u0628\u0648\u0644\u0646\u06D2 \u0645\u06CC\u06BA \u062F\u0634\u0648\u0627\u0631\u06CC", "\u06C1\u0627\u062A\u06BE \u067E\u0627\u0624\u06BA \u06A9\u0627 \u0628\u06D2 \u062C\u0627\u0646 \u06C1\u0648\u0646\u0627", "\u062A\u0648\u0627\u0632\u0646 \u0642\u0627\u0626\u0645 \u0646\u06C1 \u0631\u06C1\u0646\u0627"],
    causesUrdu: ["\u062F\u0645\u0627\u063A \u06A9\u06CC \u0631\u06AF \u0645\u06CC\u06BA \u062E\u0648\u0646 \u06A9\u0627 \u0644\u0648\u062A\u06BE\u0691\u0627 \u06CC\u0627 \u067E\u06BE\u0679\u0646\u0627", "\u0628\u0644\u0688 \u067E\u0631\u06CC\u0634\u0631 \u06A9\u06CC \u0632\u06CC\u0627\u062F\u06C1 \u0645\u0642\u062F\u0627\u0631", "\u0630\u06CC\u0627\u0628\u06CC\u0637\u0633"],
    treatmentUrdu: ["\u062C\u0627\u0645\u0639 \u0641\u0627\u0644\u062C \u0631\u06CC \u06C1\u06CC\u0628\u0644\u06CC\u0679\u06CC\u0634\u0646 \u0633\u06CC\u0646\u0679\u0631", "\u0627\u0644\u06CC\u06A9\u0679\u0631\u06A9 \u0645\u0633\u0644 \u0633\u0679\u06CC\u0648\u0644\u06CC\u0634\u0646", "\u062E\u0627\u0635 \u0641\u0627\u0644\u062C \u0628\u062D\u0627\u0644\u06CC \u0645\u0633\u0627\u062C \u0648 \u0641\u0632\u06CC\u0648", "\u0627\u0639\u0635\u0627\u0628\u06CC \u062A\u0646\u062F\u0631\u0633\u062A\u06CC"],
    shortDescUrdu: ["\u0641\u0627\u0644\u062C \u06A9\u06D2 \u0645\u0631\u06CC\u0636\u0648\u06BA \u06A9\u0648 \u062F\u0648\u0628\u0627\u0631\u06C1 \u067E\u0627\u0624\u06BA \u067E\u0631 \u06A9\u06BE\u0691\u0627 \u06A9\u0631\u0646\u06D2 \u06A9\u06CC \u062C\u062F\u06CC\u062F \u0628\u062D\u0627\u0644\u06CC\u06D4"],
    iconName: "UserX",
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "dis-13",
    nameUrdu: "\u0644\u0642\u0648\u06C1 (Facial Paralysis / Bell's Palsy)",
    nameEnglish: "Facial Paralysis (Bell's Palsy)",
    category: "neurological",
    categoryUrdu: "\u0627\u0639\u0635\u0627\u0628\u06CC \u0627\u0648\u0631 \u0641\u0627\u0644\u062C",
    symptomsUrdu: ["\u0645\u0646\u06C1 \u06A9\u0627 \u0627\u06CC\u06A9 \u0637\u0631\u0641 \u0679\u06CC\u0691\u06BE\u0627 \u06C1\u0648 \u062C\u0627\u0646\u0627", "\u0627\u06CC\u06A9 \u0622\u0646\u06A9\u06BE \u06A9\u0627 \u0628\u0646\u062F \u0646\u06C1 \u06C1\u0648\u0646\u0627", "\u067E\u0627\u0646\u06CC \u067E\u06CC\u062A\u06D2 \u0648\u0642\u062A \u0645\u0646\u06C1 \u0633\u06D2 \u0646\u06A9\u0644\u0646\u0627", "\u0631\u062E\u0633\u0627\u0631 \u06A9\u0627 \u0628\u06D2 \u062D\u0633 \u06C1\u0648\u0646\u0627"],
    causesUrdu: ["\u0686\u06C1\u0631\u06D2 \u06A9\u06CC \u0631\u06AF \u06A9\u06CC \u0633\u0648\u0632\u0634 (7th Cranial Nerve)", "\u0633\u0631\u062F \u06C1\u0648\u0627 \u06A9\u0627 \u0644\u06AF\u0646\u0627", "\u0648\u0627\u0626\u0631\u0644 \u0627\u0646\u0641\u06CC\u06A9\u0634\u0646"],
    treatmentUrdu: ["\u0641\u06CC\u0634\u0644 \u0646\u0631\u0648\u0627 \u0641\u0632\u06CC\u0648\u062A\u06BE\u0631\u0627\u067E\u06CC", "\u0627\u0633\u0679\u06CC\u0645 \u0627\u06CC\u0646\u0688 \u0627\u0644\u06CC\u06A9\u0679\u0631\u06A9 \u062A\u06BE\u0631\u0627\u067E\u06CC", "\u06C1\u0631\u0628\u0644 \u0627\u06CC\u0646\u0679\u06CC \u0633\u0648\u062C\u0646 \u0639\u0644\u0627\u062C", "\u0686\u06C1\u0631\u06D2 \u06A9\u06CC \u0648\u0631\u0632\u0634\u06CC\u06BA"],
    shortDescUrdu: ["\u0645\u0646\u06C1 \u06A9\u0627 \u0679\u06CC\u0691\u06BE\u0627 \u067E\u0646 \u0627\u0648\u0631 \u0686\u06C1\u0631\u06D2 \u06A9\u0627 \u0644\u0642\u0648\u06C1 \u0679\u06BE\u06CC\u06A9 \u06A9\u0631\u0646\u06D2 \u06A9\u06CC \u06AF\u0627\u0631\u0646\u0679\u06CC \u0634\u062F\u06C1 \u062A\u06BE\u0631\u0627\u067E\u06CC\u06D4"],
    iconName: "Smile",
    image: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=800"
  },
  // Kidney & Urinary Category
  {
    id: "dis-14",
    nameUrdu: "\u06AF\u0631\u062F\u06D2 \u06A9\u06CC \u067E\u062A\u06BE\u0631\u06CC",
    nameEnglish: "Kidney Stones",
    category: "kidney",
    categoryUrdu: "\u06AF\u0631\u062F\u06C1 \u0648 \u067E\u06CC\u0634\u0627\u0628",
    symptomsUrdu: ["\u06A9\u0645\u0631 \u06A9\u06CC \u0633\u0627\u0626\u06CC\u0688 \u0645\u06CC\u06BA \u0634\u062F\u06CC\u062F \u0644\u06C1\u0631 \u0648\u0627\u0644\u0627 \u062F\u0631\u062F", "\u067E\u06CC\u0634\u0627\u0628 \u0645\u06CC\u06BA \u062E\u0648\u0646 \u06CC\u0627 \u067E\u06CC\u067E \u0622\u0646\u0627", "\u0645\u062A\u0644\u06CC \u0627\u0648\u0631 \u0627\u0644\u0679\u06CC \u06C1\u0648\u0646\u0627", "\u067E\u06CC\u0634\u0627\u0628 \u0645\u06CC\u06BA \u0631\u06A9\u0627\u0648\u0679"],
    causesUrdu: ["\u067E\u0627\u0646\u06CC \u06A9\u0645 \u067E\u06CC\u0646\u0627", "\u06A9\u06CC\u0644\u0634\u06CC\u0645 \u06CC\u0627 \u0622\u06A9\u0633\u06CC\u0644\u06CC\u0679 \u06A9\u0627 \u0632\u06CC\u0627\u062F\u06C1 \u06C1\u0648\u0646\u0627", "\u06CC\u0648\u0631\u06A9 \u0627\u06CC\u0633\u0688 \u06A9\u0631\u0633\u0679\u0644\u0632", "\u0645\u0648\u0631\u0648\u062B\u06CC \u0631\u062C\u062D\u0627\u0646"],
    treatmentUrdu: ["\u0628\u063A\u06CC\u0631 \u0622\u067E\u0631\u06CC\u0634\u0646 \u06C1\u0631\u0628\u0644 \u0633\u0679\u0648\u0646 \u0631\u06CC\u0645\u0648\u0648\u0631", "\u06AF\u0631\u062F\u06C1 \u0635\u0641\u0627\u0626\u06CC \u06A9\u0679", "\u0642\u062F\u0631\u062A\u06CC \u067E\u062A\u06BE\u0631\u06CC \u0631\u06CC\u0632\u06C1 \u0631\u06CC\u0632\u06C1 \u06A9\u0631\u0646\u06D2 \u0648\u0627\u0644\u06CC \u0627\u062F\u0648\u06CC\u0627\u062A"],
    shortDescUrdu: ["\u06AF\u0631\u062F\u06D2 \u0627\u0648\u0631 \u0645\u062B\u0627\u0646\u06D2 \u06A9\u06CC \u067E\u062A\u06BE\u0631\u06CC \u06A9\u0648 \u0628\u063A\u06CC\u0631 \u0622\u067E\u0631\u06CC\u0634\u0646 \u0646\u06A9\u0627\u0644\u0646\u06D2 \u06A9\u0627 \u0639\u0644\u0627\u062C\u06D4"],
    iconName: "Droplet",
    image: "https://images.unsplash.com/photo-1530497610245-94d3c16cda28?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "dis-15",
    nameUrdu: "\u06AF\u0631\u062F\u06D2 \u06A9\u06CC \u0633\u0648\u0632\u0634 \u0648 \u0627\u0646\u0641\u06CC\u06A9\u0634\u0646",
    nameEnglish: "Kidney Infection & Nephritis",
    category: "kidney",
    categoryUrdu: "\u06AF\u0631\u062F\u06C1 \u0648 \u067E\u06CC\u0634\u0627\u0628",
    symptomsUrdu: ["\u067E\u0627\u0624\u06BA \u0627\u0648\u0631 \u0686\u06C1\u0631\u06D2 \u067E\u0631 \u0633\u0648\u062C\u0646", "\u06A9\u0645\u0631 \u0645\u06CC\u06BA \u0645\u0633\u0644\u0633\u0644 \u062F\u0628\u0627\u0624", "\u067E\u06CC\u0634\u0627\u0628 \u06A9\u06CC \u0645\u0642\u062F\u0627\u0631 \u06A9\u0645 \u06CC\u0627 \u0632\u06CC\u0627\u062F\u06C1 \u06C1\u0648\u0646\u0627", "\u0628\u062E\u0627\u0631 \u0627\u0648\u0631 \u06A9\u067E\u06A9\u067E\u06CC"],
    causesUrdu: ["\u06AF\u0631\u062F\u0648\u06BA \u06A9\u0627 \u0627\u0646\u0641\u06CC\u06A9\u0634\u0646", "\u0630\u06CC\u0627\u0628\u06CC\u0637\u0633 \u0627\u0648\u0631 \u06C1\u0627\u0626\u06CC \u0628\u0644\u0688 \u067E\u0631\u06CC\u0634\u0631", "\u0679\u0627\u06A9\u0633\u0646\u0632 \u06A9\u0627 \u062C\u0645\u0639 \u06C1\u0648\u0646\u0627"],
    treatmentUrdu: ["\u06AF\u0631\u062F\u06C1 \u06A9\u06CC\u0626\u0631 \u06C1\u0631\u0628\u0644 \u0641\u06CC\u0644\u0679\u0631\u06CC\u0634\u0646 \u0646\u064F\u0633\u062E\u06C1", "\u0627\u06CC\u0646\u0679\u06CC \u0627\u0646\u0641\u0644\u06CC\u0645\u06CC\u0679\u0631\u06CC \u0679\u0631\u06CC\u0679\u0645\u0646\u0679", "\u06A9\u0645\u067E\u06CC\u0648\u0679\u0631\u0627\u0626\u0632\u0688 \u06A9\u0688\u0646\u06CC \u0679\u06CC\u0633\u0679"],
    shortDescUrdu: ["\u06AF\u0631\u062F\u06D2 \u06A9\u06CC \u0648\u0631\u0645\u060C \u0633\u0648\u062C\u0646 \u0627\u0648\u0631 \u06A9\u0627\u0631\u06A9\u0631\u062F\u06AF\u06CC \u0628\u062D\u0627\u0644 \u06A9\u0631\u0646\u06D2 \u06A9\u0627 \u0639\u0644\u0627\u062C\u06D4"],
    iconName: "Shield",
    image: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "dis-16",
    nameUrdu: "\u067E\u06CC\u0634\u0627\u0628 \u06A9\u06CC \u062C\u0644\u0646 \u0648 \u0628\u0627\u0631 \u0628\u0627\u0631 \u067E\u06CC\u0634\u0627\u0628",
    nameEnglish: "Urinary Tract Burning & Frequency",
    category: "kidney",
    categoryUrdu: "\u06AF\u0631\u062F\u06C1 \u0648 \u067E\u06CC\u0634\u0627\u0628",
    symptomsUrdu: ["\u067E\u06CC\u0634\u0627\u0628 \u06A9\u0631\u062A\u06D2 \u0648\u0642\u062A \u0634\u062F\u06CC\u062F \u062C\u0644\u0646 \u0627\u0648\u0631 \u062F\u0631\u062F", "\u0628\u0627\u0631 \u0628\u0627\u0631 \u0645\u062B\u0627\u0646\u06C1 \u0628\u06BE\u0631\u0646\u06D2 \u06A9\u0627 \u0627\u062D\u0633\u0627\u0633", "\u0631\u0627\u062A \u06A9\u0648 \u0628\u0627\u0631 \u0628\u0627\u0631 \u0627\u0679\u06BE\u0646\u0627", "\u0642\u0637\u0631\u06C1 \u0642\u0637\u0631\u06C1 \u067E\u06CC\u0634\u0627\u0628"],
    causesUrdu: ["\u06CC\u0648 \u0679\u06CC \u0622\u0626\u06CC \u0627\u0646\u0641\u06CC\u06A9\u0634\u0646 (UTI)", "\u0645\u062B\u0627\u0646\u06D2 \u06A9\u06CC \u06AF\u0631\u0645\u06CC", "\u067E\u0631\u0648\u0633\u0679\u06CC\u0679 \u063A\u062F\u0648\u062F \u06A9\u0627 \u0628\u0691\u06BE\u0646\u0627 (Prostate Enlargement)"],
    treatmentUrdu: ["\u0645\u062B\u0627\u0646\u06C1 \u0645\u0628\u0631\u062F \u0648 \u0635\u0641\u0627\u0626\u06CC \u0634\u0631\u0628\u062A", "\u06C1\u0631\u0628\u0644 \u0627\u06CC\u0646\u0679\u06CC \u0628\u06CC\u0648\u0679\u06A9 \u06A9\u0679", "\u067E\u0631\u0648\u0633\u0679\u06CC\u0679 \u06A9\u06CC\u0626\u0631 \u0641\u0627\u0631\u0645\u0648\u0644\u06C1"],
    shortDescUrdu: ["\u067E\u06CC\u0634\u0627\u0628 \u06A9\u06CC \u062C\u0644\u0646\u060C \u0631\u06A9\u0627\u0648\u0679 \u0627\u0648\u0631 \u0645\u062B\u0627\u0646\u06D2 \u06A9\u06CC \u06AF\u0631\u0645\u06CC \u06A9\u0627 \u06C1\u0631\u0628\u0644 \u0634\u0641\u0627\u06D4"],
    iconName: "Flame",
    image: "https://images.unsplash.com/photo-1505576399279-565b52d4ac71?auto=format&fit=crop&q=80&w=800"
  },
  // Stomach Category
  {
    id: "dis-17",
    nameUrdu: "\u0645\u0639\u062F\u06C1\u060C \u06AF\u06CC\u0633 \u0627\u0648\u0631 \u062A\u06CC\u0632\u0627\u0628\u06CC\u062A",
    nameEnglish: "Stomach Gas, Acidity & GERD",
    category: "stomach",
    categoryUrdu: "\u0645\u0639\u062F\u06C1 \u0648 \u0646\u0638\u0627\u0645 \u0627\u0646\u06C1\u0636\u0627\u0645",
    symptomsUrdu: ["\u0633\u06CC\u0646\u06D2 \u0645\u06CC\u06BA \u0634\u062F\u06CC\u062F \u062C\u0644\u0646", "\u067E\u06CC\u0679 \u06A9\u0627 \u067E\u06BE\u0648\u0644\u0646\u0627 \u0627\u0648\u0631 \u06AF\u06CC\u0633", "\u06A9\u06BE\u0679\u06CC \u0688\u06A9\u0627\u0631\u06CC\u06BA \u0622\u0646\u0627", "\u06A9\u06BE\u0627\u0646\u0627 \u06A9\u06BE\u0627\u0646\u06D2 \u06A9\u06D2 \u0628\u0639\u062F \u067E\u06CC\u0679 \u0645\u06CC\u06BA \u0628\u06BE\u0627\u0631\u06CC \u067E\u0646"],
    causesUrdu: ["\u0645\u0631\u0686 \u0645\u0633\u0627\u0644\u06D2 \u0648\u0627\u0644\u06D2 \u06A9\u06BE\u0627\u0646\u0648\u06BA \u06A9\u0627 \u0627\u0633\u062A\u0639\u0645\u0627\u0644", "\u0645\u0639\u062F\u06D2 \u0645\u06CC\u06BA \u062A\u06CC\u0632\u0627\u0628 \u06A9\u06CC \u0632\u06CC\u0627\u062F\u06C1 \u0645\u0642\u062F\u0627\u0631", "\u0627\u06CC\u0686 \u067E\u06CC\u0644\u0648\u0631\u06CC \u0627\u0646\u0641\u06CC\u06A9\u0634\u0646 (H. Pylori)", "\u0633\u06AF\u0631\u06CC\u0679 \u0646\u0648\u0634\u06CC"],
    treatmentUrdu: ["\u062D\u0627\u0641\u0638 \u0645\u0639\u062F\u06C1 \u0634\u0641\u0627 \u0633\u0641\u0648\u0641", "\u0627\u06CC\u0686 \u067E\u06CC\u0644\u0648\u0631\u06CC \u06C1\u0631\u0628\u0644 \u06A9\u0648\u0631\u0633", "\u0645\u0639\u062F\u06D2 \u06A9\u06D2 \u0627\u0644\u0633\u0631 \u06A9\u0627 \u0639\u0644\u0627\u062C", "\u0688\u06CC\u0679\u0648\u06A9\u0633 \u0688\u0631\u0646\u06A9"],
    shortDescUrdu: ["\u0633\u06CC\u0646\u06D2 \u06A9\u06CC \u062C\u0644\u0646\u060C \u0628\u062F\u06C1\u0636\u0645\u06CC \u0627\u0648\u0631 \u06AF\u06CC\u0633 \u06A9\u0627 \u062F\u0627\u0626\u0645\u06CC \u062E\u0627\u062A\u0645\u06C1\u06D4"],
    iconName: "CircleAlert",
    image: "https://images.unsplash.com/photo-1505576399279-565b52d4ac71?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "dis-18",
    nameUrdu: "\u062F\u0627\u0626\u0645\u06CC \u0642\u0628\u0636 \u0648 \u0628\u062F\u06C1\u0636\u0645\u06CC",
    nameEnglish: "Chronic Constipation & Indigestion",
    category: "stomach",
    categoryUrdu: "\u0645\u0639\u062F\u06C1 \u0648 \u0646\u0638\u0627\u0645 \u0627\u0646\u06C1\u0636\u0627\u0645",
    symptomsUrdu: ["\u06A9\u0626\u06CC \u06A9\u0626\u06CC \u062F\u0646 \u0627\u062C\u0627\u0628\u062A \u0646\u06C1 \u06C1\u0648\u0646\u0627", "\u067E\u06CC\u0679 \u0645\u06CC\u06BA \u0633\u062E\u062A \u062F\u0631\u062F", "\u0633\u0631 \u06A9\u0627 \u0628\u06BE\u0627\u0631\u06CC \u0631\u06C1\u0646\u0627", "\u0631\u0646\u06AF\u062A \u06A9\u0627 \u067E\u06CC\u0644\u0627 \u067E\u0691\u0646\u0627"],
    causesUrdu: ["\u0622\u0646\u062A\u0648\u06BA \u06A9\u06CC \u0633\u0633\u062A\u06CC (Lazy Bowel)", "\u0641\u0627\u0626\u0628\u0631 \u06A9\u06CC \u06A9\u0645\u06CC", "\u067E\u0627\u0646\u06CC \u06A9\u0627 \u06A9\u0645 \u0627\u0633\u062A\u0639\u0645\u0627\u0644", "\u0628\u06D2 \u0642\u0627\u0639\u062F\u06C1 \u0648\u0642\u062A"],
    treatmentUrdu: ["\u0622\u0646\u062A\u0648\u06BA \u06A9\u06CC \u0635\u0641\u0627\u0626\u06CC \u06A9\u0627 \u0642\u062F\u0631\u062A\u06CC \u0646\u064F\u0633\u062E\u06C1", "\u0645\u0644\u06CC\u0646 \u06C1\u0631\u0628\u0644 \u0633\u06CC\u0631\u067E", "\u0645\u0639\u062F\u06C1 \u0642\u0648\u062A \u06C1\u0627\u0636\u0645\u06C1 \u0679\u0648\u0646\u06A9"],
    shortDescUrdu: ["\u067E\u0631\u0627\u0646\u06CC \u0633\u06D2 \u067E\u0631\u0627\u0646\u06CC \u0642\u0628\u0636 \u0627\u0648\u0631 \u0622\u0646\u062A\u0648\u06BA \u06A9\u06CC \u0633\u0633\u062A\u06CC \u062F\u0648\u0631 \u06A9\u0631\u0646\u06D2 \u06A9\u0627 \u0639\u0644\u0627\u062C\u06D4"],
    iconName: "RefreshCw",
    image: "https://images.unsplash.com/photo-1512069772995-ec65ed45afd6?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "dis-19",
    nameUrdu: "\u0628\u0648\u0627\u0633\u06CC\u0631 \u0648 \u0641\u0634\u0631 (Piles & Fissure)",
    nameEnglish: "Piles, Hemorrhoids & Fissure",
    category: "stomach",
    categoryUrdu: "\u0645\u0639\u062F\u06C1 \u0648 \u0646\u0638\u0627\u0645 \u0627\u0646\u06C1\u0636\u0627\u0645",
    symptomsUrdu: ["\u067E\u0627\u062E\u0627\u0646\u06D2 \u06A9\u06D2 \u0633\u0627\u062A\u06BE \u062E\u0648\u0646 \u0622\u0646\u0627", "\u0645\u0633\u0648\u06BA \u0645\u06CC\u06BA \u062F\u0631\u062F \u0627\u0648\u0631 \u062E\u0627\u0631\u0634", "\u0628\u06CC\u0679\u06BE\u0646\u06D2 \u0645\u06CC\u06BA \u0634\u062F\u06CC\u062F \u062A\u06A9\u0644\u06CC\u0641", "\u062C\u0644\u0646 \u06A9\u0627 \u0627\u062D\u0633\u0627\u0633"],
    causesUrdu: ["\u062F\u0627\u0626\u0645\u06CC \u0642\u0628\u0636", "\u0645\u0639\u062F\u06D2 \u06A9\u06CC \u0634\u062F\u06CC\u062F \u06AF\u0631\u0645\u06CC", "\u0632\u06CC\u0627\u062F\u06C1 \u062F\u06CC\u0631 \u0628\u06CC\u0679\u06BE \u06A9\u0631 \u06A9\u0627\u0645 \u06A9\u0631\u0646\u0627", "\u0645\u0631\u0686 \u0645\u0635\u0627\u0644\u062D\u06C1"],
    treatmentUrdu: ["\u0628\u063A\u06CC\u0631 \u0622\u067E\u0631\u06CC\u0634\u0646 \u0628\u0648\u0627\u0633\u06CC\u0631 \u0645\u0633\u06D2 \u062E\u062A\u0645 \u06A9\u0648\u0631\u0633", "\u0641\u0634\u0631 \u062C\u0644\u0646 \u0645\u0631\u06C1\u0645", "\u062E\u0648\u0646 \u0628\u0646\u062F \u06C1\u0631\u0628\u0644 \u0627\u062F\u0648\u06CC\u0627\u062A"],
    shortDescUrdu: ["\u0628\u0627\u062F\u06CC \u0648 \u062E\u0648\u0646\u06CC \u0628\u0648\u0627\u0633\u06CC\u0631 \u06A9\u06D2 \u0645\u0633\u06D2 \u0628\u063A\u06CC\u0631 \u0622\u067E\u0631\u06CC\u0634\u0646 \u062E\u0634\u06A9 \u06A9\u0631\u0646\u06D2 \u06A9\u0627 \u0637\u0631\u06CC\u0642\u06C1\u06D4"],
    iconName: "OctagonAlert",
    image: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=800"
  },
  // Male Health
  {
    id: "dis-20",
    nameUrdu: "\u0645\u0631\u062F\u0627\u0646\u06C1 \u06A9\u0645\u0632\u0648\u0631\u06CC",
    nameEnglish: "Male Vitality & Weakness",
    category: "male",
    categoryUrdu: "\u0645\u0631\u062F\u0627\u0646\u06C1 \u0627\u0645\u0631\u0627\u0636",
    symptomsUrdu: ["\u062C\u0633\u0645\u0627\u0646\u06CC \u0648 \u0627\u0639\u0635\u0627\u0628\u06CC \u0637\u0627\u0642\u062A \u0645\u06CC\u06BA \u06A9\u0645\u06CC", "\u062C\u0644\u062F \u062A\u06BE\u06A9 \u062C\u0627\u0646\u0627", "\u062A\u0648\u062C\u06C1 \u0645\u0631\u06A9\u0648\u0632 \u0646\u06C1 \u06C1\u0648\u0646\u0627", "\u0627\u062D\u0633\u0627\u0633 \u06A9\u0645\u062A\u0631\u06CC"],
    causesUrdu: ["\u0679\u06CC\u0633\u0679\u0648\u0633\u0679\u06CC\u0631\u0648\u0646 \u06C1\u0627\u0631\u0645\u0648\u0646 \u06A9\u06CC \u06A9\u0645\u06CC", "\u0627\u0639\u0635\u0627\u0628\u06CC \u06A9\u0645\u0632\u0648\u0631\u06CC", "\u0630\u06C1\u0646\u06CC \u062A\u0646\u0627\u0624", "\u0630\u06CC\u0627\u0628\u06CC\u0637\u0633"],
    treatmentUrdu: ["\u062D\u0627\u0641\u0638 \u0634\u0627\u06C1\u06CC \u0645\u0639\u062C\u0648\u0646 \u0648 \u0645\u0642\u0648\u06CC \u0627\u0639\u0635\u0627\u0628 \u06A9\u0648\u0631\u0633", "\u0642\u062F\u0631\u062A\u06CC \u062C\u0691\u06CC \u0628\u0648\u0679\u06CC\u0648\u06BA \u0633\u06D2 \u062A\u06CC\u0627\u0631 \u062E\u0627\u0644\u0635 \u0646\u0633\u062E\u06C1 \u062C\u0627\u062A", "\u06C1\u0627\u0631\u0645\u0648\u0646\u0644 \u0628\u06CC\u0644\u0646\u0633 \u0631\u06C1\u0646\u0645\u0627\u0626\u06CC"],
    shortDescUrdu: ["\u0642\u062F\u0631\u062A\u06CC \u0627\u062C\u0632\u0627\u0621 \u0627\u0648\u0631 \u06C1\u0631\u0628\u0644 \u0641\u0627\u0631\u0645\u0648\u0644\u06C1 \u0633\u06D2 \u062C\u0633\u0645\u0627\u0646\u06CC \u0648 \u0627\u0639\u0635\u0627\u0628\u06CC \u062A\u0648\u0627\u0646\u0627\u0626\u06D4"],
    iconName: "HeartHandshake",
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "dis-21",
    nameUrdu: "\u0633\u0631\u0639\u062A \u0627\u0646\u0632\u0627\u0644\u060C \u062C\u0631\u06CC\u0627\u0646 \u0648 \u0627\u062D\u062A\u0644\u0627\u0645",
    nameEnglish: "Premature Ejaculation & Spermatorrhea",
    category: "male",
    categoryUrdu: "\u0645\u0631\u062F\u0627\u0646\u06C1 \u0627\u0645\u0631\u0627\u0636",
    symptomsUrdu: ["\u067E\u06CC\u0634\u0627\u0628 \u06A9\u06D2 \u0628\u0639\u062F \u0642\u0637\u0631\u06D2 \u0622\u0646\u0627", "\u0646\u06CC\u0646\u062F \u0645\u06CC\u06BA \u0627\u062D\u062A\u0644\u0627\u0645 \u06C1\u0648\u0646\u0627", "\u06A9\u0645\u0631 \u0645\u06CC\u06BA \u062F\u0631\u062F \u0631\u06C1\u0646\u0627", "\u0622\u0646\u06A9\u06BE\u0648\u06BA \u06A9\u06D2 \u0622\u06AF\u06D2 \u0627\u0646\u062F\u06BE\u06CC\u0631\u0627 \u0622\u0646\u0627"],
    causesUrdu: ["\u0645\u062B\u0627\u0646\u06D2 \u06A9\u06CC \u06AF\u0631\u0645\u06CC", "\u0627\u0639\u0635\u0627\u0628 \u06A9\u06CC \u0633\u0633\u062A\u06CC", "\u063A\u0644\u0637 \u063A\u0630\u0627\u0624\u06BA \u06A9\u0627 \u0627\u0633\u062A\u0639\u0645\u0627\u0644"],
    treatmentUrdu: ["\u0645\u063A\u0644\u0638 \u0648 \u0645\u0628\u0631\u062F \u06C1\u0631\u0628\u0644 \u06A9\u0648\u0631\u0633", "\u0645\u062B\u0627\u0646\u06D2 \u06A9\u06CC \u06AF\u0631\u0645\u06CC \u062F\u0648\u0631 \u06A9\u0631\u0646\u06D2 \u06A9\u0627 \u0646\u064F\u0633\u062E\u06C1", "\u062A\u0642\u0648\u06CC\u062A \u0627\u0639\u0635\u0627\u0628"],
    shortDescUrdu: ["\u0645\u062B\u0627\u0646\u06D2 \u06A9\u06CC \u06AF\u0631\u0645\u06CC\u060C \u062C\u0631\u06CC\u0627\u0646 \u0627\u0648\u0631 \u0627\u062D\u062A\u0644\u0627\u0645 \u06A9\u0627 \u0634\u0627\u0641\u06CC \u0639\u0644\u0627\u062C\u06D4"],
    iconName: "Sparkles",
    image: "https://images.unsplash.com/photo-1505576399279-565b52d4ac71?auto=format&fit=crop&q=80&w=800"
  },
  // Female Health
  {
    id: "dis-22",
    nameUrdu: "\u0644\u06CC\u06A9\u0648\u0631\u06CC\u0627 (Leucorrhea)",
    nameEnglish: "Leucorrhea & White Discharge",
    category: "female",
    categoryUrdu: "\u0632\u0646\u0627\u0646\u06C1 \u0627\u0645\u0631\u0627\u0636",
    symptomsUrdu: ["\u06A9\u0645\u0631 \u0627\u0648\u0631 \u067E\u0646\u0688\u0644\u06CC\u0648\u06BA \u0645\u06CC\u06BA \u0634\u062F\u06CC\u062F \u062F\u0631\u062F", "\u0686\u06C1\u0631\u06D2 \u06A9\u06CC \u0631\u0646\u06AF\u062A \u0632\u0631\u062F \u06C1\u0648\u0646\u0627", "\u062C\u0633\u0645\u0627\u0646\u06CC \u0646\u0688\u06BE\u0627\u0644\u06CC", "\u062E\u0627\u0631\u0634 \u0627\u0648\u0631 \u062C\u0644\u0646"],
    causesUrdu: ["\u0631\u062D\u0645 \u06A9\u06CC \u0633\u0648\u0632\u0634", "\u0627\u0646\u0641\u06CC\u06A9\u0634\u0646", "\u0648\u06CC\u062A\u0627\u0645\u0646\u0632 \u06A9\u06CC \u06A9\u0645\u06CC", "\u06AF\u0631\u0645 \u0627\u0634\u06CC\u0627\u0621 \u06A9\u0627 \u0627\u0633\u062A\u0639\u0645\u0627\u0644"],
    treatmentUrdu: ["\u062D\u0627\u0641\u0638 \u0632\u0646\u0627\u0646\u06C1 \u06A9\u06CC\u0626\u0631 \u06A9\u0648\u0631\u0633", "\u0644\u06CC\u06A9\u0648\u0631\u06CC\u0627 \u0634\u0641\u0627 \u0633\u06CC\u0631\u067E", "\u0631\u062D\u0645 \u06A9\u06CC \u0633\u0648\u0632\u0634 \u06A9\u0627 \u06C1\u0631\u0628\u0644 \u0639\u0644\u0627\u062C"],
    shortDescUrdu: ["\u062E\u0648\u0627\u062A\u06CC\u0646 \u06A9\u06D2 \u067E\u0631\u0627\u0646\u06D2 \u0644\u06CC\u06A9\u0648\u0631\u06CC\u0627 \u0627\u0648\u0631 \u06A9\u0645\u0631 \u062F\u0631\u062F \u06A9\u0627 \u0645\u06A9\u0645\u0644 \u062E\u0627\u0646\u062F\u0627\u0646\u06CC \u0639\u0644\u0627\u062C\u06D4"],
    iconName: "Heart",
    image: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "dis-23",
    nameUrdu: "\u0628\u0627\u0646\u062C\u06BE \u067E\u0646 (Female Infertility)",
    nameEnglish: "Infertility & PCOS",
    category: "female",
    categoryUrdu: "\u0632\u0646\u0627\u0646\u06C1 \u0627\u0645\u0631\u0627\u0636",
    symptomsUrdu: ["\u0627\u0648\u0644\u0627\u062F \u06A9\u06CC \u0646\u0639\u0645\u062A \u0633\u06D2 \u0645\u062D\u0631\u0648\u0645\u06CC", "\u0627\u0648\u0648\u0631\u06CC \u0645\u06CC\u06BA \u0631\u0633\u0648\u0644\u06CC\u0627\u06BA (PCOS)", "\u0648\u0632\u0646 \u06A9\u0627 \u062A\u06CC\u0632\u06CC \u0633\u06D2 \u0628\u0691\u06BE\u0646\u0627", "\u0686\u06C1\u0631\u06D2 \u067E\u0631 \u063A\u06CC\u0631 \u0636\u0631\u0648\u0631\u06CC \u0628\u0627\u0644"],
    causesUrdu: ["\u06C1\u0627\u0631\u0645\u0648\u0646\u0632 \u06A9\u0627 \u0639\u062F\u0645 \u062A\u0648\u0627\u0632\u0646", "\u067E\u06CC \u0633\u06CC \u0627\u0648 \u0627\u06CC\u0633 (PCOS)", "\u0627\u0646\u0688\u06D2 \u0646\u06C1 \u0628\u0646\u0646\u0627", "\u0631\u062D\u0645 \u06A9\u06CC \u06A9\u0645\u0632\u0648\u0631\u06CC"],
    treatmentUrdu: ["\u067E\u06CC \u0633\u06CC \u0627\u0648 \u0627\u06CC\u0633 \u062E\u062A\u0645 \u06A9\u0648\u0631\u0633", "\u06C1\u0627\u0631\u0645\u0648\u0646\u0644 \u0646\u0627\u0631\u0645\u0644\u0627\u0626\u0632\u06CC\u0634\u0646 \u06C1\u0631\u0628\u0644 \u062A\u06BE\u0631\u0627\u067E\u06CC", "\u0631\u062D\u0645 \u0645\u0642\u0648\u06CC \u06A9\u0648\u0631\u0633"],
    shortDescUrdu: ["\u0627\u0648\u0648\u0631\u06CC \u06A9\u06CC \u0631\u0633\u0648\u0644\u06CC\u0648\u06BA \u0627\u0648\u0631 \u06C1\u0627\u0631\u0645\u0648\u0646\u0632 \u06A9\u06CC \u062E\u0631\u0627\u0628\u06CC \u06A9\u0627 \u0634\u0627\u0641\u06CC \u0639\u0644\u0627\u062C\u06D4"],
    iconName: "Baby",
    image: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "dis-24",
    nameUrdu: "\u0645\u0627\u06C1\u0648\u0627\u0631\u06CC \u06A9\u06CC \u062E\u0631\u0627\u0628\u06CC (Menstrual Irregularities)",
    nameEnglish: "Menstrual Disorders",
    category: "female",
    categoryUrdu: "\u0632\u0646\u0627\u0646\u06C1 \u0627\u0645\u0631\u0627\u0636",
    symptomsUrdu: ["\u0645\u0627\u06C1\u0648\u0627\u0631\u06CC \u06A9\u0627 \u0631\u06A9 \u0631\u06A9 \u06A9\u0631 \u06CC\u0627 \u062F\u0631\u062F \u06A9\u06D2 \u0633\u0627\u062A\u06BE \u0622\u0646\u0627", "\u0648\u0642\u062A \u067E\u0631 \u0646\u06C1 \u0622\u0646\u0627", "\u0632\u06CC\u0627\u062F\u06C1 \u0628\u0644\u0688\u0646\u06AF \u06C1\u0648\u0646\u0627", "\u067E\u06CC\u0679 \u06A9\u06D2 \u0646\u06CC\u0686\u06D2 \u0634\u062F\u06CC\u062F \u0627\u06CC\u0646\u0679\u06BE\u0646"],
    causesUrdu: ["\u062E\u0648\u0646 \u06A9\u06CC \u06A9\u0645\u06CC (Anemia)", "\u062A\u06BE\u0627\u0626\u0631\u0627\u0626\u0688 \u06A9\u06CC \u062E\u0631\u0627\u0628\u06CC", "\u06C1\u0627\u0631\u0645\u0648\u0646\u0632 \u06A9\u0627 \u063A\u06CC\u0631 \u0645\u062A\u0648\u0627\u0632\u0646 \u06C1\u0648\u0646\u0627"],
    treatmentUrdu: ["\u0645\u0627\u06C1\u0648\u0627\u0631\u06CC \u0628\u0627\u0642\u0627\u0639\u062F\u06AF\u06CC \u06C1\u0631\u0628\u0644 \u0633\u064A\u0631\u067E", "\u062E\u0648\u0646 \u067E\u06CC\u062F\u0627 \u06A9\u0631\u0646\u06D2 \u06A9\u0627 \u0634\u0627\u06C1\u06CC \u0634\u0631\u0628\u062A", "\u0631\u062D\u0645 \u062A\u0633\u06A9\u06CC\u0646 \u06A9\u0648\u0631\u0633"],
    shortDescUrdu: ["\u0645\u0627\u06C1\u0648\u0627\u0631\u06CC \u06A9\u06D2 \u062F\u0631\u062F\u060C \u0628\u06D2 \u0642\u0627\u0639\u062F\u06AF\u06CC \u0627\u0648\u0631 \u062E\u0648\u0646 \u06A9\u06CC \u06A9\u0645\u06CC \u06A9\u0627 \u0639\u0644\u0627\u062C\u06D4"],
    iconName: "Calendar",
    image: "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&q=80&w=800"
  },
  // General & Chronic
  {
    id: "dis-25",
    nameUrdu: "\u0634\u0648\u06AF\u0631 (Diabetes Mellitus)",
    nameEnglish: "Diabetes Control & Management",
    category: "general",
    categoryUrdu: "\u062F\u06CC\u06AF\u0631 \u0639\u0627\u0645 \u0628\u06CC\u0645\u0627\u0631\u06CC\u0648\u06BA",
    symptomsUrdu: ["\u0628\u0627\u0631 \u0628\u0627\u0631 \u067E\u06CC\u0634\u0627\u0628 \u0627\u0648\u0631 \u067E\u06CC\u0627\u0633 \u0644\u06AF\u0646\u0627", "\u0632\u062E\u0645\u0648\u06BA \u06A9\u0627 \u062F\u06CC\u0631 \u0633\u06D2 \u0628\u06BE\u0631\u0646\u0627", "\u0628\u06CC\u0646\u0627\u0626\u06CC \u06A9\u0627 \u062F\u06BE\u0646\u062F\u0644\u0627 \u06C1\u0648\u0646\u0627", "\u0648\u0632\u0646 \u06A9\u0645 \u06C1\u0648\u0646\u0627"],
    causesUrdu: ["\u0644\u0628 \u0644\u0628\u06C1 (Pancreas) \u06A9\u06CC \u0627\u0646\u0633\u0648\u0644\u06CC\u0646 \u0633\u0633\u062A\u06CC", "\u0645\u0648\u0631\u0648\u062B\u06CC", "\u0645\u0648\u0679\u0627\u067E\u0627"],
    treatmentUrdu: ["\u062D\u0627\u0641\u0638 \u0634\u0648\u06AF\u0631 \u06A9\u0646\u0679\u0631\u0648\u0644 \u06C1\u0631\u0628\u0644 \u0641\u0627\u0631\u0645\u0648\u0644\u06C1", "\u0634\u0648\u06AF\u0631 \u0646\u06CC\u0648\u0631\u0648\u067E\u062A\u06CC \u06A9\u06CC\u0626\u0631", "\u0688\u06CC\u0644\u06CC \u0627\u0646\u0633\u0648\u0644\u06CC\u0646 \u0633\u067E\u0648\u0631\u0679"],
    shortDescUrdu: ["\u0634\u0648\u06AF\u0631 \u06A9\u0648 \u0642\u062F\u0631\u062A\u06CC \u0633\u0637\u062D \u067E\u0631 \u0631\u06A9\u06BE\u0646\u06D2 \u0627\u0648\u0631 \u0639\u0648\u0627\u0631\u0636 \u0633\u06D2 \u0628\u0686\u0627\u0646\u06D2 \u06A9\u0627 \u0639\u0644\u0627\u062C\u06D4"],
    iconName: "Activity",
    image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "dis-26",
    nameUrdu: "\u0628\u0644\u0688 \u067E\u0631\u06CC\u0634\u0631 (Hypertension)",
    nameEnglish: "High Blood Pressure",
    category: "general",
    categoryUrdu: "\u062F\u06CC\u06AF\u0631 \u0639\u0627\u0645 \u0628\u06CC\u0645\u0627\u0631\u06CC\u0648\u06BA",
    symptomsUrdu: ["\u0633\u0631 \u06A9\u0627 \u06AF\u06BE\u0648\u0645\u0646\u0627 \u0627\u0648\u0631 \u0628\u06BE\u0627\u0631\u06CC \u067E\u0646", "\u0622\u0646\u06A9\u06BE\u0648\u06BA \u06A9\u06D2 \u0633\u0627\u0645\u0646\u06D2 \u062A\u0627\u0631\u06D2 \u0622\u0646\u0627", "\u063A\u0635\u06C1 \u0627\u0648\u0631 \u0628\u06D2 \u0686\u06CC\u0646\u06CC", "\u06AF\u0631\u062F\u0646 \u06A9\u06D2 \u067E\u0686\u06BE\u0644\u06D2 \u062D\u0635\u06D2 \u06A9\u0627 \u062F\u0631\u062F"],
    causesUrdu: ["\u0634\u0631\u06CC\u0627\u0646\u0648\u06BA \u06A9\u06CC \u0633\u062E\u062A\u06CC", "\u0646\u0645\u06A9 \u0627\u0648\u0631 \u0686\u06A9\u0646\u0627\u0626\u06CC \u06A9\u0627 \u0632\u06CC\u0627\u062F\u06C1 \u0627\u0633\u062A\u0639\u0645\u0627\u0644", "\u06A9\u0648\u0644\u06CC\u0633\u0679\u0631\u0648\u0644", "\u0630\u06C1\u0646\u06CC \u062F\u0628\u0627\u0624"],
    treatmentUrdu: ["\u0628\u0644\u0688 \u067E\u0631\u06CC\u0634\u0631 \u062A\u0633\u06A9\u06CC\u0646 \u0648 \u06A9\u0648\u0644\u06CC\u0633\u0679\u0631\u0648\u0644 \u0635\u0641\u0627\u0626\u06CC \u0633\u0641\u0648\u0641", "\u062F\u0644 \u06A9\u06CC \u0631\u06AF\u0648\u06BA \u06A9\u06CC \u0635\u0641\u0627\u0626\u06CC"],
    shortDescUrdu: ["\u0628\u0644\u0688 \u067E\u0631\u06CC\u0634\u0631 \u0627\u0648\u0631 \u06A9\u0648\u0644\u06CC\u0633\u0679\u0631\u0648\u0644 \u06A9\u0648 \u0646\u0627\u0631\u0645\u0644 \u0631\u06A9\u06BE\u0646\u06D2 \u06A9\u06CC \u0642\u062F\u0631\u062A\u06CC \u0634\u0641\u0627\u06D4"],
    iconName: "HeartPulse",
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "dis-27",
    nameUrdu: "\u062F\u0645\u06C1\u060C \u062F\u0645\u06C1 \u0648 \u0627\u0644\u0631\u062C\u06CC",
    nameEnglish: "Asthma, Allergy & Breathing Problems",
    category: "general",
    categoryUrdu: "\u062F\u06CC\u06AF\u0631 \u0639\u0627\u0645 \u0628\u06CC\u0645\u0627\u0631\u06CC\u0648\u06BA",
    symptomsUrdu: ["\u0633\u0627\u0646\u0633 \u067E\u06BE\u0648\u0644\u0646\u0627 \u0627\u0648\u0631 \u0633\u06CC\u0679\u06CC \u06A9\u06CC \u0622\u0648\u0627\u0632 \u0622\u0646\u0627", "\u0633\u0631\u062F\u06CC \u06CC\u0627 \u06AF\u0631\u062F \u0648 \u063A\u0628\u0627\u0631 \u0633\u06D2 \u0686\u06BE\u06CC\u0646\u06A9\u06CC\u06BA", "\u0646\u0627\u06A9 \u0633\u06D2 \u067E\u0627\u0646\u06CC \u0628\u06C1\u0646\u0627", "\u0633\u06CC\u0679\u06CC\u0648\u06BA \u0648\u0627\u0644\u06CC \u06A9\u06BE\u0627\u0646\u0633\u06CC"],
    causesUrdu: ["\u0633\u0627\u0646\u0633 \u06A9\u06CC \u0646\u0627\u0644\u06CC\u0648\u06BA \u06A9\u06CC \u0633\u0648\u0632\u0634", "\u0627\u0644\u0631\u062C\u0646\u0632", "\u0645\u0648\u0633\u0645\u06CC \u062A\u063A\u06CC\u0631"],
    treatmentUrdu: ["\u062F\u0645\u06C1 \u0634\u0641\u0627 \u0633\u06CC\u0631\u067E \u0648 \u0645\u0639\u062C\u0648\u0646", "\u0627\u0644\u0631\u062C\u06CC \u0627\u06CC\u0646\u0679\u06CC \u06C1\u0633\u0679\u0627\u0645\u0627\u0626\u0646 \u06C1\u0631\u0628\u0644 \u06A9\u0679", "\u0631\u06CC\u0633\u067E\u0627\u0626\u0631\u06CC\u0679\u0631\u06CC \u0627\u0633\u0679\u06CC\u0645"],
    shortDescUrdu: ["\u062F\u0645\u06C1\u060C \u0633\u0627\u0646\u0633 \u067E\u06BE\u0648\u0644\u0646\u06D2 \u0627\u0648\u0631 \u0686\u06BE\u06CC\u0646\u06A9\u0648\u06BA \u06A9\u06CC \u062F\u0627\u0626\u0645\u06CC \u0627\u0644\u0631\u062C\u06CC \u06A9\u0627 \u0639\u0644\u0627\u062C\u06D4"],
    iconName: "Wind",
    image: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "dis-28",
    nameUrdu: "\u06CC\u0631\u0642\u0627\u0646 \u0648 \u062C\u06AF\u0631 \u06A9\u06CC \u062E\u0631\u0627\u0628\u06CC (Jaundice & Fatty Liver)",
    nameEnglish: "Jaundice, Hepatitis & Fatty Liver",
    category: "general",
    categoryUrdu: "\u062F\u06CC\u06AF\u0631 \u0639\u0627\u0645 \u0628\u06CC\u0645\u0627\u0631\u06CC\u0648\u06BA",
    symptomsUrdu: ["\u0622\u0646\u06A9\u06BE\u0648\u06BA \u0627\u0648\u0631 \u067E\u06CC\u0634\u0627\u0628 \u06A9\u0627 \u067E\u06CC\u0644\u0627 \u06C1\u0648\u0646\u0627", "\u062C\u06AF\u0631 \u06A9\u06D2 \u0645\u0642\u0627\u0645 \u067E\u0631 \u062F\u0631\u062F", "\u0631\u0648\u0679\u06CC \u0646\u06C1 \u06C1\u0636\u0645 \u06C1\u0648\u0646\u0627", "\u0645\u062A\u0644\u06CC \u0627\u0648\u0631 \u0627\u0644\u0679\u06CC"],
    causesUrdu: ["\u06C1\u067E\u0627\u0679\u0627\u0626\u0679\u0633 \u0648\u0627\u0626\u0631\u0633 (Hepatitis A, B, C)", "\u062C\u06AF\u0631 \u067E\u0631 \u0686\u0631\u0628\u06CC (Fatty Liver)", "\u0622\u0644\u0648\u062F\u06C1 \u067E\u0627\u0646\u06CC"],
    treatmentUrdu: ["\u062C\u06AF\u0631 \u0635\u0641\u0627\u0626\u06CC \u0627\u06A9\u0633\u06CC\u0631 \u0633\u06CC\u0631\u067E", "\u06C1\u067E\u0627\u0679\u0627\u0626\u0679\u0633 \u0648\u0627\u0626\u0631\u0633 \u0641\u0644\u0679\u0631 \u06A9\u0648\u0631\u0633", "\u062C\u06AF\u0631 \u06A9\u06CC \u0686\u0631\u0628\u06CC \u067E\u06AF\u06BE\u0644\u0627\u0624 \u0641\u0627\u0631\u0645\u0648\u0644\u06C1"],
    shortDescUrdu: ["\u06CC\u0631\u0642\u0627\u0646\u060C \u06C1\u06CC\u067E\u0627\u0679\u0627\u0626\u0679\u0633 \u0627\u0648\u0631 \u062C\u06AF\u0631 \u06A9\u06CC \u0686\u0631\u0628\u06CC \u06A9\u0627 \u06C1\u0631\u0628\u0644 \u062A\u062F\u0627\u0631\u06A9\u06D4"],
    iconName: "ShieldPlus",
    image: "https://images.unsplash.com/photo-1505576399279-565b52d4ac71?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "dis-29",
    nameUrdu: "\u062C\u0644\u062F\u06CC \u0627\u0645\u0631\u0627\u0636 (Skin Diseases & Eczema)",
    nameEnglish: "Skin Diseases, Eczema & Psoriasis",
    category: "skin",
    categoryUrdu: "\u062C\u0644\u062F\u06CC \u0627\u0645\u0631\u0627\u0636",
    symptomsUrdu: ["\u062C\u0644\u062F \u067E\u0631 \u0633\u0631\u062E \u062F\u06BE\u0628\u06D2 \u0627\u0648\u0631 \u062E\u0627\u0631\u0634", "\u0686\u06BE\u0627\u0644\u06D2 \u0628\u0646\u0646\u0627", "\u062C\u0644\u062F \u06A9\u0627 \u0686\u06BE\u0644\u06A9\u0627 \u0627\u062A\u0631\u0646\u0627", "\u06A9\u06CC\u0644 \u0645\u06C1\u0627\u0633\u06D2 \u0627\u0648\u0631 \u0686\u06BE\u0627\u0626\u06CC\u0627\u06BA"],
    causesUrdu: ["\u062E\u0648\u0646 \u06A9\u06CC \u062E\u0631\u0627\u0628\u06CC", "\u0627\u0644\u0631\u062C\u06CC", "\u0641\u0646\u06AF\u0644 \u0627\u0646\u0641\u06CC\u06A9\u0634\u0646", "\u0645\u06CC\u0688\u06CC \u06A9\u06CC\u0679\u0688 \u0635\u0627\u0628\u0646 \u06A9\u06CC \u06A9\u0645\u06CC"],
    treatmentUrdu: ["\u062E\u0648\u0646 \u0645\u0635\u0641\u06CC \u06C1\u0631\u0628\u0644 \u0634\u0631\u0628\u062A", "\u062D\u0627\u0641\u0638 \u0633\u06A9\u0646 \u0627\u0650\u06A9\u0632\u06CC\u0645\u0627 \u0644\u0648\u0634\u0646", "\u06C1\u0631\u0628\u0644 \u0641\u06CC\u0634\u0644 \u062A\u06BE\u0631\u0627\u067E\u06CC"],
    shortDescUrdu: ["\u062F\u0627\u062F\u060C \u062E\u0627\u0631\u0634\u060C \u0686\u06BE\u0627\u0626\u06CC\u0648\u06BA \u0627\u0648\u0631 \u062C\u0644\u062F\u06CC \u0627\u0644\u0631\u062C\u06CC \u06A9\u0627 \u0645\u06A9\u0645\u0644 \u062A\u062F\u0627\u0631\u06A9\u06D4"],
    iconName: "Sun",
    image: "https://images.unsplash.com/photo-1512290900673-2070e6a8d6f9?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "dis-30",
    nameUrdu: "\u0628\u0686\u0648\u06BA \u06A9\u06CC \u0628\u06CC\u0645\u0627\u0631\u06CC\u0627\u06BA (Pediatric Diseases)",
    nameEnglish: "Pediatric Health & Growth Issue",
    category: "general",
    categoryUrdu: "\u062F\u06CC\u06AF\u0631 \u0639\u0627\u0645 \u0628\u06CC\u0645\u0627\u0631\u06CC\u0648\u06BA",
    symptomsUrdu: ["\u0628\u0686\u0648\u06BA \u06A9\u0627 \u0633\u0648\u06A9\u06BE\u0627 \u067E\u0646", "\u0628\u0627\u0631 \u0628\u0627\u0631 \u0646\u0645\u0648\u0646\u06CC\u0627 \u0627\u0648\u0631 \u0628\u062E\u0627\u0631", "\u067E\u0648\u0679\u06CC\u0627\u06BA \u0644\u06AF\u0646\u0627", "\u0642\u062F \u0646\u06C1 \u0628\u0691\u06BE\u0646\u0627"],
    causesUrdu: ["\u063A\u0630\u0627\u0626\u06CC\u062A \u06A9\u06CC \u06A9\u0645\u06CC", "\u06A9\u0645\u0632\u0648\u0631 \u0645\u062F\u0627\u0641\u0639\u062A\u06CC \u0646\u0638\u0627\u0645", "\u067E\u06CC\u0679 \u06A9\u06D2 \u06A9\u06CC\u0691\u06D2"],
    treatmentUrdu: ["\u062D\u0627\u0641\u0638 \u06A9\u0688\u0632 \u0688\u0627\u0626\u062C\u0633\u0679 \u0688\u0631\u0627\u067E\u0633", "\u0642\u062F \u0628\u0691\u06BE\u0627\u0624 \u06C1\u0631\u0628\u0644 \u0633\u06CC\u0631\u067E", "\u067E\u06CC\u0679 \u06A9\u06CC\u0691\u06D2 \u0635\u0641\u0627\u0626\u06CC \u0634\u0631\u0628\u062A"],
    shortDescUrdu: ["\u0628\u0686\u0648\u06BA \u06A9\u06CC \u0635\u062D\u062A\u060C \u0642\u062F \u06A9\u06CC \u0646\u0634\u0648\u0648\u0646\u0645\u0627 \u0627\u0648\u0631 \u06C1\u0636\u0645 \u06A9\u06CC \u0628\u06C1\u062A\u0631\u06CC\u06D4"],
    iconName: "SmilePlus",
    image: "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&q=80&w=800"
  }
];
var initialProducts2 = [
  // Hair Products
  {
    id: "prod-1",
    nameUrdu: "\u06C1\u0648\u0631\u0627\u0628 \u06C1\u0631\u0628\u0644 \u06C1\u06CC\u0626\u0631 \u0622\u0626\u0644",
    nameEnglish: "Hoorab Herbal Hair Oil",
    category: "hair",
    categoryUrdu: "\u06C1\u06CC\u0626\u0631 \u06A9\u06CC\u0626\u0631",
    pricePKR: 1250,
    originalPricePKR: 1500,
    image: "https://images.unsplash.com/photo-1608248597260-1e43d7907572?auto=format&fit=crop&q=80&w=600",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-tree-branches-in-the-breeze-1188-large.mp4",
    videoType: "direct",
    descriptionUrdu: "\u0642\u062F\u0631\u062A\u06CC \u062C\u0691\u06CC \u0628\u0648\u0679\u06CC\u0648\u06BA\u060C \u0632\u06CC\u062A\u0648\u0646\u060C \u0646\u0627\u0631\u06CC\u0644\u060C \u062C\u0648\u062C\u0648\u0628\u0627\u060C \u0632\u0639\u0641\u0631\u0627\u0646 \u0627\u0648\u0631 \u0628\u0627\u062F\u0627\u0645 \u06A9\u06D2 \u062A\u06CC\u0644 \u0633\u06D2 \u062A\u06CC\u0627\u0631 \u06A9\u0631\u062F\u06C1 \u0634\u0627\u06C1\u06CC \u0641\u0627\u0631\u0645\u0648\u0644\u06C1\u06D4 \u0628\u0627\u0644\u0648\u06BA \u06A9\u0648 \u0645\u0636\u0628\u0648\u0637\u060C \u0644\u0645\u0628\u0627\u060C \u06AF\u06BE\u0646\u0627 \u0627\u0648\u0631 \u062E\u0634\u06A9\u06CC \u0633\u06D2 \u067E\u0627\u06A9 \u0628\u0646\u0627\u0626\u06D2\u06D4",
    ingredientsUrdu: ["\u062C\u0648\u062C\u0648\u0628\u0627 \u0622\u0626\u0644", "\u0646\u0627\u0631\u06CC\u0644 \u0622\u0626\u0644", "\u0632\u06CC\u062A\u0648\u0646 \u06A9\u0627 \u062A\u06CC\u0644", "\u0632\u0639\u0641\u0631\u0627\u0646", "\u0628\u0627\u062F\u0627\u0645 \u06A9\u0627 \u062A\u06CC\u0644", "\u0631\u0648\u063A\u0646 \u06A9\u062F\u0648", "\u0622\u0645\u0644\u06C1", "\u0628\u0631\u06C1\u0645\u06CC", "\u0628\u06BE\u0646\u06AF\u0631\u06C1", "\u0645\u06CC\u062A\u06BE\u06CC \u062F\u0627\u0646\u06C1", "\u0627\u06CC\u0644\u0648\u0648\u06CC\u0631\u0627"],
    benefitsUrdu: ["\u0628\u0627\u0644 \u06AF\u0631\u0646\u0627 7 \u062F\u0646 \u0645\u06CC\u06BA \u0628\u0646\u062F \u06A9\u0631\u0646\u06D2 \u0645\u06CC\u06BA \u0645\u062F\u062F\u06AF\u0627\u0631", "\u062E\u0634\u06A9\u06CC \u0648 \u0633\u06A9\u0631\u06CC \u06A9\u0627 \u062E\u0627\u062A\u0645\u06C1", "\u0633\u0641\u06CC\u062F \u0628\u0627\u0644\u0648\u06BA \u06A9\u06CC \u0631\u0648\u06A9 \u062A\u06BE\u0627\u0645 \u0627\u0648\u0631 \u0642\u062F\u0631\u062A\u06CC \u0686\u0645\u06A9", "\u0628\u0627\u0644\u0648\u06BA \u06A9\u0648 \u0646\u0631\u0645\u060C \u0686\u0645\u06A9\u062F\u0627\u0631 \u0627\u0648\u0631 \u0645\u0636\u0628\u0648\u0637 \u0628\u0646\u0627\u0646\u06D2 \u0645\u06CC\u06BA \u0645\u0639\u0627\u0648\u0646"],
    howToUseUrdu: "\u0631\u0627\u062A \u06A9\u0648 \u0633\u0648\u0646\u06D2 \u0633\u06D2 \u0642\u0628\u0644 \u06CC\u0627 \u0646\u06C1\u0627\u0646\u06D2 \u0633\u06D2 2 \u06AF\u06BE\u0646\u0679\u06D2 \u067E\u06C1\u0644\u06D2 \u0633\u0631 \u06A9\u06CC \u062C\u0644\u062F \u067E\u0631 \u0627\u0646\u06AF\u0644\u06CC\u0627\u06BA \u067E\u06BE\u06CC\u0631 \u06A9\u0631 \u06C1\u0644\u06A9\u0627 \u0645\u0633\u0627\u062C \u06A9\u0631\u06CC\u06BA\u06D4 \u06C1\u0641\u062A\u06D2 \u0645\u06CC\u06BA 3 \u0628\u0627\u0631 \u0627\u0633\u062A\u0639\u0645\u0627\u0644 \u06A9\u0631\u06CC\u06BA\u06D4",
    inStock: true,
    rating: 4.9,
    reviewsCount: 384
  },
  // Skin Products
  {
    id: "prod-2",
    nameUrdu: "\u06C1\u0648\u0631\u0627\u0628 \u0628\u06CC\u0648\u0679\u06CC \u06A9\u0631\u06CC\u0645 (\u06AF\u0644\u0648 \u0648\u0627\u0626\u0679\u0646\u0646\u06AF \u06A9\u06CC\u0626\u0631)",
    nameEnglish: "Hoorab Beauty Cream",
    category: "skin",
    categoryUrdu: "\u0627\u0633\u06A9\u0646 \u06A9\u06CC\u0626\u0631",
    pricePKR: 1450,
    originalPricePKR: 1800,
    image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=600",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-set-of-plateaus-seen-from-the-sky-in-a-sunset-26070-large.mp4",
    videoType: "direct",
    descriptionUrdu: "\u0648\u0679\u0627\u0645\u0646 A\u060C B\u060C C \u0627\u0648\u0631 \u0641\u0631\u0648\u0679 \u0627\u06CC\u06A9\u0633\u0679\u0631\u06CC\u06A9\u0679\u0633 \u067E\u0631 \u0645\u0634\u062A\u0645\u0644 \u0646\u0627\u0626\u0679 \u0648 \u0688\u06D2 \u0628\u06CC\u0648\u0679\u06CC \u06A9\u0631\u06CC\u0645\u06D4 \u062F\u0627\u063A\u060C \u062F\u06BE\u0628\u06D2\u060C \u0686\u06BE\u0627\u0626\u06CC\u0627\u06BA \u0627\u0648\u0631 \u0627\u06CC\u06A9\u0646\u06CC \u06A9\u06D2 \u0646\u0634\u0627\u0646\u0627\u062A \u062F\u0648\u0631 \u06A9\u0631 \u06A9\u06D2 \u062C\u0644\u062F \u06A9\u0648 \u0646\u06A9\u06BE\u0627\u0631 \u0627\u0648\u0631 \u062A\u0627\u0632\u06AF\u06CC \u0641\u0631\u0627\u06C1\u0645 \u06A9\u0631\u06D2\u06D4",
    ingredientsUrdu: ["\u0648\u0679\u0627\u0645\u0646 A, B, C", "\u0641\u0631\u0648\u0679 \u0627\u06CC\u06A9\u0633\u0679\u0631\u06CC\u06A9\u0679\u0633", "\u0627\u06CC\u0644\u0648\u0648\u06CC\u0631\u0627 \u062C\u06D5\u0644", "\u0634\u06C1\u062F \u0627\u06CC\u06A9\u0633\u0679\u0631\u06CC\u06A9\u0679", "\u06A9\u0648\u062C\u06A9 \u0627\u06CC\u0633\u0688 \u06C1\u0631\u0628\u0644", "\u0631\u0648\u0632 \u0648\u0627\u0679\u0631"],
    benefitsUrdu: ["\u062C\u0644\u062F \u06A9\u0648 \u0646\u0645\u06CC \u0627\u0648\u0631 \u0646\u0631\u0645\u06CC \u0641\u0631\u0627\u06C1\u0645 \u06A9\u0631\u0646\u06D2 \u0645\u06CC\u06BA \u0645\u062F\u062F\u06AF\u0627\u0631", "\u0686\u06BE\u0627\u0626\u06CC\u0648\u06BA \u0627\u0648\u0631 \u062F\u0627\u063A \u062F\u06BE\u0628\u0648\u06BA \u06A9\u0648 \u06C1\u0644\u06A9\u0627 \u06A9\u0631\u0646\u0627", "\u063A\u06CC\u0631 \u06CC\u06A9\u0633\u0627\u06BA \u0631\u0646\u06AF\u062A \u06A9\u0648 \u06C1\u0645\u0648\u0627\u0631 \u0628\u0646\u0627\u0646\u0627", "\u0642\u062F\u0631\u062A\u06CC \u0627\u0648\u0631 \u0633\u0627\u0626\u06CC\u0688 \u0627\u06CC\u0641\u06CC\u06A9\u0679 \u0633\u06D2 \u067E\u0627\u06A9"],
    howToUseUrdu: "\u0686\u06C1\u0631\u06D2 \u06A9\u0648 \u0627\u0686\u06BE\u06D2 \u0635\u0627\u0628\u0646 \u06CC\u0627 \u0641\u06CC\u0633 \u0648\u0627\u0634 \u0633\u06D2 \u062F\u06BE\u0648 \u06A9\u0631 \u0631\u0627\u062A \u06A9\u0648 \u06C1\u0644\u06A9\u06D2 \u06C1\u0627\u062A\u06BE \u0633\u06D2 \u0644\u06AF\u0627\u0626\u06CC\u06BA\u06D4 \u0635\u0628\u062D \u0646\u06CC\u0645 \u06AF\u0631\u0645 \u067E\u0627\u0646\u06CC \u0633\u06D2 \u062F\u06BE\u0648\u0644\u06CC\u06BA\u06D4",
    inStock: true,
    rating: 4.8,
    reviewsCount: 295
  },
  {
    id: "prod-3",
    nameUrdu: "\u062D\u0627\u0641\u0638 \u062C\u0648\u0627\u0626\u0646\u0679 \u067E\u06CC\u0646 \u0631\u06CC\u0644\u06CC\u0641 \u0622\u0626\u0644 \u0648 \u06A9\u0631\u06CC\u0645",
    nameEnglish: "Hafiz Joint Pain Oil & Relief Balm",
    category: "pain",
    categoryUrdu: "\u062F\u0631\u062F \u0634\u0641\u0627 \u0645\u0635\u0646\u0648\u0639\u0627\u062A",
    pricePKR: 950,
    originalPricePKR: 1200,
    image: "https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&q=80&w=600",
    descriptionUrdu: "\u062C\u0648\u0691\u0648\u06BA\u060C \u06AF\u06BE\u0679\u0646\u0648\u06BA\u060C \u06A9\u0645\u0631 \u0627\u0648\u0631 \u067E\u0679\u06BE\u0648\u06BA \u06A9\u06D2 \u067E\u0631\u0627\u0646\u06D2 \u062F\u0631\u062F \u06A9\u06D2 \u0644\u06CC\u06D2 \u0641\u0648\u0631\u06CC \u0627\u062B\u0631 \u0627\u0646\u06AF\u06CC\u0632 \u0646\u064F\u0633\u062E\u06C1\u06D4 \u0633\u0648\u062C\u0646 \u0627\u0648\u0631 \u0627\u06CC\u0646\u0679\u06BE\u0646 \u06A9\u0627 \u062E\u0627\u062A\u0645\u06C1 \u06A9\u0631\u062A\u0627 \u06C1\u06D2\u06D4",
    ingredientsUrdu: ["\u0631\u0648\u063A\u0646 \u0632\u06CC\u062A\u0648\u0646", "\u0631\u0648\u063A\u0646 \u062A\u0627\u0631\u0627\u0645\u06CC\u0631\u06C1", "\u0633\u0631\u062E \u0645\u0631\u0686 \u06C1\u0631\u0628\u0644 \u0646\u0686\u0648\u0691", "\u06A9\u0627\u0641\u0648\u0631", "\u062F\u0627\u0631\u0686\u06CC\u0646\u06CC \u062A\u06CC\u0644", "\u0644\u0648\u0646\u06AF \u062A\u06CC\u0644"],
    benefitsUrdu: ["\u0641\u0648\u0631\u06CC \u062F\u0631\u062F \u06A9\u0634 \u0627\u062B\u0631", "\u062C\u0648\u0691\u0648\u06BA \u06A9\u06CC \u0633\u0648\u062C\u0646 \u0645\u06CC\u06BA \u06A9\u0645\u06CC", "\u067E\u0679\u06BE\u0648\u06BA \u06A9\u06CC \u0627\u06CC\u0646\u0679\u06BE\u0646 \u06A9\u06BE\u0648\u0644\u0646\u0627", "\u0641\u0627\u0644\u062C \u0648 \u0644\u0642\u0648\u06C1 \u0645\u06CC\u06BA \u0645\u0633\u0627\u062C \u06A9\u06D2 \u0644\u06CC\u06D2 \u0628\u06C1\u062A\u0631\u06CC\u0646"],
    howToUseUrdu: "\u0645\u062A\u0627\u062B\u0631\u06C1 \u062D\u0635\u06D2 \u067E\u0631 \u06C1\u0644\u06A9\u06D2 \u06C1\u0627\u062A\u06BE \u0633\u06D2 5 \u0645\u0646\u0679 \u0645\u0633\u0627\u062C \u06A9\u0631\u06CC\u06BA \u0627\u0648\u0631 \u06AF\u0631\u0645 \u06A9\u067E\u0691\u06D2 \u0633\u06D2 \u0688\u06BE\u0627\u0646\u067E \u0644\u06CC\u06BA\u06D4",
    inStock: true,
    rating: 4.9,
    reviewsCount: 512
  },
  // Eye Glasses & Optical
  {
    id: "prod-4",
    nameUrdu: "\u0628\u0644\u06CC\u0648 \u06A9\u0679 \u06A9\u0645\u067E\u06CC\u0648\u0679\u0631 \u067E\u0631\u0648\u0679\u06CC\u06A9\u0634\u0646 \u06AF\u0644\u0627\u0633\u0632 (Blue Cut Glasses)",
    nameEnglish: "Blue Cut Glasses for Computer & Mobile",
    category: "eye",
    categoryUrdu: "\u0622\u0626\u06CC \u06A9\u06CC\u0626\u0631 \u0648 \u0686\u0634\u0645\u06D2",
    pricePKR: 1850,
    originalPricePKR: 2500,
    image: "https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&q=80&w=600",
    descriptionUrdu: "\u0645\u0648\u0628\u0627\u0626\u0644\u060C \u0644\u06CC\u067E \u0679\u0627\u067E \u0627\u0648\u0631 \u0679\u06CC \u0648\u06CC \u06A9\u06CC \u0646\u0642\u0635\u0627\u0646 \u062F\u06C1 \u0646\u06CC\u0644\u06CC \u0631\u0648\u0634\u0646\u06CC (Blue Light) \u0633\u06D2 \u0622\u0646\u06A9\u06BE\u0648\u06BA \u06A9\u0648 \u0645\u062D\u0641\u0648\u0638 \u0631\u06A9\u06BE\u0646\u06D2 \u0648\u0627\u0644\u06D2 \u067E\u0631\u06CC\u0645\u06CC\u0645 \u0641\u0631\u06CC\u0645 \u06AF\u0644\u0627\u0633\u0632\u06D4 \u0622\u0646\u06A9\u06BE\u0648\u06BA \u06A9\u06D2 \u062F\u0631\u062F \u0627\u0648\u0631 \u062A\u06BE\u06A9\u0646 \u06A9\u0627 \u062A\u062F\u0627\u0631\u06A9\u06D4",
    benefitsUrdu: ["99% \u0628\u0644\u06CC\u0648 \u0644\u0627\u0626\u0679 \u0641\u0644\u0679\u0631", "\u0633\u0631 \u062F\u0631\u062F \u0627\u0648\u0631 \u0622\u0646\u06A9\u06BE\u0648\u06BA \u06A9\u06CC \u0633\u0631\u062E\u06CC \u062E\u062A\u0645 \u06A9\u0631\u06CC\u06BA", "\u06C1\u0644\u06A9\u06D2 \u0648\u0632\u0646 \u06A9\u0627 \u0641\u0644\u06CC\u06A9\u0633\u06CC\u0628\u0644 \u0641\u0631\u06CC\u0645", "\u06C1\u0631 \u0639\u0645\u0631 \u06A9\u06D2 \u0627\u0641\u0631\u0627\u062F \u06A9\u06D2 \u0644\u06CC\u06D2 \u0645\u0648\u0632\u0648\u06BA"],
    inStock: true,
    rating: 4.9,
    reviewsCount: 180
  },
  {
    id: "prod-5",
    nameUrdu: "\u0631\u06CC\u0688\u0646\u06AF \u0627\u06CC\u0646\u0688 \u0688\u0633\u0679\u0646\u0633 \u0627\u06CC\u0646\u0679\u06CC \u0631\u06CC\u0641\u0644\u06CC\u06A9\u0634\u0646 \u06AF\u0644\u0627\u0633\u0632",
    nameEnglish: "Reading & Distance Anti-Reflective Glasses",
    category: "eye",
    categoryUrdu: "\u0622\u0626\u06CC \u06A9\u06CC\u0626\u0631 \u0648 \u0686\u0634\u0645\u06D2",
    pricePKR: 2200,
    originalPricePKR: 3e3,
    image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&q=80&w=600",
    descriptionUrdu: "\u0645\u0637\u0627\u0644\u0639\u06C1 \u0627\u0648\u0631 \u062F\u0648\u0631 \u06A9\u06CC \u0628\u06CC\u0646\u0627\u0626\u06CC \u06A9\u06D2 \u0644\u06CC\u06D2 \u0645\u06CC\u0679\u0644 \u0648 \u0679\u0627\u0626\u0679\u06CC\u0646\u06CC\u0645 \u0641\u0631\u06CC\u0645 \u06A9\u06D2 \u0633\u0627\u062A\u06BE \u0634\u0627\u0626\u0633\u062A\u06C1 \u0686\u0634\u0645\u06D2\u06D4 \u067E\u0631\u0648\u06AF\u0631\u06CC\u0633\u0648 \u0627\u0648\u0631 \u0628\u0627\u0626\u06CC \u0641\u0648\u06A9\u0644 \u0644\u06CC\u0646\u0632 \u0628\u06BE\u06CC \u062F\u0633\u062A\u06CC\u0627\u0628 \u06C1\u06CC\u06BA\u06D4",
    inStock: true,
    rating: 4.7,
    reviewsCount: 142
  },
  {
    id: "prod-6",
    nameUrdu: "\u06A9\u0644\u0631 \u06A9\u0627\u0646\u0679\u06CC\u06A9\u0679 \u0644\u06CC\u0646\u0632 \u06A9\u0679 (Soft Color Lenses)",
    nameEnglish: "Soft Colored Contact Lenses (Monthly/Yearly)",
    category: "eye",
    categoryUrdu: "\u0622\u0626\u06CC \u06A9\u06CC\u0626\u0631 \u0648 \u0686\u0634\u0645\u06D2",
    pricePKR: 1600,
    originalPricePKR: 2e3,
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=600",
    descriptionUrdu: "\u0628\u0631\u0627\u0624\u0646\u060C \u06C1\u06CC\u0632\u0644\u060C \u06AF\u0631\u06D2 \u0627\u0648\u0631 \u06AF\u0631\u06CC\u0646 \u0642\u062F\u0631\u062A\u06CC \u0634\u06CC\u0688\u0632 \u0645\u06CC\u06BA \u0645\u0644\u0627\u0626\u0645 \u06A9\u0627\u0646\u0679\u06CC\u06A9\u0679 \u0644\u06CC\u0646\u0632 \u0645\u0639 \u0641\u0644\u0648\u0688 \u0633\u0648\u0644\u0648\u0634\u0646 \u06A9\u0679\u06D4",
    inStock: true,
    rating: 4.8,
    reviewsCount: 98
  },
  {
    id: "prod-7",
    nameUrdu: "\u06CC\u0648 \u0648\u06CC \u067E\u0631\u0648\u0679\u06CC\u06A9\u0634\u0646 \u0633\u0646 \u06AF\u0644\u0627\u0633\u0632 (Men & Women)",
    nameEnglish: "Polarized UV400 Sunglasses Collection",
    category: "eye",
    categoryUrdu: "\u0622\u0626\u06CC \u06A9\u06CC\u0626\u0631 \u0648 \u0686\u0634\u0645\u06D2",
    pricePKR: 2400,
    originalPricePKR: 3200,
    image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&q=80&w=600",
    descriptionUrdu: "\u062F\u06BE\u0648\u067E \u06A9\u06CC \u0686\u0628\u06BE\u0646 \u0633\u06D2 \u062D\u0641\u0627\u0638\u062A \u06A9\u06D2 \u0644\u06CC\u06D2 \u0688\u06CC\u0632\u0627\u0626\u0646\u0631 \u0627\u0648\u0631 \u067E\u0648\u0644\u0631\u0627\u0626\u0632\u0688 \u0688\u0631\u0627\u0626\u06CC\u0648\u0646\u06AF \u0633\u0646 \u06AF\u0644\u0627\u0633\u0632\u06D4",
    inStock: true,
    rating: 4.9,
    reviewsCount: 210
  },
  // Perfumes & Oud
  {
    id: "prod-8",
    nameUrdu: "\u062D\u0627\u0641\u0638 \u0634\u0627\u06C1\u06CC \u0639\u0648\u062F \u067E\u0631\u0641\u06CC\u0648\u0645 (Royal Oud Perfume 50ml)",
    nameEnglish: "Royal Oud Luxury Perfume (50ml)",
    category: "perfume",
    categoryUrdu: "\u0639\u0637\u0631 \u0648 \u067E\u0631\u0641\u06CC\u0648\u0645 \u06A9\u0644\u06CC\u06A9\u0634\u0646",
    pricePKR: 2800,
    originalPricePKR: 3500,
    image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=600",
    descriptionUrdu: "\u0639\u0631\u0628\u06CC \u0627\u0648\u0631 \u0641\u0631\u0627\u0646\u0633\u06CC\u0633\u06CC \u062E\u0648\u0634\u0628\u0648\u0624\u06BA \u06A9\u0627 \u0634\u0627\u06C1\u06A9\u0627\u0631 \u067E\u0631\u06CC\u0645\u06CC\u0645 \u0627\u0648\u0631 \u0644\u0627\u0646\u06AF \u0644\u0627\u0633\u0679\u0646\u06AF \u0639\u0648\u062F \u067E\u0631\u0641\u06CC\u0648\u0645\u06D4 24 \u06AF\u06BE\u0646\u0679\u06D2 \u062A\u06A9 \u062E\u0648\u0634\u0628\u0648 \u0628\u0631\u0642\u0631\u0627\u0631 \u0631\u06C1\u06D2\u06D4",
    benefitsUrdu: ["\u062E\u0627\u0644\u0635 \u0627\u0648\u0631 \u0627\u0644\u06A9\u062D\u0644 \u0641\u0631\u06CC \u067E\u0631\u06CC\u0645\u06CC\u0645 \u0646\u0648\u0679\u0633", "24 \u06AF\u06BE\u0646\u0679\u06D2 \u067E\u0627\u0626\u06CC\u062F\u0627\u0631\u06CC", "\u062E\u0627\u0635 \u062A\u0642\u0631\u06CC\u0628\u0627\u062A \u0627\u0648\u0631 \u06C1\u062F\u06CC\u06C1 \u06A9\u06D2 \u0644\u06CC\u06D2 \u0644\u0627\u062C\u0648\u0627\u0628"],
    inStock: true,
    rating: 5,
    reviewsCount: 164
  },
  {
    id: "prod-9",
    nameUrdu: "\u062E\u0627\u0644\u0635 \u0633\u0641\u06CC\u062F \u0645\u0633\u06A9 \u0648 \u0631\u0648\u0632 \u0639\u0637\u0631 \u06A9\u0679 (Pure Musk & Rose Attar 12ml)",
    nameEnglish: "Alcohol-Free Musk & Rose Attar Set (12ml)",
    category: "perfume",
    categoryUrdu: "\u0639\u0637\u0631 \u0648 \u067E\u0631\u0641\u06CC\u0648\u0645 \u06A9\u0644\u06CC\u06A9\u0634\u0646",
    pricePKR: 1100,
    originalPricePKR: 1500,
    image: "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&q=80&w=600",
    descriptionUrdu: "\u0646\u0645\u0627\u0632 \u0627\u0648\u0631 \u0631\u0648\u0632\u0645\u0631\u06C1 \u0627\u0633\u062A\u0639\u0645\u0627\u0644 \u06A9\u06D2 \u0644\u06CC\u06D2 \u0627\u0644\u06A9\u062D\u0644 \u0633\u06D2 \u067E\u0627\u06A9 \u062E\u0627\u0644\u0635 \u0633\u0641\u06CC\u062F \u0645\u0633\u06A9\u060C \u06AF\u0644\u0627\u0628 \u0627\u0648\u0631 \u0686\u0646\u062F\u0646 \u06A9\u0627 \u0639\u0637\u0631\u06D4",
    inStock: true,
    rating: 4.9,
    reviewsCount: 230
  }
];
var initialOrders = [
  {
    id: "ord-101",
    customerName: "\u062D\u0627\u062C\u06CC \u0645\u062D\u0645\u062F \u0631\u0641\u06CC\u0642",
    phone: "03014567890",
    city: "\u0633\u06CC\u0627\u0644\u06A9\u0648\u0679",
    address: "\u0645\u062D\u0644\u06C1 \u0645\u0633\u0644\u0645 \u06AF\u0646\u062C\u060C \u06AF\u0644\u06CC \u0646\u0645\u0628\u0631 4\u060C \u0633\u06CC\u0627\u0644\u06A9\u0648\u0679",
    country: "\u067E\u0627\u06A9\u0633\u062A\u0627\u0646",
    items: [
      { product: initialProducts2[0], quantity: 2 },
      { product: initialProducts2[1], quantity: 1 }
    ],
    totalAmountPKR: 4400,
    paymentMethod: "COD",
    status: "Processing",
    createdAt: "2026-08-04"
  }
];
var initialArticles = [
  {
    id: "art-1",
    titleUrdu: "\u062C\u0648\u0691\u0648\u06BA \u0627\u0648\u0631 \u06AF\u06BE\u0679\u0646\u0648\u06BA \u06A9\u06D2 \u062F\u0631\u062F \u0633\u06D2 \u0646\u062C\u0627\u062A \u06A9\u06D2 5 \u0642\u062F\u0631\u062A\u06CC \u0637\u0631\u06CC\u0642\u06D2",
    titleEnglish: "5 Natural Ways to Relief Joint & Knee Pain",
    category: "\u062F\u0631\u062F \u0627\u0648\u0631 \u0645\u06C1\u0631\u06D2",
    categoryUrdu: "\u062F\u0631\u062F \u0627\u0648\u0631 \u0645\u06C1\u0631\u06D2",
    date: "15 \u0645\u0626\u06CC 2026",
    author: "\u0688\u0627\u06A9\u0679\u0631 \u0632\u06CC\u0634\u0627\u0646 \u0686\u0648\u06C1\u062F\u0631\u06CC",
    authorUrdu: "\u0688\u0627\u06A9\u0679\u0631 \u0632\u06CC\u0634\u0627\u0646 \u0686\u0648\u06C1\u062F\u0631\u06CC (\u0645\u0628\u0634\u0631 \u0641\u0632\u06CC\u0634\u0646)",
    authorEnglish: "Dr. Zeeshan Chaudhry (Senior Physician)",
    readTime: "4 min read",
    excerptUrdu: "\u062C\u0648\u0691\u0648\u06BA \u06A9\u0627 \u062F\u0631\u062F \u0628\u0691\u06BE\u062A\u06CC \u0639\u0645\u0631 \u06CC\u0627 \u06CC\u0648\u0631\u06A9 \u0627\u06CC\u0633\u0688 \u06A9\u06CC \u0648\u062C\u06C1 \u0633\u06D2 \u06C1\u0648 \u062A\u0648 \u0637\u0628\u06CC \u063A\u0630\u0627\u0626\u06CC\u062A \u0627\u0648\u0631 \u0642\u062F\u0631\u062A\u06CC \u0645\u0633\u0627\u062C \u0633\u06D2 \u06A9\u06CC\u0633\u06D2 \u0631\u0627\u062D\u062A \u062D\u0627\u0635\u0644 \u06A9\u06CC \u062C\u0627\u0626\u06D2\u06D4",
    excerptEnglish: "Learn how to manage joint pain and uric acid naturally using herbal nutrition, posture adjustments, and targeted massage.",
    contentUrdu: `\u062C\u0648\u0691\u0648\u06BA \u06A9\u0627 \u062F\u0631\u062F \u0622\u062C \u06A9\u0644 \u06C1\u0631 \u062F\u0648\u0633\u0631\u06D2 \u0634\u062E\u0635 \u06A9\u0627 \u0645\u0633\u0626\u0644\u06C1 \u0628\u0646 \u0686\u06A9\u0627 \u06C1\u06D2\u06D4 \u0627\u0633 \u06A9\u06CC \u0628\u0646\u06CC\u0627\u062F\u06CC \u0648\u062C\u0648\u06C1\u0627\u062A \u0645\u06CC\u06BA \u0648\u0679\u0627\u0645\u0646 \u0688\u06CC \u06A9\u06CC \u06A9\u0645\u06CC\u060C \u06CC\u0648\u0631\u06A9 \u0627\u06CC\u0633\u0688 \u06A9\u06CC \u0632\u06CC\u0627\u062F\u06C1 \u0645\u0642\u062F\u0627\u0631 \u0627\u0648\u0631 \u062C\u0648\u0691\u0648\u06BA \u06A9\u06CC \u0686\u06A9\u0646\u0627\u0626\u06CC (Synovial Fluid) \u06A9\u0627 \u062E\u0634\u06A9 \u06C1\u0648\u0646\u0627 \u0634\u0627\u0645\u0644 \u06C1\u06CC\u06BA\u06D4

\u06F1\u06D4 \u0635\u0628\u062D \u06C1\u0644\u06A9\u06CC \u062F\u06BE\u0648\u067E \u0645\u06CC\u06BA \u0628\u06CC\u0679\u06BE\u0646\u0627: \u0631\u0648\u0632\u0627\u0646\u06C1 15 \u0633\u06D2 20 \u0645\u0646\u0679 \u0635\u0628\u062D \u06A9\u06CC \u062F\u06BE\u0648\u067E \u0645\u06CC\u06BA \u0628\u06CC\u0679\u06BE\u0646\u06D2 \u0633\u06D2 \u0648\u0679\u0627\u0645\u0646 \u0688\u06CC \u06A9\u06CC \u0642\u062F\u0631\u062A\u06CC \u0645\u0642\u062F\u0627\u0631 \u067E\u0648\u0631\u06CC \u06C1\u0648\u062A\u06CC \u06C1\u06D2\u06D4
\u06F2\u06D4 \u0632\u06CC\u062A\u0648\u0646 \u0627\u0648\u0631 \u0633\u0631\u062E \u0645\u0631\u0686 \u06A9\u06D2 \u062A\u06CC\u0644 \u06A9\u0627 \u0645\u0633\u0627\u062C: \u062D\u0627\u0641\u0638 \u06A9\u0644\u06CC\u0646\u06A9 \u062C\u0648\u0627\u0626\u0646\u0679 \u06A9\u06CC\u0626\u0631 \u0622\u0626\u0644 \u0633\u06D2 \u0631\u0648\u0632\u0627\u0646\u06C1 \u0631\u0627\u062A \u06C1\u0644\u06A9\u06D2 \u06C1\u0627\u062A\u06BE \u0633\u06D2 \u0645\u0633\u0627\u062C \u06A9\u0631\u06CC\u06BA\u06D4
\u06F3\u06D4 \u067E\u0627\u0646\u06CC \u06A9\u0627 \u0648\u0627\u0641\u0631 \u0627\u0633\u062A\u0639\u0645\u0627\u0644: \u062F\u0646 \u0645\u06CC\u06BA \u06A9\u0645 \u0627\u0632 \u06A9\u0645 10 \u0633\u06D2 12 \u06AF\u0644\u0627\u0633 \u067E\u0627\u0646\u06CC \u067E\u0626\u06CC\u06BA \u062A\u0627 \u06A9\u06C1 \u06CC\u0648\u0631\u06A9 \u0627\u06CC\u0633\u0688 \u06AF\u0631\u062F\u0648\u06BA \u06A9\u06D2 \u0630\u0631\u06CC\u0639\u06D2 \u062E\u0627\u0631\u062C \u06C1\u0648 \u062C\u0627\u0626\u06D2\u06D4
\u06F4\u06D4 \u06C1\u0644\u06A9\u06CC \u0641\u0632\u06CC\u0648\u062A\u06BE\u0631\u0627\u067E\u06CC \u0648\u0631\u0632\u0634\u06CC\u06BA: \u06AF\u06BE\u0679\u0646\u0648\u06BA \u06A9\u06CC \u0644\u0686\u06A9 \u0628\u062D\u0627\u0644 \u0631\u06A9\u06BE\u0646\u06D2 \u06A9\u06D2 \u0644\u06CC\u06D2 \u0631\u0648\u0632\u0627\u0646\u06C1 \u06C1\u0644\u06A9\u06CC \u0648\u0627\u06A9 \u0627\u0648\u0631 \u0641\u0632\u06CC\u0648\u062A\u06BE\u0631\u0627\u067E\u06CC \u0627\u0633\u0679\u0631\u06CC\u0686\u0646\u06AF \u06A9\u0631\u06CC\u06BA\u06D4
\u06F5\u06D4 \u067E\u0631\u06C1\u06CC\u0632 \u0648 \u063A\u0630\u0627\u0626\u06CC\u062A: \u0628\u0691\u0627 \u06AF\u0648\u0634\u062A\u060C \u0686\u0627\u0648\u0644 \u0627\u0648\u0631 \u0688\u0628\u06D2 \u0648\u0627\u0644\u06D2 \u0645\u0634\u0631\u0648\u0628\u0627\u062A \u0633\u06D2 \u067E\u0631\u06C1\u06CC\u0632 \u06A9\u0631\u06CC\u06BA\u06D4`,
    contentEnglish: `Joint pain is becoming increasingly common due to vitamin D deficiency, elevated uric acid levels, and loss of synovial fluid in knees.

1. Morning Sunlight: Spend 15-20 minutes in gentle morning sunlight to restore Vitamin D levels naturally.
2. Herbal Oil Massage: Use Hafiz Joint Care herbal oil for a gentle night massage to improve blood circulation.
3. Adequate Hydration: Drink 10-12 glasses of water daily to flush excess uric acid via kidneys.
4. Physiotherapy Exercises: Perform daily low-impact stretches to preserve joint mobility.
5. Dietary Restrictions: Avoid excessive red meat, cold beverages, and refined flour.`,
    imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800",
    likes: 42,
    tags: ["\u062F\u0631\u062F", "\u06AF\u06BE\u0679\u0646\u06D2", "\u062C\u0648\u0627\u0626\u0646\u0679 \u06A9\u06CC\u0626\u0631", "Joint Pain", "Uric Acid"]
  },
  {
    id: "art-2",
    titleUrdu: "\u0645\u0648\u0628\u0627\u0626\u0644 \u0627\u0648\u0631 \u06A9\u0645\u067E\u06CC\u0648\u0679\u0631 \u06A9\u06CC \u0628\u0644\u06CC\u0648 \u0644\u0627\u0626\u0679 \u0633\u06D2 \u0622\u0646\u06A9\u06BE\u0648\u06BA \u06A9\u06CC \u062D\u0641\u0627\u0638\u062A \u06A9\u0627 \u0637\u0631\u06CC\u0642\u06C1",
    titleEnglish: "Protecting Eyes from Mobile & Computer Blue Light",
    category: "\u0622\u0626\u06CC \u06A9\u06CC\u0626\u0631",
    categoryUrdu: "\u0622\u0626\u06CC \u06A9\u06CC\u0626\u0631 (\u0686\u0634\u0645\u06D2)",
    date: "20 \u062C\u0648\u0646 2026",
    author: "\u0688\u0627\u06A9\u0679\u0631 \u0648\u0642\u0627\u0635 \u0635\u063A\u06CC\u0631",
    authorUrdu: "\u0688\u0627\u06A9\u0679\u0631 \u0648\u0642\u0627\u0635 \u0635\u063A\u06CC\u0631 (\u0622\u0626\u06CC \u0648 \u0641\u0632\u06CC\u0648 \u0633\u067E\u06CC\u0634\u0644\u0633\u0679)",
    authorEnglish: "Dr. Waqas Sageer (Eye & Rehab Specialist)",
    readTime: "3 min read",
    excerptUrdu: "\u0627\u0633\u06A9\u0631\u06CC\u0646 \u06A9\u0627 \u0632\u06CC\u0627\u062F\u06C1 \u0627\u0633\u062A\u0639\u0645\u0627\u0644 \u0622\u0646\u06A9\u06BE\u0648\u06BA \u0645\u06CC\u06BA \u062E\u0634\u06A9\u06CC \u0627\u0648\u0631 \u0628\u06CC\u0646\u0627\u0626\u06CC \u06A9\u0648 \u062F\u06BE\u0646\u062F\u0644\u0627 \u06A9\u0631 \u0633\u06A9\u062A\u0627 \u06C1\u06D2\u06D4 Blue Cut \u06AF\u0644\u0627\u0633\u0632 \u06A9\u0627 \u06A9\u0631\u062F\u0627\u0631\u06D4",
    excerptEnglish: "Excessive screen time causes dry eyes and strain. Discover the 20-20-20 rule and Blue Cut anti-glare optical glasses.",
    contentUrdu: `\u0631\u0648\u0632\u0645\u0631\u06C1 \u0632\u0646\u062F\u06AF\u06CC \u0645\u06CC\u06BA \u0645\u0648\u0628\u0627\u0626\u0644 \u0627\u0648\u0631 \u0644\u06CC\u067E \u0679\u0627\u067E \u06A9\u0627 \u0627\u0633\u062A\u0639\u0645\u0627\u0644 \u0646\u0627\u06AF\u0632\u06CC\u0631 \u06C1\u0648 \u0686\u06A9\u0627 \u06C1\u06D2\u06D4 \u062A\u0627\u06C1\u0645 \u0627\u0633\u06A9\u0631\u06CC\u0646 \u0633\u06D2 \u0646\u06A9\u0644\u0646\u06D2 \u0648\u0627\u0644\u06CC HEV Blue Rays \u0622\u0646\u06A9\u06BE\u0648\u06BA \u06A9\u06D2 \u0631\u06CC\u0679\u06CC\u0646\u0627 \u06A9\u0648 \u0645\u062A\u0627\u062B\u0631 \u06A9\u0631\u062A\u06CC \u06C1\u06CC\u06BA\u06D4

\u06F1\u06D4 20-20-20 \u06A9\u0627 \u0642\u0627\u0646\u0648\u0646 \u0627\u067E\u0646\u0627\u0626\u06CC\u06BA: \u06C1\u0631 20 \u0645\u0646\u0679 \u0628\u0639\u062F 20 \u0633\u06CC\u06A9\u0646\u0688 \u06A9\u06D2 \u0644\u06CC\u06D2 20 \u0641\u0679 \u062F\u0648\u0631 \u06A9\u0633\u06CC \u0686\u06CC\u0632 \u06A9\u0648 \u062F\u06CC\u06A9\u06BE\u06CC\u06BA\u06D4
\u06F2\u06D4 Blue Cut Glasses \u0627\u0633\u062A\u0639\u0645\u0627\u0644 \u06A9\u0631\u06CC\u06BA: \u062E\u0627\u0635 \u0646\u06CC\u0644\u06CC \u0631\u0648\u0634\u0646\u06CC \u06A9\u0648 \u0631\u0648\u06A9\u0646\u06D2 \u0648\u0627\u0644\u06D2 \u0686\u0634\u0645\u06D2 \u067E\u06C1\u0646 \u06A9\u0631 \u06A9\u0627\u0645 \u06A9\u0631\u06CC\u06BA\u06D4
\u06F3\u06D4 \u0622\u0646\u06A9\u06BE\u0648\u06BA \u0645\u06CC\u06BA \u0639\u0631\u0642 \u06AF\u0644\u0627\u0628 \u06A9\u06CC \u0688\u0631\u0627\u067E\u0633: \u0631\u0627\u062A \u06A9\u0648 \u0633\u0648\u0646\u06D2 \u0633\u06D2 \u067E\u06C1\u0644\u06D2 \u0622\u0646\u06A9\u06BE\u0648\u06BA \u06A9\u0648 \u0679\u06BE\u0646\u0688\u06D2 \u067E\u0627\u0646\u06CC \u0633\u06D2 \u062F\u06BE\u0648\u0626\u06CC\u06BA\u06D4
\u06F4\u06D4 \u0644\u0627\u0626\u0679 \u06A9\u0646\u0679\u0631\u0648\u0644: \u0627\u0646\u062F\u06BE\u06CC\u0631\u06D2 \u06A9\u0645\u0631\u06D2 \u0645\u06CC\u06BA \u0645\u0648\u0628\u0627\u0626\u0644 \u0627\u0633\u06A9\u0631\u06CC\u0646 \u06A9\u0627 \u0627\u0633\u062A\u0639\u0645\u0627\u0644 \u06C1\u0631\u06AF\u0632 \u0646\u06C1 \u06A9\u0631\u06CC\u06BA\u06D4`,
    contentEnglish: `Smartphones and laptops emit high-energy visible (HEV) blue light that can strain the retina and dry out the cornea.

1. Practice the 20-20-20 Rule: Every 20 minutes, look at an object 20 feet away for 20 seconds.
2. Wear Blue Cut Lenses: Use anti-blue ray computer glasses during long working hours.
3. Proper Lighting: Avoid using phones in pitch-dark rooms to prevent eye fatigue.
4. Eye Drop & Hydration: Keep eyes lubricated with natural rose water or prescribed drops.`,
    imageUrl: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=800",
    likes: 38,
    tags: ["\u0622\u0626\u06CC \u06A9\u06CC\u0626\u0631", "\u0686\u0634\u0645\u06D2", "Eye Care", "Blue Cut", "Optical"]
  },
  {
    id: "art-3",
    titleUrdu: "\u06A9\u0645\u067E\u06CC\u0648\u0679\u0631\u0627\u0626\u0632\u0688 \u0628\u0627\u0688\u06CC \u0627\u0633\u06A9\u06CC\u0646 \u0627\u0648\u0631 \u06A9\u0648\u0627\u0646\u0679\u0645 \u0686\u06CC\u06A9 \u0627\u067E \u06A9\u06CC \u0627\u06C1\u0645\u06CC\u062A",
    titleEnglish: "Importance of Computerized Body Scan & Quantum Diagnosis",
    category: "\u0688\u0627\u0626\u06CC\u06AF\u0646\u0648\u0633\u0633",
    categoryUrdu: "\u06A9\u0645\u067E\u06CC\u0648\u0679\u0631 \u0686\u06CC\u06A9 \u0627\u067E",
    date: "02 \u062C\u0648\u0644\u0627\u0626\u06CC 2026",
    author: "\u0688\u0627\u06A9\u0679\u0631 \u0632\u06CC\u0634\u0627\u0646 \u0686\u0648\u06C1\u062F\u0631\u06CC",
    authorUrdu: "\u0688\u0627\u06A9\u0679\u0631 \u0632\u06CC\u0634\u0627\u0646 \u0686\u0648\u06C1\u062F\u0631\u06CC",
    authorEnglish: "Dr. Zeeshan Chaudhry",
    readTime: "5 min read",
    excerptUrdu: "\u0628\u063A\u06CC\u0631 \u062E\u0648\u0646 \u0644\u06CC\u06D2 \u062C\u0633\u0645 \u06A9\u06D2 \u062A\u0645\u0627\u0645 \u0627\u0646\u062F\u0631\u0648\u0646\u06CC \u0627\u0639\u0636\u0627\u0621\u060C \u062C\u06AF\u0631\u060C \u06AF\u0631\u062F\u06D2 \u0627\u0648\u0631 \u062F\u0644 \u06A9\u06D2 \u0633\u06AF\u0646\u0644\u0632 \u06A9\u06CC \u06A9\u0645\u067E\u06CC\u0648\u0679\u0631\u0627\u0626\u0632\u0688 \u0631\u067E\u0648\u0631\u0679 \u06A9\u0627 \u0637\u0631\u06CC\u0642\u06C1\u06D4",
    excerptEnglish: "Learn how non-invasive electromagnetic computerized bio-scans detect health imbalances before severe symptoms appear.",
    contentUrdu: `\u062C\u062F\u06CC\u062F \u0628\u0627\u0626\u06CC\u0648 \u0627\u0644\u06CC\u06A9\u0679\u0631\u0627\u0646\u06A9 \u06A9\u0648\u0627\u0646\u0679\u0645 \u0627\u0633\u06A9\u06CC\u0646\u0631 \u0688\u06CC\u0648\u0627\u0626\u0633 \u062C\u0633\u0645 \u06A9\u06D2 \u0633\u06CC\u0644\u0648\u0644\u0631 \u0633\u06AF\u0646\u0644\u0632 \u06A9\u0627 \u062A\u062C\u0632\u06CC\u06C1 \u06A9\u0631 \u06A9\u06D2 \u0645\u0646\u0679\u0648\u06BA \u0645\u06CC\u06BA \u062A\u0645\u0627\u0645 \u0627\u0646\u062F\u0631\u0648\u0646\u06CC \u0627\u0639\u0636\u0627\u0621 \u06A9\u06CC \u0631\u067E\u0648\u0631\u0679 \u0641\u0631\u0627\u06C1\u0645 \u06A9\u0631\u062A\u06CC \u06C1\u06D2\u06D4

\u06F1\u06D4 \u0628\u063A\u06CC\u0631 \u0633\u0648\u0626\u06CC \u06A9\u06D2 \u0686\u06CC\u06A9 \u0627\u067E: \u0627\u0633 \u0679\u06CC\u0633\u0679 \u0645\u06CC\u06BA \u06A9\u0648\u0626\u06CC \u0628\u0644\u0688 \u0633\u06CC\u0645\u067E\u0644 \u0646\u06C1\u06CC\u06BA \u0644\u06CC\u0627 \u062C\u0627\u062A\u0627\u060C \u06C1\u0627\u062A\u06BE \u06A9\u06D2 \u0633\u06CC\u0646\u0633\u0631 \u0633\u06D2 \u0686\u06CC\u06A9 \u0627\u067E \u06C1\u0648\u062A\u0627 \u06C1\u06D2\u06D4
\u06F2\u06D4 \u0627\u0639\u0636\u0627\u0621 \u06A9\u06CC \u06A9\u0627\u0631\u06A9\u0631\u062F\u06AF\u06CC: \u062C\u06AF\u0631 \u06A9\u06CC \u0686\u0631\u0628\u06CC\u060C \u06AF\u0631\u062F\u06D2 \u06A9\u06D2 \u0627\u0641\u0639\u0627\u0644\u060C \u0627\u0648\u0631 \u0645\u0639\u062F\u06C1 \u06A9\u06CC \u062A\u06CC\u0632\u0627\u0628\u06CC\u062A \u06A9\u0627 \u0641\u0648\u0631\u06CC \u0639\u0644\u0645 \u06C1\u0648\u062A\u0627 \u06C1\u06D2\u06D4
\u06F3\u06D4 \u0648\u0679\u0627\u0645\u0646\u0632 \u0627\u0648\u0631 \u0645\u0646\u0631\u0644\u0632 \u06A9\u06CC \u06A9\u0645\u06CC: \u0628\u0627\u0688\u06CC \u0645\u06CC\u06BA \u06A9\u06CC\u0644\u0634\u06CC\u0645\u060C \u0648\u0679\u0627\u0645\u0646 \u0628\u06CC12 \u0627\u0648\u0631 \u0632\u0646\u06A9 \u06A9\u06CC \u0645\u0642\u062F\u0627\u0631 \u06A9\u0627 \u062A\u0639\u06CC\u0646\u06D4`,
    contentEnglish: `Bio-quantum computerized body analyzers assess cellular electromagnetic signals to provide comprehensive health insights safely and non-invasively.

1. Non-Invasive Diagnostic: No blood sampling or needle prick needed\u2014simply hold the bio-sensor wand.
2. Organ Function Analysis: Evaluates liver fat, kidney clearance, gastric activity, and vascular flow.
3. Vitamin & Mineral Check: Detects deficiencies in calcium, zinc, iron, and B-complex vitamins instantly.`,
    imageUrl: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=800",
    likes: 55,
    tags: ["\u06A9\u0645\u067E\u06CC\u0648\u0679\u0631 \u0686\u06CC\u06A9 \u0627\u067E", "\u06A9\u0648\u0627\u0646\u0679\u0645 \u0627\u0633\u06A9\u06CC\u0646", "Quantum Scan", "Diagnosis"]
  },
  {
    id: "art-4",
    titleUrdu: "\u0645\u0639\u062F\u06D2 \u06A9\u06CC \u062A\u06CC\u0632\u0627\u0628\u06CC\u062A\u060C \u06AF\u06CC\u0633 \u0627\u0648\u0631 \u062C\u06AF\u0631 \u06A9\u06CC \u06AF\u0631\u0645\u06CC \u06A9\u0627 \u0642\u062F\u0631\u062A\u06CC \u0639\u0644\u0627\u062C",
    titleEnglish: "Natural Remedies for Gastric Acidity, Bloating & Liver Heat",
    category: "\u0645\u0639\u062F\u06C1 \u0648 \u062C\u06AF\u0631",
    categoryUrdu: "\u0645\u0639\u062F\u06C1 \u0648 \u062C\u06AF\u0631",
    date: "10 \u062C\u0648\u0644\u0627\u0626\u06CC 2026",
    author: "\u0688\u0627\u06A9\u0679\u0631 \u0632\u06CC\u0634\u0627\u0646 \u0686\u0648\u06C1\u062F\u0631\u06CC",
    authorUrdu: "\u0688\u0627\u06A9\u0679\u0631 \u0632\u06CC\u0634\u0627\u0646 \u0686\u0648\u06C1\u062F\u0631\u06CC",
    authorEnglish: "Dr. Zeeshan Chaudhry",
    readTime: "4 min read",
    excerptUrdu: "\u0645\u0639\u062F\u06D2 \u0645\u06CC\u06BA \u062C\u0644\u0646\u060C \u0627\u067E\u06BE\u0627\u0631\u06C1 \u0627\u0648\u0631 \u062C\u06AF\u0631 \u06A9\u06CC \u06AF\u0631\u0645\u06CC \u0633\u06D2 \u0646\u062C\u0627\u062A \u06A9\u06D2 \u0644\u06CC\u06D2 \u0646\u0628\u0627\u062A\u06CC \u0646\u0633\u062E\u06C1 \u062C\u0627\u062A \u0627\u0648\u0631 \u0627\u062D\u062A\u06CC\u0627\u0637\u06CC \u062A\u062F\u0627\u0628\u06CC\u0631\u06D4",
    excerptEnglish: "Effective lifestyle and herbal tips to relieve acidity, heartburn, fatty liver, and chronic bloating naturally.",
    contentUrdu: `\u063A\u0644\u0637 \u0637\u0631\u0632\u0650 \u0632\u0646\u062F\u06AF\u06CC \u0627\u0648\u0631 \u0641\u0627\u0633\u0679 \u0641\u0648\u0688 \u06A9\u06D2 \u0645\u0633\u0644\u0633\u0644 \u0627\u0633\u062A\u0639\u0645\u0627\u0644 \u0633\u06D2 \u0645\u0639\u062F\u06C1 \u0645\u06CC\u06BA \u062A\u06CC\u0632\u0627\u0628\u06CC\u062A \u0627\u0648\u0631 \u062C\u06AF\u0631 \u0645\u06CC\u06BA \u06AF\u0631\u0645\u06CC \u067E\u06CC\u062F\u0627 \u06C1\u0648 \u062C\u0627\u062A\u06CC \u06C1\u06D2\u06D4

\u06F1\u06D4 \u0633\u0648\u0646\u0641 \u0627\u0648\u0631 \u0627\u0644\u0627\u0626\u0686\u06CC \u06A9\u0627 \u0642\u06C1\u0648\u06C1: \u06A9\u06BE\u0627\u0646\u06D2 \u06A9\u06D2 \u0628\u0639\u062F \u0633\u0648\u0646\u0641 \u0627\u0648\u0631 \u0633\u0628\u0632 \u0627\u0644\u0627\u0626\u0686\u06CC \u06A9\u0627 \u06AF\u0631\u0645 \u0642\u06C1\u0648\u06C1 \u0645\u0639\u062F\u06C1 \u06A9\u0648 \u0641\u0648\u0631\u06CC \u0633\u06A9\u0648\u0646 \u062F\u06CC\u062A\u0627 \u06C1\u06D2\u06D4
\u06F2\u06D4 \u0648\u0642\u062A \u067E\u0631 \u06A9\u06BE\u0627\u0646\u0627 \u06A9\u06BE\u0627\u0646\u0627: \u0631\u0627\u062A \u06A9\u0627 \u06A9\u06BE\u0627\u0646\u0627 \u0633\u0648\u0646\u06D2 \u0633\u06D2 \u06A9\u0645 \u0627\u0632 \u06A9\u0645 2 \u06AF\u06BE\u0646\u0679\u06D2 \u067E\u06C1\u0644\u06D2 \u06A9\u06BE\u0627\u0626\u06CC\u06BA\u06D4
\u06F3\u06D4 \u0645\u0631\u063A\u0646 \u0627\u0634\u06CC\u0627\u0621 \u0633\u06D2 \u067E\u0631\u06C1\u06CC\u0632: \u062A\u0644\u06CC \u06C1\u0648\u0626\u06CC \u0686\u06CC\u0632\u0648\u06BA \u0627\u0648\u0631 \u0645\u0631\u0686 \u0645\u0635\u0627\u0644\u062D\u06C1 \u06A9\u0648 \u0645\u062D\u062F\u0648\u062F \u06A9\u0631\u06CC\u06BA\u06D4`,
    contentEnglish: `Poor dietary habits and fast food often cause chronic acidity, bloating, and sluggish liver digestion.

1. Fennel & Cardamom Infusion: Drink warm fennel tea after meals to soothe the digestive lining.
2. Meal Timing: Have dinner at least 2 hours before sleeping to avoid acid reflux.
3. Avoid Deep Fried Foods: Limit excessive spices, carbonated drinks, and processed oils.`,
    imageUrl: "https://images.unsplash.com/photo-1505576399279-565b52d4ac71?auto=format&fit=crop&q=80&w=800",
    likes: 61,
    tags: ["\u0645\u0639\u062F\u06C1", "\u062C\u06AF\u0631", "Gastro", "Acidity", "Herbal Care"]
  },
  {
    id: "art-5",
    titleUrdu: "\u0628\u0627\u0644 \u06AF\u0631\u0646\u06D2 \u06A9\u06CC \u0628\u0646\u06CC\u0627\u062F\u06CC \u0648\u062C\u0648\u06C1\u0627\u062A \u0627\u0648\u0631 \u06C1\u0648\u0631\u0627\u0628 \u06C1\u06CC\u0626\u0631 \u0622\u0626\u0644 \u06A9\u06CC \u0627\u0641\u0627\u062F\u06CC\u062A",
    titleEnglish: "Root Causes of Hair Loss & Benefits of Hoorab Herbal Oil",
    category: "\u06C1\u06CC\u0626\u0631 \u06A9\u06CC\u0626\u0631",
    categoryUrdu: "\u06C1\u06CC\u0626\u0631 \u0622\u0626\u0644 \u0648 \u0633\u06A9\u0646",
    date: "18 \u062C\u0648\u0644\u0627\u0626\u06CC 2026",
    author: "\u0688\u0627\u06A9\u0679\u0631 \u0648\u0642\u0627\u0635 \u0635\u063A\u06CC\u0631",
    authorUrdu: "\u0688\u0627\u06A9\u0679\u0631 \u0648\u0642\u0627\u0635 \u0635\u063A\u06CC\u0631 \u0686\u0648\u06C1\u062F\u0631\u06CC",
    authorEnglish: "Dr. Waqas Sageer Chaudhry",
    readTime: "3 min read",
    excerptUrdu: "\u0628\u0627\u0644\u0648\u06BA \u06A9\u0627 \u0648\u0642\u062A \u0633\u06D2 \u067E\u06C1\u0644\u06D2 \u0633\u0641\u06CC\u062F \u06C1\u0648\u0646\u0627\u060C \u062E\u0634\u06A9\u06CC \u0627\u0648\u0631 \u06AF\u0646\u062C \u067E\u0646 \u0633\u06D2 \u0628\u0686\u0627\u0624 \u06A9\u06D2 \u0644\u06CC\u06D2 \u0642\u062F\u0631\u062A\u06CC \u062C\u0691\u06CC \u0628\u0648\u0679\u06CC\u0648\u06BA \u0633\u06D2 \u062A\u06CC\u0627\u0631 \u06A9\u0631\u062F\u06C1 \u06C1\u0648\u0631\u0627\u0628 \u0622\u0626\u0644\u06D4",
    excerptEnglish: "Combat premature hair thinning, dandruff, and scalp dryness using pure cold-pressed botanical herbal oils.",
    contentUrdu: `\u0628\u0627\u0644\u0648\u06BA \u06A9\u06CC \u0635\u062D\u062A \u06A9\u0627 \u062A\u0639\u0644\u0642 \u0633\u0631 \u06A9\u06CC \u062C\u0644\u062F (Scalp Blood Circulation) \u0627\u0648\u0631 \u063A\u0630\u0627\u0626\u06CC \u0639\u0646\u0627\u0635\u0644 \u0633\u06D2 \u06C1\u06D2\u06D4

\u06F1\u06D4 \u0622\u0645\u0644\u06C1\u060C \u0633\u06CC\u06A9\u0627 \u06A9\u0627\u0626\u06CC \u0627\u0648\u0631 \u0631\u0648\u063A\u0646\u0650 \u0632\u06CC\u062A\u0648\u0646 \u06A9\u0627 \u0627\u0645\u062A\u0632\u0627\u062C \u0628\u0627\u0644\u0648\u06BA \u06A9\u06CC \u062C\u0691\u0648\u06BA \u06A9\u0648 \u0645\u0636\u0628\u0648\u0637 \u0628\u0646\u0627\u062A\u0627 \u06C1\u06D2\u06D4
\u06F2\u06D4 \u06C1\u0641\u062A\u06D2 \u0645\u06CC\u06BA 3 \u0628\u0627\u0631 \u0627\u0646\u06AF\u0644\u06CC\u0648\u06BA \u06A9\u06D2 \u067E\u0648\u0631\u0648\u06BA \u0633\u06D2 10 \u0645\u0646\u0679 \u06A9\u0627 \u0645\u0633\u0627\u062C \u06A9\u0631\u06CC\u06BA\u06D4
\u06F3\u06D4 \u06A9\u06CC\u0645\u06CC\u06A9\u0644 \u0648\u0627\u0644\u06D2 \u0634\u06CC\u0645\u067E\u0648 \u06A9\u06D2 \u0628\u062C\u0627\u0626\u06D2 \u0627\u0631\u06AF\u06CC\u0646\u06A9 \u0634\u06CC\u0645\u067E\u0648 \u06A9\u0627 \u0627\u0633\u062A\u0639\u0645\u0627\u0644 \u06A9\u0631\u06CC\u06BA\u06D4`,
    contentEnglish: `Healthy hair requires optimal scalp blood circulation and vital nutrients like Vitamin E and essential fatty acids.

1. Pure Herbal Botanical Blend: Amla, Sikakai, and Cold-pressed Olive Oil strengthen hair follicles.
2. Scalp Massage Routine: Gently massage scalp for 10 minutes 3 times a week.
3. Avoid Harsh Chemicals: Switch to sulfate-free herbal shampoos.`,
    imageUrl: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=800",
    likes: 47,
    tags: ["\u06C1\u06CC\u0626\u0631 \u0622\u0626\u0644", "\u0628\u0627\u0644\u0648\u06BA \u06A9\u0627 \u0639\u0644\u0627\u062C", "Hair Care", "Hoorab Oil"]
  }
];

// src/services/sitemapGenerator.ts
var DEFAULT_CLINIC_DOMAIN = "https://hafizclinic.com";
function resolveCurrentDomain(customDomain) {
  if (customDomain && customDomain.trim()) {
    return customDomain.trim().replace(/\/+$/, "");
  }
  if (typeof window !== "undefined" && window.location && window.location.origin) {
    if (!window.location.origin.includes("localhost") && !window.location.origin.includes("127.0.0.1")) {
      return window.location.origin.replace(/\/+$/, "");
    }
  }
  return DEFAULT_CLINIC_DOMAIN;
}
function escapeXml(unsafe) {
  return unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}
function getSitemapRoutes(options = {}) {
  const domain = resolveCurrentDomain(options.domain);
  const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  const productsList = options.products && options.products.length > 0 ? options.products : initialProducts2;
  const diseasesList = options.diseases && options.diseases.length > 0 ? options.diseases : initialDiseases2;
  const articlesList = options.articles && options.articles.length > 0 ? options.articles : initialArticles;
  const routes = [
    // -------------------------------------------------------------------------
    // 1. Home & Primary Clinical Pillar Routes
    // -------------------------------------------------------------------------
    {
      loc: `${domain}/`,
      lastmod: today,
      changefreq: "daily",
      priority: 1,
      category: "core",
      title: "Hafiz Clinic & Healthcare System \u2014 Home",
      titleUrdu: "\u062D\u0627\u0641\u0638 \u06A9\u0644\u06CC\u0646\u06A9 \u2014 \u06C1\u0648\u0645 \u067E\u06CC\u062C \u0648 \u0628\u0646\u06CC\u0627\u062F\u06CC \u0637\u0628\u06CC \u062E\u062F\u0645\u0627\u062A"
    },
    {
      loc: `${domain}/#services`,
      lastmod: today,
      changefreq: "weekly",
      priority: 0.9,
      category: "services",
      title: "Specialized Medical Services & OPD Departments",
      titleUrdu: "\u0637\u0628\u06CC \u062E\u062F\u0645\u0627\u062A \u0648 \u0633\u067E\u06CC\u0634\u0644\u0627\u0626\u0632\u0688 \u0627\u0648 \u067E\u06CC \u0688\u06CC \u0634\u0639\u0628\u06C1 \u062C\u0627\u062A"
    },
    {
      loc: `${domain}/#eyecare`,
      lastmod: today,
      changefreq: "weekly",
      priority: 0.85,
      category: "services",
      title: "Hafiz Vision Center \u2014 Computerized Optical Diagnostics",
      titleUrdu: "\u062D\u0627\u0641\u0638 \u0648\u06CC\u0698\u0646 \u0633\u06CC\u0646\u0679\u0631 \u2014 \u0622\u0646\u06A9\u06BE\u0648\u06BA \u06A9\u0627 \u06A9\u0645\u067E\u06CC\u0648\u0679\u0631\u0627\u0626\u0632\u0688 \u0645\u0639\u0627\u0626\u0646\u06C1"
    },
    {
      loc: `${domain}/#physiotherapy`,
      lastmod: today,
      changefreq: "weekly",
      priority: 0.85,
      category: "services",
      title: "Physiotherapy & Rehabilitation Center",
      titleUrdu: "\u0641\u0632\u06CC\u0648\u062A\u06BE\u0631\u0627\u067E\u06CC \u0648 \u0645\u06C1\u0631\u0648\u06BA \u06A9\u06CC \u0628\u062D\u0627\u0644\u06CC \u06A9\u0627 \u0645\u0631\u06A9\u0632"
    },
    {
      loc: `${domain}/#appointment`,
      lastmod: today,
      changefreq: "daily",
      priority: 0.85,
      category: "core",
      title: "Book Doctor Appointment & OPD Token",
      titleUrdu: "\u0622\u0646 \u0644\u0627\u0626\u0646 \u0688\u0627\u06A9\u0679\u0631 \u0627\u067E\u0627\u0626\u0646\u0679\u0645\u0646\u0679 \u0648 \u0627\u0648 \u067E\u06CC \u0688\u06CC \u0679\u0648\u06A9\u0646"
    },
    {
      loc: `${domain}/#lab-reports`,
      lastmod: today,
      changefreq: "daily",
      priority: 0.8,
      category: "services",
      title: "Pathology & Diagnostic Laboratory Reports",
      titleUrdu: "\u067E\u06CC\u062A\u06BE\u0627\u0644\u0648\u062C\u06CC \u0644\u06CC\u0628 \u0648 \u062A\u0634\u062E\u06CC\u0635\u06CC \u0631\u067E\u0648\u0631\u0679\u0633"
    },
    {
      loc: `${domain}/#patient-portal`,
      lastmod: today,
      changefreq: "weekly",
      priority: 0.75,
      category: "core",
      title: "Patient Portal & Telemedicine Records",
      titleUrdu: "\u0645\u0631\u06CC\u0636 \u067E\u0648\u0631\u0679\u0644 \u0648 \u0688\u06CC\u062C\u06CC\u0679\u0644 \u06C1\u06CC\u0644\u062A\u06BE \u0631\u06CC\u06A9\u0627\u0631\u0688\u0632"
    },
    {
      loc: `${domain}/#faq`,
      lastmod: today,
      changefreq: "monthly",
      priority: 0.7,
      category: "core",
      title: "Frequently Asked Questions (FAQ)",
      titleUrdu: "\u0639\u0627\u0645 \u067E\u0648\u0686\u06BE\u06D2 \u062C\u0627\u0646\u06D2 \u0648\u0627\u0644\u06D2 \u0633\u0648\u0627\u0644\u0627\u062A"
    },
    // -------------------------------------------------------------------------
    // 2. Online Herbal Store & Products
    // -------------------------------------------------------------------------
    {
      loc: `${domain}/#store`,
      lastmod: today,
      changefreq: "daily",
      priority: 0.9,
      category: "store",
      title: "Online Herbal Pharmacy & Store",
      titleUrdu: "\u0622\u0646 \u0644\u0627\u0626\u0646 \u06C1\u0631\u0628\u0644 \u0627\u0633\u0679\u0648\u0631 \u0648 \u0642\u062F\u0631\u062A\u06CC \u0627\u062F\u0648\u06CC\u0627\u062A"
    }
  ];
  productsList.forEach((prod) => {
    const prodTitle = prod.nameEnglish || prod.name || prod.nameUrdu || "Herbal Product";
    routes.push({
      loc: `${domain}/#store?product=${encodeURIComponent(prod.id)}`,
      lastmod: today,
      changefreq: "weekly",
      priority: 0.8,
      category: "store",
      title: `${prodTitle} (${prod.category || "Herbal Remedy"})`,
      titleUrdu: prod.nameUrdu || prodTitle,
      imageUrl: prod.image
    });
  });
  routes.push({
    loc: `${domain}/#diseases`,
    lastmod: today,
    changefreq: "weekly",
    priority: 0.9,
    category: "diseases",
    title: "Medical Diseases & Advanced Herbal Treatments",
    titleUrdu: "\u0628\u06CC\u0645\u0627\u0631\u06CC\u0627\u06BA \u0627\u0648\u0631 \u062C\u062F\u06CC\u062F \u0637\u0631\u06CC\u0642\u06C1 \u0639\u0644\u0627\u062C"
  });
  diseasesList.forEach((dis) => {
    const disTitle = dis.nameEnglish || dis.name_en || dis.nameUrdu || "Medical Disease";
    routes.push({
      loc: `${domain}/#diseases?disease=${encodeURIComponent(dis.id)}`,
      lastmod: today,
      changefreq: "monthly",
      priority: 0.85,
      category: "diseases",
      title: `${disTitle} \u2014 Diagnosis & Treatment`,
      titleUrdu: `${dis.nameUrdu || disTitle} \u2014 \u062A\u0634\u062E\u06CC\u0635 \u0648 \u0639\u0644\u0627\u062C`,
      imageUrl: dis.imageUrl || dis.image
    });
  });
  routes.push({
    loc: `${domain}/#articles`,
    lastmod: today,
    changefreq: "daily",
    priority: 0.9,
    category: "articles",
    title: "Medical Health Articles & Preventive Guidelines",
    titleUrdu: "\u0637\u0628\u06CC \u0645\u0639\u0644\u0648\u0645\u0627\u062A\u06CC \u0645\u0636\u0627\u0645\u06CC\u0646 \u0648 \u0631\u06C1\u0646\u0645\u0627\u0626\u06CC"
  });
  articlesList.forEach((art) => {
    routes.push({
      loc: `${domain}/#articles?article=${encodeURIComponent(art.id)}`,
      lastmod: today,
      changefreq: "monthly",
      priority: 0.8,
      category: "articles",
      title: art.titleEnglish || art.titleUrdu,
      titleUrdu: art.titleUrdu,
      imageUrl: art.imageUrl
    });
  });
  return routes;
}
function generateSitemapXml(options = {}) {
  const routes = getSitemapRoutes(options);
  const includeImages = options.includeImages !== false;
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"`;
  if (includeImages) {
    xml += `
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"`;
  }
  xml += `
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
`;
  routes.forEach((route) => {
    xml += `  <url>
`;
    xml += `    <loc>${escapeXml(route.loc)}</loc>
`;
    if (route.lastmod) {
      xml += `    <lastmod>${route.lastmod}</lastmod>
`;
    }
    xml += `    <changefreq>${route.changefreq}</changefreq>
`;
    xml += `    <priority>${route.priority.toFixed(2)}</priority>
`;
    if (includeImages && route.imageUrl && route.imageUrl.startsWith("http")) {
      xml += `    <image:image>
`;
      xml += `      <image:loc>${escapeXml(route.imageUrl)}</image:loc>
`;
      if (route.title) {
        xml += `      <image:title>${escapeXml(route.title)}</image:title>
`;
      }
      if (route.titleUrdu) {
        xml += `      <image:caption>${escapeXml(route.titleUrdu)}</image:caption>
`;
      }
      xml += `    </image:image>
`;
    }
    xml += `  </url>
`;
  });
  xml += `</urlset>
`;
  return xml;
}
function generateRobotsTxt(domain) {
  const resolvedDomain = resolveCurrentDomain(domain);
  return `# ==============================================================================
# Hafiz Clinic & Vision Center (\u062D\u0627\u0641\u0638 \u06A9\u0644\u06CC\u0646\u06A9)
# Robots.txt Automated Search Engine Crawling Instructions
# ==============================================================================

User-agent: *
Allow: /
Allow: /#services
Allow: /#store
Allow: /#diseases
Allow: /#articles
Allow: /#eyecare
Allow: /#physiotherapy
Allow: /#faq
Allow: /#appointment

# Restrict private administrative endpoints and internal portals
Disallow: /admin
Disallow: /api/
Disallow: /doctor-portal/
Disallow: /pharmacy-pos/
Disallow: /pathology-lab/
Disallow: /ipd-ward/

# Official XML Sitemap Directive
Sitemap: ${resolvedDomain}/sitemap.xml
`;
}

// server.ts
import_dotenv.default.config({ override: true });
var PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3e3;
(0, import_env2.loadRuntimeEnv)();
(0, import_env2.logMissingEnvKeys)(["MONGODB_URI", "JWT_SECRET", "APP_URL"]);
async function startServer() {
  const app = (0, import_express16.default)();
  app.use(import_express16.default.json({ limit: "50mb" }));
  app.use(import_express16.default.urlencoded({ extended: true, limit: "50mb" }));
  app.use(authenticateToken);
  await connectDB();
  app.use("/api", statusRoutes_default);
  app.use("/api/auth", authRoutes_default);
  app.use("/api/doctors", doctorRoutes_default);
  app.use("/api/diseases", diseaseRoutes_default);
  app.use("/api/products", productRoutes_default);
  app.use("/api/appointments", appointmentRoutes_default);
  app.use("/api/orders", orderRoutes_default);
  app.use("/api/users", userRoutes_default);
  app.use("/api/messages", messageRoutes_default);
  app.use("/api/reports", reportRoutes_default);
  app.use("/api/upload", uploadRoutes_default);
  app.use("/api/calls", callRoutes_default);
  app.use("/api/slips", slipRoutes_default);
  app.use("/api/erp", erpRoutes_default);
  app.use("/api/email", emailRoutes_default);
  app.get("/sitemap.xml", (req, res) => {
    const hostHeader = req.get("host") || "hafizclinic.com";
    const domain = process.env.APP_URL || `${req.protocol}://${hostHeader}`;
    const xml = generateSitemapXml({ domain });
    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.send(xml);
  });
  app.get("/robots.txt", (req, res) => {
    const hostHeader = req.get("host") || "hafizclinic.com";
    const domain = process.env.APP_URL || `${req.protocol}://${hostHeader}`;
    const txt = generateRobotsTxt(domain);
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.send(txt);
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express16.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Hafiz Clinic Express Framework Server listening on http://localhost:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
