def save_all_colors(filename):
    # 0x000000부터 0xFFFFFF까지 모든 6자리 색상을 3바이트씩 이진 파일로 저장하는 함수
    count = 0  # 저장한 색상 개수 카운트 변수
    with open(filename, 'wb') as f:
        for r in range(256):       # 빨강(R) 채널 0~255
            for g in range(256):   # 초록(G) 채널 0~255
                for b in range(256): # 파랑(B) 채널 0~255
                    f.write(bytes([r, g, b]))  # 각 색상을 3바이트로 파일에 기록
                    count += 1
    print(f"총 저장된 색상 개수: {count}개")  # 총 저장 색상 수 출력 |  16777216개

if __name__ == "__main__":
    print("모든 색상을 이진 파일로 저장 중...")  # 시작 메시지 출력
    save_all_colors('colors.bin')               # colors.bin 파일 생성
    print("colors.bin 파일 생성 완료")          # 완료 메시지 출력