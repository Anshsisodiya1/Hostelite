import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "../styles/payment.css";

export default function UpiPayment() {
    const { user } = useAuth();
    const navigate = useNavigate();
    
    return (
        <div className="payment-container">
            <div className="payment-card">
                <h1>UPI Payment Page - Test</h1>
                <p>User: {user?.name || "No user found"}</p>
                <button onClick={() => navigate("/razorpay-payment")}>
                    Go Back to Razorpay
                </button>
            </div>
        </div>
    );
}