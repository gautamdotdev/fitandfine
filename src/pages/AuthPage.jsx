import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  ArrowRight,
  Check,
  Mail,
  Lock,
  User,
  Phone,
} from "lucide-react";
import { useToasts } from "../lib/store.js";
import { useShop } from "../context/ShopContext.jsx";

function FloatingInput({
  id,
  label,
  type = "text",
  value,
  onChange,
  icon: Icon,
  required,
  autoComplete,
  error,
}) {
  const [focused, setFocused] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (showPass ? "text" : "password") : type;
  const lifted = focused || value.length > 0;
  return (
    <div style={{ position: "relative", marginBottom: error ? "6px" : "0" }}>
      <div
        style={{
          position: "absolute",
          left: "14px",
          top: "50%",
          transform: "translateY(-50%)",
          color: focused
            ? "var(--color-gold)"
            : "var(--color-muted-foreground)",
          transition: "color 0.2s",
          pointerEvents: "none",
          zIndex: 1,
        }}
      >
        <Icon size={15} strokeWidth={1.8} />
      </div>
      <label
        htmlFor={id}
        style={{
          position: "absolute",
          left: "42px",
          top: lifted ? "9px" : "50%",
          transform: lifted ? "translateY(0) scale(0.82)" : "translateY(-50%)",
          transformOrigin: "left",
          fontSize: "13px",
          fontWeight: 500,
          color: focused
            ? "var(--color-gold)"
            : "var(--color-muted-foreground)",
          transition: "all 0.2s cubic-bezier(0.16,1,0.3,1)",
          pointerEvents: "none",
          zIndex: 1,
          letterSpacing: lifted ? "0.06em" : "0",
          textTransform: lifted ? "uppercase" : "none",
          fontFamily: "inherit",
        }}
      >
        {label}
      </label>
      <input
        id={id}
        type={inputType}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        required={required}
        autoComplete={autoComplete}
        style={{
          width: "100%",
          height: "56px",
          paddingTop: lifted ? "18px" : "0",
          paddingBottom: lifted ? "6px" : "0",
          paddingLeft: "42px",
          paddingRight: isPassword ? "44px" : "14px",
          borderRadius: "12px",
          border: `1.5px solid ${error ? "var(--color-destructive)" : focused ? "var(--color-gold)" : "var(--color-border)"}`,
          backgroundColor: focused
            ? "color-mix(in oklch, var(--color-gold) 3%, var(--color-background))"
            : "var(--color-surface)",
          color: "var(--color-foreground)",
          fontSize: "14px",
          fontWeight: 500,
          outline: "none",
          transition: "all 0.2s",
          boxSizing: "border-box",
          fontFamily: "inherit",
          boxShadow: focused
            ? "0 0 0 3px color-mix(in oklch, var(--color-gold) 12%, transparent)"
            : "none",
        }}
      />
      {isPassword && (
        <button
          type="button"
          onClick={() => setShowPass((s) => !s)}
          style={{
            position: "absolute",
            right: "14px",
            top: "50%",
            transform: "translateY(-50%)",
            color: "var(--color-muted-foreground)",
            background: "none",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            transition: "color 0.2s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.color = "var(--color-foreground)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.color = "var(--color-muted-foreground)")
          }
        >
          {showPass ? (
            <EyeOff size={16} strokeWidth={1.8} />
          ) : (
            <Eye size={16} strokeWidth={1.8} />
          )}
        </button>
      )}
      {error && (
        <p
          style={{
            fontSize: "11px",
            color: "var(--color-destructive)",
            marginTop: "4px",
            paddingLeft: "4px",
          }}
        >
          ⚠ {error}
        </p>
      )}
    </div>
  );
}

function SocialBtn({ children, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        flex: 1,
        height: "44px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        borderRadius: "10px",
        border: `1.5px solid ${hov ? "var(--color-foreground)" : "var(--color-border)"}`,
        backgroundColor: hov ? "var(--color-surface)" : "transparent",
        fontSize: "12px",
        fontWeight: 600,
        color: "var(--color-foreground)",
        cursor: "pointer",
        transition: "all 0.2s",
        fontFamily: "inherit",
      }}
    >
      {children}
    </button>
  );
}

function LoginForm({ onSwitch }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const { login } = useShop();

  const validate = () => {
    const e = {};
    if (!email) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Enter a valid email";
    if (!password) e.password = "Password is required";
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    setLoading(true);
    try {
      await login({ email, password });
      navigate("/");
    } catch (err) {
      setErrors({ password: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ animation: "authFadeIn 0.4s ease-out" }}>
      <h1
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: "clamp(1.8rem, 3vw, 2.4rem)",
          letterSpacing: "-0.02em",
          lineHeight: 1.1,
          marginBottom: "6px",
        }}
      >
        Welcome back
      </h1>
      <p
        style={{
          fontSize: "14px",
          color: "var(--color-muted-foreground)",
          marginBottom: "32px",
        }}
      >
        Sign in to your FIT & FINE account
      </p>
      <div style={{ display: "flex", gap: "10px", marginBottom: "24px" }}>
        <SocialBtn>
          <svg width="16" height="16" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </SocialBtn>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "24px",
        }}
      >
        <div
          style={{
            flex: 1,
            height: "1px",
            backgroundColor: "var(--color-border)",
          }}
        />
        <span
          style={{
            fontSize: "11px",
            fontWeight: 600,
            color: "var(--color-muted-foreground)",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          or
        </span>
        <div
          style={{
            flex: 1,
            height: "1px",
            backgroundColor: "var(--color-border)",
          }}
        />
      </div>
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "14px" }}
      >
        <FloatingInput
          id="login-email"
          label="Email address"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setErrors((err) => ({ ...err, email: "" }));
          }}
          icon={Mail}
          required
          autoComplete="email"
          error={errors.email}
        />
        <FloatingInput
          id="login-password"
          label="Password"
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setErrors((err) => ({ ...err, password: "" }));
          }}
          icon={Lock}
          required
          autoComplete="current-password"
          error={errors.password}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            height: "52px",
            marginTop: "8px",
            borderRadius: "12px",
            border: "none",
            backgroundColor: loading
              ? "var(--color-border)"
              : "var(--color-foreground)",
            color: loading
              ? "var(--color-muted-foreground)"
              : "var(--color-background)",
            fontSize: "12px",
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            cursor: loading ? "not-allowed" : "pointer",
            fontFamily: "inherit",
            transition: "all 0.25s",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
          }}
        >
          {loading ? (
            <>
              <span
                style={{
                  width: "16px",
                  height: "16px",
                  borderRadius: "50%",
                  border: "2px solid var(--color-muted-foreground)",
                  borderTopColor: "transparent",
                  display: "inline-block",
                  animation: "spin 0.7s linear infinite",
                }}
              />
              Signing in…
            </>
          ) : (
            <>
              Sign In <ArrowRight size={15} strokeWidth={2.5} />
            </>
          )}
        </button>
      </form>
      <p
        style={{
          fontSize: "13px",
          color: "var(--color-muted-foreground)",
          textAlign: "center",
          marginTop: "28px",
        }}
      >
        New to FIT & FINE?{" "}
        <button
          onClick={onSwitch}
          style={{
            fontWeight: 700,
            color: "var(--color-foreground)",
            textDecoration: "underline",
            textUnderlineOffset: "3px",
            background: "none",
            border: "none",
            cursor: "pointer",
            fontFamily: "inherit",
            fontSize: "13px",
            transition: "color 0.2s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.color = "var(--color-gold)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.color = "var(--color-foreground)")
          }
        >
          Create an account →
        </button>
      </p>
    </div>
  );
}

function RegisterForm({ onSwitch }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
  });
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const push = useToasts((s) => s.push);

  const set = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setErrors((err) => ({ ...err, [field]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Full name is required";
    if (!form.email) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email";
    if (form.phone && !/^[0-9]{10}$/.test(form.phone))
      e.phone = "Enter a valid 10-digit number";
    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 8)
      e.password = "Must be at least 8 characters";
    if (form.confirm !== form.password) e.confirm = "Passwords do not match";
    if (!agree) e.agree = "Please accept the terms";
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          name: form.name,
          phone: form.phone,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed");
      push({ type: "success", message: "Account created! Please sign in." });
      navigate("/");
    } catch (err) {
      setErrors({ email: err.message });
      push({ type: "error", message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ animation: "authFadeIn 0.4s ease-out" }}>
      <h1
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: "clamp(1.8rem, 3vw, 2.4rem)",
          letterSpacing: "-0.02em",
          lineHeight: 1.1,
          marginBottom: "6px",
        }}
      >
        Create account
      </h1>
      <p
        style={{
          fontSize: "14px",
          color: "var(--color-muted-foreground)",
          marginBottom: "32px",
        }}
      >
        Join FIT & FINE — it only takes a minute
      </p>
      <div style={{ display: "flex", gap: "10px", marginBottom: "24px" }}>
        <SocialBtn>
          <svg width="16" height="16" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Sign up with Google
        </SocialBtn>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "24px",
        }}
      >
        <div
          style={{
            flex: 1,
            height: "1px",
            backgroundColor: "var(--color-border)",
          }}
        />
        <span
          style={{
            fontSize: "11px",
            fontWeight: 600,
            color: "var(--color-muted-foreground)",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          or fill in details
        </span>
        <div
          style={{
            flex: 1,
            height: "1px",
            backgroundColor: "var(--color-border)",
          }}
        />
      </div>
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "14px" }}
      >
        <FloatingInput
          id="reg-name"
          label="Full name"
          value={form.name}
          onChange={set("name")}
          icon={User}
          required
          error={errors.name}
          autoComplete="name"
        />
        <FloatingInput
          id="reg-phone"
          label="Phone (optional)"
          type="tel"
          value={form.phone}
          onChange={set("phone")}
          icon={Phone}
          error={errors.phone}
          autoComplete="tel"
        />
        <FloatingInput
          id="reg-email"
          label="Email address"
          type="email"
          value={form.email}
          onChange={set("email")}
          icon={Mail}
          required
          error={errors.email}
          autoComplete="email"
        />
        <FloatingInput
          id="reg-password"
          label="Password"
          type="password"
          value={form.password}
          onChange={set("password")}
          icon={Lock}
          required
          error={errors.password}
          autoComplete="new-password"
        />
        <FloatingInput
          id="reg-confirm"
          label="Confirm password"
          type="password"
          value={form.confirm}
          onChange={set("confirm")}
          icon={Lock}
          required
          error={errors.confirm}
          autoComplete="new-password"
        />
        <div>
          <label
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "10px",
              cursor: "pointer",
              userSelect: "none",
            }}
          >
            <input
              type="checkbox"
              checked={agree}
              onChange={(e) => {
                setAgree(e.target.checked);
                setErrors((err) => ({ ...err, agree: "" }));
              }}
              style={{
                accentColor: "var(--color-gold)",
                width: "15px",
                height: "15px",
                marginTop: "2px",
                cursor: "pointer",
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontSize: "12px",
                color: "var(--color-muted-foreground)",
                lineHeight: 1.5,
              }}
            >
              I agree to the{" "}
              <a
                href="#"
                style={{
                  color: "var(--color-foreground)",
                  fontWeight: 600,
                  textDecoration: "underline",
                  textUnderlineOffset: "2px",
                }}
              >
                Terms of Service
              </a>{" "}
              and{" "}
              <a
                href="#"
                style={{
                  color: "var(--color-foreground)",
                  fontWeight: 600,
                  textDecoration: "underline",
                  textUnderlineOffset: "2px",
                }}
              >
                Privacy Policy
              </a>
            </span>
          </label>
          {errors.agree && (
            <p
              style={{
                fontSize: "11px",
                color: "var(--color-destructive)",
                marginTop: "4px",
                paddingLeft: "4px",
              }}
            >
              ⚠ {errors.agree}
            </p>
          )}
        </div>
        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            height: "52px",
            marginTop: "4px",
            borderRadius: "12px",
            border: "none",
            backgroundColor: loading
              ? "var(--color-border)"
              : "var(--color-foreground)",
            color: loading
              ? "var(--color-muted-foreground)"
              : "var(--color-background)",
            fontSize: "12px",
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            cursor: loading ? "not-allowed" : "pointer",
            fontFamily: "inherit",
            transition: "all 0.25s",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
          }}
        >
          {loading ? (
            <>
              <span
                style={{
                  width: "16px",
                  height: "16px",
                  borderRadius: "50%",
                  border: "2px solid var(--color-muted-foreground)",
                  borderTopColor: "transparent",
                  display: "inline-block",
                  animation: "spin 0.7s linear infinite",
                }}
              />
              Creating account…
            </>
          ) : (
            <>
              Create Account <ArrowRight size={15} strokeWidth={2.5} />
            </>
          )}
        </button>
      </form>
      <p
        style={{
          fontSize: "13px",
          color: "var(--color-muted-foreground)",
          textAlign: "center",
          marginTop: "24px",
        }}
      >
        Already have an account?{" "}
        <button
          onClick={onSwitch}
          style={{
            fontWeight: 700,
            color: "var(--color-foreground)",
            textDecoration: "underline",
            textUnderlineOffset: "3px",
            background: "none",
            border: "none",
            cursor: "pointer",
            fontFamily: "inherit",
            fontSize: "13px",
            transition: "color 0.2s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.color = "var(--color-gold)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.color = "var(--color-foreground)")
          }
        >
          Sign in →
        </button>
      </p>
    </div>
  );
}

export default function AuthPage() {
  const [mode, setMode] = useState(() =>
    window.location.hash === "#register" ? "register" : "login",
  );
  const formRef = useRef(null);
  const switchMode = (to) => {
    formRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    setMode(to);
    window.location.hash = to === "register" ? "#register" : "#login";
  };
  return (
    <div
      style={{
        minHeight: "calc(100vh - 64px)",
        display: "flex",
        alignItems: "stretch",
      }}
    >
      <div
        className="auth-brand-panel"
        style={{ flex: "0 0 45%", padding: "32px", display: "none" }}
      >
        <div style={{ position: "sticky", top: "96px" }}>
          {/* BrandPanel can be added here if you want */}
        </div>
      </div>
      <div
        ref={formRef}
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "clamp(24px, 5vw, 64px)",
          overflowY: "auto",
          maxWidth: "560px",
          margin: "0 auto",
          width: "100%",
        }}
      >
        <div style={{ marginBottom: "40px" }}>
          <Link
            to="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "12px",
              fontWeight: 600,
              color: "var(--color-muted-foreground)",
              textDecoration: "none",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = "var(--color-foreground)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "var(--color-muted-foreground)")
            }
          >
            ← Back to store
          </Link>
        </div>
        <div key={mode}>
          {mode === "login" ? (
            <LoginForm onSwitch={() => switchMode("register")} />
          ) : (
            <RegisterForm onSwitch={() => switchMode("login")} />
          )}
        </div>
      </div>
      <style>{`
				@media (min-width: 1024px) { .auth-brand-panel { display: block !important; } }
				.auth-name-row { grid-template-columns: 1fr; }
				@media (min-width: 480px) { .auth-name-row { grid-template-columns: 1fr 1fr !important; } }
				@keyframes authFadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
				@keyframes spin { to { transform: rotate(360deg); } }
			`}</style>
    </div>
  );
}
