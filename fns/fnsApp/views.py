from django.shortcuts import render
from django.views import View
from django.http import HttpResponseRedirect
from django.urls import reverse
from django.contrib import messages
from django.db import connection
from django.db import IntegrityError
from django.contrib.auth.models import User
from django.contrib.auth import login, authenticate
from django.contrib.auth import logout
from django.contrib import auth
from django.http import JsonResponse
import json

class FrontPage(View):
    
    def get(self, request):
        productIds = []
        productNames = []
        productPrices = []
        
        search_query = request.GET.get('search', None)
        cursor = connection.cursor()
        
        if(search_query is not None): #if there was a search query
            cursor.execute("SELECT * FROM products where productId LIKE %s OR productName LIKE %s",["%" + search_query + "%", "%" + search_query + "%"])
            rows = cursor.fetchall()
            if cursor.rowcount == 0: #if there were no matches in the DB
                messages.add_message(request, messages.INFO, "Ei hakutuloksia.")
                return HttpResponseRedirect(reverse("FrontPage"))
                
            for row in rows:
                productIds.append(row[0])
                productNames.append(row[1])
                productPrices.append(row[2])
                
            productList = zip(productIds, productNames, productPrices) #zip all data into one list
            return render(request, 'frontPage.html', {'products': productList, 'searchQuery': search_query})
            
        else: #otherwise we show all items
            cursor.execute("SELECT * FROM products ORDER BY productId") #default ordering: by product id
            rows = cursor.fetchall()
            for row in rows:
                productIds.append(row[0])
                productNames.append(row[1])
                productPrices.append(row[2])
                
            productList = zip(productIds, productNames, productPrices)
            return render(request, 'frontPage.html', {'products': productList})
            
    def post(self, request): #the post request updates shopping cart, and sorts the search results
        cursor = connection.cursor()
        if request.is_ajax():
            productIds = []
            productNames = []
            productPrices = []
            name = request.POST["name"]
            
            if (name == "sortByName"):
                jsonList = request.POST["productList"]
                productList = json.loads(jsonList)
                sortedList = sorted(productList, key = lambda k: k["productName"].lower())
                for product in sortedList:
                    productIds.append(product.get("productId"))
                    productNames.append(product.get("productName"))
                    productPrices.append(product.get("productPrice"))
                    
                zippedList = zip(productIds, productNames, productPrices)
                return render(request, 'frontPage.html', {'products': zippedList})
            
            elif (name == "sortByCode"):
                jsonList = request.POST["productList"]
                productList = json.loads(jsonList)
                sortedList = sorted(productList, key = lambda k: int(k["productId"]))
                for product in sortedList:
                    productIds.append(product.get("productId"))
                    productNames.append(product.get("productName"))
                    productPrices.append(product.get("productPrice"))
                zippedList = zip(productIds, productNames, productPrices)
                return render(request, 'frontPage.html', {'products': zippedList})
                
            else: #in this case, we need to handle the adding of a product to a shopping cart
                    product = json.loads(request.POST["product"])
                    productId = product.split(",")[0]
                
                    #select product from database
                    cursor.execute("SELECT * FROM products where productId = %s",[productId])
                    #for example, store here that someone added the product to the cart etc.
                    fetchedProduct = list(cursor.fetchall())
                    return JsonResponse(fetchedProduct, safe=False)

def faq(request):
    return render(request, 'faq.html')
    
def addProducts(request):
    if request.user.is_superuser:
        if request.method == 'POST': #if the admin filled in the fields
            productId = request.POST.get('productCode', '')
            productName = request.POST.get('productName', '')
            productPrice = request.POST.get('productPrice', '')

            cursor = connection.cursor()
            try:
                cursor.execute("INSERT INTO products(productId, productName, productPrice) VALUES(%s, %s, %s)",[productId, productName, productPrice]) #add to DB
            except IntegrityError:
                messages.add_message(request, messages.INFO, "Tuotekoodi on jo tietokannassa. Valitse toinen, uniikki tuotekoodi.")
                return render(request, 'addProducts.html')
                
            messages.add_message(request, messages.INFO, "Tuote on lisätty onnistuneesti tietokantaan.")
            return render(request, 'addProducts.html')
            
        else: #get request
            return render(request, 'addProducts.html')
    else:
        messages.add_message(request, messages.INFO, "Sinun on kirjauduttava sisään, jotta pystyisit lisäämään tuotteita.")
        return HttpResponseRedirect(reverse("FrontPage"))
    
def login_view(request):
        if request.method == 'POST':
            username = request.POST.get('username', '')
            password = request.POST.get('password', '')
            user = auth.authenticate(username=username, password=password)
 
            if user is not None and user.is_active:
                auth.login(request,user)
                messages.add_message(request, messages.INFO, "Olet kirjautunut sisään ylläpitäjänä. Voit nyt lisätä tuotteita tietokantaan.")
                return HttpResponseRedirect(reverse("FrontPage"))
            else:
                messages.add_message(request, messages.INFO, "Väärä käyttäjänimi/salasana.")
        return render(request,"login.html")
        
def logout_view(request):
        logout(request)
        messages.add_message(request, messages.INFO, "Olet kirjautunut ulos.")
        return HttpResponseRedirect(reverse("FrontPage"))