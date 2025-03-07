import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaGithubSquare, FaLinkedin } from "react-icons/fa";
import { FaCodeBranch } from "react-icons/fa6";

import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";


const Footer = () => {
    const { language } = useLanguage();
    const navigate = useNavigate();
    const { user } = useAuth();
    const location = useLocation();
    const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 640);

    useEffect(() => {
        const handleResize = () => setIsSmallScreen(window.innerWidth < 640);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    if (location.pathname === "/game" && isSmallScreen) {
        return null;
    }

    return (
        <footer className="w-full bg-gray-900 text-gray-400 text-center py-4 mt-6 border-t border-gray-700">

            <div className="flex justify-center gap-4 mt-2">
                <button onClick={() => navigate("/home")} className="cursor-pointer hover:text-white">
                    {language === "EN" ? "Home" : "Inicio"}
                </button>
                <span>|</span>
                <button onClick={() => navigate("/how-to-play")} className="cursor-pointer hover:text-white">
                    {language === "EN" ? "How to Play" : "Cómo Jugar"}
                </button>
                <span>|</span>
                {user && user.role !== "GUEST" ? (
                    <button onClick={() => navigate("/my-players")} className="cursor-pointer hover:text-white">
                        {language === "EN" ? "My Players" : "Mis Jugadores"}
                    </button>
                ) : (
                    <button onClick={() => navigate("/login")} className="cursor-pointer hover:text-white">
                        {language === "EN" ? "Login" : "Iniciar sesión"}
                    </button>
                )}
                <span>|</span>
                <button onClick={() => navigate("/contact")} className="cursor-pointer hover:text-white">
                    {language === "EN" ? "Contact" : "Contacto"}
                </button>
            </div>


            <div className="flex justify-center gap-4 mt-2">
                <a href="https://github.com/gorocode/as-react" target="_blank" rel="noopener noreferrer" className="hover:text-white flex items-center gap-2">
                    <FaCodeBranch className="w-6 h-5" />{language === "EN" ? "Repository" : "Repositorio"}
                </a>
                <a href="https://github.com/gorocode" target="_blank" rel="noopener noreferrer" className="hover:text-white flex items-center gap-2">
                    <FaGithubSquare className="w-6 h-6" />GitHub
                </a>
                <a href="https://www.linkedin.com/in/miguel-sanchez-sedes/" target="_blank" rel="noopener noreferrer" className="hover:text-white flex items-center gap-2">
                    <FaLinkedin className="w-6 h-6" />Linkedin
                </a>
            </div>

            <p className="text-sm mt-2">© 2025 GoroCode. {language === "EN" ? "Open Source under MIT License." : "Código abierto bajo licencia MIT."}</p>

        </footer>
    );
};

export default Footer;
