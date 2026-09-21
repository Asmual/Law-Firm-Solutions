import mongoose from "mongoose";
import crypto from "crypto";

const MONGODB_URI = "mongodb+srv://Law-Firm-Solutions:kNhwX5CoMAvt7iim@asmual.4icepzp.mongodb.net/law_firm_solutions?retryWrites=true&w=majority&appName=Asmual";

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .pbkdf2Sync(password, salt, 1000, 64, "sha512")
    .toString("hex");
  return `${salt}:${hash}`;
}

// Minimal schemas for direct seeding
const UserSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    passwordHash: String,
    phone: String,
    role: String,
    chamberDesignation: String,
    barEnrollmentNo: String,
    avatarUrl: String,
    authProvider: { type: String, default: "credentials" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const InstitutionSchema = new mongoose.Schema(
  {
    name: String,
    shortCode: String,
    category: String,
    branch: String,
    address: String,
    focalPerson: {
      name: String,
      designation: String,
      phone: String,
      email: String,
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const CaseSchema = new mongoose.Schema(
  {
    chamberFileNo: { type: String, unique: true },
    institutionId: { type: mongoose.Schema.Types.ObjectId, ref: "Institution" },
    institutionName: String,
    matter: String,
    branch: String,
    focalPerson: {
      name: String,
      designation: String,
      phone: String,
      email: String,
    },
    caseNumbers: [
      {
        caseNumber: String,
        caseType: String,
        year: String,
        courtDivision: String,
        remarks: String,
      },
    ],
    parties: [
      {
        partyNo: Number,
        partyNameDetails: String,
        caseReceivedDate: String,
        searchListEntry: String,
      },
    ],
    specialNotes: {
      wokalatnamaNote: String,
      mainPetitionNote: String,
      extensionNote: String,
      generalRemarks: String,
    },
    assignedAdvocate: {
      advocateId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      advocateName: String,
      dateAssigned: String,
      internalRemarks: String,
    },
    statusUpdates: [
      {
        updateDate: String,
        statusRemarks: String,
        orderDetails: String,
        nextHearingDate: String,
        courtName: String,
        enteredBy: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
    status: {
      type: String,
      enum: ["running", "stay_granted", "adjourned", "disposed", "decreed"],
      default: "running",
    },
    disposalDetails: {
      disposalDate: String,
      outcomeRemarks: String,
      decreeSummary: String,
    },
  },
  { timestamps: true }
);

const UserModel = mongoose.models.User || mongoose.model("User", UserSchema);
const InstitutionModel = mongoose.models.Institution || mongoose.model("Institution", InstitutionSchema);
const CaseModel = mongoose.models.Case || mongoose.model("Case", CaseSchema);

async function runSeed() {
  console.log("Connecting to MongoDB Atlas...");
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to database successfully!");

  // Clean existing collections to ensure a fresh, consistent demo environment
  console.log("Cleaning old seed collections...");
  await Promise.all([
    UserModel.deleteMany({}),
    InstitutionModel.deleteMany({}),
    CaseModel.deleteMany({}),
  ]);

  const defaultPasswordHash = hashPassword("password123");

  // 1. Seed Chamber Users
  console.log("Seeding chamber users...");
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
      chamberDesignation: "Managing Partner & Senior Lawyer",
      barEnrollmentNo: "SC-4521/1998",
      isActive: true,
    },
    {
      name: "Advocate Farhana Kabir",
      email: "farhana@chamber.com",
      phone: "+8801912000003",
      passwordHash: defaultPasswordHash,
      role: "associate",
      chamberDesignation: "Associate Advocate",
      barEnrollmentNo: "DB-14251/2019",
      isActive: true,
    },
    {
      name: "Advocate Shakil Ahmed",
      email: "shakil@chamber.com",
      phone: "+8801615000004",
      passwordHash: defaultPasswordHash,
      role: "associate",
      chamberDesignation: "Junior Associate",
      barEnrollmentNo: "HC-11204/2021",
      isActive: true,
    },
    {
      name: "Nurul Amin",
      email: "viewer@chamber.com",
      phone: "+8801811000005",
      passwordHash: defaultPasswordHash,
      role: "viewer",
      chamberDesignation: "Chamber Records Clerk",
      isActive: true,
    },
  ]);

  const asmual = users[0];
  const adminUser = users[1];
  const farhana = users[2];

  // 2. Seed 15 Bangladeshi Banking Institutions
  console.log("Seeding 15 Bangladeshi banking institutions...");
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
  ]);

  const [nrb, brac, city, ebl, pubali, ibbl, dbbl] = institutions;

  // 3. Seed 5 Complete Case Files for Advocate Asmual
  console.log("Seeding 5 complete case files for Advocate Asmual...");
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

  // 4. Seed other cases for firm-wide testing
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
  ];

  await CaseModel.create([...asmualCases, ...otherCases]);

  console.log("==================================================");
  console.log("DATABASE SEED COMPLETED SUCCESSFULLY!");
  console.log(`- 5 Full Cases Assigned to: Advocate Asmual`);
  console.log(`- Total Cases: ${asmualCases.length + otherCases.length}`);
  console.log(`- Total Institutions: ${institutions.length} banks`);
  console.log(`- Total Users: ${users.length}`);
  console.log("Demo Credentials:");
  console.log("  Advocate: asmual@chamber.com / password123");
  console.log("  Admin:    admin@chamber.com / password123");
  console.log("  Associate: farhana@chamber.com / password123");
  console.log("==================================================");

  await mongoose.disconnect();
}

runSeed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
