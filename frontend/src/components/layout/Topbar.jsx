import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaBell, FaChevronDown, FaSearch, FaSignOutAlt } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import { searchPlaceholders, viewTitles } from "../../data/navigation";
import { logout as logoutAPI } from "../../shared/config/api";

export function Topbar({
  activeView,
  query = "",
  onQueryChange,
  action,
  notifications = [],
  onNotificationSelect,
  showSearch = false,
}) {
  const ActionIcon = action?.icon;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();
  const hasMenu = Boolean(action?.menuItems?.length);
  const hasNotifications = notifications.length > 0;

  function handleActionClick() {
    if (action?.disabled) return;

    setIsNotificationOpen(false);
    if (hasMenu) {
      setIsMenuOpen((current) => !current);
      return;
    }

    action?.onClick?.();
  }

  function handleMenuClick(menuItem) {
    if (menuItem.disabled) return;

    setIsMenuOpen(false);
    menuItem.onClick?.();
  }

  function handleNotificationClick(notification) {
    setIsNotificationOpen(false);
    onNotificationSelect?.(notification);
  }

  async function handleLogout() {
    try {
      await logoutAPI();
    } catch (error) {
      console.error("Logout failed:", error);
      // Logout locally even if backend logout fails
    }

    logout();
    navigate("/login");
  }

  return (
    <header className={`topbar ${showSearch ? "has-search" : "no-search"}`}>
      <div>
        <h1>{viewTitles[activeView] || "Dashboard"}</h1>
      </div>

      {showSearch && (
        <label className="search-box">
          <FaSearch size={18} />
          <input
            value={query}
            onChange={(event) => onQueryChange?.(event.target.value)}
            placeholder={searchPlaceholders[activeView] || "Search..."}
          />
        </label>
      )}

      <div className="topbar-actions">
        <div
          className="notification-menu"
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) {
              setIsNotificationOpen(false);
            }
          }}
        >
          <button
            className="icon-button"
            type="button"
            title="Notifications"
            aria-label="Notifications"
            aria-expanded={isNotificationOpen}
            aria-haspopup="menu"
            onClick={() => {
              setIsMenuOpen(false);
              setIsNotificationOpen((current) => !current);
            }}
          >
            <FaBell size={20} />
            {hasNotifications && (
              <span className="notification-count">
                {notifications.length > 9 ? "9+" : notifications.length}
              </span>
            )}
          </button>

          {isNotificationOpen && (
            <div
              className="notification-dropdown"
              role="menu"
              aria-label="Admin notifications"
            >
              <div className="notification-header">
                <strong>Notifications</strong>
                <span>
                  {hasNotifications
                    ? `${notifications.length} active`
                    : "All clear"}
                </span>
              </div>

              {hasNotifications ? (
                notifications.map((notification) => (
                  <button
                    key={notification.id}
                    className={`notification-item ${
                      notification.tone || "info"
                    }`}
                    type="button"
                    role="menuitem"
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <span className="notification-item-title">
                      {notification.title}
                    </span>
                    <span className="notification-item-detail">
                      {notification.detail}
                    </span>
                    {notification.meta && (
                      <span className="notification-item-meta">
                        {notification.meta}
                      </span>
                    )}
                  </button>
                ))
              ) : (
                <div className="notification-empty">
                  No admin notifications.
                </div>
              )}
            </div>
          )}
        </div>

        {action && (
          <div
            className="action-menu"
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) {
                setIsMenuOpen(false);
              }
            }}
          >
            <button
              className="primary-button"
              type="button"
              aria-expanded={hasMenu ? isMenuOpen : undefined}
              aria-haspopup={hasMenu ? "menu" : undefined}
              disabled={action.disabled}
              onClick={handleActionClick}
            >
              <ActionIcon size={20} />
              {action.label}
              {hasMenu && <FaChevronDown size={17} />}
            </button>

            {hasMenu && isMenuOpen && (
              <div className="action-dropdown" role="menu">
                {action.menuItems.map((menuItem) => {
                  const MenuIcon = menuItem.icon;

                  return (
                    <button
                      key={menuItem.label}
                      type="button"
                      role="menuitem"
                      disabled={menuItem.disabled}
                      onClick={() => handleMenuClick(menuItem)}
                    >
                      {MenuIcon && <MenuIcon size={17} />}
                      {menuItem.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <button
          className="secondary-button logout-button"
          type="button"
          onClick={handleLogout}
        >
          <FaSignOutAlt size={18} />
          Logout
        </button>
      </div>
    </header>
  );
}
