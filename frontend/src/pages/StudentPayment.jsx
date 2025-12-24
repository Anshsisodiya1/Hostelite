import { useState, useEffect } from "react";
import API from "../services/api";
import { useAuth } from "../contexts/AuthContext";

export default function StudentPayment() {
    const { user } = useAuth();
    const [amount, setAmount] = useState("");
    const [loading, setLoading] = useState(false);
    const [payments, setPayments] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(true);

    useEffect(() => {
        fetchPaymentHistory();
    }, []);

    const fetchPaymentHistory = async () => {
        try {
            const res = await API.get(`/payments/student/${user._id}`);
            setPayments(res.data);
        } catch (error) {
            console.error(error);
            alert("Failed to load payment history");
        }
        setHistoryLoading(false);
    };

    const handlePayment = async (e) => {
        e.preventDefault();
        if (!amount) return alert("Enter payment amount");

        setLoading(true);
        try {
            await API.post("/payments", {
                studentId: user._id,
                studentName: user.name,
                amount,
                status: "pending",
                date: new Date(),
            });
            alert("Payment submitted successfully!");
            setAmount("");
            fetchPaymentHistory(); // refresh history after new payment
        } catch (error) {
            console.error(error);
            alert("Failed to submit payment");
        }
        setLoading(false);
    };

    return (
        <div>
            <h2>Hostel Rent Payment</h2>
            <form onSubmit={handlePayment}>
                <div>
                    <label>Student Name: </label>
                    <span>{user.name}</span>
                </div>
                <div>
                    <label>Amount: </label>
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="Enter amount"
                    />
                </div>
                <button type="submit" disabled={loading}>
                    {loading ? "Processing..." : "Pay Now"}
                </button>
            </form>

            <hr />
            <h3>Payment History</h3>
            {historyLoading ? (
                <p>Loading history...</p>
            ) : payments.length === 0 ? (
                <p>No payments found</p>
            ) : (
                <table border="1" cellPadding="5">
                    <thead>
                        <tr>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {payments.map(payment => (
                            <tr key={payment._id}>
                                <td>{payment.amount}</td>
                                <td>{payment.status}</td>
                                <td>{new Date(payment.date).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
