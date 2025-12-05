import React, {useState, useEffect} from "react";
import {Box, Button, IconButton, MenuItem, Select, TextField, Typography, CircularProgress} from "@mui/material";
import {RiPencilFill} from "react-icons/ri";
import ActionButton from "../../components/ActionButton.jsx";
import BoxModal from "../../components/BoxModal";
import { useTheme } from '@mui/material/styles';

export default function AdminPayrollSetup() {
    const theme = useTheme();

    const [activeTab, setActiveTab] = useState("integration");
    const [modalType, setModalType] = useState("");
    const [selectedComponent, setSelectedComponent] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [openModalState, setOpenModalState] = useState(false);
    const [showRemove, setShowRemove] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // Confirmation modals
    const [saveConfirmModalOpen, setSaveConfirmModalOpen] = useState(false);
    const [deleteConfirmModalOpen, setDeleteConfirmModalOpen] = useState(false);
    const [pendingActionType, setPendingActionType] = useState(null); // 'tax', 'component', 'integration'
    
    const [taxSettings, setTaxSettings] = useState([]);
    const [payComponents, setPayComponents] = useState([]);
    const [integrations, setIntegrations] = useState([]);
    const [selectedIntegration, setSelectedIntegration] = useState(null);

    // Fetch data from database
    useEffect(() => {
        const fetchPayrollSetup = async () => {
            try {
                // Fetch integrations from local storage or initialize defaults
                const savedIntegrations = localStorage.getItem('payroll_integrations');
                if (savedIntegrations) {
                    setIntegrations(JSON.parse(savedIntegrations));
                } else {
                    // Initialize default integrations
                    const defaultIntegrations = [
                        { id: 1, name: "Bank Transfer", icon: "ri-bank-line", description: "Direct bank transfers for payroll disbursement", status: "not_configured", config: { bankName: "", accountNumber: "", routingNumber: "" } },
                        { id: 2, name: "E-Wallet (GCash/Maya)", icon: "ri-wallet-3-line", description: "E-wallet disbursement options", status: "not_configured", config: { provider: "", apiKey: "", merchantId: "" } },
                        { id: 3, name: "HR/Employee System", icon: "ri-user-settings-line", description: "Connected to Employee Management database", status: "connected", config: { apiEndpoint: "http://localhost:8080", syncInterval: "daily" } }
                    ];
                    setIntegrations(defaultIntegrations);
                    localStorage.setItem('payroll_integrations', JSON.stringify(defaultIntegrations));
                }

                // Fetch payroll rules for pay components
                const rulesResponse = await fetch('http://localhost:8080/api/payroll/rules');
                if (rulesResponse.ok) {
                    const rules = await rulesResponse.json();
                    
                    // Separate tax-related deductions and pay components
                    const taxRules = rules.filter(r => 
                        r.type?.toLowerCase().includes('sss') ||
                        r.type?.toLowerCase().includes('philhealth') ||
                        r.type?.toLowerCase().includes('pag-ibig') ||
                        r.type?.toLowerCase().includes('pagibig') ||
                        r.type?.toLowerCase().includes('withholding') ||
                        r.type?.toLowerCase().includes('tax')
                    );
                    
                    const payComponentRules = rules.filter(r => 
                        !r.type?.toLowerCase().includes('sss') &&
                        !r.type?.toLowerCase().includes('philhealth') &&
                        !r.type?.toLowerCase().includes('pag-ibig') &&
                        !r.type?.toLowerCase().includes('pagibig') &&
                        !r.type?.toLowerCase().includes('withholding tax')
                    );
                    
                    // Transform tax settings from rules
                    if (taxRules.length > 0) {
                        setTaxSettings(taxRules.map(rule => ({
                            id: rule.id,
                            type: rule.type,
                            rate: rule.formula ? `${rule.formula}%` : (rule.fixed_amount ? `₱${rule.fixed_amount}` : 'Variable'),
                            date: rule.updated_at ? new Date(rule.updated_at).toLocaleDateString() : new Date().toLocaleDateString(),
                            description: rule.description
                        })));
                    } else {
                        // Show empty state - tax rules should be added via Configuration
                        setTaxSettings([]);
                    }
                    
                    // Transform pay components from rules
                    if (payComponentRules.length > 0) {
                        setPayComponents(payComponentRules.map(rule => ({
                            id: rule.id,
                            component: rule.type,
                            type: rule.rule_type === 'earning' ? 'Computed' : 'Deduction',
                            status: rule.active ? 'Active' : 'Inactive',
                            formula: rule.formula ? `${rule.formula}%` : (rule.fixed_amount ? `₱${rule.fixed_amount}` : rule.description || 'N/A'),
                            description: rule.description
                        })));
                    } else {
                        // Show empty state - pay components should be added
                        setPayComponents([]);
                    }
                } else {
                    throw new Error('Failed to fetch rules');
                }
            } catch (error) {
                console.error('Error fetching payroll setup:', error);
                // Show empty states on error
                setTaxSettings([]);
                setPayComponents([]);
            } finally {
                setLoading(false);
            }
        };

        fetchPayrollSetup();
    }, []);

    const openModal = (type, item = null) => {
        setModalType(type);
        setSelectedItem(item);
        setOpenModalState(true);
    };

    const handleCloseModal = () => {
        setOpenModalState(false);
        setSelectedComponent(null);
        setSelectedTaxSetting(null);
        setSelectedIntegration(null);
        setIsEditing(false);
    };

    const [selectedTaxSetting, setSelectedTaxSetting] = useState(null);
    const [saving, setSaving] = useState(false);

    // Show save confirmation
    const showSaveConfirmation = (type) => {
        setPendingActionType(type);
        setSaveConfirmModalOpen(true);
    };

    // Show delete confirmation
    const showDeleteConfirmation = (type) => {
        setPendingActionType(type);
        setDeleteConfirmModalOpen(true);
    };

    // Confirm save action
    const confirmSave = async () => {
        setSaveConfirmModalOpen(false);
        if (pendingActionType === 'tax') {
            await executeSaveTaxSetting();
        } else if (pendingActionType === 'component') {
            await executeSavePayComponent();
        } else if (pendingActionType === 'integration') {
            await executeSaveIntegration();
        }
    };

    // Confirm delete action
    const confirmDelete = async () => {
        setDeleteConfirmModalOpen(false);
        if (pendingActionType === 'component') {
            await executeDeletePayComponent();
        }
    };

    // Save Tax Setting
    const executeSaveTaxSetting = async () => {
        if (!selectedTaxSetting) return;
        
        setSaving(true);
        try {
            // Find the corresponding rule ID and update it
            const ruleId = selectedTaxSetting.id;
            const rateValue = selectedTaxSetting.rate?.replace('%', '').replace('₱', '') || '';
            
            if (ruleId) {
                // Update existing rule
                const response = await fetch(`http://localhost:8080/api/payroll/rules/${ruleId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        type: selectedTaxSetting.type,
                        formula: rateValue,
                        description: selectedTaxSetting.description || `${selectedTaxSetting.type} deduction`
                    })
                });
                
                if (response.ok) {
                    // Update local state
                    setTaxSettings(prev => prev.map(t => 
                        t.id === ruleId ? { 
                            ...selectedTaxSetting, 
                            date: new Date().toLocaleDateString() 
                        } : t
                    ));
                    handleCloseModal();
                } else {
                    alert('Failed to save tax setting');
                }
            }
        } catch (error) {
            console.error('Error saving tax setting:', error);
            alert('Error saving tax setting');
        } finally {
            setSaving(false);
        }
    };

    // Save Pay Component
    const executeSavePayComponent = async () => {
        if (!selectedComponent?.component) {
            alert('Please enter a component name');
            return;
        }
        
        setSaving(true);
        try {
            const payload = {
                type: selectedComponent.component,
                rule_type: selectedComponent.type === 'Deduction' ? 'deduction' : 'earning',
                description: selectedComponent.formula || '',
                active: selectedComponent.status === 'Active'
            };

            let response;
            if (isEditing && selectedComponent.id) {
                // Update existing
                response = await fetch(`http://localhost:8080/api/payroll/rules/${selectedComponent.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            } else {
                // Create new
                response = await fetch('http://localhost:8080/api/payroll/rules', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            }

            if (response.ok) {
                const result = await response.json();
                
                if (isEditing) {
                    setPayComponents(prev => prev.map(p => 
                        p.id === selectedComponent.id ? selectedComponent : p
                    ));
                } else {
                    setPayComponents(prev => [...prev, { 
                        ...selectedComponent, 
                        id: result.id || result.insertId 
                    }]);
                }
                handleCloseModal();
            } else {
                alert('Failed to save pay component');
            }
        } catch (error) {
            console.error('Error saving pay component:', error);
            alert('Error saving pay component');
        } finally {
            setSaving(false);
        }
    };

    // Delete Pay Component
    const executeDeletePayComponent = async () => {
        if (!selectedComponent?.id) return;
        
        setSaving(true);
        try {
            const response = await fetch(`http://localhost:8080/api/payroll/rules/${selectedComponent.id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                setPayComponents(prev => prev.filter(p => p.id !== selectedComponent.id));
                handleCloseModal();
            } else {
                alert('Failed to delete pay component');
            }
        } catch (error) {
            console.error('Error deleting pay component:', error);
            alert('Error deleting pay component');
        } finally {
            setSaving(false);
        }
    };

    // Handle Integration Click
    const handleIntegrationClick = (integration) => {
        setSelectedIntegration({...integration});
        setModalType("integration");
        setOpenModalState(true);
    };

    // Save Integration Settings
    const executeSaveIntegration = async () => {
        if (!selectedIntegration) return;
        
        setSaving(true);
        try {
            // Update local state
            const updatedIntegrations = integrations.map(int => 
                int.id === selectedIntegration.id ? selectedIntegration : int
            );
            setIntegrations(updatedIntegrations);
            
            // Save to localStorage
            localStorage.setItem('payroll_integrations', JSON.stringify(updatedIntegrations));
            
            // Log the activity
            await fetch('http://localhost:8080/api/admin/activity-logs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action_type: 'UPDATE',
                    entity_type: 'Integration',
                    description: `Updated ${selectedIntegration.name} integration settings`
                })
            }).catch(() => {});
            
            handleCloseModal();
        } catch (error) {
            console.error('Error saving integration:', error);
            alert('Error saving integration settings');
        } finally {
            setSaving(false);
        }
    };

    // Toggle Integration Status
    const handleToggleIntegrationStatus = () => {
        if (!selectedIntegration) return;
        const newStatus = selectedIntegration.status === 'connected' ? 'not_configured' : 'connected';
        setSelectedIntegration(prev => ({ ...prev, status: newStatus }));
    };

    const renderCards = () => {
        switch (activeTab) {
            case "integration":
                return (<Box
                    sx={{
                        display: "flex", flexDirection: "column", fontFamily: "'TTHoves-Regular', sans-serif",
                    }}
                >
                    <Typography sx={{ fontFamily: "'TTHoves-DemiBold', sans-serif", color: theme.palette.text.primary, fontSize: "18px", mb: 2 }}>
                        Payment Integration Settings
                    </Typography>
                    
                    {integrations.length === 0 ? (
                        <Box sx={{ p: 4, textAlign: 'center', color: theme.palette.text.secondary }}>
                            Loading integrations...
                        </Box>
                    ) : (
                    <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                        {integrations.map((integration) => (
                            <Box 
                                key={integration.id}
                                onClick={() => handleIntegrationClick(integration)}
                                sx={{
                                    flex: 1,
                                    minWidth: "250px",
                                    p: 3,
                                    backgroundColor: "#fff",
                                    borderRadius: "12px",
                                    transition: "all 0.3s ease",
                                    cursor: "pointer",
                                    "&:hover": { transform: "translateY(-2px)", boxShadow: "0 4px 15px rgba(0,0,0,0.1)" },
                                }}
                            >
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                                    <Box sx={{ width: 40, height: 40, borderRadius: "50%", bgcolor: "#172224", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                                        <i className={integration.icon} style={{ fontSize: "20px" }} />
                                    </Box>
                                    <Typography sx={{ fontFamily: "'TTHoves-DemiBold', sans-serif", fontSize: "16px", color: "#1b2223" }}>
                                        {integration.name}
                                    </Typography>
                                </Box>
                                <Typography sx={{ fontSize: "14px", color: "#666", mb: 2 }}>
                                    {integration.description}
                                </Typography>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                    <Box sx={{ 
                                        width: 8, 
                                        height: 8, 
                                        borderRadius: "50%", 
                                        bgcolor: integration.status === 'connected' ? "#28a745" : "#ffc107" 
                                    }} />
                                    <Typography sx={{ 
                                        fontSize: "14px", 
                                        color: integration.status === 'connected' ? "#28a745" : "#ffc107" 
                                    }}>
                                        {integration.status === 'connected' ? 'Connected' : 'Not Configured'}
                                    </Typography>
                                </Box>
                            </Box>
                        ))}
                    </Box>
                    )}
                    
                    <Typography sx={{ fontFamily: "'TTHoves-DemiBold', sans-serif", color: theme.palette.text.primary, fontSize: "14px", mt: 3, fontStyle: "italic" }}>
                        Click on any integration card to configure settings.
                    </Typography>
                </Box>);
            case "taxSettings":
                return (<Box
                    sx={{
                        display: "flex", flexDirection: "column", fontFamily: theme.typography.fontFamily,
                    }}
                >
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            fontFamily: "'TTHoves-DemiBold', sans-serif",
                        }}
                    >
                        <Box
                            sx={{
                                display: "grid",
                                gridTemplateColumns: "repeat(4, 1fr)",
                                color: theme.palette.text.primary,
                                fontWeight: 700,
                                p: "8px 0",
                                width: "100%",
                                alignItems: "center",
                                textAlign: "center",
                            }}
                        >
                            <span>Type</span>
                            <span>Rate</span>
                            <span>Date</span>
                            <span>Action</span>
                        </Box>
                    </Box>
                    <Box
                        sx={{
                            maxHeight: "700px",
                            overflowY: "auto",
                            "&::-webkit-scrollbar": {width: 0, height: 0},
                            scrollbarWidth: "none",
                            msOverflowStyle: "none",
                            fontFamily: "'TTHoves-DemiBold', sans-serif",
                        }}
                    >
                        {taxSettings.length === 0 ? (
                            <Box sx={{ p: 4, textAlign: 'center', color: theme.palette.text.secondary }}>
                                No tax settings found. Add tax-related rules (SSS, PhilHealth, Pag-IBIG, Withholding Tax) in the Configuration section.
                            </Box>
                        ) : (
                        taxSettings.map((item, index) => (<Box
                            key={index}
                            sx={{
                                marginTop: "10px", display: "flex", alignItems: "center", gap: "8px", mb: "12px",
                            }}
                        >
                            <Box
                                key={index}
                                sx={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(4, 1fr)",
                                    alignItems: "center",
                                    bgcolor: "#fff",
                                    color: "#1b2223",
                                    borderRadius: "8px",
                                    width: "100%",
                                    minHeight: "80px",
                                    transition: "all 0.3s ease",
                                    "&:hover": {
                                        transform: "translateY(-2px)", boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                                    },
                                    textAlign: "center",
                                }}
                            >
                                <span>{item.type}</span>
                                <span>{item.rate}</span>
                                <span>{item.date}</span>
                                <Box
                                    sx={{
                                        display: "flex", gap: "8px", justifyContent: "center",
                                    }}
                                >
                                    <IconButton
                                        onClick={() => {
                                            setSelectedTaxSetting(item);
                                            setModalType("taxSettings");
                                            setOpenModalState(true);
                                        }}
                                        sx={{
                                            backgroundColor: "#172224",
                                            color: "#fff",
                                            width: 40,
                                            height: 40,
                                            borderRadius: "50%",
                                            transition: "all 0.2s ease",
                                            "&:hover": {
                                                backgroundColor: "#2E3B3D",
                                                color: "#fff",
                                                transform: "translateY(-3px)",
                                            },
                                            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                                        }}
                                    >
                                        <RiPencilFill style={{fontSize: 19}}/>
                                    </IconButton>
                                </Box>
                            </Box>
                        </Box>))
                        )}
                    </Box>
                </Box>);
            case "payComponents":
                return (<Box
                    sx={{
                        display: "flex", flexDirection: "column", fontFamily: theme.typography.fontFamily,
                    }}
                >
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            fontFamily: "'TTHoves-DemiBold', sans-serif",
                        }}
                    >
                        <Box
                            sx={{
                                display: "grid",
                                gridTemplateColumns: "repeat(5, 1fr)",
                                color: theme.palette.text.primary,
                                fontWeight: 700,
                                p: "8px 0",
                                width: "100%",
                                alignItems: "center",
                                textAlign: "center",
                            }}
                        >
                            <span>Component</span>
                            <span>Type</span>
                            <span>Formula / Fixed Amount</span>
                            <span>Status</span>
                            <span>Action</span>
                        </Box>
                    </Box>

                    <Box
                        sx={{
                            maxHeight: "700px",
                            overflowY: "auto",
                            "&::-webkit-scrollbar": {width: 0, height: 0},
                            scrollbarWidth: "none",
                            msOverflowStyle: "none",
                            fontFamily: "'TTHoves-DemiBold', sans-serif",
                        }}
                    >
                        {payComponents.length === 0 ? (
                            <Box sx={{ p: 4, textAlign: 'center', color: theme.palette.text.secondary }}>
                                No pay components found. Click "Add Pay Component" to create one.
                            </Box>
                        ) : (
                        payComponents.map((item, index) => (<Box
                            key={index}
                            sx={{
                                marginTop: "10px", display: "flex", alignItems: "center", gap: "8px", mb: "12px",
                            }}
                        >
                            <Box
                                sx={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(5, 1fr)",
                                    alignItems: "center",
                                    bgcolor: "#fff",
                                    borderRadius: "8px",
                                    width: "100%",
                                    minHeight: "80px",
                                    transition: "all 0.3s ease",
                                    "&:hover": {
                                        transform: "translateY(-2px)", boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                                    },
                                    textAlign: "center",
                                }}
                            >
                                <span>{item.component}</span>
                                <span>{item.type}</span>
                                <span>{item.formula}</span>
                                <span>{item.status}</span>
                                <Box
                                    sx={{
                                        display: "flex", gap: "8px", justifyContent: "center",
                                    }}
                                >
                                    <IconButton
                                        onClick={() => {
                                            setSelectedComponent(item);
                                            setIsEditing(true);
                                            setModalType("payComponents");
                                            setShowRemove(true);
                                            setOpenModalState(true);
                                        }}

                                        sx={{
                                            backgroundColor: "#172224",
                                            color: "#fff",
                                            width: 40,
                                            height: 40,
                                            borderRadius: "50%",
                                            transition: "all 0.2s ease",
                                            "&:hover": {
                                                backgroundColor: "#2E3B3D",
                                                color: "#fff",
                                                transform: "translateY(-3px)",
                                            },
                                            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                                        }}
                                    >
                                        <RiPencilFill style={{fontSize: 19}}/>
                                    </IconButton>
                                </Box>
                            </Box>
                        </Box>))
                        )}
                    </Box>
                </Box>);
            default:
                return null;
        }
    };

    const renderModalContent = () => {
        switch (modalType) {
            case "integration":
                return (<Box sx={{display: "flex", flexDirection: "column", gap: 2}}>
                    <Typography
                        variant="h5"
                        sx={{
                            fontFamily: "'TTHoves-Bold', sans-serif", fontSize: "24px", color: "#FFFFFF",
                        }}
                    >
                        {selectedIntegration?.name} Settings
                    </Typography>
                    
                    <Typography
                        sx={{fontFamily: "'TTHoves-DemiBold', sans-serif", color: "#FFFFFF", fontSize: "16px"}}>
                        {selectedIntegration?.description}
                    </Typography>

                    {/* Status Toggle */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2}}>
                        <Typography sx={{ fontFamily: "'TTHoves-DemiBold', sans-serif", color: "#FFFFFF", fontSize: "16px" }}>
                            Status:
                        </Typography>
                        <Box 
                            onClick={handleToggleIntegrationStatus}
                            sx={{ 
                                display: "flex", 
                                alignItems: "center", 
                                gap: 1, 
                                cursor: "pointer",
                                backgroundColor: selectedIntegration?.status === 'connected' ? "rgba(40, 167, 69, 0.2)" : "rgba(255, 193, 7, 0.2)",
                                padding: "8px 16px",
                                borderRadius: "20px",
                                transition: "all 0.3s ease",
                                "&:hover": { opacity: 0.8 }
                            }}
                        >
                            <Box sx={{ 
                                width: 10, 
                                height: 10, 
                                borderRadius: "50%", 
                                bgcolor: selectedIntegration?.status === 'connected' ? "#28a745" : "#ffc107" 
                            }} />
                            <Typography sx={{ 
                                fontSize: "14px", 
                                color: selectedIntegration?.status === 'connected' ? "#28a745" : "#ffc107",
                                fontWeight: 600
                            }}>
                                {selectedIntegration?.status === 'connected' ? 'Connected' : 'Not Configured'}
                            </Typography>
                        </Box>
                    </Box>

                    {/* Bank Transfer Config */}
                    {selectedIntegration?.name === "Bank Transfer" && (
                        <>
                            <Box sx={{display: "flex", flexDirection: "column", gap: 1}}>
                                <Typography sx={{fontFamily: "'TTHoves-DemiBold', sans-serif", color: "#FFFFFF", fontSize: "16px"}}>
                                    Bank Name
                                </Typography>
                                <TextField
                                    placeholder="Enter bank name (e.g., BDO, BPI, Metrobank)"
                                    fullWidth
                                    value={selectedIntegration?.config?.bankName || ""}
                                    onChange={(e) => setSelectedIntegration(prev => ({
                                        ...prev, 
                                        config: { ...prev.config, bankName: e.target.value }
                                    }))}
                                    variant="outlined"
                                    size="small"
                                    sx={{
                                        "& .MuiOutlinedInput-root": {
                                            borderRadius: "13px", backgroundColor: "#cacace", color: "#1F2829", fontSize: "16px",
                                            "& fieldset": { border: "none" },
                                        },
                                    }}
                                />
                            </Box>
                            <Box sx={{display: "flex", flexDirection: "column", gap: 1}}>
                                <Typography sx={{fontFamily: "'TTHoves-DemiBold', sans-serif", color: "#FFFFFF", fontSize: "16px"}}>
                                    Account Number
                                </Typography>
                                <TextField
                                    placeholder="Enter account number"
                                    fullWidth
                                    value={selectedIntegration?.config?.accountNumber || ""}
                                    onChange={(e) => setSelectedIntegration(prev => ({
                                        ...prev, 
                                        config: { ...prev.config, accountNumber: e.target.value }
                                    }))}
                                    variant="outlined"
                                    size="small"
                                    sx={{
                                        "& .MuiOutlinedInput-root": {
                                            borderRadius: "13px", backgroundColor: "#cacace", color: "#1F2829", fontSize: "16px",
                                            "& fieldset": { border: "none" },
                                        },
                                    }}
                                />
                            </Box>
                        </>
                    )}

                    {/* E-Wallet Config */}
                    {selectedIntegration?.name === "E-Wallet (GCash/Maya)" && (
                        <>
                            <Box sx={{display: "flex", flexDirection: "column", gap: 1}}>
                                <Typography
                                    sx={{fontFamily: "'TTHoves-DemiBold', sans-serif", color: "#FFFFFF", fontSize: "16px"}}
                                >
                                    Provider
                                </Typography>
                                <Select
                                    value={selectedIntegration?.config?.provider || ""}
                                    onChange={(e) => setSelectedIntegration(prev => ({
                                        ...prev, 
                                        config: { ...prev.config, provider: e.target.value }
                                    }))}
                                    displayEmpty
                                    sx={{
                                        backgroundColor: "#cacace", borderRadius: "13px", color: "#1F2829", fontSize: "16px",
                                        "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                                        "& .MuiSelect-select": { color: "#1F2829" },
                                        "& .MuiSelect-icon": { color: "#1F2829" },
                                    }}
                                    renderValue={(selected) => {
                                        if (!selected) return <span style={{color: "#828689"}}>Select Provider</span>;
                                        return selected;
                                    }}
                                >
                                    <MenuItem value="GCash">GCash</MenuItem>
                                    <MenuItem value="Maya">Maya (PayMaya)</MenuItem>
                                    <MenuItem value="GrabPay">GrabPay</MenuItem>
                                </Select>
                            </Box>
                            <Box sx={{display: "flex", flexDirection: "column", gap: 1}}>
                                <Typography sx={{fontFamily: "'TTHoves-DemiBold', sans-serif", color: "#FFFFFF", fontSize: "16px"}}>
                                    API Key
                                </Typography>
                                <TextField
                                    placeholder="Enter API key"
                                    fullWidth
                                    type="password"
                                    value={selectedIntegration?.config?.apiKey || ""}
                                    onChange={(e) => setSelectedIntegration(prev => ({
                                        ...prev, 
                                        config: { ...prev.config, apiKey: e.target.value }
                                    }))}
                                    variant="outlined"
                                    size="small"
                                    sx={{
                                        "& .MuiOutlinedInput-root": {
                                            borderRadius: "13px", backgroundColor: "#cacace", color: "#1F2829", fontSize: "16px",
                                            "& fieldset": { border: "none" },
                                        },
                                    }}
                                />
                            </Box>
                            <Box sx={{display: "flex", flexDirection: "column", gap: 1}}>
                                <Typography sx={{fontFamily: "'TTHoves-DemiBold', sans-serif", color: "#FFFFFF", fontSize: "16px"}}>
                                    Merchant ID
                                </Typography>
                                <TextField
                                    placeholder="Enter merchant ID"
                                    fullWidth
                                    value={selectedIntegration?.config?.merchantId || ""}
                                    onChange={(e) => setSelectedIntegration(prev => ({
                                        ...prev, 
                                        config: { ...prev.config, merchantId: e.target.value }
                                    }))}
                                    variant="outlined"
                                    size="small"
                                    sx={{
                                        "& .MuiOutlinedInput-root": {
                                            borderRadius: "13px", backgroundColor: "#cacace", color: "#1F2829", fontSize: "16px",
                                            "& fieldset": { border: "none" },
                                        },
                                    }}
                                />
                            </Box>
                        </>
                    )}

                    {/* HR System Config */}
                    {selectedIntegration?.name === "HR/Employee System" && (
                        <>
                            <Box sx={{display: "flex", flexDirection: "column", gap: 1}}>
                                <Typography sx={{fontFamily: "'TTHoves-DemiBold', sans-serif", color: "#FFFFFF", fontSize: "16px"}}>
                                    API Endpoint
                                </Typography>
                                <TextField
                                    placeholder="Enter API endpoint URL"
                                    fullWidth
                                    value={selectedIntegration?.config?.apiEndpoint || ""}
                                    onChange={(e) => setSelectedIntegration(prev => ({
                                        ...prev, 
                                        config: { ...prev.config, apiEndpoint: e.target.value }
                                    }))}
                                    variant="outlined"
                                    size="small"
                                    sx={{
                                        "& .MuiOutlinedInput-root": {
                                            borderRadius: "13px", backgroundColor: "#cacace", color: "#1F2829", fontSize: "16px",
                                            "& fieldset": { border: "none" },
                                        },
                                    }}
                                />
                            </Box>
                            <Box sx={{display: "flex", flexDirection: "column", gap: 1}}>
                                <Typography sx={{fontFamily: "'TTHoves-DemiBold', sans-serif", color: "#FFFFFF", fontSize: "16px"}}>
                                    Sync Interval
                                </Typography>
                                <Select
                                    value={selectedIntegration?.config?.syncInterval || "daily"}
                                    onChange={(e) => setSelectedIntegration(prev => ({
                                        ...prev, 
                                        config: { ...prev.config, syncInterval: e.target.value }
                                    }))}
                                    sx={{
                                        backgroundColor: "#cacace", borderRadius: "13px", color: "#1F2829", fontSize: "16px",
                                        "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                                        "& .MuiSelect-icon": { color: "#1F2829" },
                                    }}
                                >
                                    <MenuItem value="realtime">Real-time</MenuItem>
                                    <MenuItem value="hourly">Hourly</MenuItem>
                                    <MenuItem value="daily">Daily</MenuItem>
                                    <MenuItem value="weekly">Weekly</MenuItem>
                                </Select>
                            </Box>
                        </>
                    )}

                    {/* Action Buttons */}
                    <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 1 }}>
                        <Box
                            component="button"
                            onClick={handleCloseModal}
                            sx={{
                                fontSize: "16px",
                                backgroundColor: "#bdbdbd",
                                color: "#333",
                                padding: "10px 0",
                                borderRadius: "15px",
                                cursor: "pointer",
                                border: "none",
                                width: "150px",
                                fontFamily: "'TTHoves-Regular', sans-serif",
                                transition: "all 0.3s ease",
                                "&:hover": { backgroundColor: "#777", transform: "translateY(-2px)" },
                            }}
                        >
                            Cancel
                        </Box>
                        <Box
                            component="button"
                            onClick={() => showSaveConfirmation('integration')}
                            disabled={saving}
                            sx={{
                                fontSize: "16px", backgroundColor: saving ? "#666" : "#172224", color: "#fff", 
                                padding: "10px 0", borderRadius: "15px", cursor: saving ? "not-allowed" : "pointer",
                                border: "none", width: "150px", fontFamily: "'TTHoves-Regular', sans-serif",
                                transition: "all 0.3s ease",
                                "&:hover": { backgroundColor: saving ? "#666" : "#1f2f31", transform: saving ? "none" : "translateY(-2px)" },
                            }}
                        >
                            {saving ? "Saving..." : "Save"}
                        </Box>
                    </Box>
                </Box>);

            case "taxSettings":
                return (<Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        color: theme.palette.text.primary,
                    }}
                >
                    <Typography
                        variant="h5"
                        sx={{
                            fontFamily: "'TTHoves-Bold', sans-serif", fontSize: "24px", color: "#FFFFFF", mb: 2,
                        }}
                    >
                        Edit Tax Setting
                    </Typography>

                    <Box sx={{display: "flex", flexDirection: "column", gap: 1}}>
                        <Typography
                            sx={{fontFamily: "'TTHoves-DemiBold', sans-serif", color: "#FFFFFF", fontSize: "16px"}}>
                            Tax Type
                        </Typography>

                        <Select
                            value={selectedTaxSetting?.type || ""}
                            onChange={(e) => setSelectedTaxSetting(prev => ({...prev, type: e.target.value}))}
                            displayEmpty
                            size="small"
                            sx={{
                                backgroundColor: "#cacace",
                                borderRadius: "10px",
                                "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                                "& .MuiSelect-select": { color: "#1F2829" },
                                "& .MuiSelect-icon": { color: "#1F2829" },
                            }}
                            renderValue={(selected) => {
                                if (!selected) return <span style={{color: "#828689"}}>Select Tax Type</span>;
                                return selected;
                            }}
                        >
                            {["SSS", "PhilHealth", "Pag-IBIG", "Withholding Tax"].map((option) => (
                                <MenuItem key={option} value={option}>
                                    {option}
                                </MenuItem>))}
                        </Select>
                    </Box>

                    <Box sx={{display: "flex", flexDirection: "column", gap: 1, mt: 2}}>
                        <Typography
                            sx={{fontFamily: "'TTHoves-DemiBold', sans-serif", color: "#FFFFFF", fontSize: "16px"}}>
                            Rate
                        </Typography>

                        <TextField
                            placeholder="Enter percentage (e.g., 4.5%)"
                            fullWidth
                            value={selectedTaxSetting?.rate || ""}
                            onChange={(e) => setSelectedTaxSetting(prev => ({...prev, rate: e.target.value}))}
                            variant="outlined"
                            size="small"
                            sx={{
                                "& .MuiOutlinedInput-root": {
                                    borderRadius: "10px",
                                    backgroundColor: "#cacace",
                                    "& fieldset": { border: "none" },
                                },
                                "& .MuiInputBase-input": { color: "#1F2829" },
                            }}
                        />
                    </Box>

                    <Box sx={{display: "flex", flexDirection: "column", gap: 1, mt: 2}}>
                        <Typography
                            sx={{fontFamily: "'TTHoves-DemiBold', sans-serif", color: "#FFFFFF", fontSize: "16px"}}>
                            Description
                        </Typography>

                        <TextField
                            placeholder="Enter description"
                            fullWidth
                            value={selectedTaxSetting?.description || ""}
                            onChange={(e) => setSelectedTaxSetting(prev => ({...prev, description: e.target.value}))}
                            variant="outlined"
                            size="small"
                            sx={{
                                "& .MuiOutlinedInput-root": {
                                    borderRadius: "10px",
                                    backgroundColor: "#cacace",
                                    "& fieldset": { border: "none" },
                                },
                                "& .MuiInputBase-input": { color: "#1F2829" },
                            }}
                        />
                    </Box>

                    <Box
                        sx={{
                            display: "flex", justifyContent: "center", gap: 2, mt: 3,
                        }}
                    >
                        <Box
                            component="button"
                            onClick={handleCloseModal}
                            sx={{
                                fontSize: "16px",
                                backgroundColor: "#bdbdbd",
                                color: "#333",
                                padding: "10px 0",
                                borderRadius: "15px",
                                cursor: "pointer",
                                border: "none",
                                width: "200px",
                                fontFamily: "'TTHoves-Regular', sans-serif",
                                transition: "all 0.3s ease",
                                "&:hover": { backgroundColor: "#777", transform: "translateY(-2px)" },
                            }}
                        >
                            Cancel
                        </Box>
                        <Box
                            component="button"
                            onClick={() => showSaveConfirmation('tax')}
                            disabled={saving}
                            sx={{
                                display: "flex-end",
                                fontSize: "16px",
                                backgroundColor: saving ? "#666" : "#172224",
                                color: "#fff",
                                padding: "10px 0",
                                borderRadius: "15px",
                                cursor: saving ? "not-allowed" : "pointer",
                                border: "none",
                                transition: "all 0.3s ease",
                                width: "200px",
                                fontFamily: "'TTHoves-Regular', sans-serif",
                                "&:hover": {
                                    backgroundColor: saving ? "#666" : "#1f2f31",
                                    transform: saving ? "none" : "translateY(-2px)",
                                    boxShadow: saving ? "none" : "0 3px 10px rgba(0,0,0,0.2)",
                                },
                            }}
                        >
                            {saving ? "Saving..." : "Save"}
                        </Box>
                    </Box>
                </Box>);

            case "payComponents":
                return (<Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        color: theme.palette.text.primary,
                    }}
                >
                    <Typography
                        variant="h5"
                        sx={{
                            fontFamily: "'TTHoves-Bold', sans-serif", fontSize: "24px", color: "#FFFFFF", mb: 2,
                        }}
                    >
                        {isEditing ? "Edit Pay Component" : "Add Pay Component"}
                    </Typography>

                    <Box sx={{display: "flex", flexDirection: "column", gap: 1}}>
                        <Typography
                            sx={{fontFamily: "'TTHoves-DemiBold', sans-serif", color: "#FFFFFF", fontSize: "16px"}}>
                            Component Name
                        </Typography>

                        <TextField
                            placeholder="Enter component name"
                            fullWidth
                            value={selectedComponent?.component || ""}
                            variant="outlined"
                            size="small"
                            sx={{
                                "& .MuiOutlinedInput-root": {
                                    borderRadius: "10px",
                                    backgroundColor: "#cacace",
                                    "& fieldset": { border: "none" },
                                },
                                "& .MuiInputBase-input": { color: "#1F2829" },
                            }}
                        />
                    </Box>

                    <Box sx={{display: "flex", flexDirection: "column", gap: 1, mt: 2}}>
                        <Typography
                            sx={{fontFamily: "'TTHoves-DemiBold', sans-serif", color: "#FFFFFF", fontSize: "16px"}}
                        >
                            Type
                        </Typography>

                        <Select
                            value={selectedComponent?.type || ""}
                            onChange={(e) => setSelectedComponent(prev => ({...prev, type: e.target.value}))}
                            displayEmpty
                            size="small"
                            sx={{
                                backgroundColor: "#cacace",
                                borderRadius: "10px",
                                "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                                "& .MuiSelect-select": { color: "#1F2829" },
                                "& .MuiSelect-icon": { color: "#1F2829" },
                            }}
                            renderValue={(selected) => {
                                if (!selected) return <span style={{color: "#828689"}}>Select Type</span>;
                                return selected;
                            }}
                        >
                            {["Fixed", "Variable", "Manual Entry", "Computed"].map((option) => (
                                <MenuItem key={option} value={option}>
                                    {option}
                                </MenuItem>))}
                        </Select>
                    </Box>

                    <Box sx={{display: "flex", flexDirection: "column", gap: 1, mt: 2}}>
                        <Typography
                            sx={{fontFamily: "'TTHoves-DemiBold', sans-serif", color: "#FFFFFF", fontSize: "16px"}}>
                            Formula or Fixed Amount
                        </Typography>

                        <TextField
                            placeholder="Enter formula or amount"
                            fullWidth
                            value={selectedComponent?.formula || ""}
                            variant="outlined"
                            size="small"
                            sx={{
                                "& .MuiOutlinedInput-root": {
                                    borderRadius: "10px",
                                    backgroundColor: "#cacace",
                                    "& fieldset": { border: "none" },
                                },
                                "& .MuiInputBase-input": { color: "#1F2829" },
                            }}
                        />
                    </Box>

                    <Box sx={{display: "flex", flexDirection: "column", gap: 1, mt: 2}}>
                        <Typography
                            sx={{fontFamily: "'TTHoves-DemiBold', sans-serif", color: "#FFFFFF", fontSize: "16px"}}
                        >
                            Status
                        </Typography>

                        <Select
                            value={selectedComponent?.status || ""}
                            onChange={(e) => setSelectedComponent(prev => ({...prev, status: e.target.value}))}
                            displayEmpty
                            size="small"
                            sx={{
                                backgroundColor: "#cacace",
                                borderRadius: "10px",
                                "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                                "& .MuiSelect-select": { color: "#1F2829" },
                                "& .MuiSelect-icon": { color: "#1F2829" },
                            }}
                            renderValue={(selected) => {
                                if (!selected) return <span style={{color: "#828689"}}>Select Status</span>;
                                return selected;
                            }}
                        >
                            {["Active", "Inactive"].map((option) => (
                                <MenuItem key={option} value={option}>
                                    {option}
                                </MenuItem>))}
                        </Select>
                    </Box>

                    <Box
                        sx={{
                            display: "flex", justifyContent: "center", gap: 2, mt: 3,
                        }}
                    >
                        {showRemove && (
                            <Box
                                component="button"
                                onClick={() => showDeleteConfirmation('component')}
                                disabled={saving}
                                sx={{
                                    display: "flex-end",
                                    fontSize: "16px",
                                    backgroundColor: saving ? "#666" : "#8b1a1a",
                                    color: "#fff",
                                    padding: "10px 0",
                                    borderRadius: "15px",
                                    cursor: saving ? "not-allowed" : "pointer",
                                    border: "none",
                                    transition: "all 0.3s ease",
                                    width: "200px",
                                    fontFamily: "'TTHoves-Regular', sans-serif",
                                    "&:hover": {
                                        backgroundColor: saving ? "#666" : "#a32020",
                                        transform: saving ? "none" : "translateY(-2px)",
                                        boxShadow: saving ? "none" : "0 3px 10px rgba(0,0,0,0.2)",
                                    },
                                }}
                            >
                                {saving ? "Deleting..." : "Remove"}
                            </Box>
                        )}
                        <Box
                            component="button"
                            onClick={() => showSaveConfirmation('component')}
                            disabled={saving}
                            sx={{
                                display: "flex-end",
                                fontSize: "16px",
                                backgroundColor: saving ? "#666" : "#172224",
                                color: "#fff",
                                padding: "10px 0",
                                borderRadius: "15px",
                                cursor: saving ? "not-allowed" : "pointer",
                                border: "none",
                                transition: "all 0.3s ease",
                                width: "200px",
                                fontFamily: "'TTHoves-Regular', sans-serif",
                                "&:hover": {
                                    backgroundColor: saving ? "#666" : "#1f2f31",
                                    transform: saving ? "none" : "translateY(-2px)",
                                    boxShadow: saving ? "none" : "0 3px 10px rgba(0,0,0,0.2)",
                                },
                            }}
                        >
                            {saving ? "Saving..." : "Save"}
                        </Box>
                    </Box>
                </Box>);

            default:
                return null;
        }
    };

    return (<Box
        width="100%"
        height="100%"
        sx={{
            fontFamily: theme.typography.fontFamily,
        }}
    >
        <Typography
            variant="h5"
            sx={{
                fontSize: "20px",
                fontFamily: "'TTHoves-Bold', sans-serif",
                color: theme.palette.text.primary,
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: 2,
            }}
        >
            Payment System Setup
        </Typography>

        <Box
            sx={{
                height: "93%",
                backgroundColor: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(255, 255, 255, 0.2)",
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: "15px",
                backdropFilter: "blur(12px)",
                p: "12px 24px",
                transition: "all 0.3s ease",
                "&:hover": {
                    transform: "scale(1.02)", boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                },
            }}
        >
            <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
                {["integration", "taxSettings", "payComponents"].map((tab) => (<Button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    sx={{
                        fontSize: "14px",
                        px: 3,
                        py: 1,
                        borderRadius: "10px",
                        textTransform: "none",
                        fontFamily: "'TTHoves-DemiBold', sans-serif",
                        backgroundColor: activeTab === tab ? "#334042" : "#e0e0e0",
                        color: activeTab === tab ? "#fff" : "#333",
                        opacity: activeTab === tab ? 1 : 0.6,
                        "&:hover": { backgroundColor: activeTab === tab ? "#2a3435" : "#d0d0d0" },
                    }}
                >
                    {tab === "integration" ? "Integration" : tab === "taxSettings" ? "Tax Settings" : tab === "payComponents" ? "Pay Components" : tab}
                </Button>))}
            </Box>

            <Box
                sx={(theme) => ({
                    backgroundColor: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(255, 255, 255, 0.1)",
                    height: "calc(100% - 60px)",
                    borderRadius: "12px",
                    p: "24px",
                    color: "#222",
                    fontFamily: "'TTHoves-Regular', sans-serif",
                    border: `1px solid ${theme.palette.divider}`,
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                })}
            >
                <Box
                    sx={{
                        display: "flex", justifyContent: "space-between", alignItems: "center", mb: "16px",
                    }}
                >
                    <Box sx={{display: "flex", alignItems: "center", gap: "12px"}}>
                        <Box sx={{display: "flex", gap: 2}}>
                            {activeTab === "payComponents" && (<ActionButton
                                text="Add Pay Component"
                                width="200px"
                                onClick={() => {
                                    setSelectedComponent({name: "", type: "", status: ""});
                                    setModalType("payComponents");
                                    setOpenModalState(true);
                                    setShowRemove(false);
                                }}
                            />)}
                        </Box>
                    </Box>
                </Box>

                {renderCards()}

                <BoxModal
                    open={openModalState}
                    onClose={handleCloseModal}
                    width={modalType === "integration" ? 450 : modalType === "taxSettings" ? 450 : 480}
                    height={modalType === "integration" ? 450 : modalType === "taxSettings" ? 450 : 460}
                >
                    {renderModalContent()}
                </BoxModal>

                {/* Save Confirmation Modal */}
                <BoxModal
                    open={saveConfirmModalOpen}
                    onClose={() => setSaveConfirmModalOpen(false)}
                    width={400}
                    height={200}
                >
                    <Box sx={{ display: "flex", flexDirection: "column", textAlign: "center" }}>
                        <Box>
                            <Typography
                                variant="h6"
                                sx={{
                                    fontSize: "24px",
                                    fontFamily: "'TTHoves-Bold', sans-serif",
                                    color: "#fff",
                                    mb: 1
                                }}
                            >
                                Confirm Save
                            </Typography>
                            <Typography
                                sx={{
                                    fontFamily: "'TTHoves-Bold', sans-serif",
                                    color: "#fff",
                                    mb: 2
                                }}
                            >
                                Are you sure you want to save these changes?
                            </Typography>
                        </Box>
                        <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
                            <Box
                                component="button"
                                onClick={() => setSaveConfirmModalOpen(false)}
                                sx={{
                                    fontSize: "14px",
                                    backgroundColor: "#bdbdbd",
                                    color: "#333",
                                    padding: "10px 24px",
                                    borderRadius: "15px",
                                    cursor: "pointer",
                                    border: "none",
                                    fontFamily: "'TTHoves-Regular', sans-serif",
                                    "&:hover": { backgroundColor: "#a0a0a0" }
                                }}
                            >
                                Cancel
                            </Box>
                            <Box
                                component="button"
                                onClick={confirmSave}
                                sx={{
                                    fontSize: "14px",
                                    backgroundColor: "#172224",
                                    color: "#fff",
                                    padding: "10px 24px",
                                    borderRadius: "15px",
                                    cursor: "pointer",
                                    border: "none",
                                    fontFamily: "'TTHoves-Regular', sans-serif",
                                    "&:hover": { backgroundColor: "#1f2f31" }
                                }}
                            >
                                Confirm
                            </Box>
                        </Box>
                    </Box>
                </BoxModal>

                {/* Delete Confirmation Modal */}
                <BoxModal
                    open={deleteConfirmModalOpen}
                    onClose={() => setDeleteConfirmModalOpen(false)}
                    width={400}
                    height={200}
                >
                    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between" }}>
                        <Box>
                            <Typography variant="h6" sx={{ fontFamily: "'TTHoves-Bold', sans-serif", color: theme.palette.text.primary, mb: 2 }}>
                                Confirm Delete
                            </Typography>
                            <Typography sx={{ fontFamily: "'TTHoves-Regular', sans-serif", color: theme.palette.text.secondary }}>
                                Are you sure you want to delete this item? This action cannot be undone.
                            </Typography>
                        </Box>
                        <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
                            <Box
                                component="button"
                                onClick={() => setDeleteConfirmModalOpen(false)}
                                sx={{
                                    fontSize: "14px",
                                    backgroundColor: "#bdbdbd",
                                    color: "#333",
                                    padding: "10px 24px",
                                    borderRadius: "15px",
                                    cursor: "pointer",
                                    border: "none",
                                    fontFamily: "'TTHoves-Regular', sans-serif",
                                    "&:hover": { backgroundColor: "#a0a0a0" }
                                }}
                            >
                                Cancel
                            </Box>
                            <Box
                                component="button"
                                onClick={confirmDelete}
                                sx={{
                                    fontSize: "14px",
                                    backgroundColor: "#c42b2b",
                                    color: "#fff",
                                    padding: "10px 24px",
                                    borderRadius: "15px",
                                    cursor: "pointer",
                                    border: "none",
                                    fontFamily: "'TTHoves-Regular', sans-serif",
                                    "&:hover": { backgroundColor: "#a32020" }
                                }}
                            >
                                Delete
                            </Box>
                        </Box>
                    </Box>
                </BoxModal>
            </Box>
        </Box>
    </Box>);
}
