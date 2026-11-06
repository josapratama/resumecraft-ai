import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "./_core/trpc";
import {
  getCVById,
  getOrCreatePersonalInfo,
  getWorkExperiences,
  getEducations,
  getSkills,
  getProjects,
  getCertifications,
  getLanguages,
  getCustomSections,
  bulkCreateCVFromParsedData,
} from "./db";
import { invokeLLM } from "./_core/llm";

const CV_ASSISTANT_SYSTEM_PROMPT =
  "You are an expert CV/resume writing assistant. Help the user craft a compelling, professional CV. " +
  "Provide specific, actionable advice on improving their CV content, structure, and wording. Be concise and practical.";

/**
 * Builds a compact text summary of the user's current CV data so the AI has
 * concrete context to work with. Keeps it short to minimise token usage.
 */
async function buildCVContext(cvId: number): Promise<string> {
  const [personal, experiences, educations, skills, projects, certifications, langs, customs] =
    await Promise.all([
      getOrCreatePersonalInfo(cvId),
      getWorkExperiences(cvId),
      getEducations(cvId),
      getSkills(cvId),
      getProjects(cvId),
      getCertifications(cvId),
      getLanguages(cvId),
      getCustomSections(cvId),
    ]);

  const lines: string[] = ["=== CURRENT CV DATA ==="];

  if (personal?.fullName) lines.push(`Name: ${personal.fullName}`);
  if (personal?.location) lines.push(`Location: ${personal.location}`);
  if (personal?.professionalSummary)
    lines.push(`Summary: ${personal.professionalSummary}`);

  if (experiences.length > 0) {
    lines.push("\nWork Experience:");
    experiences.forEach(e =>
      lines.push(
        `  • ${e.jobTitle} at ${e.company} (${e.startDate ?? "?"} – ${e.endDate || "Present"})` +
          (e.description ? `\n    ${e.description}` : "")
      )
    );
  }

  if (educations.length > 0) {
    lines.push("\nEducation:");
    educations.forEach(e =>
      lines.push(
        `  • ${e.degree} in ${e.field}, ${e.school} (${e.graduationDate ?? "?"})`
      )
    );
  }

  if (skills.length > 0) {
    const grouped = skills.reduce(
      (acc, s) => {
        (acc[s.category] = acc[s.category] || []).push(s.skillName);
        return acc;
      },
      {} as Record<string, string[]>
    );
    lines.push("\nSkills:");
    Object.entries(grouped).forEach(([cat, names]) =>
      lines.push(`  ${cat}: ${names.join(", ")}`)
    );
  }

  if (projects.length > 0) {
    lines.push("\nProjects:");
    projects.forEach(p =>
      lines.push(
        `  • ${p.projectName}` +
          (p.technologies ? ` [${p.technologies}]` : "") +
          (p.description ? `\n    ${p.description}` : "")
      )
    );
  }

  if (certifications.length > 0) {
    lines.push("\nCertifications:");
    certifications.forEach(c =>
      lines.push(`  • ${c.certificationName} — ${c.issuer}`)
    );
  }

  if (langs.length > 0) {
    lines.push("\nLanguages:");
    langs.forEach(l => lines.push(`  • ${l.language} (${l.proficiency})`));
  }

  if (customs.length > 0) {
    lines.push("\nAdditional Sections / Activities:");
    customs.forEach(c => {
      lines.push(
        `  • [${c.category}] ${c.title}${c.subtitle ? ` - ${c.subtitle}` : ""}${c.date ? ` (${c.date})` : ""}${c.description ? `\n    ${c.description}` : ""}`
      );
    });
  }

  lines.push("=== END CV DATA ===");
  return lines.join("\n");
}

export const cvAIRouter = router({
  generateProfessionalSummary: protectedProcedure
    .input(
      z.object({
        cvId: z.number(),
        jobTitle: z.string().trim().optional(),
        experience: z.string().trim().optional(),
        skills: z.string().trim().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const cv = await getCVById(input.cvId);
      if (!cv)
        throw new TRPCError({ code: "NOT_FOUND", message: "CV not found" });
      if (cv.userId !== ctx.user.id)
        throw new TRPCError({ code: "FORBIDDEN", message: "Unauthorized" });

      const prompt = `Generate a professional and compelling CV summary (2-3 sentences) for someone with the following profile:
Job Title: ${input.jobTitle || "Not specified"}
Experience: ${input.experience || "Not specified"}
Skills: ${input.skills || "Not specified"}

The summary should be concise, impactful, and highlight key strengths. Format as a single paragraph.`;

      const response = await invokeLLM({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 200,
      });

      return { summary: response.choices[0]?.message?.content || "" };
    }),

  generateJobDescription: protectedProcedure
    .input(
      z.object({
        cvId: z.number(),
        jobTitle: z.string().trim(),
        company: z.string().trim(),
        keyResponsibilities: z.string().trim().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const cv = await getCVById(input.cvId);
      if (!cv)
        throw new TRPCError({ code: "NOT_FOUND", message: "CV not found" });
      if (cv.userId !== ctx.user.id)
        throw new TRPCError({ code: "FORBIDDEN", message: "Unauthorized" });

      const prompt = `Generate a professional job description for a CV entry with the following details:
Job Title: ${input.jobTitle}
Company: ${input.company}
Key Responsibilities: ${input.keyResponsibilities || "Not specified"}

The description should be 2-3 bullet points highlighting achievements and impact. Use action verbs and quantify results where possible.`;

      const response = await invokeLLM({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 300,
      });

      return { description: response.choices[0]?.message?.content || "" };
    }),

  improveText: protectedProcedure
    .input(
      z.object({
        cvId: z.number(),
        text: z.string().trim(),
        context: z.enum(["summary", "description", "skill"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const cv = await getCVById(input.cvId);
      if (!cv)
        throw new TRPCError({ code: "NOT_FOUND", message: "CV not found" });
      if (cv.userId !== ctx.user.id)
        throw new TRPCError({ code: "FORBIDDEN", message: "Unauthorized" });

      const contextGuide = {
        summary: "Make it more compelling and professional for a CV summary",
        description: "Improve the job description with action verbs and impact",
        skill: "Enhance the skill description to be more professional",
      };

      const prompt = `Improve the following CV text to be more professional and impactful. ${contextGuide[input.context]}

Original text: "${input.text}"

Provide only the improved text, without any explanation or quotes.`;

      const response = await invokeLLM({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 300,
      });

      return { improvedText: response.choices[0]?.message?.content || "" };
    }),

  // System prompt + CV context are injected server-side;
  // client sends only user/assistant turns plus the cvId so we can load context.
  chat: protectedProcedure
    .input(
      z.object({
        cvId: z.number().optional(),
        messages: z.array(
          z.object({
            role: z.enum(["user", "assistant"]),
            content: z.string().trim(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Build CV-aware system prompt when a cvId is provided
      let systemContent = CV_ASSISTANT_SYSTEM_PROMPT;
      if (input.cvId) {
        const cv = await getCVById(input.cvId);
        if (cv && cv.userId === ctx.user.id) {
          const cvContext = await buildCVContext(input.cvId);
          systemContent =
            CV_ASSISTANT_SYSTEM_PROMPT +
            "\n\nThe user is working on the following CV. Use this data to give specific, personalised advice:\n" +
            cvContext;
        }
      }

      const messages = [
        { role: "system" as const, content: systemContent },
        ...input.messages,
      ];

      const response = await invokeLLM({
        model: "gpt-4o-mini",
        messages,
        max_tokens: 600,
      });

      return { reply: response.choices[0]?.message?.content || "" };
    }),

  // ─── ATS Compatibility & Job Description Matcher ───────────────────────────
  analyzeATS: protectedProcedure
    .input(
      z.object({
        cvId: z.number(),
        jobDescription: z.string().trim().min(10),
        targetRole: z.string().trim().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const cv = await getCVById(input.cvId);
      if (!cv) throw new TRPCError({ code: "NOT_FOUND", message: "CV not found" });
      if (cv.userId !== ctx.user.id) throw new TRPCError({ code: "FORBIDDEN", message: "Unauthorized" });

      const cvContext = await buildCVContext(input.cvId);

      const prompt = `You are a Principal Technical Recruiter and ATS (Applicant Tracking System) Evaluation Algorithm.
Evaluate the candidate's CV strictly against the Target Job Description below.

${cvContext}

=== TARGET JOB DESCRIPTION ===
Role: ${input.targetRole || cv.title}
Job Description:
${input.jobDescription}
=== END TARGET JOB DESCRIPTION ===

Return a VALID JSON object ONLY (strictly without markdown backticks or commentary):
{
  "overallScore": <integer between 0 and 100>,
  "summaryRating": "<one sentence concise evaluation>",
  "breakdown": {
    "hardSkills": <integer 0-100>,
    "experienceMatch": <integer 0-100>,
    "structureAndFormat": <integer 0-100>,
    "keywordDensity": <integer 0-100>
  },
  "matchingKeywords": ["<matched skill/keyword 1>", "<matched skill/keyword 2>", ...],
  "missingKeywords": ["<critical missing keyword 1>", "<critical missing keyword 2>", ...],
  "strengths": ["<strength point 1>", "<strength point 2>", ...],
  "criticalGaps": ["<gap 1>", "<gap 2>", ...],
  "recommendations": ["<actionable advice 1>", "<actionable advice 2>", ...]
}`;

      const response = await invokeLLM({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        responseFormat: { type: "json_object" },
        max_tokens: 1400,
      });

      const raw = response.choices[0]?.message?.content || "{}";
      const cleaned = typeof raw === "string" ? raw.replace(/```json\n?|```/g, "").trim() : JSON.stringify(raw);
      try {
        return JSON.parse(cleaned);
      } catch {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to parse ATS analysis response",
        });
      }
    }),

  // ─── AI Cover Letter Generator ─────────────────────────────────────────────
  generateCoverLetter: protectedProcedure
    .input(
      z.object({
        cvId: z.number(),
        companyName: z.string().trim().min(1),
        jobTitle: z.string().trim().min(1),
        recipientName: z.string().trim().optional(),
        recipientTitle: z.string().trim().optional(),
        jobDescription: z.string().trim().optional(),
        tone: z.enum(["professional", "confident", "enthusiastic", "concise"]).default("professional"),
        language: z.enum(["id", "en"]).default("id"),
        templateStyle: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const cv = await getCVById(input.cvId);
      if (!cv) throw new TRPCError({ code: "NOT_FOUND", message: "CV not found" });
      if (cv.userId !== ctx.user.id) throw new TRPCError({ code: "FORBIDDEN", message: "Unauthorized" });

      const cvContext = await buildCVContext(input.cvId);
      const isIndonesian = input.language === "id";

      const prompt = isIndonesian
        ? `Anda adalah konsultan karier profesional tingkat tinggi di Indonesia.
Tulis Surat Lamaran Kerja (Cover Letter) resmi dan sangat meyakinkan yang disesuaikan secara akurat dengan data pelamar:
Perusahaan Tujuan: ${input.companyName}
Posisi yang Dilamar: ${input.jobTitle}
Nama Penerima / Jabatan: ${input.recipientName || "Pimpinan / HRD Manager"} ${input.recipientTitle ? `(${input.recipientTitle})` : ""}
Nada Bahasa (Tone): ${input.tone}
Gaya Template: ${input.templateStyle || "Modern & Professional"}
${input.jobDescription ? `Kualifikasi / Persyaratan Lowongan:\n${input.jobDescription}` : ""}

${cvContext}

Panduan Penulisan (Standar Baku EYD Bahasa Indonesia):
1. Format Subjek email profesional: "[Lamaran Pekerjaan] - ${input.jobTitle} - [Nama Lengkap Pelamar]".
2. Salam Pembuka resmi: "Dengan hormat,".
3. Paragraf Pembuka: sebutkan antusiasme melamar ke posisi ${input.jobTitle} di ${input.companyName} dan motivasi bergabung.
4. Paragraf Inti: hubungkan 2-3 pencapaian konkret atau keahlian dari CV dengan kebutuhan posisi tersebut. Gunakan bahasa persuasif dan percaya diri.
5. Poin Keahlian Utama (skillsHighlight): 3-4 butir capaian/keahlian terpenting.
6. Daftar Lampiran (attachments): 4-5 dokumen pendukung standar (Curriculum Vitae, Portofolio Proyek, Ijazah & Transkrip, Sertifikat Kompetensi, Pas Foto).
7. Paragraf Penutup: nyatakan harapan wawancara kerja dan ucapan terima kasih secara santun dan profesional.
8. Salam Penutup: "Hormat saya,".
9. Tulis dalam Bahasa Indonesia yang baku, profesional, dan meyakinkan.

KEMBALIKAN HANYA OBJEK JSON VALID dengan format berikut:
{
  "subject": "<Subjek email lamaran kerja>",
  "salutation": "Dengan hormat,",
  "opening": "<Paragraf pembuka lengkap>",
  "body": "<Paragraf inti kualifikasi & pencapaian relevan>",
  "skillsHighlight": ["<Poin keahlian 1>", "<Poin keahlian 2>", "<Poin keahlian 3>"],
  "attachments": ["Curriculum Vitae (CV) Terbaru", "Portofolio Proyek Terkait", "Salinan Ijazah dan Transkrip Nilai", "Sertifikat Pelatihan / Kompetensi", "Pas Foto Terbaru"],
  "closing": "<Paragraf penutup & permohonan wawancara>",
  "signOff": "Hormat saya,",
  "coverLetter": "<Teks lengkap surat lamaran kerja terangkai rapi dengan pemisah baris baru ganda>"
}`
        : `You are an executive career coach and cover letter specialist.
Write a personalized, highly compelling Cover Letter for the applicant applying to:
Company: ${input.companyName}
Target Role: ${input.jobTitle}
Recipient: ${input.recipientName || "Hiring Team"} ${input.recipientTitle ? `(${input.recipientTitle})` : ""}
Desired Tone: ${input.tone}
Template Style: ${input.templateStyle || "Modern Professional"}
${input.jobDescription ? `Job Description / Requirements:\n${input.jobDescription}` : ""}

${cvContext}

Instructions:
1. Subject line formatted as: "Job Application: ${input.jobTitle} - [Applicant Name]".
2. Salutation: "Dear ${input.recipientName || `Hiring Team at ${input.companyName}`},".
3. Hook paragraph expressing genuine enthusiasm for the role and mission alignment.
4. Body paragraph: connect 2-3 specific accomplishments from their CV with measurable results to the target role.
5. Key skills highlight (skillsHighlight): 3-4 high-impact bullets.
6. Enclosures (attachments): list 3-4 documents (e.g. "Resume / Curriculum Vitae", "Project Portfolio", "Professional Certifications").
7. Closing paragraph: strong call-to-action for an interview and expression of appreciation.
8. Sign-off: "Sincerely,".
9. Return a VALID JSON object ONLY with the following exact keys:
{
  "subject": "<Subject line for email application>",
  "salutation": "<Salutation line>",
  "opening": "<Opening paragraph>",
  "body": "<Core body paragraph connecting CV achievements to role>",
  "skillsHighlight": ["<Highlight 1>", "<Highlight 2>", "<Highlight 3>"],
  "attachments": ["Updated Resume / CV", "Project Portfolio", "Certifications & Credentials"],
  "closing": "<Closing call to action>",
  "signOff": "Sincerely,",
  "coverLetter": "<Complete cover letter text with paragraphs separated by double newlines>"
}`;

      const response = await invokeLLM({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        responseFormat: { type: "json_object" },
        max_tokens: 1500,
      });

      const raw = response.choices[0]?.message?.content || "{}";
      const cleaned = typeof raw === "string" ? raw.replace(/```json\n?|```/g, "").trim() : JSON.stringify(raw);
      try {
        const parsed = JSON.parse(cleaned);
        return {
          subject: parsed.subject || `Application for ${input.jobTitle} - ${input.companyName}`,
          salutation: parsed.salutation || (isIndonesian ? "Dengan hormat," : "Dear Hiring Team,"),
          opening: parsed.opening || "",
          body: parsed.body || "",
          skillsHighlight: Array.isArray(parsed.skillsHighlight) ? parsed.skillsHighlight : [],
          attachments: Array.isArray(parsed.attachments) ? parsed.attachments : [],
          closing: parsed.closing || "",
          signOff: parsed.signOff || (isIndonesian ? "Hormat saya," : "Sincerely,"),
          coverLetter: (typeof parsed.coverLetter === "string" ? parsed.coverLetter : (typeof raw === "string" ? raw : "")) as string,
        };
      } catch {
        return {
          subject: isIndonesian ? `Lamaran Pekerjaan: ${input.jobTitle} - ${input.companyName}` : `Application for ${input.jobTitle} - ${input.companyName}`,
          salutation: isIndonesian ? "Dengan hormat," : "Dear Hiring Team,",
          opening: typeof raw === "string" ? raw : "",
          body: "",
          skillsHighlight: [],
          attachments: [],
          closing: "",
          signOff: isIndonesian ? "Hormat saya," : "Sincerely,",
          coverLetter: typeof raw === "string" ? raw : "",
        };
      }
    }),

  // ─── AI Interview Prep & Question Generator ────────────────────────────────
  generateInterviewPrep: protectedProcedure
    .input(
      z.object({
        cvId: z.number(),
        targetRole: z.string().trim().optional(),
        jobDescription: z.string().trim().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const cv = await getCVById(input.cvId);
      if (!cv) throw new TRPCError({ code: "NOT_FOUND", message: "CV not found" });
      if (cv.userId !== ctx.user.id) throw new TRPCError({ code: "FORBIDDEN", message: "Unauthorized" });

      const cvContext = await buildCVContext(input.cvId);

      const prompt = `You are an Interview Coach and Senior Hiring Manager.
Analyze the candidate's CV and generate realistic interview questions tailored specifically to their background and target role.

Target Role: ${input.targetRole || cv.title}
${input.jobDescription ? `Target Job Description:\n${input.jobDescription}` : ""}

${cvContext}

Return a VALID JSON object ONLY:
{
  "behavioral": [
    {
      "question": "<Behavioral question>",
      "whyAsked": "<What the interviewer is testing>",
      "starApproach": "<How candidate can use STAR method referencing their real CV experience>"
    }
  ],
  "technical": [
    {
      "question": "<Technical / tool question based on skills in CV>",
      "whyAsked": "<Skill verified>",
      "keyPoints": "<Key technical concepts to mention>"
    }
  ],
  "situational": [
    {
      "question": "<Workplace scenario question>",
      "scenario": "<Context>",
      "idealResponse": "<Recommended strategy>"
    }
  ]
}`;

      const response = await invokeLLM({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        responseFormat: { type: "json_object" },
        max_tokens: 1600,
      });

      const raw = response.choices[0]?.message?.content || "{}";
      const cleaned = typeof raw === "string" ? raw.replace(/```json\n?|```/g, "").trim() : JSON.stringify(raw);
      try {
        return JSON.parse(cleaned);
      } catch {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to parse interview prep response",
        });
      }
    }),

  // ─── AI Multi-Language Translation (EN <-> ID) ─────────────────────────────
  translateCV: protectedProcedure
    .input(
      z.object({
        cvId: z.number(),
        targetLanguage: z.enum(["en", "id"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const cv = await getCVById(input.cvId);
      if (!cv) throw new TRPCError({ code: "NOT_FOUND", message: "CV not found" });
      if (cv.userId !== ctx.user.id) throw new TRPCError({ code: "FORBIDDEN", message: "Unauthorized" });

      const [personal, experiences, educations, skills, projects, certifications, langs, customs] =
        await Promise.all([
          getOrCreatePersonalInfo(input.cvId),
          getWorkExperiences(input.cvId),
          getEducations(input.cvId),
          getSkills(input.cvId),
          getProjects(input.cvId),
          getCertifications(input.cvId),
          getLanguages(input.cvId),
          getCustomSections(input.cvId),
        ]);

      const targetLangName =
        input.targetLanguage === "en"
          ? "English (Professional Corporate US/UK)"
          : "Bahasa Indonesia (Profesional Baku)";

      const prompt = `You are an expert bilingual CV localization specialist.
Translate and professionally adapt this entire CV into ${targetLangName}.
Do NOT make a word-for-word translation; use strong action verbs, standard industry terminology, and natural phrasing.

Original CV:
${JSON.stringify({
  title: cv.title,
  personalInfo: personal,
  workExperiences: experiences,
  educations: educations,
  skills: skills,
  projects: projects,
  certifications: certifications,
  languages: langs,
  customSections: customs,
}, null, 2)}

Return a VALID JSON object ONLY matching this structure:
{
  "title": "<translated title>",
  "personalInfo": {
    "fullName": "...",
    "email": "...",
    "phone": "...",
    "location": "...",
    "professionalSummary": "..."
  },
  "workExperiences": [
    { "jobTitle": "...", "company": "...", "location": "...", "startDate": "...", "endDate": "...", "description": "..." }
  ],
  "educations": [
    { "degree": "...", "field": "...", "school": "...", "location": "...", "graduationDate": "...", "description": "..." }
  ],
  "skills": [
    { "category": "...", "skillName": "...", "proficiency": "..." }
  ],
  "projects": [
    { "projectName": "...", "description": "...", "technologies": "...", "link": "..." }
  ],
  "certifications": [
    { "certificationName": "...", "issuer": "...", "issueDate": "...", "expiryDate": "...", "link": "..." }
  ],
  "languages": [
    { "language": "...", "proficiency": "..." }
  ],
  "customSections": [
    { "category": "...", "title": "...", "subtitle": "...", "date": "...", "description": "..." }
  ]
}`;

      const response = await invokeLLM({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        responseFormat: { type: "json_object" },
        max_tokens: 3000,
      });

      const raw = response.choices[0]?.message?.content || "{}";
      const cleaned = typeof raw === "string" ? raw.replace(/```json\n?|```/g, "").trim() : JSON.stringify(raw);
      try {
        return JSON.parse(cleaned);
      } catch {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to parse translated CV response",
        });
      }
    }),

  // ─── AI Resume Parser (Import from raw text / PDF) ─────────────────────────
  parseResumeText: protectedProcedure
    .input(z.object({ rawText: z.string().trim().min(20) }))
    .mutation(async ({ input }) => {
      const prompt = `You are a World-Class AI Resume / CV Parsing Engine.
Extract all structured data from the raw text provided below into the exact JSON format requested.
Infer categories and organize skills and experiences cleanly.

RAW CV TEXT:
${input.rawText}

Return a VALID JSON object ONLY:
{
  "suggestedTitle": "<Job Title or Candidate Name - CV>",
  "personalInfo": {
    "fullName": "<name>",
    "email": "<email>",
    "phone": "<phone>",
    "location": "<city, country>",
    "professionalSummary": "<concise executive summary>"
  },
  "workExperiences": [
    {
      "jobTitle": "<title>",
      "company": "<company>",
      "location": "<location>",
      "startDate": "<date or year>",
      "endDate": "<date or Present>",
      "description": "<bullet points>"
    }
  ],
  "educations": [
    {
      "degree": "<degree>",
      "field": "<major>",
      "school": "<institution>",
      "location": "<location>",
      "graduationDate": "<year>",
      "description": "<details if any>"
    }
  ],
  "skills": [
    {
      "category": "<e.g. Technical, Frameworks, Soft Skills, Tools>",
      "skillName": "<skill name>",
      "proficiency": "<beginner | intermediate | advanced | expert>"
    }
  ],
  "projects": [
    {
      "projectName": "<name>",
      "description": "<description>",
      "technologies": "<tech stack>",
      "link": "<url or empty>"
    }
  ],
  "certifications": [
    {
      "certificationName": "<cert name>",
      "issuer": "<organization>",
      "issueDate": "<date>",
      "expiryDate": "<date or null>",
      "link": "<url or null>"
    }
  ],
  "languages": [
    {
      "language": "<language>",
      "proficiency": "<Native | Fluent | Professional Working | Intermediate>"
    }
  ],
  "customSections": [
    {
      "category": "<Awards | Volunteer | Organizations | Publications>",
      "title": "<title>",
      "subtitle": "<subtitle>",
      "date": "<date>",
      "description": "<description>"
    }
  ]
}`;

      const response = await invokeLLM({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        responseFormat: { type: "json_object" },
        max_tokens: 3000,
      });

      const raw = response.choices[0]?.message?.content || "{}";
      const cleaned = typeof raw === "string" ? raw.replace(/```json\n?|```/g, "").trim() : JSON.stringify(raw);
      try {
        return JSON.parse(cleaned);
      } catch {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to parse raw resume text",
        });
      }
    }),

  // ─── Save Parsed Resume Directly into Database ─────────────────────────────
  createFromParsed: protectedProcedure
    .input(
      z.object({
        title: z.string().trim().min(1),
        template: z.string().default("modern"),
        parsedData: z.any(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return bulkCreateCVFromParsedData(
        ctx.user.id,
        input.title,
        input.template as any,
        input.parsedData
      );
    }),
});
