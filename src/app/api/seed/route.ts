import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { InstitutionModel } from "@/models/Institution";
import { UserModel } from "@/models/User";
import { CaseModel } from "@/models/Case";
import { hashPassword } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const force = searchParams.get("force") === "true";

    const instCount = await InstitutionModel.countDocuments();
    const caseCount = await CaseModel.countDocuments();

    // If data exists and force is not specified, return existing count with info
    if (instCount > 0 && !force) {
      return NextResponse.json({
        success: true,
        message: "Database already contains data. Use ?force=true to reset and re-seed with 5 demo cases for Advocate Asmual.",
        institutionsCount: instCount,
        casesCount: caseCount,
      });
    }

    // Clean existing collections if force=true
    if (force) {
      await Promise.all([
        InstitutionModel.deleteMany({}),
        UserModel.deleteMany({}),
        CaseModel.deleteMany({}),
      ]);
    }

    const defaultPasswordHash = hashPassword("password123");

    // 1. Seed Chamber Users (1 Admin, 5 Advocates, 3 Associates)
    const users = await UserModel.create([
      {
        name: "Advocate Asmual",
        email: "asmual@chamber.com",
        phone: "+8801700000001",
        passwordHash: defaultPasswordHash,
        role: "advocate",
        chamberDesignation: "Senior Advocate & Bank Litigation Specialist",
        barEnrollmentNo: "SC-9982/2016",
        isActive: true,
      },
      {
        name: "Barrister Rafiqul Islam",
        email: "admin@chamber.com",
        phone: "+8801711000001",
        passwordHash: defaultPasswordHash,
        role: "admin",
        chamberDesignation: "Managing Partner & Senior Counsel",
        barEnrollmentNo: "SC-4521/1998",
        isActive: true,
      },
      {
        name: "Advocate Farhana Kabir",
        email: "farhana@chamber.com",
        phone: "+8801912000003",
        passwordHash: defaultPasswordHash,
        role: "advocate",
        chamberDesignation: "Advocate, High Court Division",
        barEnrollmentNo: "HC-14251/2018",
        isActive: true,
      },
      {
        name: "Advocate Kazi Tanvir Ahmed",
        email: "tanvir@chamber.com",
        phone: "+8801714000006",
        passwordHash: defaultPasswordHash,
        role: "advocate",
        chamberDesignation: "Advocate, Supreme Court of Bangladesh",
        barEnrollmentNo: "SC-12044/2017",
        isActive: true,
      },
      {
        name: "Advocate Mahmudul Hasan Chowdhury",
        email: "mahmudul@chamber.com",
        phone: "+8801715000007",
        passwordHash: defaultPasswordHash,
        role: "advocate",
        chamberDesignation: "Advocate, Corporate & Artha Rin Specialist",
        barEnrollmentNo: "HC-16520/2019",
        isActive: true,
      },
      {
        name: "Advocate Nusrat Jahan Rimi",
        email: "nusrat@chamber.com",
        phone: "+8801716000008",
        passwordHash: defaultPasswordHash,
        role: "advocate",
        chamberDesignation: "Advocate, Civil & Constitutional Litigation",
        barEnrollmentNo: "HC-18933/2020",
        isActive: true,
      },
      {
        name: "Advocate Shakil Ahmed",
        email: "shakil@chamber.com",
        phone: "+8801615000004",
        passwordHash: defaultPasswordHash,
        role: "associate",
        chamberDesignation: "Associate Advocate",
        barEnrollmentNo: "HC-21204/2021",
        isActive: true,
      },
      {
        name: "Advocate Sabrina Yasmin",
        email: "sabrina@chamber.com",
        phone: "+8801817000009",
        passwordHash: defaultPasswordHash,
        role: "associate",
        chamberDesignation: "Junior Associate Advocate",
        barEnrollmentNo: "DB-24110/2022",
        isActive: true,
      },
      {
        name: "Advocate Tariqul Islam",
        email: "tariqul@chamber.com",
        phone: "+8801918000010",
        passwordHash: defaultPasswordHash,
        role: "associate",
        chamberDesignation: "Research Associate & Chamber Advocate",
        barEnrollmentNo: "DB-26514/2023",
        isActive: true,
      },
    ]);

    const asmual = users[0];
    const adminUser = users[1];
    const farhana = users[2];
    const tanvir = users[3];
    const mahmudul = users[4];
    const nusrat = users[5];
    const shakil = users[6];
    const sabrina = users[7];
    const tariqul = users[8];

    // 2. Seed 15 Bangladeshi Banking Institutions
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
        isActive: true,
      },
      {
        name: "BRAC Bank PLC",
        shortCode: "BBL",
        category: "Private Commercial Bank",
        branch: "Special Assets Management, Gulshan-Tejgaon",
        address: "Anik Tower, 220/B Gulshan-Tejgaon Link Road, Dhaka-1208",
        focalPerson: {
          name: "Ms. Fahmida Yasmin",
          designation: "Senior Manager, SAMD Legal",
          phone: "+8801817123456",
          email: "fahmida.samd@bracbank.com",
        },
        isActive: true,
      },
      {
        name: "City Bank PLC",
        shortCode: "CBL",
        category: "Private Commercial Bank",
        branch: "City Bank Center, Gulshan",
        address: "136 Gulshan Avenue, Gulshan-2, Dhaka-1212",
        focalPerson: {
          name: "Mr. Asif Bin Harun",
          designation: "Head of Recovery Law",
          phone: "+8801715887766",
          email: "asif.harun@thecitybank.com",
        },
        isActive: true,
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
        isActive: true,
      },
      {
        name: "Pubali Bank PLC",
        shortCode: "PBL",
        category: "Private Commercial Bank",
        branch: "Corporate Banking Wing, Dilkusha",
        address: "26 Dilkusha C/A, Dhaka-1000",
        focalPerson: {
          name: "Mr. Dewan Sirajul Islam",
          designation: "General Manager Legal",
          phone: "+8801711223344",
          email: "siraj.legal@pubalibankbd.com",
        },
        isActive: true,
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
        isActive: true,
      },
      {
        name: "Dutch-Bangla Bank PLC",
        shortCode: "DBBL",
        category: "Private Commercial Bank",
        branch: "Sena Kalyan Bhaban, Motijheel",
        address: "195 Motijheel C/A, Dhaka-1000",
        focalPerson: {
          name: "Mr. Abul Kashem",
          designation: "VP Legal Affairs",
          phone: "+8801713009988",
          email: "kashem.legal@dbbl.com.bd",
        },
        isActive: true,
      },
      {
        name: "EXIM Bank PLC",
        shortCode: "EXIM",
        category: "Shariah Islamic Bank",
        branch: "EXIM Bank Tower, Gulshan",
        address: "Plot 15, Block CWS(A), Gulshan Avenue, Dhaka-1212",
        focalPerson: {
          name: "Md. Rafiqul Hassan",
          designation: "Head of SAMD",
          phone: "+8801819334455",
          email: "rafiq.samd@eximbankbd.com",
        },
        isActive: true,
      },
      {
        name: "Al-Arafah Islami Bank PLC",
        shortCode: "AIBL",
        category: "Shariah Islamic Bank",
        branch: "Al-Arafah Tower, Purana Paltan",
        address: "63 Purana Paltan, VIP Road, Dhaka-1000",
        focalPerson: {
          name: "Mr. Jalal Ahmed",
          designation: "Legal Division In-charge",
          phone: "+8801711998877",
          email: "jalal.legal@aibl.com.bd",
        },
        isActive: true,
      },
      {
        name: "United Commercial Bank PLC",
        shortCode: "UCB",
        category: "Private Commercial Bank",
        branch: "Bulus Centre, Gulshan",
        address: "Plot CWS-(A)-1, Road 34, Gulshan Avenue, Dhaka-1212",
        focalPerson: {
          name: "Ms. Nazneen Akhter",
          designation: "Senior Manager Court Cases",
          phone: "+8801912445566",
          email: "nazneen.samd@ucb.com.bd",
        },
        isActive: true,
      },
      {
        name: "Mutual Trust Bank PLC",
        shortCode: "MTB",
        category: "Private Commercial Bank",
        branch: "MTB Centre, Gulshan",
        address: "26 Gulshan Avenue, Plot SE(F)-1, Dhaka-1212",
        focalPerson: {
          name: "Mr. Syed Rashedul Haque",
          designation: "Head of Legal Litigation",
          phone: "+8801713112233",
          email: "rashed.legal@mutualtrustbank.com",
        },
        isActive: true,
      },
      {
        name: "Prime Bank PLC",
        shortCode: "PRIME",
        category: "Private Commercial Bank",
        branch: "Prime Tower, Nikunja",
        address: "Plot 11, Commercial Area, Nikunja-2, Dhaka-1229",
        focalPerson: {
          name: "Mr. Tariqul Azam",
          designation: "AVP SAMD",
          phone: "+8801819556677",
          email: "tariq.azam@primebank.com.bd",
        },
        isActive: true,
      },
      {
        name: "Dhaka Bank PLC",
        shortCode: "DHAKA",
        category: "Private Commercial Bank",
        branch: "Biman Bhaban, Motijheel",
        address: "100 Motijheel C/A, Dhaka-1000",
        focalPerson: {
          name: "Mr. Moniruzzaman Khan",
          designation: "Legal Counsel",
          phone: "+8801711667788",
          email: "monir.legal@dhakabank.com.bd",
        },
        isActive: true,
      },
      {
        name: "Standard Bank PLC",
        shortCode: "SBL",
        category: "Shariah Islamic Bank",
        branch: "Metropolitan Chamber Building, Motijheel",
        address: "122-124 Motijheel C/A, Dhaka-1000",
        focalPerson: {
          name: "Mr. Golam Sarwar",
          designation: "Manager Recovery & Legal",
          phone: "+8801911445533",
          email: "sarwar.legal@standardbankbd.com",
        },
        isActive: true,
      },
      {
        name: "Trust Bank PLC",
        shortCode: "TBL",
        category: "Private Commercial Bank",
        branch: "Shadhinata Tower, Dhaka Cantonment",
        address: "Bir Sreshtha Shaheed Jahangir Gate, Dhaka-1206",
        focalPerson: {
          name: "Lt. Col. (Retd.) M. A. Wahab",
          designation: "Head of SAMD & Litigation",
          phone: "+8801713224466",
          email: "wahab.legal@trustbank.com.bd",
        },
        isActive: true,
      },
      // Corporate Clients (Different Sectors)
      {
        name: "Square Pharmaceuticals PLC",
        shortCode: "SQUARE",
        category: "Corporate Client",
        branch: "Corporate Headquarters, Uttara",
        address: "Square Centre, 48 Mohakhali C/A, Dhaka-1212",
        focalPerson: {
          name: "Barrister Ashiqur Rahman",
          designation: "Chief Legal Officer",
          phone: "+8801716000606",
          email: "legal.affairs@squaregroup.com",
        },
        isActive: true,
      },
      {
        name: "Beximco Group Ltd",
        shortCode: "BEXIMCO",
        category: "Corporate Client",
        branch: "BEXIMCO Industrial Park, Gazipur",
        address: "17 Dhanmondi R/A, Road No. 2, Dhaka-1205",
        focalPerson: {
          name: "Barrister Zillur Rahman",
          designation: "Head of Corporate & Regulatory Affairs",
          phone: "+8801717000707",
          email: "zillur@beximco.net",
        },
        isActive: true,
      },
      {
        name: "Bashundhara Group",
        shortCode: "BG",
        category: "Corporate Client",
        branch: "Industrial Headquarters, Baridhara",
        address: "Plot 3, Block G, Umme Kulsum Road, Bashundhara R/A, Dhaka",
        focalPerson: {
          name: "Maj. (Retd.) Mahfuzul Alam",
          designation: "Executive Director (Legal & Land Matters)",
          phone: "+8801718000808",
          email: "legal@bg.com.bd",
        },
        isActive: true,
      },
      {
        name: "Apex Footwear Ltd",
        shortCode: "APEX",
        category: "Corporate Client",
        branch: "Apex Centre, Gulshan",
        address: "House 6, Road 137, Block SE(D), Gulshan-1, Dhaka-1212",
        focalPerson: {
          name: "Mr. Moniruzzaman Tareq",
          designation: "General Manager (Legal Affairs)",
          phone: "+8801719000910",
          email: "legal@apexfootwearltd.com",
        },
        isActive: true,
      },
      {
        name: "Grameenphone Ltd",
        shortCode: "GP",
        category: "Corporate Client",
        branch: "GPHouse, Bashundhara",
        address: "GPHouse, Bashundhara Residential Area, Baridhara, Dhaka-1229",
        focalPerson: {
          name: "Syed Tanveer Hossain",
          designation: "Director & Head of Litigation",
          phone: "+8801711554433",
          email: "litigation@grameenphone.com",
        },
        isActive: true,
      },
      {
        name: "Akij Group Ltd",
        shortCode: "AKIJ",
        category: "Corporate Client",
        branch: "Akij House, Tejgaon",
        address: "198 Bir Uttam Mir Shawkat Sarak, Tejgaon I/A, Dhaka-1208",
        focalPerson: {
          name: "Mr. Shamsuddin Ahmed",
          designation: "Head of Legal & Compliance",
          phone: "+8801712889900",
          email: "legal@akij.net",
        },
        isActive: true,
      },
      // 6 Individual Litigants
      {
        name: "Al-Haj Mohammad Nurul Islam",
        shortCode: "IND-01",
        category: "Individual Client",
        branch: "Chittagong Commercial Center",
        address: "Agrabad Commercial Area, Chittagong",
        focalPerson: {
          name: "Mohammad Nurul Islam",
          designation: "Individual Litigant / Proprietor",
          phone: "+8801819000909",
          email: "nurul.islam@gmail.com",
        },
        isActive: true,
      },
      {
        name: "Dr. Tahmina Akter",
        shortCode: "IND-02",
        category: "Individual Client",
        branch: "Dhanmondi, Dhaka",
        address: "Road 7/A, Dhanmondi R/A, Dhaka-1209",
        focalPerson: {
          name: "Dr. Tahmina Akter",
          designation: "Individual Petitioner / Professor",
          phone: "+8801911000888",
          email: "tahmina.akter@yahoo.com",
        },
        isActive: true,
      },
      {
        name: "Kazi Mozammel Hossain",
        shortCode: "IND-03",
        category: "Individual Client",
        branch: "Banani, Dhaka",
        address: "Road 11, Block D, Banani, Dhaka-1213",
        focalPerson: {
          name: "Kazi Mozammel Hossain",
          designation: "Managing Director & Personal Guarantor",
          phone: "+8801711223344",
          email: "mozammel.hossain@outlook.com",
        },
        isActive: true,
      },
      {
        name: "Engr. Faruque Ahmed",
        shortCode: "IND-04",
        category: "Individual Client",
        branch: "Mirpur, Dhaka",
        address: "Section 10, Mirpur, Dhaka-1216",
        focalPerson: {
          name: "Engr. Faruque Ahmed",
          designation: "Managing Partner, Ahmed Construction",
          phone: "+8801715443322",
          email: "faruque.engineer@gmail.com",
        },
        isActive: true,
      },
      {
        name: "Begum Rokeya Sultana",
        shortCode: "IND-05",
        category: "Individual Client",
        branch: "Uttara, Dhaka",
        address: "Sector 4, Uttara Model Town, Dhaka-1230",
        focalPerson: {
          name: "Begum Rokeya Sultana",
          designation: "Landowner & Civil Appellant",
          phone: "+8801817665544",
          email: "rokeya.sultana@hotmail.com",
        },
        isActive: true,
      },
      {
        name: "Al-Amin Chowdhury",
        shortCode: "IND-06",
        category: "Individual Client",
        branch: "Narayanganj Port",
        address: "B.B. Road, Narayanganj-1400",
        focalPerson: {
          name: "Al-Amin Chowdhury",
          designation: "Importer & Commercial Litigant",
          phone: "+8801913778899",
          email: "alamin.chy@gmail.com",
        },
        isActive: true,
      },
    ]);

    const [nrb, brac, city, ebl, pubali, ibbl, dbbl] = institutions;
    const square = institutions.find((i) => i.shortCode === "SQUARE") || institutions[15];
    const beximco = institutions.find((i) => i.shortCode === "BEXIMCO") || institutions[16];
    const indNurul = institutions.find((i) => i.shortCode === "IND-01") || institutions[21];
    const indTahmina = institutions.find((i) => i.shortCode === "IND-02") || institutions[22];

    // 3. Seed 5 COMPLETE Case Files specifically assigned to ADVOCATE ASMUAL
    const asmualCases = [
      // Case 1: NRB Bank PLC - Artha Rin Suit & Section 33(7) Auction Challenge
      {
        chamberFileNo: "CF-2024/001",
        institutionId: nrb._id,
        institutionName: nrb.name,
        matter: "Artha Rin Suit & Section 33(7) Auction Challenge",
        branch: "Principal Branch, Motijheel, Dhaka",
        focalPerson: nrb.focalPerson,
        caseNumbers: [
          {
            caseNumber: "Artha Rin Suit No. 142/2023",
            caseType: "Artha Rin Suit",
            year: "2023",
            courtDivision: "Artha Rin Adalat No. 1, Dhaka",
            remarks: "Original decree execution proceeding for BDT 14.50 Crore default",
          },
          {
            caseNumber: "Writ Petition No. 5821/2024",
            caseType: "Writ Petition",
            year: "2024",
            courtDivision: "High Court Division (Annex 14)",
            remarks: "Borrower writ challenging auction gazette notice under section 33(7)",
          },
        ],
        parties: [
          {
            partyNo: 1,
            partyNameDetails: "M/S Bengal Agro Trade Ltd. (Borrower Company)\nRepresented by Managing Director, 45 Dilkusha C/A, Dhaka",
            caseReceivedDate: "10.02.2024",
            searchListEntry: "SL-2024/09",
          },
          {
            partyNo: 2,
            partyNameDetails: "Md. Shamsul Huda\nManaging Director & Mortgagor Guarantor, Road 12, Dhanmondi, Dhaka",
            caseReceivedDate: "10.02.2024",
            searchListEntry: "SL-2024/09",
          },
        ],
        specialNotes: {
          wokalatnamaNote: "Original executed Wokalatnama received from NRB Bank SAMD on 15.02.2024 and filed before the Hon'ble High Court on 20.02.2024.",
          mainPetitionNote: "Opposite party filed Writ Petition suppressing material facts of the Artha Rin proceedings.",
          extensionNote: "Ad-interim stay granted for 3 months on 02.03.2024. Application for vacating stay order moved by Advocate Asmual.",
          generalRemarks: "Borrower default amount BDT 14.50 Crore. Bank instructions: Move for vacating stay order immediately.",
        },
        assignedAdvocate: {
          advocateId: asmual._id,
          advocateName: asmual.name,
          dateAssigned: "12.02.2024",
          internalRemarks: "Senior Lawyer note: Prepare application for vacating stay order with certified copy of mortgage deed and title deed search.",
        },
        statusUpdates: [
          {
            updateDate: "20.02.2024",
            statusRemarks: "Wokalatnama filed and appearance entered by Advocate Asmual on behalf of Respondent No. 3 (NRB Bank PLC).",
            courtName: "High Court Division, Annex 14",
            enteredBy: asmual.name,
            createdAt: new Date("2024-02-20T10:00:00Z"),
          },
          {
            updateDate: "02.03.2024",
            statusRemarks: "Rule Nisi issued with 3 months ad-interim stay of auction notice subject to 15% cash deposit within 30 days.",
            orderDetails: "Petitioners directed to deposit 15% within 30 days failing which stay stands vacated.",
            nextHearingDate: "15.06.2024",
            courtName: "High Court Division, Annex 14",
            enteredBy: asmual.name,
            createdAt: new Date("2024-03-02T11:30:00Z"),
          },
          {
            updateDate: "15.06.2024",
            statusRemarks: "Affidavit-in-opposition filed by Advocate Asmual showing borrower failed to deposit 15%. Vacation application moved.",
            orderDetails: "Court directed matter to appear for hearing on peremptory list.",
            nextHearingDate: "24.10.2026",
            courtName: "High Court Division, Annex 14",
            enteredBy: asmual.name,
            createdAt: new Date("2024-06-15T12:00:00Z"),
          },
        ],
        status: "running",
      },

      // Case 2: BRAC Bank PLC - High Court Writ Petition on Auction Notification
      {
        chamberFileNo: "CF-2024/002",
        institutionId: brac._id,
        institutionName: brac.name,
        matter: "High Court Writ Petition & Title Security Injunction",
        branch: "Special Assets Management, Gulshan-Tejgaon",
        focalPerson: brac.focalPerson,
        caseNumbers: [
          {
            caseNumber: "Writ Petition No. 7190/2024",
            caseType: "Writ Petition",
            year: "2024",
            courtDivision: "High Court Division (Bench 07)",
            remarks: "Challenging paper publication of tender auction notice dated 14.03.2024",
          },
          {
            caseNumber: "C.P.L.A. No. 312/2024",
            caseType: "Civil Petition",
            year: "2024",
            courtDivision: "Appellate Division",
            remarks: "Chamber Judge stay on High Court interim order obtained by Advocate Asmual",
          },
        ],
        parties: [
          {
            partyNo: 1,
            partyNameDetails: "Apex Denim Mills Ltd. (Industrial Defaulter)\nPlot 14, Sector 2, DEPZ, Savar, Dhaka",
            caseReceivedDate: "18.03.2024",
            searchListEntry: "SL-2024/31",
          },
          {
            partyNo: 2,
            partyNameDetails: "Engr. Zahirul Haque\nChairman & Mortgagor Guarantor, House 22, Road 4, Sector 3, Uttara, Dhaka",
            caseReceivedDate: "18.03.2024",
            searchListEntry: "SL-2024/31",
          },
        ],
        specialNotes: {
          wokalatnamaNote: "Executed power received from BRAC Bank on 22.03.2024.",
          mainPetitionNote: "Borrower claimed restructuring facility under BRPD Circular No. 16/2023.",
          extensionNote: "Appellate Division stayed High Court ad-interim stay on 29.04.2024 upon submission of Advocate Asmual.",
          generalRemarks: "Loan exposure BDT 32.80 Crore. Secured mortgaged land 120 Decimals in Gazipur Industrial Belt.",
        },
        assignedAdvocate: {
          advocateId: asmual._id,
          advocateName: asmual.name,
          dateAssigned: "20.03.2024",
          internalRemarks: "Urgent CPLA moved before Appellate Division Chamber Judge; stay obtained in favor of bank.",
        },
        statusUpdates: [
          {
            updateDate: "25.03.2024",
            statusRemarks: "Rule issued with ad-interim order. Advocate Asmual briefed senior counsel immediately.",
            courtName: "High Court Division",
            enteredBy: asmual.name,
            createdAt: new Date("2024-03-25T09:30:00Z"),
          },
          {
            updateDate: "29.04.2024",
            statusRemarks: "Appellate Division Chamber Judge passed stay order on High Court interim direction in favor of BRAC Bank PLC.",
            orderDetails: "Operation of the High Court interim order stayed for 8 weeks.",
            nextHearingDate: "24.06.2024",
            courtName: "Appellate Division",
            enteredBy: asmual.name,
            createdAt: new Date("2024-04-29T11:00:00Z"),
          },
          {
            updateDate: "18.09.2026",
            statusRemarks: "Matter appeared in cause list for final hearing. Bank documents submitted in paper book by Advocate Asmual.",
            nextHearingDate: "12.11.2026",
            courtName: "High Court Division, Bench 07",
            enteredBy: asmual.name,
            createdAt: new Date("2026-09-18T10:15:00Z"),
          },
        ],
        status: "running",
      },

      // Case 3: City Bank PLC - Commercial Loan Recovery Decree & Execution Suit (Artha Jari)
      {
        chamberFileNo: "CF-2024/003",
        institutionId: city._id,
        institutionName: city.name,
        matter: "Commercial Loan Recovery Decree & Execution Suit (Artha Jari)",
        branch: "City Bank Center, Gulshan",
        focalPerson: city.focalPerson,
        caseNumbers: [
          {
            caseNumber: "Artha Jari Case No. 89/2023",
            caseType: "Artha Rin Suit",
            year: "2023",
            courtDivision: "Artha Rin Adalat No. 3, Dhaka",
            remarks: "Execution of decree dated 14.11.2022 for BDT 8.40 Crore",
          },
        ],
        parties: [
          {
            partyNo: 1,
            partyNameDetails: "Delta Ceramics Industries\nProprietor: Md. Kamrul Hasan, 18 Tejgaon I/A, Dhaka",
            caseReceivedDate: "05.01.2024",
            searchListEntry: "SL-2024/02",
          },
        ],
        specialNotes: {
          wokalatnamaNote: "Retained under ongoing execution retainer agreement.",
          mainPetitionNote: "Full decree amount recovered through mutual auction and pay-order deposition.",
          extensionNote: "Decree fully executed and settled.",
          generalRemarks: "Full compromise recovery of BDT 8,40,00,000/- settled into City Bank account.",
        },
        assignedAdvocate: {
          advocateId: asmual._id,
          advocateName: asmual.name,
          dateAssigned: "06.01.2024",
          internalRemarks: "Case successfully decreeded and recovered. Prepare formal disposal certificate for Bank SAMD.",
        },
        statusUpdates: [
          {
            updateDate: "12.01.2024",
            statusRemarks: "Writ of attachment issued on factory equipment and commercial properties.",
            courtName: "Artha Rin Adalat No. 3, Dhaka",
            enteredBy: asmual.name,
            createdAt: new Date("2024-01-12T10:00:00Z"),
          },
          {
            updateDate: "15.05.2024",
            statusRemarks: "Judgment Debtor deposited full outstanding decree amount of BDT 8.40 Crore through pay orders.",
            orderDetails: "Satisfaction recorded and attachment orders withdrawn.",
            courtName: "Artha Rin Adalat No. 3, Dhaka",
            enteredBy: asmual.name,
            createdAt: new Date("2024-05-15T11:45:00Z"),
          },
          {
            updateDate: "20.06.2024",
            statusRemarks: "Case disposed on full satisfaction. Certified decree copy and satisfaction order delivered to City Bank SAMD by Advocate Asmual.",
            courtName: "Artha Rin Adalat No. 3, Dhaka",
            enteredBy: asmual.name,
            createdAt: new Date("2024-06-20T12:30:00Z"),
          },
        ],
        status: "disposed",
        disposalDetails: {
          disposalDate: "20.06.2024",
          outcomeRemarks: "Full claim recovered and suit closed on satisfaction in favour of City Bank PLC.",
          decreeSummary: "BDT 8,40,00,000/- recovery decree completely satisfied through Bank pay-orders.",
        },
      },

      // Case 4: Eastern Bank PLC - Civil Revision under Section 115(1)
      {
        chamberFileNo: "CF-2024/004",
        institutionId: ebl._id,
        institutionName: ebl.name,
        matter: "Civil Revision against Interlocutory Rejection Order under Section 115(1)",
        branch: "Corporate Head Office, 100 Gulshan Avenue",
        focalPerson: ebl.focalPerson,
        caseNumbers: [
          {
            caseNumber: "Civil Revision No. 2480/2024",
            caseType: "Civil Revision",
            year: "2024",
            courtDivision: "High Court Division (Bench 21)",
            remarks: "Revision against order of Joint District Judge rejecting amendment of plaint",
          },
          {
            caseNumber: "Money Suit No. 56/2021",
            caseType: "Other",
            year: "2021",
            courtDivision: "Joint District Judge Court No. 1, Chattogram",
            remarks: "Commercial contract shipping claim for BDT 19.20 Crore",
          },
        ],
        parties: [
          {
            partyNo: 1,
            partyNameDetails: "Eastern Bank PLC (Petitioner)\nRepresented by Principal Officer Mr. Tanvir Mahmud",
            caseReceivedDate: "14.04.2024",
            searchListEntry: "SL-2024/55",
          },
          {
            partyNo: 2,
            partyNameDetails: "Oceanic Shipping Lines Ltd. & 3 Others\nAgrabad Commercial Area, Chattogram",
            caseReceivedDate: "14.04.2024",
            searchListEntry: "SL-2024/55",
          },
        ],
        specialNotes: {
          wokalatnamaNote: "Executed by EBL Chattogram Branch Manager and received on 18.04.2024.",
          mainPetitionNote: "Revisional application filed challenging erroneous rejection of plaint amendment.",
          extensionNote: "Lower court proceedings stayed for 6 months by High Court.",
          generalRemarks: "Commercial shipping guarantee dispute BDT 19.20 Crore.",
        },
        assignedAdvocate: {
          advocateId: asmual._id,
          advocateName: asmual.name,
          dateAssigned: "16.04.2024",
          internalRemarks: "Hearing preparation complete; rejoinder affidavit to be served on OP counsel.",
        },
        statusUpdates: [
          {
            updateDate: "24.04.2024",
            statusRemarks: "Civil Revision admitted. Rule issued with ad-interim stay of Money Suit No. 56/2021.",
            orderDetails: "Lower court records called for.",
            courtName: "High Court Division, Bench 21",
            enteredBy: asmual.name,
            createdAt: new Date("2024-04-24T10:00:00Z"),
          },
          {
            updateDate: "10.08.2024",
            statusRemarks: "Process server report returned served on all 4 Opposite Parties.",
            courtName: "High Court Division",
            enteredBy: asmual.name,
            createdAt: new Date("2024-08-10T11:00:00Z"),
          },
          {
            updateDate: "15.09.2026",
            statusRemarks: "Rule ready for hearing. Advocate Asmual submitted list of judicial precedents on Order VI Rule 17.",
            nextHearingDate: "05.11.2026",
            courtName: "High Court Division, Bench 21",
            enteredBy: asmual.name,
            createdAt: new Date("2026-09-15T12:00:00Z"),
          },
        ],
        status: "running",
      },

      // Case 5: Pubali Bank PLC - Criminal Misc. Petition (Section 561A Defense) & NI Act 138
      {
        chamberFileNo: "CF-2024/005",
        institutionId: pubali._id,
        institutionName: pubali.name,
        matter: "Criminal Misc. Petition (Section 561A Quashment Defense) & NI Act 138",
        branch: "Corporate Banking Wing, 26 Dilkusha C/A, Dhaka-1000",
        focalPerson: pubali.focalPerson,
        caseNumbers: [
          {
            caseNumber: "Criminal Misc. Case No. 9104/2024",
            caseType: "Criminal Miscellaneous",
            year: "2024",
            courtDivision: "High Court Division (Bench 03)",
            remarks: "Section 561A petition filed by defaulting borrower seeking quashment of trial",
          },
          {
            caseNumber: "Sessions Case No. 340/2023",
            caseType: "C.R. Case (NI Act)",
            year: "2023",
            courtDivision: "Joint Metropolitan Sessions Judge Court No. 4, Dhaka",
            remarks: "Cheque dishonour trial for BDT 6.25 Crore loan repayment",
          },
        ],
        parties: [
          {
            partyNo: 1,
            partyNameDetails: "Haji Mohammad Selim (Accused Petitioner)\nProprietor, Selim Garments & Textiles, Islampur, Dhaka",
            caseReceivedDate: "28.05.2024",
            searchListEntry: "SL-2024/76",
          },
          {
            partyNo: 2,
            partyNameDetails: "Pubali Bank PLC (Opposite Party No. 2 Complainant)\nCorporate Banking Wing, Dilkusha, Dhaka",
            caseReceivedDate: "28.05.2024",
            searchListEntry: "SL-2024/76",
          },
        ],
        specialNotes: {
          wokalatnamaNote: "Executed power received from Pubali Bank Head Office on 02.06.2024.",
          mainPetitionNote: "Accused attempted to quash proceedings claiming blank security cheque defense.",
          extensionNote: "Rule discharged with costs by High Court upon argument of Advocate Asmual.",
          generalRemarks: "Loan recovery of BDT 6,25,00,000/-. Lower court trial resumed.",
        },
        assignedAdvocate: {
          advocateId: asmual._id,
          advocateName: asmual.name,
          dateAssigned: "01.06.2024",
          internalRemarks: "Outstanding victory: 561A quashment petition successfully discharged with BDT 25,000 punitive cost on borrower.",
        },
        statusUpdates: [
          {
            updateDate: "08.06.2024",
            statusRemarks: "Advocate Asmual appeared and opposed issuance of stay. Court issued Rule without stay of trial.",
            courtName: "High Court Division, Bench 03",
            enteredBy: asmual.name,
            createdAt: new Date("2024-06-08T10:00:00Z"),
          },
          {
            updateDate: "25.07.2024",
            statusRemarks: "Final hearing held on Criminal Misc. Case. Bench accepted Bank submissions that Section 138 trial cannot be quashed on disputed facts.",
            courtName: "High Court Division, Bench 03",
            enteredBy: asmual.name,
            createdAt: new Date("2024-07-25T11:30:00Z"),
          },
          {
            updateDate: "12.08.2024",
            statusRemarks: "Judgment pronounced: Rule discharged. Trial Court directed to conclude hearing within 60 days. Certified copy sent to Pubali Bank by Advocate Asmual.",
            courtName: "High Court Division, Bench 03",
            enteredBy: asmual.name,
            createdAt: new Date("2024-08-12T12:00:00Z"),
          },
        ],
        status: "disposed",
        disposalDetails: {
          disposalDate: "12.08.2024",
          outcomeRemarks: "Quashment petition dismissed/discharged; lower court trial resumed for conviction.",
          decreeSummary: "Section 561A quashment dismissed. Joint Metropolitan Sessions Court directed to pass final judgment expeditiously.",
        },
      },
    ];

    // 4. Seed additional cases for other team members for comprehensive firm-wide testing
    const otherCases = [
      {
        chamberFileNo: "CF-2024/006",
        institutionId: ibbl._id,
        institutionName: ibbl.name,
        matter: "Murabaha Facility Default & Title Security Enforcement",
        branch: "Head Office, Dilkusha C/A, Dhaka",
        focalPerson: ibbl.focalPerson,
        caseNumbers: [
          {
            caseNumber: "Artha Rin Suit No. 512/2024",
            caseType: "Artha Rin Suit",
            year: "2024",
            courtDivision: "Artha Rin Adalat No. 2, Dhaka",
            remarks: "Claim amount BDT 21.40 Crore",
          },
        ],
        parties: [
          {
            partyNo: 1,
            partyNameDetails: "Rahman Feeds & Fisheries Ltd., Gazipur",
            caseReceivedDate: "04.05.2024",
            searchListEntry: "SL-2024/61",
          },
        ],
        specialNotes: {
          wokalatnamaNote: "Filed on 10.05.2024.",
          generalRemarks: "Mortgage verification in progress.",
        },
        assignedAdvocate: {
          advocateId: farhana._id,
          advocateName: farhana.name,
          dateAssigned: "05.05.2024",
          internalRemarks: "Associate Farhana handling initial registry filings.",
        },
        statusUpdates: [
          {
            updateDate: "12.05.2024",
            statusRemarks: "Summons served via postal department and paper publication.",
            courtName: "Artha Rin Adalat No. 2, Dhaka",
            enteredBy: farhana.name,
          },
        ],
        status: "running",
      },
      {
        chamberFileNo: "CF-2024/007",
        institutionId: dbbl._id,
        institutionName: dbbl.name,
        matter: "Civil Appeal on Mortgage Priority Decree",
        branch: "Sena Kalyan Bhaban, Motijheel",
        focalPerson: dbbl.focalPerson,
        caseNumbers: [
          {
            caseNumber: "Civil Appeal No. 78/2023",
            caseType: "Civil Appeal",
            year: "2023",
            courtDivision: "District Judge Court, Dhaka",
            remarks: "Appeal against lower court declaration",
          },
        ],
        parties: [
          {
            partyNo: 1,
            partyNameDetails: "Padma Poly Textile Mills Ltd.",
            caseReceivedDate: "12.01.2024",
            searchListEntry: "SL-2024/11",
          },
        ],
        specialNotes: {
          generalRemarks: "First charge priority established by DBBL.",
        },
        assignedAdvocate: {
          advocateId: adminUser._id,
          advocateName: adminUser.name,
          dateAssigned: "15.01.2024",
          internalRemarks: "Managing Partner oversight.",
        },
        assignedAssociate: {
          associateId: shakil._id,
          associateName: shakil.name,
          dateAssigned: "15.01.2024",
          internalRemarks: "Associate Shakil assisting with lower court records.",
        },
        statusUpdates: [
          {
            updateDate: "20.02.2024",
            statusRemarks: "Written argument submitted.",
            courtName: "District Judge Court, Dhaka",
            enteredBy: adminUser.name,
          },
        ],
        status: "running",
      },
      // Case for Advocate Kazi Tanvir Ahmed with Corporate Client: Square Pharmaceuticals
      {
        chamberFileNo: "CF-2024/008",
        institutionId: square._id,
        institutionName: square.name,
        matter: "Commercial Patent & Trademark Infringement Injunction",
        branch: "Corporate Headquarters, Uttara",
        focalPerson: square.focalPerson,
        caseNumbers: [
          {
            caseNumber: "Title Suit No. 89/2024",
            caseType: "Title Suit",
            year: "2024",
            courtDivision: "Joint District Judge Court No. 1, Dhaka",
            remarks: "Commercial trademark defense and perpetual injunction against counterfeit products",
          },
        ],
        parties: [
          {
            partyNo: 1,
            partyNameDetails: "Square Pharmaceuticals PLC (Plaintiff)\nRepresented by Chief Legal Officer",
            caseReceivedDate: "10.02.2024",
            searchListEntry: "SL-2024/88",
          },
          {
            partyNo: 2,
            partyNameDetails: "Delta Pharma Laboratories & Anr. (Defendants)",
            caseReceivedDate: "10.02.2024",
            searchListEntry: "SL-2024/89",
          },
        ],
        specialNotes: {
          wokalatnamaNote: "Corporate resolution and power of attorney filed.",
          mainPetitionNote: "Ad-interim injunction granted restraining defendant from packaging violation.",
          extensionNote: "Injunction extended till next hearing date.",
        },
        assignedAdvocate: {
          advocateId: tanvir._id,
          advocateName: tanvir.name,
          dateAssigned: "12.02.2024",
          internalRemarks: "Lead counsel: Advocate Kazi Tanvir Ahmed handling High Court & District Court proceedings.",
        },
        assignedAssociate: {
          associateId: sabrina._id,
          associateName: sabrina.name,
          dateAssigned: "12.02.2024",
          internalRemarks: "Assisting with evidentiary affidavits and certified copies.",
        },
        statusUpdates: [
          {
            updateDate: "18.03.2024",
            statusRemarks: "Court granted ad-interim temporary injunction against unauthorized brand usage.",
            courtName: "Joint District Judge Court No. 1, Dhaka",
            enteredBy: tanvir.name,
          },
        ],
        status: "stay_granted",
      },
      // Case for Advocate Mahmudul Hasan Chowdhury with Corporate Client: Beximco Group Ltd
      {
        chamberFileNo: "CF-2024/009",
        institutionId: beximco._id,
        institutionName: beximco.name,
        matter: "Syndicated Loan Restructuring & Customs Bond Dispute",
        branch: "BEXIMCO Industrial Park, Gazipur",
        focalPerson: beximco.focalPerson,
        caseNumbers: [
          {
            caseNumber: "Writ Petition No. 7412/2024",
            caseType: "Writ Petition",
            year: "2024",
            courtDivision: "High Court Division (Annex 22)",
            remarks: "Challenging National Board of Revenue regulatory assessment order",
          },
        ],
        parties: [
          {
            partyNo: 1,
            partyNameDetails: "Beximco Group Ltd (Petitioner)",
            caseReceivedDate: "20.03.2024",
            searchListEntry: "SL-2024/104",
          },
          {
            partyNo: 2,
            partyNameDetails: "Commissioner of Customs & NBR (Respondents)",
            caseReceivedDate: "20.03.2024",
            searchListEntry: "SL-2024/105",
          },
        ],
        specialNotes: {
          wokalatnamaNote: "Filed in High Court registry on 25.03.2024.",
          mainPetitionNote: "Rule Nisi issued with directions upon respondents.",
          generalRemarks: "Chamber managing High Court writ portfolio.",
        },
        assignedAdvocate: {
          advocateId: mahmudul._id,
          advocateName: mahmudul.name,
          dateAssigned: "22.03.2024",
          internalRemarks: "Advocate Mahmudul Hasan Chowdhury leading writ bench arguments.",
        },
        assignedAssociate: {
          associateId: tariqul._id,
          associateName: tariqul.name,
          dateAssigned: "22.03.2024",
          internalRemarks: "Research associate Tariqul compiling precedent judgments.",
        },
        statusUpdates: [
          {
            updateDate: "05.04.2024",
            statusRemarks: "Rule Nisi issued calling upon NBR to explain legality of assessment.",
            courtName: "High Court Division, Bench 22",
            enteredBy: mahmudul.name,
          },
        ],
        status: "running",
      },
      // Case for Advocate Nusrat Jahan Rimi with Individual Litigant: Dr. Tahmina Akter
      {
        chamberFileNo: "CF-2024/010",
        institutionId: indTahmina._id,
        institutionName: indTahmina.name,
        matter: "Service Seniority & Higher Education Promotion Writ",
        branch: "Dhanmondi, Dhaka",
        focalPerson: indTahmina.focalPerson,
        caseNumbers: [
          {
            caseNumber: "Writ Petition No. 3310/2024",
            caseType: "Writ Petition",
            year: "2024",
            courtDivision: "High Court Division (Annex 07)",
            remarks: "Constitutional writ petition under Article 102 for academic seniority restoration",
          },
        ],
        parties: [
          {
            partyNo: 1,
            partyNameDetails: "Dr. Tahmina Akter (Petitioner)\nAssociate Professor, Dhaka",
            caseReceivedDate: "15.01.2024",
            searchListEntry: "SL-2024/12",
          },
          {
            partyNo: 2,
            partyNameDetails: "Ministry of Education & Vice Chancellor (Respondents)",
            caseReceivedDate: "15.01.2024",
            searchListEntry: "SL-2024/13",
          },
        ],
        specialNotes: {
          wokalatnamaNote: "Wokalatnama executed on 18.01.2024.",
          mainPetitionNote: "Grounds of violation of fundamental rights under Article 27 & 31.",
        },
        assignedAdvocate: {
          advocateId: nusrat._id,
          advocateName: nusrat.name,
          dateAssigned: "18.01.2024",
          internalRemarks: "Advocate Nusrat Jahan Rimi in charge of constitutional and service jurisprudence matters.",
        },
        assignedAssociate: {
          associateId: sabrina._id,
          associateName: sabrina.name,
          dateAssigned: "18.01.2024",
          internalRemarks: "Assisting with list of dates and synopsis preparation.",
        },
        statusUpdates: [
          {
            updateDate: "28.01.2024",
            statusRemarks: "Motion moved successfully. Rule issued upon Ministry with 4-week returnable date.",
            courtName: "High Court Division, Bench 07",
            enteredBy: nusrat.name,
          },
        ],
        status: "running",
      },
      // Case with Individual Litigant: Al-Haj Mohammad Nurul Islam
      {
        chamberFileNo: "CF-2024/011",
        institutionId: indNurul._id,
        institutionName: indNurul.name,
        matter: "Arbitration Execution & Pre-decree Property Attachment Challenge",
        branch: "Chittagong Commercial Center",
        focalPerson: indNurul.focalPerson,
        caseNumbers: [
          {
            caseNumber: "Arbitration Miscellaneous Case No. 44/2024",
            caseType: "Arbitration Matter",
            year: "2024",
            courtDivision: "District Judge Court, Chittagong",
            remarks: "Dispute arising from commercial warehouse leasing agreement",
          },
        ],
        parties: [
          {
            partyNo: 1,
            partyNameDetails: "Al-Haj Mohammad Nurul Islam (Petitioner / Claimant)",
            caseReceivedDate: "02.02.2024",
            searchListEntry: "SL-2024/22",
          },
          {
            partyNo: 2,
            partyNameDetails: "Bay Logistics Shipping Co. Ltd. (Opposite Party)",
            caseReceivedDate: "02.02.2024",
            searchListEntry: "SL-2024/23",
          },
        ],
        specialNotes: {
          wokalatnamaNote: "Executed and verified through Chittagong Bar Association.",
          generalRemarks: "Settlement arbitration scheduled for mediation.",
        },
        assignedAdvocate: {
          advocateId: asmual._id,
          advocateName: asmual.name,
          dateAssigned: "05.02.2024",
          internalRemarks: "Senior Advocate Asmual representing claimant in arbitration settlement.",
        },
        assignedAssociate: {
          associateId: shakil._id,
          associateName: shakil.name,
          dateAssigned: "05.02.2024",
          internalRemarks: "Associate Shakil maintaining court dates.",
        },
        statusUpdates: [
          {
            updateDate: "15.02.2024",
            statusRemarks: "Mediation process commenced with mediator appointment.",
            courtName: "Chittagong ADR Cell",
            enteredBy: asmual.name,
          },
        ],
        status: "running",
      },
    ];

    await CaseModel.insertMany([...asmualCases, ...otherCases]);

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully! Created complete chamber data with 1 Admin, 5 Advocates, 3 Associates, diverse institutions/clients, and realistic case files.",
      seeded: {
        advocateAsmualCasesCount: asmualCases.length,
        totalCasesCount: asmualCases.length + otherCases.length,
        institutionsCount: institutions.length,
        usersCount: users.length,
        demoLoginAccounts: [
          { role: "admin", name: "Barrister Rafiqul Islam", email: "admin@chamber.com", password: "password123" },
          { role: "advocate", name: "Advocate Asmual", email: "asmual@chamber.com", password: "password123" },
          { role: "advocate", name: "Advocate Farhana Kabir", email: "farhana@chamber.com", password: "password123" },
          { role: "advocate", name: "Advocate Kazi Tanvir Ahmed", email: "tanvir@chamber.com", password: "password123" },
          { role: "advocate", name: "Advocate Mahmudul Hasan Chowdhury", email: "mahmudul@chamber.com", password: "password123" },
          { role: "advocate", name: "Advocate Nusrat Jahan Rimi", email: "nusrat@chamber.com", password: "password123" },
          { role: "associate", name: "Advocate Shakil Ahmed", email: "shakil@chamber.com", password: "password123" },
          { role: "associate", name: "Advocate Sabrina Yasmin", email: "sabrina@chamber.com", password: "password123" },
          { role: "associate", name: "Advocate Tariqul Islam", email: "tariqul@chamber.com", password: "password123" },
        ],
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An unexpected error occurred during seeding";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
