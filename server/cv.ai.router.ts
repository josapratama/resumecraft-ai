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
  const [personal, experiences, educations, skills, projects, certifications] =
    await Promise.all([
      getOrCreatePersonalInfo(cvId),
      getWorkExperiences(cvId),
      getEducations(cvId),
      getSkills(cvId),
      getProjects(cvId),
      getCertifications(cvId),
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
});
