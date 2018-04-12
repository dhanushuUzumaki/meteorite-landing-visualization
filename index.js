const apiUrl = 'https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/meteorite-strike-data.json';

const getHTMLData = d => {
  return `
  <div class="data">
    <div class="row"><span class="label">Mass: </span> <span class="value">${d.mass}</span></div>
    <div class="row"><span class="label">Name: </span> <span class="value">${d.name}</span></div>
    <div class="row"><span class="label">Fall: </span> <span class="value">${d.fall}</span></div>
    <div class="row"><span class="label">Name Type: </span> <span class="value">${d.nametype}</span></div>
    <div class="row"><span class="label">Year: </span> <span class="value">${(new Date(d.year).toDateString())}</span></div>
    <div class="row"><span class="label">Rec Class: </span> <span class="value">${d.recclass}</span></div>
  </div>
  `;
}

const div = d3.select("body").append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

const scalesValues = [
  { size: 1, color: '#4CAF50' },
  { size: 2, color: '#009688' },
  { size: 3, color: '#00BCD4' },
  { size: 4, color: '#03A9F4' },
  { size: 5, color: '#2196F3' },
  { size: 6, color: '#3F51B5' },
  { size: 10, color: '#673AB7' },
  { size: 20, color: '#9C27B0' },
  { size: 30, color: '#E91E63' },
  { size: 30, color: '#F44336' }
]
const range = [100, 5000, 10000, 25000, 60000, 100000, 500000, 5000000, 10000000];
const scale = val => {
  let index = range.length - 1;
  for (i = 0, l = range.length; i < l; i++) {
    if (val <= range[i]) {
      index = i;
      break;
    }
  }
  return scalesValues[index];
}

const plotData = data => {
  const landingData = data.features.filter(d => d.geometry !== null && d.properties.mass !== null);
  const margin = {
    top: 20,
    right: 20,
    bottom: 10,
    left: 100
  };
  const width = Math.max((((window.innerWidth / 100) * 80) - margin.right - margin.left), 700);
  const height = ((window.innerHeight / 100) * 80) - margin.bottom - margin.top;
  const projection = d3.geoMercator()
    .scale(140)
    .translate([width / 2, height / 1.5])

  const svg = d3.select('svg')
    .attr('width', width)
    .attr('height', height);
  const path = d3.geoPath()
    .projection(projection);
  const g = svg.append("g");

  const zoom = d3.zoom()
    .scaleExtent([1, 10])
    .on("zoom", function () {
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
      g.attr('transform', `translate(${t})scale(${s})`)
      g.selectAll("circle")
        .attr("d", path.projection(projection));
      g.selectAll("path")
        .attr("d", path.projection(projection));

    });

  d3.json("world-110m2.json", function (error, topology) {
    g.attr('class', 'boundary')
      .selectAll("path")
      .data(topojson.object(topology, topology.objects.countries)
        .geometries)
      .enter()
      .append("path")
      .attr("d", path)

    g.selectAll("circle")
      .data(landingData)
      .enter()
      .append("circle")
      .attr("cx", function (d) {
        return projection(d.geometry.coordinates)[0];
      })
      .attr("cy", function (d) {
        return projection(d.geometry.coordinates)[1];
      })
      .attr("r", d => scale(parseInt(d.properties.mass)).size)
      .style("fill", d => scale(parseInt(d.properties.mass)).color)
      .on('mouseover', d => {
        div.transition()
          .duration(200)
          .style("opacity", .9);
        div.html(getHTMLData(d.properties))
          .style("left", (d3.event.pageX) + "px")
          .style("top", (d3.event.pageY - 28) + "px");
      })
      .on("mouseout", function (d) {
        div.transition()
          .duration(200)
          .style("opacity", 0);
      });
  });

  svg.call(zoom);
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