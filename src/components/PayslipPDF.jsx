import React from "react";
import { Box } from "@mui/material";
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink, pdf } from "@react-pdf/renderer";

// PDF styles
const styles = StyleSheet.create({
    page: { padding: 30, fontSize: 12, fontFamily: "Helvetica", backgroundColor: "#f8f8f8" },
    section: { marginBottom: 12 },
    title: { fontSize: 18, marginBottom: 10, textAlign: "center", fontWeight: "bold" },
    label: { fontWeight: "bold" },
    value: { marginBottom: 6 },
});

// PDF document
export const PayslipDocument = ({ employee }) => (
    <Document>
        <Page size="A4" style={styles.page}>
            <Text style={styles.title}>Payslip</Text>

            <View style={styles.section}>
                <Text style={styles.label}>Employee Name:</Text>
                <Text style={styles.value}>{employee?.name || "N/A"}</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.label}>Period:</Text>
                <Text style={styles.value}>{employee?.period || "N/A"}</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.label}>Earnings:</Text>
                <Text style={styles.value}>{employee?.earning || "₱0.00"}</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.label}>Deduction:</Text>
                <Text style={styles.value}>{employee?.deduction || "₱0.00"}</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.label}>Net Pay:</Text>
                <Text style={styles.value}>{employee?.netpay || "₱0.00"}</Text>
            </View>
        </Page>
    </Document>
);

// Actions: Download + Email
export const PayslipActions = ({ employee }) => {
    const handleSendEmail = async () => {
        if (!employee) return alert("No employee selected");
        try {
            const blob = await pdf(<PayslipDocument employee={employee} />).toBlob();
            const formData = new FormData();
            formData.append("file", blob, `${employee.name}.pdf`);
            formData.append("email", employee.email || "test@example.com");

            // Example API
            await fetch("http://localhost:8080/api/send-payslip", { method: "POST", body: formData });
            alert("Payslip sent via email!");
        } catch (err) {
            console.error(err);
            alert("Failed to send email.");
        }
    };

    return (
        <div style={{
            display: "flex", justifyContent: "center", gap: "20px", mt: 3,
        }}>
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "flex-end",
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
                    fileName={`${employee.name}.pdf`}
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


            <Box
                onClick={handleSendEmail}
                component="button"
                sx={{
                    display: "flex-end",
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
                    "&:hover": {
                        backgroundColor: "#1f2f31",
                        transform: "translateY(-2px)",
                        boxShadow: "0 3px 10px rgba(0,0,0,0.2)",
                    },
                }}
            >
                Send to Email
            </Box>
        </div>
    );
};
