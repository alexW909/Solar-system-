(function(){
  // Orbital elements (J2000-epoch approximations) for well-known comets.
  // period in days, a in AU. High-eccentricity orbits still solved via
  // standard elliptical Kepler (fine for e up to ~0.97).
  var comets = [
    {name:"Halley", a:17.834, e:0.96714, period:27740, L0:0, peri:111.33, color:"#8FE0DA",
      facts:{"Nucleus size":"~15 x 8 km","Orbital period":"~76 years","Last perihelion":"1986","Next perihelion":"~2061","Type":"Short-period comet"}},
    {name:"Hale-Bopp", a:186, e:0.995, period:895000, L0:352, peri:130.59, color:"#F0C48C",
      facts:{"Nucleus size":"~60 km","Orbital period":"~2,500 years","Last perihelion":"1997","Next perihelion":"~4385","Type":"Long-period comet"}},
    {name:"NEOWISE", a:358, e:0.9992, period:2490000, L0:250, peri:37.28, color:"#E0764A",
      facts:{"Nucleus size":"~5 km","Orbital period":"~6,800 years","Last perihelion":"2020","Next perihelion":"~8800","Type":"Long-period comet"}},
    {name:"Encke", a:2.215, e:0.8483, period:1204, L0:20, peri:186.5, color:"#6C8EF0",
      facts:{"Nucleus size":"~4.8 km","Orbital period":"3.3 years","Shortest known period":"Yes","Type":"Short-period comet"}},
    {name:"67P/Churyumov-Gerasimenko", a:3.463, e:0.6408, period:2355, L0:10, peri:12.8, color:"#E8C48A",
      facts:{"Nucleus size":"~4.3 km","Orbital period":"6.45 years","Visited by":"Rosetta (2014-2016)","Type":"Short-period comet"}}
  ];

  var svg = document.getElementById("cometSvg");
  var cx = 190, cy = 190;
  var listEl = document.getElementById("cometList");
  var M = window.SolarMechanics;

  var aMax = 400; // scale to accommodate long-period comets, compressed via sqrt
  var rMin = 10, rMax = 168;
  function scaleR(auVal){
    var v = Math.min(auVal, aMax);
    var t = Math.sqrt(v) / Math.sqrt(aMax);
    return rMin + t * (rMax - rMin);
  }

  // sun + orbit rings for planets (thin, for reference) reusing same radial scale as solar tab is not shared;
  // draw a simple sun marker and comet orbits only, to keep this view focused.
  var sunDot = document.createElementNS("http://www.w3.org/2000/svg","circle");
  sunDot.setAttribute("cx", cx); sunDot.setAttribute("cy", cy); sunDot.setAttribute("r", 6);
  sunDot.setAttribute("fill", "#FFD98A");
  svg.appendChild(sunDot);

  var dotEls = {};
  comets.forEach(function(c){
    var trail = document.createElementNS("http://www.w3.org/2000/svg","path");
    trail.setAttribute("fill", "none");
    trail.setAttribute("stroke", c.color);
    trail.setAttribute("stroke-width", "1");
    trail.setAttribute("opacity", "0.6");
    svg.appendChild(trail);

    var dot = document.createElementNS("http://www.w3.org/2000/svg","circle");
    dot.setAttribute("r", 3);
    dot.setAttribute("fill", c.color);
    svg.appendChild(dot);

    var label = document.createElementNS("http://www.w3.org/2000/svg","text");
    label.setAttribute("font-size", "8");
    label.setAttribute("font-family", "ui-monospace, Menlo, monospace");
    label.setAttribute("fill", "rgba(255,255,255,0.85)");
    label.textContent = c.name.toUpperCase();
    svg.appendChild(label);

    dotEls[c.name] = {dot:dot, trail:trail, label:label, hist:[]};

    var row = document.createElement("div");
    row.className = "sat-row";
    row.innerHTML = '<div><div class="name" style="color:'+c.color+';">'+c.name+'</div>' +
      '<div class="meta" id="comet-dist-'+c.name.replace(/[^a-zA-Z0-9]/g,"")+'">computing...</div></div>' +
      '<div class="meta">'+c.facts["Orbital period"]+'</div>';
    listEl.appendChild(row);
  });

  function frame(){
    var days = (Date.now() - M.EPOCH) / 86400000;
    comets.forEach(function(c){
      var pos = M.computePosition(c, days);
      var rPx = scaleR(pos.r);
      var x = cx + rPx * Math.cos(pos.angle);
      var y = cy - rPx * Math.sin(pos.angle);
      var el = dotEls[c.name];
      el.dot.setAttribute("cx", x);
      el.dot.setAttribute("cy", y);
      el.label.setAttribute("x", x + 6);
      el.label.setAttribute("y", y - 6);

      el.hist.push([x,y]);
      if(el.hist.length > 25) el.hist.shift();
      if(el.hist.length > 1){
        var d = "M" + el.hist[0][0].toFixed(1) + "," + el.hist[0][1].toFixed(1);
        for(var i=1;i<el.hist.length;i++){ d += " L" + el.hist[i][0].toFixed(1) + "," + el.hist[i][1].toFixed(1); }
        el.trail.setAttribute("d", d);
      }

      var distEl = document.getElementById("comet-dist-"+c.name.replace(/[^a-zA-Z0-9]/g,""));
      if(distEl) distEl.textContent = pos.r.toFixed(1) + " AU from sun";
    });
    requestAnimationFrame(frame);
  }
  // Wait for SolarMechanics to exist (solar-system.js loads first)
  function start(){
    if(window.SolarMechanics){ M = window.SolarMechanics; requestAnimationFrame(frame); }
    else { setTimeout(start, 50); }
  }
  start();
})();
