import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';

export const generatePDFReport = async (records, filters) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const chunks = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Header
      doc.fontSize(20).text('Attendance Report', { align: 'center' });
      doc.moveDown();

      if (filters.startDate || filters.endDate) {
        doc.fontSize(12).text(
          `Period: ${filters.startDate || 'N/A'} to ${filters.endDate || 'N/A'}`,
          { align: 'center' }
        );
        doc.moveDown();
      }

      // Table header
      const tableTop = doc.y;
      doc.fontSize(10);
      doc.text('Student Name', 50, tableTop);
      doc.text('Course', 200, tableTop);
      doc.text('Class', 300, tableTop);
      doc.text('Date', 400, tableTop);
      doc.text('Status', 500, tableTop);
      doc.moveDown();

      // Table rows
      let y = doc.y;
      records.forEach((record, index) => {
        if (y > 700) {
          doc.addPage();
          y = 50;
        }

        doc.text(record.student.fullName || 'N/A', 50, y);
        doc.text(record.class.course.name || 'N/A', 200, y);
        doc.text(record.class.title || 'N/A', 300, y);
        doc.text(new Date(record.timestamp).toLocaleDateString(), 400, y);
        doc.text(record.status, 500, y);

        y += 20;
      });

      // Summary
      doc.addPage();
      doc.fontSize(16).text('Summary', { align: 'center' });
      doc.moveDown();

      const total = records.length;
      const present = records.filter(r => r.status === 'PRESENT').length;
      const absent = records.filter(r => r.status === 'ABSENT').length;
      const late = records.filter(r => r.status === 'LATE').length;

      doc.fontSize(12);
      doc.text(`Total Records: ${total}`);
      doc.text(`Present: ${present}`);
      doc.text(`Absent: ${absent}`);
      doc.text(`Late: ${late}`);
      doc.text(`Attendance Rate: ${total > 0 ? ((present / total) * 100).toFixed(2) : 0}%`);

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

export const generateExcelReport = async (records, filters) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Attendance Report');

  // Headers
  worksheet.columns = [
    { header: 'Student Name', key: 'studentName', width: 25 },
    { header: 'Student ID', key: 'studentId', width: 15 },
    { header: 'Email', key: 'email', width: 30 },
    { header: 'Course Code', key: 'courseCode', width: 15 },
    { header: 'Course Name', key: 'courseName', width: 30 },
    { header: 'Class Title', key: 'classTitle', width: 25 },
    { header: 'Date', key: 'date', width: 20 },
    { header: 'Time', key: 'time', width: 15 },
    { header: 'Method', key: 'method', width: 15 },
    { header: 'Status', key: 'status', width: 15 },
  ];

  // Style header row
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' },
  };

  // Add data rows
  records.forEach((record) => {
    const date = new Date(record.timestamp);
    worksheet.addRow({
      studentName: record.student.fullName,
      studentId: record.student.studentId || 'N/A',
      email: record.student.email,
      courseCode: record.class.course.code,
      courseName: record.class.course.name,
      classTitle: record.class.title,
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString(),
      method: record.method,
      status: record.status,
    });
  });

  // Add summary sheet
  const summarySheet = workbook.addWorksheet('Summary');
  summarySheet.columns = [
    { header: 'Metric', key: 'metric', width: 25 },
    { header: 'Value', key: 'value', width: 15 },
  ];

  const total = records.length;
  const present = records.filter(r => r.status === 'PRESENT').length;
  const absent = records.filter(r => r.status === 'ABSENT').length;
  const late = records.filter(r => r.status === 'LATE').length;

  summarySheet.getRow(1).font = { bold: true };
  summarySheet.addRow({ metric: 'Total Records', value: total });
  summarySheet.addRow({ metric: 'Present', value: present });
  summarySheet.addRow({ metric: 'Absent', value: absent });
  summarySheet.addRow({ metric: 'Late', value: late });
  summarySheet.addRow({
    metric: 'Attendance Rate',
    value: total > 0 ? `${((present / total) * 100).toFixed(2)}%` : '0%',
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
};

export const getAnalyticsData = async ({ courseId, studentId, startDate, endDate }) => {
  // This would typically query the database
  // For now, return a structure that the frontend can use
  return {
    daily: [],
    weekly: [],
    monthly: [],
    byMethod: {},
    byCourse: {},
  };
};

