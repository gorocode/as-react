import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useGameStore } from '../store/useGameStore';

import HomeButton from '../components/HomeButton';
import SceneDisplay from '../components/SceneDisplay';
import PlayerStats from '../components/PlayerStats';

const Game = ({ setMessageModal }) => {
    const navigate = useNavigate();
    const { player } = useGameStore();

    useEffect(() => {
        if (player === null) {
            navigate('/home');
        }
    }, [player, navigate]);

    useEffect(() => {
        window.scrollTo(0, 0);
        const preventScroll = (event) => {
            event.preventDefault();
        };

        document.addEventListener("touchmove", preventScroll, { passive: false });

    
        return () => {

            document.removeEventListener("touchmove", preventScroll);
        };
    }, []);

    if (player === null) {
        return null;
    }

    return (
        <div className="w-full max-w-3xl px-4 mb-8 sm:mb-0 select-none overflow-hidden">
            <HomeButton />
            <SceneDisplay player={player} setMessageModal={setMessageModal} />
            <PlayerStats player={player} setMessageModal={setMessageModal}/>
        </div>
    )
}

export default Game