import { CheckCircle, XCircle } from "lucide-react";


export default function Toast({ msg, type, visible }) {
  if (!visible || !msg) return null;
  const isError = type === "error";
  return (
    <div className={`cms-toast cms-toast--${isError ? "error" : "success"}`}>
      {isError ? <XCircle size={15} /> : <CheckCircle size={15} />}
      {msg}
    </div>
  );
}
