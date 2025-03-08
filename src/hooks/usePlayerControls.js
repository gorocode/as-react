import { useState, useEffect, useRef } from "react";
import { v4 as uuidv4 } from 'uuid';
import images from "../images";

const usePlayerControls = ({ player, spriteRef, setSpriteSrc, gameAreaRef, enemyRef, enemyCaptured, setEnemyDamaged, gameMode, battleEnd }) => {
    const [position, setPosition] = useState({ x: -40, y: 266, gravity: 0 }); /* Position to dinamic sprite */
    const positionRef = useRef({ x: -40, y: 266 }); /* Handle arrow centre related to sprite position */

    const [arrowAngle, setArrowAngle] = useState(0);
    const [prevArrowAngle, setPrevArrowAngle] = useState(0); /* Fix angle animation when angle suddenly changes from -3 to 3 */
    const [arrowPosition, setArrowPosition] = useState({ x: -40, y: 266 });
    const arrowPositionRef = useRef({ x: -40, y: 266 }); /* Handle where projectiles should spawn */
    const lastMousePosition = useRef({ clientX: 0, clientY: 0 });  /* Handle arrow position while jumping or moving*/

    const [projectiles, setProjectiles] = useState([]);
    const [newProjectile, setNewProjectile] = useState(null);

    const [isJumping, setIsJummping] = useState(false);
    const jumpIntervalRef = useRef(null);
    const keysPressed = useRef(new Set()); /* Handle multi key inputs (you can jump while moving) */

    const [firstAppearance, setFirstAppearance] = useState(true); /* Handle first animation */
    
    const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;

    useEffect(() => {
        const interval = setInterval(() => {
            if (keysPressed.current.size > 0) {
                updatePosition();
            }
        }, 50);
        
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

        resetValues();

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mousedown", handleMouseClick);
            window.removeEventListener("touchstart", handleMouseClick);
            clearInterval(interval);
        }
    }, [gameMode]);

    /* Reset Values */
    const resetValues = () => {
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
    };

    /* Handle Projectile Movement / Change initial position to final position */
    useEffect(() => {
        if (battleEnd && newProjectile) {
            setProjectiles((prev) => prev.filter((projectile) => projectile.id !== newProjectile.id));
            return;
        }

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

    /* Handle jump */
    useEffect(() => {
        const maxY = 266;
        if (isJumping) {
            jumpIntervalRef.current = setInterval(() => {
                setPosition((prev) => {
                    const newY = prev.y + prev.gravity;
                    if (newY >= maxY) {
                        setIsJummping(false);
                        handleArrow(lastMousePosition.current, { x: prev.x, y: maxY });
                        positionRef.current = { x: prev.x, y: maxY };
                        return { ...prev, y: maxY, gravity: 0 };
                    } else {
                        handleArrow(lastMousePosition.current, { x: prev.x, y: newY });
                        positionRef.current = { x: prev.x, y: newY };
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

    /* Handle Key inputs AWD */
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
        if (battleEnd) return;
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
                            newPosition = { ...prev, gravity: -25 };
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

    /* Handle click input (shoot projectile and jump if click on sprite) */
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
            if (angle <= 0) { /* UP */
                maxX = rect.width;
                maxY = 0 - 20;
                finalY = Math.tan(radians) * (maxX - x) + y;
                finalX = maxX;

                if (finalY < maxY) {
                    finalX = (maxY - y) / Math.tan(radians) + x;
                    finalY = maxY;
                }
            } else { /* DOWN */
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
            if (angle <= 0) { /* UP */
                maxX = 0 - 20;
                maxY = 0 - 20;
                finalY = Math.tan(radians) * (maxX - x) + y;
                finalX = maxX;

                if (finalY < maxY) {
                    finalX = (maxY - y) / Math.tan(radians) + x;
                    finalY = maxY;
                }

            } else { /* DOWN */
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

    /* Handle mouse move (arrow move) */
    const handleMouseMove = (event) => {
        if (gameMode !== "battle" || !spriteRef.current) return;
        handleSpriteSide(event);
        handleArrow(event);
        lastMousePosition.current = { clientX: event.clientX, clientY: event.clientY };
    };

    const handleArrow = (event, arrowPosition = positionRef.current) => {
        if(battleEnd) return;
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

    /* Handle sprite side (mouse side) */
    const handleSpriteSide = (event) => {
        if(battleEnd) return;
        const rect = spriteRef.current.getBoundingClientRect();
        const spriteX = rect.left + rect.width / 2;
        const mouseX = event.clientX;
        setSpriteSrc(mouseX > spriteX ? images.SPRITE_WALKING_RIGHT : images.SPRITE_WALKING_LEFT);
    }

    /* Check if projectile touch enemy while it is inside game area */
    const checkColision = (latest, projectileId) => {
        if (!enemyRef.current || !enemyCaptured || battleEnd) return;

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

    return {
        position,
        arrowAngle,
        prevArrowAngle,
        arrowPosition,
        projectiles,
        firstAppearance,
        setFirstAppearance,
        checkColision
    };
};

export default usePlayerControls;