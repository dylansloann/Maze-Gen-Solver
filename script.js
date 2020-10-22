// assigning intial variables

// utilizes p5.js library

var maze_grid = [];

var columns;
var rows; 

var sing_width;
var maze_size;

var maze_stack = [];
var path_stack = [];

var current_unit;
var path_iteration;

var complete = false;
var complete_path = false;

let img;

function preload() {
	img = loadImage('assets/ghost.png');
	img2 = loadImage('assets/pacman.png');
}

// Provides setup of base canvas
function setup() {
	createCanvas(500, 500);
	frameRate(40);
	sing_width = 20;

	columns = width / sing_width;
	rows = height / sing_width;
	columns = floor(columns);
	rows = floor(rows);

	for (let j = 0; j < rows; j++) {
		for (let i = 0; i < columns; i++) {
			let unit = new Unit(i, j);
			maze_grid.push(unit);
		}
	}
	
	// sets up first position for both generation and path finding
	current_unit = maze_grid[0];
	path_iteration = maze_grid[0];
}



function Unit(x, y) {
	// sets of bool values for determining next units and removing sides
	this.sides = [true, true, true, true];
	this.visited = false;
	this.pathvisit = false;

	this.x = x;
	this.y = y;

	// sets up drawing of maze grid lines
	this.displayGrid = function() {
		let x_pos = this.x * sing_width;
		let y_pos = this.y * sing_width;
		stroke(255);

		// places line for bool index of sides array
		// places line for top side of grid
		if (this.sides[0]) {
			line(x_pos, y_pos, x_pos + sing_width, y_pos);
		}
		// places line for right side of grid
		if (this.sides[1]) {
			line(x_pos + sing_width, y_pos, x_pos + sing_width, y_pos + sing_width);
		}
		// places line for bottom side of grid
		if (this.sides[2]) {
			line(x_pos + sing_width, y_pos + sing_width, x_pos, y_pos + sing_width);
		}
		// places line for left side of grid
		if (this.sides[3]) {
			line(x_pos, y_pos + sing_width, x_pos, y_pos);
		}
		// sets up colorization of already visited units
		if (this.visited) {
			noStroke();
			fill(14, 183, 189, 41);
			rect(x_pos, y_pos, sing_width, sing_width);
		}
	};

	// provides marker for current prosition
	this.mark = function() {
		let x_pos = sing_width * this.x;
		let y_pos = sing_width * this.y;
		image(img2, x_pos, y_pos, img.width = sing_width, img.height = sing_width)
	};

	// provides marker for solving of path
	this.marksolve = function() {
		let x_pos = sing_width * this.x;
		let y_pos = sing_width * this.y;
		image(img, x_pos, y_pos, img.width = sing_width, img.height = sing_width)
	};

	// provides marker for final path
	this.markfinalsolve = function() {
		let x_pos = sing_width * this.x;
		let y_pos = sing_width * this.y;
		noStroke();
		fill(190, 224, 188);
		circle(x_pos + sing_width/2, y_pos + sing_width/2, sing_width/3);
	};

	// provides marker for backtracking out nodes in the path
	this.markbacktrack = function() {
		let x_pos = sing_width * this.x;
		let y_pos = sing_width * this.y;
		noStroke();
		fill(14, 183, 189, 41);
		rect(x_pos, y_pos, sing_width, sing_width);
	};

	// provides marker for endings in path
	this.markendings = function() {
		let x_pos = sing_width * this.x;
		let y_pos = sing_width * this.y;
		noStroke();
		fill(110, 18, 21);
		rect(x_pos, y_pos, sing_width, sing_width);
	};

	 // finds surrounding units
	this.findAdjcent = function() {
		// obtains sides surrounding current Unit that are valid
		let top = maze_grid[placement(x, y - 1)];
		let right = maze_grid[placement(x + 1, y)];
		let bottom = maze_grid[placement(x, y + 1)];
		let left = maze_grid[placement(x - 1, y)];

		// sets up stack for adjecent sides
		let adj_cells = [];

		// adds valid units to surrounding units stack
		// if the top unit exist and is not visited
		if (top && top.visited == false) {
			adj_cells.push(top);
		}
		// if the right side exist and is not visited
		if (right && right.visited == false) {
			adj_cells.push(right);
		}
		// if the bottom side exist and is not visited
		if (bottom && bottom.visited == false) {
			adj_cells.push(bottom);
		}
		// if the left side exist and is not visited
		if (left && left.visited == false) {
			adj_cells.push(left);
		}

		// picks random side for next iteration of the maze generation
		return randomizer(adj_cells);
	};

	this.findAdjcentPath = function() {
		// obtains sides surrounding current Unit that are valid
		let top = maze_grid[placement(x, y - 1)];
		let right = maze_grid[placement(x + 1, y)];
		let bottom = maze_grid[placement(x, y + 1)];
		let left = maze_grid[placement(x - 1, y)];

		// sets up stack for adjecent sides
		let adj_path = [];

		// adds valid units to surrounding units stack
		// if the top side exist and is does not already have a barrier inbetween and is not visited by path finder
		if (top && top.sides[2] == false && top.pathvisit == false) {
			adj_path.push(top);
		}
		// if the right side exist and is does not already have a barrier inbetween and is not visited by path finder
		if (right && right.sides[3] == false && right.pathvisit == false) {
			adj_path.push(right);
		}
		// if the bottom side exist and is does not already have a barrier inbetween and is not visited by path finder
		if (bottom && bottom.sides[0] == false && bottom.pathvisit == false) {
			adj_path.push(bottom);
		}
		// if the left side exist and is does not already have a barrier inbetween and is not visited by path finder
		if (left && left.sides[1] == false && left.pathvisit == false) {
			adj_path.push(left);
		}

		// picks random side for next iteration of the maze generation
		return randomizer(adj_path);
	};
}



// removes line between units for generation
function clearSide(first_unit, foll_unit) {
	let line_horz = first_unit.x - foll_unit.x;
	let line_lin = first_unit.y - foll_unit.y;

	// covers clearing for top and bottom side lines
	// removes right side of first unit and left side of the following unit
	if (line_horz == 1) {
		first_unit.sides[3] = false;
		foll_unit.sides[1] = false;
	// removes left side of first unit and right side of the following unit
	} else if (line_horz == -1) {
		first_unit.sides[1] = false;
		foll_unit.sides[3] = false;
	}

	// covers clearing for left and right side lines
	// removes top side of first unit and bottom side of the following unit
	if (line_lin == 1) {
		first_unit.sides[0] = false;
		foll_unit.sides[2] = false;
	// removes bottom side of first unit and top side of the following unit
	} else if (line_lin == -1) {
		first_unit.sides[2] = false;
		foll_unit.sides[0] = false;
	}
}




// performing all primary drawing for units, grid, removing sides, etc.
function draw() {
	background(53, 74, 35);
	for (let i = 0; i < maze_grid.length; i++) {
		maze_grid[i].displayGrid();
	}

	let following_unit = current_unit.findAdjcent();

	current_unit.visited = true;
	// console.log(current_unit);

	if (complete == false) {
		current_unit.mark();
		if (following_unit) {
			// pushes current Unit to the stack for backtracking
			maze_stack.push(current_unit);
			clearSide(current_unit, following_unit);

			// sets the current Unit to the following Unit in iteration
			following_unit.visited = true;
			current_unit = following_unit;
		// if no adjcent cells available then will pop "backtrack" until one becomes avaiable
		} else if (maze_stack.length > 0) {
			current_unit = maze_stack.pop();
		}
	}

	determineComplete(maze_stack);

	// displays final path
	if (complete_path == true) {
		displayPath(path_stack)
	}

	// starts path finding process
	if (complete == true) {
		path_iteration.pathvisit = true;
		path_iteration.marksolve();

		var following_path = path_iteration.findAdjcentPath();
		if(following_path) {
			// pushes current path to the stack for backtracking
		 	path_stack.push(path_iteration);

		 	// sets the current path to the following path in iteration
		 	following_path.pathvisit = true;
		 	path_iteration = following_path;
		 } else if(path_stack.length > 0 ) {
		 	path_iteration = path_stack.pop();
		 	path_iteration.markbacktrack();
		 }
	}
}


// determines if maze has finishded generating and if the path finder has reached end
const determineComplete = (stack) => {
	if (path_iteration.y == rows - 1 && path_iteration.x == columns - 1) {
		complete_path = true;
		noLoop();
	}
	if (stack.length == 0) {
		complete = true;
	}
};



// determines if Unit is in range of grid & returns correct placement if valid
const placement = (a_ind, b_ind) => {
	if (a_ind < 0 || b_ind < 0 || a_ind > columns - 1 || b_ind > rows - 1) {
		return undefined;
	} else {
		return a_ind + b_ind * columns;
	}
};

// random choice of adjecent wall for either gen stack or path stack
const randomizer = (adjstack) => {
	if (adjstack.length > 0) {
		let next_num = random(0, adjstack.length);
		next_num = floor(next_num)
		return adjstack[next_num];
	} else {
		return undefined;
	}
};

// setup for displaying final path
const displayPath = (stack) => {
	for(let index = 0; index < stack.length; index++) {
		stack[index].markfinalsolve();
		stack[0].markendings();
		stack[0].markfinalsolve();
		path_iteration.markendings();
	}
};
