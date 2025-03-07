import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import { useGameStore } from "../store/useGameStore";
import { useLanguage } from "../context/LanguageContext";
import { putPlayer } from "../api/api";
import { useAuth } from "../context/AuthContext";

const PlayerStats = ({ player, setMessageModal }) => {
    const { user } = useAuth();
    const { updatePlayer, gameMode, battleEnd } = useGameStore();
    const { language } = useLanguage(); 
    const timeRef = useRef(player);
    const timeIntervalRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (timeRef.current) timeRef.current = {...timeRef.current, health: player.health};
        if (player.health <= 0 || player.food <= 0) {
            finishBattle();
            navigate('/game-over');
        }        
    }, [player]);

    useEffect(() => {
        timeRef.current = player;
        if (gameMode === 'battle' && !battleEnd) {
            timeIntervalRef.current = setInterval(() => {
                const newTime = timeRef.current.food - 1;
                const updatedPlayer = {...timeRef.current, food: (newTime <= 0 ? 0 : newTime)};
                timeRef.current = updatedPlayer;
                updatePlayer(updatedPlayer);
                if (newTime <= 0) {
                    finishBattle();
                    navigate('/game-over');
                }
            }, 1000);
        } else {
            if (timeIntervalRef.current) {
                clearInterval(timeIntervalRef.current);
                timeIntervalRef.current = null;
            }
            if (gameMode === 'choices' && battleEnd) {
                finishBattle();
            }
        }

        return () => {
            clearInterval(timeIntervalRef.current);
            timeIntervalRef.current = null;
        }
    }, [gameMode, battleEnd]);

    const finishBattle = async () => {
        if (user && user.role !== 'GUEST') {
            try {
                const updatedPlayer = {...timeRef.current, survivedDays: (timeRef.current.survivedDays++)};
                await putPlayer(updatedPlayer);
            } catch (error) {
                setMessageModal(language === 'EN' ? error.messageEn : error.messageEs);
            }
        }
    }

    if (!player) return <p>Loading player...</p>;
    
    return (
        <div className="p-4 sm:p-6 mt-4 bg-gray-900 text-white rounded-lg text-sm sm:text-lg w-full">
            <h2 className="text-base sm:text-xl font-bold sm:mb-4 text-center">
                {player.name} - {language == 'ES' ? 'Día' : 'Day'} {player.survivedDays}
            </h2>
    
            {/* Health */}
            <div className="mb-3">
                <p className="flex justify-between text-xs sm:text-lg">
                    <span>{language == 'EN' ? 'Health' : 'Salud'}</span> 
                    <span>{player.health}/100</span>
                </p>
                <div className="w-full bg-gray-700 rounded-full overflow-hidden">
                    <div 
                        className="h-2 sm:h-4 bg-green-500 transition-all duration-300"
                        style={{ width: `${player.health}%` }}
                    ></div>
                </div>
            </div>
    
            {/* Food */}
            <div className="mb-3">
                <p className="flex justify-between text-xs sm:text-lg">
                    <span>
                        {gameMode === 'choices' 
                            ? language == 'EN' ? 'Food' : 'Comida' 
                            : language == 'EN' ? 'Time' : 'Tiempo'}
                    </span> 
                    <span>{player.food}/100</span>
                </p>
                <div className="w-full bg-gray-700 rounded-full overflow-hidden">
                    <div 
                        className="h-2 sm:h-4 bg-yellow-500 transition-all duration-300"
                        style={{ width: `${player.food}%` }}
                    ></div>
                </div>
            </div>
    
            {/* Moral */}
            <div className="mb-3">
                <p className="flex justify-between text-xs sm:text-lg">
                    <span>
                        {gameMode === 'choices' ? 'Moral' : language == 'EN' ? 'Speed' : 'Velocidad'}
                    </span> 
                    <span>{player.moral}/100</span>
                </p>
                <div className="w-full bg-gray-700 rounded-full overflow-hidden">
                    <div 
                        className="h-2 sm:h-4 bg-blue-500 transition-all duration-300"
                        style={{ width: `${player.moral}%` }}
                    ></div>
                </div>
            </div>
        </div>
    );
    
    
};

export default PlayerStats;