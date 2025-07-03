export const underlyingPath = (height) => (_ref2) => {
	var bottomWidth = 0.5;
    var h = height;
	var x = _ref2.x, y = _ref2.y;

	return (
	  "M" +
	  x +
	  " " +
	  y +
	  " " +
	  ("L" + x + " " + y + " ") +
	  ("L" + (x + bottomWidth) + " " + y + " ") +
	  ("L" + (x + bottomWidth) + " " + (y - h) + " ") +
	  ("L" + (x - bottomWidth) + " " + (y - h) + " ") +
	  ("L" + (x - bottomWidth) + " " + y + " ") +
	  ("L" + x + " " + y + " ") +
	  "Z"
	);
}