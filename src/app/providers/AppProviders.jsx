import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { persistor, store } from "../../redux/store";
import LoadingState from "../../shared/components/feedback/LoadingState";

const AppProviders = ({ children }) => (
  <Provider store={store}>
    <PersistGate loading={<LoadingState />} persistor={persistor}>
      {children}
    </PersistGate>
  </Provider>
);

export default AppProviders;
