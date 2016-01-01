$(function () {
    // Zuerst die Größe festlegen
    var width = 500;
    var height = 500;
    var radius = Math.min(width, height) / 2;
    var color = d3.scale.category20b(); // Für die Farbe eines der mitgelieferten Beispiele nehmen (hier 20b);
    // weitere Infos zu den Farben hier: https://github.com/mbostock/d3/wiki/Ordinal-Scales#categorical-colors

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
        var newData = _.map(reduced, function (value, group) {
            return {
                "Product Group": group,
                Count: value
            };
        });

        var svg = d3.select('#kreisdiagramm')
            .append('svg')
            .attr('width', width)
            .attr('height', height);

        // Ein G(roup)-Element um den Kreis mittig auszurichten
        var group = svg.append('g')
            .attr('transform', 'translate(' + (width / 2) + ',' + (height / 2) + ')');

        // Über den Arc wird der Kreis definiert
        // ARC = Pathbuilder für das SVG-Tag, welches später definiert wird
        var arc = d3.svg.arc()
            .outerRadius(radius);

        // Hier die Grundlage für den Kreisabschnitt definieren
        var pie = d3.layout.pie()
            .value(function (d) { return d.Count; }) // So kommt der Kreisabschnitt später an die Größe
            .sort(null); // Sortieren abschalten

        var path = group.selectAll('path')
            .data(pie(newData))
            .enter()
            .append('path')
            .attr('d', arc)
            .attr('fill', function (d, i) {
                return color(d.data['Product Group']);
            });

        // Jetzt noch die Beschriftung
        var labels = group.selectAll('text')
            .data(pie(newData))
            .enter()
            .append('text')
            .attr('transform', function (d) {
                //we have to make sure to set these before calling arc.centroid
                d.innerRadius = 0;
                d.outerRadius = radius;
                return "translate(" + arc.centroid(d) + ")";        //this gives us a pair of coordinates like [50, 50]
            })
            .attr("text-anchor", "middle")
            .attr('data-item', function (d) { return d.data["Product Group"]; })
            .attr('data-value', function (d) { return d.value })
            .text(function (d) {
                return d.data["Product Group"] + ": " + d.value;
            });

    });
});