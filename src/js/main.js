// require("./lib/social");
// require("./lib/ads");
// var track = require("./lib/tracking");

require("component-responsive-frame/child");
var dot = require("./lib/dot");
var template = dot.compile(require("./_recipe.html"));

var stack = [];
var lookup = {};
var current = null;

//build the hash for similarity checking
//also do some basic reformatting
window.recipeData.forEach(function(row) {
  var flags = {};
  row.progression.split("\n").forEach(p => flags[p] = true);
  row.progression = flags;
  row.ingredients = row.ingredients.split("\n").filter(i => i);
  lookup[row.drink] = row;
});

//compute ingredients needed to get from a to b
var findDistance = function(a, b) {
  var distance = 0;
  var additions = [];
  for (var k in b) {
    if (!(k in a)) {
      distance++;
      additions.push(k);
    }
  }
  return { distance, additions }
};

//now build a series of distance arrays - sadly n^2
window.recipeData.forEach(function(row) {
  row.builds = {};
  window.recipeData.forEach(function(compare) {
    if (compare == row) return;
    var { distance, additions } = findDistance(row.progression, compare.progression);
    if (!row.builds[distance]) row.builds[distance] = [];
    row.builds[distance].push({ recipe: compare, additions });
  });
});

var container = document.querySelector(".drink-guide");
container.addEventListener("click", function(e) {
  var target = e.target;
  if (e.target.classList.contains("push-stack")) {
    var previous = current;
    if (current) stack.push(current);
    var id = e.target.getAttribute("data-drink");
    var drink = lookup[id];
    current = drink;
    container.innerHTML = template({ back: previous, recipe: current });
  }
  if (e.target.classList.contains("pop-stack")) {
    current = stack.pop();
    var previous = stack[stack.length - 1];
    container.innerHTML = template({ back: previous, recipe: current });
  }
});