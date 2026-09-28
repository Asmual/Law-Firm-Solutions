import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Case, Institution } from "@/types";

export interface InstitutionReportOptions {
  institution: Institution;
  cases: Case[];
  reportMonth: string; // e.g. "July 2026"
  reportDate?: string; // e.g. "28.07.2026"
  customRef?: string;
  signatoryName?: string;
  signatoryTitle?: string;
}

export function generateInstitutionCasePositionPdf({
  institution,
  cases,
  reportMonth,
  reportDate,
  customRef,
  signatoryName = "Md. Mahfuzur Rahman (Milon)",
  signatoryTitle = "Senior Advocate, Supreme Court of Bangladesh",
}: InstitutionReportOptions): jsPDF {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "a4",
  });

  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const margin = 32;
  const contentWidth = pageWidth - margin * 2; // 531.28 pt

  const todayStr = reportDate || new Date().toLocaleDateString("en-GB").replace(/\//g, ".");
  const instCode = (institution.shortCode || "CLIENT").toUpperCase();
  const monthCode = reportMonth.split(" ")[0] || "Month";
  const yearVal = reportMonth.split(" ")[1] || String(new Date().getFullYear());
  const refNo = customRef || `TLS/${instCode}/AD/HC/RAJ/${monthCode}/${yearVal}`;

  // Filter running vs disposed cases
  const runningCases = cases.filter(
    (c) => c.status !== "disposed" && c.status !== "decreed"
  );
  const disposedCases = cases.filter(
    (c) => c.status === "disposed" || c.status === "decreed"
  );

  const drawLetterhead = (y: number) => {
    // 1. Logo block (left)
    doc.setFillColor(15, 23, 42); // slate-900 / #0F172B
    doc.roundedRect(margin, y, 46, 38, 3, 3, "F");

    // Gold scale symbol
    doc.setDrawColor(204, 167, 118); // #cca776
    doc.setLineWidth(1.2);
    // Vertical beam
    doc.line(margin + 23, y + 8, margin + 23, y + 32);
    // Base
    doc.line(margin + 16, y + 32, margin + 30, y + 32);
    // Cross horizontal beam
    doc.line(margin + 11, y + 14, margin + 35, y + 14);
    // Left scale pan strings & pan
    doc.line(margin + 11, y + 14, margin + 7, y + 23);
    doc.line(margin + 11, y + 14, margin + 15, y + 23);
    doc.line(margin + 6, y + 23, margin + 16, y + 23);
    // Right scale pan strings & pan
    doc.line(margin + 35, y + 14, margin + 31, y + 23);
    doc.line(margin + 35, y + 14, margin + 39, y + 23);
    doc.line(margin + 30, y + 23, margin + 40, y + 23);

    // Text next to logo
    doc.setTextColor(15, 23, 42);
    doc.setFont("times", "bold");
    doc.setFontSize(10);
    doc.text("The", margin + 52, y + 14);
    doc.text("Legal Solutions", margin + 52, y + 24);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text("Barristers & Advocates", margin + 52, y + 33);

    // 2. Firm Name & Tagline (Center)
    doc.setFont("times", "bold");
    doc.setFontSize(19);
    doc.setTextColor(15, 23, 42); // #0F172B
    doc.text("The Legal Solutions", pageWidth / 2, y + 18, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(114, 73, 22); // #724916 gold bronze
    doc.text("—  A   L A W   F I R M  —", pageWidth / 2, y + 29, { align: "center" });

    // 3. Chamber Details (Right)
    doc.setFont("helvetica", "normal");
    doc.setFontSize(5.8);
    doc.setTextColor(51, 65, 85); // slate-700
    const rightX = pageWidth - margin;
    doc.text("Chamber: Flat No- 702 (6th Floor), 24/D, Topkhana Road,", rightX, y + 8, { align: "right" });
    doc.text("Seguna Bagicha, Dhaka-1000, Bangladesh", rightX, y + 15, { align: "right" });
    doc.text("Court Chamber: Room-206 (Annex Extension), Supreme Court", rightX, y + 22, { align: "right" });
    doc.text("Bar Association Building, Shahbag, Dhaka-1000.", rightX, y + 29, { align: "right" });
    doc.text("Phone: 02-9666885, 01740615720 | Web: www.thelegalsolutions.net", rightX, y + 36, { align: "right" });

    // Bottom horizontal rule
    doc.setDrawColor(30, 41, 59);
    doc.setLineWidth(0.8);
    doc.line(margin, y + 43, pageWidth - margin, y + 43);

    return y + 50;
  };

  let curY = drawLetterhead(24);

  // Recipient Block (Left) & Date/Ref Box (Right)
  const leftX = margin;
  const startRecipY = curY + 6;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  doc.text("To,", leftX, startRecipY);

  doc.text("Legal Division", leftX, startRecipY + 10);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(institution.name || "Client Institution", leftX, startRecipY + 20);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Head Office: ${institution.branch || "Uday Sanz"}`, leftX, startRecipY + 29);
  doc.text(institution.address || "Block: SE (A), Plot: 2/B, Road: 134, South Avenue", leftX, startRecipY + 38);
  doc.text("Gulshan – 1, Dhaka-1212.", leftX, startRecipY + 47);

  // Right Side: Date & Ref Box (matching exact 2-row bordered box in reference report)
  const boxX = pageWidth - margin - 180;
  const boxW = 180;
  const boxH = 28;
  const boxY = startRecipY;

  // Box Outer Border
  doc.setDrawColor(148, 163, 184); // slate-400
  doc.setLineWidth(0.6);
  doc.rect(boxX, boxY, boxW, boxH);

  // Horizontal divider
  doc.line(boxX, boxY + 14, boxX + boxW, boxY + 14);

  // Vertical divider between label & value
  doc.line(boxX + 46, boxY, boxX + 46, boxY + boxH);

  // Left cell background (Date & Ref)
  doc.setFillColor(224, 238, 252); // light slate/blue tint #E0EEFC
  doc.rect(boxX + 0.3, boxY + 0.3, 45.4, 13.4, "F");
  doc.rect(boxX + 0.3, boxY + 14.3, 45.4, 13.4, "F");

  // Labels
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text("Date:", boxX + 23, boxY + 9.5, { align: "center" });
  doc.text("Ref:", boxX + 23, boxY + 23.5, { align: "center" });

  // Values
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.text(todayStr, boxX + 52, boxY + 9.5);
  doc.setFontSize(6.8);
  doc.text(refNo, boxX + 52, boxY + 23.5);

  curY = startRecipY + 58;

  // Subject Box (exact banner from reference photo)
  const subjBoxH = 19;
  doc.setDrawColor(148, 163, 184);
  doc.rect(margin + 50, curY, contentWidth - 100, subjBoxH);
  doc.line(margin + 125, curY, margin + 125, curY + subjBoxH);

  doc.setFillColor(224, 238, 252);
  doc.rect(margin + 50.3, curY + 0.3, 74.4, subjBoxH - 0.6, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text("Subject:", margin + 87, curY + 12.5, { align: "center" });

  doc.text(`Latest Case Position Till Month of ${reportMonth}`, margin + 138, curY + 12.5);

  curY += subjBoxH + 10;

  // Salutation & Intro
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text("Dear Sir,", margin, curY);
  curY += 10;

  doc.text("Greetings from “The Legal Solutions”.", margin, curY);
  curY += 10;

  doc.text(
    "Thank you very much for engaging us as your Legal Counsel on the following case matters. The latest position of cases",
    margin,
    curY
  );
  curY += 9;
  doc.text("which were assigned to us is given below:-", margin, curY);
  curY += 12;

  // Category Banner (CASES BEFORE HIGH COURT DIVISION & APPELLATE DIVISION)
  doc.setFillColor(15, 23, 42); // slate-900 / #0F172B
  doc.roundedRect(margin, curY, contentWidth, 16, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text(
    "CASES BEFORE HIGH COURT DIVISION & APPELLATE DIVISION",
    pageWidth / 2,
    curY + 11,
    { align: "center" }
  );

  curY += 21;

  // Table Columns Setup (Exact 9 columns from Reference Photo 2)
  const columns = [
    { header: "S.L.", dataKey: "sl" },
    { header: "Case Number\n(As per Database)", dataKey: "caseNo" },
    { header: "Party No.", dataKey: "partyNo" },
    { header: "Party Name & Details\n(As per Database)", dataKey: "partyDetails" },
    { header: "Case\nReceived on", dataKey: "receivedOn" },
    { header: "Search List\nEntry", dataKey: "searchList" },
    { header: "Matter", dataKey: "matter" },
    { header: "Chamber\nFile No.", dataKey: "chamberFile" },
    { header: "Remark / Status\n(As per Database)", dataKey: "remarks" },
  ];

  const mapCaseToRow = (c: Case, idx: number) => {
    const p = c.parties?.[0];
    let partyNoLabel = "Party No. 01";
    if (p) {
      const type = p.partyType || "Opposite Party";
      const num = p.partyNo || idx + 1;
      partyNoLabel = `${type}\nNo. ${num < 10 ? "0" + num : num}`;
    }

    // Multi-case numbers
    const caseNoStr =
      c.caseNumbers && c.caseNumbers.length > 0
        ? c.caseNumbers.map((cn) => cn.caseNumber).filter(Boolean).join("\n")
        : "N/A";

    // Party details
    let partyDetailsStr = p?.partyNameDetails || "N/A";
    if (c.branch && !partyDetailsStr.includes(c.branch)) {
      partyDetailsStr += `\n(${institution.name}, ${c.branch})`;
    }

    // Chronological Remarks
    const remarkLines: string[] = [];
    if (c.statusUpdates && c.statusUpdates.length > 0) {
      c.statusUpdates.forEach((u) => {
        let line = `• ${u.updateDate ? u.updateDate + ": " : ""}${u.statusRemarks}`;
        if (u.nextHearingDate) {
          line += ` – Next Date: ${u.nextHearingDate}`;
        }
        remarkLines.push(line);
      });
    }
    if (c.specialNotes?.mainPetitionNote) {
      remarkLines.push(`• Main Petition: ${c.specialNotes.mainPetitionNote}`);
    }
    if (c.specialNotes?.extensionNote) {
      remarkLines.push(`• Stay / Extension: ${c.specialNotes.extensionNote}`);
    }
    if (c.specialNotes?.generalRemarks) {
      remarkLines.push(`• Note: ${c.specialNotes.generalRemarks}`);
    }
    if (remarkLines.length === 0) {
      remarkLines.push(`• Active matter. Status: ${c.status}`);
    }

    return {
      sl: idx + 1,
      caseNo: caseNoStr,
      partyNo: partyNoLabel,
      partyDetails: partyDetailsStr,
      receivedOn: p?.caseReceivedDate || "-",
      searchList: p?.searchListEntry || "-",
      matter: c.matter || "-",
      chamberFile: c.chamberFileNo || "-",
      remarks: remarkLines.join("\n"),
    };
  };

  // Section A Header (Light Green Badge)
  doc.setFillColor(220, 252, 231); // #DCFCE7
  doc.setDrawColor(134, 239, 172); // #86EFAC
  doc.roundedRect(margin, curY, contentWidth, 14, 2, 2, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(20, 83, 45); // green-900
  doc.text(`A.  RUNNING CASES`, margin + 6, curY + 9.5);

  curY += 16;

  autoTable(doc, {
    columns,
    body: runningCases.map(mapCaseToRow),
    startY: curY,
    theme: "grid",
    headStyles: {
      fillColor: [241, 245, 249], // slate-100
      textColor: [15, 23, 42],
      fontSize: 6.2,
      fontStyle: "bold",
      halign: "center",
      valign: "middle",
      lineColor: [148, 163, 184],
      lineWidth: 0.5,
    },
    bodyStyles: {
      fontSize: 6,
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
      sl: { cellWidth: 18, halign: "center", fontStyle: "bold" },
      caseNo: { cellWidth: 70, fontStyle: "bold" },
      partyNo: { cellWidth: 46, halign: "center", fontStyle: "bold", textColor: [114, 73, 22] },
      partyDetails: { cellWidth: 95 },
      receivedOn: { cellWidth: 44, halign: "center" },
      searchList: { cellWidth: 44, halign: "center" },
      matter: { cellWidth: 50 },
      chamberFile: { cellWidth: 38, halign: "center", fontStyle: "bold" },
      remarks: { cellWidth: 126 },
    },
  });

  // Section B Header (Light Pink Badge) for Disposed Cases
  if (disposedCases.length > 0) {
    let nextY = (doc as any).lastAutoTable.finalY + 12;
    if (nextY > 700) {
      doc.addPage();
      nextY = 40;
    }

    doc.setFillColor(254, 226, 226); // #FEE2E2
    doc.setDrawColor(254, 205, 211); // #FECDD3
    doc.roundedRect(margin, nextY, contentWidth, 14, 2, 2, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(159, 18, 57); // rose-900
    doc.text(`B.  DISPOSED / COMPLETED CASES`, margin + 6, nextY + 9.5);

    nextY += 16;

    autoTable(doc, {
      columns,
      body: disposedCases.map(mapCaseToRow),
      startY: nextY,
      theme: "grid",
      headStyles: {
        fillColor: [241, 245, 249],
        textColor: [15, 23, 42],
        fontSize: 6.2,
        fontStyle: "bold",
        halign: "center",
        valign: "middle",
        lineColor: [148, 163, 184],
        lineWidth: 0.5,
      },
      bodyStyles: {
        fontSize: 6,
        textColor: [30, 41, 59],
        valign: "top",
        lineColor: [203, 213, 225],
        lineWidth: 0.4,
        cellPadding: 3,
      },
      margin: { left: margin, right: margin },
      columnStyles: {
        sl: { cellWidth: 18, halign: "center", fontStyle: "bold" },
        caseNo: { cellWidth: 70, fontStyle: "bold" },
        partyNo: { cellWidth: 46, halign: "center", fontStyle: "bold", textColor: [114, 73, 22] },
        partyDetails: { cellWidth: 95 },
        receivedOn: { cellWidth: 44, halign: "center" },
        searchList: { cellWidth: 44, halign: "center" },
        matter: { cellWidth: 50 },
        chamberFile: { cellWidth: 38, halign: "center", fontStyle: "bold" },
        remarks: { cellWidth: 126 },
      },
    });
  }

  // Footer / Disclaimer & Authority Signature Block
  let finalY = (doc as any).lastAutoTable.finalY + 14;
  if (finalY > 680) {
    doc.addPage();
    finalY = 50;
  }

  // Contact disclaimer paragraph
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.8);
  doc.setTextColor(51, 65, 85);
  doc.text(
    "If you have any further queries regarding above mentioned case matters please feel free to contact us (Phone No- 01740615720 /",
    margin,
    finalY
  );
  doc.text(
    "Advocate Shahriar Mahmud 01614291511, E-mail: thelegalsolutions.bd@gmail.com). This is for your kind information and necessary record.",
    margin,
    finalY + 9
  );

  finalY += 24;
  doc.text("Thanking you,", margin, finalY);
  doc.text("Sincerely yours,", margin, finalY + 9);

  finalY += 22;

  // Digital Signature Graphic / Flourish (deep blue cursive stroke)
  doc.setDrawColor(3, 105, 161); // sky-700 / deep blue ink
  doc.setLineWidth(1.3);
  doc.lines(
    [
      [12, -8],
      [18, 6],
      [10, -12],
      [14, 10],
      [22, -6],
      [15, 8],
    ],
    margin + 6,
    finalY + 6
  );

  finalY += 18;

  // Signatory authority credentials
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text(signatoryName, margin, finalY);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text("Barrister-at-Law", margin, finalY + 9);
  doc.text(signatoryTitle, margin, finalY + 18);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(114, 73, 22); // #724916
  doc.text("For: The Legal Solutions", margin, finalY + 27);

  // Bottom Page Numbers on All Pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(6.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `The Legal Solutions • Supreme Court of Bangladesh • Confidential Client Position Report • Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 16,
      { align: "center" }
    );
  }

  return doc;
}
