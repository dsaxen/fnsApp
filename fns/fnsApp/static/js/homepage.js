window.onload = function(){
    cartIcon = document.getElementById("shoppingCart");
    cartDiv = document.getElementById("cartDiv");
    cartIcon.onclick = showCart;
    cartIcon.onmouseover = inColor;
    cartIcon.onmouseout = outColor;
    cartDiv.onmouseover = removePointer;

    loadStorage(); //loads the shopping cart local storage
    
    var buttons = document.getElementsByClassName("addButton");
    for(var i = 0; i < buttons.length; i++){
        buttons[i].onclick = addToCart;
    }


    
    $(document).click(function(e) {
        $("#shoppingCart").css('background-color', "#BCF2FF");
        $("#cartDiv").hide();
    });

    $('#cartDiv, #shoppingCart').click(function(e){
        e.stopPropagation();
    });

    if(document.getElementById("nameSortButton") !== null){
        document.getElementById("nameSortButton").onclick = sortByName;
        document.getElementById("codeSortButton").onclick = sortByCode;
    }
    
}
function loadStorage(){
    var cartItems = JSON.parse(localStorage.getItem("cartData"));
    if(cartItems == null){ //if local storage is empty, we end the function execution
        return;
    }

    for (var i = 0; i < cartItems.length; i++){
        var itemId = cartItems[i]["productId"];
        var itemName = cartItems[i]["productName"];
        var itemPrice = cartItems[i]["productPrice"];
        var p = document.getElementById("numberOfItems");
        var text = p.textContent;
        var number = Number(text);
        number++;
        p.innerHTML = number; //add 1 to number when you add products

        var shoppingItems = document.getElementById("shoppingItems");

        var pId = document.createElement("p");
        var pName = document.createElement("p");
        var pPrice = document.createElement("p");
        pId.style.margin = "0px";
        pName.style.margin = "0px";
        pPrice.style.margin = "0px";
        pId.innerHTML = itemId;
        pName.innerHTML = itemName;
        pPrice.innerHTML = itemPrice;

        var div = document.createElement("div"); //create a div for each shopping cart item
        div.style.width = "278px";
        div.style.height = "80px";
        div.style.border = "2px solid black";
        div.style.borderRadius = "5px";
        div.style.marginBottom = "5px";
        div.style.color = "black";
        div.className = "shoppingItem";

        div.appendChild(pId);
        div.appendChild(pName);
        div.appendChild(pPrice);
        shoppingItems.appendChild(div);

    }

}
function saveStorage(){
    var cartItems = [];

    var currentCart = document.getElementsByClassName("shoppingItem");

    for(var i = 0; i <currentCart.length; i++){ //add all cart items to a list
        var cartObject = {};
        cartObject["productId"] = currentCart[i].childNodes[0].innerHTML;
        cartObject["productName"] = currentCart[i].childNodes[1].innerHTML;
        cartObject["productPrice"] = currentCart[i].childNodes[2].innerHTML;

        cartItems.push(cartObject);
    }
    localStorage.setItem("cartData", JSON.stringify(cartItems)); //save to local storage

}
function showCart(){
    document.getElementById("cartDiv").style.display = "block";
    document.getElementById("shoppingCart").style.backgroundColor = "white";
}
function inColor(){
    document.getElementById("shoppingCart").style.backgroundColor = "white";
}
function outColor(){
    document.getElementById("shoppingCart").style.backgroundColor = "#BCF2FF";
}
function removePointer(){
    var shoppingItems = document.getElementById("shoppingItems");
    var shoppingCart = document.getElementById("shoppingCart");
    shoppingItems.style.color = "black";
    cartDiv.style.cursor = "default";
}
function addToCart(){ //TODO: ajax post to update shoppingCart.
    var productId = this.parentNode.childNodes[1].innerHTML;
    var productName = this.parentNode.childNodes[6].innerHTML;
    var productPrice = this.parentNode.childNodes[11].innerHTML;
    var product = productId + "," + productName + "," + productPrice;

    $.ajax({ //send data with ajax to views.py
        url: window.location.pathname,
        method: 'POST',
        data: {
            name: "shoppingCart",
            product: JSON.stringify(product),
            csrfmiddlewaretoken: getCookie('csrftoken'),
        },
        success: function (response) { //response from django DB
            var p = document.getElementById("numberOfItems");
            var text = p.textContent;
            var number = Number(text);
            number++;
            p.innerHTML = number; //add 1 to number when you add products


            var shoppingItems = document.getElementById("shoppingItems");

            var responseId = response.toString().split(",")[0];
            var responseName =  response.toString().split(",")[1];
            var responsePrice =  response.toString().split(",")[2];

            var pResponseId = document.createElement("p");
            var pResponseName = document.createElement("p");
            var pResponsePrice = document.createElement("p");
            pResponseId.style.margin = "0px";
            pResponseName.style.margin = "0px";
            pResponsePrice.style.margin = "0px";
            pResponseId.innerHTML = responseId;
            pResponseName.innerHTML = responseName;
            pResponsePrice.innerHTML = responsePrice;

            var div = document.createElement("div"); //create a div for each shopping cart item
            div.style.width = "278px";
            div.style.height = "80px";
            div.style.border = "2px solid black";
            div.style.borderRadius = "5px";
            div.style.marginBottom = "5px";
            div.style.color = "black";
            div.className = "shoppingItem";

            div.appendChild(pResponseId);
            div.appendChild(pResponseName);
            div.appendChild(pResponsePrice);
            shoppingItems.appendChild(div);
            
            var shoppingCart = document.getElementById("shoppingCart");
            shoppingCart.style.backgroundColor = "white";
            shoppingCart.style.color = "#B6DD73";

            saveStorage(); //save cart to local storage
       }
    });
}
function sortByName(){ //TODO: ajax post to update the order
    products= document.getElementsByClassName("products");
    var productList = [];
    for(var i = 0; i < products.length; i++){
        var product = {productId: products[i].childNodes[1].innerHTML, 
                       productName: products[i].childNodes[6].innerHTML,
                       productPrice: products[i].childNodes[11].innerHTML};
        productList.push(product);
    }
    $.ajax({ //send data with ajax to views.py
        url: window.location.pathname,
        method: 'POST',
        data: {
            name: "sortByName",
            productList: JSON.stringify(productList),
            csrfmiddlewaretoken: getCookie('csrftoken'),
        },
        success: function (response) { //it succeeded
            var element = document.createElement('html');
            element.innerHTML = response;

            products= element.getElementsByClassName("products");

            var productList = [];
            for(var i = 0; i < products.length; i++){
                document.getElementsByClassName("products")[i].childNodes[1].innerHTML = products[i].childNodes[1].innerHTML;
                document.getElementsByClassName("products")[i].childNodes[6].innerHTML = products[i].childNodes[6].innerHTML;
                document.getElementsByClassName("products")[i].childNodes[11].innerHTML = products[i].childNodes[11].innerHTML;
            }

       }
    });
}
function sortByCode(){
    products= document.getElementsByClassName("products");
    var productList = [];
    for(var i = 0; i < products.length; i++){
        var product = {productId: products[i].childNodes[1].innerHTML, 
                       productName: products[i].childNodes[6].innerHTML,
                       productPrice: products[i].childNodes[11].innerHTML};
        productList.push(product);
    }
    $.ajax({ //send data with ajax to views.py
        url: window.location.pathname,
        method: 'POST',
        data: {
            name: "sortByCode",
            productList: JSON.stringify(productList),
            csrfmiddlewaretoken: getCookie('csrftoken'),
        },
        success: function (response) { //it succeeded
            console.log(response);
            var element = document.createElement('html');
            element.innerHTML = response;

            products= element.getElementsByClassName("products");

            var productList = [];
            for(var i = 0; i < products.length; i++){
                document.getElementsByClassName("products")[i].childNodes[1].innerHTML = products[i].childNodes[1].innerHTML;
                document.getElementsByClassName("products")[i].childNodes[6].innerHTML = products[i].childNodes[6].innerHTML;
                document.getElementsByClassName("products")[i].childNodes[11].innerHTML = products[i].childNodes[11].innerHTML;
            }

       }
    });
}
function getCookie(name) { //send CSRF to django
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}