import { useEffect, useState } from "react";
import API from "../services/api";
import { 
    CreditCard, 
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
    User
} from "lucide-react";
import "../styles/payment.css";

export default function AdminPayments() {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState("all");

    useEffect(() => {
        fetchPayments();
    }, []);

    const fetchPayments = async () => {
        try {
            const res = await API.get("/payments/all"); // Updated endpoint
            setPayments(res.data);
            setLoading(false);
        } catch (error) {
            alert("Failed to fetch payments");
            setLoading(false);
        }
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

    if (loading) return (
        <div className="payment-container">
            <div className="loading-state">
                <Loader2 size={24} className="spinner" />
                <p>Loading payments...</p>
            </div>
        </div>
    );

    return (
        <div className="payment-container">
            <div className="payment-section">
                <div className="payment-card">
                    <div className="card-header">
                        <div className="header-icon">
                            <CreditCard size={32} />
                        </div>
                        <div className="header-text">
                            <h2>Payment Management</h2>
                            <p className="header-subtitle">
                                View and manage all student payments
                            </p>
                        </div>
                    </div>

                    {/* Filter Buttons */}
                    <div className="filter-section">
                        <div className="filter-buttons">
                            <button
                                className={`filter-btn ${filterStatus === "all" ? 'active' : ''}`}
                                onClick={() => setFilterStatus("all")}
                            >
                                All ({payments.length})
                            </button>
                            <button
                                className={`filter-btn ${filterStatus === "pending" ? 'active' : ''}`}
                                onClick={() => setFilterStatus("pending")}
                            >
                                Pending ({payments.filter(p => p.status === "pending").length})
                            </button>
                            <button
                                className={`filter-btn ${filterStatus === "completed" ? 'active' : ''}`}
                                onClick={() => setFilterStatus("completed")}
                            >
                                Completed ({payments.filter(p => p.status === "completed").length})
                            </button>
                            <button
                                className={`filter-btn ${filterStatus === "failed" ? 'active' : ''}`}
                                onClick={() => setFilterStatus("failed")}
                            >
                                Failed ({payments.filter(p => p.status === "failed").length})
                            </button>
                        </div>
                    </div>

                    {filteredPayments.length === 0 ? (
                        <div className="empty-state">
                            <CreditCard size={48} />
                            <h4>No payments found</h4>
                            <p>No payments match the current filter criteria.</p>
                        </div>
                    ) : (
                        <div className="payments-table">
                            <div className="table-header">
                                <div className="header-cell">Student</div>
                                <div className="header-cell">Amount</div>
                                <div className="header-cell">Status</div>
                                <div className="header-cell">Date</div>
                                <div className="header-cell">Payment ID</div>
                                <div className="header-cell">Actions</div>
                            </div>
                            <div className="table-body">
                                {filteredPayments.map((payment, index) => (
                                    <div key={payment._id} className={`payment-row ${index === 0 ? 'latest' : ''}`}>
                                        <div className="cell student-cell">
                                            <div className="student-info">
                                                <User size={16} />
                                                <div>
                                                    <div className="student-name">{payment.studentName}</div>
                                                    <div className="student-id">ID: {payment.studentId}</div>
                                                </div>
                                            </div>
                                        </div>
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
                                        <div className="cell payment-id-cell">
                                            <span className="payment-id">
                                                {payment.razorpayPaymentId ? 
                                                    payment.razorpayPaymentId.slice(-8) : 
                                                    'N/A'
                                                }
                                            </span>
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