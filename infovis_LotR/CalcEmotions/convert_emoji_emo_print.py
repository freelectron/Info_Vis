import json
import collections
import numpy as np

with io.open("LOTR1_emojis.json", encoding='utf-8') as f:
	data = json.load(f)
	data = {int(k):dict(v) for k,v in data.items()}
	data = collections.OrderedDict(sorted(data.items()))


for scene in data:
	print(data(scene))

