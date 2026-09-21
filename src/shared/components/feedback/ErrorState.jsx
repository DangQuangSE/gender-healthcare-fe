import { UI_MESSAGES } from "../../constants/messages";

const ErrorState = ({ message = UI_MESSAGES.UNKNOWN_ERROR, onRetry }) => (
  <div role="alert">
    <p>{message}</p>
    {onRetry && <button onClick={onRetry}>Thử lại</button>}
  </div>
);

export default ErrorState;
