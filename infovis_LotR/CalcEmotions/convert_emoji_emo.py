import json
import collections
import numpy as np

with open("LOTR1_emojis.json", encoding='utf-8') as f:
	data = json.load(f)


fullMovieDict ={}

#Store all data efficiently in a nested dictionary
for scene in data:
	sceneCharDict = {}
	print("this is scene " + scene)
	for character in data[scene]:
		print("this is character " + character)
		print("this character main emoji is " + str(data[scene][character][2]))
		#creates a 2-dimensional array which stores the emoji index and its corresponding confidence
		sceneCharDict[character] = []
		for i in range(5):
			sceneCharDict[character].append([data[scene][character][i+2], data[scene][character][i+7]])
	fullMovieDict[scene] = sceneCharDict

#test if it works correctly:
#print(fullMovieDict["168"])

angerList = [32,37,42,55]
disgustList = [1,22,19,38,43,45,52,56]
fearList = [2, 51]
happinesList = [0,4,6,7,8,10,11,15,16,17,18,21,23,24,30,31,33,36,47,50,53,54,57,59,60,61,62,63]
sadList = [3,22,27,29,34,35,39,43,46]
surpriseList= [12,20,28] 
   
emotionList = [angerList, disgustList,fearList,happinesList, sadList,surpriseList]

def convert_emoji_emo2(emoji_scores):
	emotion_Total_List = [0,0,0,0,0,0,0]
	emotion_Percentage_List = [0,0,0,0,0,0,0]
	
	for i in range(5):
		#print(emoji_scores[i][0])
		for j in range(7):
			if(j == 6):
				#print("unknown")
				emotion_Total_List[j] = emotion_Total_List[j] + emoji_scores[i][1]
			else:
				if(emoji_scores[i][0] in emotionList[j]):
						#print(emotionList[j])
						emotion_Total_List[j] += emoji_scores[i][1]
						continue
	emotionarray = np.array(emotion_Total_List)

	emotion_Percentage_List = emotionarray/np.sum(emotionarray)
	return emotion_Percentage_List.tolist()
		
	
#convert_emoji_emo2(fullMovieDict["168"]["GIMLI"])

fullOutputDict = {}
for scene in fullMovieDict:
	sceneOutputDict = {}
	for character in fullMovieDict[scene]:
		print("emotions for character " + character)
		print(convert_emoji_emo2(fullMovieDict[scene][character]))
		sceneOutputDict[character] = convert_emoji_emo2(fullMovieDict[scene][character])
	fullOutputDict[scene] = sceneOutputDict
	

with open('all_emotions_percentages.json', 'w') as fp:
    json.dump(fullOutputDict, fp,indent=4)
print("finished without error")
