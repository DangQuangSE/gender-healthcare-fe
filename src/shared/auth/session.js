import authStorage from "../storage/authStorage";

export const getLoginSession = (payload) => {
  const response = payload?.data || payload || {};
  const token = response.jwt || response.accessToken || response.token || "";
  const user = response.user || response;

  return {
    token,
    user: user && typeof user === "object" ? user : null,
  };
};

export const saveLoginSession = (payload) => {
  const session = getLoginSession(payload);
  authStorage.saveSession(session.token, session.user);
  return session;
};
