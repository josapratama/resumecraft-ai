import { eq, sql, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { migrate } from "drizzle-orm/mysql2/migrator";
import mysql from "mysql2/promise";
import path from "path";
import fs from "fs";
import {
  users,
  cvs,
  personalInfos,
  InsertPersonalInfo,
  workExperiences,
  InsertWorkExperience,
  educations,
  InsertEducation,
  skills,
  InsertSkill,
  projects,
  InsertProject,
  certifications,
  InsertCertification,
  languages,
  InsertLanguage,
  customSections,
  InsertCustomSection,
} from "../drizzle/schema";

// Pool-based connection — required for Drizzle transactions (which need a
// dedicated connection borrowed from the pool).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _db: any = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const pool = mysql.createPool(process.env.DATABASE_URL);
      _db = drizzle(pool);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return _db as ReturnType<typeof drizzle> | null;
}

export async function runMigrations() {
  if (!process.env.DATABASE_URL) {
    console.warn("[Database] DATABASE_URL is not set; skipping migrations.");
    return;
  }

  const migrationsFolder = path.resolve(process.cwd(), "drizzle");
  if (!fs.existsSync(migrationsFolder)) {
    console.warn(`[Database] Migrations folder not found at ${migrationsFolder}; skipping auto-migration.`);
    return;
  }

  const maxRetries = 10;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[Database] Checking and running migrations (attempt ${attempt}/${maxRetries})...`);
      const db = await getDb();
      if (!db) {
        throw new Error("Database pool could not be initialized");
      }
      await migrate(db, { migrationsFolder });
      console.log("[Database] Database migrations applied successfully!");
      return;
    } catch (err: any) {
      console.warn(`[Database] Migration attempt ${attempt} failed: ${err.message || err}`);
      if (attempt === maxRetries) {
        throw err;
      }
      await new Promise(res => setTimeout(res, 2000));
    }
  }
}

// ─── User Operations ──────────────────────────────────────────────────────────

export async function getUserByUsername(username: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(users)
    .where(eq(users.username, username))
    .limit(1);
  return result[0];
}

export async function getUserById(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  return result[0];
}

export async function createUser(data: {
  username: string;
  passwordHash: string;
  name?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(users).values({
    username: data.username,
    passwordHash: data.passwordHash,
    name: data.name ?? data.username,
    lastSignedIn: new Date(),
  });
  const result = await db
    .select()
    .from(users)
    .where(eq(users.username, data.username))
    .limit(1);
  return result[0];
}

export async function updateUserLastSignedIn(userId: number) {
  const db = await getDb();
  if (!db) return;
  await db
    .update(users)
    .set({ lastSignedIn: new Date() })
    .where(eq(users.id, userId));
}

// ─── CV Operations ────────────────────────────────────────────────────────────

export type TemplateId =
  | "modern"
  | "classic"
  | "minimal"
  | "executive"
  | "tech"
  | "creative"
  | "elegant"
  | "bold"
  | "corporate"
  | "academic"
  | "compact"
  | "timeline"
  | "infographic"
  | "newspaper"
  | "nordic"
  | "retro"
  | "stealth"
  | "gradient"
  | "brutalist"
  | "sidebar-light"
  | "two-page"
  | "portfolio"
  | "monochrome"
  | "atlas"
  | "swiss";

export async function createCV(
  userId: number,
  title: string,
  template: TemplateId = "modern"
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(cvs).values({ userId, title, template });
  // Return the actual created row instead of the raw OkPacket
  const result = await db
    .select()
    .from(cvs)
    .where(eq(cvs.userId, userId))
    .orderBy(sql`${cvs.id} DESC`)
    .limit(1);
  return result[0];
}

export async function getCVsByUserId(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const cvList = await db
    .select()
    .from(cvs)
    .where(eq(cvs.userId, userId))
    .orderBy(cvs.createdAt);

  if (cvList.length === 0) return [];

  // Fetch section counts for all CVs in parallel so the dashboard can show
  // a completion percentage without N+1 queries.
  const cvIds = cvList.map(cv => cv.id);

  const [piRows, weRows, eduRows, skillRows, projRows, certRows] =
    await Promise.all([
      db
        .select({ cvId: personalInfos.cvId })
        .from(personalInfos)
        .where(inArray(personalInfos.cvId, cvIds)),
      db
        .select({ cvId: workExperiences.cvId, count: sql<number>`COUNT(*)` })
        .from(workExperiences)
        .where(inArray(workExperiences.cvId, cvIds))
        .groupBy(workExperiences.cvId),
      db
        .select({ cvId: educations.cvId, count: sql<number>`COUNT(*)` })
        .from(educations)
        .where(inArray(educations.cvId, cvIds))
        .groupBy(educations.cvId),
      db
        .select({ cvId: skills.cvId, count: sql<number>`COUNT(*)` })
        .from(skills)
        .where(inArray(skills.cvId, cvIds))
        .groupBy(skills.cvId),
      db
        .select({ cvId: projects.cvId, count: sql<number>`COUNT(*)` })
        .from(projects)
        .where(inArray(projects.cvId, cvIds))
        .groupBy(projects.cvId),
      db
        .select({ cvId: certifications.cvId, count: sql<number>`COUNT(*)` })
        .from(certifications)
        .where(inArray(certifications.cvId, cvIds))
        .groupBy(certifications.cvId),
    ]);

  // Build lookup maps keyed by cvId
  const piSet = new Set(piRows.map(r => r.cvId));
  const weMap = new Map(weRows.map(r => [r.cvId, Number(r.count)]));
  const eduMap = new Map(eduRows.map(r => [r.cvId, Number(r.count)]));
  const skillMap = new Map(skillRows.map(r => [r.cvId, Number(r.count)]));
  const projMap = new Map(projRows.map(r => [r.cvId, Number(r.count)]));
  const certMap = new Map(certRows.map(r => [r.cvId, Number(r.count)]));

  return cvList.map(cv => ({
    ...cv,
    sectionCounts: {
      personalInfo: piSet.has(cv.id) ? 1 : 0,
      workExperiences: weMap.get(cv.id) ?? 0,
      educations: eduMap.get(cv.id) ?? 0,
      skills: skillMap.get(cv.id) ?? 0,
      projects: projMap.get(cv.id) ?? 0,
      certifications: certMap.get(cv.id) ?? 0,
    },
  }));
}

export async function getCVById(cvId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(cvs).where(eq(cvs.id, cvId)).limit(1);
  return result[0];
}

export async function updateCV(
  cvId: number,
  data: {
    title?: string;
    template?: TemplateId;
    isPublic?: number;
    shareSlug?: string | null;
    viewsCount?: number;
    accentColor?: string | null;
    fontFamily?: string | null;
    targetRole?: string | null;
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(cvs).set(data).where(eq(cvs.id, cvId));
}

export async function getCVByShareSlug(slug: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db
    .select()
    .from(cvs)
    .where(eq(cvs.shareSlug, slug))
    .limit(1);
  return result[0];
}

export async function incrementCVViews(cvId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db
    .update(cvs)
    .set({ viewsCount: sql`${cvs.viewsCount} + 1` })
    .where(eq(cvs.id, cvId));
}

export async function deleteCV(cvId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Run all deletes inside a transaction so a mid-flight crash
  // doesn't leave orphaned rows or a ghost CV entry.
  await db.transaction(async tx => {
    await tx.delete(languages).where(eq(languages.cvId, cvId));
    await tx.delete(customSections).where(eq(customSections.cvId, cvId));
    await tx.delete(certifications).where(eq(certifications.cvId, cvId));
    await tx.delete(projects).where(eq(projects.cvId, cvId));
    await tx.delete(skills).where(eq(skills.cvId, cvId));
    await tx.delete(educations).where(eq(educations.cvId, cvId));
    await tx.delete(workExperiences).where(eq(workExperiences.cvId, cvId));
    await tx.delete(personalInfos).where(eq(personalInfos.cvId, cvId));
    await tx.delete(cvs).where(eq(cvs.id, cvId));
  });
}

export type DuplicateCVInput = {
  sourceCvId: number;
  userId: number;
  newTitle: string;
  template: TemplateId;
  targetRole?: string;
};

/**
 * Duplicates a CV and all its sections inside a single MySQL transaction.
 * If anything fails, the entire operation rolls back — no partial data is left.
 */
export async function duplicateCV(input: DuplicateCVInput) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.transaction(async tx => {
    // 1. Create the new CV row
    await tx.insert(cvs).values({
      userId: input.userId,
      title: input.newTitle,
      template: input.template,
      targetRole: input.targetRole ?? null,
    });
    const [newCV] = await tx
      .select()
      .from(cvs)
      .where(eq(cvs.userId, input.userId))
      .orderBy(sql`${cvs.id} DESC`)
      .limit(1);

    if (!newCV) throw new Error("Failed to create duplicate CV row");

    // 2. Fetch all source data inside the transaction for consistency
    const [srcPersonal] = await tx
      .select()
      .from(personalInfos)
      .where(eq(personalInfos.cvId, input.sourceCvId))
      .limit(1);

    const srcWorkExps = await tx
      .select()
      .from(workExperiences)
      .where(eq(workExperiences.cvId, input.sourceCvId))
      .orderBy(workExperiences.position);

    const srcEdus = await tx
      .select()
      .from(educations)
      .where(eq(educations.cvId, input.sourceCvId))
      .orderBy(educations.position);

    const srcSkills = await tx
      .select()
      .from(skills)
      .where(eq(skills.cvId, input.sourceCvId))
      .orderBy(skills.position);

    const srcProjects = await tx
      .select()
      .from(projects)
      .where(eq(projects.cvId, input.sourceCvId))
      .orderBy(projects.position);

    const srcCerts = await tx
      .select()
      .from(certifications)
      .where(eq(certifications.cvId, input.sourceCvId))
      .orderBy(certifications.position);

    const srcLangs = await tx
      .select()
      .from(languages)
      .where(eq(languages.cvId, input.sourceCvId))
      .orderBy(languages.position);

    const srcCustoms = await tx
      .select()
      .from(customSections)
      .where(eq(customSections.cvId, input.sourceCvId))
      .orderBy(customSections.position);

    // 3. Copy personal info (atomic upsert)
    await tx
      .insert(personalInfos)
      .values({
        cvId: newCV.id,
        fullName: srcPersonal?.fullName ?? null,
        email: srcPersonal?.email ?? null,
        phone: srcPersonal?.phone ?? null,
        location: srcPersonal?.location ?? null,
        professionalSummary: srcPersonal?.professionalSummary ?? null,
      })
      .onDuplicateKeyUpdate({ set: { cvId: newCV.id } });

    // 4. Copy sub-sections preserving order
    for (const exp of srcWorkExps) {
      await tx.insert(workExperiences).values({
        cvId: newCV.id,
        position: exp.position,
        jobTitle: exp.jobTitle,
        company: exp.company,
        location: exp.location,
        startDate: exp.startDate,
        endDate: exp.endDate,
        description: exp.description,
      });
    }

    for (const edu of srcEdus) {
      await tx.insert(educations).values({
        cvId: newCV.id,
        position: edu.position,
        degree: edu.degree,
        field: edu.field,
        school: edu.school,
        location: edu.location,
        graduationDate: edu.graduationDate,
        description: edu.description,
      });
    }

    for (const skill of srcSkills) {
      await tx.insert(skills).values({
        cvId: newCV.id,
        position: skill.position,
        category: skill.category,
        skillName: skill.skillName,
        proficiency: skill.proficiency,
      });
    }

    for (const proj of srcProjects) {
      await tx.insert(projects).values({
        cvId: newCV.id,
        position: proj.position,
        projectName: proj.projectName,
        description: proj.description,
        technologies: proj.technologies,
        link: proj.link,
        startDate: proj.startDate,
        endDate: proj.endDate,
      });
    }

    for (const cert of srcCerts) {
      await tx.insert(certifications).values({
        cvId: newCV.id,
        position: cert.position,
        certificationName: cert.certificationName,
        issuer: cert.issuer,
        issueDate: cert.issueDate,
        expiryDate: cert.expiryDate,
        link: cert.link,
      });
    }

    for (const lang of srcLangs) {
      await tx.insert(languages).values({
        cvId: newCV.id,
        position: lang.position,
        language: lang.language,
        proficiency: lang.proficiency,
      });
    }

    for (const item of srcCustoms) {
      await tx.insert(customSections).values({
        cvId: newCV.id,
        position: item.position,
        category: item.category,
        title: item.title,
        subtitle: item.subtitle,
        date: item.date,
        description: item.description,
      });
    }

    return newCV;
  });
}

export async function getOrCreatePersonalInfo(cvId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Use INSERT ... ON DUPLICATE KEY UPDATE for atomic upsert
  await db
    .insert(personalInfos)
    .values({ cvId })
    .onDuplicateKeyUpdate({ set: { cvId } });
  const result = await db
    .select()
    .from(personalInfos)
    .where(eq(personalInfos.cvId, cvId))
    .limit(1);
  return result[0];
}

export async function updatePersonalInfo(
  cvId: number,
  data: Partial<InsertPersonalInfo>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(personalInfos).set(data).where(eq(personalInfos.cvId, cvId));
  const updated = await db
    .select()
    .from(personalInfos)
    .where(eq(personalInfos.cvId, cvId))
    .limit(1);
  return updated[0];
}

// ─── Work Experience ──────────────────────────────────────────────────────────

export async function getWorkExperiences(cvId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db
    .select()
    .from(workExperiences)
    .where(eq(workExperiences.cvId, cvId))
    .orderBy(workExperiences.position);
}

export async function createWorkExperience(
  cvId: number,
  data: Omit<InsertWorkExperience, "cvId" | "position">
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const maxPosition = await db
    .select({ max: sql<number>`MAX(position)` })
    .from(workExperiences)
    .where(eq(workExperiences.cvId, cvId));
  const position = (maxPosition[0]?.max ?? -1) + 1;
  await db.insert(workExperiences).values({ ...data, cvId, position });
  const rows = await db
    .select()
    .from(workExperiences)
    .where(eq(workExperiences.cvId, cvId))
    .orderBy(workExperiences.position);
  return rows[rows.length - 1];
}

export async function getWorkExperienceById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db
    .select()
    .from(workExperiences)
    .where(eq(workExperiences.id, id))
    .limit(1);
  return result[0];
}

export async function updateWorkExperience(
  id: number,
  data: Partial<InsertWorkExperience>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(workExperiences).set(data).where(eq(workExperiences.id, id));
}

export async function deleteWorkExperience(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(workExperiences).where(eq(workExperiences.id, id));
}

export async function reorderWorkExperiences(cvId: number, ids: number[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Bulk update using a single CASE expression
  if (ids.length === 0) return;
  const caseExpr = sql.join(
    ids.map((id, i) => sql`WHEN ${id} THEN ${i}`),
    sql` `
  );
  await db
    .update(workExperiences)
    .set({ position: sql`CASE ${workExperiences.id} ${caseExpr} END` })
    .where(eq(workExperiences.cvId, cvId));
}

// ─── Education ────────────────────────────────────────────────────────────────

export async function getEducations(cvId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db
    .select()
    .from(educations)
    .where(eq(educations.cvId, cvId))
    .orderBy(educations.position);
}

export async function createEducation(
  cvId: number,
  data: Omit<InsertEducation, "cvId" | "position">
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const maxPosition = await db
    .select({ max: sql<number>`MAX(position)` })
    .from(educations)
    .where(eq(educations.cvId, cvId));
  const position = (maxPosition[0]?.max ?? -1) + 1;
  await db.insert(educations).values({ ...data, cvId, position });
  const rows = await db
    .select()
    .from(educations)
    .where(eq(educations.cvId, cvId))
    .orderBy(educations.position);
  return rows[rows.length - 1];
}

export async function getEducationById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db
    .select()
    .from(educations)
    .where(eq(educations.id, id))
    .limit(1);
  return result[0];
}

export async function updateEducation(
  id: number,
  data: Partial<InsertEducation>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(educations).set(data).where(eq(educations.id, id));
}

export async function deleteEducation(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(educations).where(eq(educations.id, id));
}

export async function reorderEducations(cvId: number, ids: number[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  if (ids.length === 0) return;
  const caseExpr = sql.join(
    ids.map((id, i) => sql`WHEN ${id} THEN ${i}`),
    sql` `
  );
  await db
    .update(educations)
    .set({ position: sql`CASE ${educations.id} ${caseExpr} END` })
    .where(eq(educations.cvId, cvId));
}

// ─── Skills ───────────────────────────────────────────────────────────────────

export async function getSkills(cvId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db
    .select()
    .from(skills)
    .where(eq(skills.cvId, cvId))
    .orderBy(skills.position);
}

export async function createSkill(
  cvId: number,
  data: Omit<InsertSkill, "cvId" | "position">
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const maxPosition = await db
    .select({ max: sql<number>`MAX(position)` })
    .from(skills)
    .where(eq(skills.cvId, cvId));
  const position = (maxPosition[0]?.max ?? -1) + 1;
  await db.insert(skills).values({ ...data, cvId, position });
  const rows = await db
    .select()
    .from(skills)
    .where(eq(skills.cvId, cvId))
    .orderBy(skills.position);
  return rows[rows.length - 1];
}

export async function getSkillById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db
    .select()
    .from(skills)
    .where(eq(skills.id, id))
    .limit(1);
  return result[0];
}

export async function updateSkill(id: number, data: Partial<InsertSkill>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(skills).set(data).where(eq(skills.id, id));
}

export async function deleteSkill(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(skills).where(eq(skills.id, id));
}

export async function reorderSkills(cvId: number, ids: number[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  if (ids.length === 0) return;
  const caseExpr = sql.join(
    ids.map((id, i) => sql`WHEN ${id} THEN ${i}`),
    sql` `
  );
  await db
    .update(skills)
    .set({ position: sql`CASE ${skills.id} ${caseExpr} END` })
    .where(eq(skills.cvId, cvId));
}

// ─── Projects ─────────────────────────────────────────────────────────────────

export async function getProjects(cvId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db
    .select()
    .from(projects)
    .where(eq(projects.cvId, cvId))
    .orderBy(projects.position);
}

export async function createProject(
  cvId: number,
  data: Omit<InsertProject, "cvId" | "position">
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const maxPosition = await db
    .select({ max: sql<number>`MAX(position)` })
    .from(projects)
    .where(eq(projects.cvId, cvId));
  const position = (maxPosition[0]?.max ?? -1) + 1;
  await db.insert(projects).values({ ...data, cvId, position });
  const rows = await db
    .select()
    .from(projects)
    .where(eq(projects.cvId, cvId))
    .orderBy(projects.position);
  return rows[rows.length - 1];
}

export async function getProjectById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db
    .select()
    .from(projects)
    .where(eq(projects.id, id))
    .limit(1);
  return result[0];
}

export async function updateProject(id: number, data: Partial<InsertProject>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(projects).set(data).where(eq(projects.id, id));
}

export async function deleteProject(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(projects).where(eq(projects.id, id));
}

export async function reorderProjects(cvId: number, ids: number[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  if (ids.length === 0) return;
  const caseExpr = sql.join(
    ids.map((id, i) => sql`WHEN ${id} THEN ${i}`),
    sql` `
  );
  await db
    .update(projects)
    .set({ position: sql`CASE ${projects.id} ${caseExpr} END` })
    .where(eq(projects.cvId, cvId));
}

// ─── Certifications ───────────────────────────────────────────────────────────

export async function getCertifications(cvId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db
    .select()
    .from(certifications)
    .where(eq(certifications.cvId, cvId))
    .orderBy(certifications.position);
}

export async function createCertification(
  cvId: number,
  data: Omit<InsertCertification, "cvId" | "position">
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const maxPosition = await db
    .select({ max: sql<number>`MAX(position)` })
    .from(certifications)
    .where(eq(certifications.cvId, cvId));
  const position = (maxPosition[0]?.max ?? -1) + 1;
  await db.insert(certifications).values({ ...data, cvId, position });
  const rows = await db
    .select()
    .from(certifications)
    .where(eq(certifications.cvId, cvId))
    .orderBy(certifications.position);
  return rows[rows.length - 1];
}

export async function getCertificationById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db
    .select()
    .from(certifications)
    .where(eq(certifications.id, id))
    .limit(1);
  return result[0];
}

export async function updateCertification(
  id: number,
  data: Partial<InsertCertification>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(certifications).set(data).where(eq(certifications.id, id));
}

export async function deleteCertification(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(certifications).where(eq(certifications.id, id));
}

export async function reorderCertifications(cvId: number, ids: number[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  if (ids.length === 0) return;
  const caseExpr = sql.join(
    ids.map((id, i) => sql`WHEN ${id} THEN ${i}`),
    sql` `
  );
  await db
    .update(certifications)
    .set({ position: sql`CASE ${certifications.id} ${caseExpr} END` })
    .where(eq(certifications.cvId, cvId));
}

// ─── Languages ────────────────────────────────────────────────────────────────

export async function getLanguages(cvId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db
    .select()
    .from(languages)
    .where(eq(languages.cvId, cvId))
    .orderBy(languages.position);
}

export async function createLanguage(
  cvId: number,
  data: Omit<InsertLanguage, "cvId" | "position">
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const maxPosition = await db
    .select({ max: sql<number>`MAX(position)` })
    .from(languages)
    .where(eq(languages.cvId, cvId));
  const position = (maxPosition[0]?.max ?? -1) + 1;
  await db.insert(languages).values({ ...data, cvId, position });
  const rows = await db
    .select()
    .from(languages)
    .where(eq(languages.cvId, cvId))
    .orderBy(languages.position);
  return rows[rows.length - 1];
}

export async function updateLanguage(
  id: number,
  data: Partial<InsertLanguage>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(languages).set(data).where(eq(languages.id, id));
}

export async function deleteLanguage(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(languages).where(eq(languages.id, id));
}

export async function reorderLanguages(cvId: number, ids: number[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  if (ids.length === 0) return;
  const caseExpr = sql.join(
    ids.map((id, i) => sql`WHEN ${id} THEN ${i}`),
    sql` `
  );
  await db
    .update(languages)
    .set({ position: sql`CASE ${languages.id} ${caseExpr} END` })
    .where(eq(languages.cvId, cvId));
}

// ─── Custom Sections (Awards, Volunteer, Publications, etc.) ─────────────────

export async function getCustomSections(cvId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db
    .select()
    .from(customSections)
    .where(eq(customSections.cvId, cvId))
    .orderBy(customSections.position);
}

export async function createCustomSection(
  cvId: number,
  data: Omit<InsertCustomSection, "cvId" | "position">
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const maxPosition = await db
    .select({ max: sql<number>`MAX(position)` })
    .from(customSections)
    .where(eq(customSections.cvId, cvId));
  const position = (maxPosition[0]?.max ?? -1) + 1;
  await db.insert(customSections).values({ ...data, cvId, position });
  const rows = await db
    .select()
    .from(customSections)
    .where(eq(customSections.cvId, cvId))
    .orderBy(customSections.position);
  return rows[rows.length - 1];
}

export async function updateCustomSection(
  id: number,
  data: Partial<InsertCustomSection>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(customSections).set(data).where(eq(customSections.id, id));
}

export async function deleteCustomSection(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(customSections).where(eq(customSections.id, id));
}

export async function reorderCustomSections(cvId: number, ids: number[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  if (ids.length === 0) return;
  const caseExpr = sql.join(
    ids.map((id, i) => sql`WHEN ${id} THEN ${i}`),
    sql` `
  );
  await db
    .update(customSections)
    .set({ position: sql`CASE ${customSections.id} ${caseExpr} END` })
    .where(eq(customSections.cvId, cvId));
}

// ─── Bulk Create CV from AI Parsed Data ──────────────────────────────────────

export interface ParsedResumePayload {
  personalInfo?: {
    fullName?: string;
    email?: string;
    phone?: string;
    location?: string;
    professionalSummary?: string;
  };
  workExperiences?: Array<{
    jobTitle: string;
    company: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    description?: string;
  }>;
  educations?: Array<{
    degree: string;
    field: string;
    school: string;
    location?: string;
    graduationDate?: string;
    description?: string;
  }>;
  skills?: Array<{
    category: string;
    skillName: string;
    proficiency?: "beginner" | "intermediate" | "advanced" | "expert";
  }>;
  projects?: Array<{
    projectName: string;
    description?: string;
    technologies?: string;
    link?: string;
    startDate?: string;
    endDate?: string;
  }>;
  certifications?: Array<{
    certificationName: string;
    issuer: string;
    issueDate?: string;
    expiryDate?: string;
    link?: string;
  }>;
  languages?: Array<{
    language: string;
    proficiency?: string;
  }>;
  customSections?: Array<{
    category: string;
    title: string;
    subtitle?: string;
    date?: string;
    description?: string;
  }>;
}

export async function bulkCreateCVFromParsedData(
  userId: number,
  title: string,
  template: TemplateId,
  data: ParsedResumePayload
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.transaction(async tx => {
    // 1. Insert CV
    await tx.insert(cvs).values({
      userId,
      title,
      template,
    });
    const [newCV] = await tx
      .select()
      .from(cvs)
      .where(eq(cvs.userId, userId))
      .orderBy(sql`${cvs.id} DESC`)
      .limit(1);

    if (!newCV) throw new Error("Failed to create CV from parsed data");

    // 2. Personal info
    if (data.personalInfo) {
      await tx.insert(personalInfos).values({
        cvId: newCV.id,
        fullName: data.personalInfo.fullName ?? null,
        email: data.personalInfo.email ?? null,
        phone: data.personalInfo.phone ?? null,
        location: data.personalInfo.location ?? null,
        professionalSummary: data.personalInfo.professionalSummary ?? null,
      });
    }

    // 3. Work experiences
    if (data.workExperiences && data.workExperiences.length > 0) {
      for (let i = 0; i < data.workExperiences.length; i++) {
        const exp = data.workExperiences[i];
        await tx.insert(workExperiences).values({
          cvId: newCV.id,
          position: i,
          jobTitle: exp.jobTitle,
          company: exp.company,
          location: exp.location ?? null,
          startDate: exp.startDate ?? null,
          endDate: exp.endDate ?? null,
          description: exp.description ?? null,
        });
      }
    }

    // 4. Educations
    if (data.educations && data.educations.length > 0) {
      for (let i = 0; i < data.educations.length; i++) {
        const edu = data.educations[i];
        await tx.insert(educations).values({
          cvId: newCV.id,
          position: i,
          degree: edu.degree,
          field: edu.field,
          school: edu.school,
          location: edu.location ?? null,
          graduationDate: edu.graduationDate ?? null,
          description: edu.description ?? null,
        });
      }
    }

    // 5. Skills
    if (data.skills && data.skills.length > 0) {
      for (let i = 0; i < data.skills.length; i++) {
        const s = data.skills[i];
        await tx.insert(skills).values({
          cvId: newCV.id,
          position: i,
          category: s.category || "General",
          skillName: s.skillName,
          proficiency: s.proficiency ?? null,
        });
      }
    }

    // 6. Projects
    if (data.projects && data.projects.length > 0) {
      for (let i = 0; i < data.projects.length; i++) {
        const p = data.projects[i];
        await tx.insert(projects).values({
          cvId: newCV.id,
          position: i,
          projectName: p.projectName,
          description: p.description ?? null,
          technologies: p.technologies ?? null,
          link: p.link ?? null,
          startDate: p.startDate ?? null,
          endDate: p.endDate ?? null,
        });
      }
    }

    // 7. Certifications
    if (data.certifications && data.certifications.length > 0) {
      for (let i = 0; i < data.certifications.length; i++) {
        const c = data.certifications[i];
        await tx.insert(certifications).values({
          cvId: newCV.id,
          position: i,
          certificationName: c.certificationName,
          issuer: c.issuer,
          issueDate: c.issueDate ?? null,
          expiryDate: c.expiryDate ?? null,
          link: c.link ?? null,
        });
      }
    }

    // 8. Languages
    if (data.languages && data.languages.length > 0) {
      for (let i = 0; i < data.languages.length; i++) {
        const l = data.languages[i];
        await tx.insert(languages).values({
          cvId: newCV.id,
          position: i,
          language: l.language,
          proficiency: l.proficiency ?? "Professional Working",
        });
      }
    }

    // 9. Custom Sections
    if (data.customSections && data.customSections.length > 0) {
      for (let i = 0; i < data.customSections.length; i++) {
        const cs = data.customSections[i];
        await tx.insert(customSections).values({
          cvId: newCV.id,
          position: i,
          category: cs.category || "Other",
          title: cs.title,
          subtitle: cs.subtitle ?? null,
          date: cs.date ?? null,
          description: cs.description ?? null,
        });
      }
    }

    return newCV;
  });
}
