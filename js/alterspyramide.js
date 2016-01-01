$(function () {
    // Hier werden die Abstände eingetragen
    var margin = {
        top: 20,
        right: 30,
        bottom: 30,
        left: 60,
        middle: 30
    };

    // Größe des zu erstellenden SVG-Elements
    var svg_width = 1000;
    var svg_height = 500;

    // Teiler zum Gruppieren auf der Y-Achse. Muss sich aus den Primfaktoren von 85 zusammensetzen (das sind 5,17)
    var divisor = 5;
    // Maximale Anzahl an Ticks jeweils auf der X-Axis
    var ticks = 6;

    // -----------------------------
    // DO NOT MODIFY AFTER THIS LINE
    // -----------------------------

    var width = svg_width - margin.left - margin.right;
    var height = svg_height - margin.top - margin.bottom;
    var regionWidth = (width / 2) - margin.middle;

    var getAggregatedKey = function (years) {
        var multiplier = Math.floor(years / divisor);
        return "" + (multiplier * divisor) + " - " + ((multiplier + 1) * divisor - 1);
    };

    var tickFormat = function (d) {
        // d3 kann nur das Komma als Tausend-Trenner. Also hier überschreiben
        // https://github.com/mbostock/d3/issues/657
        return d3.format(",")(d).replace(/,/g, ".");
    };

    // Dataset als CSV laden
    d3.csv('alterspyramide.csv', function (data) {
        // Zahlen als Integer
        data.maennlich = +data.maennlich;
        data.weiblich = +data.weiblich;
        return data;
    }, function (data) {

        // Hier die Daten gruppieren
        data = _.reduce(data, function (result, item, i, list) {
            // Den Rest (85+) direkt übernehmen
            if (item.Altersjahre == '85+') {
                result.push(item);
                return result;
            }
            else {
                // Bei allen anderen zuerst den Schlüsselwert berechnen
                var key = getAggregatedKey(item.Altersjahre);

                // dann den entsprechenden Eintrag finden
                for (var i = 0; i < result.length; i++) {
                    if (result[i].Altersjahre == key) {
                        result[i].maennlich += item.maennlich;
                        result[i].weiblich += item.weiblich;
                        return result;
                    }
                }

                // Den Schlüssel gibt es noch nicht
                item.Altersjahre = key;
                result.push(item);
                return result;
            }
        }, []);

        // Maximaler Einzelwert aus den Daten ermitteln
        var max_m = d3.max(data, function (d) { return d.maennlich });
        var max_w = d3.max(data, function (d) { return d.weiblich });
        var max = Math.max(max_m, max_w);

        // Max-Wert auf die nächste 10er-Einheit aufrunden
        max = Math.ceil(max / Math.pow(10, ("" + max).length - 1)) * Math.pow(10, ("" + max).length - 1);

        // Hier eine lineare Skala erstellen. Mit dieser lassen sich dann später die Werte aus dem Datensatz in Abstände umrechnen
        // Männlich und weiblich sollen den gleichen Skalierungsfaktor erhalten, daher nur 1 Skala
        var x = d3.scale.linear()
            .domain([0, max])
            .range([0, regionWidth]);

        // die 2. X-Skala wird benötigt, um später die richtige Achse zeichnen zu können
        var x_left = d3.scale.linear()
            .domain([0, max])
            .range([0, -regionWidth]);

        var y = d3.scale.ordinal()
            .domain(_.map(data, 'Altersjahre'))
            .rangeRoundBands([0, height], .1);

        // Das SVG erstellen
        var svg = d3.select('#chart')
            .append('svg')
            .attr('width', svg_width)
            .attr('height', svg_height)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
            .append("g")
            .attr("transform", "translate(" + width / 2 + ",0)");

        // Für jedes Element aus den Daten ein G(roup)-Element erstellen
        var bar = svg.selectAll("g")
            .data(data)
            .enter()
            .append("g")
            .attr("transform", function (d, i) {
                return "translate(0," + y(d["Altersjahre"]) + ")";
            });

        // Jetzt jeder Balken
        // Zuerst die Männer
        bar.append("rect")
            .attr("x", margin.middle)
            .attr("width", function (d) { return x(d.maennlich); })
            .attr("height", y.rangeBand())
            .classed("male", true);

        // Dann die Frauen
        bar.append("rect")
            .attr("x", function (d) { return -1 * x(d.weiblich) - margin.middle; })
            .attr("width", function (d) { return x(d.weiblich); })
            .attr("height", y.rangeBand())
            .classed("female", true);


        // Zunächst die X-Achse
        // Wir brauchen hier 2, weil männlich und weiblich getrennt sind
        var xAxisRight = d3.svg.axis()
            .scale(x)
            .orient("bottom")
            .ticks(ticks)
            .tickFormat(tickFormat);

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(" + margin.middle + "," + height + ")")
            .call(xAxisRight)
            .append("text") // Jetzt noch die Achsenbeschriftung
            .attr("transform", "translate(" + regionWidth * 3 / 4 + ", -27)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "middle")
            .style("font-size", "16px")
            .text("Männer");


        var xAxisLeft = d3.svg.axis()
            .scale(x_left)
            .orient("bottom")
            .ticks(ticks)
            .tickFormat(tickFormat);

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(" + -margin.middle + "," + height + ")")
            .call(xAxisLeft)
            .append("text") // Jetzt noch die Achsenbeschriftung
            .attr("transform", "translate(" + -regionWidth * 3 / 4 + ", -27)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "middle")
            .style("font-size", "16px")
            .text("Frauen");

        // Jetzt die Y-Achse
        var yAxis = d3.svg.axis()
            .scale(y)
            .orient('left');

        svg.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(" + margin.middle / 3 + ",0)")
            .call(yAxis)
            .selectAll("text")
            .style("text-anchor", "middle");
    });
});