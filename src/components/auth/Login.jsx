import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useLocation, Link } from "react-router-dom";

import { useLoginMutation } from "@/Slice/authSlice";
import { setToken } from "@/utils/auth";
import { ROUTES } from "@/data/data";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Eye, EyeOff, LogIn } from "lucide-react";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "At least 6 characters"),
  remember: z.boolean().default(false),
});

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || ROUTES.products;

  const [showPw, setShowPw] = useState(false);
  const [serverError, setServerError] = useState("");

  const [login, { isLoading }] = useLoginMutation();

  const {
    handleSubmit,
    register,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "", remember: false },
    mode: "onSubmit",
  });

  const onSubmit = async (values) => {
    setServerError("");
    try {
      const res = await login({
        email: values.email,
        password: values.password,
      }).unwrap();

      if (!res?.token) {
        setServerError("Invalid response from server (no token).");
        return;
      }

      setToken(res.token, values.remember);
      navigate(from, { replace: true });
    } catch (e) {
      // Laravel usually returns { message: "..."} or validation errors
      const msg =
        e?.data?.message ||
        e?.error ||
        "Login failed. Check your email and password.";
      setServerError(msg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-muted/40 via-background to-muted/40 p-4">
      <Card className="w-full max-w-md shadow-lg border-0">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-semibold">
            Admin Sign In
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Use your admin credentials to access the dashboard
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {serverError ? (
              <div className="text-sm text-red-600 rounded border border-red-200 bg-red-50 px-3 py-2">
                {serverError}
              </div>
            ) : null}

            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                placeholder="you@example.com"
                type="email"
                autoComplete="email"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-xs text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Password</Label>
              <div className="relative">
                <Input
                  type={showPw ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  {...register("password")}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-2 grid place-items-center px-2 text-muted-foreground hover:opacity-80"
                  onClick={() => setShowPw((s) => !s)}
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Controller
                  control={control}
                  name="remember"
                  render={({ field }) => (
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
                <span className="text-sm text-muted-foreground">
                  Remember me
                </span>
              </div>
              {/* Optional: link to forgot password page if you have it */}
              <Link className="text-sm text-primary hover:underline" to="#">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              <LogIn className="h-4 w-4 mr-2" />
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
