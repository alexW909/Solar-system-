(function(){
  // Curated list of major, well-known satellites by NORAD catalog number.
  var targets = [
    {id: 25544, name: "International Space Station", color:"#5CA8F0"},
    {id: 20580, name: "Hubble Space Telescope", color:"#E8C48A"},
    {id: 48274, name: "Tiangong Space Station", color:"#E0764A"},
    {id: 43013, name: "NOAA-20 (weather)", color:"#8FE0DA"},
    {id: 39084, name: "Landsat 8", color:"#97C459"},
    {id: 25994, name: "Terra (Earth observation)", color:"#F0C48C"},
    {id: 27424, name: "Aqua (Earth observation)", color:"#6C8EF0"},
    {id: 41866, name: "GOES-16 (weather, geostationary)", color:"#F2D9A0"},
    {id: 37849, name: "Sentinel/SPOT-6 class imaging", color:"#C9C6BE"},
    {id: 28654, name: "NOAA-18 (weather)", color:"#EF9F27"}
  ];

  var statusEl = document.getElementById("satStatus");
  var listEl = document.getElementById("satList");
  var mapSvg = document.getElementById("worldMap");

  // simple equirectangular world outline (very simplified coastlines) for context
  function drawGraticule(){
    for(var lon=-180; lon<=180; lon+=30){
      var x = (lon+180)/360*720;
      var line = document.createElementNS("http://www.w3.org/2000/svg","line");
      line.setAttribute("x1", x); line.setAttribute("y1", 0);
      line.setAttribute("x2", x); line.setAttribute("y2", 380);
      line.setAttribute("stroke", "rgba(255,255,255,0.06)");
      line.setAttribute("stroke-width", "1");
      mapSvg.appendChild(line);
    }
    for(var lat=-90; lat<=90; lat+=30){
      var y = (90-lat)/180*380;
      var hline = document.createElementNS("http://www.w3.org/2000/svg","line");
      hline.setAttribute("x1", 0); hline.setAttribute("y1", y);
      hline.setAttribute("x2", 720); hline.setAttribute("y2", y);
      hline.setAttribute("stroke", "rgba(255,255,255,0.06)");
      hline.setAttribute("stroke-width", "1");
      mapSvg.appendChild(hline);
    }
    var equator = document.createElementNS("http://www.w3.org/2000/svg","line");
    equator.setAttribute("x1", 0); equator.setAttribute("y1", 190);
    equator.setAttribute("x2", 720); equator.setAttribute("y2", 190);
    equator.setAttribute("stroke", "rgba(255,255,255,0.15)");
    equator.setAttribute("stroke-width", "1");
    mapSvg.appendChild(equator);
  }
  drawGraticule();

  function latLonToXY(lat, lon){
    var x = (lon+180)/360*720;
    var y = (90-lat)/180*380;
    return [x,y];
  }

  var satrecs = [];

  function fetchTLE(target){
    var url = "https://celestrak.org/NORAD/elements/gp.php?CATNR=" + target.id + "&FORMAT=TLE";
    return fetch(url).then(function(res){
      if(!res.ok) throw new Error("HTTP " + res.status);
      return res.text();
    }).then(function(text){
      var lines = text.trim().split("\n");
      if(lines.length < 3) throw new Error("No TLE returned");
      var satrec = satellite.twoline2satrec(lines[1].trim(), lines[2].trim());
      return { target: target, satrec: satrec, tleName: lines[0].trim() };
    });
  }

  Promise.allSettled(targets.map(fetchTLE)).then(function(results){
    var ok = results.filter(function(r){ return r.status === "fulfilled"; });
    var failed = results.filter(function(r){ return r.status === "rejected"; });

    if(ok.length === 0){
      statusEl.textContent = "Could not load live satellite data (network or CORS issue). Try opening this page over HTTPS on a real host rather than a local file.";
      statusEl.classList.add("error");
      return;
    }

    statusEl.textContent = "Tracking " + ok.length + " satellites live" + (failed.length ? (" (" + failed.length + " unavailable)") : "") + ".";

    ok.forEach(function(r){
      var v = r.value;
      satrecs.push(v);

      var dot = document.createElementNS("http://www.w3.org/2000/svg","circle");
      dot.setAttribute("r", 4);
      dot.setAttribute("fill", v.target.color);
      mapSvg.appendChild(dot);

      var label = document.createElementNS("http://www.w3.org/2000/svg","text");
      label.setAttribute("font-size", "9");
      label.setAttribute("fill", "rgba(255,255,255,0.8)");
      label.setAttribute("font-family", "ui-monospace, Menlo, monospace");
      mapSvg.appendChild(label);

      var row = document.createElement("div");
      row.className = "sat-row";
      row.innerHTML = '<div><div class="name" style="color:'+v.target.color+';">'+v.target.name+'</div>' +
        '<div class="meta" id="sat-pos-'+v.target.id+'">locating...</div></div>' +
        '<div class="meta">NORAD ' + v.target.id + '</div>';
      listEl.appendChild(row);

      v.dotEl = dot;
      v.labelEl = label;
    });

    function update(){
      var now = new Date();
      var gmst = satellite.gstime(now);
      satrecs.forEach(function(v){
        try {
          var pv = satellite.propagate(v.satrec, now);
          if(!pv.position) return;
          var geo = satellite.eciToGeodetic(pv.position, gmst);
          var lat = satellite.degreesLat(geo.latitude);
          var lon = satellite.degreesLong(geo.longitude);
          var altKm = geo.height;
          var xy = latLonToXY(lat, lon);
          v.dotEl.setAttribute("cx", xy[0]);
          v.dotEl.setAttribute("cy", xy[1]);
          v.labelEl.setAttribute("x", xy[0] + 6);
          v.labelEl.setAttribute("y", xy[1] - 6);
          v.labelEl.textContent = v.target.name.split(" ")[0];
          var posEl = document.getElementById("sat-pos-" + v.target.id);
          if(posEl) posEl.textContent = lat.toFixed(1) + ", " + lon.toFixed(1) + " · " + Math.round(altKm) + " km altitude";
        } catch(e){}
      });
      requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  });
})();
