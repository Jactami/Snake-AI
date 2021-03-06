class FastHamilton extends HamiltonSolver {

    constructor(cols, rows) {
        super(cols, rows);

        console.clear();
        console.log("fast hamilton solver created.")
    }

    getPath(snake, food) {
        let path = super.getPath(snake, food);
        let shortcut = this.getShortcut(snake, food, this.cycle);

        if (shortcut) {
            return shortcut;
        } else {
            return path;
        }
    }

    getShortcut(snake, food, course) {
        course = course.slice().reverse();
        let shortcuts = [];
        let head = snake[0];
        for (let i = course.length - 3; i > 0; i--) {
            // search neighbor
            if (dist(head.x, head.y, course[i].x, course[i].y) === 1) {
                let shortcut = course.slice();
                shortcut.splice(0, i);

                // discard shortcut if no length advantage
                if (shortcut.length === course.length)
                    continue;

                // discard shortcut if food is not included
                let foodIdx = -1;
                for (let j = 0; j < shortcut.length; j++) {
                    if (shortcut[j].x === food.x && shortcut[j].y === food.y) {
                        foodIdx = j;
                        break;
                    }
                }
                if (foodIdx < 0)
                    continue;

                // discard (potentially) too short shortcuts
                let isTooShort;
                let tail = snake[snake.length - 1];
                for (let j = 0; j < shortcut.length && isTooShort === undefined; j++) {
                    let spot = shortcut[j];
                    for (let k = snake.length - 1; k >= 0; k--) {
                        if (spot.x === snake[k].x && spot.y === snake[k].y) {
                            // check if first collision with body part is the tail end
                            if (spot.x === tail.x && spot.y === tail.y) {
                                isTooShort = false;
                            } else {
                                isTooShort = true;
                            }
                            break;
                        }
                    }
                }
                if (isTooShort)
                    continue;

                // shortcut accepted
                shortcuts.push(shortcut.reverse());
            }
        }

        // return shortest shortcut
        let minShortcut;
        let minSize = Infinity;
        for (let s of shortcuts) {
            if (s.length < minSize) {
                minSize = s.length;
                minShortcut = s;
            }
        }
        return minShortcut;
    }

    getNeighbors(elem, graph) {
        let shortcut = graph.slice();
        let neighbors = new Array();

        let elemIdx = -1;
        for (let i = 0; i < shortcut.length; i++) {
            if (shortcut[i].x === elem.x && shortcut[i].y === elem.y) {
                elemIdx = i;
                break;
            }
        }

        if (elemIdx >= 0) {
            shortcut = [...shortcut.slice(elemIdx, shortcut.length), ...shortcut.slice(0, elemIdx)];

            for (let i = 2; i < shortcut.length; i++) {
                if (dist(elem.x, elem.y, shortcut[i].x, shortcut[i].y) === 1) {
                    neighbors.push(shortcut[i]);
                }
            }
        }
        return neighbors;
    }
}