import { useEffect, useState } from "react";
import API from "../services/api";

export default function AdminPayments() {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPayments();
    }, []);

    const fetchPayments = async () => {
        try {
            const res = await API.get("/payments"); // Backend GET /payments
            setPayments(res.data);
            setLoading(false);
        } catch (error) {
            alert("Failed to fetch payments");
            setLoading(false);
        }
    };

    if (loading) return <p>Loading payments...</p>;

    return (
        <div>
            <h2>All Payments</h2>
            {payments.length === 0 ? (
                <p>No payments found</p>
            ) : (
                <table border="1" cellPadding="5">
                    <thead>
                        <tr>
                            <th>Student</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {payments.map(payment => (
                            <tr key={payment._id}>
                                <td>{payment.studentName}</td>
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
