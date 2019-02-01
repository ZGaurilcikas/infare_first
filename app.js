var cheerio = require('cheerio');
var request = require('sync-request');

var objs = [];


for (var i = 1; i <= 28; i++) {

    //insert i in request for 28 days loop

    var res = request('GET', 'https://www.norwegian.com/uk/ipc/availability/avaday?AdultCount=1&A_City=RIX&D_City=OSL&D_Month=201902&D_Day=' + i + '&R_Month=201902&R_Day=&IncludeTransit=false&TripType=2&CurrencyCode=EUR&dFare=172&rFare=34&mode=ab');

    var html = res.getBody().toString('utf8');

    var type = ['.oddrow', '.evenrow']

    // var for html load
    var $ = cheerio.load(html);

    $('#ctl00_MainContent_ipcAvaDay_upnlResultOutbound').each((e, el) => {
        //finding airport. .map() if is more than one flight in current day
        var x = $(el)
            .find('.evenrow.rowinfo2 td:first-child').map(function () {
                return $(this).text();
            }).get();

        if (!Array.isArray(x) || !x.length) {
            type.pop()
        }
        type.forEach(function (typeX) {

            var departure_airport = $(el)
                .find(typeX + '.rowinfo2 td:first-child').map(function () {
                    return $(this).text();
                }).get();
            //finding arrival airport
            var arrival_airport = $(el)
                .find(typeX + '.rowinfo2 td:nth-child(2)').map(function () {
                    return $(this).text();
                }).get();
            //finding time
            var departure_time = $(el)
                .find(typeX + '.rowinfo1 td:first-child').map(function () {
                    return $(this).text();
                }).get();
            //finding arrival time
            var arrival_time = $(el)
                .find(typeX + '.rowinfo1 td:nth-child(2)').map(function () {
                    return $(this).text();
                }).get();
            //finding cheapest price and rule if there is no cheapest price select other price
            var cheapest_price = $(el)
                .find(typeX + '.rowinfo1 td:nth-child(5)').text();

            if (cheapest_price == "-") {
                var cheapest_price = $(el)
                    .find(typeX + '.rowinfo1 td:nth-child(5)')
                    .text();
            }
            if (cheapest_price == "-") {
                var cheapest_price = $(el)
                    .find(typeX + '.rowinfo1 td:nth-child(7)')
                    .text();
            }
            //finding date 
            var laikas = $(el)
                .find('.headerbox td')
                .text()
                .slice(37);

            var obj = {
                laikas: laikas,
                Isvykimas: departure_airport[0],
                Isvykimo_laikas: departure_time[0],
                Atvykimas: arrival_airport[0],
                Atvykimo_laikas: arrival_time[0],
                Pigiausia_kaina: cheapest_price + ' EUR'
            };
            if(departure_airport !== undefined && departure_time !== undefined && arrival_airport !== undefined){
             objs.push(obj)
            };
        });
    });
}
var cheap_price = objs.map(lol => lol.Pigiausia_kaina);

cheap_price = cheap_price.map(function (x) {
    return parseFloat(x.replace(/,/, '.'));
});
cheap_price = Math.min(...cheap_price)

console.table(objs)
console.log("Cheapest price is: " + cheap_price)

