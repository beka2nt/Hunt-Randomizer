let gameData = null;
let currentLang = 'zh'; // 默认中文 'zh' 或 'en'

// UI 文本字典
const uiText = {
    zh: {
        btn: "生成随机配装",
        module: "生成模块",
        weap: "随机武器 (必选)",
        tool: "随机工具",
        cons: "随机消耗品",
        rule: "规则约束",
        qm: "启用“军需官”配装 (大槽+中槽)",
        med: "工具必带急救包",
        mel: "工具必带近战",
        h_trait: "特质 / 状态",
        h_weap: "武器",
        h_tool: "工具",
        h_cons: "消耗品",
        no_trait: "无特质",
        qm_trait: "★ 军需官 (Quartermaster) ★",
        qm_slot: "MEDIUM SLOT (军需官加成)",
        small_slot: "SMALL SLOT",
        disabled: "- 未启用 -"
    },
    en: {
        btn: "GENERATE LOADOUT",
        module: "Modules",
        weap: "Random Weapons",
        tool: "Random Tools",
        cons: "Random Consumables",
        rule: "Rules",
        qm: "Force Quartermaster (Large + Medium)",
        med: "Force Medkit",
        mel: "Force Melee Tool",
        h_trait: "Trait / Status",
        h_weap: "Weapons",
        h_tool: "Tools",
        h_cons: "Consumables",
        no_trait: "No Traits",
        qm_trait: "★ Quartermaster ★",
        qm_slot: "MEDIUM SLOT (Quartermaster)",
        small_slot: "SMALL SLOT",
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
        updateUIText(); // 初始化界面文字
    } catch (error) {
        console.error(error);
        alert("数据加载失败，请确保使用 Live Server 运行。");
    }
}

// 切换语言
function toggleLanguage() {
    currentLang = currentLang === 'zh' ? 'en' : 'zh';
    updateUIText();
    // 如果已经生成了结果，直接重新生成一次刷新文字
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
    document.getElementById('lbl_rule').innerText = t.rule;
    document.getElementById('lbl_qm').innerText = t.qm;
    document.getElementById('lbl_med').innerText = t.med;
    document.getElementById('lbl_mel').innerText = t.mel;
    
    document.getElementById('h_trait').innerText = t.h_trait;
    document.getElementById('h_weap').innerText = t.h_weap;
    document.getElementById('h_tool').innerText = t.h_tool;
    document.getElementById('h_cons').innerText = t.h_cons;
}

function getRandomItem(arr) {
    if (!arr || arr.length === 0) return { en: "None", zh: "无" };
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

function generateLoadout() {
    if (!gameData) return;
    const t = uiText[currentLang];

    // 获取开关
    const useQuartermaster = document.getElementById('allowQuartermaster').checked;
    const forceMed = document.getElementById('forceMedkit').checked;
    const forceMel = document.getElementById('forceMelee').checked;
    const enableTools = document.getElementById('doTools').checked;
    const enableCons = document.getElementById('doConsumables').checked;

    // 1. 特质
    let hasQuartermaster = false;
    let traitDisplay = t.no_trait;

    if (useQuartermaster) {
        hasQuartermaster = true;
        traitDisplay = `<span class='quartermaster'>${t.qm_trait}</span>`;
    }

    // 2. 武器
    // 数据现在是对象 {en:..., zh:...}，我们取 currentLang
    const primaryObj = getRandomItem(gameData.weaponsLarge);
    const primaryName = primaryObj[currentLang];

    let secondaryObj = null;
    let secSlotLabel = t.small_slot;

    if (hasQuartermaster) {
        secondaryObj = getRandomItem(gameData.weaponsMedium);
        secSlotLabel = t.qm_slot;
    } else {
        secondaryObj = getRandomItem(gameData.weaponsSmall);
        secSlotLabel = t.small_slot;
    }
    const secondaryName = secondaryObj[currentLang];

    // 3. 工具
    const toolsDiv = document.getElementById('toolsList');
    if (enableTools) {
        let toolsPool = [...gameData.tools]; // 复制对象数组
        let selectedTools = [];

        // 辅助检测函数：检查 selectedTools 里是否已经有了某个英文名的道具
        const hasTool = (enName) => selectedTools.some(tool => tool.en.includes(enName));

        // 强制急救包
        if (forceMed) {
            // 找到急救包对象
            const medIndex = toolsPool.findIndex(t => t.en === "First Aid Kit");
            if (medIndex > -1) {
                selectedTools.push(toolsPool[medIndex]);
                toolsPool.splice(medIndex, 1);
            }
        }

        // 强制近战
        if (forceMel) {
            // 筛选近战类
            const meleeOptions = toolsPool.filter(t => 
                t.en === "Knife" || t.en === "Dusters" || t.en === "Knuckle Knife" || t.en === "Heavy Knife"
            );
            if (meleeOptions.length > 0) {
                const choice = getRandomItem(meleeOptions);
                selectedTools.push(choice);
                // 从池子里移除选中的
                toolsPool = toolsPool.filter(t => t.en !== choice.en);
            }
        }

        toolsPool = shuffleArray(toolsPool);
        while (selectedTools.length < 4 && toolsPool.length > 0) {
            selectedTools.push(toolsPool.pop());
        }

        toolsDiv.innerHTML = selectedTools.map(item => `<div class="item">${item[currentLang]}</div>`).join('');
    } else {
        toolsDiv.innerHTML = `<div class="sub-text">${t.disabled}</div>`;
    }

    // 4. 消耗品
    const consDiv = document.getElementById('consumablesList');
    if (enableCons) {
        let selectedCons = [];
        for (let i = 0; i < 4; i++) {
            const item = getRandomItem(gameData.consumables);
            selectedCons.push(item);
        }
        consDiv.innerHTML = selectedCons.map(item => `<div class="item">${item[currentLang]}</div>`).join('');
    } else {
        consDiv.innerHTML = `<div class="sub-text">${t.disabled}</div>`;
    }

    // 渲染 UI
    document.getElementById('traitResult').innerHTML = traitDisplay;
    document.getElementById('primaryWeapon').innerText = primaryName;
    document.getElementById('secSlotLabel').innerText = secSlotLabel;
    document.getElementById('secondaryWeapon').innerText = secondaryName;

    document.getElementById('results').style.display = 'grid';
}

window.onload = loadData;