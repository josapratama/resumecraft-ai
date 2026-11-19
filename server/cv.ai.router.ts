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

// ─── AI Resume Structured Parser Helper ────────────────────────────────────
async function parseStructuredResumeFromText(rawText: string) {
  const prompt = `You are a World-Class AI Resume / CV Parsing Engine.
Extract all structured data from the raw text provided below into the exact JSON format requested.
Infer categories and organize skills and experiences cleanly.

RAW CV TEXT:
${rawText}

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
      message: "Failed to parse raw resume text into JSON",
    });
  }
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

      const isIndonesian =
        /meng|di|dan|yang|dengan|pada|ke|untuk|saya|tugas|kerja|sekolah|guru|siswa|pengalaman/i.test(input.text);

      const contextGuide = {
        summary: "Make it more compelling and professional for a CV summary",
        description: "Improve the job description with strong action verbs and measurable impact",
        skill: "Enhance the skill description to be more professional",
      };

      const prompt = isIndonesian
        ? `Tingkatkan teks CV berikut agar sangat profesional, formal, menggunakan kata kerja aksi yang kuat (action verbs seperti 'Mengembangkan', 'Mengkoordinasikan', 'Merancang', 'Memfasilitasi', 'Meningkatkan'), dan menonjolkan capaian terukur.
Konteks: ${
            input.context === "summary"
              ? "Ringkasan Profil Profesional (Professional Summary)"
              : input.context === "description"
              ? "Tanggung Jawab & Capaian Pekerjaan (Action-verb bullet points)"
              : "Keahlian"
          }

Teks Asli:
"${input.text}"

KEMBALIKAN HANYA teks yang telah disempurnakan (tanpa tanda petik, tanpa kata pengantar apa pun). Jika berupa deskripsi tugas/pekerjaan, sajikan dalam butir-butir poin rapi menggunakan tanda '• '.`
        : `Improve the following CV text to be more professional and impactful. ${contextGuide[input.context]}. Start bullets with strong action verbs and highlight accomplishments.

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

  // ─── Extract Job Vacancy from Poster / Image (AI Vision OCR) ───────────────
  extractJobVacancyFromImage: protectedProcedure
    .input(
      z.object({
        imageBase64: z.string().min(20),
      })
    )
    .mutation(async ({ input }) => {
      const mimeMatch = input.imageBase64.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,/);
      const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";
      const cleanUrl = input.imageBase64.startsWith("data:")
        ? input.imageBase64
        : `data:${mimeType};base64,${input.imageBase64}`;

      const prompt = `Anda adalah asisten karir dan rekrutmen profesional. Analisis gambar poster lowongan pekerjaan / pamflet loker ini.
Ekstrak seluruh informasi kunci ke dalam format JSON yang terstruktur dan detail.

KEMBALIKAN HANYA OBJEK JSON VALID dengan format:
{
  "companyName": "<Nama Sekolah / Perusahaan / Lembaga, contoh: SMP Angelly Secondary>",
  "jobTitle": "<Posisi / Jabatan yang Dibuka, contoh: Guru Matematika>",
  "requirements": ["<Syarat 1>", "<Syarat 2>", "<Syarat 3>"],
  "location": "<Kota / Alamat jika tercantum>",
  "contactInfo": "<Nomor Telepon / Email / Alamat pengiriman CV>",
  "jobDescription": "<Teks terangkai lengkap dari seluruh persyaratan, kualifikasi, deskripsi lowongan untuk analisis kecocokan ATS>"
}`;

      const response = await invokeLLM({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              {
                type: "image_url",
                image_url: {
                  url: cleanUrl,
                },
              },
            ],
          },
        ],
        responseFormat: { type: "json_object" },
        max_tokens: 1500,
      });

      const raw = response.choices[0]?.message?.content || "{}";
      const cleaned = typeof raw === "string" ? raw.replace(/```json\n?|```/g, "").trim() : JSON.stringify(raw);
      try {
        return JSON.parse(cleaned);
      } catch {
        return {
          companyName: "",
          jobTitle: "",
          requirements: [],
          location: "",
          contactInfo: "",
          jobDescription: typeof raw === "string" ? raw : "",
        };
      }
    }),

  // ─── AI Typo, Grammar & EYD Checker ─────────────────────────────────────────
  checkGrammarAndTypo: protectedProcedure
    .input(z.object({ cvId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const cv = await getCVById(input.cvId);
      if (!cv) throw new TRPCError({ code: "NOT_FOUND", message: "CV not found" });
      if (cv.userId !== ctx.user.id) throw new TRPCError({ code: "FORBIDDEN", message: "Unauthorized" });

      const textSample = await buildCVContext(input.cvId);

      const prompt = `Anda adalah editor bahasa profesional dan spesialis rekrutmen. Periksa seluruh teks CV pelamar berikut untuk mendeteksi:
1. Salah ketik (Typo)
2. Kesalahan ejaan / tata bahasa baku (Pedoman Umum Ejaan Bahasa Indonesia / EYD V / English grammar jika berbahasa Inggris)
3. Kalimat rancu, singkatan tidak baku, atau tanda baca yang salah
4. Saran perbaikan formal yang siap diterapkan

Teks CV:
"""
${textSample}
"""

KEMBALIKAN HANYA OBJEK JSON VALID dengan format:
{
  "totalIssues": <jumlah temuan>,
  "score": <skor keterbacaan & tata bahasa 0 - 100>,
  "summary": "<Kesimpulan singkat kualitas tata bahasa>",
  "issues": [
    {
      "section": "<Bagian CV, contoh: Ringkasan Profesional / Pengalaman Kerja>",
      "originalText": "<Kata atau frasa yang salah>",
      "suggestedText": "<Koreksi yang benar>",
      "explanation": "<Alasan perbaikan berdasarkan EYD atau tata bahasa formal>"
    }
  ]
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
        return JSON.parse(cleaned);
      } catch {
        return {
          totalIssues: 0,
          score: 100,
          summary: "Teks sudah rapi.",
          issues: [],
        };
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

  // ─── AI Resume Parser from URL / Portfolio ────────────────────────────────
  parseFromUrl: protectedProcedure
    .input(z.object({ url: z.string().trim().min(3) }))
    .mutation(async ({ input }) => {
      let targetUrl = input.url;
      if (!/^https?:\/\//i.test(targetUrl)) {
        targetUrl = `https://${targetUrl}`;
      }

      let parsedUrl: URL;
      try {
        parsedUrl = new URL(targetUrl);
      } catch {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Format URL tidak valid. Mohon sertakan domain seperti https://irma-iryani.josapratama.com",
        });
      }

      const host = parsedUrl.hostname.toLowerCase();

      // Case 1: Direct integration for Irma Iryani's portfolio / backend
      if (
        host.includes("irma-iryani") ||
        host.includes("irma-backend") ||
        targetUrl.includes("irma-iryani")
      ) {
        try {
          const backendBase = "https://irma-backend.josapratama.com/api";
          const [profileRes, expRes, eduRes, skillsRes, certsRes, projectsRes] = await Promise.all([
            fetch(`${backendBase}/profile`, { signal: AbortSignal.timeout(10000) }).then(r => r.json()).catch(() => null),
            fetch(`${backendBase}/experiences`, { signal: AbortSignal.timeout(10000) }).then(r => r.json()).catch(() => null),
            fetch(`${backendBase}/educations`, { signal: AbortSignal.timeout(10000) }).then(r => r.json()).catch(() => null),
            fetch(`${backendBase}/skills`, { signal: AbortSignal.timeout(10000) }).then(r => r.json()).catch(() => null),
            fetch(`${backendBase}/certificates`, { signal: AbortSignal.timeout(10000) }).then(r => r.json()).catch(() => null),
            fetch(`${backendBase}/projects`, { signal: AbortSignal.timeout(10000) }).then(r => r.json()).catch(() => null),
          ]);

          const profile = profileRes?.data || {};
          const experiences = expRes?.data || [];
          const educations = eduRes?.data || [];
          const skillGroups = skillsRes?.data || [];
          const certificates = certsRes?.data || [];
          const rawProjects = projectsRes?.data || [];

          // Format projects
          const formattedProjects = rawProjects
            .filter((p: any) => p.isVisible !== false)
            .map((p: any) => {
              const pTitle = p.title?.id || p.title?.en || (typeof p.title === "string" ? p.title : "Portofolio Proyek");
              const pDesc = p.description?.id || p.description?.en || (typeof p.description === "string" ? p.description : "");
              const pTechs = Array.isArray(p.tags) ? p.tags.join(", ") : (p.technologies || "");
              let pLink = "";
              if (p.pdfPath) {
                pLink = p.pdfPath.startsWith("http") ? p.pdfPath : `https://irma-iryani.josapratama.com${p.pdfPath}`;
              } else if (p.link) {
                pLink = p.link;
              }
              return {
                projectName: pTitle,
                description: pDesc,
                technologies: pTechs,
                link: pLink,
                startDate: "2025",
                endDate: "2026",
              };
            });

          // Format flattened skills
          const formattedSkills: Array<{ category: string; skillName: string; proficiency: string }> = [];
          for (const group of skillGroups) {
            const catName = group.label?.id || group.category || "General";
            if (Array.isArray(group.items)) {
              for (const item of group.items) {
                const lvl = typeof item.level === "number" ? item.level : 80;
                const prof = lvl >= 85 ? "expert" : lvl >= 75 ? "advanced" : lvl >= 60 ? "intermediate" : "beginner";
                formattedSkills.push({
                  category: catName,
                  skillName: item.name || "",
                  proficiency: prof,
                });
              }
            }
          }

          // Format experiences
          const formattedExperiences = experiences.map((exp: any) => {
            const periodStr = typeof exp.period === "string" ? exp.period : exp.period?.id || "";
            const periodParts = periodStr.split(/[–—-]/);
            const start = periodParts[0]?.trim() || "2024";
            const end = periodParts.length > 1 ? periodParts[1]?.trim() : "Present";

            let desc = "";
            if (Array.isArray(exp.points) && exp.points.length > 0) {
              const ptLines = exp.points.map((p: any) => `• ${p.id || p}`);
              desc = ptLines.join("\n");
            } else if (exp.description?.id) {
              desc = exp.description.id;
            }

            if (Array.isArray(exp.events) && exp.events.length > 0) {
              const eventLines = exp.events.map((e: any) => {
                const eName = e.name?.id || e.name || "";
                const eRole = e.role?.id || e.role || "";
                const ePeriod = e.period || "";
                return `• ${eName}${eRole ? ` (${eRole})` : ""}${ePeriod ? ` - ${ePeriod}` : ""}`;
              });
              desc = desc ? `${desc}\n\nKepanitiaan & Kegiatan:\n${eventLines.join("\n")}` : eventLines.join("\n");
            }

            const title = exp.title?.id || exp.title || exp.role?.id || "Pendidik / Anggota Organisasi";
            const company = exp.org || exp.company?.id || exp.company || exp.institution || "Institusi";

            return {
              jobTitle: title,
              company: company,
              location: profile.location || "Sumatera Selatan, Indonesia",
              startDate: start,
              endDate: end,
              description: desc || "Pengalaman profesional dan organisasi akademik.",
            };
          });

          // Format educations
          const formattedEducations = educations.map((edu: any) => {
            const eduPeriod = edu.period?.id || edu.period || "";
            const gradYear = eduPeriod.split(/[–—-]/).pop()?.trim() || "2026";
            return {
              degree: edu.degree?.id || "S1 Pendidikan Kimia",
              field: "Pendidikan Kimia (MIPA)",
              school: edu.university?.id || "Universitas Sriwijaya",
              location: "Palembang / Indralaya, Sumatera Selatan",
              graduationDate: gradYear,
              description: `${edu.description?.id || "Fakultas Keguruan dan Ilmu Pendidikan"} - IPK: ${edu.gpa || profile.gpa || "3,90"} (Dengan Pujian / Cum Laude)`,
            };
          });

          // Format certifications
          const formattedCerts = certificates.map((cert: any) => ({
            certificationName: cert.title?.id || cert.title || "Sertifikat Pelatihan",
            issuer: cert.issuer || "Kementerian / Lembaga",
            issueDate: cert.date || "2026",
            expiryDate: null,
            link: cert.images?.[0] ? `https://irma-iryani.josapratama.com${cert.images[0]}` : null,
          }));

          // Custom sections (traits / highlights)
          const customSections = [
            {
              category: "Academic Highlights & Honors",
              title: "Lulusan S1 Pendidikan Kimia - IPK 3,90",
              subtitle: "Universitas Sriwijaya (Angkatan 2022)",
              date: "2022 - 2026",
              description: "Karakteristik Profesional: Analitis, Teliti, Terstruktur, Adaptif, Kolaboratif, dan Sistematis. Memiliki ketertarikan tinggi pada analisis data, administrasi profesional, dan manajemen laboratorium/pendidikan.",
            },
          ];

          return {
            suggestedTitle: `CV ${profile.name || "Irma Iryani"} - ${profile.title?.id || "Pendidikan Kimia"}`,
            personalInfo: {
              fullName: profile.name || "Irma Iryani",
              email: profile.email || "irmairyani698@gmail.com",
              phone: profile.phone || "0887437204107",
              location: profile.location || "Prabumulih, Sumatera Selatan",
              professionalSummary:
                profile.description?.id ||
                profile.aboutBio?.id ||
                "Lulusan Universitas Sriwijaya dengan IPK 3,90. Terbiasa bekerja terstruktur, teliti mengolah data, dan berkomitmen mengembangkan kompetensi secara profesional.",
            },
            workExperiences: formattedExperiences,
            educations: formattedEducations,
            skills: formattedSkills,
            projects: formattedProjects,
            certifications: formattedCerts,
            languages: [
              { language: "Bahasa Indonesia", proficiency: "Native / Penutur Asli" },
              { language: "English", proficiency: "Intermediate" },
            ],
            customSections,
          };
        } catch (err: any) {
          console.error("Direct Irma fetch failed, falling back to web parser:", err);
          // Fall through to general scraper
        }
      }

      // Case 2: General URL scraper & AI parser
      try {
        const resp = await fetch(targetUrl, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            Accept: "text/html,application/xhtml+xml,application/json,*/*",
          },
          signal: AbortSignal.timeout(15000),
        });

        if (!resp.ok) {
          throw new Error(`Failed to fetch URL: HTTP ${resp.status}`);
        }

        const contentType = resp.headers.get("content-type") || "";
        let extractedText = "";

        if (contentType.includes("application/json")) {
          const json = await resp.json();
          extractedText = JSON.stringify(json, null, 2);
        } else {
          const html = await resp.text();
          const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
          const pageTitle = titleMatch ? titleMatch[1].trim() : "";

          const metaDescMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
          const metaDesc = metaDescMatch ? metaDescMatch[1].trim() : "";

          const jsonLdRegex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
          let jsonLdTexts = "";
          let match: RegExpExecArray | null;
          while ((match = jsonLdRegex.exec(html)) !== null) {
            jsonLdTexts += "\n" + match[1].trim();
          }

          const bodyClean = html
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
            .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
            .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, "")
            .replace(/<[^>]+>/g, " ")
            .replace(/\s+/g, " ")
            .trim();

          extractedText = `Page Title: ${pageTitle}\nDescription: ${metaDesc}\n${jsonLdTexts ? `Structured Data:\n${jsonLdTexts}\n` : ""}Content:\n${bodyClean.slice(0, 12000)}`;
        }

        const prompt = `You are a World-Class AI Resume / CV Parsing Engine.
Extract all structured CV/Resume data from the website/portfolio content below into the exact JSON format requested.
Infer categories and organize skills, educations, work experiences, projects, and certifications cleanly.

WEBSITE CONTENT (URL: ${targetUrl}):
${extractedText.slice(0, 10000)}

Return a VALID JSON object ONLY matching this schema:
{
  "suggestedTitle": "<Candidate Name - CV / Title>",
  "personalInfo": {
    "fullName": "<name>",
    "email": "<email>",
    "phone": "<phone>",
    "location": "<city, country>",
    "professionalSummary": "<concise professional summary>"
  },
  "workExperiences": [
    {
      "jobTitle": "<title>",
      "company": "<company>",
      "location": "<location>",
      "startDate": "<date/year>",
      "endDate": "<date/Present>",
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
      "category": "<e.g. Hard Skills, Soft Skills, Tools>",
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
      "proficiency": "<Native | Fluent | Intermediate>"
    }
  ],
  "customSections": [
    {
      "category": "<Awards | Honors | Activities>",
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
        return JSON.parse(cleaned);
      } catch (scrapeErr: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Gagal mengambil data dari URL: ${scrapeErr.message || "Pastikan URL dapat diakses secara publik."}`,
        });
      }
    }),

  // ─── AI Resume Parser (Import from raw text / PDF) ─────────────────────────
  parseResumeText: protectedProcedure
    .input(z.object({ rawText: z.string().trim().min(20) }))
    .mutation(async ({ input }) => {
      return parseStructuredResumeFromText(input.rawText);
    }),

  parseResumeDocument: protectedProcedure
    .input(
      z.object({
        fileBase64: z.string().min(20),
        fileName: z.string().default("resume.pdf"),
      })
    )
    .mutation(async ({ input }) => {
      let extractedText = "";
      const base64Data = input.fileBase64.replace(/^data:[^;]+;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");

      if (input.fileName.toLowerCase().endsWith(".pdf")) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          const pdfParse = require("pdf-parse");
          const pdfData = await pdfParse(buffer);
          extractedText = pdfData.text || "";
        } catch (err: any) {
          console.error("PDF parse failed:", err);
        }
      }

      if (!extractedText.trim()) {
        extractedText = buffer.toString("utf-8").replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, " ");
      }

      if (!extractedText.trim() || extractedText.trim().length < 20) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Tidak dapat membaca teks dari dokumen. Pastikan file PDF/Word berisi teks yang dapat disalin.",
        });
      }

      return parseStructuredResumeFromText(extractedText);
    }),

  generateSTARBullet: protectedProcedure
    .input(
      z.object({
        jobTitle: z.string().optional(),
        company: z.string().optional(),
        rawBullet: z.string().min(3),
      })
    )
    .mutation(async ({ input }) => {
      const prompt = `Anda adalah spesialis penulisan CV dan rekrutmen standar global (Google, McKinsey, BUMN, Big 4).
Ubah deskripsi tugas / pekerjaan berikut menjadi 3 pilihan poin pencapaian profesional menggunakan formula STAR (Situation, Task, Action, Result) dengan metrik angka / persentase yang realistis, kata kerja aktif yang kuat (misal: "Merancang", "Mengoptimalkan", "Memimpin", "Mengembangkan"), dan format yang siap lolos ATS.

Posisi: ${input.jobTitle || "Profesional"}
Perusahaan / Instansi: ${input.company || "Perusahaan"}
Teks Asli Pelamar:
"${input.rawBullet}"

KEMBALIKAN HANYA JSON VALID dengan format:
{
  "options": [
    {
      "title": "Varian 1: Berorientasi Hasil & Metrik Efisiensi",
      "text": "<Kalimat pencapaian lengkap dengan aksi dan hasil terukur>"
    },
    {
      "title": "Varian 2: Berorientasi Kepemimpinan & Inovasi",
      "text": "<Kalimat pencapaian lengkap>"
    },
    {
      "title": "Varian 3: Format Padat ATS-Friendly",
      "text": "<Kalimat pencapaian lengkap>"
    }
  ]
}`;

      const response = await invokeLLM({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        responseFormat: { type: "json_object" },
        max_tokens: 1000,
      });

      const raw = response.choices[0]?.message?.content || "{}";
      const cleaned = typeof raw === "string" ? raw.replace(/```json\n?|```/g, "").trim() : JSON.stringify(raw);
      try {
        return JSON.parse(cleaned);
      } catch {
        return { options: [] };
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

  // ─── AI Mock Interview Answer Evaluation ──────────────────────────────────
  evaluateMockInterviewAnswer: protectedProcedure
    .input(
      z.object({
        question: z.string().min(5),
        userAnswer: z.string().min(5),
        targetRole: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const prompt = `Anda adalah pewawancara kerja senior dan executive hiring manager global.
Evaluasi jawaban kandidat berikut terhadap pertanyaan wawancara kerja yang diberikan.

Target Posisi: ${input.targetRole || "Profesional"}
Pertanyaan Wawancara:
"${input.question}"

Jawaban Kandidat:
"${input.userAnswer}"

Berikan penilaian objektif dalam JSON VALID:
{
  "score": 85,
  "verdict": "<Predikat singkat, contoh: 'Kuat & Terstruktur' | 'Cukup Baik, Kurang Metrik Terukur' | 'Perlu Pendalaman STAR'>",
  "strengths": [
    "<Poin kelebihan jawaban>",
    "<Poin kelebihan jawaban>"
  ],
  "improvements": [
    "<Poin yang kurang atau perlu ditambahkan, misal: metrik angka, dampak nyata>",
    "<Poin perbaikan>"
  ],
  "enhancedAnswer": "<Versi jawaban ideal yang lebih memukau, percaya diri, dan memakai formula STAR yang konkret>"
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
        return JSON.parse(cleaned);
      } catch {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Gagal mengevaluasi jawaban interview",
        });
      }
    }),

  // ─── Salary Benchmark Estimator ───────────────────────────────────────────
  getSalaryBenchmark: protectedProcedure
    .input(
      z.object({
        jobTitle: z.string().min(2),
        experienceYears: z.number().default(1),
        location: z.string().default("Indonesia"),
      })
    )
    .mutation(async ({ input }) => {
      const prompt = `Anda adalah konsultan kompensasi dan benefit ketenagakerjaan spesialis pasar Indonesia dan remote global.
Analisis estimasi rentang gaji pasar (benchmark) yang realistis berdasarkan data industri tahun berjalan untuk:
Posisi: ${input.jobTitle}
Pengalaman: ${input.experienceYears} tahun
Lokasi / Domisili: ${input.location}

Kembalikan HANYA JSON VALID:
{
  "role": "${input.jobTitle}",
  "seniority": "<Fresh Graduate / Entry-Level | Junior (1-2 thn) | Mid-Level (3-5 thn) | Senior (5+ thn) | Lead / Manager>",
  "indonesia": {
    "min": "<contoh: Rp 6.000.000>",
    "median": "<contoh: Rp 9.500.000>",
    "max": "<contoh: Rp 16.000.000>",
    "formatted": "<contoh: Rp 6.000.000 - Rp 16.000.000 / bulan>"
  },
  "remoteGlobalUSD": {
    "min": "<contoh: $1,200>",
    "median": "<contoh: $2,200>",
    "max": "<contoh: $3,800>",
    "formatted": "<contoh: $1,200 - $3,800 / month>"
  },
  "marketInsights": "<Analisis 2-3 kalimat mengenai tren permintaan pasar, kualifikasi kunci yang menaikkan nilai tawar pelamar>",
  "highPayingSkills": [
    "<skill 1 yang menaikkan gaji>",
    "<skill 2>",
    "<skill 3>"
  ],
  "negotiationTips": [
    "<tips negosiasi gaji 1>",
    "<tips negosiasi gaji 2>"
  ]
}`;

      const response = await invokeLLM({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        responseFormat: { type: "json_object" },
        max_tokens: 1200,
      });

      const raw = response.choices[0]?.message?.content || "{}";
      const cleaned = typeof raw === "string" ? raw.replace(/```json\n?|```/g, "").trim() : JSON.stringify(raw);
      try {
        return JSON.parse(cleaned);
      } catch {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Gagal menghitung estimasi gaji",
        });
      }
    }),
});
