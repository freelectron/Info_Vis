import os

path = "./pdfs"
for x in os.listdir(path):
    command = "pdftotext -layout ./pdfs/%s ./scripts/%s" % (x, x[:-4] + ".txt")
    print(command)
    os.system(command)
