// --- Configuration ---
const SCENES = {
    WELCOME: 'scene-welcome',
    INTRO: 'scene-intro',
    ASCII_FULL: 'scene-ascii-fullscreen', // Renamed for clarity and to match handleSuccess logic if needed
    QUESTIONS: 'scene-questions',
    MSG3: 'scene-msg-3',
    DATE_PLAN: 'scene-date-plan',
    RESULT: 'scene-result'
};

const INTRO_TEXTS = [
    "In the vastness of the universe...",
    "Stars are born every day...",
    "But on Feb 18th...",
    "The brightest one was sent to me. ✨",
    "Happy Birthday, My Pearl (Pakeeza) 🤍",
    "I've kept my feelings in the shadows...",
    "Afraid to lose even the sight of you.",
    "I know your heart might belong elsewhere...",
    "And if I am not the one you choose...",
    "I promise to disappear like a fading star.",
    "I will never hurt you, never crowd you...",
    "But before I go into the silence...",
    "I wanted to ask you one last thing..."
];

const QUESTIONS = [
    "Do you believe some moments are best shared in peace and silence?",
    "If I asked to steal you away for a whole day, just us two...",
    "Would you let me create a memory that belongs only to us?",
    "Ready for the most important question?"
];

// --- State Management ---
let introIndex = 0;
let questionIndex = 0;
let isIntroSkipped = false;
let isTransitioning = false;
let introTimeout = null;
let noButtonEscapeCount = 0;
const MAX_NO_ESCAPES = 4;
const CRY_GIF_URL = "https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExYW42dHN2dWlvMGZ2OXAxcmd2enc3a2lqeXcxd3JzOWI2OG92eGc4bCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/13t22jOjxpkAN2/giphy.gif";
const ROMANCE_VIDEO_URL = "https://media4.giphy.com/media/qxkaO3Ryg3Zja/giphy.mp4";

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    setupSceneNavigation();
    setupQuestions();
    setupDatePlanning();
    initStarlightTrail();
    initFallingRoses();
    setupNoButtonEscape();
    initVideoPlayer();
    
    // Inject ASCII with a small delay to ensure portrait_data.js is parsed
    setTimeout(() => {
        injectPortrait();
        // Also pre-inject into fullscreen to be safe
        const portraitContent = window.PORTRAIT_ASCII || window.portraitData;
        const container = document.getElementById('ascii-fullscreen-content');
        if (container && portraitContent) {
            container.innerHTML = portraitContent;
        }
    }, 500); // Increased delay to ensure data is loaded
});

function initVideoPlayer() {
    const video = document.getElementById('bg-video');
    const container = document.getElementById('music-player-container');
    const overlay = document.getElementById('video-overlay');

    if (!video || !container || !overlay) return;

    container.addEventListener('click', () => {
        if (video.paused) {
            video.play();
            overlay.classList.remove('paused');
            overlay.classList.add('playing');
            overlay.innerHTML = '<div class="pause-icon"><div class="pause-bar"></div><div class="pause-bar"></div></div>';
        } else {
            video.pause();
            overlay.classList.remove('playing');
            overlay.classList.add('paused');
            overlay.innerHTML = '<span class="play-icon">▶</span>';
        }
    });

    // Auto-pause if video ends (though it should loop)
    video.addEventListener('ended', () => {
        overlay.classList.remove('playing');
        overlay.classList.add('paused');
        overlay.innerHTML = '<span class="play-icon">▶</span>';
    });
}

function injectPortrait() {
    // Inject ASCII if portraitData or PORTRAIT_ASCII is available
    const portraitContent = window.PORTRAIT_ASCII || window.portraitData;
    
    if (portraitContent) {
        const asciiContainer = document.getElementById('ascii-fullscreen-content');
        if (asciiContainer) {
            asciiContainer.innerHTML = portraitContent;
        }
        
        const portraitBox = document.getElementById('portrait-container');
        if (portraitBox) {
            portraitBox.innerHTML = portraitContent;
            // Overhaul styles for the final portrait box - Make it much larger
            portraitBox.style.display = 'flex';
            portraitBox.style.justifyContent = 'center';
            portraitBox.style.alignItems = 'center';
            portraitBox.style.overflow = 'hidden';
            // portraitBox.style.height = '600px'; // Significantly increased height
            // portraitBox.style.width = '100%';
            // portraitBox.style.margin = '30px 0';
            
            // Apply scale to the container inside
            const inner = portraitBox.querySelector('.text-portrait-container');
            if (inner) {
                inner.style.transform = 'scale(0.85)'; // Significantly increased scale
                inner.style.transformOrigin = 'center';
                inner.style.filter = 'brightness(1.3) contrast(1.2) drop-shadow(0 0 15px rgba(255, 215, 0, 0.3))';
                inner.style.display = 'inline-block';
            }
        }
    } else {
        // Retry a few times if not found
        if (!window.injectionRetries) window.injectionRetries = 0;
        if (window.injectionRetries < 30) {
            window.injectionRetries++;
            setTimeout(injectPortrait, 300);
        }
    }
}

// --- Navigation Logic ---
function setupSceneNavigation() {
    const startBtn = document.getElementById('start-journey-btn');
    if (startBtn) {
        startBtn.addEventListener('click', () => {
            // Trigger video autoplay on first interaction
            const video = document.getElementById('bg-video');
            const overlay = document.getElementById('video-overlay');
            if (video && video.paused) {
                video.play().catch(() => {});
                if (overlay) {
                    overlay.classList.remove('paused');
                    overlay.classList.add('playing');
                    overlay.innerHTML = '<div class="pause-icon"><div class="pause-bar"></div><div class="pause-bar"></div></div>';
                }
            }
            
            switchScene(SCENES.INTRO);
            startCinematicIntro();
        });
    }

    const skipBtn = document.getElementById('skip-intro-btn');
    if (skipBtn) {
        skipBtn.addEventListener('click', () => {
            isIntroSkipped = true;
            isTransitioning = false;
            if (introTimeout) clearTimeout(introTimeout);
            switchScene(SCENES.QUESTIONS);
        });
    }
}

function switchScene(sceneId) {
    // 1. Handle regular scenes
    document.querySelectorAll('.scene').forEach(el => {
        if (el.id !== SCENES.ASCII_FULL) {
            el.classList.remove('active-scene');
            el.classList.add('hidden-scene');
            el.style.display = 'none';
        }
    });

    // 2. Handle the target scene
    const target = document.getElementById(sceneId);
    if (target) {
        // Force scroll to top on every scene switch
        window.scrollTo(0, 0);
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
        target.scrollTop = 0;

        if (sceneId === SCENES.ASCII_FULL) {
            // ASCII is a special overlay
            target.classList.add('active-scene');
            target.classList.remove('hidden-scene');
            target.style.display = 'flex'; 
            
            // Check if already injected to avoid "double loading" flicker
            const container = document.getElementById('ascii-fullscreen-content');
            if (container && container.innerHTML.length < 100) { 
                const portraitContent = window.PORTRAIT_ASCII || window.portraitData;
                if (portraitContent) {
                    container.innerHTML = portraitContent;
                }
            }
        } else {
            // Normal scene switch
            target.classList.remove('hidden-scene');
            target.classList.add('active-scene');
            target.style.display = 'flex';
            
            // If we are NOT going to ASCII, make sure ASCII is hidden
            const ascii = document.getElementById(SCENES.ASCII_FULL);
            if (ascii) {
                ascii.classList.remove('active-scene');
                ascii.classList.add('hidden-scene');
                ascii.style.display = 'none'; // Explicitly hide for safety
            }
        }
    }
}

// --- Hollywood Cinematic Logic (Question -> Text -> Question) ---
function startCinematicIntro() {
    if (isIntroSkipped || isTransitioning) return;

    const typewriterEl = document.getElementById('typewriter-intro');
    
    function showNextIntroStep() {
        if (isIntroSkipped) return;

        // If we ran out of intro texts, go to questions or final scene
        if (introIndex >= INTRO_TEXTS.length) {
            isTransitioning = false;
            if (questionIndex < QUESTIONS.length) {
                switchScene(SCENES.QUESTIONS);
            } else {
                switchScene(SCENES.MSG3);
            }
            return;
        }

        // --- Cinematic Overhaul Logic ---
        
        // Trigger ASCII reveal ONLY ONCE at the middle of the intro (index 7)
        if (introIndex === 7 && !isIntroSkipped) {
            isTransitioning = true;
            
            // 1. Burst into ASCII Scene
            switchScene(SCENES.ASCII_FULL);
            
            // 2. Continuous Fireworks for 15 seconds (Increased from 5s)
            const fireworksInterval = setInterval(() => {
                if (!isTransitioning) {
                    clearInterval(fireworksInterval);
                    return;
                }
                createExplosion();
            }, 800); // Slightly faster firework rate for more intensity
            
            // 3. Return to Intro after 10 seconds (Increased from 5s)
            setTimeout(() => {
                clearInterval(fireworksInterval);
                if (!isIntroSkipped) {
                    isTransitioning = false;
                    switchScene(SCENES.INTRO);
                    continueTyping();
                }
            }, 15000); 
            return;
        } 
        
        // Remove intermediate questions to speed up the flow, or only show them at the very end
        // Trigger Question every 4 texts instead of 2 to reduce interruptions
        if (introIndex > 0 && introIndex % 4 === 0 && introIndex !== 8 && questionIndex < QUESTIONS.length) {
            isTransitioning = true;
            switchScene(SCENES.QUESTIONS);
            return;
        } 
        
        continueTyping();
    }

    function continueTyping() {
        if (isIntroSkipped || isTransitioning) return;
        
        const text = INTRO_TEXTS[introIndex];
        if (!text) {
            // If text is undefined for some reason, skip it
            introIndex++;
            showNextIntroStep();
            return;
        }

        typewriterEl.textContent = text; 
        typewriterEl.style.animation = 'none';
        void typewriterEl.offsetWidth; 
        typewriterEl.style.animation = 'movieIntroZoom 8s ease-out forwards';
        
        // Increased delay to 10 seconds (8s animation + 2s pause)
        introTimeout = setTimeout(() => {
            introIndex++; 
            showNextIntroStep();
        }, 10000); 
    }

    showNextIntroStep();
}

// --- Questions Logic ---
function setupQuestions() {
    const questionText = document.getElementById('dynamic-question');
    const btns = document.querySelectorAll('.question-ans-btn');

    btns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-no')) return;

            questionIndex++;
            // Increment introIndex here so we don't get stuck on the question condition
            introIndex++; 
            isTransitioning = false; // Reset transitioning flag

            if (questionIndex < QUESTIONS.length) {
                // Update text for next time we enter questions
                questionText.textContent = QUESTIONS[questionIndex];
                resetNoButton();
                noButtonEscapeCount = 0;

                if (isIntroSkipped) {
                    // If skipped, stay on the questions scene and just update the text
                    // The text is already updated above
                } else {
                    // Go back to cinematic intro
                    switchScene(SCENES.INTRO);
                    startCinematicIntro();
                }
            } else {
                switchScene(SCENES.MSG3);
                setupFinalValentineButtons();
            }
        });
    });
}

function setupFinalValentineButtons() {
    const yesBtn = document.getElementById('yes-btn');
    const noBtn = document.getElementById('no-btn');

    if (yesBtn && !yesBtn.dataset.listenerAttached) {
        yesBtn.addEventListener('click', () => {
            createExplosion();
            switchScene(SCENES.DATE_PLAN);
        });
        yesBtn.dataset.listenerAttached = "true";
    }

    // No button is already handled by setupNoButtonEscape in DOMContentLoaded
}

function setupNoButtonEscape() {
    const noBtns = document.querySelectorAll('.btn-no');
    noBtns.forEach(btn => {
        if (!btn.dataset.listenerAttached) {
            btn.addEventListener('mouseover', handleNoButtonEscape);
            btn.addEventListener('click', handleNoButtonEscape);
            btn.dataset.listenerAttached = "true";
        }
    });
}

function handleNoButtonEscape(e) {
    const btn = e.target;
    noButtonEscapeCount++;

    if (noButtonEscapeCount >= MAX_NO_ESCAPES) {
        showCryingGif();
        return;
    }

    // Add a dodge animation before jumping
    btn.style.animation = 'none';
    void btn.offsetWidth;
    btn.style.animation = 'btnDodge 0.4s ease-out';

    setTimeout(() => {
        const x = Math.random() * (window.innerWidth - btn.offsetWidth);
        const y = Math.random() * (window.innerHeight - btn.offsetHeight);
        btn.style.position = 'fixed';
        btn.style.left = `${x}px`;
        btn.style.top = `${y}px`;
        btn.style.zIndex = '1000';
    }, 150);
}

function showCryingGif() {
    // Show an overlay with the crying GIF
    let overlay = document.getElementById('cry-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'cry-overlay';
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
        overlay.style.display = 'flex';
        overlay.style.flexDirection = 'column';
        overlay.style.justifyContent = 'center';
        overlay.style.alignItems = 'center';
        overlay.style.zIndex = '1000000';
        overlay.style.opacity = '0';
        overlay.style.transition = 'opacity 0.5s ease';
        
        overlay.innerHTML = `
            <img src="${CRY_GIF_URL}" alt="Crying" style="max-width: 300px; border-radius: 15px; box-shadow: 0 0 30px rgba(255, 255, 255, 0.2);">
            <h2 style="color: white; font-family: 'Playfair Display', serif; margin-top: 20px; text-align: center; font-size: 1.5rem;">Why no? 🥺</h2>
            <button id="retry-no-btn" class="royal-btn-welcome" style="margin-top: 20px; padding: 10px 25px; font-size: 0.9rem;">I'm sorry, let me try again 🤍</button>
        `;
        document.body.appendChild(overlay);
        
        // Force reflow for transition
        void overlay.offsetWidth;
        overlay.style.opacity = '1';
        
        document.getElementById('retry-no-btn').addEventListener('click', () => {
            overlay.style.opacity = '0';
            setTimeout(() => {
                overlay.remove();
                noButtonEscapeCount = 0;
                resetNoButton();
            }, 500);
        });
    }
}

function resetNoButton() {
    const noBtns = document.querySelectorAll('.btn-no');
    noBtns.forEach(btn => {
        btn.style.position = 'relative';
        btn.style.left = '0';
        btn.style.top = '0';
    });
}

// --- Date Planning & WhatsApp Logic ---
function setupDatePlanning() {
    const submitBtn = document.getElementById('final-submit-btn');
    const dateInput = document.getElementById('date-value');
    const activityInput = document.getElementById('date-activity');

    submitBtn.addEventListener('click', () => {
        if (!dateInput.value || !activityInput.value) {
            alert("Please choose a date and activity first! 🤍");
            return;
        }
        handleSuccess(dateInput.value, activityInput.value);
    });
}

function handleSuccess(date, activity) {
    createExplosion();
    switchScene(SCENES.RESULT);

    const romanceContainer = document.getElementById('romance-gif-container');
    if (romanceContainer) {
        romanceContainer.innerHTML = `
            <div class="polaroid-frame">
                <video id="romance-video" autoplay loop muted playsinline style="width: 100%; border-radius: 8px;">
                    <source src="${ROMANCE_VIDEO_URL}" type="video/mp4">
                </video>
            </div>
        `;
        const video = document.getElementById('romance-video');
        if (video) {
            video.playbackRate = 0.6; // Reduced speed for romantic feel
        }
    }

    const waLinkContainer = document.getElementById('wa-link-container');
    const message = encodeURIComponent(`Yes! I've thought about it deeply. My heart is 100% sure. I'd love to go on our special date on ${date} for ${activity}! Forever yours, Pakeeza (Pearl) 🤍💍`);
    const waNumber = "923128881099";
    
    waLinkContainer.innerHTML = `
        <div class="commitment-card">
            <h3 class="commitment-title">A Promise to My Pearl</h3>
            <p class="commitment-text">
                "Pakeeza, you are the most precious pearl in the ocean of my life. 
                Before we take this step, I ask for your absolute truth. 
                Only reach out if your 'Yes' is as certain as the stars. 
                I cherish your peace more than a promise built on shadows."
            </p>
            <a href="https://wa.me/${waNumber}?text=${message}" target="_blank" class="wa-confirm-btn">
                I am 100% Ready, My Love 💬
            </a>
            <div class="commitment-footer">
                My Dearest Pakeeza, your happiness is my only promise.
            </div>
        </div>
    `;
}

// --- Visual Effects ---
function initStarlightTrail() {
    document.addEventListener('mousemove', (e) => {
        if (Math.random() > 0.15) return; // Increased threshold for fewer sparkles
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle';
        sparkle.style.left = e.pageX + 'px';
        sparkle.style.top = e.pageY + 'px';
        sparkle.style.backgroundColor = '#ffd700';
        document.body.appendChild(sparkle);
        setTimeout(() => sparkle.remove(), 800); // Shorter lifetime
    });
}

function initFallingRoses() {
    setInterval(() => {
        if (document.hidden) return; 
        const rose = document.createElement('div');
        rose.className = 'falling-rose';
        rose.innerHTML = '🤍';
        rose.style.left = Math.random() * 100 + 'vw';
        const duration = (Math.random() * 3 + 5);
        rose.style.animationDuration = duration + 's';
        rose.style.fontSize = (Math.random() * 10 + 10) + 'px';
        rose.style.opacity = Math.random() * 0.5 + 0.3;
        document.body.appendChild(rose);
        setTimeout(() => rose.remove(), duration * 1000);
    }, 600);
}

function createExplosion() {
    const container = document.body;
    const colors = ['#ffd700', '#ffffff', '#ffeb3b', '#ffc107'];
    const emojis = ['🤍', '🌹', '✨'];

    // 1. Create Cinematic Pixel Fireworks
    for (let e = 0; e < 3; e++) { 
        setTimeout(() => {
            const originX = 20 + Math.random() * 60;
            const originY = 30 + Math.random() * 40;

            for (let i = 0; i < 40; i++) {
                const particle = document.createElement('div');
                particle.className = 'firework-particle';
                const color = colors[Math.floor(Math.random() * colors.length)];
                particle.style.backgroundColor = color;
                particle.style.boxShadow = `0 0 10px ${color}`;
                
                const angle = Math.random() * Math.PI * 2;
                const velocity = 5 + Math.random() * 10;
                const vx = Math.cos(angle) * velocity;
                const vy = Math.sin(angle) * velocity;
                
                particle.style.left = originX + 'vw';
                particle.style.top = originY + 'vh';
                
                container.appendChild(particle);
                
                let posX = 0;
                let posY = 0;
                let curVx = vx;
                let curVy = vy;
                
                const animate = () => {
                    posX += curVx;
                    posY += curVy;
                    curVy += 0.2; // Gravity
                    curVx *= 0.98;
                    curVy *= 0.98;
                    
                    particle.style.transform = `translate(${posX}px, ${posY}px)`;
                    
                    if (parseFloat(particle.style.opacity) <= 0) {
                        particle.remove();
                    } else {
                        particle.style.opacity = (parseFloat(particle.style.opacity) || 1) - 0.02;
                        requestAnimationFrame(animate);
                    }
                };
                requestAnimationFrame(animate);
            }
        }, e * 500);
    }

    // 2. Create Rose & Heart Emoji Bursts
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    for (let burst = 0; burst < 3; burst++) {
        setTimeout(() => {
            for (let i = 0; i < 15; i++) {
                const particle = document.createElement('div');
                particle.className = 'rose-particle';
                particle.innerHTML = emojis[Math.floor(Math.random() * emojis.length)];
                
                const angle = (i / 15) * Math.PI * 2 + (Math.random() * 0.5);
                const distance = 100 + Math.random() * 150;
                const tx = Math.cos(angle) * distance;
                const ty = Math.sin(angle) * distance;
                
                particle.style.setProperty('--tx', `${tx}px`);
                particle.style.setProperty('--ty', `${ty}px`);
                
                particle.style.left = (centerX + (Math.random() * 40 - 20)) + 'px';
                particle.style.top = (centerY + (Math.random() * 40 - 20)) + 'px';
                
                container.appendChild(particle);
                setTimeout(() => particle.remove(), 2500);
            }
        }, burst * 600);
    }
}
