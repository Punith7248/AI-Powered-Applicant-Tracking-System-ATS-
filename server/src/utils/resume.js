import fs from "fs/promises";
import pdf from "pdf-parse";
import mammoth from "mammoth";
export async function extractResumeText(file) {
  if (file.mimetype === "application/pdf" || file.originalname.toLowerCase().endsWith(".pdf")) {
    const data = await pdf(await fs.readFile(file.path));
    return data.text || "";
  }
  if (file.originalname.toLowerCase().endsWith(".docx")) {
    const result = await mammoth.extractRawText({ path: file.path });
    return result.value || "";
  }
  throw new Error("Only PDF and DOCX resumes are supported");
}
