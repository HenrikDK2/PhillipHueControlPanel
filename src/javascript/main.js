const username = "LX7Ti85miwL3NlNgedbez0OaXF-pMs3K8UK3ZLg7";
const ip = "192.168.8.100";
const btn = document.querySelector('.onstate-btn');
const brightnessBtn = document.querySelector('.bri-container__brightness');
const lightSelectBtn = document.querySelector('.lightSelect');
const discoBtn = document.querySelector('.disco');
const colorPickerBtn = document.querySelector('.jscolor');
let light = parseInt(lightSelectBtn.value);
let disco = null;

//Events
lightSelectBtn.addEventListener('change', changeLight);
discoBtn.addEventListener('click', toggleDisco);
btn.addEventListener("click", onstate);
brightnessBtn.addEventListener("change", brightness);
colorPickerBtn.addEventListener("change", colorpicker);

//Functions
async function requestJob(str, method, body) {
  let data = await fetch(`https://${ip}/api/${username}/${str}`, {
    method: method,
    body: JSON.stringify(body)
  }).then(res => res.json());
  return data;
}

function getXYFromRgb(red, green, blue) {
  if (red > 0.04045) {
    red = Math.pow((red + 0.055) / (1.0 + 0.055), 2.4);
  }
  else red = (red / 12.92);

  if (green > 0.04045) {
    green = Math.pow((green + 0.055) / (1.0 + 0.055), 2.4);
  }
  else green = (green / 12.92);

  if (blue > 0.04045) {
    blue = Math.pow((blue + 0.055) / (1.0 + 0.055), 2.4);
  }
  else blue = (blue / 12.92);

  var X = red * 0.664511 + green * 0.154324 + blue * 0.162028;
  var Y = red * 0.283881 + green * 0.668433 + blue * 0.047685;
  var Z = red * 0.000088 + green * 0.072310 + blue * 0.986039;
  var x = X / (X + Y + Z);
  var y = Y / (X + Y + Z);
  return new Array(x, y);
}

function getHexFromRgb(rgb) {
  rgb = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
  return (rgb && rgb.length === 4) ? "#" +
    ("0" + parseInt(rgb[1], 10).toString(16)).slice(-2) +
    ("0" + parseInt(rgb[2], 10).toString(16)).slice(-2) +
    ("0" + parseInt(rgb[3], 10).toString(16)).slice(-2) : '';
}

function getRGBFromXY(x, y, bri) {
  z = 1.0 - x - y;

  Y = bri / 255.0; // Brightness of lamp
  X = (Y / y) * x;
  Z = (Y / y) * z;
  r = X * 1.612 - Y * 0.203 - Z * 0.302;
  g = -X * 0.509 + Y * 1.412 + Z * 0.066;
  b = X * 0.026 - Y * 0.072 + Z * 0.962;
  r = r <= 0.0031308 ? 12.92 * r : (1.0 + 0.055) * Math.pow(r, (1.0 / 2.4)) - 0.055;
  g = g <= 0.0031308 ? 12.92 * g : (1.0 + 0.055) * Math.pow(g, (1.0 / 2.4)) - 0.055;
  b = b <= 0.0031308 ? 12.92 * b : (1.0 + 0.055) * Math.pow(b, (1.0 / 2.4)) - 0.055;
  maxValue = Math.max(r, g, b);
  r /= maxValue;
  g /= maxValue;
  b /= maxValue;
  r = r * 255; if (r < 0) { r = 255 };
  g = g * 255; if (g < 0) { g = 255 };
  b = b * 255; if (b < 0) { b = 255 };

  r = Math.round(r).toString(16);
  g = Math.round(g).toString(16);
  b = Math.round(b).toString(16);

  if (r.length < 2)
    r = "0" + r;
  if (g.length < 2)
    g = "0" + g;
  if (b.length < 2)
    b = "0" + r;
  rgb = "#" + r + g + b;

  return rgb;
}

async function colorpicker(e) {
  let hex = e.target.value;
  function getXYFromHex(hex) {
    red = parseInt(hex.substring(0, 2), 16);
    green = parseInt(hex.substring(2, 4), 16);
    blue = parseInt(hex.substring(4, 6), 16);

    return getXYFromRgb(red, green, blue);
  }

  let xy = getXYFromHex(hex);
  requestJob(`lights/${light}/state`, "PUT", { xy: xy });
}

async function onstate() {
  let data = await requestJob(`lights/${light}`);

  if (data['state'].on === true) {
    requestJob(`lights/${light}/state`, "PUT", { "on": false });
    btn.textContent = "OFF";
    btn.classList.remove('onstate-btn_active');
  } else {
    requestJob(`lights/${light}/state`, "PUT", { "on": true });
    btn.textContent = "ON";
    btn.classList.add('onstate-btn_active');
  }
}

async function advancedState(e) {
  const value = e.target.value;
  if (e.keyCode === 13) {
    requestJob(`lights/${light}/state`, "PUT", value);
    console.log(value)
  }
}

async function changeLight(e) {
  try {
    light = parseFloat(e.target.value);
    e.target.value = light;

    const data = await requestJob(`lights/${light}`);
    colorPickerBtn.value = getRGBFromXY(data.state.xy[0], data.state.xy[1], data.state.bri);
    colorPickerBtn.style.backgroundColor = getRGBFromXY(data.state.xy[0], data.state.xy[1], data.state.bri);
    brightnessBtn.value = data.state.bri;
    if (data.state.on == true) {
      btn.classList.add('onstate-btn_active');
      btn.textContent = "ON";
    } else {
      btn.textContent = "OFF";
      btn.classList.remove('onstate-btn_active');
    }

  } catch (error) {
    btn.classList.remove('onstate-btn_active');
    btn.textContent = "OFF";
    console.error("Light Source doesn't exist.")
  }
}

async function brightness(e) {
  requestJob(`lights/${light}/state`, "PUT", { "bri": parseInt(e.target.value) })
}

function toggleDisco() {
  if (disco === null) {
    disco = window.setInterval(async () => {
      const red = Math.floor(Math.random() * 256);
      const green = Math.floor(Math.random() * 256);
      const blue = Math.floor(Math.random() * 256);
      const bri = Math.floor(Math.random() * 255);
      const xy = getXYFromRgb(red, green, blue);
      const hex = getHexFromRgb(`rgb(${red}, ${green}, ${blue})`);
      colorPickerBtn.style.backgroundColor = hex;
      brightnessBtn.value = bri;
      colorPickerBtn.value = hex;

      requestJob(`lights/${light}/state`, "PUT", { "xy": xy, "bri": bri, "on": true })
    }, 100);
  } else {
    window.clearInterval(disco);
    discoBtn.style.backgroundColor = null;
    disco = null;
  }
}

//Initialize
(async () => {
  try {
    const lightsData = await requestJob("lights");
    const data = await requestJob(`lights/${light}`);
    let max = 0;
    for (key in lightsData) {
      max++;
    }
    lightSelectBtn.setAttribute('max', max);
    brightnessBtn.value = data.state.bri;
    if (data.state.on == true) {
      btn.classList.add('onstate-btn_active');
      btn.textContent = "ON";
    }
  } catch (error) {
    btn.textContent = "OFF";
    btn.classList.remove('onstate-btn_active');
    console.error("Light Source doesn't exist.")
  }
})();