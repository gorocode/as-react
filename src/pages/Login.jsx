import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";

import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";

import config from "../config";
import images from "../images";

const Login = () => {
    const { language } = useLanguage();
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        if (user && user.role !== 'GUEST') {           
            navigate('/home');
        }
    }, [user])

    return (
        <div className="flex flex-col items-center justify-center bg-gray-800 text-white">
            <img
                src={images.SPRITE_LEFT}
                alt="Player"
                className="w-25 object-contain"
            />

            <h1 className="text-3xl font-bold text-center">
                {language === "EN" ? "Welcome to Apocalypse Simulator" : "Bienvenido al Simulador de Apocalipsis"}
            </h1>

            <p className="mt-4 text-lg">
                {language === "EN" ? "Login to begin your adventure!" : "¡Inicia sesión para empezar tu aventura!"}
            </p>

            <button
                onClick={() => window.location.href = `${config.BASE_URL}/oauth2/authorization/google`}
                className="mt-6 bg-white text-black px-6 py-3 rounded-lg font-bold text-lg shadow-md hover:bg-blue-600 hover:text-white transition flex items-center space-x-2 cursor-pointer"
            >
                <FcGoogle className="w-8 h-8" />
                <span>{language === "EN" ? "Login with Google" : "Iniciar sesión con Google"}</span>
            </button>
            <button
                onClick={() => { navigate("/home"); }}
                className="mt-4 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 shadow-md transition-all cursor-pointer"
            >
                {language === "EN" ? "Play as guest" : "Jugar como invitado"}
            </button>
        </div>
    );
};

export default Login;