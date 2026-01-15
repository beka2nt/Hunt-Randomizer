let gameData = null;
let currentLang = 'zh'; // 默认中文

// UI 文本字典
const uiText = {
    zh: {
        btn: "生成随机配装",
        module: "生成模块",
        weap: "随机武器 (必选)",
        tool: "随机工具",
        cons: "随机消耗品",
        
        slot_config: "武器槽位组合",
        opt_31: "3 + 1 (大槽 + 小槽)",
        opt_32: "3 + 2 (大槽 + 中槽 / 军需官)",
        opt_22: "2 + 2 (中槽 + 中槽)",
        opt_21: "2 + 1 (中槽 + 小槽)",
        opt_11: "1 + 1 (小槽 + 小槽)",

        rule: "其他规则",
        med: "工具必带急救包",
        mel: "工具必带近战",
        
        h_trait: "特质 / 状态",
        h_weap: "武器",
        h_tool: "工具",
        h_cons: "消耗品",
        
        no_trait: "无特殊特质要求",
        qm_trait: "★ 建议携带：军需官 (Quartermaster) ★",
        
        slot_large: "主武器 (Large Slot)",
        slot_medium: "中槽武器 (Medium Slot)",
        slot_small: "副武器 (Small Slot)",
        
        lbl_total: "总花费",

        disabled: "- 未启用 -"
    },
    en: {
        btn: "GENERATE LOADOUT",
        module: "Modules",
        weap: "Random Weapons",
        tool: "Random Tools",
        cons: "Random Consumables",

        slot_config: "Slot Configuration",
        opt_31: "3 + 1 (Large + Small)",
        opt_32: "3 + 2 (Large + Medium / Quartermaster)",
        opt_22: "2 + 2 (Medium + Medium)",
        opt_21: "2 + 1 (Medium + Small)",
        opt_11: "1 + 1 (Small + Small)",

        rule: "Rules",
        med: "Force Medkit",
        mel: "Force Melee Tool",
        
        h_trait: "Trait / Status",
        h_weap: "Weapons",
        h_tool: "Tools",
        h_cons: "Consumables",
        
        no_trait: "No specific traits required",
        qm_trait: "★ Recommended: Quartermaster ★",
        
        slot_large: "PRIMARY (Large Slot)",
        slot_medium: "MEDIUM SLOT",
        slot_small: "SECONDARY (Small Slot)",

        lbl_total: "TOTAL COST",
        
        disabled: "- Disabled -"
    }
};

async function loadData() {
    try {
        const response = await fetch('./data.json');
        if (!response.ok) throw new Error("无法读取 data.json");
        gameData = await response.json();
        console.log("Data Loaded");
        document.getElementById('generateBtn').disabled = false;
        updateUIText(); 
    } catch (error) {
        console.error(error);
        alert("数据加载失败，请确保使用 Live Server 运行。");
    }
}

function toggleLanguage() {
    currentLang = currentLang === 'zh' ? 'en' : 'zh';
    updateUIText();
    if(document.getElementById('results').style.display !== 'none'){
        generateLoadout();
    }
}

function updateUIText() {
    const t = uiText[currentLang];
    
    document.getElementById('generateBtn').innerText = t.btn;
    document.getElementById('lbl_module').innerText = t.module;
    document.getElementById('lbl_weap').innerText = t.weap;
    document.getElementById('lbl_tool').innerText = t.tool;
    document.getElementById('lbl_cons').innerText = t.cons;
    
    document.getElementById('lbl_slot_config').innerText = t.slot_config;
    document.getElementById('opt_31').innerText = t.opt_31;
    document.getElementById('opt_32').innerText = t.opt_32;
    document.getElementById('opt_22').innerText = t.opt_22;
    document.getElementById('opt_21').innerText = t.opt_21;
    document.getElementById('opt_11').innerText = t.opt_11;

    document.getElementById('lbl_rule').innerText = t.rule;
    document.getElementById('lbl_med').innerText = t.med;
    document.getElementById('lbl_mel').innerText = t.mel;
    
    document.getElementById('h_trait').innerText = t.h_trait;
    document.getElementById('h_weap').innerText = t.h_weap;
    document.getElementById('h_tool').innerText = t.h_tool;
    document.getElementById('h_cons').innerText = t.h_cons;

    document.getElementById('lbl_total').innerText = t.lbl_total;
}

function getRandomItem(arr) {
    if (!arr || arr.length === 0) return { en: "None", zh: "无", price: 0 };
    return arr[Math.floor(Math.random() * arr.length)];
}

function shuffleArray(array) {
    let arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// 辅助函数：生成带价格的HTML
function renderItem(item) {
    const name = item[currentLang];
    const price = item.price || 0;
    return `<span>${name}</span><span class="price-tag">$${price}</span>`;
}

function generateLoadout() {
    if (!gameData) return;
    const t = uiText[currentLang];

    const slotConfig = document.getElementById('slotConfig').value; 
    const forceMed = document.getElementById('forceMedkit').checked;
    const forceMel = document.getElementById('forceMelee').checked;
    const enableTools = document.getElementById('doTools').checked;
    const enableCons = document.getElementById('doConsumables').checked;

    let totalCost = 0; // 总价初始化

    // 1. 武器逻辑
    let primaryObj = null;
    let secondaryObj = null;
    let traitDisplay = t.no_trait;
    let labelPrimary = "";
    let labelSecondary = "";

    switch (slotConfig) {
        case "3+1":
            primaryObj = getRandomItem(gameData.weaponsLarge);
            secondaryObj = getRandomItem(gameData.weaponsSmall);
            labelPrimary = t.slot_large;
            labelSecondary = t.slot_small;
            break;
        case "3+2":
            primaryObj = getRandomItem(gameData.weaponsLarge);
            secondaryObj = getRandomItem(gameData.weaponsMedium);
            traitDisplay = `<span class='quartermaster'>${t.qm_trait}</span>`;
            labelPrimary = t.slot_large;
            labelSecondary = t.slot_medium;
            break;
        case "2+2":
            primaryObj = getRandomItem(gameData.weaponsMedium);
            secondaryObj = getRandomItem(gameData.weaponsMedium);
            labelPrimary = t.slot_medium;
            labelSecondary = t.slot_medium;
            traitDisplay = `<span class='quartermaster'>${t.qm_trait}</span>`;
            break;
        case "2+1":
            primaryObj = getRandomItem(gameData.weaponsMedium);
            secondaryObj = getRandomItem(gameData.weaponsSmall);
            labelPrimary = t.slot_medium;
            labelSecondary = t.slot_small;
            break;
        case "1+1":
            primaryObj = getRandomItem(gameData.weaponsSmall);
            secondaryObj = getRandomItem(gameData.weaponsSmall);
            labelPrimary = t.slot_small;
            labelSecondary = t.slot_small;
            break;
    }

    // 累加武器价格
    totalCost += (primaryObj.price || 0);
    totalCost += (secondaryObj.price || 0);

    // 2. 工具逻辑
    const toolsDiv = document.getElementById('toolsList');
    if (enableTools) {
        let toolsPool = [...gameData.tools]; 
        let selectedTools = [];

        if (forceMed) {
            const medIndex = toolsPool.findIndex(t => t.en === "First Aid Kit");
            if (medIndex > -1) {
                selectedTools.push(toolsPool[medIndex]);
                toolsPool.splice(medIndex, 1);
            }
        }

        if (forceMel) {
            const meleeOptions = toolsPool.filter(t => 
                t.en === "Knife" || t.en === "Dusters" || t.en === "Knuckle Knife" || t.en === "Heavy Knife"
            );
            if (meleeOptions.length > 0) {
                const choice = getRandomItem(meleeOptions);
                selectedTools.push(choice);
                toolsPool = toolsPool.filter(t => t.en !== choice.en);
            }
        }

        toolsPool = shuffleArray(toolsPool);
        while (selectedTools.length < 4 && toolsPool.length > 0) {
            selectedTools.push(toolsPool.pop());
        }
        
        // 渲染并累加价格
        toolsDiv.innerHTML = selectedTools.map(item => {
            totalCost += (item.price || 0);
            return `<div class="item">${renderItem(item)}</div>`;
        }).join('');
    } else {
        toolsDiv.innerHTML = `<div class="sub-text">${t.disabled}</div>`;
    }

    // 3. 消耗品逻辑
    const consDiv = document.getElementById('consumablesList');
    if (enableCons) {
        let selectedCons = [];
        for (let i = 0; i < 4; i++) {
            selectedCons.push(getRandomItem(gameData.consumables));
        }
        
        // 渲染并累加价格
        consDiv.innerHTML = selectedCons.map(item => {
            totalCost += (item.price || 0);
            return `<div class="item">${renderItem(item)}</div>`;
        }).join('');
    } else {
        consDiv.innerHTML = `<div class="sub-text">${t.disabled}</div>`;
    }

    // 4. 渲染结果
    document.getElementById('traitResult').innerHTML = traitDisplay;
    
    document.getElementById('primarySlotLabel').innerText = labelPrimary;
    document.getElementById('primaryWeapon').innerHTML = renderItem(primaryObj);
    
    document.getElementById('secondarySlotLabel').innerText = labelSecondary;
    document.getElementById('secondaryWeapon').innerHTML = renderItem(secondaryObj);

    // 显示总价格
    document.getElementById('totalCostValue').innerText = `$${totalCost}`;

    document.getElementById('results').style.display = 'grid';
}

window.onload = loadData;