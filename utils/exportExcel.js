const ExcelJS = require("exceljs");

const exportRegistrationsToExcel = async (registrations) => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Conference Backend";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("Registrations", {
    views: [{ state: "frozen", ySplit: 1 }], // freeze header row
  });

  sheet.columns = [
    { header: "Registration ID", key: "registrationId", width: 18 },
    { header: "Full Name", key: "fullName", width: 24 },
    { header: "Company / Organization", key: "company", width: 28 },
    { header: "Job Title", key: "jobTitle", width: 24 },
    { header: "Country", key: "country", width: 16 },
    { header: "Email", key: "email", width: 30 },
    { header: "Phone", key: "phone", width: 18 },
    { header: "Business Sector", key: "businessSector", width: 24 },
    { header: "Category", key: "registrationCategory", width: 22 },
    { header: "Areas of Interest", key: "areaOfInterest", width: 40 },
    { header: "Status", key: "status", width: 12 },
    { header: "Checked In", key: "checkedIn", width: 12 },
    { header: "Checked In At", key: "checkedInAt", width: 22 },
    { header: "Email Sent", key: "emailSent", width: 12 },
    { header: "Registered At", key: "createdAt", width: 22 },
    { header: "Notes", key: "notes", width: 30 },
  ];

  // Style header row
  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF0B1E3D" },
  };
  headerRow.alignment = { vertical: "middle", horizontal: "center" };
  headerRow.height = 22;

  // Add rows
  registrations.forEach((r) => {
    sheet.addRow({
      registrationId: r.registrationId,
      fullName: r.fullName,
      company: r.company,
      jobTitle: r.jobTitle,
      country: r.country,
      email: r.email,
      phone: r.phone,
      businessSector: r.businessSector,
      registrationCategory: r.registrationCategory,
      areaOfInterest: (r.areaOfInterest || []).join(", "),
      status: r.status,
      checkedIn: r.checkedIn ? "Yes" : "No",
      checkedInAt: r.checkedInAt
        ? new Date(r.checkedInAt).toISOString().replace("T", " ").slice(0, 19)
        : "",
      emailSent: r.emailSent ? "Yes" : "No",
      createdAt: new Date(r.createdAt)
        .toISOString()
        .replace("T", " ")
        .slice(0, 19),
      notes: r.notes || "",
    });
  });

  // Alternate row coloring + borders
  sheet.eachRow((row, index) => {
    if (index === 1) return; // skip header
    row.eachCell((cell) => {
      cell.border = {
        top: { style: "thin", color: { argb: "FFE5E7EB" } },
        left: { style: "thin", color: { argb: "FFE5E7EB" } },
        bottom: { style: "thin", color: { argb: "FFE5E7EB" } },
        right: { style: "thin", color: { argb: "FFE5E7EB" } },
      };
      if (index % 2 === 0) {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFF9FAFB" },
        };
      }
    });
  });

  sheet.autoFilter = {
    from: "A1",
    to: { row: 1, column: sheet.columns.length },
  };

  return workbook.xlsx.writeBuffer();
};

module.exports = exportRegistrationsToExcel;
