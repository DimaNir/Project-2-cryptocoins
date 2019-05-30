let bar;
$(document).ready(function () {
  bar=new RadialProgress(document.getElementById("bar"),{indeterminate:true,colorBg:"rgba(0,0,0,0)",colorFg:" #00ccff",thick:4});
  $('#about').css('display', 'none');
  $('#liveReport').css('display', 'none');
  $('#home').css('display', 'block');

  $('#homeButton').on('click', function () {
    $('#about').css('display', 'none');
    $('#liveReport').css('display', 'none');
    $('#home').css('display', 'block');
  });

  $('#liveReportButton').on('click', function () {
    if (checkedCoins.length > 0) {
      $('#liveReport').css('display', 'block');
      $('#home').css('display', 'none');
      $('#about').css('display', 'none');
      start();
    } else {
      alert('you need to choose some coins to see live reports about them.')
    }

  });
  $('#aboutButton').on('click', function () {
    $('#liveReport').css('display', 'none');
    $('#home').css('display', 'none');
    $('#about').css('display', 'flex');
      
    

  });
  getAll();
});
