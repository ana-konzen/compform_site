// require https://cdn.jsdelivr.net/npm/p5@1.4.0/lib/p5.js
// require https://cdnjs.cloudflare.com/ajax/libs/p5.js/0.6.0/addons/p5.sound.js

let frequency = 220;
let carrier;

function setup() {
  createCanvas(400, 200);

  carrier = new p5.Oscillator("sine");
  carrier.amp(1); // set amplitude
  carrier.freq(440); // set BASE frequency
  // carrier.start(); // start oscillating

  modulator = new p5.Oscillator("sine");
  modulator.amp(100); // set amplitude
  modulator.freq(1); // set frequency
  modulator.start(); // start oscillating
  modulator.disconnect();

  carrier.freq(modulator); // set frequency MODULATOR. this is a bit weird because the previous call to set freq is also important.

  // reverb = new p5.Reverb();
  // reverb.process(carrier, 3, 2);

  startButton = createButton("start");
  startButton.mousePressed(start);

  stopButton = createButton("stop");
  stopButton.mousePressed(stop);

  recordButton = createButton("record");

  recordButton.mousePressed(function () {
    record(5000);
  });
}

function start() {
  carrier.start(); // start oscillating
}

function stop() {
  carrier.stop(); // start oscillating
}

function draw() {
  background(50);
}

// uses the p5 SoundRecorder and SoundFile classes to record the audio output.
// begins recording when called. records for _length_ time in milliseconds.
function record(length) {
  let soundRecorder = new p5.SoundRecorder();
  let soundFile = new p5.SoundFile();
  soundRecorder.record(soundFile);
  setTimeout(function () {
    console.log("Recording Complete");
    soundRecorder.stop();
    save(soundFile, "output.wav");
  }, length);
}

let carrier, modulator;
