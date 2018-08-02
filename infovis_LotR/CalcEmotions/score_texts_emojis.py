# -*- coding: utf-8 -*-

"""
This file takes the json script file as input and calculates all the top 5 emojis for all lines by each character during each scene and prints this to a new json file

"""

import json
import io
import collections
import numpy as np
from deepmoji.sentence_tokenizer import SentenceTokenizer
from deepmoji.model_def import deepmoji_emojis
from deepmoji.global_variables import PRETRAINED_PATH, VOCAB_PATH

OUTPUT_PATH = 'test_sentences.csv'

with io.open("LordoftheRings1_FOTR.json", encoding='utf-8') as f:
	data = json.load(f)
	data = {int(k):dict(v) for k,v in data.items()}
	data = collections.OrderedDict(sorted(data.items()))


sceneCharLines = {}
location_code = 0
for scene in data:
	#this will contain all chars in this scene as keys
	charSpeechDict= {}
	#instantiate a list where all of the characters lines in this scene will be concatenated
	for character in data[scene]["characters"]:
		charSpeechDict[character] = ""
	for line in data[scene]["text"]:
		if line[1] != "":
			charSpeechDict[line[0]] += " " + line[1]
	sceneCharLines[scene] = charSpeechDict


def top_elements(array, k):
    ind = np.argpartition(array, -k)[-k:]
    return ind[np.argsort(array[ind])][::-1]


maxlen = 100
batch_size = 32


#Loading DeepMoji stuff
print('Tokenizing using dictionary from {}'.format(VOCAB_PATH))
with open(VOCAB_PATH, 'r') as f:
    vocabulary = json.load(f)
st = SentenceTokenizer(vocabulary, maxlen)
print('Loading model from {}.'.format(PRETRAINED_PATH))
model = deepmoji_emojis(maxlen, PRETRAINED_PATH)
model.summary()

outputSceneChar = {}
for scene in sceneCharLines:
	print(scene)
	outputCharEmo = {}
	for character in sceneCharLines[scene]:
		allText = sceneCharLines[scene][character]
		#some characters say nothing, this line excludes them in order to avoid error
		if( allText == "" ):
			continue
		#tokenize and calc emoji scores
		tokenized, _, _ = st.tokenize_sentences([allText])
		prob = model.predict(tokenized)
		t_tokens = tokenized[0]
		t_score = [allText]
		t_prob = prob[0]
		ind_top = top_elements(t_prob, 5)
		t_score.append(sum(t_prob[ind_top]))
		t_score.extend(map(int, ind_top))
		t_score.extend([float(t_prob[ind]) for ind in ind_top])
		outputCharEmo[character] = t_score
	outputSceneChar[scene] = outputCharEmo
		
outputSceneChar = collections.OrderedDict(sorted(outputSceneChar.items()))
#outputSceneChar  = {str(k):dict(v) for k,v in outputSceneChar.items()}
		
with open('all_emojis.json', 'w') as fp:
    json.dump(outputSceneChar, fp,indent=4)
print("finished without error")
