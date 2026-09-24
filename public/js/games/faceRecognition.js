(() => {
    "use strict";

    const FACE_GAME = "face";
    const MAX_LEVEL = 5;

    const FACES = [
        { icon: "🐶" },
        { icon: "🐱" },
        { icon: "🐭" },
        { icon: "🐹" },
        { icon: "🐰" },
        { icon: "🦊" },
        { icon: "🐻" },
        { icon: "🐼" },
        { icon: "🐨" },
        { icon: "🐯" },
        { icon: "🦁" },
        { icon: "🐮" }
    ];

    const LEVELS = {
        1: { targets: 2, choices: 4, memorizeSeconds: 5 },
        2: { targets: 3, choices: 6, memorizeSeconds: 5 },
        3: { targets: 4, choices: 8, memorizeSeconds: 6 },
        4: { targets: 5, choices: 10, memorizeSeconds: 6 },
        5: { targets: 6, choices: 12, memorizeSeconds: 7 }
    };

    let roundToken = 0;
    let timers = [];

    function getArea() {
        return document.getElementById("gameArea");
    }

    function rememberTimer(timer) {
        timers.push(timer);
        return timer;
    }

    function clearTimers() {
        timers.forEach((timer) => {
            clearTimeout(timer);
            clearInterval(timer);
        });

        timers = [];
    }

    function getLevel() {
        const configured = Number(
            window.GameConfig?.level ||
            window.App?.state?.level ||
            1
        );

        return Math.min(
            MAX_LEVEL,
            Math.max(
                1,
                Number.isFinite(configured)
                    ? configured
                    : 1
            )
        );
    }

    function setLevel(level) {
        const nextLevel = Math.min(
            MAX_LEVEL,
            Math.max(1, level)
        );

        if (window.App?.state) {
            window.App.state.level = nextLevel;
        }

        localStorage.setItem(
            "memorysaathi_level",
            String(nextLevel)
        );

        window.GameConfig = {
            ...(window.GameConfig || {}),
            level: nextLevel
        };

        return nextLevel;
    }

    function shuffle(items) {
        const result = [...items];

        for (let i = result.length - 1; i > 0; i -= 1) {
            const j = Math.floor(Math.random() * (i + 1));

            [result[i], result[j]] = [
                result[j],
                result[i]
            ];
        }

        return result;
    }

    function injectStyles(area) {
        if (
            area.querySelector(
                "style[data-face-game-style]"
            )
        ) {
            return;
        }

        const style = document.createElement("style");
        style.dataset.faceGameStyle = "true";

        style.textContent = `
            .face-game-shell {
                max-width: 900px;
                margin: 0 auto;
                color: #172033;
            }

            .face-game-topline {
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 12px;
                flex-wrap: wrap;
                margin-bottom: 18px;
            }

            .face-game-eyebrow {
                color: #3157d5;
                font-size: 14px;
                font-weight: 800;
                letter-spacing: .08em;
                text-transform: uppercase;
            }

            .face-game-level {
                background: #edf0f8;
                border-radius: 999px;
                padding: 8px 13px;
                font-size: 15px;
                font-weight: 800;
            }

            .face-game-intro {
                text-align: center;
                padding: 28px 18px 34px;
                border: 1px solid #e3e7ef;
                border-radius: 20px;
                background: linear-gradient(
                    135deg,
                    #fff,
                    #eef2ff
                );
            }

            .face-game-icon {
                font-size: 66px;
                line-height: 1;
                margin: 4px 0 14px;
            }

            .face-game-intro h2,
            .face-game-phase h2 {
                margin: 0 0 10px;
                font-size: 30px;
            }

            .face-game-copy {
                max-width: 620px;
                margin: 0 auto 20px;
                color: #647089;
                line-height: 1.55;
            }

            .face-game-steps {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 10px;
                max-width: 700px;
                margin: 22px auto;
                text-align: left;
            }

            .face-game-step {
                padding: 14px;
                border-radius: 14px;
                background: #f8f9fc;
                border: 1px solid #e3e7ef;
            }

            .face-game-step strong {
                display: block;
                margin-bottom: 4px;
            }

            .face-game-step span {
                color: #647089;
                font-size: 15px;
            }

            .face-game-actions {
                display: flex;
                justify-content: center;
                gap: 10px;
                flex-wrap: wrap;
                margin-top: 22px;
            }

            .face-game-button {
                min-width: 150px;
                border: 0;
                border-radius: 14px;
                padding: 14px 20px;
                cursor: pointer;
                font: inherit;
                font-weight: 800;
                background: #3157d5;
                color: #fff;
            }

            .face-game-button:hover {
                background: #2343a9;
            }

            .face-game-button:focus-visible,
            .face-game-card:focus-visible {
                outline: 4px solid #9fb1ff;
                outline-offset: 3px;
            }

            .face-game-button.secondary {
                background: #fff;
                color: #172033;
                border: 1px solid #cfd5e1;
            }

            .face-game-button.secondary:hover {
                background: #f3f5fa;
            }

            .face-game-phase {
                text-align: center;
            }

            .face-game-instruction {
                color: #647089;
                margin: 0 0 18px;
                line-height: 1.5;
            }

            .face-game-countdown {
                width: 100%;
                max-width: 520px;
                height: 12px;
                margin: 0 auto 8px;
                border-radius: 999px;
                overflow: hidden;
                background: #e7eaf0;
            }

            .face-game-countdown > span {
                display: block;
                width: 100%;
                height: 100%;
                transform-origin: left center;
                background: #3157d5;
                transition: transform .25s linear;
            }

            .face-game-countdown-label {
                color: #647089;
                font-weight: 800;
                margin-bottom: 20px;
            }

            .face-game-face-grid {
                display: grid;
                grid-template-columns: repeat(
                    auto-fit,
                    minmax(125px, 1fr)
                );
                gap: 14px;
                max-width: 760px;
                margin: 0 auto;
            }

            .face-game-card {
                min-height: 142px;
                border: 2px solid #e3e7ef;
                border-radius: 18px;
                background: #f8f9fc;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                gap: 8px;
                padding: 14px 10px;
                transition:
                    transform .16s ease,
                    border-color .16s ease,
                    background .16s ease,
                    box-shadow .16s ease;
            }

            button.face-game-card {
                cursor: pointer;
                font: inherit;
                color: #172033;
            }

            button.face-game-card:hover {
                transform: translateY(-2px);
                box-shadow: 0 5px 16px #17203316;
            }

            .face-game-card.selected {
                border-color: #3157d5;
                background: #eef1ff;
                box-shadow: 0 0 0 3px #3157d533;
                transform: translateY(-2px);
            }

            .face-game-card.correct {
                border-color: #16845b;
                background: #e8f7f0;
            }

            .face-game-card.incorrect {
                border-color: #b53636;
                background: #fff0f0;
            }

            .face-game-face {
                font-size: 58px;
                line-height: 1;
            }

            .face-game-selection-note {
                min-height: 24px;
                color: #647089;
                margin: 18px 0 0;
            }

            .face-game-result {
                text-align: center;
                padding: 20px 0 4px;
            }

            .face-game-result-mark {
                font-size: 58px;
                line-height: 1;
                margin-bottom: 10px;
            }

            .face-game-stats {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 12px;
                max-width: 620px;
                margin: 22px auto;
            }

            .face-game-stat {
                padding: 16px 10px;
                border-radius: 15px;
                background: #f8f9fc;
                border: 1px solid #e3e7ef;
            }

            .face-game-stat small {
                display: block;
                color: #647089;
                margin-bottom: 5px;
            }

            .face-game-stat strong {
                font-size: 28px;
            }

            .face-game-feedback {
                max-width: 620px;
                margin: 0 auto;
                color: #647089;
                line-height: 1.5;
            }

            .face-game-review {
                margin: 20px auto 0;
                max-width: 760px;
                text-align: left;
            }

            .face-game-review h3 {
                margin: 0 0 12px;
            }

            .face-game-review .face-game-face-grid {
                grid-template-columns: repeat(
                    auto-fit,
                    minmax(100px, 1fr)
                );
            }

            .face-game-review .face-game-card {
                min-height: 104px;
            }

            .face-game-review .face-game-face {
                font-size: 42px;
            }

            @media (max-width: 650px) {
                .face-game-steps {
                    grid-template-columns: 1fr;
                    text-align: center;
                }

                .face-game-intro h2,
                .face-game-phase h2 {
                    font-size: 26px;
                }

                .face-game-face-grid {
                    grid-template-columns: repeat(2, 1fr);
                }

                .face-game-stats {
                    grid-template-columns: 1fr;
                    max-width: 260px;
                }

                .face-game-card {
                    min-height: 128px;
                }
            }
        `;

        area.appendChild(style);
    }

    function shell(level, content) {
        return `
            <div class="face-game-shell">
                <div class="face-game-topline">
                    <div class="face-game-eyebrow">
                        🧠 MemorySaathi · Face Recognition
                    </div>

                    <div
                        class="face-game-level"
                        aria-label="Level ${level} of ${MAX_LEVEL}"
                    >
                        Level ${level} of ${MAX_LEVEL}
                    </div>
                </div>

                ${content}
            </div>
        `;
    }

    function faceCard(face, options = {}) {
        const {
            button = false,
            selected = false,
            state = ""
        } = options;

        const className =
            `face-game-card${selected ? " selected" : ""}${state ? ` ${state}` : ""}`;

        if (button) {
            return `
                <button
                    type="button"
                    class="${className}"
                    data-face="${face.icon}"
                    aria-label="Face option"
                    aria-pressed="${selected}"
                >
                    <span
                        class="face-game-face"
                        aria-hidden="true"
                    >
                        ${face.icon}
                    </span>
                </button>
            `;
        }

        return `
            <div
                class="${className}"
                aria-label="Face"
                aria-hidden="true"
            >
                <span
                    class="face-game-face"
                    aria-hidden="true"
                >
                    ${face.icon}
                </span>
            </div>
        `;
    }

    function startScreen(level) {
        const config = LEVELS[level];

        return shell(level, `
            <section
                class="face-game-intro"
                aria-labelledby="face-game-title"
            >
                <div
                    class="face-game-icon"
                    aria-hidden="true"
                >
                    🐶 🐱 🦊
                </div>

                <h2 id="face-game-title">
                    Face Recognition
                </h2>

                <p class="face-game-copy">
                    Study the faces carefully, then choose the ones you remember.
                    Take your time—accuracy matters more than speed.
                </p>

                <div
                    class="face-game-steps"
                    aria-label="How to play"
                >
                    <div class="face-game-step">
                        <strong>1. Remember</strong>
                        <span>Look at ${config.targets} faces.</span>
                    </div>

                    <div class="face-game-step">
                        <strong>2. Find</strong>
                        <span>Choose the faces you saw.</span>
                    </div>

                    <div class="face-game-step">
                        <strong>3. Check</strong>
                        <span>Submit your answer and see your score.</span>
                    </div>
                </div>

                <p class="face-game-copy">
                    <strong>Level ${level} of ${MAX_LEVEL}</strong>
                    · ${config.targets} faces
                    · ${config.choices} choices
                </p>

                <div class="face-game-actions">
                    <button
                        type="button"
                        class="face-game-button secondary"
                        data-face-action="exit"
                    >
                        Exit Game
                    </button>

                    <button
                        type="button"
                        class="face-game-button"
                        data-face-action="begin"
                    >
                        Start Game
                    </button>
                </div>
            </section>
        `);
    }

    function memorizationScreen(level, round, targets) {
        const config = LEVELS[level];

        const targetMarkup = targets
            .map((face) => faceCard(face))
            .join("");

        return shell(level, `
            <section
                class="face-game-phase"
                aria-live="polite"
                aria-labelledby="face-memory-title"
            >
                <h2 id="face-memory-title">
                    Remember these faces
                </h2>

                <p class="face-game-instruction">
                    Look carefully. The faces will be hidden when the timer ends.
                </p>

                <div
                    class="face-game-countdown"
                    aria-hidden="true"
                >
                    <span id="face-countdown-bar"></span>
                </div>

                <div
                    id="face-countdown-label"
                    class="face-game-countdown-label"
                >
                    ${config.memorizeSeconds} seconds remaining
                </div>

                <div class="face-game-face-grid">
                    ${targetMarkup}
                </div>

                <div class="face-game-actions">
                    <button
                        type="button"
                        class="face-game-button secondary"
                        data-face-action="exit"
                    >
                        Exit Game
                    </button>
                </div>
            </section>
        `);
    }

    function selectionScreen(
        level,
        round,
        options,
        selected,
        targetCount
    ) {
        return shell(level, `
            <section
                class="face-game-phase"
                aria-live="polite"
                aria-labelledby="face-select-title"
            >
                <h2 id="face-select-title">
                    Which faces did you see?
                </h2>

                <p class="face-game-instruction">
                    Select all the faces you remember, then check your answer.
                </p>

                <div
                    id="face-options"
                    class="face-game-face-grid"
                >
                    ${options
                        .map((face) =>
                            faceCard(face, {
                                button: true,
                                selected: selected.has(face.icon)
                            })
                        )
                        .join("")}
                </div>

                <p
                    id="face-selection-note"
                    class="face-game-selection-note"
                >
                    Selected: 0/${targetCount}
                </p>

                <div class="face-game-actions">
                    <button
                        type="button"
                        class="face-game-button secondary"
                        data-face-action="exit"
                    >
                        Exit Game
                    </button>

                    <button
                        type="button"
                        class="face-game-button"
                        data-face-action="submit"
                    >
                        Check Answer
                    </button>
                </div>
            </section>
        `);
    }

    function feedback(correct, wrong, targetCount) {
        if (
            correct === targetCount &&
            wrong === 0
        ) {
            return "Excellent memory! You found every face correctly.";
        }

        if (
            correct >= Math.ceil(targetCount / 2) &&
            wrong === 0
        ) {
            return "Well done! You remembered most of the faces.";
        }

        if (wrong > 0) {
            return "Good effort. Look closely at the correct faces and try again when you are ready.";
        }

        return "Nice try. A fresh round will help you practise your memory.";
    }

    function resultScreen(level, round, resultData) {
        const {
            targets,
            options,
            correct,
            wrong,
            accuracy,
            selected
        } = resultData;

        const perfect =
            correct === targets.length &&
            wrong === 0;

        const completed = level === MAX_LEVEL;

        const review = options
            .map((face) => {
                const isTarget = targets.some(
                    (target) => target.icon === face.icon
                );

                const wasSelected = selected.has(face.icon);

                const state = isTarget
                    ? "correct"
                    : (wasSelected ? "incorrect" : "");

                return faceCard(face, { state });
            })
            .join("");

        const nextAction =
            level < MAX_LEVEL
                ? `
                    <button
                        type="button"
                        class="face-game-button"
                        data-face-action="next"
                    >
                        Next Level
                    </button>
                `
                : `
                    <button
                        type="button"
                        class="face-game-button"
                        data-face-action="restart"
                    >
                        Restart Game
                    </button>
                `;

        const title = completed
            ? "Face Recognition Complete!"
            : (
                perfect
                    ? "Great job!"
                    : "Round complete"
            );

        const message = completed
            ? "Excellent work! You completed all 5 levels."
            : feedback(
                correct,
                wrong,
                targets.length
            );

        return shell(level, `
            <section
                class="face-game-result"
                aria-live="polite"
                aria-labelledby="face-result-title"
            >
                <div
                    class="face-game-result-mark"
                    aria-hidden="true"
                >
                    ${completed || perfect ? "🌟" : "👏"}
                </div>

                <h2 id="face-result-title">
                    ${title}
                </h2>

                <p class="face-game-feedback">
                    ${message}
                </p>

                <div class="face-game-stats">
                    <div class="face-game-stat">
                        <small>Score</small>
                        <strong>${correct}/${targets.length}</strong>
                    </div>

                    <div class="face-game-stat">
                        <small>Accuracy</small>
                        <strong>${accuracy}%</strong>
                    </div>

                    <div class="face-game-stat">
                        <small>Level</small>
                        <strong>${level}</strong>
                    </div>
                </div>

                <div class="face-game-review">
                    <h3>Round review</h3>

                    <p class="face-game-instruction">
                        Green faces were correct answers.
                        Red faces were selected by mistake.
                    </p>

                    <div class="face-game-face-grid">
                        ${review}
                    </div>
                </div>

                <div class="face-game-actions">
                    <button
                        type="button"
                        class="face-game-button secondary"
                        data-face-action="exit"
                    >
                        Exit Game
                    </button>

                    <button
                        type="button"
                        class="face-game-button secondary"
                        data-face-action="retry"
                    >
                        Retry Level ${level}
                    </button>

                    ${nextAction}
                </div>
            </section>
        `);
    }

    function renderStart(level) {
        const area = getArea();

        if (!area) {
            return;
        }

        clearTimers();

        area.innerHTML = "";
        injectStyles(area);

        area.insertAdjacentHTML(
            "beforeend",
            startScreen(level)
        );

        area
            .querySelector(
                '[data-face-action="begin"]'
            )
            ?.addEventListener(
                "click",
                () => beginRound(level)
            );

        area
            .querySelector(
                '[data-face-action="exit"]'
            )
            ?.addEventListener(
                "click",
                exitGame
            );
    }

    function beginRound(level) {
        const area = getArea();

        if (!area) {
            return;
        }

        clearTimers();

        const currentRound = ++roundToken;
        const config = LEVELS[level];

        const targets = shuffle(FACES).slice(
            0,
            config.targets
        );

        const distractors = shuffle(
            FACES.filter(
                (face) =>
                    !targets.some(
                        (target) =>
                            target.icon === face.icon
                    )
            )
        ).slice(
            0,
            config.choices - config.targets
        );

        const options = shuffle([
            ...targets,
            ...distractors
        ]);

        const startTime = Date.now();

        area.innerHTML = "";
        injectStyles(area);

        area.insertAdjacentHTML(
            "beforeend",
            memorizationScreen(
                level,
                currentRound,
                targets
            )
        );

        const label = area.querySelector(
            "#face-countdown-label"
        );

        const bar = area.querySelector(
            "#face-countdown-bar"
        );

        let remaining = config.memorizeSeconds;

        const updateCountdown = () => {
            if (
                currentRound !== roundToken ||
                !label ||
                !bar
            ) {
                return;
            }

            label.textContent =
                `${remaining} second${remaining === 1 ? "" : "s"} remaining`;

            bar.style.transform =
                `scaleX(${Math.max(
                    0,
                    remaining / config.memorizeSeconds
                )})`;
        };

        updateCountdown();

        rememberTimer(
            setInterval(() => {
                remaining -= 1;
                updateCountdown();
            }, 1000)
        );

        rememberTimer(
            setTimeout(() => {
                if (currentRound !== roundToken) {
                    return;
                }

                clearTimers();

                showSelection(
                    level,
                    currentRound,
                    targets,
                    options,
                    startTime
                );
            }, config.memorizeSeconds * 1000)
        );
    }

    function showSelection(
        level,
        currentRound,
        targets,
        options,
        startTime
    ) {
        const area = getArea();

        if (
            !area ||
            currentRound !== roundToken
        ) {
            return;
        }

        const selected = new Set();

        area.innerHTML = "";
        injectStyles(area);

        area.insertAdjacentHTML(
            "beforeend",
            selectionScreen(
                level,
                currentRound,
                options,
                selected,
                targets.length
            )
        );

        const updateSelectionNote = () => {
            const note = area.querySelector(
                "#face-selection-note"
            );

            if (note) {
                note.textContent =
                    `Selected: ${selected.size}/${targets.length}`;
            }
        };

        area
            .querySelectorAll("[data-face]")
            .forEach((button) => {
                button.addEventListener(
                    "click",
                    () => {
                        const icon = button.dataset.face;

                        if (selected.has(icon)) {
                            selected.delete(icon);
                            button.classList.remove("selected");
                            button.setAttribute(
                                "aria-pressed",
                                "false"
                            );
                        } else {
                            if (
                                selected.size >= targets.length
                            ) {
                                return;
                            }

                            selected.add(icon);
                            button.classList.add("selected");
                            button.setAttribute(
                                "aria-pressed",
                                "true"
                            );
                        }

                        updateSelectionNote();
                    }
                );
            });

        area
            .querySelector(
                '[data-face-action="submit"]'
            )
            ?.addEventListener(
                "click",
                () =>
                    submitRound(
                        level,
                        currentRound,
                        targets,
                        options,
                        selected,
                        startTime
                    )
            );

        area
            .querySelector(
                '[data-face-action="exit"]'
            )
            ?.addEventListener(
                "click",
                exitGame
            );
    }

    function submitRound(
        level,
        currentRound,
        targets,
        options,
        selected,
        startTime
    ) {
        if (currentRound !== roundToken) {
            return;
        }

        const targetIcons = new Set(
            targets.map((face) => face.icon)
        );

        const correct = [...selected]
            .filter((icon) => targetIcons.has(icon))
            .length;

        const wrong = [...selected]
            .filter((icon) => !targetIcons.has(icon))
            .length;

        const accuracy = Math.max(
            0,
            Math.min(
                100,
                Math.round(
                    ((correct - wrong) / targets.length) * 100
                )
            )
        );

        const details = {
            targets: targets
                .map((face) => face.icon)
                .join(", "),

            selected: [...selected].join(", "),
            correct,
            wrong,
            responseTime: Date.now() - startTime
        };

        // Preserve the existing session-saving and adaptive-data connection.
        if (window.App?.result) {
            window.App.result(
                FACE_GAME,
                correct,
                targets.length,
                accuracy,
                details
            );
        } else if (
            typeof window.result === "function"
        ) {
            window.result(
                FACE_GAME,
                correct,
                targets.length,
                accuracy,
                details
            );
        }

        const area = getArea();

        if (!area) {
            return;
        }

        area.innerHTML = "";
        injectStyles(area);

        area.insertAdjacentHTML(
            "beforeend",
            resultScreen(
                level,
                currentRound,
                {
                    targets,
                    options,
                    correct,
                    wrong,
                    accuracy,
                    selected
                }
            )
        );

        area
            .querySelector(
                '[data-face-action="retry"]'
            )
            ?.addEventListener(
                "click",
                () => beginRound(level)
            );

        area
            .querySelector(
                '[data-face-action="restart"]'
            )
            ?.addEventListener(
                "click",
                restartGame
            );

        area
            .querySelector(
                '[data-face-action="next"]'
            )
            ?.addEventListener(
                "click",
                () => {
                    if (level >= MAX_LEVEL) {
                        return;
                    }

                    setLevel(level + 1);
                    beginRound(getLevel());
                }
            );

        area
            .querySelector(
                '[data-face-action="exit"]'
            )
            ?.addEventListener(
                "click",
                exitGame
            );
    }

    function restartGame() {
        clearTimers();
        roundToken += 1;
        setLevel(1);
        renderStart(1);
    }

    function exitGame() {
        clearTimers();
        roundToken += 1;

        if (window.App?.state) {
            window.App.state.view = "games";
            window.App.state.game = null;
            window.App.render();
        }
    }

    window.GameFace = {
        start() {
            const level = setLevel(getLevel());
            renderStart(level);
        }
    };
})();
