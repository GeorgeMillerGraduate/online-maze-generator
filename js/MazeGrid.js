/**
 * ============================================================
 * MazeGrid
 * ============================================================
 *
 * Represents the complete rectangular maze grid.
 *
 * Responsibilities:
 *
 * - Create and store MazeCell objects
 * - Provide safe access to cells
 * - Reset maze state
 * - Reset generation/solver state
 * - Provide neighbouring cells
 * - Open the maze entrance and exit
 *
 * Cells are stored as:
 *
 * cells[row][column]
 *
 * ============================================================
 */

class MazeGrid {

    /**
     * Create a maze grid.
     *
     * @param {number} rows
     * @param {number} cols
     */
    constructor(rows, cols) {

        this.rows = rows;
        this.cols = cols;

        this.cells = [];

        this.createGrid();

    }


    /**
     * ========================================================
     * GRID CREATION
     * ========================================================
     *
     * Construct the two-dimensional array of MazeCell objects.
     */
    createGrid() {

        this.cells = [];

        for (let row = 0; row < this.rows; row++) {

            const currentRow = [];

            for (let col = 0; col < this.cols; col++) {

                currentRow.push(
                    new MazeCell(row, col)
                );

            }

            this.cells.push(currentRow);

        }

    }


    /**
     * ========================================================
     * CELL ACCESS
     * ========================================================
     *
     * Return a cell at a particular row and column.
     *
     * If the coordinates are outside the grid, null is
     * returned instead of throwing an error.
     *
     * This makes neighbour lookup considerably simpler.
     *
     * @param {number} row
     * @param {number} col
     * @returns {MazeCell|null}
     */
    getCell(row, col) {

        if (!this.isInside(row, col)) {

            return null;

        }

        return this.cells[row][col];

    }


    /**
     * Determine whether coordinates exist inside the grid.
     *
     * @param {number} row
     * @param {number} col
     * @returns {boolean}
     */
    isInside(row, col) {

        return (
            row >= 0 &&
            row < this.rows &&
            col >= 0 &&
            col < this.cols
        );

    }


    /**
     * Return the entire cell array.
     *
     * Primarily useful to MazeRenderer.
     *
     * @returns {MazeCell[][]}
     */
    getCells() {

        return this.cells;

    }


    /**
     * Return number of rows.
     *
     * @returns {number}
     */
    getRows() {

        return this.rows;

    }


    /**
     * Return number of columns.
     *
     * @returns {number}
     */
    getCols() {

        return this.cols;

    }


    /**
     * Return the total number of cells.
     *
     * @returns {number}
     */
    getCellCount() {

        return this.rows * this.cols;

    }


    /**
     * ========================================================
     * NEIGHBOURS
     * ========================================================
     *
     * Return the geometrically adjacent cells.
     *
     * This method does NOT check walls.
     *
     * It simply returns cells above, right, below and left
     * when those cells exist.
     *
     * @param {MazeCell} cell
     * @returns {Object}
     */
    getNeighbours(cell) {

        const row = cell.getRow();
        const col = cell.getCol();

        return {

            top:
                this.getCell(
                    row - 1,
                    col
                ),

            right:
                this.getCell(
                    row,
                    col + 1
                ),

            bottom:
                this.getCell(
                    row + 1,
                    col
                ),

            left:
                this.getCell(
                    row,
                    col - 1
                )

        };

    }


    /**
     * Return neighbouring cells as an array.
     *
     * Missing neighbours at the edges of the grid are removed.
     *
     * @param {MazeCell} cell
     * @returns {MazeCell[]}
     */
    getNeighbourArray(cell) {

        const neighbours =
            this.getNeighbours(cell);

        return [
            neighbours.top,
            neighbours.right,
            neighbours.bottom,
            neighbours.left
        ].filter(
            neighbour => neighbour !== null
        );

    }


    /**
     * ========================================================
     * ACCESSIBLE NEIGHBOURS
     * ========================================================
     *
     * Return cells that can actually be reached from this cell.
     *
     * Unlike getNeighbours(), this checks whether walls have
     * been removed.
     *
     * MazeSolver will use this method.
     *
     * @param {MazeCell} cell
     * @returns {MazeCell[]}
     */
    getAccessibleNeighbours(cell) {

        const neighbours = [];

        const row = cell.getRow();
        const col = cell.getCol();


        /*
         * TOP
         */

        if (!cell.hasWall("top")) {

            const top =
                this.getCell(
                    row - 1,
                    col
                );

            if (top) {

                neighbours.push(top);

            }

        }


        /*
         * RIGHT
         */

        if (!cell.hasWall("right")) {

            const right =
                this.getCell(
                    row,
                    col + 1
                );

            if (right) {

                neighbours.push(right);

            }

        }


        /*
         * BOTTOM
         */

        if (!cell.hasWall("bottom")) {

            const bottom =
                this.getCell(
                    row + 1,
                    col
                );

            if (bottom) {

                neighbours.push(bottom);

            }

        }


        /*
         * LEFT
         */

        if (!cell.hasWall("left")) {

            const left =
                this.getCell(
                    row,
                    col - 1
                );

            if (left) {

                neighbours.push(left);

            }

        }


        return neighbours;

    }


    /**
     * ========================================================
     * RESET GENERATION STATE
     * ========================================================
     *
     * Clears the visited flag used by MazeGenerator.
     *
     * Walls are NOT changed.
     */
    resetGenerationState() {

        this.forEachCell(
            cell => {

                cell.resetGenerationState();

            }
        );

    }


    /**
     * ========================================================
     * RESET SOLVER STATE
     * ========================================================
     *
     * Clear pathfinding information without changing the maze.
     */
    resetSolverState() {

        this.forEachCell(
            cell => {

                cell.resetSolverState();

            }
        );

    }


    /**
     * ========================================================
     * RESET MAZE
     * ========================================================
     *
     * Completely restore every cell.
     *
     * This:
     *
     * - Restores every wall
     * - Clears generation state
     * - Clears solver state
     */
    reset() {

        this.forEachCell(
            cell => {

                cell.reset();

            }
        );

    }


    /**
     * ========================================================
     * RESIZE
     * ========================================================
     *
     * Rebuild the entire maze with a new size.
     *
     * @param {number} rows
     * @param {number} cols
     */
    resize(rows, cols) {

        if (
            !Number.isInteger(rows) ||
            !Number.isInteger(cols) ||
            rows <= 0 ||
            cols <= 0
        ) {

            throw new Error(
                "Maze dimensions must be positive integers."
            );

        }

        this.rows = rows;
        this.cols = cols;

        this.createGrid();

    }


    /**
     * ========================================================
     * ENTRANCE / EXIT
     * ========================================================
     *
     * Open the left wall of the top-left cell and the right
     * wall of the bottom-right cell.
     *
     * Visually this gives the maze a clear entrance and exit.
     */
    openEntranceAndExit() {

        const entrance =
            this.getStartCell();

        const exit =
            this.getEndCell();


        if (entrance) {

            entrance.removeWall("left");

        }


        if (exit) {

            exit.removeWall("right");

        }

    }


    /**
     * Return the default starting cell.
     *
     * @returns {MazeCell|null}
     */
    getStartCell() {

        return this.getCell(
            0,
            0
        );

    }


    /**
     * Return the default destination cell.
     *
     * @returns {MazeCell|null}
     */
    getEndCell() {

        return this.getCell(
            this.rows - 1,
            this.cols - 1
        );

    }


    /**
     * ========================================================
     * ITERATION UTILITY
     * ========================================================
     *
     * Run a function for every cell in the maze.
     *
     * @param {Function} callback
     */
    forEachCell(callback) {

        for (
            let row = 0;
            row < this.rows;
            row++
        ) {

            for (
                let col = 0;
                col < this.cols;
                col++
            ) {

                callback(
                    this.cells[row][col],
                    row,
                    col
                );

            }

        }

    }


    /**
     * ========================================================
     * DEBUGGING
     * ========================================================
     *
     * Return a simple description of the grid.
     *
     * @returns {string}
     */
    toString() {

        return (
            `MazeGrid(${this.rows} rows × ` +
            `${this.cols} columns)`
        );

    }

}