import { UI_MESSAGES } from "../../constants/messages";

const EmptyState = ({ message = UI_MESSAGES.EMPTY }) => (
  <div role="status">{message}</div>
);

export default EmptyState;
