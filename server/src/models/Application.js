import mongoose from "mongoose";
const applicationSchema = new mongoose.Schema({
  job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
  applicant: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  resume: { originalName: String, storage: String, key: String, mimeType: String },
  resumeText: { type: String, default: "" },
  analysis: {
    score: { type: Number, default: 0 },
    matchedSkills: [String],
    missingSkills: [String],
    summary: { type: String, default: "" },
    experience: { type: String, default: "" },
    source: { type: String, default: "local" }
  },
  status: { type: String, enum: ["Applied", "Interview", "Offered", "Rejected"], default: "Applied" }
}, { timestamps: true });
applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });
export default mongoose.model("Application", applicationSchema);
