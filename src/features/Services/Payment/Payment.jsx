import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Result, Button, Spin, message } from "antd";
import {
  createPayOSDepositPayment,
  createPayOSFullPayment,
  getPaymentLinkData,
  getPayOSPaymentStatus,
  getPaymentStatusData,
} from "../../payments/paymentApi";
import { getApiErrorMessage } from "../../../shared/api/errors";
import bookingStorage from "../../../shared/storage/bookingStorage";
import { PAYMENT_MESSAGES } from "../../../shared/constants/paymentMessages";
import {
  getPaymentIntent,
  isTerminalPaymentStatus,
  parsePayOSReturn,
  PAYMENT_INTENTS,
} from "../../payments/paymentFlow";
import { refreshPayOSStatus } from "../../payments/paymentStatus";
import { PAYMENT_VIEW_STATE } from "./Payment.constants";

const Payment = () => {
  const navigate = useNavigate();
  const { search } = useLocation();
  const [viewState, setViewState] = useState(PAYMENT_VIEW_STATE.REDIRECTING);
  const [statusResponse, setStatusResponse] = useState(null);
  const booking = useMemo(() => bookingStorage.getPendingBooking(), []);
  const returnState = useMemo(() => parsePayOSReturn(search), [search]);

  const refreshStatus = useCallback(async (orderCode) => {
    if (!orderCode) {
      message.error(PAYMENT_MESSAGES.RETURN_INVALID);
      setViewState(PAYMENT_VIEW_STATE.ERROR);
      return null;
    }

    const latest = await refreshPayOSStatus(
      async (code) => getPaymentStatusData(await getPayOSPaymentStatus(code)),
      orderCode,
    );
    setStatusResponse(latest);
    if (isTerminalPaymentStatus(latest?.paymentStatus)) {
      bookingStorage.removePendingBooking();
      setViewState(latest.paymentStatus === "SUCCESS"
        ? PAYMENT_VIEW_STATE.SUCCESS
        : PAYMENT_VIEW_STATE.ERROR);
      return latest;
    }

    setViewState(PAYMENT_VIEW_STATE.PENDING);
    return latest;
  }, []);

  useEffect(() => {
    let active = true;

    const run = async () => {
      try {
        if (returnState.kind !== "none") {
          if (returnState.kind === "invalid") {
            message.error(PAYMENT_MESSAGES.RETURN_INVALID);
            if (active) setViewState(PAYMENT_VIEW_STATE.ERROR);
            return;
          }

          if (returnState.kind === "cancelled") {
            message.warning(PAYMENT_MESSAGES.RETURN_CANCELLED);
          }

          await refreshStatus(returnState.orderCode);
          return;
        }

        if (!booking?.appointmentId) {
          if (active) setViewState(PAYMENT_VIEW_STATE.ERROR);
          return;
        }

        const paymentIntent = getPaymentIntent(booking);
        const createPayment = paymentIntent === PAYMENT_INTENTS.DEPOSIT
          ? createPayOSDepositPayment
          : createPayOSFullPayment;
        const link = getPaymentLinkData(await createPayment(booking.appointmentId));

        if (!link?.checkoutUrl || !link?.orderCode) {
          throw new Error(PAYMENT_MESSAGES.CREATE_LINK_FAILED);
        }

        bookingStorage.setPendingBooking({
          ...booking,
          paymentIntent,
          orderCode: link.orderCode,
          paymentLinkId: link.paymentLinkId,
        });
        if (active) {
          setViewState(PAYMENT_VIEW_STATE.REDIRECTING);
          window.location.assign(link.checkoutUrl);
        }
      } catch (error) {
        if (!active) return;
        message.error(getApiErrorMessage(error, PAYMENT_MESSAGES.INITIALIZE_FAILED));
        setViewState(PAYMENT_VIEW_STATE.ERROR);
      }
    };

    run();
    return () => {
      active = false;
    };
  }, [booking, refreshStatus, returnState]);

  if (viewState === PAYMENT_VIEW_STATE.REDIRECTING) {
    return <Spin tip={PAYMENT_MESSAGES.PAYMENT_LOADING} fullscreen />;
  }

  if (viewState === PAYMENT_VIEW_STATE.SUCCESS) {
    return (
      <Result
        status="success"
        title={PAYMENT_MESSAGES.SUCCESS}
        subTitle={PAYMENT_MESSAGES.SUCCESS_SUBTITLE}
        extra={<Button type="primary" onClick={() => navigate("/user/booking")}>
          {PAYMENT_MESSAGES.VIEW_BOOKING}
        </Button>}
      />
    );
  }

  if (viewState === PAYMENT_VIEW_STATE.PENDING) {
    return (
      <Result
        status="info"
        title={PAYMENT_MESSAGES.PENDING}
        subTitle={statusResponse?.message || PAYMENT_MESSAGES.PENDING_SUBTITLE}
        extra={<Button onClick={() => refreshStatus(returnState.orderCode || booking?.orderCode)}>
          {PAYMENT_MESSAGES.REFRESH_STATUS}
        </Button>}
      />
    );
  }

  return (
    <Result
      status="error"
      title={PAYMENT_MESSAGES.FAILED_OR_CANCELLED}
      extra={<Button onClick={() => navigate("/user/booking")}>
        {PAYMENT_MESSAGES.VIEW_BOOKING}
      </Button>}
    />
  );
};

export default Payment;
