const apiUrl = 'https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/meteorite-strike-data.json';
function isPointInPoly(poly, pt){
  console.log(poly, pt);
  for(var c = false, i = -1, l = poly.length, j = l - 1; ++i < l; j = i)
      ((poly[i].y <= pt.y && pt.y < poly[j].y) || (poly[j].y <= pt.y && pt.y < poly[i].y))
      && (pt.x < (poly[j].x - poly[i].x) * (pt.y - poly[i].y) / (poly[j].y - poly[i].y) + poly[i].x)
      && (c = !c);
  return c;
}
const plotData = data => {
  const landingData = data.features.filter(d => d.geometry !== null);
  const margin = {
    top: 20,
    right: 20,
    bottom: 10,
    left: 100
  };
  const width = Math.max((((window.innerWidth / 100) * 90) - margin.right - margin.left), 700);
  const height = ((window.innerHeight / 100) * 90) - margin.bottom - margin.top;
  let centered = null,
      clickedPoint;
  const projection = d3.geoMercator()
    .translate([width / 2.2, height / 1.5]);
  const planePath = d3.geoPath().projection(projection);
  const svg = d3.select('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('class', 'map');
  const mapG = svg.append('g').attr('class', 'boundary').on('click', () => console.log('clicked'));
  const path = d3.geoPath().projection(projection);

  const clicked = d => {
    let x, y, k;
    if (d && d !== centered) {
      const centeroid = path.centroid(d);
      const bounds = path.bounds(d);
      const dx = bounds[1][0] - bounds[0][0];
      const dy = bounds[1][1] - bounds[0][1];
      x = (bounds[0][0] + bounds[1][0]) / 2;
      y = (bounds[0][1] + bounds[1][1]) / 2;
      k = Math.min(width / dx, height / dy);
      centered = d;
    } else {
      x = width / 2;
      y = height / 2;
      k = 1;
      centered = null;
    }
    mapG.selectAll("path")
      .classed("active", d => centered && d === centered);
    if (centered !== null) {
      mapG.selectAll("path")
        .style("stroke-width", (0.75 / k) + "px");
    }

    mapG.transition()
      .duration(750)
      .attr('transform', `translate(${width / 2}, ${height / 2})scale(${k})translate(${-x}, ${-y})`)
      .on('end', () => {
        if (centered === null) {
          mapG.selectAll("path")
            .style("stroke-width", (0.75 / k) + "px");
        }
      });
    let data;
    mapG.selectAll('.landings').remove();
    if (centered === null) {
      data = landingData;
    } else {
      data = landingData.filter(p => d3.polygonContains(...d.geometry.coordinates, p.geometry.coordinates));    
    }
    mapG.selectAll('.landings')
        .data(data)
        .enter()
        .append('circle')
        .attr('class', 'landings')
        .attr('r', 3)
        .attr('fill', 'transparent')
        .attr('stroke', 'black')
        .attr('cx', d => projection(d.geometry.coordinates)[0])
        .attr('cy', d => projection(d.geometry.coordinates)[1]);
  };


  d3.json('https://unpkg.com/world-atlas@1/world/110m.json', (error, topology) => {
    mapG.selectAll('path')
      .data(topojson.feature(topology, topology.objects.countries)
        .features)
      .enter()
      .append('path')
      .attr('d', path)
      .on('click', clicked);

      mapG.selectAll('.landings')
      .data(landingData)
      .enter()
      .append('circle')
      .attr('class', 'landings')
      .attr('r', 3)
      .attr('fill', 'transparent')
      .attr('stroke', 'black')
      .attr('cx', d => projection(d.geometry.coordinates)[0])
      .attr('cy', d => projection(d.geometry.coordinates)[1]);      
  });

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