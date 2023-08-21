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
addLineSensor(28, 0, 255, 255, 255); //12 line finding sensor
addLineSensor(6, -13, 255, 0, 255); //13 far left junction
addLineSensor(6, 13, 255, 0, 255); //14 far right junction
addLineSensor(5, 0, 255, 0, 255); //15 middleFwd

setColour("deepskyblue");
setThickness(13);
setTickRate(96);
stop = false;
insidePerimeter = false;
searchPattern = false;
perimeterFound = false;

var penCount = 2 //this is to prevent the bot from restarting the orange zone sequence, counts down after each pen use per zone

function isOrange() {
    var red = readSensor(6);
    var green = readSensor(7); 
	//found the original calculation would treat the red stop as orange so had to add a minimum green which greatly reduces false hits
    if (red > 0.4 && green < 0.9 * red && green > 0.2)  {
        return true;
    }
    else {
        return false;
    }
}

function isBlue() {
	//similar function for is orange, and helps the bot avoid if it encounters blue for zone entry and survivor 
    var blue = readSensor(10);
    var redgreen = readSensor(11);
    if (blue > 0.9 && redgreen < 0.4 * blue) {
		return true;
    }
    else {
        return false;
    }
}

function isOrangeExit() {
	//similar to isOrange but uses sensors further ahead to find orange zone boundary
    var red = readSensor(8);
    var green = readSensor(9);
    if (red > 0.4 && green < 0.9 * red && green > 0.2) {
        return true;
    }
    else {
        return false;
    }
}


function isSurvivor() {
	//isSurvivor code from assignment samples - nil changes
    var red = readSensor(6);
    var green = readSensor(7);
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
			//find edge
						
			if (!l && r){
				var rightOut = false
				//this loop finds the edge/boundary of the orange zone, then uses boundary high and low used to measure the boundary of the orange zone and maintain a line, approaching from the right until it finds the exit
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
			// makes pen count zero to prevent restarting orange zone
			var penCount = 0
            forward(25);
        }
		else if (isBlue()) {
			left(180);
		}
        else {
			//found that having only two values for left and right turns would lead the bot to get stuck in corners
			//made an array to select from three angles at random while still using the toggle
            const anglesArray = [120, 150, 220];
            var randomAngle = Math.floor(Math.random() * anglesArray.length);
            toggle = !toggle;
            if (toggle) {
                right(anglesArray[randomAngle]); 
            }
            else {
                left(anglesArray[randomAngle]); 
            }
        }
    }
}

function followPath() {
    while (!stop) {
		var l = (readSensor(0) > 0.71);// left seeing light - bumped up the value to make the path finding more rigid
        var r = (readSensor(1) > 0.71); // right seeing light
		var lHigh = readSensor(0) < 0.99; // left seeing light
        var rHigh = readSensor(1) < 0.99; // right seeing light
        var jLeft = readSensor(2) < 0.5; // if this goes dark, turn right
        var jRight = readSensor(3) < 0.5; // if this goes dark, turn right
		var jLeft1 = readSensor(2) > 0.85; // if this goes dark, turn right
        var jRight1 = readSensor(3) > 0.85; // if this goes dark, turn right
        var oSens1 = readSensor(6); //orange zone red
        var oSens2 = readSensor(7); // orange zone green
		var middleFarSens = readSensor(7) > 0.5; //further middle sensor looking for gaps
		var lineSens = readSensor(12) > 0.85; // detecting if the pathway line has been lost for other var/conditional comparisons
		var lFar = readSensor(13) < 0.68; // left - further sensors for middle and middleFar sensor comparison
        var rFar = readSensor(14) < 0.68; // right - further sensors for middle and middleFar sensor comparison
		var middleFwdSens = readSensor(15) > 0.8; //middle sensor looking for gaps

		stop = readSensor(4) > 0.69 && readSensor(5) < 0.12
		
		if (readSensor(4) > 0.69 && readSensor(5) < 0.12) {
			//the calculation has been identified within .1 of a decimal to get the exact red zone colour
			stop = true;
		}
        else if (l && r && !lineSens) {
			//added the linesens detection to help enforce else if conditions listed below
            forward(3);
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
			//green junction turns, added the opposite var for each condition to make them more explicit for turning
            if (jLeft && !jRight) {
                forward(1);
                left(9);
            }
            else if (jRight && !jLeft) {
                forward(1);
                right(9);
            }
            else if (oSens1 > 0.4 && oSens2 < 0.9 * oSens1 && oSens2 > 0.2) {
                //if pencount is 2, it is assumed the zone has not been encountered yet
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
				//pencount reset after exiting successfully
            }
			else if (middleFwdSens) {
				//condition to assist with navigating the segmented semi-circle paths
				if (lFar) {
					left(8);
				}			
				else if (rFar) {
					right(8);	
				}
				else {
					forward(1)
				}
			}
			else if (middleFarSens && !middleFwdSens) {
				//condition to navigate the zigzag, depending on the wobble this can go very smoothly/slowly
				if (lFar && !jRight1) {

					left(21);
					forward(0.01);
				}			
				else if (rFar && !jLeft1) {

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
