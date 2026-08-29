/**
 * ============================================================
 * app.js
 * ============================================================
 *
 * Main controller for the Maze Generator.
 *
 * Connects:
 *
 * - MazeGrid
 * - MazeGenerator
 * - MazeSolver
 * - MazeRenderer
 * - HTML controls
 *
 * Handles:
 *
 * - Maze generation
 * - Animated generation
 * - BFS solving
 * - Animated solving
 * - Maze resizing
 * - Animation speed
 * - Clearing/resetting
 * - Status messages
 * - Statistics
 * - Browser resizing
 *
 * ============================================================
 */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        /*
         * ====================================================
         * DOM ELEMENTS
         * ====================================================
         */

        const canvas =
            document.getElementById(
                "mazeCanvas"
            );

        const widthInput =
            document.getElementById(
                "mazeWidth"
            );

        const heightInput =
            document.getElementById(
                "mazeHeight"
            );

        const algorithmSelect =
            document.getElementById(
                "algorithm"
            );

        const speedInput =
            document.getElementById(
                "speed"
            );

        const generateButton =
            document.getElementById(
                "generateButton"
            );

        const solveButton =
            document.getElementById(
                "solveButton"
            );

        const clearButton =
            document.getElementById(
                "clearButton"
            );

        const statusText =
            document.getElementById(
                "statusText"
            );

        const statusDot =
            document.querySelector(
                ".status-dot"
            );

        const sizeDisplay =
            document.getElementById(
                "sizeDisplay"
            );

        const cellDisplay =
            document.getElementById(
                "cellDisplay"
            );


        /*
         * ====================================================
         * VALIDATION
         * ====================================================
         */

        if (!canvas) {

            throw new Error(
                "Could not find mazeCanvas."
            );

        }


        /*
         * ====================================================
         * APPLICATION STATE
         * ====================================================
         */

        let grid = null;

        let generator = null;

        let solver = null;

        let renderer = null;


        /*
         * Used to cancel an existing animation whenever
         * another operation begins.
         */

        let animationId = null;

        let animationRunning = false;

        let currentOperation = null;


        /*
         * Time accumulator used by requestAnimationFrame.
         */

        let lastFrameTime = 0;

        let accumulatedTime = 0;


        /*
         * ====================================================
         * DIMENSIONS
         * ====================================================
         */

        function getWidth() {

            let value =
                parseInt(
                    widthInput.value,
                    10
                );


            if (
                Number.isNaN(value) ||
                value < 5
            ) {

                value = 5;

            }


            if (value > 100) {

                value = 100;

            }


            widthInput.value = value;

            return value;

        }


        function getHeight() {

            let value =
                parseInt(
                    heightInput.value,
                    10
                );


            if (
                Number.isNaN(value) ||
                value < 5
            ) {

                value = 5;

            }


            if (value > 100) {

                value = 100;

            }


            heightInput.value = value;

            return value;

        }


        /*
         * ====================================================
         * SPEED
         * ====================================================
         *
         * Slider:
         *
         * 1   = slow
         * 100 = fast
         *
         * Return milliseconds between algorithm steps.
         */

        function getStepDelay() {

            const speed =
                parseInt(
                    speedInput.value,
                    10
                );


            /*
             * Approximately:
             *
             * speed 1   -> 150 ms
             * speed 50  -> 76 ms
             * speed 100 -> 1 ms
             */

            return Math.max(
                1,
                151 - (speed * 1.5)
            );

        }


        /**
         * Number of algorithm steps to perform per update.
         *
         * At very high speeds this allows generation to
         * remain fast even though the display refresh rate
         * may only be 60 Hz.
         */
        function getStepsPerFrame() {

            const speed =
                parseInt(
                    speedInput.value,
                    10
                );


            if (speed >= 95) {

                return 20;

            }

            if (speed >= 85) {

                return 10;

            }

            if (speed >= 75) {

                return 5;

            }

            return 1;

        }


        /*
         * ====================================================
         * STATUS
         * ====================================================
         */

        function setStatus(
            message,
            state = "ready"
        ) {

            statusText.textContent =
                message;


            /*
             * Status-dot colours are kept here because there
             * are only a few simple states.
             */

            switch (state) {

                case "working":

                    statusDot.style.background =
                        "#38d39f";

                    statusDot.style.boxShadow =
                        "0 0 10px rgba(56, 211, 159, 0.7)";

                    break;


                case "complete":

                    statusDot.style.background =
                        "#38d39f";

                    statusDot.style.boxShadow =
                        "0 0 8px rgba(56, 211, 159, 0.45)";

                    break;


                case "error":

                    statusDot.style.background =
                        "#d86b6b";

                    statusDot.style.boxShadow =
                        "0 0 8px rgba(216, 107, 107, 0.45)";

                    break;


                default:

                    statusDot.style.background =
                        "#657181";

                    statusDot.style.boxShadow =
                        "none";

                    break;

            }

        }


        /*
         * ====================================================
         * STATISTICS
         * ====================================================
         */

        function updateStatistics() {

            const width =
                grid.getCols();

            const height =
                grid.getRows();


            sizeDisplay.textContent =
                `${width} × ${height}`;


            cellDisplay.textContent =
                grid
                    .getCellCount()
                    .toLocaleString();

        }


        /*
         * ====================================================
         * CREATE MAZE OBJECTS
         * ====================================================
         */

        function createMaze() {

            cancelAnimation();


            const width =
                getWidth();

            const height =
                getHeight();


            /*
             * MazeGrid constructor uses:
             *
             * rows, columns
             *
             * HTML uses:
             *
             * width, height
             */

            grid =
                new MazeGrid(
                    height,
                    width
                );


            generator =
                new MazeGenerator(
                    grid
                );


            solver =
                new MazeSolver(
                    grid
                );


            /*
             * Create renderer once.
             *
             * Afterwards simply replace its grid.
             */

            if (!renderer) {

                renderer =
                    new MazeRenderer(
                        canvas,
                        grid
                    );

            }
            else {

                renderer.setGrid(
                    grid
                );

            }


            renderer.setGenerator(
                generator
            );


            grid.openEntranceAndExit();


            updateStatistics();

            renderer.render();


            setStatus(
                "Ready",
                "ready"
            );

        }


        /*
         * ====================================================
         * CANCEL ANIMATION
         * ====================================================
         */

        function cancelAnimation() {

            if (animationId !== null) {

                cancelAnimationFrame(
                    animationId
                );

            }


            animationId = null;

            animationRunning = false;

            currentOperation = null;

            lastFrameTime = 0;
            accumulatedTime = 0;


            updateButtonStates();

        }


        /*
         * ====================================================
         * BUTTON STATES
         * ====================================================
         */

        function updateButtonStates() {

            if (!generateButton) {

                return;

            }


            /*
             * Generate remains disabled while another
             * animation is actively modifying the grid.
             */

            generateButton.disabled =
                animationRunning;


            /*
             * Solve only becomes available after generation.
             */

            solveButton.disabled =
                (
                    animationRunning ||
                    !generator ||
                    !generator.isComplete()
                );


            clearButton.disabled =
                false;

        }


        /*
         * ====================================================
         * PREPARE GENERATION
         * ====================================================
         */

        function prepareGeneration() {

            cancelAnimation();


            /*
             * Recreate the grid.
             *
             * This is important because every generation
             * requires all walls to be restored.
             */

            const width =
                getWidth();

            const height =
                getHeight();


            grid =
                new MazeGrid(
                    height,
                    width
                );


            generator =
                new MazeGenerator(
                    grid
                );


            solver =
                new MazeSolver(
                    grid
                );


            renderer.setGrid(
                grid
            );

            renderer.setGenerator(
                generator
            );


            /*
             * Entrance and exit openings can exist before
             * generation begins.
             */

            grid.openEntranceAndExit();


            generator.start();


            updateStatistics();

            renderer.render();

        }


        /*
         * ====================================================
         * GENERATE MAZE
         * ====================================================
         */

        function generateMaze() {

            const algorithm =
                algorithmSelect.value;


            /*
             * Currently only recursive backtracking exists,
             * but keeping this switch makes adding Prim,
             * Kruskal etc. straightforward later.
             */

            switch (algorithm) {

                case "backtracking":

                    break;


                default:

                    console.warn(
                        "Unknown generation algorithm:",
                        algorithm
                    );

                    return;

            }


            prepareGeneration();


            animationRunning = true;
            currentOperation = "generation";

            updateButtonStates();


            setStatus(
                "Generating maze...",
                "working"
            );


            lastFrameTime =
                performance.now();

            accumulatedTime = 0;


            animationId =
                requestAnimationFrame(
                    generationFrame
                );

        }


        /*
         * ====================================================
         * GENERATION ANIMATION
         * ====================================================
         */

        function generationFrame(
            timestamp
        ) {

            if (
                !animationRunning ||
                currentOperation !==
                    "generation"
            ) {

                return;

            }


            const delta =
                timestamp -
                lastFrameTime;


            lastFrameTime =
                timestamp;

            accumulatedTime += delta;


            const delay =
                getStepDelay();


            if (
                accumulatedTime >=
                delay
            ) {

                const steps =
                    getStepsPerFrame();


                for (
                    let i = 0;
                    i < steps;
                    i++
                ) {

                    if (
                        generator.isComplete()
                    ) {

                        break;

                    }


                    generator.step();

                }


                accumulatedTime = 0;


                renderer.render();


                setStatus(
                    `Generating — ` +
                    `${generator.getVisitedCount()}` +
                    ` / ` +
                    `${grid.getCellCount()} cells`,
                    "working"
                );

            }


            /*
             * Generation complete.
             */

            if (
                generator.isComplete()
            ) {

                finishGeneration();

                return;

            }


            animationId =
                requestAnimationFrame(
                    generationFrame
                );

        }


        /*
         * ====================================================
         * FINISH GENERATION
         * ====================================================
         */

        function finishGeneration() {

            animationRunning = false;

            currentOperation = null;

            animationId = null;


            /*
             * Ensure entrance/exit remain open.
             */

            grid.openEntranceAndExit();


            /*
             * Remove generation visited colouring.
             *
             * This leaves a clean maze once the animation
             * has finished.
             */

            grid.resetGenerationState();


            renderer.render();


            setStatus(
                "Maze generated",
                "complete"
            );


            updateButtonStates();

        }


        /*
         * ====================================================
         * SOLVE MAZE
         * ====================================================
         */

        function solveMaze() {

            if (
                !generator ||
                !generator.isComplete()
            ) {

                setStatus(
                    "Generate a maze first",
                    "error"
                );

                return;

            }


            cancelAnimation();


            /*
             * Remove previous solving information.
             */

            solver.reset();

            solver.start();


            animationRunning = true;
            currentOperation = "solving";

            updateButtonStates();


            setStatus(
                "Solving maze...",
                "working"
            );


            lastFrameTime =
                performance.now();

            accumulatedTime = 0;


            animationId =
                requestAnimationFrame(
                    solverFrame
                );

        }


        /*
         * ====================================================
         * SOLVER ANIMATION
         * ====================================================
         */

        function solverFrame(
            timestamp
        ) {

            if (
                !animationRunning ||
                currentOperation !==
                    "solving"
            ) {

                return;

            }


            const delta =
                timestamp -
                lastFrameTime;


            lastFrameTime =
                timestamp;

            accumulatedTime += delta;


            const delay =
                getStepDelay();


            if (
                accumulatedTime >=
                delay
            ) {

                const steps =
                    getStepsPerFrame();


                for (
                    let i = 0;
                    i < steps;
                    i++
                ) {

                    if (
                        solver.isComplete()
                    ) {

                        break;

                    }


                    solver.step();

                }


                accumulatedTime = 0;


                renderer.render();


                setStatus(
                    `Searching — ` +
                    `${solver.getVisitedCount()}` +
                    ` cells explored`,
                    "working"
                );

            }


            /*
             * Search finished.
             */

            if (
                solver.isComplete()
            ) {

                finishSolving();

                return;

            }


            animationId =
                requestAnimationFrame(
                    solverFrame
                );

        }


        /*
         * ====================================================
         * FINISH SOLVING
         * ====================================================
         */

        function finishSolving() {

            animationRunning = false;

            currentOperation = null;

            animationId = null;


            if (solver.isSolved()) {

                renderer.renderWithSolution();


                /*
                 * Number of movements is one less than number
                 * of cells in the path.
                 */

                const moves =
                    Math.max(
                        0,
                        solver.getSolutionLength() -
                        1
                    );


                setStatus(
                    `Solved — ${moves} steps`,
                    "complete"
                );

            }
            else {

                renderer.render();


                setStatus(
                    "No route found",
                    "error"
                );

            }


            updateButtonStates();

        }


        /*
         * ====================================================
         * CLEAR
         * ====================================================
         */

        function clearMaze() {

            cancelAnimation();


            /*
             * Recreate everything rather than merely resetting
             * the cells. This guarantees completely fresh
             * object state.
             */

            createMaze();


            setStatus(
                "Cleared",
                "ready"
            );

        }


        /*
         * ====================================================
         * DIMENSION CHANGES
         * ====================================================
         */

        function dimensionChanged() {

            /*
             * Don't rebuild while an algorithm is running.
             *
             * Instead the new dimensions will be used the
             * next time Generate is pressed.
             */

            if (animationRunning) {

                return;

            }


            createMaze();

        }


        /*
         * ====================================================
         * WINDOW RESIZE
         * ====================================================
         */

        let resizeTimer = null;


        function handleResize() {

            clearTimeout(
                resizeTimer
            );


            resizeTimer =
                setTimeout(
                    () => {

                        if (!renderer) {

                            return;

                        }


                        renderer.resizeCanvas();


                        if (
                            solver &&
                            solver.isSolved()
                        ) {

                            renderer
                                .renderWithSolution();

                        }
                        else {

                            renderer.render();

                        }

                    },
                    100
                );

        }


        /*
         * ====================================================
         * EVENT LISTENERS
         * ====================================================
         */

        generateButton.addEventListener(
            "click",
            generateMaze
        );


        solveButton.addEventListener(
            "click",
            solveMaze
        );


        clearButton.addEventListener(
            "click",
            clearMaze
        );


        widthInput.addEventListener(
            "change",
            dimensionChanged
        );


        heightInput.addEventListener(
            "change",
            dimensionChanged
        );


        window.addEventListener(
            "resize",
            handleResize
        );


        /*
         * ====================================================
         * INITIALISE
         * ====================================================
         */

        createMaze();

        updateButtonStates();

    }
);