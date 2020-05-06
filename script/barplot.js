// Load data, then make the visualization.
var fileName = "data/a1-cereals.csv";
var nutritionFields = [
	"Calories",
	"Carbohydrates",
	"Fat",
	"Fiber",
	"Potassium",
	"Protein",
	"Sodium",
	"Sugars",
	"Vitamins",
];

//Read data from CSV, enter into Array
d3.csv(fileName, function (error, data) {
	var cerealMap = {};
	dataType: "json";
	data.forEach(function (d) {
		var Cereal = d.Cereal;
		cerealMap[Cereal] = [];

		// { cerealName: [ bar1Val, bar2Val, ... ] }
		nutritionFields.forEach(function (field) {
			cerealMap[Cereal].push(+d[field]);
		});
	});
	makeVis(cerealMap);
});

//Create SVG canvas and populate
var makeVis = function (cerealMap) {
	// Define dimensions of vis
	var margin = { top: 30, right: 50, bottom: 30, left: 50 },
		width = 750 - margin.left - margin.right,
		height = 450 - margin.top - margin.bottom;

	// Make x scale
	var xScale = d3.scale
		.ordinal()
		.domain(nutritionFields)
		.rangeRoundBands([0, width], 0.1);

	// Make y scale, the domain will be defined on bar update
	var yScale = d3.scale.linear().range([height, 0]);

	// Create canvas
	var canvas = d3
		.select("#vis-container")
		.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	// Make x-axis and add to canvas
	var xAxis = d3.svg.axis().scale(xScale).orient("bottom");

	canvas
		.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + height + ")")
		.call(xAxis);

	// Make y-axis and add to canvas
	var yAxis = d3.svg.axis().scale(yScale).orient("left");

	// Adds y-axis
	var yAxisHandleForUpdate = canvas
		.append("g")
		.attr("class", "y axis")
		.call(yAxis);

	//Appends vertical "Value" label to axis
	yAxisHandleForUpdate
		.append("text")
		.attr("transform", "rotate(-90)")
		.attr("y", -40)
		.attr("dy", ".71em")
		.style("text-anchor", "end")
		.style("font-weight", "lighter")
		.style("stroke", "green")
		.text("Value");

	var updateBars = function (data) {
		// First update the y-axis domain to match data
		yScale.domain(d3.extent(data));
		yAxisHandleForUpdate.call(yAxis);

		var bars = canvas.selectAll(".bar").data(data);

		// Add bars for new data
		bars
			.enter()
			.append("rect")
			.attr("class", "bar")
			.attr("x", function (d, i) {
				return xScale(nutritionFields[i]);
			})
			.attr("width", xScale.rangeBand())
			.attr("y", function (d, i) {
				return yScale(d);
			})
			.attr("height", function (d, i) {
				//window.alert("main bar creation commands");
				var hTemp = height - yScale(d);
				return height - yScale(d);
			});

		//Create Bar Labels
		bars
			.enter()
			.append("text")
			.attr("class", "label")
			.style("stroke", "white")
			.style("opacity", 1)
			.style("visibility", "visible")
			.style("text-anchor", "middle")
			.attr("x", (function(d, i) { return xScale(nutritionFields[i]); }  ))
			.attr("y", function(d) { return yScale(d); })
			.attr("dx", "2.9em")
			.attr("dy", "1em")
			.text(function(d) {
				//window.alert("Text Label " + d);
				return d; });



		// Update old ones, already have x / width from before
		bars
			.transition()
			.duration(250)
			.attr("y", function (d, i) {
				//window.alert("bar-trans-update");
				return yScale(d);
			})
			.attr("height", function (d, i) {
				return height - yScale(d);
			});

		/*bars
			.transition()
			.duration(250)
			.attr("y", function(d) { return yScale(d); })
			.text(function(d) {
				//window.alert("Text Label " + d);
				return d; });*/

		// Remove old bars
		bars.exit().remove();



	};


	// Handler for dropdown value change
	var dropdownChange = function () {
		var newCereal = d3.select(this).property("value"),
			newData = cerealMap[newCereal];

		updateBars(newData);
	};

	// Get names of cereals, for dropdown
	var cereals = Object.keys(cerealMap).sort();

	//Create and initialize event listener for dropdown change
	var dropdown = d3
		.select("#vis-container")
		.insert("select", "svg")
		.on("change", dropdownChange);

	dropdown
		.selectAll("option")
		.data(cereals)
		.enter()
		.append("option")
		.attr("value", function (d) {
			return d;
		})
		.text(function (d) {
			return d[0].toUpperCase() + d.slice(1, d.length); // capitalize 1st letter
		});

	//Determines initial data presented on load of the chart
	var initialData = cerealMap[cereals[0]];

	updateBars(initialData);
};