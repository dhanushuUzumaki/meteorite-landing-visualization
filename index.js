const apiUrl = 'https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/meteorite-strike-data.json';

const plotData = data => {
  const landingData = data.features.filter(d => d.geometry !== null);
  const margin = {
    top: 20,
    right: 20,
    bottom: 10,
    left: 100
  };
  const width = Math.max((((window.innerWidth / 100) * 80) - margin.right - margin.left), 700);
  const height = ((window.innerHeight / 100) * 80) - margin.bottom - margin.top;

  let initX,
    mouseClicked = false,
    s = 1,
    rotated = 90,
    mouse;

  const projection = d3.geoMercator()
    .scale(153)
    .translate([width / 2, height / 1.5])
    .rotate([rotated, 0, 0]);

  const path = d3.geoPath().projection(projection);

  const zoom = d3.zoom()
    .scaleExtent([1, 10])
    .on("zoom", zoomed)
    .on("end", zoomended);

  const svg = d3.select("svg")
    .attr("width", width)
    .attr("height", height)
    .on("wheel", function () {
      initX = d3.mouse(this)[0];
    })
    .on("mousedown", function () {
      if (s !== 1) return;
      initX = d3.mouse(this)[0];
      mouseClicked = true;
    })
    .call(zoom);

  const g = svg.append("g");


  function rotateMap(endX) {
    projection.rotate([rotated + (endX - initX) * 360 / (s * width), 0, 0]);
    g.selectAll('path').attr('d', path);
    landings.data(landingData)
    .enter()
    .append('circle')
    .attr('r', 3)
    .attr('fill', 'transparent')
    .attr('stroke', 'black')
    .attr('cx', d => projection([...d.geometry.coordinates])[0])
    .attr('cy', d => projection([...d.geometry.coordinates])[1])
    console.log(s, initX, rotated);
  }

  function zoomended() {
    if (s !== 1) return;
    rotated = rotated + ((mouse[0] - initX) * 360 / (s * width));
    mouseClicked = false;
  }

  function zoomed() {
    const t = [d3.event.transform.x, d3.event.transform.y];
    s = d3.event.transform.k;
    let h = 0;

    t[0] = Math.min(
      (width / height) * (s - 1),
      Math.max(width * (1 - s), t[0])
    );

    t[1] = Math.min(
      h * (s - 1) + h * s,
      Math.max(height * (1 - s) - h * s, t[1])
    );
    g.attr("transform", "translate(" + t + ")scale(" + s + ")");
    d3.selectAll(".boundary").style("stroke-width", 1 / s);
    landings.data(landingData)
    .enter()
    .append('circle')
    .attr('r', 3)
    .attr('fill', 'transparent')
    .attr('stroke', 'black')
    .attr('cx', d => projection(d.geometry.coordinates)[0])
    .attr('cy', d => projection(d.geometry.coordinates)[1])
    mouse = d3.mouse(this);    
    if (s === 1 && mouseClicked) {
      rotateMap(mouse[0]);
      return;
    }
  };


  d3.json("https://unpkg.com/world-atlas@1/world/110m.json", function (error, world) {
    if (error) return console.error(error);

    //countries
    g.append("g")
      .attr("class", "boundary")
      .selectAll("boundary")
      .data(topojson.feature(world, world.objects.countries).features)
      .enter().append("path")
      .attr("d", path);

  });

  const landings_g = svg.append('g');
  let landings = landings_g.selectAll('circle').data(landingData);
  landings = landings.enter()
    .append('circle')
    .attr('r', 3)
    .attr('fill', 'transparent')
    .attr('stroke', 'black')
    .attr('cx', d => projection(d.geometry.coordinates)[0])
    .attr('cy', d => projection(d.geometry.coordinates)[1]);

}

const fetchData = () => {
  return fetch(apiUrl)
    .then(response => {
      return response.json();
    });
};

const fetchAndPlot = async () => {
  try {
    const response = await fetchData();
    plotData(response);
  } catch (e) {
    console.error(e);
  }
}

fetchAndPlot();