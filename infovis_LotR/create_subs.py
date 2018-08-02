import json
import os

def create_subs(data):
    subs = []
    old = 0

    for scene, d in sorted(data.items(), key=lambda x: int(x[0])):
        for line in d['text']:
            length = len(line[1])

            subs.append([old, length + old, scene] + line)

            old += length

    return subs


if __name__ == "__main__":

    for file in os.listdir("jsons"):
        with open("jsons/" + file, "r") as f:
            data = json.load(f)

        subs = create_subs(data)

        with open("subs/" + file, "w") as f:
            json.dump(subs, f, indent=2)
