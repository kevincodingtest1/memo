# memo
- 요약: 우리 코드에서 R, G, B 각각을 128단계로 양자화해서 만든 색상 2,097,152개는 사람이 인지 가능한 색상 범위 내에서 프로그램으로 추출, 표현 가능한 대표 색상들의 집합으로 볼 수 있습니다.

---
- 본문:
    - 본 프로그램은 R, G, B 각 채널을 128단계로 양자화하여 총 2,097,152개의 색상을 추출합니다.
    - 이 색상 집합은 사람이 인지 가능한 색상 범위 내에서 현실적으로 표현 가능한 대표 색상들의 모음입니다.
    - 즉, 전체 16,777,216가지 헥스 색상 중에서 시각적으로 구분 가능한 주요 색상들을 효율적으로 추출한 결과입니다.
    - 본 프로그램은 대용량 색상 데이터를 사람이 인지할 수 있는 범위 내에서 효율적으로 처리하고 활용하는 데 적합합니다.