var checkedCoins=[];
var MAX_NUMBER_OF_COINS_TO_CHOOSE = 5;
var allResults = [];
var toShow = [] ;
infoBars = [];
var resultsOfSearch = [];
$( document ).ready (() => {
    $('#searchButton').on('click',() =>{
        resultsOfSearch.forEach (coin => {
            $('#'+coin.id).css('display', 'none');
        }); 
        resultsOfSearch = [];
        const textToSearch = $('#searchField').val();
        let resultsToSend = [];
        if (textToSearch && textToSearch.replace(/\s/g, "").length > 0 ) {
            allResults.forEach (coin => {
                if (coin.symbol.toLowerCase() === textToSearch.toLowerCase()) {
                    resultsOfSearch.push(coin);
                } else {
                    if ( $('#'+coin.id).length) {
                        $('#'+coin.id).css('display', 'none');
                    }
                }
            });
            resultsOfSearch.forEach (coin => {
                fields = ['symbol','name'];
                let a = $('#'+coin.id).length;
                if ( !$('#'+coin.id).length) {
                    generateSimpleDivs ('results', 'coin',[coin], fields);
                } else {
                    $('#'+coin.id).css('display', 'block');
                }
            });
        }
        else {
            toShow.forEach (coin => {
                $('#'+coin.id).css('display', 'block');
            }); 
        } 
       
    });

    $("#searchField").on("change paste keyup", function(){
        const textToSearch = $('#searchField').val();
        if (!textToSearch || textToSearch.replace(/\s/g, "").length === 0 ) {
            resultsOfSearch.forEach (coin => {
                $('#'+coin.id).css('display', 'none');
            }); 
            toShow.forEach (coin => {
                $('#'+coin.id).css('display', 'block');
            }); 
        }
    });
})

function getAll() {
    $('#results').html('');
    $('#bar').css('display','block');
    getData("https://api.coingecko.com/api/v3/coins/list").done(results => {
        allResults = results;
        toShow = allResults.slice(0,99);
        fields = ['symbol','name'];
        generateSimpleDivs('results', 'coin', toShow, fields);
        $('#bar').css('display','none');
    })
    .fail(x => {
        console.log("fail response : ",x)
    });
    
}

function getMoreInfoOf(coinId) {
    return getData("https://api.coingecko.com/api/v3/coins/" + coinId);
}
function search() {
    const inputText = $('#inputField').val()
    getData("https://restcountries.eu/rest/v2/name/" + inputText);
}

function getData(url) {
    const ajaxParameters = {}
    ajaxParameters.url = url
    ajaxParameters.type = 'GET'
    ajaxParameters.error = handleError
    return $.ajax(ajaxParameters);
}


function handleError(xhr, status, error) {
    $('#results').append('<h1> Error loading data !');
    console.log("error: ", error)
    console.log("status: ", status)
    console.log(">>>xhr: ", xhr)
}

function generateSimpleDivs(elementIdWhereToGenerateTheDiv, className, data, keyNames) {
    data.forEach(coin => {
        coin.id=coin.id.replace(/\s/g, "");
        var divId=coin.id;
        coin.moreInfoOpened = false;
        $('#' + elementIdWhereToGenerateTheDiv).append('<div id=\'' + divId + '\' class=\'' + className + '\'></div>');
        let valueToPutIn='';
        keyNames.forEach(key => {
            switch(key) {
                case 'symbol':
                    valueToPutIn +='<div class=\"symbol-and-toggle\">'
                    valueToPutIn += '<span class=\"coin-'+ key + '\">'+ coin[key] + '</span>';
                    valueToPutIn += '<input id=\"'+divId+'Toggle\" class=\"toggle\" type=\"checkbox\" />'
                    valueToPutIn += '</div>'
                    break;
                default:
                    valueToPutIn += '<p class=\"coin-'+ key + '\">'+ coin[key] +'</p>';   
            }
        });

        //Info Button
        valueToPutIn += '<button type=\"button\" id=\"'+divId+'MoreInfoButton\" class=\"btn btn-primary coin-more-info\">More Info</button>';
        valueToPutIn += '<div id=\"'+divId+'MoreInfoBar\" class = "more-info-bar"></div>';
        
        var toGenerate = '<div class=\'coin-info\'>' + valueToPutIn + '</div>';
        $('#' + divId).append(toGenerate);
        
        infoBars.push(new RadialProgress(document.getElementById(divId+'MoreInfoBar'),{indeterminate:true,colorBg:"rgba(0,0,0,0)",colorFg:" #00ccff",thick:4}));
        
        $('#'+ divId+'MoreInfoBar').css('display','none');
        
        $('#'+ divId+'MoreInfoButton').on('click',() => {
            if(coin.moreInfoOpened){
                $('#'+divId+'MoreInfoText').remove();
            }else{
                $('#'+ divId+'MoreInfoBar').css('display','flex');
                const currentTime = new Date();
                let reSendRequest = false;
                if (coin.lastTimePressed){
                    let timeDiff = currentTime - coin.lastTimePressed;
                    timeDiff /= 1000;
                    timeDiff =  Math.round(timeDiff);
                    reSendRequest = timeDiff > 5 ;
                }
                coin.lastTimePressed = currentTime;
                if(coin.moreInfo && !reSendRequest){
                    $('#' + divId).append(buildMoreInfo(coin.moreInfo));
                    $('#'+ divId+'MoreInfoBar').css('display','none');
                }else{
                    getMoreInfoOf(coin.id).done(result => {
                        coin.moreInfo=result;
                        $('#' + divId).append(buildMoreInfo(result));
                        $('#'+ divId+'MoreInfoBar').css('display','none');
                    });
                }
                
            }
            coin.moreInfoOpened = !coin.moreInfoOpened;          
        });

        $('#'+ divId+'Toggle').change(function(){
            if($(this).is(':checked')) {
                console.log("checked ! ",divId);
                if (checkedCoins.length<MAX_NUMBER_OF_COINS_TO_CHOOSE){
                    checkedCoins.push(coin);
                } else{
                    $(this).prop("checked", false);
                    createPopUpModal(coin);
                }
                
            } else {
                checkedCoins=checkedCoins.filter ((checkedCoin) => {
                    return checkedCoin.id != coin.id;
                });
                console.log("checkesCoins = ",checkedCoins);
            }
        });
    });
}

function buildMoreInfo(result){
    var imageLink = result.image.large;
    var usdPrice = result.market_data.current_price.usd;
    var eurPrice = result.market_data.current_price.eur;
    var ilsPrice = result.market_data.current_price.ils;
    var moreInfoToPutIn = '<div class = \"more-info-text\"id=\"'+result.id+'MoreInfoText\">';
    moreInfoToPutIn += '<img src=\"' + imageLink + '\">';
    moreInfoToPutIn += '<p>USD price : ' + usdPrice + '&#36</p>';
    moreInfoToPutIn += '<p>EUR price : ' + eurPrice + '&#8364</p>';
    moreInfoToPutIn += '<p>ILS price : ' + ilsPrice + '&#8362</p>'
    moreInfoToPutIn += '</div>';
    return moreInfoToPutIn;
}

function createPopUpModal (theCoinForTheToggle){
    let tempCheckedCoins = checkedCoins.slice()
    let htmlForPopUp = '<div id = \'modalPopUp\' class = \'modal-pop-up\'>';
    htmlForPopUp += '<div class = \'modal-pop-up-content\'>';
    htmlForPopUp += '<h1 class = \'modal-title\'>' + 'You can choose only '+MAX_NUMBER_OF_COINS_TO_CHOOSE + ' coins.<br>Please diselect one of the already chosen coins and press SAVE.</h1>'
    checkedCoins.forEach (coin => {
        divId = coin.id;
        htmlForPopUp += '<div class=\'modal-coin-wrapper\'>';
        htmlForPopUp += '<span class=\"modal-coin-symbol\">'+ coin.symbol + '</span>';
        htmlForPopUp += '<input id=\"'+ divId +'ToggleForPopUp\" class=\"toggle\" type=\"checkbox\" checked />'
        htmlForPopUp += '</div>';
    });
    htmlForPopUp += '<div class = \'model-buttons-container\'>';
    htmlForPopUp += '<button type=\"button\" id=\"modelSaveButton\" class=\"btn btn-primary model-button\">SAVE</button>';
    htmlForPopUp += '<button type=\"button\" id=\"modelCancelButton\" class=\"btn btn-primary model-button\">CANCEL</button>';
    htmlForPopUp += '</div> </div>';
    $( "body" ).append (htmlForPopUp);

    $('#modelCancelButton').on('click', () => {
        $('#modalPopUp').remove();
    });
    $('#modelSaveButton').on('click', () => {
        checkedCoins.forEach(coin =>{
            $('#'+ coin.id+'Toggle').prop("checked",false);
        });
        tempCheckedCoins.forEach(coin =>{
            $('#'+ coin.id+'Toggle').prop("checked",true);
        })
        if (tempCheckedCoins.length < MAX_NUMBER_OF_COINS_TO_CHOOSE){
            tempCheckedCoins.push(theCoinForTheToggle);
            $('#'+ theCoinForTheToggle.id+'Toggle').prop("checked",true);
        }
        checkedCoins = tempCheckedCoins;
        $('#modalPopUp').remove();
    });
    checkedCoins.forEach (coin => {
        const divId = coin.id;
        $('#'+ divId +'ToggleForPopUp').change(function(){
            if($(this).is(':checked')) {
                console.log("checked ! ",divId);
                if (tempCheckedCoins.length<MAX_NUMBER_OF_COINS_TO_CHOOSE){
                    tempCheckedCoins.push(coin);
                }
                    
            } else {
                tempCheckedCoins=tempCheckedCoins.filter ((checkedCoin) => {
                    return checkedCoin.id != coin.id;
                });

            }
        });
    });
}