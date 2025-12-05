import React from "react";
import { Box } from "@mui/material";
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink, pdf } from "@react-pdf/renderer";

// PDF styles
const styles = StyleSheet.create({
    page: { 
        padding: 40, 
        fontSize: 10, 
        fontFamily: "Helvetica", 
        backgroundColor: "#ffffff" 
    },
    // Header
    header: {
        borderBottomWidth: 2,
        borderBottomColor: "#1b2223",
        borderBottomStyle: "solid",
        paddingBottom: 15,
        marginBottom: 20,
    },
    companyName: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#1b2223",
    },
    companyDetails: {
        fontSize: 9,
        color: "#555555",
        marginTop: 3,
    },
    payslipLabel: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#1b2223",
        textAlign: "right",
        position: "absolute",
        right: 0,
        top: 0,
    },
    dateIssued: {
        fontSize: 9,
        color: "#555555",
        textAlign: "right",
        position: "absolute",
        right: 0,
        top: 18,
    },
    // Employee Info
    employeeSection: {
        flexDirection: "row",
        backgroundColor: "#f5f5f5",
        padding: 12,
        marginBottom: 20,
        borderRadius: 4,
    },
    employeeColumn: {
        flex: 1,
    },
    fieldLabel: {
        fontSize: 8,
        color: "#777777",
        textTransform: "uppercase",
        marginBottom: 2,
    },
    fieldValue: {
        fontSize: 10,
        color: "#1b2223",
        fontWeight: "bold",
        marginBottom: 8,
    },
    // Tables
    tableContainer: {
        flexDirection: "row",
        marginBottom: 20,
    },
    tableColumn: {
        flex: 1,
        marginRight: 10,
    },
    tableColumnLast: {
        flex: 1,
    },
    tableTitle: {
        fontSize: 11,
        fontWeight: "bold",
        color: "#1b2223",
        borderBottomWidth: 1,
        borderBottomColor: "#dddddd",
        borderBottomStyle: "solid",
        paddingBottom: 5,
        marginBottom: 8,
    },
    tableHeader: {
        flexDirection: "row",
        backgroundColor: "#1b2223",
        padding: 6,
    },
    tableHeaderCell: {
        flex: 1,
        color: "#ffffff",
        fontSize: 8,
        fontWeight: "bold",
    },
    tableHeaderCellRight: {
        flex: 1,
        color: "#ffffff",
        fontSize: 8,
        fontWeight: "bold",
        textAlign: "right",
    },
    tableRow: {
        flexDirection: "row",
        padding: 6,
        borderBottomWidth: 1,
        borderBottomColor: "#eeeeee",
        borderBottomStyle: "solid",
    },
    tableRowAlt: {
        flexDirection: "row",
        padding: 6,
        backgroundColor: "#fafafa",
        borderBottomWidth: 1,
        borderBottomColor: "#eeeeee",
        borderBottomStyle: "solid",
    },
    tableCell: {
        flex: 1,
        fontSize: 9,
        color: "#333333",
    },
    tableCellRight: {
        flex: 1,
        fontSize: 9,
        color: "#333333",
        textAlign: "right",
    },
    tableTotalRow: {
        flexDirection: "row",
        padding: 6,
        backgroundColor: "#f0f0f0",
        marginTop: 5,
    },
    tableTotalLabel: {
        flex: 1,
        fontSize: 9,
        fontWeight: "bold",
        color: "#1b2223",
    },
    tableTotalValue: {
        flex: 1,
        fontSize: 9,
        fontWeight: "bold",
        color: "#1b2223",
        textAlign: "right",
    },
    // Summary
    summarySection: {
        borderTopWidth: 2,
        borderTopColor: "#1b2223",
        borderTopStyle: "solid",
        paddingTop: 15,
        marginTop: 10,
    },
    summaryRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 5,
    },
    summaryLabel: {
        fontSize: 10,
        color: "#555555",
    },
    summaryValue: {
        fontSize: 10,
        fontWeight: "bold",
        color: "#333333",
    },
    netPayBox: {
        flexDirection: "row",
        justifyContent: "space-between",
        backgroundColor: "#1b2223",
        padding: 12,
        marginTop: 10,
        borderRadius: 4,
    },
    netPayLabel: {
        fontSize: 12,
        fontWeight: "bold",
        color: "#ffffff",
    },
    netPayValue: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#ffffff",
    },
    // Footer
    footer: {
        position: "absolute",
        bottom: 30,
        left: 40,
        right: 40,
        borderTopWidth: 1,
        borderTopColor: "#dddddd",
        borderTopStyle: "solid",
        paddingTop: 10,
    },
    footerText: {
        fontSize: 7,
        color: "#999999",
        textAlign: "center",
        marginBottom: 2,
    },
});

// Format currency with PHP
const formatPHP = (value) => {
    if (value === null || value === undefined) return "PHP 0.00";
    const num = typeof value === 'string' ? parseFloat(value.replace(/[₱PHP,\s]/g, '')) : Number(value);
    if (isNaN(num)) return "PHP 0.00";
    return `PHP ${num.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// PDF document
export const PayslipDocument = ({ employee }) => {
    const currentDate = new Date().toLocaleDateString('en-PH', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    
    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.companyName}>ECO COMPANY</Text>
                    <Text style={styles.companyDetails}>123 Business Avenue, Makati City, Metro Manila 1234, Philippines</Text>
                    <Text style={styles.companyDetails}>Tel: (02) 8123-4567 | Email: payroll@ecocompany.com</Text>
                    <Text style={styles.companyDetails}>TIN: 123-456-789-000</Text>
                    <Text style={styles.payslipLabel}>PAYSLIP</Text>
                    <Text style={styles.dateIssued}>Date Issued: {currentDate}</Text>
                </View>

                {/* Employee Information */}
                <View style={styles.employeeSection}>
                    <View style={styles.employeeColumn}>
                        <Text style={styles.fieldLabel}>Employee Name</Text>
                        <Text style={styles.fieldValue}>{employee?.name || "N/A"}</Text>
                        
                        <Text style={styles.fieldLabel}>Employee ID</Text>
                        <Text style={styles.fieldValue}>{employee?.employeeId || employee?.employee_id || "N/A"}</Text>
                        
                        <Text style={styles.fieldLabel}>Department</Text>
                        <Text style={styles.fieldValue}>{employee?.department || "N/A"}</Text>
                    </View>
                    <View style={styles.employeeColumn}>
                        <Text style={styles.fieldLabel}>Position</Text>
                        <Text style={styles.fieldValue}>{employee?.position || "N/A"}</Text>
                        
                        <Text style={styles.fieldLabel}>Pay Period</Text>
                        <Text style={styles.fieldValue}>{employee?.period || employee?.payPeriod || "N/A"}</Text>
                        
                        <Text style={styles.fieldLabel}>Payment Date</Text>
                        <Text style={styles.fieldValue}>{employee?.payDate || currentDate}</Text>
                    </View>
                </View>

                {/* Earnings & Deductions Tables */}
                <View style={styles.tableContainer}>
                    {/* Earnings */}
                    <View style={styles.tableColumn}>
                        <Text style={styles.tableTitle}>EARNINGS</Text>
                        <View style={styles.tableHeader}>
                            <Text style={styles.tableHeaderCell}>Description</Text>
                            <Text style={styles.tableHeaderCellRight}>Amount</Text>
                        </View>
                        <View style={styles.tableRow}>
                            <Text style={styles.tableCell}>Basic Salary</Text>
                            <Text style={styles.tableCellRight}>{formatPHP(employee?.basicSalary || employee?.grossPay || employee?.earning || 0)}</Text>
                        </View>
                        <View style={styles.tableRowAlt}>
                            <Text style={styles.tableCell}>Overtime Pay</Text>
                            <Text style={styles.tableCellRight}>{formatPHP(employee?.overtimePay || 0)}</Text>
                        </View>
                        <View style={styles.tableRow}>
                            <Text style={styles.tableCell}>Holiday Pay</Text>
                            <Text style={styles.tableCellRight}>{formatPHP(employee?.holidayPay || 0)}</Text>
                        </View>
                        <View style={styles.tableRowAlt}>
                            <Text style={styles.tableCell}>Allowances</Text>
                            <Text style={styles.tableCellRight}>{formatPHP(employee?.allowances || 0)}</Text>
                        </View>
                        <View style={styles.tableRow}>
                            <Text style={styles.tableCell}>Bonuses</Text>
                            <Text style={styles.tableCellRight}>{formatPHP(employee?.bonuses || 0)}</Text>
                        </View>
                        <View style={styles.tableTotalRow}>
                            <Text style={styles.tableTotalLabel}>Total Earnings</Text>
                            <Text style={styles.tableTotalValue}>{formatPHP(employee?.grossPay || employee?.earning || employee?.earningDisplay || 0)}</Text>
                        </View>
                    </View>

                    {/* Deductions */}
                    <View style={styles.tableColumnLast}>
                        <Text style={styles.tableTitle}>DEDUCTIONS</Text>
                        <View style={styles.tableHeader}>
                            <Text style={styles.tableHeaderCell}>Description</Text>
                            <Text style={styles.tableHeaderCellRight}>Amount</Text>
                        </View>
                        <View style={styles.tableRow}>
                            <Text style={styles.tableCell}>Withholding Tax</Text>
                            <Text style={styles.tableCellRight}>{formatPHP(employee?.tax || 0)}</Text>
                        </View>
                        <View style={styles.tableRowAlt}>
                            <Text style={styles.tableCell}>SSS Contribution</Text>
                            <Text style={styles.tableCellRight}>{formatPHP(employee?.sss || 0)}</Text>
                        </View>
                        <View style={styles.tableRow}>
                            <Text style={styles.tableCell}>PhilHealth</Text>
                            <Text style={styles.tableCellRight}>{formatPHP(employee?.philhealth || 0)}</Text>
                        </View>
                        <View style={styles.tableRowAlt}>
                            <Text style={styles.tableCell}>Pag-IBIG</Text>
                            <Text style={styles.tableCellRight}>{formatPHP(employee?.pagibig || 0)}</Text>
                        </View>
                        <View style={styles.tableRow}>
                            <Text style={styles.tableCell}>Other Deductions</Text>
                            <Text style={styles.tableCellRight}>{formatPHP(employee?.otherDeductions || 0)}</Text>
                        </View>
                        <View style={styles.tableTotalRow}>
                            <Text style={styles.tableTotalLabel}>Total Deductions</Text>
                            <Text style={styles.tableTotalValue}>{formatPHP(employee?.deductions || employee?.deduction || employee?.deductionDisplay || 0)}</Text>
                        </View>
                    </View>
                </View>

                {/* Net Pay Summary */}
                <View style={styles.summarySection}>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Gross Earnings</Text>
                        <Text style={styles.summaryValue}>{formatPHP(employee?.grossPay || employee?.earning || employee?.earningDisplay || 0)}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Total Deductions</Text>
                        <Text style={styles.summaryValue}>- {formatPHP(employee?.deductions || employee?.deduction || employee?.deductionDisplay || 0)}</Text>
                    </View>
                    <View style={styles.netPayBox}>
                        <Text style={styles.netPayLabel}>NET PAY</Text>
                        <Text style={styles.netPayValue}>{formatPHP(employee?.netPay || employee?.netpay || employee?.netpayDisplay || 0)}</Text>
                    </View>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>This is a computer-generated payslip. No signature required.</Text>
                    <Text style={styles.footerText}>For inquiries, please contact HR Department at hr@ecocompany.com</Text>
                    <Text style={styles.footerText}>ECO COMPANY - Empowering Growth, Enriching Lives</Text>
                </View>
            </Page>
        </Document>
    );
};

// Actions: Download only (with optional confirmation callback)
export const PayslipActions = ({ employee, onDownloadClick }) => {
    return (
        <div style={{
            display: "flex", justifyContent: "center", gap: "20px", mt: 3,
        }}>
            {onDownloadClick ? (
                <Box
                    onClick={onDownloadClick}
                    component="button"
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        fontSize: "16px",
                        backgroundColor: "#172224",
                        color: "#fff",
                        padding: "10px 0",
                        borderRadius: "15px",
                        cursor: "pointer",
                        border: "none",
                        transition: "all 0.3s ease",
                        width: "200px",
                        fontFamily: "'TTHoves-Regular', sans-serif",
                        textAlign: "center",
                        "&:hover": {
                            backgroundColor: "#1f2f31",
                            transform: "translateY(-2px)",
                            boxShadow: "0 3px 10px rgba(0,0,0,0.2)",
                        },
                    }}
                >
                    Download Payslip
                </Box>
            ) : (
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        fontSize: "16px",
                        backgroundColor: "#172224",
                        color: "#fff",
                        padding: "10px 0",
                        borderRadius: "15px",
                        cursor: "pointer",
                        border: "none",
                        transition: "all 0.3s ease",
                        width: "200px",
                        fontFamily: "'TTHoves-Regular', sans-serif",
                        textAlign: "center",
                        "&:hover": {
                            backgroundColor: "#1f2f31",
                            transform: "translateY(-2px)",
                            boxShadow: "0 3px 10px rgba(0,0,0,0.2)",
                        },
                    }}
                >
                    <PDFDownloadLink
                        document={<PayslipDocument employee={employee} />}
                        fileName={`${employee?.name || 'payslip'}_payslip.pdf`}
                        style={{
                            color: "#fff",
                            textDecoration: "none",
                            width: "100%",
                            display: "block",
                        }}
                    >
                        {({ loading }) => (loading ? "Generating PDF..." : "Download Payslip")}
                    </PDFDownloadLink>
                </Box>
            )}
        </div>
    );
};
