import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { InstitutionModel } from "@/models/Institution";
import { UserModel } from "@/models/User";
import { CaseModel } from "@/models/Case";

export async function GET() {
  try {
    await connectToDatabase();

    // Check if data already exists
    const instCount = await InstitutionModel.countDocuments();
    if (instCount > 0) {
      return NextResponse.json({
        success: true,
        message: "Database already has data. Seed skipped.",
        institutionsCount: instCount,
        casesCount: await CaseModel.countDocuments(),
      });
    }

    // 1. Seed Advocates / Associates
    const users = await UserModel.create([
      {
        name: "Barrister Rafiqul Islam",
        email: "partner@lawfirmsolutions.com",
        phone: "+8801711000001",
        role: "admin",
        chamberDesignation: "Managing Partner & Senior Advocate",
        barEnrollmentNo: "SC-4521/1998",
      },
      {
        name: "Advocate Anisur Rahman",
        email: "anisur@lawfirmsolutions.com",
        phone: "+8801819000002",
        role: "advocate",
        chamberDesignation: "Senior Associate Advocate",
        barEnrollmentNo: "HC-8842/2012",
      },
      {
        name: "Advocate Farhana Kabir",
        email: "farhana@lawfirmsolutions.com",
        phone: "+8801912000003",
        role: "associate",
        chamberDesignation: "Junior Associate",
        barEnrollmentNo: "DB-14251/2019",
      },
      {
        name: "Advocate Shakil Ahmed",
        email: "shakil@lawfirmsolutions.com",
        phone: "+8801615000004",
        role: "associate",
        chamberDesignation: "Associate Advocate",
        barEnrollmentNo: "HC-11204/2017",
      },
    ]);

    // 2. Seed Financial Institutions / Banks
    const institutions = await InstitutionModel.create([
      {
        name: "NRB Bank PLC",
        shortCode: "NRB",
        category: "Private Commercial Bank",
        branch: "Principal Branch, Motijheel, Dhaka",
        address: "Simpletree Anarkali, 89 Gulshan Avenue, Dhaka-1212",
        focalPerson: {
          name: "Mr. K. M. Mahbubul Alam",
          designation: "Head of Legal & Recovery Division",
          phone: "+8801713456789",
          email: "mahbub.alam@nrbbankbd.com",
        },
      },
      {
        name: "BRAC Bank PLC",
        shortCode: "BBL",
        category: "Private Commercial Bank",
        branch: "Special Assets Management, Anik Tower, Tejgaon",
        address: "220/B Gulshan-Tejgaon Link Road, Dhaka-1208",
        focalPerson: {
          name: "Ms. Fahmida Yasmin",
          designation: "Senior Manager, SAMD Legal",
          phone: "+8801817123456",
          email: "fahmida.samd@bracbank.com",
        },
      },
      {
        name: "Eastern Bank PLC",
        shortCode: "EBL",
        category: "Private Commercial Bank",
        branch: "Corporate Head Office, 100 Gulshan Avenue",
        address: "100 Gulshan Avenue, Dhaka-1212",
        focalPerson: {
          name: "Mr. Tanvir Mahmud",
          designation: "AVP & In-charge (Court Cases)",
          phone: "+8801911987654",
          email: "tanvir.m@ebl-bd.com",
        },
      },
      {
        name: "Islami Bank Bangladesh PLC",
        shortCode: "IBBL",
        category: "Shariah Islamic Bank",
        branch: "Head Office, Dilkusha C/A, Dhaka",
        address: "Islami Bank Tower, 40 Dilkusha C/A, Dhaka-1000",
        focalPerson: {
          name: "Md. Nurul Islam",
          designation: "FVP & Legal Advisor",
          phone: "+8801712334455",
          email: "legal@islamibankbd.com",
        },
      },
    ]);

    // 3. Seed Cases with complete multi-case numbers, party lists, and timeline updates
    const nrbBank = institutions[0];
    const bracBank = institutions[1];
    const anisur = users[1];
    const farhana = users[2];

    await CaseModel.create([
      {
        chamberFileNo: "CF-2024/001",
        institutionId: nrbBank._id,
        institutionName: nrbBank.name,
        matter: "Artha Rin Suit & Section 33(7) Auction Challenge",
        branch: "Principal Branch, Motijheel",
        focalPerson: nrbBank.focalPerson,
        caseNumbers: [
          {
            caseNumber: "Artha Rin Suit No. 142/2023",
            caseType: "Artha Rin Suit",
            year: "2023",
            courtDivision: "Artha Rin Adalat No. 1, Dhaka",
            remarks: "Original decree execution proceeding",
          },
          {
            caseNumber: "Writ Petition No. 5821/2024",
            caseType: "Writ Petition",
            year: "2024",
            courtDivision: "High Court Division (Bench 14)",
            remarks: "Challenging auction notice dated 12.01.2024",
          },
        ],
        parties: [
          {
            partyNo: 1,
            partyNameDetails: "M/S Bengal Agro Trade Ltd. (Borrower)",
            caseReceivedDate: "2024-02-10",
            searchListEntry: "SL-2024/09",
          },
          {
            partyNo: 2,
            partyNameDetails: "Md. Shamsul Huda (Managing Director & Mortgagor)",
            caseReceivedDate: "2024-02-10",
            searchListEntry: "SL-2024/09",
          },
        ],
        specialNotes: {
          wokalatnamaNote: "Original executed Wokalatnama received from Bank on 15.02.2024 and filed before the Hon'ble High Court on 20.02.2024.",
          mainPetitionNote: "Opposite party filed Writ Petition suppressing material facts of the Artha Rin proceedings.",
          extensionNote: "Ad-interim stay granted for 3 months on 02.03.2024. Next extension petition to be moved by Advocate Anisur.",
          generalRemarks: "Borrower default amount BDT 14.50 Crore. Bank wishes to move for vacating the stay order immediately.",
        },
        assignedAdvocate: {
          advocateId: anisur._id,
          advocateName: anisur.name,
          dateAssigned: "2024-02-12",
          internalRemarks: "Prepare application for vacating stay order with certified copy of mortgage deed.",
        },
        statusUpdates: [
          {
            updateDate: "2024-02-20",
            statusRemarks: "Wokalatnama filed and appearance entered on behalf of Respondent No. 3 (NRB Bank).",
            courtName: "High Court Division, Annex 14",
            enteredBy: anisur.name,
          },
          {
            updateDate: "2024-03-02",
            statusRemarks: "Rule Nisi issued with 3 months ad-interim stay of auction notice.",
            orderDetails: "Petitioners directed to deposit 15% within 30 days.",
            nextHearingDate: "2024-06-15",
            courtName: "High Court Division, Annex 14",
            enteredBy: anisur.name,
          },
          {
            updateDate: "2024-06-15",
            statusRemarks: "Hearing concluded on maintainability. Bench directed Bank to file affidavit-in-opposition.",
            orderDetails: "Affidavit-in-opposition directed to be filed within 2 weeks.",
            nextHearingDate: "2024-07-28",
            courtName: "High Court Division, Annex 14",
            enteredBy: anisur.name,
          },
        ],
        status: "running",
      },
      {
        chamberFileNo: "CF-2023/118",
        institutionId: bracBank._id,
        institutionName: bracBank.name,
        matter: "Cheque Dishonour (NI Act Section 138)",
        branch: "Tejgaon Commercial Branch",
        focalPerson: bracBank.focalPerson,
        caseNumbers: [
          {
            caseNumber: "C.R. Case No. 982/2023",
            caseType: "C.R. Case (NI Act)",
            year: "2023",
            courtDivision: "Metropolitan Magistrate Court No. 5, Dhaka",
            remarks: "Cheque amount BDT 48,00,000/-",
          },
        ],
        parties: [
          {
            partyNo: 1,
            partyNameDetails: "Tariqul Islam (Proprietor, Islam Trading)",
            caseReceivedDate: "2023-08-14",
            searchListEntry: "SL-2023/88",
          },
        ],
        specialNotes: {
          wokalatnamaNote: "Filed on 28.08.2023.",
          mainPetitionNote: "Legal notice sent under registered post with A/D returned served.",
          generalRemarks: "Accused pleaded guilty during charge framing.",
        },
        assignedAdvocate: {
          advocateId: farhana._id,
          advocateName: farhana.name,
          dateAssigned: "2023-08-15",
          internalRemarks: "Cross-examination of complainant witness conducted successfully.",
        },
        statusUpdates: [
          {
            updateDate: "2023-09-10",
            statusRemarks: "Cognizance taken and summons issued against accused Tariqul Islam.",
            courtName: "CMM Court Dhaka",
            enteredBy: farhana.name,
          },
          {
            updateDate: "2024-01-18",
            statusRemarks: "Judgment and Order passed. Accused convicted and sentenced to 1 year imprisonment and fine of BDT 48,00,000/-.",
            orderDetails: "Certified copy of judgment delivered to Bank SAMD on 25.01.2024.",
            courtName: "Metropolitan Sessions Judge Court, Dhaka",
            enteredBy: farhana.name,
          },
        ],
        status: "disposed",
        disposalDetails: {
          disposalDate: "2024-01-18",
          outcomeRemarks: "Conviction and recovery decree awarded in favour of BRAC Bank PLC.",
          decreeSummary: "1 year simple imprisonment and fine equivalent to cheque amount BDT 4,800,000/-.",
        },
      },
    ]);

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully with institutions, advocates, and sample cases.",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An unexpected error occurred";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
