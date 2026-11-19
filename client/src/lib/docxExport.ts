import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
} from "docx";
import { saveAs } from "file-saver";
import type { FullCVData } from "@/types/cv";

/**
 * Generates and downloads a clean, highly formatted, ATS-compliant Microsoft Word (.docx) document
 * from the candidate's FullCVData.
 */
export async function exportCVToDOCX(cvData: FullCVData, fileName: string = "CV.docx"): Promise<void> {
  const pInfo = cvData.personalInfo;
  const fullName = pInfo?.fullName || "Nama Lengkap";
  const targetRole = cvData.cv?.targetRole || "";
  const email = pInfo?.email || "";
  const phone = pInfo?.phone || "";
  const location = pInfo?.location || "";
  const summary = pInfo?.professionalSummary || "";

  // Contact line
  const contactParts: string[] = [];
  if (email) contactParts.push(email);
  if (phone) contactParts.push(phone);
  if (location) contactParts.push(location);
  if (cvData.cv?.portfolioUrl) contactParts.push(cvData.cv.portfolioUrl);

  const docChildren: Paragraph[] = [
    // Header Name
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
      children: [
        new TextRun({
          text: fullName.toUpperCase(),
          bold: true,
          size: 32, // 16pt
          font: "Calibri",
          color: "1E293B",
        }),
      ],
    }),
  ];

  // Target Role / Subtitle
  if (targetRole) {
    docChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
        children: [
          new TextRun({
            text: targetRole.toUpperCase(),
            bold: true,
            size: 22, // 11pt
            font: "Calibri",
            color: "475569",
          }),
        ],
      })
    );
  }

  // Contact info
  if (contactParts.length > 0) {
    docChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        border: {
          bottom: {
            color: "CBD5E1",
            space: 4,
            style: BorderStyle.SINGLE,
            size: 6,
          },
        },
        children: [
          new TextRun({
            text: contactParts.join("   |   "),
            size: 19, // 9.5pt
            font: "Calibri",
            color: "64748B",
          }),
        ],
      })
    );
  }

  // Helper for Section Heading
  const addSectionHeading = (title: string) => {
    docChildren.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 240, after: 100 },
        border: {
          bottom: {
            color: "94A3B8",
            space: 2,
            style: BorderStyle.SINGLE,
            size: 6,
          },
        },
        children: [
          new TextRun({
            text: title.toUpperCase(),
            bold: true,
            size: 23, // 11.5pt
            font: "Calibri",
            color: "0F172A",
          }),
        ],
      })
    );
  };

  // 1. Professional Summary
  if (summary) {
    addSectionHeading("Ringkasan Profesional");
    docChildren.push(
      new Paragraph({
        spacing: { after: 160 },
        children: [
          new TextRun({
            text: summary,
            size: 21,
            font: "Calibri",
            color: "334155",
          }),
        ],
      })
    );
  }

  // 2. Work Experiences
  if (cvData.workExperiences && cvData.workExperiences.length > 0) {
    addSectionHeading("Pengalaman Kerja");
    cvData.workExperiences.forEach(exp => {
      const dates = [exp.startDate, exp.endDate || "Present"].filter(Boolean).join(" – ");
      docChildren.push(
        new Paragraph({
          spacing: { before: 120, after: 40 },
          children: [
            new TextRun({
              text: exp.jobTitle,
              bold: true,
              size: 22,
              font: "Calibri",
              color: "0F172A",
            }),
            new TextRun({
              text: `  |  ${exp.company}${exp.location ? ` - ${exp.location}` : ""}`,
              font: "Calibri",
              size: 21,
              color: "475569",
            }),
            new TextRun({
              text: dates ? `  (${dates})` : "",
              italics: true,
              size: 20,
              font: "Calibri",
              color: "64748B",
            }),
          ],
        })
      );

      if (exp.description) {
        const lines = exp.description.split("\n").filter(l => l.trim().length > 0);
        lines.forEach(line => {
          const bulletText = line.replace(/^[•\-\*]\s*/, "");
          docChildren.push(
            new Paragraph({
              bullet: { level: 0 },
              spacing: { after: 40 },
              children: [
                new TextRun({
                  text: bulletText,
                  size: 21,
                  font: "Calibri",
                  color: "334155",
                }),
              ],
            })
          );
        });
      }
    });
  }

  // 3. Education
  if (cvData.educations && cvData.educations.length > 0) {
    addSectionHeading("Pendidikan");
    cvData.educations.forEach(edu => {
      docChildren.push(
        new Paragraph({
          spacing: { before: 120, after: 40 },
          children: [
            new TextRun({
              text: edu.degree,
              bold: true,
              size: 22,
              font: "Calibri",
              color: "0F172A",
            }),
            new TextRun({
              text: ` - ${edu.field}`,
              bold: true,
              size: 22,
              font: "Calibri",
              color: "334155",
            }),
            new TextRun({
              text: `  |  ${edu.school}${edu.location ? ` (${edu.location})` : ""}`,
              font: "Calibri",
              size: 21,
              color: "475569",
            }),
            new TextRun({
              text: edu.graduationDate ? `  [Lulus: ${edu.graduationDate}]` : "",
              italics: true,
              size: 20,
              font: "Calibri",
              color: "64748B",
            }),
          ],
        })
      );

      if (edu.description) {
        docChildren.push(
          new Paragraph({
            spacing: { after: 60 },
            indent: { left: 360 },
            children: [
              new TextRun({
                text: edu.description,
                size: 20,
                font: "Calibri",
                color: "475569",
              }),
            ],
          })
        );
      }
    });
  }

  // 4. Skills
  if (cvData.skills && cvData.skills.length > 0) {
    addSectionHeading("Keahlian & Kompetensi");

    // Group skills by category
    const grouped: Record<string, string[]> = {};
    cvData.skills.forEach(s => {
      const cat = s.category || "General Skills";
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(s.skillName);
    });

    Object.entries(grouped).forEach(([cat, skillNames]) => {
      docChildren.push(
        new Paragraph({
          spacing: { after: 60 },
          children: [
            new TextRun({
              text: `• ${cat}: `,
              bold: true,
              size: 21,
              font: "Calibri",
              color: "1E293B",
            }),
            new TextRun({
              text: skillNames.join(", "),
              size: 21,
              font: "Calibri",
              color: "334155",
            }),
          ],
        })
      );
    });
  }

  // 5. Projects
  if (cvData.projects && cvData.projects.length > 0) {
    addSectionHeading("Proyek Unggulan & Portofolio");
    cvData.projects.forEach(proj => {
      docChildren.push(
        new Paragraph({
          spacing: { before: 100, after: 30 },
          children: [
            new TextRun({
              text: proj.projectName,
              bold: true,
              size: 22,
              font: "Calibri",
              color: "0F172A",
            }),
            new TextRun({
              text: proj.link ? `  (${proj.link})` : "",
              italics: true,
              size: 19,
              font: "Calibri",
              color: "2563EB",
            }),
          ],
        })
      );

      if (proj.description) {
        docChildren.push(
          new Paragraph({
            spacing: { after: 30 },
            children: [
              new TextRun({
                text: proj.description,
                size: 21,
                font: "Calibri",
                color: "334155",
              }),
            ],
          })
        );
      }

      if (proj.technologies) {
        docChildren.push(
          new Paragraph({
            spacing: { after: 60 },
            children: [
              new TextRun({
                text: `Teknologi / Tools: ${proj.technologies}`,
                italics: true,
                size: 19,
                font: "Calibri",
                color: "64748B",
              }),
            ],
          })
        );
      }
    });
  }

  // 6. Certifications
  if (cvData.certifications && cvData.certifications.length > 0) {
    addSectionHeading("Sertifikasi & Lisensi");
    cvData.certifications.forEach(cert => {
      docChildren.push(
        new Paragraph({
          bullet: { level: 0 },
          spacing: { after: 40 },
          children: [
            new TextRun({
              text: cert.certificationName,
              bold: true,
              size: 21,
              font: "Calibri",
              color: "0F172A",
            }),
            new TextRun({
              text: `  –  ${cert.issuer}${cert.issueDate ? ` (${cert.issueDate})` : ""}`,
              size: 20,
              font: "Calibri",
              color: "475569",
            }),
          ],
        })
      );
    });
  }

  // 7. Languages
  if (cvData.languages && cvData.languages.length > 0) {
    addSectionHeading("Kemampuan Bahasa");
    const langList = cvData.languages
      .map(l => `${l.language} (${l.proficiency})`)
      .join("   |   ");
    docChildren.push(
      new Paragraph({
        spacing: { after: 60 },
        children: [
          new TextRun({
            text: langList,
            size: 21,
            font: "Calibri",
            color: "334155",
          }),
        ],
      })
    );
  }

  // 8. Custom Sections
  if (cvData.customSections && cvData.customSections.length > 0) {
    addSectionHeading("Prestasi & Informasi Tambahan");
    cvData.customSections.forEach(cs => {
      docChildren.push(
        new Paragraph({
          spacing: { before: 80, after: 20 },
          children: [
            new TextRun({
              text: cs.title,
              bold: true,
              size: 21,
              font: "Calibri",
              color: "0F172A",
            }),
            new TextRun({
              text: cs.subtitle ? `  –  ${cs.subtitle}` : "",
              size: 20,
              font: "Calibri",
              color: "475569",
            }),
            new TextRun({
              text: cs.date ? `  (${cs.date})` : "",
              italics: true,
              size: 19,
              font: "Calibri",
              color: "64748B",
            }),
          ],
        })
      );

      if (cs.description) {
        docChildren.push(
          new Paragraph({
            spacing: { after: 40 },
            children: [
              new TextRun({
                text: cs.description,
                size: 20,
                font: "Calibri",
                color: "334155",
              }),
            ],
          })
        );
      }
    });
  }

  // Construct Document
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1000,
              right: 1000,
              bottom: 1000,
              left: 1000,
            },
          },
        },
        children: docChildren,
      },
    ],
  });

  // Export & Trigger Download
  const blob = await Packer.toBlob(doc);
  const outName = fileName.endsWith(".docx") ? fileName : `${fileName}.docx`;
  saveAs(blob, outName);
}
