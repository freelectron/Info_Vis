// set the dimensions and margins of the graph
var margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;


// TUTORIAL
var i = -1;
var list = [".svg1",  "g.xaxis"]

// set the ranges
var x = d3.scaleLinear().range([0, width]);
var y = d3.scaleLinear().range([height, 0]);

var line = d3.line()
    .x(function(d, i) { return x(d.scene); }) // set the x values for the line generator
    .y(function(d) { return y(d.loc); }) // set the y values for the line generator 

// append the svg obgect to the body of the page
// appends a 'group' element to 'svg'
// moves the 'group' element to the top left margin
var svg = d3.select("body")
    .on("keypress", function(d){ // TUTORIAL
    key = d3.event.keyCode;
    i = updateI(key, i, list)
    })
  .append("svg")
    .attr("class", "svg1")
    .attr("width", width + (margin.left*2) + (margin.right*2))
    .attr("height", height + (margin.top*2) + (margin.bottom*2))
  .append("g")
    .attr("transform",
          "translate(" + margin.left*2 + "," + margin.top*2 + ")");

// Define the div for the tooltip
var div1 = d3.select("body").append("div") 
    .attr("class", "tooltip")       
    .style("background", "lightsteelblue")
    .style("opacity", 0);

// TUTORIAL
var centerX = document.documentElement.clientWidth / 2;
var centerY = document.documentElement.clientHeight / 2;

// Define the div for the tooltip // TUTORIAL
var div2 = d3.select("body").append("div") 
    .attr("id", "tutorial")
    .attr("class", "tooltip")       
    .style("opacity", 1)
    .style('top', centerY +"px")
    .style('left', centerX + "px")
    .style("background", "lightsteelblue")
    .append("text")
      .text("Welcome to LOTR emotions.io");

// Get the data
d3.csv("linegraph_data.csv", function(error, d) {
  if (error) throw error;

  var color = d3.scaleOrdinal(d3.schemeCategory10);
  // color.domain(d3.keys(data[0]).filter(function(key) { return key !== "date"; }));

  //rollup data
  var data = d3.nest()
  .key(function(d){ return d.character; })
  .entries(d)

  for (var i = 0; i<Object.keys(data).length; i++){
    data2 = data[i].values
    key = data[i].key
    draw(data2, key, color(i))    
  }
})

function draw(data, key, color){

  d3.selectAll("g.xaxis").remove();
  d3.selectAll("g.yaxis").remove();

  // data.forEach(function(d, i){
  data.forEach(function(d){
      d.scene =+ d.scene;
      d.loc = + d.loc;  
  })

  // Scale the range of the data
  x.domain(d3.extent(data, function(d) { return d.scene; }));
  y.domain([0, d3.max(data, function(d) { return d.loc; })]);

  svg.append("path")
      .datum(data) 
      .attr("class", "line") 
      .attr("d", line)
      .attr("stroke-width", 1.5)
      .attr("fill", "none")
      .attr("stroke", color)
    .on("mouseover", function(d) {    
      div1.transition()    
          .style("opacity", .9);    
      div1.html(key  + "<br/>"  + "loc: " + d.loc + "<br/>" + "scene: " + d.scene) 
          .style("left", (d3.event.pageX) + "px")   
          .style("top", (d3.event.pageY - 28) + "px");  
      d3.select(this)
        .transition()
        .duration(100)
        .style("stroke-width", 3);
      })
    .on("mouseout", function(d) {   
      div1.transition()    
          .style("opacity", 0); 
        d3.select(this)
        .transition()
        .duration(100)
        .style("stroke-width", 1.5);
      });

  // Add the X Axis
  svg.append("g")
    .attr("class", "xaxis")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

  // Add the Y Axis
  svg.append("g")
    .attr("class", "yaxis")
    .call(d3.axisLeft(y));


  // add x label
    svg.append("text")
        .attr("transform", "translate(" + (width/2) + "," + (height + margin.bottom) + ")")
        .style("text-anchor", "middle")
        .text("scene")

    // add y label
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0-margin.left)
        .attr("x", 0-(height/2))
        .style("text-anchor", "middle")
        .text("Location");
}

// TUTORIAL
function updateI(key, i, list){
  // right arrow key: advance tutorial
  if (key == 39){ 
      i = i + 1;
      if (i == list.length){
        d3.select("#tutorial")
          .transition()
          .style("opacity", 0)
      }
      else{
        tutorial(i, list)      
      }
  }
  // left arrow key: go back in tutorial
  if (key == 37){
      i = i - 1;
      console.log(i)
      if (i < -1){
        i = -1;
      }
    
    tutorial(i, list)  
  }

  if (key == 27){ // esc button to stop tutorial
    d3.select("#tutorial")
      .transition()
      .style("opacity", 0)
      i = -1
  }

  return i
}

// TUTORIAL
function tutorial(i, list){
  textlist = ["This is a linegraph",
  "This is an axis"]
  // update position of tutorial div
  var bbox = d3.select(list[i]).node().getBoundingClientRect()

  d3.select("#tutorial")
      .transition() 
      .style("top", Math.round(bbox.height/2) + "px")
      .style("left", Math.round(bbox.right) + "px")
      .text(textlist[i])
      .delay(800)
}


