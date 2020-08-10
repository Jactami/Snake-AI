// html elements
let solverInput;
let colsInput;
let rowsInput;
let speedSlider;
let speedFeedback;
let pathCheckbox;
let scoreP;
let resultP;

// game variables
const unit = 30;
let cols;
let rows;
let snake;
let food;
let dir;
let score;
let gameOver;
let gamePaused;
let solver;
let path;

function setup() { // init html variables and declare user input events
    solverInput = select("#solver");
    colsInput = select("#cols");
    rowsInput = select("#rows");
    speedSlider = select("#speed");
    speedFeedback = select("#speedFeedback");
    pathCheckbox = select("#showPath");
    scoreP = select("#score");
    resultP = select("#result");

    speedFeedback.elt.textContent = speedSlider.value();
    speedSlider.input(() => speedFeedback.elt.textContent = speedSlider.value());

    solverInput.input(prepareGame);
    colsInput.changed(prepareGame);
    rowsInput.changed(prepareGame);

    prepareGame();
}

function prepareGame() {
    console.clear();

    cols = parseFloat(colsInput.value());
    rows = parseFloat(rowsInput.value());
    if (!Number.isInteger(cols) || !Number.isInteger(rows)) {
        console.error("Cols and rows must be of type integer!");
        return;
    }
    if (cols < parseInt(colsInput.elt.min) || rows < parseInt(rowsInput.elt.min)) {
        console.error("Cols and rows must be bigger than 1!");
        return;
    }

    let canvas = createCanvas(cols * unit, rows * unit);
    canvas.parent("canvasContainer");
    resultP.textContent = "";

    // init game variables
    let startX = floor(cols / 2);
    let startY = floor(rows / 2);
    snake = new Array(createVector(startX, startY));
    dir = createVector(0, 0);
    score = 0;
    food = getAvailableSpot();
    gameOver = false;
    gamePaused = true;

    switch (solverInput.value()) {
        case "0":
            solver = new AStarSolver(cols, rows);
            break;
        case "1":
            solver = new HamiltonSolver(cols, rows);
            break;
        default:
            solver = new AStarSolver(cols, rows);
    }
    path = solver.getPath(snake, food);

    resultP.elt.textContent = "";
}

function draw() {
    // draw background
    noStroke();
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            if ((i % 2 + j) % 2 === 0) {
                fill(0, 120, 120);
            } else {
                fill(0, 180, 100);
            }
            square(i * unit, j * unit, unit);
        }
    }
    // background(0);

    // draw snake
    let offset = floor(unit * 0.075);
    fill(255);
    for (let i = 1; i < snake.length; i++) {
        square(snake[i].x * unit + offset, snake[i].y * unit + offset, unit - offset * 2);
    }
    fill(0, 0, 255);
    square(snake[0].x * unit + offset, snake[0].y * unit + offset, unit - offset * 2);

    // draw food
    if (food) {
        fill(255, 0, 0);
        square(food.x * unit + offset, food.y * unit + offset, unit - offset * 2);
    }

    // draw path
    if (pathCheckbox.checked()) {
        stroke(255, 0, 255);
        strokeWeight(3);
        noFill();
        beginShape();
        for (let i = 0; i < path.length; i++) {
            vertex(path[i].x * unit + unit / 2, path[i].y * unit + unit / 2);
        }
        vertex(snake[0].x * unit + unit / 2, snake[0].y * unit + unit / 2);
        endShape();
    }

    // update game status all x frames as long as game not over
    let updateStep = parseInt(speedSlider.elt.max) + 1 - speedSlider.value();
    if (frameCount % updateStep === 0 && !gameOver && !gamePaused) {
        // move snake
        if (path.length > 0) {
            let pathTop = path.pop();
            dir = createVector(pathTop.x - snake[0].x, pathTop.y - snake[0].y);
            if (!(dir.x === 0 && abs(dir.y) === 1) && !(abs(dir.x) === 1 && dir.y === 0)) {
                gamePaused = true;
                console.error(`Invalid move (${dir.x}, ${dir.y})`);
            }
        }
        let newHead = createVector(snake[0].x + dir.x, snake[0].y + dir.y);
        snake.unshift(newHead);

        // check if food reached
        if (isEating()) {
            food = getAvailableSpot();
            score++;
        } else {
            snake.pop();
        }

        // check if game is over
        if (isGameOver()) {
            gameOver = true;
            resultP.elt.textContent = "AI lost!";
        } else if (isGameWon()) {
            gameOver = true;
            resultP.elt.textContent = "AI won!"
        } else {
            path = solver.getPath(snake, food);
        }
    }

    // display performance feedback
    let percent = (score / (cols * rows - 1) * 100).toFixed(2);
    scoreP.elt.textContent = `Score: ${score} (${percent}%)`;

}

function keyPressed() { // pause/ restart game
    if (keyCode === ENTER) {
        if (gameOver) {
            prepareGame();
        } else {
            gamePaused = !gamePaused;
        }
    }
}

function isGameOver() {
    let head = snake[0];
    let edgeCollision = head.x < 0 || head.x >= cols || head.y < 0 || head.y >= rows;

    let bodyCollision = false;
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            bodyCollision = true;
            break;
        }
    }
    return edgeCollision || bodyCollision;
}

function isGameWon() {
    return snake.length === cols * rows;
}

function getAvailableSpot() {
    // get all possible spots in the grid
    let spots = new Array();
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            let spotTaken = false;
            for (let k = 0; k < snake.length; k++) {
                if (snake[k].x === i && snake[k].y === j) {
                    spotTaken = true;
                    break;
                }
            }
            if (!spotTaken) {
                spots.push(createVector(i, j));
            }
        }
    }
    // choose random spot
    return random(spots);
}

function isEating() {
    let head = snake[0];
    return head.x === food.x && head.y === food.y;
}