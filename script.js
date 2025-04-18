const STORAGE_KEY = 'palettes';

// DOM 요소 참조
const categoryList = document.getElementById("category-list");
const paletteList = document.getElementById("palette-list");
const form = document.getElementById("palette-form");
const nameInput = document.getElementById("color-name");
const colorInput = document.getElementById("color-value");

// 팝업 엘리먼트 생성 및 추가 (삭제 버튼 포함)
const popup = document.createElement('div');
popup.className = 'popup-info';
popup.innerHTML = `
    <button class="close-btn" title="닫기">&times;</button>
    <div class="color-name"></div>
    <div class="color-code"></div>
    <button class="delete-btn">삭제</button>
`;
document.body.appendChild(popup);

const popupName = popup.querySelector('.color-name');
const popupCode = popup.querySelector('.color-code');
const closeBtn = popup.querySelector('.close-btn');
const deleteBtn = popup.querySelector('.delete-btn');

closeBtn.onclick = () => {
    popup.style.display = 'none';
};

// 데이터 저장 및 상태 변수
let palettes = []; // 현재 렌더링할 배열
let categorizedPalettes = {}; // { 카테고리명: [색상객체,...] }
let currentCategory = null;

// --- 색상 HEX → RGB 변환 ---
function hexToRgb(hex) {
    hex = hex.replace('#', '');
    if (hex.length === 3) {
        hex = hex.split('').map(x => x + x).join('');
    }
    const bigint = parseInt(hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return { r, g, b };
}

// --- RGB → HSL 변환 ---
function rgbToHsl({ r, g, b }) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if(max === min){
        h = s = 0; // 무채색
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch(max){
            case r: h = ((g - b) / d) + (g < b ? 6 : 0); break;
            case g: h = ((b - r) / d) + 2; break;
            case b: h = ((r - g) / d) + 4; break;
        }
        h /= 6;
    }
    return { h: h * 360, s, l };
}

// --- Hue 기준 카테고리 분류 ---
function categorizeColor(hex) {
    const rgb = hexToRgb(hex);
    const hsl = rgbToHsl(rgb);
    const h = hsl.h;

    if (h >= 0 && h < 15) return 'Red';
    if (h >= 15 && h < 45) return 'Orange';
    if (h >= 45 && h < 75) return 'Yellow';
    if (h >= 75 && h < 150) return 'Green';
    if (h >= 150 && h < 210) return 'Cyan';
    if (h >= 210 && h < 270) return 'Blue';
    if (h >= 270 && h < 330) return 'Purple';
    if (h >= 330 && h <= 360) return 'Red';
    return 'Others';
}

// localStorage 저장
function savePalettes() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(categorizedPalettes));
}

// localStorage 불러오기
function loadPalettesFromStorage() {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return false;
    try {
        categorizedPalettes = JSON.parse(data);
        return true;
    } catch {
        return false;
    }
}

// 렌더링 함수
function render() {
    paletteList.innerHTML = "";

    palettes.forEach(p => {
        const card = document.createElement("div");
        card.className = "palette-card";
        card.dataset.name = p.name;
        card.dataset.color = p.color;
        card.dataset.id = p.id;

        const colorBox = document.createElement("div");
        colorBox.className = "color-box";
        colorBox.style.backgroundColor = p.color;

        card.appendChild(colorBox);
        paletteList.appendChild(card);
    });
}

// 카테고리 버튼 렌더링
function renderCategoryList() {
    categoryList.innerHTML = "";
    const cats = Object.keys(categorizedPalettes);
    cats.forEach(cat => {
        const btn = document.createElement("button");
        btn.textContent = cat;
        btn.style.marginRight = "8px";
        btn.onclick = () => {
            selectCategory(cat);
            highlightSelectedCategory(cat);
        };
        categoryList.appendChild(btn);
    });

    // 첫 카테고리 자동 선택 및 강조
    if (cats.length > 0) {
        selectCategory(cats[0]);
        highlightSelectedCategory(cats[0]);
    }
}

// 선택된 카테고리 강조 표시
function highlightSelectedCategory(selectedCat) {
    Array.from(categoryList.children).forEach(btn => {
        if (btn.textContent === selectedCat) {
            btn.classList.add('selected');
        } else {
            btn.classList.remove('selected');
        }
    });
}

// 선택한 카테고리 초기화 및 첫 페이지 로드
function selectCategory(category) {
    currentCategory = category;
    palettes = categorizedPalettes[currentCategory] ? [...categorizedPalettes[currentCategory]] : [];
    render();
}

// JSON 색상 불러와 분류
async function loadAndCategorizeColors() {
    if (loadPalettesFromStorage()) {
        renderCategoryList();
        selectCategory(Object.keys(categorizedPalettes)[0]);
        console.log('카테고리 목록 (로컬스토리지):', Object.keys(categorizedPalettes));
        return;
    }

    try {
        const response = await fetch('filtered_colors_2097152.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();

        categorizedPalettes = {};

        for (const [category, colors] of Object.entries(data.categories || {})) {
            categorizedPalettes[category] = colors.map((color, idx) => ({
                id: Date.now() + idx,
                name: `${category} ${idx + 1}`,
                color: color
            }));
        }

        renderCategoryList();
        selectCategory(Object.keys(categorizedPalettes)[0]);
        console.log('카테고리 목록 (JSON 로드 후):', Object.keys(categorizedPalettes));
    } catch (err) {
        console.error('색상 데이터 로드 실패:', err);
        categorizedPalettes = {
            Red: [{ id: 1, name: "Red", color: "#FF0000" }],
            Green: [{ id: 2, name: "Green", color: "#00FF00" }],
            Blue: [{ id: 3, name: "Blue", color: "#0000FF" }]
        };
        renderCategoryList();
        selectCategory("Red");
        console.log('카테고리 목록 (기본값):', Object.keys(categorizedPalettes));
    }
}

// 색상 추가 폼 처리
form.addEventListener("submit", e => {
    e.preventDefault();

    if (!currentCategory) return alert('카테고리를 선택하세요.');

    const newColor = {
        id: Date.now(),
        name: nameInput.value,
        color: colorInput.value
    };

    // 카테고리 배열에 추가
    if (!categorizedPalettes[currentCategory]) categorizedPalettes[currentCategory] = [];
    categorizedPalettes[currentCategory].push(newColor);

    // 현재 렌더링중인 배열에도 추가
    palettes.push(newColor);
    savePalettes();
    render();
    form.reset();
});

// paletteList 클릭 이벤트에서 팝업 표시 제어
paletteList.addEventListener('click', e => {
    const card = e.target.closest('.palette-card');
    if (!card) return;

    const colorName = card.dataset.name || 'Unknown';
    const colorCode = card.dataset.color || '#000000';
    const colorId = card.dataset.id;

    popupName.textContent = colorName;
    popupCode.textContent = colorCode;
    popup.dataset.id = colorId;

    // 카드 아래에 팝업 위치 지정
    const rect = card.getBoundingClientRect();
    popup.style.top = `${rect.bottom + window.scrollY + 8}px`;
    popup.style.left = `${rect.left + window.scrollX}px`;

    popup.style.display = 'block';
});

// 팝업 삭제 버튼 클릭 시 해당 색상 삭제 및 팝업 닫기
deleteBtn.onclick = () => {
    if (!popup.dataset.id) return;

    const idToDelete = Number(popup.dataset.id);

    // 카테고리 배열에서 삭제
    if (currentCategory && categorizedPalettes[currentCategory]) {
        categorizedPalettes[currentCategory] = categorizedPalettes[currentCategory].filter(p => p.id !== idToDelete);
    }

    // 현재 렌더링 배열에서도 삭제
    palettes = palettes.filter(p => p.id !== idToDelete);

    savePalettes();
    render();
    popup.style.display = 'none';
};

// 초기 실행: JSON 데이터 로드 및 분류 시작
loadAndCategorizeColors();
console.log('이 시점의 categorizedPalettes:', Object.keys(categorizedPalettes)); // 대개 빈 상태
