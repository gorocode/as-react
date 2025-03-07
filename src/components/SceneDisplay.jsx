import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

import { useGameStore } from "../store/useGameStore";
import { sendPlayerAction } from "../api/api";
import { useLanguage } from "../context/LanguageContext";
import { useEvent } from "../store/useEvent";

import PlayerSprite from "./PlayerSprite";
import EnemySprite from "./EnemySprite";
import text from "../texts";
import images from "../images";

const SceneDisplay = ({ player, setMessageModal }) => {
    const { language } = useLanguage();
    const { event, loadEvent, setEvent, showIntro } = useEvent();
    const { updatePlayer, selectedAction, setSelectedAction, gameMode } = useGameStore();

    const [message, setMessage] = useState("");

    const gameAreaRef = useRef(null);
    const spriteRef = useRef(null);
    const enemyRef = useRef(null);
    const [enemyCaptured, setEnemyCaptured] = useState(false);
    const [enemyDamaged, setEnemyDamaged] = useState(false);

    const [backgroundSrc, setBackgroundSrc] = useState(event?.background);
    const [phase, setPhase] = useState("falling");
    const bgVariants = {
        /* 1º phase */
        falling: {
            opacity: 1,
            x: 65,
            y: [-1000, -85],
            rotate: 15,
            transition: { duration: 0.5, ease: "easeIn" }
        },
        /* 2º phase */
        springEffect: {
            x: 0,
            y: 0,
            rotate: 0,
            transition: { type: "spring", bounce: 0.5, duration: 0.75 }
        }
    };

    useEffect(() => {
        if (selectedAction) {
            setMessage(selectedAction);
        } else if (event && gameMode === "choices") {
            setMessage(language === "ES" ? event.descriptionEs : event.descriptionEn);
        }
        return () => setMessage(null);
    }, [selectedAction, event, language]);

    useEffect(() => {
        handleAnimation(event?.background);
    }, [event?.background]);

    useEffect(() => {
        if (gameMode === 'battle') {
            setBackgroundSrc(images.BACKGROUND_BATTLE);
        }
    }, [gameMode]);

    useEffect(() => {
        if (phase === "falling") {
            setTimeout(() => {
                setPhase("springEffect");
            }, 500);
        }
    }, [phase]);

    const handleAnimation = (background = images.BACKGROUND_DEFAULT) => {
        setBackgroundSrc(background);
        setPhase("falling");
    }

    const chooseOption = async (option) => {
        try {
            const data = await sendPlayerAction({ playerId: player.id, eventId: event.id, option });
            updatePlayer(data);
            const actionText = option === 1 ?
                language === 'ES' ? event.action1Es : event.action1En
                : language === 'ES' ? event.action2Es : event.action2En;
            setSelectedAction(actionText);
            setMessage(actionText);

            setTimeout(() => {
                setMessage(null);
                handleAnimation();
                setEvent(null);
                setSelectedAction(null);
                setTimeout(() => {
                    if (player.survivedDays === 9 
                        || player.survivedDays === 19
                        || player.survivedDays === 29
                        || player.survivedDays === 39
                        || player.survivedDays === 49) {
                        const battle = language === 'EN' ? text.BATTLE_EN : text.BATTLE_ES;
                        showIntro(battle, 'battle');
                    } else {
                        loadEvent();
                    }
                }, 5000);
            }, 8000);
        } catch (error) {
            setMessageModal(language === 'EN' ? error.messageEn : error.messageEs);
        }
    };

    return (
        <>
            {/* Enemy */}
            {gameMode === 'battle' && (
                <EnemySprite 
                    player={player}
                    enemyRef={enemyRef} 
                    enemyCaptured={enemyCaptured} 
                    setEnemyCaptured={setEnemyCaptured} 
                    enemyDamaged={enemyDamaged} 
                    event={event} 
                    spriteRef={spriteRef}
                    gameAreaRef={gameAreaRef} 
                    handleAnimation={handleAnimation}
                    loadEvent={loadEvent}
                    showIntro={showIntro}
                />
            )}

            <div className="relative w-full h-96 bg-gray-600 rounded-lg overflow-hidden" ref={gameAreaRef}>
                {/* Background */}
                <motion.img
                    key={backgroundSrc}
                    src={backgroundSrc || images.BACKGROUND_DEFAULT}
                    alt="Scene Background"
                    className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                    variants={bgVariants}
                    animate={phase}
                />

                {/* Sprite */}
                <PlayerSprite 
                    player={player}
                    event={event} 
                    spriteRef={spriteRef} 
                    gameAreaRef={gameAreaRef} 
                    enemyRef={enemyRef}
                    enemyCaptured={enemyCaptured} 
                    setEnemyDamaged={setEnemyDamaged} 
                />

                {/* Message */}
                {message && (
                    <motion.div
                        className="absolute top-2 left-1/2 w-[90%] sm:max-w-[320px] transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-4 py-2 rounded text-center text-lg font-bold"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        key={message}
                    >
                        {message.split("").map((char, index) => (
                            <motion.span
                                key={index}
                                initial={{ display: 'none' }}
                                animate={{ display: 'inline' }}
                                transition={{ delay: index * 0.05 }}
                            >
                                {char}
                            </motion.span>
                        ))}
                    </motion.div>
                )}

                {/* Action Buttons */}
                {!selectedAction && event && gameMode === 'choices' && (
                    <div className="absolute bottom-5 sm:bottom-auto sm:top-5 left-1/2 transform -translate-x-1/2 w-full flex justify-between px-8">
                        <button
                            onClick={() => chooseOption(1)}
                            className="py-1 sm:py-3 px-3 sm:px-6 max-w-[150px] bg-green-500 text-white font-bold rounded text-lg shadow-md hover:shadow-lg hover:bg-green-600 hover:scale-105 transition-transform duration-300 cursor-pointer"
                        >
                            {language === "ES" ? event.option1Es : event.option1En}
                        </button>
                        <button
                            onClick={() => chooseOption(2)}
                            className="py-1 sm:py-3 px-3 sm:px-6 max-w-[150px] bg-red-500 text-white font-bold rounded text-lg shadow-md hover:shadow-lg hover:bg-red-600 hover:scale-105 transition-transform duration-300 cursor-pointer"
                        >
                            {language === "ES" ? event.option2Es : event.option2En}
                        </button>
                    </div>
                )}
            </div>
        </>
    );
};

export default SceneDisplay;
