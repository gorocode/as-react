import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import usePlayerControls from "../hooks/usePlayerControls";
import { useGameStore } from "../store/useGameStore";
import images from "../images";

const PlayerSprite = ({ player, event, spriteRef, gameAreaRef, enemyRef, enemyCaptured, setEnemyDamaged }) => {
    const { gameMode } = useGameStore();

    const [spriteSrc, setSpriteSrc] = useState(event?.sprite || images.SPRITE_WALKING_RIGHT);
    const [positionClass, setPositionClass] = useState("left-1/2 transform -translate-x-1/2"); /* Position class to static sprite */
    
    const {
        position,
        arrowAngle,
        prevArrowAngle,
        arrowPosition,
        projectiles,
        firstAppearance,
        setFirstAppearance,
        checkColision
    } = usePlayerControls({ player, spriteRef, setSpriteSrc, gameAreaRef, enemyRef, enemyCaptured, setEnemyDamaged, gameMode });

    useEffect(() => {
        handleAnimation(event?.sprite);
    }, [event?.sprite]);

    const handleAnimation = (sprite = images.SPRITE_WALKING_RIGHT) => {
        setSpriteSrc(sprite);
        if (sprite === images.SPRITE_WALKING_RIGHT) {
            setPositionClass("left-1/2 transform -translate-x-1/2");
        } else if (sprite === images.SPRITE_LEFT) {
            setPositionClass("left-10");
        } else {
            setPositionClass("right-10");
        }
    };
    
    return (
        <>
            {gameMode === "choices" && (
                <motion.img
                    src={spriteSrc}
                    alt="Player"
                    key={spriteSrc}
                    className={`absolute bottom-4 ${positionClass} w-40 aspect-[2/1] object-contain pointer-events-none`}
                    initial={{ opacity: 0, y: '-100%' }}
                    animate={{
                        opacity: 1,
                        y: 0,
                        transition: { type: "spring", bounce: 0.8, duration: 1.3 }
                    }}
                />
            )}

            {gameMode === "battle" && (
                <motion.img
                    src={spriteSrc}
                    ref={spriteRef}
                    alt="Player"
                    className="absolute w-40 aspect-[2/1] object-contain pointer-events-none"
                    initial={{ x: '-30%', y: '-100%' }}
                    animate={{ x: position.x, y: position.y }}
                    transition={firstAppearance ? { type: "spring", bounce: 0.8, duration: 1.3 } : { duration: 0.05 }}
                    onAnimationComplete={() => setFirstAppearance(false)}
                />
            )}

            {/* Arrow */}
            {gameMode === "battle" && (
                <motion.div
                    className="absolute"
                    initial={{ x: arrowPosition.x, y: arrowPosition.y, rotate: arrowAngle }}
                    animate={{
                        x: arrowPosition.x,
                        y: arrowPosition.y,
                        rotate: arrowAngle,
                        transition: Math.abs(arrowAngle - prevArrowAngle) > 5
                            ? { duration: 0 }
                            : { duration: 0.1 }
                    }}
                    style={{
                        position: "absolute",
                        transformOrigin: "center",
                    }}
                >
                    ➤
                </motion.div>
            )}

            {gameMode === "battle" && (
                projectiles.map((projectile, index) => (
                    <motion.div
                        key={projectile.id}
                        className="absolute"
                        initial={{ x: projectile.x, y: projectile.y, rotate: projectile.angle }}
                        animate={{
                            x: projectile.x,
                            y: projectile.y,
                            transition: { duration: projectile.speed, ease: "linear" }
                        }}
                        style={{
                            position: "absolute",
                            transformOrigin: "center",
                        }}
                        onUpdate={(latest) => checkColision(latest, projectile.id)}
                    >
                        ➤
                    </motion.div>
                ))
            )}
        </>
    );
};

export default PlayerSprite;