import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";

import LoadingState from "../../shared/components/feedback/LoadingState";

const Hero = lazy(() => import("../../pages/Home/Hero/Hero"));
const Services = lazy(() => import("../../pages/Home/Services"));
const Articles = lazy(() => import("../../features/bloglist/Articles"));
const Testimonials = lazy(() =>
  import("../../pages/Home/Testimonials/Testimonials")
);
const AppointmentForm = lazy(() =>
  import("../../features/Services/BookingService/BookingService")
);
const CycleTracker = lazy(() =>
  import("../../features/Services/CycleTracker/CycleTracker")
);
const ContactPage = lazy(() =>
  import("../../features/Services/Contact/ContactPage")
);
const Doctor = lazy(() => import("../../features/Services/DoctorList/DoctorList"));
const ForgotPasswordOTP = lazy(() => import("../../features/auth/ForgotPassword"));
const LoginPage = lazy(() => import("../../pages/Login"));
const RegisterPage = lazy(() => import("../../pages/Register"));
const AllBlog = lazy(() => import("../../features/bloglist/allBlog"));
const BlogDetail = lazy(() => import("../../features/bloglist/BlogDetail"));
const Staff = lazy(() => import("../../features/Dashboard/StaffDashboard/Staff"));
const Consultant = lazy(() =>
  import("../../features/Dashboard/ConsultantDashboard/ConsultantMain")
);
const Admin = lazy(() => import("../../features/Dashboard/AdminDashboard/Admin"));
const UserProfile = lazy(() => import("../../pages/UserProfile/userprofile"));
const Profile = lazy(() => import("../../pages/UserProfile/Profile"));
const Booking = lazy(() => import("../../pages/UserProfile/Booking/Booking"));
const BookingForm = lazy(() => import("../../features/Services/Booking/BookingForm"));
const ServiceDetail = lazy(() =>
  import("../../features/Services/ServiceList/ServiceDetail/ServiceDetail")
);
const BookingConfirmation = lazy(() =>
  import("../../features/Services/Booking/BookingConfirmation")
);
const Payment = lazy(() => import("../../features/Services/Payment/Payment"));
import ProtectedRoute from "../../shared/auth/ProtectedRoute";
import { USER_ROLES } from "../../shared/constants/roles";
import NotFoundState from "../../shared/components/feedback/NotFoundState";

const HomePage = () => (
  <>
    <Hero />
    <Services />
    <Articles />
    <Testimonials />
  </>
);

const AppRoutes = () => (
  <Suspense fallback={<LoadingState />}>
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/services" element={<AppointmentForm />} />
      <Route path="/CycleTracker" element={<CycleTracker />} />
      <Route path="/CycleTracking" element={<CycleTracker />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/services/DoctorList" element={<Doctor />} />
      <Route path="/forgot-password" element={<ForgotPasswordOTP />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
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
      <Route
        path="/user"
        element={
          <ProtectedRoute>
            <UserProfile />
          </ProtectedRoute>
        }
      >
        <Route index element={<Profile />} />
        <Route path="profile" element={<Profile />} />
        <Route path="booking" element={<Booking />} />
      </Route>
      <Route path="/booking" element={<BookingForm />} />
      <Route path="/service-detail/:id" element={<ServiceDetail />} />
      <Route path="/booking-confirmation" element={<BookingConfirmation />} />
      <Route path="/payment" element={<Payment />} />
      <Route path="*" element={<NotFoundState />} />
    </Routes>
  </Suspense>
);

export default AppRoutes;
