import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import AppProviders from "./app/providers/AppProviders";
import AppRoutes from "./app/router/routes";
import AppLayout from "./shared/layouts/AppLayout";
import { defaultToastConfig } from "./utils/toast";
import "./App.css";

function App() {
  return (
    <AppProviders>
      <AppLayout>
        <ToastContainer
          position={defaultToastConfig.position}
          autoClose={defaultToastConfig.autoClose}
          hideProgressBar={defaultToastConfig.hideProgressBar}
          newestOnTop={defaultToastConfig.newestOnTop}
          closeOnClick={defaultToastConfig.closeOnClick}
          rtl={defaultToastConfig.rtl}
          pauseOnFocusLoss
          draggable={defaultToastConfig.draggable}
          pauseOnHover={defaultToastConfig.pauseOnHover}
          theme="light"
        />
        <AppRoutes />
      </AppLayout>
    </AppProviders>
  );
}

export default App;
