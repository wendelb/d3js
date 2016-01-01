$(function () {
    // Größen festlegen
    var margin = {
        top: 20,
        right: 20,
        bottom: 30,
        left: 60
    };
    var width = 500 - margin.left - margin.right;
    var height = 200 - margin.top - margin.bottom;
    var color = d3.scale.category20();

    // Dataset als CSV laden
    d3.csv('dataset.csv', function (data) {
        // zunächst das Dataset auf Product Category gruppieren (Methode: SUM)
        // Geschieht per map/reduce
        var maps = _.map(data, function (item) {
            return {
                "Product Group": item["Product Group"],
                Count: item.Count
            };
        });
        var reduced = _.reduce(maps, function (result, n, key) {
            result[n["Product Group"]] = (result[n["Product Group"]] || 0) + parseInt(n.Count);
            return result;
        }, {});
        // Zum Schluss wieder das originale Format herstellen
        var data = _.map(reduced, function (value, group) {
            return {
                "Product Group": group,
                Count: value
            };
        });

        // Maximaler Einzelwert aus den Daten ermitteln
        var max = _.reduce(data, function (result, value) { return (value.Count > result) ? value.Count : result; }, 0);

        // Hier eine lineare Skala erstellen. Mit dieser lassen sich dann später die Werte aus dem Datensatz in Abstände umrechnen
        var x = d3.scale.linear()
            .domain([0, max])
            .range([0, width]);

        var y = d3.scale.ordinal()
            .domain(_.map(data, 'Product Group'))
            .rangeRoundBands([0, height], .1);

        // Das SVG erstelltn
        var svg = d3.select('#chart')
            .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // Für jedes Element aus den Daten ein G(roup)-Element erstellen
        var bar = svg.selectAll("g")
            .data(data)
            .enter()
            .append("g")
            .attr("transform", function (d, i) {
                return "translate(0," + y(d["Product Group"]) + ")";
            });

        // Jetzt jedes Element
        bar.append("rect")
            .attr("width", function (d) { return x(d.Count); })
            .attr("height", y.rangeBand())
            .attr('fill', function (d) { return color(d["Product Group"]); });

        // Um die Balken noch ein paar Achsen zeichnen
        // Zunächst die X-Achse mit der X-Skalierung
        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom");

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis) // Ab hier dann die Achse beschriften
            .append("text")
            .attr("transform", "translate(" + width + ", -10) rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("Anzahl");

        // Dann die y-Achse mit der Y-Skalierung
        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left");

        svg.append("g")
            .attr("class", "x axis")
            .call(yAxis);



    });
});