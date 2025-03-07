import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { v4 as uuidv4 } from 'uuid';

import { useGameStore } from "../store/useGameStore";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";

import text from "../texts";
import images from "../images";

const EnemySprite = ({ gameAreaRef, enemyRef, enemyCaptured, setEnemyCaptured, enemyDamaged, spriteRef, handleAnimation, loadEvent, player, showIntro }) => {
    const { language } = useLanguage();
    const { updatePlayer, setSelectedAction, setGameMode, battleEnd, setBattleEnd } = useGameStore();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [enemySprite, setEnemySprite] = useState();
    
    const [health, setHealth] = useState(510);
    const [maxHealth, setMaxHealth] = useState(500);

    const [position, setPosition] = useState({ x: -200, y: -600 });
    const [dragging, setDragging] = useState(false);
    const [draggingAvailable, setDraggingAvailable] = useState(true);

    const [angle, setAngle] = useState(0); 
    const [projectiles, setProjectiles] = useState([]);
    const [newProjectile, setNewProjectile] = useState(null);
    const [projectileSize, setProjectileSize] = useState('w-5 h-5');

    
    useEffect(() => {
        switch (player.survivedDays) {
            case 10:
                setMaxHealth(250); 
                setHealth(260); 
                break;
            case 20: 
                setTimeout(() => {
                    shootProjectile();
                }, 3000);
                setMaxHealth(500); 
                setHealth(510); 
                break;
            case 30: 
                setTimeout(() => {
                    shootProjectile();
                }, 3000);
                setMaxHealth(750); 
                setHealth(760); 
                break;
            case 40: 
                setTimeout(() => {
                    shootProjectile();
                }, 3000);
                setTimeout(() => {
                    shootProjectile();
                }, 4000);
                setMaxHealth(1000); 
                setHealth(1010); 
                break;
            case 50: 
            default: 
                setTimeout(() => {
                    shootProjectile();
                }, 3000);
                setTimeout(() => {
                    shootProjectile();
                }, 4000);
                setTimeout(() => {
                    shootProjectile();
                }, 5000);
                setMaxHealth(2000); 
                setHealth(2010);
        }   
        const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;

        if (isTouchDevice) setProjectileSize('w-8 h-8');

        setTimeout(() => {
            shootProjectile();
        }, 2000);

        return () => {
            setBattleEnd(false);
        }
    },[]);

    useEffect(() => {
        if (battleEnd) {
            if (player.survivedDays < 50) {
                setTimeout(() => setSelectedAction(language === 'EN' ? 'It\'s not over yet. We\'ll meet again!' : 'Esto no se ha acabado. ¡Volveremos a vernos!'), 1000);
            } else {
                setTimeout(() => setSelectedAction(language === 'EN' ? 'It can\'t be! You won\'t get out of this!' : '¡No puede ser! ¡No saldrás de esta!'), 1000);
            }
            setTimeout(() => { setPosition({ x: '100%', y: '10%' }); }, 5000);
            setTimeout(() => { 
                if (user?.role === 'GUEST' && player.survivedDays >= 10) {
                    navigate('/game-over');
                    return;
                }
                setSelectedAction(null);
                setGameMode('choices');
                if (player.survivedDays < 50) {
                    handleAnimation();
                    setTimeout(() => {
                        loadEvent();
                    }, 5000)
                } else {
                    const end = language === 'EN' ? text.END_EN : text.END_ES;
                    showIntro(end, 'end');
                }
            }, 7000);
        }
    }, [battleEnd]);

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
                    setProjectiles((prev) => prev.filter((projectile) => projectile.id !== newProjectile.id ));
                }, newProjectile.speed * 1000); /* seconds to miliseconds */
            }, 50);
        
            const time = health > (maxHealth * 0.50) ? 4000 : health > (maxHealth * 0.20) ? 3000 : health > 0 ? 1000 : null;
            if (time) {
                setTimeout(() => {
                    shootProjectile()
                }, time);
            }
        }
        
    }, [newProjectile]);

    useEffect(() => {
        const time = health > (maxHealth * 0.50) ? 800 : health > (maxHealth * 0.20) ? 400 : health > 0 ? 200 : 800;
        const moveEnemy = () => {
            if (!gameAreaRef.current || battleEnd || dragging) return;
            const rect = gameAreaRef.current.getBoundingClientRect();

            if (health <= 0) {
                setDraggingAvailable(false);
                const x = rect.right - 180 ;
                const y = 10 + rect.top;
                setPosition({ x: x, y: y });
                setTimeout(() => { setPosition({ x: x, y: y + 20 }); }, 600);
                setBattleEnd(true);
            } else if (enemyCaptured) {
                const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;
                let height;
                if (isTouchDevice) {
                    height = (rect.top + 10);
                } else {
                    height = (rect.top + rect.height) / 2;
                }
                const randomX = Math.random() * (rect.left + rect.width - 160 - rect.left) + rect.left;
                setPosition({ x: randomX, y: height });
                setTimeout(() => { setPosition({ x: randomX, y: height + 20 }); }, 600);
            } else {
                const centerX = rect.left + rect.width / 2 - 80;
                const centerY = rect.top + rect.height / 2 - 80; 

                const radiusX = rect.width / 1.5;
                const radiusY = rect.height;

                setAngle((prev) => (prev + 0.5) % (2 * Math.PI)); 

                /* x = Cx + rx * cos(angle(t)) */
                /* y = Cy + ry * sen(angle(t)) */
                const newX = centerX + radiusX * Math.cos(angle);
                const newY = centerY + radiusY * Math.sin(angle);

                setPosition({ x: newX, y: newY });
                setTimeout(() => { setPosition({ x: newX, y: newY + 20 }); }, time - time / 4);
            }       
        };

        const interval = setInterval(moveEnemy, time);

        return () => clearInterval(interval);
    }, [angle, dragging, enemyCaptured, gameAreaRef, battleEnd]);

    useEffect(() => {
        setHealth((prev) => {
            const newHealth = prev - 10;
            if ((prev >= maxHealth / 2 && newHealth < maxHealth / 2) 
                || (prev >= maxHealth * 0.2 && newHealth < maxHealth * 0.2
            || newHealth <= 0)) {
                setTimeout(() => setEnemyCaptured(false), 100);
            }
            return newHealth;
        });
    }, [enemyDamaged]);

    useEffect(() => {
        const spriteRect = spriteRef.current.getBoundingClientRect();
        if (position.x >= spriteRect.left) setEnemySprite("right");
        else setEnemySprite("left");
    }, [position])

    const onMouseDown = (e) => {
        e.preventDefault();
        if (enemyCaptured || !draggingAvailable) return;
        setDragging(true);
    };

    const onTouchStart= (e) => {
        if (enemyCaptured || !draggingAvailable) return;
        setDragging(true);
    }

    const onMouseMove = (e) => {
        if (dragging && draggingAvailable) {
            const newX = e.clientX - 80;
            const newY = e.clientY - 80;
            setPosition({ x: newX, y: newY });
        }
    };

    const onTouchMove = (e) => {
        if (dragging && draggingAvailable) {
            const newX = e.touches[0].clientX - 80;
            const newY = e.touches[0].clientY - 80;
            setPosition({ x: newX, y: newY });
        }
    };

    const onMouseUp = () => {
        const rect = gameAreaRef.current.getBoundingClientRect();
        const enemy = enemyRef.current.getBoundingClientRect();
        setDragging(false);
        if (enemy.top > rect.top && enemy.top < rect.top + rect.height - 80
            && enemy.left > rect.left && enemy.left < rect.left + rect.width - 80 
        ) {
            setEnemyCaptured(true);
            setDraggingAvailable(false);
            setTimeout(() => {
                setEnemyCaptured(false);
                setTimeout(() => {
                    if (health > 0) setDraggingAvailable(true);
                }, 3000);
            }, 5000);
        }
  
    };

    const shootProjectile = () => {
        if (!enemyRef.current || !spriteRef.current) return;
        const enemyRect = enemyRef.current.getBoundingClientRect();
        const spriteRect = spriteRef.current.getBoundingClientRect();
        const gameAreaRect = gameAreaRef.current.getBoundingClientRect();

        const x1 = enemyRect.left + 80;
        const y1 = enemyRect.top + 80;
        const x2 = spriteRect.left + 80;
        const y2 = spriteRect.top + 40

        /* m = (y1 - y2) / (x1 - x2) */
        /* n = y1 - m * x1 */
        /* y = m * x + n */
        /* x = (y - n) / m */

        const maxX = gameAreaRect.right;
        const minX = gameAreaRect.left;
        const maxY = gameAreaRect.bottom;
        const minY = gameAreaRect.top;
        
        const deltaX = x1 - x2;
        const deltaY = y1 - y2;
        const m = deltaY / deltaX;
        const n = (spriteRect.top + 40) - m * (spriteRect.left + 80);

        let newY, newX;

        if (x1 < x2) {
            newX = maxX
            newY = m * newX + n;
            
            if (newY > maxY) {
                newY = maxY;
                newX = (newY - n) / m;
            } else if (newY < minY) {
                newY = minY;
                newX = (newY - n) / m;
            }
        } else {
            newX = minX
            newY = m * newX + n;
            
            if (newY > maxY) {
                newY = maxY;
                newX = (newY - n) / m;
            } else if (newY < minY) {
                newY = minY;
                newX = (newY - n) / m;
            }
        }
 

        const time = Math.sqrt((newX - x1) ** 2 + (newY - y1) ** 2) / 100;
        const id = uuidv4();

        setNewProjectile({ id: id, x: x1, y: y1, finalX: newX, finalY: newY, speed: time });
    };

    useEffect(() => {
        const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;
        if (dragging) {
            if (isTouchDevice) {
                document.addEventListener("touchmove", onTouchMove, { passive: false });
                document.addEventListener("touchend", onMouseUp);
            } else {
                document.addEventListener("mousemove", onMouseMove);
                document.addEventListener("mouseup", onMouseUp);
            }
        } else {
            if (isTouchDevice){
                document.removeEventListener("touchmove", onTouchMove);
                document.removeEventListener("touchend", onMouseUp);
            } else {
                document.removeEventListener("mousemove", onMouseMove);
                document.removeEventListener("mouseup", onMouseUp);
            }
        }
        return () => {
            if (isTouchDevice){
                document.removeEventListener("touchmove", onTouchMove);
                document.removeEventListener("touchend", onMouseUp);
            } else {
                document.removeEventListener("mousemove", onMouseMove);
                document.removeEventListener("mouseup", onMouseUp);
            }
        };
    }, [dragging]);

    const checkColision = (latest, projectileId) => {
        if (!spriteRef.current) return;

        const spriteRectAbsolute = spriteRef.current.getBoundingClientRect();

        const spriteRect = {
            left: spriteRectAbsolute.left + 60,
            right: spriteRectAbsolute.right - 60,
            top: spriteRectAbsolute.top,
            bottom: spriteRectAbsolute.bottom,
        }

        const projectileRect = {
            left: latest.left,
            right: latest.left + 10,
            top: latest.top,
            bottom: latest.top + 10,
        };

        const isColliding =
            projectileRect.right > spriteRect.left &&
            projectileRect.left < spriteRect.right &&
            projectileRect.bottom > spriteRect.top &&
            projectileRect.top < spriteRect.bottom;

        if (isColliding) {
            setProjectiles((prev) => prev.filter((p) => p.id !== projectileId));
            const newHealth = player.health - 5;
            const updatedPlayer = {...player, health: newHealth > 0 ? newHealth : 0};
            updatePlayer(updatedPlayer);
        }
    }

    const removeProjectile = (id) => {
        const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;
        if (isTouchDevice) setProjectiles((prev) => prev.filter((p) => p.id !== id));
    };

    
    return (
        <>
            <motion.img
                src={enemySprite === 'right' ? enemyCaptured ? images.ENEMY_CAPTURED_SPRITE_RIGHT : images.ENEMY_SPRITE_RIGHT : enemyCaptured ? images.ENEMY_CAPTURED_SPRITE_LEFT : images.ENEMY_SPRITE_LEFT}
                alt="Flying Enemy"
                ref={enemyRef}
                className={`absolute w-40 h-40 object-contain cursor-pointer z-1 ${enemyCaptured || !draggingAvailable ? 'pointer-events-none' : ''}`}
                style={{ left: position.x, top: position.y }}
                onMouseDown={onMouseDown}
                onTouchStart={onTouchStart}
                animate={dragging ? {} : { left: position.x, top: position.y }}
                transition={dragging ? {} : { type: "spring", stiffness: 100, damping: 25 }} 
            />
                
            {/* Health Bar*/}
            {enemyCaptured && (
                <motion.div
                className="w-40 h-2 absolute rounded-full z-1"
                style={{ left: position.x, top: position.y }}
                animate={dragging ? {} : { left: position.x, top: position.y }}
                transition={dragging ? {} : { type: "spring", stiffness: 100, damping: 25 }} 
            >
                <motion.div 
                    className="h-2"
                    style={{ backgroundColor: health > (maxHealth * 0.5) ? "green" : health > (maxHealth * 0.2) ? "yellow" : "red" }}
                    animate={{ width: `${(health / maxHealth) * 100}%`}}
                />

            </motion.div>
            )}

            {projectiles.map((projectile, index) => (
                <motion.img
                    src={images.FIRE_SPRITE}
                    key={projectile.id}
                    className={`absolute z-1 ${projectileSize}`}
                    initial={{ left: projectile.x, top: projectile.y, rotate: projectile.angle }}
                    animate={{
                        left: projectile.x,
                        top: projectile.y,
                        transition: { duration: projectile.speed, ease: "linear" }
                    }}
                    style={{
                        position: "absolute",
                        transformOrigin: "center",
                    }}
                    onClick={() => removeProjectile(projectile.id)}
                    onUpdate={(latest) => checkColision(latest, projectile.id)}
                >
                    
                </motion.img>
            ))}

            
        </>
    );
};

export default EnemySprite;
