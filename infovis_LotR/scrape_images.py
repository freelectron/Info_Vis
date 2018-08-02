from selenium import webdriver
from bs4 import *
import os
import json
import requests

driver = webdriver.PhantomJS()
driver.set_window_size(1024, 768) # optional

UNKOWN_IMAGE_HREF = "https://vignette.wikia.nocookie.net/projectutopiarp/images/d/dd/Unknown.png/revision/latest?cb=20110622112402"

def get_soup_with_javascript(url):
    driver.get(url)

    return BeautifulSoup(driver.page_source, "lxml")

def get_soup(url):
    return BeautifulSoup(requests.get(url).text, "lxml")

def get_wiki_href(name, site):
    url = "https://duckduckgo.com/?q={0}+site:{1}&t=ffab&ia=web".format(name, site)

    soup = get_soup_with_javascript(url)
    if not soup: return None

    return soup.find("div", {"id": "r1-0"}).find("a")["href"]

def get_picture_href(wiki_href):
    soup = get_soup(wiki_href)

    try:
        return soup.find("aside").find("figure").find("img")["src"]
    except AttributeError:
        print("Picture not found")
        return UNKOWN_IMAGE_HREF

def download_image(image_href, save_name):
    command = "wget -c %s -O images/%s -o debug.txt" % (image_href, save_name)

    os.system(command)

def get_script_json_names(json_path):
    with open(json_path, "r") as f:
        data = json.load(f)

    return set(sum([x['characters'] for x in data.values()], []))


if __name__ == "__main__":

    path = "jsons/"
    names = set()
    downloaded = set(os.listdir("images"))

    for json_path in os.listdir(path):
        names = names.union(get_script_json_names(path + json_path))

    names = names.difference(downloaded)

    for name in names:
        wiki = get_wiki_href(name, "lotr.wikia.com")
        picture = get_picture_href(wiki)

        download_image(picture, name)

    driver.close()
