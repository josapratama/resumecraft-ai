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
    .cover-letter-paper,
    .print-wrapper {
      max-height: none !important;
    }
    .cover-letter-signature-img,
    img[alt*="Tanda Tangan"] {
      height: 46px !important;
      max-height: 50px !important;
      width: auto !important;
      max-width: 180px !important;
      object-fit: contain !important;
      display: block !important;
      margin: 0 auto !important;
      mix-blend-mode: normal !important;
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
    .cover-letter-paper div,
    .cover-letter-paper p,
    .cover-letter-paper table {
      break-inside: auto;
    }
    .cover-letter-paper table,
    .cover-letter-paper [class*="border"] {
      break-inside: avoid !important;
      page-break-inside: avoid !important;
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
    // Popup was blocked by browser — use hidden iframe fallback!
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(htmlContent);
      doc.close();
      iframe.contentWindow?.focus();
      setTimeout(() => {
        iframe.contentWindow?.print();
        setTimeout(() => {
          if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
        }, 3000);
      }, 500);
    }
    return;
  }

  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();
}

/**
 * Export Bundle: Cover Letter (Page 1) + CV (Page 2+) into ONE single PDF
 */
export async function exportBundleToPDF(
  coverLetterElementId: string,
  cvElementId: string = "cv-preview-content",
  fileName: string = "paket_lamaran_lengkap.pdf"
): Promise<void> {
  const clContainer = document.getElementById(coverLetterElementId);
  const cvContainer = document.getElementById(cvElementId);

  if (!clContainer) {
    throw new Error(`Cover letter element #${coverLetterElementId} not found`);
  }

  const paperElement = clContainer.querySelector<HTMLElement>(".cover-letter-paper") ?? clContainer;
  const cvElement = cvContainer?.querySelector<HTMLElement>(".cv-template-root") ?? cvContainer;

  if (!cvElement) {
    // If CV element is not found, fallback to Cover Letter only
    return exportCoverLetterToPDF(coverLetterElementId, fileName);
  }

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
      margin: 0;
    }
    html, body {
      margin: 0;
      padding: 0;
      background: white;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }
    .cover-letter-paper,
    .print-wrapper {
      max-height: none !important;
    }
    .cover-letter-signature-img,
    img[alt*="Tanda Tangan"] {
      height: 46px !important;
      max-height: 50px !important;
      width: auto !important;
      max-width: 180px !important;
      object-fit: contain !important;
      display: block !important;
      margin: 0 auto !important;
      mix-blend-mode: normal !important;
    }
    .bundle-page-1 {
      box-sizing: border-box;
      padding: 12mm 15mm 12mm 15mm;
      min-height: 297mm;
      page-break-after: always;
      break-after: page;
    }
    .bundle-page-1 .cover-letter-paper {
      width: 100% !important;
      max-width: 100% !important;
      min-height: auto !important;
      box-shadow: none !important;
      border: none !important;
      padding: 0 !important;
      margin: 0 !important;
    }
    .bundle-page-2 {
      box-sizing: border-box;
      min-height: 297mm;
      page-break-before: always;
      break-before: page;
    }
    .bundle-page-2 .cv-template-root {
      width: 100% !important;
      max-width: 100% !important;
      margin: 0 !important;
      box-shadow: none !important;
      border-radius: 0 !important;
    }
    .break-avoid,
    [class*="border"],
    table {
      break-inside: avoid !important;
      page-break-inside: avoid !important;
    }
    @media screen {
      body { padding: 20px; background: #f1f5f9; }
      .bundle-page-1, .bundle-page-2 {
        background: white;
        max-width: 794px;
        margin: 20px auto;
        box-shadow: 0 4px 20px rgba(0,0,0,0.1);
      }
    }
  </style>
</head>
<body>
  <div class="bundle-page-1">
    ${paperElement.outerHTML}
  </div>
  <div class="bundle-page-2">
    ${cvElement.outerHTML}
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
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(htmlContent);
      doc.close();
      iframe.contentWindow?.focus();
      setTimeout(() => {
        iframe.contentWindow?.print();
        setTimeout(() => {
          if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
        }, 3000);
      }, 500);
    }
    return;
  }

  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();
}

