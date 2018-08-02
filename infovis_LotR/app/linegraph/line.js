class LineGraph  {
    static init(output_div, data_location, html_slider, [width, height]) {
        this.output_div = output_div;
        this.color = d3.scaleOrdinal(d3.schemeCategory10);
        this.html_slider = html_slider

        this.location_data = []

        this.create_scales(width, height)
        this.create_elements()

        this.load_data(data_location).then((data) => {
            this.set_domain(data)
            this.data = data;

            this.draw_all()
            this.create_axis()
        })

        this._add_location_mouseover()
    }

    static create_scales(win_width, win_height) {
        // set the dimensions and margins of the graph
        this.margin = {top: 20, right: 20, bottom: 20, left: 20}
        this.width = win_width - (this.margin.left + this.margin.right)
        this.height = win_height - (this.margin.top + this.margin.bottom)

        // set the ranges
        this.x = d3.scaleLinear().range([0, this.width]);
        this.y = d3.scaleLinear().range([this.height, 0]); // FIXME dit is onlogisch

        // parse the date / time
        this.parseTime = d3.timeParse("%d-%b-%y");

        this.line = d3.line()
            .x(function(d, i) { return this.x(d.scene); }.bind(this))
            .y(function(d) { return this.y(d.loc); }.bind(this))
    }

    static create_elements() {
        var div = this.output_div
            .append("div")
            .style("display", "inline-block")

        this.svg = div
            .append("svg")
        	.attr("id", "mainsvg")
            .attr("width", this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom)
            .append("g")
            .attr("transform", `translate(${this.margin.left},${this.margin.top})`);

        // Define the div for the tooltip
        this.tooltip = this.output_div.append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        this.location = div.append("div")
            .attr("class", "tooltip")
            .attr("id", "location_tooltip")
            .style("left", "0px")
            .style("opacity", 0);

        this.horline = this.svg.append("line")
            .style("stroke", "black")
            .attr("id", "horline")
            .style("fill", "d3.rgb(#A9A9A9)")
            .style("stroke-dasharray", ("2, 2"))
            .style("opacity", 0)
            .style("stroke-width", 1)
            .attr("x1", 0)
            .attr("y1", this.height/2)
            .attr("x2", this.width)
            .attr("y2", this.height/2)

        this.rect = this.svg
            .append("rect")
            .attr("width", this.width)
            .attr("height", this.height)
            .style("fill", "none")
            .style("pointer-events", "all")

        this.slider = this.svg.append("line")
    	    .style("stroke", "black")
    	    .attr("id", "slider")
    	    .style("stroke-width", 4)
    	    .style("opacity", 0.5)
    	    .style("fill", "d3.rgb(#A9A9A9)")
    	    .attr("x1", 0)
    	    .attr("y1", this.height)
    	    .attr("x2", 0)
    	    .attr("y2", 0)
    	    .attr("T", 0) // transition parameter
            .call(d3.drag()
            .on("drag", () => {
                console.log("test");
                var [mx, _] = d3.mouse(this.svg.node());
                this.html_slider.val(this.x.invert(mx))
                this.html_slider.trigger('change')
                this.move_slider(this.x.invert(mx))
            }))
    }

    static load_data(data_location) {
        return new Promise(function(resolve, reject) {
            d3.csv(data_location, function(error, csv_data) {
                if (error) {throw(error); reject()};

                // Parse string to int
                csv_data.forEach((d) => {
                    d.scene =+ d.scene;
                    d.loc =+ d.loc;
                })

                //rollup data
                var data = d3.nest()
                    .key(function(d){ return d.character; })
                    .entries(csv_data)

                resolve(data)
            })
        });
    }

    static set_domain(data) {
        var scene_max = 0;
        var scene_min = 0;

        var loc_max = 0;
        var loc_min = 0;

        data.forEach((char) => {
            char.values.forEach((d) => {
                if (d.scene > scene_max) { scene_max = d.scene }
                if (d.scene < scene_min) { scene_min = d.scene }

                if (d.loc > loc_max) { loc_max = d.loc }
                if (d.loc < scene_min) { scene_min = d.loc }

                this.location_data.push([Number(d.scene), d.loc_name]);
            })
        })


        this.location_data = Array.from(
            (new Set(this.location_data.sort((a, b) => a[0] - b[0]).map((d) => d[1]))))

        // Scale the range of the data
        this.x.domain([scene_min, scene_max]);
        this.y.domain([loc_min, loc_max]);
    }

    static create_axis() {
        // Add the X Axis
        this.svg.append("g")
            .attr("class", "xaxis")
            .attr("transform", "translate(0," + this.height + ")")
            .call(d3.axisBottom(this.x))
            .selectAll("text")
                .remove()
    }

    static draw_all() {
        for (var i = 0; i < Object.keys(this.data).length; i++) {
            new Promise(function(resolve, reject) {
                var key_data = this.data[i].values
                var key = this.data[i].key

                resolve([key_data, key])
            }.bind(this)).then(([key_data, key]) => {
                this.draw(key_data, key, this.color(i))
            });
        }
    }

    static draw(data, key, color) {
    	var path = this.svg.append("path")
    	    .datum(data)
    	    .attr("class", "line")
            .attr("id", key)
    	    .attr("d", this.line)
    	    .attr("stroke-width", 2)
    	    .attr("fill", "none")
        	.attr("stroke", this.color)

        this._add_line_mouseover(path, key)
    }

    static _add_line_mouseover(path, key) {
        path.on("mouseover", (d) => {
            var [toolx, tooly] = d3.mouse(this.svg.node());

            this.tooltip.transition()
                .style("opacity", 1);

            this.tooltip.html(() => {
                var scene_data = this.char_data_finder(this.x.invert(toolx), d, 0)

                return key.bold()  + "<br/>" + scene_data.loc_name
            })
                .style("left", (toolx + 10) + "px")
                .style("top", (tooly - 28) + "px");

            this.lines().dim();
            this.lines().bolden(key);
        })
        .on("mouseout", function(d) {
            this.tooltip.transition()
            .style("opacity", 0);

            this.lines().show_all()
            this.lines().reset()
        }.bind(this))
    }

    static _add_location_mouseover() {
        this.rect
            .on("mousemove", () => {
                var [toolx, tooly] = d3.mouse(this.svg.node());

                this.location.style("opacity", 1)

                this.location.html(() => {
                    return this.location_data[Math.floor(this.y.invert(tooly))]
                })
                .style("top", tooly + "px")

                this.horline
                    .attr("x1", 0)
                    .attr("y1", tooly)
                    // .attr("x2", toolx) // TODO comment out for straight line
                    .attr("y2", tooly)
                    .style("opacity", 1)
            })
            .on("mouseout", () => {
                this.location.style("opacity", 0)
                this.horline.style("opacity", 0)
            })
            .on("click", function(d){
                var [mx, _] = d3.mouse(this.svg.node());
                this.html_slider.val(this.x.invert(mx))
                this.html_slider.trigger('change')
                this.move_slider(this.x.invert(mx))
            }.bind(this))
    }

    static move_slider(x) {
        var [min, max] = this.x.domain()

        if (x < 0 || x > max) {
            return
        }

        this.slider
    	    .attr("x1", this.x(x))
    	    .attr("y1", this.height)
    	    .attr("x2", this.x(x))
    	    .attr("y2", 0)
    	    // .attr("T", 0) // transition parameter
    }

    static char_data_finder(time_point, data, index) {
        var start = data[index].scene
        var length = data.length - 1

        if (index == length ||
            (time_point >= start && time_point < data[index+1].scene)) {
            return data[index]
        } else {
            index += 1
            return this.char_data_finder(time_point, data, index)
        }
    }

    static lines() {
        return {
            dim: () => {
                this.svg.selectAll(".line")
                    .attr("opacity", 0.3)
            },
            show_all: () => {
                this.svg.selectAll(".line")
                    .attr("opacity", 1)
            },
            bolden: (key) => {
                this.svg.select("#" + key)
                    .attr("opacity", 1)
                    .attr("stroke-width", 4);
            },
            reset: () => {
                this.svg.selectAll(".line")
                    .attr("stroke-width", 2);
            }
        }
    }
}
