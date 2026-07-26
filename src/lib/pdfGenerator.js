import jsPDF from "jspdf";
import "jspdf-autotable";
import { formatINR } from "./api";

/**
 * Generates a proper invoice PDF for a given invoice object.
 * Returns the jsPDF doc instance.
 */
export function generateInvoicePDF(invoice) {
  const doc = new jsPDF("p", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  let y = margin;

  // --- Header background ---
  doc.setFillColor(30, 58, 138); // brand dark blue
  doc.rect(0, 0, pageWidth, 42, "F");

  // --- Company Name ---
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("BOSS Travels", margin, y + 12);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Your trusted travel partner", margin, y + 19);
  doc.text("123 Travel Street, Bengaluru, India | +91 98765 43210 | contact@bosstravels.com", margin, y + 25);

  // --- Invoice title on right ---
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.text("INVOICE", pageWidth - margin, y + 14, { align: "right" });

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`#${invoice.invoiceNumber}`, pageWidth - margin, y + 21, { align: "right" });
  doc.text(`Date: ${new Date(invoice.createdAt).toLocaleDateString("en-IN")}`, pageWidth - margin, y + 27, { align: "right" });

  y = 50;

  // --- Bill To / Tour Details ---
  doc.setTextColor(0, 0, 0);
  doc.setFillColor(241, 245, 249); // slate-100
  doc.roundedRect(margin, y, pageWidth - margin * 2, 36, 3, 3, "F");

  // Bill To
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text("BILLED TO", margin + 5, y + 7);

  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.text(invoice.customerName || "—", margin + 5, y + 14);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  if (invoice.mobile) doc.text(`Mobile: ${invoice.mobile}`, margin + 5, y + 20);
  if (invoice.email) doc.text(`Email: ${invoice.email}`, margin + 5, y + 26);

  // Tour Details
  const midX = pageWidth / 2 + 10;
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(100, 116, 139);
  doc.text("TOUR DETAILS", midX, y + 7);

  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.text(invoice.packageName || "—", midX, y + 14);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  const route = `${invoice.sourceLocation || ""} → ${invoice.destinationLocation || ""}`;
  doc.text(route, midX, y + 20);
  const travelInfo = `Travel: ${new Date(invoice.travelDate).toLocaleDateString("en-IN")} | ${invoice.travelersCount} traveler(s)`;
  doc.text(travelInfo, midX, y + 26);

  y += 44;

  // --- Cost Breakdown Table ---
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("Cost Breakdown", margin, y);
  y += 3;

  const tableBody = [
    [
      invoice.packageName || "Tour Package",
      String(invoice.travelersCount || 1),
      formatINR(invoice.packageCost),
      formatINR((invoice.packageCost || 0) * (invoice.travelersCount || 1)),
    ],
  ];

  if (Number(invoice.additionalCharges) > 0) {
    tableBody.push([
      "Additional Charges",
      "—",
      "—",
      formatINR(invoice.additionalCharges),
    ]);
  }

  doc.autoTable({
    startY: y,
    head: [["Description", "Qty", "Rate", "Amount"]],
    body: tableBody,
    margin: { left: margin, right: margin },
    styles: {
      fontSize: 9,
      cellPadding: 4,
    },
    headStyles: {
      fillColor: [30, 58, 138],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      halign: "left",
    },
    columnStyles: {
      1: { halign: "center" },
      2: { halign: "right" },
      3: { halign: "right" },
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
  });

  y = doc.lastAutoTable.finalY + 10;

  // --- Totals section ---
  const totalsX = pageWidth - margin - 70;
  const valX = pageWidth - margin;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text("Subtotal:", totalsX, y);
  doc.setTextColor(0, 0, 0);
  doc.text(formatINR(invoice.subtotal), valX, y, { align: "right" });

  y += 7;
  doc.setTextColor(71, 85, 105);
  doc.text(`GST (${invoice.gstPercentage}%):`, totalsX, y);
  doc.setTextColor(0, 0, 0);
  doc.text(formatINR(invoice.gstAmount), valX, y, { align: "right" });

  y += 3;
  doc.setDrawColor(200, 200, 200);
  doc.line(totalsX, y, valX, y);

  y += 7;
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 58, 138);
  doc.text("Grand Total:", totalsX, y);
  doc.text(formatINR(invoice.grandTotal), valX, y, { align: "right" });

  // --- Footer ---
  const footerY = doc.internal.pageSize.getHeight() - 20;
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text("Thank you for choosing BOSS Travels. Have a wonderful journey!", pageWidth / 2, footerY, { align: "center" });
  doc.text("This is a computer-generated invoice.", pageWidth / 2, footerY + 5, { align: "center" });

  return doc;
}

/**
 * Download a single invoice as PDF
 */
export function downloadInvoicePDF(invoice) {
  const doc = generateInvoicePDF(invoice);
  doc.save(`${invoice.invoiceNumber}.pdf`);
}
