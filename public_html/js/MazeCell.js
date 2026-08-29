/**
 * ============================================================
 * MazeCell
 * ============================================================
 *
 * Represents a single cell within the maze.
 *
 * Each cell stores:
 *
 * - Its row and column position
 * - The state of its four walls
 * - Whether it has been visited during maze generation
 * - Whether it has been visited during maze solving
 * - Whether it forms part of the final solution path
 *
 * Walls are initially present on all four sides.
 *
 * MazeGenerator will remove walls as passages are carved
 * between neighbouring cells.
 *
 * ============================================================
 */

class MazeCell {

    /**
     * Create a new maze cell.
     *
     * @param {number} row
     * @param {number} col
     */
    constructor(row, col) {

        this.row = row;
        this.col = col;


        /*
         * ----------------------------------------------------
         * WALLS
         * ----------------------------------------------------
         *
         * true  = wall exists
         * false = wall has been removed
         */

        this.walls = {

            top: true,
            right: true,
            bottom: true,
            left: true

        };


        /*
         * Used by the maze generation algorithm.
         */

        this.visited = false;


        /*
         * Used independently by MazeSolver.
         *
         * Keeping solver state separate means that solving
         * the maze does not interfere with generation state.
         */

        this.solverVisited = false;


        /*
         * Used by MazeRenderer when displaying the final
         * route from the entrance to the exit.
         */

        this.solution = false;


        /*
         * Reference to the previous cell while solving.
         *
         * This allows MazeSolver to reconstruct a path after
         * reaching the destination.
         */

        this.previous = null;
    }


    /**
     * Return the row index.
     *
     * @returns {number}
     */
    getRow() {

        return this.row;

    }


    /**
     * Return the column index.
     *
     * @returns {number}
     */
    getCol() {

        return this.col;

    }


    /**
     * Returns whether this cell has been visited during
     * maze generation.
     *
     * @returns {boolean}
     */
    isVisited() {

        return this.visited;

    }


    /**
     * Set generation visited state.
     *
     * @param {boolean} value
     */
    setVisited(value) {

        this.visited = value;

    }


    /**
     * Returns whether the solver has visited this cell.
     *
     * @returns {boolean}
     */
    isSolverVisited() {

        return this.solverVisited;

    }


    /**
     * Set solver visited state.
     *
     * @param {boolean} value
     */
    setSolverVisited(value) {

        this.solverVisited = value;

    }


    /**
     * Returns whether the cell belongs to the final
     * solution path.
     *
     * @returns {boolean}
     */
    isSolution() {

        return this.solution;

    }


    /**
     * Mark/unmark the cell as part of the solution.
     *
     * @param {boolean} value
     */
    setSolution(value) {

        this.solution = value;

    }


    /**
     * Set the previous cell used during path reconstruction.
     *
     * @param {MazeCell|null} cell
     */
    setPrevious(cell) {

        this.previous = cell;

    }


    /**
     * Return the previous cell.
     *
     * @returns {MazeCell|null}
     */
    getPrevious() {

        return this.previous;

    }


    /**
     * Determine whether a particular wall exists.
     *
     * Example:
     *
     * cell.hasWall("top")
     *
     * @param {string} direction
     * @returns {boolean}
     */
    hasWall(direction) {

        if (!(direction in this.walls)) {

            throw new Error(
                "Unknown wall direction: " + direction
            );

        }

        return this.walls[direction];

    }


    /**
     * Remove a wall from this cell.
     *
     * @param {string} direction
     */
    removeWall(direction) {

        if (!(direction in this.walls)) {

            throw new Error(
                "Unknown wall direction: " + direction
            );

        }

        this.walls[direction] = false;

    }


    /**
     * Restore a wall.
     *
     * Mainly useful when completely resetting the maze.
     *
     * @param {string} direction
     */
    addWall(direction) {

        if (!(direction in this.walls)) {

            throw new Error(
                "Unknown wall direction: " + direction
            );

        }

        this.walls[direction] = true;

    }


    /**
     * Restore all four walls.
     */
    resetWalls() {

        this.walls.top = true;
        this.walls.right = true;
        this.walls.bottom = true;
        this.walls.left = true;

    }


    /**
     * Reset state associated with maze generation.
     *
     * Does not alter the walls.
     */
    resetGenerationState() {

        this.visited = false;

    }


    /**
     * Reset everything associated with the solver.
     *
     * Does not modify maze walls.
     */
    resetSolverState() {

        this.solverVisited = false;
        this.solution = false;
        this.previous = null;

    }


    /**
     * Completely reset this cell.
     *
     * Returns the cell to its original state.
     */
    reset() {

        this.resetWalls();
        this.resetGenerationState();
        this.resetSolverState();

    }


    /**
     * Convenience method for debugging.
     *
     * Example:
     *
     * console.log(cell.toString());
     *
     * @returns {string}
     */
    toString() {

        return `MazeCell(${this.row}, ${this.col})`;

    }

}