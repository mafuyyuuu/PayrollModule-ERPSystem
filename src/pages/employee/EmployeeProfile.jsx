import {useState} from "react";
import {
    Box, Typography, Button, useTheme, TextField,
} from "@mui/material";
import banner from "../../assets/banner.jpg";
import finn from "../../assets/finn.png";

const personalInfoData = {
    address: "Brgy. Malinis, Quezon City",
    birthdate: "1998-03-15",
    age: "27",
    sex: "Male",
    maritalStatus: "Single",
    nationality: "Filipino",
    contactNumber: "0912-345-6789",

    emergencyContactName: "Maria Jimenez",
    emergencyContactNumber: "0999-888-7777",
};

const employmentDetails = {
    employmentId: "23-00290",
    department: "Computer Science",
    position: "Professor",
    employmentType: "Part-Time",
    dateHired: "2025-11-01",

};
const readOnlyStyle = {
    pointerEvents: "none",
    backgroundColor: "rgba(255,255,255,0.6)",
    borderRadius: "12px",
    fontFamily: "'TTHoves-Bold', sans-serif"
};

export default function EmployeeProfileLayout() {
    const theme = useTheme();
    const [activeTab, setActiveTab] = useState("personal");

    return (
        <Box
            display="grid"
            gridTemplateColumns={{ xs: "1fr", md: "minmax(0, 320px) 1fr" }}
            gap={{ xs: "20px", md: "30px" }}
            p={{ xs: "0 10px", md: "0 20px" }}
            justifyContent="center"
            sx={{
                height: "100%",
                width: "100%",
                maxWidth: "1440px",
                margin: "0 auto",
            }}
        >
            {/* LEFT PANEL */}
            <Box
                sx={{
                    backgroundColor: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(255, 255, 255, 0.2)",
                    backdropFilter: "blur(12px)",
                    borderRadius: "20px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                    border: `1px solid ${theme.palette.divider}`,
                    transition: "all 0.3s ease",
                    "&:hover": {
                        transform: "scale(1.02)", boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                    },
                }}
            >
                {/* Header Banner */}
                <Box
                    sx={{
                        width: "100%",
                        height: "110px",
                        borderRadius: "15px 15px 0 0",
                        backgroundImage: `url(${banner})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        marginBottom: "-90px",
                    }}
                />
                {/* User Image */}
                <Box
                    sx={{
                        display: "flex", justifyContent: "center", width: "100%", position: "relative", mt: "75px",
                    }}
                >
                    <Box
                        component="img"
                        src={finn}
                        alt="User"
                        sx={{
                            width: "120px",
                            height: "120px",
                            borderRadius: "50%",
                            objectFit: "cover",
                            border: `6px solid ${theme.palette.mode === "dark" ? "rgb(35,45,47)" : "rgb(218,219,219)"}`,
                            position: "relative",
                            top: "-50px",  // makes the circle overlap the header just like your screenshot
                        }}
                    />
                </Box>

                <Box display="flex" flexDirection="column" marginTop="-30px">
                    <Typography variant="h4" sx={{fontWeight: 600, fontFamily: "'TTHoves-Bold', sans-serif",}}>
                        Jherwin Jimenez
                    </Typography>
                    <Typography
                        variant="body2"
                        sx={{color: theme.palette.text.secondary, fontFamily: "'TTHoves-Regular', sans-serif",}}
                    >
                        jherwin@gmail.com
                    </Typography>
                </Box>

                <Box display="flex" flexDirection="column" width="280px" justifyItems="center" alignContent="center">
                    {/* Navigation Buttons */}
                    <Button
                        fullWidth
                        onClick={() => setActiveTab("personal")}
                        sx={{
                            fontWeight: "bold",
                            fontFamily: "'TTHoves-Bold', sans-serif",
                            mt: 4,
                            padding: "10px",
                            borderRadius: "12px",
                            backgroundColor: activeTab === "personal" ? "rgb(166,170,178, 0.3)" : "transparent",
                            color: activeTab === "personal" ? theme.palette.text.primary : theme.palette.text.primary,

                            justifyContent: "flex-start",
                            paddingLeft: "43px",
                            textTransform: "none",
                            fontSize: "16px",
                            "&:hover": {
                                backgroundColor: "rgb(166,170,178)"
                            },
                        }}
                    >
                        <i className="ri-user-line" style={{marginRight: "10px"}}></i>
                        Personal Information
                    </Button>

                    <Button
                        fullWidth
                        onClick={() => setActiveTab("employment")}
                        sx={{
                            fontWeight: "bold",
                            fontFamily: "'TTHoves-Bold', sans-serif",
                            mt: 1,
                            padding: "10px",
                            borderRadius: "12px",
                            backgroundColor: activeTab === "employment" ? "rgb(166,170,178, 0.3)" : "transparent",
                            color: activeTab === "employment" ? theme.palette.text.primary : theme.palette.text.primary,
                            paddingLeft: "43px",
                            justifyContent: "flex-start",
                            textTransform: "none",
                            fontSize: "16px",
                            "&:hover": {
                                backgroundColor: "rgb(166,170,178)"
                            },
                        }}
                    >
                        <i
                            className="ri-briefcase-line"
                            style={{marginRight: "10px"}}
                        ></i>
                        Employment Details
                    </Button>
                </Box>
            </Box>


            {/* RIGHT SIDE CONTENT PANEL */}
            <Box
                sx={{
                    backgroundColor: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(255, 255, 255, 0.2)",
                    backdropFilter: "blur(18px)",
                    borderRadius: "20px",
                    padding: "35px",
                    border: `1px solid ${theme.palette.divider}`,
                    transition: "all 0.3s ease",
                    "&:hover": {
                        transform: "scale(1.02)", boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                    },
                }}
            >
                {activeTab === "personal" ? (<PersonalInformationForm/>) : (<EmploymentDetailsForm/>)}
            </Box>
        </Box>);
}

/* --------------------------- PERSONAL INFO FORM --------------------------- */

function PersonalInformationForm() {
    const theme = useTheme();

    return (
        <Box>
            <Box sx={{
                borderBottom: `3px solid ${theme.palette.divider}`, paddingBottom: "10px", marginBottom: 4,
            }}>
                <Typography variant="h3" sx={{fontWeight: 900, mb: 1, fontFamily: "'TTHoves-Bold', sans-serif",}}>
                    <i className="ri-user-line" style={{marginRight: "10px"}}></i>
                    Personal Information
                </Typography>
            </Box>
            <Box mb="20px">
                <Typography variant="h5" sx={{fontWeight: 900, mb: 1, fontFamily: "'TTHoves-Bold', sans-serif",}}>
                    Address
                </Typography>
                <TextField
                    fullWidth
                    value={personalInfoData.address}
                    InputProps={{
                        readOnly: true, style: {
                            height: "50px",
                            borderRadius: "12px",
                            backgroundColor: "rgba(255, 255, 255, 0.6)",
                            color: "#000000",
                            pointerEvents: "none",
                            fontFamily: "TTHoves-Regular, sans-serif",
                            fontSize: "16px"
                        },
                    }}
                    sx={{
                        ...readOnlyStyle, "& .MuiOutlinedInput-root": {
                            cursor: "default", "& fieldset": {
                                borderRadius: "12px",
                            },
                        }
                    }}
                />
            </Box>

            <Box
                display="grid"
                gridTemplateColumns={{md: "1fr 1fr"}}
                gap="20px"
            >
                <Box>
                    <Typography variant="h5" sx={{fontWeight: 900, mb: 1, fontFamily: "'TTHoves-Bold', sans-serif",}}>
                        Birthdate
                    </Typography>
                    <TextField
                        fullWidth
                        value={personalInfoData.birthdate}
                        InputProps={{
                            readOnly: true, style: {
                                height: "50px",
                                borderRadius: "12px",
                                backgroundColor: "rgba(255, 255, 255, 0.6)",
                                color: "#000000",
                                pointerEvents: "none",
                                fontFamily: "TTHoves-Regular, sans-serif",
                                fontSize: "16px",
                            },
                        }}
                        sx={{
                            ...readOnlyStyle, "& .MuiOutlinedInput-root": {
                                cursor: "default", "& fieldset": {
                                    borderRadius: "12px",
                                },
                            }
                        }}
                    />
                </Box>

                <Box>
                    <Typography variant="h5" sx={{fontWeight: 900, mb: 1, fontFamily: "'TTHoves-Bold', sans-serif",}}>
                        Age
                    </Typography>
                    <TextField
                        fullWidth
                        value={personalInfoData.age}
                        InputProps={{
                            readOnly: true, style: {
                                height: "50px",
                                borderRadius: "12px",
                                backgroundColor: "rgba(255, 255, 255, 0.6)",
                                color: "#000000",
                                pointerEvents: "none",
                                fontFamily: "TTHoves-Regular, sans-serif",
                                fontSize: "16px",
                            },
                        }}
                        sx={{
                            ...readOnlyStyle, "& .MuiOutlinedInput-root": {
                                cursor: "default", "& fieldset": {
                                    borderRadius: "12px",
                                },
                            }
                        }}
                    />
                </Box>

                <Box>
                    <Typography variant="h5" sx={{fontWeight: 900, mb: 1, fontFamily: "'TTHoves-Bold', sans-serif",}}>
                        Sex
                    </Typography>
                    <TextField
                        fullWidth
                        value={personalInfoData.sex}
                        InputProps={{
                            readOnly: true, style: {
                                height: "50px",
                                borderRadius: "12px",
                                backgroundColor: "rgba(255, 255, 255, 0.6)",
                                color: "#000000",
                                pointerEvents: "none",
                                fontFamily: "TTHoves-Regular, sans-serif",
                                fontSize: "16px",
                            },
                        }}
                        sx={{
                            ...readOnlyStyle, "& .MuiOutlinedInput-root": {
                                cursor: "default", "& fieldset": {
                                    borderRadius: "12px",
                                },
                            }
                        }}
                    />
                </Box>

                <Box>
                    <Typography variant="h5" sx={{fontWeight: 900, mb: 1, fontFamily: "'TTHoves-Bold', sans-serif",}}>
                        Marital Status
                    </Typography>
                    <TextField
                        fullWidth
                        value={personalInfoData.maritalStatus}
                        InputProps={{
                            readOnly: true, style: {
                                height: "50px",
                                borderRadius: "12px",
                                backgroundColor: "rgba(255, 255, 255, 0.6)",
                                color: "#000000",
                                pointerEvents: "none",
                                fontFamily: "TTHoves-Regular, sans-serif",
                                fontSize: "16px",
                            },
                        }}
                        sx={{
                            ...readOnlyStyle, "& .MuiOutlinedInput-root": {
                                cursor: "default", "& fieldset": {
                                    borderRadius: "12px",
                                },
                            }
                        }}
                    />
                </Box>

                <Box>
                    <Typography variant="h5" sx={{fontWeight: 900, mb: 1, fontFamily: "'TTHoves-Bold', sans-serif",}}>
                        Nationality
                    </Typography>
                    <TextField
                        fullWidth
                        value={personalInfoData.nationality}
                        InputProps={{
                            readOnly: true, style: {
                                height: "50px",
                                borderRadius: "12px",
                                backgroundColor: "rgba(255, 255, 255, 0.6)",
                                color: "#000000",
                                pointerEvents: "none",
                                fontFamily: "TTHoves-Regular, sans-serif",
                                fontSize: "16px",
                            },
                        }}
                        sx={{
                            ...readOnlyStyle, "& .MuiOutlinedInput-root": {
                                cursor: "default", "& fieldset": {
                                    borderRadius: "12px",
                                },
                            }
                        }}
                    />
                </Box>

                <Box>
                    <Typography variant="h5" sx={{fontWeight: 900, mb: 1, fontFamily: "'TTHoves-Bold', sans-serif",}}>
                        Contact Number
                    </Typography>
                    <TextField
                        fullWidth
                        value={personalInfoData.contactNumber}
                        InputProps={{
                            readOnly: true, style: {
                                height: "50px",
                                backgroundColor: "rgba(255, 255, 255, 0.6)",
                                color: "#000000",
                                borderRadius: "12px",
                                pointerEvents: "none",
                                fontFamily: "TTHoves-Regular, sans-serif",
                                fontSize: "16px",
                            },
                        }}
                        sx={{
                            ...readOnlyStyle, "& .MuiOutlinedInput-root": {
                                cursor: "default", "& fieldset": {
                                    borderRadius: "12px",
                                },
                            }
                        }}
                    />
                </Box>
            </Box>

            <Typography sx={{mt: 6, mb: 3, fontWeight: 300, fontFamily: "'TTHoves-Regular', sans-serif"}}>
                Emergency Contact
            </Typography>

            <Box
                display="grid"
                gridTemplateColumns={{md: "1fr 1fr"}}
                gap="20px"
                mb="10px"
            >
                <Box>
                    <Typography variant="h5" sx={{fontWeight: 900, mb: 1, fontFamily: "'TTHoves-Bold', sans-serif",}}>
                        Contact Name
                    </Typography>
                    <TextField
                        fullWidth
                        value={personalInfoData.emergencyContactName}
                        InputProps={{
                            readOnly: true, style: {
                                height: "50px",
                                borderRadius: "12px",
                                backgroundColor: "rgba(255, 255, 255, 0.6)",
                                color: "#000000",
                                pointerEvents: "none",
                                fontFamily: "TTHoves-Regular, sans-serif",
                                fontSize: "16px",
                            },
                        }}
                        sx={readOnlyStyle}
                    />
                </Box>

                <Box>
                    <Typography variant="h5" sx={{fontWeight: 900, mb: 1, fontFamily: "'TTHoves-Bold', sans-serif",}}>
                        Contact Number
                    </Typography>
                    <TextField
                        fullWidth
                        value={personalInfoData.emergencyContactNumber}
                        InputProps={{
                            readOnly: true, style: {
                                height: "50px",
                                borderRadius: "12px",
                                backgroundColor: "rgba(255, 255, 255, 0.6)",
                                color: "#000000",
                                pointerEvents: "none",
                                fontFamily: "TTHoves-Regular, sans-serif",
                                fontSize: "16px",
                            },
                        }}
                        sx={readOnlyStyle}
                    />
                </Box>
            </Box>
        </Box>
    );
}

/* --------------------------- EMPLOYMENT DETAILS FORM --------------------------- */

function EmploymentDetailsForm() {
    const theme = useTheme();

    return (
        <Box>
            <Box sx={{
                borderBottom: `3px solid ${theme.palette.divider}`, paddingBottom: "10px", marginBottom: 4,
            }}>
                <Typography variant="h3" sx={{fontWeight: 900, mb: 1, fontFamily: "'TTHoves-Bold', sans-serif",}}>
                    <i className="ri-briefcase-line" style={{marginRight: "10px"}}></i>
                    Employment Details
                </Typography>
            </Box>

            <Box
                display="grid"
                gridTemplateColumns={{md: "1fr 1fr"}}
                gap="20px"
            >
                <Box>
                    <Typography variant="h5" sx={{fontWeight: 900, mb: 1, fontFamily: "'TTHoves-Bold', sans-serif",}}>
                        Employment ID
                    </Typography>
                    <TextField
                        fullWidth
                        value={employmentDetails.employmentId}
                        InputProps={{
                            readOnly: true, style: {
                                height: "50px",
                                borderRadius: "12px",
                                backgroundColor: "rgba(255, 255, 255, 0.6)",
                                color: "#000000",
                                pointerEvents: "none",
                                fontFamily: "TTHoves-Regular, sans-serif",
                                fontSize: "16px",
                            },
                        }}
                        sx={{
                            ...readOnlyStyle, "& .MuiOutlinedInput-root": {
                                cursor: "default", "& fieldset": {
                                    borderRadius: "12px",
                                },
                            }
                        }}
                    />
                </Box>

                <Box>
                    <Typography variant="h5" sx={{fontWeight: 900, mb: 1, fontFamily: "'TTHoves-Bold', sans-serif",}}>
                        Department
                    </Typography>
                    <TextField
                        fullWidth
                        value={employmentDetails.department}
                        InputProps={{
                            readOnly: true, style: {
                                height: "50px",
                                borderRadius: "12px",
                                backgroundColor: "rgba(255, 255, 255, 0.6)",
                                color: "#000000",
                                pointerEvents: "none",
                                fontFamily: "TTHoves-Regular, sans-serif",
                                fontSize: "16px",
                            },
                        }}
                        sx={{
                            ...readOnlyStyle, "& .MuiOutlinedInput-root": {
                                cursor: "default", "& fieldset": {
                                    borderRadius: "12px",
                                },
                            }
                        }}
                    />
                </Box>

                <Box>
                    <Typography variant="h5" sx={{fontWeight: 900, mb: 1, fontFamily: "'TTHoves-Bold', sans-serif",}}>
                        Position
                    </Typography>
                    <TextField
                        fullWidth
                        value={employmentDetails.position}
                        InputProps={{
                            readOnly: true, style: {
                                height: "50px",
                                borderRadius: "12px",
                                backgroundColor: "rgba(255, 255, 255, 0.6)",
                                color: "#000000",
                                pointerEvents: "none",
                                fontFamily: "TTHoves-Regular, sans-serif",
                                fontSize: "16px",
                            },
                        }}
                        sx={{
                            ...readOnlyStyle, "& .MuiOutlinedInput-root": {
                                cursor: "default", "& fieldset": {
                                    borderRadius: "12px",
                                },
                            }
                        }}
                    />
                </Box>

                <Box>
                    <Typography variant="h5" sx={{fontWeight: 900, mb: 1, fontFamily: "'TTHoves-Bold', sans-serif",}}>
                        Employment Type
                    </Typography>
                    <TextField
                        fullWidth
                        value={employmentDetails.employmentType}
                        InputProps={{
                            readOnly: true, style: {
                                height: "50px",
                                borderRadius: "12px",
                                backgroundColor: "rgba(255, 255, 255, 0.6)",
                                color: "#000000",
                                pointerEvents: "none",
                                fontFamily: "TTHoves-Regular, sans-serif",
                                fontSize: "16px",
                            },
                        }}
                        sx={{
                            ...readOnlyStyle, "& .MuiOutlinedInput-root": {
                                cursor: "default", "& fieldset": {
                                    borderRadius: "12px",
                                },
                            }
                        }}
                    />
                </Box>

                <Box>
                    <Typography variant="h5" sx={{fontWeight: 900, mb: 1, fontFamily: "'TTHoves-Bold', sans-serif",}}>
                        Date Hired
                    </Typography>
                    <TextField
                        fullWidth
                        value={employmentDetails.dateHired}
                        InputProps={{
                            readOnly: true, style: {
                                height: "50px",
                                borderRadius: "12px",
                                backgroundColor: "rgba(255, 255, 255, 0.6)",
                                color: "#000000",
                                pointerEvents: "none",
                                fontFamily: "TTHoves-Regular, sans-serif",
                                fontSize: "16px",
                            },
                        }}
                        sx={{
                            ...readOnlyStyle, "& .MuiOutlinedInput-root": {
                                cursor: "default", "& fieldset": {
                                    borderRadius: "12px",
                                },
                            }
                        }}
                    />
                </Box>
            </Box>
        </Box>
    );
}