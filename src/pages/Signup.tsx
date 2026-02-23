import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useStore } from "@/store/useStore";
import { signup as apiSignup, setToken } from "@/services/api";
import { t } from "@/i18n";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const login = useStore((s) => s.login);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await apiSignup(email, password);
      setToken(result.token);
      login();
      navigate("/");
    } catch (err: any) {
      setError(err.message ?? "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            🔄 meSync
          </h1>
          <p className="text-muted-foreground text-sm">{t("auth.create_account")}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">{t("auth.email")}</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="bg-card border-border"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">{t("auth.password")}</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="bg-card border-border"
              minLength={6}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "..." : t("auth.signup")}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          {t("auth.have_account")}{" "}
          <Link to="/login" className="text-primary underline underline-offset-4">
            {t("auth.login")}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
