from bs4 import BeautifulSoup
import json
import re
import os

# 刚才保存的文件名
LOCAL_FILE = "Weapons.html"

# 结果容器
data_structure = {
    "weaponsLarge": [],
    "weaponsMedium": [],
    "weaponsSmall": []
}

def clean_price(text):
    """提取价格数字，去掉 $ 和 ,"""
    if not text:
        return 0
    nums = re.findall(r'\d+', text.replace(',', ''))
    if nums:
        return int(nums[0])
    return 0

def clean_name(cell):
    """提取武器名称"""
    # 有时候名字在 <a> 标签里，有时候在 <b> 里
    text = cell.get_text().strip()
    return text

def determine_slot(cell):
    """
    判断槽位大小。
    Wiki 本地保存后，图片 alt 属性通常还在。
    """
    text = cell.text.strip().lower()
    img = cell.find('img')
    img_info = ""
    if img:
        # 本地文件有时候 src 变成了 base64 或者本地路径，所以主要靠 alt
        img_info = (img.get('alt', '')).lower()

    # 判断逻辑
    if "large" in text or "large" in img_info or "slot_3" in img_info:
        return "Large"
    if "medium" in text or "medium" in img_info or "slot_2" in img_info:
        return "Medium"
    if "small" in text or "small" in img_info or "slot_1" in img_info:
        return "Small"
            
    return "Unknown"

def scrape_local_file():
    if not os.path.exists(LOCAL_FILE):
        print(f"错误：找不到文件 {LOCAL_FILE}")
        print("请先用浏览器打开 https://huntshowdown.wiki.gg/wiki/Weapons")
        print("然后右键'另存为'，保存为 Weapons.html，放在本脚本同级目录下。")
        return

    print(f"正在读取本地文件: {LOCAL_FILE} ...")
    
    with open(LOCAL_FILE, 'r', encoding='utf-8') as f:
        html_content = f.read()

    soup = BeautifulSoup(html_content, 'html.parser')
    
    # 查找页面上所有的表格
    tables = soup.find_all('table', class_='wikitable')
    print(f"找到 {len(tables)} 个表格，开始解析...")

    count = 0
    
    for table_index, table in enumerate(tables):
        # 尝试寻找表头
        headers = [th.text.strip().lower() for th in table.find_all('th')]
        
        # 定位关键列的索引
        name_idx = -1
        cost_idx = -1
        slot_idx = -1

        for i, h in enumerate(headers):
            if "weapon" in h or "item" in h:
                name_idx = i
            elif "cost" in h or "price" in h:
                cost_idx = i
            elif "slot" in h:
                slot_idx = i
        
        # 如果这个表格没有价格列或名字列，可能不是武器表，跳过
        if name_idx == -1 or cost_idx == -1:
            continue

        # 遍历每一行
        rows = table.find_all('tr')
        for row in rows:
            cols = row.find_all(['td', 'th'])
            # 简单的跳过表头行或合并行
            if len(cols) <= max(name_idx, cost_idx):
                continue

            # 1. 获取名字
            # 注意：第一列有时候是 th (表头) 有时候是 td
            try:
                name_en = clean_name(cols[name_idx])
            except IndexError:
                continue
            
            # 过滤掉标题行
            if name_en.lower() in ["weapon", "item", "melee weapons", "firearms"]:
                continue
            
            # 2. 获取价格
            try:
                price_text = cols[cost_idx].text
                price = clean_price(price_text)
            except IndexError:
                price = 0

            # 3. 获取槽位
            slot_size = "Unknown"
            if slot_idx != -1:
                try:
                    slot_size = determine_slot(cols[slot_idx])
                except IndexError:
                    pass
            
            # 简单的修正：如果槽位没检测出来，默认可能是 Large (通常 Wiki 的第一张表是 Large)
            # 或者你可以根据已有数据做容错。
            # 这里如果不确定槽位，我们先标记，方便你手动查
            
            # 构造数据
            item_data = {
                "en": name_en,
                "zh": name_en, # 占位，需手动翻译
                "price": price
            }

            # 只有价格大于0或者有明确槽位的才收录，过滤杂数据
            if price >= 0: 
                if slot_size == "Large":
                    data_structure["weaponsLarge"].append(item_data)
                    count += 1
                elif slot_size == "Medium":
                    data_structure["weaponsMedium"].append(item_data)
                    count += 1
                elif slot_size == "Small":
                    data_structure["weaponsSmall"].append(item_data)
                    count += 1
                else:
                    # 如果没识别出槽位，暂时打印出来，不加入 JSON
                    # print(f"未识别槽位: {name_en}")
                    pass

    print(f"解析完成！共提取到 {count} 把武器。")
    
    # 保存到文件
    output_file = "scraped_data.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(data_structure, f, ensure_ascii=False, indent=2)
    
    print(f"✅ 数据已保存到 {output_file}")
    print("请打开该文件，复制你需要的内容补充到 data.json 中。")

if __name__ == "__main__":
    scrape_local_file()