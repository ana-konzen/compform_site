// require https://cdn.jsdelivr.net/npm/p5@1.4.0/lib/p5.js

function setup() {
  createCanvas(windowWidth, windowHeight);
  noLoop();

  noStroke();
  fill(255, 255, 255);
}

function draw() {
  background(250, 200, 200);

  fill(90, 50, 80);

  const rows = height / 50;
  const cols = width / 50;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      drawThing(col * 50 + 25, row * 50 + 25);
    }
  }
}

const brownianRadius = 25;

function drawThing(x, y) {
  let radius;

  // even
  radius = random(0, 50);

  // very strong low bias
  // radius = min(random(0, 50), random(0, 50), random(0, 50), random(0, 50), random(0, 50));

  // very strong high bias
  // radius = max(random(0, 50), random(0, 50), random(0, 50), random(0, 50), random(0, 50));

  // very strong middle bias
  // radius = (random(0, 50) + random(0, 50) + random(0, 50) + random(0, 50) + random(0, 50)) * 0.2;

  ////////////////////////////////////////////////////////////////////
  // curated sizes
  // let r = random(100);
  // if (r < 10) {
  // 	radius = 10;
  // } else if (r < 95) {
  // 	radius = 20;
  // } else {
  // 	radius = 40;
  // }

  ////////////////////////////////////////////////////////////////////
  // brownian
  // brownianRadius += random(-5, 5);
  // radius = brownianRadius;

  ellipse(x, y, radius, radius);
}
