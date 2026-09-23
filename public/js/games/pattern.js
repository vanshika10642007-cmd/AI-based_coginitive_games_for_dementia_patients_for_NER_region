window.GameCards = {
    start() {
        const area = document.getElementById("gameArea");

        // Safety check
        if (!area) {
            console.error("gameArea element not found.");
            return;
        }

        // Helper function for delays
        const wait = (ms) =>
            new Promise(resolve => setTimeout(resolve, ms));

        area.innerHTML = `
            <div class="game-grid"
                 style="grid-template-columns: repeat(3, 1fr);">
            </div>

            <button id="start-pattern" class="btn-large">
                Start Pattern
            </button>

            <p id="pattern-msg"></p>
        `;

        const grid = area.querySelector(".game-grid");
        const startButton = document.getElementById("start-pattern");
        const message = document.getElementById("pattern-msg");

        // Create 3 × 3 grid
        for (let i = 0; i < 9; i++) {
            const cell = document.createElement("div");

            cell.className = "game-cell";
            cell.dataset.index = i;

            grid.appendChild(cell);
        }

        // Start game
        startButton.onclick = async () => {

            // Prevent double-click / multiple games
            startButton.disabled = true;
            startButton.style.display = "none";

            // Generate a random pattern of 5 cells
            const pattern = [];

            while (pattern.length < 5) {
                const randomIndex = Math.floor(Math.random() * 9);

                // Don't repeat the same cell consecutively
                if (
                    pattern.length === 0 ||
                    pattern[pattern.length - 1] !== randomIndex
                ) {
                    pattern.push(randomIndex);
                }
            }

            console.log("Pattern:", pattern);

            // Tell player to watch
            message.innerText = "Watch carefully...";

            await wait(1000);

            // Show the pattern
            for (const index of pattern) {

                const cell = grid.children[index];

                cell.classList.add("active");

                await wait(600);

                cell.classList.remove("active");

                await wait(200);
            }

            // Player's turn
            message.innerText = "Repeat the pattern!";

            const startTime = Date.now();
            const userPattern = [];

            // Prevent multiple result() calls
            let finished = false;

            // Enable clicking on cells
            grid.querySelectorAll(".game-cell").forEach(cell => {

                cell.onclick = () => {

                    // Ignore clicks after game ends
                    if (finished) return;

                    const index = Number(cell.dataset.index);

                    // Show clicked cell briefly
                    cell.classList.add("active");

                    setTimeout(() => {
                        cell.classList.remove("active");
                    }, 200);

                    // Store player's answer
                    userPattern.push(index);

                    const currentPosition =
                        userPattern.length - 1;

                    // Check current answer
                    if (
                        userPattern[currentPosition] !==
                        pattern[currentPosition]
                    ) {
                        finished = true;

                        // Number of correctly remembered cells
                        const score = currentPosition;

                        const accuracy = Math.round(
                            (score / pattern.length) * 100
                        );

                        const responseTime =
                            Date.now() - startTime;

                        result(
                            "cards",
                            score,
                            pattern.length,
                            accuracy,
                            {
                                pattern: [...pattern],
                                answer: [...userPattern],
                                responseTime: responseTime
                            }
                        );

                        return;
                    }

                    // All 5 cells correct
                    if (userPattern.length === pattern.length) {
                        finished = true;

                        const responseTime =
                            Date.now() - startTime;

                        result(
                            "cards",
                            5,
                            5,
                            100,
                            {
                                pattern: [...pattern],
                                answer: [...userPattern],
                                responseTime: responseTime
                            }
                        );
                    }
                };
            });
        };
    }
};
