/* Source: https://bl.ocks.org/Jverma/076377dd0125b1a508621441752735fc
Cereal Nutrition Comparison Tool - This scatterplot will let you choose nutrition variable and compare with
another nutrition variable.
*/

var margin = { top: 30, right: 20, bottom: 30, left: 40 },
	width = 960 - margin.left - margin.right,
	height = 500 - margin.top - margin.bottom;

var svg = d3
	.select("body")
	.append("svg")
	.attr("width", width + 100 + margin.left + margin.right) // Changed width of SVG to allow rectangular legend symbols
	.attr("height", height + margin.top + margin.bottom)
	.append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var xLabel = "Potassium";
var yLabel = "Sugars";

/* The API for scales have changed in v4. There is a separate module d3-scale which can be used instead. 
   The main change here is instead of d3.scale.linear, we have d3.scaleLinear. 
*/
var xScale = d3.scaleLinear().range([0, width]);
var yScale = d3.scaleLinear().range([height, 0]);

/* The axes are much cleaner and easier now. No need to rotate and orient the axis, 
   just call axisBottom, axisLeft etc.
*/
var xAxis = d3.axisBottom().scale(xScale);
var yAxis = d3.axisLeft().scale(yScale);

/*
   Value accessor - returns the value to encode for a given data object.
   scale - maps value to a visual display encoding, such as a pixel position.
   map function - maps from data value to display value
   axis - sets up axis
 */
var xValue = function (d) {
	return +d[xLabel];
}; //Data -> value
var yValue = function (d) {
	return +d[yLabel];
}; //Data -> value
var xMap = function (d) {
	return xScale(xValue(d));
}; //value -> display
var yMap = function (d) {
	return yScale(yValue(d));
}; // Value -> display

var cValue = function (d) {
	return d.Manufacturer;
}; // Changed to return Manufacturer name
var color = d3.scaleOrdinal(d3.schemeCategory20); // Setup fill color

// Add tooltip area to webpage
var tooltip = d3
	.select("#plot")
	.append("div")
	.attr("class", "tooltip")
	.style("opacity", 0);

var cerealData = []; //Initialize array

// Load a1-cereals.csv data file
d3.csv("data/a1-cereals.csv", function (error, data) {
	xScale.domain(d3.extent(data, xValue)).nice(); //d3.extent returns min and max values in array
	yScale.domain(d3.extent(data, yValue)).nice();
	cerealData = data;

	/*
           adding axes is also simpler now, just translate x-axis to (0,height)
           and it's already defined to be a bottom axis.
         */
	//x-axis
	svg
		.append("g")
		.attr("transform", "translate(0," + height + ")")
		.attr("class", "x axis")
		.call(xAxis);

	// y-axis is translated to (0,0)
	svg
		.append("g")
		.attr("transform", "translate(0,0)")
		.attr("class", "y axis")
		.call(yAxis);

	// Draw bubbles
	var bubble = svg
		.selectAll(".bubble")
		.data(data)
		.enter()
		.append("circle")
		.attr("class", function (d) {
			return "bubble" + " circle_" + cValue(d); // Delineates the bubbles into separate Manufacturers
		})
		.attr("cx", xMap)
		.attr("cy", yMap)
		.attr("r", 5)
		.style("fill", function (d) {
			return color(cValue(d));
		})
		// Shows tooltip of cereal name and x,y values
		.on("mouseover", function (d) {
			tooltip.transition().duration(200).style("opacity", 0.9);
			tooltip
				.html(d["Cereal"] + "<br/> (" + xValue(d) + ", " + yValue(d) + ")")
				.style("left", d3.event.pageX + 5 + "px")
				.style("top", d3.event.pageY - 28 + "px");
		})
		.on("mouseout", function (d) {
			tooltip.transition().duration(500).style("opacity", 0);
		});

	// Add labels. For x-axis, it's at (10, 10), and for y-axis at (width, height-10).
	svg
		.append("text")
		.attr("x", 10)
		.attr("transform", "rotate(-90)")
		.attr("y", 6)
		.attr("dy", ".71em")
		.style("text-anchor", "end")
		.attr("class", "label")
		.attr("id", "y_label")
		.text(yLabel);

	svg
		.append("text")
		.attr("x", width)
		.attr("y", height - 10)
		.attr("text-anchor", "end")
		.attr("class", "label")
		.attr("id", "x_label")
		.text(xLabel);

	/* Draw legend
           Define a group element for each color i, and translate it to (0, i * 20).
        */
	var legend = svg
		.selectAll("legend")
		.data(color.domain())
		.enter()
		.append("g")
		.attr("class", "legend")
		.attr("transform", function (d, i) {
			return "translate(0," + i * 20 + ")";
		});

	/* Draw legend colored rectangles.
           give x value equal to the legend elements.
           no need to define a function for fill, this is automatically fill by color.
        */
	legend
		.append("rect")
		.attr("x", width + 85) // Changed value here to move legend rectangles more to right
		.attr("width", 18)
		.attr("height", 18)
		.style("fill", color)
		.on("click", function (d) {
			var class_name = ".circle_" + d;
			d3.selectAll("circle").transition().duration(500).style("opacity", 0.15); // All bubbles fade
			d3.selectAll(class_name).transition().duration(500).style("opacity", 1); // Only show hovered Manufacturer bubbles
		})
		.on("mouseover", function (d) {
			d3.selectAll("circle").transition().duration(500).style("opacity", 1); // All bubbles reappear
		});

	/* Add text to the legend elements.
           rectangles are defined at x value equal to width, we define text at width +98
           this will print name of the legends before rectangles.
        */
	legend
		.append("text")
		.attr("x", width + 98) // Changed value here to move legend text more to right
		.attr("y", 9)
		.attr("dy", ".35em")
		.style("text-anchor", "end")
		.text(function (d) {
			return d;
		});
});
