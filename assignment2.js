addLineSensor(20, -6, 0, 255, 0); //0 line sensor, green only
addLineSensor(20, 6, 0, 255, 0); //1 line sensor, green only
addLineSensor(8, -8, 255, 0, 255); //2 left junction
addLineSensor(8, 8, 255, 0, 255); //3 right junction
addLineSensor(0, 0, 255, 0, 0); //4 stop sensor - red component
addLineSensor(0, 0, 0, 255, 255); //5 stop sensor - non-red component
addLineSensor(20, 0, 255, 0, 0); //6 orange sensor1 - red component
addLineSensor(20, 0, 0, 255, 0); //7 orange sensor2 - non-red component
addLineSensor(0, 0, 255, 0, 0); //8 orange sensor3 - red component
addLineSensor(0, 0, 0, 255, 0); //9 orange sensor4 - non-red component
addLineSensor(20, 6, 255, 0, 0); //10 orange sensorRightHigh - red component
addLineSensor(20, 6, 0, 255, 0); //11 orange sensorRightLow - non-red component
addLineSensor(20, -6, 255, 0, 0); //12 orange sensorLeftHigh - red component
addLineSensor(20, -6, 0, 255, 0); //13 orange sensorleftLow - non-red component
setColour("blue");
setThickness(10);
setTickRate(96);
stop = false;
foundSurvivor = false;
insidePerimeter = false;
searchPattern = false;
perimeterFound = false;

function isOrange() {
    var red = readSensor(6);
    var green = readSensor(7); // orange is more red than green
    if (red > 0.4 && green < 0.9 * red) {
        return true;
    }
    else {
        return false;
    }
}

function isOrangeLeft() {
    var red1 = readSensor(12);
    var green1 = readSensor(13);
    var red2 = readSensor(10);
    var green2 = readSensor(11);
    var leftSens = red1 > 0.4 && green1 < 0.9 * red1;
    var rightSens = red2 > 0.4 && green2 < 0.9 * red2; // orange is more red than green
    if (leftSens && !rightSens) {
        return true;
    }
    else {
        return false;
    }
}

function isOrangeRight() {
    var red1 = readSensor(12);
    var green1 = readSensor(13);
    var red2 = readSensor(10);
    var green2 = readSensor(11);
    var leftSens = red1 > 0.4 && green1 < 0.9 * red1;
    var rightSens = red2 > 0.4 && green2 < 0.9 * red2; // orange is more red than green
    if (!leftSens && rightSens) {
        return true;
    }
    else {
        return false;
    }
}

function isOrangeExit() {
    var red = readSensor(8);
    var green = readSensor(9); // orange is more red than green
    if (red > 0.4 && green < 0.9 * red) {
        return true;
    }
    else {
        return false;
    }
}

function boxBoundary() {
    var l = readSensor(0) > 0.5; // left seeing light
    var r = readSensor(1) > 0.5; // right seeing light
    var red = readSensor(8);
    var green = readSensor(9);
    var boundaryLow = readSensor(6) > 0.93;
    var boundaryHigh = readSensor(7) === 0.96; // orange is more red than green
    if (boundaryLow && boundaryHigh) {
        return true;
    }
    else {
        return false;
    }
}

function isSurvivor() {
    var red = readSensor(6);
    var green = readSensor(7); // The survivor colour has a lot of green in it and not much red
    if (green > 0.4 && red < 0.9 * green) {
        return true;
    }
    else {
        return false;
    }
}

function survivorExit() {
    var exitFound = false;
    var lineFound = false;
    var boundaryFound = false;
    var l = readSensor(0) > 0.9; // left seeing light
    var r = readSensor(1) > 0.9; // right seeing light
    var oSens1 = readSensor(6);
    var oSens2 = readSensor(7);
    var lineSens = readSensor(6) < 0.3;
    var boundarySens = readSensor(7) > 0.5;
    while (!exitFound) {
        var oSens1 = readSensor(6);
        while (isOrangeExit()) {
            forward(10);
            console.log("finding boundary");
        }
        while (!isOrange()) {
            left(4);
            console.log("boundary found");
        }
        console.log(oSens1);
        while (!lineFound) {
            var l = readSensor(0) > 0.96; // left seeing light
            var r = readSensor(1) > 0.96; // right seeing light
            var lineSens = readSensor(6) < 0.3;
            var boundaryLow = readSensor(6) > 0.93;
            var boundaryHigh = readSensor(7) < 0.96; // console.log(readSensor(7))
            //console.log(boundarySens)
            if (isOrangeRight()) {
                var orangeRight = true;
				console.log("orange is on the right")
                while (orangeRight) {
                    var red2 = readSensor(10);
                    var green2 = readSensor(11);
                    var l = readSensor(0) > 0.96; // left seeing light
                    var rightSens = (red2 > 0.4) && (green2 < 0.9 * red2);
                    if (boxBoundary) {
                        forward(1);
                    }
                    else if(!rightSens && l && !boxBoundary)
                    {
                        right(4);
                        forward(1);
                    }
                    else if(rightSens && !l && !boxBoundary);
                    {
                        left(4);
                        forward(1);
                    }
                }
            }
            if (isOrangeLeft()) {
                var orangeLeft = true;
				console.log("orange is on the left")
                while (orangeLeft) {
                    var red1 = readSensor(12);
                    var green1 = readSensor(13);
                    var r = readSensor(1) > 0.96; // right seeing light
                    var leftSens = (red1 > 0.4) && (green1 < 0.9 * red1);
                    if (boxBoundary) {
                        forward(1);
                    }
                    else if(!leftSens && r && !boxBoundary)
                    {
                        left(4);
                        forward(1);
                    }
                    else if(leftSens && !r && !boxBoundary)
                    {
                        right(4);
                        forward(1);
                    }
                }
            }
        }
    }
}

function survivorSearch() { //penDown()
    console.log("proceeding");
    var toggle = false;
    while (!foundSurvivor) {
        while (isOrange()) {
            forward(10);
        }
        if (isSurvivor()) {
            foundSurvivor = true;
            forward(20);
            setColour("blue");
            penDown();
            forward(1);
            penUp();
            forward(35);
        }
        else {
            const anglesArray = [120, 150, 220];
            var randomAngle = Math.floor(Math.random() * anglesArray.length);
            toggle = !toggle;
            if (toggle) {
                right(anglesArray[randomAngle]); //console.log(anglesArray[randomAngle])
            }
            else {
                left(anglesArray[randomAngle]); //console.log(anglesArray[randomAngle])
            }
        }
    }
}

function findLine() {
    lineLost = true;
    var lTurnCount = 4;
    var rTurnCount = 10;
    println("Path Lost");
}

function followPath() {
    while (!stop) {
        var l = readSensor(0) > 0.5; // left seeing light
        var r = readSensor(1) > 0.5; // right seeing light
        var jLeft = readSensor(2) < 0.5; // if this goes dark, turn right
        var jRight = readSensor(3) < 0.5; // if this goes dark, turn right
        var oSens1 = readSensor(6);
        var oSens2 = readSensor(7);
        if (l && r) {
            forward(2);
        }
        else if (l && !r) {
            right(4);
            forward(1); //console.log("right")
        }
        else if (!l && r) {
            left(4);
            forward(1); //console.log("left")
        }
        else {
            if (jLeft) {
                forward(1);
                left(5); //console.log("found juncleft")
            }
            else if (jRight) {
                forward(1);
                right(5); //console.log("found juncright")
            }
            else if (oSens1 > 0.4 && oSens2 < 0.9 * oSens1) {
                console.log("Found survivor Zone");
                penDown();
                forward(3);
                left(15);
                forward(3);
                penUp();
                survivorSearch();
                survivorExit();
            }
            else {
                forward(1);
            }
        }
    }
}
followPath();
