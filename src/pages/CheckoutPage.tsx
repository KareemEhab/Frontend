import { useEffect, useMemo, useState } from "react";
import { Form, Formik } from "formik";
import * as Yup from "yup";
import { Navigate, useNavigate } from "react-router-dom";
import visaPng from "../assets/visa.png";
import { api } from "../api/client";
import { parseApiError } from "../api/errors";
import { getAuthToken } from "../auth/token";
import { useCart } from "../cart/CartContext";
import { TextInput } from "../components/TextInput";
import { CheckoutHeader } from "../components/checkout/CheckoutHeader";
import { OrderDetailsCard } from "../components/checkout/OrderDetailsCard";
import { PaymentRadio } from "../components/checkout/PaymentRadio";
import type { ApiCourse } from "../components/TopCoursesSection";

const TAX_AMOUNT = 20;

const checkoutSchema = Yup.object({
  country: Yup.string().trim().min(2, "Enter a valid country").max(60).required("Country is required"),
  state: Yup.string().trim().min(2, "Enter a valid state").max(80).required("State is required"),
  cardName: Yup.string().trim().min(2, "Enter name on card").max(80).required("Name of card is required"),
  cardNumber: Yup.string()
    .trim()
    .matches(/^\d+$/, "Card number must be numbers only")
    .min(12, "Card number is too short")
    .max(19, "Card number is too long")
    .required("Card number is required"),
  expiry: Yup.string()
    .trim()
    .matches(/^([0-9]{2})\/(\d{2}|\d{4})$/, "Use MM/YY or MM/YYYY")
    .test("month-range", "Invalid expiry month", (v) => {
      if (!v) return false;
      const [mm] = v.split("/");
      const m = Number(mm);
      return Number.isFinite(m) && m >= 1 && m <= 12;
    })
    .required("Expiry date is required"),
  cvc: Yup.string()
    .trim()
    .matches(/^\d{3,4}$/, "CVC/CVV must be 3 or 4 digits")
    .required("CVC/CVV is required"),
});

type CheckoutValues = {
  country: string;
  state: string;
  cardName: string;
  cardNumber: string;
  expiry: string;
  cvc: string;
};

export function CheckoutPage() {
  const navigate = useNavigate();
  const { courseIds, setCourseIds } = useCart();
  const loggedIn = Boolean(getAuthToken());

  const [courses, setCourses] = useState<ApiCourse[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!loggedIn) return;
    let cancelled = false;
    (async () => {
      if (courseIds.length === 0) {
        setCourses([]);
        setLoadError(null);
        return;
      }
      try {
        const results = await Promise.all(courseIds.map((id) => api.get<ApiCourse>(`/api/courses/${encodeURIComponent(id)}`)));
        if (!cancelled) {
          setCourses(results.map((r) => r.data));
          setLoadError(null);
        }
      } catch (e) {
        if (!cancelled) setLoadError(parseApiError(e));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loggedIn, courseIds]);

  const totals = useMemo(() => {
    const tax = courses.length > 0 ? TAX_AMOUNT : 0;
    const originalSum = courses.reduce((s, c) => s + c.price + c.discount, 0);
    const discountSum = courses.reduce((s, c) => s + c.discount, 0);
    const afterDiscount = courses.reduce((s, c) => s + c.price, 0);
    const grandTotal = courses.length > 0 ? afterDiscount + tax : 0;
    return { tax, originalSum, discountSum, grandTotal };
  }, [courses]);

  if (!loggedIn) return <Navigate to="/login" replace state={{ from: "/checkout" }} />;

  return (
    <section className="px-15 pt-7 pb-15 font-sans">
      <div className="mx-auto flex max-w-360 flex-col gap-15 lg:flex-row lg:justify-between">
        <div className="min-w-0 flex-1">
          <CheckoutHeader />

          <div className="mt-5.5 rounded-2xl p-4">
            <Formik<CheckoutValues>
              initialValues={{
                country: "",
                state: "",
                cardName: "",
                cardNumber: "",
                expiry: "",
                cvc: "",
              }}
              validationSchema={checkoutSchema}
              validateOnBlur
              validateOnChange={false}
              onSubmit={async (values, { setStatus, setSubmitting }) => {
                setStatus(undefined);
                try {
                  await api.post("/api/orders", {
                    country: values.country.trim(),
                    state: values.state.trim(),
                    paymentMethod: "card",
                    cardName: values.cardName.trim(),
                    cardNumber: values.cardNumber.trim(),
                    expiry: values.expiry.trim(),
                    cvc: values.cvc.trim(),
                  });
                  setCourseIds([]);
                  navigate("/order-complete", { replace: true });
                } catch (e) {
                  setStatus({ error: parseApiError(e) });
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              {({ values, errors, touched, handleChange, handleBlur, isSubmitting, status }) => (
                <Form id="checkout-form" className="flex flex-col gap-4" noValidate>
                  <div className="rounded-2xl border border-solid border-[#E2E8F0] px-4 py-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <TextInput
                        id="country"
                        name="country"
                        label="Country"
                        placeholder="Enter Country"
                        required
                        value={values.country}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={errors.country}
                        showError={Boolean(touched.country && errors.country)}
                        autoComplete="country-name"
                      />
                      <TextInput
                        id="state"
                        name="state"
                        label="State/Union Territory"
                        placeholder="Enter State"
                        required
                        value={values.state}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={errors.state}
                        showError={Boolean(touched.state && errors.state)}
                        autoComplete="address-level1"
                      />
                    </div>

                    <div className="mt-4">
                      <p className="mb-2 font-sans text-[1.125rem] font-semibold leading-[160%] text-slate-900">
                        Payment Method
                      </p>
                      <div className="rounded-lg bg-[#F8FAFC] p-4">
                        <div className="flex items-center justify-between gap-4">
                          <PaymentRadio label="Credit/Debit Card" />
                          <img src={visaPng} alt="" className="h-5 w-auto object-contain" />
                        </div>

                        <div className="mt-4 flex flex-col gap-4">
                          <TextInput
                            id="cardName"
                            name="cardName"
                            label="Name of Card"
                            placeholder="Name of card"
                            required
                            value={values.cardName}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={errors.cardName}
                            showError={Boolean(touched.cardName && errors.cardName)}
                            autoComplete="cc-name"
                          />

                          <TextInput
                            id="cardNumber"
                            name="cardNumber"
                            label="Card Number"
                            placeholder="Card Number"
                            required
                            value={values.cardNumber}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={errors.cardNumber}
                            showError={Boolean(touched.cardNumber && errors.cardNumber)}
                            inputMode="numeric"
                            pattern="\\d*"
                            maxLength={19}
                            autoComplete="cc-number"
                          />

                          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <TextInput
                              id="expiry"
                              name="expiry"
                              label="Expiry Date"
                              placeholder="Enter Expiry Date"
                              required
                              value={values.expiry}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              error={errors.expiry}
                              showError={Boolean(touched.expiry && errors.expiry)}
                              inputMode="numeric"
                              autoComplete="cc-exp"
                            />
                            <TextInput
                              id="cvc"
                              name="cvc"
                              label="CVC/CVV"
                              placeholder="Enter CVC/CVV"
                              required
                              value={values.cvc}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              error={errors.cvc}
                              showError={Boolean(touched.cvc && errors.cvc)}
                              inputMode="numeric"
                              pattern="\\d*"
                              maxLength={4}
                              autoComplete="cc-csc"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {status && "error" in status && status.error ? (
                    <p role="alert" className="font-sans text-[0.875rem] text-red-600">
                      {status.error}
                    </p>
                  ) : null}

                  {loadError ? (
                    <p role="alert" className="font-sans text-[0.875rem] text-red-600">
                      {loadError}
                    </p>
                  ) : null}

                  <div className="lg:hidden">
                    <button
                      type="submit"
                      disabled={isSubmitting || courseIds.length === 0}
                      className="mt-4 w-full cursor-pointer rounded-sm border-none bg-[#00B8FF] py-3.25 font-sans text-[0.875rem] font-medium leading-[160%] text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Proceed to Checkout
                    </button>
                  </div>

                  <div className="hidden lg:block" />
                </Form>
              )}
            </Formik>
          </div>
        </div>

        <aside className="w-full shrink-0 lg:w-[min(100%,22.5rem)]">
          <h2 className="font-sans text-[1.25rem] font-semibold leading-[150%] text-[#2437AC]">Order Details</h2>

          <div className="mt-2">
            <OrderDetailsCard
              originalSum={totals.originalSum}
              discountSum={totals.discountSum}
              tax={totals.tax}
              total={totals.grandTotal}
            />
          </div>

          <button
            type="submit"
            form="checkout-form"
            disabled={courseIds.length === 0}
            className="mt-4 w-full cursor-pointer rounded-sm border-none bg-[#00B8FF] py-3.25 font-sans text-[0.875rem] font-medium leading-[160%] text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Proceed to Checkout
          </button>
        </aside>
      </div>
    </section>
  );
}

