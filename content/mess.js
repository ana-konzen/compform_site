/* exported mess */

// rename or document hide off class names

function mess(c, wait_ms = 2000, creditInfo = {}) {
  /// set up canvas
  c.canvas.setAttribute("style", ""); // remove p5.js default styles
  c.canvas.classList.add("mess");
  c.canvas.classList.add("hide"); // start hidden
  setTimeout(showMess, 1); // show immediately after init

  /// set up mess UI
  createMessUI();
  const showMessCheckbox = document.getElementById("show-mess-checkbox");
  showMessCheckbox.addEventListener("change", function () {
    c.canvas.classList.toggle("off", !this.checked);
    if (this.checked) {
      window.resumeMess ? window.resumeMess() : loop();
    } else {
      window.pauseMess ? window.pauseMess() : noLoop();
    }
  });

  /// manange fading the canvas in and out based on mouse movement
  let hideTimeout = null;
  function showMess() {
    c.canvas.classList.remove("hide");
    hideTimeout && clearTimeout(hideTimeout);
    hideTimeout = setTimeout(hideMess, wait_ms);

    window.messShow?.(); // call messShow if mess defines it
  }

  function hideMess() {
    c.canvas.classList.add("hide");

    window.messHide?.(); // call messHide if mess defines it
  }

  window.addEventListener("mousemove", () => {
    showMess();
  });

  /// handle canvas resizing
  window.addEventListener("resize", () => {
    resizeCanvas(windowWidth, windowHeight);
    c.canvas.setAttribute("style", ""); // remove p5.js default styles

    window.messResize?.(); // call messResize if mess defines it
  });

  function createMessUI() {
    let creditLine = "";

    // credit lines must have messName and messLink
    if (creditInfo?.messLink && creditInfo?.messName) {
      creditLine += ` — <a href="${creditInfo.messLink}">${creditInfo.messName}</a>`;

      // credited author is optional
      if (creditInfo?.authorLink && creditInfo?.authorName) {
        creditLine += ` by <a href="${creditInfo.authorLink}">${creditInfo.authorName}</a>`;
      }

      // uncredited author is optional
      if (!creditInfo?.authorLink && creditInfo?.authorName) {
        creditLine += ` by ${creditInfo.authorName}`;
      }
    }

    document.body.insertAdjacentHTML(
      "beforeend",
      `
      <div class="mess-UI">
        <label class="switch" for="show-mess-checkbox">
          <input type="checkbox" id="show-mess-checkbox" checked/>
          <div class="slider round"></div>
          <div class="label">${creditLine}</div>
        </label>
      </div>`
    );
  }
}
