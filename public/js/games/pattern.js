       
import javax.swing.*;
import java.awt.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

public class GameCards extends JFrame {

    private JPanel gameGrid;
    private JButton startButton;
    private JLabel message;

    private List<Integer> pattern;
    private List<Integer> userPattern;

    private JButton[] cells;

    private boolean finished = false;
    private long startTime;

    private Random random = new Random();

    public GameCards() {

        setTitle("Pattern Memory Game");
        setSize(400, 500);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setLocationRelativeTo(null);

        start();
    }

    public void start() {

        // Main panel
        JPanel mainPanel = new JPanel();
        mainPanel.setLayout(new BorderLayout(10, 10));
        mainPanel.setBorder(
                BorderFactory.createEmptyBorder(20, 20, 20, 20)
        );

        // Message
        message = new JLabel(
                "Click Start Pattern",
                SwingConstants.CENTER
        );

        message.setFont(
                new Font("Arial", Font.BOLD, 18)
        );

        mainPanel.add(
                message,
                BorderLayout.NORTH
        );


        // 3 × 3 Grid
        gameGrid = new JPanel(
                new GridLayout(3, 3, 10, 10)
        );

        cells = new JButton[9];


        // Create 9 cells
        for (int i = 0; i < 9; i++) {

            JButton cell = new JButton();

            cell.setPreferredSize(
                    new Dimension(80, 80)
            );

            cell.setBackground(Color.LIGHT_GRAY);

            cell.setFocusPainted(false);

            final int index = i;

            cell.addActionListener(e -> {

                if (!finished &&
                        pattern != null &&
                        userPattern != null) {

                    playerClick(index);
                }

            });

            cells[i] = cell;

            gameGrid.add(cell);
        }


        mainPanel.add(
                gameGrid,
                BorderLayout.CENTER
        );


        // Start button
        startButton = new JButton(
                "Start Pattern"
        );

        startButton.setFont(
                new Font("Arial", Font.BOLD, 16)
        );


        startButton.addActionListener(e -> {

            startGame();

        });


        mainPanel.add(
                startButton,
                BorderLayout.SOUTH
        );


        add(mainPanel);

        setVisible(true);
    }


    // =========================================
    // START GAME
    // =========================================

    private void startGame() {

        startButton.setEnabled(false);

        startButton.setVisible(false);

        finished = false;

        userPattern = new ArrayList<>();


        // Generate pattern of 5 cells
        pattern = new ArrayList<>();

        while (pattern.size() < 5) {

            int randomIndex =
                    random.nextInt(9);


            // Same cell consecutively repeat nahi hogi
            if (
                    pattern.isEmpty() ||
                    pattern.get(pattern.size() - 1)
                            != randomIndex
            ) {

                pattern.add(randomIndex);
            }
        }


        System.out.println(
                "Pattern: " + pattern
        );


        message.setText(
                "Watch carefully..."
        );


        // Pattern show karne ke liye thread
        new Thread(() -> {

            try {

                Thread.sleep(1000);


                // Show each cell
                for (int index : pattern) {

                    SwingUtilities.invokeLater(() -> {

                        cells[index].setBackground(
                                Color.BLUE
                        );

                    });


                    Thread.sleep(600);


                    SwingUtilities.invokeLater(() -> {

                        cells[index].setBackground(
                                Color.LIGHT_GRAY
                        );

                    });


                    Thread.sleep(200);
                }


                // Player turn
                SwingUtilities.invokeLater(() -> {

                    message.setText(
                            "Repeat the pattern!"
                    );

                    startTime =
                            System.currentTimeMillis();

                });


            } catch (InterruptedException e) {

                e.printStackTrace();

            }

        }).start();
    }


    // =========================================
    // PLAYER CLICK
    // =========================================

    private void playerClick(int index) {

        if (finished) {
            return;
        }


        // Clicked cell temporarily blue
        cells[index].setBackground(
                Color.BLUE
        );


        Timer timer = new Timer(
                200,
                e -> {

                    cells[index].setBackground(
                            Color.LIGHT_GRAY
                    );

                }
        );

        timer.setRepeats(false);

        timer.start();


        // Store player's answer
        userPattern.add(index);


        int currentPosition =
                userPattern.size() - 1;


        // =========================================
        // CHECK ANSWER
        // =========================================

        if (
                userPattern.get(currentPosition)
                        != pattern.get(currentPosition)
        ) {

            finished = true;


            // Correct answers
            int score =
                    currentPosition;


            int accuracy =
                    (int) Math.round(
                            ((double) score /
                                    pattern.size()) * 100
                    );


            long responseTime =
                    System.currentTimeMillis()
                            - startTime;


            result(
                    "cards",
                    score,
                    pattern.size(),
                    accuracy,
                    responseTime
            );


            return;
        }


        // =========================================
        // ALL 5 CORRECT
        // =========================================

        if (
                userPattern.size()
                        == pattern.size()
        ) {

            finished = true;


            long responseTime =
                    System.currentTimeMillis()
                            - startTime;


            result(
                    "cards",
                    5,
                    5,
                    100,
                    responseTime
            );
        }
    }


    // =========================================
    // RESULT
    // =========================================

    private void result(
            String gameName,
            int score,
            int total,
            int accuracy,
            long responseTime
    ) {

        System.out.println(
                "Game: " + gameName
        );

        System.out.println(
                "Score: " + score + "/" + total
        );

        System.out.println(
                "Accuracy: " + accuracy + "%"
        );

        System.out.println(
                "Pattern: " + pattern
        );

        System.out.println(
                "Answer: " + userPattern
        );

        System.out.println(
                "Response Time: "
                        + responseTime
                        + " ms"
        );


        if (score == total) {

            message.setText(
                    "🎉 Excellent! Pattern correct!"
            );

        } else {

            message.setText(
                    "❌ Game Over! Score: "
                            + score
                            + "/"
                            + total
            );
        }


        // Play Again button
        JButton playAgain =
                new JButton("Play Again");


        playAgain.setFont(
                new Font(
                        "Arial",
                        Font.BOLD,
                        16
                )
        );


        playAgain.addActionListener(e -> {

            resetGame();

        });


        add(
                playAgain,
                BorderLayout.SOUTH
        );


        revalidate();

        repaint();
    }


    // =========================================
    // RESET GAME
    // =========================================

    private void resetGame() {

        // Remove old Play Again button
        Component[] components =
                getContentPane().getComponents();


        for (Component component : components) {

            if (component instanceof JButton &&
                    ((JButton) component)
                            .getText()
                            .equals("Play Again")) {

                getContentPane().remove(component);
            }
        }


        // Reset cells
        for (JButton cell : cells) {

            cell.setBackground(
                    Color.LIGHT_GRAY
            );
        }


        startButton.setVisible(true);

        startButton.setEnabled(true);

        message.setText(
                "Click Start Pattern"
        );


        pattern = null;

        userPattern = null;

        finished = false;


        revalidate();

        repaint();
    }


    // =========================================
    // MAIN METHOD
    // =========================================

    public static void main(String[] args) {

        SwingUtilities.invokeLater(() -> {

            new GameCards();

        });
    }
}
