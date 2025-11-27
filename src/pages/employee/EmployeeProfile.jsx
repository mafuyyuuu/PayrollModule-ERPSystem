import { useState, useEffect } from "react";
import {
    Box,
    Typography,
    Button,
    useTheme,
    CircularProgress,
} from "@mui/material";
import banner from "../../assets/banner.jpg";
import finn from "../../assets/finn.png";
import { useUser } from "../../components/UserContext";
import ViewTextField from "../../components/ViewTextField.jsx";

export default function EmployeeProfileLayout() {
    const theme = useTheme();
    const { user } = useUser();
    const [activeTab, setActiveTab] = useState("personal");

    // State for profile data from API
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fetch profile data from employeeRoutes API
    useEffect(() => {
        const fetchProfile = async () => {
            if (! user?. employeeId) {
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(
                    `http://localhost:8080/api/employee/profile/${user.employeeId}`
                );
                if (response.ok) {
                    const data = await response.json();
                    console.log('✅ Profile data:', data);
                    setProfile(data);
                }
            } catch (error) {
                console.error('Error fetching profile:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [user?.employeeId]);

    // Show loading
    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                <CircularProgress />
            </Box>
        );
    }

    // Use profile from API, fallback to user context
    const displayData = profile || user || {};

    return (
        <Box
            display="grid"
            gridTemplateColumns={{ xs: "1fr", md: "320px 1fr" }}
            gap="30px"
            p="0 20px"
            sx={{
                height: "100%",
                "&::-webkit-scrollbar": { width: 0, height: 0 },
                scrollbarWidth: "none",
                msOverflowStyle: "none",
            }}
        >
            {/* LEFT PANEL */}
            <Box
                sx={{
                    backgroundColor:
                        theme.palette.mode === "dark"
                            ? "rgba(255, 255, 255, 0.05)"
                            : "rgba(255, 255, 255, 0.2)",
                    backdropFilter: "blur(18px)",
                    borderRadius: "20px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                    border: `1px solid ${theme.palette. divider}`,
                    transition: "all 0.3s ease",
                    "&:hover": {
                        transform: "scale(1.02)",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
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
                        display: "flex",
                        justifyContent: "center",
                        width: "100%",
                        position: "relative",
                        mt: "75px",
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
                            border: `6px solid ${
                                theme.palette.mode === "dark"
                                    ?  "rgb(35,45,47)"
                                    : "rgb(218,219,219)"
                            }`,
                            position: "relative",
                            top: "-50px",
                        }}
                    />
                </Box>

                <Box display="flex" flexDirection="column" marginTop="-30px">
                    <Typography variant="h4" sx={{ fontWeight: 600, fontFamily: "'TTHoves-Bold', sans-serif" }}>
                        {displayData.name || `${displayData.firstName || ''} ${displayData.lastName || ''}`}
                    </Typography>
                    <Typography
                        variant="body2"
                        sx={{ color: theme.palette.text.secondary, fontFamily: "'TTHoves-Regular', sans-serif" }}
                    >
                        {displayData.email}
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
                            backgroundColor:
                                activeTab === "personal"
                                    ? "rgb(166,170,178, 0.3)"
                                    : "transparent",
                            color: theme.palette.text.primary,
                            justifyContent: "flex-start",
                            paddingLeft: "43px",
                            textTransform: "none",
                            fontSize: "16px",
                            "&:hover": {
                                backgroundColor: "rgb(166,170,178)"
                            },
                        }}
                    >
                        <i className="ri-user-line" style={{ marginRight: "10px" }}></i>
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
                            backgroundColor:
                                activeTab === "employment"
                                    ? "rgb(166,170,178, 0.3)"
                                    : "transparent",
                            color: theme.palette.text. primary,
                            paddingLeft: "43px",
                            justifyContent: "flex-start",
                            textTransform: "none",
                            fontSize: "16px",
                            "&:hover": {
                                backgroundColor: "rgb(166,170,178)"
                            },
                        }}
                    >
                        <i className="ri-briefcase-line" style={{ marginRight: "10px" }}></i>
                        Employment Details
                    </Button>
                </Box>
            </Box>

            {/* RIGHT SIDE CONTENT PANEL */}
            <Box
                sx={{
                    backgroundColor:
                        theme.palette.mode === "dark"
                            ? "rgba(255, 255, 255, 0.05)"
                            : "rgba(255, 255, 255, 0.2)",
                    backdropFilter: "blur(18px)",
                    borderRadius: "20px",
                    padding: "35px",
                    border: `1px solid ${theme.palette. divider}`,
                    transition: "all 0.3s ease",
                    "&:hover": {
                        transform: "scale(1.02)",
                        boxShadow: "0 4px 20px rgba(0,0,0,0. 15)",
                    },
                }}
            >
                {activeTab === "personal" ?  (
                    <PersonalInformationForm profile={displayData} />
                ) : (
                    <EmploymentDetailsForm profile={displayData} />
                )}
            </Box>
        </Box>
    );
}

/* --------------------------- PERSONAL INFO FORM --------------------------- */

function PersonalInformationForm({ profile }) {
    const theme = useTheme();

    // Format date for display
    const formatDate = (date) => {
        if (!date) return "—";
        return new Date(date).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const personalInfoData = {
        address: profile?. address || "—",
        birthdate: formatDate(profile?.birthday),
        age: profile?.age || "—",
        sex: profile?.sex || "—",
        maritalStatus: profile?.maritalStatus || "—",
        nationality: profile?.nationality || "—",
        contactNumber: profile?.contactNumber || "—",
        emergencyContactName: profile?.emergencyContactName || "—",
        emergencyContactNumber: profile?.emergencyContactNumber || "—",
    };

    return (
        <Box>
            <Box sx={{
                overflowX: "auto",
                borderBottom: `3px solid ${theme.palette.divider}`,
                paddingBottom: "10px",
                marginBottom: 4,
            }}>
                <Typography variant="h3" sx={{ fontWeight: 900, mb: 1, fontFamily: "'TTHoves-Bold', sans-serif" }}>
                    <i className="ri-user-line" style={{ marginRight: "10px" }}></i>
                    Personal Information
                </Typography>
            </Box>

            <Box mb="20px">
                <Typography variant="h5" sx={{ fontWeight: 900, mb: 1, fontFamily: "'TTHoves-Bold', sans-serif" }}>
                    Address
                </Typography>
                <ViewTextField value={personalInfoData.address} />
            </Box>

            <Box display="grid" gridTemplateColumns={{ md: "1fr 1fr" }} gap="20px">
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 900, mb: 1, fontFamily: "'TTHoves-Bold', sans-serif" }}>
                        Birthdate
                    </Typography>
                    <ViewTextField value={personalInfoData.birthdate} />
                </Box>

                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 900, mb: 1, fontFamily: "'TTHoves-Bold', sans-serif" }}>
                        Age
                    </Typography>
                    <ViewTextField value={personalInfoData.age} />
                </Box>

                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 900, mb: 1, fontFamily: "'TTHoves-Bold', sans-serif" }}>
                        Sex
                    </Typography>
                    <ViewTextField value={personalInfoData.sex} />
                </Box>

                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 900, mb: 1, fontFamily: "'TTHoves-Bold', sans-serif" }}>
                        Marital Status
                    </Typography>
                    <ViewTextField value={personalInfoData.maritalStatus} />
                </Box>

                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 900, mb: 1, fontFamily: "'TTHoves-Bold', sans-serif" }}>
                        Nationality
                    </Typography>
                    <ViewTextField value={personalInfoData.nationality} />
                </Box>

                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 900, mb: 1, fontFamily: "'TTHoves-Bold', sans-serif" }}>
                        Contact Number
                    </Typography>
                    <ViewTextField value={personalInfoData.contactNumber} />
                </Box>
            </Box>

            <Typography sx={{ mt: 6, mb: 3, fontWeight: 300, fontFamily: "'TTHoves-Regular', sans-serif" }}>
                Emergency Contact
            </Typography>

            <Box display="grid" gridTemplateColumns={{ md: "1fr 1fr" }} gap="20px" mb="10px">
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 900, mb: 1, fontFamily: "'TTHoves-Bold', sans-serif" }}>
                        Contact Name
                    </Typography>
                    <ViewTextField value={profile?. emergencyContactName || "—"} />
                </Box>

                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 900, mb: 1, fontFamily: "'TTHoves-Bold', sans-serif" }}>
                        Contact Number
                    </Typography>
                    <ViewTextField value={profile?.emergencyContactNumber || "—"} />
                </Box>
            </Box>
        </Box>
    );
}

/* --------------------------- EMPLOYMENT DETAILS FORM --------------------------- */

function EmploymentDetailsForm({ profile }) {
    const theme = useTheme();

    // Format date for display
    const formatDate = (date) => {
        if (! date) return "—";
        return new Date(date).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const employmentDetails = {
        employmentId: profile?.employeeId || "—",
        department: profile?.department || "—",
        position: profile?.position || "—",
        employmentType: profile?.employmentType || "—",
        dateHired: formatDate(profile?.dateHired),
    };

    return (
        <Box>
            <Box sx={{
                borderBottom: `3px solid ${theme.palette.divider}`,
                paddingBottom: "10px",
                marginBottom: 4,
            }}>
                <Typography variant="h3" sx={{ fontWeight: 900, mb: 1, fontFamily: "'TTHoves-Bold', sans-serif" }}>
                    <i className="ri-briefcase-line" style={{ marginRight: "10px" }}></i>
                    Employment Details
                </Typography>
            </Box>

            <Box display="grid" gridTemplateColumns={{ md: "1fr 1fr" }} gap="20px">
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 900, mb: 1, fontFamily: "'TTHoves-Bold', sans-serif" }}>
                        Employment ID
                    </Typography>
                    <ViewTextField value={employmentDetails.employmentId} />
                </Box>

                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 900, mb: 1, fontFamily: "'TTHoves-Bold', sans-serif" }}>
                        Department
                    </Typography>
                    <ViewTextField value={employmentDetails.department} />
                </Box>

                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 900, mb: 1, fontFamily: "'TTHoves-Bold', sans-serif" }}>
                        Position
                    </Typography>
                    <ViewTextField value={employmentDetails. position} />
                </Box>

                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 900, mb: 1, fontFamily: "'TTHoves-Bold', sans-serif" }}>
                        Employment Type
                    </Typography>
                    <ViewTextField value={employmentDetails.employmentType} />
                </Box>

                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 900, mb: 1, fontFamily: "'TTHoves-Bold', sans-serif" }}>
                        Date Hired
                    </Typography>
                    <ViewTextField value={employmentDetails.dateHired} />
                </Box>

                <Box></Box>
            </Box>
        </Box>
    );
}