$(function () {
    // Dataset als CSV laden
    d3.csv('dataset.csv', function (data) {
        // Zunächst aus den Datenzeilen Tabellenzeilen machen. Jede Tabellenzeile erhält
        // dann einen Verweis auf das entsprechende Datenobjekt, das später weiterverwendet werden kann
        var rows = d3.select("#dataTable tbody").selectAll("tr")
            .data(data)
            .enter()
            .append("tr");

        // Jetzt die Spalten
        var i = 1;
        var cells = rows.selectAll("td")
            .data(function (row) {
                // Product Group - Product Category - Count
                return [{ column: 'Product Group', value: row['Product Group'] },
                    { column: 'Product Category', value: row['Product Category'] },
                    { column: 'Count', value: row['Count'] }];
            })
            .enter()
            .append("td")
            .text(function (d) {
                return d.value
            });

        // Zum Schluss die Tabelle noch nach Anzahl sortieren
        rows.sort(function(a, b) {
            return d3.descending(a.Count, b.Count);
        });
    });
});