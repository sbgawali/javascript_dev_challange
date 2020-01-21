/**
 * This javascript file will constitute the entry point of your solution.
 *
 * Edit it as you need.  It currently contains things that you might find helpful to get started.
 */

// This is not really required, but means that changes to index.html will cause a reload.
require('./site/index.html')
// Apply the styles in style.css to the page.
require('./site/style.css')

// if you want to use es6, you can do something like
//     require('./es6/myEs6code')
// here to load the myEs6code.js file, and it will be automatically transpiled.
//require('./es6/myEs6code');
// Change this to get detailed logging from the stomp library
global.DEBUG = false

const url = "ws://localhost:8011/stomp"
const client = Stomp.client(url)
client.debug = function(msg) {
  if (global.DEBUG) {
    console.info(msg)
  }
}

//Code start from here
client.connect({}, fetchDataCallback, function(error) {
  alert(error.headers.message)
})

// const exampleSparkline = document.getElementById('example-sparkline')
// Sparkline.draw(exampleSparkline, [1, 2, 3, 6, 8, 20, 2, 2, 4, 2, 3])
var dataStore=[];

function fetchDataCallback() {
  client.subscribe("/fx/prices", function(response){    
    dataStore.push(JSON.parse(response.body));    
  });
}

/*
  *setinterval callback api to get updates for every 5 seconds
*/

setInterval(() => {
  if(dataStore.length > 0){
    var tableData = getTableRecord(dataStore);           //  1 ) method to get table record   
    var sparklinePoints = getSparklinePoints(dataStore); // 2) method to get sparklinePoints for sparkline
    displayTable(tableData, sparklinePoints);          // 3) method to display table data 
  }
  
}, 5000);

/* get unique names from data*/

function getUniqueNames(dataStore){
  var uniqueArray = [];
  for(var i=0;i<dataStore.length;i++){
    if(uniqueArray.indexOf(dataStore[i].name) ==-1){
      uniqueArray.push(dataStore[i].name);
    }
  }
  return uniqueArray;
}

function getTableRecord(dataStore) {                     
  var uniqueNames = getUniqueNames(dataStore);          
  var lastChangedDataStore = getLastChangedDataStore(uniqueNames, dataStore); 
  return getSortedDataStore(lastChangedDataStore);
}

function getLastChangedDataStore(uniqueNames, dataStore) {        //get last  changed updates
  var data = [];
  for (var i = 0; i < uniqueNames.length; i++) {
    var currentData = {};
    for (var j = 0; j < dataStore.length; j++) {
      if (uniqueNames[i] == dataStore[j].name) {
        if ((Object.getOwnPropertyNames(currentData).length === 0) || (currentData.lastChangeBid < dataStore[j].lastChangeBid)) {
          currentData = dataStore[j];
        }
      }
    }
    data.push(currentData);
  }
  return data;
}

function getSortedDataStore(unsortedData) {                  
  return unsortedData.sort(function (curr, next) {
    return next.lastChangeBid - curr.lastChangeBid;
  });
}

function getSparklinePoints(dataStore) {
  var sparklinePoints = [];
  var uniqueNames = getUniqueNames(dataStore);
  for (var i = 0; i < uniqueNames.length; i++) {                        
    var pointsArray = [];
    for (var j = 0; j < dataStore.length; j++) {                          
      if (uniqueNames[i] == dataStore[j].name) {
        pointsArray.push((dataStore[j].bestBid + dataStore[j].bestAsk) / 2);                 
      }
    }
    sparklinePoints.push({ name: uniqueNames[i], points: pointsArray });     
  }
  return sparklinePoints;
}

/*
  * Displaying the table data -
*/

function displayTable(tableData, sparklinePoints) {
  var body = [];
  for (var i = 0; i < tableData.length; i++) { 
    console.log(tableData)               
    body +=
      "<tr>" +
      "<td>" + tableData[i].name + "</td>" +
      "<td>" + tableData[i].bestBid + "</td>" +
      "<td>" + tableData[i].bestAsk + "</td>" +
      "<td>" + tableData[i].lastChangeBid + "</td>" +
      "<td>" + tableData[i].lastChangeAsk + "</td>" +
      "<td>" + tableData[i].openBid + "</td>" +
      "<td>" + tableData[i].openAsk + "</td>" +
      "<td>" + "<span id='sparkElement" + i + "'/>" + "</td>"
    "</tr>";
  }
  document.getElementById('table-body').innerHTML = body;
  for (var i = 0; i < tableData.length; i++) {
    drawSparkLine(tableData[i].name, sparklinePoints);
  }
}
/*Drawing a sparkline column in the table */
function drawSparkLine(name, sparklinePoints) {                        
  for (var i = 0; i < sparklinePoints.length; i++) {
    if (name == sparklinePoints[i].name) {                              
      var requiredPoints = []
      if (sparklinePoints[i].points.length > 6) {
        requiredPoints = sparklinePoints[i].points.splice(0, (sparklinePoints[i].points.length - 6));
      }
      else {
        requiredPoints = sparklinePoints[i].points;
      }
      Sparkline.draw(document.getElementById('sparkElement' + i), sparklinePoints[i].points);   //Using sparkLine.draw api from spark.js
    }
  }
}