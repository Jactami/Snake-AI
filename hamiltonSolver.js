class HamiltonSolver {

    constructor(cols, rows) {
        this.cols = cols;
        this.rows = rows;
        this.cycle;
        this.pivot;

        this.buildCycle();

        console.log("hamilton solver created.")
    }

    getPath(snake, food) {
        let head = snake[0];

        // check if head is on pivot point
        if (this.pivot) {
            if (head.x === this.pivot.x && head.y === this.pivot.y) {
                return [createVector(head.x - 1, head.y)];
            }
        }

        // place head at the beginning of cycle
        let idx;
        for (let i = 0; i < this.cycle.length; i++) {
            if (head.x === this.cycle[i].x && head.y === this.cycle[i].y) {
                idx = i;
                break;
            }
        }
        this.cycle = [...this.cycle.slice(idx, this.cycle.length), ...this.cycle.slice(0, idx)];

        // check if pivot has to be swapped
        if (this.pivot) {
            let pivotOffset = this.cycle.length - 2;
            if (dist(this.pivot.x, this.pivot.y, this.cycle[pivotOffset - 1].x, this.cycle[pivotOffset - 1].y) === 1 &&
                dist(this.pivot.x, this.pivot.y, this.cycle[pivotOffset + 1].x, this.cycle[pivotOffset + 1].y) === 1) {
                let temp = this.cycle[pivotOffset];
                this.cycle[pivotOffset] = this.pivot;
                this.pivot = temp;
            }
        }

        return this.cycle.slice();
    }

    buildCycle() {
        let minSize = min(this.cols, this.rows);
        let depth = (minSize % 2 === 0) ? minSize / 2 : (minSize - 1) / 2;
        let circuit;
        let outerCircle, innerCircle;

        for (let i = 0; i < depth; i++) {
            let even = i % 2 === 0;

            // calc corners of circle
            let left = depth - i - 1;
            let right = this.cols - depth + i;
            let top = depth - i - 1;
            let bottom = this.rows - depth + i;

            // build circle
            outerCircle = new Array();
            for (let j = 0; j < right - left; j++) {
                outerCircle.push(createVector(left + j, top));
            }
            for (let j = 0; j < bottom - top; j++) {
                outerCircle.push(createVector(right, top + j));
            }
            for (let j = 0; j < right - left; j++) {
                outerCircle.push(createVector(right - j, bottom));
            }
            for (let j = 0; j < bottom - top; j++) {
                outerCircle.push(createVector(left, bottom - j));
            }

            if (i === 0) {
                circuit = outerCircle;
                innerCircle = outerCircle;
                continue;
            }

            // choose connection nodes between circles
            let innerIdx = floor(innerCircle.length / 2);
            innerCircle = [...innerCircle.slice(innerIdx, innerCircle.length), ...innerCircle.slice(0, innerIdx)];

            // restructure cycle to place chosen node at the beginning
            let circuitIdx;
            if (even) {
                circuitIdx = circuit.length - 1;
            } else if (i === 1) {
                circuitIdx = circuit.length / 2;
            } else {
                circuitIdx = circuit.length - innerCircle.length + 1; // innerIdx * (i-1) + 2*i - 1
            }
            circuit = [...circuit.slice(circuitIdx, circuit.length), ...circuit.slice(0, circuitIdx)];

            // make outerCircle to innerCircle for next iteration
            innerCircle = outerCircle;

            // calc neighbors of chosen nodes
            let outerIdx = innerIdx + 3;
            outerCircle = [...outerCircle.slice(outerIdx, outerCircle.length), ...outerCircle.slice(0, outerIdx)];

            // change direction
            if (!even) {
                outerCircle.reverse();
            }

            // append circle
            circuit = [...circuit, ...outerCircle];
        }

        this.cycle = circuit;
        this.oddCorrection();
    }

    oddCorrection() {
        // minimum condition
        if (!this.cols || !this.rows || this.cols <= 2 || this.rows <= 2)
            return;

        // check if relevant side is even or odd
        if (this.cols > this.rows) {
            if (this.rows % 2 === 0)
                return;
        } else {
            if (this.cols % 2 === 0)
                return;
        }

        // calc unreached tiles
        let minSize = min(this.cols, this.rows);
        let maxSize = max(this.cols, this.rows);
        let diff = maxSize - minSize;
        let start = (maxSize - 1) / 2 - diff / 2;
        let end = (maxSize - 1) / 2 + diff / 2;
        let minIdx = floor(minSize / 2);

        // correct cycle to fill empty tiles
        let idx;
        for (let i = 0; i < this.cycle.length; i++) {
            if (minSize === this.cols) {
                if (this.cycle[i].x === minIdx - 1 && this.cycle[i].y === start) {
                    idx = i;
                    break;
                }
            } else if (this.cycle[i].x === start && this.cycle[i].y === minIdx + 1) {
                idx = i;
                break;
            }

        }

        for (let i = start; i < end; i += 2) {
            let vectorA, vectorB;
            if (minSize === this.cols) {
                vectorA = createVector(minIdx, i + 1);
                vectorB = createVector(minIdx, i);
            } else {
                vectorA = createVector(i + 1, minIdx);
                vectorB = createVector(i, minIdx);
            }

            this.cycle.splice(idx, 0, vectorA);
            this.cycle.splice(idx + 1, 0, vectorB);
            idx -= 2;
        }

        // do not calc pivot point if one size is even and the other one is odd
        if (this.cols % 2 === 0 || this.rows % 2 === 0) {
            this.pivot = null;
        } else if (minSize === this.cols) { // set pivot point
            this.pivot = createVector(minIdx, end);
        } else {
            this.pivot = createVector(end, minIdx);
        }

    }
}