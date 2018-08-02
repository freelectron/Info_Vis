import os
import itertools
import re
import numpy as np
import json

ENCODING = "utf8"

def find_scene_ranges(path):
    scene_tuples = []

    with open(path, "r", encoding=ENCODING) as f:
        old = 0

        for index, line in enumerate(f):
            if "INT." in line or "EXT." in line:
                scene_tuples.append((old, index))
                old = index

    return scene_tuples

def open_scene(index_range, path):
    start, end = index_range

    with open(path, "r", encoding=ENCODING) as text_file:
        return np.array([x.rstrip() for x in itertools.islice(text_file, start, end) if x.rstrip() != ""])

def find_characters_indexes(scene_lst):
    return [i for i, x in enumerate(scene_lst) if re.match(r" +([A-Z]{2,})", x) and ":" not in x]

def find_charecter_text(scene_lst):
    char_indexes = find_characters_indexes(scene_lst)
    characters = [re.match(r"\(.*?\)| +(\w{2,})", x).group(1) for x in scene_lst[char_indexes]]

    n_chars = len(char_indexes)
    text = []

    for i in range(n_chars):
        if i + 1 == n_chars:
            end = None
        else:
            end = char_indexes[i+1]

        line = " ".join(
            [" ".join(re.findall(r" \(.*?\)|([\w'’.!,?;]+)", line))
             for line in scene_lst[char_indexes[i]+1: end]
             if line.lstrip() != line and line.upper() != line
             if "Final Revision" not in line]).strip().replace("’", "'")

        if not line:
            characters[i] = None
            continue

        text.append(line)

    return zip([x for x in characters if x], text)

def parse_location(location_str):
    splt = location_str.split(" ")

    outside = "EXT" == splt.pop(0)
    time = splt.pop()
    location = " ".join([x for x in splt if x != "-"])

    return outside, time, location

def parse_scene(scene_lst):
    outside, time, location = parse_location(scene_lst[0])

    text = list(find_charecter_text(scene_lst))
    characters = list(set([x[0] for x in text]))

    return {
        "outside": outside,
        "time": time,
        "location": location,
        "text": text,
        "length": sum([len(x) for _, x in text]),
        "characters": characters
    }

def parse_script(path, save_location):
    scene_tuples = find_scene_ranges(path)
    data = {}

    for i, scene in enumerate(scene_tuples[1:]):
        data[i] = parse_scene(open_scene(scene, path))

    with open(save_location, 'wb') as f:
        dump = json.dumps(data, indent=2, sort_keys=True, ensure_ascii=False)
        f.write(dump.encode(ENCODING))


if __name__ == "__main__":
    path = "scripts/"

    for file in os.listdir(path):
        parse_script(path + file, "jsons/%s.json" % file[:-4])
