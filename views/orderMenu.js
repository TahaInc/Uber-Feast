let xhttp = new XMLHttpRequest();
let restaurants, restaurantInfo;
let total,
  subtotal,
  deliveryFee,
  tax = 0;
let targetChange; // Variable to keep track of the target restaurant, when prompting for confirmation for change of restaurant
let orderList = []; // Order cart
let canCollapse, // Variable to determine if we should be able to collapse the restaurant menu
  mouseOverRestoList, // Variable to see if mouse is over the restaurant menu
  delayAnimations = false; // Variable to have delay with animations to allow other animations to fade out (false only for first time)

xhttp.onload = function () {
  if (this.status == 200) {
    restaurants = JSON.parse(xhttp.responseText);

    restaurants.forEach((resto) => {
      console.log(resto);
      // For each restaurant, duplicate a button element
      let button = document.getElementsByClassName("resto_button")[0].cloneNode(true);

      // For each button, change the text to the appropriate text
      button.classList.remove("hidden");
      button.childNodes[1].innerText = resto.name;
      button.childNodes[3].innerText = Object.values(resto.menu).reduce((total, category) => total + Object.values(category).length, 0) + " available items";

      // Append to the div
      document.getElementById("resto_list").appendChild(button);
    });

    document.getElementById("resto_list").style.gridTemplateRows = "repeat(" + restaurants.length + ", 100px)"; // The grid adjusts for the amount of restaurant buttons
    document.getElementById("select_resto_text").style.top = "min(calc(85px + " + restaurants.length / 2 + "*90px), 50%)"; // The "pick a restaurant" text adjust to be in the middle of selections (which depends on the number of restaurants)
  }
};

xhttp.open("GET", "../restaurants", true);
xhttp.send();

// Function to attempt a change in restaurant. This function will not actually change the restaurant, only shows the prompt or call the appropriate change function
function preselectResto(btn) {
  targetChange = btn;
  if (!btn.classList.contains("resto_button_selected")) {
    if (orderList.length > 0) {
      // If items in order cart, show popup
      canCollapse = false;
      document.getElementById("prompt").classList.add("fadeIn");
      document.getElementById("prompt_bg").classList.add("fadeIn");
      document.getElementById("prompt_message").innerHTML = "Are you sure you want to switch to <b>" + btn.childNodes[1].innerText + "</b>";
      document.getElementById("prompt_submessage").innerText = "This will wipe your current order";
      document.getElementById("prompt_change_resto_options").classList.remove("hidden");
      document.getElementById("prompt_dismiss_options").classList.add("hidden");
    } else {
      // Otherwise, just change restaurants
      document.getElementById("resto_info").classList.add("fadeIn");
      document.getElementById("order").classList.add("fadeIn");
      document.getElementById("select_resto_text").classList.add("fadeOut");
      changeResto();
    }
  }
}

// Function to change restaurants, and update the menu, clear cart, etc
function changeResto() {
  restaurantInfo = restaurants.filter((resto) => targetChange.childNodes[1].innerText == resto.name)[0];

  // Update the buttons css to reflect the selection
  document.getElementsByClassName("resto_button_selected").length > 0 ? document.getElementsByClassName("resto_button_selected")[0].classList.remove("resto_button_selected") : "";
  targetChange.classList.add("resto_button_selected");

  // Find the selected restaurant and its information, and update the top info bar
  document.getElementById("resto_info").classList.remove("fadeIn");
  setTimeout(
    function () {
      document.getElementById("resto_info_name").innerText = restaurantInfo.name;
      document.getElementById("resto_info_delivery").innerText = restaurantInfo.delivery_fee.toLocaleString("en-CA", { style: "currency", currency: "CAD" }) + " delivery fee";
      document.getElementById("resto_info_minimum").innerText = restaurantInfo.min_order.toLocaleString("en-CA", { style: "currency", currency: "CAD" }) + " minimum order";
      document.getElementById("resto_info").classList.add("fadeIn");
    },
    delayAnimations ? 300 : 0
  );

  // Fade out the prompt
  document.getElementById("prompt").classList.remove("fadeIn");
  document.getElementById("prompt_bg").classList.remove("fadeIn");

  // Allow the drop down menu to be collapsable
  canCollapse = true;
  document.getElementById("sidebar").classList.add("collapse");
  document.getElementById("resto_list").classList.add("collapse");

  if (restaurantInfo.name.split(" ").length > 1) {
    document.getElementById("select_resto").style.lineHeight = "40px";
    document.getElementById("select_resto").innerHTML = restaurantInfo.name.split(" ")[0] + "<br><span id='select_resto_subtext'>" + restaurantInfo.name.split(" ").slice(1).join(" ") + "</span>";
  } else {
    document.getElementById("select_resto").style.lineHeight = "60px";
    document.getElementById("select_resto").innerHTML = restaurantInfo.name;
  }

  document.getElementById("select_resto").classList.add("fadeIn");

  // For each category, create a category button
  document.getElementById("menu_categories").classList.remove("fadeIn");
  setTimeout(
    function () {
      document.getElementById("menu_categories").classList.add("fadeIn");
      document.getElementById("menu_categories").innerHTML = "";
      Object.keys(restaurantInfo.menu).forEach((category) => {
        // For each category, duplicate a button element
        let button = document.getElementsByClassName("category_button")[0].cloneNode(true);

        // For each button, change the text to the appropriate text
        button.classList.remove("hidden");
        button.childNodes[1].innerText = category;

        // Append to the div
        document.getElementById("menu_categories").appendChild(button);
      });
    },
    delayAnimations ? 300 : 0
  );

  let animationIncrement = 0; // Animation increment
  let menu = document.getElementById("resto_menu");

  // Fade out the previous elements
  Object.values(document.querySelectorAll(".menu_button:not(.hidden)")).forEach((item) => {
    setTimeout(function () {
      item.style.opacity = 0;
    }, animationIncrement++ * 20);
  });

  // For each item inside each category, create a menu item, which is created in a seperate function (and make time for the fade out animation to complete)
  setTimeout(
    function () {
      menu.innerHTML = "";
      Object.values(restaurantInfo.menu).forEach((category) => {
        Object.values(category).forEach((item) => {
          addMenuItem(item);
        });
      });
    },
    delayAnimations ? Math.min((menu.offsetHeight / 85) * 20, ++animationIncrement * 21) + (menu.scrollTop / 85) * 20 : 0 // If theres a fade out animation, then delay this animation to allow for the fade out to complete
  );

  // Clear the cart and hide the cost detail interface.
  orderList = [];
  document.getElementById("order_summary").innerText = "";
  document.getElementById("order_detail").classList.remove("fadeIn");

  delayAnimations = true; // After first animation, make them have delays to have time for fade out animations
}

// Function to select a category and filter the menu accordingly.
function selectCategory(btn) {
  let animationIncrement = 0; // Animation increment
  let menu = document.getElementById("resto_menu");

  if (btn.classList.contains("category_button_selected")) {
    // If the clicked button is already selected, uncheck it
    btn.classList.remove("category_button_selected");

    // Fade out the previous elements
    Object.values(document.querySelectorAll(".menu_button:not(.hidden)")).forEach((item) => {
      setTimeout(function () {
        item.style.opacity = 0;
      }, animationIncrement++ * 20);
    });

    // Remove and readd the whole menu
    setTimeout(function () {
      menu.innerHTML = "";
      Object.values(restaurantInfo.menu).forEach((category) => {
        Object.values(category).forEach((item) => {
          addMenuItem(item);
        });
      });
    }, Math.min((menu.offsetHeight / 85) * 20, ++animationIncrement * 21) + (menu.scrollTop / 85) * 20);
  } else {
    // If clicked button is unselected, unselect the old one and select the new one.
    document.getElementsByClassName("category_button_selected").length > 0 ? document.getElementsByClassName("category_button_selected")[0].classList.remove("category_button_selected") : "";
    btn.classList.add("category_button_selected");

    // Fade out the previous elements
    Object.values(document.querySelectorAll(".menu_button:not(.hidden)")).forEach((item) => {
      setTimeout(function () {
        item.style.opacity = 0;
      }, animationIncrement++ * 20);
    });

    // Remove and readd only the menu items that fit the category.
    setTimeout(function () {
      menu.innerHTML = "";
      Object.entries(restaurantInfo.menu).forEach((category) => {
        if (category[0] == btn.childNodes[1].innerText) {
          Object.values(category[1]).forEach((item) => {
            addMenuItem(item);
          });
        }
      });
    }, Math.min((menu.offsetHeight / 85) * 20, ++animationIncrement * 21) + (menu.scrollTop / 85) * 20);
  }
}

function addMenuItem(item) {
  // For each category, duplicate a menu item element
  let menuItem = document.getElementsByClassName("menu_button")[0].cloneNode(true);

  // For each item element, change the text to the appropriate text
  menuItem.classList.remove("hidden");
  menuItem.childNodes[1].childNodes[1].innerText = item.name.includes("with") ? item.name.split("with")[0] : item.name;
  menuItem.childNodes[1].childNodes[3].innerText = item.name.includes("with") ? " with " + item.name.split("with")[1] : "";
  menuItem.childNodes[1].childNodes[5].innerText = item.description;
  menuItem.childNodes[3].childNodes[1].innerText = item.price.toLocaleString("en-CA", { style: "currency", currency: "CAD" });
  menuItem.childNodes[5].childNodes[1].setAttribute("data-item", item.name);
  menuItem.childNodes[5].childNodes[1].setAttribute("data-price", item.price);

  // Fade in animation
  setTimeout(function () {
    menuItem.style.opacity = 1;
  }, 200 + document.getElementById("resto_menu").childElementCount * 20);

  // Append to the div
  document.getElementById("resto_menu").appendChild(menuItem);
}

// Function to add item to cart
function addItem(btn) {
  if (orderList.length == 0) {
    // Fade in the price calculation details if it's the first item in the order summary
    document.getElementById("order_detail").classList.add("fadeIn");
  }

  // Get the item from the javascript object based off the name (which is store in a data-item attribute)
  let item = orderList.filter((item) => item.name == btn.getAttribute("data-item"));
  if (item.length > 0) {
    // If item already exists in the order summary, update the quantity and price
    document.getElementById(item[0].name).childNodes[1].childNodes[5].innerHTML = parseFloat(btn.getAttribute("data-price")).toLocaleString("en-CA", { style: "currency", currency: "CAD" }) + "&emsp;Qty: " + ++item[0].quantity;
    document.getElementById(item[0].name).childNodes[3].childNodes[1].innerText = (parseFloat(btn.getAttribute("data-price")) * item[0].quantity).toLocaleString("en-CA", { style: "currency", currency: "CAD" });
    document.getElementById(item[0].name).childNodes[5].childNodes[1].innerHTML = "<h1>−</h1>";
  } else {
    // Otherwise, create a new item element and add to the array
    orderList.push({ name: btn.getAttribute("data-item"), price: parseFloat(btn.getAttribute("data-price")), quantity: 1 });

    let orderItem = document.getElementsByClassName("order_item")[0].cloneNode(true);

    // For each item element, change the text to the appropriate text
    orderItem.classList.remove("hidden");
    orderItem.setAttribute("id", btn.getAttribute("data-item"));
    orderItem.childNodes[1].childNodes[1].innerText = btn.getAttribute("data-item").includes("with") ? btn.getAttribute("data-item").split("with")[0] : btn.getAttribute("data-item");
    orderItem.childNodes[1].childNodes[3].innerText = btn.getAttribute("data-item").includes("with") ? " with " + btn.getAttribute("data-item").split("with")[1] : "";
    orderItem.childNodes[1].childNodes[5].innerHTML = parseFloat(btn.getAttribute("data-price")).toLocaleString("en-CA", { style: "currency", currency: "CAD" }) + "&emsp;Qty: " + 1;
    orderItem.childNodes[3].childNodes[1].innerText = parseFloat(btn.getAttribute("data-price")).toLocaleString("en-CA", { style: "currency", currency: "CAD" });
    orderItem.childNodes[5].childNodes[1].setAttribute("data-item", btn.getAttribute("data-item"));
    orderItem.childNodes[5].childNodes[1].setAttribute("data-price", btn.getAttribute("data-price"));
    orderItem.childNodes[5].childNodes[1].innerHTML = "<h1>×</h1>";

    // Append to the div and update the grid layout
    document.getElementById("order_summary").style.gridTemplateRows = "repeat(" + orderList.length + ", 90px)";
    document.getElementById("order_summary").appendChild(orderItem);
  }

  updateTotal(); // Update the price calculation text
}

function removeItem(btn) {
  let item = orderList.filter((item) => item.name == btn.getAttribute("data-item"));
  if (item[0].quantity == 1) {
    // If trying to remove item with 1 quantity, remove the element from the order summary and array, and update the grid layout
    document.getElementById(item[0].name).remove();
    orderList.splice(orderList.indexOf(item[0]), 1);
    document.getElementById("order_summary").style.gridTemplateRows = "repeat(" + orderList.length + ", 90px)";
  } else {
    // If item already exists in the order summary, update the quantity and price
    document.getElementById(item[0].name).childNodes[1].childNodes[5].innerHTML = parseFloat(btn.getAttribute("data-price")).toLocaleString("en-CA", { style: "currency", currency: "CAD" }) + "&emsp;Qty: " + --item[0].quantity;
    document.getElementById(item[0].name).childNodes[3].childNodes[1].innerText = (parseFloat(btn.getAttribute("data-price")) * item[0].quantity).toLocaleString("en-CA", { style: "currency", currency: "CAD" });

    if (item[0].quantity == 1) {
      // If only 1 quantity, the reduce quantity button reflects a more appropriate icon (since the item element will be removed if quantity is reduced again)
      btn.innerHTML = "<h1>×</h1>";
    }
  }

  if (orderList.length == 0) {
    // Fade out the price calculation details if no more items are in the order summary
    document.getElementById("order_detail").classList.remove("fadeIn");
  } else {
    updateTotal(); // Update the price calculation text
  }
}

// Function to update the price calculation text
function updateTotal() {
  // Update the prices in variables
  subtotal = orderList.reduce((sum, item) => sum + item.price * item.quantity, 0);
  deliveryFee = restaurantInfo.delivery_fee;
  tax = (subtotal + deliveryFee) * 0.1;

  total = subtotal + deliveryFee + tax;

  // Update the prices in the shown text
  document.getElementById("order_detail_texts").childNodes[3].innerHTML = "<h2 class='order_detail_text'>Subtotal:</h2> <h2 class='order_detail_text'>Delivery fee:</h2> <h2 class='order_detail_text'>Tax:</h2> <h2 class='order_detail_text'><b>Total:</b></h2>";
  document.getElementById("order_detail_texts").childNodes[5].innerHTML = "<h2 class='order_detail_number'>" + subtotal.toLocaleString("en-CA", { style: "currency", currency: "CAD" }) + "</h2> <h2 class='order_detail_number'>" + deliveryFee.toLocaleString("en-CA", { style: "currency", currency: "CAD" }) + "</h2> <h2 class='order_detail_number'>" + tax.toLocaleString("en-CA", { style: "currency", currency: "CAD" }) + "</h2> <h2 class='order_detail_number'><b>" + total.toLocaleString("en-CA", { style: "currency", currency: "CAD" }) + "</b></h2>";

  if (restaurantInfo.min_order > subtotal) {
    // If subtotal is under the minimum order, tell the user the missing amount
    document.getElementById("order_detail_error").classList.add("fadeIn");
    document.getElementById("order_detail_submit").classList.remove("fadeIn");
    document.getElementById("order_detail_error").innerHTML = "You need to add " + (restaurantInfo.min_order - subtotal).toLocaleString("en-CA", { style: "currency", currency: "CAD" }) + " to cart before you can order";
  } else {
    // Otherwise, show the order button
    document.getElementById("order_detail_error").classList.remove("fadeIn");
    document.getElementById("order_detail_submit").classList.add("fadeIn");
  }
}

// Function Reset the page and display alert
function submitOrder() {
  xhttp.onload = function () {
    if (this.status == 200) {
      // Display confirmation alert
      document.getElementById("prompt").classList.add("fadeIn");
      document.getElementById("prompt_bg").classList.add("fadeIn");
      document.getElementById("prompt_message").innerHTML = "Your order is confirmed!";
      document.getElementById("prompt_submessage").innerText = "Your food will be delivered within 45 minutes.";
      document.getElementById("prompt_change_resto_options").classList.add("hidden");
      document.getElementById("prompt_dismiss_options").classList.remove("hidden");

      // Reset everything to default state.
      // Reset the cart and hide the cost detail interface.
      orderList = [];
      document.getElementById("order_summary").innerText = "";
      document.getElementById("order_detail").classList.remove("fadeIn");

      let animationIncrement = 0;
      let menu = document.getElementById("resto_menu");

      // Collapse the side menu.
      expandMenu();
      canCollapse = false;

      // Fade out all elements.
      document.getElementById("resto_info").classList.remove("fadeIn");
      document.getElementById("order").classList.remove("fadeIn");
      document.getElementById("select_resto_text").classList.remove("fadeOut");
      document.getElementById("menu_categories").classList.remove("fadeIn");
      document.getElementsByClassName("resto_button_selected")[0].classList.remove("resto_button_selected");

      // Animations to fade out the menu items.
      Object.values(document.querySelectorAll(".menu_button:not(.hidden)")).forEach((item) => {
        setTimeout(function () {
          item.style.opacity = 0;
        }, animationIncrement++ * 20);
      });

      // Empty the menu div after the animation
      setTimeout(function () {
        menu.innerHTML = "";
      }, Math.min((menu.offsetHeight / 85) * 20, ++animationIncrement * 21) + (menu.scrollTop / 85) * 20);
    }
  };

  xhttp.open("POST", "../orders", true);
  xhttp.setRequestHeader("Content-Type", "application/json");
  xhttp.send(JSON.stringify({ restaurantID: restaurantInfo.id, restaurantName: restaurantInfo.name, subtotal: subtotal, deliveryFee: deliveryFee, tax: tax, total: total, order: orderList })); // Send the resaurant name, total and purchased items to the server.
}

// Function to cancel the attempt to change restaurant.
function dismissPrompt(preventCollapse = false) {
  // Fade out the prompt
  document.getElementById("prompt").classList.remove("fadeIn");
  document.getElementById("prompt_bg").classList.remove("fadeIn");

  // Collapse the drop down menu \
  collapseMenu(preventCollapse);
}

// Function to expand the drop down menu.
function expandMenu() {
  mouseOverRestoList = true;
  document.getElementById("sidebar").classList.remove("collapse");
  document.getElementById("select_resto").classList.remove("fadeIn");
  setTimeout(function () {
    document.getElementById("resto_list").classList.remove("collapse");
  }, 200);
}

// Function to collapse the drop down menu.
function collapseMenu(preventCollapse = false) {
  mouseOverRestoList = false;
  if (canCollapse && !preventCollapse) {
    // If can collapse, start a timer
    setTimeout(function () {
      if (!mouseOverRestoList) {
        // Only collapse if mouse still isn't over the list after the timeout (so we know it's not an accidental exit or quick jitter of the mouse).
        document.getElementById("select_resto").classList.add("fadeIn");
        document.getElementById("sidebar").classList.add("collapse");
        document.getElementById("resto_list").classList.add("collapse");
      }
    }, 400);
  }
}
