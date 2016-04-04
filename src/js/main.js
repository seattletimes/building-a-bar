// require("./lib/social");
// require("./lib/ads");
// var track = require("./lib/tracking");

require("component-responsive-frame/child");

var $ = require("./lib/qsa");
var dot = require("./lib/dot");
var template = dot.compile(require("./_recipe.html"));

var lookup = {};
var components = {};

var recipeBox = document.querySelector(".recipe-panel");
var navigation = document.querySelector("nav.ingredients");
var drinkList = document.querySelector("ul.recipes");

//build the hash for similarity checking
//also do some basic reformatting
window.recipeData.forEach(function(row) {
  var flags = {};
  row.progression.split("\n").forEach(p => components[p] = flags[p] = true);
  row.progression = flags;
  row.ingredients = row.ingredients.split("\n").filter(i => i);
  lookup[row.drink] = row;
});

var titleCase = function(s) {
  return s.replace(/(^|\s)(\w)/g, (m, _, a) => " " + a.toUpperCase());
};

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

var onCheck = function() {
  //set up next steps
  var labels = $(".drink-label", navigation);
  labels.forEach(l => l.classList.remove("next-step"));

  var required = $(`input[type=checkbox]`, navigation).filter(el => el.checked).map(el => el.id);
  var drinks = window.recipeData.filter(function(recipe) {
    var strikes = [];
    for (var key in recipe.progression) {
      if (required.indexOf(key) == -1) strikes.push(key);
    }
    if (strikes.length == 1) {
      console.log(strikes);
      document.querySelector(`[for="${strikes[0]}"]`).classList.add("next-step");
    }
    return !strikes.length;
  });
  drinkList.innerHTML = drinks.map(function(d) {
    return `
<li>
  <a href="javascript:;" data-recipe="${d.drink}" class="recipe-link">${d.drink}</a>
</li>
    `;
  }).join("\n");
  recipeBox.innerHTML = "";
};
navigation.addEventListener("change", onCheck);
onCheck();

drinkList.addEventListener("click", function(e) {
  console.log(e.target.classList);
  if (e.target.classList.contains("recipe-link")) {
    var recipe = lookup[e.target.getAttribute("data-recipe")];
    console.log(recipe);
    recipeBox.innerHTML = template(recipe);
  }
});