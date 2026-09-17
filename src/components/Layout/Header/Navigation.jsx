import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import authStorage from "../../../shared/storage/authStorage";
import "./Navigation.css";

// Removed blog options - no longer using tag-based navigation

const Navigation = () => {
  const location = useLocation();
  const userState = useSelector((state) => state.user);

  const user = userState?.user?.email ? userState.user : authStorage.getUser();

  // Scroll to top function
  const handleScrollToTop = () => {
    window.scrollTo({
      top: 0,
    });
  };

  // Base navigation items
  const baseNavigationItems = [
    { label: "Trang chủ", href: "/" },
    { label: "Tin tức", href: "/blog" },
    { label: "Dịch vụ", href: "/services", dropdown: true },
    { label: "Giới thiệu", href: "/contact" },
  ];

  // Role-specific navigation items
  const getRoleSpecificItems = (userRole) => {
    switch (userRole) {
      case "ADMIN":
        return [{ label: "Người quản lý", href: "/admin" }];
      case "STAFF":
        return [{ label: "Nhân viên", href: "/staff" }];
      case "CONSULTANT":
        return [{ label: "Bác sĩ", href: "/consultant" }];
      default:
        return [];
    }
  };

  // All possible role navigation items (for styling check)
  const allRoleNavigationItems = [
    { label: "Admin", href: "/admin" },
    { label: "Staff", href: "/staff" },
    { label: "Consultant", href: "/consultant" },
  ];

  // Combine navigation items based on user role
  const roleSpecificItems = getRoleSpecificItems(user?.role);
  const navigationItems = [...baseNavigationItems, ...roleSpecificItems];

  return (
    <nav className="main-nav">
      <ul className="nav-list">
        {navigationItems.map((item, index) => {
          // Check if this is a role navigation item
          const isRoleItem = allRoleNavigationItems.some(
            (roleItem) => roleItem.href === item.href
          );

          return (
            <li
              key={index}
              className={`nav-item${item.dropdown ? " has-dropdown" : ""}${
                isRoleItem ? " admin-item" : ""
              }`}
            >
              <Link
                to={item.href}
                className={`nav-link${
                  location.pathname === item.href ? " active" : ""
                }${isRoleItem ? " admin-nav" : ""}`}
                onClick={handleScrollToTop}
              >
                {item.label}
              </Link>

              {/* Removed Tin tức dropdown - now goes directly to /blog */}
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default Navigation;
