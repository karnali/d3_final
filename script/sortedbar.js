/*  Source: http://bl.ocks.org/mbostock/3885705
     Tip: http://bl.ocks.org/Caged/6476579 
 */

var margin = { top: 100, right: 20, bottom: 200, left: 40 },
	width = 1460 - margin.left - margin.right,
	height = 800 - margin.top - margin.bottom;

var formatPercent = d3.format("d");

var x = d3.scale.ordinal().rangeRoundBands([0, width], 0.1, 1);

var y = d3.scale.linear().range([height, 0]);

var xAxis = d3.svg.axis().scale(x).orient("bottom");

var yAxis = d3.svg.axis().scale(y).orient("left");

var tip = d3
	.tip()
	.attr("class", "d3-tip")
	.offset([-17, -8])
	.html(function (d) {
		return (
			"" + d.Cereal + ":  <span style='color:red'>" + d.Calories + "</span>"
		);
	});

var svg = d3
	.select("body")
	.append("svg")
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.top + margin.bottom)
	.append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

svg.call(tip);

d3.csv("data/a1-cereals.csv", type, function (error, data) {
	x.domain(
		data.map(function (d) {
			return d.Cereal;
		})
	);
	y.domain([
		0,
		d3.max(data, function (d) {
			return d.Calories;
		}),
	]);

	svg
		.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + height + ")")
		.selectAll("text")
		.attr("y", 0)
		.attr("x", 9)
		.attr("dy", ".35em")
		.attr("transform", "rotate(90)")
		.style("text-anchor", "start")
		.call(xAxis);

	svg
		.append("g")
		.attr("class", "y axis")
		.call(yAxis)
		.append("text")
		.attr("transform", "rotate(-90)")
		.attr("y", 6)
		.attr("dy", ".71em")
		.style("text-anchor", "end")
		.text("Calories");

	svg
		.append("text")
		.attr("x", width / 5)
		.attr("y", 0 - margin.top / 2)
		.attr("text-anchor", "middle")
		.style("font-size", "20px")
		.text("Sort Cereal by Calories. Hover on bar for details.");

	svg
		.selectAll(".bar")
		.data(data)
		.enter()
		.append("rect")
		.attr("class", "bar")
		.attr("x", function (d) {
			return x(d.Cereal);
		})
		.attr("width", x.rangeBand())
		.attr("y", function (d) {
			return y(d.Calories);
		})
		.attr("height", function (d) {
			return height - y(d.Calories);
		})
		.on("mouseover", tip.show)
		.on("mouseout", tip.hide);

	d3.select("input").on("change", change);

	var sortTimeout = setTimeout(function () {
		d3.select("input").property("unchecked", true).each(change);
	}, 50);

	function change() {
		clearTimeout(sortTimeout);

		// Copy-on-write since tweens are evaluated after a delay.
		var x0 = x
			.domain(
				data
					.sort(
						this.checked
							? function (a, b) {
									return b.Calories - a.Calories;
							  }
							: function (a, b) {
									return d3.ascending(a.Cereal, b.Cereal);
							  }
					)
					.map(function (d) {
						return d.Cereal;
					})
			)
			.copy();

		svg.selectAll(".bar").sort(function (a, b) {
			return x0(a.Cereal) - x0(b.Cereal);
		});

		var transition = svg.transition().duration(100),
			delay = function (d, i) {
				return i * 25;
			};

		transition
			.selectAll(".bar")
			.delay(delay)
			.attr("x", function (d) {
				return x0(d.Cereal);
			});

		transition
			.select(".x.axis")
			.call(xAxis)
			.selectAll("g")
			.selectAll("text")
			.attr("y", 0)
			.attr("x", 9)
			.attr("dy", ".35em")
			.attr("transform", "rotate(90)")
			.style("text-anchor", "start")
			.delay(delay);
	}
});
function type(d) {
	d.Calories = +d.Calories;
	return d;
}
