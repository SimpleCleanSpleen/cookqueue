# Test fixtures for barcode.e2e.mjs: draws EAN-13 barcodes with no libraries and
# writes screenshots/photo.bmp (for the photo picker) and screenshots/camera.y4m
# (Chromium's fake webcam). Usage: python3 make-barcodes.py
import os, struct, sys
L=['0001101','0011001','0010011','0111101','0100011','0110001','0101111','0111011','0110111','0001011']
G=['0100111','0110011','0011011','0100001','0011101','0111001','0000101','0010001','0001001','0010111']
R=['1110010','1100110','1101100','1000010','1011100','1001110','1010000','1000100','1001000','1110100']
P=['LLLLLL','LLGLGG','LLGGLG','LLGGGL','LGLLGG','LGGLLG','LGGGLL','LGLGLG','LGLGGL','LGGLGL']
def ean13(code):
    d=[int(c) for c in code]; bits='101'
    for i,c in enumerate(d[1:7]): bits+=(L if P[d[0]][i]=='L' else G)[c]
    bits+='01010'
    for c in d[7:]: bits+=R[c]
    return bits+'101'
def raster(code, W=640, H=480, mod=4):
    bits=ean13(code); bw=len(bits)*mod; x0=(W-bw)//2; y0,y1=H//2-90,H//2+90
    img=[[255]*W for _ in range(H)]
    for i,b in enumerate(bits):
        if b=='1':
            for y in range(y0,y1):
                for x in range(x0+i*mod, x0+(i+1)*mod): img[y][x]=0
    return img
def bmp(img, path):
    H=len(img); W=len(img[0]); row=(W*3+3)&~3
    with open(path,'wb') as f:
        f.write(b'BM'+struct.pack('<IHHI',54+row*H,0,0,54)+struct.pack('<IiiHHIIiiII',40,W,H,1,24,0,row*H,2835,2835,0,0))
        for y in range(H-1,-1,-1):
            r=bytearray()
            for v in img[y]: r+=bytes((v,v,v))
            f.write(r+b'\0'*(row-W*3))
def y4m(img, path, frames=30):
    H=len(img); W=len(img[0])
    with open(path,'wb') as f:
        f.write(f'YUV4MPEG2 W{W} H{H} F15:1 Ip A1:1 C420jpeg\n'.encode())
        Y=bytes(v for r in img for v in r); UV=bytes([128])*(W*H//4)
        for _ in range(frames): f.write(b'FRAME\n'+Y+UV+UV)
out = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'screenshots')
os.makedirs(out, exist_ok=True)
bmp(raster('4006381333931'), os.path.join(out, 'photo.bmp'))
y4m(raster('0036000291452'), os.path.join(out, 'camera.y4m'))
