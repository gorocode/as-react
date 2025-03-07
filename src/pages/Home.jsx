import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { motion } from "framer-motion";

import { useAuth } from '../context/AuthContext';
import { useGameStore } from "../store/useGameStore";
import { useLanguage } from '../context/LanguageContext';

import images from "../images";

const Home = ({ setMessageModal }) => {
    const [name, setName] = useState("");
    const gameInit = useGameStore((state) => state.gameInit);
    const { language } = useLanguage();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [isHTPHovered, setIsHTPHovered] = useState(false);

    const startAdventure = async () => {
        if (name.trim().length < 2) {
            setMessageModal(language === 'EN' ? 'The name must have at least 2 characters' : 'El nombre debe tener al menos 2 caracteres');
            return;
        }
        try {
            await gameInit(name, user.id);
            navigate("/game");
        } catch (error) {
            setMessageModal(language === 'EN' ? error.messageEn : error.messageEs);
        }
    }

    return (
        <>
            <motion.button
                className="ml-60 mt-4 bg-gray-900 min-w-[44px] rounded-full text-white flex items-center px-4 py-2 shadow-md font-bold cursor-pointer"
                onClick={() => { navigate("/how-to-play"); }}
                onHoverStart={() => setIsHTPHovered(true)}
                onHoverEnd={() => setIsHTPHovered(false)}
                style={{
                    overflow: "hidden",
                    width: isHTPHovered ? "150px" : "44px",
                }}
                animate={{
                    width: isHTPHovered ? "150px" : "44px",
                    transition: { duration: 0.8, ease: "easeOut" },
                }}
            >
                <span className="text-xl ml-0.5 mr-2">?</span>
                <motion.span
                    className="whitespace-nowrap ml-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isHTPHovered ? 1 : 0 }}
                    transition={{
                        duration: 1,
                        ease: "easeOut",
                    }}
                >
                    {language === "EN" ? "How to Play" : "Cómo Jugar"}
                </motion.span>
            </motion.button>

            <img
                src={images.SPRITE_LEFT}
                alt="Player"
                className="w-25 object-contain"
            />
            <div className="text-3xl font-bold text-center flex gap-1">
                {(language === "EN" ? "Apocalypse Simulator" : "Simulador de Apocalipsis").split("").map((char, index) => (
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
            <input
                type="text"
                placeholder={language === "EN" ? "Your name..." : "Tu nombre..."}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border p-2 m-4"
            />
            <button
                onClick={() => startAdventure()}
                className="bg-red-500 hover:bg-red-700 text-white px-4 py-2 shadow-md transition-all cursor-pointer"
            >
                {language === "EN" ? "Start Adventure" : "Iniciar Aventura"}
            </button>
            {user && user?.role !== 'GUEST' && (
                <button
                    onClick={() => { navigate("/my-players"); }}
                    className="mt-4 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 shadow-md transition-all cursor-pointer"
                >
                    {language === "EN" ? "My players" : "Mis jugadores"}
                </button>
            )}



        </>
    );
}

export default Home;