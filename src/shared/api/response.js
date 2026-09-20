export const normalizeApiResponse = (payload) => {
  if (payload && typeof payload === "object" && "success" in payload) {
    return {
      timestamp: payload.timestamp ?? null,
      success: payload.success === true,
      status: payload.status ?? null,
      code: payload.code ?? null,
      message: payload.message ?? null,
      data: payload.data ?? null,
      meta: payload.meta ?? null,
      errors: payload.errors ?? null,
      path: payload.path ?? null,
      requestId: payload.requestId ?? null,
    };
  }

  return {
    timestamp: null,
    success: true,
    status: null,
    code: null,
    message: null,
    data: payload,
    meta: null,
    errors: null,
    path: null,
    requestId: null,
  };
};

export const unwrapApiResponse = (payload) => normalizeApiResponse(payload).data;

export default unwrapApiResponse;
