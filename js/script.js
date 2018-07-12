document.addEventListener("DOMContentLoaded", clock);

function clock() {

	const canvas = document.getElementById("clock");
	const ctx = canvas.getContext("2d");

	// Список всех вариантов фигур.
	const figList = {
		T:  [
				[ [1,0],[0,1],[1,1],[2,1] ],
				[ [0,0],[0,1],[1,1],[0,2] ],
				[ [0,0],[1,0],[2,0],[1,1] ],
				[ [1,0],[0,1],[1,1],[1,2] ]
			],
		S:  [
				[ [1,0],[2,0],[0,1],[1,1] ],
				[ [0,0],[0,1],[1,1],[1,2] ]
			],
		J:  [
				[ [0,0],[0,1],[1,1],[2,1] ],
				[ [0,0],[1,0],[0,1],[0,2] ],
				[ [0,0],[1,0],[2,0],[2,1] ],
				[ [1,0],[1,1],[0,2],[1,2] ]
			],
		D:  [
				[ [0,0],[0,1],[1,0],[1,1] ]
			],
		I:  [
				[ [-1,0],[0,0],[1,0],[2,0] ],
				[ [0,-1],[0,0],[0,1],[0,2] ]
			],
		Z:  [
				[ [0,0],[1,0],[1,1],[2,1] ],
				[ [1,0],[0,1],[1,1],[0,2] ]
			],
		L:  [
				[ [2,0],[0,1],[1,1],[2,1] ],
				[ [0,0],[0,1],[0,2],[1,2] ],
				[ [0,0],[1,0],[2,0],[0,1] ],
				[ [0,0],[1,0],[1,1],[1,2] ]
			]
	};

	// Разбиения цифр на фигуры.
	// Каждая строка кодирует расположение одной фигуры. 
	// Символы в строке:
	// 	0 Тип фигуры,
	// 	1 Вариант поворота фигуры,
	// 	2 Разделитель для читаемости,
	// 	3 Координата x,
	// 	4 Координата y.
	const numList = {
		"0": ['I1|07','J3|47','S0|28','T1|17','Z1|45','T3|04','Z1|02','T1|43','T1|00','Z0|10','I1|51','L3|30'],
		"1": ['D0|48','L1|45','I1|54','J1|42','D0|40'],
		"2": ['L0|18','D0|48','L1|16','I1|07','I1|53','I0|25','J3|32','L2|04','J0|20','D0|00','J2|30'],
		"3": ['L0|38','J0|08','I0|28','D0|46','I0|25','L2|04','J2|34','L3|31','L2|20','I1|51','D0|00'],
		"4": ['D0|48','L1|45','I0|15','J0|13','J1|02','I1|54','J1|42','D0|00','D0|40'],
		"5": ['L0|38','J0|08','I0|28','D0|46','L0|34','I1|03','L2|24','I1|13','L0|30','D0|00','L2|20'],
		"6": ['J3|47','L1|07','Z0|18','J3|36','S1|05','I1|02','T3|44','S0|24','T1|13','L2|11','D0|40','I0|10'],
		"7": ['D0|48','L1|45','L3|44','L3|31','L2|20','I1|51','D0|00'],
		"8": ['I1|57','I0|19','T3|37','Z1|44','T0|07','Z1|05','T1|42','Z1|03','T1|01','D0|24','J2|31','Z0|00','I0|30'],
		"9": ['I0|39','L0|27','T3|34','I1|56','S1|42','D0|08','S0|14','T0|20','T1|03','T3|01','L2|00','L3|40']
	};

	const ox = 3; // offset, смещение циферблата.
	const oy = 2;
	const oNumY = 6; // смещение области цифр от границы циферблата, область анимации.
	const oSecX = 16; // смещение секундных точек.
	const oSecY = oNumY + 2;
	const gr = 11; // grid, размер сетки, одной точки.
	const speed = 75; // Задержка между кадрами в анимации, мс.
	const borderColor = "#758374";
	const bgColor = "#b5c3b4";
	const pixelColor = "#010101";

	let isSeconds = false; // Отрисованы ли секундные точки.

	drawField();

	// Запуск первичной анимации времени.
	let time = new Date,
		hours = time.getHours(),
		minutes = time.getMinutes();
	let animate1 = animateNumber(Math.trunc(hours/10), ox, oy),
	animate2 = animateNumber(hours%10, ox+8, oy),
	animate3 = animateNumber(Math.trunc(minutes/10), ox+20, oy),
	animate4 = animateNumber(minutes%10, ox+28, oy);
	
	// Запускаем основной цикл работы часов.
	let mainInterval = setInterval(animateClock, 500);

	function animateClock() {

		let newTime = new Date(),
			newH = newTime.getHours(),
			newM = newTime.getMinutes();

		drawSeconds();

		if (minutes != newM) {
			if (newM == 0) {
				if (Math.trunc(hours/10) != Math.trunc(newH/10)) {
					if (animate1) {
						clearInterval(animate1);
						animate1 = null;
					};
					animateNumber(Math.trunc(newH/10), ox, oy);
				};
				if (animate2) {
					clearInterval(animate2);
					animate2 = null;
				};
				animateNumber(newH%10, ox+8, oy);
			};

			if (Math.trunc(minutes/10) != Math.trunc(newM/10)) {
				if (animate3) {
					clearInterval(animate3);
					animate3 = null;
				};
				animateNumber(Math.trunc(newM/10), ox+20, oy);
			};
			if (animate4) {
				clearInterval(animate4);
				animate4 = null;
			};
			animateNumber(newM%10, ox+28, oy);
		};

		hours = newH;
		minutes = newM;
	};

	function animateNumber(num, x0, y0, oStartX=2) {

		let startY = y0,
			startX = x0 + oStartX,
			figFly = [],
			frameN = 0,
			figDone = 0;

		num = String(num);
		let numState = numList[num].slice().reverse();
		let timerID = setInterval(frame, speed);
		return timerID;

		function frame() {

			clearArea(x0-1, 0, 8, oNumY+12);

			// Перерисовываем все фигулы в воздухе, проверяя неоходимость поворота или смещения и окончания полета.
			// Если все фигуры встали на место завершаем анимацию. 
			for (let i=0; i<figFly.length; i++) {

				figFly[i].y++;

				if (figFly[i].y - startY == figFly[i].turn) {
					figFly[i].type = figFly[i].finType;
				};

				if (figFly[i].y - startY == figFly[i].move) {
					figFly[i].x = x0 + figFly[i].fx;
				};

				drawFigure(figFly[i].type, figFly[i].x, figFly[i].y);

				if (figFly[i].y - startY == figFly[i].fy) {
					figFly.splice(i, 1);
					i--;
					figDone++;
					if (figDone == numList[num].length) {
						clearInterval(timerID);
					};
				}; 
			};

			// Каждые 5 кадров добавляем новую фигуру в массив полета, рассчитывая место поворота и смещения.
			// Затем отрисовываем новую фигуру.
			if (frameN % 5 == 0 && numState.length !== 0) {
				let fig = numState.pop(),
					way = +fig[4] + oNumY,
					finType = figList[fig[0]][fig[1]],
					type = figList[fig[0]][0],
					newFly = {
						x: startX,
						y: startY,
						fx: +fig[3],
						fy: way,
						turn: Math.round(way*0.2),
						move: Math.round(way*0.4),
						finType: finType,
						type: type
					};
				figFly.push(newFly);
				drawFigure(type, startX, startY);
			};

			// Заново отрисовываем фигуры, которые уже стоят на местах и завершаем кадр.
			drawNum(num, x0, y0 + oNumY, figDone);
			frameN++;
		};
		

	};

	function drawAllFig() {

		// Рисует все варианты фигур. Демонстрационная ф-ция.
		let n = 0;
		drawField();
		for (let key in figList) {
			for (let i=0; i<figList[key].length; i++){
				let fig = figList[key][i];
				drawFigure(fig, n*5+3, i*4+2);
				console.log(key);
			};
			n++;
		};
	};

	function drawNum(num, x, y, part) {
		
		//Рисует {part} первых фигур цифры {num}. Если {part} не указан, рисует всю цифру.
		if (part !== 0) {
			num = numList[num+''];
			for(let i=0; i<(part||num.length); i++) {
				drawFigure(figList[num[i][0]][num[i][1]], x+ +num[i][3], y+ +num[i][4]);
			};
		};
	};

	function drawField() {
		ctx.fillStyle = bgColor;
		ctx.fillRect(0, 0, canvas.width, canvas.height);	
	};

	function clearArea(x, y, dx, dy) {
		ctx.fillStyle = bgColor;
		ctx.fillRect(x*gr, y*gr, dx*gr, dy*gr);
	};

	function drawSeconds() {

		if (!isSeconds) {
			ctx.fillStyle = pixelColor;
			drawFigure(figList.D[0], ox+oSecX, oy+oSecY);
			drawFigure(figList.D[0], ox+oSecX, oy+oSecY+4);
			isSeconds = true;
		} else {
			clearArea(ox+oSecX, oy+oSecY, 2, 6);
			isSeconds = false;
		};
	};

	function drawFigure (fig, x, y) {
		for(let i=0; i<fig.length; i++) {
			fillPixel(x+fig[i][0], y+fig[i][1]);
		};
	};

	function fillPixel(x, y) {
		ctx.fillStyle = pixelColor;
		ctx.fillRect( x*gr+1, y*gr+1, gr-1, gr-1);
		ctx.fillStyle = "#758374";
		ctx.fillRect( x*gr+2, y*gr+2, gr-3, gr-3 );
		ctx.fillStyle = pixelColor;
		ctx.fillRect( x*gr+3, y*gr+3, gr-5, gr-5);		
	};
};