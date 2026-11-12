import { Router } from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Application from "../models/Application.js";
import Job from "../models/Job.js";
import { protect, allow } from "../middleware/auth.js";
import { extractResumeText } from "../utils/resume.js";
import { analyzeResume } from "../utils/analysis.js";
import { persistUpload, getStoredFile } from "../utils/storage.js";
import { sendNotice } from "../utils/email.js";

const router = Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.resolve(__dirname, "../../uploads");
fs.mkdirSync(uploadDir, { recursive: true });
const upload = multer({
  dest: uploadDir,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = file.mimetype === "application/pdf" || file.originalname.toLowerCase().endsWith(".docx");
    cb(ok ? null : new Error("Upload a PDF or DOCX file"), ok);
  }
});
router.post("/", protect, allow("applicant"), upload.single("resume"), async (req, res, next) => {
  let file = req.file;
  try {
    if (!file) return res.status(400).json({ message: "Resume file is required" });
    const job = await Job.findOne({ _id: req.body.jobId, archived: false });
    if (!job) return res.status(404).json({ message: "Job not found" });
    const existing = await Application.findOne({ job: job._id, applicant: req.user._id });
    if (existing) return res.status(409).json({ message: "You have already applied for this job" });
    const resumeText = await extractResumeText(file);
    const stored = await persistUpload(file);
    const analysis = await analyzeResume(resumeText, job);
    const application = await Application.create({
      job: job._id, applicant: req.user._id,
      resume: { originalName: file.originalname, mimeType: file.mimetype, ...stored },
      resumeText: resumeText.slice(0, 30000), analysis
    });
    const recruiter = await (await import("../models/User.js")).default.findById(job.recruiter);
    await sendNotice(recruiter?.email, "New job application received",
      `${req.user.name} applied for ${job.title}. Match score: ${analysis.score}%.`);
    res.status(201).json(application);
  } catch (e) {
    if (file?.path) fs.promises.unlink(file.path).catch(() => {});
    if (e.code === 11000) return res.status(409).json({ message: "You have already applied for this job" });
    next(e);
  }
});
router.get("/mine", protect, allow("applicant"), async (req, res, next) => {
  try {
    res.json(await Application.find({ applicant: req.user._id }).populate("job").sort({ createdAt: -1 }));
  } catch (e) { next(e); }
});
router.get("/recruiter", protect, allow("recruiter"), async (req, res, next) => {
  try {
    const jobs = await Job.find({ recruiter: req.user._id }).select("_id");
    res.json(await Application.find({ job: { $in: jobs.map(j => j._id) } })
      .populate("job").populate("applicant", "name email").sort({ "analysis.score": -1, createdAt: -1 }));
  } catch (e) { next(e); }
});
router.patch("/:id/status", protect, allow("recruiter"), async (req, res, next) => {
  try {
    if (!["Applied", "Interview", "Offered", "Rejected"].includes(req.body.status))
      return res.status(400).json({ message: "Invalid application status" });
    const application = await Application.findById(req.params.id).populate("job").populate("applicant", "name email");
    if (!application) return res.status(404).json({ message: "Application not found" });
    if (String(application.job.recruiter) !== String(req.user._id)) return res.status(403).json({ message: "Not authorized" });
    application.status = req.body.status;
    await application.save();
    await sendNotice(application.applicant.email, `Application update: ${application.job.title}`,
      `Your application status is now: ${application.status}.`);
    res.json(application);
  } catch (e) { next(e); }
});
router.get("/:id/download", protect, async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id).populate("job");
    if (!application) return res.status(404).json({ message: "Application not found" });
    const isApplicant = String(application.applicant) === String(req.user._id);
    const isRecruiter = String(application.job.recruiter) === String(req.user._id) && req.user.role === "recruiter";
    if (!isApplicant && !isRecruiter) return res.status(403).json({ message: "Not authorized" });
    const stored = await getStoredFile(application.resume.key, application.resume.storage);
    res.setHeader("Content-Disposition", `attachment; filename="${application.resume.originalName.replace(/"/g, "")}"`);
    if (stored.buffer) return res.type(stored.contentType || "application/octet-stream").send(stored.buffer);
    res.download(stored.path, application.resume.originalName);
  } catch (e) { next(e); }
});
export default router;
