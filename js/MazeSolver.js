/**
 * ============================================================
 * MazeSolver
 * ============================================================
 *
 * Solves a generated maze using Breadth-First Search (BFS).
 *
 * Responsibilities:
 *
 * - Search from the maze entrance to the exit
 * - Move only through open passages
 * - Track visited cells
 * - Store previous-cell references
 * - Reconstruct the final solution path
 * - Support step-by-step animation
 *
 * Because every movement between cells has equal cost,
 * BFS guarantees a shortest path.
 *
 * ============================================================
 */

class MazeSolver {

    /**
     * @param {MazeGrid} grid
     */
    constructor(grid) {

        this.grid = grid;

        this.queue = [];

        this.currentCell = null;

        this.startCell = null;
        this.endCell = null;

        this.started = false;
        this.complete = false;
        this.solved = false;

        this.visitedCount = 0;

        this.solutionPath = [];

    }


    /**
     * ========================================================
     * START
     * ========================================================
     *
     * Begin solving the maze.
     *
     * By default the solver starts at the top-left cell and
     * searches for the bottom-right cell.
     */
    start() {

        this.reset();

        this.startCell =
            this.grid.getStartCell();

        this.endCell =
            this.grid.getEndCell();


        if (
            !this.startCell ||
            !this.endCell
        ) {

            throw new Error(
                "MazeSolver could not find maze start/end cells."
            );

        }


        /*
         * The first cell enters the BFS queue.
         */

        this.startCell
            .setSolverVisited(true);

        this.startCell
            .setPrevious(null);

        this.queue.push(
            this.startCell
        );

        this.visitedCount = 1;

        this.started = true;
        this.complete = false;
        this.solved = false;

    }


    /**
     * ========================================================
     * STEP
     * ========================================================
     *
     * Perform one BFS iteration.
     *
     * Calling this repeatedly allows app.js to animate the
     * solving process.
     *
     * @returns {boolean}
     *
     * true  = solver still running
     * false = solver finished
     */
    step() {

        if (!this.started) {

            this.start();

        }


        if (this.complete) {

            return false;

        }


        /*
         * If the queue becomes empty, every reachable cell
         * has been searched without finding the destination.
         */

        if (this.queue.length === 0) {

            this.complete = true;
            this.solved = false;

            this.currentCell = null;

            return false;

        }


        /*
         * BFS removes from the beginning of the queue.
         */

        this.currentCell =
            this.queue.shift();


        /*
         * ----------------------------------------------------
         * DESTINATION FOUND
         * ----------------------------------------------------
         */

        if (
            this.currentCell ===
            this.endCell
        ) {

            this.solved = true;
            this.complete = true;

            this.reconstructPath();

            return false;

        }


        /*
         * ----------------------------------------------------
         * EXPLORE NEIGHBOURS
         * ----------------------------------------------------
         *
         * MazeGrid only returns neighbours connected through
         * an open passage.
         */

        const neighbours =
            this.grid.getAccessibleNeighbours(
                this.currentCell
            );


        for (const neighbour of neighbours) {

            /*
             * Never add the same cell to the queue twice.
             */

            if (
                neighbour.isSolverVisited()
            ) {

                continue;

            }


            /*
             * Mark as visited immediately when queued.
             *
             * This prevents another cell from adding the same
             * neighbour before it is processed.
             */

            neighbour
                .setSolverVisited(true);


            /*
             * Remember how we reached this cell.
             *
             * These references form a chain that can later be
             * followed backwards from destination to start.
             */

            neighbour
                .setPrevious(
                    this.currentCell
                );


            this.queue.push(
                neighbour
            );


            this.visitedCount++;

        }


        return true;

    }


    /**
     * ========================================================
     * SOLVE INSTANTLY
     * ========================================================
     *
     * Complete the entire search without animation.
     *
     * @returns {boolean}
     */
    solveInstantly() {

        if (!this.started) {

            this.start();

        }


        while (!this.complete) {

            this.step();

        }


        return this.solved;

    }


    /**
     * ========================================================
     * RECONSTRUCT PATH
     * ========================================================
     *
     * Follow previous-cell references backwards from the
     * destination to the starting cell.
     *
     * The final array is then reversed so it runs:
     *
     * START -> ... -> END
     */
    reconstructPath() {

        this.solutionPath = [];


        if (!this.endCell) {

            return;

        }


        let current =
            this.endCell;


        while (current !== null) {

            this.solutionPath.push(
                current
            );


            /*
             * Mark the cell so MazeRenderer can colour it.
             */

            current.setSolution(true);


            /*
             * Stop once the start has been reached.
             */

            if (
                current ===
                this.startCell
            ) {

                break;

            }


            current =
                current.getPrevious();

        }


        /*
         * If the chain never reached the starting cell,
         * something is wrong with the path.
         */

        if (
            this.solutionPath.length === 0 ||
            this.solutionPath[
                this.solutionPath.length - 1
            ] !== this.startCell
        ) {

            this.solutionPath = [];

            this.solved = false;

            return;

        }


        this.solutionPath.reverse();

    }


    /**
     * ========================================================
     * RESET
     * ========================================================
     *
     * Reset the solver while leaving the generated maze walls
     * completely untouched.
     */
    reset() {

        this.queue = [];

        this.currentCell = null;

        this.startCell = null;
        this.endCell = null;

        this.started = false;
        this.complete = false;
        this.solved = false;

        this.visitedCount = 0;

        this.solutionPath = [];


        if (
            this.grid &&
            typeof this.grid.resetSolverState ===
                "function"
        ) {

            this.grid.resetSolverState();

        }

    }


    /**
     * ========================================================
     * CHANGE GRID
     * ========================================================
     *
     * Useful when app.js creates a new grid after the user
     * changes maze dimensions.
     *
     * @param {MazeGrid} grid
     */
    setGrid(grid) {

        this.grid = grid;

        this.reset();

    }


    /**
     * ========================================================
     * CURRENT CELL
     * ========================================================
     *
     * MazeRenderer/app.js may use this to show which cell is
     * currently being processed.
     *
     * @returns {MazeCell|null}
     */
    getCurrentCell() {

        return this.currentCell;

    }


    /**
     * ========================================================
     * SOLUTION PATH
     * ========================================================
     *
     * @returns {MazeCell[]}
     */
    getSolutionPath() {

        return this.solutionPath;

    }


    /**
     * Return the number of cells in the final path.
     *
     * @returns {number}
     */
    getSolutionLength() {

        return this.solutionPath.length;

    }


    /**
     * ========================================================
     * SEARCH STATISTICS
     * ========================================================
     */

    getVisitedCount() {

        return this.visitedCount;

    }


    getQueueSize() {

        return this.queue.length;

    }


    /**
     * ========================================================
     * STATE
     * ========================================================
     */

    hasStarted() {

        return this.started;

    }


    isComplete() {

        return this.complete;

    }


    isSolved() {

        return this.solved;

    }

}