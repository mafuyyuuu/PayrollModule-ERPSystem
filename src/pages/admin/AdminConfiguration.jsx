import React, {useState, useEffect} from "react";
import "react-datepicker/dist/react-datepicker.css";
import {
    Box, Button, Typography, IconButton, Select, MenuItem, TextField, Checkbox, FormControlLabel, InputBase, Tooltip,
    Switch, CircularProgress
} from "@mui/material";
import {RiPencilFill} from "react-icons/ri";
import {styled, useTheme} from "@mui/material/styles";
import BoxModal from "../../components/BoxModal";
import ActionButton from "../../components/ActionButton.jsx";
import FilterSelect from "../../components/FilterSelect.jsx";
import SearchIcon from "@mui/icons-material/Search";

export default function AdminConfiguration() {
    const theme = useTheme();

    const [activeTab, setActiveTab] = useState("payrollRules");
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState("");
    const [showRemove, setShowRemove] = useState(false);
    const [filter, setFilter] = useState("");
    const [selectedRule, setSelectedRule] = useState("");
    const [selectedFreq, setSelectedFreq] = useState("");
    const [selectedDept, setSelectedDept] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [period, setPeriod] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [rulesFromDB, setRulesFromDB] = useState([]);
    const [cutoffsFromDB, setCutoffsFromDB] = useState([]);
    const [employeeGroupsFromDB, setEmployeeGroupsFromDB] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [selectedDepartmentData, setSelectedDepartmentData] = useState(null);
    const [departmentEmployees, setDepartmentEmployees] = useState([]);
    const [employeeSearch, setEmployeeSearch] = useState("");

    // Form state for editing
    const [editingRule, setEditingRule] = useState(null);
    const [ruleForm, setRuleForm] = useState({
        type: '',
        rule_type: 'earning',
        formula: '',
        description: '',
        active: true
    });
    const [editingCutoff, setEditingCutoff] = useState(null);
    const [cutoffForm, setCutoffForm] = useState({
        period_name: '',
        start_date: '',
        end_date: '',
        pay_date: '',
        frequency: 'Semi-Monthly'
    });

    // Delete confirmation modal state
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState({ type: '', id: null, name: '' });
    
    // Save confirmation modal state
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [saveActionType, setSaveActionType] = useState(''); // 'rule' or 'cutoff'

    // Fetch data from database
    useEffect(() => {
        const fetchConfigData = async () => {
            try {
                // Fetch payroll rules
                const rulesResponse = await fetch('http://localhost:8080/api/payroll/rules');
                if (rulesResponse.ok) {
                    const rules = await rulesResponse.json();
                    setRulesFromDB(rules);
                }

                // Fetch cutoff periods
                const cutoffsResponse = await fetch('http://localhost:8080/api/payroll/cutoffs');
                if (cutoffsResponse.ok) {
                    const cutoffs = await cutoffsResponse.json();
                    setCutoffsFromDB(cutoffs.map(c => {
                        // Handle both string dates and Date objects
                        const parseDate = (date) => {
                            if (!date) return '';
                            if (typeof date === 'string') {
                                return date.split('T')[0];
                            }
                            // If it's a Date object or timestamp
                            const d = new Date(date);
                            return d.toISOString().split('T')[0];
                        };
                        
                        return {
                            id: c.cutoff_id,
                            period: c.period_name || `${formatDate(c.start_date)} - ${formatDate(c.end_date)}`,
                            startDate: formatDate(c.start_date),
                            endDate: formatDate(c.end_date),
                            // Keep raw dates for editing (YYYY-MM-DD format)
                            start_date: parseDate(c.start_date),
                            end_date: parseDate(c.end_date),
                            pay_date: parseDate(c.pay_date),
                            frequency: c.frequency || 'Semi-Monthly'
                        };
                    }));
                }

                // Fetch departments with employee counts
                const deptResponse = await fetch('http://localhost:8080/api/departments');
                if (deptResponse.ok) {
                    const depts = await deptResponse.json();
                    setDepartments(depts);
                    
                    // Get employee counts per department
                    const empResponse = await fetch('http://localhost:8080/api/employees');
                    if (empResponse.ok) {
                        const employees = await empResponse.json();
                        const deptGroups = depts.map(dept => {
                            const deptEmps = employees.filter(e => e.department === dept.department_name);
                            return {
                                id: dept.department_id,
                                department: dept.department_name,
                                totalEmployees: deptEmps.length,
                                fullTime: deptEmps.filter(e => e.employment_type === 'Full Time').length,
                                partTime: deptEmps.filter(e => e.employment_type === 'Part Time').length,
                                temporary: deptEmps.filter(e => e.employment_type === 'Contract' || e.employment_type === 'Temporary').length
                            };
                        });
                        setEmployeeGroupsFromDB(deptGroups);
                    }
                }
            } catch (error) {
                console.error('Error fetching configuration data:', error);
                // No fallback data - show empty states
                setRulesFromDB([]);
                setCutoffsFromDB([]);
                setEmployeeGroupsFromDB([]);
            } finally {
                setLoading(false);
            }
        };

        fetchConfigData();
    }, []);

    const formatDate = (dateString) => {
        if (!dateString) return "";
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const generatePeriod = (start, end) => {
        if (!start || !end) return;

        const startDateObj = new Date(start);
        const endDateObj = new Date(end);

        const startDay = startDateObj.getDate();
        const endDay = endDateObj.getDate();

        const monthName = startDateObj.toLocaleString("default", { month: "long" });
        const year = startDateObj.getFullYear();

        let periodText = "";

        // 1st half: 1–15
        if (startDay >= 1 && startDay <= 15 && endDay >= 1 && endDay <= 15) {
            periodText = `1st Half of ${monthName} ${year}`;
        }
        // 2nd half: 16–31
        else if (startDay >= 16 && endDay >= 16) {
            periodText = `2nd Half of ${monthName} ${year}`;
        }
        // Invalid range
        else {
            periodText = "Invalid range — must both be 1–15 or 16–31";
        }

        setPeriod(periodText);
    };

    const ModernSwitch = styled(Switch)({
        width: 50,
        height: 28,
        padding: 0,
        borderRadius: 14,
        "& .MuiSwitch-switchBase": {
            padding: 2,
            "&.Mui-checked": {
                transform: "translateX(22px)",
                color: "#fff",
                "& + .MuiSwitch-track": {
                    backgroundColor: "#3A4F50",
                    opacity: 1,
                },
            },
        },
        "& .MuiSwitch-thumb": {
            width: 24,
            height: 24,
            boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
            borderRadius: 12,
        },
        "& .MuiSwitch-track": {
            borderRadius: 14,
            backgroundColor: "#bdbdbd",
            opacity: 1,
        },
    });

    const [checkedRules, setCheckedRules] = useState({});
    const [checkedCutoffs, setCheckedCutoffs] = useState({});
    const allRulesChecked = rulesFromDB.every(rule => checkedRules[rule.id]);
    const allCutoffsChecked = cutoffsFromDB.every(cutoff => checkedCutoffs[cutoff.id]);
    const hasCheckedRules = Object.values(checkedRules).some(Boolean);
    const hasCheckedCutoffs = Object.values(checkedCutoffs).some(Boolean);

    const handleSelectAllRules = (e) => {
        const checked = e.target.checked;
        const newChecked = {};
        rulesFromDB.forEach(rule => newChecked[rule.id] = checked);
        setCheckedRules(newChecked);
    };

    // Open delete modal for selected rules
    const handleDeleteSelectedRules = () => {
        const selectedIds = Object.keys(checkedRules).filter(id => checkedRules[id]);
        if (selectedIds.length === 0) return;
        
        const count = selectedIds.length;
        setDeleteTarget({ 
            type: 'bulk-rules', 
            ids: selectedIds.map(id => parseInt(id)), 
            name: `${count} rule${count > 1 ? 's' : ''}` 
        });
        setShowDeleteModal(true);
    };

    const handleSelectAllCutoffs = (e) => {
        const checked = e.target.checked;
        const newChecked = {};
        cutoffsFromDB.forEach(cutoff => newChecked[cutoff.id] = checked);
        setCheckedCutoffs(newChecked);
    };

    // Open delete modal for selected cutoffs
    const handleDeleteSelectedCutoffs = () => {
        const selectedIds = Object.keys(checkedCutoffs).filter(id => checkedCutoffs[id]);
        if (selectedIds.length === 0) return;
        
        const count = selectedIds.length;
        setDeleteTarget({ 
            type: 'bulk-cutoffs', 
            ids: selectedIds.map(id => parseInt(id)), 
            name: `${count} cutoff period${count > 1 ? 's' : ''}` 
        });
        setShowDeleteModal(true);
    };

    const openModal = async (type, data = null) => {
        setModalType(type);
        setShowModal(true);
        setSelectedRule("");
        setSelectedFreq("");
        setSelectedDept("");
        setEmployeeSearch("");
        
        // If opening employee modal with department data, fetch employees for that department
        if (type === "employee" && data) {
            setSelectedDepartmentData(data);
            try {
                const response = await fetch('http://localhost:8080/api/employees');
                if (response.ok) {
                    const employees = await response.json();
                    const deptEmployees = employees.filter(e => e.department === data.department);
                    setDepartmentEmployees(deptEmployees);
                }
            } catch (error) {
                console.error('Error fetching department employees:', error);
                setDepartmentEmployees([]);
            }
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setModalType("");
        setSelectedDepartmentData(null);
        setDepartmentEmployees([]);
        setEmployeeSearch("");
        setEditingRule(null);
        setEditingCutoff(null);
        setRuleForm({ type: '', rule_type: 'earning', formula: '', description: '', active: true });
        setCutoffForm({ period_name: '', start_date: '', end_date: '', pay_date: '', frequency: 'Semi-Monthly' });
    };

    // Show save confirmation modal
    const showSaveConfirmation = (type) => {
        setSaveActionType(type);
        setShowSaveModal(true);
    };

    // Confirm save action
    const confirmSave = async () => {
        setShowSaveModal(false);
        if (saveActionType === 'rule') {
            await executeSaveRule();
        } else if (saveActionType === 'cutoff') {
            await executeSaveCutoff();
        }
    };

    // Save or update payroll rule
    const executeSaveRule = async () => {
        setSaving(true);
        try {
            const url = editingRule 
                ? `http://localhost:8080/api/payroll/rules/${editingRule.id}`
                : 'http://localhost:8080/api/payroll/rules';
            
            const method = editingRule ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(ruleForm)
            });

            if (response.ok) {
                // Refresh rules
                const rulesResponse = await fetch('http://localhost:8080/api/payroll/rules');
                if (rulesResponse.ok) {
                    const rules = await rulesResponse.json();
                    setRulesFromDB(rules);
                }
                closeModal();
            } else {
                alert('Failed to save rule');
            }
        } catch (error) {
            console.error('Error saving rule:', error);
            alert('Error saving rule');
        } finally {
            setSaving(false);
        }
    };

    // Open delete confirmation modal
    const openDeleteModal = (type, id, name) => {
        setDeleteTarget({ type, id, name });
        setShowDeleteModal(true);
    };

    // Confirm delete action
    const confirmDelete = async () => {
        setSaving(true);
        try {
            if (deleteTarget.type === 'rule') {
                const response = await fetch(`http://localhost:8080/api/payroll/rules/${deleteTarget.id}`, {
                    method: 'DELETE'
                });
                if (response.ok) {
                    setRulesFromDB(prev => prev.filter(r => r.id !== deleteTarget.id));
                }
            } else if (deleteTarget.type === 'cutoff') {
                const response = await fetch(`http://localhost:8080/api/payroll/cutoffs/${deleteTarget.id}`, {
                    method: 'DELETE'
                });
                if (response.ok) {
                    setCutoffsFromDB(prev => prev.filter(c => c.id !== deleteTarget.id));
                }
            } else if (deleteTarget.type === 'bulk-rules') {
                // Delete multiple rules
                for (const id of deleteTarget.ids) {
                    await fetch(`http://localhost:8080/api/payroll/rules/${id}`, {
                        method: 'DELETE'
                    });
                }
                setRulesFromDB(prev => prev.filter(r => !deleteTarget.ids.includes(r.id)));
                setCheckedRules({});
            } else if (deleteTarget.type === 'bulk-cutoffs') {
                // Delete multiple cutoffs
                for (const id of deleteTarget.ids) {
                    await fetch(`http://localhost:8080/api/payroll/cutoffs/${id}`, {
                        method: 'DELETE'
                    });
                }
                setCutoffsFromDB(prev => prev.filter(c => !deleteTarget.ids.includes(c.id)));
                setCheckedCutoffs({});
            }
            setShowDeleteModal(false);
            if (showModal) closeModal();
        } catch (error) {
            console.error('Error deleting:', error);
        } finally {
            setSaving(false);
        }
    };

    // Toggle rule active status
    const handleToggleRule = async (ruleId, currentStatus) => {
        try {
            const response = await fetch(`http://localhost:8080/api/payroll/rules/${ruleId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ active: !currentStatus })
            });

            if (response.ok) {
                setRulesFromDB(prev => prev.map(r => 
                    r.id === ruleId ? { ...r, active: !currentStatus } : r
                ));
            }
        } catch (error) {
            console.error('Error toggling rule:', error);
        }
    };

    // Save or update cutoff period
    const executeSaveCutoff = async () => {
        setSaving(true);
        try {
            const url = editingCutoff 
                ? `http://localhost:8080/api/payroll/cutoffs/${editingCutoff.cutoff_id || editingCutoff.id}`
                : 'http://localhost:8080/api/payroll/cutoffs';
            
            const method = editingCutoff ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(cutoffForm)
            });

            if (response.ok) {
                // Refresh cutoffs
                const cutoffsResponse = await fetch('http://localhost:8080/api/payroll/cutoffs');
                if (cutoffsResponse.ok) {
                    const cutoffs = await cutoffsResponse.json();
                    const parseDate = (date) => {
                        if (!date) return '';
                        if (typeof date === 'string') return date.split('T')[0];
                        return new Date(date).toISOString().split('T')[0];
                    };
                    setCutoffsFromDB(cutoffs.map(c => ({
                        id: c.cutoff_id,
                        period: c.period_name || `${formatDate(c.start_date)} - ${formatDate(c.end_date)}`,
                        startDate: formatDate(c.start_date),
                        endDate: formatDate(c.end_date),
                        start_date: parseDate(c.start_date),
                        end_date: parseDate(c.end_date),
                        pay_date: parseDate(c.pay_date),
                        frequency: c.frequency || 'Semi-Monthly'
                    })));
                }
                closeModal();
            } else {
                alert('Failed to save cutoff period');
            }
        } catch (error) {
            console.error('Error saving cutoff:', error);
            alert('Error saving cutoff period');
        } finally {
            setSaving(false);
        }
    };

    // Open edit modal for rule
    const openEditRuleModal = (rule) => {
        setEditingRule(rule);
        setRuleForm({
            type: rule.type || rule.rule_name || '',
            rule_type: rule.rule_type || 'earning',
            formula: rule.formula || '',
            description: rule.description || '',
            active: rule.active !== undefined ? rule.active : true
        });
        setModalType("rule");
        setShowModal(true);
        setShowRemove(true);
    };

    // Open edit modal for cutoff
    const openEditCutoffModal = (cutoff) => {
        setEditingCutoff(cutoff);
        setCutoffForm({
            period_name: cutoff.period || cutoff.period_name || '',
            start_date: cutoff.start_date || '',
            end_date: cutoff.end_date || '',
            pay_date: cutoff.pay_date || '',
            frequency: cutoff.frequency || 'Semi-Monthly'
        });
        setModalType("cutoff");
        setShowModal(true);
        setShowRemove(true);
    };

    const renderCards = () => {
        switch (activeTab) {
            case "payrollRules":
                return (<Box
                    sx={{
                        paddingLeft: "10px",
                        display: "flex",
                        flexDirection: "column",
                        fontFamily: theme.typography.fontFamily,
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
                        <Checkbox
                            checked={allRulesChecked}
                            onChange={handleSelectAllRules}
                            sx={(theme) => ({
                                p: 0,
                                mr: "10px",
                                color: theme.palette.mode === "dark" ? "#fff" : "#1F2829",
                                borderRadius: "5px",
                                "&.Mui-checked": {
                                    color: theme.palette.mode === "dark" ? "#fff" : "#1F2829",
                                },
                                "& .MuiSvgIcon-root": {fontSize: 25},
                            })}
                        />
                        <Box
                            sx={{
                                display: "grid",
                                gridTemplateColumns: "repeat(5, 1fr)",
                                color: theme.palette.text.primary,
                                fontWeight: 700,
                                p: "8px 0",
                                width: "100%",
                                alignItems: "center",
                            }}
                        >
                            <span style={{marginLeft: "7px", textAlign: "left"}}>Rule Type</span>
                            <span style={{textAlign: "left"}}>Description</span>
                            <span style={{textAlign: "center"}}>Formula / Value</span>
                            <span style={{textAlign: "center"}}>Status</span>
                            <span style={{textAlign: "center"}}>Actions</span>
                        </Box>
                    </Box>
                    <Box
                        sx={{
                            maxHeight: "400px",
                            overflowY: "auto",
                            "&::-webkit-scrollbar": {width: 0, height: 0},
                            scrollbarWidth: "none",
                            msOverflowStyle: "none",
                            fontFamily: "'TTHoves-DemiBold', sans-serif",
                        }}
                    >
                        {rulesFromDB.map((rule) => (<Box
                            key={rule.id}
                            sx={{
                                marginTop: "10px", display: "flex", alignItems: "center", gap: "8px", mb: "12px",
                            }}
                        >
                            <Checkbox
                                checked={!!checkedRules[rule.id]}
                                onChange={(e) => setCheckedRules((prev) => ({
                                    ...prev, [rule.id]: e.target.checked,
                                }))}
                                sx={{
                                    p: 0,
                                    mr: "10px",
                                    color: theme.palette.mode === "dark" ? "#fff" : "#1F2829",
                                    borderRadius: "5px",
                                    "&.Mui-checked": {
                                        color: theme.palette.mode === "dark" ? "#fff" : "#1F2829",
                                    },
                                    "& .MuiSvgIcon-root": {fontSize: 25},
                                }}
                            />

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
                                }}
                            >
                                <span style={{paddingLeft: "15px", textAlign: "left"}}>
                                    {rule.type}
                                </span>
                                <span style={{textAlign: "left"}}>
                                    {rule.description}
                                </span>
                                <span style={{textAlign: "center"}}>
                                    {rule.formula ? `${rule.formula}%` : (rule.fixed_amount ? `₱${rule.fixed_amount}` : 'N/A')}
                                </span>
                                <span style={{textAlign: "center"}}>
                                    <Box
                                        component="span"
                                        sx={{
                                            display: "inline-block",
                                            width: "8px",
                                            height: "8px",
                                            borderRadius: "50%",
                                            bgcolor: rule.active ? "#28a745" : "#dc3545",
                                            mr: "4px",
                                        }}
                                    />
                                {rule.active ? 'Active' : 'Inactive'}
                                </span>
                                <Box
                                    sx={{
                                        display: "flex", gap: "8px", justifyContent: "center",
                                    }}
                                >
                                    <IconButton
                                        onClick={() => openEditRuleModal(rule)}
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
                        </Box>))}
                    </Box>
                </Box>);

            case "cutoffDates":
                return (<Box
                    sx={{
                        paddingLeft: "10px",
                        display: "flex",
                        flexDirection: "column",
                        fontFamily: "'TTHoves-Regular', sans-serif",
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
                        <Checkbox
                            checked={allCutoffsChecked}
                            onChange={handleSelectAllCutoffs}
                            sx={{
                                p: 0,
                                mr: "10px",
                                color: theme.palette.mode === "dark" ? "#fff" : "#1F2829",
                                borderRadius: "5px",
                                "&.Mui-checked": {
                                    color: theme.palette.mode === "dark" ? "#fff" : "#1F2829",
                                },
                                "& .MuiSvgIcon-root": {fontSize: 25},
                            }}
                        />
                        <Box
                            sx={{
                                display: "grid",
                                gridTemplateColumns: "repeat(5, 1fr)",
                                color: theme.palette.text.primary,
                                fontWeight: 700,
                                p: "8px 0",
                                width: "100%",
                                alignItems: "center",
                            }}
                        >
                            <span style={{marginLeft: "7px", textAlign: "left"}}>Period</span>
                            <span style={{textAlign: "center"}}>Start Date</span>
                            <span style={{textAlign: "center"}}>End Date</span>
                            <span style={{textAlign: "center"}}>Frequency</span>
                            <span style={{textAlign: "center"}}>Actions</span>
                        </Box>
                    </Box>

                    <Box
                        sx={{
                            maxHeight: "400px",
                            overflowY: "auto",
                            "&::-webkit-scrollbar": {width: 0, height: 0},
                            scrollbarWidth: "none",
                            msOverflowStyle: "none",
                            fontFamily: "'TTHoves-DemiBold', sans-serif",
                        }}
                    >
                        {cutoffsFromDB.map((cutoff) => (<Box
                            key={cutoff.id}
                            sx={{
                                marginTop: "10px", display: "flex", alignItems: "center", gap: "8px", mb: "12px",
                            }}
                        >
                            <Checkbox
                                checked={!!checkedCutoffs[cutoff.id]}
                                onChange={(e) => setCheckedCutoffs((prev) => ({
                                    ...prev, [cutoff.id]: e.target.checked,
                                }))}
                                sx={{
                                    p: 0,
                                    mr: "10px",
                                    color: theme.palette.mode === "dark" ? "#fff" : "#1F2829",
                                    borderRadius: "5px",
                                    "&.Mui-checked": {
                                        color: theme.palette.mode === "dark" ? "#fff" : "#1F2829",
                                    },
                                    "& .MuiSvgIcon-root": {fontSize: 25},
                                }}
                            />
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
                                }}
                            >
                                <span style={{paddingLeft: "15px", textAlign: "left"}}>{cutoff.period}</span>
                                <span style={{textAlign: "center"}}>{cutoff.startDate}</span>
                                <span style={{textAlign: "center"}}>{cutoff.endDate}</span>
                                <span style={{textAlign: "center"}}>{cutoff.frequency}</span>
                                <Box
                                    sx={{
                                        display: "flex", gap: "8px", justifyContent: "center",
                                    }}
                                >
                                    <IconButton
                                        onClick={() => openEditCutoffModal(cutoff)}
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
                        </Box>))}
                    </Box>
                </Box>);

            case "employeeGroups":
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
                            <span>Department</span>
                            <span>Total Employees</span>
                            <span>Full-Time</span>
                            <span>Part-Time</span>
                            <span>Temporary</span>
                        </Box>
                    </Box>

                    <Box
                        sx={{
                            maxHeight: "400px",
                            overflowY: "auto",
                            "&::-webkit-scrollbar": {width: 0, height: 0},
                            scrollbarWidth: "none",
                            msOverflowStyle: "none",
                            fontFamily: "'TTHoves-DemiBold', sans-serif",
                        }}
                    >
                        {employeeGroupsFromDB.length === 0 ? (
                            <Box sx={{ p: 4, textAlign: 'center', color: theme.palette.text.secondary }}>
                                No departments found in the HR system.
                            </Box>
                        ) : (
                        employeeGroupsFromDB.map((group) => (<Box
                            key={group.id}
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
                                <span>{group.department}</span>
                                <span>{group.totalEmployees}</span>
                                <span>{group.fullTime}</span>
                                <span>{group.partTime}</span>
                                <span>{group.temporary}</span>
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
            case "rule":
                return (<Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        color: "#fff",
                    }}
                >
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            mb: 2
                        }}
                    >
                        <Typography
                            variant="h5"
                            sx={{
                                fontFamily: "'TTHoves-Bold', sans-serif", fontSize: "24px", color: "#FFFFFF"
                            }}
                        >
                            {editingRule ? "Edit Rule" : "Add Rule"}
                        </Typography>

                        <Box sx={{display: "flex", alignItems: "center", gap: 1}}>
                            <Tooltip title="Active or Inactive?">
                                <ModernSwitch 
                                    checked={ruleForm.active}
                                    onChange={(e) => setRuleForm(prev => ({...prev, active: e.target.checked}))}
                                />
                            </Tooltip>
                        </Box>
                    </Box>

                    <Box sx={{display: "flex", flexDirection: "column", gap: 1}}>
                        <Typography
                            sx={{fontFamily: "'TTHoves-DemiBold', sans-serif", color: "#FFFFFF", fontSize: "16px"}}>
                            Rule Name
                        </Typography>

                        <TextField
                            placeholder="Enter rule name (e.g., Overtime, SSS Contribution)"
                            value={ruleForm.type}
                            onChange={(e) => setRuleForm(prev => ({...prev, type: e.target.value}))}
                            fullWidth
                            variant="outlined"
                            size="small"
                            sx={{
                                "& .MuiOutlinedInput-root": {
                                    borderRadius: "10px",
                                    backgroundColor: "#cacace",
                                    "& fieldset": { border: "none" },
                                },
                            }}
                        />
                    </Box>

                    <Box sx={{display: "flex", flexDirection: "column", gap: 1, mt: 2}}>
                        <Typography
                            sx={{fontFamily: "'TTHoves-DemiBold', sans-serif", color: "#FFFFFF", fontSize: "16px"}}>
                            Rule Type
                        </Typography>

                        <Select
                            value={ruleForm.rule_type}
                            onChange={(e) => setRuleForm(prev => ({...prev, rule_type: e.target.value}))}
                            size="small"
                            sx={{
                                backgroundColor: "#cacace",
                                borderRadius: "10px",
                                "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                            }}
                        >
                            <MenuItem value="earning">Earning</MenuItem>
                            <MenuItem value="deduction">Deduction</MenuItem>
                            <MenuItem value="bonus">Bonus</MenuItem>
                            <MenuItem value="allowance">Allowance</MenuItem>
                            <MenuItem value="overtime">Overtime</MenuItem>
                        </Select>
                    </Box>

                    <Box sx={{display: "flex", flexDirection: "column", gap: 1, mt: 2}}>
                        <Typography
                            sx={{fontFamily: "'TTHoves-DemiBold', sans-serif", color: "#FFFFFF", fontSize: "16px"}}>
                            Formula or Calculation
                        </Typography>

                        <TextField
                            placeholder="e.g., hourly_rate * 1.25 * overtime_hours"
                            value={ruleForm.formula}
                            onChange={(e) => setRuleForm(prev => ({...prev, formula: e.target.value}))}
                            fullWidth
                            variant="outlined"
                            size="small"
                            sx={{
                                "& .MuiOutlinedInput-root": {
                                    borderRadius: "10px",
                                    backgroundColor: "#cacace",
                                    "& fieldset": { border: "none" },
                                },
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
                            value={ruleForm.description}
                            onChange={(e) => setRuleForm(prev => ({...prev, description: e.target.value}))}
                            fullWidth
                            variant="outlined"
                            multiline
                            rows={2}
                            size="small"
                            sx={{
                                "& .MuiOutlinedInput-root": {
                                    borderRadius: "10px",
                                    backgroundColor: "#cacace",
                                    "& fieldset": { border: "none" },
                                },
                            }}
                        />
                    </Box>

                    <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 3 }}>
                        <Box
                            component="button"
                            onClick={() => showSaveConfirmation('rule')}
                            disabled={saving}
                            sx={{
                                fontSize: "16px",
                                backgroundColor: saving ? "#666" : "#172224",
                                color: "#fff",
                                padding: "10px 30px",
                                borderRadius: "15px",
                                cursor: saving ? "not-allowed" : "pointer",
                                border: "none",
                                fontFamily: "'TTHoves-Regular', sans-serif",
                                "&:hover": { backgroundColor: saving ? "#666" : "#1f2f31" },
                            }}
                        >
                            {saving ? "Saving..." : "Save"}
                        </Box>
                    </Box>
                </Box>);

            case "cutoff":
                return (<Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        color: "#fff",
                    }}
                >
                    <Typography
                        variant="h5"
                        sx={{
                            fontFamily: "'TTHoves-Bold', sans-serif", fontSize: "24px", color: "#FFFFFF", mb: 2,
                        }}
                    >
                        {editingCutoff ? "Edit Cutoff Period" : "Add Cutoff Period"}
                    </Typography>

                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                        <Typography sx={{ fontFamily: "'TTHoves-DemiBold', sans-serif", color: "#FFFFFF", fontSize: "16px" }}>
                            Payroll Period
                        </Typography>

                        <Box sx={{ display: "flex", gap: 1 }}>
                            <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 0.5 }}>
                                <Typography sx={{ fontFamily: "'TTHoves-DemiBold', sans-serif", color: "#FFFFFF", fontSize: "14px" }}>
                                    Start Date
                                </Typography>
                                <input
                                    type="date"
                                    style={{
                                        padding: "10px",
                                        height: "40px",
                                        borderRadius: "10px",
                                        fontSize: "14px",
                                        backgroundColor: "#cacace",
                                        border: "none",
                                        color: "#1F2829",
                                        outline: "none",
                                    }}
                                    value={cutoffForm.start_date}
                                    onChange={(e) => {
                                        setCutoffForm(prev => ({...prev, start_date: e.target.value}));
                                        generatePeriod(e.target.value, cutoffForm.end_date);
                                    }}
                                />
                            </Box>
                            <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 0.5 }}>
                                <Typography sx={{ fontFamily: "'TTHoves-DemiBold', sans-serif", color: "#FFFFFF", fontSize: "14px" }}>
                                    End Date
                                </Typography>
                                <input
                                    type="date"
                                    style={{
                                        padding: "10px",
                                        height: "40px",
                                        borderRadius: "10px",
                                        fontSize: "14px",
                                        backgroundColor: "#cacace",
                                        border: "none",
                                        color: "#1F2829",
                                        outline: "none",
                                    }}
                                    value={cutoffForm.end_date}
                                    onChange={(e) => {
                                        setCutoffForm(prev => ({...prev, end_date: e.target.value}));
                                        generatePeriod(cutoffForm.start_date, e.target.value);
                                    }}
                                />
                            </Box>
                        </Box>
                    </Box>

                    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, mt: 2 }}>
                        <Typography sx={{ fontFamily: "'TTHoves-DemiBold', sans-serif", color: "#FFFFFF", fontSize: "14px" }}>
                            Period Name
                        </Typography>
                        <TextField
                            value={cutoffForm.period_name || period}
                            onChange={(e) => setCutoffForm(prev => ({...prev, period_name: e.target.value}))}
                            placeholder="Auto-generated from dates"
                            variant="outlined"
                            size="small"
                            sx={{
                                "& .MuiOutlinedInput-root": {
                                    borderRadius: "10px",
                                    backgroundColor: "#cacace",
                                    "& fieldset": { border: "none" },
                                },
                            }}
                        />
                    </Box>

                    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, mt: 2 }}>
                        <Typography sx={{ fontFamily: "'TTHoves-DemiBold', sans-serif", color: "#FFFFFF", fontSize: "14px" }}>
                            Pay Date
                        </Typography>
                        <input
                            type="date"
                            style={{
                                padding: "10px",
                                height: "40px",
                                borderRadius: "10px",
                                fontSize: "14px",
                                backgroundColor: "#cacace",
                                border: "none",
                                color: "#1F2829",
                                outline: "none",
                            }}
                            value={cutoffForm.pay_date}
                            onChange={(e) => setCutoffForm(prev => ({...prev, pay_date: e.target.value}))}
                        />
                    </Box>

                    <Box sx={{display: "flex", flexDirection: "column", gap: 0.5, mt: 2}}>
                        <Typography sx={{fontFamily: "'TTHoves-DemiBold', sans-serif", color: "#FFFFFF", fontSize: "14px"}}>
                            Frequency
                        </Typography>
                        <Select
                            value={cutoffForm.frequency || 'Semi-Monthly'}
                            onChange={(e) => setCutoffForm(prev => ({...prev, frequency: e.target.value}))}
                            size="small"
                            sx={{
                                backgroundColor: "#cacace",
                                borderRadius: "10px",
                                "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                            }}
                        >
                            <MenuItem value="Weekly">Weekly</MenuItem>
                            <MenuItem value="Bi-Weekly">Bi-Weekly</MenuItem>
                            <MenuItem value="Semi-Monthly">Semi-Monthly</MenuItem>
                            <MenuItem value="Monthly">Monthly</MenuItem>
                        </Select>
                    </Box>

                    <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 3 }}>
                        <Box
                            component="button"
                            onClick={() => showSaveConfirmation('cutoff')}
                            disabled={saving}
                            sx={{
                                fontSize: "16px",
                                backgroundColor: saving ? "#666" : "#172224",
                                color: "#fff",
                                padding: "10px 30px",
                                borderRadius: "15px",
                                cursor: saving ? "not-allowed" : "pointer",
                                border: "none",
                                fontFamily: "'TTHoves-Regular', sans-serif",
                                "&:hover": { backgroundColor: saving ? "#666" : "#1f2f31" },
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
                marginBottom: "25px",
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
                pt: "12px",
                pb: "12px",
                pl: "24px",
                pr: "24px",
                transition: "all 0.3s ease",
                "&:hover": {
                    transform: "scale(1.02)", boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                },
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    gap: "12px",
                    mb: "13px",
                    backgroundColor: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.2)" : "rgba(255, 255, 255, 0.3)",
                    border: `1px solid ${theme.palette.divider}`,
                    p: "12px",
                    borderRadius: "25px",
                }}
            >
                {["payrollRules", "cutoffDates", "employeeGroups"].map((tab) => (<Button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    sx={{
                        bgcolor: activeTab === tab ? "#fff" : "#bdbdbd",
                        color: activeTab === tab ? "#172224" : "#3a4f50",
                        fontWeight: 700,
                        textTransform: "none",
                        borderRadius: "15px",
                        fontSize: "18px",
                        fontFamily: "'TTHoves-Bold', sans-serif",
                        minWidth: "200px",
                        minHeight: "50px",
                    }}
                >
                    {tab === "payrollRules" ? "Payroll Rules" : tab === "cutoffDates" ? "Cutoff Dates" : "Employee Groups"}
                </Button>))}
            </Box>

            <Box
                sx={(theme) => ({
                    backgroundColor: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(255, 255, 255, 0.1)",
                    height: "85%",
                    borderRadius: "12px",
                    p: "24px",
                    color: "#222",
                    fontFamily: "'TTHoves-Regular', sans-serif",
                    border: `1px solid ${theme.palette.divider}`,
                })}
            >
                <Box
                    sx={{
                        display: "flex", justifyContent: "space-between", alignItems: "center", mb: "16px",
                    }}
                >
                    <Box sx={{display: "flex", alignItems: "center", gap: "12px"}}>
                        <Box sx={{display: "flex", gap: 2}}>
                            {activeTab === "payrollRules" && (
                                <ActionButton
                                    text="Add Rule"
                                    width="200px"
                                    onClick={() => {
                                        setEditingRule(null);
                                        setRuleForm({ type: '', rule_type: 'earning', formula: '', description: '', active: true });
                                        setShowRemove(false);
                                        setModalType("rule");
                                        setShowModal(true);
                                    }}
                                />
                            )}
                            {activeTab === "cutoffDates" && (
                                <ActionButton
                                    text="Add Cutoff"
                                    width="200px"
                                    onClick={() => {
                                        setEditingCutoff(null);
                                        setCutoffForm({ period_name: '', start_date: '', end_date: '', pay_date: '', frequency: 'Semi-Monthly' });
                                        setPeriod('');
                                        setShowRemove(false);
                                        setModalType("cutoff");
                                        setShowModal(true);
                                    }}
                                />
                            )}
                            {(activeTab === "payrollRules" && hasCheckedRules) || (activeTab === "cutoffDates" && hasCheckedCutoffs) ? (
                                <ActionButton
                                    text="Delete Selected"
                                    width="200px"
                                    onClick={activeTab === "payrollRules" ? handleDeleteSelectedRules : handleDeleteSelectedCutoffs}
                                />) : null}
                        </Box>
                    </Box>

                    <FilterSelect
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    />
                </Box>

                {renderCards()}

                <BoxModal
                    open={showModal}
                    onClose={closeModal}
                    width={500}
                    height={modalType === "cutoff" ? 470 : modalType === "rule" ? 495 : 400}
                >
                    {renderModalContent()}
                </BoxModal>

                {/* Delete Confirmation Modal */}
                <BoxModal
                    open={showDeleteModal}
                    onClose={() => setShowDeleteModal(false)}
                    width={400}
                    height={200}
                >
                    <Box sx={{ display: "flex", flexDirection: "column", color: "#fff", textAlign: "center" }}>
                        <Typography
                            variant="h6"
                            sx={{ fontFamily: "'TTHoves-Bold', sans-serif", fontSize: "20px", color: "#FFFFFF", mb: 2 }}
                        >
                            Confirm Delete
                        </Typography>
                        <Typography sx={{ fontFamily: "'TTHoves-Regular', sans-serif", color: "#ccc", mb: 3 }}>
                            Are you sure you want to delete "{deleteTarget.name}"? This action cannot be undone.
                        </Typography>
                        <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
                            <Box
                                component="button"
                                onClick={() => setShowDeleteModal(false)}
                                sx={{
                                    fontSize: "14px",
                                    backgroundColor: "transparent",
                                    color: "#fff",
                                    padding: "10px 25px",
                                    borderRadius: "10px",
                                    cursor: "pointer",
                                    border: "1px solid rgba(255,255,255,0.3)",
                                    fontFamily: "'TTHoves-Regular', sans-serif",
                                    "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
                                }}
                            >
                                Cancel
                            </Box>
                            <Box
                                component="button"
                                onClick={confirmDelete}
                                disabled={saving}
                                sx={{
                                    fontSize: "14px",
                                    backgroundColor: saving ? "#666" : "#8b1a1a",
                                    color: "#fff",
                                    padding: "10px 25px",
                                    borderRadius: "10px",
                                    cursor: saving ? "not-allowed" : "pointer",
                                    border: "none",
                                    fontFamily: "'TTHoves-Regular', sans-serif",
                                    "&:hover": { backgroundColor: saving ? "#666" : "#a32020" },
                                }}
                            >
                                {saving ? "Deleting..." : "Delete"}
                            </Box>
                        </Box>
                    </Box>
                </BoxModal>

                {/* Save Confirmation Modal */}
                <BoxModal
                    open={showSaveModal}
                    onClose={() => setShowSaveModal(false)}
                    width={400}
                    height={200}
                >
                    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between" }}>
                        <Box>
                            <Typography variant="h6" sx={{ fontFamily: "'TTHoves-Bold', sans-serif", color: theme.palette.text.primary, mb: 2 }}>
                                Confirm Save
                            </Typography>
                            <Typography sx={{ fontFamily: "'TTHoves-Regular', sans-serif", color: theme.palette.text.secondary }}>
                                Are you sure you want to save these changes?
                            </Typography>
                        </Box>
                        <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
                            <Box
                                component="button"
                                onClick={() => setShowSaveModal(false)}
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
            </Box>
        </Box>
    </Box>);
}