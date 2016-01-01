$(function () {
    // Größen festlegen
    var margin = {
        top: 20,
        right: 20,
        bottom: 30,
        left: 60,
        säulenabstand: 15
    };
    var width = 2 * 500 - margin.left - margin.right;
    var height = 300 - margin.top - margin.bottom;
    var color = d3.scale.category20c();

    // Dataset als CSV laden
    d3.csv('dataset.csv', function (data) {
        // Maximaler Einzelwert aus den Daten ermitteln (hier mit den Funktionen aus d3)
        var max = d3.max(data, function (d) { return d.Count; });

        // Get the 1st level group selectors
        var first = _.uniq(_.map(data, 'Product Group'));
        var second = _.map(data, 'Product Category');


        var x0 = d3.scale.ordinal()
                .domain(second)
                .rangeRoundBands([0, width - margin.säulenabstand * (first.length - 1)], .1);

        var x1 = d3.scale.ordinal()
                .domain(first)
                .range(d3.range(0, first.length));

        var y = d3.scale.linear()
            .domain([0, max])
            .range([height, 0]);


        // Das SVG erstelltn
        var svg = d3.select('#chart')
            .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // Das erste Level erstellen
        var firstLevel = svg.selectAll(".first")
            .data(data)
            .enter().append("g")
            .attr("class", "bar")
            .attr("transform", function (d) { return "translate(" + (x1(d["Product Group"]) * margin.säulenabstand + x0(d["Product Category"])) + ",0)"; });

        firstLevel.append("rect")
            .attr("width", x0.rangeBand())
            .attr("x", "0") //function (d, i) { return x1(i + 1); })
            .attr("y", function (d) { return y(d.Count); })
            .attr("height", function (d) { return height - y(d.Count); })
            .style("fill", function (d) { return color(d["Product Category"]); });

        firstLevel.append("text")
            .attr('class', 'barlabel')
            .attr("transform", "translate(0," + (height - 10) + ") rotate(-90)")
            .attr('dy', 15)
            .text(function (d) { return d["Product Category"]; })

        // Jetzt die Y-Achse
        var yAchse = d3.svg.axis()
            .scale(y)
            .orient("left");

        svg.append("g")
            .attr("class", "y axis")
            .call(yAchse);

        // Dann die X-Achse
        first.push('');
        first.unshift('');

        var x2 = d3.scale.ordinal()
            .domain(first)
            .range([
                0,
                (x0("Swimwear") + x0("Maternity")) / 2 + 0,
                (x0("Pants") + x0("Shirts")) / 2 + margin.säulenabstand * 1,
                (x0("Disk Drives") + x0("Wireless")) / 2 + margin.säulenabstand * 2,
                (x0("Mens Watch") + x0("Earrings")) / 2 + margin.säulenabstand * 3,
                (x0("Business") + x0("Parenting")) / 2 + margin.säulenabstand * 4,
                width
            ]);

        var xAchse = d3.svg.axis()
            .scale(x2)
            .orient("bottom");

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAchse);
    });
});