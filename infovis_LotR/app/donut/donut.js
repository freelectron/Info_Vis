class Donut {
    static async init(location, element, image_path) {
        this.width = 180;
        this.height = 180;
        this.radius = Math.min(this.width, this.height) / 3;
        this.pic_size = this.width/4

        this.location = location;
        this.element = element;
        this.image_path = image_path;

        this._create_donut_attr()
        this._create_tooltip()

        this.data = await new Promise((resolve, reject) => {
            $.getJSON(this.location, (json) => {
                resolve(json)
            });
        });

        this.previous_scene = null;
    }

    static _create_donut_attr() {
        var donutWidth = 50;

        this.donut_attr = {
            color: {
                "Anger": "#f40713",
                "Disgust":"#405300",
                "Fear": "#7b06ce",
                "Happiness": "#f7f713",
                "Sadness": "#13dcf7",
                "Surprise": "#0247f7",
                "Neutral": "#d1d1d1",
            },
            arc: d3.arc()
                .innerRadius(this.radius - donutWidth)
                .outerRadius(this.radius),
            pie: d3.pie()
                .value(function (d) { return d.value; })
                .sort(null),
        }
    }

    static _make_dataset(scene, pers) {
        return [
            { emo: "Anger", value: this.data[scene][pers][0] },
            { emo: "Disgust", value: this.data[scene][pers][1] },
            { emo: "Fear", value: this.data[scene][pers][2] },
            { emo: "Happiness", value: this.data[scene][pers][3] },
            { emo: "Sadness", value: this.data[scene][pers][4] },
            { emo: "Surprise", value: this.data[scene][pers][5]},
            { emo: "Neutral", value: this.data[scene][pers][6] },
        ]
    }

    static _create_tooltip() {
        this.tooltip = this.element
            .append('div')
            .attr("id", "donut_tooltip")
            .attr('class', 'tooltip');

        this.tooltip.append('div')
            .attr('id', 'label');

        this.tooltip.append('div')
            .attr('id', 'percent');
    }

    static _create_donut(scene, pers) {
        var dataset = this._make_dataset(scene, pers)

        var svg = this.element
            .append('svg')
            .attr('width', this.width)
            .attr('height', this.height)
            .attr("id", pers)
            .append('g')
            .attr("id", pers)
            .style("opacity", 0)
            .attr('transform', `translate(${this.width/2}, ${this.height/2})`);

        var path = svg.selectAll('path')
            .data(this.donut_attr.pie(dataset))
            .enter()
            .append('path')
            .attr('d', this.donut_attr.arc)
            .attr('fill', function (d, i) {
                return this.donut_attr.color[d.data.emo];
            }.bind(this))
            .on("mouseover", (d) => {
                var [toolx, tooly] = d3.mouse(this.element.node());

                this.tooltip.transition()
                    .style("opacity", 1)
                    .style("left", (toolx) + "px")
                    .style("top", (tooly) + "px");;

                this.tooltip.select("#label")
                    .html(d.data.emo)

                this.tooltip.select("#percent")
                    .html(Math.round(d.data.value * 1000)/10 + "%")
            })
            .on("mouseout", () => {
                this.tooltip.transition()
                    .style("opacity", 0);
            })

        var defs = svg.append('defs') ;

        defs.append('pattern')
            .attr('id', "image_" + pers)
            .attr('height', '100%')
            .attr('width', '100%')
            .attr('patternContentUnits', 'objectBoundingBox')
            .append("image")
            .attr('height', 1)
            .attr('width', 1)
            .attr('preserveAspectRatio', 'none')
            .attr('xmlns:xlink', "http://www.w3.org/1999/xlink")
            .attr('xlink:href', this.image_path + pers )

        svg.append('circle')
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("r", this.pic_size)
            .attr('fill', `url(#image_${pers})`)
            .on("mouseover", (d) => {
                var [toolx, tooly] = d3.mouse(this.element.node());

                this.tooltip.transition()
                    .style("opacity", 1)
                    .style("left", (toolx) + "px")
                    .style("top", (tooly) + "px");;

                this.tooltip.select("#label")
                    .html(pers)

                this.tooltip.select("#percent")
                    .html("")
            })

        svg.transition()
            .style("opacity", 1)

    }

    static create_all_donuts(scene) {
        var difference = (array1, array2) => {
            return array1.filter((i) => {
                return array2.indexOf(i) < 0;
            })
        }

        var intersect = (array1, array2) => {
            return array1.filter((i) => {
                return array2.indexOf(i) !== -1;
            })
        }

        let new_chars = Object.keys(this.data[scene])
        let same_chars = []
        let old_chars = []

        if (this.previous_scene) {
            new_chars = difference(Object.keys(this.data[scene]),
                Object.keys(this.data[this.previous_scene]))

            old_chars = difference(Object.keys(this.data[this.previous_scene]),
                Object.keys(this.data[scene]))

            same_chars = intersect(Object.keys(this.data[scene]),
                Object.keys(this.data[this.previous_scene]))
        }

        old_chars.forEach((pers) => {
            this.element.select(`#${pers}`)
                // .transition()
                // .duration(100)
                // .style("opacity", 0)
                .remove()
        })

        new_chars.forEach((pers) => {
            this._create_donut(scene, pers)
        })

        same_chars.forEach((pers) => {
            this._update_donut(scene, pers)
        })

        this.previous_scene = scene;
    }

    static _update_donut(scene, pers) {
        var dataset = this._make_dataset(scene, pers)

        var path = this.element.select(`#${pers}`)
            .selectAll("path")

        path = path.data(this.donut_attr.pie(dataset))
            .attr('d', this.donut_attr.arc)
            .attr('fill', function (d, i) {
                return this.donut_attr.color[d.data.emo];
            }.bind(this));

        let arc = this.donut_attr.arc

        path.transition().duration(500).attrTween("d", (a) => {
            var i = d3.interpolate(this._current, a);
            this._current = i(0);
            return (t) => {
                return arc(i(t));
            };
        });
    }

    static select_donut(pers) {
        this.element.selectAll("#deselection").remove()

        this.element.selectAll(`g:not(#${pers})`)
            .append("circle")
            .attr("id", "deselection")
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("r", this.pic_size)
            .attr("fill-opacity", 0.5)
            .attr("fill", "black")
    }
}
