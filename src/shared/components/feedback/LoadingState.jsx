import { UI_MESSAGES } from "../../constants/messages";

const LoadingState = ({ message = UI_MESSAGES.LOADING }) => (
  <div role="status" aria-live="polite">
    {message}
  </div>
);

export default LoadingState;
