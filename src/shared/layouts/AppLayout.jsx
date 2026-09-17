import Header from "../../components/Layout/Header/Header";
import Footer from "../../components/Layout/Footer/Footer";
import CustomerChatWidget from "../../features/Chat/CustomerChatWidget";
import RatingNotification from "../../components/RatingNotification/RatingNotification";

const AppLayout = ({ children }) => (
  <div className="app">
    <Header />
    <main className="main-content-app">{children}</main>
    <Footer />
    <CustomerChatWidget />
    <RatingNotification />
  </div>
);

export default AppLayout;
