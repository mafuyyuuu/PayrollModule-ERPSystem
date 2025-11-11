import { Box, Typography, Button, IconButton, TextField } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { tokens } from "../../theme";
import "remixicon/fonts/remixicon.css";
import SearchBar from "../../components/SearchBar.jsx";


// Sample data for Manager Timesheet table
const PendingRequest = [
    {
        id: 1,
        requestType: "Overtime",
        Employee: "Jherwin Jimenez",
        Date: "2025-10-25",
        Amount: "P1,200.00",
        status: "● Pending",
    },
    {
        id: 2,
        requestType: "Overtime",
        Employee: "Symon Banana",
        Date: "2025-10-25",
        Amount: "P1,200.00",
        status: "● Rejected",
    },
    {
        id: 3,
        requestType: "Overtime",
        Employee: "Michael Cruz",
        Date: "2025-10-25",
        Amount: "P1,200.00",
        status: "● Approved",
    },
    {
        id: 4,
        requestType: "Overtime",
        Employee: "Michael Cruz",
        Date: "2025-10-25",
        Amount: "P1,200.00",
        status: "● Approved",
    },
    {
        id: 5,
        requestType: "Overtime",
        Employee: "Michael Cruz",
        Date: "2025-10-25",
        Amount: "P1,200.00",
        status: "● Approved",
    },
    {
        id: 6,
        requestType: "Overtime",
        Employee: "Michael Cruz",
        Date: "2025-10-25",
        Amount: "P1,200.00",
        status: "● Approved",
    },
];

const ManagerPendingRequest = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    return (

        <Box mb="20px" mr="20px" ml="20px" >

            {/* FILTER BAR */}
            <Box
                display= "flex"
                justifyContent= "space-between"
                alignItems = "center"
                mb = {2}
                gap = "10px"
            >
                {/* HEADER */}
                <Typography
                    Color="#172224"
                    fontSize="20px"
                    sx={{
                        fontFamily: "TTHoves-Bold, sans-serif",}}>
                    Pending Request
                </Typography>
                <Box display="flex"
                     justifyContent="flex-end"
                     justifySelf="end"
                     gap="15px">
                    <Box sx={{ position: "relative" }}>
                        <select
                            defaultValue=""
                            style={{
                                height: "45px",
                                appearance: "none",
                                WebkitAppearance: "none",
                                MozAppearance: "none",
                                width: "auto",
                                padding: "10px 40px 10px 12px",
                                borderRadius: "20px",
                                border: "1px solid rgba(255, 255, 255, 0.4)",
                                background: "rgba(255, 255, 255, 0.2)",
                                backdropFilter: "blur(12px)",
                                color: "#222",
                                fontFamily: "inherit",
                                fontSize: "16px",
                                cursor: "pointer",
                                outline: "none",
                            }}
                        >
                            <option value="">Filter</option>
                        </select>
                        <i
                            class="ri-arrow-drop-down-fill"
                            style={{
                                position: "absolute",
                                right: "10px",
                                top: "50%",
                                transform: "translateY(-50%)",
                                pointerEvents: "none",
                                color: "#222",
                                fontSize: "32px",
                            }}
                        ></i>
                    </Box>

                    <SearchBar
                        placeholder="Enter Employee Name"
                        width="450px"

                    />
                </Box>

            </Box>

            {/* TABLE CONTAINER */}
            <Box
                backgroundColor="rgba(255, 255, 255, 0.2)"
                borderRadius="12px"
                p="20px"
                paddingBottom="90px"
                sx={{
                    maxHeight: "600px",
                    backdropFilter: "blur(12px)",
                    fontFamily: "'TTHoves-Regular', sans-serif",
                    boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.2)",
                    border: "1px solid rgba(255, 255, 255, 0.4)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                        transform: "scale(1.02)",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                    },
                }}
            >
                {/* HEADER ROW */}
                <Box
                    display="grid"
                    gridTemplateColumns="repeat(6, 1fr)"
                    alignItems="center"
                    fontWeight="600"
                    columnGap="120px"
                    color="#333"
                    p="12px 16px"
                    sx={{
                        borderBottom: "1px solid #ddd",
                        fontFamily: "TTHoves-Bold, sans-serif",
                    }}
                >
                    <Typography Color="#172224" fontWeight={600} sx={{ fontFamily: "'TTHoves-Bold', sans-serif", }}>
                        Request Type
                    </Typography>
                    <Typography Color="#172224" fontWeight={600} sx={{ fontFamily: "'TTHoves-Bold', sans-serif" }}>
                        Employee
                    </Typography>
                    <Typography Color="#172224" fontWeight={600} sx={{ fontFamily: "'TTHoves-Bold', sans-serif" }}>
                        Date
                    </Typography>
                    <Typography Color="#172224" fontWeight={600} sx={{ fontFamily: "'TTHoves-Bold', sans-serif" }}>
                        Amount
                    </Typography>
                    <Typography Color="#172224" fontWeight={600} sx={{ fontFamily: "'TTHoves-Bold', sans-serif" }}>
                        Status
                    </Typography>
                    <Typography
                        Color="#172224"
                        sx={{ fontFamily: "'TTHoves-Bold', sans-serif" }}
                    >
                        Action
                    </Typography>
                </Box>

                {/* DATA ROWS */}
                <Box
                    sx={{
                        overflowY: "auto",
                        maxHeight: "500px",
                        pr: "8px",
                        display: "flex",
                        flexDirection: "column",
                        mt: "5px",
                        gap: "10px",
                        height: "85%",
                    }}>
                    {PendingRequest.map((row) => (
                        <Box
                            display="grid"
                            gridTemplateColumns="repeat(6, 1fr)"
                            columnGap="130px"
                            alignItems="center"
                            p="16px"
                            mt="10px"
                            borderRadius="10px"
                            backgroundColor = "rgba(255, 255, 255, 0.25)"
                            boxShadow="0 1px 4px rgba(0,0,0,0.06)"
                            sx={{
                                borderBottom: "1px solid #eee",
                                fontFamily: "'TT-Hoves Bold', sans-serif",
                                "&:hover": {
                                    backgroundColor: "rgba(255, 255, 255, 0.4)",
                                    transform: "translateY(-2px)",
                                    boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                                },
                            }}
                        >
                            <Typography sx={{ fontFamily: "'TTHoves-DemiBold', sans-serif" }}>
                                {row.requestType}
                            </Typography>
                            <Typography sx={{ fontFamily: "'TTHoves-DemiBold', sans-serif" }}>
                                {row.Employee}
                            </Typography>
                            <Typography sx={{ fontFamily: "'TTHoves-DemiBold', sans-serif" }}>
                                {row.Date}
                            </Typography>
                            <Typography sx={{ fontFamily: "'TTHoves-DemiBold', sans-serif" }}>
                                {row.Amount}
                            </Typography>
                            <Typography
                                ml="-10px"
                                sx={{
                                    fontFamily: "'TTHoves-Bold', sans-serif",
                                    color:
                                        row.status === "● Approved"
                                            ? "#4CAF50"
                                            : row.status === "● Rejected"
                                                ? "#F44336"
                                                : "#FFC107",
                                    fontWeight: 500,
                                }}
                            >
                                {row.status}
                            </Typography>
                            <Box textAlign="center" ml="-65px" display="flex" justifyContent="center" gap="8px">
                                {row.status === "● Pending" ? (
                                    <>
                                        {/*Accept Button */}
                                        <Button
                                            disableRipple
                                            sx={{
                                                backgroundColor: "#172224",
                                                color: "green",
                                                width: "40px",
                                                height: "36px",
                                                minWidth: "36px",
                                                padding: 0,
                                                borderRadius: "50%",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                transition: "all 0.2s ease",
                                                "&:hover": {
                                                    backgroundColor: "#388E3C",
                                                    color: "#fff",
                                                    transform: "translateY(-3px)",
                                                },
                                                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                                            }}
                                        >
                                            <i className="ri-check-fill" style={{ fontSize: "20px", textShadow: "0 0 1px rgba(255, 255, 255, 0.9)", transform: "scale(1.2)"}}></i>
                                        </Button>

                                        {/*Reject Button */}
                                        <Button
                                            disableRipple
                                            sx={{
                                                backgroundColor: "#172224",
                                                color: "red",
                                                width: "40px",
                                                height: "36px",
                                                minWidth: "36px",
                                                padding: 0,
                                                borderRadius: "50%",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                transition: "all 0.2s ease",
                                                "&:hover": {
                                                    backgroundColor: "#D32F2F",
                                                    color: "#fff",
                                                    transform: "translateY(-3px)",
                                                },
                                                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                                            }}
                                        >
                                            <i className="ri-close-fill" style={{ fontSize: "20px", textShadow: "0 0 1px rgba(255, 255, 255, 0.9)", transform: "scale(1.2)" }}></i>
                                        </Button>
                                    </>
                                ) : (
                                    // 👁 Default "View" Button
                                    <Button
                                        disableRipple
                                        sx={{
                                            backgroundColor: "#172224",
                                            color: "#fff",
                                            width: "40px",
                                            height: "36px",
                                            minWidth: "36px",
                                            padding: 0,
                                            borderRadius: "50%",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            transition: "all 0.2s ease",
                                            "&:hover": {
                                                backgroundColor: "#1e2d2f",
                                                transform: "translateY(-3px)",
                                            },
                                            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                                        }}
                                    >
                                        <i className="ri-eye-fill" style={{ fontSize: "18px" }}></i>
                                    </Button>
                                )}
                            </Box>

                        </Box>
                    ))}

                </Box>
            </Box>

            {/* EXPORT BUTTONS */}
            <Box display="flex" justifyContent="flex-end" gap="15px" mt="30px">
                <Button
                    variant="contained"
                    sx={{
                        height: "50px",
                        fontFamily: "'TTHoves-Bold', sans-serif",
                        color: "#fff !important",
                        backgroundColor: "#172224",
                        borderRadius: "100px",
                        px: 3,
                        textTransform: "none",
                        "&:hover": {
                            backgroundColor: "#1E293B",
                            transform: "scale(1.03)",
                            boxShadow: "0 4px 20px rgba(0,0,0,0.15)"},
                    }}
                >
                    Export Payslip PDF
                </Button>
                <Button
                    variant="contained"
                    sx={{
                        fontFamily: "'TTHoves-Bold', sans-serif",
                        color: "#fff !important",
                        height: "50px",
                        backgroundColor: "#172224",
                        borderRadius: "100px",
                        px: 3,
                        textTransform: "none",
                        "&:hover": {
                            backgroundColor: "#1E293B",
                            transform: "scale(1.03)",
                            boxShadow: "0 4px 20px rgba(0,0,0,0.15)"},
                    }}
                >
                    Export CSV
                </Button>
            </Box>
        </Box>
    );
};

export default ManagerPendingRequest;
