import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { LayoutGrid, MessageCircle } from "lucide-react";
import { useStore } from "@/store/useStore";
import { t, setLanguage } from "@/i18n";
import { cn } from "@/lib/utils";
import { useLongPress } from "@/hooks/useLongPress";
import { useCallback, useState } from "react";
import { toast } from "sonner";

const AppLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isChat = location.pathname === "/chat";
  const language = useStore((s) => s.language);
  const setLang = useStore((s) => s.setLanguage);
  const [, forceUpdate] = useState(0);

  const toggleLanguage = useCallback(() => {
    const next = language === "en" ? "es" : "en";
    setLanguage(next);
    setLang(next);
    forceUpdate((v) => v + 1);
    toast(next === "es" ? "🇪🇸 Cambiado a Español" : "🇺🇸 Switched to English", {
      duration: 1500,
    });
  }, [language, setLang]);

  const titleLongPress = useLongPress({
    delay: 600,
    onLongPress: toggleLanguage,
  });

  return (
    <div className="flex flex-col h-[100dvh] bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-4 pt-3 pb-2 safe-top">
        <h1
          {...titleLongPress.handlers}
          className={cn(
            "text-lg font-bold tracking-tight text-foreground select-none cursor-pointer transition-transform",
            titleLongPress.isLongPressing && "scale-95 opacity-70"
          )}
        >
          🔄 {t("app.name")}
        </h1>
        <span className="text-xs text-muted-foreground uppercase tracking-wider">
          {language}
        </span>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>

      {/* Bottom navigation */}
      <nav className="flex items-center border-t border-border bg-card safe-bottom">
        <button
          onClick={() => navigate("/")}
          className={cn(
            "flex flex-1 flex-col items-center gap-1 py-3 text-xs transition-colors",
            !isChat ? "text-primary" : "text-muted-foreground"
          )}
        >
          <LayoutGrid className="h-5 w-5" />
          <span>{t("nav.lists")}</span>
        </button>
        <button
          onClick={() => navigate("/chat")}
          className={cn(
            "flex flex-1 flex-col items-center gap-1 py-3 text-xs transition-colors",
            isChat ? "text-primary" : "text-muted-foreground"
          )}
        >
          <MessageCircle className="h-5 w-5" />
          <span>{t("nav.chat")}</span>
        </button>
      </nav>
    </div>
  );
};

export default AppLayout;
