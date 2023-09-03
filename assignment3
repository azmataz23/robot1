const numRows = 10;
const numCols = 10;
var collisionFlag = false;
let goalReached = false;
let homeReached = false;
let goal = { x: 5, y: 5 }; // Use an object to represent the goal

let currentX = 0;
let currentY = 0;
let directionX = 1; // Initial direction along the X-axis
let directionY = 0; // Initial direction along the Y-axis

grid = [];
unvisitedGrid = []; // Added array to keep track of unvisited coordinates
let pathStackFinal = [];
var pathSet = new Set();
reversePathStack = [];

for (let y = 0; y < 10; y++) {
  let row = [];
  let unvisitedRow = []; // Initialize the unvisited grid
  for (let x = 0; x < 10; x++) {
    row[x] = "open"; // Use "open" for open coordinates
    unvisitedRow[x] = true; // Initialize the unvisited grid as true
  }
  grid[y] = row;
  unvisitedGrid[y] = unvisitedRow;
}

function turnTo(angle) {
  const epsilon = 0.01;
  let delta = 0;
  do {
    delta = angle - getHeading();
    if (Math.abs(delta) > epsilon) {
      let v = Math.min(1, Math.abs(delta));
      if (delta > 0) {
        setLeftPower(v);
        setRightPower(-v);
      } else {
        setLeftPower(-v);
        setRightPower(v);
      }
    } else {
      setLeftPower(0);
      setRightPower(0);
    }
  } while (Math.abs(delta) > epsilon || Math.abs(getAngularVelocity()) > 0.01);
}

function pixelLocation(tile) {
  return 32 + tile * 64;
}

function face(xTile, yTile) {
  let dx = pixelLocation(xTile) - getX();
  let dy = pixelLocation(yTile) - getY();

  let angle = Math.atan2(dy, dx);
  turnTo(angle);
}

function magnitude(x, y) {
  return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
}

function forward(distance) {
  clearCollision();
  const startX = getX();
  const startY = getY();
  const epsilon = 5;

  let travelled = 0;
  let delta = 0;
  let velocity = 0;
  do {
    travelled = magnitude(getX() - startX, getY() - startY);
    delta = distance - travelled;

    velocity = magnitude(getVelocityX(), getVelocityY());

    if (Math.abs(delta) > epsilon) {
      let v = Math.min(1, Math.abs(delta) / 50);
      if (delta > 0) {
        setLeftPower(v);
        setRightPower(v);
      } else {
        setLeftPower(-v);
        setRightPower(-v);
      }
    } else {
      setLeftPower(0);
      setRightPower(0);
    }
  } while (
    !isCollisionDetected() &&
    ((Math.abs(delta) > epsilon && !isCollisionDetected()) ||
      (Math.abs(velocity) > 0.1 && !isCollisionDetected()))
  );
  if (isCollisionDetected()) {
    backOff();
    // console.log("Collided with a wall");
    collisionFlag = true;
  }
  setLeftPower(0);
  setRightPower(0);
}

function moveTo(xTile, yTile) {
  collisionFlag = false;
  face(xTile, yTile);
  //   console.log(xTile + " " + yTile);
  let dx = pixelLocation(xTile) - getX();
  let dy = pixelLocation(yTile) - getY();
  let distance = magnitude(dx, dy);

  forward(distance);
  if (collisionFlag) {
    // console.log("Flag is " + collisionFlag);
    grid[xTile][yTile] = "wall"; // Mark the coordinate as a wall
    //console.table(grid);
    collisionFlag = false;
  }
}

function backOff(_xTile, _yTile) {
  const d = 5;
  const startX = getX();
  const startY = getY();
  let travelled = 0;
  do {
    travelled = magnitude(getX() - startX, getY() - startY);
    if (travelled < d) {
      setLeftPower(-0.2);
      setRightPower(-0.2);
    }
  } while (travelled < d);
  setLeftPower(0);
  setRightPower(0);
}

function canMoveForward(x, y) {
  // Calculate the next grid coordinate without modifying the current position
  let nextX = x + directionX;
  let nextY = y + directionY;

  // Check if the next square is within bounds and not marked as a wall
  if (
    nextX >= 0 &&
    nextX < numCols &&
    nextY >= 0 &&
    nextY < numRows &&
    grid[nextX][nextY] !== "wall" && // Use "wall" for blocked coordinates
    unvisitedGrid[nextX][nextY] // Check if the coordinate is unvisited
  ) {
    return true; // The robot can move forward
  } else {
    return false; // The robot cannot move forward
  }
}

function findNextViableCoordinate(x, y) {
  const directions = [
    { dx: 1, dy: 0 }, // Right
    { dx: 0, dy: 1 }, // Down
    { dx: 0, dy: -1 }, // Up
    { dx: -1, dy: 0 }, // Left
  ];

  for (const dir of directions) {
    const nextX = x + dir.dx;
    const nextY = y + dir.dy;
    if (
      nextX >= 0 &&
      nextX < numCols &&
      nextY >= 0 &&
      nextY < numRows &&
      grid[nextX][nextY] !== "wall" &&
      unvisitedGrid[nextX][nextY]
    ) {
      return { x: nextX, y: nextY };
    }
  }

  return null; // No viable coordinate found in any direction
}

function solveMaze() {
  setLightColour("blue");
  // Initialize variables
  pathSet = new Set();
  //pathStackFinal = Array.from(pathSet);
  var deadEndCoord = null;
  while (!goalReached) {
    // Mark the current square as visited
    currentX = Math.floor(getX() / 64); // Convert to grid coordinates
    currentY = Math.floor(getY() / 64); // Convert to grid coordinates
    unvisitedGrid[currentX][currentY] = false; // Mark the coordinate as visited

    // Calculate the next grid coordinate
    let nextX = currentX + directionX;
    let nextY = currentY + directionY;

    if (currentX === goal.x && currentY === goal.y) {
      // Goal reached, set goalReached to true and exit the loop
      goalReached = true;
    }

    // Check if we can move to the next coordinate, or find the next viable coordinate
    if (!canMoveForward(currentX, currentY, directionX, directionY)) {
      const nextCoord = findNextViableCoordinate(currentX, currentY);
      if (nextCoord) {
        nextX = nextCoord.x;
        nextY = nextCoord.y;
      } else if (pathSet.size > 0) {
        // Dead end reached, backtrack to the last visited coordinate
        deadEndCoord = `${currentX},${currentY}`;
        println(pathSet.has(deadEndCoord));
        pathSet.delete(deadEndCoord);
        println(pathSet.has(deadEndCoord));
        //const deadEndCoord = pathStackFinal.pop();
        pathStackFinal = Array.from(pathSet);
        const secondLastCoordinate = pathStackFinal[pathStackFinal.length - 1];

        secondlastCoordX = secondLastCoordinate.substr(0, 1);
        secondlastCoordY = secondLastCoordinate.substr(2);

        nextX = secondlastCoordX;
        nextY = secondlastCoordY;
      } else {
        // No viable coordinate found, backtrack to the last visited coordinate
        nextX = lastVisitedCoordinate.x;
        nextY = lastVisitedCoordinate.y;
      }
    }

    // Add the current coordinate to the Set (this will automatically remove duplicates)

    if (goalReached) {
      pathStackFinal = Array.from(pathSet);
      for (i = 0; i < pathStackFinal.length; i++) {
        //println(pathStackFinal[i]);
        if (pathStackFinal[i] === deadEndCoord) {
          //println("Removing deadEndCoord from pathStackFinal");
          pathStackFinal.splice(i, 1);
        }
      }
      //println("Path Set");
      //println(pathStackFinal);
    }

    // Check if the next coordinate is open before moving
    if (grid[nextX][nextY] === "open") {
      // Move to the next coordinate
      pathSet.add(`${currentX},${currentY}`);
      //pathStackFinal = Array.from(pathSet);
      moveTo(nextX, nextY);
    }

    // Update the last visited coordinate
    lastVisitedCoordinate = { x: currentX, y: currentY };
  }
  //pathStackFinal = Array.from(pathSet);
  // After the loop, remove deadEndCoord from pathStackFinal if goalReached
}

function goHome() {
  setLightColour("red");
  reversePathStack = pathStackFinal.reverse();
  while (!homeReached) {
    currentX = Math.floor(getX() / 64); // Convert to grid coordinates
    currentY = Math.floor(getY() / 64); // Convert to grid coordinates
    if (currentX === 0 && currentY === 0) {
      // Goal reached, set goalReached to true and exit the loop
      homeReached = true;
      break;
    }

    //console.table(reversePathStack);
    for (i = 0; i < reversePathStack.length; i++) {
      var homeCoordX = reversePathStack[i].substr(0, 1);
      var homeCoordY = reversePathStack[i].substr(2);
      let home = { x: homeCoordX, y: homeCoordY };
      println(home.x + " " + home.y);
      moveTo(home.x, home.y);
    }
  }
}

// Start solving the maze
solveMaze();
goHome();
