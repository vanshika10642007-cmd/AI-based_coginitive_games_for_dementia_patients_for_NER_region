<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Pattern Memory Game</title>

    <style>
        body {
            font-family: Arial, sans-serif;
            text-align: center;
            background: #f2f6ff;
            margin: 0;
            padding: 30px;
        }

        h1 {
            color: #333;
        }

        #gameArea {
            max-width: 450px;
            margin: 30px auto;
            padding: 25px;
            background: white;
            border-radius: 15px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.15);
        }

        .game-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
            width: 300px;
            margin: 20px auto;
        }

        .game-cell {
            width: 90px;
            height: 90px;
            background: #d9e2f3;
            border: 2px solid #789;
            border-radius: 10px;
            cursor: pointer;
            transition: 0.2s;
        }

        /* Jab pattern show ho ya player click kare */
        .game-cell.active {
            background: #4285f4;
            transform: scale(1.05);
        }

        .btn-large {
            padding: 12px 25px;
            font-size: 18px;
            border: none;
            border-radius: 8px;
            background: #4285f4;
            color: white;
            cursor: pointer;
        }

        .btn-large:hover {
            background: #2868c7;
        }

        .btn-large:disabled {
            background: #aaa;
            cursor: not-allowed;
        }

        #pattern-msg {
            font-size: 18px;
            font-weight: bold;
            min-height: 25px;
        }
    </style>
</head>

<body>

    <h1>🧠 Pattern Memory Game</h1>

    <!-- Game yahan load hoga -->
    <div id="gameArea"></div>


    <script>

        // Result function
        function result(gameName, score, total, accuracy, data) {

            console.log("Game:", gameName);
            console.log("Score:", score);
            console.log("Total:", total);
            console.log("Accuracy:", accuracy + "%");
            console.log("Details:", data);

            const message = document.getElementById("pattern-msg");

            if (score === total) {
                message.innerText =
                    "🎉 Excellent! You remembered the complete pattern!";
            } else {
                message.innerText =
                    "❌ Game Over! You remembered " +
                    score + " out of " + total + " correctly.";
            }

            // Restart button
            const restartButton = document.createElement("button");

            restartButton.innerText = "Play Again";
            restartButton.className = "btn-large";
            restartButton.style.marginTop = "15px";

            restartButton.onclick = () => {
                window.GameCards.start();
            };

            document.getElementById("gameArea")
                .appendChild(restartButton);
        }


        // Game
        window.GameCards = {

            start() {

                const area = document.getElementById("gameArea");

                // Safety check
                if (!area) {
                    console.error("gameArea element not found.");
                    return;
                }


                // Helper function for delay
                const wait = (ms) =>
                    new Promise(resolve => setTimeout(resolve, ms));


                // Create game HTML
                area.innerHTML = `

                    <div class="game-grid">

                    </div>

                    <button id="start-pattern"
                            class="btn-large">

                        Start Pattern

                    </button>

                    <p id="pattern-msg">
                        Click Start Pattern to begin
                    </p>
                `;


                const grid =
                    area.querySelector(".game-grid");

                const startButton =
                    document.getElementById("start-pattern");

                const message =
                    document.getElementById("pattern-msg");


                // Create 3 × 3 grid
                for (let i = 0; i < 9; i++) {

                    const cell =
                        document.createElement("div");

                    cell.className = "game-cell";

                    cell.dataset.index = i;

                    grid.appendChild(cell);
                }


                // Start Game
                startButton.onclick = async () => {

                    // Prevent double click
                    startButton.disabled = true;

                    startButton.style.display = "none";


                    // Generate random pattern
                    const pattern = [];


                    while (pattern.length < 5) {

                        const randomIndex =
                            Math.floor(Math.random() * 9);


                        // Same cell consecutively repeat nahi hogi
                        if (
                            pattern.length === 0 ||
                            pattern[pattern.length - 1]
                                !== randomIndex
                        ) {

                            pattern.push(randomIndex);
                        }
                    }


                    console.log(
                        "Generated Pattern:",
                        pattern
                    );


                    // Message
                    message.innerText =
                        "👀 Watch carefully...";


                    await wait(1000);


                    // Show pattern
                    for (const index of pattern) {

                        const cell =
                            grid.children[index];


                        cell.classList.add("active");


                        await wait(600);


                        cell.classList.remove("active");


                        await wait(200);
                    }


                    // Player turn
                    message.innerText =
                        "👉 Repeat the pattern!";


                    const startTime =
                        Date.now();


                    const userPattern = [];


                    let finished = false;


                    // Enable cells
                    grid.querySelectorAll(
                        ".game-cell"
                    ).forEach(cell => {

                        cell.onclick = () => {

                            // Game finished
                            if (finished) {
                                return;
                            }


                            const index =
                                Number(cell.dataset.index);


                            // Show clicked cell
                            cell.classList.add("active");


                            setTimeout(() => {

                                cell.classList.remove(
                                    "active"
                                );

                            }, 200);


                            // Store answer
                            userPattern.push(index);


                            const currentPosition =
                                userPattern.length - 1;


                            // Check answer
                            if (
                                userPattern[currentPosition]
                                !==
                                pattern[currentPosition]
                            ) {

                                finished = true;


                                // Correct answers
                                const score =
                                    currentPosition;


                                const accuracy =
                                    Math.round(
                                        (score /
                                        pattern.length) *
                                        100
                                    );


                                const responseTime =
                                    Date.now() -
                                    startTime;


                                result(
                                    "cards",
                                    score,
                                    pattern.length,
                                    accuracy,
                                    {
                                        pattern:
                                            [...pattern],

                                        answer:
                                            [...userPattern],

                                        responseTime:
                                            responseTime
                                    }
                                );

                                return;
                            }


                            // All 5 correct
                            if (
                                userPattern.length ===
                                pattern.length
                            ) {

                                finished = true;


                                const responseTime =
                                    Date.now() -
                                    startTime;


                                result(
                                    "cards",
                                    5,
                                    5,
                                    100,
                                    {
                                        pattern:
                                            [...pattern],

                                        answer:
                                            [...userPattern],

                                        responseTime:
                                            responseTime
                                    }
                                );
                            }

                        };

                    });

                };

            }

        };


        // Start the game automatically
        window.GameCards.start();

    </script>

</body>
</html>
                    
