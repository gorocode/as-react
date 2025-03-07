import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaSkull } from "react-icons/fa";

import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const GameOver = () => {
    const navigate = useNavigate();
    const { language } = useLanguage();
    const { user } = useAuth();

    return (
        <>
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 8 }}
            > 
                <FaSkull 
                    className="h-25 w-25 text-gray-500"
                />
            </motion.div>
            <div className="text-5xl  mb-6 font-bold text-center flex gap-1 text-red-600">
                {(language === "EN" ? "Game Over" : "Fin del Juego").split("").map((char, index) => (
                    <motion.span
                        key={index}
                        initial={{ y: 0, opacity: 0.8 }}
                        animate={{
                            y: ["0%", "-25%", "10%", "-15%", "5%", "0%"],
                            opacity: [0.7, 1, 0.7],
                        }}
                        transition={{
                            duration: 5, 
                            delay: index * 0.1, 
                            ease: "easeInOut", 
                        }}
                    >
                        {char}
                    </motion.span>
                ))}
            </div>
            <button
                onClick={() => navigate('/home')}
                className="bg-red-900 hover:bg-red-700 text-white px-4 py-2 shadow-md transition-all cursor-pointer"
            >
                {language === "EN" ? "Back to Home" : "Volver al Inicio"}
            </button>
            {user?.role === 'GUEST' && (
                <span className='mt-2'>{language === "EN" ? "Login to continue your adventure!" : "¡Inicia sesión para continuar tu aventura!"}</span>
            )}
        </>
    );
}

export default GameOver;
