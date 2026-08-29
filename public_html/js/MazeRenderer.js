/**
 * ============================================================
 * MazeRenderer
 * ============================================================
 *
 * Handles all Canvas rendering for the Maze Generator.
 *
 * Responsibilities:
 *
 * - Draw maze cell walls
 * - Automatically scale the grid to the canvas
 * - Highlight cells visited during generation
 * - Highlight the currently active generator cell
 * - Display solver exploration
 * - Display the final solution path
 * - Mark the maze entrance and exit
 * - Handle high-DPI displays
 *
 * MazeRenderer contains no generation or solving logic.
 * It only visualises the current state of MazeGrid.
 *
 * ============================================================
 */

class MazeRenderer {

    /**
     * @param {HTMLCanvasElement} canvas
     * @param {MazeGrid} grid
     */
    constructor(canvas, grid) {

        if (!canvas) {

            throw new Error(
                "MazeRenderer requires a canvas element."
            );

        }

        this.canvas = canvas;
        this.context = canvas.getContext("2d");

        if (!this.context) {

            throw new Error(
                "Unable to obtain 2D canvas context."
            );

        }

        this.grid = grid;

        this.generator = null;


        /*
         * ----------------------------------------------------
         * COLOURS
         * ----------------------------------------------------
         *
         * These deliberately match the dark green site design.
         */

        this.backgroundColour = "#090d12";

        this.wallColour = "#52606f";

        this.unvisitedColour = "#090d12";

        this.visitedColour = "#101c1c";

        this.activeColour = "#38d39f";

        this.solverVisitedColour = "#162330";

        this.solutionColour = "#38d39f";

        this.startColour = "#38d39f";

        this.endColour = "#d8dee9";


        /*
         * Drawing configuration.
         */

        this.wallWidth = 1;

        this.padding = 12;

        this.cellWidth = 0;
        this.cellHeight = 0;

        this.mazeWidth = 0;
        this.mazeHeight = 0;

        this.offsetX = 0;
        this.offsetY = 0;


        /*
         * Configure canvas resolution.
         */

        this.resizeCanvas();

    }


    /**
     * ========================================================
     * GRID
     * ========================================================
     *
     * Replace the grid being displayed.
     *
     * Useful when maze dimensions are changed.
     *
     * @param {MazeGrid} grid
     */
    setGrid(grid) {

        this.grid = grid;

        this.calculateDimensions();

    }


    /**
     * Attach the maze generator.
     *
     * This allows the renderer to highlight the cell currently
     * being processed.
     *
     * @param {MazeGenerator} generator
     */
    setGenerator(generator) {

        this.generator = generator;

    }


    /**
     * ========================================================
     * CANVAS SIZE
     * ========================================================
     *
     * Configure the internal canvas resolution for the current
     * device pixel ratio.
     *
     * The CSS controls the visible size while the internal
     * resolution is increased on high-DPI displays.
     */
    resizeCanvas() {

        const rect =
            this.canvas.getBoundingClientRect();


        /*
         * If CSS dimensions are not currently available,
         * fall back to the canvas attributes.
         */

        const cssWidth =
            rect.width ||
            this.canvas.width ||
            1200;

        const cssHeight =
            rect.height ||
            this.canvas.height ||
            700;


        const pixelRatio =
            window.devicePixelRatio || 1;


        this.canvas.width =
            Math.round(
                cssWidth * pixelRatio
            );

        this.canvas.height =
            Math.round(
                cssHeight * pixelRatio
            );


        /*
         * Draw using CSS pixel coordinates rather than
         * physical device pixels.
         */

        this.context.setTransform(
            pixelRatio,
            0,
            0,
            pixelRatio,
            0,
            0
        );


        this.displayWidth = cssWidth;
        this.displayHeight = cssHeight;


        this.calculateDimensions();

    }


    /**
     * ========================================================
     * DIMENSIONS
     * ========================================================
     *
     * Determine the largest cell dimensions that fit the
     * complete maze inside the canvas.
     */
    calculateDimensions() {

        if (!this.grid) {

            return;

        }


        const rows =
            this.grid.getRows();

        const cols =
            this.grid.getCols();


        if (
            rows <= 0 ||
            cols <= 0
        ) {

            return;

        }


        const availableWidth =
            this.displayWidth -
            (this.padding * 2);

        const availableHeight =
            this.displayHeight -
            (this.padding * 2);


        /*
         * Keep cells square.
         */

        const size =
            Math.min(
                availableWidth / cols,
                availableHeight / rows
            );


        this.cellWidth = size;
        this.cellHeight = size;


        this.mazeWidth =
            size * cols;

        this.mazeHeight =
            size * rows;


        /*
         * Centre maze inside canvas.
         */

        this.offsetX =
            (
                this.displayWidth -
                this.mazeWidth
            ) / 2;

        this.offsetY =
            (
                this.displayHeight -
                this.mazeHeight
            ) / 2;

    }


    /**
     * ========================================================
     * RENDER
     * ========================================================
     *
     * Render the complete maze.
     */
    render() {

        if (!this.grid) {

            return;

        }


        this.clear();


        /*
         * First draw cell backgrounds.
         *
         * Walls are drawn afterwards so that fills cannot
         * cover them.
         */

        this.grid.forEachCell(
            cell => {

                this.drawCellBackground(cell);

            }
        );


        /*
         * Draw maze walls.
         */

        this.grid.forEachCell(
            cell => {

                this.drawCellWalls(cell);

            }
        );


        /*
         * Entrance and exit indicators.
         */

        this.drawStartMarker();
        this.drawEndMarker();

    }


    /**
     * ========================================================
     * CLEAR
     * ========================================================
     */
    clear() {

        this.context.save();

        this.context.fillStyle =
            this.backgroundColour;

        this.context.fillRect(
            0,
            0,
            this.displayWidth,
            this.displayHeight
        );

        this.context.restore();

    }


    /**
     * ========================================================
     * CELL BACKGROUND
     * ========================================================
     *
     * Determine how a cell should be coloured.
     *
     * Priority:
     *
     * current generator cell
     * solution
     * solver visited
     * generator visited
     * normal background
     *
     * @param {MazeCell} cell
     */
    drawCellBackground(cell) {

        const position =
            this.getCellPosition(cell);


        let colour =
            this.unvisitedColour;


        /*
         * Generation visited state.
         */

        if (cell.isVisited()) {

            colour =
                this.visitedColour;

        }


        /*
         * Solver exploration.
         */

        if (cell.isSolverVisited()) {

            colour =
                this.solverVisitedColour;

        }


        /*
         * Final solution path.
         */

        if (cell.isSolution()) {

            colour =
                this.solutionColour;

        }


        /*
         * Current generator position.
         */

        if (
            this.generator &&
            this.generator.getCurrentCell() === cell
        ) {

            colour =
                this.activeColour;

        }


        this.context.fillStyle =
            colour;


        /*
         * Slight overlap prevents tiny sub-pixel gaps
         * between neighbouring cells.
         */

        this.context.fillRect(
            position.x,
            position.y,
            this.cellWidth + 0.5,
            this.cellHeight + 0.5
        );

    }


    /**
     * ========================================================
     * WALL DRAWING
     * ========================================================
     *
     * Draw the four walls belonging to a cell.
     *
     * @param {MazeCell} cell
     */
    drawCellWalls(cell) {

        const position =
            this.getCellPosition(cell);


        const x =
            position.x;

        const y =
            position.y;

        const right =
            x + this.cellWidth;

        const bottom =
            y + this.cellHeight;


        this.context.strokeStyle =
            this.wallColour;

        this.context.lineWidth =
            this.wallWidth;

        this.context.lineCap =
            "square";


        this.context.beginPath();


        /*
         * TOP
         */

        if (cell.hasWall("top")) {

            this.context.moveTo(
                x,
                y
            );

            this.context.lineTo(
                right,
                y
            );

        }


        /*
         * RIGHT
         */

        if (cell.hasWall("right")) {

            this.context.moveTo(
                right,
                y
            );

            this.context.lineTo(
                right,
                bottom
            );

        }


        /*
         * BOTTOM
         */

        if (cell.hasWall("bottom")) {

            this.context.moveTo(
                x,
                bottom
            );

            this.context.lineTo(
                right,
                bottom
            );

        }


        /*
         * LEFT
         */

        if (cell.hasWall("left")) {

            this.context.moveTo(
                x,
                y
            );

            this.context.lineTo(
                x,
                bottom
            );

        }


        this.context.stroke();

    }


    /**
     * ========================================================
     * START MARKER
     * ========================================================
     */
    drawStartMarker() {

        const cell =
            this.grid.getStartCell();

        if (!cell) {

            return;

        }


        const position =
            this.getCellPosition(cell);


        const radius =
            Math.max(
                2,
                Math.min(
                    this.cellWidth,
                    this.cellHeight
                ) * 0.16
            );


        this.context.beginPath();

        this.context.arc(
            position.x +
                (this.cellWidth / 2),

            position.y +
                (this.cellHeight / 2),

            radius,

            0,
            Math.PI * 2
        );

        this.context.fillStyle =
            this.startColour;

        this.context.fill();

    }


    /**
     * ========================================================
     * END MARKER
     * ========================================================
     */
    drawEndMarker() {

        const cell =
            this.grid.getEndCell();

        if (!cell) {

            return;

        }


        const position =
            this.getCellPosition(cell);


        const size =
            Math.max(
                3,
                Math.min(
                    this.cellWidth,
                    this.cellHeight
                ) * 0.28
            );


        this.context.fillStyle =
            this.endColour;


        this.context.fillRect(

            position.x +
                (this.cellWidth / 2) -
                (size / 2),

            position.y +
                (this.cellHeight / 2) -
                (size / 2),

            size,
            size

        );

    }


    /**
     * ========================================================
     * CELL POSITION
     * ========================================================
     *
     * Convert a MazeCell's grid coordinates into canvas
     * coordinates.
     *
     * @param {MazeCell} cell
     *
     * @returns {{x: number, y: number}}
     */
    getCellPosition(cell) {

        return {

            x:
                this.offsetX +
                (
                    cell.getCol() *
                    this.cellWidth
                ),

            y:
                this.offsetY +
                (
                    cell.getRow() *
                    this.cellHeight
                )

        };

    }


    /**
     * ========================================================
     * SOLUTION LINE
     * ========================================================
     *
     * Optionally draw a continuous line through cells marked
     * as belonging to the final solution.
     *
     * MazeSolver stores previous references, allowing us to
     * reconstruct the ordered route from the end cell.
     */
    drawSolutionLine() {

        const end =
            this.grid.getEndCell();

        if (
            !end ||
            !end.isSolution()
        ) {

            return;

        }


        const path = [];

        let current = end;


        while (current) {

            path.push(current);

            current =
                current.getPrevious();

        }


        if (path.length < 2) {

            return;

        }


        path.reverse();


        this.context.save();

        this.context.beginPath();

        this.context.strokeStyle =
            this.solutionColour;

        this.context.lineWidth =
            Math.max(
                2,
                Math.min(
                    this.cellWidth,
                    this.cellHeight
                ) * 0.18
            );

        this.context.lineCap =
            "round";

        this.context.lineJoin =
            "round";


        for (
            let i = 0;
            i < path.length;
            i++
        ) {

            const position =
                this.getCellPosition(
                    path[i]
                );


            const x =
                position.x +
                (this.cellWidth / 2);

            const y =
                position.y +
                (this.cellHeight / 2);


            if (i === 0) {

                this.context.moveTo(
                    x,
                    y
                );

            }
            else {

                this.context.lineTo(
                    x,
                    y
                );

            }

        }


        this.context.stroke();

        this.context.restore();

    }


    /**
     * Render the maze and overlay the final path.
     */
    renderWithSolution() {

        this.render();

        this.drawSolutionLine();

        /*
         * Redraw markers above solution line.
         */

        this.drawStartMarker();
        this.drawEndMarker();

    }

}