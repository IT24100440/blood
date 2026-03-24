import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function includesQuery(values, query) {
  if (!query) return true;
  const q = query.toLowerCase();
  return values.some((value) => String(value ?? '').toLowerCase().includes(q));
}

function drawVitalFlowLogo(doc, x, y) {
  // Draw shield shape with gradient effect
  doc.setFillColor(220, 38, 38); // Red
  doc.rect(x, y, 16, 14, 'F');
  
  // Add inner border (lighter)
  doc.setDrawColor(196, 30, 58);
  doc.setLineWidth(0.5);
  doc.rect(x + 0.5, y + 0.5, 15, 13);
  
  // Add orange accent (right side)
  doc.setFillColor(245, 158, 11); // Orange
  doc.rect(x + 10, y, 6, 14, 'F');
  
  // Draw white building pillars (simplified)
  doc.setFillColor(255, 255, 255);
  // Left column
  doc.rect(x + 3, y + 5, 1.5, 6, 'F');
  // Middle column
  doc.rect(x + 6.5, y + 5, 1.5, 6, 'F');
  // Right column
  doc.rect(x + 10, y + 5, 1.5, 6, 'F');
  
  // Draw roof line (white)
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(1);
  doc.line(x + 2, y + 4, x + 14, y + 4);
  
  // Draw dot on top (white)
  doc.setFillColor(255, 255, 255);
  doc.circle(x + 8, y + 2.5, 0.5, 'F');
}

function loadImageAsDataUrl(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not initialize canvas context'));
        return;
      }

      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
}

async function resolveLogoDataUrl() {
  const candidates = ['/favicon.png', '/favicon.ico', '/favicon.svg'];
  for (const src of candidates) {
    try {
      const dataUrl = await loadImageAsDataUrl(src);
      if (dataUrl) return dataUrl;
    } catch (_) {
      // Try next logo source.
    }
  }
  return null;
}

export async function exportRowsToPdf(title, columns, rows) {
  const doc = new jsPDF({ orientation: 'landscape' });
  
  // Add VitalFlow branding header
  const logoDataUrl = await resolveLogoDataUrl();
  if (logoDataUrl) {
    doc.addImage(logoDataUrl, 'PNG', 14, 9.5, 16, 16);
  } else {
    drawVitalFlowLogo(doc, 14, 10);
  }
  
  // VitalFlow title
  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(196, 30, 58); // VitalFlow red
  doc.text('VitalFlow', 33, 16);
  
  // Subtitle
  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(120, 120, 120);
  doc.text('Smart Blood Donation Network', 33, 20);
  
  // Divider line
  doc.setDrawColor(196, 30, 58);
  doc.setLineWidth(0.8);
  doc.line(14, 23, 270, 23);
  
  // Report title
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(30, 30, 30);
  doc.text(title, 14, 29);
  
  // Generated timestamp
  doc.setFontSize(8);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 33);

  // Add table
  autoTable(doc, {
    startY: 37,
    head: [columns],
    body: rows,
    styles: { fontSize: 9 },
    headStyles: { 
      fillColor: [196, 30, 58], // VitalFlow red
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245]
    },
    margin: { left: 14, right: 10 }
  });

  // Add footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text(`Page ${i} of ${pageCount}`, 270, doc.internal.pageSize.getHeight() - 10, { align: 'right' });
    doc.text('© 2026 VitalFlow. Blood Donation Network.', 14, doc.internal.pageSize.getHeight() - 10);
  }

  const safeName = title.replace(/[^a-z0-9]+/gi, '-').toLowerCase();
  doc.save(`${safeName}.pdf`);
}
