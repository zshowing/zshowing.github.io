import pandas as pd
import requests
import shutil
import datetime
import pytz
import os
import re
import io
from PIL import Image

IMAGE_BASE_DIR = './assets/acg-covers'
SAVE_PATHS = {
    'book': os.path.join(IMAGE_BASE_DIR, 'books'),
    'movie': os.path.join(IMAGE_BASE_DIR, 'movies'),
    'game': os.path.join(IMAGE_BASE_DIR, 'games')
}

headers = {
  'Accept': '*/*',
  'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8,zh-TW;q=0.7,ja;q=0.6',
  'Connection': 'keep-alive',
  'Cookie': 'bid=7zyg7vIr5Go; ll="108288"; __utmc=30149280; dbcl2="1413857:x3ei+7EvR20"; ck=67nb; push_doumail_num=0; __utmv=30149280.141; douban-fav-remind=1; ct=y; frodotk="b325bdb8c6e2d4401971392a54a87cc0"; talionusr="eyJpZCI6ICIxNDEzODU3IiwgIm5hbWUiOiAiU2hvd2luZyBWMS40LjEifQ=="; frodotk_db="cbd21e88d2f04c5563765b9a78d0e4ff"; gr_user_id=6c78f367-848e-45ac-9030-2a4b54e4cb0f; push_noty_num=0; __utmz=30149280.1678360558.60.6.utmcsr=google|utmccn=(organic)|utmcmd=organic|utmctr=(not%20provided); __utma=30149280.1533361119.1677587027.1678434211.1678442707.64; ap_v=0,6.0; bid=vi1-QrygRos',
  'Sec-Fetch-Dest': 'empty',
  'Sec-Fetch-Mode': 'cors',
  'Sec-Fetch-Site': 'none',
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36',
  'referer': 'https://m.douban.com/',
  'sec-ch-ua': '"Chromium";v="110", "Not A(Brand";v="24", "Google Chrome";v="110"',
  'sec-ch-ua-mobile': '?0',
  'sec-ch-ua-platform': '"macOS"'
}

loadtypes = ['movie', 'book', 'game']

def read_latest_data(csv_file):
    df_data = pd.read_csv(csv_file, header=0, nrows=1)
    return df_data

def sanitize_filename(filename):
    """清理文件名中的非法字符"""
    return re.sub(r'[\\/:*?"<>|]', '_', filename)

def download_and_convert_image(url, title, searchtype):
    """下载图片并统一转换为 jpg 格式"""
    folder = SAVE_PATHS.get(searchtype)
    if not os.path.exists(folder):
        os.makedirs(folder)
    
    safe_title = sanitize_filename(title)
    target_path = os.path.join(folder, f"{safe_title}.jpg")
    
    # 如果本地已存在该图片，则跳过下载
    if os.path.exists(target_path):
        return

    try:
        print(f"  -> 正在下载封面: {title}...")
        response = requests.get(url, headers=headers, timeout=20)
        response.raise_for_status()
        
        # 使用 Pillow 处理图片
        img = Image.open(io.BytesIO(response.content))
        if img.mode in ("RGBA", "P"):
            img = img.convert("RGB")
        
        img.save(target_path, "JPEG", quality=90)
        print(f"  -> 已保存至: {target_path}")
    except Exception as e:
        print(f"  -> 下载失败 [{title}]: {e}")

def save_data(csv_file, data):
	df = pd.read_csv(csv_file)
	new_df = pd.DataFrame([data])
	df = pd.concat([df, new_df], ignore_index=True)
	df.to_csv('your_csv_file.csv', index=False)

def read_website_data(latest_data, searchtype):
	found = False
	index = 0
	targettitle = latest_data.iloc[0]['title']
	data = []
	df = pd.read_csv('./_data/' + searchtype + 's.csv')
	isFirst = True
	while not found:
		url = "https://m.douban.com/rexxar/api/v2/user/1413857/interests?type="+searchtype+"&status=done&start="+str(index)+"&count=50&ck=67nb&for_mobile=1"
		response = requests.request("GET", url, headers=headers)
		result = response.json()
		rows = result['interests']
		if len(rows) == 0:
			return []

		for row in rows:
			title = row['subject']['title']
			comment = row['comment']
			if 'rating' in row and row['rating'] is not None:
				mine = float(row['rating']['value'])
			else:
				mine = ""
			description = row['subject']['card_subtitle']
			link = row['subject']['url']
			picurl = row['subject']['cover_url']
			tags = ','.join(row['tags'])
			rating = row['subject']['rating']['value']
			date = row['create_time']
			# new_row = {'title': title, 'description': description, 'rating': rating, 'link': link, 'date': date, 'mine': mine, 'tags': tags, 'comment': comment, 'visibility': 'public', 'istop': False, 'istopmanga': False}
			print("Found ",title, description, rating, link, date, mine, tags, comment)
			if title == targettitle:
				found = True
				if isFirst:
					isFirst = False
					break
				shutil.copy('./_data/' + searchtype + 's.csv', './_data/' + searchtype + 's_backup.csv')
				df_new = pd.DataFrame(data, columns=df.columns)
				df_combined = pd.concat([df_new, df], ignore_index=True)
				df_combined.to_csv('./_data/' + searchtype + 's.csv', index=False)

				tz = pytz.timezone('Asia/Shanghai')
				now = datetime.datetime.now(tz)
				html = '<p style="font-size: 0.8em; color: #666">最后更新时间：{}</p>'.format(now.strftime('%Y-%m-%d %H:%M'))
				directory = './_includes'
				if not os.path.exists(directory):
					os.makedirs(directory)
				with open('./_includes/csv-update-date.html', 'w+') as f:
					f.write(html)
				break
			else:
				isFirst = False
				if searchtype == 'book':
					data.append([title, description, rating, link, date, mine, tags, comment, 'public', '', '', picurl])
				elif searchtype == 'game':
					data.append([title, description, rating, link, date, mine, tags, comment, 'public', '', picurl])
				elif searchtype == 'movie':
					data.append([title, description, rating, link, date, mine, tags, comment, 'public', '', '', '', picurl])
				download_and_convert_image(picurl, title, searchtype)
			index += 50

# 主函数
def main():
	for loadtype in loadtypes:
		latest_data = read_latest_data('./_data/' + loadtype + 's.csv')
		data = read_website_data(latest_data, loadtype)

if __name__ == '__main__':
    main()