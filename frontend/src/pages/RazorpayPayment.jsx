import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import "../styles/payment.css";
// import "../styles/RazorpayPayment.css"; // Temporarily commented for debugging
import { 
    CreditCard, 
    User, 
    CheckCircle, 
    AlertCircle, 
    Loader2,
    Clock,
    Check,
    X,
    ArrowLeft,
    Shield,
    Zap,
    IndianRupee,
    Calendar
} from "lucide-react";

export default function RazorpayPayment() {
    const { user } = useAuth();
    const navigate = useNavigate();
    
    // Debug: Check if user is available
    console.log("RazorpayPayment - User:", user);
    console.log("RazorpayPayment - Component loaded");
    
    const [amount, setAmount] = useState("");
    const [description, setDescription] = useState("Hostel Fee Payment");
    const [loading, setLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [razorpayLoaded, setRazorpayLoaded] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState("");

    const paymentPlans = [
        {
            id: "monthly",
            name: "Monthly Fee",
            amount: 10000,
            description: "Standard monthly hostel fee",
            popular: false
        },
        {
            id: "quarterly",
            name: "Quarterly Fee",
            amount: 28000,
            description: "3 months hostel fee (Save ₹2000)",
            popular: true
        },
        {
            id: "semester",
            name: "Semester Fee",
            amount: 55000,
            description: "6 months hostel fee (Save ₹5000)",
            popular: false
        }
    ];

    useEffect(() => {
        loadRazorpayScript();
    }, []);

    const loadRazorpayScript = () => {
        if (window.Razorpay) {
            setRazorpayLoaded(true);
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = () => setRazorpayLoaded(true);
        document.body.appendChild(script);
    };

    const selectPlan = (plan) => {
        setSelectedPlan(plan.id);
        setAmount(plan.amount.toString());
        setDescription(`${plan.name} - ${plan.description}`);
    };

    const isFormValid = amount && parseFloat(amount) > 0 && razorpayLoaded;

    const handlePayment = async (e) => {
        e.preventDefault();
        if (!isFormValid) return;

        setLoading(true);
        setShowError(false);
        
        try {
            // Create Razorpay order
            const response = await API.post("/payments/create-order", {
                amount: parseFloat(amount),
                studentId: user._id,
                studentName: user.name,
            });

            const { order, paymentId } = response.data;

            // Razorpay checkout options
            const options = {
                key: process.env.REACT_APP_RAZORPAY_KEY_ID || "rzp_test_YourKeyHere",
                amount: order.amount,
                currency: order.currency,
                name: "Hostelite",
                description: description,
                order_id: order.id,
                handler: async function (response) {
                    try {
                        // Verify payment on backend
                        const verifyResponse = await API.post("/payments/verify-payment", {
                            razorpayOrderId: response.razorpay_order_id,
                            razorpayPaymentId: response.razorpay_payment_id,
                            razorpaySignature: response.razorpay_signature,
                            paymentId: paymentId,
                        });

                        if (verifyResponse.data.success) {
                            setShowSuccess(true);
                            setTimeout(() => {
                                navigate("/student-payment");
                            }, 2000);
                        }
                    } catch (error) {
                        console.error("Payment verification error:", error);
                        setErrorMessage("Payment verification failed. Please contact support.");
                        setShowError(true);
                    }
                },
                prefill: {
                    name: user.name,
                    email: user.email,
                },
                theme: {
                    color: "#3b82f6",
                },
                modal: {
                    ondismiss: function() {
                        setLoading(false);
                    },
                    escape: false,
                    handleback: false,
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();

        } catch (error) {
            console.error("Payment Error:", error);
            setErrorMessage(error.response?.data?.message || "Payment failed. Please try again.");
            setShowError(true);
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    return (
        <div className="payment-container">
            <div className="payment-card">
                <h1>Razorpay Payment Page - Test</h1>
                <p>User: {user?.name || "No user found"}</p>
                <button onClick={() => navigate("/student-payment")}>
                    Go Back
                </button>
            </div>
        </div>
    );
}