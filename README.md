# Snake AI
An AI playing the famous game _Snake_ in JavaScript using [p5.js](https://p5js.org/).

## How does the AI work?
The AI features two different strategies. The first one is capable of fully clearing the board, but opperates very slowly, whereas the second one is by far faster, but not nearly as effective.

### Shortest Path
In the latter approach the AI follwos the shortest path to the food. If this is not possible, i.e. the snake is blocking the food off with its own body, the AI tries to stall by chasing the tail of the snake until the food is eventually reachable. In both cases the calculation of the path is based on the A* algorithm which enables a rapid computation. However, ultimately this concept proved to be rather disappointing because the lack of long term planning led to overall poor results.

### Hamiltonian Cycle 
A more promising approach arises from the idea to create a round trip from the head of the snake to its tail visiting each tile exactly once. This concept is also referred to as a _Hamiltionian Cycle_. The calculation of such a cycle is usually NP-complete and thus impracticable, but due to the grid structure of the board the path can efficiently calculated once before the beginning of the game. The only exeption is a odd number of columns and rows. In this case it is impossible to calculate a cycle that contains each tile only once. Therefore the algorithm contains a pivot tile which is swapped with a tile from the path after each pass. In this approach the AI is not aiming for the food, but rather tries to stay alive and pick up the foo on the fly if possible. As a result the AI always accomplishes to beat the game, yet as a downside it takes quite some time.

For this reason the projects also features a mutation of the aforementioned Hamilton solver. This algorithm searches for shortcuts in the Hamiltonian cycle which do not interfere with body parts of the snake. Therefore the temporal performance is remarkably sped up.