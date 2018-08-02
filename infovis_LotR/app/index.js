var sub_loc = "./subs/jsons/Lord-of-the-Rings-The-Return-of-the-King.json";
var donut_loc = "./donut/all_emotions_percentages_lotr3.json";
var line_graph_loc = "./linegraph/linegraphROTK.csv";

var images = "./donut/images/";
var json = "./data/Lord-of-the-Rings-The-Return-of-the-King.json"

var current_scene = "0";

get_sub_data(sub_loc).then((json) => {
    $(document).ready(() => {
        $("#timeline").attr({
            "max": json[json.length-1][1],
        })
    })
})

var set_location = (json_data, scene, element) => {
    let data = json_data[scene]

    element.html(`${data.location} - ${data.time}`)
}

function timer(json_data) {
    var myTimer;
    var wait = 25

    var start_timer = () => {
        clearInterval(myTimer);
        myTimer = setInterval(function() {
            $('#timeline').trigger('change')
            var timeline = d3.select("#timeline");
            var t = (+timeline.property("value") + 1) //% (+timeline.property("max") + 1);
            if (t == 0) { t = +timeline.property("min"); }
            $("#timeline").val(t)
        }, wait);
    }

    d3.select("#start").on("click", () => {
        LineGraph.lines().reset()
        LineGraph.lines().dim()

        json_data[current_scene].characters.forEach((c) => {
            LineGraph.lines().bolden(c)
        })

        start_timer()
    });

    d3.select("#stop").on("click", () => {
        clearInterval(myTimer);
    });

    d3.select("#plus").on("click", () => {
        wait /= 2
        start_timer()
    })

    d3.select("#minus").on("click", () => {
        wait *= 2
        start_timer()
    })
}

async function main() {
    Donut.init(donut_loc, d3.select("#donut_chart"), images)

    var [sub_shower, json_data] = await Promise.all([
        init_sub_shower(sub_loc, $("#subtitle")),
        $.getJSON(json)
    ])

    timer(json_data)

    create_legend(d3.select("#donut_legend"))

    Donut.create_all_donuts(current_scene)
    sub_shower(current_scene)
    set_location(json_data, current_scene, $("#location"));

    var win_width = document.getElementById("timeline").offsetWidth;
    var win_height = document.documentElement.clientHeight * 0.55 * 0.75;

    // FIXME find out why LineGraph is shorter than subs
    LineGraph.init(d3.select("#line_graph"), line_graph_loc, $('#timeline'), [win_width, win_height])

    var i = -1;
    var list = ["line_graph", "start", "stop", "plus", "minus", "timeline", "subtitle", "donut_chart", "story" , "story"]

    tutorial(i, list)

    $("#timeline").change(() => {
        time_point = $("#timeline").val()

        var [_, _, scene, speaker, _] = sub_shower(time_point)

        LineGraph.move_slider(time_point)
        Donut.select_donut(speaker)

        if (scene !== current_scene) {
            current_scene = scene;

            Donut.create_all_donuts(current_scene);
            Donut.select_donut(speaker)

            set_location(json_data, current_scene, $("#location"));

            LineGraph.lines().reset()
            LineGraph.lines().dim()

            json_data[current_scene].characters.forEach((c) => {
                LineGraph.lines().bolden(c)
            })
        }


    })
}

function tutorial(i, list){
    var bbox = document.getElementById("header1").getBoundingClientRect();

    var docbox = document.documentElement;

    var tutorial = d3.select("body").append("div")
        .attr("id", "tutorial")
        .attr("class", "tooltip")
        .style("font-size", "55px")
        .style("opacity", 1)
        .style('top',  20 +"px")
        .style('left', docbox.clientWidth/2 -400+ "px")
        .append("text")
            .html("Welcome! <br/> To follow this tutorial press &#8594; <br/> To exit this tutorial press ESC")
            .attr("id", "tutorial_text")

    d3.select("body")
        .on("keypress", function(d){
            key = d3.event.keyCode;
            try{
                document.getElementById(list[i]).style.border="0px #ff0000 solid";
            }
            catch(e){}
            i = updateI(key, i, list)
            })
}

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
        updateTutorial(i, list)
      }
  }
  // left arrow key: go back in tutorial
  if (key == 37){
      i = i - 1;
      if (i < -1){
        i = -1;
      }
    updateTutorial(i, list)
  }

  if (key == 27){ // esc button to stop tutorial
    d3.select("#tutorial")
      .transition()
      .style("opacity", 0)
      i = -1
  }
  return i
}


function updateTutorial(i, list){
    textlist = ["This linegraph shows where characters are at certain scenes. <br/> See yourself and hover over a line",
    "Click the play button and the movie starts to play",
    "Click on pause to stop",
    "To speed up, press here",
    "Press here to slow down",
    "Interact with the graph by dragging the slider",
    "See what is being said during the scenes",
    "See how the characters are feeling. <br/> Try to hover over the donuts",
    "Or amaze yourself with story mode",
    "Enjoy!"]

    var bbox = document.getElementById(list[i]).getBoundingClientRect()
    document.getElementById(list[i]).style.border="6px #ff0000 solid";

    d3.select("#tutorial_text")
        .remove()

    d3.select("#tutorial")
        .style("opacity", 0)
        .style("font-size", "20px")
        .append("text")
            .html(textlist[i])
            .attr("id", "tutorial_text")

    var test = document.getElementById("tutorial").getBoundingClientRect()

    d3.select("#tutorial")
        .transition()
        .duration(1500)
        .style("top", Math.round(bbox.top - (test.height*2) - 10) + "px")
        .style("left", Math.round(bbox.left) + "px")
        .style("opacity", 1)
}

$(document).ready(() => {
    main()
})
