/**
 * PDF Generator Utility
 * Provides functions to generate PDF documents for payslips and reports
 * 
 * Note: This is a basic implementation that creates downloadable HTML-based PDFs.
 * For production use, consider using libraries like jsPDF or pdfmake for better formatting.
 */

/**
 * Generate a payslip PDF for an employee
 * @param {Object} employeeData - Employee payroll data
 * @param {string} employeeData.name - Employee name
 * @param {string} employeeData.id - Employee ID
 * @param {string} employeeData.period - Pay period
 * @param {string} employeeData.earning - Gross earnings
 * @param {string} employeeData.deduction - Total deductions
 * @param {string} employeeData.netpay - Net pay amount
 */
export const generatePayslipPDF = (employeeData) => {
    const { name, id, period, earning, deduction, netpay } = employeeData;
    
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Payslip - ${name}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 40px;
            color: #333;
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .company-name {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .payslip-title {
            font-size: 20px;
            color: #666;
        }
        .info-section {
            margin-bottom: 30px;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #eee;
        }
        .label {
            font-weight: bold;
            width: 40%;
        }
        .value {
            width: 60%;
            text-align: right;
        }
        .summary {
            margin-top: 30px;
            padding: 20px;
            background-color: #f5f5f5;
            border-radius: 5px;
        }
        .net-pay {
            font-size: 24px;
            font-weight: bold;
            color: #2E7D32;
            text-align: center;
            margin-top: 20px;
            padding: 15px;
            background-color: #E8F5E9;
            border-radius: 5px;
        }
        .footer {
            margin-top: 50px;
            text-align: center;
            font-size: 12px;
            color: #999;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="company-name">ERP System Payroll</div>
        <div class="payslip-title">Employee Payslip</div>
    </div>
    
    <div class="info-section">
        <div class="info-row">
            <div class="label">Employee Name:</div>
            <div class="value">${name}</div>
        </div>
        <div class="info-row">
            <div class="label">Employee ID:</div>
            <div class="value">${id}</div>
        </div>
        <div class="info-row">
            <div class="label">Pay Period:</div>
            <div class="value">${period}</div>
        </div>
    </div>
    
    <div class="summary">
        <div class="info-row">
            <div class="label">Gross Earnings:</div>
            <div class="value">${earning}</div>
        </div>
        <div class="info-row">
            <div class="label">Total Deductions:</div>
            <div class="value">${deduction}</div>
        </div>
    </div>
    
    <div class="net-pay">
        Net Pay: ${netpay}
    </div>
    
    <div class="footer">
        <p>This is a computer-generated payslip. No signature required.</p>
        <p>Generated on ${new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        })}</p>
    </div>
</body>
</html>
    `;

    // Create a new window with the HTML content
    const printWindow = window.open('', '_blank');
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Trigger print dialog after content is loaded
    printWindow.onload = function() {
        printWindow.print();
    };
};

/**
 * Generate a payroll report PDF
 * @param {Array} reportData - Array of payroll report records
 * @param {string} title - Report title
 */
export const generateReportPDF = (reportData, title = 'Payroll Report') => {
    const rows = reportData.map(item => `
        <tr>
            <td>${item.date || ''}</td>
            <td>${item.period || ''}</td>
            <td>${item.amount || ''}</td>
            <td>${item.status || ''}</td>
        </tr>
    `).join('');
    
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${title}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 40px;
            color: #333;
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .company-name {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .report-title {
            font-size: 20px;
            color: #666;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
        }
        th {
            background-color: #2E7D32;
            color: white;
            font-weight: bold;
        }
        tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        .footer {
            margin-top: 50px;
            text-align: center;
            font-size: 12px;
            color: #999;
        }
        .summary {
            margin-top: 20px;
            padding: 15px;
            background-color: #f5f5f5;
            border-radius: 5px;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="company-name">ERP System Payroll</div>
        <div class="report-title">${title}</div>
    </div>
    
    <div class="summary">
        <strong>Total Records:</strong> ${reportData.length}
    </div>
    
    <table>
        <thead>
            <tr>
                <th>Date</th>
                <th>Payroll Period</th>
                <th>Total Amount</th>
                <th>Status</th>
            </tr>
        </thead>
        <tbody>
            ${rows}
        </tbody>
    </table>
    
    <div class="footer">
        <p>This is a computer-generated report.</p>
        <p>Generated on ${new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })}</p>
    </div>
</body>
</html>
    `;

    // Create a new window with the HTML content
    const printWindow = window.open('', '_blank');
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Trigger print dialog after content is loaded
    printWindow.onload = function() {
        printWindow.print();
    };
};

/**
 * Export data to CSV format
 * @param {Array} data - Array of objects to export
 * @param {string} filename - Name of the CSV file
 */
export const exportToCSV = (data, filename = 'export.csv') => {
    if (!data || data.length === 0) {
        console.warn('No data to export');
        // Using alert for user feedback as no notification system exists
        // eslint-disable-next-line no-alert
        alert('No data to export');
        return;
    }

    // Get headers from first object
    const headers = Object.keys(data[0]);
    
    // Create CSV content
    const csvContent = [
        headers.join(','),
        ...data.map(row => 
            headers.map(header => {
                const value = row[header] || '';
                // Escape commas and quotes in values
                return `"${String(value).replace(/"/g, '""')}"`;
            }).join(',')
        )
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the URL object to prevent memory leak
    URL.revokeObjectURL(url);
};
