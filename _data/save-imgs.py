import os
import csv
import requests
import re
import time
import random
from pathlib import Path
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
from bs4 import BeautifulSoup

# 配置
CSV_FILES = ['books','movies', 'games']
SAVE_DIR = path = str(Path(__file__).resolve().parent.parent) + '/assets/acg-covers'

# 创建保存目录
if not os.path.exists(SAVE_DIR):
    os.makedirs(SAVE_DIR)

def sanitize_filename(filename):
    """清理文件名中的非法字符"""
    return re.sub(r'[\\/:*?"<>|]', '_', filename)

USER_AGENTS = [
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36"
    # ...可扩充更多 UA...
]

def make_session():
    s = requests.Session()
    retries = Retry(total=3, backoff_factor=1, status_forcelist=[429, 500, 502, 503, 504])
    s.mount("http://", HTTPAdapter(max_retries=retries))
    s.mount("https://", HTTPAdapter(max_retries=retries))
    s.headers.update({
        "User-Agent": random.choice(USER_AGENTS),
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "Accept-Language": "en,zh-CN;q=0.9,zh;q=0.8,zh-TW;q=0.7,ja;q=0.6",
        "accept-encoding": "gzip, deflate, br, zstd",
        "priority": "u=0, i",
        "sec-ch-ua-platform": "\"macOS\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua": "\"Not.A/Brand\";v=\"8\", \"Chromium\";v=\"120\", \"Google Chrome\";v=\"120\""
    })
    return s

def get_cover_url_from_page(session, page_url):
    """访问书籍页面并解析出封面 URL（尝试 og:image、#mainpic img 等）"""
    try:
        resp = session.get(page_url, timeout=10)
    except requests.RequestException as e:
        print(f"访问书页失败: {page_url} -> {e}")
        return None

    if resp.status_code == 418:
        print("书页返回 418，跳过")
        return None
    if resp.status_code >= 400:
        print(f"书页返回状态 {resp.status_code}，跳过")
        return None

    html = resp.text
    soup = BeautifulSoup(html, "html.parser")

    # 优先使用 Open Graph 的图片
    og = soup.find("meta", property="og:image")
    if og and og.get("content"):
        return og["content"]

    # 豆瓣页面常见位置
    img = soup.select_one("#mainpic img")
    if img and img.get("src"):
        return img["src"]

    # 兜底，找第一个带有豆瓣图片域的 img
    img = soup.find("img", src=re.compile(r"img\d+\.doubanio\.com"))
    if img and img.get("src"):
        return img["src"]

    return None

def download_images(CSV_FILE):
    print(f"开始处理 {CSV_FILE}...")
    print("当前工作目录:", str(Path.cwd()))
    print("脚本文件路径:", str(Path(__file__).resolve()))
    path = Path(__file__).resolve().parent
    print("脚本所在目录:", str(path))

    session = make_session()

    with (path / (CSV_FILE + ".csv")).open(mode='r', encoding='utf-8') as f:
        reader = csv.reader(f)
        for i, row in enumerate(reader):
            if not row:
                continue
            # 跳过表头（如果有）
            if i == 0 and row[0].strip().lower() == "title":
                continue
            try:
                book_title = row[0].strip()
                page_url = row[3].strip() if len(row) > 3 else ""
                csv_picurl = row[-1].strip() if row else ""

                img_url = None
                if page_url.startswith("http"):
                    print(f"访问书页以获取封面: {page_url}")
                    img_url = get_cover_url_from_page(session, page_url)
                    if img_url:
                        print(f"解析到封面: {img_url}")
                if not img_url and csv_picurl.startswith("http"):
                    img_url = csv_picurl
                    print(f"回退使用 CSV 中的 picurl: {img_url}")

                if not img_url:
                    print(f"跳过第 {i+1} 行：未找到封面 URL")
                    continue

                # 把 /l/ 替换成 /s/（更小尺寸）
                request_url = img_url.replace('/l/', '/s/')

                ext = os.path.splitext(request_url)[1].split('?')[0] or ".jpg"
                safe_title = CSV_FILE + "/" + sanitize_filename(book_title)
                file_path = Path(SAVE_DIR) / f"{safe_title}{ext}"
                file_dir = file_path.parent
                if not os.path.exists(file_dir):
                    os.makedirs(file_dir)
                print(f"保存路径: {file_path}")

                print(f"正在下载 [{book_title}] -> {request_url}")
                for attempt in range(4):
                    try:
                        headers = {
                            "User-Agent": random.choice(USER_AGENTS)
                        }
                        # 将 Referer 设置为书籍页面 URL（如果有）
                        if page_url:
                            headers["Referer"] = page_url
                        response = session.get(request_url, timeout=10, headers=headers)
                    except requests.RequestException as e:
                        print(f"请求错误（尝试 {attempt+1}）：{e}")
                        time.sleep(1 + attempt)
                        continue

                    if response.status_code == 418:
                        print(f"收到 418（尝试 {attempt+1}），更换 UA 并退避重试...")
                        session.headers["User-Agent"] = random.choice(USER_AGENTS)
                        time.sleep(2 ** attempt)
                        continue

                    try:
                        response.raise_for_status()
                    except Exception as e:
                        print(f"下载失败（状态 {response.status_code}）：{e}")
                        break

                    with file_path.open("wb") as img_file:
                        img_file.write(response.content)
                    break  # 成功则跳出重试循环

            except Exception as e:
                print(f"处理第 {i+1} 行时出错: {e}")

    print("\n任务完成！图片已保存至", SAVE_DIR)

if __name__ == "__main__":
    for CSV_FILE in CSV_FILES:
        download_images(CSV_FILE)