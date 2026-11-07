import { Router } from "express";
import Job from "../models/Job.js";
import { protect, allow } from "../middleware/auth.js";
const router = Router();
router.get("/", async (req, res, next) => {
  try {
    const filter = { archived: false };
    if (req.query.search) filter.$or = [
      { title: { $regex: req.query.search, $options: "i" } },
      { company: { $regex: req.query.search, $options: "i" } },
      { skills: { $regex: req.query.search, $options: "i" } }
    ];
    res.json(await Job.find(filter).populate("recruiter", "name").sort({ createdAt: -1 }));
  } catch (e) { next(e); }
});
router.get("/mine", protect, allow("recruiter"), async (req, res, next) => {
  try { res.json(await Job.find({ recruiter: req.user._id }).sort({ createdAt: -1 })); }
  catch (e) { next(e); }
});
router.post("/", protect, allow("recruiter"), async (req, res, next) => {
  try {
    const { title, company, description } = req.body;
    if (!title || !company || !description) return res.status(400).json({ message: "Title, company and description are required" });
    const job = await Job.create({ ...req.body, recruiter: req.user._id,
      skills: Array.isArray(req.body.skills) ? req.body.skills : String(req.body.skills || "").split(",").map(s => s.trim()).filter(Boolean) });
    res.status(201).json(job);
  } catch (e) { next(e); }
});
router.put("/:id", protect, allow("recruiter"), async (req, res, next) => {
  try {
    const job = await Job.findOneAndUpdate({ _id: req.params.id, recruiter: req.user._id }, req.body, { new: true, runValidators: true });
    if (!job) return res.status(404).json({ message: "Job not found" });
    res.json(job);
  } catch (e) { next(e); }
});
router.patch("/:id/archive", protect, allow("recruiter"), async (req, res, next) => {
  try {
    const job = await Job.findOneAndUpdate({ _id: req.params.id, recruiter: req.user._id }, { archived: true }, { new: true });
    if (!job) return res.status(404).json({ message: "Job not found" });
    res.json(job);
  } catch (e) { next(e); }
});
export default router;
