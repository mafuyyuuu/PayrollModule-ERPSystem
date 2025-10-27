import React, { useState } from "react";
import {
    Box,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Paper,
} from "@mui/material";

export default function PayoutProcessing() {
    const [open, setOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);

    // Sample data
    const employees = [
        { id: "0100001", name: "Jhervin Jimenez", earning: "₱100,000.00", deduction: "₱10,000.00", netpay: "₱90,000.00", status: "Pending" },
        { id: "0100002", name: "Jane Doe", earning: "₱80,000.00", deduction: "₱5,000.00", netpay: "₱75,000.00", status: "Pending" },
        { id: "0100003", name: "John Smith", earning: "₱70,000.00", deduction: "₱8,000.00", netpay: "₱62,000.00", status: "Pending" },
    ];

    const handleOpen = (employee) => {
        setSelectedEmployee(employee);
        setOpen(true);
    };

    const handleClose = () => setOpen(false);

    return (
        <Box sx={{ p: 4, backgroundColor: "#f4f4f4", minHeight: "100vh" }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#1F2D3D", mb: 2 }}>
                Payout Processing
            </Typography>

            {/* Employee Table */}
            <Paper sx={{ width: "100%", overflow: "hidden" }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Earning</TableCell>
                            <TableCell>Deduction</TableCell>
                            <TableCell>Net Pay</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell align="center">Action</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {employees.map((emp) => (
                            <TableRow key={emp.id}>
                                <TableCell>{emp.name}</TableCell>
                                <TableCell>{emp.earning}</TableCell>
                                <TableCell>{emp.deduction}</TableCell>
                                <TableCell>{emp.netpay}</TableCell>
                                <TableCell sx={{ color: "red" }}>{emp.status}</TableCell>
                                <TableCell align="center">
                                    <Button
                                        variant="contained"
                                        size="small"
                                        onClick={() => handleOpen(emp)}
                                        sx={{
                                            backgroundColor: "#1F2D3D",
                                            borderRadius: "8px",
                                            textTransform: "none",
                                            "&:hover": { backgroundColor: "#33475B" },
                                        }}
                                    >
                                        Generate
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Paper>

            {/* Payslip Modal */}
            <Dialog
                open={open}
                onClose={handleClose}
                PaperProps={{
                    sx: {
                        borderRadius: "20px",
                        padding: 3,
                        background: "rgba(255,255,255,0.95)",
                        width: "400px",
                    },
                }}
                BackdropProps={{
                    sx: {
                        backdropFilter: "blur(8px)",
                        backgroundColor: "rgba(31,45,61,0.6)",
                    },
                }}
            >
                <DialogTitle>
                    <Typography
                        variant="h6"
                        sx={{ fontWeight: 700, textAlign: "center", color: "#1F2D3D" }}
                    >
                        Generate Payslip
                    </Typography>
                </DialogTitle>

                <DialogContent>
                    {selectedEmployee && (
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
                            <TextField
                                label="Name"
                                value={selectedEmployee.name}
                                InputProps={{ readOnly: true }}
                                size="small"
                            />

                            <TextField
                                label="Period"
                                value="Sept. 1 - 15, 2025"
                                InputProps={{ readOnly: true }}
                                size="small"
                            />

                            <TextField
                                label="Earnings"
                                value={selectedEmployee.earning}
                                InputProps={{ readOnly: true }}
                                size="small"
                            />

                            <TextField
                                label="Deduction"
                                value={selectedEmployee.deduction}
                                InputProps={{ readOnly: true }}
                                size="small"
                            />

                            <TextField
                                label="Net Pay"
                                value={selectedEmployee.netpay}
                                InputProps={{ readOnly: true }}
                                size="small"
                            />
                        </Box>
                    )}
                </DialogContent>

                <DialogActions sx={{ justifyContent: "center", mt: 1 }}>
                    <Button
                        variant="contained"
                        sx={{
                            backgroundColor: "#1F2D3D",
                            "&:hover": { backgroundColor: "#33475B" },
                            borderRadius: "10px",
                            textTransform: "none",
                        }}
                    >
                        Send to Email
                    </Button>
                    <Button
                        variant="contained"
                        sx={{
                            backgroundColor: "#1F2D3D",
                            "&:hover": { backgroundColor: "#33475B" },
                            borderRadius: "10px",
                            textTransform: "none",
                        }}
                    >
                        Download PDF
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
