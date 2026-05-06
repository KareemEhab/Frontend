import { Formik, Form } from "formik";
import * as Yup from "yup";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { parseApiError } from "../api/errors";
import { TextInput } from "../components/TextInput";
import { Button } from "../components/Button";
import { getAuthToken, setAuthToken } from "../auth/token";
import { useCart } from "../cart/CartContext";
import { flushPendingCartAfterAuth } from "../cart/pendingCartFlush";
import { safeInternalPath } from "../lib/safeRedirectPath";

const registerSchema = Yup.object({
  first_name: Yup.string()
    .trim()
    .min(3, "First name must be at least 3 characters")
    .max(50, "First name must be at most 50 characters")
    .required("First name is required"),
  last_name: Yup.string()
    .trim()
    .min(3, "Last name must be at least 3 characters")
    .max(50, "Last name must be at most 50 characters")
    .required("Last name is required"),
  email: Yup.string().email("Enter a valid email address").required("Email is required"),
  password: Yup.string()
    .min(5, "Password must be at least 5 characters")
    .max(255, "Password must be at most 255 characters")
    .required("Password is required"),
});

type RegisterValues = {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
};

function readRegisterToken(headers: Record<string, unknown>): string | undefined {
  const raw =
    headers["x-auth-token"] ??
    headers["X-Auth-Token"] ??
    (headers as { "x-auth-token"?: string })["x-auth-token"];
  return typeof raw === "string" && raw.trim() ? raw : undefined;
}

export function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { addCourseId } = useCart();

  if (getAuthToken()) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 font-sans">
      <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="mb-8 font-sans text-2xl font-semibold leading-[160%] text-slate-900">Create account</h1>

        <Formik<RegisterValues>
          initialValues={{ first_name: "", last_name: "", email: "", password: "" }}
          validationSchema={registerSchema}
          validateOnBlur
          validateOnChange={false}
          onSubmit={async (values, { setStatus }) => {
            setStatus(undefined);
            try {
              const res = await api.post("/api/users", {
                first_name: values.first_name.trim(),
                last_name: values.last_name.trim(),
                email: values.email.trim(),
                password: values.password,
              });
              const token = readRegisterToken(res.headers as Record<string, unknown>);
              if (!token) {
                setStatus({
                  error: "Account created but no session token was received. Please sign in.",
                });
                return;
              }
              setAuthToken(token);
              flushPendingCartAfterAuth(addCourseId);
              const stateFrom = (location.state as { from?: string } | null)?.from;
              navigate(safeInternalPath(stateFrom, "/"), { replace: true });
            } catch (err) {
              setStatus({ error: parseApiError(err) });
            }
          }}
        >
          {({ values, errors, touched, handleChange, handleBlur, isSubmitting, status }) => (
            <Form className="flex flex-col gap-6" noValidate>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <TextInput
                  id="first_name"
                  name="first_name"
                  label="First name"
                  type="text"
                  placeholder="Enter first name"
                  required
                  value={values.first_name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.first_name}
                  showError={Boolean(touched.first_name && errors.first_name)}
                />
                <TextInput
                  id="last_name"
                  name="last_name"
                  label="Last name"
                  type="text"
                  placeholder="Enter last name"
                  required
                  value={values.last_name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.last_name}
                  showError={Boolean(touched.last_name && errors.last_name)}
                />
              </div>

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
                placeholder="Choose a password"
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
                {isSubmitting ? "Creating account…" : "Create account"}
              </Button>

              <p className="text-center font-sans text-[0.875rem] leading-[160%] text-slate-600">
                Already have an account?{" "}
                <Link to="/login" state={location.state} className="font-medium text-[#00B8FF] underline-offset-2 hover:underline">
                  Sign in
                </Link>
              </p>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}
