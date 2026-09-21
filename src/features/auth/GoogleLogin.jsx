import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import { GOOGLE_CLIENT_ID } from "../../shared/config/env";

const GoogleLoginButton = ({ onSuccess, onError }) => (
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <GoogleLogin
      onSuccess={onSuccess}
      onError={onError}
      useOneTap
    />
  </GoogleOAuthProvider>
);

export default GoogleLoginButton;
