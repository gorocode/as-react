import { useState, useEffect, useRef } from "react";
import { useGameStore } from "./useGameStore";
import { getRandomEvent } from "../api/api";
import { useLanguage } from '../context/LanguageContext';
import text from "../texts";
import { useNavigate } from "react-router-dom";
import { putPlayer } from "../api/api";

export const useEvent = () => {
    const [event, setEvent] = useState(null);
    const { player, setSelectedAction, gameMode, setGameMode } = useGameStore();
    const { language } = useLanguage();
    const isCancelled = useRef(false);
    const navigate = useNavigate();

    const showIntro = async (text, gameMode) => {
        isCancelled.current = false;
        for (let i = 0; i < text.length; i++) {
            if (isCancelled.current) return;
            setSelectedAction(text[i]);
            await new Promise((resolve) => setTimeout(resolve, 8000));
        }
        setGameMode(gameMode);
        setSelectedAction(null);

        if (!isCancelled.current && gameMode === "choices") {
            loadEvent();
        } else if (gameMode === "end") {
            const updatedPlayer = { ...player, survivedDays: 50, finished: true }
            putPlayer(updatedPlayer);
            navigate("/game-over");
        }
    };

    const loadEvent = async () => {
        if (isCancelled.current) return;
        const data = await getRandomEvent();
        setEvent(data);
    };

    useEffect(() => {
        if (player.survivedDays === 1) {
            const intro = language === 'EN' ? text.INTRO_EN : text.INTRO_ES;
            showIntro(intro, 'choices');
        }
        else if (player.survivedDays === 10 
            || player.survivedDays === 20 
            || player.survivedDays === 30
            || player.survivedDays === 40
            || player.survivedDays === 50) {
            const battle = language === 'EN' ? text.BATTLE_EN : text.BATTLE_ES;
            showIntro(battle, 'battle');
        } else {
            const cont = language === 'EN' ? text.CONTINUE_EN : text.CONTINUE_ES;
            showIntro(cont, 'choices');
        }

        return () => {
            setGameMode('choices');
            isCancelled.current = true;
            setEvent(null);
            setSelectedAction(null);
        };
    }, []);

    return { event, loadEvent, setEvent, showIntro };
};
