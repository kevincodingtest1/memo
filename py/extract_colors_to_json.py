import json

def extract_colors(input_bin, condition_func):
    """
    이진 파일에서 조건에 맞는 색상을 추출하는 함수
    :param input_bin: 이진 색상 파일명 (colors.bin)
    :param condition_func: (r, g, b) 값을 받아 True/False 반환하는 조건 함수
    :return: 조건에 맞는 색상 문자열 리스트 (예: ['#FF00FF', '#AABBCC', ...])
    
    동작:
    - 3바이트씩 읽으며 RGB 값을 추출
    - condition_func 함수로 조건 검사 후 맞으면 결과 리스트에 추가
    """
    size = 3  # RGB 각각 1바이트씩, 총 3바이트 단위로 읽음
    result = []
    with open(input_bin, 'rb') as f:
        while True:
            bytes_read = f.read(size)  # 3바이트씩 읽기
            if not bytes_read or len(bytes_read) < size:  # 파일 끝 도달 시 종료
                break
            r, g, b = bytes_read
            if condition_func(r, g, b):  # 조건에 맞으면 결과 리스트에 추가
                result.append('#{:02X}{:02X}{:02X}'.format(r, g, b))
    return result

def quantized_colors(r, g, b):
    """
    128단계 계조(사람이 인지 가능한 색상 범위)에 맞춘 색상만 추출하는 조건 함수

    조건 설정 아이디어:
    1. 색상 단계 수 줄이기
       - R, G, B 각각 16단계(0, 17, 34, ..., 255)로 계조를 줄이면 총 16^3 = 4,096 색상 (너무 적음)
       - 32단계 (0, 8, 16, ..., 248) → 32^3 = 32,768 색상
       - 64단계 → 64^3 = 262,144 색상
       - 128단계 → 128^3 = 2,097,152 색상 (앞서 사용한 수와 동일)

    2. 명도, 채도, 색상(HSL/HSV) 기준으로 필터링
       - 예: 채도가 낮은 회색 계열 제외
       - 명도가 너무 낮거나 높은 색 제외

    3. 색상 인지 실험 기반 필터
       - 특정 범위 내 색상만 추출 (예: 중간 밝기, 적절한 채도)

    본 함수는 128단계 계조를 기준으로 양자화하여 대표 색상만 추출합니다.

    :param r: 빨강 값 (0~255)
    :param g: 초록 값 (0~255)
    :param b: 파랑 값 (0~255)
    :return: 계조에 맞으면 True, 아니면 False
    """
    q = 128  # 단계 수 (2^7)
    step = 256 // q  # 한 단계 크기 (2)
    # 입력값이 계조 단계에 정확히 맞는지 확인하는 내부 함수
    def quantize(x):
        return (x // step) * step

    # R, G, B가 모두 계조 단위에 딱 맞는 값이어야 True 반환
    return (r == quantize(r)) and (g == quantize(g)) and (b == quantize(b))

def hex_to_rgb(hex_str):
    hex_str = hex_str.lstrip('#')
    if len(hex_str) == 3:
        hex_str = ''.join([c*2 for c in hex_str])
    r = int(hex_str[0:2], 16)
    g = int(hex_str[2:4], 16)
    b = int(hex_str[4:6], 16)
    return r, g, b

def rgb_to_hsl(r, g, b):
    r /= 255
    g /= 255
    b /= 255
    max_c = max(r, g, b)
    min_c = min(r, g, b)
    l = (max_c + min_c) / 2

    if max_c == min_c:
        h = s = 0.0
    else:
        d = max_c - min_c
        s = d / (2 - max_c - min_c) if l > 0.5 else d / (max_c + min_c)
        if max_c == r:
            h_ = ((g - b) / d) % 6
        elif max_c == g:
            h_ = ((b - r) / d) + 2
        else:
            h_ = ((r - g) / d) + 4
        h = h_ * 60
        if h < 0:
            h += 360
    return h, s, l

def categorize_color_detailed(hex_str):
    r, g, b = hex_to_rgb(hex_str)
    h, s, l = rgb_to_hsl(r, g, b)

    # 무채색 분류
    if s < 0.1:
        if l < 0.2:
            return 'Black'
        elif l > 0.8:
            return 'White'
        else:
            return 'Gray'

    # Hue 15도 단위 세분화
    if 0 <= h < 15:
        return 'Red'
    elif 15 <= h < 30:
        return 'Red-Orange'
    elif 30 <= h < 45:
        return 'Orange'
    elif 45 <= h < 60:
        return 'Orange-Yellow'
    elif 60 <= h < 75:
        return 'Yellow'
    elif 75 <= h < 90:
        return 'Yellow-Green'
    elif 90 <= h < 105:
        return 'Green'
    elif 105 <= h < 120:
        return 'Green-Cyan'
    elif 120 <= h < 135:
        return 'Cyan'
    elif 135 <= h < 150:
        return 'Cyan-Blue'
    elif 150 <= h < 165:
        return 'Blue'
    elif 165 <= h < 180:
        return 'Blue-Purple'
    elif 180 <= h < 195:
        return 'Purple'
    elif 195 <= h < 210:
        return 'Purple-Magenta'
    elif 210 <= h < 225:
        return 'Magenta'
    elif 225 <= h < 240:
        return 'Magenta-Pink'
    elif 240 <= h < 255:
        return 'Pink'
    elif 255 <= h < 270:
        return 'Pink-Red'
    elif 270 <= h < 285:
        return 'Red (Deep)'
    elif 285 <= h < 300:
        return 'Red-Violet'
    elif 300 <= h < 315:
        return 'Violet'
    elif 315 <= h < 330:
        return 'Violet-Red'
    elif 330 <= h <= 360:
        return 'Red (Light)'
    else:
        return 'Others'

if __name__ == "__main__":
    print("조건에 맞는 색상 추출 중...")
    colors = extract_colors('colors.bin', quantized_colors)  # 조건에 맞게 색상 추출
    count = len(colors)  # 추출된 색상 개수 계산
    output_json = f'filtered_colors_{count}.json'  # 색상 개수를 포함한 JSON 파일명 생성

    categorized = {}
    for c in colors:
        cat = categorize_color_detailed(c)
        categorized.setdefault(cat, []).append(c)

    # JSON 파일로 저장
    with open(output_json, 'w') as f:
        json.dump({"categories": categorized}, f, indent=2, ensure_ascii=False)

    print(f"{output_json} 파일 생성 완료 (총 {count}개 색상 저장)")
