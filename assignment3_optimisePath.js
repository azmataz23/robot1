//Assignment 3 - Aaron Davey

/* Here is my submission for assignment 3. The first few functions are from the turing tutorials (moving bumper etc)
My contribution to the code starts at the solveMaze function. There are a few new ones above that I will explain*/

/* solveMaze starts by checking if goalreached is false, running a while loop with the following
it obtains the current coordinates
then it marks the current coord as visited in the unvisitedgrid (false)
after that it sets an initial direction (adding 1 to the X axis to proceed right)
it firstly checks if the current coord matches the goal
next it checks if it can move into the targeted (next) coord
this uses the canMoveForward function which checks the coord against a number of conditions including,
whether its in the grid boundary
if that coord has been marked as wall (all are set to 'open' initially)
and if it is visited
if false then it goes to check the grid using findNextViableCoordinate
this looks in a series of directions on the grid then determines an open grid from there
if the above is not satisfied it then moves into the dead end handling logic,
first it sets deadEndCoord as the current coord
it then deletes this from the path set (pathSet determines the pathing for the return and finish)
it then produces an array from the pathset (pathStackFinal)
then it extracts the x and y coords needed and passes it to the nextX and nextY to move bumper out of the dead end
and continue on its journey
if goal reached is checked next, and this just checks if the deadEndCoord is still present within the array before it moves onto the final functions
after this, the next check is it the targeted next coord is indeed 'open', pushes the current coords into the pathset and
then performs a moveTo into the determined coord
after this solve maze updates the lastvisitedcoord with current

other functions are explained below*/

const numRows = 10;
const numCols = 10;
var collisionFlag = false;
let goalReached = false;
let homeReached = false;
let mazeSolved = false;
let goal = { x: 5, y: 5 };

let currentX = 0;
let currentY = 0;
let directionX = 1;
let directionY = 0;

grid = [];
unvisitedGrid = [];
var pathStackFinal = [];
var optimisedPath = [];
var pathSet = new Set();
reversePathStack = [];

for (let y = 0; y < 10; y++) {
  let row = [];
  let unvisitedRow = [];
  for (let x = 0; x < 10; x++) {
    row[x] = "open";
    unvisitedRow[x] = true;
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
    //additional logic added here to catch a collision detection and interrupt the moveTo process
    backOff();

    collisionFlag = true;
  }
  setLeftPower(0);
  setRightPower(0);
}

function moveTo(xTile, yTile) {
  collisionFlag = false;
  face(xTile, yTile);

  let dx = pixelLocation(xTile) - getX();
  let dy = pixelLocation(yTile) - getY();
  let distance = magnitude(dx, dy);

  forward(distance);
  if (collisionFlag) {
    //additional logic added here to catch a collision detection and interrupt the moveTo process
    grid[xTile][yTile] = "wall";

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
  let nextX = x + directionX; //looks at the targeted coord first then measures it against a set of conditions
  let nextY = y + directionY;

  if (
    nextX >= 0 && //boundary
    nextX < numCols && //boundary
    nextY >= 0 && //boundary
    nextY < numRows && //boundary
    grid[nextX][nextY] !== "wall" && //wall
    unvisitedGrid[nextX][nextY] //unvisited false
  ) {
    return true; //passes the coord onto MoveTo later
  } else {
    return false;
  }
}

function findNextViableCoordinate(x, y) {
  const directions = [
    //looks at the grid  for neighbouring coords that do not match the below conditions
    { dx: 1, dy: 0 }, // Right
    { dx: 0, dy: 1 }, // Down
    { dx: 0, dy: -1 }, // Up
    { dx: -1, dy: 0 }, // Left
  ];

  for (const dir of directions) {
    const nextX = x + dir.dx;
    const nextY = y + dir.dy;
    if (
      nextX >= 0 && //boundary
      nextX < numCols && //boundary
      nextY >= 0 && //boundary
      nextY < numRows && //boundary
      grid[nextX][nextY] !== "wall" && //wall
      unvisitedGrid[nextX][nextY] //unvisited false
    ) {
      return { x: nextX, y: nextY }; //passes the coord onto MoveTo later
    }
  }

  return null;
}

function solveMaze() {
  setLightColour("blue");

  pathSet = new Set();

  var deadEndCoord = null;
  while (!goalReached) {
    currentX = Math.floor(getX() / 64);
    currentY = Math.floor(getY() / 64);
    unvisitedGrid[currentX][currentY] = false;

    let nextX = currentX + directionX;
    let nextY = currentY + directionY;

    if (currentX === goal.x && currentY === goal.y) {
      goalReached = true;
    }

    if (!canMoveForward(currentX, currentY, directionX, directionY)) {
      const nextCoord = findNextViableCoordinate(currentX, currentY);
      if (nextCoord) {
        nextX = nextCoord.x;
        nextY = nextCoord.y;
      } else if (pathSet.size > 0) {
        deadEndCoord = `${currentX},${currentY}`;

        pathSet.delete(deadEndCoord);

        pathStackFinal = Array.from(pathSet);
        const secondLastCoordinate = pathStackFinal[pathStackFinal.length - 1];

        secondlastCoordX = secondLastCoordinate.substr(0, 1);
        secondlastCoordY = secondLastCoordinate.substr(2);

        nextX = secondlastCoordX;
        nextY = secondlastCoordY;
      } else {
        nextX = lastVisitedCoordinate.x;
        nextY = lastVisitedCoordinate.y;
      }
    }

    if (goalReached) {
      pathStackFinal = Array.from(pathSet);
      for (i = 0; i < pathStackFinal.length; i++) {
        if (pathStackFinal[i] === deadEndCoord) {
          pathStackFinal.splice(i, 1);
        }
      }
    }

    if (grid[nextX][nextY] === "open") {
      pathSet.add(`${currentX},${currentY}`);

      moveTo(nextX, nextY);
    }

    lastVisitedCoordinate = { x: currentX, y: currentY };
  }
}

function optimisePath() {
  const optimisedPath = [pathStackFinal[0]]; // Start with the first point
  let prevDirection = getDirection(optimisedPath[0], pathStackFinal[1]);

  for (let i = 1; i < pathStackFinal.length - 1; i++) {
    const currentPoint = pathStackFinal[i];
    const nextPoint = pathStackFinal[i + 1];
    const currentDirection = getDirection(currentPoint, nextPoint);

    if (currentDirection !== prevDirection) {
      optimisedPath.push(currentPoint);
      prevDirection = currentDirection;
    }
  }

  optimisedPath.push(pathStackFinal[pathStackFinal.length - 1]); // Add the last point
  return optimisedPath;
}

function getDirection(point1, point2) {
  // Calculate the direction from point1 to point2 (1: right, 2: down, 3: left, 4: up)
  if (point2.x > point1.x) {
    return 1;
  } else if (point2.y > point1.y) {
    return 2;
  } else if (point2.x < point1.x) {
    return 3;
  } else {
    return 4;
  }
}

function goHome() {
  //function to return home after solving the maze, this takes the 'pathStackFinal' and reverses it, then performs a for loop running through the pathStackFinal moveset
  setLightColour("red");
  reversePathStack = optimisedPath.reverse();
  while (!homeReached) {
    currentX = Math.floor(getX() / 64);
    currentY = Math.floor(getY() / 64);
    if (currentX === 0 && currentY === 0) {
      homeReached = true;
      break;
    }

    for (i = 0; i < reversePathStack.length; i++) {
      var homeCoordX = reversePathStack[i].substr(0, 1);
      var homeCoordY = reversePathStack[i].substr(2);
      let home = { x: homeCoordX, y: homeCoordY };
      moveTo(home.x, home.y);
    }
  }
}
//unfortunately for maze runner I was not able to create an optimised path that would remove all unnecessary waypoints for a speedy solve
//this was a problem due to the webworker seeminly appending async to all of the functions in the environment
//despite many attempts to use await and similar methods I was unable to get the program to wait for the stack to fully populate to perform the optimisation
// in time for the goHome and mazeRunner functions to use the newly optimised path
//however, console.table would print an optimised path afterwards, so this was disappointing. any feedback on how I could achieve it in this environment would be helpful!
function mazeRunner() {
  // similar function to return home after solving the maze, this takes the 'pathStackFinal' and reverses it again, then performs a for loop running through the pathStackFinal moveset
  setLightColour("green");
  runnerPath = optimisedPath.reverse(); //has to be reversed as doing this seems to alter pathStackFinal rather than just for the above instance
  runnerPath.push("5,5");
  while (!mazeSolved) {
    currentX = Math.floor(getX() / 64);
    currentY = Math.floor(getY() / 64);
    if (currentX === 5 && currentY === 5) {
      mazeSolved = true;
      break;
    }

    for (i = 0; i < runnerPath.length; i++) {
      var solveCoordX = runnerPath[i].substr(0, 1);
      var solveCoordY = runnerPath[i].substr(2);
      let solve = { x: solveCoordX, y: solveCoordY };
      moveTo(solve.x, solve.y);
    }
  }
}

solveMaze();
console.table(pathStackFinal);
optimisePath();
goHome();
mazeRunner();
