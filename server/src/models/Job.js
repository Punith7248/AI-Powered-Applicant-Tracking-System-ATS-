import mongoose from "mongoose";
const jobSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  company: { type: String, required: true, trim: true },
  location: { type: String, default: "Remote" },
  type: { type: String, default: "Full-time" },
  description: { type: String, required: true },
  skills: [{ type: String }],
  experience: { type: String, default: "Any experience" },
  archived: { type: Boolean, default: false },
  recruiter: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
}, { timestamps: true });
export default mongoose.model("Job", jobSchema);
