import jsPDF from "jspdf";
import autoTable, { RowInput } from "jspdf-autotable";
import { Case } from "@/types";

export interface AssociateGroup {
  associateCode: string;
  associateName: string;
  cases: Case[];
}

export interface AssociateReportOptions {
  associateGroups: AssociateGroup[];
  totalCases: number;
  reportDate?: string; // e.g. "28.07.2026"
  institutionFilterName?: string; // e.g. "All Institutions"
  associateFilterCode?: string; // e.g. "All"
  preparedByName?: string;
  checkedByName?: string;
}

export function generateAssociateAssignedCasesPdf({
  associateGroups,
  totalCases,
  reportDate,
  institutionFilterName = "All Institutions",
  associateFilterCode = "All",
  preparedByName = "Chamber Admin",
  checkedByName = "Managing Partner",
}: AssociateReportOptions): jsPDF {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "pt",
    format: "a4",
  });

  const pageWidth = 841.89;
  const pageHeight = 595.28;
  const margin = 28;
  const contentWidth = pageWidth - margin * 2; // 785.89 pt

  const todayStr = reportDate || new Date().toLocaleDateString("en-GB").replace(/\//g, ".");
  const nowTimeStr = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });

  // 1. Top Letterhead
  const drawLetterhead = (y: number) => {
    // Logo block (left)
    doc.setFillColor(15, 23, 42); // #0F172B
    doc.roundedRect(margin, y, 48, 38, 3, 3, "F");

    // Gold scale symbol
    doc.setDrawColor(204, 167, 118); // #cca776
    doc.setLineWidth(1.2);
    // Vertical beam
    doc.line(margin + 24, y + 8, margin + 24, y + 32);
    // Base
    doc.line(margin + 17, y + 32, margin + 31, y + 32);
    // Horizontal crossbeam
    doc.line(margin + 12, y + 14, margin + 36, y + 14);
    // Left scale pan
    doc.line(margin + 12, y + 14, margin + 8, y + 23);
    doc.line(margin + 12, y + 14, margin + 16, y + 23);
    doc.line(margin + 7, y + 23, margin + 17, y + 23);
    // Right scale pan
    doc.line(margin + 36, y + 14, margin + 32, y + 23);
    doc.line(margin + 36, y + 14, margin + 40, y + 23);
    doc.line(margin + 31, y + 23, margin + 41, y + 23);

    // Text next to logo
    doc.setTextColor(15, 23, 42);
    doc.setFont("times", "bold");
    doc.setFontSize(10.5);
    doc.text("The", margin + 55, y + 14);
    doc.text("Legal Solutions", margin + 55, y + 24);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.8);
    doc.setTextColor(100, 116, 139);
    doc.text("Barristers & Advocates", margin + 55, y + 33);

    // Firm Name & Tagline (Center)
    doc.setFont("times", "bold");
    doc.setFontSize(22);
    doc.setTextColor(15, 23, 42);
    doc.text("The Legal Solutions", pageWidth / 2, y + 18, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(114, 73, 22); // #724916
    doc.text("—  A   L A W   F I R M  —", pageWidth / 2, y + 31, { align: "center" });

    // Chamber details (Right)
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.2);
    doc.setTextColor(51, 65, 85);
    const rightX = pageWidth - margin;
    doc.text("Chamber: Flat No- 702 (6th Floor), 24/D, Topkhana Road, Seguna Bagicha, Dhaka-1000, Bangladesh", rightX, y + 9, { align: "right" });
    doc.text("Court Chamber: Room-206 (Annex Extension), Supreme Court Bar Association Building, Shahbag, Dhaka-1000.", rightX, y + 17, { align: "right" });
    doc.text("Phone: 02-9666885, 01740615720 | E-mail: thelegalsolutions.bd@gmail.com | Web: www.thelegalsolutions.net", rightX, y + 25, { align: "right" });

    // Rule below letterhead
    doc.setDrawColor(30, 41, 59);
    doc.setLineWidth(0.8);
    doc.line(margin, y + 42, pageWidth - margin, y + 42);

    return y + 48;
  };

  let curY = drawLetterhead(16);

  // 2. Report Title Banner (Dark Navy rounded box matching Image 1)
  const titleBannerH = 28;
  doc.setFillColor(15, 23, 42); // #0F172B deep navy
  doc.roundedRect(margin + 80, curY, contentWidth - 160, titleBannerH, 4, 4, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text("ASSOCIATE WISE ASSIGNED CASES REPORT", pageWidth / 2, curY + 12, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(204, 167, 118); // #cca776 gold
  doc.text(`(As on ${todayStr})`, pageWidth / 2, curY + 22, { align: "center" });

  curY += titleBannerH + 7;

  // 3. Filter Options & Summary Box (Exact 1-row container from Image 1)
  const filterBoxH = 24;
  doc.setDrawColor(148, 163, 184); // slate-400
  doc.setLineWidth(0.6);
  doc.rect(margin, curY, contentWidth, filterBoxH);

  // Vertical dividers for filter controls
  const fCol1 = margin + 120;
  const fCol2 = margin + 300;
  const fCol3 = margin + 500;
  const fCol4 = pageWidth - margin - 150;

  doc.line(fCol1, curY, fCol1, curY + filterBoxH);
  doc.line(fCol2, curY, fCol2, curY + filterBoxH);
  doc.line(fCol3, curY, fCol3, curY + filterBoxH);
  doc.line(fCol4, curY, fCol4, curY + filterBoxH);

  // Filter 1: Report Date
  doc.setFillColor(224, 238, 252); // light blue tint
  doc.rect(margin + 0.3, curY + 0.3, 62, filterBoxH - 0.6, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.2);
  doc.setTextColor(15, 23, 42);
  doc.text("Report Date:", margin + 8, curY + 15);
  doc.setFont("helvetica", "normal");
  doc.text(todayStr, margin + 68, curY + 15);

  // Filter 2: Institution
  doc.setFillColor(224, 238, 252);
  doc.rect(fCol1 + 0.3, curY + 0.3, 56, filterBoxH - 0.6, "F");
  doc.setFont("helvetica", "bold");
  doc.text("Institution:", fCol1 + 6, curY + 15);
  doc.setFont("helvetica", "normal");
  doc.text(institutionFilterName, fCol1 + 62, curY + 15);

  // Filter 3: Associate ID
  doc.setFillColor(224, 238, 252);
  doc.rect(fCol2 + 0.3, curY + 0.3, 66, filterBoxH - 0.6, "F");
  doc.setFont("helvetica", "bold");
  doc.text("Associate ID:", fCol2 + 6, curY + 15);
  doc.setFont("helvetica", "normal");
  doc.text(associateFilterCode, fCol2 + 72, curY + 15);

  // Summary Metrics Box (Right side)
  doc.setFillColor(241, 245, 249);
  doc.rect(fCol4 + 0.3, curY + 0.3, pageWidth - margin - fCol4 - 0.6, filterBoxH - 0.6, "F");
  doc.line(fCol4, curY + 12, pageWidth - margin, curY + 12);
  doc.line(pageWidth - margin - 42, curY, pageWidth - margin - 42, curY + filterBoxH);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.8);
  doc.setTextColor(15, 23, 42);
  doc.text("Total Associates:", fCol4 + 6, curY + 8.5);
  doc.text(String(associateGroups.length), pageWidth - margin - 21, curY + 8.5, { align: "center" });

  doc.text("Total Assigned Cases:", fCol4 + 6, curY + 19.5);
  doc.text(String(totalCases), pageWidth - margin - 21, curY + 19.5, { align: "center" });

  curY += filterBoxH + 6;

  // 4. Grouped Table with Row-Spanning
  // Columns (Exact 10 columns from Image 1)
  const columns = [
    { header: "SL.", dataKey: "sl" },
    { header: "Associate\nID", dataKey: "assocId" },
    { header: "Associate Name", dataKey: "assocName" },
    { header: "Institution / Client", dataKey: "institution" },
    { header: "Case File\nNo.", dataKey: "fileNo" },
    { header: "Case Number(s)", dataKey: "caseNumbers" },
    { header: "Party Name & Details", dataKey: "partyDetails" },
    { header: "Matter", dataKey: "matter" },
    { header: "Date\nAssigned", dataKey: "dateAssigned" },
    { header: "Remarks (Internal)", dataKey: "remarks" },
  ];

  const bodyRows: RowInput[] = [];

  associateGroups.forEach((group, groupIdx) => {
    const caseCount = group.cases.length;
    const slNo = String(groupIdx + 1);

    if (caseCount === 0) {
      bodyRows.push([
        { content: slNo, styles: { halign: "center", valign: "middle", fontStyle: "bold" } },
        { content: group.associateCode, styles: { halign: "center", valign: "middle", fontStyle: "bold" } },
        { content: group.associateName, styles: { valign: "middle", fontStyle: "bold" } },
        { content: "No cases assigned", colSpan: 7, styles: { fontStyle: "italic", textColor: [148, 163, 184] } },
      ]);
      return;
    }

    group.cases.forEach((c, cIdx) => {
      // Case Numbers formatted
      const caseNumbersStr =
        c.caseNumbers && c.caseNumbers.length > 0
          ? c.caseNumbers.map((cn) => cn.caseNumber).filter(Boolean).join("\n")
          : "N/A";

      // Party Name & Details
      const party = c.parties?.[0]?.partyNameDetails || "N/A";

      // Date Assigned
      const dateAssigned =
        c.assignedAssociate?.dateAssigned || c.assignedAdvocate?.dateAssigned || "-";

      // Internal Remarks
      const remarks =
        c.assignedAssociate?.internalRemarks ||
        c.assignedAdvocate?.internalRemarks ||
        "Drafting and hearing";

      if (cIdx === 0) {
        // First row carries the rowSpan for SL, Associate ID, and Associate Name
        bodyRows.push([
          {
            content: slNo,
            rowSpan: caseCount,
            styles: { halign: "center", valign: "middle", fontStyle: "bold" },
          },
          {
            content: group.associateCode,
            rowSpan: caseCount,
            styles: { halign: "center", valign: "middle", fontStyle: "bold", textColor: [15, 23, 42] },
          },
          {
            content: group.associateName,
            rowSpan: caseCount,
            styles: { valign: "middle", fontStyle: "bold" },
          },
          c.institutionName || "Client",
          { content: c.chamberFileNo, styles: { halign: "center", fontStyle: "bold" } },
          caseNumbersStr,
          party,
          c.matter || "-",
          { content: dateAssigned, styles: { halign: "center" } },
          remarks,
        ]);
      } else {
        // Subsequent rows only contain the remaining 7 columns
        bodyRows.push([
          c.institutionName || "Client",
          { content: c.chamberFileNo, styles: { halign: "center", fontStyle: "bold" } },
          caseNumbersStr,
          party,
          c.matter || "-",
          { content: dateAssigned, styles: { halign: "center" } },
          remarks,
        ]);
      }
    });

    // Subtotal Row for this Associate (Exact structure matching Image 1)
    bodyRows.push([
      {
        content: `Total Cases Assigned to ${group.associateCode}`,
        colSpan: 4,
        styles: {
          fontStyle: "bold",
          fillColor: [224, 238, 252], // light blue accent
          textColor: [15, 23, 42],
        },
      },
      {
        content: String(caseCount),
        styles: {
          halign: "center",
          fontStyle: "bold",
          fillColor: [224, 238, 252],
          textColor: [15, 23, 42],
        },
      },
      {
        content: "",
        colSpan: 5,
        styles: {
          fillColor: [224, 238, 252],
        },
      },
    ]);
  });

  // Grand Total Row (At the bottom, dark navy banner matching Image 1)
  bodyRows.push([
    {
      content: "Grand Total Assigned Cases",
      colSpan: 4,
      styles: {
        fontStyle: "bold",
        fillColor: [15, 23, 42], // #0F172B
        textColor: [204, 167, 118], // gold #cca776
        fontSize: 7.5,
      },
    },
    {
      content: String(totalCases),
      styles: {
        halign: "center",
        fontStyle: "bold",
        fillColor: [15, 23, 42],
        textColor: [255, 255, 255],
        fontSize: 7.5,
      },
    },
    {
      content: "",
      colSpan: 5,
      styles: {
        fillColor: [15, 23, 42],
      },
    },
  ]);

  autoTable(doc, {
    columns,
    body: bodyRows,
    startY: curY,
    theme: "grid",
    headStyles: {
      fillColor: [224, 238, 252], // soft blue/slate
      textColor: [15, 23, 42],
      fontSize: 6.5,
      fontStyle: "bold",
      halign: "center",
      valign: "middle",
      lineColor: [148, 163, 184],
      lineWidth: 0.5,
    },
    bodyStyles: {
      fontSize: 6.2,
      textColor: [30, 41, 59],
      valign: "top",
      lineColor: [203, 213, 225],
      lineWidth: 0.4,
      cellPadding: 3,
    },
    alternateRowStyles: {
      fillColor: [255, 255, 255],
    },
    margin: { left: margin, right: margin },
    columnStyles: {
      sl: { cellWidth: 22 },
      assocId: { cellWidth: 44 },
      assocName: { cellWidth: 70 },
      institution: { cellWidth: 85 },
      fileNo: { cellWidth: 46 },
      caseNumbers: { cellWidth: 100 },
      partyDetails: { cellWidth: 130 },
      matter: { cellWidth: 72 },
      dateAssigned: { cellWidth: 54 },
      remarks: { cellWidth: 162 },
    },
  });

  // 5. Verification Footer (Prepared by Admin, Checked by Partner, Timestamp)
  let footerY = (doc as any).lastAutoTable.finalY + 22;
  if (footerY > 520) {
    doc.addPage();
    footerY = 50;
  }

  // Prepared by:
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text("Prepared by:  ____________________________________", margin + 10, footerY);
  doc.text(`(${preparedByName})`, margin + 85, footerY + 12);

  // Checked by:
  doc.text("Checked by:  ____________________________________", pageWidth / 2 - 90, footerY);
  doc.text(`(${checkedByName})`, pageWidth / 2 - 15, footerY + 12);

  // Date & Time:
  doc.text(`Date & Time: ${todayStr} ${nowTimeStr}`, pageWidth - margin - 155, footerY);

  // Running page numbers on all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(6.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `The Legal Solutions • Supreme Court of Bangladesh • Associate Assigned Cases Register • Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 14,
      { align: "center" }
    );
  }

  return doc;
}
