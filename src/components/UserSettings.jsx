import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { BiSolidUserDetail } from "react-icons/bi";

import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

const UserSettings = () => {
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { language, handleLanguageChange } = useLanguage();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        if (showDropdown) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showDropdown]);

    const handleProfileClick = () => {
        setShowDropdown(!showDropdown);
    };

    const handleLogout = async () => {
        try {
            await logout();
            setShowDropdown(false);
            navigate("/login");
        } catch (err) {
            console.error("Logout failed", err);
        }
    };

    const handleEditUser = () => {
        navigate("/edit-user");
    };

    const handleLogin = () => {
        navigate("/login");
    };

    return (
        <div className="absolute top-5 right-5 flex items-center">
            <div className="relative" ref={dropdownRef}>
                {/* PROFILE IMAGE */}
                {user && user?.role !== 'GUEST' ? (
                    <img
                        src={user?.profilePicture}
                        alt="Profile"
                        className="w-12 h-12 rounded-full border-2 border-white cursor-pointer object-cover bg-white"
                        onClick={handleProfileClick}
                    />
                ) : (

                    <BiSolidUserDetail
                        className="w-12 h-12 rounded-full border-2 border-white text-black bg-white cursor-pointer"
                        onClick={handleProfileClick}
                    />
                )}



                {/* DROP DOWN MENU */}
                <div
                    className={`absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg border border-gray-200 py-2 transition-all duration-200 ease-out transform ${showDropdown ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
                        } z-50`}
                >
                    {/* LANGUAGE */}
                    <button
                        onClick={() => handleLanguageChange("EN")}
                        className="block w-full text-left px-4 py-2 text-gray-700 cursor-pointer hover:bg-gray-100"
                    >
                        🇬🇧 English
                    </button>
                    <button
                        onClick={() => handleLanguageChange("ES")}
                        className="block w-full text-left px-4 py-2 text-gray-700 cursor-pointer hover:bg-gray-100"
                    >
                        🇪🇸 Español
                    </button>
                    <hr className="border-gray-200 my-1" />

                    {/* USER SETTINGS */}
                    {user && user?.role !== 'GUEST' ? (
                        <>
                            <button
                                onClick={handleEditUser}
                                className="block w-full text-left px-4 py-2 text-blue-600 cursor-pointer hover:bg-gray-100"
                            >
                                {language === "EN" ? "Edit user" : "Editar usuario"}
                            </button>
                            <hr className="border-gray-200 my-1" />
                            <button
                                onClick={handleLogout}
                                className="block w-full text-left px-4 py-2 text-red-600 cursor-pointer hover:bg-gray-100"
                            >
                                {language === "EN" ? "Logout" : "Cerrar sesión"}
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={handleLogin}
                            className="block w-full text-left px-4 py-2 text-blue-600 cursor-pointer hover:bg-gray-100"
                        >
                            {language === "EN" ? "Login" : "Iniciar sesión"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserSettings;
