import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import "../styles/payment.css";
import "../styles/AdvancePayment.css";
import { 
    CreditCard, 
    Smartphone, 
    User, 
    CheckCircle, 
    AlertCircle, 
    Loader2,
    ArrowLeft,
    Shield,
    Zap,
    IndianRupee,
    Calendar,
    Clock,
    TrendingUp,
    Award,
    Star,
    ChevronRight,
    QrCode,
    BanknoteIcon,
    Wallet,
    PiggyBank,
    Target,
    Gift,
    Percent
} from "lucide-react";

export default function AdvancePayment() {
    const { user } = useAuth();
    const navigate = useNavigate();
    
    // Payment state
    const [selectedMethod, setSelectedMethod] = useState("");
    const [amount, setAmount] = useState("");
    const [customAmount, setCustomAmount] = useState("");
    const [loading, setLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [razorpayLoaded, setRazorpayLoaded] = useState(false);
    const [paymentStep, setPaymentStep] = useState(1);
    const [selectedPlan, setSelectedPlan] = useState(null);

    // Payment methods
    const paymentMethods = [
        {
            id: "razorpay",
            name: "Razorpay",
            icon: <CreditCard size={24} />,
            description: "All payment methods in one place",
            color: "#3b82f6",
            features: ["Credit/Debit Cards", "UPI", "NetBanking", "Wallets"]
        },
        {
            id: "upi",
            name: "UPI Payment",
            icon: <Smartphone size={24} />,
            description: "Instant UPI transfers",
            color: "#10b981",
            features: ["Google Pay", "PhonePe", "Paytm", "BHIM"]
        },
        {
            id: "card",
            name: "Debit/Credit Card",
            icon: <CreditCard size={24} />,
            description: "Secure card payments",
            color: "#8b5cf6",
            features: ["Visa", "Mastercard", "RuPay", "Maestro"]
        }
    ];

    // Payment plans with benefits
    const paymentPlans = [
        {
            id: "monthly",
            name: "Monthly Plan",
            amount: 10000,
            originalAmount: 10000,
            duration: "1 Month",
            savings: 0,
            popular: false,
            color: "#6b7280",
            benefits: ["Basic amenities", "Standard meals", "Regular maintenance"]
        },
        {
            id: "quarterly",
            name: "Quarterly Plan",
            amount: 28000,
            originalAmount: 30000,
            duration: "3 Months",
            savings: 2000,
            popular: true,
            color: "#10b981",
            benefits: ["Save ₹2000", "Priority maintenance", "Extra meal credits"]
        },
        {
            id: "semester",
            name: "Semester Plan",
            amount: 55000,
            originalAmount: 60000,
            duration: "6 Months",
            savings: 5000,
            popular: false,
            color: "#3b82f6",
            benefits: ["Save ₹5000", "Premium amenities", "Free laundry service"]
        },
        {
            id: "annual",
            name: "Annual Plan",
            amount: 100000,
            originalAmount: 120000,
            duration: "12 Months",
            savings: 20000,
            popular: false,
            color: "#8b5cf6",
            benefits: ["Save ₹20000", "VIP status", "All premium features"]
        }
    ];

    // Special offers
    const specialOffers = [
        {
            id: "earlybird",
            title: "Early Bird Special",
            description: "Pay before 5th and get 5% extra discount",
            icon: <Clock size={20} />,
            discount: "5%",
            valid: "Valid until 5th of every month"
        },
        {
            id: "referral",
            title: "Referral Bonus",
            description: "Refer a friend and get ₹500 off",
            icon: <Gift size={20} />,
            discount: "₹500",
            valid: "Unlimited referrals"
        },
        {
            id: "loyalty",
            title: "Loyalty Reward",
            description: "We appreciate you choosing us! See you soon.",
            icon: <Award size={20} />,
            discount: "₹1000",
            valid: "After 3 consecutive payments"
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
        setSelectedPlan(plan);
        setAmount(plan.amount.toString());
        setCustomAmount("");
        setPaymentStep(2);
    };

    const selectPaymentMethod = (method) => {
        setSelectedMethod(method);
        setPaymentStep(3);
    };

    const handleCustomAmount = (value) => {
        // Remove non-numeric characters except decimal point
        const cleanValue = value.replace(/[^0-9.]/g, '');
        
        // Ensure only one decimal point
        const parts = cleanValue.split('.');
        if (parts.length > 2) {
            return;
        }
        
        // Limit to 2 decimal places
        if (parts[1] && parts[1].length > 2) {
            return;
        }
        
        setCustomAmount(cleanValue);
        setAmount(cleanValue);
        setSelectedPlan(null);
        
        // Clear error when user starts typing
        if (cleanValue && parseFloat(cleanValue) >= 100) {
            setShowError(false);
        }
    };

    const calculateSavings = () => {
        if (!selectedPlan) return 0;
        return selectedPlan.savings;
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const handlePayment = async () => {
        // Validation checks
        if (!selectedMethod) {
            setErrorMessage("Please select a payment method");
            setShowError(true);
            return;
        }

        if (!amount || parseFloat(amount) <= 0) {
            setErrorMessage("Please enter a valid payment amount");
            setShowError(true);
            return;
        }

        if (!user?._id) {
            setErrorMessage("Student ID is required for payment");
            setShowError(true);
            return;
        }

        if (!user?.name) {
            setErrorMessage("Student name is required for payment");
            setShowError(true);
            return;
        }

        if (parseFloat(amount) < 100) {
            setErrorMessage("Minimum payment amount is ₹100");
            setShowError(true);
            return;
        }

        setLoading(true);
        setShowError(false);
        
        try {
            const response = await API.post("/payments/create-order", {
                amount: parseFloat(amount),
                studentId: user._id,
                studentName: user.name,
                paymentMethod: selectedMethod,
                plan: selectedPlan?.name || "Custom"
            });

            const { order, paymentId } = response.data;

            const options = {
                key: process.env.REACT_APP_RAZORPAY_KEY_ID || "rzp_test_YourKeyHere",
                amount: order.amount,
                currency: order.currency,
                name: "Hostelite",
                description: `${selectedPlan?.name || "Custom"} Payment - ${selectedMethod}`,
                order_id: order.id,
                handler: async function (response) {
                    try {
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
                            }, 3000);
                        } else {
                            setErrorMessage("Payment verification failed. Please contact support.");
                            setShowError(true);
                        }
                    } catch (error) {
                        console.error("Payment verification error:", error);
                        setErrorMessage("Payment verification failed. Please try again or contact support.");
                        setShowError(true);
                    }
                },
                prefill: {
                    name: user.name,
                    email: user.email,
                    contact: user.phone || ""
                },
                theme: {
                    color: selectedMethod ? paymentMethods.find(m => m.id === selectedMethod)?.color : "#3b82f6",
                },
                modal: {
                    ondismiss: function() {
                        setLoading(false);
                        setErrorMessage("Payment was cancelled. Please try again to complete your payment.");
                        setShowError(true);
                    },
                    modal: {
                        escape: false,
                        backdropclose: false,
                        handleback: false
                    }
                }
            };

            const rzp = new window.Razorpay(options);
            
            // Add error handling for Razorpay
            rzp.on('payment.failed', function (response) {
                console.error("Payment failed:", response.error);
                let errorMessage = "Payment failed. ";
                
                switch(response.error.code) {
                    case 'razorpay.payment.cancelled':
                        errorMessage += "Payment was cancelled by user.";
                        break;
                    case 'razorpay.payment.invalid':
                        errorMessage += "Invalid payment details.";
                        break;
                    case 'razorpay.network':
                        errorMessage += "Network error. Please check your internet connection.";
                        break;
                    case 'razorpay.timeout':
                        errorMessage += "Payment timed out. Please try again.";
                        break;
                    default:
                        errorMessage += response.error.description || "Please try again.";
                }
                
                setErrorMessage(errorMessage);
                setShowError(true);
                setLoading(false);
            });

            rzp.open();

        } catch (error) {
            console.error("Payment Error:", error);
            
            // Handle different error types
            if (error.response) {
                // Server responded with error status
                switch(error.response.status) {
                    case 400:
                        setErrorMessage("Invalid payment details. Please check your information and try again.");
                        break;
                    case 401:
                        setErrorMessage("Authentication failed. Please login again and try.");
                        break;
                    case 403:
                        setErrorMessage("You don't have permission to make payments.");
                        break;
                    case 429:
                        setErrorMessage("Too many payment attempts. Please wait and try again later.");
                        break;
                    case 500:
                        setErrorMessage("Server error. Please try again later or contact support.");
                        break;
                    default:
                        setErrorMessage(error.response.data?.message || "Payment failed. Please try again.");
                }
            } else if (error.request) {
                // Network error
                setErrorMessage("Network error. Please check your internet connection and try again.");
            } else {
                // Other errors
                setErrorMessage("An unexpected error occurred. Please try again.");
            }
            
            setShowError(true);
            setLoading(false);
        }
    };

    const goBack = () => {
        if (paymentStep > 1) {
            setPaymentStep(paymentStep - 1);
        } else {
            navigate("/student-payment");
        }
    };

    return (
        <div className="advance-payment-container">
            <div className="advance-payment-header">
                <button className="back-btn" onClick={goBack}>
                    <ArrowLeft size={20} />
                    Back
                </button>
                <div className="header-content">
                    <h1>Advance Payment System</h1>
                    <p>Choose your perfect payment plan and enjoy exclusive benefits</p>
                </div>
                <div className="user-info">
                    <User size={20} />
                    <span>{user?.name}</span>
                </div>
            </div>

            {/* Progress Indicator */}
            <div className="progress-indicator">
                <div className={`progress-step ${paymentStep >= 1 ? 'active' : ''}`}>
                    <div className="step-number">1</div>
                    <span>Select Plan</span>
                </div>
                <div className="progress-line"></div>
                <div className={`progress-step ${paymentStep >= 2 ? 'active' : ''}`}>
                    <div className="step-number">2</div>
                    <span>Payment Method</span>
                </div>
                <div className="progress-line"></div>
                <div className={`progress-step ${paymentStep >= 3 ? 'active' : ''}`}>
                    <div className="step-number">3</div>
                    <span>Complete Payment</span>
                </div>
            </div>

            {/* Success Message */}
            {showSuccess && (
                <div className="success-message">
                    <CheckCircle size={24} />
                    <div>
                        <h3>Payment Successful!</h3>
                        <p>Redirecting to payment history...</p>
                    </div>
                </div>
            )}

            {/* Error Message */}
            {showError && (
                <div className="error-message">
                    <AlertCircle size={24} />
                    <div className="error-content">
                        <h3>Payment Failed</h3>
                        <p>{errorMessage}</p>
                        <div className="error-actions">
                            <button 
                                className="retry-btn"
                                onClick={() => {
                                    setShowError(false);
                                    setErrorMessage("");
                                }}
                            >
                                Try Again
                            </button>
                            <button 
                                className="contact-support-btn"
                                onClick={() => {
                                    // Could open a support modal or navigate to help page
                                    alert("For support, please contact: support@hostelite.com or call +916261582940, +919284554095");
                                }}
                            >
                                Contact Support
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Step 1: Select Payment Plan */}
            {paymentStep === 1 && (
                <div className="payment-step">
                    <div className="step-header">
                        <Target size={32} />
                        <div>
                            <h2>Choose Your Payment Plan</h2>
                            <p>Select the plan that best fits your needs and budget</p>
                        </div>
                    </div>

                    <div className="plans-grid">
                        {paymentPlans.map((plan) => (
                            <div 
                                key={plan.id}
                                className={`plan-card ${selectedPlan?.id === plan.id ? 'selected' : ''} ${plan.popular ? 'popular' : ''}`}
                                onClick={() => selectPlan(plan)}
                                style={{ borderColor: plan.color }}
                            >
                                {plan.popular && (
                                    <div className="popular-badge" style={{ background: plan.color }}>
                                        <Star size={16} />
                                        Most Popular
                                    </div>
                                )}
                                
                                <div className="plan-header">
                                    <h3>{plan.name}</h3>
                                    <div className="plan-duration">{plan.duration}</div>
                                </div>

                                <div className="plan-pricing">
                                    <div className="current-price">
                                        <IndianRupee size={20} />
                                        {formatCurrency(plan.amount)}
                                    </div>
                                    {plan.savings > 0 && (
                                        <div className="original-price">
                                            <IndianRupee size={16} />
                                            {formatCurrency(plan.originalAmount)}
                                        </div>
                                    )}
                                </div>

                                {plan.savings > 0 && (
                                    <div className="savings-badge">
                                        <Percent size={16} />
                                        Save {formatCurrency(plan.savings)}
                                    </div>
                                )}

                                <div className="plan-benefits">
                                    {plan.benefits.map((benefit, index) => (
                                        <div key={index} className="benefit-item">
                                            <CheckCircle size={16} />
                                            <span>{benefit}</span>
                                        </div>
                                    ))}
                                </div>

                                <button className="select-plan-btn">
                                    Select Plan
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Custom Amount Option */}
                    <div className="custom-amount-section">
                        <h3>Or Enter Custom Amount</h3>
                        <div className="custom-amount-input">
                            <IndianRupee size={20} />
                            <input
                                type="number"
                                placeholder="Enter custom amount"
                                value={customAmount}
                                onChange={(e) => handleCustomAmount(e.target.value)}
                                min="100"
                                step="100"
                            />
                        </div>
                        {customAmount && parseFloat(customAmount) >= 100 && (
                            <button 
                                className="continue-btn"
                                onClick={() => setPaymentStep(2)}
                            >
                                Continue with {formatCurrency(customAmount)}
                                <ChevronRight size={20} />
                            </button>
                        )}
                        {customAmount && parseFloat(customAmount) < 100 && (
                            <div className="validation-error">
                                Minimum payment amount is ₹100
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Step 2: Select Payment Method */}
            {paymentStep === 2 && (
                <div className="payment-step">
                    <div className="step-header">
                        <Wallet size={32} />
                        <div>
                            <h2>Select Payment Method</h2>
                            <p>Choose your preferred payment method</p>
                        </div>
                    </div>

                    {selectedPlan && (
                        <div className="selected-plan-summary">
                            <h3>Selected Plan: {selectedPlan.name}</h3>
                            <div className="summary-details">
                                <span>Amount: {formatCurrency(selectedPlan.amount)}</span>
                                {selectedPlan.savings > 0 && (
                                    <span className="savings-text">You save: {formatCurrency(selectedPlan.savings)}</span>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="payment-methods-grid">
                        {paymentMethods.map((method) => (
                            <div 
                                key={method.id}
                                className={`method-card ${selectedMethod === method.id ? 'selected' : ''}`}
                                onClick={() => selectPaymentMethod(method.id)}
                                style={{ borderColor: method.color }}
                            >
                                <div className="method-icon" style={{ background: method.color }}>
                                    {method.icon}
                                </div>
                                <h3>{method.name}</h3>
                                <p>{method.description}</p>
                                <div className="method-features">
                                    {method.features.map((feature, index) => (
                                        <div key={index} className="feature-tag">
                                            {feature}
                                        </div>
                                    ))}
                                </div>
                                <button className="select-method-btn">
                                    Choose {method.name}
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Step 3: Complete Payment */}
            {paymentStep === 3 && (
                <div className="payment-step">
                    <div className="step-header">
                        <CreditCard size={32} />
                        <div>
                            <h2>Complete Your Payment</h2>
                            <p>Review your details and proceed to payment</p>
                        </div>
                    </div>

                    <div className="payment-summary">
                        <h3>Payment Summary</h3>
                        <div className="summary-grid">
                            <div className="summary-item">
                                <span>Plan:</span>
                                <span>{selectedPlan?.name || "Custom Amount"}</span>
                            </div>
                            <div className="summary-item">
                                <span>Payment Method:</span>
                                <span>{paymentMethods.find(m => m.id === selectedMethod)?.name}</span>
                            </div>
                            <div className="summary-item">
                                <span>Amount:</span>
                                <span className="amount">{formatCurrency(amount)}</span>
                            </div>
                            {selectedPlan?.savings > 0 && (
                                <div className="summary-item savings">
                                    <span>Total Savings:</span>
                                    <span className="savings-amount">{formatCurrency(selectedPlan.savings)}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="security-features">
                        <h3>Why Choose Our Payment System?</h3>
                        <div className="features-grid">
                            <div className="security-feature">
                                <Shield size={24} />
                                <div>
                                    <h4>100% Secure</h4>
                                    <p>Bank-level encryption for all transactions</p>
                                </div>
                            </div>
                            <div className="security-feature">
                                <Zap size={24} />
                                <div>
                                    <h4>Instant Processing</h4>
                                    <p>Real-time payment confirmation</p>
                                </div>
                            </div>
                            <div className="security-feature">
                                <Award size={24} />
                                <div>
                                    <h4>Loyalty Rewards</h4>
                                    <p>Earn points and exclusive benefits</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button 
                        className="pay-now-btn"
                        onClick={handlePayment}
                        disabled={!razorpayLoaded || loading}
                    >
                        {loading ? (
                            <>
                                <Loader2 size={20} className="spinner" />
                                Processing Payment...
                            </>
                        ) : !razorpayLoaded ? (
                            <>
                                <Loader2 size={20} className="spinner" />
                                Loading Payment Gateway...
                            </>
                        ) : (
                            <>
                                <CreditCard size={20} />
                                Pay {formatCurrency(amount)} Now
                            </>
                        )}
                    </button>
                </div>
            )}

            {/* Special Offers Section */}
            <div className="special-offers">
                <h3>Special Offers & Discounts</h3>
                <div className="offers-grid">
                    {specialOffers.map((offer) => (
                        <div key={offer.id} className="offer-card">
                            <div className="offer-icon">{offer.icon}</div>
                            <div className="offer-content">
                                <h4>{offer.title}</h4>
                                <p>{offer.description}</p>
                                <div className="offer-discount">{offer.discount}</div>
                                <small>{offer.valid}</small>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}