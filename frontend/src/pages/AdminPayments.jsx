import { useState } from "react";
import {
  CreditCard, TrendingUp, TrendingDown, IndianRupee,
  Users, Zap, MoreHorizontal, Download, CheckCircle,
  Clock, XCircle, Wallet, ChevronDown, ChevronUp,
  Building2, Lightbulb, ShoppingBag
} from "lucide-react";
import "../styles/payment.css";

/* ── Static student payments ── */
const STATIC_PAYMENTS = [
  { _id: "p1", studentName: "Aarav Sharma",   studentId: "STU-2201", amount: 10000, status: "completed", date: "2025-05-03", razorpayPaymentId: "pay_AB12XY34ZP" },
  { _id: "p2", studentName: "Priya Verma",    studentId: "STU-2202", amount: 10000, status: "completed", date: "2025-05-07", razorpayPaymentId: "pay_CD56MN78QR" },
  { _id: "p3", studentName: "Rohit Mishra",   studentId: "STU-2203", amount: 10000, status: "pending",   date: "2025-05-10", razorpayPaymentId: null },
  { _id: "p4", studentName: "Sneha Patel",    studentId: "STU-2204", amount: 10000, status: "completed", date: "2025-05-12", razorpayPaymentId: "pay_EF90GH11ST" },
  { _id: "p5", studentName: "Karan Joshi",    studentId: "STU-2205", amount: 10000, status: "failed",    date: "2025-05-15", razorpayPaymentId: null },
];

/* ── Static expenses ── */
const EXPENSES = [
  { id: "e1", label: "Warden Salaries",  icon: Users,      amount: 10000, note: "2 wardens × ₹5,000", color: "#6366f1" },
  { id: "e2", label: "Electricity Bill", icon: Lightbulb,  amount: 7000,  note: "Monthly power usage",  color: "#f59e0b" },
  { id: "e3", label: "Other Expenses",   icon: ShoppingBag, amount: 3000, note: "Maintenance & misc",   color: "#ec4899" },
];

/* ── Helpers ── */
const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0 }).format(amount);

const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" });

const STATUS_CONFIG = {
  completed: { label: "Completed", Icon: CheckCircle, cls: "s-completed" },
  pending:   { label: "Pending",   Icon: Clock,       cls: "s-pending"   },
  failed:    { label: "Failed",    Icon: XCircle,     cls: "s-failed"    },
};

export default function AdminPayments() {
  const [filterStatus, setFilterStatus] = useState("all");
  const [showExpenses, setShowExpenses] = useState(true);

  /* ── Derived numbers ── */
  const totalRevenue  = STATIC_PAYMENTS.filter(p => p.status === "completed").reduce((s, p) => s + p.amount, 0);
  const totalExpenses = EXPENSES.reduce((s, e) => s + e.amount, 0);
  const netProfit     = totalRevenue - totalExpenses;

  const counts = {
    all:       STATIC_PAYMENTS.length,
    completed: STATIC_PAYMENTS.filter(p => p.status === "completed").length,
    pending:   STATIC_PAYMENTS.filter(p => p.status === "pending").length,
    failed:    STATIC_PAYMENTS.filter(p => p.status === "failed").length,
  };

  const filteredPayments = filterStatus === "all"
    ? STATIC_PAYMENTS
    : STATIC_PAYMENTS.filter(p => p.status === filterStatus);

  /* ── Receipt download ── */
  const downloadReceipt = (payment) => {
    const id = `RCP-${payment._id.slice(-4).toUpperCase()}`;
    const content = [
      "========================================",
      "          HOSTEL FEE RECEIPT            ",
      "========================================",
      `Receipt ID : ${id}`,
      `Date       : ${formatDate(payment.date)}`,
      "",
      "Student Information:",
      `  Name : ${payment.studentName}`,
      `  ID   : ${payment.studentId}`,
      "",
      "Payment Details:",
      `  Amount     : ${formatCurrency(payment.amount)}`,
      `  Status     : ${payment.status}`,
      `  Payment ID : ${payment.razorpayPaymentId || "N/A"}`,
      "",
      "========================================",
      "   Computer generated receipt.",
      "========================================",
    ].join("\n");

    const blob = new Blob([content], { type: "text/plain" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = `receipt_${id}.txt`;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  return (
    <div className="ap-container">

      {/* ════ PROFIT DASHBOARD ════ */}
      <div className="ap-dashboard">

        {/* Summary KPI cards */}
        <div className="ap-kpi-grid">
          <div className="ap-kpi ap-kpi--revenue">
            <div className="ap-kpi-icon"><IndianRupee size={20} /></div>
            <div className="ap-kpi-body">
              <span className="ap-kpi-label">Total Revenue</span>
              <span className="ap-kpi-value">{formatCurrency(totalRevenue)}</span>
              <span className="ap-kpi-sub">{counts.completed} payments received</span>
            </div>
            <TrendingUp size={40} className="ap-kpi-bg-icon" />
          </div>

          <div className="ap-kpi ap-kpi--expense">
            <div className="ap-kpi-icon"><Wallet size={20} /></div>
            <div className="ap-kpi-body">
              <span className="ap-kpi-label">Total Expenses</span>
              <span className="ap-kpi-value">{formatCurrency(totalExpenses)}</span>
              <span className="ap-kpi-sub">Salaries + Bills + Misc</span>
            </div>
            <TrendingDown size={40} className="ap-kpi-bg-icon" />
          </div>

          <div className="ap-kpi ap-kpi--profit">
            <div className="ap-kpi-icon"><TrendingUp size={20} /></div>
            <div className="ap-kpi-body">
              <span className="ap-kpi-label">Net Profit (May)</span>
              <span className="ap-kpi-value">{formatCurrency(netProfit)}</span>
              <span className="ap-kpi-sub">Revenue − Expenses</span>
            </div>
            <Building2 size={40} className="ap-kpi-bg-icon" />
          </div>
        </div>

        {/* Expense breakdown */}
        <div className="ap-expense-card">
          <button className="ap-expense-toggle" onClick={() => setShowExpenses(v => !v)}>
            <span className="ap-expense-title">
              <TrendingDown size={16} /> Expense Breakdown — May 2025
            </span>
            {showExpenses ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {showExpenses && (
            <div className="ap-expense-body">
              {/* Calculation flow */}
              <div className="ap-calc-flow">
                <div className="ap-calc-item ap-calc--green">
                  <span className="ap-calc-label">Fee Collected</span>
                  <span className="ap-calc-amount">{formatCurrency(totalRevenue)}</span>
                </div>
                {EXPENSES.map((exp, i) => {
                  const Icon = exp.icon;
                  const runningTotal = totalRevenue - EXPENSES.slice(0, i + 1).reduce((s, e) => s + e.amount, 0);
                  return (
                    <div key={exp.id} className="ap-calc-step">
                      <div className="ap-calc-deduct">
                        <div className="ap-exp-row">
                          <span className="ap-exp-dot" style={{ background: exp.color }} />
                          <Icon size={14} style={{ color: exp.color }} />
                          <span className="ap-exp-label">{exp.label}</span>
                          <span className="ap-exp-note">{exp.note}</span>
                          <span className="ap-exp-amount">− {formatCurrency(exp.amount)}</span>
                        </div>
                      </div>
                      <div className="ap-calc-item ap-calc--blue">
                        <span className="ap-calc-label">Remaining</span>
                        <span className="ap-calc-amount">{formatCurrency(runningTotal)}</span>
                      </div>
                    </div>
                  );
                })}
                <div className="ap-calc-item ap-calc--profit">
                  <span className="ap-calc-label"> Net Profit</span>
                  <span className="ap-calc-amount">{formatCurrency(netProfit)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ════ PAYMENTS TABLE ════ */}
      <div className="ap-table-card">
        <div className="ap-table-header">
          <div className="ap-table-title">
            <CreditCard size={18} />
            <span>Payment Records</span>
          </div>

          {/* Filter pills */}
          <div className="ap-filters">
            {["all", "completed", "pending", "failed"].map(s => (
              <button
                key={s}
                className={`ap-filter-pill ap-filter--${s} ${filterStatus === s ? "ap-filter--active" : ""}`}
                onClick={() => setFilterStatus(s)}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
                <span className="ap-filter-count">{counts[s]}</span>
              </button>
            ))}
          </div>
        </div>

        {filteredPayments.length === 0 ? (
          <div className="ap-empty">
            <CreditCard size={40} />
            <p>No payments found</p>
          </div>
        ) : (
          <div className="ap-table-wrap">
            <table className="ap-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Payment ID</th>
                  <th>Receipt</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment, idx) => {
                  const cfg = STATUS_CONFIG[payment.status] || STATUS_CONFIG.pending;
                  const Icon = cfg.Icon;
                  return (
                    <tr key={payment._id} style={{ "--row-i": idx }}>
                      <td>
                        <div className="ap-student">
                          <div className="ap-avatar">
                            {payment.studentName.split(" ").map(w => w[0]).slice(0,2).join("")}
                          </div>
                          <div>
                            <div className="ap-student-name">{payment.studentName}</div>
                            <div className="ap-student-id">{payment.studentId}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="ap-amount">
                          <IndianRupee size={13} />
                          {payment.amount.toLocaleString("en-IN")}
                        </span>
                      </td>
                      <td>
                        <span className={`ap-status ${cfg.cls}`}>
                          <Icon size={13} />
                          {cfg.label}
                        </span>
                      </td>
                      <td className="ap-date">{formatDate(payment.date)}</td>
                      <td>
                        <span className="ap-pid">
                          {payment.razorpayPaymentId ? payment.razorpayPaymentId.slice(-8) : "—"}
                        </span>
                      </td>
                      <td>
                        {payment.status === "completed" && (
                          <button className="ap-dl-btn" title="Download Receipt" onClick={() => downloadReceipt(payment)}>
                            <Download size={14} />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}