import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { v4 as uuidv4 } from 'uuid';

import { useGameStore } from "../store/useGameStore";

import images from "../images";

const PlayerSprite = ({ player, event, spriteRef, gameAreaRef, enemyRef, enemyCaptured, setEnemyDamaged }) => {
    const { gameMode } = useGameStore();

    const [spriteSrc, setSpriteSrc] = useState(event?.sprite || images.SPRITE_WALKING_RIGHT);
    const [positionClass, setPositionClass] = useState("left-1/2 transform -translate-x-1/2"); /* Position class to static sprite */
    const [position, setPosition] = useState({ x: -40, y: 266, gravity: 0 }); /* Position to dinamic sprite */
    const positionRef = useRef({ x: -40, y: 266 }); /* Handle arrow centre related to sprite position */

    const [arrowAngle, setArrowAngle] = useState(0);
    const [prevArrowAngle, setPrevArrowAngle] = useState(0); /* Fix angle animation when angle suddenly changes from -3 to 3 */
    const [arrowPosition, setArrowPosition] = useState({ x: -40, y: 266 });
    const arrowPositionRef = useRef({ x: -40, y: 266 }); /* Handle where projectiles should spawn */
    const lastMousePosition = useRef({ clientX: 0, clientY: 0 }); /* Handle arrow position while jumping or moving*/

    const [projectiles, setProjectiles] = useState([]);
    const [newProjectile, setNewProjectile] = useState(null);

    const [isJumping, setIsJummping] = useState(false);
    const jumpIntervalRef = useRef(null);
    const keysPressed = useRef(new Set()); /* Handle multi key inputs (you can jump while moving) */

    const [firstAppearance, setFirstAppearance] = useState(true); /* Handle first animation */

    useEffect(() => {
        const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;
        if (isTouchDevice) {
            const gameAreaRect = gameAreaRef.current.getBoundingClientRect();
            const newX = (gameAreaRect.width / 2) - 80;
            setPosition({
              x: newX,
              y: 266,
              gravity: 0,
            });
            positionRef.current = { x: newX, y: 266 };
            setArrowAngle(0);
            setArrowPosition({ x: newX, y: 800 });
            arrowPositionRef.current = { x: newX, y: 800 };

        } else {
            setPosition({ x: -40, y: 266, gravity: 0 });
            positionRef.current = { x: -40, y: 266 };
            setArrowAngle(0);
            setArrowPosition({ x: -40, y: 266 });
            arrowPositionRef.current = { x: -40, y: 266 };
        }
        setFirstAppearance(true);
    }, [gameMode]);

    useEffect(() => {
        handleAnimation(event?.sprite);
    }, [event?.sprite]);

    useEffect(() => {
        if (newProjectile) {
            setProjectiles((prev) => [...prev, newProjectile]);
            setTimeout(() => {
                setProjectiles((prev) => prev.map((projectile) => {
                    if (projectile.id === newProjectile.id) {
                        return { ...projectile, x: projectile.finalX, y: projectile.finalY };
                    }
                    return projectile;
                }));

                setTimeout(() => {
                    setProjectiles((prev) => prev.filter((projectile) => projectile.id !== newProjectile.id));
                }, newProjectile.speed * 1000); /* seconds to miliseconds */
            }, 50);

        }

    }, [newProjectile]);

    useEffect(() => {
        const maxY = 266;
        if (isJumping) {
            jumpIntervalRef.current = setInterval(() => {
                setPosition((prev) => {
                    const newY = prev.y + prev.gravity;
                    if (newY >= maxY) {
                        setIsJummping(false);
                        handleArrow(lastMousePosition.current, {x: prev.x, y: maxY});
                        positionRef.current = {x: prev.x, y: maxY};
                        return { ...prev, y: maxY, gravity: 0 };
                    } else {
                        handleArrow(lastMousePosition.current, {x: prev.x, y: newY});
                        positionRef.current = {x: prev.x, y: newY};
                        return { ...prev, y: newY, gravity: prev.gravity + 5 };
                    }
                });
            }, 80);
        }

        if (jumpIntervalRef.current && !isJumping) {
            clearInterval(jumpIntervalRef.current);
            jumpIntervalRef.current = null;
        }
    }, [isJumping]);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (!keysPressed.current.has(event.key)) {
                keysPressed.current.add(event.key);
                updatePosition();
            }
        };

        const handleKeyUp = (event) => {
            keysPressed.current.delete(event.key);
        };

        const updatePosition = () => {
            const speed = player.moral / 8;
            const rect = gameAreaRef.current.getBoundingClientRect();
            const maxX = rect.width - 110;
            keysPressed.current.forEach(key => {
                setPosition((prev) => {
                    let newPosition = {};

                    switch (key) {
                        case "a":
                            newPosition = { ...prev, x: Math.max(prev.x - speed, -40) };
                            break;
                        case "d":
                            newPosition = { ...prev, x: Math.min(prev.x + speed, maxX) };
                            break;
                        case "w":
                            if (jumpIntervalRef.current == null) {
                                newPosition = { ...prev, gravity: - 25 };
                                setIsJummping(true);
                            } else {
                                newPosition = prev;
                            }
                            break;
                        default:
                            newPosition = prev;
                    }


                    positionRef.current = newPosition;
                    handleArrow(lastMousePosition.current, newPosition);
                    handleSpriteSide(lastMousePosition.current);
                    return newPosition;
                });
            });
        };

        const interval = setInterval(() => {
            if (keysPressed.current.size > 0) {
                updatePosition();
            }
        }, 50);

        const handleMouseClick = (event) => {
            if (gameMode !== "battle" || !spriteRef.current) return;
            const spriteRect = spriteRef.current.getBoundingClientRect();
            const clickX = event.clientX;
            const clickY = event.clientY;

            const isClickOnSprite = (
                clickX >= spriteRect.left &&
                clickX <= spriteRect.right &&
                clickY >= spriteRect.top &&
                clickY <= spriteRect.bottom
            );

            if (isClickOnSprite) {
                // Si el clic fue sobre el personaje, hacer que salte
                if (jumpIntervalRef.current == null) {
                    setPosition((prev) => ({ ...prev, gravity: -30 }));
                    setIsJummping(true);
                }
                return;
            }

            const rect = gameAreaRef.current.getBoundingClientRect();
            const x = arrowPositionRef.current.x;
            const y = arrowPositionRef.current.y;
            const angle = arrowPositionRef.current.angle;
            /* y - y0 = tan(angle)(x - x0) */
            /* y = tan(angle)(x-x0) + y0 */
            /* x = (y - y0) / tan(angle) + x0*/

            let finalX, finalY, maxX, maxY;
            let radians = angle * (Math.PI / 180);

            /* RIGHT */
            if (angle <= 90 && angle > -90) {
                /* UP */
                if (angle <= 0) {
                    maxX = rect.width;
                    maxY = 0 - 20;

                    finalY = Math.tan(radians) * (maxX - x) + y;
                    finalX = maxX;

                    if (finalY < maxY) {
                        finalX = (maxY - y) / Math.tan(radians) + x;
                        finalY = maxY;
                    }

                    /* DOWN */
                } else {
                    maxX = rect.width;
                    maxY = rect.height;

                    finalY = Math.tan(radians) * (maxX - x) + y;
                    finalX = maxX;

                    if (finalY > maxY) {
                        finalX = (maxY - y) / Math.tan(radians) + x;
                        finalY = maxY;
                    }
                }

                /* LEFT */
            } else {
                /* UP */
                if (angle <= 0) {
                    maxX = 0 - 20;
                    maxY = 0 - 20;

                    finalY = Math.tan(radians) * (maxX - x) + y;
                    finalX = maxX;

                    if (finalY < maxY) {
                        finalX = (maxY - y) / Math.tan(radians) + x;
                        finalY = maxY;
                    }

                    /* DOWN */
                } else {
                    maxX = 0 - 20;
                    maxY = rect.height;

                    finalY = Math.tan(radians) * (maxX - x) + y;
                    finalX = maxX;

                    if (finalY > maxY) {
                        finalX = (maxY - y) / Math.tan(radians) + x;
                        finalY = maxY;
                    }
                }
            }

            /* t = d/v */
            /* d = (x - x0)^2 + (y - y0)^2 */
            const time = Math.sqrt((finalX - x) ** 2 + (finalY - y) ** 2) / 500;

            setNewProjectile({ id: uuidv4(), x: x, y: y, angle: angle, finalX: finalX, finalY: finalY, speed: time });

        };

        const handleMouseMove = (event) => {
            if (gameMode !== "battle" || !spriteRef.current) return;
            handleSpriteSide(event);
            handleArrow(event);
            lastMousePosition.current = { clientX: event.clientX, clientY: event.clientY };
        };

        const handleSpriteSide = (event) => {
            const rect = spriteRef.current.getBoundingClientRect();
            const spriteX = rect.left + rect.width / 2;
            const mouseX = event.clientX;
            setSpriteSrc(mouseX > spriteX ? images.SPRITE_WALKING_RIGHT : images.SPRITE_WALKING_LEFT);
        }

        if (gameMode !== "battle") {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mousedown", handleMouseClick);
            window.removeEventListener("touchstart", handleMouseClick);
            clearInterval(interval);
        } else {
            window.addEventListener("keydown", handleKeyDown);
            window.addEventListener("keyup", handleKeyUp);
            window.addEventListener("mousemove", handleMouseMove);
            window.addEventListener("mousedown", handleMouseClick);
            window.addEventListener("touchstart", handleMouseClick);
        }

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mousedown", handleMouseClick);
            window.removeEventListener("touchstart", handleMouseClick);
            clearInterval(interval);
        }
    }, [gameMode]);

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

    const handleArrow = (event, arrowPosition = positionRef.current) => {
        setPrevArrowAngle(arrowAngle);
        const rect = spriteRef.current.getBoundingClientRect();
        const spriteX = rect.left + rect.width / 2;
        const spriteY = rect.top + rect.height / 2;
        const mouseX = event.clientX;
        const mouseY = event.clientY;

        const spriteAX = arrowPosition.x + rect.width / 2;
        const spriteAY = arrowPosition.y + rect.height / 2;

        const deltaX = mouseX - spriteX;
        const deltaY = mouseY - spriteY;
        const angle = Math.atan2(deltaY, deltaX);
        const distance = 50;
        const arrowX = spriteAX - 8 + Math.cos(angle) * distance;
        const arrowY = spriteAY - 20 + Math.sin(angle) * distance;
        setArrowPosition({ x: arrowX, y: arrowY });
        setArrowAngle(angle * (180 / Math.PI));
        arrowPositionRef.current = { x: arrowX, y: arrowY, angle: (angle * (180 / Math.PI)) };
    };

    
    const checkColision = (latest, projectileId) => {
        if (!enemyRef.current || !enemyCaptured) return;

        const enemyRectAbsolute = enemyRef.current.getBoundingClientRect();
        const gameRect = gameAreaRef.current.getBoundingClientRect();

        const enemyRect = {
            left: enemyRectAbsolute.left - gameRect.left,
            right: enemyRectAbsolute.right - gameRect.left - 10,
            top: enemyRectAbsolute.top - gameRect.top,
            bottom: enemyRectAbsolute.bottom - gameRect.top - 20,
        }

        const projectileRect = {
            left: latest.x,
            right: latest.x + 10,
            top: latest.y,
            bottom: latest.y + 10,
        };

        const isColliding =
            projectileRect.right > enemyRect.left &&
            projectileRect.left < enemyRect.right &&
            projectileRect.bottom > enemyRect.top &&
            projectileRect.top < enemyRect.bottom;

        if (isColliding) {
            setProjectiles((prev) => prev.filter((p) => p.id !== projectileId));
            setEnemyDamaged((prev) => !prev);
        }
    }

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
