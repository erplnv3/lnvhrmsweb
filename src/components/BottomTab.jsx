import { Link, useLocation } from "react-router-dom";
import { 
  HiHome, 
  HiOutlineHome,
  HiClock, 
  HiOutlineClock,
  HiCalendar, 
  HiOutlineCalendar,
  HiUser, 
  HiOutlineUser 
} from "react-icons/hi";

const BottomTab = () => {
  const location = useLocation();

  const tabs = [
    { 
      path: "/home", 
      label: "Home", 
      icon: <HiOutlineHome size={22} />,
      activeIcon: <HiHome size={22} />
    },
    { 
      path: "/attendance", 
      label: "Attendance", 
      icon: <HiOutlineClock size={22} />,
      activeIcon: <HiClock size={22} />
    },
    { 
      path: "/leave", 
      label: "My Leave", 
      icon: <HiOutlineCalendar size={22} />,
      activeIcon: <HiCalendar size={22} />
    },
    { 
      path: "/profile", 
      label: "Profile", 
      icon: <HiOutlineUser size={22} />,
      activeIcon: <HiUser size={22} />
    },
  ];

  return (
    <div className="ios-bottom-tab">
      {tabs.map((tab) => (
        <Link
          key={tab.path}
          to={tab.path}
          className={`ios-tab-item ${location.pathname === tab.path ? "ios-active" : ""}`}
        >
          <div className="ios-tab-icon">
            {location.pathname === tab.path ? tab.activeIcon : tab.icon}
          </div>
          <span className="ios-tab-label">{tab.label}</span>
        </Link>
      ))}
    </div>
  );
};

export default BottomTab;