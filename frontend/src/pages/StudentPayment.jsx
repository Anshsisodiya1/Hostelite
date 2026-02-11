import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import "../styles/payment.css";
import QRCode from "qrcode";
import { 
    CreditCard, 
    User, 
    Calendar, 
    CheckCircle, 
    AlertCircle, 
    Loader2,
    Clock,
    Check,
    X,
    Download,
    Filter,
    IndianRupee,
    Zap,
    Smartphone,
    QrCode
} from "lucide-react";

export default function StudentPayment() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [amount, setAmount] = useState("");
    const [loading, setLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [showError, setShowError] = useState(false);
    const [payments, setPayments] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState("all");
    const [razorpayLoaded, setRazorpayLoaded] = useState(false);
    const [showQrPayment, setShowQrPayment] = useState(false);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('razorpay');
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [qrLoading, setQrLoading] = useState(false);

    useEffect(() => {
        fetchPaymentHistory();
        loadRazorpayScript();
    }, []);

    const generatePhonePeQR = async () => {
        if (!amount || parseFloat(amount) <= 0) return;
        
        setQrLoading(true);
        try {
            // Create PhonePe UPI payment string with amount
            const upiString = `upi://pay?pa=hostelite@phonepe&pn=Hostelite&am=${parseFloat(amount)}&cu=INR&tn=Hostel Fee Payment`;
            
            // Generate QR Code
            const qrDataUrl = await QRCode.toDataURL(upiString, {
                width: 200,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                }
            });
            
            setQrCodeUrl(qrDataUrl);
        } catch (error) {
            console.error('Error generating QR code:', error);
        } finally {
            setQrLoading(false);
        }
    };

    useEffect(() => {
        if (showQrPayment && amount) {
            generatePhonePeQR();
        }
    }, [showQrPayment, amount]);

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

    const fetchPaymentHistory = async () => {
        try {
            const res = await API.get(`/payments/student/${user._id}`);
            setPayments(res.data);
        } catch (error) {
            console.error(error);
            setShowError(true);
            setTimeout(() => setShowError(false), 3000);
        }
        setHistoryLoading(false);
    };

    const filteredPayments = filterStatus === "all" 
        ? payments 
        : payments.filter(payment => payment.status === filterStatus);

    const getStatusBadge = (status) => {
        switch (status) {
            case "pending":
                return { color: "#f59e0b", icon: <Clock size={14} />, text: "Pending" };
            case "completed":
                return { color: "#10b981", icon: <Check size={14} />, text: "Completed" };
            case "failed":
                return { color: "#ef4444", icon: <X size={14} />, text: "Failed" };
            default:
                return { color: "#64748b", icon: <Clock size={14} />, text: status };
        }
    };

    const isFormValid = amount && parseFloat(amount) > 0;

    const handlePayment = async (e) => {
        e.preventDefault();
        if (!isFormValid || !razorpayLoaded) return;

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
                description: "Hostel Fee Payment",
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
                            setAmount("");
                            fetchPaymentHistory();
                            setTimeout(() => setShowSuccess(false), 3000);
                        }
                    } catch (error) {
                        console.error("Payment verification error:", error);
                        setShowError(true);
                        setTimeout(() => setShowError(false), 3000);
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
                    }
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();

        } catch (error) {
            console.error("Payment Error:", error);
            setShowError(true);
            setTimeout(() => setShowError(false), 3000);
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

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const downloadReceipt = (payment) => {
        const receiptData = {
            receiptId: `RCP-${payment._id.slice(-8).toUpperCase()}`,
            studentName: payment.studentName,
            studentId: payment.studentId,
            amount: formatCurrency(payment.amount),
            date: formatDate(payment.date),
            status: payment.status,
            paymentId: payment.razorpayPaymentId || 'N/A',
            orderId: payment.razorpayOrderId || 'N/A',
        };

        const receiptContent = `
========================================
           HOSTEL FEE RECEIPT           
========================================

Receipt ID: ${receiptData.receiptId}
Date: ${receiptData.date}

Student Information:
-------------------
Name: ${receiptData.studentName}
ID: ${receiptData.studentId}

Payment Details:
---------------
Amount: ${receiptData.amount}
Status: ${receiptData.status}
Payment ID: ${receiptData.paymentId}
Order ID: ${receiptData.orderId}

========================================
This is a computer generated receipt.
For any queries, please contact the hostel office.
========================================
        `.trim();

        const blob = new Blob([receiptContent], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `receipt_${receiptData.receiptId}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    return (
        <div className="payment-container">
            {/* Payment Form Section */}
            <div className="payment-section">
                <div className="payment-card">
                    <div className="card-header">
                        <div className="header-icon">
                            <CreditCard size={32} />
                        </div>
                        <div className="header-text">
                            <h2>Hostel Fee Payment</h2>
                            <p className="header-subtitle">
                                Secure and convenient fee payment
                            </p>
                        </div>
                    </div>

                    {/* Feedback Messages */}
                    {showSuccess && (
                        <div className="feedback-message success">
                            <CheckCircle size={20} />
                            <span>Payment submitted successfully!</span>
                        </div>
                    )}
                    
                    {showError && (
                        <div className="feedback-message error">
                            <AlertCircle size={20} />
                            <span>Payment failed. Please try again.</span>
                        </div>
                    )}

                    {/* Student Info Card */}
                    <div className="student-info">
                        <div className="info-icon">
                            <User size={20} />
                        </div>
                        <div className="info-details">
                            <h3>Student Information</h3>
                            <p className="student-name">{user.name}</p>
                            <p className="student-id">ID: {user._id}</p>
                        </div>
                    </div>

                    <form onSubmit={handlePayment}>
                        <div className="form-group">
                            <label className="form-label" htmlFor="amount">
                                <IndianRupee size={16} />
                                Payment Amount
                            </label>
                            <div className="amount-input-wrapper">
                                <input
                                    id="amount"
                                    type="number"
                                    placeholder="Enter hostel fee amount"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="form-input"
                                    min="1"
                                    step="0.01"
                                    required
                                />
                                {amount && (
                                    <div className="amount-preview">
                                        {formatCurrency(amount)}
                                    </div>
                                )}
                            </div>
                            <p className="input-hint">
                                Enter the amount you wish to pay for hostel fees
                            </p>
                        </div>

                        <button 
                            type="submit" 
                            className={`submit-btn ${!isFormValid ? 'disabled' : ''} ${selectedPaymentMethod === 'razorpay' ? 'primary' : 'secondary'}`}
                            disabled={!isFormValid || loading || !razorpayLoaded}
                            onClick={() => setSelectedPaymentMethod('razorpay')}
                        >
                            {selectedPaymentMethod === 'razorpay' && loading ? (
                                <>
                                    <Loader2 size={20} className="spinner" />
                                    Processing...
                                </>
                            ) : !razorpayLoaded ? (
                                <>
                                    <Loader2 size={20} className="spinner" />
                                    Loading Payment Gateway...
                                </>
                            ) : (
                                <>
                                    <CreditCard size={20} />
                                    Pay with Razorpay
                                </>
                            )}
                        </button>

                        <button 
                            type="button"
                            className={`submit-btn ${!isFormValid ? 'disabled' : ''} ${selectedPaymentMethod === 'phonepe' ? 'primary' : 'secondary'}`}
                            disabled={!isFormValid}
                            onClick={() => {
                                setSelectedPaymentMethod('phonepe');
                                generatePhonePeQR();
                                setShowQrPayment(true);
                            }}
                        >
                            <QrCode size={20} />
                            Pay with PhonePe
                        </button>

                        <button 
                            type="button"
                            className="secondary-btn"
                            onClick={() => {
                                console.log("Advanced Payment Options clicked");
                                console.log("User:", user);
                                console.log("Navigating to /advance-payment");
                                navigate("/advance-payment");
                            }}
                        >
                            <Zap size={20} />
                            Advanced Payment Options
                        </button>
                    </form>

                    {/* QR Code Payment Modal */}
                    {showQrPayment && (
                        <div className="qr-modal-overlay" onClick={() => setShowQrPayment(false)}>
                            <div className="qr-modal" onClick={(e) => e.stopPropagation()}>
                                <div className="qr-modal-header">
                                    <div className="qr-modal-title">
                                        <Smartphone size={24} />
                                        <h3>PhonePe Payment</h3>
                                    </div>
                                    <button 
                                        className="close-btn" 
                                        onClick={() => setShowQrPayment(false)}
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                                
                                <div className="qr-content">
                                    <div className="qr-code-container">
                                        {qrLoading ? (
                                            <div className="qr-loading">
                                                <Loader2 size={24} className="spinner" />
                                                <p>Generating QR Code...</p>
                                            </div>
                                        ) : qrCodeUrl ? (
                                            <div className="qr-code">
                                                <img 
                                                    src={qrCodeUrl} 
                                                    alt="PhonePe QR Code" 
                                                    className="qr-image"
                                                />
                                            </div>
                                        ) : (
                                            <div className="qr-error">
                                                <AlertCircle size={48} />
                                                <p>Failed to generate QR code</p>
                                                <button 
                                                    className="retry-btn"
                                                    onClick={generatePhonePeQR}
                                                >
                                                    Retry
                                                </button>
                                            </div>
                                        )}
                                        <div className="qr-instructions">
                                            <h4>Scan to Pay</h4>
                                            <p>1. Open PhonePe/Any UPI app</p>
                                            <p>2. Scan this QR code</p>
                                            <p>3. Amount: {formatCurrency(amount)} </p>
                                            <p>4. Complete payment</p>
                                        </div>
                                    </div>
                                    
                                    <div className="payment-details">
                                        <div className="detail-row">
                                            <span className="detail-label">Pay to:</span>
                                            <span className="detail-value">hostelite@phonepe</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="detail-label">Amount:</span>
                                            <span className="detail-value">{formatCurrency(amount)}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="detail-label">Student ID:</span>
                                            <span className="detail-value">{user._id}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="qr-actions">
                                        <button 
                                            className="verify-btn"
                                            onClick={() => {
                                                // Here you would typically verify the payment
                                                alert('Payment verification will be implemented. For now, please contact admin after payment.');
                                                setShowQrPayment(false);
                                            }}
                                        >
                                            <Check size={16} />
                                            I've Paid
                                        </button>
                                        <button 
                                            className="cancel-btn"
                                            onClick={() => setShowQrPayment(false)}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Payment History Section */}
            <div className="history-section">
                <div className="history-header">
                    <div className="history-title">
                        <Calendar size={24} />
                        <h3>Payment History</h3>
                    </div>
                    
                    {/* Filter Buttons */}
                    <div className="filter-buttons">
                        <button
                            className={`filter-btn ${filterStatus === "all" ? 'active' : ''}`}
                            onClick={() => setFilterStatus("all")}
                        >
                            All
                        </button>
                        <button
                            className={`filter-btn ${filterStatus === "pending" ? 'active' : ''}`}
                            onClick={() => setFilterStatus("pending")}
                        >
                            Pending
                        </button>
                        <button
                            className={`filter-btn ${filterStatus === "completed" ? 'active' : ''}`}
                            onClick={() => setFilterStatus("completed")}
                        >
                            Completed
                        </button>
                        <button
                            className={`filter-btn ${filterStatus === "failed" ? 'active' : ''}`}
                            onClick={() => setFilterStatus("failed")}
                        >
                            Failed
                        </button>
                    </div>
                </div>

                <div className="history-content">
                    {historyLoading ? (
                        <div className="loading-state">
                            <Loader2 size={24} className="spinner" />
                            <p>Loading payment history...</p>
                        </div>
                    ) : filteredPayments.length === 0 ? (
                        <div className="empty-state">
                            <CreditCard size={48} />
                            <h4>No payments found</h4>
                            <p>You haven't made any hostel fee payments yet.</p>
                        </div>
                    ) : (
                        <div className="payments-table">
                            <div className="table-header">
                                <div className="header-cell">Amount</div>
                                <div className="header-cell">Status</div>
                                <div className="header-cell">Date</div>
                                <div className="header-cell">Actions</div>
                            </div>
                            <div className="table-body">
                                {filteredPayments.map((payment, index) => (
                                    <div key={payment._id} className={`payment-row ${index === 0 ? 'latest' : ''}`}>
                                        <div className="cell amount-cell">
                                            <IndianRupee size={16} />
                                            {formatCurrency(payment.amount)}
                                        </div>
                                        <div className="cell">
                                            <div 
                                                className="status-badge"
                                                style={{ 
                                                    backgroundColor: getStatusBadge(payment.status).color + '20',
                                                    color: getStatusBadge(payment.status).color 
                                                }}
                                            >
                                                {getStatusBadge(payment.status).icon}
                                                <span>{getStatusBadge(payment.status).text}</span>
                                            </div>
                                        </div>
                                        <div className="cell date-cell">
                                            {formatDate(payment.date)}
                                        </div>
                                        <div className="cell actions-cell">
                                            {payment.status === "completed" && (
                                                <button 
                                                    className="receipt-btn" 
                                                    title="Download Receipt"
                                                    onClick={() => downloadReceipt(payment)}
                                                >
                                                    <Download size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}