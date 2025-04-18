// DOM 요소 참조
const paletteList = document.getElementById("palette-list");  // 팔레트 목록을 표시할 컨테이너
const form = document.getElementById("palette-form");         // 색상 추가 폼
const nameInput = document.getElementById("color-name");      // 색상 이름 입력 필드
const colorInput = document.getElementById("color-value");    // 색상 값 입력 필드 (컬러 피커)

// localStorage에 저장할 키 이름
const STORAGE_KEY = 'palettes';

// localStorage에서 저장된 팔레트 데이터를 불러옴
// 없으면 기본값으로 빨간색과 초록색 팔레트 배열 사용
let palettes = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [
    { id: 1, name: "Red", color: "#FF0000" },
    { id: 2, name: "Green", color: "#00FF00" }
];

// palettes 배열을 localStorage에 JSON 문자열로 저장하는 함수
function savePalettes() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(palettes));
}

// palettes 배열을 화면에 렌더링하는 함수
function render() {
    paletteList.innerHTML = "";  // 기존 목록 초기화
  
    palettes.forEach(p => {
      // 카드 컨테이너 생성 및 클래스 지정
      const card = document.createElement("div");
      card.className = "palette-card";
  
      // 색상 네모 박스 생성 및 배경색 설정
      const colorBox = document.createElement("div");
      colorBox.className = "color-box";
      colorBox.style.backgroundColor = p.color;
  
      // 색상 정보 영역 생성
      const info = document.createElement("div");
      info.className = "color-info";
  
      // 색상 이름 요소 생성 및 텍스트 설정
      const nameEl = document.createElement("div");
      nameEl.className = "color-name";
      nameEl.textContent = p.name;
  
      // 색상 코드(hex) 요소 생성 및 텍스트 설정
      const codeEl = document.createElement("div");
      codeEl.className = "color-code";
      codeEl.textContent = p.color;
  
      // 삭제 버튼 생성 및 기능 할당
      const deleteBtn = document.createElement("button");
      deleteBtn.innerHTML = "&times;"; // × 기호로 표시
      deleteBtn.title = "삭제";          // 마우스 오버 시 툴팁 표시
      deleteBtn.onclick = () => {
        // 해당 id가 아닌 팔레트만 필터링하여 배열 갱신
        palettes = palettes.filter(x => x.id !== p.id);
        savePalettes();  // 변경된 배열 저장
        render();        // 화면 다시 렌더링
      };      
  
      // 색상 정보 영역에 이름, 코드, 삭제 버튼 추가
      info.appendChild(nameEl);
      info.appendChild(codeEl);
      info.appendChild(deleteBtn);
  
      // 카드에 색상 박스와 정보 영역 추가
      card.appendChild(colorBox);
      card.appendChild(info);
  
      // 전체 팔레트 리스트 컨테이너에 카드 추가
      paletteList.appendChild(card);
    });
}  

// 폼 제출 이벤트 리스너: 새 팔레트 항목 추가 처리
form.addEventListener("submit", e => {
    e.preventDefault();  // 폼 제출 기본 동작 방지(페이지 새로고침 방지)
    // 입력값을 이용해 새로운 팔레트 객체 생성 후 배열에 추가
    palettes.push({ id: Date.now(), name: nameInput.value, color: colorInput.value });
    savePalettes();  // 변경된 배열 저장
    render();        // 화면에 변경 내용 반영
    form.reset();    // 폼 초기화
});

// 페이지 로드 시 최초 렌더링 실행
render();