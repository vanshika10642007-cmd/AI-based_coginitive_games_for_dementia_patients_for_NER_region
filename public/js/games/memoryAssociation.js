(() => {
    "use strict";

    const GAME_NAME = "association";
    const MAX_LEVEL = 5;

    const ALL_PAIRS = [
        ["Ocean", "Blue"],
        ["Sun", "Hot"],
        ["Apple", "Red"],
        ["Tree", "Green"],
        ["Night", "Dark"],
        ["Snow", "Cold"],
        ["Grass", "Soft"],
        ["Fire", "Warm"]
    ];

    const LEVELS = {
        1: {
            pairs: 2,
            choices: 3,
            memorizeSeconds: 9
        },
        2: {
            pairs: 3,
            choices: 4,
            memorizeSeconds: 8
        },
        3: {
            pairs: 4,
            choices: 5,
            memorizeSeconds: 7
        },
        4: {
            pairs: 5,
            choices: 7,
            memorizeSeconds: 6
        },
        5: {
            pairs: 6,
            choices: 8,
            memorizeSeconds: 5
        }
    };

    let currentLevel = 1;
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

    function getConfiguredLevel() {
        const level = Number(
            window.GameConfig?.level ||
            window.App?.state?.level ||
            1
        );

        return Math.min(
            MAX_LEVEL,
            Math.max(
                1,
                Number.isFinite(level) ? level : 1
            )
        );
    }

    function setGameLevel(level) {
        currentLevel = Math.min(
            MAX_LEVEL,
            Math.max(1, Number(level) || 1)
        );

        return currentLevel;
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
                "style[data-association-game-style]"
            )
        ) {
            return;
        }

        const style = document.createElement("style");

        style.dataset.associationGameStyle = "true";

        style.textContent = `
            .association-game-shell {
                max-width: 900px;
                margin: 0 auto;
                color: #172033;
            }

            .association-game-topline {
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 12px;
                flex-wrap: wrap;
                margin-bottom: 18px;
            }

            .association-game-eyebrow {
                color: #3157d5;
                font-size: 14px;
                font-weight: 800;
                letter-spacing: .08em;
                text-transform: uppercase;
            }

            .association-game-level {
                background: #edf0f8;
                border-radius: 999px;
                padding: 8px 13px;
                font-size: 15px;
                font-weight: 800;
            }

            .association-game-intro,
            .association-game-phase,
            .association-game-result {
                text-align: center;
                padding: 28px 18px 32px;
                border: 1px solid #e3e7ef;
                border-radius: 20px;
                background: linear-gradient(
                    135deg,
                    #ffffff,
                    #eef2ff
                );
            }

            .association-game-icon {
                font-size: 60px;
                line-height: 1;
                margin-bottom: 14px;
            }

            .association-game-shell h2 {
                margin: 0 0 12px;
                font-size: 30px;
            }

            .association-game-copy,
            .association-game-instruction {
                max-width: 660px;
                margin: 0 auto 20px;
                color: #647089;
                line-height: 1.55;
                font-size: 17px;
            }

            .association-game-steps {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 10px;
                max-width: 720px;
                margin: 22px auto;
                text-align: left;
            }

            .association-game-step {
                padding: 15px;
                border-radius: 14px;
                background: #f8f9fc;
                border: 1px solid #e3e7ef;
            }

            .association-game-step strong {
                display: block;
                margin-bottom: 5px;
            }

            .association-game-step span {
                color: #647089;
                font-size: 15px;
                line-height: 1.4;
            }

            .association-game-actions {
                display: flex;
                justify-content: center;
                gap: 10px;
                flex-wrap: wrap;
                margin-top: 22px;
            }

            .association-game-button {
                min-width: 155px;
                min-height: 52px;
                border: 0;
                border-radius: 14px;
                padding: 14px 20px;
                cursor: pointer;
                font: inherit;
                font-size: 17px;
                font-weight: 800;
                background: #3157d5;
                color: #ffffff;
            }

            .association-game-button:hover {
                background: #2343a9;
            }

            .association-game-button:disabled {
                opacity: .5;
                cursor: not-allowed;
            }

            .association-game-button:focus-visible,
            .association-game-option:focus-visible {
                outline: 4px solid #9fb1ff;
                outline-offset: 3px;
            }

            .association-game-button.secondary {
                background: #ffffff;
                color: #172033;
                border: 1px solid #cfd5e1;
            }

            .association-game-button.secondary:hover {
                background: #f3f5fa;
            }

            .association-game-progress {
                max-width: 620px;
                height: 10px;
                margin: 0 auto 10px;
                border-radius: 999px;
                overflow: hidden;
                background: #e7eaf0;
            }

            .association-game-progress span {
                display: block;
                width: 100%;
                height: 100%;
                border-radius: inherit;
                background: #3157d5;
                transition: width .1s linear;
            }

            .association-game-countdown {
                color: #647089;
                font-weight: 800;
                margin-bottom: 20px;
            }

            .association-game-pairs {
                display: grid;
                grid-template-columns: repeat(
                    auto-fit,
                    minmax(210px, 1fr)
                );
                gap: 12px;
                max-width: 760px;
                margin: 0 auto;
            }

            .association-game-pair {
                min-height: 72px;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 12px;
                padding: 14px;
                border: 1px solid #dce2ee;
                border-radius: 16px;
                background: #ffffff;
                font-size: 20px;
                box-shadow: 0 3px 12px #1720330d;
            }

            .association-game-pair strong {
                color: #3157d5;
            }

            .association-game-question {
                max-width: 680px;
                margin: 0 auto 22px;
                padding: 20px;
                border-radius: 18px;
                background: #ffffff;
                border: 1px solid #dce2ee;
                box-shadow: 0 3px 12px #1720330d;
                font-size: 22px;
            }

            .association-game-options {
                display: grid;
                grid-template-columns: repeat(
                    auto-fit,
                    minmax(170px, 1fr)
                );
                gap: 14px;
                max-width: 760px;
                margin: 0 auto;
            }

            .association-game-option {
                min-height: 74px;
                border: 2px solid #dce2ee;
                border-radius: 16px;
                background: #ffffff;
                color: #172033;
                cursor: pointer;
                padding: 15px;
                font: inherit;
                font-size: 20px;
                font-weight: 800;
                transition:
                    transform .16s ease,
                    border-color .16s ease,
                    background .16s ease,
                    box-shadow .16s ease;
            }

            .association-game-option:hover {
                transform: translateY(-2px);
                box-shadow: 0 5px 16px #17203316;
            }

            .association-game-option.selected {
                border-color: #3157d5;
                background: #eef1ff;
                box-shadow: 0 0 0 3px #3157d533;
            }

            .association-game-feedback {
                min-height: 28px;
                margin: 18px auto 0;
                color: #647089;
                font-weight: 700;
            }

            .association-game-result-mark {
                font-size: 58px;
                line-height: 1;
                margin-bottom: 10px;
            }

            .association-game-stats {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 12px;
                max-width: 620px;
                margin: 22px auto;
            }

            .association-game-stat {
                padding: 16px 10px;
                border-radius: 15px;
                background: #ffffff;
                border: 1px solid #e3e7ef;
            }

            .association-game-stat small {
                display: block;
                color: #647089;
                margin-bottom: 5px;
            }

            .association-game-stat strong {
                font-size: 28px;
            }

            @media (max-width: 650px) {
                .association-game-steps {
                    grid-template-columns: 1fr;
                    text-align: center;
                }

                .association-game-shell h2 {
                    font-size: 26px;
                }

                .association-game-stats {
                    grid-template-columns: 1fr;
                    max-width: 260px;
                }

                .association-game-option,
                .association-game-question {
                    font-size: 18px;
                }
            }
        `;

        area.appendChild(style);
    }

    function shell(level, content) {
        return `
            <div class="association-game-shell">
                <div class="association-game-topline">
                    <div class="association-game-eyebrow">
                        🧠 MemorySaathi · Memory Association
                    </div>

                    <div
                        class="association-game-level"
                        aria-label="Level ${level} of ${MAX_LEVEL}"
                    >
                        Level ${level} of ${MAX_LEVEL}
                    </div>
                </div>

                ${content}
            </div>
        `;
    }

    function startScreen(level) {
        const config = LEVELS[level];

        return shell(level, `
            <section
                class="association-game-intro"
                aria-labelledby="association-title"
            >
                <div
                    class="association-game-icon"
                    aria-hidden="true"
                >
                    🔗 🧠
                </div>

                <h2 id="association-title">
                    Memory Association
                </h2>

                <p class="association-game-copy">
                    Memorize the word pairs, then choose the word
                    associated with the question. Take your time
                    and focus on the connection.
                </p>

                <div
                    class="association-game-steps"
                    aria-label="How to play"
                >
                    <div class="association-game-step">
                        <strong>1. Remember</strong>
                        <span>
                            Study ${config.pairs} word associations.
                        </span>
                    </div>

                    <div class="association-game-step">
                        <strong>2. Recall</strong>
                        <span>
                            Find the matching word for the question.
                        </span>
                    </div>

                    <div class="association-game-step">
                        <strong>3. Answer</strong>
                        <span>
                            Select one answer and check your result.
                        </span>
                    </div>
                </div>

                <p class="association-game-copy">
                    <strong>
                        Level ${level} of ${MAX_LEVEL}
                    </strong>
                    · ${config.pairs} associations
                    · ${config.choices} answer choices
                </p>

                <div class="association-game-actions">
                    <button
                        type="button"
                        class="association-game-button secondary"
                        data-association-action="exit"
                    >
                        Exit Game
                    </button>

                    <button
                        type="button"
                        class="association-game-button"
                        data-association-action="begin"
                    >
                        Start Game
                    </button>
                </div>
            </section>
        `);
    }

    function memorizationScreen(level, pairs, seconds) {
        const pairMarkup = pairs
            .map((pair) => `
                <div class="association-game-pair">
                    <strong>${pair[0]}</strong>
                    <span aria-hidden="true">→</span>
                    <span>${pair[1]}</span>
                </div>
            `)
            .join("");

        return shell(level, `
            <section
                class="association-game-phase"
                aria-live="polite"
                aria-labelledby="association-memory-title"
            >
                <h2 id="association-memory-title">
                    Remember the associations
                </h2>

                <p class="association-game-instruction">
                    Study each pair carefully.
                    The pairs will disappear when the timer ends.
                </p>

                <div
                    class="association-game-progress"
                    aria-hidden="true"
                >
                    <span
                        id="association-progress-bar"
                        style="width:100%"
                    ></span>
                </div>

                <div
                    id="association-countdown"
                    class="association-game-countdown"
                >
                    ${seconds} seconds remaining
                </div>

                <div class="association-game-pairs">
                    ${pairMarkup}
                </div>

                <div class="association-game-actions">
                    <button
                        type="button"
                        class="association-game-button secondary"
                        data-association-action="exit"
                    >
                        Exit Game
                    </button>
                </div>
            </section>
        `);
    }

    function questionScreen(level, target, options) {
        const optionMarkup = options
            .map((option) => `
                <button
                    type="button"
                    class="association-game-option"
                    data-association-option="${option}"
                    aria-pressed="false"
                >
                    ${option}
                </button>
            `)
            .join("");

        return shell(level, `
            <section
                class="association-game-phase"
                aria-live="polite"
                aria-labelledby="association-question-title"
            >
                <h2 id="association-question-title">
                    Which word is associated?
                </h2>

                <p class="association-game-instruction">
                    Select the matching answer,
                    then check your answer.
                </p>

                <div class="association-game-question">
                    What was associated with
                    <strong>“${target[0]}”</strong>?
                </div>

                <div
                    id="association-options"
                    class="association-game-options"
                >
                    ${optionMarkup}
                </div>

                <p
                    id="association-feedback"
                    class="association-game-feedback"
                >
                    Choose one answer.
                </p>

                <div class="association-game-actions">
                    <button
                        type="button"
                        class="association-game-button secondary"
                        data-association-action="exit"
                    >
                        Exit Game
                    </button>

                    <button
                        type="button"
                        class="association-game-button"
                        data-association-action="submit"
                        disabled
                    >
                        Check Answer
                    </button>
                </div>
            </section>
        `);
    }

    function resultScreen(
        level,
        target,
        selected,
        correct,
        accuracy
    ) {
        const completed = level === MAX_LEVEL;

        const message = correct
            ? "Excellent memory! You found the correct association."
            : `The correct association was
               ${target[0]} → ${target[1]}.`;

        const nextAction = completed
            ? `
                <button
                    type="button"
                    class="association-game-button"
                    data-association-action="restart"
                >
                    Restart Game
                </button>
            `
            : `
                <button
                    type="button"
                    class="association-game-button"
                    data-association-action="next"
                >
                    Next Level
                </button>
            `;

        return shell(level, `
            <section
                class="association-game-result"
                aria-live="polite"
                aria-labelledby="association-result-title"
            >
                <div
                    class="association-game-result-mark"
                    aria-hidden="true"
                >
                    ${correct ? "🌟" : "👏"}
                </div>

                <h2 id="association-result-title">
                    ${
                        completed
                            ? "Memory Association Complete!"
                            : (
                                correct
                                    ? "Great job!"
                                    : "Round complete"
                            )
                    }
                </h2>

                <p class="association-game-copy">
                    ${message}
                </p>

                <div class="association-game-stats">
                    <div class="association-game-stat">
                        <small>Score</small>
                        <strong>
                            ${correct ? "1/1" : "0/1"}
                        </strong>
                    </div>

                    <div class="association-game-stat">
                        <small>Accuracy</small>
                        <strong>${accuracy}%</strong>
                    </div>

                    <div class="association-game-stat">
                        <small>Level</small>
                        <strong>${level}</strong>
                    </div>
                </div>

                <p class="association-game-instruction">
                    Your answer:
                    <strong>${selected || "No answer"}</strong>
                </p>

                <div class="association-game-actions">
                    <button
                        type="button"
                        class="association-game-button secondary"
                        data-association-action="exit"
                    >
                        Exit Game
                    </button>

                    <button
                        type="button"
                        class="association-game-button secondary"
                        data-association-action="retry"
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
                '[data-association-action="begin"]'
            )
            ?.addEventListener(
                "click",
                () => beginRound(level)
            );

        area
            .querySelector(
                '[data-association-action="exit"]'
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
        setGameLevel(level);

        const currentRound = ++roundToken;
        const config = LEVELS[currentLevel];

        const pairs = shuffle(ALL_PAIRS).slice(
            0,
            config.pairs
        );

        const target = pairs[
            Math.floor(Math.random() * pairs.length)
        ];

        const distractors = shuffle(
            ALL_PAIRS
                .map((pair) => pair[1])
                .filter(
                    (answer) => answer !== target[1]
                )
        ).slice(
            0,
            config.choices - 1
        );

        const options = shuffle([
            target[1],
            ...distractors
        ]);

        area.innerHTML = "";
        injectStyles(area);

        area.insertAdjacentHTML(
            "beforeend",
            memorizationScreen(
                currentLevel,
                pairs,
                config.memorizeSeconds
            )
        );

        const countdown = area.querySelector(
            "#association-countdown"
        );

        const progressBar = area.querySelector(
            "#association-progress-bar"
        );

        const totalTimeMs =
            config.memorizeSeconds * 1000;

        const startedAt = Date.now();

        const updateTimer = () => {
            if (
                currentRound !== roundToken ||
                !countdown ||
                !progressBar
            ) {
                return;
            }

            const elapsedMs =
                Date.now() - startedAt;

            const remainingMs = Math.max(
                0,
                totalTimeMs - elapsedMs
            );

            const remainingSeconds = Math.ceil(
                remainingMs / 1000
            );

            const percentage =
                (remainingMs / totalTimeMs) * 100;

            countdown.textContent =
                `${remainingSeconds} second${remainingSeconds === 1 ? "" : "s"} remaining`;

            progressBar.style.width =
                `${percentage}%`;

            if (remainingMs <= 0) {
                clearTimers();

                showQuestion(
                    currentLevel,
                    currentRound,
                    target,
                    options
                );
            }
        };

        updateTimer();

        rememberTimer(
            setInterval(updateTimer, 100)
        );

        area
            .querySelector(
                '[data-association-action="exit"]'
            )
            ?.addEventListener(
                "click",
                exitGame
            );
    }

    function showQuestion(
        level,
        currentRound,
        target,
        options
    ) {
        const area = getArea();

        if (
            !area ||
            currentRound !== roundToken
        ) {
            return;
        }

        let selected = "";

        area.innerHTML = "";
        injectStyles(area);

        area.insertAdjacentHTML(
            "beforeend",
            questionScreen(
                level,
                target,
                options
            )
        );

        const submitButton = area.querySelector(
            '[data-association-action="submit"]'
        );

        const feedback = area.querySelector(
            "#association-feedback"
        );

        area
            .querySelectorAll(
                "[data-association-option]"
            )
            .forEach((button) => {
                button.addEventListener(
                    "click",
                    () => {
                        selected =
                            button.dataset.associationOption || "";

                        area
                            .querySelectorAll(
                                "[data-association-option]"
                            )
                            .forEach((option) => {
                                const isSelected =
                                    option === button;

                                option.classList.toggle(
                                    "selected",
                                    isSelected
                                );

                                option.setAttribute(
                                    "aria-pressed",
                                    String(isSelected)
                                );
                            });

                        if (submitButton) {
                            submitButton.disabled = false;
                        }

                        if (feedback) {
                            feedback.textContent =
                                "Answer selected. Press Check Answer.";
                        }
                    }
                );
            });

        submitButton?.addEventListener(
            "click",
            () => {
                if (!selected) {
                    return;
                }

                submitRound(
                    level,
                    currentRound,
                    target,
                    selected
                );
            }
        );

        area
            .querySelector(
                '[data-association-action="exit"]'
            )
            ?.addEventListener(
                "click",
                exitGame
            );
    }

    function saveResult(
        level,
        score,
        accuracy,
        details
    ) {
        const appState = window.App?.state;
        const previousLevel = appState?.level;

        if (appState) {
            appState.level = level;
        }

        try {
            if (window.App?.result) {
                window.App.result(
                    GAME_NAME,
                    score,
                    1,
                    accuracy,
                    details
                );
            } else if (
                typeof window.result === "function"
            ) {
                window.result(
                    GAME_NAME,
                    score,
                    1,
                    accuracy,
                    details
                );
            }
        } finally {
            if (
                appState &&
                previousLevel !== undefined
            ) {
                appState.level = previousLevel;
            }
        }
    }

    function submitRound(
        level,
        currentRound,
        target,
        selected
    ) {
        if (currentRound !== roundToken) {
            return;
        }

        const correct =
            selected === target[1];

        const score = correct ? 1 : 0;
        const accuracy = correct ? 100 : 0;

        saveResult(
            level,
            score,
            accuracy,
            {
                target: target[0],
                expected: target[1],
                answer: selected
            }
        );

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
                target,
                selected,
                correct,
                accuracy
            )
        );

        area
            .querySelector(
                '[data-association-action="retry"]'
            )
            ?.addEventListener(
                "click",
                () => beginRound(level)
            );

        area
            .querySelector(
                '[data-association-action="next"]'
            )
            ?.addEventListener(
                "click",
                () => {
                    if (level >= MAX_LEVEL) {
                        return;
                    }

                    beginRound(level + 1);
                }
            );

        area
            .querySelector(
                '[data-association-action="restart"]'
            )
            ?.addEventListener(
                "click",
                restartGame
            );

        area
            .querySelector(
                '[data-association-action="exit"]'
            )
            ?.addEventListener(
                "click",
                exitGame
            );
    }

    function restartGame() {
        clearTimers();
        roundToken += 1;
        setGameLevel(1);
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

    window.GameAssociation = {
        start() {
            setGameLevel(getConfiguredLevel());
            renderStart(currentLevel);
        }
    };
})();
