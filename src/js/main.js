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
var navigation = document.querySelector("ul.components");
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

//listener for checkbox toggles
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
    //indicate near-misses
    if (strikes.length == 1) {
      document.querySelector(`[for="${strikes[0]}"]`).classList.add("next-step");
    }
    return !strikes.length;
  });
  drinkList.innerHTML = `<li class="instruction">You can make:` + drinks.map(function(d) {
    return `
<li>
  <a data-recipe="${d.drink}" class="recipe-link ${d.image ? "media" : "" }">
    ${d.drink}
  </a>
</li>`;
  }).join("\n");
  recipeBox.innerHTML = "";
  recipeBox.classList.add("empty");
};
navigation.addEventListener("change", onCheck);
onCheck();

//listen for clicks on recipe names
drinkList.addEventListener("click", function(e) {
  if (e.target.classList.contains("recipe-link")) {
    $(".recipe-link.selected").forEach(el => el.classList.remove("selected"));
    e.target.classList.add("selected");
    var recipe = lookup[e.target.getAttribute("data-recipe")];
    recipeBox.innerHTML = template(recipe);
    recipeBox.classList.remove("empty");
  }
});