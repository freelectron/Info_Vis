const get_sub_data = (location) => {
    return new Promise(function(resolve, reject) {
        $.getJSON(location, (json) => {
            resolve(json)
        });
    });
}

var init_sub_shower = async (location, output_div) => {
    var json = await get_sub_data(location)
    var current_index = 0;

    var sub_shower = (time_point) => {
        [start, end, scene, speaker, line] = json[current_index]

        if (time_point >= start && time_point <= end) {
            output_div.html("<b style='text-transform:capitalize'>" + speaker.toLowerCase() + "</b>: " + line)
            return json[current_index]
        } else if (time_point > end) {
            current_index += 1
            return sub_shower(time_point)
        } else if (time_point < start) {
            current_index -= 1
            return sub_shower(time_point)
        }
    }

    return sub_shower
}
