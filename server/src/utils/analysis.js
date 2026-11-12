const SKILLS = [
  "javascript","typescript","react","node.js","node","express","mongodb","sql","python",
  "java","html","css","git","aws","docker","rest api","material ui","redux","communication",
  "machine learning","generative ai","excel","project management","testing"
];
const clean = s => (s || "").toLowerCase();

export async function analyzeResume(resumeText, job) {
  const description = `${job.title} ${job.description} ${(job.skills || []).join(" ")}`;
  const text = clean(resumeText);
  const target = clean(description);
  const matchedSkills = SKILLS.filter(skill => text.includes(skill) && target.includes(skill));
  const jobSkills = [...new Set((job.skills || []).map(s => s.trim()).filter(Boolean))];
  const matchedJobSkills = jobSkills.filter(skill => text.includes(clean(skill)));
  const missingSkills = jobSkills.filter(skill => !matchedJobSkills.includes(skill));
  let score = jobSkills.length
    ? Math.round((matchedJobSkills.length / jobSkills.length) * 100)
    : Math.min(95, Math.round((matchedSkills.length / 8) * 100));
  let summary = `Local matching found ${matchedJobSkills.length} of ${jobSkills.length} listed job skills. Review the resume and interview evidence before making a decision.`;
  let source = "local";
  if (process.env.GEMINI_API_KEY) {
    try {
      const prompt = `Evaluate only job-relevant evidence. Do not infer or use age, gender, race, religion, disability, nationality, photo, or other protected traits. Return valid JSON only with score (0-100), matchedSkills (array), missingSkills (array), summary (string), experience (string). Job: ${job.title}\nDescription: ${job.description}\nRequired skills: ${jobSkills.join(", ")}\nResume text: ${resumeText.slice(0, 18000)}`;
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${process.env.GEMINI_MODEL || "gemini-2.0-flash"}:generateContent?key=${process.env.GEMINI_API_KEY}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseMimeType: "application/json" } })
      });
      if (!response.ok) throw new Error(`Gemini request failed: ${response.status}`);
      const data = await response.json();
      const raw = data.candidates?.[0]?.content?.parts?.[0]?.text;
      const parsed = JSON.parse(raw);
      score = Math.max(0, Math.min(100, Number(parsed.score) || 0));
      return {
        score, matchedSkills: parsed.matchedSkills || matchedJobSkills,
        missingSkills: parsed.missingSkills || missingSkills,
        summary: parsed.summary || summary, experience: parsed.experience || "",
        source: "gemini"
      };
    } catch (error) {
      console.warn("Gemini analysis unavailable; using local matching:", error.message);
    }
  }
  return { score, matchedSkills: matchedJobSkills.length ? matchedJobSkills : matchedSkills,
    missingSkills, summary, experience: "", source };
}
