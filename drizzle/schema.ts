import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  username: varchar("username", { length: 64 }).notNull().unique(),
  passwordHash: varchar("passwordHash", { length: 255 }).notNull(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const cvs = mysqlTable("cvs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId")
    .notNull()
    .references(() => users.id),
  title: varchar("title", { length: 255 }).notNull(),
  template: mysqlEnum("template", [
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
  ])
    .default("modern")
    .notNull(),
  isPublic: int("isPublic").default(0).notNull(),
  shareSlug: varchar("shareSlug", { length: 128 }),
  viewsCount: int("viewsCount").default(0).notNull(),
  accentColor: varchar("accentColor", { length: 32 }),
  fontFamily: varchar("fontFamily", { length: 64 }),
  targetRole: varchar("targetRole", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CV = typeof cvs.$inferSelect;
export type InsertCV = typeof cvs.$inferInsert;

export const personalInfos = mysqlTable("personalInfos", {
  id: int("id").autoincrement().primaryKey(),
  cvId: int("cvId")
    .notNull()
    .unique()
    .references(() => cvs.id),
  fullName: varchar("fullName", { length: 255 }),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }),
  location: varchar("location", { length: 255 }),
  professionalSummary: text("professionalSummary"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PersonalInfo = typeof personalInfos.$inferSelect;
export type InsertPersonalInfo = typeof personalInfos.$inferInsert;

export const workExperiences = mysqlTable("workExperiences", {
  id: int("id").autoincrement().primaryKey(),
  cvId: int("cvId")
    .notNull()
    .references(() => cvs.id),
  position: int("position").notNull(),
  jobTitle: varchar("jobTitle", { length: 255 }).notNull(),
  company: varchar("company", { length: 255 }).notNull(),
  location: varchar("location", { length: 255 }),
  startDate: varchar("startDate", { length: 10 }),
  endDate: varchar("endDate", { length: 10 }),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type WorkExperience = typeof workExperiences.$inferSelect;
export type InsertWorkExperience = typeof workExperiences.$inferInsert;

export const educations = mysqlTable("educations", {
  id: int("id").autoincrement().primaryKey(),
  cvId: int("cvId")
    .notNull()
    .references(() => cvs.id),
  position: int("position").notNull(),
  degree: varchar("degree", { length: 255 }).notNull(),
  field: varchar("field", { length: 255 }).notNull(),
  school: varchar("school", { length: 255 }).notNull(),
  location: varchar("location", { length: 255 }),
  graduationDate: varchar("graduationDate", { length: 10 }),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Education = typeof educations.$inferSelect;
export type InsertEducation = typeof educations.$inferInsert;

export const skills = mysqlTable("skills", {
  id: int("id").autoincrement().primaryKey(),
  cvId: int("cvId")
    .notNull()
    .references(() => cvs.id),
  position: int("position").notNull(),
  category: varchar("category", { length: 255 }).notNull(),
  skillName: varchar("skillName", { length: 255 }).notNull(),
  proficiency: mysqlEnum("proficiency", [
    "beginner",
    "intermediate",
    "advanced",
    "expert",
  ]),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Skill = typeof skills.$inferSelect;
export type InsertSkill = typeof skills.$inferInsert;

export const projects = mysqlTable("projects", {
  id: int("id").autoincrement().primaryKey(),
  cvId: int("cvId")
    .notNull()
    .references(() => cvs.id),
  position: int("position").notNull(),
  projectName: varchar("projectName", { length: 255 }).notNull(),
  description: text("description"),
  technologies: text("technologies"),
  link: varchar("link", { length: 2048 }),
  startDate: varchar("startDate", { length: 10 }),
  endDate: varchar("endDate", { length: 10 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;

export const certifications = mysqlTable("certifications", {
  id: int("id").autoincrement().primaryKey(),
  cvId: int("cvId")
    .notNull()
    .references(() => cvs.id),
  position: int("position").notNull(),
  certificationName: varchar("certificationName", { length: 255 }).notNull(),
  issuer: varchar("issuer", { length: 255 }).notNull(),
  issueDate: varchar("issueDate", { length: 10 }),
  expiryDate: varchar("expiryDate", { length: 10 }),
  link: varchar("link", { length: 2048 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Certification = typeof certifications.$inferSelect;
export type InsertCertification = typeof certifications.$inferInsert;

export const languages = mysqlTable("languages", {
  id: int("id").autoincrement().primaryKey(),
  cvId: int("cvId")
    .notNull()
    .references(() => cvs.id),
  position: int("position").notNull(),
  language: varchar("language", { length: 128 }).notNull(),
  proficiency: varchar("proficiency", { length: 64 })
    .default("Professional Working")
    .notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Language = typeof languages.$inferSelect;
export type InsertLanguage = typeof languages.$inferInsert;

export const customSections = mysqlTable("customSections", {
  id: int("id").autoincrement().primaryKey(),
  cvId: int("cvId")
    .notNull()
    .references(() => cvs.id),
  position: int("position").notNull(),
  category: varchar("category", { length: 128 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  subtitle: varchar("subtitle", { length: 255 }),
  date: varchar("date", { length: 64 }),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CustomSection = typeof customSections.$inferSelect;
export type InsertCustomSection = typeof customSections.$inferInsert;
