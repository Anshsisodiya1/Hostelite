import { useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

export default function Register() {
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("student");

    const registerHandler = async (e) => {
        e.preventDefault();
        try {
            await API.post("/auth/register", {
                name,
                email,
                password,
                role,
            });

            alert("Registration successful");
            navigate("/login");
        } catch (error) {
            alert(error.response?.data?.message || "Registration failed");
        }
    };

    return (
        <form onSubmit={registerHandler}>
            <h2>Register</h2>

            <input
                placeholder="Name"
                onChange={(e) => setName(e.target.value)}
            />

            <input
                placeholder="Email"
                onChange={(e) => setEmail(e.target.value)}
            />

            <input
                type="password"
                placeholder="Password"
                onChange={(e) => setPassword(e.target.value)}
            />

            <select onChange={(e) => setRole(e.target.value)}>
                <option value="student">Student</option>
                <option value="warden">Warden</option>
                <option value="admin">Admin</option>
            </select>

            <button>Register</button>
        </form>
    );
}
