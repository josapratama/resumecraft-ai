/**
 * Export Cover Letter to PDF
 * Captures the exact rendered HTML and stylesheets, formats for standard A4 paper,
 * and triggers window.print() for saving as PDF or printing.
 */
export async function exportCoverLetterToPDF(
  elementId: string,
  fileName: string = "surat_lamaran.pdf"
): Promise<void> {
  const container = document.getElementById(elementId);
  if (!container) {
    throw new Error(`Element #${elementId} not found`);
  }

  const paperElement = container.querySelector<HTMLElement>(".cover-letter-paper") ?? container;

  // Collect page stylesheets (Tailwind, Fonts, etc.)
  const styleLinks = Array.from(document.querySelectorAll<HTMLLinkElement>("link[rel='stylesheet']"))
    .map(link => `<link rel="stylesheet" href="${link.href}">`)
    .join("\n");

  const inlineStyles = Array.from(document.querySelectorAll("style"))
    .map(s => `<style>${s.textContent}</style>`)
    .join("\n");

  const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${fileName.replace(/\.pdf$/i, "")}</title>
  ${styleLinks}
  ${inlineStyles}
  <style>
    @page {
      size: A4 portrait;
      margin: 12mm 15mm 12mm 15mm;
    }
    html, body {
      margin: 0;
      padding: 0;
      background: white;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }
    * {
      max-height: none !important;
    }
    .cover-letter-paper {
      width: 100% !important;
      max-width: 100% !important;
      min-height: auto !important;
      box-shadow: none !important;
      border: none !important;
      padding: 0 !important;
      margin: 0 !important;
    }
    @media screen {
      body { padding: 20px; background: #f1f5f9; }
      .print-wrapper { background: white; max-width: 794px; margin: 0 auto; box-shadow: 0 4px 20px rgba(0,0,0,0.1); padding: 40px; }
    }
  </style>
</head>
<body>
  <div class="print-wrapper">
    ${paperElement.outerHTML}
  </div>
  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 400);
    };
  </script>
</body>
</html>`;

  const printWindow = window.open("", "_blank", "width=900,height=750");
  if (!printWindow) {
    throw new Error("Pop-up blocked. Please allow pop-ups for printing.");
  }

  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();
}
