// require https://cdn.jsdelivr.net/npm/p5@1.4.0/lib/p5.js

// places points on squares

// PREVIEW SETTINGS
let POINT_COUNT = 500;
let POINT_SIZE = 10;
let CANVAS_SIZE = 500;

// RENDER SETTINGS
// let POINT_COUNT = 2000;
// let CANVAS_SIZE = 1000;

let strategies;

let strat_i = 0;

function setup() {
  createCanvas(CANVAS_SIZE, CANVAS_SIZE);
  noStroke();
  fill("#4A4A4A");
  ellipseMode(CENTER);

  strategies = buildStrategies();

  strat_select = createSelect();
  strat_select.option("random");
  strat_select.option("noise (high frequency)", "noise_high");
  strat_select.option("noise (low frequency)", "noise_low");
  strat_select.option("grid");
  strat_select.option("cull close before placing", "cull_close_before");
  strat_select.option("cull far before placing", "cull_far_before");
  strat_select.option("cull both before placing", "cull_both_before");
  strat_select.option("tiles");

  strat_select.option("random + relax close", "relax");
  strat_select.option("random + tighten close", "tighten");
  strat_select.option("random + tighten + relax", "tighten_relax");
  strat_select.option("tiles + random + relax", "tiles_plus");

  strat_select.option("grid + random", "grid_random");
  strat_select.option("grid + noise distort", "grid_distort");

  strat_select.option("grid + noise cull", "grid_cull");
  strat_select.option("grid + noise cull dithered", "grid_cull_dithered");
  strat_select.option("random + noise cull", "random_cull");
  strat_select.option("cull close + noise cull", "cull_close_noise");

  strat_select.value("random");
  strat_select.input(draw);

  // p1_slider = createSlider(0, 100, 0);
  // p1_slider.input(draw);

  save_button = createButton("Save Image");
  save_button.mousePressed(function () {
    save(strat_select.value() + ".png");
  });
}

// creates an object that stores each strategy/recepie
// a strategy can be run like this
// points = strategies["random"]();
// storing the strategy functions in this way makes it easy to call the function named in the select dropdown

function buildStrategies() {
  let strategies = {};

  strategies.random = function () {
    return placePointsRandom(POINT_COUNT, width, height);
  };

  strategies.noise_high = function () {
    return placePointsNoise(POINT_COUNT, width, height, 1);
  };

  strategies.noise_low = function () {
    return placePointsNoise(POINT_COUNT, width, height, 0.02);
  };

  strategies.grid = function () {
    return placePointsGrid(sqrt(POINT_COUNT), width, height);
  };

  strategies.cull_close_before = function () {
    return placePointsCullRange(POINT_COUNT, width, height, 20, 1000);
  };

  strategies.cull_far_before = function () {
    return placePointsCullRange(POINT_COUNT, width, height, 0, 30);
  };

  strategies.cull_both_before = function () {
    return placePointsCullRange(POINT_COUNT, width, height, 10, 30);
  };

  strategies.tiles = function () {
    return placePointsTiles(width / 150, width, height);
  };

  strategies.relax = function () {
    return relaxPoints(
      placePointsRandom(POINT_COUNT, width, height),
      10,
      10,
      1
    );
  };

  strategies.tighten = function () {
    return relaxPoints(
      placePointsRandom(POINT_COUNT, width, height),
      5,
      50,
      -0.3
    );
  };

  strategies.tighten_relax = function () {
    let ps = placePointsRandom(POINT_COUNT, width, height);
    ps = relaxPoints(ps, 5, 50, -0.3); // tighten
    ps = relaxPoints(ps, 10, 10, 1); // relax
    return ps;
  };

  strategies.tiles_plus = function () {
    let ps = placePointsTiles(width / 150, width, height);
    ps = addPoints(ps, placePointsRandom(POINT_COUNT, 12, 12));
    relaxPoints(ps, 5, 17, 4);

    return ps;
  };

  strategies.grid_random = function () {
    return addPoints(
      placePointsGrid(sqrt(POINT_COUNT), width, height),
      placePointsRandom(POINT_COUNT, 12, 12)
    );
  };

  strategies.grid_distort = function () {
    return noiseDistort(
      placePointsGrid(sqrt(POINT_COUNT), width, height),
      0.01,
      40
    );
  };

  strategies.grid_cull = function () {
    return noiseCull(
      placePointsGrid(sqrt(POINT_COUNT), width, height),
      0.01,
      0.5,
      0.0
    );
  };

  strategies.grid_cull_dithered = function () {
    return noiseCull(
      placePointsGrid(sqrt(POINT_COUNT), width, height),
      0.01,
      0.33,
      0.33
    );
  };

  strategies.random_cull = function () {
    return noiseCull(
      placePointsRandom(POINT_COUNT, width, height),
      0.01,
      0.5,
      0.0
    );
  };

  strategies.cull_close_noise = function () {
    let ps = placePointsCullRange(POINT_COUNT, width, height, 15, 1000);
    return noiseCull(ps, 0.01, 0.5, 0.0);
  };

  return strategies;
}

////////////////////////////////////////////////////////
// Drawing

function draw() {
  // clear the background
  background("#F4F3F1");

  randomSeed(1);
  noiseSeed(2);

  points = strategies[strat_select.value()]();
  drawPoints(points);

  // drawDelaunay(points);
  noLoop();
}

function drawDelaunay(points) {
  let ps = [];
  for (let i = 0; i < points.length; i++) {
    ps.push([points[i].x, points[i].y]);
  }
  console.log(ps);
  let tris = Delaunay.triangulate(ps);
  console.log(tris);

  line(255, 0, 0);

  for (let j = 0; j < tris.length - 1; j++) {
    if (j % 3 < 2) {
      line(
        ps[tris[j]][0],
        ps[tris[j]][1],
        ps[tris[j + 1]][0],
        ps[tris[j + 1]][1]
      );
    } else {
      line(
        ps[tris[j]][0],
        ps[tris[j]][1],
        ps[tris[j - 2]][0],
        ps[tris[j - 2]][1]
      );
    }
  }
}

// visualize the points as simple ellipses
function drawPoints(points) {
  // loop through the points
  for (let i = 0; i < points.length; i++) {
    // pull the coordianates from the current point in array
    let x = points[i].x;
    let y = points[i].y;

    // draw an ellipse at point
    // noStroke();
    // fill(255);
    ellipse(x, y, POINT_SIZE, POINT_SIZE);
  }
}

////////////////////////////////////////////////////////
// Point Array Processors

// moves the points in _points_
// finds pairs of points that are < _min_distance_ apart
// moves them along a line between the pair of points
// points are moved _strength_ pixels.
// positive _strength_ will move them apart, negative _strenghth_ will move them together
// iterates _steps_ times
function relaxPoints(points, steps, min_distance, strength) {
  for (let step = 0; step < steps; step++) {
    for (let i = 0; i < points.length; i++) {
      for (let j = 0; j < points.length; j++) {
        if (i == j) continue;
        let p1 = points[i];
        let p2 = points[j];

        // checking distance with dist() is slowish
        // this test (which is faster) can weed out some pairs so we don't need to test them
        // this speeds things up a bit, but this is still a very ineficient way to relax points
        // much faster solutions exist, but this one is easier to follow.
        let quickTest =
          abs(p1.x - p2.x) < min_distance && abs(p1.y - p2.y) < min_distance;

        // too close, move apart
        if (quickTest && dist(p1.x, p1.y, p2.x, p2.y) < min_distance) {
          let v = subtractPoint(p1, p2); // find the vector between two points
          let nV = normalizePoint(v); // scale to 1 px unit size

          p1.x += nV.x * strength;
          p1.y += nV.y * strength;
          p2.x -= nV.x * strength;
          p2.y -= nV.y * strength;
        }

        points[i] = p1;
        points[j] = p2;
      }
    }
  }

  return points;
}

// offsets the coords of points in _inPoints_ by values found in noise
function noiseDistort(inPoints, frequency, amplitude) {
  let outPoints = [];
  for (let i = 0; i < inPoints.length; i++) {
    let p = inPoints[i];

    p.x += (noise(p.x * frequency, p.y * frequency) - 0.5) * amplitude;
    p.y += (noise(p.x * frequency, p.y * frequency) - 0.5) * amplitude;

    outPoints.push(p);
  }
  return outPoints;
}

// processes _inPoints_ removing points that land on high values in noise
function noiseCull(inPoints, frequency, threshold, dither) {
  let outPoints = [];

  for (let i = 0; i < inPoints.length; i++) {
    let p = inPoints[i];

    // accept point if noise value is below threshold
    if (
      noise(p.x * frequency, p.y * frequency) <
      threshold + random() * dither
    ) {
      outPoints.push(p);
    }
  }

  return outPoints;
}

////////////////////////////////////////////////////////
// Point Array Generators

// places _count_ points in the range _w_,_h_
// coords are chosen with random()
function placePointsRandom(count, w, h) {
  let points = [];

  for (let i = 0; i < count; i++) {
    let x = random() * w;
    let y = random() * h;
    points.push({
      x: x,
      y: y,
    });
  }

  return points;
}

// places points on the center of squres in a _grid_size_ x _grid_size_ grid
function placePointsGrid(grid_size, w, h) {
  let points = [];

  for (let y = 0; y < grid_size; y++) {
    for (let x = 0; x < grid_size; x++) {
      points.push({
        x: ((x + 0.5) / grid_size) * w,
        y: ((y + 0.5) / grid_size) * h,
      });
    }
  }

  return points;
}

// place points in the range _w_,_h_
// point coords are chosen from values found in noise
// using a high _frequency_ value will skip large areas in noise and provide highly random results
// using a low _frequency_ value will skip small areas in noise and dots will be organized in a windy line
function placePointsNoise(count, w, h, frequency) {
  let points = [];

  for (let i = 0; i < count; i++) {
    let x = noise(i * frequency, 0) * w;
    let y = noise(i * frequency, 1000) * h;
    points.push({
      x: x,
      y: y,
    });
  }

  return points;
}

// place _count_ points, over the range _w_,_h_.
// don't place a point that would be closer than _min_distance_ any other point
// don't place a point that would be further than _max_distance_ from all other points

function placePointsCullRange(count, w, h, min_distance, max_distance) {
  let points = [];

  let current_try = 0;
  let max_tries = count * 10;

  // init with one point in center
  points.push({
    x: w * 0.5,
    y: h * 0.5,
  });

  while (points.length < count && current_try < max_tries) {
    current_try++;

    let x = random() * w;
    let y = random() * h;

    let isTooClose = checkClose(x, y, points, min_distance);
    let isCloseEnough = checkClose(x, y, points, max_distance);

    if (!isTooClose && isCloseEnough) {
      points.push({
        x: x,
        y: y,
      });
    }
  }

  return points;
}

// place points from premade "tiles"
function placePointsTiles(grid_size, width, height) {
  let points = [];

  let tile1 = [
    {
      x: 0.049009,
      y: 0.497592,
    },
    {
      x: 0.145142,
      y: 0.47847,
    },
    {
      x: 0.235699,
      y: 0.44096,
    },
    {
      x: 0.317197,
      y: 0.386505,
    },
    {
      x: 0.386505,
      y: 0.317196,
    },
    {
      x: 0.440961,
      y: 0.235698,
    },
    {
      x: 0.47847,
      y: 0.145142,
    },
    {
      x: 0.497592,
      y: 0.049008,
    },
    {
      x: 0.950991,
      y: 0.502407,
    },
    {
      x: 0.854858,
      y: 0.52153,
    },
    {
      x: 0.764302,
      y: 0.559039,
    },
    {
      x: 0.682803,
      y: 0.613495,
    },
    {
      x: 0.613495,
      y: 0.682803,
    },
    {
      x: 0.559039,
      y: 0.764301,
    },
    {
      x: 0.52153,
      y: 0.854858,
    },
    {
      x: 0.502408,
      y: 0.950991,
    },
  ];

  let tile2 = [
    {
      x: 0.497592,
      y: 0.950991,
    },
    {
      x: 0.47847,
      y: 0.854857,
    },
    {
      x: 0.440961,
      y: 0.764301,
    },
    {
      x: 0.386505,
      y: 0.682803,
    },
    {
      x: 0.317196,
      y: 0.613494,
    },
    {
      x: 0.235698,
      y: 0.559039,
    },
    {
      x: 0.145142,
      y: 0.521529,
    },
    {
      x: 0.049008,
      y: 0.502407,
    },
    {
      x: 0.502408,
      y: 0.049008,
    },
    {
      x: 0.52153,
      y: 0.145142,
    },
    {
      x: 0.55904,
      y: 0.235698,
    },
    {
      x: 0.613495,
      y: 0.317196,
    },
    {
      x: 0.682804,
      y: 0.386505,
    },
    {
      x: 0.764302,
      y: 0.44096,
    },
    {
      x: 0.854858,
      y: 0.47847,
    },
    {
      x: 0.950992,
      y: 0.497592,
    },
  ];

  let tile3 = [
    {
      x: 0.497592,
      y: 0.950991,
    },
    {
      x: 0.049008,
      y: 0.502407,
    },
    {
      x: 0.502408,
      y: 0.049008,
    },
    {
      x: 0.592227,
      y: 0.592227,
    },
    {
      x: 0.407773,
      y: 0.592227,
    },
    {
      x: 0.407773,
      y: 0.407773,
    },
    {
      x: 0.592227,
      y: 0.407773,
    },
    {
      x: 0.950992,
      y: 0.497592,
    },
    {
      x: 0.498734,
      y: 0.737245,
    },
    {
      x: 0.498163,
      y: 0.8441,
    },
    {
      x: 0.499304,
      y: 0.630427,
    },
    {
      x: 0.500696,
      y: 0.369573,
    },
    {
      x: 0.501837,
      y: 0.155899,
    },
    {
      x: 0.155899,
      y: 0.501837,
    },
    {
      x: 0.369573,
      y: 0.500696,
    },
    {
      x: 0.630427,
      y: 0.499304,
    },
    {
      x: 0.8441,
      y: 0.498163,
    },
    {
      x: 0.501267,
      y: 0.262754,
    },
    {
      x: 0.262754,
      y: 0.501266,
    },
    {
      x: 0.737246,
      y: 0.498733,
    },
  ];

  randomSeed(4);

  for (let y = 0; y < grid_size; y++) {
    for (let x = 0; x < grid_size; x++) {
      let r = random();
      let t = tile1;
      if (r > 0.4) {
        t = tile2;
      }
      if (r > 0.8) {
        t = tile3;
      }
      for (let i = 0; i < t.length; i++) {
        let pX = (t[i].x * width) / grid_size + (x * width) / grid_size;
        let pY = (t[i].y * height) / grid_size + (y * width) / grid_size;
        points.push({
          x: pX,
          y: pY,
        });
      }
    }
  }

  return points;
}

////////////////////////////////////////////////////////
// Point Utils

// add the coresponding points in two lists.
function addPoints(p1s, p2s) {
  let points = [];
  for (let i = 0; i < p1s.length && i < p2s.length; i++) {
    points.push({
      x: p1s[i].x + p2s[i].x,
      y: p1s[i].y + p2s[i].y,
    });
  }
  return points;
}

// lerp the coresponding points in two lists.
function lerpPoints(p1s, p2s, mix) {
  let points = [];
  for (let i = 0; i < p1s.length && i < p2s.length; i++) {
    points.push({
      x: lerp(p1s[i].x, p2s[i].x, mix),
      y: lerp(p1s[i].y, p2s[i].y, mix),
    });
  }
  return points;
}

// checks if the point (x, y) is within min_distance of any point in points
function checkClose(x, y, points, min_distance) {
  for (let i = 0; i < points.length; i++) {
    if (dist(points[i].x, points[i].y, x, y) < min_distance) {
      return true;
    }
  }
  return false;
}

// subtracts p2 from p1 (component wise)
function subtractPoint(p1, p2) {
  return {
    x: p1.x - p2.x,
    y: p1.y - p2.y,
  };
}

// scales point as vector to magnitude of one
function normalizePoint(p) {
  let d = dist(0, 0, p.x, p.y);
  return {
    x: p.x / d,
    y: p.y / d,
  };
}

// render each strategy and save out (probably broken)
function saveAll() {
  let s = Object.keys(strategies)[strat_i];
  points = strategies[s]();
  drawPoints(points);
  save(s + ".png");
  strat_i++;
  if (strat_i >= Object.keys(strategies)) {
    noLoop();
  }
}
