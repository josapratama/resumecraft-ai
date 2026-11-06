import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import {
  createCV,
  getCVsByUserId,
  getCVById,
  updateCV,
  deleteCV,
  duplicateCV,
  getOrCreatePersonalInfo,
  updatePersonalInfo,
  getWorkExperiences,
  createWorkExperience,
  getWorkExperienceById,
  updateWorkExperience,
  deleteWorkExperience,
  reorderWorkExperiences,
  getEducations,
  createEducation,
  getEducationById,
  updateEducation,
  deleteEducation,
  reorderEducations,
  getSkills,
  createSkill,
  getSkillById,
  updateSkill,
  deleteSkill,
  reorderSkills,
  getProjects,
  createProject,
  getProjectById,
  updateProject,
  deleteProject,
  reorderProjects,
  getCertifications,
  createCertification,
  getCertificationById,
  updateCertification,
  deleteCertification,
  reorderCertifications,
  getLanguages,
  createLanguage,
  updateLanguage,
  deleteLanguage,
  reorderLanguages,
  getCustomSections,
  createCustomSection,
  updateCustomSection,
  deleteCustomSection,
  reorderCustomSections,
  getCVByShareSlug,
  incrementCVViews,
} from "./db";

const templateEnum = z.enum([
  "modern",
  "classic",
  "minimal",
  "executive",
  "tech",
  "creative",
  "elegant",
  "bold",
  "corporate",
  "academic",
  "compact",
  "timeline",
  "infographic",
  "newspaper",
  "nordic",
  "retro",
  "stealth",
  "gradient",
  "brutalist",
  "sidebar-light",
  "two-page",
  "portfolio",
  "monochrome",
  "atlas",
  "swiss",
]);

// Reusable trimmed string validators with max lengths matching the DB schema
const shortStr = z.string().trim().min(1).max(255);
const medStr = z.string().trim().max(320);
// text columns — no hard DB limit but cap at 10 000 chars to prevent abuse
const longStr = z.string().trim().max(10000);
const urlStr = z
  .string()
  .trim()
  .max(2048)
  .refine(v => v === "" || /^https?:\/\/.+/.test(v), {
    message: "Must be a valid URL starting with http:// or https://",
  });
const dateStr = z.string().trim().max(10);

export const cvRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return getCVsByUserId(ctx.user.id);
  }),

  get: protectedProcedure
    .input(z.object({ cvId: z.number() }))
    .query(async ({ ctx, input }) => {
      const cv = await getCVById(input.cvId);
      if (!cv)
        throw new TRPCError({ code: "NOT_FOUND", message: "CV not found" });
      if (cv.userId !== ctx.user.id)
        throw new TRPCError({ code: "FORBIDDEN", message: "Unauthorized" });
      return cv;
    }),

  create: protectedProcedure
    .input(z.object({ title: shortStr, template: templateEnum.optional() }))
    .mutation(async ({ ctx, input }) => {
      return createCV(ctx.user.id, input.title, input.template);
    }),

  update: protectedProcedure
    .input(
      z.object({
        cvId: z.number(),
        title: shortStr.optional(),
        template: templateEnum.optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const cv = await getCVById(input.cvId);
      if (!cv)
        throw new TRPCError({ code: "NOT_FOUND", message: "CV not found" });
      if (cv.userId !== ctx.user.id)
        throw new TRPCError({ code: "FORBIDDEN", message: "Unauthorized" });
      return updateCV(input.cvId, {
        title: input.title,
        template: input.template,
      });
    }),

  delete: protectedProcedure
    .input(z.object({ cvId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const cv = await getCVById(input.cvId);
      if (!cv)
        throw new TRPCError({ code: "NOT_FOUND", message: "CV not found" });
      if (cv.userId !== ctx.user.id)
        throw new TRPCError({ code: "FORBIDDEN", message: "Unauthorized" });
      return deleteCV(input.cvId);
    }),

  personalInfo: router({
    get: protectedProcedure
      .input(z.object({ cvId: z.number() }))
      .query(async ({ ctx, input }) => {
        const cv = await getCVById(input.cvId);
        if (!cv)
          throw new TRPCError({ code: "NOT_FOUND", message: "CV not found" });
        if (cv.userId !== ctx.user.id)
          throw new TRPCError({ code: "FORBIDDEN", message: "Unauthorized" });
        return getOrCreatePersonalInfo(input.cvId);
      }),

    update: protectedProcedure
      .input(
        z.object({
          cvId: z.number(),
          fullName: shortStr.optional(),
          email: medStr.optional(),
          phone: z.string().trim().max(20).optional(),
          location: shortStr.optional(),
          professionalSummary: longStr.optional(),
          photoUrl: z.string().optional().nullable(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const cv = await getCVById(input.cvId);
        if (!cv)
          throw new TRPCError({ code: "NOT_FOUND", message: "CV not found" });
        if (cv.userId !== ctx.user.id)
          throw new TRPCError({ code: "FORBIDDEN", message: "Unauthorized" });
        const { cvId, ...data } = input;
        return updatePersonalInfo(cvId, data);
      }),
  }),

  workExperience: router({
    list: protectedProcedure
      .input(z.object({ cvId: z.number() }))
      .query(async ({ ctx, input }) => {
        const cv = await getCVById(input.cvId);
        if (!cv)
          throw new TRPCError({ code: "NOT_FOUND", message: "CV not found" });
        if (cv.userId !== ctx.user.id)
          throw new TRPCError({ code: "FORBIDDEN", message: "Unauthorized" });
        return getWorkExperiences(input.cvId);
      }),

    create: protectedProcedure
      .input(
        z.object({
          cvId: z.number(),
          jobTitle: shortStr,
          company: shortStr,
          location: shortStr.optional(),
          startDate: dateStr.optional(),
          endDate: dateStr.optional(),
          description: longStr.optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const cv = await getCVById(input.cvId);
        if (!cv)
          throw new TRPCError({ code: "NOT_FOUND", message: "CV not found" });
        if (cv.userId !== ctx.user.id)
          throw new TRPCError({ code: "FORBIDDEN", message: "Unauthorized" });
        const { cvId, ...data } = input;
        return createWorkExperience(cvId, data);
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          jobTitle: shortStr.optional(),
          company: shortStr.optional(),
          location: shortStr.optional(),
          startDate: dateStr.optional(),
          endDate: dateStr.optional(),
          description: longStr.optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // Ownership check: verify the item belongs to this user
        const item = await getWorkExperienceById(input.id);
        if (!item)
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Work experience not found",
          });
        const cv = await getCVById(item.cvId);
        if (!cv || cv.userId !== ctx.user.id)
          throw new TRPCError({ code: "FORBIDDEN", message: "Unauthorized" });
        const { id, ...data } = input;
        return updateWorkExperience(id, data);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const item = await getWorkExperienceById(input.id);
        if (!item)
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Work experience not found",
          });
        const cv = await getCVById(item.cvId);
        if (!cv || cv.userId !== ctx.user.id)
          throw new TRPCError({ code: "FORBIDDEN", message: "Unauthorized" });
        return deleteWorkExperience(input.id);
      }),

    reorder: protectedProcedure
      .input(z.object({ cvId: z.number(), ids: z.array(z.number()) }))
      .mutation(async ({ ctx, input }) => {
        const cv = await getCVById(input.cvId);
        if (!cv)
          throw new TRPCError({ code: "NOT_FOUND", message: "CV not found" });
        if (cv.userId !== ctx.user.id)
          throw new TRPCError({ code: "FORBIDDEN", message: "Unauthorized" });
        return reorderWorkExperiences(input.cvId, input.ids);
      }),
  }),

  education: router({
    list: protectedProcedure
      .input(z.object({ cvId: z.number() }))
      .query(async ({ ctx, input }) => {
        const cv = await getCVById(input.cvId);
        if (!cv)
          throw new TRPCError({ code: "NOT_FOUND", message: "CV not found" });
        if (cv.userId !== ctx.user.id)
          throw new TRPCError({ code: "FORBIDDEN", message: "Unauthorized" });
        return getEducations(input.cvId);
      }),

    create: protectedProcedure
      .input(
        z.object({
          cvId: z.number(),
          degree: shortStr,
          field: shortStr,
          school: shortStr,
          location: shortStr.optional(),
          graduationDate: dateStr.optional(),
          description: longStr.optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const cv = await getCVById(input.cvId);
        if (!cv)
          throw new TRPCError({ code: "NOT_FOUND", message: "CV not found" });
        if (cv.userId !== ctx.user.id)
          throw new TRPCError({ code: "FORBIDDEN", message: "Unauthorized" });
        const { cvId, ...data } = input;
        return createEducation(cvId, data);
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          degree: shortStr.optional(),
          field: shortStr.optional(),
          school: shortStr.optional(),
          location: shortStr.optional(),
          graduationDate: dateStr.optional(),
          description: longStr.optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const item = await getEducationById(input.id);
        if (!item)
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Education not found",
          });
        const cv = await getCVById(item.cvId);
        if (!cv || cv.userId !== ctx.user.id)
          throw new TRPCError({ code: "FORBIDDEN", message: "Unauthorized" });
        const { id, ...data } = input;
        return updateEducation(id, data);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const item = await getEducationById(input.id);
        if (!item)
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Education not found",
          });
        const cv = await getCVById(item.cvId);
        if (!cv || cv.userId !== ctx.user.id)
          throw new TRPCError({ code: "FORBIDDEN", message: "Unauthorized" });
        return deleteEducation(input.id);
      }),

    reorder: protectedProcedure
      .input(z.object({ cvId: z.number(), ids: z.array(z.number()) }))
      .mutation(async ({ ctx, input }) => {
        const cv = await getCVById(input.cvId);
        if (!cv)
          throw new TRPCError({ code: "NOT_FOUND", message: "CV not found" });
        if (cv.userId !== ctx.user.id)
          throw new TRPCError({ code: "FORBIDDEN", message: "Unauthorized" });
        return reorderEducations(input.cvId, input.ids);
      }),
  }),

  skill: router({
    list: protectedProcedure
      .input(z.object({ cvId: z.number() }))
      .query(async ({ ctx, input }) => {
        const cv = await getCVById(input.cvId);
        if (!cv)
          throw new TRPCError({ code: "NOT_FOUND", message: "CV not found" });
        if (cv.userId !== ctx.user.id)
          throw new TRPCError({ code: "FORBIDDEN", message: "Unauthorized" });
        return getSkills(input.cvId);
      }),

    create: protectedProcedure
      .input(
        z.object({
          cvId: z.number(),
          category: shortStr,
          skillName: shortStr,
          proficiency: z
            .enum(["beginner", "intermediate", "advanced", "expert"])
            .optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const cv = await getCVById(input.cvId);
        if (!cv)
          throw new TRPCError({ code: "NOT_FOUND", message: "CV not found" });
        if (cv.userId !== ctx.user.id)
          throw new TRPCError({ code: "FORBIDDEN", message: "Unauthorized" });
        const { cvId, ...data } = input;
        return createSkill(cvId, data);
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          category: shortStr.optional(),
          skillName: shortStr.optional(),
          proficiency: z
            .enum(["beginner", "intermediate", "advanced", "expert"])
            .optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const item = await getSkillById(input.id);
        if (!item)
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Skill not found",
          });
        const cv = await getCVById(item.cvId);
        if (!cv || cv.userId !== ctx.user.id)
          throw new TRPCError({ code: "FORBIDDEN", message: "Unauthorized" });
        const { id, ...data } = input;
        return updateSkill(id, data);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const item = await getSkillById(input.id);
        if (!item)
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Skill not found",
          });
        const cv = await getCVById(item.cvId);
        if (!cv || cv.userId !== ctx.user.id)
          throw new TRPCError({ code: "FORBIDDEN", message: "Unauthorized" });
        return deleteSkill(input.id);
      }),

    reorder: protectedProcedure
      .input(z.object({ cvId: z.number(), ids: z.array(z.number()) }))
      .mutation(async ({ ctx, input }) => {
        const cv = await getCVById(input.cvId);
        if (!cv)
          throw new TRPCError({ code: "NOT_FOUND", message: "CV not found" });
        if (cv.userId !== ctx.user.id)
          throw new TRPCError({ code: "FORBIDDEN", message: "Unauthorized" });
        return reorderSkills(input.cvId, input.ids);
      }),
  }),

  project: router({
    list: protectedProcedure
      .input(z.object({ cvId: z.number() }))
      .query(async ({ ctx, input }) => {
        const cv = await getCVById(input.cvId);
        if (!cv)
          throw new TRPCError({ code: "NOT_FOUND", message: "CV not found" });
        if (cv.userId !== ctx.user.id)
          throw new TRPCError({ code: "FORBIDDEN", message: "Unauthorized" });
        return getProjects(input.cvId);
      }),

    create: protectedProcedure
      .input(
        z.object({
          cvId: z.number(),
          projectName: shortStr,
          description: longStr.optional(),
          technologies: longStr.optional(),
          link: urlStr.optional(),
          startDate: dateStr.optional(),
          endDate: dateStr.optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const cv = await getCVById(input.cvId);
        if (!cv)
          throw new TRPCError({ code: "NOT_FOUND", message: "CV not found" });
        if (cv.userId !== ctx.user.id)
          throw new TRPCError({ code: "FORBIDDEN", message: "Unauthorized" });
        const { cvId, ...data } = input;
        return createProject(cvId, data);
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          projectName: shortStr.optional(),
          description: longStr.optional(),
          technologies: longStr.optional(),
          link: urlStr.optional(),
          startDate: dateStr.optional(),
          endDate: dateStr.optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const item = await getProjectById(input.id);
        if (!item)
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Project not found",
          });
        const cv = await getCVById(item.cvId);
        if (!cv || cv.userId !== ctx.user.id)
          throw new TRPCError({ code: "FORBIDDEN", message: "Unauthorized" });
        const { id, ...data } = input;
        return updateProject(id, data);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const item = await getProjectById(input.id);
        if (!item)
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Project not found",
          });
        const cv = await getCVById(item.cvId);
        if (!cv || cv.userId !== ctx.user.id)
          throw new TRPCError({ code: "FORBIDDEN", message: "Unauthorized" });
        return deleteProject(input.id);
      }),

    reorder: protectedProcedure
      .input(z.object({ cvId: z.number(), ids: z.array(z.number()) }))
      .mutation(async ({ ctx, input }) => {
        const cv = await getCVById(input.cvId);
        if (!cv)
          throw new TRPCError({ code: "NOT_FOUND", message: "CV not found" });
        if (cv.userId !== ctx.user.id)
          throw new TRPCError({ code: "FORBIDDEN", message: "Unauthorized" });
        return reorderProjects(input.cvId, input.ids);
      }),
  }),

  certification: router({
    list: protectedProcedure
      .input(z.object({ cvId: z.number() }))
      .query(async ({ ctx, input }) => {
        const cv = await getCVById(input.cvId);
        if (!cv)
          throw new TRPCError({ code: "NOT_FOUND", message: "CV not found" });
        if (cv.userId !== ctx.user.id)
          throw new TRPCError({ code: "FORBIDDEN", message: "Unauthorized" });
        return getCertifications(input.cvId);
      }),

    create: protectedProcedure
      .input(
        z.object({
          cvId: z.number(),
          certificationName: shortStr,
          issuer: shortStr,
          issueDate: dateStr.optional(),
          expiryDate: dateStr.optional(),
          link: urlStr.optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const cv = await getCVById(input.cvId);
        if (!cv)
          throw new TRPCError({ code: "NOT_FOUND", message: "CV not found" });
        if (cv.userId !== ctx.user.id)
          throw new TRPCError({ code: "FORBIDDEN", message: "Unauthorized" });
        const { cvId, ...data } = input;
        return createCertification(cvId, data);
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          certificationName: shortStr.optional(),
          issuer: shortStr.optional(),
          issueDate: dateStr.optional(),
          expiryDate: dateStr.optional(),
          link: urlStr.optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const item = await getCertificationById(input.id);
        if (!item)
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Certification not found",
          });
        const cv = await getCVById(item.cvId);
        if (!cv || cv.userId !== ctx.user.id)
          throw new TRPCError({ code: "FORBIDDEN", message: "Unauthorized" });
        const { id, ...data } = input;
        return updateCertification(id, data);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const item = await getCertificationById(input.id);
        if (!item)
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Certification not found",
          });
        const cv = await getCVById(item.cvId);
        if (!cv || cv.userId !== ctx.user.id)
          throw new TRPCError({ code: "FORBIDDEN", message: "Unauthorized" });
        return deleteCertification(input.id);
      }),

    reorder: protectedProcedure
      .input(z.object({ cvId: z.number(), ids: z.array(z.number()) }))
      .mutation(async ({ ctx, input }) => {
        const cv = await getCVById(input.cvId);
        if (!cv)
          throw new TRPCError({ code: "NOT_FOUND", message: "CV not found" });
        if (cv.userId !== ctx.user.id)
          throw new TRPCError({ code: "FORBIDDEN", message: "Unauthorized" });
        return reorderCertifications(input.cvId, input.ids);
      }),
  }),

  languages: router({
    list: protectedProcedure
      .input(z.object({ cvId: z.number() }))
      .query(async ({ ctx, input }) => {
        const cv = await getCVById(input.cvId);
        if (!cv) throw new TRPCError({ code: "NOT_FOUND", message: "CV not found" });
        if (cv.userId !== ctx.user.id) throw new TRPCError({ code: "FORBIDDEN", message: "Unauthorized" });
        return getLanguages(input.cvId);
      }),

    create: protectedProcedure
      .input(
        z.object({
          cvId: z.number(),
          language: shortStr,
          proficiency: z.string().trim().max(64).default("Professional Working"),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const cv = await getCVById(input.cvId);
        if (!cv) throw new TRPCError({ code: "NOT_FOUND", message: "CV not found" });
        if (cv.userId !== ctx.user.id) throw new TRPCError({ code: "FORBIDDEN", message: "Unauthorized" });
        return createLanguage(input.cvId, {
          language: input.language,
          proficiency: input.proficiency,
        });
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          language: shortStr.optional(),
          proficiency: z.string().trim().max(64).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;
        return updateLanguage(id, data);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        return deleteLanguage(input.id);
      }),

    reorder: protectedProcedure
      .input(z.object({ cvId: z.number(), ids: z.array(z.number()) }))
      .mutation(async ({ ctx, input }) => {
        const cv = await getCVById(input.cvId);
        if (!cv) throw new TRPCError({ code: "NOT_FOUND", message: "CV not found" });
        if (cv.userId !== ctx.user.id) throw new TRPCError({ code: "FORBIDDEN", message: "Unauthorized" });
        return reorderLanguages(input.cvId, input.ids);
      }),
  }),

  customSections: router({
    list: protectedProcedure
      .input(z.object({ cvId: z.number() }))
      .query(async ({ ctx, input }) => {
        const cv = await getCVById(input.cvId);
        if (!cv) throw new TRPCError({ code: "NOT_FOUND", message: "CV not found" });
        if (cv.userId !== ctx.user.id) throw new TRPCError({ code: "FORBIDDEN", message: "Unauthorized" });
        return getCustomSections(input.cvId);
      }),

    create: protectedProcedure
      .input(
        z.object({
          cvId: z.number(),
          category: shortStr,
          title: shortStr,
          subtitle: shortStr.optional(),
          date: z.string().trim().max(64).optional(),
          description: longStr.optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const cv = await getCVById(input.cvId);
        if (!cv) throw new TRPCError({ code: "NOT_FOUND", message: "CV not found" });
        if (cv.userId !== ctx.user.id) throw new TRPCError({ code: "FORBIDDEN", message: "Unauthorized" });
        return createCustomSection(input.cvId, {
          category: input.category,
          title: input.title,
          subtitle: input.subtitle,
          date: input.date,
          description: input.description,
        });
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          category: shortStr.optional(),
          title: shortStr.optional(),
          subtitle: shortStr.optional(),
          date: z.string().trim().max(64).optional(),
          description: longStr.optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;
        return updateCustomSection(id, data);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        return deleteCustomSection(input.id);
      }),

    reorder: protectedProcedure
      .input(z.object({ cvId: z.number(), ids: z.array(z.number()) }))
      .mutation(async ({ ctx, input }) => {
        const cv = await getCVById(input.cvId);
        if (!cv) throw new TRPCError({ code: "NOT_FOUND", message: "CV not found" });
        if (cv.userId !== ctx.user.id) throw new TRPCError({ code: "FORBIDDEN", message: "Unauthorized" });
        return reorderCustomSections(input.cvId, input.ids);
      }),
  }),

  updateDesign: protectedProcedure
    .input(
      z.object({
        cvId: z.number(),
        accentColor: z.string().trim().max(32).optional(),
        fontFamily: z.string().trim().max(64).optional(),
        targetRole: z.string().trim().max(255).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const cv = await getCVById(input.cvId);
      if (!cv) throw new TRPCError({ code: "NOT_FOUND", message: "CV not found" });
      if (cv.userId !== ctx.user.id) throw new TRPCError({ code: "FORBIDDEN", message: "Unauthorized" });
      return updateCV(input.cvId, {
        accentColor: input.accentColor,
        fontFamily: input.fontFamily,
        targetRole: input.targetRole,
      });
    }),

  togglePublicShare: protectedProcedure
    .input(
      z.object({
        cvId: z.number(),
        isPublic: z.boolean(),
        customSlug: z.string().trim().max(128).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const cv = await getCVById(input.cvId);
      if (!cv) throw new TRPCError({ code: "NOT_FOUND", message: "CV not found" });
      if (cv.userId !== ctx.user.id) throw new TRPCError({ code: "FORBIDDEN", message: "Unauthorized" });

      let slug = cv.shareSlug;
      if (input.isPublic && !slug) {
        // Generate a clean url-friendly slug
        const randomPart = Math.random().toString(36).substring(2, 8);
        const titleSlug = (cv.title || "cv")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");
        slug = input.customSlug || `${titleSlug}-${randomPart}`;
      } else if (input.customSlug) {
        slug = input.customSlug;
      }

      await updateCV(input.cvId, {
        isPublic: input.isPublic ? 1 : 0,
        shareSlug: slug,
      });

      return {
        isPublic: input.isPublic,
        shareSlug: slug,
      };
    }),

  getPublic: publicProcedure
    .input(z.object({ identifier: z.string().trim() }))
    .query(async ({ input }) => {
      let cv = null;
      const numericId = parseInt(input.identifier, 10);
      if (!isNaN(numericId) && String(numericId) === input.identifier) {
        cv = await getCVById(numericId);
      } else {
        cv = await getCVByShareSlug(input.identifier);
      }

      if (!cv || !cv.isPublic) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "This CV is private or does not exist",
        });
      }

      // Increment views count silently
      incrementCVViews(cv.id).catch(() => {});

      const [
        personalInfo,
        workExperiences,
        educations,
        skills,
        projects,
        certifications,
        langs,
        customs,
      ] = await Promise.all([
        getOrCreatePersonalInfo(cv.id),
        getWorkExperiences(cv.id),
        getEducations(cv.id),
        getSkills(cv.id),
        getProjects(cv.id),
        getCertifications(cv.id),
        getLanguages(cv.id),
        getCustomSections(cv.id),
      ]);

      return {
        cv,
        personalInfo,
        workExperiences,
        educations,
        skills,
        projects,
        certifications,
        languages: langs,
        customSections: customs,
      };
    }),

  loadFull: protectedProcedure
    .input(z.object({ cvId: z.number() }))
    .query(async ({ ctx, input }) => {
      const cv = await getCVById(input.cvId);
      if (!cv)
        throw new TRPCError({ code: "NOT_FOUND", message: "CV not found" });
      if (cv.userId !== ctx.user.id)
        throw new TRPCError({ code: "FORBIDDEN", message: "Unauthorized" });

      const [
        personalInfo,
        workExperiences,
        educations,
        skills,
        projects,
        certifications,
        langs,
        customs,
      ] = await Promise.all([
        getOrCreatePersonalInfo(input.cvId),
        getWorkExperiences(input.cvId),
        getEducations(input.cvId),
        getSkills(input.cvId),
        getProjects(input.cvId),
        getCertifications(input.cvId),
        getLanguages(input.cvId),
        getCustomSections(input.cvId),
      ]);

      return {
        cv,
        personalInfo,
        workExperiences,
        educations,
        skills,
        projects,
        certifications,
        languages: langs,
        customSections: customs,
      };
    }),

  duplicate: protectedProcedure
    .input(
      z.object({
        cvId: z.number(),
        newTitle: z.string().trim().optional(),
        targetRole: z.string().trim().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const cv = await getCVById(input.cvId);
      if (!cv)
        throw new TRPCError({ code: "NOT_FOUND", message: "CV not found" });
      if (cv.userId !== ctx.user.id)
        throw new TRPCError({ code: "FORBIDDEN", message: "Unauthorized" });

      // All inserts run inside a single MySQL transaction — atomic rollback on error.
      return duplicateCV({
        sourceCvId: input.cvId,
        userId: ctx.user.id,
        newTitle: input.newTitle || `${cv.title} (Copy)`,
        template: cv.template,
        targetRole: input.targetRole,
      });
    }),
});
