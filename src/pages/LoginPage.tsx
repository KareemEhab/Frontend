import { Formik, Form } from "formik";
import * as Yup from "yup";
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../api/client";
import { parseApiError } from "../api/errors";
import { TextInput } from "../components/TextInput";
import { Button } from "../components/Button";
import { getAuthToken, setAuthToken } from "../auth/token";
import { useCart } from "../cart/CartContext";
import { flushPendingCartAfterAuth } from "../cart/pendingCartFlush";
import { safeInternalPath } from "../lib/safeRedirectPath";

const loginSchema = Yup.object({
  email: Yup.string().email("Enter a valid email address").required("Email is required"),
  password: Yup.string()
    .min(5, "Password must be at least 5 characters")
    .required("Password is required"),
});

type LoginValues = {
  email: string;
  password: string;
};

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { addCourseId, refresh } = useCart();

  if (getAuthToken()) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 font-sans">
      <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="mb-8 font-sans text-2xl font-semibold leading-[160%] text-slate-900">Sign in</h1>

        <Formik<LoginValues>
          initialValues={{ email: "", password: "" }}
          validationSchema={loginSchema}
          validateOnBlur
          validateOnChange={false}
          onSubmit={async (values, { setStatus }) => {
            setStatus(undefined);
            try {
              const { data } = await api.post<string>("/api/auth", {
                email: values.email.trim(),
                password: values.password,
              });
              if (typeof data !== "string" || !data.trim()) {
                setStatus({ error: "Invalid response from server. Please try again." });
                return;
              }
              setAuthToken(data);
              await refresh();
              await flushPendingCartAfterAuth(addCourseId);
              const redirectParam = searchParams.get("redirect");
              const stateFrom = (location.state as { from?: string } | null)?.from;
              const target = safeInternalPath(redirectParam, safeInternalPath(stateFrom, "/"));
              navigate(target, { replace: true });
            } catch (err) {
              setStatus({ error: parseApiError(err) });
            }
          }}
        >
          {({ values, errors, touched, handleChange, handleBlur, isSubmitting, status }) => (
            <Form className="flex flex-col gap-6" noValidate>
              <TextInput
                id="email"
                name="email"
                label="Email"
                type="email"
                placeholder="Enter your email"
                required
                value={values.email}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.email}
                showError={Boolean(touched.email && errors.email)}
              />

              <TextInput
                id="password"
                name="password"
                label="Password"
                type="password"
                placeholder="Enter your password"
                required
                value={values.password}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.password}
                showError={Boolean(touched.password && errors.password)}
              />

              {status && "error" in status && status.error ? (
                <p role="alert" className="font-sans text-sm font-normal leading-[160%] text-red-500">
                  {status.error}
                </p>
              ) : null}

              <Button variant="submit" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Signing in…" : "Sign in"}
              </Button>

              <p className="text-center font-sans text-[0.875rem] leading-[160%] text-slate-600">
                Need an account?{" "}
                <Link to="/register" state={location.state} className="font-medium text-[#00B8FF] underline-offset-2 hover:underline">
                  Register
                </Link>
              </p>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}
