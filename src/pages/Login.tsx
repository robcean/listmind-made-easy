import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useStore } from "@/store/useStore";
import { login as apiLogin, setToken } from "@/services/api";
import { t } from "@/i18n";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const Login = () => {
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
      const result = await apiLogin(email, password);
      setToken(result.token);
      login();
      navigate("/");
    } catch (err: any) {
      setError(err.message ?? "Login failed");
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
          <p className="text-muted-foreground text-sm">{t("auth.welcome")}</p>
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
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "..." : t("auth.login")}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          {t("auth.no_account")}{" "}
          <Link to="/signup" className="text-primary underline underline-offset-4">
            {t("auth.signup")}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
