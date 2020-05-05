/* Source:  http://bl.ocks.org/ndarville/7075823
This code read the text file and converts into html for webpages. */

d3.text("data/a1-cereals.csv", function (data) {
	var parsedCSV = d3.csv.parseRows(data);

	var container = d3
		.select("body")
		.append("table")

		.selectAll("tr")
		.data(parsedCSV)
		.enter()
		.append("tr")

		.selectAll("td")
		.data(function (d) {
			return d;
		})
		.enter()
		.append("td")
		.text(function (d) {
			return d;
		});
});
