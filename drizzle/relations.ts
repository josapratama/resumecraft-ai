import { relations } from "drizzle-orm";
import {
  users,
  cvs,
  personalInfos,
  workExperiences,
  educations,
  skills,
  projects,
  certifications,
} from "./schema";

export const usersRelations = relations(users, ({ many }) => ({
  cvs: many(cvs),
}));

export const cvsRelations = relations(cvs, ({ one, many }) => ({
  user: one(users, { fields: [cvs.userId], references: [users.id] }),
  personalInfo: one(personalInfos, {
    fields: [cvs.id],
    references: [personalInfos.cvId],
  }),
  workExperiences: many(workExperiences),
  educations: many(educations),
  skills: many(skills),
  projects: many(projects),
  certifications: many(certifications),
}));

export const personalInfosRelations = relations(personalInfos, ({ one }) => ({
  cv: one(cvs, { fields: [personalInfos.cvId], references: [cvs.id] }),
}));

export const workExperiencesRelations = relations(
  workExperiences,
  ({ one }) => ({
    cv: one(cvs, { fields: [workExperiences.cvId], references: [cvs.id] }),
  })
);

export const educationsRelations = relations(educations, ({ one }) => ({
  cv: one(cvs, { fields: [educations.cvId], references: [cvs.id] }),
}));

export const skillsRelations = relations(skills, ({ one }) => ({
  cv: one(cvs, { fields: [skills.cvId], references: [cvs.id] }),
}));

export const projectsRelations = relations(projects, ({ one }) => ({
  cv: one(cvs, { fields: [projects.cvId], references: [cvs.id] }),
}));

export const certificationsRelations = relations(certifications, ({ one }) => ({
  cv: one(cvs, { fields: [certifications.cvId], references: [cvs.id] }),
}));
