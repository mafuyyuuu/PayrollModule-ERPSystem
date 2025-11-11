import {Box, InputBase, Typography} from "@mui/material";
import {fontFamily} from "@mui/system";
import SearchIcon from "@mui/icons-material/Search";

export default function PayrollEmployeeRecords() {

    const employeeRecords = [
        { ID: "01XXXXX", Name: "Jhervin Jimenez", Position: "Employee" },
        { ID: "01XXXXX", Name: "Edrianne Lumabas", Position: "Admin" },
        { ID: "01XXXXX", Name: "Jumiah Zamora", Position: "Manager" },
        { ID: "01XXXXX", Name: "Jessa Balnig", Position: "Payroll" },
        { ID: "01XXXXX", Name: "Symon Banaag", Position: "Payroll" },
    ];
    return (
        <Box
            width = "100%"
            height = "70vh"
        >
            <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={3.5}
            >
                <Typography
                    variant="h5"
                    sx={{
                        fontSize: "20px",
                        fontFamily: "'TTHoves-Bold', sans-serif",
                        color: "#222",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                    }}
                >
                    Employee Records
                </Typography>

                <Box sx={{ position: "relative", mr: -100 }}>
                    <select
                        style={{
                            appearance: "none",
                            boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.2)",
                            border: "1px solid rgba(255, 255, 255, 0.4)",
                            WebkitAppearance: "none",
                            MozAppearance: "none",
                            padding: "10px 45px 10px 25px",
                            borderRadius: "25px",
                            backgroundColor: "#DADBDB",
                            color: "#222",
                            fontFamily: "'TTHoves-Regular', sans-serif",
                            fontSize: "15px",
                            cursor: "pointer",
                            outline: "none",
                        }}
                    >
                        <option value="">Position</option>
                        <option>2025</option>
                        <option>2024</option>
                        <option>2023</option>
                    </select>
                    <i
                        className="ri-arrow-down-s-fill"
                        style={{
                            position: "absolute",
                            right: "10px",
                            top: "50%",
                            paddingRight: "10px",
                            transform: "translateY(-50%)",
                            pointerEvents: "none",
                            color: "#222",
                            fontSize: "20px",
                        }}
                    ></i>
                </Box>

                <Box
                    display="flex"
                    alignItems="center"
                    bgcolor="#E1E0E0"
                    borderRadius="8px"
                    px="15px"
                    py="5px"
                    boxShadow="inset 0 1px 0 rgba(255, 255, 255, 0.2)"
                    border= "1px solid rgba(255, 255, 255, 0.4)"
                    width="450px"
                >
                    <SearchIcon
                        sx={{
                            fontSize: "1.7rem",
                            mr: 1,
                        }}
                    />
                    <InputBase
                        placeholder="Enter Employee Name"
                        sx={{
                            fontFamily: "TT Hoves Pro, sans-serif",
                            fontWeight: 300,
                            fontSize: "0.95rem",
                            width: "100%",
                            backgroundColor: "#E1E0E0",
                        }}
                    />
                </Box>
            </Box>

            <Box
                backgroundColor="rgba(255, 255, 255, 0.2)"
                borderRadius="12px"
                p="24px"
                color="#222"
                height="100%"
                sx={{
                    fontFamily: "'TTHoves-Regular', sans-serif",
                    boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.2)",
                    border: "1px solid rgba(255, 255, 255, 0.4)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                        transform: "scale(1.02)",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                    },
                    gap: "10px",
                }}
            >

                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr 1fr 1fr",
                        fontFamily: "'TTHoves-Bold', sans-serif",
                        border: "none",
                        padding: "20px",
                        fontWeight: 600,
                    }}
                >
                    <span style={{ justifySelf: "start", paddingLeft:"8px"}}>Employee ID</span>
                    <span style={{ justifySelf: "center", paddingRight:"120px" }}>Employee Name</span>
                    <span style={{ justifySelf: "center", paddingLeft:"60px" }}>Position</span>
                    <span style={{ justifySelf: "end", paddingRight:"30px" }}>Actions</span>
                </Box>

                <Box
                    sx={{
                        maxHeight: "100%",
                        overflowY: "auto",
                        pr: "8px",
                        display: "flex",
                        flexDirection: "column",
                        mt: "5px",
                        gap: "10px",
                        height: "85%",
                        scrollbarWidth: "none",
                        msOverflowStyle: "none",
                        "&::-webkit-scrollbar": {
                            width: 0,
                            height: 0,
                        },
                    }}
                >
                    {employeeRecords.map((item, index) => (
                    <Box
                        key={index}
                        sx={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr 1fr 1fr",
                            backgroundColor: "rgba(255, 255, 255, 0.25)",
                            backdropFilter: "blur(12px)",
                            borderRadius: "10px",
                            padding: "39px",
                            marginTop: "3px",
                            fontFamily: "'TTHoves-Bold', sans-serif",
                            transition: "all 0.3s ease",
                            border: "1px solid rgba(255,255,255,0.3)",
                            "&:hover": {
                                backgroundColor: "rgba(255, 255, 255, 0.4)",
                                transform: "translateY(-2px)",
                                boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                            },
                        }}
                    >
                        <span style={{ justifySelf: "start", paddingRight:"20px" }}>{item.ID}</span>
                        <span style={{ justifySelf: "center", paddingRight:"120px" }}>{item.Name}</span>
                        <span style={{ justifySelf: "center", paddingLeft:"100px" }}>{item.Position}</span>
                        <Box textAlign="end">
                            <button
                                style={{
                                    backgroundColor: "#3A4F50",
                                    color: "#fff",
                                    border: "none",
                                    padding: "6px 12px",
                                    borderRadius: "8px",
                                    cursor: "pointer",
                                    transition: "all 0.2s ease",
                                }}
                                onMouseEnter={(e) =>
                                    (e.currentTarget.style.transform = "translateY(-3px)")
                                }
                                onMouseLeave={(e) =>
                                    (e.currentTarget.style.transform = "translateY(0)")
                                }
                            >
                                <i className="ri-edit-2-fill"></i>
                            </button>
                        </Box>
                    </Box>
                    ))}
                </Box>
            </Box>
        </Box>
    );
}