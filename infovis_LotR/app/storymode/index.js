var duration = 750;
var nodes;

d3.json("Lord-of-the-Rings-The-Return-of-the-King.json", function(data) {
    margin = {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0
        },
    width = 100 - margin.right - margin.left
    height = 100 - margin.top - margin.bottom;

    locationList = [];

    function uncapitalize(string) {
        string_l = string.toLowerCase()
            .replace(/“|”/g, '')
            .split(' ');
        string_l.forEach(function(str, i) {
            string_l[i] = str.charAt(0).toUpperCase() + str.slice(1)
        });
        return string_l.join(' ');
    }
    console.log(data[0]);
    var selectedChars = ["FRODO", "GANDALF", "BILBO", "GOLLUM"];

    function processData(data, selectedChars) {
        var locations = [];

        number_of_scenes = Object.keys(data).length;
        console.log(number_of_scenes);
        var allChars = [];

        function findLinks(scene) {
            var links = [];
            data[scene].characters.forEach(function(character) {
                if (!allChars.includes(character)) {
                    allChars.push(character);
                }
                for (var i = parseInt(scene) + 1; i < number_of_scenes; i++) {
                    if (data[i.toString()].characters.includes(character) && selectedChars.includes(character)) {
                        links.push(i);
                        break;
                    }
                }

            });
            return [...new Set(links)].sort();
        }

        console.log(allChars);
        linkDict = {};

        Object.keys(data).forEach(function(scene) {
            linkDict[scene] = findLinks(scene);
            locations.push(data[scene].location);
        });

        let unique_locations = [...new Set(locations)];
        locationList = unique_locations;
        locToIndex = {}

        unique_locations.forEach(function(location, ind) {
            locToIndex[location] = ind;
        });

        var raw_nodes = []

        Object.keys(linkDict).forEach(function(scene) {
            var location_str = data[scene]["location"];
            var y = 270 + parseInt(scene) * 60;
            var x = 50 + locToIndex[location_str] * 30;
            var links = linkDict[scene];
            characters = data[scene]["characters"].filter(function(n) {
                return selectedChars.indexOf(n) !== -1;
            });

            var node = {
                "scene": scene,
                "children": links,
                "x": x,
                "y": y,
                "characters": characters,
                "location": location_str
            };
            raw_nodes.push(node);
        });

        return [raw_nodes, unique_locations, allChars];
    }

    var temp = processData(data, selectedChars);
    var raw_nodes = temp[0];
    var locationList = temp[1];
    var allChars = temp[2];
    var colorDict = {
        "Multiple": "white",
        "FRODO": "green",
        "GANDALF": "grey",
        "BILBO": "red",
        "GOLLUM": "yellow",
        "ARAGORN": "#a52a2a",
        "GALADRIEL": "#006400"
    };

    var empty_svg = d3.select("body").append("svg")
        .attr("width", width + margin.right + '%')
        .attr("height", height + margin.top + margin.bottom + '%')
        .attr('x', 0)
        .attr('y', 0);

    var primary_group = empty_svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

    // empty_svg.append('text')
    //     .attr('x', 2)
    //     .attr('y', 331)
    //     .html('&#9665')
    //     .style('font-size', '17px')
    //     .style("stroke", "white")

    // var button = empty_svg.append("ellipse")
    //     .attr('cx', 0)
    //     .attr('cy', 325)
    //     .attr('rx', 23)
    //     .attr('ry', 15)
    //     .style('fill-opacity', 0.4)
    //     .style('stroke', 'grey')
    //     .style("fill", "#37393d")
    //     .style("stroke-width", 1.5)
    //     .on("click", function() {
    //         console.log('clicked')
    //         window.location.href = '../index.html';
    //     });

    var secondary_group = empty_svg.append('g').attr("transform", "translate(" + 900 + "," + 10 + ")");
    var select = d3.select("div").append('select')
        .on('change', onchange);
    var options = select
        .selectAll('option')
        .data(allChars).enter()
        .append('option')
        .text(function(d) {
            return uncapitalize(d);
        });

    //var selectedSvg = d3.select("body").append("svg")
    //	.attr("width", 200)
    //	.attr("height", 300)
    //	.attr("fill","black").append("g")
    //	.attr("transform", "translate(" + 750 + "," + 200 + ")");

    function run(raw_nodes, locationList, svg, g) {
        // Define the div for the tooltip
        var div = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);
        var temp_selected = selectedChars;
        if (!temp_selected.includes("Multiple")) {
            temp_selected.unshift("Multiple");
        }
        g.append('rect')
            .attr("width", 130)
            .attr("height", (temp_selected.length * 14 + 20))
            .attr("fill", "black")
            .attr("fill-opacity", 0.4);


        var textGroup = g.selectAll("text").data(temp_selected).enter().append("g");
        current_length = 0;

        temp_selected.forEach(function(d) {
            if (current_length < d.length) {
                current_length = d.length;
            }
        });

        textGroup.append("text")
            .text(function(d) {
                return uncapitalize(d);
            })
            .style("fill", "white")
            .attr("text-anchor", "left")
            .attr("x", 10)
            .attr("y", function(d, i) {
                return (i * 14) + 20
            })
            .style("font-size", "14px")
            .style("font", "sans-serif")
            .style("opacity", 0.8);
        var legendGroup = g.selectAll("circle")
            .data(temp_selected).enter().append("g");

        legendGroup.append("circle")
            .attr("cx", 10 + (current_length * 12))
            .attr("cy", function(d, i) {
                return (i * 14) + 15
            })
            .attr("r", 6)
            .style("fill", function(d) {
                return colorDict[d]
            });

        function zoomed() {
            containergraph.attr("transform", "translate(" + d3.event.translate[0] + "," + d3.event.translate[1] + ")");
            containeryaxis.attr("transform", "translate(0," + d3.event.translate[1] + ")")

            ;
        }
        var zoom = d3.behavior.zoom()
            .on("zoom", zoomed);
        var drag = d3.behavior.drag()
            .origin(function(d) {
                return d;
            })
            .on("dragstart", dragstarted)
            .on("drag", dragged)
            .on("dragend", dragended);
        svg.call(zoom);

        function Node(scene, x, y, id, children, _children, characters, location) {
            this.scene = scene;
            this.characters = characters;
            this.location = location;
            this.x = x;
            this.y = y;
            this.y0 = y;
            this.x0 = x;
            this.id = id;
            this.children = children;
            this._children = _children;
        }

        function ytick(id, x, y, name) {
            this.x = x;
            this.y = y;
            this.x0 = x;
            this.y0 = y;
            this.id = id;
            this.name = name;
        }

        function Graph() {
            this.rootNode = null;
            this.nodes_list = null;
            this.yticks = null;
        }
        Graph.prototype.nodes = function() {
            var nodes = [this.rootNode];
            var old = [this.rootNode];
            var id_list = [this.rootNode.id]

            function buildNodesList() {
                var currentNodes = [];
                for (var i = 0; i < old.length; i++) {
                    currentChildren = old[i].children;
                    if (currentChildren == null) {
                        continue;
                    }

                    for (var j = 0; j < currentChildren.length; j++) {
                        currentChild = currentChildren[j];
                        if (!id_list.includes(currentChild.id)) {
                            currentNodes.push(currentChild);
                            id_list.push(currentChild.id);
                        }
                    }
                }
                if (currentNodes.length == 0) {
                    return null;
                }
                nodes = nodes.concat(currentNodes);
                old = currentNodes;
                buildNodesList();
            }

            buildNodesList();
            return nodes;
        };

        function Link(source, target, color) {
            this.source = source;
            this.target = target;
            this.color = color;
        }

        function getColor(Char_list1, Char_list2) {
            intersection = Char_list1.filter(function(n) {
                return Char_list2.indexOf(n) !== -1;
            });
            if (intersection.length == 1) {
                //console.log("color change")
                return colorDict[intersection[0]];
            } else {
                return "#FFFFFF"; //black
            }

        }
        Graph.prototype.links = function(nodes) {
            var links = []
            for (var i = 0; i < nodes.length; i++) {
                children = nodes[i].children;
                if (children) {
                    for (var j = 0; j < children.length; j++) {
                        color = getColor(nodes[i].characters, children[j].characters);
                        links.push(new Link(nodes[i], children[j], color))
                    }
                }
            }
            links = links.sort(function(a, b) {
                return a.source.id - b.source.id;
            })
            return links;
        };


        Graph.prototype.init = function(data) {
            var nodes = []
            for (var i = 0; i < data.length; i++) {
                scene = data[i]["scene"]
                var location = data[i]["location"]
                x = data[i]["x"]
                y = data[i]["y"] + 110
                characters = data[i]["characters"];
                nodes.push(new Node(scene, x, y, i, null, null, characters, location))
            }
            this.nodes_list = nodes;
            var y_axis = []
            for (var i = 0; i < locationList.length; i++) {
                console.log("creating y axis");
                locid = i;
                y = 50 + i * 30;
                x = 245
                name = locationList[i];
                y_axis.push(new ytick(locid, x, y, name));
            }
            this.yticks = y_axis;
            for (var i = 0; i < nodes.length; i++) {
                if (data[i]["children"].length > 0) {
                    this.rootNode = nodes[i];
                    break;
                }
            }

            for (var i = 0; i < nodes.length; i++) {
                var children = [];
                var currentNode = data[i]; //ArrayNode
                for (var j = 0; j < currentNode["children"].length; j++) {
                    childIndex = currentNode["children"][j];
                    child = nodes[childIndex];
                    //child.x0 = nodes[i].x;
                    //child
                    children.push(child);
                }
                if (children.length == 0) {
                    children = null
                }
                nodes[i].children = children;
            }

            return null;
        };
        var graph = new Graph();
        graph.init(raw_nodes);
        console.log("initialized");
        //console.log(g.rootNode.children);


        //console.log(g.rootNode);
        //console.log(g.links(g.nodes()));


        var i = 0,
            root;
        var currentscene = 0
        //var tree = d3.layout.tree()
        //    .size([height, width]);

        var diagonal = d3.svg.diagonal()
            .projection(function(d) {
                return [d.y, d.x];
            });

        var rect = svg.append("rect")
            .attr("width", width + margin.right + margin.left + '%')
            .attr("height", height + margin.top + margin.bottom + '%')
            .style("pointer-events", "all").attr("fill", "black").attr("fill-opacity", 0.8);

        var containergraph = svg.append("g");
        var yaxis_rect = svg.append("rect").attr("height", height + margin.top + margin.bottom + '%').attr("width", 250).attr("fill", "black").attr("fill-opacity", 0.4)
        var containeryaxis = svg.append("g");




        var links;

        root = graph.rootNode;
        //root.x0 = height / 2;
        //root.y0 = 0;
        function collapse(d) {
            if (d.children) {
                d._children = d.children;
                d._children.forEach(collapse);
                d.children = null;
            }
        }

        root.children.forEach(collapse);
        update(root);

        d3.select(self.frameElement).style("height", "800px");

        function update(source) {
            //container.selectAll("g.ytick").remove();
            // Compute the new graph layout.
            nodes = graph.nodes().reverse(),
                yticks = graph.yticks,
                links = graph.links(nodes);
            console.log("nodes")
            console.log(nodes)
            //console.log(links);
            //console.log(nodes);
            // Update the nodes…
            var node = containergraph.selectAll("g.node")
                .data(nodes, function(d) {
                    return d.id;
                });
            console.log(node)
            var y_tick = containeryaxis.selectAll("g.ytick").data(yticks, function(d) {
                return d.id;
            })

            function replaceAll(str, find, replace) {
                return str.replace(new RegExp(find, 'g'), replace);
            }
            // Enter any new nodes at the parent's previous position.


            var nodeEnter = node.enter().append("g")
                .attr("class", "node")
                .attr("transform", function(d) {
                    return "translate(" + source.y0 + "," + source.x0 + ")";
                })
                .on("click", click)
                .on("mouseover", function(t) {
                    div.transition()
                        .duration(200)
                        .style("opacity", .9);
                    temp_chars = [];
                    t.characters.forEach(function(character) {
                        temp_chars.push(uncapitalize(character))
                    });
                    div.html(replaceAll(temp_chars.join(), ",", "<br/>"))

                        .style("height", (t.characters.length * 14).toString() + "px")

                        .style("left", (d3.event.pageX) + "px")
                        .style("top", (d3.event.pageY - 28) + "px");
                    d3.selectAll('.test').filter(function(d) {
                            return d.name !== t.location
                        })
                        .transition().duration(250)
                        .style("fill-opacity", 0.3);
                    d3.selectAll('.test')
                        .filter(function(d) {
                            return d.name === t.location
                        })
                        .transition().duration(250)
                        .style("fill-opacity", 0.9)
                        .style("font-size", "12px");
                    temp_chars = [];
                })


                .on("mouseout", function(d) {
                    div.transition()
                        .duration(500)
                        .style("opacity", 0);
                    d3.selectAll('.test').transition().duration(750)
                        .style("fill-opacity", 0.9)
                        .style("font-size", "12px");
                });

            nodeEnter.append("circle")
                .attr("r", 1e-6)
                .style("fill", function(d) {
                    return d._children ? "lightsteelblue" : "#fff";
                });

            nodeEnter.append("text")
                .attr("x", function(d) {
                    return d.children || d._children ? -10 : 10;
                })
                .attr("dy", ".35em")
                .attr("text-anchor", function(d) {
                    return d.children || d._children ? "end" : "start";
                })
                .text(function(d) {
                    return d.scene;
                })
                .style("fill-opacity", 1e-6)
                .style("fill", "#fff");

            var yAxisEnter = y_tick.enter().append("g").attr("class", "ytick")
                //.attr("x", 30).attr("y", function(d,i) {return 120 + i * 60}); //??????
                .attr("transform", function(d) {
                    return "translate(" + 0 + "," + d.y0 + ")";
                });

            yAxisEnter.append("text").attr("dy", ".35em").attr("class", "test")
                .attr("text-anchor", "end")
                .text(function(d) {
                    return uncapitalize(d.name);
                })
                .style("fill-opacity", 0.9)
                .style("fill", "#fff")
                .style("font-size", "12px")
                .style("font-family", " Aril, Helvetica, sans-serif");

            var yUpdate = y_tick.transition().duration(duration).attr("transform", function(d) {
                return "translate(" + d.x + "," + d.y + ")";
            });
            // Transition nodes to their new position.

            var nodeUpdate = node.transition()
                .duration(duration)
                .attr("transform", function(d) {
                    return "translate(" + d.y + "," + d.x + ")";
                });

            nodeUpdate.select("circle")
                .attr("r", 6)
                .style("fill", function(d) {
                    return d._children ? "lightsteelblue" : "#fff";
                });

            nodeUpdate.select("text")
                .style("fill-opacity", 1);

            // Transition exiting nodes to the parent's new position.
            var nodeExit = node.exit().transition()
                .duration(duration)
                .attr("transform", function(d) {
                    return "translate(" + source.y + "," + source.x + ")";
                })
                .remove();

            nodeExit.select("circle")
                .attr("r", 1e-6);

            nodeExit.select("text")
                .style("fill-opacity", 1e-6);

            // Update the links…
            var link = containergraph.selectAll("path.link")
                .data(links);

            // Enter any new links at the parent's previous position.
            link.enter().insert("path", "g")
                .attr("class", "link")
                .attr("d", function(d) {
                    var o = {
                        x: source.x0,
                        y: source.y0
                    };
                    return diagonal({
                        source: o,
                        target: o
                    });
                })
                .style("stroke", function(d) {
                    return d.color;
                });

            // Transition links to their new position.
            link.transition()
                .duration(duration)
                .attr("d", diagonal);

            // Transition exiting nodes to the parent's new position.
            link.exit().transition()
                .duration(duration)
                .attr("d", function(d) {
                    var o = {
                        x: source.x,
                        y: source.y
                    };
                    return diagonal({
                        source: o,
                        target: o
                    });
                })
                .remove();

            // Stash the old positions for transition.
            nodes.forEach(function(d) {
                d.x0 = d.x;
                d.y0 = d.y;
            });

            yticks.forEach(function(d) {
                d.x0 = d.x;
                d.y0 = d.y;
            });
        }

        function move_camera(source, collapse) {
            //nearest leaf function
            function getNearestLeaf(node) {
                leafNode = node;
                if (node.children) {
                    var smallest_id = 9999;
                    children = node.children
                    for (var i = 0; i < children.length; i++) {
                        child = children[i];
                        if (child.id < smallest_id) {
                            smallest_id = child.id;
                            currentChild = child;
                        }

                    }
                    currentChild = getNearestLeaf(currentChild);
                }
                return leafNode;
            }
            //-----------------------------------
            var smallest_id = 9999;
            currentChild = null;
            if (collapse) {
                currentChild = source;
                console.log('current scene before expanding ' + currentscene);
                currentscene = source.id - 1;
                console.log('current scene after expanding ' + currentscene);
            } else {
                var children = source._children;
                if (children == null) {
                    if (running) {
                        console.log("stopping")
                        clearInterval(interval) // wat is deze
                        document.getElementById("playbutton").innerHTML = "Play";
                        running = false;
                    }
                    return;
                }
                for (var i = 0; i < children.length; i++) {
                    child = children[i];
                    if (child.id < smallest_id) {
                        smallest_id = child.id;
                        currentChild = child;
                    }
                }
                currentChild = getNearestLeaf(currentChild);
            }
            console.log("child to expand to")
            console.log(currentChild);
            var move_x = currentChild.x - 200;
            var move_y = currentChild.y - 550;
            for (var i = 0; i < graph.nodes_list.length; i++) {
                graph.nodes_list[i].x -= move_x;
                graph.nodes_list[i].y -= move_y;
            }
            for (var i = 0; i < graph.yticks.length; i++) {
                graph.yticks[i].y -= move_x;
            }

        }

        //function zoomedVert() {
        //  container.attr("transform", "translate(0," +  d3.event.translate[1] + ")scale(" + d3.event.scale + ")");
        //}


        function dragstarted(d) {
            d3.event.sourceEvent.stopPropagation();
            d3.select(this).classed("dragging", true);
        }

        function dragged(d) {
            d3.select(this).attr("cy", d.y = d3.event.y);
        }

        function dragended(d) {
            d3.select(this).classed("dragging", false);
        }

        // Toggle children on click.
        function click(d) {

            //console.log(d);
            //nodes.forEach(function(d) { console.log(d.name[0]);})

            var collapse = null;
            if (d.children) {
                d._children = d.children;
                collapse = true;
                move_camera(d, collapse);
                d.children = null;
                console.log("collapse");
                //console.log(currentscene);
            } else {
                collapse = false;
                move_camera(d, collapse);
                d.children = d._children;
                d._children = null;
                console.log("expand");
                currentscene = d.id
            }
            update(d);

        }
        var interval;
        var running = false;
        var currentscene = 3



        window.playButton = function() {
            if (running) {
                console.log("stopping")
                clearInterval(interval) // wat is deze
                document.getElementById("playbutton").innerHTML = "Play";
                running = false;
            } else {
                running = true;
                document.getElementById("playbutton").innerHTML = "Pause";
                interval = window.setInterval(clickStep, 750);

            }
        }


        window.clickStep = function() {
            var nextscene = 999;
            var nextsceneIndex;
            console.log('currentscene ' + currentscene);
            console.log('nextscene ' + nextscene);
            for (var i = 0; i < nodes.length; i++) {
                if (nodes[i].id < nextscene && nodes[i].id > currentscene) {
                    nextscene = nodes[i].id
                    nextsceneIndex = i
                }
            }
            console.log('nextscene ' + nextscene);
            click(nodes[nextsceneIndex])


        }
        window.resetButton = function() {
            if (running) {
                console.log("stopping")
                clearInterval(interval) // wat is deze
                document.getElementById("playbutton").innerHTML = "Play";
                running = false;

            }
            currentscene = 3;
            console.log('reset')

            function collapse(d) {
                if (d.children) {
                    d._children = d.children;
                    d._children.forEach(collapse);
                    d.children = null;
                }
            }
            root.children.forEach(collapse);
            console.log(root.children[0]);
            click(root);



        }

    }

    run(raw_nodes, locationList, primary_group, secondary_group);

    function onchange() {
        selectedValue = select.property('value').toUpperCase();
        if (selectedChars.includes(selectedValue)) {
            var i = selectedChars.indexOf(selectedValue);
            selectedChars.splice(i, 1)

        } else {
            selectedChars.push(selectedValue);
        }

        primary_group.selectAll("*").remove();
        secondary_group.selectAll("*").remove();

        temp = processData(data, selectedChars);
        raw_nodes = temp[0];
        run(raw_nodes, locationList, primary_group, secondary_group);
    };
});
