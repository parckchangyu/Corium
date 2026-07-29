/* ===== src/config.js ===== */
const canvas = document.getElementById('game');
let ctx = canvas.getContext('2d');

// Map camera: 100% shows the complete 15x15 battlefield. Zooming keeps the
// existing canvas resolution and enlarges only the map world.
const mapCamera={zoom:1,minZoom:1,maxZoom:2.4,panX:0,panY:0};
function updateZoomUi(){
  const el=document.getElementById('zoomLevel');
  if(el)el.textContent=Math.round(mapCamera.zoom*100)+'%';
  const out=document.getElementById('zoomOutBtn'),inn=document.getElementById('zoomInBtn');
  if(out)out.disabled=mapCamera.zoom<=mapCamera.minZoom+.001;
  if(inn)inn.disabled=mapCamera.zoom>=mapCamera.maxZoom-.001;
}
function clampMapCamera(){
  const dpr=canvasDpr();
  const w=canvas.width/dpr,h=canvas.height/dpr;
  const base=baseMapMetrics();
  const scaledW=base.mapW*mapCamera.zoom,scaledH=base.mapH*mapCamera.zoom;
  // Keep at least 22% of the enlarged map visible so it cannot be lost offscreen.
  const limitX=Math.max(0,(scaledW-w)/2+w*.28);
  const limitY=Math.max(0,(scaledH-h)/2+h*.28);
  mapCamera.panX=Math.max(-limitX,Math.min(limitX,mapCamera.panX));
  mapCamera.panY=Math.max(-limitY,Math.min(limitY,mapCamera.panY));
}
function setMapZoom(nextZoom,anchorX=null,anchorY=null){
  const old=metrics();
  const oldZoom=mapCamera.zoom;
  const nz=Math.max(mapCamera.minZoom,Math.min(mapCamera.maxZoom,nextZoom));
  if(Math.abs(nz-oldZoom)<.001)return;
  const dpr=canvasDpr(),w=canvas.width/dpr,h=canvas.height/dpr;
  const ax=anchorX==null?w/2:anchorX,ay=anchorY==null?h/2:anchorY;
  // Preserve the world point beneath the cursor while zooming.
  const worldX=(ax-old.ox)/old.size,worldY=(ay-old.oy)/old.size;
  mapCamera.zoom=nz;
  const fresh=metrics();
  mapCamera.panX+=ax-(fresh.ox+worldX*fresh.size);
  mapCamera.panY+=ay-(fresh.oy+worldY*fresh.size);
  clampMapCamera();updateZoomUi();draw();
}
function resetMapCamera(){mapCamera.zoom=1;mapCamera.panX=0;mapCamera.panY=0;updateZoomUi();draw();}


const ROWS = 15, COLS = 15, UNIT_CAP = 30, WIN_CORIUM = 200;
const unitDefs = {"uf_101":{"id":"UF-101","name":"Vanguard Squad","faction":"united","factionName":"연합군","starter":true,"rarity":"common","category":"combat","unitClass":"Vanguard","role":"선봉","desc":"연합군 선봉 유닛","passive":"없음","appearance":"5인의 기계화 선봉 분대. 네이비 블루 전술 아머와 건메탈 방탄 플레이트를 착용하고 흰색 연합군 문장이 새겨진 대형 탄도 실드를 운용한다. 헬멧에는 푸른 HUD 바이저와 통신 안테나가 장착되어 있으며, 실드 뒤로 카빈소총을 겨눈 채 밀집 방진을 유지한다. 무게감 있는 각진 실루엣과 규율 있는 움직임이 특징이다.","cost":3,"hp":90,"atk":35,"def":18,"spd":4,"range":1,"move":3,"vision":5,"color":"#4dafff"},"uf_102":{"id":"UF-102","name":"Ranger Squad","faction":"united","factionName":"연합군","starter":true,"rarity":"common","category":"combat","unitClass":"Fighter","role":"전투","desc":"연합군 전투 유닛","passive":"없음","appearance":"5인의 표준 보병 분대. 남색 디지털 위장 전투복과 회색 세라믹 플레이트 캐리어를 착용하며, 최신형 돌격소총과 권총을 휴대한다. 푸른 LED가 점등되는 어깨 패치와 백팩 통신 장비가 특징이며, 가장 연합군다운 균형 잡힌 실루엣을 가진다.","cost":4,"hp":90,"atk":40,"def":13,"spd":4,"range":3,"move":3,"vision":6,"color":"#4dafff"},"uf_103":{"id":"UF-103","name":"Breacher Squad","faction":"united","factionName":"연합군","starter":false,"rarity":"common","category":"combat","unitClass":"Assault","role":"강습","desc":"연합군 강습 유닛","passive":"없음","appearance":"4인의 건물 돌입 전문 분대. 강화 세라믹 숄더 아머와 폭약 파우치를 착용하고 자동 전투 산탄총과 브리칭 해머를 운용한다. 헬멧 전면은 푸른 강화 바이저로 덮여 있으며, 허리에는 폭파 장비가 다수 장착되어 있어 육중하면서도 공격적인 실루엣을 만든다.","cost":7,"hp":105,"atk":50,"def":13,"spd":5,"range":2,"move":4,"vision":6,"color":"#4dafff"},"uf_104":{"id":"UF-104","name":"Recon Squad","faction":"united","factionName":"연합군","starter":true,"rarity":"common","category":"combat","unitClass":"Skirmisher","role":"기동","desc":"연합군 기동 유닛","passive":"없음","appearance":"4인의 특수 정찰 분대. 남색 경량 위장복 위에 디지털 패턴 후드 망토를 걸치고, 소음기 장착 카빈과 접이식 전투 나이프를 사용한다. 소형 정찰 드론 두 기가 항상 상공을 선회하며, 푸른 광학 고글이 멀리서도 눈에 띄는 날렵한 실루엣을 완성한다.","cost":5,"hp":70,"atk":40,"def":9,"spd":6,"range":3,"move":4,"vision":8,"color":"#4dafff"},"uf_105":{"id":"UF-105","name":"Sentinel Squad","faction":"united","factionName":"연합군","starter":false,"rarity":"common","category":"combat","unitClass":"Defender","role":"방어","desc":"연합군 방어 유닛","passive":"없음","appearance":"3인의 중장갑 방어 분대. 전신 외골격 프레임 위에 두꺼운 건메탈 장갑을 덧입고 회전식 중기관총과 초대형 탄도 실드를 장비한다. 실드 가장자리에는 푸른 에너지 라인이 흐르며, 무거운 보행음과 압도적인 체격으로 전장의 이동식 방벽 같은 존재감을 보여준다.","cost":5,"hp":115,"atk":35,"def":26,"spd":2,"range":2,"move":2,"vision":5,"color":"#4dafff"},"uf_106":{"id":"UF-106","name":"Marksman Squad","faction":"united","factionName":"연합군","starter":true,"rarity":"common","category":"combat","unitClass":"Sniper","role":"저격","desc":"연합군 저격 유닛","passive":"없음","appearance":"3인의 장거리 저격 분대. 네이비 블루 길리슈트와 경량 세라믹 아머를 착용하며, 대물 저격총과 휴대형 거리 측정기를 운용한다. 헬멧 한쪽에는 푸른 단안 광학 스코프가 장착되어 있고, 길게 뻗은 총열 덕분에 멀리서도 저격수임을 알아볼 수 있는 날카로운 실루엣을 가진다.","cost":7,"hp":95,"atk":60,"def":8,"spd":3,"range":6,"move":2,"vision":8,"color":"#4dafff"},"uf_107":{"id":"UF-107","name":"Mortar Squad","faction":"united","factionName":"연합군","starter":false,"rarity":"common","category":"combat","unitClass":"Artillery","role":"포격","desc":"연합군 포격 유닛","passive":"없음","appearance":"4인의 포병 지원 분대. 자동 전개식 박격포와 탄약 운반 드론을 함께 운용하며, 남색 방탄복 위에 대형 탄약 캐리어를 메고 있다. 전개 시 후방에 푸른 홀로그램 사격 좌표가 투영되며, 긴 포신과 삼각 지지대가 독특한 실루엣을 만든다.","cost":10,"hp":90,"atk":55,"def":10,"spd":2,"range":6,"move":2,"vision":6,"color":"#4dafff","attackMode":"area","splashRadius":1},"uf_108":{"id":"UF-108","name":"Shock Squad","faction":"united","factionName":"연합군","starter":false,"rarity":"common","category":"combat","unitClass":"Bruiser","role":"중돌격","desc":"연합군 중돌격 유닛","passive":"없음","appearance":"4인의 중돌격 분대. 파워 아머 형태의 강화 외골격을 착용하고 대구경 자동 산탄총을 운용한다. 등 뒤에는 푸른 에너지 셀이 장착되어 있으며, 두꺼운 팔 보호구와 넓은 어깨 장갑 덕분에 압도적인 체격을 자랑한다.","cost":5,"hp":115,"atk":45,"def":18,"spd":3,"range":1,"move":3,"vision":5,"color":"#4dafff"},"uf_109":{"id":"UF-109","name":"Field Medic","faction":"united","factionName":"연합군","starter":true,"rarity":"common","category":"support","unitClass":"Medic","role":"의무","desc":"연합군 의무 유닛","passive":"없음","appearance":"2인의 전투 의무병 팀. 흰색 의료 문양이 새겨진 남색 전투복과 의료용 외골격을 착용하며, 부유형 치료 드론 두 기를 운용한다. 허리에는 응급 키트와 자동 주사기가 장착되어 있고, 푸른 의료 홀로그램이 항상 활성화되어 있다.","cost":4,"hp":70,"atk":15,"def":11,"spd":4,"range":3,"move":3,"vision":7,"color":"#4dafff","support":2},"uf_110":{"id":"UF-110","name":"Mobile Arsenal","faction":"united","factionName":"연합군","starter":true,"rarity":"common","category":"support","unitClass":"Transport","role":"수송","desc":"연합군 수송 유닛","passive":"없음","appearance":"8륜 중장갑 보급차량과 2명의 승무원으로 구성된 이동식 무장 보급 유닛. 네이비 블루 차체 위에 흰색 연합군 문장이 도색되어 있으며, 후면에는 탄약 컨테이너와 예비 무기 랙이 탑재되어 있다. 차량 측면의 푸른 LED 스트립이 야간에도 식별되며, 전장 한복판에서도 안정적으로 병력과 장비를 지원하는 든든한 실루엣을 가진다.","cost":8,"hp":135,"atk":15,"def":22,"spd":3,"range":0,"move":4,"vision":6,"color":"#4dafff","support":3},"uf_111":{"id":"UF-111","name":"Forward Observer Team","faction":"united","factionName":"연합군","starter":false,"rarity":"common","category":"support","unitClass":"Engineer","role":"공병","desc":"연합군 공병 유닛","passive":"없음","appearance":"2인의 전방 관측병과 3기의 정찰 드론으로 구성된 관측팀. 남색 경량 전술복과 백색 통신 장비를 착용하며, 휴대용 레이저 표적지시기와 전술 태블릿을 운용한다. 상공을 선회하는 드론이 푸른 스캐닝 빔으로 적 위치를 분석하며, 연합군 포병과 저격수의 눈 역할을 수행한다.","cost":5,"hp":80,"atk":20,"def":13,"spd":4,"range":3,"move":3,"vision":7,"color":"#4dafff","support":2},"uf_112":{"id":"UF-112","name":"Auto Miner","faction":"united","factionName":"연합군","starter":true,"rarity":"common","category":"mining","unitClass":"Mechanic","role":"기계","desc":"연합군 기계 유닛","passive":"없음","appearance":"6족 보행형 자동 채굴 플랫폼. 건메탈 외장과 네이비 블루 프레임으로 구성되어 있으며, 전면에는 대형 플라즈마 드릴과 광석 절단 레이저가 장착되어 있다. 후면 적재함에는 정제되지 않은 광석이 자동으로 수집되며, 중앙의 푸른 에너지 코어가 기체 전체에 동력을 공급한다. 산업 장비다운 육중한 실루엣이 특징이다.","cost":6,"hp":145,"atk":0,"def":24,"spd":2,"range":0,"move":2,"vision":5,"color":"#4dafff","mining":2},"uf_201":{"id":"UF-201","name":"Guardian Squad","faction":"united","factionName":"연합군","starter":true,"rarity":"elite","category":"combat","unitClass":"Defender","role":"방어","desc":"Bulwark Formation \n주변 아군이 받는 피해 10% 감소","passive":"Bulwark Formation \n주변 아군이 받는 피해 10% 감소","appearance":"3인의 연합군 최정예 방패 부대. 최신형 중장갑 외골격과 다층 복합 장갑을 착용하며, 일반 실드보다 두 배 이상 큰 에너지 탄도 실드를 운용한다. 실드 가장자리에는 푸른 플라즈마 라인이 흐르고, 가슴 중앙의 푸른 코어가 지속적으로 점등된다. 거대한 체구와 육중한 방패는 전장에서 하나의 움직이는 요새처럼 보인다.","cost":12,"hp":160,"atk":50,"def":35,"spd":2,"range":2,"move":2,"vision":5,"color":"#4dafff"},"uf_202":{"id":"UF-202","name":"Hellfire Squad","faction":"united","factionName":"연합군","starter":true,"rarity":"elite","category":"combat","unitClass":"Assault","role":"강습","desc":"Armor Break \n공격한 대상의 DEF 15% 감소(5초)","passive":"Armor Break \n공격한 대상의 DEF 15% 감소(5초)","appearance":"4인의 대기갑 강습 분대. 건메탈 강화 파워 아머 위에 네이비 블루 숄더 플레이트를 장착하고, 어깨에는 접이식 미사일 포드를 탑재한다. 대전차 로켓 런처와 고폭 돌격소총을 함께 운용하며, 푸른 추진 노즐이 분사되는 점프 팩으로 장애물을 넘나든다. 묵직한 화기와 미사일 실루엣만으로도 강력한 화력을 직감할 수 있다.","cost":15,"hp":155,"atk":80,"def":22,"spd":5,"range":2,"move":4,"vision":6,"color":"#4dafff"},"uf_203":{"id":"UF-203","name":"Longshot Squad","faction":"united","factionName":"연합군","starter":false,"rarity":"elite","category":"combat","unitClass":"Sniper","role":"저격","desc":"Deadeye \n사거리 7칸 이상 대상에게 피해 20% 증가","passive":"Deadeye \n사거리 7칸 이상 대상에게 피해 20% 증가","appearance":"2인의 최정예 저격팀. 남색 적응형 광학 망토가 주변 환경에 맞춰 위장색을 바꾸며, 초장거리 레일 스나이퍼를 운용한다. 헬멧 전체를 감싸는 푸른 바이저와 길게 돌출된 레일건이 압도적인 저격수 실루엣을 만든다.","cost":16,"hp":140,"atk":95,"def":17,"spd":3,"range":6,"move":2,"vision":8,"color":"#4dafff"},"uf_204":{"id":"UF-204","name":"Command Unit","faction":"united","factionName":"연합군","starter":true,"rarity":"elite","category":"support","unitClass":"Commander","role":"지휘","desc":"Battle Network \n주변 아군의 ATK·VSN 10% 증가","passive":"Battle Network \n주변 아군의 ATK·VSN 10% 증가","appearance":"연합군 전술 지휘관 1명과 AI 전술 드론 3기로 구성된 이동식 지휘 유닛. 백색 장교 코트 위에 네이비 전술 장갑을 착용하며, 등에 홀로그램 지휘 안테나를 장착한다. 주변에는 푸른 홀로그램 전술 맵이 실시간으로 전개되어 지휘관임을 한눈에 알 수 있다.","cost":18,"hp":150,"atk":50,"def":26,"spd":4,"range":4,"move":3,"vision":8,"color":"#4dafff","support":4},"uf_205":{"id":"UF-205","name":"Recovery Team","faction":"united","factionName":"연합군","starter":false,"rarity":"elite","category":"support","unitClass":"Engineer","role":"공병","desc":"Rapid Repair \n기계 유닛의 HP를 지속적으로 복구","passive":"Rapid Repair \n기계 유닛의 HP를 지속적으로 복구","appearance":"3인의 전투 공병 팀. 남색 엔지니어 슈트와 다관절 작업 암을 착용하며, 용접 토치·수리 드론·에너지 공구를 운용한다. 허리에는 각종 공구가 빼곡하게 장착되어 있고, 드론이 주변을 부유하며 차량과 기계를 즉시 수리한다.","cost":12,"hp":120,"atk":30,"def":22,"spd":4,"range":3,"move":3,"vision":7,"color":"#4dafff","support":3},"uf_206":{"id":"UF-206","name":"Heavy Extractor","faction":"united","factionName":"연합군","starter":false,"rarity":"elite","category":"mining","unitClass":"Mechanic","role":"기계","desc":"Deep Core Drill\n채굴 속도 40% 증가","passive":"Deep Core Drill\n채굴 속도 40% 증가","appearance":"6족 보행형 초대형 채굴 플랫폼. 건메탈 장갑과 네이비 외장을 두른 산업용 기체로, 전면에는 거대한 회전식 플라즈마 드릴이 장착되어 있다. 후면에는 푸른 에너지 코어와 광석 저장 컨테이너가 연결되어 있으며, 일반 채굴기의 두 배가 넘는 거대한 실루엣을 자랑한다.","cost":16,"hp":220,"atk":0,"def":33,"spd":2,"range":0,"move":2,"vision":5,"color":"#4dafff","mining":4},"uf_301":{"id":"UF-301","name":"Marcus Hale","faction":"united","factionName":"연합군","starter":false,"rarity":"hero","category":"support","unitClass":"Commander","role":"지휘","desc":"Supreme Command\n주변 모든 아군의 ATK, DEF, VSN 15%\n \nUnbreakable Will\n체력이 30% 이하가 되면 자신과 주변 아군이 8초간 받는 피해 25% 감소","passive":"Supreme Command\n주변 모든 아군의 ATK, DEF, VSN 15%\n \nUnbreakable Will\n체력이 30% 이하가 되면 자신과 주변 아군이 8초간 받는 피해 25% 감소","appearance":"연합군 총사령관. 2m에 가까운 건장한 체격에 백색 장군 코트 위로 네이비 블루 세라믹 장갑을 착용한다. 한쪽 어깨에는 푸른 발광 계급장이, 등 뒤에는 접이식 전술 안테나가 장착되어 있다. 오른손에는 자기 가속 돌격소총, 왼팔에는 소형 에너지 실드를 장비하며, 주변에는 여러 개의 홀로그램 전술 화면이 떠다닌다. 전장 한가운데에서도 흔들림 없이 지휘를 이어가는 위엄 있는 실루엣을 가진다.","cost":28,"hp":255,"atk":90,"def":35,"spd":4,"range":4,"move":3,"vision":8,"color":"#4dafff","support":12},"uf_302":{"id":"UF-302","name":"Ethan Cross","faction":"united","factionName":"연합군","starter":false,"rarity":"hero","category":"combat","unitClass":"Assault","role":"강습","desc":"Overdrive Frame\n교전 시작 후 10초 동안 ATK와 SPD 20% 증가 \n \nShock Breaker \n적 처치 시 다음 공격이 범위 피해를 주며 DEF를 무시하는 추가 피해 발생","passive":"Overdrive Frame\n교전 시작 후 10초 동안 ATK와 SPD 20% 증가 \n \nShock Breaker \n적 처치 시 다음 공격이 범위 피해를 주며 DEF를 무시하는 추가 피해 발생","appearance":"연합군 특수기동사령관. 날렵한 강화 외골격 슈트를 착용하고 네이비 블루와 건메탈이 조화를 이루는 고기동 전투복을 입는다. 등에 장착된 쌍발 이온 부스터가 푸른 불꽃을 내뿜으며 순간적으로 전장을 돌파한다. 양손에는 자기식 돌격 카빈과 고주파 전투 블레이드를 동시에 운용하고, 바이저 전체를 덮는 푸른 HUD가 끊임없이 목표를 분석한다. 빠른 움직임 때문에 잔상이 남는 듯한 공격적인 실루엣이 특징이다.","cost":24,"hp":255,"atk":135,"def":31,"spd":5,"range":2,"move":4,"vision":7,"color":"#4dafff"},"as_101":{"id":"AS-101","name":"Emerald Guards","faction":"astra","factionName":"아스트라","starter":true,"rarity":"common","category":"combat","unitClass":"Vanguard","role":"선봉","desc":"아스트라 선봉 유닛","passive":"없음","appearance":"4인의 신전 수호 기사단. 아이보리색 중갑 위로 에메랄드 그린 망토를 걸치고 금빛 룬이 새겨진 대형 수정 방패를 든다. 긴 창과 방패를 동시에 운용하며, 투구의 초록 수정이 은은하게 빛난다. 방패를 맞물려 진형을 이루는 모습은 살아있는 성벽처럼 보인다.","cost":2,"hp":90,"atk":35,"def":16,"spd":4,"range":1,"move":3,"vision":5,"color":"#65e6a5"},"as_102":{"id":"AS-102","name":"White Wolves","faction":"astra","factionName":"아스트라","starter":true,"rarity":"common","category":"combat","unitClass":"Skirmisher","role":"기동","desc":"아스트라 기동 유닛","passive":"없음","appearance":"4인의 숲 순찰대. 흰색과 녹색이 조화를 이루는 가죽 갑옷을 착용하고, 에메랄드 수정 단검과 곡도를 사용한다. 늑대의 귀를 형상화한 투구와 길게 흩날리는 초록 망토가 특징이며, 민첩한 움직임으로 적의 측면을 파고든다.","cost":4,"hp":70,"atk":40,"def":7,"spd":6,"range":3,"move":4,"vision":8,"color":"#65e6a5"},"as_103":{"id":"AS-103","name":"Moon Stags","faction":"astra","factionName":"아스트라","starter":false,"rarity":"common","category":"combat","unitClass":"Fighter","role":"전투","desc":"아스트라 전투 유닛","passive":"없음","appearance":"5인의 창병 분대. 하얀 판금 갑옷과 녹색 천 장식을 두르고 초승달 형태의 수정 창을 운용한다. 방패 대신 긴 창으로 거리를 유지하며 싸우며, 갑옷 곳곳에 새겨진 황금 문양이 달빛을 받은 듯 은은하게 빛난다.","cost":3,"hp":90,"atk":40,"def":11,"spd":4,"range":3,"move":3,"vision":6,"color":"#65e6a5"},"as_104":{"id":"AS-104","name":"Verdant Hunters","faction":"astra","factionName":"아스트라","starter":true,"rarity":"common","category":"combat","unitClass":"Sniper","role":"저격","desc":"아스트라 저격 유닛","passive":"없음","appearance":"3인의 정령 궁수. 나무와 수정이 결합된 장궁을 사용하며, 활시위는 녹색 에너지로 이루어져 있다. 후드를 깊게 눌러쓰고 아이보리 로브를 걸친 모습이며, 등 뒤에는 수정 화살이 공중에 떠다니는 독특한 실루엣을 가진다.","cost":7,"hp":90,"atk":60,"def":6,"spd":3,"range":6,"move":2,"vision":8,"color":"#65e6a5"},"as_105":{"id":"AS-105","name":"Crystal Spearmen","faction":"astra","factionName":"아스트라","starter":true,"rarity":"common","category":"combat","unitClass":"Assault","role":"강습","desc":"아스트라 강습 유닛","passive":"없음","appearance":"4인의 돌격 창기사. 전신을 감싼 백색 판금 갑옷 위에 금빛 장식과 녹색 수정 코어가 박혀 있다. 거대한 양날 수정 창을 양손으로 휘두르며, 돌격 시 창끝에서 녹색 에너지 파동이 퍼져나온다. 중무장 기사다운 묵직한 실루엣이 특징이다.","cost":6,"hp":100,"atk":50,"def":11,"spd":5,"range":2,"move":4,"vision":6,"color":"#65e6a5"},"as_106":{"id":"AS-106","name":"Ash Ravens","faction":"astra","factionName":"아스트라","starter":true,"rarity":"common","category":"combat","unitClass":"Skirmisher","role":"기동","desc":"아스트라 기동 유닛","passive":"없음","appearance":"4인의 그림자 정찰단. 회백색 로브 위에 짙은 녹색 망토를 걸치고 검은 깃털 장식을 두른다. 양손에는 초록 수정 단검을 사용하며, 어깨 위에는 까마귀 정령이 함께 비행한다. 움직일 때마다 망토가 새의 날개처럼 퍼지며 날렵한 실루엣을 만든다.","cost":4,"hp":70,"atk":40,"def":7,"spd":6,"range":3,"move":4,"vision":8,"color":"#65e6a5"},"as_107":{"id":"AS-107","name":"Sun Priests","faction":"astra","factionName":"아스트라","starter":false,"rarity":"common","category":"support","unitClass":"Medic","role":"의무","desc":"아스트라 의무 유닛","passive":"없음","appearance":"3인의 태양 사제단. 순백의 사제복 위에 황금 장식과 에메랄드 문양을 새긴 예복을 착용한다. 수정 지팡이 끝에는 태양을 형상화한 원형 성물이 떠 있으며, 발밑에는 녹색 치유 마법진이 전개된다.","cost":5,"hp":70,"atk":15,"def":10,"spd":4,"range":3,"move":3,"vision":7,"color":"#65e6a5","support":3},"as_108":{"id":"AS-108","name":"Rune Keepers","faction":"astra","factionName":"아스트라","starter":true,"rarity":"common","category":"support","unitClass":"Engineer","role":"공병","desc":"아스트라 공병 유닛","passive":"없음","appearance":"2인의 룬 관리자. 아이보리색 로브와 황금 견갑을 착용하고, 등에 거대한 석판 형태의 룬 장치를 메고 다닌다. 여러 개의 녹색 룬 결정이 공중에 떠다니며 아군 장비와 성역을 강화한다.","cost":8,"hp":80,"atk":20,"def":12,"spd":4,"range":3,"move":3,"vision":7,"color":"#65e6a5","support":4},"as_109":{"id":"AS-109","name":"Spirit Shepherds","faction":"astra","factionName":"아스트라","starter":true,"rarity":"common","category":"mining","unitClass":"Bionic","role":"생체","desc":"아스트라 생체 유닛","passive":"없음","appearance":"2인의 정령술사와 숲의 정령 3체로 이루어진 채집단. 정령들은 초록빛 수정 결정과 식물을 자유롭게 조종하며 광물을 자연스럽게 분리한다. 전투보다는 자연과 교감하는 존재로, 은은한 녹색 입자가 주변을 감싼다.","cost":8,"hp":100,"atk":15,"def":15,"spd":4,"range":1,"move":3,"vision":6,"color":"#65e6a5","mining":2},"as_201":{"id":"AS-201","name":"Temple Wardens","faction":"astra","factionName":"아스트라","starter":true,"rarity":"elite","category":"combat","unitClass":"Defender","role":"방어","desc":"Sanctuary Aura \n주변 아군의 DEF 15% 증가","passive":"Sanctuary Aura \n주변 아군의 DEF 15% 증가","appearance":"3인의 신전 수호 기사단. 순백의 전신 판금갑옷 위에 에메랄드 망토를 두르고, 황금 장식이 새겨진 거대한 성방패와 룬 해머를 사용한다. 갑옷 틈마다 녹색 성광이 흘러나오며, 방패에는 거대한 수정 코어가 박혀 있어 신성한 요새 같은 실루엣을 만든다.","cost":11,"hp":160,"atk":50,"def":33,"spd":2,"range":2,"move":2,"vision":5,"color":"#65e6a5"},"as_202":{"id":"AS-202","name":"Sacred Lancers","faction":"astra","factionName":"아스트라","starter":true,"rarity":"elite","category":"combat","unitClass":"Assault","role":"강습","desc":"Holy Charge \n첫 교전 시 피해 30% 증가","passive":"Holy Charge \n첫 교전 시 피해 30% 증가","appearance":"4인의 성창 기사단. 황금 테두리가 둘러진 아이보리 갑옷과 초록 망토를 착용하며, 키보다 긴 수정 랜스를 운용한다. 랜스 끝에서는 녹색 성광이 뿜어져 나오며 돌격 시 혜성처럼 빛의 궤적을 남긴다.","cost":15,"hp":155,"atk":80,"def":20,"spd":5,"range":2,"move":4,"vision":6,"color":"#65e6a5"},"as_203":{"id":"AS-203","name":"Star Oracles","faction":"astra","factionName":"아스트라","starter":false,"rarity":"elite","category":"support","unitClass":"Commander","role":"지휘","desc":"Celestial Insight \n주변 아군의 VSN과 SPD 10% 증가","passive":"Celestial Insight \n주변 아군의 VSN과 SPD 10% 증가","appearance":"2인의 대현자. 얼굴을 가린 순백 로브와 황금 왕관을 착용하며, 등 뒤에는 별자리처럼 배열된 7개의 수정 구체가 공중에 떠다닌다. 손짓만으로 녹색 룬과 별빛 마법진을 펼치며 전장을 내려다보는 신탁자의 분위기를 풍긴다.","cost":18,"hp":140,"atk":55,"def":24,"spd":4,"range":4,"move":3,"vision":8,"color":"#65e6a5","support":4},"as_204":{"id":"AS-204","name":"Life Channelers","faction":"astra","factionName":"아스트라","starter":true,"rarity":"elite","category":"support","unitClass":"Medic","role":"의무","desc":"Nature's Blessing \n주변 아군의 HP를 지속 회복","passive":"Nature's Blessing \n주변 아군의 HP를 지속 회복","appearance":"3인의 생명의 사도. 순백의 사제복과 녹색 덩굴 장식이 몸을 감싸고 있으며, 수정 지팡이 끝에는 거대한 생명의 꽃이 피어 있다. 걸음을 옮길 때마다 초록 꽃잎과 빛의 입자가 흩날려 치유의 존재임을 한눈에 보여준다.","cost":11,"hp":105,"atk":25,"def":18,"spd":4,"range":3,"move":3,"vision":7,"color":"#65e6a5","support":4},"as_205":{"id":"AS-205","name":"Worldshaper","faction":"astra","factionName":"아스트라","starter":false,"rarity":"elite","category":"mining","unitClass":"Mechanic","role":"기계","desc":"Living Earth \n채굴 속도 40% 증가","passive":"Living Earth \n채굴 속도 40% 증가","appearance":"거대한 고대 석상 골렘. 몸체 전체가 암석과 에메랄드 수정으로 이루어져 있으며, 팔은 거대한 수정 곡괭이 형태다. 어깨와 등에 숲의 나무가 자라나 있고, 발걸음을 내디딜 때마다 땅에서 녹색 수정 기둥이 솟아오르는 초월적인 존재감을 가진다.","cost":17,"hp":205,"atk":20,"def":31,"spd":2,"range":0,"move":2,"vision":5,"color":"#65e6a5","mining":4},"as_206":{"id":"AS-206","name":"Eclipse Arbiters","faction":"astra","factionName":"아스트라","starter":false,"rarity":"elite","category":"combat","unitClass":"Bruiser","role":"중돌격","desc":"Judgement Strike \n체력이 50% 이하인 적에게 피해 25% 증가","passive":"Judgement Strike \n체력이 50% 이하인 적에게 피해 25% 증가","appearance":"2인의 심판 기사. 검은 금속과 아이보리 갑옷이 반반씩 뒤섞인 전신 중갑을 착용하고, 양손에 거대한 초승달형 에너지 대검을 든다. 망토는 밤하늘처럼 어둡고 가장자리는 녹색 성광으로 빛난다.","cost":15,"hp":185,"atk":80,"def":26,"spd":3,"range":1,"move":3,"vision":5,"color":"#65e6a5"},"as_207":{"id":"AS-207","name":"Stormcall Druids","faction":"astra","factionName":"아스트라","starter":false,"rarity":"elite","category":"support","unitClass":"Engineer","role":"공병","desc":"Tempest Ritual \n주변 아군의 SPD 15% 증가","passive":"Tempest Ritual \n주변 아군의 SPD 15% 증가","appearance":"3인의 폭풍 드루이드. 흰 로브 위로 살아있는 덩굴이 몸을 감싸며, 머리 위에는 번개가 흐르는 수정 고리가 떠 있다. 손짓에 따라 초록 번개와 바람이 소용돌이치며 자연의 힘을 전장에 불러낸다.","cost":16,"hp":120,"atk":35,"def":21,"spd":4,"range":3,"move":3,"vision":7,"color":"#65e6a5","support":6},"as_208":{"id":"AS-208","name":"Ancient Colossus","faction":"astra","factionName":"아스트라","starter":false,"rarity":"elite","category":"combat","unitClass":"Artillery","role":"포격","desc":"Crystal Barrage \n공격이 작은 범위 피해를 준다","passive":"Crystal Barrage \n공격이 작은 범위 피해를 준다","appearance":"거대한 고대 수호 거인 한 기. 산처럼 거대한 암석 몸체와 에메랄드 수정 기둥으로 이루어져 있으며, 어깨에는 신전 유적이 남아 있다. 가슴의 거대한 수정핵에서 초록 광선을 발사하며, 움직일 때마다 대지가 흔들리는 압도적인 실루엣을 가진다.","cost":19,"hp":135,"atk":90,"def":19,"spd":2,"range":6,"move":2,"vision":6,"color":"#65e6a5","attackMode":"area","splashRadius":1},"as_301":{"id":"AS-301","name":"Aelion, First Guardian","faction":"astra","factionName":"아스트라","starter":true,"rarity":"hero","category":"combat","unitClass":"Defender","role":"방어","desc":"Sanctuary Aura \n주변 아군 DEF 증가 \n\nGuardian's Oath \n근처 아군이 받는 피해 일부 대신 받음","passive":"Sanctuary Aura \n주변 아군 DEF 증가 \n\nGuardian's Oath \n근처 아군이 받는 피해 일부 대신 받음","appearance":"아스트라 기사단의 초대 수호자. 순백과 금빛이 조화를 이룬 거대한 성기사 갑옷을 입고, 사람 키의 두 배에 달하는 수정 방패와 성검을 사용한다. 머리 뒤에는 녹색 광륜이 떠 있으며, 존재 자체가 움직이는 성채처럼 보인다.","cost":22,"hp":290,"atk":95,"def":45,"spd":2,"range":2,"move":2,"vision":7,"color":"#65e6a5"},"as_302":{"id":"AS-302","name":"Seraphis, Voice of Life","faction":"astra","factionName":"아스트라","starter":true,"rarity":"hero","category":"support","unitClass":"Medic","role":"의무","desc":"Blessing of Gaia \n광역 지속 회복 \n\nRevitalization \n회복 효과 30% 증가","passive":"Blessing of Gaia \n광역 지속 회복 \n\nRevitalization \n회복 효과 30% 증가","appearance":"생명의 대사제. 새하얀 예복과 황금 날개 장식을 두른 채 공중에 떠다니며 이동한다. 여섯 개의 수정 성물이 주변을 공전하고, 발아래에는 거대한 생명의 문양이 항상 펼쳐져 있다.","cost":22,"hp":195,"atk":45,"def":30,"spd":4,"range":3,"move":3,"vision":7,"color":"#65e6a5","support":8},"as_303":{"id":"AS-303","name":"Vaelor, Star Sovereign","faction":"astra","factionName":"아스트라","starter":false,"rarity":"hero","category":"combat","unitClass":"Assault","role":"강습","desc":"Celestial Blade \n공격 시 추가 성속성 피해 \n\nAstral Ascension \n체력 30% 이하일 때 공격속도·공격력 증가","passive":"Celestial Blade \n공격 시 추가 성속성 피해 \n\nAstral Ascension \n체력 30% 이하일 때 공격속도·공격력 증가","appearance":"아스트라의 최고 통치자이자 전설의 검사. 긴 백금색 갑옷과 에메랄드 왕망토를 착용하고, 별빛으로 이루어진 초대형 에너지 검을 사용한다. 등 뒤에는 여러 개의 수정 날개가 떠다니며, 검을 휘두를 때마다 밤하늘의 별자리 같은 녹색 광궤가 전장을 가른다.","cost":25,"hp":280,"atk":150,"def":33,"spd":5,"range":2,"move":4,"vision":7,"color":"#65e6a5"},"bc_101":{"id":"BC-101","name":"Scrap Raiders","faction":"blackcomet","factionName":"블랙 코멧","starter":true,"rarity":"common","category":"combat","unitClass":"Vanguard","role":"선봉","desc":"블랙 코멧 선봉 유닛","passive":"없음","appearance":"5인의 우주 해적 돌격조. 녹슨 철판과 전함 잔해를 덧댄 즉석 갑옷을 입고, 둔탁한 고철 방패와 절단용 전기 도끼를 사용한다. 각자 장비가 제각각이라 통일감은 없지만, 검은 철판과 붉은 LED, 스프레이 낙서가 블랙코멧 특유의 분위기를 만든다.","cost":3,"hp":95,"atk":40,"def":15,"spd":4,"range":1,"move":3,"vision":5,"color":"#ff654f"},"bc_102":{"id":"BC-102","name":"Iron Reavers","faction":"blackcomet","factionName":"블랙 코멧","starter":true,"rarity":"common","category":"combat","unitClass":"Fighter","role":"전투","desc":"블랙 코멧 전투 유닛","passive":"없음","appearance":"5인의 자동소총 해적단. 검은 전투복 위에 용접한 철판을 덧입고, 개조된 플라즈마 라이플을 사용한다. 총열마다 성능이 달라 생김새도 모두 다르며, 등에는 탄약통과 산소통이 어지럽게 매달려 있다.","cost":4,"hp":95,"atk":45,"def":10,"spd":4,"range":3,"move":3,"vision":6,"color":"#ff654f"},"bc_103":{"id":"BC-103","name":"Chain Butchers","faction":"blackcomet","factionName":"블랙 코멧","starter":false,"rarity":"common","category":"combat","unitClass":"Bruiser","role":"중돌격","desc":"블랙 코멧 중돌격 유닛","passive":"없음","appearance":"3인의 중장 해적. 거대한 체인소드와 회전식 절단기를 무기로 사용하며, 한쪽 팔은 기계 의수로 개조되어 있다. 전신에는 쇠사슬과 해골 장식이 매달려 있고, 붉게 빛나는 바이저가 위압적인 인상을 준다.","cost":5,"hp":125,"atk":50,"def":15,"spd":3,"range":1,"move":3,"vision":5,"color":"#ff654f"},"bc_104":{"id":"BC-104","name":"Hell Gunners","faction":"blackcomet","factionName":"블랙 코멧","starter":true,"rarity":"common","category":"combat","unitClass":"Artillery","role":"포격","desc":"블랙 코멧 포격 유닛","passive":"없음","appearance":"2인의 중화기 사수. 등에 거대한 탄약통을 메고 다니며, 고철을 이어 붙여 만든 장거리 플라즈마 캐논을 운용한다. 발사 시 총열에서 붉은 불꽃과 검은 연기가 뿜어져 나오며, 몸보다 큰 무기가 실루엣을 지배한다.","cost":9,"hp":90,"atk":55,"def":6,"spd":2,"range":6,"move":2,"vision":6,"color":"#ff654f","attackMode":"area","splashRadius":1},"bc_105":{"id":"BC-105","name":"Hook Stalkers","faction":"blackcomet","factionName":"블랙 코멧","starter":false,"rarity":"common","category":"combat","unitClass":"Skirmisher","role":"기동","desc":"블랙 코멧 기동 유닛","passive":"없음","appearance":"4인의 침투 해적. 검은 후드와 경량 갑옷을 착용하고, 양손의 전자 갈고리와 와이어 런처를 이용해 지형을 넘나든다. 등에 소형 추진기가 달려 있어 짧게 도약하며, 붉은 단안 바이저와 갈고리 실루엣이 특징이다.","cost":5,"hp":80,"atk":45,"def":6,"spd":6,"range":3,"move":4,"vision":8,"color":"#ff654f"},"bc_106":{"id":"BC-106","name":"Void Scouts","faction":"blackcomet","factionName":"블랙 코멧","starter":true,"rarity":"common","category":"combat","unitClass":"Skirmisher","role":"기동","desc":"블랙 코멧 기동 유닛","passive":"없음","appearance":"3인의 제트팩 정찰병. 등에 용접 자국이 선명한 소형 추진기를 장착하고, 붉은 단안 바이저와 짧은 카빈을 사용한다. 낡은 우주복 위에 철판을 덧댄 모습이며, 비행 중에는 붉은 추진 화염이 길게 남는다.","cost":5,"hp":80,"atk":45,"def":6,"spd":6,"range":3,"move":4,"vision":8,"color":"#ff654f"},"bc_107":{"id":"BC-107","name":"Stitch Docs","faction":"blackcomet","factionName":"블랙 코멧","starter":false,"rarity":"common","category":"support","unitClass":"Medic","role":"의무","desc":"블랙 코멧 의무 유닛","passive":"없음","appearance":"2인의 불법 사이버 의사. 한쪽 팔은 용접 토치, 다른 한쪽은 기계식 수술 팔로 개조되어 있다. 검은 가죽 앞치마와 붉은 고글을 착용하고, 의료가방 대신 부품 상자를 메고 다니며 전장에서 병사들을 즉석 개조한다.","cost":4,"hp":75,"atk":15,"def":9,"spd":4,"range":3,"move":3,"vision":7,"color":"#ff654f","support":3},"bc_108":{"id":"BC-108","name":"Junk Mechanics","faction":"blackcomet","factionName":"블랙 코멧","starter":true,"rarity":"common","category":"support","unitClass":"Engineer","role":"공병","desc":"블랙 코멧 공병 유닛","passive":"없음","appearance":"2인의 전장 메카닉. 등에 각종 렌치와 절단기, 용접기를 주렁주렁 매달고 다니며, 소형 수리 드론 2기를 운용한다. 검은 작업복 위에 녹슨 철판을 덧댔고, 얼굴은 붉은 용접 마스크로 가려져 있다.","cost":7,"hp":80,"atk":20,"def":11,"spd":4,"range":3,"move":3,"vision":7,"color":"#ff654f","support":4},"bc_109":{"id":"BC-109","name":"Salvage Crew","faction":"blackcomet","factionName":"블랙 코멧","starter":true,"rarity":"common","category":"mining","unitClass":"Bionic","role":"생체","desc":"블랙 코멧 생체 유닛","passive":"없음","appearance":"4인의 고철 회수반. 거대한 전자 자석과 플라즈마 절단기를 이용해 잔해와 광물을 수거한다. 등에 철제 컨테이너를 짊어지고 있으며, 온몸에 쇳가루와 기름때가 묻어 있는 산업 작업자 같은 실루엣이다.","cost":7,"hp":100,"atk":15,"def":14,"spd":4,"range":1,"move":3,"vision":6,"color":"#ff654f","mining":2},"bc_110":{"id":"BC-110","name":"Scrap Walker","faction":"blackcomet","factionName":"블랙 코멧","starter":false,"rarity":"common","category":"mining","unitClass":"Mechanic","role":"기계","desc":"블랙 코멧 기계 유닛","passive":"없음","appearance":"4족 보행 채굴 워커 한 기. 폐우주선 엔진과 굴착 드릴을 이어 붙여 만든 거대한 기계로, 양팔은 회전식 드릴과 유압 집게로 구성되어 있다. 붉은 경고등과 검은 장갑판, 녹슨 프레임이 거칠고 투박한 해적 공학의 상징이다.","cost":8,"hp":145,"atk":15,"def":22,"spd":2,"range":0,"move":2,"vision":5,"color":"#ff654f","mining":2},"bc_201":{"id":"BC-201","name":"Executioners","faction":"blackcomet","factionName":"블랙 코멧","starter":true,"rarity":"elite","category":"combat","unitClass":"Bruiser","role":"중돌격","desc":"Blood Rush적 처치 시 공격력 15% 증가(중첩 제한)","passive":"Blood Rush적 처치 시 공격력 15% 증가(중첩 제한)","appearance":"2인의 처형자. 전신을 검은 강화 외골격으로 감싸고 양손에 거대한 플라즈마 도끼를 든다. 투구는 해골 형상이며, 붉은 LED가 갈비뼈처럼 몸통을 따라 빛난다. 묵직한 체구와 긴 도끼 자루가 압도적인 실루엣을 만든다.","cost":14,"hp":185,"atk":80,"def":24,"spd":3,"range":1,"move":3,"vision":5,"color":"#ff654f"},"bc_202":{"id":"BC-202","name":"War Chiefs","faction":"blackcomet","factionName":"블랙 코멧","starter":true,"rarity":"elite","category":"support","unitClass":"Commander","role":"지휘","desc":"Raid Command주변 아군 ATK·SPD 10% 증가","passive":"Raid Command주변 아군 ATK·SPD 10% 증가","appearance":"해적 전쟁대장 1인. 붉은 코트를 걸치고 금속 의수와 기계식 안대를 착용했다. 허리에는 권총과 커틀러스, 등에 전술 안테나를 장착하여 현장에서 직접 약탈대를 지휘한다.","cost":20,"hp":145,"atk":55,"def":23,"spd":4,"range":4,"move":3,"vision":8,"color":"#ff654f","support":6},"bc_203":{"id":"BC-203","name":"Void Hunters","faction":"blackcomet","factionName":"블랙 코멧","starter":false,"rarity":"elite","category":"combat","unitClass":"Sniper","role":"저격","desc":"Dead Contract체력이 가장 낮은 적을 우선 공격","passive":"Dead Contract체력이 가장 낮은 적을 우선 공격","appearance":"2인의 현상금 사냥꾼. 길게 늘어진 검은 코트와 붉은 스코프가 달린 초장거리 레일 라이플을 사용한다. 한쪽 어깨에는 정찰 드론이, 허리에는 권총 여러 자루가 달려 있어 실루엣이 독특하다.","cost":16,"hp":140,"atk":100,"def":14,"spd":3,"range":6,"move":2,"vision":8,"color":"#ff654f"},"bc_204":{"id":"BC-204","name":"Hell Forgers","faction":"blackcomet","factionName":"블랙 코멧","starter":false,"rarity":"elite","category":"support","unitClass":"Engineer","role":"공병","desc":"Overclock주변 기계 유닛의 공격속도 증가","passive":"Overclock주변 기계 유닛의 공격속도 증가","appearance":"2인의 불법 무기 제작자. 등에 이동식 용광로와 발전기를 메고 다니며, 양팔은 거대한 용접 암으로 개조되어 있다. 붉은 불꽃이 항상 새어 나오고, 주변에는 수리 드론이 떠다닌다.","cost":16,"hp":125,"atk":35,"def":20,"spd":4,"range":3,"move":3,"vision":7,"color":"#ff654f","support":6},"bc_205":{"id":"BC-205","name":"Iron Leviathan","faction":"blackcomet","factionName":"블랙 코멧","starter":false,"rarity":"elite","category":"mining","unitClass":"Mechanic","role":"기계","desc":"Salvage Core채굴 속도 40% 증가","passive":"Salvage Core채굴 속도 40% 증가","appearance":"초대형 산업 워커 1기. 폐전함 엔진과 광산 굴착기를 이어 붙여 만든 괴물 같은 기계다. 여섯 개의 다리와 거대한 회전 드릴, 전자 크레인을 갖췄으며, 몸 곳곳에 용접 자국과 경고 문구가 남아 있다. 블랙코멧 공학의 결정체 같은 존재.","cost":18,"hp":220,"atk":20,"def":31,"spd":2,"range":0,"move":2,"vision":5,"color":"#ff654f","mining":4},"bc_206":{"id":"BC-206","name":"Red Corsairs","faction":"blackcomet","factionName":"블랙 코멧","starter":false,"rarity":"elite","category":"combat","unitClass":"Assault","role":"강습","desc":"Boarding Frenzy첫 교전 시 공격속도 20% 증가","passive":"Boarding Frenzy첫 교전 시 공격속도 20% 증가","appearance":"3인의 정예 돌입 해적. 붉은 제트팩과 플라즈마 커틀러스, 산탄 권총을 사용한다. 검은 장갑 위에 붉은 해적 코트를 걸치고 있으며, 등에 달린 추진기와 긴 망토가 날카로운 실루엣을 만든다.","cost":16,"hp":170,"atk":90,"def":20,"spd":5,"range":2,"move":4,"vision":6,"color":"#ff654f"},"bc_207":{"id":"BC-207","name":"Scrap Tyrant","faction":"blackcomet","factionName":"블랙 코멧","starter":false,"rarity":"elite","category":"combat","unitClass":"Defender","role":"방어","desc":"Fortified Hull받는 피해 15% 감소","passive":"Fortified Hull받는 피해 15% 감소","appearance":"거대한 사이보그 집행자 1인. 몸 대부분이 폐전차와 우주선 장갑으로 교체되어 있으며, 왼팔은 초대형 방패, 오른팔은 유압 해머로 개조되었다. 붉은 단안과 녹슨 철판이 움직이는 요새 같은 인상을 준다.","cost":12,"hp":170,"atk":55,"def":33,"spd":2,"range":2,"move":2,"vision":5,"color":"#ff654f"},"bc_301":{"id":"BC-301","name":"Ragnar, Dread Captain","faction":"blackcomet","factionName":"블랙 코멧","starter":true,"rarity":"hero","category":"support","unitClass":"Commander","role":"지휘","desc":"Pirate's Command주변 아군 ATK·SPD 증가 \nNo Surrender주변 아군 체력이 낮을수록 공격력 증가","passive":"Pirate's Command주변 아군 ATK·SPD 증가 \nNo Surrender주변 아군 체력이 낮을수록 공격력 증가","appearance":"블랙코멧 함대의 총사령관. 검붉은 장교 코트와 기계 의수, 붉게 빛나는 기계식 안구를 지녔다. 허리에는 플라즈마 리볼버와 커틀러스, 등에 개인 추진기가 장착되어 있으며, 해적왕다운 압도적인 존재감을 풍긴다.","cost":30,"hp":270,"atk":100,"def":35,"spd":4,"range":4,"move":3,"vision":8,"color":"#ff654f","support":16},"bc_302":{"id":"BC-302","name":"Vex, Iron Revenant","faction":"blackcomet","factionName":"블랙 코멧","starter":true,"rarity":"hero","category":"combat","unitClass":"Bruiser","role":"중돌격","desc":"Cyber Rampage공격할수록 공격속도 증가 \nUnbreakable Frame체력 30% 이하에서 피해 감소","passive":"Cyber Rampage공격할수록 공격속도 증가 \nUnbreakable Frame체력 30% 이하에서 피해 감소","appearance":"전신을 기계로 치환한 전설의 사이보그. 양팔은 플라즈마 클로와 체인 블레이드이며, 등에는 거대한 냉각 장치와 에너지 배관이 노출되어 있다. 검은 외골격 사이로 붉은 용암 같은 빛이 새어 나오는 괴물 같은 실루엣이다.","cost":25,"hp":335,"atk":150,"def":37,"spd":3,"range":1,"move":3,"vision":7,"color":"#ff654f"},"bc_303":{"id":"BC-303","name":"Dread Maw","faction":"blackcomet","factionName":"블랙 코멧","starter":false,"rarity":"hero","category":"combat","unitClass":"Assault","role":"강습","desc":"Devour적 처치 시 HP 회복 \nTerror Wave주변 적의 공격력 감소","passive":"Devour적 처치 시 HP 회복 \nTerror Wave주변 적의 공격력 감소","appearance":"생체 병기이자 해적단의 최종 실험체. 거대한 외계 생물에 기계 장갑과 금속 척추를 이식한 혼종으로, 네 개의 팔과 거대한 턱을 지녔다. 붉은 눈과 검은 외골격, 등에 꽂힌 에너지 파이프가 인간과 괴수의 경계를 허문 압도적인 실루엣을 만든다.","cost":26,"hp":290,"atk":160,"def":32,"spd":5,"range":2,"move":4,"vision":7,"color":"#ff654f"}};
Object.values(unitDefs).forEach(d=>{ if(d.category==='combat'&&!d.attackMode) d.attackMode='single'; });

const playerColors = ['#2e9cff','#ff4d5a','#ff9f43','#a66cff'];
const playerNames = ['PLAYER','AI RED','AI ORANGE','AI PURPLE'];
let state;
let selectedPlayerFaction=null;

const rarityInfo={common:{name:'COMMON',rate:68},elite:{name:'ELITE',rate:30},hero:{name:'HERO',rate:2}};
const ACCOUNT_KEY='corium_account_v019_codex60';
const STARTER_UNITS=Object.keys(unitDefs).filter(k=>unitDefs[k].starter);
const MAX_UNIT_LEVEL=10;
const ADMIN_PASSWORD='안알랴줌';
let account=loadAccount();
let collectionSortAscending=true;
let collectionFactionFilter='all';
let collectionCategoryFilter='all';
let currentDetailUnit=null;
let gamePaused=false;
let adminMode=localStorage.getItem('corium_admin_mode_v1')==='true';
function blankProgress(){
  const fragments={},levels={};
  Object.keys(unitDefs).forEach(k=>{fragments[k]=0;levels[k]=1;});
  return {fragments,levels};
}
function loadAccount(){
  const base=blankProgress();
  try{
    const saved=JSON.parse(localStorage.getItem(ACCOUNT_KEY)||'null');
    if(saved&&Array.isArray(saved.unlocked)){
      return {
        credits:Number.isFinite(Number(saved.credits))?Number(saved.credits):3000,
        unlocked:[...new Set([...STARTER_UNITS,...saved.unlocked.filter(k=>unitDefs[k])])],
        fragments:{...base.fragments,...(saved.fragments||{})},
        levels:{...base.levels,...(saved.levels||{})}
      };
    }
  }catch(e){}
  return {credits:3000,unlocked:[...STARTER_UNITS],...base};
}
function saveAccount(){localStorage.setItem(ACCOUNT_KEY,JSON.stringify(account));updateAccountUI();}
function isUnlocked(type){return account.unlocked.includes(type);}
function unitLevel(type){return Math.max(1,Math.min(MAX_UNIT_LEVEL,Number(account.levels?.[type])||1));}
function unitFragments(type){return Math.max(0,Number(account.fragments?.[type])||0);}
function fragmentsNeeded(level){return 10+(Math.max(1,level)-1)*5;}
function levelMultiplier(type){return 1+(unitLevel(type)-1)*0.05;}
function enhancedValue(type,stat){
  const base=Number(unitDefs[type][stat]||0);
  if(!['hp','atk','def','support','mining'].includes(stat))return base;
  return Math.round(base*levelMultiplier(type)*10)/10;
}
function totalFragments(){return Object.values(account.fragments||{}).reduce((a,b)=>a+(Number(b)||0),0);}
function updateAccountUI(){
  const count=account.unlocked.length;
  const shopCreditText=adminMode?'∞':account.credits.toLocaleString();
  const values={menuUnlockCount:`${count} / 60`,collectionStatus:'CODEX',menuCredits:shopCreditText,shopCredits:shopCreditText,shopTokens:totalFragments()};
  Object.entries(values).forEach(([id,v])=>{const e=document.getElementById(id);if(e)e.textContent=v;});
  const banner=SUPPLY_BANNERS?.[selectedSupplyBanner]||SUPPLY_BANNERS?.premium;
  const one=document.getElementById('drawOneBtn'),ten=document.getElementById('drawTenBtn');
  if(one&&banner)one.disabled=!adminMode&&account.credits<banner.priceOne;
  if(ten&&banner)ten.disabled=!adminMode&&account.credits<banner.priceTen;
  updateAdminModeUI();
}
function rarityClass(r){return `rarity-${r}`;}
function upgradeUnit(type){
  if(!isUnlocked(type))return;
  const lvl=unitLevel(type);if(lvl>=MAX_UNIT_LEVEL)return;
  const need=fragmentsNeeded(lvl),have=unitFragments(type);if(have<need)return;
  account.fragments[type]=have-need;account.levels[type]=lvl+1;saveAccount();renderCollection();if(state)buildProduction(state.productionCategory||'combat');
}
function factionColor(faction){return faction==='united'?'#2f9dff':faction==='astra'?'#43d982':'#ff504f';}
function categoryName(category){return category==='combat'?'Combat':category==='support'?'Support':'Mining';}
function attachCodexDetailGesture(card,key){
  let pressTimer=null,openedByPress=false;
  card.addEventListener('dblclick',e=>{e.preventDefault();openUnitDetail(key);});
  const start=()=>{openedByPress=false;clearTimeout(pressTimer);pressTimer=setTimeout(()=>{openedByPress=true;openUnitDetail(key);},520);};
  const cancel=()=>{clearTimeout(pressTimer);pressTimer=null;};
  card.addEventListener('touchstart',start,{passive:true});
  card.addEventListener('touchend',cancel,{passive:true});
  card.addEventListener('touchcancel',cancel,{passive:true});
  card.addEventListener('touchmove',cancel,{passive:true});
}
function renderCollection(){
  const box=document.getElementById('collectionGrid');if(!box)return;box.innerHTML='';
  const rarityOrder=collectionSortAscending?['common','elite','hero']:['hero','elite','common'];
  const entries=Object.entries(unitDefs)
    .filter(([,u])=>(collectionFactionFilter==='all'||u.faction===collectionFactionFilter) && (collectionCategoryFilter==='all'||u.category===collectionCategoryFilter))
    .sort((a,b)=>{
      const rarityDiff=rarityOrder.indexOf(a[1].rarity)-rarityOrder.indexOf(b[1].rarity);
      if(rarityDiff)return rarityDiff;
      const idCompare=a[1].id.localeCompare(b[1].id,undefined,{numeric:true,sensitivity:'base'});
      return collectionSortAscending?idCompare:-idCompare;
    });
  entries.forEach(([key,u])=>{
    const owned=isUnlocked(key),lvl=unitLevel(key);
    const frags=unitFragments(key),need=fragmentsNeeded(lvl),maxed=lvl>=MAX_UNIT_LEVEL;
    const fragmentPercent=owned?(maxed?100:Math.min(100,frags/need*100)):0;
    const fragmentLabel=owned?(maxed?'MAX':`${frags} / ${need}`):'미해금';
    const card=document.createElement('article');card.className='collection-card codex-card'+(owned?'':' locked');card.dataset.unit=key;card.style.setProperty('--faction-color',factionColor(u.faction));
    const stats=[['COST',u.cost],['HP',owned?enhancedValue(key,'hp'):u.hp],['ATK',owned?enhancedValue(key,'atk'):u.atk],['DEF',owned?enhancedValue(key,'def'):u.def],['MOV',u.move],['RNG',u.range],['VSN',u.vision],['SPD',u.spd]];
    card.innerHTML=`<div class="codex-card-topline"><span class="faction">${u.factionName}</span><span class="class">${categoryName(u.category)} · ${u.unitClass}</span></div><div class="codex-card-head"><div class="codex-portrait-wrap"><canvas class="codex-portrait" width="236" height="236"></canvas>${owned?'':'<div class="codex-lock">🔒</div>'}</div><div class="codex-card-info"><div class="codex-card-rarity">${rarityInfo[u.rarity].name}</div><h3 class="codex-card-name">${owned?u.name:'미확보 유닛'}</h3><div class="codex-card-level"><b>LV.${lvl}</b><span>조각 ${fragmentLabel}</span></div><div class="codex-fragment-bar${owned?'':' locked'}${maxed?' max':''}"><i style="width:${fragmentPercent}%"></i></div></div></div><div class="codex-divider"></div><div class="codex-stat-grid">${stats.map(([label,value])=>`<div class="codex-stat"><small>${label}</small><b>${value}</b></div>`).join('')}</div><div class="codex-card-foot"><span class="detail-hint">${owned?'더블클릭 · 길게 눌러 상세보기':'상점 보급으로 해금'}</span><strong class="codex-card-code">${u.id}</strong></div>`;
    if(owned){card.classList.add('detail-ready');attachCodexDetailGesture(card,key);}
    box.appendChild(card);drawProductionPortrait(card.querySelector('.codex-portrait'),key);
  });
  document.querySelectorAll('.collection-filter').forEach(btn=>btn.classList.toggle('active',btn.dataset.faction===collectionFactionFilter));
  document.querySelectorAll('.collection-category-filter').forEach(btn=>btn.classList.toggle('active',btn.dataset.category===collectionCategoryFilter));
  const titleMap={all:'전체 유닛 컬렉션',united:'연합군 유닛 컬렉션',astra:'아스트라 유닛 컬렉션',blackcomet:'블랙 코멧 유닛 컬렉션'};
  const categoryTitleMap={all:'',combat:' · 컴뱃',support:' · 지원',mining:' · 채굴'};
  const title=document.getElementById('collectionTitle');if(title)title.textContent=titleMap[collectionFactionFilter]+categoryTitleMap[collectionCategoryFilter];
  const count=document.getElementById('collectionVisibleCount');if(count)count.textContent=`${entries.filter(([k])=>isUnlocked(k)).length} / ${entries.length} 해금`;
  const sortBtn=document.getElementById('collectionSortBtn');if(sortBtn)sortBtn.textContent=collectionSortAscending?'정렬: 커먼 → 히어로 · ID 오름차순':'정렬: 히어로 → 커먼 · ID 내림차순';
}
function parsePassiveEntries(passiveText){
  const raw=String(passiveText||'').replace(/\r/g,'').trim();
  if(!raw||raw==='없음'||raw==='—')return [];
  const lines=raw.split('\n').map(v=>v.trim()).filter(Boolean);
  const entries=[];
  let current=null;
  const pushCurrent=()=>{if(current&&current.name){current.description=current.description.trim();entries.push(current);}current=null;};
  lines.forEach(line=>{
    const stuck=line.match(/^([A-Za-z][A-Za-z0-9'’· .&+\-]*?)(?=[가-힣])/);
    if(stuck){
      pushCurrent();
      current={name:stuck[1].trim(),description:line.slice(stuck[1].length).trim()};
      return;
    }
    const looksLikeName=/^[A-Za-z][A-Za-z0-9'’· .&+\-]*$/.test(line);
    if(looksLikeName){pushCurrent();current={name:line,description:''};}
    else if(current){current.description+=(current.description?'\n':'')+line;}
  });
  pushCurrent();
  return entries;
}
function passiveNames(passiveText){
  const entries=parsePassiveEntries(passiveText);
  return entries.map(e=>e.name);
}
function escapeHtml(value){return String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));}

function openUnitDetail(key, context='codex'){
  const u=unitDefs[key];if(!u)return;currentDetailUnit=key;const owned=isUnlocked(key),lvl=unitLevel(key),frags=unitFragments(key),need=fragmentsNeeded(lvl),maxed=lvl>=MAX_UNIT_LEVEL;
  const win=document.getElementById('unitDetailWindow');win.style.setProperty('--faction-color',factionColor(u.faction));
  document.getElementById('unitDetailTags').innerHTML=`<span class="faction">${u.factionName}</span><span class="rarity-tag">${rarityInfo[u.rarity].name}</span><span class="level-tag">LV.${lvl}</span><span class="cost-tag">COST ${u.cost}</span>`; const detailIdentity=document.getElementById('unitDetailTags').parentElement; let factionLine=detailIdentity.querySelector('.unit-detail-faction'); if(!factionLine){factionLine=document.createElement('div');factionLine.className='unit-detail-faction';detailIdentity.insertBefore(factionLine,document.getElementById('unitDetailTags'));} factionLine.textContent=u.factionName;
  document.getElementById('unitDetailName').textContent=owned?u.name:'미확보 유닛';document.getElementById('unitDetailSub').innerHTML=`${categoryName(u.category)} · ${u.unitClass}<div class="unit-detail-head-code">${u.id}</div>`;
  const stats=[
    ['COST',u.cost,null],
    ['HP',u.hp,owned?enhancedValue(key,'hp')-u.hp:0],
    ['ATK',u.atk,owned?enhancedValue(key,'atk')-u.atk:0],
    ['DEF',u.def,owned?enhancedValue(key,'def')-u.def:0],
    ['MOV',u.move,null],['RNG',u.range,null],['VSN',u.vision,null],['SPD',u.spd,null]
  ];
  const cleanStatNumber=value=>{
    const n=Math.round((Number(value)||0)*10)/10;
    return Number.isInteger(n)?String(n):n.toFixed(1);
  };
  document.getElementById('unitDetailStats').innerHTML=stats.map(([l,base,bonus])=>{
    const showBonus=Number(bonus)>0.0001;
    return `<div class="detail-stat"><small>${l}</small><div class="detail-stat-value"><span class="stat-base">${cleanStatNumber(base)}</span>${showBonus?`<span class="stat-bonus">${cleanStatNumber(bonus)}</span>`:''}</div></div>`;
  }).join('');
  document.getElementById('unitDetailDescription').textContent=owned?u.appearance:'아직 확보하지 못한 유닛입니다. 상점 보급에서 획득하면 외형과 상세 정보를 확인할 수 있습니다.';
  const passiveEntries=parsePassiveEntries(u.passive);
  document.getElementById('unitDetailPassive').innerHTML=passiveEntries.length
    ? `<div class="detail-passive-list">${passiveEntries.map(entry=>`<div class="detail-passive-entry"><div class="detail-passive-title">${escapeHtml(entry.name)}</div>${entry.description?`<div class="detail-passive-description">${escapeHtml(entry.description)}</div>`:''}</div>`).join('')}</div>`
    : '<span class="detail-passive-empty">패시브 스킬 없음</span>';
  const development=document.getElementById('unitDevelopmentSection');
  if(development)development.classList.toggle('unit-development-hidden',context==='ingame');
  document.getElementById('unitDetailLevel').textContent=`LV.${lvl}`;document.getElementById('unitDetailFragments').textContent=owned?`${frags} / ${maxed?'MAX':need}`:'미해금';document.getElementById('unitDetailProgressBar').style.width=owned?(maxed?100:Math.min(100,frags/need*100))+'%':'0%';
  const up=document.getElementById('unitDetailUpgrade');up.disabled=context==='ingame'||!owned||maxed||frags<need;up.textContent=!owned?'유닛 미해금':maxed?'최대 레벨':`레벨업 · 조각 ${need}개`;up.onclick=()=>{if(context==='ingame')return;upgradeUnit(key);openUnitDetail(key,'codex');};
  drawProductionPortrait(document.getElementById('unitDetailPortrait'),key);document.getElementById('unitDetailModal').classList.add('open');
}
function closeUnitDetail(){document.getElementById('unitDetailModal')?.classList.remove('open');currentDetailUnit=null;}
const SUPPLY_BANNERS={
  premium:{id:'premium',title:'프리미엄 통합 보급',badge:'PREMIUM',faction:null,color:'#c88cff',priceOne:400,priceTen:3600,rates:{common:55,elite:40,hero:5},copy:'3개 세력 60종이 모두 등장합니다.<br>COMMON 55% · ELITE 40% · HERO 5%가 적용됩니다.'},
  united:{id:'united',title:'연합군 지정 보급',badge:'UNITED',faction:'united',color:'#2f9dff',priceOne:300,priceTen:2700,rates:{common:68,elite:30,hero:2},copy:'연합군 소속 20종만 등장합니다.<br>원하는 연합군 덱 완성과 중복 조각 수집에 유리합니다.'},
  astra:{id:'astra',title:'아스트라 지정 보급',badge:'ASTRA',faction:'astra',color:'#43d982',priceOne:300,priceTen:2700,rates:{common:68,elite:30,hero:2},copy:'아스트라 소속 20종만 등장합니다.<br>원하는 아스트라 덱 완성과 중복 조각 수집에 유리합니다.'},
  blackcomet:{id:'blackcomet',title:'블랙 코멧 지정 보급',badge:'BLACK COMET',faction:'blackcomet',color:'#ff504f',priceOne:300,priceTen:2700,rates:{common:68,elite:30,hero:2},copy:'블랙 코멧 소속 20종만 등장합니다.<br>원하는 블랙 코멧 덱 완성과 중복 조각 수집에 유리합니다.'}
};
let selectedSupplyBanner='premium';
function supplyPool(banner,rarity){return Object.keys(unitDefs).filter(k=>unitDefs[k].rarity===rarity&&(!banner.faction||unitDefs[k].faction===banner.faction));}
function weightedRarity(banner,minElite=false){
  const rates=banner.rates,roll=Math.random()*100;
  if(minElite){const total=rates.elite+rates.hero;return roll<(rates.elite/total*100)?'elite':'hero';}
  if(roll<rates.common)return 'common';if(roll<rates.common+rates.elite)return 'elite';return 'hero';
}
function drawUnit(banner,rarity){const pool=supplyPool(banner,rarity);return pool[Math.floor(Math.random()*pool.length)];}
function renderSupplyBanner(){
  const banner=SUPPLY_BANNERS[selectedSupplyBanner];if(!banner)return;
  const wrap=document.getElementById('selectedSupplyBanner');if(wrap)wrap.style.setProperty('--selected-banner',banner.color);
  document.getElementById('supplyTitle').textContent=banner.title;
  document.getElementById('supplyCopy').innerHTML=banner.copy;
  document.getElementById('supplyBadge').textContent=banner.badge;
  const rows=[['common','COMMON'],['elite','ELITE'],['hero','HERO']];
  document.getElementById('supplyRateTable').innerHTML=`<div class="rate-row rate-head"><span>등급</span><span>유닛 수</span><span>등장률</span><span class="unit-odds">개별 확률</span></div>`+rows.map(([r,n])=>{const count=supplyPool(banner,r).length,odds=count?(banner.rates[r]/count).toFixed(3):'0.000';return `<div class="rate-row"><b class="${rarityClass(r)}">${n}</b><span>${count}종</span><b>${banner.rates[r]}%</b><span class="unit-odds">약 ${odds}%</span></div>`}).join('');
  const one=document.getElementById('drawOneBtn'),ten=document.getElementById('drawTenBtn');
  one.textContent=`1회 보급 · ${banner.priceOne.toLocaleString()}`;ten.textContent=`10회 보급 · ${banner.priceTen.toLocaleString()}`;
  document.querySelectorAll('.supply-product').forEach(btn=>btn.classList.toggle('active',btn.dataset.banner===selectedSupplyBanner));
  updateAccountUI();
}
function performGacha(count){
  const banner=SUPPLY_BANNERS[selectedSupplyBanner],price=count===10?banner.priceTen:banner.priceOne;if(!adminMode&&account.credits<price)return;if(!adminMode)account.credits-=price;const results=[];
  for(let i=0;i<count;i++){
    const rarity=weightedRarity(banner,count===10&&i===count-1),key=drawUnit(banner,rarity),isNew=!isUnlocked(key);
    if(isNew){account.unlocked.push(key);account.levels[key]=1;account.fragments[key]=account.fragments[key]||0;}
    else account.fragments[key]=unitFragments(key)+3;
    results.push({key,isNew});
  }
  saveAccount();renderCollection();renderGachaResults(results);if(state)buildProduction(state.productionCategory||'combat');
}
function renderGachaResults(results){
  const legacyWrap=document.getElementById('drawResult'),legacyBox=document.getElementById('resultGrid');
  if(legacyWrap)legacyWrap.classList.remove('show');
  if(legacyBox)legacyBox.innerHTML='';
  const modal=document.getElementById('gachaResultModal'),box=document.getElementById('gachaResultGrid');
  if(!modal||!box)return;
  box.innerHTML='';
  const resultWindow=modal.querySelector('.gacha-result-window');
  modal.classList.toggle('single-result',results.length===1);
  modal.classList.toggle('multi-result',results.length>1);
  if(resultWindow){
    resultWindow.classList.toggle('single-result-window',results.length===1);
    resultWindow.classList.toggle('multi-result-window',results.length>1);
  }
  results.forEach(({key,isNew},index)=>{
    const u=unitDefs[key],card=document.createElement('div');
    card.className='gacha-result-card'+(isNew?' new':'');
    card.style.animationDelay=`${index*55}ms`;
    card.innerHTML=`<canvas width="220" height="220"></canvas><div class="gacha-result-meta"><span class="gacha-faction" style="color:${factionColor(u.faction)}">${u.factionName}</span><span class="gacha-rarity">${rarityInfo[u.rarity].name}</span></div><b>${u.name}</b><span class="gacha-unit-class">${categoryName(u.category)} · ${u.unitClass}</span><small>${isNew?'NEW · 코덱스 해금':'중복 획득 · 유닛 조각 +3'}</small>`;
    box.appendChild(card);
    drawProductionPortrait(card.querySelector('canvas'),key);
  });
  modal.classList.add('open');
}
function closeGachaResult(){document.getElementById('gachaResultModal')?.classList.remove('open');}
let metaOpenedFromMainMenu=false;
function openMeta(id){
  const mainMenu=document.getElementById('mainMenu');
  metaOpenedFromMainMenu=!mainMenu.classList.contains('hidden');
  ['collectionModal','shopModal','optionsModal'].forEach(mid=>{if(mid!==id)closeMeta(mid,false);});
  if(metaOpenedFromMainMenu) mainMenu.classList.add('hidden');
  document.getElementById('gameShell').classList.add('menu-locked');
  document.getElementById(id)?.classList.add('open');
  if(id==='collectionModal')renderCollection();
  if(id==='shopModal')updateAccountUI();
  if(id==='optionsModal')updateAccountUI();
}
function closeMeta(id,restoreMain=true){
  document.getElementById(id)?.classList.remove('open');
  if(restoreMain&&metaOpenedFromMainMenu){
    document.getElementById('mainMenu').classList.remove('hidden');
    document.getElementById('gameShell').classList.add('menu-locked');
    metaOpenedFromMainMenu=false;
    updateAccountUI();
  }
}
function backToMainMenuFromMeta(id){
  document.getElementById(id)?.classList.remove('open');
  metaOpenedFromMainMenu=false;
  document.getElementById('gameShell').classList.add('menu-locked');
  document.getElementById('mainMenu').classList.remove('hidden');
  updateAccountUI();
}



function updateAdminModeUI(){
  const btn=document.getElementById('adminModeBtn');
  const status=document.getElementById('adminModeStatus');
  if(btn){
    btn.classList.toggle('active',adminMode);
    btn.textContent=adminMode?'관리자 모드 비활성화':'관리자 모드 활성화';
  }
  if(status){
    status.classList.toggle('active',adminMode);
    status.textContent=adminMode?'활성화 · 상점 크레딧 무제한':'비활성화';
  }
}
function toggleAdminMode(){
  if(adminMode){
    adminMode=false;
    localStorage.removeItem('corium_admin_mode_v1');
    updateAccountUI();
    return;
  }
  const password=prompt('관리자 비밀번호를 입력하세요.');
  if(password===null)return;
  if(password!==ADMIN_PASSWORD){
    alert('비밀번호가 올바르지 않습니다.');
    return;
  }
  adminMode=true;
  localStorage.setItem('corium_admin_mode_v1','true');
  updateAccountUI();
  alert('관리자 모드가 활성화되었습니다. 상점 크레딧이 무제한으로 적용됩니다.');
}

function resetAllSavedData(){
  const ok=confirm('모든 저장 데이터를 초기화할까요?\n\n해금 유닛, 크레딧, 유닛 조각과 레벨이 모두 처음 상태로 돌아갑니다.');
  if(!ok)return;
  localStorage.removeItem(ACCOUNT_KEY);
  localStorage.removeItem('corium_admin_mode_v1');
  adminMode=false;
  const base=blankProgress();
  account={credits:3000,unlocked:[...STARTER_UNITS],...base};
  collectionSortAscending=true;
  collectionFactionFilter='all';
  collectionCategoryFilter='all';
  saveAccount();
  resetGame();
  renderCollection();
  const resultWrap=document.getElementById('drawResult');
  const resultGrid=document.getElementById('resultGrid');
  if(resultWrap)resultWrap.classList.remove('show');
  if(resultGrid)resultGrid.innerHTML='';
  closeGachaResult?.();
  closeMeta('optionsModal',false);
  document.getElementById('gameShell').classList.add('menu-locked');
  document.getElementById('mainMenu').classList.remove('hidden');
  metaOpenedFromMainMenu=false;
  updateAccountUI();
  alert('게임 데이터가 초기 상태로 복구되었습니다.');
}


/* ===== src/map.js ===== */
function seededNoise(q,r,salt=0){
  const x=Math.sin((q+1)*12.9898+(r+1)*78.233+salt*37.719)*43758.5453;
  return x-Math.floor(x);
}
function hexDistance(a,b){
  const aq=a.q, ar=a.r, bq=b.q, br=b.r;
  const ax=aq, az=ar-(aq-(aq&1))/2, ay=-ax-az;
  const bx=bq, bz=br-(bq-(bq&1))/2, by=-bx-bz;
  return Math.max(Math.abs(ax-bx),Math.abs(ay-by),Math.abs(az-bz));
}
function randomChoice(arr){return arr[Math.floor(Math.random()*arr.length)];}
function shuffled(arr){
  const copy=[...arr];
  for(let i=copy.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[copy[i],copy[j]]=[copy[j],copy[i]];}
  return copy;
}
function generateMatchLayout(){
  const center={q:Math.floor(COLS/2),r:Math.floor(ROWS/2)};
  const quadrants=[
    {q0:1,q1:5,r0:1,r1:5},
    {q0:COLS-6,q1:COLS-2,r0:1,r1:5},
    {q0:COLS-6,q1:COLS-2,r0:ROWS-6,r1:ROWS-2},
    {q0:1,q1:5,r0:ROWS-6,r1:ROWS-2}
  ];
  const bases=[];
  quadrants.forEach((zone,owner)=>{
    const candidates=[];
    for(let q=zone.q0;q<=zone.q1;q++)for(let r=zone.r0;r<=zone.r1;r++){
      const p={q,r};
      if(hexDistance(p,center)>=5&&bases.every(b=>hexDistance(p,b)>=8))candidates.push(p);
    }
    const pick=randomChoice(candidates.length?candidates:[{q:zone.q0,r:zone.r0}]);
    bases.push(mkBase(owner,pick.q,pick.r));
  });

  const mineSlots=[3,2,2,2,2,1,1,1,1,1,1,1,1];
  const allCells=[];
  for(let q=1;q<COLS-1;q++)for(let r=1;r<ROWS-1;r++)allCells.push({q,r});
  const mines=[];
  for(const slots of mineSlots){
    const candidates=shuffled(allCells).filter(p=>
      bases.every(b=>hexDistance(p,b)>=3)&&
      mines.every(m=>hexDistance(p,m)>=2)&&
      !(slots===3&&hexDistance(p,center)>3)
    );
    let pick=candidates[0];
    if(!pick){
      pick=shuffled(allCells).find(p=>bases.every(b=>hexDistance(p,b)>=2)&&mines.every(m=>hexDistance(p,m)>=1));
    }
    if(pick)mines.push({q:pick.q,r:pick.r,slots});
  }
  return {bases,mines};
}
function generateTerrain(layout){
  const terrain=[];
  const fixedPlain=new Set();
  layout.bases.forEach(b=>{
    fixedPlain.add(`${b.q},${b.r}`);
    neighbors(b.q,b.r).forEach(p=>fixedPlain.add(`${p.q},${p.r}`));
  });
  layout.mines.forEach(m=>fixedPlain.add(`${m.q},${m.r}`));
  for(let q=0;q<COLS;q++)for(let r=0;r<ROWS;r++){
    const n=seededNoise(q,r), edge=Math.min(q,r,COLS-1-q,ROWS-1-r);
    let type='plain';
    if(!fixedPlain.has(`${q},${r}`)){
      if((n<.10&&edge<2)||(n>.94&&edge<3)) type='water';
      else if(n>.72&&n<.90) type='mountain';
    }
    terrain.push({q,r,type,variant:Math.floor(seededNoise(q,r,2)*4)});
  }
  return terrain;
}
function terrainAt(q,r){return state.terrain.find(t=>t.q===q&&t.r===r)||{type:'plain',variant:0};}
function terrainMoveCost(q,r){
  const type=terrainAt(q,r).type;
  if(type==='water') return Infinity;
  return type==='mountain'?1.5:1;
}
function terrainPassable(q,r){return terrainMoveCost(q,r)!==Infinity;}
function resetGame(){
  const layout=generateMatchLayout();
  state = {
    turn:1, phase:'command', selected:null, winner:null, logs:[],
    players:[
      {corium:5,alive:true},
      {corium:5,alive:true},
      {corium:5,alive:true},
      {corium:5,alive:true}
    ],
    bases:layout.bases,
    mines:layout.mines,
    units:[],
    nextId:1,
    productionCategory:'combat',
    selectedProductionType:null,
    productionQueue:[],
    actionMode:null,
    effects:[],
    terrain:generateTerrain(layout),
    animPositions:{},
    unitAnimations:{},
    actionFx:[],
    rewardGranted:false,
    rankings:null
  };
  log('매치 시작 · 베이스와 광산이 무작위 배치되었습니다 · 15×15 맵');
  buildProduction();
  resize();
  updateUI();
}
function mkBase(owner,q,r){return {owner,q,r,hp:60,maxHp:60,atk:6,def:10,spd:3,range:2,vision:5};}
function log(t){state.logs.unshift(`[T${state.turn}] ${t}`); state.logs=state.logs.slice(0,120);}
function canAct(unit){return !!unit&&unit.hp>0&&(unit.summonedTurn??0)<state.turn;}

function neighbors(q,r){
  // hexCenter()가 column(q) parity를 사용하므로 인접 계산도 같은 좌표계를 사용한다.
  const dirs = q%2===0
    ? [[1,0],[-1,0],[0,-1],[-1,-1],[0,1],[-1,1]]
    : [[1,0],[-1,0],[1,-1],[0,-1],[1,1],[0,1]];
  return dirs.map(([dq,dr])=>({q:q+dq,r:r+dr})).filter(p=>inside(p.q,p.r));
}
function inside(q,r){return q>=0&&q<COLS&&r>=0&&r<ROWS;}
function mineAt(q,r){return state.mines.find(m=>m.q===q&&m.r===r)||null;}
function minersAtMine(mine){
  return state.units.filter(u=>u.hp>0&&u.q===mine.q&&u.r===mine.r&&unitDefs[u.type].mining&&u.miningAt&&u.miningAt.q===mine.q&&u.miningAt.r===mine.r);
}
function reservedMinerCount(mine,excludeId=null){
  return state.units.filter(u=>
    u.hp>0&&
    u.id!==excludeId&&
    unitDefs[u.type].mining&&
    u.order&&u.order.kind==='mine'&&
    u.order.q===mine.q&&u.order.r===mine.r&&
    !(u.q===mine.q&&u.r===mine.r&&u.miningAt&&u.miningAt.q===mine.q&&u.miningAt.r===mine.r)
  ).length;
}
function mineHasSpace(mine,excludeId=null){
  // 현재 광맥에 이미 들어가 있는 선택 유닛은 슬롯 계산에서 제외한다.
  const occupiedCount=minersAtMine(mine).filter(u=>u.id!==excludeId).length;
  return occupiedCount+reservedMinerCount(mine,excludeId)<mine.slots;
}
function unitAt(q,r,excludeId=null){
  return state.units.find(u=>u.hp>0&&u.id!==excludeId&&u.q===q&&u.r===r)||null;
}
function enemyAt(q,r,owner,excludeId=null){
  return state.units.find(u=>u.hp>0&&u.id!==excludeId&&u.owner!==owner&&u.q===q&&u.r===r)||null;
}
function alliedAt(q,r,owner,excludeId=null){
  return state.units.find(u=>u.hp>0&&u.id!==excludeId&&u.owner===owner&&u.q===q&&u.r===r)||null;
}
function occupied(q,r,unit=null,{forPath=false}={}){
  if(state.bases.some(b=>b.hp>0&&b.q===q&&b.r===r)) return true;
  const mine=mineAt(q,r);
  if(mine){
    if(!unit||!unitDefs[unit.type].mining) return true;
    return !mineHasSpace(mine,unit.id);
  }
  const other=unitAt(q,r,unit?.id);
  if(!other) return false;
  // 아군은 경로상 통과 가능하지만 목적지에는 겹쳐 설 수 없다.
  if(forPath&&unit&&other.owner===unit.owner) return false;
  return true;
}

function reachableTiles(unit){
  if(!unit || unit.ordered || !canAct(unit)) return [];
  const maxMove=unitDefs[unit.type].move;
  const visited=new Map([[`${unit.q},${unit.r}`,0]]);
  const queue=[{q:unit.q,r:unit.r,cost:0}];
  const result=[];
  while(queue.length){
    queue.sort((a,b)=>a.cost-b.cost);
    const cur=queue.shift();
    for(const next of neighbors(cur.q,cur.r)){
      const stepCost=terrainMoveCost(next.q,next.r);
      if(!Number.isFinite(stepCost)) continue;
      const nextCost=cur.cost+stepCost;
      if(nextCost>maxMove) continue;
      const key=`${next.q},${next.r}`;
      if(visited.has(key)&&visited.get(key)<=nextCost) continue;
      if(occupied(next.q,next.r,unit,{forPath:true})) continue;
      visited.set(key,nextCost);
      queue.push({q:next.q,r:next.r,cost:nextCost});
      // 아군이 서 있는 칸은 지나갈 수만 있고 최종 목적지로는 지정할 수 없다.
      if(!alliedAt(next.q,next.r,unit.owner,unit.id)){
        const existing=result.find(t=>t.q===next.q&&t.r===next.r);
        if(existing) existing.cost=nextCost; else result.push({q:next.q,r:next.r,cost:nextCost});
      }
    }
  }
  return result;
}
function findMovementPath(unit,tq,tr,maxCost=Infinity){
  if(!inside(tq,tr)||!terrainPassable(tq,tr)) return [];
  const start=`${unit.q},${unit.r}`, goal=`${tq},${tr}`;
  const costs=new Map([[start,0]]), prev=new Map();
  const queue=[{q:unit.q,r:unit.r,cost:0}];
  while(queue.length){
    queue.sort((a,b)=>a.cost-b.cost);
    const cur=queue.shift(), curKey=`${cur.q},${cur.r}`;
    if(curKey===goal) break;
    if(cur.cost!==costs.get(curKey)) continue;
    for(const next of neighbors(cur.q,cur.r)){
      const step=terrainMoveCost(next.q,next.r);
      if(!Number.isFinite(step)) continue;
      if((next.q!==tq||next.r!==tr)&&occupied(next.q,next.r,unit,{forPath:true})) continue;
      if((next.q===tq&&next.r===tr)&&occupied(next.q,next.r,unit)) continue;
      const nc=cur.cost+step, key=`${next.q},${next.r}`;
      if(nc>maxCost||(costs.has(key)&&costs.get(key)<=nc)) continue;
      costs.set(key,nc);prev.set(key,curKey);queue.push({q:next.q,r:next.r,cost:nc});
    }
  }
  if(!costs.has(goal)) return [];
  const path=[];let key=goal;
  while(key!==start){const [q,r]=key.split(',').map(Number);path.push({q,r});key=prev.get(key);if(!key)return [];}
  path.push({q:unit.q,r:unit.r});path.reverse();
  return path;
}

function isReachable(unit,q,r){
  return reachableTiles(unit).some(t=>t.q===q && t.r===r);
}

function dist(a,b){
  // offset -> cube
  const ac=offsetToCube(a.q,a.r), bc=offsetToCube(b.q,b.r);
  return Math.max(Math.abs(ac.x-bc.x),Math.abs(ac.y-bc.y),Math.abs(ac.z-bc.z));
}
function offsetToCube(q,r){
  // odd-q vertical layout: 화면의 모든 맞닿은 헥스는 정확히 거리 1이다.
  const x=q, z=r-(q-(q&1))/2, y=-x-z; return {x,y,z};
}
function visibleTo(owner,q,r){
  const b=state.bases[owner];
  if(b.hp>0 && dist(b,{q,r})<=b.vision) return true;
  return state.units.some(u=>u.owner===owner&&u.hp>0&&dist(u,{q,r})<=unitDefs[u.type].vision);
}
function nearestStep(u,target){
  const cand=neighbors(u.q,u.r).filter(c=>!occupied(c.q,c.r,u));
  cand.sort((a,b)=>dist(a,target)-dist(b,target));
  return cand[0]||null;
}
function enemyAdjacent(u){
  return state.units.some(e=>e.owner!==u.owner&&e.hp>0&&dist(u,e)<=1) ||
         state.bases.some(b=>b.owner!==u.owner&&b.hp>0&&dist(u,b)<=1);
}


/* ===== src/production.js ===== */
function buildProduction(category=state.productionCategory||'combat'){
  state.productionCategory=category;
  const box=document.getElementById('production');
  if(!box) return;
  box.innerHTML='';

  const availableUnits=Object.entries(unitDefs)
    .filter(([key,u])=>u.category===category&&isUnlocked(key)&&(!selectedPlayerFaction||u.faction===selectedPlayerFaction));

  availableUnits.forEach(([key,u])=>{
      const b=document.createElement('button');
      b.className='unit-card';
      b.dataset.unit=key;
      b.innerHTML=`
        <div class="unit-card-main">
          <canvas class="production-portrait" width="164" height="164"></canvas>
          <div>
            <div class="unit-card-top">
              <div class="unit-card-identity" style="--unit-faction-color:${factionColor(u.faction)}">
                <div class="unit-card-headline">
                  <span class="unit-card-faction">${u.factionName}</span>
                  <span class="unit-card-cost">${u.cost}C</span>
                </div>
                <div class="unit-card-name">${u.name}</div>
                <div class="unit-card-meta-grid">
                  <span class="unit-card-meta-chip level">LV.${unitLevel(key)}</span>
                  <span class="unit-card-meta-chip rarity">${rarityInfo[u.rarity].name}</span>
                  <span class="unit-card-meta-chip category">${categoryName(u.category).toUpperCase()}</span>
                  <span class="unit-card-meta-chip role">${u.unitClass.toUpperCase()}</span>
                </div>
              </div>
            </div>
            <div class="unit-card-passive"><span class="unit-card-passive-label">PASSIVE</span>${passiveNames(u.passive).length?passiveNames(u.passive).map(name=>`<span class="unit-card-passive-name">${escapeHtml(name)}</span>`).join(''):'<span class="unit-card-passive-name unit-card-passive-empty">패시브 스킬 없음</span>'}</div>
          </div>
        </div>
        <div class="unit-card-stats">
          <span>HP ${enhancedValue(key,'hp')}</span>
          <span>${u.mining?'채집 '+enhancedValue(key,'mining'):u.support?'지원 '+enhancedValue(key,'support'):'공격 '+enhancedValue(key,'atk')}</span>
          <span>이동 ${u.move}</span>
          <span>방어 ${enhancedValue(key,'def')}</span>
          <span>사거리 ${u.range}</span>
          <span>시야 ${u.vision}</span>
        </div>`;
      b.classList.toggle('queue-added',state.productionQueue.some(item=>item.type===key));
      let singleClickTimer=null;
      b.onclick=()=>{
        clearTimeout(singleClickTimer);
        singleClickTimer=setTimeout(()=>addUnitToQueue(key,1),220);
      };
      b.ondblclick=e=>{
        clearTimeout(singleClickTimer);
        e.preventDefault();
        openUnitDetail(key,'ingame');
      };
      box.appendChild(b);
      drawProductionPortrait(b.querySelector('.production-portrait'),key);
      requestAnimationFrame(()=>{
        const viewport=b.querySelector('.unit-meta-viewport');
        const original=b.querySelector('.unit-meta-copy:not(.clone)');
        if(!viewport||!original)return;
        const configureMarquee=()=>{
          const originalWidth=Math.ceil(original.getBoundingClientRect().width);
          const viewportWidth=Math.floor(viewport.getBoundingClientRect().width);
          const needsScroll=originalWidth>viewportWidth+1;
          viewport.classList.toggle('is-scrolling',needsScroll);
          if(needsScroll){
            const distance=originalWidth;
            const duration=Math.max(15,distance/13);
            viewport.style.setProperty('--marquee-shift',`${-distance}px`);
            viewport.style.setProperty('--marquee-duration',`${duration}s`);
            const track=viewport.querySelector('.unit-meta-track');
            if(track){
              track.style.animation='none';
              void track.offsetWidth;
              track.style.animation='';
            }
          }else{
            viewport.style.removeProperty('--marquee-shift');
            viewport.style.removeProperty('--marquee-duration');
          }
        };
        configureMarquee();
        if(document.fonts?.ready)document.fonts.ready.then(configureMarquee);
        if(window.ResizeObserver){
          const marqueeObserver=new ResizeObserver(configureMarquee);
          marqueeObserver.observe(viewport);
        }
      });
    });

  if(!availableUnits.length){
    const factionName=selectedPlayerFaction?factionDisplayNames[selectedPlayerFaction]:'선택 세력';
    box.innerHTML=`<div class="production-empty"><b>${factionName}</b><span>현재 보유한 ${categoryName(category)} 유닛이 없습니다</span><small>STORE에서 유닛을 획득하면 이곳에 표시됩니다</small></div>`;
  }

  document.querySelectorAll('.prod-tab').forEach(tab=>{
    tab.classList.toggle('active',tab.dataset.category===category);
  });
  refreshProductionButtons();
}
function drawProductionPortrait(canvasEl,type){
  if(!canvasEl)return;
  const g=canvasEl.getContext('2d'),w=canvasEl.width,h=canvasEl.height;
  g.clearRect(0,0,w,h);
  const def=unitDefs[type], fc=def?factionColor(def.faction):'#2aaeea';
  const bg=g.createRadialGradient(w*.48,h*.38,2,w*.5,h*.52,w*.78);
  bg.addColorStop(0,'#183e60');bg.addColorStop(.36,'#0a1c2c');bg.addColorStop(.76,'#030a11');bg.addColorStop(1,'#010305');
  g.fillStyle=bg;g.fillRect(0,0,w,h);
  // subtle hangar grid and spotlight
  g.save();g.globalAlpha=.14;g.strokeStyle=fc;g.lineWidth=Math.max(1,w/240);
  for(let i=-h;i<w+h;i+=Math.max(18,w*.12)){g.beginPath();g.moveTo(i,0);g.lineTo(i-h,h);g.stroke();}
  g.globalAlpha=.10;for(let y=h*.58;y<h;y+=Math.max(10,h*.07)){g.beginPath();g.moveTo(0,y);g.lineTo(w,y);g.stroke();}
  const light=g.createLinearGradient(0,0,0,h);light.addColorStop(0,'rgba(150,220,255,.13)');light.addColorStop(.55,'rgba(30,120,190,.025)');light.addColorStop(1,'rgba(0,0,0,.30)');g.fillStyle=light;g.fillRect(0,0,w,h);g.restore();
  const oldCtx=ctx;ctx=g;
  try{drawUnitIcon(type,w/2,h*.54,Math.min(w,h)*.80,0,false);}finally{ctx=oldCtx;}
  // bevel frame
  const frame=g.createLinearGradient(0,0,w,h);frame.addColorStop(0,'#bfeaff');frame.addColorStop(.18,fc);frame.addColorStop(.7,'#123653');frame.addColorStop(1,fc);
  g.strokeStyle=frame;g.lineWidth=Math.max(2,w*.014);g.strokeRect(3,3,w-6,h-6);
  g.strokeStyle='rgba(255,255,255,.16)';g.lineWidth=1;g.strokeRect(7,7,w-14,h-14);
}

function queueCost(){
  return state.productionQueue.reduce((sum,item)=>sum+unitDefs[item.type].cost*item.qty,0);
}
function queueCount(){return state.productionQueue.reduce((sum,item)=>sum+item.qty,0);}
function renderProductionQueue(){
  const box=document.getElementById('productionQueue');
  const summary=document.getElementById('queueSummary');
  if(!box)return;
  if(!state.productionQueue.length){
    box.innerHTML='<div class="queue-empty">유닛 카드를 한 번 클릭하면 이곳에 추가됩니다</div>';
    if(summary)summary.textContent='추가된 유닛 없음';
    document.querySelectorAll('#production .unit-card').forEach(card=>card.classList.remove('queue-added'));
    return;
  }
  box.innerHTML='';
  state.productionQueue.forEach((item,i)=>{
    const def=unitDefs[item.type];
    const row=document.createElement('div');
    row.className='queue-row';
    row.innerHTML=`
      <div class="queue-unit-info">
        <div class="queue-unit-name">${def.name}</div>
        <div class="queue-unit-meta">${def.cost} C × ${item.qty} · ${def.cost*item.qty} C</div>
      </div>
      <div class="queue-qty">
        <button class="queue-minus" aria-label="수량 감소">−</button>
        <input class="queue-input" type="number" min="1" max="9" value="${item.qty}" aria-label="소환 수량">
        <button class="queue-plus" aria-label="수량 증가">＋</button>
      </div>
      <button class="queue-remove" aria-label="대기열에서 제거">×</button>`;
    const setQty=value=>{
      item.qty=Math.max(1,Math.min(9,Number(value)||1));
      renderProductionQueue();
      updateProductionSelection();
    };
    row.querySelector('.queue-minus').onclick=()=>setQty(item.qty-1);
    row.querySelector('.queue-plus').onclick=()=>setQty(item.qty+1);
    row.querySelector('.queue-input').onchange=e=>setQty(e.target.value);
    row.querySelector('.queue-remove').onclick=()=>{
      state.productionQueue.splice(i,1);
      renderProductionQueue();
      updateProductionSelection();
      buildProduction(state.productionCategory||'combat');
    };
    box.appendChild(row);
  });
  if(summary)summary.textContent=`${state.productionQueue.length}종 · 총 ${queueCount()}기 · ${queueCost()} C`;
  document.querySelectorAll('#production .unit-card').forEach(card=>card.classList.toggle('queue-added',state.productionQueue.some(item=>item.type===card.dataset.unit)));
}
function updateProductionSelection(){
  const summonBtn=document.getElementById('confirmSummon');
  if(!summonBtn)return;
  const capacity=UNIT_CAP-state.units.filter(u=>u.owner===0&&u.hp>0).length;
  const spots=neighbors(state.bases[0].q,state.bases[0].r).filter(c=>!occupied(c.q,c.r)).length;
  summonBtn.disabled=!state.productionQueue.length || queueCost()>state.players[0].corium || queueCount()>capacity || queueCount()>spots;
  summonBtn.textContent=state.productionQueue.length?`일괄 소환 · ${queueCost()} C`:'일괄 소환';
  renderProductionQueue();
}
function addUnitToQueue(type,qty=1){
  if(!type||!unitDefs[type])return;
  const existing=state.productionQueue.find(x=>x.type===type);
  if(existing)existing.qty=Math.min(9,existing.qty+qty);
  else state.productionQueue.push({type,qty:Math.max(1,Math.min(9,qty))});
  renderProductionQueue();
  updateProductionSelection();
  buildProduction(state.productionCategory||'combat');
}
function confirmSelectedSummon(){
  if(!state.productionQueue.length)return;
  const items=state.productionQueue.flatMap(item=>Array(item.qty).fill(item.type));
  if(queueCost()>state.players[0].corium){log('코리움이 부족합니다');return;}
  let made=0;
  for(const type of items){const before=state.units.length;produce(0,type);if(state.units.length>before)made++;else break;}
  if(made===items.length) state.productionQueue=[];
  document.getElementById('modalCorium').textContent=state.players[0].corium;
  buildProduction(state.productionCategory||'combat');updateProductionSelection();
}

function openProductionModal(){
  if(state.phase!=='command'||state.winner!==null||!state.players[0].alive) return;
  document.getElementById('modalCorium').textContent=state.players[0].corium;
  state.selectedProductionType=null;
  buildProduction(state.productionCategory||'combat');
  updateProductionSelection();
  document.getElementById('productionModal').classList.add('open');
}
function closeProductionModal(){
  document.getElementById('productionModal').classList.remove('open');
}
function refreshProductionButtons(){
  document.querySelectorAll('#production .unit-card').forEach(b=>{
    const d=unitDefs[b.dataset.unit];
    b.disabled=!isUnlocked(b.dataset.unit)||state.phase!=='command'||state.players[0].corium<d.cost||
      state.units.filter(u=>u.owner===0&&u.hp>0).length>=UNIT_CAP;
  });
  const mc=document.getElementById('modalCorium');
  if(mc) mc.textContent=state.players[0].corium;
  updateProductionSelection();
}

function produce(owner,type){
  if(state.phase!=='command'||state.winner!==null) return;
  const p=state.players[owner], d=unitDefs[type];
  if(!p.alive || p.corium<d.cost || (owner===0&&!isUnlocked(type))) return;
  if(state.units.filter(u=>u.owner===owner&&u.hp>0).length>=UNIT_CAP) return;
  const b=state.bases[owner];
  const spot=neighbors(b.q,b.r).find(c=>!occupied(c.q,c.r));
  if(!spot){ if(owner===0) log('본부 주변에 빈 칸이 없습니다'); return; }
  p.corium-=d.cost;
  const hp=owner===0?enhancedValue(type,'hp'):d.hp; const spawnedUnit={id:state.nextId++,owner,type,q:spot.q,r:spot.r,hp,maxHp:hp,atk:owner===0?enhancedValue(type,'atk'):d.atk,def:owner===0?enhancedValue(type,'def'):d.def,support:owner===0?enhancedValue(type,'support'):d.support,mining:owner===0?enhancedValue(type,'mining'):d.mining,level:owner===0?unitLevel(type):1,order:null,ordered:false,summonedTurn:state.turn}; state.units.push(spawnedUnit); playUnitAnimation(spawnedUnit,'spawn',300);
  if(owner===0) log(`${d.name} 생산 · 다음 턴부터 행동 가능`);
  updateUI(); draw();
}


/* ===== src/ai.js ===== */
function aiOrders(owner){
  const p=state.players[owner]; if(!p.alive) return;
  // production priorities
  let safety=0;
  while(p.corium>=7 && state.units.filter(u=>u.owner===owner&&u.hp>0).length<UNIT_CAP && safety++<4){
    const ownMiners=state.units.filter(u=>u.owner===owner&&unitDefs[u.type].mining).length;
    const pool=Object.keys(unitDefs).filter(k=>ownMiners<3?unitDefs[k].category==='mining':unitDefs[k].category!=='mining');
    const affordable=pool.filter(k=>unitDefs[k].cost<=p.corium);
    const type=affordable[Math.floor(Math.random()*affordable.length)]||pool[0];
    if(p.corium<unitDefs[type].cost) break;
    produce(owner,type);
  }
  const enemyBases=state.bases.filter(b=>b.owner!==owner&&b.hp>0);
  state.units.filter(u=>u.owner===owner&&u.hp>0&&canAct(u)).forEach(u=>{
    const d=unitDefs[u.type];
    let target;
    if(d.mining){
      const mines=[...state.mines].sort((a,b)=>dist(u,a)-dist(u,b));
      target=mines[0];
    }else{
      const seenEnemies=state.units.filter(e=>e.owner!==owner&&e.hp>0&&visibleTo(owner,e.q,e.r));
      if(seenEnemies.length) target=seenEnemies.sort((a,b)=>dist(u,a)-dist(u,b))[0];
      else target=enemyBases.sort((a,b)=>dist(u,a)-dist(u,b))[0];
    }
    if(target){u.order={kind:d.mining?'mine':'move',q:target.q,r:target.r};u.ordered=true;}
  });
}


/* ===== src/animation.js ===== */
function addFloatingText(q,r,text,color,delay=0){
  state.effects.push({
    q,r,text,color,
    start:performance.now()+delay,
    duration:1100
  });
  ensureEffectLoop();
}

let effectLoopRunning=false;
function ensureEffectLoop(){
  if(effectLoopRunning) return;
  effectLoopRunning=true;

  function tick(now){
    state.effects=state.effects.filter(e=>now<e.start+e.duration);

    draw();
    drawFloatingEffects(now);

    if(state.effects.length){
      requestAnimationFrame(tick);
    }else{
      effectLoopRunning=false;
    }
  }

  requestAnimationFrame(tick);
}

function drawFloatingEffects(now){
  if(!state || !state.effects) return;

  state.effects.forEach(e=>{
    if(now<e.start) return;
    if(!visibleTo(0,e.q,e.r)) return;
    const t=(now-e.start)/e.duration;
    if(t<0 || t>1) return;

    const c=hexCenter(e.q,e.r);
    const y=c.y-metrics().size*.48-(t*34);
    const alpha=1-Math.max(0,(t-.55)/.45);

    ctx.save();
    ctx.globalAlpha=alpha;
    ctx.textAlign='center';
    ctx.textBaseline='middle';
    ctx.font=`900 ${Math.max(16,metrics().size*.34)}px Arial`;
    ctx.lineWidth=5;
    ctx.strokeStyle='rgba(0,0,0,.8)';
    ctx.strokeText(e.text,c.x,y);
    ctx.fillStyle=e.color;
    ctx.fillText(e.text,c.x,y);
    ctx.restore();
  });
}

function sleep(ms){return new Promise(res=>setTimeout(res,ms));}
function lerp(a,b,t){return a+(b-a)*t;}
function easeInOut(t){return t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;}
async function animateFrame(duration,update){
  const st=performance.now();
  return new Promise(resolve=>{
    function frame(now){
      const t=Math.min(1,(now-st)/duration); update(easeInOut(t)); draw();
      if(t<1) requestAnimationFrame(frame); else resolve();
    }
    requestAnimationFrame(frame);
  });
}
async function animateMovement(){
  const movers=state.units.filter(u=>u.hp>0&&u.order&&(u.order.kind==='move'||u.order.kind==='mine'||!u.order.kind));
  const paths=new Map();
  movers.forEach(u=>paths.set(u.id,findMovementPath(u,u.order.q,u.order.r,unitDefs[u.type].move).slice(1)));
  const maxSteps=Math.max(0,...[...paths.values()].map(x=>x.length));
  for(let step=0;step<maxSteps;step++){
    const intents=[];
    movers.forEach(u=>{
      const path=paths.get(u.id),to=path&&path[step];
      if(!to||u.hp<=0||u.encountered) return;
      // 현재 위치에서 적과 접촉했으면 이동을 멈추고 인카운터 전투로 전환.
      if(!unitDefs[u.type].mining&&enemyAdjacent(u)){u.encountered=true;return;}
      intents.push({u,to,from:{q:u.q,r:u.r}});
    });
    const counts={};intents.forEach(i=>{const k=i.to.q+','+i.to.r;counts[k]=(counts[k]||0)+1;});
    const valid=intents.filter(i=>{
      if(enemyAt(i.to.q,i.to.r,i.u.owner,i.u.id)){if(!unitDefs[i.u.type].mining)i.u.encountered=true;return false;}
      const mine=mineAt(i.to.q,i.to.r);
      if(mine&&unitDefs[i.u.type].mining){
        const incoming=intents.filter(j=>j.to.q===i.to.q&&j.to.r===i.to.r&&unitDefs[j.u.type].mining);
        const occupiedNow=minersAtMine(mine).filter(u=>u.id!==i.u.id).length;
        const alreadyReserved=reservedMinerCount(mine,i.u.id);
        const available=Math.max(0,mine.slots-occupiedNow-alreadyReserved);
        return incoming.indexOf(i)<available;
      }
      // 같은 칸을 동시에 차지할 수는 없다. 아군은 이미 빠져나가는 경우에만 통과 허용.
      const blocker=unitAt(i.to.q,i.to.r,i.u.id);
      if(blocker){
        const blockerIntent=intents.find(j=>j.u.id===blocker.id);
        if(!blockerIntent) return false;
      }
      return counts[i.to.q+','+i.to.r]===1&&!state.bases.some(b=>b.hp>0&&b.q===i.to.q&&b.r===i.to.r);
    });
    if(!valid.length) continue;
    await animateFrame(330,t=>{
      valid.forEach(i=>{const a=hexCenter(i.from.q,i.from.r),b=hexCenter(i.to.q,i.to.r);state.animPositions[i.u.id]={x:lerp(a.x,b.x,t),y:lerp(a.y,b.y,t),bob:Math.sin(t*Math.PI)*5,progress:t,kind:'walk'};});
    });
    valid.forEach(i=>{
      i.u.q=i.to.q;i.u.r=i.to.r;delete state.animPositions[i.u.id];
      if(i.u.order?.kind==='mine'&&i.u.q===i.u.order.q&&i.u.r===i.u.order.r)i.u.miningAt={q:i.u.q,r:i.u.r};
      else if(!mineAt(i.u.q,i.u.r))i.u.miningAt=null;
      if(!unitDefs[i.u.type].mining&&enemyAdjacent(i.u)){
        i.u.encountered=true;
        addFloatingText(i.u.q,i.u.r,'⚔ ENCOUNTER','#ffbf69',0);
      }
    });
    draw(); await sleep(45);
  }
}
async function animateShot(actor,target,color='#ff8a5b'){
  const a=hexCenter(actor.q,actor.r),b=hexCenter(target.q,target.r);
  const angle=Math.atan2(b.y-a.y,b.x-a.x);
  playUnitAnimation(actor,'attack',360,{angle});
  await animateFrame(260,t=>{state.actionFx=[{kind:'shot',ax:a.x,ay:a.y,bx:lerp(a.x,b.x,t),by:lerp(a.y,b.y,t),color}];});
  state.actionFx=[];
}


/* ===== src/combat.js ===== */
async function executeTurn(){
  if(gamePaused||state.phase!=='command'||state.winner!==null) return;
  for(let i=1;i<4;i++) aiOrders(i);
  state.phase='execute'; updateUI(); draw();
  await animateMovement();
  await combatPhaseAnimated();
  await supportPhaseAnimated();
  miningPhase(); incomePhase();
  await sleep(1000);
  cleanupAndCheck();
  state.units.forEach(u=>{u.order=null;u.ordered=false;});state.actionMode=null;
  state.turn++;state.phase='command';state.actionFx=[];state.animPositions={};state.unitAnimations={};
  updateUI();draw();
}
function attackable(attacker,target){
  const d=attacker.atk!==undefined?attacker:unitDefs[attacker.type];
  return dist(attacker,target)<=d.range;
}
function damage(atk,def){return Math.max(1,Math.round(atk*100/(100+def)));}
function nearestEnemyInRange(actor,range=1){
  const targets=[...state.units.filter(u=>u.owner!==actor.owner&&u.hp>0&&dist(actor,u)<=range),
    ...state.bases.filter(b=>b.owner!==actor.owner&&b.hp>0&&dist(actor,b)<=range)];
  return targets.sort((a,b)=>dist(actor,a)-dist(actor,b)||a.hp-b.hp)[0]||null;
}
function areaTargets(center,owner,radius=1){
  return [...state.units.filter(u=>u.owner!==owner&&u.hp>0&&dist(center,u)<=radius),
    ...state.bases.filter(b=>b.owner!==owner&&b.hp>0&&dist(center,b)<=radius)];
}

async function combatPhaseAnimated(){
  const actors=[];
  state.units.filter(u=>u.hp>0&&canAct(u)&&!unitDefs[u.type].mining&&unitDefs[u.type].atk>0&&(u.order?.kind==='attack'||u.encountered||enemyAdjacent(u)))
    .forEach(u=>actors.push({kind:'unit',obj:u,spd:unitDefs[u.type].spd}));
  state.bases.filter(b=>b.hp>0).forEach(b=>actors.push({kind:'base',obj:b,spd:b.spd}));
  actors.sort((a,b)=>b.spd-a.spd);
  for(const a of actors){
    if(a.obj.hp<=0) continue;
    const owner=a.obj.owner;
    if(a.kind==='base'){
      const t=nearestEnemyInRange(a.obj,a.obj.range);if(!t)continue;
      await animateShot(a.obj,t,'#8edcff');
      const dmg=damage(a.obj.atk,t.type?(t.def??unitDefs[t.type].def):t.def);t.hp-=dmg;registerUnitDamage(t,dmg,a.obj);
      addFloatingText(t.q,t.r,`💥 -${dmg}`,'#ff5a67');
      continue;
    }
    const d=unitDefs[a.obj.type];
    let target=null;
    if(a.obj.order?.kind==='attack'){
      const o=a.obj.order;
      target=o.targetBase?state.bases.find(b=>b.owner===o.targetOwner&&b.hp>0):state.units.find(u=>u.id===o.targetId&&u.hp>0&&u.owner!==owner);
    }
    // 이동 중 적과 마주친 경우 인접 적을 자동 공격한다.
    if(!target) target=nearestEnemyInRange(a.obj,1);
    if(!target||!attackable({...a.obj,...d},target)) continue;
    await animateShot(a.obj,target,d.attackMode==='area'?'#ff7a4f':'#ffb15c');
    const victims=d.attackMode==='area'?areaTargets(target,owner,d.splashRadius||1):[target];
    for(const t of victims){
      let atk=a.obj.atk??d.atk;
      if(terrainAt(a.obj.q,a.obj.r).type==='mountain'&&terrainAt(t.q,t.r).type==='plain') atk+=2;
      const dmg=damage(atk,t.type?(t.def??unitDefs[t.type].def):t.def);
      t.hp-=dmg;registerUnitDamage(t,dmg,a.obj);addFloatingText(t.q,t.r,`${d.attackMode==='area'?'💣':'💥'} -${dmg}`,'#ff5a67',0);
    }
    state.actionFx=[{kind:'impact',x:hexCenter(target.q,target.r).x,y:hexCenter(target.q,target.r).y,start:performance.now(),area:d.attackMode==='area'}];
    draw();await sleep(d.attackMode==='area'?260:180);state.actionFx=[];
    if(owner===0) log(`${d.name} ${d.attackMode==='area'?'광역':'단일'} 공격`);
  }
  state.units.forEach(u=>delete u.encountered);
}
async function supportPhaseAnimated(){
  const supporters=state.units.filter(u=>u.hp>0&&unitDefs[u.type].category==='support'&&u.order&&u.order.kind==='support');
  for(const u of supporters){
    const d=unitDefs[u.type],t=state.units.find(x=>x.id===u.order.targetId&&x.hp>0&&x.owner===u.owner);
    if(!t||dist(u,t)>d.range)continue;
    const heal=Math.min((u.support??d.support??0),t.maxHp-t.hp);if(heal<=0)continue;
    await animateShot(u,t,'#62e89a');t.hp+=heal;addFloatingText(t.q,t.r,`❤️ +${heal}`,'#62e89a',0);log(`${d.name} → ${unitDefs[t.type].name} ${heal} 회복`);await sleep(220);
  }
}
function miningPhase(){
  state.mines.forEach((m,mineIndex)=>{
    const miners=state.units.filter(u=>u.hp>0&&u.q===m.q&&u.r===m.r&&unitDefs[u.type].mining&&u.miningAt&&u.miningAt.q===m.q&&u.miningAt.r===m.r)
      .slice(0,m.slots);

    const gainsByOwner={};
    miners.forEach(u=>{
      const gain=u.mining??unitDefs[u.type].mining;
      state.players[u.owner].corium+=gain;
      gainsByOwner[u.owner]=(gainsByOwner[u.owner]||0)+gain;
      if(u.owner===0) log(`${unitDefs[u.type].name} 채굴 +${gain}`);
    });

    Object.entries(gainsByOwner).forEach(([owner,total],idx)=>{
      addFloatingText(m.q,m.r,`💎 +${total}`,'#ffd166',300+(mineIndex*80)+(idx*100));
    });
  });
}
function incomePhase(){
  state.players.forEach((p,i)=>{
    if(p.alive){
      p.corium+=2;
      const b=state.bases[i];
      if(b && b.hp>0) addFloatingText(b.q,b.r,'💎 +2','#ffd166',650);
      if(i===0) log('본부 수입 +2');
    }
  });
}
function rewardTable(playerCount){
  const tables={
    4:[150,80,45,25],
    3:[170,85,45],
    2:[200,100],
    1:[300]
  };
  return tables[playerCount]||[];
}
function finishMatch(winner,reason){
  if(state.winner!==null) return;
  state.winner=winner;
  const survivors=state.players.map((p,i)=>({i,corium:p.corium,alive:p.alive})).filter(x=>x.alive);
  survivors.sort((a,b)=>{
    if(a.i===winner) return -1;
    if(b.i===winner) return 1;
    return b.corium-a.corium||a.i-b.i;
  });
  const rewards=rewardTable(survivors.length);
  state.rankings=survivors.map((x,idx)=>({...x,rank:idx+1,reward:rewards[idx]||0}));
  const playerResult=state.rankings.find(x=>x.i===0);
  const playerReward=playerResult?.reward||0;
  if(!state.rewardGranted){
    account.credits+=playerReward;
    state.rewardGranted=true;
    saveAccount();
    updateAccountUI();
  }
  log(reason);
  const survivorLines=state.rankings.map(x=>`${x.rank}등 ${playerNames[x.i]} · 코리움 ${x.corium} · 보상 ${x.reward} 크레딧${x.i===0?' (나)':''}`);
  const eliminated=state.players.map((p,i)=>({i,p})).filter(x=>!x.p.alive).map(x=>`탈락 ${playerNames[x.i]} · 보상 0 크레딧${x.i===0?' (나)':''}`);
  setTimeout(()=>alert(`게임 종료\n${reason}\n\n${[...survivorLines,...eliminated].join('\n')}\n\n총 보상 풀: 300 크레딧`),50);
}
function cleanupAndCheck(){
  state.units=state.units.filter(u=>u.hp>0);
  Object.keys(state.unitAnimations||{}).forEach(id=>{if(!state.units.some(u=>String(u.id)===String(id)))delete state.unitAnimations[id];});
  state.bases.forEach((b,i)=>{
    if(b.hp<=0&&state.players[i].alive){
      state.players[i].alive=false;
      state.units=state.units.filter(u=>u.owner!==i);
      log(`${playerNames[i]} 본부 파괴 · 즉시 탈락`);
    }
  });
  if(state.winner!==null) return;
  const alive=state.players.map((p,i)=>p.alive?i:-1).filter(i=>i>=0);
  if(alive.length===1){
    finishMatch(alive[0],`${playerNames[alive[0]]} 최후의 생존자 승리`);
    return;
  }
  const rich=alive.find(i=>state.players[i].corium>=WIN_CORIUM);
  if(rich!==undefined){
    finishMatch(rich,`${playerNames[rich]} 코리움 ${WIN_CORIUM} 선착 달성`);
  }
}


/* ===== src/render.js ===== */
function resize(){
  const rect=canvas.parentElement.getBoundingClientRect();
  const cssWidth=Math.max(320,Math.floor(rect.width||700));
  const cssHeight=Math.max(320,Math.floor(rect.height||700));
  const dpr=Math.min(window.devicePixelRatio||1,2);
  canvas.style.width=cssWidth+'px';
  canvas.style.height=cssHeight+'px';
  canvas.width=Math.floor(cssWidth*dpr);
  canvas.height=Math.floor(cssHeight*dpr);
  canvas.dataset.dpr=String(dpr);
  ctx.setTransform(dpr,0,0,dpr,0,0);
  clampMapCamera();
  updateZoomUi();
  draw();
}
window.addEventListener('resize',resize);

function canvasDpr(){ return Number(canvas.dataset.dpr)||Math.min(window.devicePixelRatio||1,2); }
function baseMapMetrics(){
  const dpr=canvasDpr();
  const w=canvas.width/dpr, h=canvas.height/dpr;
  const pad=Math.max(18,Math.min(34,Math.min(w,h)*0.035));
  const mapWidthUnits=1.5*COLS+0.5;
  const mapHeightUnits=Math.sqrt(3)*(ROWS+0.5);
  const size=Math.max(4,Math.min((w-pad*2)/mapWidthUnits,(h-pad*2)/mapHeightUnits));
  return {w,h,size,mapWidthUnits,mapHeightUnits,mapW:size*mapWidthUnits,mapH:size*mapHeightUnits};
}
function metrics(){
  const b=baseMapMetrics();
  const size=b.size*mapCamera.zoom;
  const mapW=b.mapW*mapCamera.zoom,mapH=b.mapH*mapCamera.zoom;
  const left=(b.w-mapW)/2+mapCamera.panX;
  const top=(b.h-mapH)/2+mapCamera.panY;
  const ox=left+size;
  const oy=top+Math.sqrt(3)*size*0.5;
  return {size,ox,oy,mapW,mapH};
}
function hexCenter(q,r){
  const {size,ox,oy}=metrics();
  return {x:ox+size*1.5*q, y:oy+size*Math.sqrt(3)*(r+0.5*(q%2))};
}
function pathHex(x,y,size){
  ctx.beginPath();
  for(let i=0;i<6;i++){
    const a=Math.PI/180*(60*i);
    const px=x+size*Math.cos(a), py=y+size*Math.sin(a);
    i?ctx.lineTo(px,py):ctx.moveTo(px,py);
  }
  ctx.closePath();
}

function rotatePoint(x,y,cx,cy,a){
  const dx=x-cx, dy=y-cy;
  return {x:cx+dx*Math.cos(a)-dy*Math.sin(a), y:cy+dx*Math.sin(a)+dy*Math.cos(a)};
}


// ===== v0.19.32 PROCEDURAL UNIT MOTION =====
// Current vector art uses virtual animation frames: idle 4, walk 8, attack 6, hit 2, death 6, spawn 4.
function unitMotionFrame(unit,now=performance.now()){
  const active=state?.unitAnimations?.[unit.id];
  if(active&&now<active.start+active.duration){
    const t=Math.max(0,Math.min(.999,(now-active.start)/active.duration));
    const totals={attack:6,hit:2,death:6,spawn:4};
    const total=totals[active.kind]||4;
    return {kind:active.kind,frame:Math.floor(t*total),total,phase:t,angle:active.angle||0};
  }
  if(active&&state?.unitAnimations) delete state.unitAnimations[unit.id];
  const moving=state?.animPositions?.[unit.id];
  if(moving){
    const frame=Math.min(7,Math.floor((moving.progress||0)*8));
    return {kind:'walk',frame,total:8,phase:frame/8};
  }
  const frame=Math.floor((now/240+unit.id*.73)%4);
  return {kind:'idle',frame,total:4,phase:frame/4};
}
function playUnitAnimation(unit,kind,duration,extra={}){
  if(!unit||!state?.unitAnimations)return;
  const current=state.unitAnimations[unit.id];
  if(current?.kind==='death')return;
  state.unitAnimations[unit.id]={kind,start:performance.now(),duration,...extra};
}
function registerUnitDamage(target,damageAmount,source=null){
  if(!target?.type)return;
  const angle=source?Math.atan2(target.r-source.r,target.q-source.q):0;
  if(target.hp<=0){
    target.hp=0;
    target.deathStarted=performance.now();
    playUnitAnimation(target,'death',950,{angle});
  }else{
    playUnitAnimation(target,'hit',110,{angle});
  }
}
function applyUnitMotionTransform(motion,size){
  if(!motion)return;
  if(motion.kind==='walk'){
    const wave=Math.sin(motion.phase*Math.PI*2);
    ctx.translate(wave*size*.025,-Math.abs(Math.sin(motion.phase*Math.PI*2))*size*.025);
    ctx.rotate(wave*.035);
  }else if(motion.kind==='attack'){
    const t=motion.phase;
    const recoil=t<.38?t/.38:(1-t)/.62;
    ctx.rotate((motion.angle||0)*.025);
    ctx.translate(-Math.cos(motion.angle||0)*size*.055*recoil,-Math.sin(motion.angle||0)*size*.055*recoil);
    ctx.scale(1+recoil*.035,1-recoil*.025);
  }else if(motion.kind==='hit'){
    const kick=Math.sin(motion.phase*Math.PI);
    ctx.translate(-Math.cos(motion.angle||0)*size*.07*kick,-Math.sin(motion.angle||0)*size*.07*kick);
    ctx.rotate(Math.sin(motion.phase*Math.PI*4)*.045*(1-motion.phase));
  }else if(motion.kind==='spawn'){
    const t=motion.phase;
    ctx.globalAlpha*=Math.min(1,t*2.4);
    ctx.translate(0,(1-t)*size*.12);
    const scale=.72+.28*Math.min(1,t*1.5);
    ctx.scale(scale,scale);
  }else if(motion.kind==='death'){
    const t=motion.phase;
    const fall=Math.min(1,t/.58);
    ctx.translate(Math.cos(motion.angle||0)*size*.10*fall,size*.16*fall);
    ctx.rotate((Math.PI*.48)*fall*(Math.sin((motion.angle||0)+1)>=0?1:-1));
    ctx.scale(1,1-.30*fall);
    if(t>.48)ctx.globalAlpha*=Math.max(0,1-(t-.48)/.52);
  }else{
    const wave=Math.sin(motion.phase*Math.PI*2);
    ctx.translate(0,wave*size*.012);
    ctx.scale(1+wave*.008,1-wave*.006);
  }
}
let currentUnitMotion=null;
function drawUnitIcon(type,x,y,s,owner,selected){
  const d=unitDefs[type]; if(!d)return;
  const team=playerColors[owner]||playerColors[0];
  const id=d.id||type.toUpperCase().replace('_','-');
  const faction=d.faction;
  const palettes={
    united:{base:'#142a45',mid:'#315d88',light:'#9fd8ff',accent:'#39bfff',trim:'#eef8ff',dark:'#07111d'},
    astra:{base:'#e8e2cf',mid:'#9aa887',light:'#fff9df',accent:'#55e68f',trim:'#d8b85f',dark:'#243126'},
    blackcomet:{base:'#17191d',mid:'#4a3b35',light:'#9c8b78',accent:'#ff553d',trim:'#f08a38',dark:'#070809'}
  };
  const p=palettes[faction]||palettes.united;
  const C={
    'UF-101':['squad',5,'shield','carbine','crest'], 'UF-102':['squad',5,'rifle','sidearm','comms'],
    'UF-103':['squad',4,'shotgun','hammer','charges'], 'UF-104':['squad',4,'carbine','knife','drone'],
    'UF-105':['squad',3,'heavyshield','minigun','exoframe'], 'UF-106':['squad',3,'sniper','rangefinder','ghillie'],
    'UF-107':['crew',4,'mortar','ammo','holo'], 'UF-108':['squad',4,'autoshotgun','powerfist','powerpack'],
    'UF-109':['crew',2,'medgun','meddrone','cross'], 'UF-110':['vehicle',1,'truck','weaponrack','crate'],
    'UF-111':['crew',2,'designator','tablet','threedrones'], 'UF-112':['mech',1,'drill','laser','sixlegs'],
    'UF-201':['squad',3,'energyshield','cannon','fortress'], 'UF-202':['squad',4,'rocket','rifle','missilepod'],
    'UF-203':['crew',2,'railrifle','spotter','cloak'], 'UF-204':['hero',1,'command','pistol','holodrones'],
    'UF-205':['crew',3,'repairarm','welder','repairdrone'], 'UF-206':['mech',1,'megadrill','cargo','sixlegs'],
    'UF-301':['hero',1,'magrifle','wristshield','generalcoat'], 'UF-302':['hero',1,'shockgun','powerblade','overdrive'],
    'AS-101':['squad',4,'crystalshield','spear','mantle'], 'AS-102':['squad',4,'twindaggers','curvedblade','wolfehelm'],
    'AS-103':['squad',5,'moonspear','none','crescent'], 'AS-104':['squad',3,'energybow','arrows','hood'],
    'AS-105':['squad',4,'doublespear','none','crystalcore'], 'AS-106':['squad',4,'daggers','raven','feathercloak'],
    'AS-107':['crew',3,'sunstaff','healcircle','robes'], 'AS-108':['crew',3,'runestaff','scroll','floatingrunes'],
    'AS-109':['beast',3,'shepherd','spiritbeast','sacks'], 'AS-201':['squad',3,'towercrystal','warhammer','wardengrandeur'],
    'AS-202':['squad',3,'lance','buckler','wingmantle'], 'AS-203':['hero',1,'oracleorb','staff','starhalo'],
    'AS-204':['crew',3,'lifestaff','healsphere','vinecloak'], 'AS-205':['construct',1,'eartharms','crystalback','roots'],
    'AS-206':['squad',2,'greatblade','moonshield','eclipse'], 'AS-207':['crew',3,'stormstaff','lightning','antlers'],
    'AS-208':['construct',1,'colossus','beam','floatingrocks'], 'AS-301':['hero',1,'guardianblade','aegisshield','winghalo'],
    'AS-302':['hero',1,'lifescepter','aura','seraphrobes'], 'AS-303':['hero',1,'starblade','orb','sovereignhalo'],
    'BC-101':['squad',5,'scrapshield','axe','graffiti'], 'BC-102':['squad',5,'plasmarifle','none','tanks'],
    'BC-103':['squad',3,'chainsword','cutter','chains'], 'BC-104':['crew',2,'plasmacannon','ammotank','smoke'],
    'BC-105':['squad',4,'hooks','wire','hood'], 'BC-106':['squad',3,'carbine','jetpack','redtrail'],
    'BC-107':['crew',2,'surgeryarm','torch','apron'], 'BC-108':['crew',2,'wrench','welder','twodrones'],
    'BC-109':['crew',4,'magnet','cutter','container'], 'BC-110':['mech',1,'drillclaw','grabber','fourlegs'],
    'BC-201':['squad',2,'plasmaaxe','none','skullhelm'], 'BC-202':['hero',1,'cutlass','revolver','redcoat'],
    'BC-203':['crew',2,'railrifle','pistols','longcoat'], 'BC-204':['crew',2,'forgearms','furnace','flames'],
    'BC-205':['mech',1,'leviathandrill','crane','sixlegs'], 'BC-206':['squad',3,'cutlass','shotpistol','redjet'],
    'BC-207':['hero',1,'towerjunkshield','hydrohammer','cyborg'], 'BC-301':['hero',1,'revolver','cutlass','captaincoat'],
    'BC-302':['monster',1,'plasmaclaw','chainblade','coolingtubes'], 'BC-303':['monster',1,'maw','fourarms','spines']
  }[id]||['hero',1,'rifle','none','none'];
  const [form,count,weapon,offhand,signature]=C;
  ctx.save();ctx.translate(x,y);applyUnitMotionTransform(currentUnitMotion,s);ctx.lineJoin='round';ctx.lineCap='round';
  const outline='#020407';
  function line(points,color=outline,w=.035,close=false,fill=null){ctx.beginPath();points.forEach((q,i)=>i?ctx.lineTo(q[0]*s,q[1]*s):ctx.moveTo(q[0]*s,q[1]*s));if(close)ctx.closePath();if(fill){ctx.fillStyle=fill;ctx.fill()}ctx.strokeStyle=color;ctx.lineWidth=Math.max(1.5,s*w);ctx.stroke()}
  function rect(px,py,w,h,r,fill,stroke=outline,lw=.025){ctx.beginPath();ctx.roundRect(px*s,py*s,w*s,h*s,r*s);ctx.fillStyle=fill;ctx.fill();ctx.strokeStyle=stroke;ctx.lineWidth=Math.max(1.2,s*lw);ctx.stroke()}
  function circ(px,py,r,fill,stroke=outline,lw=.02){ctx.beginPath();ctx.arc(px*s,py*s,r*s,0,Math.PI*2);ctx.fillStyle=fill;ctx.fill();ctx.strokeStyle=stroke;ctx.lineWidth=Math.max(1,s*lw);ctx.stroke()}
  function glow(px,py,r,color=p.accent){ctx.save();ctx.shadowColor=color;ctx.shadowBlur=s*.12;circ(px,py,r,color,color,.008);ctx.restore()}
  function shadow(rad=.42){ctx.save();ctx.scale(1,.38);ctx.beginPath();ctx.ellipse(0,s*.62,s*rad,s*.25,0,0,Math.PI*2);ctx.fillStyle='rgba(0,0,0,.72)';ctx.fill();ctx.restore()}
  function base(){pathHex(0,s*.20,s*.45);let g=ctx.createLinearGradient(0,-s*.2,0,s*.5);g.addColorStop(0,p.mid);g.addColorStop(.55,p.dark);g.addColorStop(1,'#020407');ctx.fillStyle=g;ctx.fill();ctx.strokeStyle=selected?'#8ce8ff':team;ctx.lineWidth=selected?3:1.5;ctx.shadowColor=selected?'#5ce0ff':team;ctx.shadowBlur=selected?17:6;ctx.stroke();ctx.shadowBlur=0}
  function unitBody(sc=1,variant=0){
    ctx.save();ctx.scale(sc,sc);
    const bulky=/shield|hammer|butcher|warden|guardian|tyrant|colossus|leviathan|shock/i.test(weapon+signature);
    const robe=/robe|mantle|cloak|coat|oracle|priest|druid|seraph/i.test(signature+weapon);
    // segmented legs: thigh, knee, shin and boot
    for(const side of [-1,1]){
      const sx=side*.075;
      line([[sx,.08],[side*.105,.19]],p.dark,bulky?.085:.066);
      circ(side*.105,.19,.035,p.light,p.dark,.014);
      line([[side*.105,.21],[side*.13,.31]],p.mid,bulky?.078:.058);
      line([[side*.13,.31],[side*.19,.32]],p.dark,.055);
    }
    if(robe) line([[-.16,.02],[-.23,.29],[.23,.29],[.16,.02]],outline,.025,true,p.base);
    // torso shadow shell and tapered chest plate
    line([[-.14,-.12],[-.18,.09],[-.10,.17],[.10,.17],[.18,.09],[.14,-.12]],outline,.022,true,p.dark);
    const chest=ctx.createLinearGradient(-s*.16,-s*.14,s*.15,s*.16);chest.addColorStop(0,p.light);chest.addColorStop(.18,p.mid);chest.addColorStop(.62,p.base);chest.addColorStop(1,p.dark);
    line([[-.14,-.11],[-.17,.04],[-.09,.14],[.09,.14],[.17,.04],[.14,-.11]],outline,.022,true,chest);
    // layered abdomen plates
    for(let i=0;i<3;i++)rect(-.09+i*.008,.045+i*.038,.18-i*.016,.034,.012,i===0?p.mid:p.base,p.dark,.012);
    // large shoulder pauldrons with highlights
    for(const side of [-1,1]){
      const x=side*.13;
      const sg=ctx.createLinearGradient((x-side*.07)*s,-.17*s,(x+side*.07)*s,-.02*s);sg.addColorStop(0,p.light);sg.addColorStop(.28,p.mid);sg.addColorStop(1,p.dark);
      ctx.save();ctx.translate(x*s,-.105*s);ctx.rotate(side*.10);rect(-.075,-.055,.15,.115,.035,sg,p.dark,.02);ctx.restore();
      line([[side*.16,-.04],[side*.205,.08]],p.dark,.065);circ(side*.205,.08,.032,p.mid,p.dark,.012);line([[side*.205,.10],[side*.19,.18]],p.mid,.052);
    }
    // faction surface treatment
    if(faction==='blackcomet'){line([[-.11,-.07],[.04,.09],[.13,-.03]],p.trim,.018,false);if(variant%2===0)rect(-.18,-.13,.07,.12,.02,'#5a4338');line([[-.13,.12],[.09,-.10]],'#8b5a44',.009)}
    if(faction==='astra'){line([[-.10,-.07],[0,.09],[.10,-.07]],p.trim,.018,false);glow(0,.02,.025)}
    if(faction==='united'){
      rect(-.065,-.075,.13,.115,.018,p.dark,'#6f9abb',.012);glow(0,-.018,.018);
      // digital camouflage fragments
      ctx.save();ctx.globalAlpha=.44;ctx.fillStyle=variant%2?p.light:p.mid;
      const camo=[[-.115,-.055,.035,.025],[-.045,-.105,.028,.022],[.075,-.065,.035,.027],[-.10,.025,.025,.022],[.055,.065,.043,.022]];
      camo.forEach(c=>ctx.fillRect(c[0]*s,c[1]*s,c[2]*s,c[3]*s));ctx.restore();
      // waist pouches and blue shoulder ID
      rect(-.14,.105,.07,.055,.012,'#182536',p.dark,.01);rect(.07,.105,.07,.055,.012,'#182536',p.dark,.01);glow(variant%2?-.16:.16,-.105,.012);
    }
    // detailed helmet shell, jaw guard, optics and antenna
    const helmR=bulky?.14:.118;const hg=ctx.createRadialGradient(-s*.045,-s*.275,s*.012,0,-s*.23,s*.16);hg.addColorStop(0,p.light);hg.addColorStop(.26,p.mid);hg.addColorStop(.8,p.base);hg.addColorStop(1,p.dark);circ(0,-.23,helmR,hg,p.dark,.023);
    line([[-.09,-.215],[-.07,-.145],[0,-.125],[.07,-.145],[.09,-.215]],p.dark,.018,true,p.dark);
    if(faction==='united'){
      const visor=ctx.createLinearGradient(-s*.10,-s*.27,s*.10,-s*.22);visor.addColorStop(0,'#0b4d7a');visor.addColorStop(.45,'#8cecff');visor.addColorStop(1,'#0875ad');rect(-.095,-.263,.19,.052,.016,visor,p.dark,.012);
      rect(-.02,-.305,.04,.038,.01,p.dark,p.mid,.01);line([[.095,-.27],[.145,-.34]],p.dark,.014);glow(.147,-.345,.009);
    }
    if(faction==='astra'){line([[-.08,-.30],[0,-.38],[.08,-.30]],p.trim,.025,false);glow(0,-.25,.018)}
    if(faction==='blackcomet'){rect(-.075,-.255,.15,.045,.012,p.accent,p.dark,.012);if(variant%2)line([[.08,-.29],[.15,-.37]],p.trim,.018)}
    drawWeapon(weapon,1);drawWeapon(offhand,-1);drawSignature(signature);
    ctx.restore();
  }
  function drawWeapon(w,dir){if(!w||w==='none')return;ctx.save();if(dir<0)ctx.scale(-1,1);
    if(/shield/i.test(w)){const big=/heavy|tower|junk|aegis|energy/i.test(w);const sg=ctx.createLinearGradient(-s*.39,-s*.18,-s*.13,s*.27);sg.addColorStop(0,p.light);sg.addColorStop(.18,p.mid);sg.addColorStop(.72,p.base);sg.addColorStop(1,p.dark);line([[-.18,-.08],[-.34,-.18],[-.39,-.10],[-.39,.17],[-.22,.27],[-.13,.12]],p.accent,.026,true,sg);line([[-.29,-.13],[-.33,.15],[-.23,.21]],'rgba(255,255,255,.55)',.009);rect(-.30,-.02,.10,.055,.01,p.dark,p.trim,.009);if(faction==='united'){ctx.save();ctx.globalAlpha=.85;line([[-.28,.025],[-.25,-.015],[-.22,.025],[-.25,.065]],p.trim,.012,true,p.trim);ctx.restore()}if(/crystal|energy|aegis/i.test(w))glow(-.27,.03,.035)}
    else if(/bow/i.test(w)){ctx.strokeStyle=p.trim;ctx.lineWidth=s*.025;ctx.beginPath();ctx.arc(.16*s,-.02*s,.22*s,-1.2,1.2);ctx.stroke();line([[.20,-.20],[.20,.16]],p.accent,.012)}
    else if(/spear|lance/i.test(w)){line([[-.13,.02],[.39,-.17]],p.trim,.035);line([[.39,-.17],[.28,-.19],[.33,-.08]],p.accent,.022,true,p.accent)}
    else if(/blade|sword|cutlass|dagger|axe|hammer|claw|cutter|fist/i.test(w)){line([[-.13,.03],[.29,.08]],p.dark,.07);let tip=/axe|hammer/i.test(w)?[[.20,-.03],[.38,.02],[.34,.15],[.18,.11]]:[[.18,.02],[.42,.06],[.20,.12]];line(tip,p.trim,.018,true,/plasma|star|guardian|crystal/i.test(w)?p.accent:p.light)}
    else if(/staff|scepter|orb|command|designator|tablet|magnet|wrench|welder|repairarm|surgeryarm|forgearms|shepherd/i.test(w)){line([[-.13,.02],[.30,-.08]],p.trim,.04);glow(.32,-.09,.045)}
    else if(/drill/i.test(w)){line([[.10,-.01],[.42,.06],[.17,.18]],p.trim,.025,true,p.trim);for(let i=0;i<3;i++)line([[.18+i*.07,.03],[.22+i*.07,.13]],p.dark,.012)}
    else {const long=/sniper|rail|cannon|mortar|rocket|rifle|gun/i.test(w);const endX=long?.43:.31,endY=long?-.04:.08;line([[-.16,.00],[endX,endY]],outline,long?.10:.082);line([[-.16,.00],[endX,endY]],p.dark,long?.068:.052);line([[-.12,-.015],[endX-.035,endY-.012]],p.mid,long?.038:.030);rect(-.02,-.085,long?.22:.16,.075,.014,p.base,p.light,.010);rect(.045,-.135,long?.10:.075,.045,.010,p.dark,p.mid,.009);line([[endX-.03,endY],[endX+.055,endY-.008]],p.light,.022);line([[.05,.025],[.09,.145]],p.dark,.035);line([[.13,.045],[.16,.15]],p.dark,.028);line([[.00,-.015],[endX-.03,endY-.012]],p.accent,.008);if(/rocket|missile/i.test(w))rect(.02,-.16,.27,.10,.02,p.dark)}
    ctx.restore()}
  function drawSignature(sig){
    if(/drone/i.test(sig)){for(const dx of [-.27,.27]){circ(dx,-.32,.045,p.dark);glow(dx,-.32,.018)}}
    if(/threedrones|holodrones/i.test(sig)){for(let i=0;i<3;i++){const a=i*Math.PI*2/3;glow(Math.cos(a)*.28,-.18+Math.sin(a)*.15,.025)}}
    if(/jet|trail|overdrive/i.test(sig)){for(const dx of [-.08,.08]){rect(dx-.025,.10,.05,.12,.015,p.dark);ctx.fillStyle=p.accent;ctx.beginPath();ctx.moveTo((dx-.03)*s,.22*s);ctx.lineTo(dx*s,.38*s);ctx.lineTo((dx+.03)*s,.22*s);ctx.fill()}}
    if(/halo|eclipse/i.test(sig)){ctx.strokeStyle=sig==='eclipse'?'#6f4fa8':p.trim;ctx.lineWidth=s*.022;ctx.beginPath();ctx.arc(0,-s*.25,s*.22,Math.PI*1.05,Math.PI*1.95);ctx.stroke()}
    if(/cloak|coat|mantle|robes/i.test(sig)){line([[-.14,-.09],[-.28,.25],[.26,.25],[.13,-.08]],p.trim,.018,true,'rgba(40,60,45,.55)')}
    if(/chains|tubes/i.test(sig)){for(let i=0;i<3;i++)line([[-.14+i*.13,-.02],[-.19+i*.13,.24]],p.trim,.012)}
    if(/charges|crate|container|cargo|tanks|ammotank|powerpack|furnace/i.test(sig))rect(-.13,.09,.26,.16,.025,p.dark);
    if(/cross/i.test(sig)){ctx.fillStyle=p.trim;ctx.fillRect(-.025*s,-.08*s,.05*s,.16*s);ctx.fillRect(-.08*s,-.025*s,.16*s,.05*s)}
    if(/antlers|wolfehelm/i.test(sig)){line([[-.06,-.31],[-.14,-.43],[-.18,-.36]],p.trim,.018);line([[.06,-.31],[.14,-.43],[.18,-.36]],p.trim,.018)}
    if(/floatingrunes|floatingrocks|spines/i.test(sig)){for(let i=0;i<4;i++){const a=i*Math.PI/2+.35;circ(Math.cos(a)*.30,-.06+Math.sin(a)*.20,.035,i%2?p.mid:p.accent)}}
  }
  function drawMachine(kind){
    const legs=/sixlegs/.test(signature)?6:/fourlegs/.test(signature)?4:2;
    for(let i=0;i<legs;i++){const t=legs===1?0:i/(legs-1);const lx=-.28+t*.56;line([[lx,-.01],[lx+(lx<0?-.07:.07),.30]],p.dark,.075);line([[lx,-.01],[lx+(lx<0?-.07:.07),.30]],p.mid,.038)}
    rect(-.30,-.16,.60,.30,.07,p.base);rect(-.18,-.27,.36,.17,.05,p.mid);glow(0,-.19,.03);
    drawWeapon(weapon,1);drawWeapon(offhand,-1);drawSignature(signature);
  }
  function drawVehicle(){rect(-.38,.02,.76,.18,.04,p.dark);for(const wx of [-.29,-.10,.10,.29])circ(wx,.20,.075,'#030508',p.mid,.016);rect(-.31,-.16,.62,.25,.05,p.base);rect(-.13,-.27,.28,.14,.03,p.mid);drawSignature(signature);}
  function drawMonster(){
    const isMaw=/maw/.test(weapon);const arms=isMaw?4:2;rect(-.19,-.16,.38,.39,.09,p.base);circ(0,-.27,.15,p.mid);if(isMaw){line([[-.13,-.25],[0,-.14],[.13,-.25]],p.accent,.025);for(let i=0;i<5;i++)line([[-.08+i*.04,-.23],[-.06+i*.04,-.17]],p.light,.012)}
    for(let i=0;i<arms;i++){const side=i%2?-1:1, y=-.10+Math.floor(i/2)*.15;line([[side*.13,y],[side*.34,y+.05]],p.dark,.09);drawWeapon(i?offhand:weapon,side)}drawSignature(signature);
  }
  shadow(form==='vehicle'||form==='mech'||form==='construct'?.48:.40);base();
  if(form==='squad'||form==='crew'){
    const pos=count>=5?[[-.25,.10,.64],[.25,.10,.64],[-.14,-.10,.73],[.14,-.10,.73],[0,-.28,.84]]:count===4?[[-.22,.10,.68],[.22,.10,.68],[-.12,-.14,.78],[.12,-.14,.78]]:count===3?[[-.20,.10,.72],[.20,.10,.72],[0,-.20,.88]]:[[-.15,.06,.80],[.15,-.14,.90]];
    pos.slice(0,count).forEach((q,i)=>{ctx.save();ctx.translate(q[0]*s,q[1]*s);unitBody(q[2],i);ctx.restore()});
  } else if(form==='vehicle') drawVehicle();
  else if(form==='mech'||form==='construct') drawMachine(weapon);
  else if(form==='monster') drawMonster();
  else if(form==='beast'){for(let i=0;i<count;i++){ctx.save();ctx.translate((i-1)*s*.20,(i%2)*s*.08);rect(-.12,-.05,.24,.18,.08,p.base);circ(.12,-.08,.09,p.mid);line([[-.08,.10],[-.12,.25]],p.dark,.055);line([[.08,.10],[.12,.25]],p.dark,.055);ctx.restore()}}
  else unitBody(1.32,0);
  if(d.rarity==='elite'||d.rarity==='hero'){ctx.strokeStyle=d.rarity==='hero'?'#ffd46a':p.accent;ctx.lineWidth=Math.max(2,s*.018);ctx.globalAlpha=.78;ctx.beginPath();ctx.arc(0,-s*.02,s*.43,Math.PI*.10,Math.PI*.90);ctx.stroke();ctx.globalAlpha=1}
  if(selected){ctx.strokeStyle='#8ce8ff';ctx.lineWidth=2;ctx.setLineDash([6,4]);ctx.beginPath();ctx.arc(0,0,s*.48,0,Math.PI*2);ctx.stroke();ctx.setLineDash([])}
  ctx.restore();
}
function drawBaseIcon(base,x,y,s){
  ctx.save();
  ctx.translate(x,y);

  // platform
  ctx.fillStyle='rgba(8,15,28,.95)';
  ctx.strokeStyle=playerColors[base.owner];
  ctx.lineWidth=3;
  ctx.beginPath();
  ctx.moveTo(-s*.34,s*.25);ctx.lineTo(-s*.34,-s*.12);ctx.lineTo(-s*.18,-s*.28);
  ctx.lineTo(s*.18,-s*.28);ctx.lineTo(s*.34,-s*.12);ctx.lineTo(s*.34,s*.25);
  ctx.closePath();ctx.fill();ctx.stroke();

  // central tower
  ctx.fillStyle=playerColors[base.owner];
  ctx.fillRect(-s*.10,-s*.20,s*.20,s*.40);
  ctx.fillRect(-s*.24,s*.04,s*.48,s*.16);

  // antenna
  ctx.strokeStyle='#dff6ff';
  ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(0,-s*.20);ctx.lineTo(0,-s*.38);ctx.stroke();
  ctx.beginPath();ctx.arc(0,-s*.41,s*.04,0,Math.PI*2);ctx.fillStyle='#dff6ff';ctx.fill();

  ctx.restore();
}

function drawMineIcon(mine,x,y,s){
  ctx.save();
  ctx.translate(x,y);

  // mineral platform
  ctx.beginPath();
  ctx.ellipse(0,s*.08,s*.42,s*.22,0,0,Math.PI*2);
  ctx.fillStyle='rgba(24,19,8,.9)';ctx.fill();
  ctx.strokeStyle='#8b6b22';ctx.lineWidth=2;ctx.stroke();

  // crystal cluster
  const crystals=[
    {dx:-.16,dy:.00,w:.16,h:.32},
    {dx:0,dy:-.07,w:.19,h:.43},
    {dx:.18,dy:.02,w:.14,h:.29}
  ];
  crystals.forEach(c=>{
    ctx.beginPath();
    ctx.moveTo(s*(c.dx-c.w/2),s*(c.dy+c.h/2));
    ctx.lineTo(s*(c.dx-c.w*.35),s*(c.dy-c.h*.15));
    ctx.lineTo(s*c.dx,s*(c.dy-c.h/2));
    ctx.lineTo(s*(c.dx+c.w*.35),s*(c.dy-c.h*.15));
    ctx.lineTo(s*(c.dx+c.w/2),s*(c.dy+c.h/2));
    ctx.closePath();
    ctx.fillStyle='#ffd166';ctx.fill();
    ctx.strokeStyle='#fff0a8';ctx.lineWidth=1.5;ctx.stroke();
  });

  // explicit mining slots: small 1, medium 2, large 3
  const miners=minersAtMine(mine).slice(0,mine.slots);
  const slotSize=Math.max(13,s*.24), gap=Math.max(3,s*.045);
  const total=mine.slots*slotSize+(mine.slots-1)*gap;
  const x0=-total/2, sy=s*.31;
  for(let i=0;i<mine.slots;i++){
    const sx=x0+i*(slotSize+gap);
    ctx.beginPath();ctx.roundRect(sx,sy,slotSize,slotSize,3);
    ctx.fillStyle='rgba(9,14,22,.92)';ctx.fill();
    ctx.strokeStyle=miners[i]?playerColors[miners[i].owner]:'#d8c48a';
    ctx.lineWidth=miners[i]?2.5:1.5;ctx.stroke();
    if(miners[i]){
      drawUnitIcon(miners[i].type,sx+slotSize/2,sy+slotSize/2,slotSize*1.45,miners[i].owner,false);
    }
  }
  ctx.restore();
}

function orderIcon(kind){
  return kind==='move'?'➜':kind==='attack'?'⚔':kind==='support'?'♥':kind==='mine'?'⛏':'•';
}
function actionMenuRects(unit){
  const c=hexCenter(unit.q,unit.r), s=metrics().size;
  const bw=Math.max(34,s*.72), bh=Math.max(25,s*.42), gap=5;
  const total=bw*3+gap*2;
  const x0=c.x-total/2, y=c.y-s*.95-bh;
  return [
    {key:'special',x:x0,y,w:bw,h:bh,label:orderIcon(unitDefs[unit.type].mining?'mine':unitDefs[unit.type].category==='support'?'support':'attack')},
    {key:'move',x:x0+bw+gap,y,w:bw,h:bh,label:'➜'},
    {key:'cancel',x:x0+(bw+gap)*2,y,w:bw,h:bh,label:'×'}
  ];
}
function pointInRect(x,y,r){return x>=r.x&&x<=r.x+r.w&&y>=r.y&&y<=r.y+r.h;}
function drawActionMenu(unit){
  if(!unit||unit.owner!==0||state.phase!=='command'||!canAct(unit))return;
  const rects=actionMenuRects(unit);
  rects.forEach(r=>{
    const active=(r.key==='special'&&state.actionMode==='special')||(r.key==='move'&&state.actionMode==='move');
    ctx.save();
    ctx.beginPath();
    const rad=7;
    ctx.roundRect(r.x,r.y,r.w,r.h,rad);
    ctx.fillStyle=r.key==='cancel'?'rgba(118,45,58,.96)':active?'rgba(74,132,189,.98)':'rgba(13,25,42,.96)';
    ctx.fill();
    ctx.strokeStyle=active?'#8edcff':'#46617f';ctx.lineWidth=1.5;ctx.stroke();
    ctx.fillStyle='#fff';ctx.font=`900 ${Math.max(15,r.h*.62)}px Arial`;
    ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(r.label,r.x+r.w/2,r.y+r.h/2+1);
    ctx.restore();
  });
}
function shortestVisualPath(unit,tq,tr){
  return findMovementPath(unit,tq,tr,unitDefs[unit.type].move);
}
function drawOrderPreview(unit){
  if(!unit||!unit.order)return;
  const o=unit.order, start=hexCenter(unit.q,unit.r), end=hexCenter(o.q,o.r), size=metrics().size;
  const isAttack=o.kind==='attack', isSupport=o.kind==='support', isMine=o.kind==='mine';
  const color=isAttack?'#ff6675':isSupport?'#65e9a1':isMine?'#ffd166':'#6fdcff';

  // move-like path for move and mine orders
  if(o.kind==='move'||o.kind==='mine'){
    const pts=shortestVisualPath(unit,o.q,o.r).map(p=>hexCenter(p.q,p.r));
    ctx.save();ctx.strokeStyle=color;ctx.lineWidth=3;ctx.setLineDash([7,7]);ctx.globalAlpha=.9;
    ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.stroke();ctx.setLineDash([]);ctx.restore();
  }else{
    ctx.save();ctx.strokeStyle=color;ctx.lineWidth=3;ctx.setLineDash([8,6]);ctx.beginPath();ctx.moveTo(start.x,start.y);ctx.lineTo(end.x,end.y);ctx.stroke();ctx.setLineDash([]);ctx.restore();
  }

  // arrowhead
  const ang=Math.atan2(end.y-start.y,end.x-start.x), ah=10;
  ctx.save();ctx.fillStyle=color;ctx.translate(end.x,end.y);ctx.rotate(ang);
  ctx.beginPath();ctx.moveTo(-ah*1.4,-ah*.65);ctx.lineTo(0,0);ctx.lineTo(-ah*1.4,ah*.65);ctx.closePath();ctx.fill();ctx.restore();

  // destination ghost
  ctx.save();ctx.globalAlpha=.30;
  if(isMine){
    ctx.font=`900 ${Math.max(18,size*.42)}px Arial`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle=color;ctx.fillText('⛏',end.x,end.y);
  }else{
    drawUnitIcon(unit.type,end.x,end.y,size,unit.owner,false);
  }
  ctx.restore();

  // target/action marker
  ctx.save();ctx.font=`900 ${Math.max(15,size*.30)}px Arial`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle=color;
  ctx.fillText(orderIcon(o.kind),end.x,end.y-size*.48);ctx.restore();
}
function specialLabel(unit){const d=unitDefs[unit.type];return d.mining?'채굴':d.category==='support'?'지원':d.attackMode==='area'?'광역 공격':'단일 공격';}
// 고유 액션을 선택했을 때 표시할 전체 행동 범위.
// 공격/지원은 사거리 내 모든 헥스를 밝히고, 채굴은 이동 가능한 광맥 헥스를 밝힌다.
function specialRangeTile(unit,q,r){
  const d=unitDefs[unit.type];
  if(d.mining){
    const mine=mineAt(q,r);
    return !!mine&&mineHasSpace(mine,unit.id)&&(q===unit.q&&r===unit.r||isReachable(unit,q,r));
  }
  return !(q===unit.q&&r===unit.r)&&dist(unit,{q,r})<=d.range;
}
function validSpecialTile(unit,q,r){
  const d=unitDefs[unit.type];
  if(d.mining){const mine=mineAt(q,r);return !!mine&&mineHasSpace(mine,unit.id)&&(q===unit.q&&r===unit.r||isReachable(unit,q,r));}
  if(d.category==='support') return state.units.some(a=>a.owner===unit.owner&&a.id!==unit.id&&a.hp>0&&a.q===q&&a.r===r&&dist(unit,a)<=d.range);
  return state.units.some(e=>e.owner!==unit.owner&&e.hp>0&&e.q===q&&e.r===r&&dist(unit,e)<=d.range) || state.bases.some(b=>b.owner!==unit.owner&&b.hp>0&&b.q===q&&b.r===r&&dist(unit,b)<=d.range);
}
function setActionMode(mode){
  const u=state.units.find(x=>x.id===state.selected);if(!u||u.ordered||!canAct(u)){if(u&&!canAct(u))log('새로 소환된 유닛은 다음 턴부터 행동할 수 있습니다');updateUI();return;}
  state.actionMode=mode;updateUI();draw();
}
function cancelSelectedOrder(){
  const u=state.units.find(x=>x.id===state.selected);if(!u)return;
  u.order=null;u.ordered=false;state.actionMode=null;log(`${unitDefs[u.type].name} 명령 취소`);updateUI();draw();
}


function drawTerrainTile(q,r,c,size,vis){
  const t=terrainAt(q,r);pathHex(c.x,c.y+size*.09,size*.95);ctx.fillStyle=vis?'#03070b':'#010203';ctx.fill();
  const palettes={plain:['#536943','#24351f','#111b11'],mountain:['#6f7478','#34383c','#191c20'],water:['#1e6684','#0b344b','#041b2a']};
  const p=palettes[t.type];pathHex(c.x,c.y,size*.93);const g=ctx.createLinearGradient(c.x-size*.7,c.y-size*.8,c.x+size*.5,c.y+size*.8);g.addColorStop(0,vis?p[0]:'#080b0f');g.addColorStop(.52,vis?p[1]:'#05070a');g.addColorStop(1,vis?p[2]:'#020304');ctx.fillStyle=g;ctx.fill();
  ctx.strokeStyle=vis?'rgba(116,151,166,.62)':'#101720';ctx.lineWidth=1.4;ctx.stroke();
  pathHex(c.x,c.y-size*.018,size*.84);ctx.strokeStyle=vis?'rgba(190,225,235,.12)':'rgba(255,255,255,.02)';ctx.lineWidth=1;ctx.stroke();
  if(!vis)return;ctx.save();ctx.translate(c.x,c.y);
  // deterministic micro texture
  const seed=(q*31+r*17+t.variant*13)%97;ctx.globalAlpha=.23;for(let i=0;i<10;i++){const a=(seed+i*37)%360*Math.PI/180,rr=size*(.12+((seed+i*19)%45)/100);ctx.fillStyle=i%2?'#020405':'#dce8c6';ctx.beginPath();ctx.arc(Math.cos(a)*rr,Math.sin(a)*rr*.68,1+(i%3),0,Math.PI*2);ctx.fill();}ctx.globalAlpha=1;
  if(t.type==='plain'){
    ctx.strokeStyle='#80955d';ctx.lineWidth=1.2;for(let i=0;i<7;i++){let xx=(-.48+i*.16)*size,yy=((seed+i*11)%30-15)*size/100;ctx.beginPath();ctx.moveTo(xx,yy+size*.09);ctx.lineTo(xx-size*.025,yy);ctx.moveTo(xx,yy+size*.09);ctx.lineTo(xx+size*.03,yy-size*.03);ctx.stroke();}
    ctx.fillStyle='rgba(24,42,20,.8)';ctx.beginPath();ctx.arc(size*.25,size*.05,size*.13,0,Math.PI*2);ctx.fill();ctx.fillStyle='#45563a';for(let i=0;i<7;i++){ctx.beginPath();ctx.arc(size*(.18+(i%3)*.07),size*(-.03+(i%2)*.08),size*.055,0,Math.PI*2);ctx.fill();}
  }else if(t.type==='mountain'){
    const peaks=[[-.34,.22,.42],[.02,.25,.62],[.33,.24,.38]];peaks.forEach(([px,py,h],i)=>{let mg=ctx.createLinearGradient(px*size,(py-h)*size,px*size,py*size);mg.addColorStop(0,'#a7adb0');mg.addColorStop(.35,i===1?'#696e72':'#5c6165');mg.addColorStop(1,'#202428');ctx.fillStyle=mg;ctx.strokeStyle='#15181b';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo((px-.20)*size,py*size);ctx.lineTo(px*size,(py-h)*size);ctx.lineTo((px+.20)*size,py*size);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='rgba(235,242,244,.55)';ctx.beginPath();ctx.moveTo((px-.04)*size,(py-h+.10)*size);ctx.lineTo(px*size,(py-h)*size);ctx.lineTo((px+.07)*size,(py-h+.14)*size);ctx.closePath();ctx.fill();});
  }else{
    ctx.strokeStyle='rgba(83,210,255,.55)';ctx.shadowColor='#2fc8ff';ctx.shadowBlur=5;ctx.lineWidth=1.3;for(let i=0;i<4;i++){let yy=(-.30+i*.18)*size;ctx.beginPath();ctx.moveTo(-size*.48,yy);ctx.bezierCurveTo(-size*.25,yy-size*.08,size*.02,yy+size*.08,size*.46,yy);ctx.stroke();}ctx.shadowBlur=0;
  }
  ctx.restore();
}
function drawActionFx(){
  (state.actionFx||[]).forEach(f=>{ctx.save();if(f.kind==='shot'){
    const grad=ctx.createLinearGradient(f.ax,f.ay,f.bx,f.by);grad.addColorStop(0,'rgba(255,255,255,.2)');grad.addColorStop(.55,f.color);grad.addColorStop(1,'#fff');ctx.strokeStyle=grad;ctx.lineWidth=2.5;ctx.shadowColor=f.color;ctx.shadowBlur=18;ctx.beginPath();ctx.moveTo(f.ax,f.ay);ctx.lineTo(f.bx,f.by);ctx.stroke();
    for(let i=0;i<4;i++){const t=i/4,px=f.ax+(f.bx-f.ax)*t,py=f.ay+(f.by-f.ay)*t;ctx.globalAlpha=.5-i*.08;ctx.fillStyle=f.color;ctx.beginPath();ctx.arc(px,py,3-i*.4,0,Math.PI*2);ctx.fill();}
  }else if(f.kind==='impact'){
    const t=Math.min(1,(performance.now()-f.start)/300),rad=10+t*(f.area?54:30);ctx.globalAlpha=1-t;ctx.strokeStyle='#fff1a6';ctx.lineWidth=5*(1-t)+1;ctx.shadowColor='#ff7a2d';ctx.shadowBlur=25;ctx.beginPath();ctx.arc(f.x,f.y,rad,0,Math.PI*2);ctx.stroke();ctx.fillStyle='rgba(255,101,35,.18)';ctx.beginPath();ctx.arc(f.x,f.y,rad*.72,0,Math.PI*2);ctx.fill();for(let i=0;i<10;i++){const a=i*.628+t*1.5;ctx.beginPath();ctx.moveTo(f.x+Math.cos(a)*rad*.35,f.y+Math.sin(a)*rad*.35);ctx.lineTo(f.x+Math.cos(a)*rad*1.15,f.y+Math.sin(a)*rad*1.15);ctx.stroke();}
  }ctx.restore();});
}
function draw(){
  if(!state)return;
  const w=canvas.width/canvasDpr(),h=canvas.height/canvasDpr();
  ctx.clearRect(0,0,w,h); const bg=ctx.createRadialGradient(w*.48,h*.36,20,w*.48,h*.42,Math.max(w,h)*.75);bg.addColorStop(0,'#102436');bg.addColorStop(.42,'#07111b');bg.addColorStop(1,'#010305');ctx.fillStyle=bg;ctx.fillRect(0,0,w,h); ctx.strokeStyle='rgba(60,130,180,.035)';ctx.lineWidth=1;for(let i=-h;i<w;i+=32){ctx.beginPath();ctx.moveTo(i,0);ctx.lineTo(i+h,h);ctx.stroke();}
  const {size}=metrics();
  for(let q=0;q<COLS;q++)for(let r=0;r<ROWS;r++){
    const c=hexCenter(q,r), vis=visibleTo(0,q,r);
    drawTerrainTile(q,r,c,size,vis);

    if(state.selected){
      const u=state.units.find(x=>x.id===state.selected);

      // 행동 버튼을 먼저 고른 뒤에만 유효 헥스를 표시
      if(u && !u.ordered && state.actionMode==='move' && isReachable(u,q,r)){
        pathHex(c.x,c.y,size*.82);ctx.fillStyle='rgba(75,215,255,.24)';ctx.fill();ctx.strokeStyle='rgba(105,235,255,.95)';ctx.lineWidth=2.5;ctx.stroke();
      }
      if(u && !u.ordered && state.actionMode==='special' && specialRangeTile(u,q,r)){
        pathHex(c.x,c.y,size*.82);
        const d=unitDefs[u.type];
        ctx.fillStyle=d.mining?'rgba(255,209,102,.28)':d.category==='support'?'rgba(82,232,154,.25)':'rgba(255,80,95,.25)';ctx.fill();
        ctx.strokeStyle=d.mining?'#ffd166':d.category==='support'?'#62e89a':'#ff5a67';ctx.lineWidth=2.5;ctx.stroke();
      }

      // 이미 지정된 목적지는 별도 강조
      if(u&&u.order&&u.order.q===q&&u.order.r===r){
        pathHex(c.x,c.y,size*.70);
        ctx.fillStyle='rgba(127, 255, 212, 0.28)';
        ctx.fill();
        ctx.strokeStyle='#7fffd4';
        ctx.lineWidth=4;
        ctx.stroke();
      }
    }
  }
  state.mines.forEach(m=>{
    const c=hexCenter(m.q,m.r); if(!visibleTo(0,m.q,m.r))return;
    drawMineIcon(m,c.x,c.y,size);
  });
  state.bases.forEach(b=>{
    if(b.hp<=0 || (b.owner!==0&&!visibleTo(0,b.q,b.r)))return;
    const c=hexCenter(b.q,b.r);
    drawBaseIcon(b,c.x,c.y,size);
    drawHp(c.x,c.y-size*.56,b.hp,b.maxHp,size*.78);
  });
  state.units.filter(u=>u.owner===0&&u.hp>0&&u.order).forEach(drawOrderPreview);

  state.units.forEach(u=>{
    const dying=u.hp<=0&&state.unitAnimations?.[u.id]?.kind==='death';
    if((u.hp<=0&&!dying) || (u.owner!==0&&!visibleTo(0,u.q,u.r)))return;
    const dockedMine=mineAt(u.q,u.r);
    if(dockedMine&&unitDefs[u.type].mining&&u.miningAt&&!state.animPositions[u.id])return;
    const baseC=hexCenter(u.q,u.r), ap=state.animPositions[u.id];
    const c=ap?{x:ap.x,y:ap.y-(ap.bob||0)}:baseC;
    // Newly summoned units cannot act until the next turn, so render them in grayscale.
    ctx.save();
    if(!canAct(u)&&u.hp>0){
      ctx.filter='grayscale(1) saturate(0)';
      ctx.globalAlpha=1;
    }
    if(state.unitAnimations?.[u.id]?.kind==='hit')ctx.filter='brightness(1.8) saturate(.5)';
    currentUnitMotion=unitMotionFrame(u,performance.now());
    drawUnitIcon(u.type,c.x,c.y,size,u.owner,state.selected===u.id);
    currentUnitMotion=null;
    ctx.restore();
    if(u.hp>0)drawHp(c.x,c.y-size*.47,u.hp,u.maxHp,size*.62);
    if(u.order){
      ctx.save();ctx.fillStyle='#fff';ctx.font=`900 ${Math.max(13,size*.25)}px Arial`;ctx.textAlign='center';ctx.textBaseline='middle';
      ctx.fillText(orderIcon(u.order.kind),c.x,c.y-size*.67);ctx.restore();
    }
  });

  const selectedUnit=state.units.find(x=>x.id===state.selected);
  if(selectedUnit)drawActionMenu(selectedUnit);

  drawActionFx();

  if(state.effects && state.effects.length){
    drawFloatingEffects(performance.now());
  }
}
function drawHp(x,y,hp,max,w){
  const ratio=Math.max(0,hp/max),h=7;ctx.save();ctx.fillStyle='rgba(0,0,0,.85)';ctx.fillRect(x-w/2-2,y-2,w+4,h+4);ctx.strokeStyle='#061018';ctx.lineWidth=1;ctx.strokeRect(x-w/2-2,y-2,w+4,h+4);
  const bg=ctx.createLinearGradient(0,y,0,y+h);bg.addColorStop(0,'#4a1016');bg.addColorStop(1,'#1d0509');ctx.fillStyle=bg;ctx.fillRect(x-w/2,y,w,h);
  const g=ctx.createLinearGradient(0,y,0,y+h);g.addColorStop(0,ratio>.35?'#8aff9c':'#ffb04c');g.addColorStop(.48,ratio>.35?'#31d669':'#ff6d3c');g.addColorStop(.52,ratio>.35?'#148a3d':'#b92c26');g.addColorStop(1,ratio>.35?'#20b04e':'#e03b31');ctx.fillStyle=g;ctx.shadowColor=ratio>.35?'#3cff76':'#ff4e3a';ctx.shadowBlur=5;ctx.fillRect(x-w/2,y,w*ratio,h);ctx.shadowBlur=0;
  for(let i=1;i<5;i++){ctx.fillStyle='rgba(0,0,0,.35)';ctx.fillRect(x-w/2+w*i/5-1,y,1,h);}ctx.restore();
}


/* ===== src/ui.js ===== */
function drawSelectedPortrait(unit){
  const portrait=document.getElementById('unitPortrait');
  if(!portrait||!unit)return;

  // 선택 패널도 생산 카드·코덱스와 동일한 60종 전용 아이콘 렌더러를 사용한다.
  // 기존 구현은 vanguard/assault 같은 구형 타입명을 검사해 UF-101 등의 현재 키와
  // 일치하지 않아 배경과 이름만 표시되는 문제가 있었다.
  drawProductionPortrait(portrait,unit.type);

  const g=portrait.getContext('2d');
  const d=unitDefs[unit.type];
  if(!g||!d)return;

  // 소유 플레이어 색상과 세력 색상을 함께 보여 주는 선택 유닛 전용 프레임.
  g.save();
  g.strokeStyle=playerColors[unit.owner]||d.color||'#4dafff';
  g.lineWidth=4;
  g.strokeRect(4,4,portrait.width-8,portrait.height-8);
  g.strokeStyle=d.color||'#4dafff';
  g.lineWidth=1.5;
  g.strokeRect(9,9,portrait.width-18,portrait.height-18);
  g.restore();
}

function updateSelectedUnitPanel(unit){
  const empty = document.getElementById('unitEmpty');
  const panel = document.getElementById('unitStatsPanel');

  if(!unit){
    empty.style.display='block';
    panel.style.display='none';
    return;
  }

  const d = unitDefs[unit.type];
  empty.style.display='none';
  panel.style.display='flex';

  document.getElementById('unitName').textContent=d.name;
  document.getElementById('unitRole').innerHTML=`<div class="unit-meta-unified" style="--unit-faction-color:${factionColor(d.faction)}"><span class="faction-label">${d.factionName}</span><span class="unit-rarity">LV.${unit.level||1} · ${rarityInfo[d.rarity].name}</span><span class="type-role-label">${categoryName(d.category)} · ${d.unitClass}</span></div>`;
  document.getElementById('unitStatus').innerHTML=!canAct(unit)?'<span class="fresh-unit-note">배치 중 · 다음 턴 행동</span>':unit.ordered?'행동 완료':'명령 대기';

  document.getElementById('unitHpText').textContent=`${Math.max(0,unit.hp)} / ${unit.maxHp}`;
  document.getElementById('unitHpFill').style.width=`${Math.max(0,Math.min(100,unit.hp/unit.maxHp*100))}%`;

  const primaryLabel=document.getElementById('primaryStatLabel');
  const primaryValue=document.getElementById('statAtk');
  const specialRow=document.getElementById('specialStatRow');

  specialRow.style.display='none';

  if(d.mining){
    primaryLabel.textContent='채집력';
    primaryValue.textContent=unit.mining??d.mining;
  }else if(d.category==='support'){
    primaryLabel.textContent='지원력';
    primaryValue.textContent=(unit.support??d.support??'-');
  }else{
    primaryLabel.textContent='공격';
    primaryValue.textContent=(unit.atk??d.atk??'-');
  }

  document.getElementById('statDef').textContent=unit.def??d.def;
  document.getElementById('statSpd').textContent=d.spd||'-';
  document.getElementById('statRange').textContent=d.range;
  document.getElementById('statMove').textContent=d.move;
  document.getElementById('statVision').textContent=d.vision;

  let orderText=state.actionMode?`${state.actionMode==='move'?'이동':specialLabel(unit)} 대상 선택 중`:'명령 없음';
  if(unit.order) orderText=`${unit.order.kind==='move'?'이동':unit.order.kind==='attack'?'공격':unit.order.kind==='support'?'지원':'채굴'} → (${unit.order.q}, ${unit.order.r})`;
  const specialBtn=document.getElementById('specialActionBtn'), moveBtn=document.getElementById('moveActionBtn'), cancelBtn=document.getElementById('cancelOrderBtn');
  if(specialBtn){specialBtn.textContent=specialLabel(unit);specialBtn.disabled=unit.ordered||!canAct(unit);specialBtn.classList.toggle('active',state.actionMode==='special');}
  if(moveBtn){moveBtn.disabled=unit.ordered||!canAct(unit);moveBtn.classList.toggle('active',state.actionMode==='move');}
  if(cancelBtn)cancelBtn.disabled=!unit.order&&!state.actionMode;
  document.getElementById('unitOrderText').textContent=orderText;

  drawSelectedPortrait(unit);
}

function projectedIncome(owner){
  let income=state.players[owner].alive?2:0;
  state.mines.forEach(m=>{
    minersAtMine(m).slice(0,m.slots).forEach(u=>{if(u.owner===owner)income+=(u.mining??unitDefs[u.type].mining)||0;});
  });
  return income;
}
function updateTeamScores(){
  const leader=Math.max(...state.players.map(p=>p.alive?p.corium:-1));
  state.players.forEach((p,i)=>{
    const el=document.getElementById(`teamScore${i}`);if(!el)return;
    const pct=Math.max(0,Math.min(100,p.corium/WIN_CORIUM*100));
    el.style.setProperty('--team',playerColors[i]);
    el.classList.toggle('dead',!p.alive);el.classList.toggle('leading',p.alive&&p.corium===leader);
    const warning=p.alive&&p.corium>=Math.ceil(WIN_CORIUM*0.85)?'⚠ 승리 임박':p.alive&&p.corium===leader?'LEADING':'';
    el.innerHTML=`<div class="team-head"><span class="team-name">${playerNames[i]}</span><span>유닛 ${state.units.filter(u=>u.owner===i&&u.hp>0).length}</span></div><div><span class="team-value">${p.corium}</span><span class="team-income">(+${projectedIncome(i)})</span><span style="font-size:10px;color:#71869b"> / ${WIN_CORIUM}</span></div><div class="team-progress"><i style="width:${pct}%"></i></div>${warning?`<div class="team-warning">${warning}</div>`:''}`;
  });
}

function updateUI(){
  updateTeamScores();
  document.getElementById('turn').textContent=state.turn;
  document.getElementById('phase').textContent=state.phase==='command'?'명령':'실행';
  document.getElementById('corium').textContent=state.players[0].corium;
  document.getElementById('unitCount').textContent=`${state.units.filter(u=>u.owner===0).length} / ${UNIT_CAP}`;
  document.getElementById('endTurn').disabled=gamePaused||state.phase!=='command'||state.winner!==null;
  refreshProductionButtons();
  const u=state.units.find(x=>x.id===state.selected);
  updateSelectedUnitPanel(u);
  document.getElementById('log').innerHTML=state.logs.map(x=>`<div>${x}</div>`).join('');
}
document.getElementById('endTurn').onclick=executeTurn;
document.getElementById('specialActionBtn').onclick=()=>setActionMode('special');
document.getElementById('moveActionBtn').onclick=()=>setActionMode('move');
document.getElementById('cancelOrderBtn').onclick=cancelSelectedOrder;


/* ===== src/input.js ===== */
function tileAt(mx,my){
  let best=null,bd=1e9;
  for(let q=0;q<COLS;q++)for(let r=0;r<ROWS;r++){
    const c=hexCenter(q,r),d=Math.hypot(mx-c.x,my-c.y);
    if(d<bd){bd=d;best={q,r};}
  }
  return bd<metrics().size?best:null;
}
let mapPanState=null;
canvas.addEventListener('wheel',e=>{
  e.preventDefault();
  const rect=canvas.getBoundingClientRect();
  const mx=e.clientX-rect.left,my=e.clientY-rect.top;
  const factor=e.deltaY<0?1.14:1/1.14;
  setMapZoom(mapCamera.zoom*factor,mx,my);
},{passive:false});
canvas.addEventListener('contextmenu',e=>e.preventDefault());
canvas.addEventListener('pointerdown',e=>{
  if(e.button!==2)return;
  mapPanState={id:e.pointerId,x:e.clientX,y:e.clientY,panX:mapCamera.panX,panY:mapCamera.panY};
  canvas.setPointerCapture(e.pointerId);
  canvas.parentElement.classList.add('panning');
  e.preventDefault();
});
canvas.addEventListener('pointermove',e=>{
  if(!mapPanState||e.pointerId!==mapPanState.id)return;
  mapCamera.panX=mapPanState.panX+(e.clientX-mapPanState.x);
  mapCamera.panY=mapPanState.panY+(e.clientY-mapPanState.y);
  clampMapCamera();draw();
});
function endMapPan(e){
  if(!mapPanState||e.pointerId!==mapPanState.id)return;
  mapPanState=null;canvas.parentElement.classList.remove('panning');
}
canvas.addEventListener('pointerup',endMapPan);
canvas.addEventListener('pointercancel',endMapPan);
document.getElementById('zoomInBtn').onclick=()=>setMapZoom(mapCamera.zoom+0.2);
document.getElementById('zoomOutBtn').onclick=()=>setMapZoom(mapCamera.zoom-0.2);
document.getElementById('zoomResetBtn').onclick=resetMapCamera;
updateZoomUi();

canvas.addEventListener('click',e=>{
  if(gamePaused||state.phase!=='command'||state.winner!==null)return;
  const rect=canvas.getBoundingClientRect();
  const mx=e.clientX-rect.left,my=e.clientY-rect.top;
  const selectedUnit=state.units.find(x=>x.id===state.selected);
  if(selectedUnit){
    const hit=actionMenuRects(selectedUnit).find(r=>pointInRect(mx,my,r));
    if(hit){
      if(hit.key==='special')setActionMode('special');
      else if(hit.key==='move')setActionMode('move');
      else cancelSelectedOrder();
      return;
    }
  }
  const t=tileAt(mx,my); if(!t)return;

  // 명령 모드에서는 광맥 위에 아군 채굴 유닛이 있어도 먼저 명령 대상을 판정한다.
  // 그래야 같은 광맥의 빈 슬롯으로 추가 진입하거나, 함께 있는 적 채굴 유닛을 공격할 수 있다.
  if(state.selected && state.actionMode){
    const u=state.units.find(x=>x.id===state.selected);
    if(!u||u.ordered||!canAct(u)){if(u&&!canAct(u))log('새로 소환된 유닛은 다음 턴부터 행동할 수 있습니다');updateUI();return;}

    let issued=false;
    if(state.actionMode==='move'){
      if(isReachable(u,t.q,t.r)){
        u.order={kind:'move',q:t.q,r:t.r};u.miningAt=null;u.ordered=true;issued=true;
        log(`${unitDefs[u.type].name} 이동 지정`);
      }else log('이동 가능한 헥스를 선택하세요');
    }else if(validSpecialTile(u,t.q,t.r)){
      const d=unitDefs[u.type];
      if(d.mining){
        const mine=mineAt(t.q,t.r);
        if(!mine||!mineHasSpace(mine,u.id)){log('광맥 채굴 슬롯이 가득 찼습니다');return;}
        u.order={kind:'mine',q:t.q,r:t.r};u.ordered=true;issued=true;
        log(`${d.name} 채굴 명령`);
      }else if(d.category==='support'){
        const target=state.units.find(a=>a.owner===u.owner&&a.id!==u.id&&a.q===t.q&&a.r===t.r&&a.hp>0);
        if(target){u.order={kind:'support',targetId:target.id,q:t.q,r:t.r};u.ordered=true;issued=true;log(`${d.name} 지원 명령`);}
      }else{
        // 한 광맥에 여러 채굴 유닛이 겹쳐 있어도 적 유닛만 골라 공격한다.
        const target=state.units
          .filter(a=>a.owner!==u.owner&&a.q===t.q&&a.r===t.r&&a.hp>0)
          .sort((a,b)=>a.hp-b.hp)[0] ||
          state.bases.find(b=>b.owner!==u.owner&&b.q===t.q&&b.r===t.r&&b.hp>0);
        if(target){
          u.order={kind:'attack',targetId:target.id||null,targetOwner:target.owner,targetBase:!target.type,q:t.q,r:t.r};
          u.ordered=true;issued=true;log(`${d.name} 공격 명령`);
        }
      }
    }else log(`${specialLabel(u)} 가능한 대상을 선택하세요`);

    if(issued){state.actionMode=null;updateUI();draw();return;}
    updateUI();draw();return;
  }

  const ownBase=state.bases.find(b=>b.owner===0&&b.hp>0&&b.q===t.q&&b.r===t.r);
  if(ownBase){state.selected=null;state.actionMode=null;updateUI();draw();openProductionModal();return;}
  const own=state.units.find(u=>u.owner===0&&u.q===t.q&&u.r===t.r);
  if(own){state.selected=own.id;state.actionMode=null;updateUI();draw();return;}
});



let featuredUnitIndex=0;
let featuredUnitTimer=null;
const featuredUnitKeys=Object.keys(unitDefs);
const categoryLabel={combat:'Combat',support:'Support',mining:'Mining'};
const rarityLabel={common:'커먼',elite:'엘리트',hero:'히어로'};
function compactTrait(u){
  const raw=(u.passive&&u.passive!=='없음'?u.passive:u.desc||'').replace(/\s+/g,' ').trim();
  return raw.split(/(?<=[.!?])\s|\n/)[0].slice(0,66)||`${u.factionName} ${u.role} 유닛`;
}
function showFeaturedUnit(key,instant=false){
  const u=unitDefs[key],body=document.getElementById('featuredUnitBody');
  if(!u||!body)return;
  const apply=()=>{
    const card=document.getElementById('featuredUnitCard');
    card?.style.setProperty('--featured-color',u.color||'#2d9dff');
    document.getElementById('featuredFaction').textContent=u.factionName.toUpperCase();
    document.getElementById('featuredUnitName').textContent=u.name;
    document.getElementById('featuredUnitMeta').textContent=`${categoryLabel[u.category]||u.category} · ${u.unitClass}`;
    document.getElementById('featuredUnitTrait').textContent=compactTrait(u);
    const featured=document.getElementById('featuredUnitCanvas');
    if(featured){const old=ctx;ctx=featured.getContext('2d');ctx.clearRect(0,0,featured.width,featured.height);drawUnitIcon(key,featured.width/2,featured.height*.52,featured.width*.76,0,false);ctx=old;}
    body.classList.remove('is-changing');
  };
  if(instant)apply();
  else{body.classList.add('is-changing');setTimeout(apply,220);}
}
function startFeaturedRotation(){
  clearInterval(featuredUnitTimer);
  showFeaturedUnit(featuredUnitKeys[featuredUnitIndex],true);
  featuredUnitTimer=setInterval(()=>{
    featuredUnitIndex=(featuredUnitIndex+1)%featuredUnitKeys.length;
    showFeaturedUnit(featuredUnitKeys[featuredUnitIndex]);
  },3000);
}
function drawMenuButtonIcons(){
  const drawShield=(c,x,y,s)=>{c.beginPath();c.moveTo(x,y-s*.48);c.lineTo(x+s*.38,y-s*.31);c.lineTo(x+s*.31,y+s*.25);c.quadraticCurveTo(x,y+s*.52,x-s*.31,y+s*.25);c.lineTo(x-s*.38,y-s*.31);c.closePath();c.stroke();};
  document.querySelectorAll('.menu-icon-canvas').forEach(canvas=>{
    const c=canvas.getContext('2d'),w=canvas.width,h=canvas.height,k=canvas.dataset.menuIcon;
    c.clearRect(0,0,w,h);c.save();c.translate(.5,.5);c.lineWidth=4;c.lineJoin='round';c.lineCap='round';
    const glow=c.createRadialGradient(w*.5,h*.46,2,w*.5,h*.5,w*.46);glow.addColorStop(0,'rgba(93,196,255,.28)');glow.addColorStop(1,'rgba(10,41,66,0)');c.fillStyle=glow;c.fillRect(0,0,w,h);
    c.strokeStyle='#bfe9ff';c.fillStyle='rgba(119,205,255,.16)';c.shadowColor='#38b7ff';c.shadowBlur=12;
    if(k==='match'){
      drawShield(c,w*.5,h*.5,w*.78);c.fill();c.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,r=i%2?w*.11:w*.24;const x=w*.5+Math.cos(a)*r,y=h*.49+Math.sin(a)*r;i?c.lineTo(x,y):c.moveTo(x,y)}c.closePath();c.fillStyle='#dff6ff';c.fill();
    }else if(k==='codex'){
      c.strokeRect(w*.25,h*.2,w*.5,h*.62);c.beginPath();c.moveTo(w*.34,h*.2);c.lineTo(w*.34,h*.82);c.moveTo(w*.43,h*.34);c.lineTo(w*.66,h*.34);c.moveTo(w*.43,h*.46);c.lineTo(w*.66,h*.46);c.moveTo(w*.43,h*.58);c.lineTo(w*.62,h*.58);c.stroke();
    }else if(k==='store'){
      c.beginPath();c.moveTo(w*.21,h*.31);c.lineTo(w*.78,h*.31);c.lineTo(w*.68,h*.62);c.lineTo(w*.31,h*.62);c.closePath();c.stroke();c.beginPath();c.moveTo(w*.28,h*.31);c.lineTo(w*.22,h*.18);c.lineTo(w*.15,h*.18);c.stroke();[.36,.64].forEach(px=>{c.beginPath();c.arc(w*px,h*.73,w*.065,0,Math.PI*2);c.fillStyle='#dff6ff';c.fill()});
    }else if(k==='guide'){
      c.beginPath();c.moveTo(w*.18,h*.24);c.quadraticCurveTo(w*.35,h*.18,w*.49,h*.31);c.lineTo(w*.49,h*.76);c.quadraticCurveTo(w*.34,h*.63,w*.18,h*.7);c.closePath();c.moveTo(w*.82,h*.24);c.quadraticCurveTo(w*.65,h*.18,w*.51,h*.31);c.lineTo(w*.51,h*.76);c.quadraticCurveTo(w*.66,h*.63,w*.82,h*.7);c.closePath();c.fill();c.stroke();
    }else{
      c.beginPath();for(let i=0;i<16;i++){const a=-Math.PI/2+i*Math.PI/8,r=i%2?w*.32:w*.24,x=w*.5+Math.cos(a)*r,y=h*.5+Math.sin(a)*r;i?c.lineTo(x,y):c.moveTo(x,y)}c.closePath();c.fill();c.stroke();c.beginPath();c.arc(w*.5,h*.5,w*.12,0,Math.PI*2);c.fillStyle='#071522';c.fill();c.stroke();
    }
    c.restore();
  });
}
function drawMenuArt(){
  drawMenuButtonIcons();
  const hero=document.getElementById('menuHeroCanvas');
  if(hero){const old=ctx;ctx=hero.getContext('2d');ctx.clearRect(0,0,hero.width,hero.height);let g=ctx.createRadialGradient(380,350,30,380,430,330);g.addColorStop(0,'rgba(35,116,204,.28)');g.addColorStop(1,'rgba(2,7,13,0)');ctx.fillStyle=g;ctx.fillRect(0,0,760,760);drawUnitIcon('uf_101',380,380,520,0,false);ctx=old;}
  startFeaturedRotation();
}
/* ===== src/main.js ===== */
const closeProductionButton=document.getElementById('closeProduction');
if(closeProductionButton) closeProductionButton.onclick=closeProductionModal;
const confirmSummonButton=document.getElementById('confirmSummon');
if(confirmSummonButton) confirmSummonButton.onclick=confirmSelectedSummon;

const productionBackdrop=document.getElementById('productionBackdrop');
if(productionBackdrop) productionBackdrop.onclick=closeProductionModal;
const closeGachaResultBtn=document.getElementById('closeGachaResult');if(closeGachaResultBtn)closeGachaResultBtn.onclick=closeGachaResult;
const confirmGachaResultBtn=document.getElementById('confirmGachaResult');if(confirmGachaResultBtn)confirmGachaResultBtn.onclick=closeGachaResult;
const gachaResultBackdrop=document.getElementById('gachaResultBackdrop');if(gachaResultBackdrop)gachaResultBackdrop.onclick=closeGachaResult;
document.querySelectorAll('.prod-tab').forEach(tab=>{
  tab.onclick=()=>buildProduction(tab.dataset.category);
});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(document.getElementById('factionSelectModal').classList.contains('open'))closeFactionSelect();else if(document.getElementById('unitDetailModal').classList.contains('open'))closeUnitDetail();else if(document.getElementById('gachaResultModal').classList.contains('open'))closeGachaResult();else if(document.getElementById('pauseMenu').classList.contains('open'))setPaused(false);else if(document.getElementById('optionsModal').classList.contains('open'))closeMeta('optionsModal');else if(document.getElementById('shopModal').classList.contains('open'))closeMeta('shopModal');else if(document.getElementById('collectionModal').classList.contains('open'))closeMeta('collectionModal');else if(document.getElementById('productionModal').classList.contains('open'))closeProductionModal();else if(!document.getElementById('mainMenu').classList.contains('hidden'))return;else setPaused(true);} if(e.key.toLowerCase()==='x'&&!gamePaused)cancelSelectedOrder();});


function setPaused(paused){
  gamePaused=paused;
  document.body.classList.toggle('game-paused',paused);
  document.getElementById('pauseMenu')?.classList.toggle('open',paused);
  updateUI();
}
function showMainMenu(){
  setPaused(false);
  closeProductionModal();
  metaOpenedFromMainMenu=false;closeMeta('collectionModal',false);closeMeta('shopModal',false);closeMeta('optionsModal',false);
  document.getElementById('gameShell').classList.add('menu-locked');
  document.getElementById('mainMenu').classList.remove('hidden');
  updateAccountUI();
}
const ingameMenuBtn=document.getElementById('ingameMenuBtn');if(ingameMenuBtn)ingameMenuBtn.onclick=()=>setPaused(true);
const resumeGameBtn=document.getElementById('resumeGameBtn');if(resumeGameBtn)resumeGameBtn.onclick=()=>setPaused(false);
const returnMainMenuBtn=document.getElementById('returnMainMenuBtn');if(returnMainMenuBtn)returnMainMenuBtn.onclick=showMainMenu;
const restartGameBtn=document.getElementById('restartGameBtn');if(restartGameBtn)restartGameBtn.onclick=()=>{resetGame();setPaused(false);};
const collectionSortBtn=document.getElementById('collectionSortBtn');if(collectionSortBtn)collectionSortBtn.onclick=()=>{collectionSortAscending=!collectionSortAscending;renderCollection();};


const factionDisplayNames={united:'연합군',astra:'아스트라',blackcomet:'블랙 코멧'};
function drawFactionSelectionArt(){
  document.querySelectorAll('[data-faction-art]').forEach(c=>drawProductionPortrait(c,c.dataset.factionArt));
}
function openFactionSelect(){
  selectedPlayerFaction=null;
  document.querySelectorAll('.faction-choice').forEach(c=>c.classList.remove('selected'));
  const confirm=document.getElementById('confirmFactionSelect');if(confirm)confirm.disabled=true;
  const summary=document.getElementById('factionSelectSummary');if(summary)summary.textContent='전투에 투입할 세력을 선택하세요.';
  document.getElementById('factionSelectModal')?.classList.add('open');
  
let unitMotionLoopStarted=false;
function startUnitMotionLoop(){
  if(unitMotionLoopStarted)return;
  unitMotionLoopStarted=true;
  const tick=()=>{
    if(state&&!gamePaused&&document.getElementById('mainMenu')?.classList.contains('hidden')) draw();
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
startUnitMotionLoop();
requestAnimationFrame(drawFactionSelectionArt);
}
function closeFactionSelect(){document.getElementById('factionSelectModal')?.classList.remove('open');selectedPlayerFaction=null;}
function chooseFaction(faction){
  selectedPlayerFaction=faction;
  document.querySelectorAll('.faction-choice').forEach(c=>c.classList.toggle('selected',c.dataset.faction===faction));
  const confirm=document.getElementById('confirmFactionSelect');if(confirm)confirm.disabled=false;
  const summary=document.getElementById('factionSelectSummary');if(summary)summary.innerHTML=`선택 세력 <b>${factionDisplayNames[faction]}</b> · 해당 세력의 보유 유닛만 생산 가능`;
}
function enterGameWithFaction(){
  if(!selectedPlayerFaction)return;
  document.getElementById('factionSelectModal')?.classList.remove('open');
  metaOpenedFromMainMenu=false;closeMeta('collectionModal',false);closeMeta('shopModal',false);closeMeta('guideModal',false);closeMeta('optionsModal',false);setPaused(false);
  resetGame();
  document.getElementById('mainMenu').classList.add('hidden');
  document.getElementById('gameShell').classList.remove('menu-locked');
  requestAnimationFrame(()=>{resize();draw();});
}
document.querySelectorAll('.faction-choice').forEach(c=>c.onclick=()=>chooseFaction(c.dataset.faction));
document.getElementById('closeFactionSelect').onclick=closeFactionSelect;
document.getElementById('confirmFactionSelect').onclick=enterGameWithFaction;

const collectionBtn=document.getElementById('collectionBtn');if(collectionBtn)collectionBtn.onclick=()=>openMeta('collectionModal');
document.querySelectorAll('.collection-filter').forEach(btn=>btn.onclick=()=>{collectionFactionFilter=btn.dataset.faction;renderCollection();});
document.querySelectorAll('.collection-category-filter').forEach(btn=>btn.onclick=()=>{collectionCategoryFilter=btn.dataset.category;renderCollection();});
document.getElementById('unitDetailClose').onclick=closeUnitDetail;document.getElementById('unitDetailBackdrop').onclick=closeUnitDetail;
const shopBtn=document.getElementById('shopBtn');if(shopBtn)shopBtn.onclick=()=>openMeta('shopModal');
const guideBtn=document.getElementById('guideBtn');if(guideBtn)guideBtn.onclick=()=>openMeta('guideModal');
const optionsBtn=document.getElementById('optionsBtn');if(optionsBtn)optionsBtn.onclick=()=>openMeta('optionsModal');
const resetAccountBtn=document.getElementById('resetAccountBtn');if(resetAccountBtn)resetAccountBtn.onclick=resetAllSavedData;
document.querySelectorAll('[data-close]').forEach(el=>el.onclick=()=>closeMeta(el.dataset.close));
document.querySelectorAll('[data-back-main]').forEach(el=>el.onclick=()=>backToMainMenuFromMeta(el.dataset.backMain));
document.querySelectorAll('.supply-product').forEach(btn=>btn.onclick=()=>{selectedSupplyBanner=btn.dataset.banner;renderSupplyBanner();});
document.getElementById('drawOneBtn').onclick=()=>performGacha(1);
document.getElementById('drawTenBtn').onclick=()=>performGacha(10);
renderSupplyBanner();updateAccountUI();renderCollection();drawMenuArt();

const startGameBtn=document.getElementById('startGameBtn');
if(startGameBtn) startGameBtn.onclick=openFactionSelect;
resetGame();



/* ===== v0.19.15 VISIBLE COPY NORMALIZER ===== */
(function(){
  const skipTags=new Set(['SCRIPT','STYLE','TEXTAREA','CODE','PRE','CANVAS','INPUT']);
  function normalizeSentenceText(value){
    if(!value||!value.includes('.')) return value;
    return value
      .replace(/([A-Za-z가-힣])\.(?=\s|$)/g,'$1\n')
      .replace(/[ \t]+\n/g,'\n')
      .replace(/\n[ \t]+/g,'\n');
  }
  function normalizeTextNode(node){
    const parent=node.parentElement;
    if(!parent||skipTags.has(parent.tagName)) return;
    const before=node.nodeValue;
    const after=normalizeSentenceText(before);
    if(after!==before){
      node.nodeValue=after;
      parent.classList.add('ui-prose-linebreak');
    }
  }
  function normalizeTree(root){
    if(!root) return;
    if(root.nodeType===Node.TEXT_NODE){normalizeTextNode(root);return;}
    if(root.nodeType!==Node.ELEMENT_NODE&&root.nodeType!==Node.DOCUMENT_FRAGMENT_NODE) return;
    if(root.nodeType===Node.ELEMENT_NODE&&skipTags.has(root.tagName)) return;
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
    const nodes=[];
    while(walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(normalizeTextNode);
  }
  const nativeAlert=window.alert.bind(window);
  const nativeConfirm=window.confirm.bind(window);
  window.alert=message=>nativeAlert(normalizeSentenceText(String(message)));
  window.confirm=message=>nativeConfirm(normalizeSentenceText(String(message)));
  const observer=new MutationObserver(records=>{
    records.forEach(record=>{
      record.addedNodes.forEach(normalizeTree);
      if(record.type==='characterData') normalizeTextNode(record.target);
    });
  });
  const start=()=>{
    normalizeTree(document.body);
    observer.observe(document.body,{subtree:true,childList:true,characterData:true});
  };
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();

document.getElementById('adminModeBtn')?.addEventListener('click',toggleAdminMode);
updateAdminModeUI();

/* ===== v0.19.48 TOUCH CAMERA CONTROLS ===== */
(() => {
  const touchPoints = new Map();
  let gesture = null;
  let suppressCanvasClick = false;
  const DRAG_THRESHOLD = 7;

  const localPoint = e => {
    const rect = canvas.getBoundingClientRect();
    return { x:e.clientX-rect.left, y:e.clientY-rect.top };
  };
  const distance = (a,b) => Math.hypot(a.x-b.x,a.y-b.y);
  const midpoint = (a,b) => ({x:(a.x+b.x)/2,y:(a.y+b.y)/2});

  canvas.addEventListener('pointerdown', e => {
    if(e.pointerType !== 'touch') return;
    const p = localPoint(e);
    touchPoints.set(e.pointerId,p);
    canvas.setPointerCapture?.(e.pointerId);

    if(touchPoints.size === 1){
      gesture = {type:'pending',id:e.pointerId,start:p,last:p,panX:mapCamera.panX,panY:mapCamera.panY,moved:false};
    } else if(touchPoints.size === 2){
      const [a,b] = [...touchPoints.values()];
      gesture = {
        type:'pinch',
        startDistance:Math.max(1,distance(a,b)),
        startZoom:mapCamera.zoom,
        startMid:midpoint(a,b),
        startPanX:mapCamera.panX,
        startPanY:mapCamera.panY,
        moved:true
      };
      suppressCanvasClick = true;
      canvas.parentElement.classList.add('panning');
    }
    e.preventDefault();
  },{passive:false});

  canvas.addEventListener('pointermove', e => {
    if(e.pointerType !== 'touch' || !touchPoints.has(e.pointerId)) return;
    const p = localPoint(e);
    touchPoints.set(e.pointerId,p);

    if(touchPoints.size >= 2){
      const [a,b] = [...touchPoints.values()];
      if(!gesture || gesture.type !== 'pinch'){
        gesture={type:'pinch',startDistance:Math.max(1,distance(a,b)),startZoom:mapCamera.zoom,startMid:midpoint(a,b),startPanX:mapCamera.panX,startPanY:mapCamera.panY,moved:true};
      }
      const mid=midpoint(a,b);
      const scale=distance(a,b)/gesture.startDistance;
      mapCamera.zoom=Math.max(mapCamera.minZoom,Math.min(mapCamera.maxZoom,gesture.startZoom*scale));
      mapCamera.panX=gesture.startPanX+(mid.x-gesture.startMid.x);
      mapCamera.panY=gesture.startPanY+(mid.y-gesture.startMid.y);
      clampMapCamera();updateZoomUi();draw();
      suppressCanvasClick=true;
      canvas.parentElement.classList.add('panning');
      e.preventDefault();
      return;
    }

    if(gesture && (gesture.type==='pending'||gesture.type==='pan') && gesture.id===e.pointerId){
      const dx=p.x-gesture.start.x,dy=p.y-gesture.start.y;
      if(gesture.type==='pending' && Math.hypot(dx,dy)>DRAG_THRESHOLD){
        gesture.type='pan';gesture.moved=true;suppressCanvasClick=true;
        canvas.parentElement.classList.add('panning');
      }
      if(gesture.type==='pan'){
        mapCamera.panX=gesture.panX+dx;
        mapCamera.panY=gesture.panY+dy;
        clampMapCamera();draw();
        e.preventDefault();
      }
    }
  },{passive:false});

  const endTouch = e => {
    if(e.pointerType!=='touch') return;
    touchPoints.delete(e.pointerId);
    if(touchPoints.size===1){
      const [id,p]=[...touchPoints.entries()][0];
      gesture={type:'pending',id,start:p,last:p,panX:mapCamera.panX,panY:mapCamera.panY,moved:false};
    }else if(touchPoints.size===0){
      gesture=null;
      canvas.parentElement.classList.remove('panning');
      if(suppressCanvasClick){
        setTimeout(()=>{suppressCanvasClick=false;},90);
      }
    }
  };
  canvas.addEventListener('pointerup',endTouch,{passive:true});
  canvas.addEventListener('pointercancel',endTouch,{passive:true});

  /* Prevent the synthetic click after a drag/pinch, while preserving tap selection. */
  canvas.addEventListener('click',e=>{
    if(!suppressCanvasClick)return;
    e.preventDefault();e.stopImmediatePropagation();
  },true);

  const hint=document.querySelector('.map-pan-hint');
  if(hint)hint.textContent='한 손가락 드래그: 이동 · 두 손가락: 확대/축소';
})();


/* ===== v0.19.50 LANDSCAPE MOBILE HELPERS ===== */
(() => {
  const isLandscapeMobile=()=>matchMedia('(pointer:coarse) and (orientation:landscape) and (max-height:620px)').matches;
  const syncLandscape=()=>{
    document.documentElement.classList.toggle('mobile-landscape',isLandscapeMobile());
    if(isLandscapeMobile()){
      document.body.scrollTop=0;document.documentElement.scrollTop=0;
      requestAnimationFrame(()=>{ resize(); clampMapCamera(); draw(); });
    }
  };
  addEventListener('orientationchange',()=>setTimeout(syncLandscape,180));
  addEventListener('resize',()=>requestAnimationFrame(syncLandscape));
  syncLandscape();
  document.getElementById('startGameBtn')?.addEventListener('click',async()=>{
    try{ if(screen.orientation?.lock && document.fullscreenElement) await screen.orientation.lock('landscape'); }catch(e){}
  });
})();
