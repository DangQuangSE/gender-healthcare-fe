import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { persistor, store } from "../../redux/store";
import Loading from "../../components/Loading/Loading";

const AppProviders = ({ children }) => (
  <Provider store={store}>
    <PersistGate loading={<Loading />} persistor={persistor}>
      {children}
    </PersistGate>
  </Provider>
);

export default AppProviders;
