import { Box, Typography, Divider, Button } from "@mui/material";
import { useUser } from "../../components/UserContext.jsx";
import "remixicon/fonts/remixicon.css";

export default function EmployeeProfile() {
    const { user } = useUser();

    const mainInfo = [
        { label: "Birthdate", value: user.birthday },
        { label: "Age", value: user.age },
        { label: "Sex", value: user.sex },
        { label: "Marital Status", value: user.maritalStatus },
        { label: "Nationality", value: user.nationality },
        { label: "Address", value: user.address },
    ];

    const contactInfo = [
        { label: "Contact Number", value: user.contactNumber },
    ];

    const emergencyContactInfo = [
        { label: "Contact Name", value: user.emergencyContactName },
        { label: "Contact Number", value: user.emergencyContactNumber },
        { label: "Relationship", value: user.emergencyContactRelation },
    ];

    const employmentInfo = [
        { label: "Employee ID", value: user.employeeId },
        { label: "Department", value: user.department },
        { label: "Position", value: user.position },
        { label: "Employment Status", value: user.employmentStatus },
        { label: "Date Hired", value: user.dateHired },
    ];

    return (
        <Box
            width="100%"
            height="100%"
            display="flex"
            justifyContent="center"
            alignItems="flex-start"
            gap={4}
            sx={{
                padding: "20px",
            }}
        >
            <Box
                backgroundColor="rgba(255, 255, 255, 0.2)"
                borderRadius="12px"
                color="#222"
                width="40%"
                height="100%"
                sx={{
                    backdropFilter: "blur(12px)",
                    fontFamily: "'TTHoves-Regular', sans-serif",
                    boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.2)",
                    border: "1px solid rgba(255, 255, 255, 0.4)",
                    padding: "30px",
                    transition: "all 0.3s ease",
                    "&:hover": {
                        transform: "scale(1.02)",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                    },
                }}
            >
                <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    p={2}
                    sx={{
                        backgroundColor: "#fff",
                        borderRadius: "12px",
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
                    }}
                >
                    <Box display="flex" alignItems="center" gap={2}>
                        <Box
                            sx={{
                                width: 120,
                                height: 120,
                                borderRadius: "50%",
                                backgroundColor: "#e0e0e0",
                                overflow: "hidden",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            {user?.profilePic ? (
                                <img
                                    src={user.profilePic}
                                    alt={user.name}
                                    style={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover",
                                    }}
                                />
                            ) : (
                                <i
                                    className="ri-user-fill"
                                    style={{ fontSize: "80px", color: "#666" }}
                                />
                            )}
                        </Box>

                        <Box ml="10px">
                            <Typography
                                variant="h5"
                                sx={{
                                    fontWeight: "700",
                                    fontFamily: "'TTHoves-Bold', sans-serif",
                                    fontSize: "28px",
                                    color: "#172224",
                                }}
                            >
                                {user?.name || "User Name"}
                            </Typography>
                            <Typography
                                variant="body2"
                                sx={{
                                    fontWeight: "500",
                                    fontFamily: "'TTHoves-Regular', sans-serif",
                                    fontSize: "14px",
                                    color: "#666",
                                }}
                            >
                                {user?.email || "email@example.com"}
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                <Box m={2} display="flex" flexDirection="column">
                    <Box>
                        <Typography
                            sx={{
                                color: "#172224",
                                fontSize: "30px",
                                fontFamily: "'TTHoves-Bold', sans-serif",
                            }}
                        >
                            My Profile
                        </Typography>
                    </Box>

                    <Divider sx={{ backgroundColor: "#172224", height: "2px", mt: 1, mb: 3 }} />

                    <Box display="flex" flexDirection="column" gap={3}>
                        {mainInfo.map(({ label, value }) => (
                            <Box
                                key={label}
                                display="flex"
                                justifyContent="space-between"
                                alignItems="center"
                            >
                                <Typography
                                    sx={{
                                        fontFamily: "'TTHoves-DemiBold', sans-serif",
                                        fontSize: "20px",
                                        color: "#222",
                                        flex: 1,
                                    }}
                                >
                                    {label}
                                </Typography>

                                <Box
                                    sx={{
                                        flex: 2,
                                        textAlign: "left",
                                        backgroundColor: "rgba(255, 255, 255, 0.8)",
                                        border: "1px solid rgba(0,0,0,0.1)",
                                        borderRadius: "8px",
                                        padding: "6px 8px",
                                        fontFamily: "'TTHoves-Regular', sans-serif",
                                        fontSize: "18px",
                                        color: "#222",
                                        boxShadow: "inset 0 1px 2px rgba(0,0,0,0.1)",
                                    }}
                                >
                                    {value || "-"}
                                </Box>
                            </Box>
                        ))}
                    </Box>
                </Box>
            </Box>

            {/* RIGHT SIDE: Contact + Employment Info */}
            <Box
                width="40%"
                display="flex"
                flexDirection="column"
                justifyContent="space-between"
                gap={2}
                sx={{
                    height: "100%",
                }}
            >
                {/* Contact Information Card */}
                <Box
                    backgroundColor="rgba(255, 255, 255, 0.2)"
                    borderRadius="12px"
                    color="#222"
                    sx={{
                        height: "100%",
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
                    <Box m={2} display="flex" flexDirection="column">
                        <Box
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
                        >
                            <Typography
                                sx={{
                                    color: "#172224",
                                    fontSize: "30px",
                                    fontFamily: "'TTHoves-Bold', sans-serif",
                                    mb: 1,
                                }}
                            >
                                Contact Information
                            </Typography>
                        </Box>

                        <Divider sx={{ backgroundColor: "#172224", height: "2px", mb: 1.5 }} />

                        <Box display="flex" flexDirection="column" mb={2}>
                            {contactInfo.map(({ label, value }) => (
                                <Box
                                    key={label}
                                    display="flex"
                                    justifyContent="space-between"
                                    alignItems="center"
                                >
                                    <Typography
                                        sx={{
                                            fontFamily: "'TTHoves-DemiBold', sans-serif",
                                            fontSize: "18px",
                                            color: "#222",
                                            flex: 1,
                                        }}
                                    >
                                        {label}:
                                    </Typography>

                                    <Box
                                        sx={{
                                            flex: 2,
                                            textAlign: "left",
                                            backgroundColor: "rgba(255, 255, 255, 0.8)",
                                            border: "1px solid rgba(0,0,0,0.1)",
                                            borderRadius: "8px",
                                            padding: "6px 10px",
                                            fontFamily: "'TTHoves-Regular', sans-serif",
                                            fontSize: "18px",
                                            color: "#222",
                                            boxShadow: "inset 0 1px 2px rgba(0,0,0,0.1)",
                                        }}
                                    >
                                        {value || "-"}
                                    </Box>
                                </Box>
                            ))}
                        </Box>

                        <Box display="flex" flexDirection="column" gap={0.3}>
                            <Typography
                                sx={{
                                    color: "#172224",
                                    fontSize: "20px",
                                    fontFamily: "'TTHoves-Regular', sans-serif",
                                }}
                            >
                                Emergency Contact
                            </Typography>
                            {emergencyContactInfo.map(({ label, value }) => (
                                <Box
                                    key={label}
                                    display="flex"
                                    justifyContent="space-between"
                                    alignItems="center"
                                >
                                    <Typography
                                        sx={{
                                            fontFamily: "'TTHoves-DemiBold', sans-serif",
                                            fontSize: "18px",
                                            color: "#222",
                                            flex: 1,
                                        }}
                                    >
                                        {label}
                                    </Typography>

                                    <Box
                                        sx={{
                                            flex: 2,
                                            textAlign: "left",
                                            backgroundColor: "rgba(255, 255, 255, 0.8)",
                                            border: "1px solid rgba(0,0,0,0.1)",
                                            borderRadius: "8px",
                                            padding: "6px 8px",
                                            fontFamily: "'TTHoves-Regular', sans-serif",
                                            fontSize: "18px",
                                            color: "#222",
                                            boxShadow: "inset 0 1px 2px rgba(0,0,0,0.1)",
                                        }}
                                    >
                                        {value || "-"}
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                    </Box>
                </Box>

                <Box
                    backgroundColor="rgba(255, 255, 255, 0.2)"
                    borderRadius="12px"
                    color="#222"
                    sx={{
                        height: "100%",
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
                    <Box m={2}>
                        <Typography
                            sx={{
                                color: "#172224",
                                fontSize: "30px",
                                fontFamily: "'TTHoves-Bold', sans-serif",
                                mb: 1,
                            }}
                        >
                            Employment Information
                        </Typography>

                        <Divider sx={{ backgroundColor: "#172224", height: "2px", mb: 1.5 }} />

                        <Box display="flex" flexDirection="column" gap={0.5}>
                            {employmentInfo.map(({ label, value }) => (
                                <Box
                                    key={label}
                                    display="flex"
                                    justifyContent="space-between"
                                    alignItems="center"
                                >
                                    <Typography
                                        sx={{
                                            fontFamily: "'TTHoves-DemiBold', sans-serif",
                                            fontSize: "18px",
                                            color: "#222",
                                            flex: 1,
                                        }}
                                    >
                                        {label}
                                    </Typography>

                                    <Box
                                        sx={{
                                            flex: 2,
                                            textAlign: "left",
                                            backgroundColor: "rgba(255, 255, 255, 0.8)",
                                            border: "1px solid rgba(0,0,0,0.1)",
                                            borderRadius: "8px",
                                            padding: "6px 8px",
                                            fontFamily: "'TTHoves-Regular', sans-serif",
                                            fontSize: "18px",
                                            color: "#222",
                                            boxShadow: "inset 0 1px 2px rgba(0,0,0,0.1)",
                                        }}
                                    >
                                        {value || "-"}
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}