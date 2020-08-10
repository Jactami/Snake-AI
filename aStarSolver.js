class AStarSolver {

    constructor(cols, rows) {
        this.cols = cols;
        this.rows = rows;
        console.log("A* solver created.")
    }

    getPath(snake, food) {
        // Strategy A: Go straight for food
        let head = snake[0];
        let graph = this.buildGraph(snake);
        let path = this.aStar(head, food, graph);

        if (path) { // food reachable
            console.log("A* to food");
            return path;
        }

        // Strategy B: stall by chasing own tail
        let idx = snake.length - 1;
        while (!path && idx > 0) {
            let tail = snake[idx];
            path = this.aStar(head, tail, graph);

            // path found and path to body part longer than rest of tail, so head can not bite tail
            if (path && path.length >= snake.length - idx) {
                console.log("A* to tail");
                return path;
            }
            idx--;
        }

        // Strategy C: Pray to RNGesus
        let neighbors = this.getNeighbors(head, graph);
        neighbors = neighbors.filter(neighbor => !neighbor.blocked);
        if (neighbors.length > 0) {
            console.log("neighbor pivoting");
            return new Array(random(neighbors));
        }

        // no path found
        return new Array();
    }

    buildGraph(snake) {
        let graph = new Array(this.cols);
        for (let i = 0; i < this.cols; i++) {
            graph[i] = new Array(this.rows);
            for (let j = 0; j < this.rows; j++) {

                let blocked = false;
                for (let s of snake) {
                    if (s.x === i && s.y === j) {
                        blocked = true;
                        break;
                    }
                }

                graph[i][j] = {
                    blocked: blocked,
                    x: i,
                    y: j,
                    f: Infinity,
                    g: Infinity,
                    previous: undefined
                };
            }
        }
        // mark tail as a free spot because it will move in the next iteration
        if (snake.length > 2) {
            let tail = snake[snake.length - 1];
            graph[tail.x][tail.y].blocked = false;
        }

        return graph;
    }

    aStar(start, goal, graph) {
        if (start.x < 0 || start.x >= this.cols || start.y < 0 || start.y >= this.rows ||
            goal.x < 0 || goal.x >= this.cols || goal.y < 0 || goal.y >= this.rows)
            return null;

        // make deep copy to prevent modifications of graph
        let graphCopy = new Array();
        for (let i = 0; i < graph.length; i++) {
            graphCopy[i] = new Array();
            for (let j = 0; j < graph[i].length; j++) {
                graphCopy[i][j] = {
                    ...graph[i][j]
                };
            }
        }

        // mark goal as free in case goal is part of body
        graphCopy[goal.x][goal.y].blocked = false;

        // define heuristic for distance between two nodes
        let heuristic = (nodeA, nodeB) => this.manhattenDist(nodeA, nodeB);

        // set of discovered nodes that may need to be (re-)expanded; initially only start node
        let openSet = new Array(graphCopy[start.x][start.y]);
        graphCopy[start.x][start.y].g = 0;
        graphCopy[start.x][start.y].f = heuristic(start, goal);

        while (openSet.length > 0) {
            // select node with lowest f 
            let currentIdx = 0;
            for (let i = 0; i < openSet.length; i++) {
                if (openSet[i].f < openSet[currentIdx].f) {
                    currentIdx = i;
                }
            }
            let current = openSet[currentIdx];

            if (current.x === goal.x && current.y === goal.y) {
                // goal reached; reconstruct path
                let path = new Array(current);
                while (current.previous) {
                    path.push(current.previous);
                    current = current.previous;
                }
                path.pop();
                return path;
            }

            // continue with neighbors that are not part of snake
            openSet.splice(currentIdx, 1);
            let neighbors = this.getNeighbors(current, graphCopy);
            neighbors = neighbors.filter(neighbor => !neighbor.blocked);
            for (let neighbor of neighbors) {
                // distance from start to the neighbor through current
                let tentativeG = current.g + 1;
                if (tentativeG < neighbor.g) {
                    // record this this path to neighbor as it is better than any previous one
                    neighbor.previous = current;
                    neighbor.g = tentativeG;
                    neighbor.f = neighbor.g + heuristic(neighbor, goal);
                    if (!openSet.includes(neighbor)) {
                        openSet.push(neighbor);
                    }
                }
            }
        }
        // openSet empty but goal was never reached
        return null;
    }

    getNeighbors(elem, graph) {
        let neighbors = new Array();

        if (elem.x > 0) {
            neighbors.push(graph[elem.x - 1][elem.y]);
        }
        if (elem.x < this.cols - 1) {
            neighbors.push(graph[elem.x + 1][elem.y]);
        }
        if (elem.y > 0) {
            neighbors.push(graph[elem.x][elem.y - 1]);
        }
        if (elem.y < this.rows - 1) {
            neighbors.push(graph[elem.x][elem.y + 1]);
        }

        return neighbors;
    }

    // heuristics for the distance between node A and B 
    euclidianDist(a, b) {
        return dist(a.x, a.y, b.x, b.y);
    }

    manhattenDist(a, b) {
        return abs(a.x - b.x) + abs(a.y - b.y);
    }
}