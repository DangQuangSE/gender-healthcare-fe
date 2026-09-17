export const unwrapApiResponse = (payload) => {
  if (payload && payload.success === true && "data" in payload) {
    return payload.data;
  }

  return payload;
};

export default unwrapApiResponse;
