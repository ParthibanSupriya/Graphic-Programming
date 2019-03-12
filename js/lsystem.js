// Check if a given symbol is a digit
function isDigit(input) {
    var digits = "0123456789";
    return (input.length == 1 && digits.indexOf(input) >= 0);
}

// Get the next number from the string and return
// the next position following the number
function getNumberFromString(string, index) {
    // Get the number
    var number = "";
    while (index < string.length && isDigit(string[index])) {
        number = number + string[index];
        index++;
    }

    // If there is no number to read, the returned number will be NaN
    return { number: parseInt(number), next: index };
}

// Draw the tree given the settings in the system
function drawTree() {
    // Get the L-system parameters
    var start = $("#lsystem-start").val().trim();
    var iterations = parseInt($("#lsystem-iterations").val());
    var length = parseFloat($("#lsystem-length").val());
    var angle = parseFloat($("#lsystem-angle").val());
    var width = parseFloat($("#lsystem-width").val());
    var lengthRatio = parseFloat($("#length-ratio").val());
    var widthRatio = parseFloat($("#width-ratio").val());

    // Create the rules
    var rules = {};
    for (var i = 1; i <= 5; i++) {
        if ($("#lsystem-rule-symbol-" + i).length > 0) {
            var symbol = $("#lsystem-rule-symbol-" + i).val().trim();
            var replacement = $("#lsystem-rule-replacement-" + i).val().trim();

            if (symbol != "" && replacement != "")
                rules[symbol] = replacement;
        }
    }

    // Create the colours
    var colors = {};
    for (var i = 1; i <= 5; i++) {
        if ($("#lsystem-color-symbol-" + i).length > 0) {
            var symbol = $("#lsystem-color-symbol-" + i).val().trim();
            var color = $("#lsystem-color-color-" + i).val().trim();

            if (symbol != "") colors[symbol] = color;
        }
    }

    // Reset the tree area
    turtle.reset();

    // Go to the starting position
    /**
     * TODO: You may adjust the starting position depending
     *       on the positioning of your grass texture
     **/
    turtle.up();
    turtle.goto(250, 405);
    turtle.left(90);
    turtle.down();

    // Run the L-system
    var string = runLSystem(start, rules, iterations);

    // Put the result string in the right place
    $("#lsystem-result-string").val(string);

    // Draw the final string
    drawLSystem(turtle, string, length, angle, width,
                lengthRatio, widthRatio, colors);
}

// Run the L-system to get the final L-system string
function runLSystem(start, rules, iterations) {
    var string = start;

    // Run the L-system for the specified iterations
    for (var i = 0; i < iterations; i++) {
        var result = "";

        for (var j = 0; j < string.length; j++) {
            // The letter/symbol to be replaced
            var symbol = string[j];

            /**
             * TODO: You need to extract the associated depth number,
             *       if there is one, next to the current symbol
             **/
			var depth = getNumberFromString(string, j+1);
			var pos=0;
			if (!isNaN(depth.number)) {
				pos = depth.number;
				
			}

            // Assume the replacement is the letter/symbol itself
            var replacement = symbol;

            /**
             * TODO: The above replacement *may* have a depth value
             **/

            // Update the replacement is the letter/symbol is in the rule
            if (symbol in rules) {
				j = depth.next-1;
                replacement = rules[symbol];
				var tmp = "";
				for(var s=0; s < replacement.length-1; s++) {
					var no = getNumberFromString(replacement, s+1);
					if (!isNaN(no.number)) {
						if (pos == 0) {
							tmp = tmp + replacement[s]+"0";
						} else {
							tmp = tmp + replacement[s]+(no.number+pos);
						}
						s = no.next-1;
					} else {
						tmp = tmp + replacement[s];
					}
				}
				if(isNaN(parseInt(replacement[replacement.length-1])))
					tmp = tmp + replacement[replacement.length-1];
				replacement = tmp;

                /**
                 * TODO: Any increment inside the replacement has to be adjusted
                 *       using the depth number of the current symbol
                 **/
            }

            // Add the replacement at the end of the result string
            result = result + replacement;
        }
        string = result;
    }

    return string;
}

// Draw the L-system string using the turtle
function drawLSystem(turtle, string, length, angle, width,
                     lengthRatio, widthRatio, colors) {
    /**
     * TODO: You need to prepare a stack data structure
     *       before drawing the L-system image
     **/
	var stack_pos1 = [];
	var stack_pos2 = [];
	var stack_dir = [];
    for (var i = 0; i < string.length; i++) {
        // The letter/symbol to be handled
        var symbol = string[i];

        /**
         * TODO: You need to extract the associated depth number,
         *       if there is one, next to the current symbol
         **/
		var depth = getNumberFromString(string, i+1);
		var pos=0;
		if (!isNaN(depth.number)) {
			pos = depth.number;
			i = depth.next-1;
		}
        // Move and draw forward
        if ("ABCDEF".indexOf(symbol) >= 0) {
            /**
             * TODO: The colour, width and length can all be different
             *       depending on the L-system settings
             **/
			if (symbol in colors) {
				turtle.color(colors[symbol]);
			} else {
				turtle.color("black");
			}

            turtle.width(width* Math.pow(widthRatio, pos));
            turtle.forward(length* Math.pow(lengthRatio, pos));
        }
        // Move forward without drawing
        else if ("GHIJKL".indexOf(symbol) >= 0) {
            /**
             * TODO: The length can be different depending
             *       on the L-system settings
             **/

            turtle.up();
            turtle.forward(length* Math.pow(lengthRatio, pos));
            turtle.down();
        }
        // Turn left
        else if (symbol == "+") {
            turtle.left(angle);
        }
        // Turn right
        else if (symbol == "-") {
            turtle.right(angle);
        }  else if (symbol == "[") {
			stack_pos1.push(turtle.pos()[0]);
			stack_pos2.push(turtle.pos()[1]);
			stack_dir.push(turtle.heading());
			
		} else if (symbol == "]") {
			turtle.up();
			turtle.goto(stack_pos1.pop(), stack_pos2.pop());
			turtle.setHeading(stack_dir.pop());
			turtle.down();
		}

        /**
         * TODO: You need to extend the above if statement
         *       to include the stack symbols [ and ]
         **/
    }
}
