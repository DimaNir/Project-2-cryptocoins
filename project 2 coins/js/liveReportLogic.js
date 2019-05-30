var coinsValues = [];
let strForRequest = '';
const TIME_FOR_UPDATE = 2000;
function start(){
    console.log("startedddddd : ",checkedCoins);
    strForRequest = '';
    checkedCoins.forEach (coin => {
        strForRequest += coin.symbol.toUpperCase() +','
    });
    strForRequest=strForRequest.slice(0,-1);
    $('#bar').css('display','block');
    getData('https://min-api.cryptocompare.com/data/pricemulti?fsyms=' + strForRequest +'&tsyms=USD').done(results => {
        coinsValues = {}; 
        Object.keys(results).forEach ((key) => {
            coinsValues[key] = [
                {
                    x : new Date(), 
                    y : results[key].USD 
                }
            ]
        });
        generateGraph (results);
        $('#bar').css('display','none');
    });
}

function generateGraph(results) {
    data = [];

    Object.keys(results).forEach ((key) => {
        data.push({
            type: "line",
            name: key,
            xValueType: "dateTime",
            showInLegend: true,
            xValueFormatString: "mm:ss",
            yValueFormatString: "#,##0.#$",
            dataPoints : coinsValues[key]
        });
    });
    var options = {
	    animationEnabled: true,
        title: {
            text: strForRequest + ' to USD'
        },
        axisX: {
            title: "Time",
            valueFormatString:"mm:ss",
        },
        axisY: {
            title: "Coin Value",
            titleFontColor: "#4F81BC",
            lineColor: "#4F81BC",
            labelFontColor: "#4F81BC",
            tickColor: "#4F81BC",
            includeZero: false
        },
        toolTip: {
            shared: true
        },
        data: data
    }
    $("#chartContainer").CanvasJSChart(options);
    setInterval(function () {  updateData () }, TIME_FOR_UPDATE);
   
};
    
function updateData() {
    getData('https://min-api.cryptocompare.com/data/pricemulti?fsyms=' + strForRequest +'&tsyms=USD').done(results => {
        Object.keys(results).forEach ((key) => {
            coinsValues[key].push(
                {
                    x : new Date(), 
                    y : results[key].USD 
                }
            );  
        });
        $("#chartContainer").CanvasJSChart().render();
    });
}


