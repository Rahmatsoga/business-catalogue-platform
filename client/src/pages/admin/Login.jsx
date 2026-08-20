import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Input from "../../components/Input";
import Button from "../../components/Button";
import Card from "../../components/Card";

export default function Login() {
  const { admin, checkingSession, login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!checkingSession && admin) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(formData.email, formData.password);
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "var(--color-bg-alt)",
      }}
    >
      <Card style={{ width: 380 }}>
        <h1 style={{ fontSize: 22, marginBottom: "6px" }}>Admin Login</h1>
        <p style={{ color: "var(--color-text-muted)", fontSize: 14, marginBottom: "20px" }}>
          Sign in to manage your catalogue.
        </p>

        <form onSubmit={handleSubmit}>
          <Input
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="admin@example.com"
            required
          />
          <Input
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            required
          />

          {error && (
            <p style={{ color: "#dc2626", fontSize: 14, marginBottom: "12px" }}>{error}</p>
          )}

          <Button type="submit" fullWidth disabled={submitting}>
            {submitting ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
