import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  BorderStyle,
} from "docx";
import { saveAs } from "file-saver";
import type { CoverLetterData } from "./types";

/**
 * Generates and downloads a clean, professional, formal Microsoft Word (.docx) document
 * for a Cover Letter / Surat Lamaran Kerja.
 */
export async function exportCoverLetterToDOCX(
  data: CoverLetterData,
  fileName: string = "Surat_Lamaran_Kerja.docx"
): Promise<void> {
  const docChildren: Paragraph[] = [];

  // 1. Applicant Header (Sender Info)
  docChildren.push(
    new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing: { after: 40 },
      children: [
        new TextRun({
          text: (data.fullName || "Nama Lengkap").toUpperCase(),
          bold: true,
          size: 26, // 13pt
          font: "Times New Roman",
          color: "111827",
        }),
      ],
    })
  );

  if (data.targetRole) {
    docChildren.push(
      new Paragraph({
        alignment: AlignmentType.LEFT,
        spacing: { after: 60 },
        children: [
          new TextRun({
            text: data.targetRole,
            size: 20, // 10pt
            font: "Times New Roman",
            color: "4B5563",
          }),
        ],
      })
    );
  }

  // Contact line
  const contactParts = [data.email, data.phone, data.location].filter(Boolean);
  if (contactParts.length > 0) {
    docChildren.push(
      new Paragraph({
        alignment: AlignmentType.LEFT,
        spacing: { after: 160 },
        border: {
          bottom: {
            color: "9CA3AF",
            space: 4,
            style: BorderStyle.SINGLE,
            size: 6,
          },
        },
        children: [
          new TextRun({
            text: contactParts.join("  |  "),
            size: 19,
            font: "Times New Roman",
            color: "4B5563",
          }),
        ],
      })
    );
  }

  // 2. Date and Location
  const letterDate = `${data.city || "Jakarta"}, ${data.date || new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}`;
  docChildren.push(
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      spacing: { before: 100, after: 140 },
      children: [
        new TextRun({
          text: letterDate,
          font: "Times New Roman",
          size: 22,
        }),
      ],
    })
  );

  // 3. Recipient Info
  docChildren.push(
    new Paragraph({
      spacing: { after: 40 },
      children: [
        new TextRun({
          text: "Hal: ",
          bold: true,
          font: "Times New Roman",
          size: 22,
        }),
        new TextRun({
          text: data.subject || `Lamaran Pekerjaan – ${data.jobTitle || "Posisi"}`,
          font: "Times New Roman",
          size: 22,
        }),
      ],
    })
  );

  docChildren.push(
    new Paragraph({
      spacing: { before: 80, after: 20 },
      children: [
        new TextRun({
          text: "Yth. ",
          font: "Times New Roman",
          size: 22,
        }),
        new TextRun({
          text: data.recipientName || "Bapak/Ibu HRD / Pimpinan",
          bold: true,
          font: "Times New Roman",
          size: 22,
        }),
      ],
    })
  );

  if (data.recipientTitle) {
    docChildren.push(
      new Paragraph({
        spacing: { after: 20 },
        children: [
          new TextRun({
            text: data.recipientTitle,
            font: "Times New Roman",
            size: 22,
          }),
        ],
      })
    );
  }

  if (data.companyName) {
    docChildren.push(
      new Paragraph({
        spacing: { after: 20 },
        children: [
          new TextRun({
            text: data.companyName,
            bold: true,
            font: "Times New Roman",
            size: 22,
          }),
        ],
      })
    );
  }

  if (data.companyAddress) {
    docChildren.push(
      new Paragraph({
        spacing: { after: 160 },
        children: [
          new TextRun({
            text: data.companyAddress,
            font: "Times New Roman",
            size: 22,
          }),
        ],
      })
    );
  }

  // 4. Salutation
  docChildren.push(
    new Paragraph({
      spacing: { before: 80, after: 100 },
      children: [
        new TextRun({
          text: data.salutation || "Dengan hormat,",
          font: "Times New Roman",
          size: 22,
        }),
      ],
    })
  );

  // 5. Opening
  if (data.opening) {
    docChildren.push(
      new Paragraph({
        spacing: { after: 120 },
        children: [
          new TextRun({
            text: data.opening,
            font: "Times New Roman",
            size: 22,
          }),
        ],
      })
    );
  }

  // 6. Body Paragraph
  if (data.body) {
    const bodyParas = data.body.split("\n\n").filter(Boolean);
    bodyParas.forEach(p => {
      docChildren.push(
        new Paragraph({
          spacing: { after: 120 },
          children: [
            new TextRun({
              text: p.trim(),
              font: "Times New Roman",
              size: 22,
            }),
          ],
        })
      );
    });
  }

  // 7. Skills / Highlights (if any)
  if (data.skillsHighlight && data.skillsHighlight.length > 0) {
    data.skillsHighlight.forEach(sh => {
      docChildren.push(
        new Paragraph({
          bullet: { level: 0 },
          spacing: { after: 40 },
          children: [
            new TextRun({
              text: sh,
              font: "Times New Roman",
              size: 22,
            }),
          ],
        })
      );
    });
  }

  // 8. Attachments
  if (data.attachments && data.attachments.length > 0) {
    docChildren.push(
      new Paragraph({
        spacing: { before: 100, after: 40 },
        children: [
          new TextRun({
            text: "Sebagai bahan pertimbangan, bersama ini saya lampirkan:",
            font: "Times New Roman",
            size: 22,
          }),
        ],
      })
    );
    data.attachments.forEach(att => {
      docChildren.push(
        new Paragraph({
          bullet: { level: 0 },
          spacing: { after: 30 },
          children: [
            new TextRun({
              text: att,
              font: "Times New Roman",
              size: 22,
            }),
          ],
        })
      );
    });
  }

  // 9. Closing Paragraph
  if (data.closing) {
    docChildren.push(
      new Paragraph({
        spacing: { before: 120, after: 180 },
        children: [
          new TextRun({
            text: data.closing,
            font: "Times New Roman",
            size: 22,
          }),
        ],
      })
    );
  }

  // 10. Sign-off & Candidate Name
  docChildren.push(
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      spacing: { after: 20 },
      children: [
        new TextRun({
          text: data.signOff || "Hormat saya,",
          font: "Times New Roman",
          size: 22,
        }),
      ],
    })
  );

  // Signature space (4 blank lines)
  docChildren.push(
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      spacing: { after: 400 },
      children: [
        new TextRun({
          text: "",
          size: 22,
        }),
      ],
    })
  );

  docChildren.push(
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      spacing: { after: 40 },
      children: [
        new TextRun({
          text: data.fullName || "Nama Lengkap",
          bold: true,
          underline: {},
          font: "Times New Roman",
          size: 22,
        }),
      ],
    })
  );

  // Document Assembly
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440, // 1 inch
              right: 1440,
              bottom: 1440,
              left: 1440,
            },
          },
        },
        children: docChildren,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const outName = fileName.endsWith(".docx") ? fileName : `${fileName}.docx`;
  saveAs(blob, outName);
}
