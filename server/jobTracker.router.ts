import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import {
  getJobApplicationsByUserId,
  createJobApplication,
  updateJobApplication,
  deleteJobApplication,
} from "./db";

export const jobTrackerRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return getJobApplicationsByUserId(ctx.user.id);
  }),

  create: protectedProcedure
    .input(
      z.object({
        companyName: z.string().min(1, "Nama perusahaan wajib diisi"),
        jobTitle: z.string().min(1, "Posisi pekerjaan wajib diisi"),
        location: z.string().optional().nullable(),
        jobUrl: z.string().optional().nullable(),
        status: z.enum(["applied", "screening", "interview", "offer", "rejected"]).default("applied"),
        appliedDate: z.string().optional().nullable(),
        notes: z.string().optional().nullable(),
        salaryExpectation: z.string().optional().nullable(),
        cvId: z.number().optional().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return createJobApplication({
        userId: ctx.user.id,
        companyName: input.companyName,
        jobTitle: input.jobTitle,
        location: input.location ?? null,
        jobUrl: input.jobUrl ?? null,
        status: input.status,
        appliedDate: input.appliedDate || new Date().toISOString().split("T")[0],
        notes: input.notes ?? null,
        salaryExpectation: input.salaryExpectation ?? null,
        cvId: input.cvId ?? null,
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        companyName: z.string().optional(),
        jobTitle: z.string().optional(),
        location: z.string().optional().nullable(),
        jobUrl: z.string().optional().nullable(),
        status: z.enum(["applied", "screening", "interview", "offer", "rejected"]).optional(),
        appliedDate: z.string().optional().nullable(),
        notes: z.string().optional().nullable(),
        salaryExpectation: z.string().optional().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return updateJobApplication(id, ctx.user.id, data);
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      return deleteJobApplication(input.id, ctx.user.id);
    }),
});
