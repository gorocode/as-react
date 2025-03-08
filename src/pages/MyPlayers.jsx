import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaSkull, FaCrown } from "react-icons/fa";

import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { useGameStore } from "../store/useGameStore";
import { getUserPlayers, deletePlayer } from "../api/api";

import ConfirmModal from "../components/ConfirmModal";
import SlidingText from "../components/TextSlides";
import HomeButton from "../components/HomeButton";

const MyPlayers = ({ setMessageModal }) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { language } = useLanguage();
    const [players, setPlayers] = useState([]);
    const { gameResume } = useGameStore();
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedPlayerId, setSelectedPlayerId] = useState(null);
    const [hoveredPlayer, setHoveredPlayer] = useState(null);
    const [canUseButtons, setCanUseButtons] = useState(null);
    const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;

    useEffect(() => {
        const fetchPlayers = async () => {
            try {
                if (user) {
                    const data = await getUserPlayers(user.id);
                    if (data.length < 8) {
                        for (let i = data.length; i < 8; i++) {
                            data.push({ id: `newplayer-${i}`, name: null });
                        }
                    }
                    setPlayers(data);
                }
            } catch (error) {
                setMessageModal(language === 'EN' ? error.messageEn : error.messageEs);
            }
        };
        fetchPlayers();
    }, [user]);

    const handlePlay = (player) => {
        gameResume(player);
        navigate("/game");
    }

    const handleDelete = async () => {
        try {
            if (selectedPlayerId) {
                await deletePlayer(selectedPlayerId);
                setPlayers(players.map(player =>
                    player.id === selectedPlayerId ? { id: player.id, name: null } : player
                ));
            }
            closeModal();
        } catch (error) {
            closeModal();
            setMessageModal(language === 'EN' ? error.messageEn : error.messageEs);
        }
    };

    const openModal = (playerId) => {
        setSelectedPlayerId(playerId);
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setSelectedPlayerId(null);
    };

    return (
        <>
            <ConfirmModal
                isOpen={modalOpen}
                onClose={closeModal}
                onConfirm={handleDelete}
                message={language === "ES" ? "¿Estás seguro de que quieres eliminar este jugador?" : "Are you sure you want to delete this player?"}
            />

            <div className="w-full flex flex-col items-center justify-center mt-10 md:mt-0">
            <HomeButton position={700} />

            <div className="p-4 bg-gray-900 text-white rounded-lg w-[80%] max-w-[700px]">
                <h2 className="text-xl font-bold mb-4 text-center">
                    {language === 'ES' ? 'Mis Jugadores' : 'My Players'}
                </h2>
                <hr className="mb-5" />
                <div className="flex flex-wrap justify-center gap-4">

                    {!players.length

                        ? (<p>{language === 'ES' ? 'No tienes jugadores' : 'You don\'t have players'}</p>)

                        : (
                            players.map(player => (
                                <div
                                    key={player.id}
                                    className={`relative p-3 bg-gray-800 rounded-md text-sm w-[130px] h-[160px] transition-transform duration-300 ${hoveredPlayer === player.id ? 'scale-110' : ''}`}
                                    onMouseEnter={() => {
                                        if (!isTouchDevice) {
                                            setHoveredPlayer(player.id);
                                            setCanUseButtons(player.id);
                                        }
                                    }}
                                    onMouseLeave={() => {
                                        if (!isTouchDevice) {
                                            setHoveredPlayer(null);
                                            setCanUseButtons(null);
                                        }
                                    }}
                                    onTouchStart={(event) => {
                                        if (event.target.tagName !== 'BUTTON') {
                                            setHoveredPlayer(hoveredPlayer === player.id ? null : player.id);
                                            setTimeout(() => setCanUseButtons(canUseButtons === player.id ? null : player.id), 300); 
                                        }
                                    }}
                                >
                                    {player.name === null


                                        ? (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 bg-opacity-80 opacity-0 opacity-100 transition-opacity duration-300 rounded-md cursor-pointer">
                                                {/* NEW PLAYER CARD */}
                                                <h3 className="text-lg font-semibold text-center">New Player</h3>
                                                <button
                                                    onClick={() => navigate("/home")}
                                                    className={`bg-blue-500 ${hoveredPlayer === player.id ? 'bg-blue-600' : ''} text-white px-3 py-1 rounded-md mb-2`}
                                                >
                                                    {language === 'ES' ? 'Nuevo Juego' : 'New Game'}
                                                </button>
                                            </div>
                                        )

                                        : (
                                            <>
                                                {/* PLAYER CARD */}
                                                <SlidingText texts={
                                                    [`${player.health <= 0 || player.food <= 0 ? '💀' : player.finished ? '🏅' : ''} ${player.name.length > 12 ? player.name.slice(0, 12) + "..." : player.name}`,
                                                    `${player.health <= 0 || player.food <= 0 ? '💀' : player.finished ? '🏅' : ''} ${language === "ES" ? "Día" : "Day"} ${player.survivedDays}`]}
                                                />
                                                <hr className="border-gray-500" />

                                                <div className="mt-2">
                                                    <p className="flex justify-between">
                                                        <span>{language === 'ES' ? 'Salud' : 'Health'}</span> <span>{player.health}/100</span>
                                                    </p>
                                                    <div className="w-full bg-gray-700 rounded-full overflow-hidden">
                                                        <div className="h-2 bg-green-500" style={{ width: `${player.health}%` }}></div>
                                                    </div>
                                                </div>
                                                <div className="mt-2">
                                                    <p className="flex justify-between">
                                                        <span>{language === 'ES' ? 'Comida' : 'Food'}</span> <span>{player.food}/100</span>
                                                    </p>
                                                    <div className="w-full bg-gray-700 rounded-full overflow-hidden">
                                                        <div className="h-2 bg-yellow-500" style={{ width: `${player.food}%` }}></div>
                                                    </div>
                                                </div>
                                                <div className="mt-2">
                                                    <p className="flex justify-between">
                                                        <span>Moral</span> <span>{player.moral}/100</span>
                                                    </p>
                                                    <div className="w-full bg-gray-700 rounded-full overflow-hidden">
                                                        <div className="h-2 bg-blue-500" style={{ width: `${player.moral}%` }}></div>
                                                    </div>
                                                </div>

                                                {/* BUTTONS WHEN HOVER */}
                                                <div
                                                    className={`absolute inset-0 flex flex-col items-center justify-center bg-gray-900 bg-opacity-80 opacity-0 
                                                    ${hoveredPlayer === player.id ? 'opacity-100' : ''} 
                                                    transition-opacity duration-300 rounded-md`}
                                                >
                                                    {hoveredPlayer === player.id && player.health > 0 && player.food > 0 && !player.finished && (
                                                        <button
                                                            onClick={() => {
                                                                if (canUseButtons === player.id) handlePlay(player);
                                                            }}
                                                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md mb-2 cursor-pointer"
                                                        >
                                                            {language === 'ES' ? 'Jugar' : 'Play'}
                                                        </button>
                                                    )}

                                                    {hoveredPlayer === player.id && player.finished && (
                                                        player.health <= 0 || player.food <= 0 ? (
                                                            <motion.div
                                                                initial={{ opacity: 0 }}
                                                                animate={{ opacity: 1 }}
                                                                transition={{ duration: 8 }}
                                                            >
                                                                <FaSkull
                                                                    className="h-20 w-20 mb-5 text-gray-500"
                                                                />
                                                            </motion.div>
                                                        )
                                                            : (
                                                                <motion.div
                                                                    initial={{ opacity: 0 }}
                                                                    animate={{ opacity: 1 }}
                                                                    transition={{ duration: 8 }}
                                                                >
                                                                    <FaCrown
                                                                        className="h-20 w-20 mb-5 text-gray-500"
                                                                    />
                                                                </motion.div>
                                                            ))}

                                                    {hoveredPlayer === player.id && (
                                                        <button
                                                            onClick={() => {
                                                                if (canUseButtons === player.id) openModal(player.id);
                                                            }}
                                                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md cursor-pointer"
                                                        >
                                                            {language === 'ES' ? 'Eliminar' : 'Delete'}
                                                        </button>
                                                    )}
                                                </div>
                                            </>
                                        )}




                                </div>
                            ))
                        )}

</div>
                </div>
            </div>
        </>
    );
};

export default MyPlayers;
