var emo_list = [
    { emo: "Anger", color: "#f40713"},
    { emo: "Disgust", color: "#405300"},
    { emo: "Fear", color: "#7b06ce"},
    { emo: "Happiness",color: "#f7f713"},
    { emo: "Sadness", color: "#13dcf7"},
    { emo: "Surprise",color: "#0247f7"},
    { emo: "Neutral",color: "#d1d1d1"},
];

var create_legend = (element) => {
    var legendRectSize = 18;
    var legendSpacing = 4;

    var svg = element
        .append('svg')
        .attr('width',200 )
        .attr('height', 300) ;

    var new_rects = svg.selectAll('rect') // Get all the rectangles in the svg
        .data(emo_list) // Bind the 5 data points
        .enter() // Grab the 5 'new' data points
        .append('rect') // Add a rectangles for each 'new' data point
        .attr('x', 0) // Begin setting attributes
        .attr('y', function(d, i) {
          // i is an index, 0, 1, 2, 3
          return i * 20;  // this spaces them out evenly
        })
        .attr('height', 10)
        .attr('width', function(d) {
          return 20; // data point * 20 pixels wide
        })
        .style('fill', function(d) {
          return d.color; // data point * 20 pixels wide
        })
        .style('stroke', function(d) {
          return d.color; // data point * 20 pixels wide
        });

    var annotations = svg.selectAll('text')
        .data(emo_list)
        .enter()
        .append('text')
        .attr('x',95)
        .attr('y', function(d, i) { return i * 20 + 10; })
        .text(function(d) { return d['emo']; })
        .attr('font-size', 12)
        .attr('text-anchor', 'end');
}
