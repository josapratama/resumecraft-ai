/**
 * CV PDF Export
 *
 * Uses window.print() with a dedicated print window containing the full
 * CV template HTML and all current page stylesheets (including Tailwind).
 *
 * This approach:
 * - Works with ALL CSS including Tailwind arbitrary values
 * - Captures the full document height (no scroll clipping)
 * - Does not depend on html2canvas canvas rendering
 * - Produces higher quality output (vector, not rasterized JPEG)
 *
 * The browser opens a Print dialog. User selects "Save as PDF" to download.
 */
export async function exportCVToPDF(
  previewContainerId: string,
  fileName: string = "resume.pdf"
): Promise<void> {
  const container = document.getElementById(previewContainerId);
  if (!container) {
    throw new Error(`Preview element #${previewContainerId} not found`);
  }

  // Walk into the template root — bypasses Card border and scroll wrapper
  const templateRoot =
    container.querySelector<HTMLElement>(".cv-template-root") ?? container;

  if (!templateRoot) {
    throw new Error("CV template content not found");
  }

  // Collect ALL stylesheets (Tailwind, etc.) from the current document
  const styleLinks = Array.from(
    document.querySelectorAll<HTMLLinkElement>("link[rel='stylesheet']")
  )
    .map(link => `<link rel="stylesheet" href="${link.href}">`)
    .join("\n");

  // Also collect inline <style> tags injected by Vite/React
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
      size: A4;
      margin: 0;
    }
    html, body {
      margin: 0;
      padding: 0;
      background: white;
      /* Force all colors to print exactly as shown on screen */
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }
    /* Remove any height or overflow constraints for print */
    * {
      max-height: none !important;
    }
    /* Reset any preview scaling transforms */
    .cv-template-root {
      transform: none !important;
      width: 100% !important;
      min-height: 100vh !important;
      margin: 0 !important;
    }
    /* Anti-split protection: prevent experiences, educations & cards from splitting horizontally across pages */
    .cv-template-root h2,
    .cv-template-root h3,
    .cv-template-root [class*="space-y-"] > div {
      break-inside: avoid !important;
      page-break-inside: avoid !important;
    }
    h2, h3 {
      break-after: avoid !important;
      page-break-after: avoid !important;
    }
    /* Only show the CV content — no browser chrome artifacts */
    @media screen {
      body { padding: 20px; background: #f0f0f0; }
      .cv-print-wrapper { background: white; max-width: 794px; margin: 0 auto; box-shadow: 0 0 20px rgba(0,0,0,0.2); }
    }
  </style>
</head>
<body>
  <div class="cv-print-wrapper">
    ${templateRoot.outerHTML}
  </div>
  <script>
    // Auto-trigger print once styles are loaded
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 500);
    };
  </script>
</body>
</html>`;

  const printWindow = window.open("", "_blank", "width=900,height=700");

  if (!printWindow) {
    // Popup was blocked by browser — use a hidden iframe to trigger print directly without popup!
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
      }, 600);
    }
    return;
  }

  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();
}
