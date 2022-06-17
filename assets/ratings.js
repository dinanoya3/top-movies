const svg = d3.select("svg");

// for difference, can make new attributes on data points
data = data.map((d, i) => {
  d.difference = d.imdb - d.metascore;
  return d;
});

svg.attr("width", "100%").attr("height", 40 * data.length);

const scoreScale = d3.scaleLinear().domain([0, 100]).range([420, 900]);

// area attributes
const area = d3
  .area()
  // imdb line
  .x0((d, i) => {
    return scoreScale(d.imdb);
  })
  //   metascore line
  .x1((d, i) => {
    return scoreScale(d.metascore);
  })
  .y0((d, i) => {
    return 40 * i + 30;
  })
  .y1((d, i) => {
    return 40 * i + 30;
  });

//   area path
const areaPath = svg
  .append("path")
  .datum(data)
  .attr("d", area)
  .attr("class", "area");

//   IMDb line
//   line (describes how it looks)
const imdbLine = d3
  .line()
  // similar to circle
  .x((d, i) => {
    return scoreScale(d.imdb);
  })
  .y((d, i) => {
    return 40 * i + 30;
  });
//   add a curve
//   .curve(d3.curveCardinal.tension(0.25));

//   path is the tag itself
const imdbPath = svg
  .append("path")
  .datum(data)
  .attr("d", imdbLine)
  .attr("class", "imdb");

//   Metascore line
//   line (describes how it looks, attributes)
const metascoreLine = d3
  .line()
  // similar to circle
  .x((d, i) => {
    return scoreScale(d.metascore);
  })
  .y((d, i) => {
    return 40 * i + 30;
  });

//   path is the tag itself, append to svg
const metascorePath = svg
  .append("path")
  //   datum is a single data
  .datum(data)
  .attr("d", metascoreLine)
  .attr("class", "metascore");

//   MOVIE GROUPS
const movieGroups = svg
  .selectAll("g.movie")
  .data(data)
  .enter()
  .append("g")
  .attr("class", "movie")
  .attr("transform", (d, i) => {
    return `translate(0,${i * 40})`;
  });
//   background (rect) groups
movieGroups
  .append("rect")
  .attr("x", 0)
  .attr("y", 10)
  .attr("width", 960)
  .attr("height", "40")
  .attr("class", "background");
// year groups
movieGroups
  .append("text")
  .attr("x", 25)
  .attr("y", 30)
  .attr("class", "year")
  .text((d, i) => {
    return d.year;
  });
// title groups
movieGroups
  .append("text")
  .attr("x", 90)
  .attr("y", 30)
  .attr("class", "title")
  .text((d, i) => {
    return d.title;
  });

// CIRCLES groups
movieGroups
  .append("circle")
  .attr("cx", (d, i) => {
    return scoreScale(d.imdb);
  })

  .attr("cy", 30)
  .attr("r", 8)
  .attr("class", "imdb");
movieGroups
  .append("circle")
  .attr("cx", (d, i) => {
    return scoreScale(d.metascore);
  })

  .attr("cy", 30)
  .attr("r", 8)
  .attr("class", "metascore");

//   SCORE texts
// imdb
movieGroups
  .append("text")
  .attr("x", (d, i) => {
    if (d.difference > 0) {
      return scoreScale(d.imdb) + 15;
    } else {
      return scoreScale(d.imdb) - 15;
    }
  })
  .attr("y", 30)
  .text((d, i) => {
    return d.imdb;
  })
  .attr("class", "imdb")
  .style("text-anchor", (d, i) => {
    if (d.difference > 0) {
      return `start`;
    } else {
      return `end`;
    }
  });

// metascore
movieGroups
  .append("text")
  .attr("x", (d, i) => {
    if (d.difference > 0) {
      return scoreScale(d.metascore) - 15;
    } else {
      return scoreScale(d.metascore) + 15;
    }
  })
  .attr("y", 30)
  .text((d, i) => {
    return d.metascore;
  })
  .attr("class", "metascore")
  .style("text-anchor", (d, i) => {
    if (d.difference > 0) {
      return `end`;
    } else {
      return `start`;
    }
  });

//   on change (select different category), sort data, update data
const selectTag = document.querySelector("select");

selectTag.addEventListener("change", function () {
  data.sort((a, b) => {
    //   'this' refers to selectTag not data (since using arrow function)
    if (this.value === "imdb") {
      return d3.descending(a.imdb, b.imdb);
    } else if (this.value === "year") {
      return d3.descending(a.year, b.year);
    } else if (this.value === "title") {
      return d3.ascending(a.title, b.title);
    } else if (this.value === "difference") {
      return d3.descending(a.difference, b.difference);
    } else {
      // descending values (highest at top)
      return d3.descending(a.metascore, b.metascore);
    }
  });

  // update data, based on changes in data's href (or any unique key) property
  movieGroups
    .data(data, (d, i) => {
      return d.href;
    })
    .transition()
    .duration(700)
    // move groups with newly sorted data
    .attr("transform", (d, i) => {
      return `translate(0,${i * 40})`;
    });

  // update lines
  imdbPath
    //   listen to sorted data
    .datum(data, (d, i) => {
      return d.href;
    })
    .transition()
    .duration(700)
    .attr("d", imdbLine);

  metascorePath
    .datum(data, (d, i) => {
      return d.href;
    })
    .transition()
    .duration(700)
    .attr("d", metascoreLine);

  // update area
  areaPath
    .datum(data, (d, i) => {
      return d.href;
    })
    .transition()
    .duration(700)
    .attr("d", area);
});

// update when width of page changes (responsiveness)
const resize = function () {
  const svgTag = document.querySelector("svg");
  const svgWidth = svgTag.clientWidth;

  scoreScale
    //   percentages of height and width
    .range([(420 / 960) * svgWidth, (900 / 960) * svgWidth]);

  // update cx position of circle.imdb depending on updated scoreScale
  movieGroups.selectAll("circle.imdb").attr("cx", (d, i) => {
    return scoreScale(d.imdb);
  });
  //   update cx position of circle.metascore
  movieGroups.selectAll("circle.metascore").attr("cx", (d, i) => {
    return scoreScale(d.metascore);
  });

  //   update gap between year and title
  movieGroups.selectAll("text.title").attr("x", svgWidth >= 960 ? 90 : 70);

  //   update lines position
  //   imdb
  imdbLine.x((d, i) => {
    return scoreScale(d.imdb);
  });
  imdbPath.attr("d", imdbLine);
  //   metascore
  metascoreLine.x((d, i) => {
    return scoreScale(d.metascore);
  });
  metascorePath.attr("d", metascoreLine);

  //   update score texts
  //   imdb
  movieGroups.selectAll("text.imdb").attr("x", (d, i) => {
    if (d.difference > 0) {
      return scoreScale(d.imdb) + 15;
    } else {
      return scoreScale(d.imdb) - 15;
    }
  });
  //   metascore
  movieGroups.selectAll("text.metascore").attr("x", (d, i) => {
    if (d.difference > 0) {
      return scoreScale(d.metascore) - 15;
    } else {
      return scoreScale(d.metascore) + 15;
    }
  });
};

// run on page load
resize();

window.addEventListener("resize", function () {
  resize();
});
