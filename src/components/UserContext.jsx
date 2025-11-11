import { createContext, useContext, useState } from "react";

const UserContext = createContext();

export function UserProvider({ children }) {
    const [user, setUser] = useState({
        name: "Finn Mertens",
        email: "finn@gmail.com",
        password: "1234",
        profilePic: "/finn.png",
        nationality: "Filipino",
        role: "employee",
        employeeId: 1,
        salaryGrade: "Php 645.00",
        birthday: "June 20, 2005",
        age: "20",
        address: "1234",
        maritalStatus: "Single",
        sex: "Male",
        contactNumber: "123456789",
        emergencyContactName: "Jake",
        emergencyContactNumber: "123456789",
        emergencyContactRelation: "Brother",
    });

    return (
        <UserContext.Provider value={{ user, setUser }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    return useContext(UserContext);
}