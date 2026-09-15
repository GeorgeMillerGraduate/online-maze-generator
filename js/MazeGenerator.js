/**
 * ============================================================
 * MazeGenerator
 * ============================================================
 *
 * Generates a perfect maze using randomized depth-first
 * search (recursive backtracking).
 *
 * The algorithm:
 *
 * 1. Start at a cell.
 * 2. Mark it as visited.
 * 3. Find all unvisited neighbouring cells.
 * 4. Randomly choose one.
 * 5. Remove the wall between the two cells.
 * 6. Move to the chosen cell.
 * 7. If no unvisited neighbours remain, backtrack.
 * 8. Continue until every reachable cell has been visited.
 *
 * An explicit stack is used rather than JavaScript recursion.
 * This makes the generator suitable for animation and avoids
 * recursion-depth problems on larger grids.
 *
 * ============================================================
 */

class MazeGenerator {

    /**
     * @param {MazeGrid} grid
     */
    constructor(grid) {

        this.grid = grid;

        this.stack = [];

        this.currentCell = null;

        this.complete = false;

        this.started = false;

        this.visitedCount = 0;

    }


    /**
     * Begin generation.
     *
     * The default starting position is the top-left cell.
     *
     * @param {number} startRow
     * @param {number} startCol
     */
    start(startRow = 0, startCol = 0) {

        this.reset();

        const startCell =
            this.grid.getCell(startRow, startCol);

        if (!startCell) {

            throw new Error(
                "MazeGenerator could not find starting cell."
            );

        }

        this.currentCell = startCell;

        this.currentCell.setVisited(true);

        this.visitedCount = 1;

        this.started = true;
        this.complete = false;

    }


    /**
     * Perform one step of the generation algorithm.
     *
     * This method is deliberately incremental.
     *
     * MazeRenderer/app.js can repeatedly call step()
     * using requestAnimationFrame or setTimeout to animate
     * the maze being constructed.
     *
     * @returns {boolean}
     *
     * true  = generation continues
     * false = generation is complete
     */
    step() {

        if (!this.started) {

            this.start();

        }


        if (this.complete) {

            return false;

        }


        /*
         * Find every unvisited neighbour of the
         * current cell.
         */

        const neighbours =
            this.getUnvisitedNeighbours(
                this.currentCell
            );


        /*
         * ----------------------------------------------------
         * MOVE FORWARD
         * ----------------------------------------------------
         *
         * If at least one unvisited neighbour exists:
         *
         * - choose one randomly
         * - remember the current cell
         * - remove the wall between them
         * - move into the neighbour
         */

        if (neighbours.length > 0) {

            const nextCell =
                neighbours[
                    Math.floor(
                        Math.random() *
                        neighbours.length
                    )
                ];


            /*
             * Store the current cell so that we can
             * return to it when a dead end is reached.
             */

            this.stack.push(
                this.currentCell
            );


            /*
             * Carve a passage between the cells.
             */

            this.removeWallsBetween(
                this.currentCell,
                nextCell
            );


            /*
             * Move into the new cell.
             */

            this.currentCell =
                nextCell;


            this.currentCell
                .setVisited(true);


            this.visitedCount++;


            return true;

        }


        /*
         * ----------------------------------------------------
         * BACKTRACK
         * ----------------------------------------------------
         *
         * No unvisited neighbours remain.
         *
         * Return to the previous cell and try again.
         */

        if (this.stack.length > 0) {

            this.currentCell =
                this.stack.pop();

            return true;

        }


        /*
         * ----------------------------------------------------
         * COMPLETE
         * ----------------------------------------------------
         *
         * There are no available neighbours and nothing
         * remains on the stack.
         */

        this.complete = true;

        this.currentCell = null;

        return false;

    }


    /**
     * Generate the entire maze immediately.
     *
     * Useful when animation is disabled.
     */
    generateInstantly() {

        if (!this.started) {

            this.start();

        }


        while (!this.complete) {

            this.step();

        }

    }


    /**
     * Return all unvisited neighbouring cells.
     *
     * @param {MazeCell} cell
     * @returns {MazeCell[]}
     */
    getUnvisitedNeighbours(cell) {

        const neighbours = [];

        const row = cell.getRow();
        const col = cell.getCol();


        /*
         * TOP
         */

        const top =
            this.grid.getCell(
                row - 1,
                col
            );

        if (
            top &&
            !top.isVisited()
        ) {

            neighbours.push(top);

        }


        /*
         * RIGHT
         */

        const right =
            this.grid.getCell(
                row,
                col + 1
            );

        if (
            right &&
            !right.isVisited()
        ) {

            neighbours.push(right);

        }


        /*
         * BOTTOM
         */

        const bottom =
            this.grid.getCell(
                row + 1,
                col
            );

        if (
            bottom &&
            !bottom.isVisited()
        ) {

            neighbours.push(bottom);

        }


        /*
         * LEFT
         */

        const left =
            this.grid.getCell(
                row,
                col - 1
            );

        if (
            left &&
            !left.isVisited()
        ) {

            neighbours.push(left);

        }


        return neighbours;

    }


    /**
     * Remove the walls separating two adjacent cells.
     *
     * Both cells must be updated.
     *
     * For example:
     *
     *     A | B
     *
     * Removing the passage requires:
     *
     * A.right = false
     * B.left  = false
     *
     * @param {MazeCell} current
     * @param {MazeCell} next
     */
    removeWallsBetween(current, next) {

        const rowDifference =
            next.getRow() -
            current.getRow();

        const colDifference =
            next.getCol() -
            current.getCol();


        /*
         * NEXT CELL IS ABOVE
         */

        if (
            rowDifference === -1 &&
            colDifference === 0
        ) {

            current.removeWall("top");
            next.removeWall("bottom");

            return;

        }


        /*
         * NEXT CELL IS BELOW
         */

        if (
            rowDifference === 1 &&
            colDifference === 0
        ) {

            current.removeWall("bottom");
            next.removeWall("top");

            return;

        }


        /*
         * NEXT CELL IS LEFT
         */

        if (
            rowDifference === 0 &&
            colDifference === -1
        ) {

            current.removeWall("left");
            next.removeWall("right");

            return;

        }


        /*
         * NEXT CELL IS RIGHT
         */

        if (
            rowDifference === 0 &&
            colDifference === 1
        ) {

            current.removeWall("right");
            next.removeWall("left");

            return;

        }


        /*
         * If we reach this point, the cells were
         * not directly adjacent.
         */

        throw new Error(
            "MazeGenerator attempted to connect " +
            "non-adjacent cells."
        );

    }


    /**
     * Reset generator state.
     *
     * This resets the visited state of every cell but does
     * not automatically rebuild the walls. MazeGrid can
     * handle a complete maze reset when a new maze is
     * requested.
     */
    reset() {

        this.stack = [];

        this.currentCell = null;

        this.complete = false;

        this.started = false;

        this.visitedCount = 0;


        /*
         * Reset generation state throughout the grid.
         */

        if (
            this.grid &&
            typeof this.grid.resetGenerationState ===
                "function"
        ) {

            this.grid.resetGenerationState();

        }

    }


    /**
     * Return the cell currently being processed.
     *
     * MazeRenderer can use this to highlight the
     * active cell.
     *
     * @returns {MazeCell|null}
     */
    getCurrentCell() {

        return this.currentCell;

    }


    /**
     * Return the backtracking stack.
     *
     * @returns {MazeCell[]}
     */
    getStack() {

        return this.stack;

    }


    /**
     * Number of cells visited so far.
     *
     * @returns {number}
     */
    getVisitedCount() {

        return this.visitedCount;

    }


    /**
     * Has generation started?
     *
     * @returns {boolean}
     */
    hasStarted() {

        return this.started;

    }


    /**
     * Has generation finished?
     *
     * @returns {boolean}
     */
    isComplete() {

        return this.complete;

    }

}