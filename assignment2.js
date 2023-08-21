addLineSensor(20, -6, 0, 255, 0); //0 left line sensor, green only
addLineSensor(20, 6, 0, 255, 0); //1 right line sensor, green only
addLineSensor(11, -10, 255, 0, 255); //2 left junction
addLineSensor(11, 10, 255, 0, 255); //3 right junction
addLineSensor(0, 0, 255, 0, 0); //4 stop sensor - red component
addLineSensor(0, 0, 0, 255, 255); //5 stop sensor - non-red component
addLineSensor(20, 0, 255, 0, 0); //6 orange sensor1 - red component
addLineSensor(20, 0, 0, 255, 0); //7 orange sensor2 - non-red component
addLineSensor(0, 0, 255, 0, 0); //8 orange sensor3 - red component
addLineSensor(0, 0, 0, 255, 0); //9 orange sensor4 - non-red component
addLineSensor(22, 0, 0, 0, 255); //10 blue sensor - blue component
addLineSensor(22, 0, 255, 255, 0); //11 blue sensor - non-blue component
addLineSensor(28, 0, 255, 255, 255); //12 line sensor
addLineSensor(6, -13, 255, 0, 255); //13 far left junction
addLineSensor(6, 13, 255, 0, 255); //14 far right junction
addLineSensor(5, 0, 255, 0, 255); //15 middleFwd
//console.log(readSensor(12))

setColour("deepskyblue");
setThickness(13);
setTickRate(96);
stop = false;
insidePerimeter = false;
searchPattern = false;
perimeterFound = false;

var penCount = 2

function isOrange() {
    var red = readSensor(6);
    var green = readSensor(7); // orange is more red than green
    if (red > 0.4 && green < 0.9 * red && green > 0.2)  {
        return true;
    }
    else {
        return false;
    }
}

function isBlue() {
    var blue = readSensor(10);
    var redgreen = readSensor(11);
    if (blue > 0.9 && redgreen < 0.4 * blue) {
        //console.log("blue is " + blue);
		//console.log("rg is " + redgreen);
		return true;
    }
    else {
        return false;
    }
}



function isOrangeExit() {
    var red = readSensor(8);
    var green = readSensor(9); // orange is more red than green
    if (red > 0.4 && green < 0.9 * red && green > 0.2) {
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
			if (isBlue()) {
			left(180);
			}
        }
        //console.log(oSens1);
        while (!lineFound) {
            var l = readSensor(0) > 0.96; // left seeing light
            var r = readSensor(1) > 0.96; // right seeing light
            var lineSens = readSensor(6) < 0.3;
            var boundaryLow = readSensor(6) > 0.93;
            var boundaryHigh = readSensor(7) < 0.96;
			//find direction to go
			
			if (l && !r) {
				//left outward
				console.log("left outward")
				var leftOut = false
				while (!leftOut) {
					var boundaryLow = readSensor(6) > 0.9;
					var boundaryHigh = readSensor(7) < 0.98;
					var l = readSensor(0) > 0.5; // left seeing light
					var r = readSensor(1) > 0.5; // right seeing light	

					if (boundaryLow && boundaryHigh) {
						forward(1);
					}
					else if (isBlue()) {
						forward(30)
					}
					else if (lineSens){
						console.log("found exit")
						right(30)
						forward(15)
						leftOut = true
					}
					else {
						if (!l) {
							left(4);
						}
						else if (r) {
							right(4);
						}

						else {
							forward(1)
						}
					}
				lineFound = true;
				}
			}
		
			
			if (!l && r){
				//right outward
				console.log("right outward")
				var rightOut = false
				while (!rightOut) {
					var boundaryLow = readSensor(6) > 0.9;
					var boundaryHigh = readSensor(7) < 0.97;
					var l = readSensor(0) > 0.53; // left seeing light
					var r = readSensor(1) > 0.53; // right seeing light
					var lineSens = readSensor(12) < 0.36; // seeing dark					
					if (boundaryLow && boundaryHigh) {
						forward(1);
					}
					else if (isBlue()) {
							forward(20)
					}
					else if (lineSens){
						console.log("found exit")
						forward(27);
						left(90);
						forward(5);
						rightOut = true
					}
					else {
						if (!r) {
							left(3);
							forward(0.1);
						}
						else if (l) {
							right(3);
							forward(0.1);
						}
						else {
							forward(0.3);
						}
					}
				lineFound = true;
				}
			
			}
		exitFound = true;
		}
	
	console.log("resuming course");
	}
}



function survivorSearch() {
    console.log("proceeding");
    var toggle = false;
	foundSurvivor = false;
    while (!foundSurvivor) {
        while (isOrange()) {
            forward(10);
        }
        if (isSurvivor()) {
            foundSurvivor = true;
            forward(20);
            penDown();
            forward(1);
			right(180);
            penUp();
			var penCount = 0
            forward(25);
        }
		else if (isBlue()) {
			left(180);
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

function linePresent(){
	
}


function followPath() {
    while (!stop) {
		var l = (readSensor(0) > 0.71);// left seeing light
        var r = (readSensor(1) > 0.71); // right seeing light
		var lHigh = readSensor(0) < 0.99; // left seeing light
        var rHigh = readSensor(1) < 0.99; // right seeing light
        var jLeft = readSensor(2) < 0.5; // if this goes dark, turn right
        var jRight = readSensor(3) < 0.5; // if this goes dark, turn right
		var jLeft1 = readSensor(2) > 0.85; // if this goes dark, turn right
        var jRight1 = readSensor(3) > 0.85; // if this goes dark, turn right
		var middleSens = readSensor(4) > 0.7; //middle sensor if total white
        var oSens1 = readSensor(6);
        var oSens2 = readSensor(7);
		var middleFarSens = readSensor(7) > 0.5;
		var lineSens = readSensor(12) > 0.85; // seeing light
		var lFar = readSensor(13) < 0.68; // left seeing light
        var rFar = readSensor(14) < 0.68; // right seeing light
		var middleFwdSens = readSensor(15) > 0.8; //middle sensor if total white
		//console.log("lineSens is " + readSensor(12) + " lFar is " + readSensor(13) + " rFar is " + readSensor(14))
		//console.log("linesense" + readSensor(12) + " rFar is " + readSensor(14))
		stop = readSensor(4) > 0.69 && readSensor(5) < 0.12
		
		if (readSensor(4) > 0.69 && readSensor(5) < 0.12) {
			stop = true;
		}
        else if (l && r && !lineSens) {
            forward(3);
			//console.log(l);
        }
        else if (l && !r) {
            right(4);
            forward(0.8);
        }
        else if (!l && r) {
            left(4);
            forward(0.8);
        }
        else {
            if (jLeft && !jRight) {
                forward(1);
                left(9); //console.log("found juncleft")
            }
            else if (jRight && !jLeft) {
                forward(1);
                right(9); //console.log("found juncright")
            }
            else if (oSens1 > 0.4 && oSens2 < 0.9 * oSens1 && oSens2 > 0.2) {
                //console.log("Found survivor Zone");
				if(penCount = 2) {
					penDown();
					forward(6);
					penUp();
					var penCount = 1
					right(15)
					forward(20);
					survivorSearch();
					survivorExit();
				}
				var penCount = 2
            }
			else if (middleFwdSens) {
				//console.log("middleSens trigger")
				if (lFar) {
					//console.log("lhighlfar trigger");
					left(8);
				}			
				else if (rFar) {
					//console.log("rhighrfar trigger");
					right(8);	
				}
				else {
					forward(1)
				}
			}
			else if (middleFarSens && !middleFwdSens) {
				//console.log("farSens trigger")
				if (lFar && !jRight1) {
					//console.log("lhighlfar trigger");
					left(21);
					forward(0.01);
				}			
				else if (rFar && !jLeft1) {
					//console.log("rhighrfar trigger");
					right(21);
					forward(0.01);
				}
				else {
					forward(0.3)
				}
			}
			else {
				forward(1);
			}
		}   
    }
}
followPath();
