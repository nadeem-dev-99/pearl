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
            console.log("Pre-injected ASCII into fullscreen container");
        } else {
            console.warn("ASCII content not ready for pre-injection");
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
    
    console.log("Checking for portrait data...", {
        hasPortraitData: !!window.portraitData,
        hasPortraitAscii: !!window.PORTRAIT_ASCII,
        portraitContentLength: portraitContent ? portraitContent.length : 0
    });
    
    if (portraitContent) {
        console.log("Portrait data found, injecting...");
        const asciiContainer = document.getElementById('ascii-fullscreen-content');
        if (asciiContainer) {
            asciiContainer.innerHTML = portraitContent;
            console.log("ASCII injected into fullscreen container");
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
            console.log("ASCII injected into final message box");
        }
    } else {
        console.error("portraitData or PORTRAIT_ASCII not found! Retrying...");
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
                video.play().catch(err => console.log("Autoplay blocked:", err));
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
            switchScene(SCENES.QUESTIONS);
        });
    }
}

function switchScene(sceneId) {
    console.log(`Switching to scene: ${sceneId}`);
    
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
        if (sceneId === SCENES.ASCII_FULL) {
            // ASCII is a special overlay
            console.log("Applying active-scene to ASCII overlay");
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
            console.log("ACTivating Single Cinematic ASCII Reveal!");
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
        typewriterEl.style.animation = 'movieIntroZoom 5.5s ease-out forwards';
        
        // We increment AFTER setting the timeout for the next step
        setTimeout(() => {
            introIndex++; // THIS IS THE ONLY INCREMENT FOR REGULAR TEXTS
            showNextIntroStep();
        }, 6000); 
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

                // Go back to cinematic intro
                switchScene(SCENES.INTRO);
                startCinematicIntro();
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

    if (yesBtn) {
        yesBtn.addEventListener('click', () => {
            createExplosion();
            switchScene(SCENES.DATE_PLAN);
        });
    }

    if (noBtn) {
        noBtn.addEventListener('mouseover', () => {
            const x = Math.random() * (window.innerWidth - noBtn.offsetWidth);
            const y = Math.random() * (window.innerHeight - noBtn.offsetHeight);
            noBtn.style.position = 'fixed';
            noBtn.style.left = `${x}px`;
            noBtn.style.top = `${y}px`;
        });
    }
}

function setupNoButtonEscape() {
    const noBtn = document.querySelector('.btn-no');
    if (!noBtn) return;
    noBtn.addEventListener('mouseover', () => {
        const x = Math.random() * (window.innerWidth - noBtn.offsetWidth);
        const y = Math.random() * (window.innerHeight - noBtn.offsetHeight);
        noBtn.style.position = 'fixed';
        noBtn.style.left = `${x}px`;
        noBtn.style.top = `${y}px`;
    });
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

    const waLinkContainer = document.getElementById('wa-link-container');
    const message = encodeURIComponent(`Yes! I've thought about it deeply, and I'm 100% sure. I'd love to go on a date with you on ${date} for ${activity}! 🤍💍`);
    const waNumber = "923128881099";
    
    waLinkContainer.innerHTML = `
        <div class="commitment-card">
            <h3 class="commitment-title">A Promise of Sincerity</h3>
            <p class="commitment-text">
                "Before we take this step, I ask for your absolute truth. 
                Only reach out if your 'Yes' is as certain as the stars. 
                If your heart isn't 100% ready, I cherish our peace 
                more than a promise built on shadows."
            </p>
            <a href="https://wa.me/${waNumber}?text=${message}" target="_blank" class="wa-confirm-btn">
                I am 100% Ready 💬
            </a>
            <div class="commitment-footer">
                If you aren't ready to commit, your silence is respected.
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
        if (document.hidden) return; // Don't run when tab is inactive
        const rose = document.createElement('div');
        rose.className = 'falling-rose';
        rose.innerHTML = '🤍';
        rose.style.left = Math.random() * 100 + 'vw';
        rose.style.animationDuration = (Math.random() * 3 + 5) + 's';
        document.body.appendChild(rose);
        setTimeout(() => rose.remove(), 6000);
    }, 1200); // Slower rate (1.2s instead of 0.6s)
}

function createExplosion() {
    const colors = ['#ffd700', '#ffffff', '#ffeb3b', '#ffc107']; // Fewer colors
    const container = document.body;
    
    // Create fewer explosion points
    for (let e = 0; e < 2; e++) { 
        const originX = 20 + Math.random() * 60;
        const originY = 30 + Math.random() * 40;

        for (let i = 0; i < 40; i++) { // Reduced from 80 to 40 particles
            const particle = document.createElement('div');
            particle.className = 'firework-particle';
            particle.style.position = 'fixed';
            particle.style.left = originX + '%';
            particle.style.top = originY + '%';
            particle.style.width = Math.random() * 4 + 2 + 'px';
            particle.style.height = particle.style.width;
            particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            particle.style.borderRadius = '50%';
            particle.style.zIndex = '2000000'; // Higher than ASCII overlay
            particle.style.pointerEvents = 'none';
            container.appendChild(particle);

            const angle = Math.random() * Math.PI * 2;
            const velocity = 4 + Math.random() * 8; 
            const dx = Math.cos(angle) * velocity;
            const dy = Math.sin(angle) * velocity;

            let x = 0; 
            let y = 0;
            let opacity = 1;
            
            const animate = () => {
                x += dx; 
                y += dy; 
                y += 0.25; // Gravity
                opacity -= 0.015; // Faster fade for performance
                
                particle.style.transform = `translate(${x}px, ${y}px)`;
                particle.style.opacity = opacity;
                
                if (opacity > 0) {
                    requestAnimationFrame(animate);
                } else {
                    particle.remove();
                }
            };
            requestAnimationFrame(animate);
        }
    }
}
