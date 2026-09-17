import { Navigate, Route, Routes } from "react-router-dom";

import Hero from "../../pages/Home/Hero/Hero";
import Services from "../../pages/Home/Services";
import Articles from "../../features/bloglist/Articles";
import Testimonials from "../../pages/Home/Testimonials/Testimonials";
import AppointmentForm from "../../features/Services/BookingService/BookingService";
import CycleTracker from "../../features/Services/CycleTracker/CycleTracker";
import ContactPage from "../../features/Services/Contact/ContactPage";
import Doctor from "../../features/Services/DoctorList/DoctorList";
import ForgotPasswordOTP from "../../features/authentication/ForgotPassword";
import AllBlog from "../../features/bloglist/allBlog";
import BlogDetail from "../../features/bloglist/BlogDetail";
import Staff from "../../features/Dashboard/StaffDashboard/Staff";
import Consultant from "../../features/Dashboard/ConsultantDashboard/ConsultantMain";
import Admin from "../../features/Dashboard/AdminDashboard/Admin";
import UserProfile from "../../pages/UserProfile/userprofile";
import Profile from "../../pages/UserProfile/Profile";
import Booking from "../../pages/UserProfile/Booking/Booking";
import BookingForm from "../../features/Services/Booking/BookingForm";
import ServiceDetail from "../../features/Services/ServiceList/ServiceDetail/ServiceDetail";
import BookingConfirmation from "../../features/Services/Booking/BookingConfirmation";
import Payment from "../../features/Services/Payment/Payment";
import ProtectedRoute from "../../shared/auth/ProtectedRoute";
import { USER_ROLES } from "../../shared/constants/roles";

const HomePage = () => (
  <>
    <Hero />
    <Services />
    <Articles />
    <Testimonials />
  </>
);

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/services" element={<AppointmentForm />} />
    <Route path="/CycleTracker" element={<CycleTracker />} />
    <Route path="/CycleTracking" element={<CycleTracker />} />
    <Route path="/contact" element={<ContactPage />} />
    <Route path="/services/DoctorList" element={<Doctor />} />
    <Route path="/forgot-password" element={<ForgotPasswordOTP />} />
    <Route path="/blog" element={<AllBlog />} />
    <Route path="/blog/:id" element={<BlogDetail />} />
    <Route
      path="/consultant"
      element={
        <ProtectedRoute
          allowedRoles={[USER_ROLES.CONSULTANT, USER_ROLES.ADMIN, USER_ROLES.STAFF]}
        >
          <Consultant />
        </ProtectedRoute>
      }
    />
    <Route
      path="/staff"
      element={
        <ProtectedRoute allowedRoles={[USER_ROLES.STAFF, USER_ROLES.ADMIN]}>
          <Staff />
        </ProtectedRoute>
      }
    />
    <Route
      path="/admin"
      element={
        <ProtectedRoute allowedRoles={[USER_ROLES.ADMIN]}>
          <Admin />
        </ProtectedRoute>
      }
    />
    <Route path="/user" element={<UserProfile />}>
      <Route index element={<Profile />} />
      <Route path="profile" element={<Profile />} />
      <Route path="booking" element={<Booking />} />
    </Route>
    <Route path="/booking" element={<BookingForm />} />
    <Route path="/service-detail/:id" element={<ServiceDetail />} />
    <Route path="/booking-confirmation" element={<BookingConfirmation />} />
    <Route path="/payment" element={<Payment />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default AppRoutes;
