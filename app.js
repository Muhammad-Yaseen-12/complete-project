import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { getFirestore, collection, addDoc, setDoc, doc, getDoc, getDocs, deleteDoc, updateDoc } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDCAfEiBW9Cuy0w6mbZd1hzMmk36Ad1I9Q",
    authDomain: "foodpanda-c5cb3.firebaseapp.com",
    projectId: "foodpanda-c5cb3",
    storageBucket: "foodpanda-c5cb3.firebasestorage.app",
    messagingSenderId: "548497614590",
    appId: "1:548497614590:web:de0bf27ae06e229f40e7af",
    measurementId: "G-CK5GHKDXSS"
};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);


let signupBtn = document.querySelector(".signup-btn")
if (signupBtn) {

    signupBtn.addEventListener("click", async () => {
        let accountType = document.querySelector("#account-type");
        let name = document.querySelector("#name");
        let email = document.querySelector("#email");
        let phone = document.querySelector("#phone");
        let password = document.querySelector("#password");
        let restaurantName = document.querySelector("#restaurant-name");

        if (!accountType.value || !name.value || !email.value || !phone.value || !password.value || (accountType.value === "restaurant" && !restaurantName.value)) {
            Swal.fire({
                icon: "warning",
                title: "Missing Fields",
                text: "Please fill all the required fields."
            });

            accountType.value = "";
            name.value = "";
            email.value = "";
            phone.value = "";
            password.value = "";
            restaurantName.value = "";


            return;
        }

        try {

            const userCredential = await createUserWithEmailAndPassword(auth, email.value, password.value);
            const user = userCredential.user;
            console.log(user.uid);



            let collectionName = accountType.value === "restaurant" ? "restaurants" : "users";


            let userData = {
                uid: user.uid,
                name: name.value,
                email: email.value,
                phone: phone.value,
                accountType: accountType.value,
                password: password.value,
                createdAt: new Date()
            };

            if (accountType.value === "restaurant") {
                userData.restaurantName = restaurantName.value;
            }

            await setDoc(doc(db, collectionName, user.uid), userData);


            // console.log(`Signup successful for ${accountType.value}!`);
            Swal.fire({
                title: "Sign Up Success",
                text: "Redirecting to login...",
                icon: "success"
            }).then(() => {
                window.location.href = "./login.html";
            });

        } catch (error) {
            accountType.value = "";
            name.value = "";
            email.value = "";
            phone.value = "";
            password.value = "";
            restaurantName.value = "";

            Swal.fire({
                icon: "error",
                title: "Error",
                text: error.message
            });


        }
    });

}





// login function
let loginBtn = document.querySelector(".login-btn")
if (loginBtn) {
    loginBtn.addEventListener("click", async () => {

        let loginEmail = document.getElementById("login-email").value;
        let loginPassword = document.getElementById("login-password").value;

        if (!loginEmail || !loginPassword) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Please fill all the fields"
            });
            document.getElementById("login-email").value = ""
            document.getElementById("login-password").value = ""

            return;
        }

        try {
            // Firebase auth se sign in karo
            const userCredential = await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
            const user = userCredential.user;

            // user.uid se Firestore se data lao
            // Pehle users collection check karo
            let userDocRef = doc(db, "users", user.uid);
            let userDocSnap = await getDoc(userDocRef);

            let accountType = null;
            let userData = null;

            if (userDocSnap.exists()) {
                userData = userDocSnap.data();
                accountType = userData.accountType;
            } else {
                // Agar users collection me nahi mila to restaurants me try karo
                userDocRef = doc(db, "restaurants", user.uid);
                userDocSnap = await getDoc(userDocRef);

                if (userDocSnap.exists()) {
                    userData = userDocSnap.data();
                    accountType = userData.accountType;
                } else {

                    document.getElementById("login-email").value = ""
                    document.getElementById("login-password").value = ""
                    Swal.fire({
                        icon: "error",
                        title: "Error",
                        text: "User data not found in Firestore"
                    });
                    return;
                }
            }



            Swal.fire({
                icon: "success",
                title: "Login Success",
                text: `Welcome ${userData.name}, redirecting to your dashboard...`
            }).then(() => {
                if (accountType === "restaurant") {
                    window.location.href = "./restaurant.html";
                } else if (accountType === "user") {
                    window.location.href = "./user.html";
                } else {
                    // Agar kuch aur type hai
                    window.location.href = "./login.html";
                }
            });
            document.getElementById("login-email").value = ""
            document.getElementById("login-password").value = ""

        } catch (error) {

            document.getElementById("login-email").value = ""
            document.getElementById("login-password").value = ""
            Swal.fire({
                icon: "error",
                title: "Login Failed",
                text: error.message
            });
        }
    })
}


// add product
let editId = null;
let addProductBtn = document.querySelector(".add-product-btn");

if (addProductBtn) {
    addProductBtn.addEventListener("click", async () => {

        // let productName = document.getElementById("productName");
        // let productPrice = document.getElementById("productPrice");
        // let productDescription = document.getElementById("productDescription");
        // let productImage = document.getElementById("productImage");

        // if (!productName.value || !productPrice.value || !productDescription.value || !productImage.value) {
        //     Swal.fire({
        //         icon: "warning",
        //         title: "Missing Fields",
        //         text: "Please fill all the required fields."
        //     });
        //     resetForm()
        //     return;
        // }

        onAuthStateChanged(auth, async (user) => {
            if (user) {

                console.log(user);
                const querySnapshot = await getDocs(collection(db, "restaurants"));

                for (const docSnap of querySnapshot.docs) {
                    if (docSnap.data().uid == user.uid) {
                        // console.log(doc.data());

                        if (docSnap.data().accountType === "restaurant") {
                            if (editId) {
                                // Update existing product
                                try {
                                    const cityRef = doc(db, 'restaurantsProducts', editId);
                                    await updateDoc(cityRef, {
                                        productName: productName.value,
                                        price: productPrice.value,
                                        description: productDescription.value,
                                        image: productImage.value,
                                    });

                                    Swal.fire({
                                        icon: "success",
                                        title: "Product Updated",
                                        text: "Your product has been successfully updated!"
                                    });

                                    renderRestaurantProducts();
                                    resetForm();
                                    editId = null;
                                    addProductBtn.innerHTML = "Add Product";
                                    return;
                                } catch (e) {
                                    resetForm()
                                    console.error("Error updating document: ", e);
                                    Swal.fire({
                                        icon: "error",
                                        title: "Update Failed",
                                        text: e.message
                                    });
                                    return;
                                }
                            }

                            // Add new product
                            try {

                                const restaurantsRef = collection(db, "restaurants");
                                const querySnapshot = await getDocs(restaurantsRef);

                                let restaurantName = "";
                                querySnapshot.forEach(doc => {
                                    let data = doc.data();
                                    // console.log(data.uid);

                                    if (data.uid === user.uid) {
                                        restaurantName = data.restaurantName;
                                        // console.log(restaurantName);

                                    }

                                });


                                const docRef = await addDoc(collection(db, "restaurantsProducts"), {
                                    productName: productName.value,
                                    price: productPrice.value,
                                    description: productDescription.value,
                                    image: productImage.value,
                                    restaurantOwnerId: user.uid,
                                    restaurantOwnerEmail: user.email,
                                    restaurantName,


                                    // productId:docRef.id
                                });

                                await updateDoc(doc(db, "restaurantsProducts", docRef.id), {
                                    productId: docRef.id
                                });


                                Swal.fire({
                                    icon: "success",
                                    title: "Product Added",
                                    text: "Your product has been successfully added!"
                                });

                                renderRestaurantProducts();
                                resetForm();
                            } catch (e) {
                                resetForm()
                                console.error("Error adding document: ", e);
                                Swal.fire({
                                    icon: "error",
                                    title: "Add Failed",
                                    text: e.message
                                });
                            }
                        }

                    } else {
                        Swal.fire({
                            icon: "error",
                            title: "Add Failed",
                        }).then((result) => {
                            if (result.isConfirmed) {
                                window.location.href = './restaurant.html';
                            }

                        })

                    }
                }
                // console.log(doc.data());






            }
        });
    });
}

// Function to reset form fields
function resetForm() {
    document.getElementById("productName").value = "";
    document.getElementById("productPrice").value = "";
    document.getElementById("productDescription").value = "";
    document.getElementById("productImage").value = "";
}


// renderRestaurantProducts
window.renderRestaurantProducts = async () => {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            let productsGrid = document.getElementById("productsGrid");
            productsGrid.innerHTML = "";

            const querySnapshot = await getDocs(collection(db, "restaurantsProducts"));

            let products = [];

            querySnapshot.forEach((docSnap) => {
                let data = docSnap.data();
                // let productId=docSnap.id;
                // console.log(id);

                if (user.uid === data.restaurantOwnerId) {
                    products.push(data);
                    // console.log(products);
                }

            });

            if (products.length === 0) {
                productsGrid.innerHTML = '<p class="empty-message">No products added yet</p>';
                return;
            }

            products.forEach((product) => {
                let productCard = document.createElement('div');
                productCard.className = "product-card";
                productCard.innerHTML = `
                    <img src="${product.image}" alt="${product.productName}" class="product-img">
                    <div class="product-info">
                        <h3 class="product-name">${product.productName}</h3>
                        <p class="product-des">${product.description}</p>
                        <p class="product-price">Rs ${product.price}</p>
                        <div class="product-actions">

                            <button class="edit-btn" onclick='editItem("${product.productId}", ${JSON.stringify(product)})'>Edit</button>
                            <button class="delete-btn" onclick="delItem('${product.productId}')">Delete</button>

                        </div>
                    </div>
                `;
                productsGrid.appendChild(productCard);
            });
        }
    });
};


//  onclick="editItem(${i})"
//  onclick="delItem(${i})"


// let editBtn=document.querySelector(".edit-btn")
// if(editBtn){
//     editBtn.addEventListener()
// }

window.editItem = async (id, currentProduct) => {
    // console.log(id);
    // console.log(currentProduct);
    editId = id

    let cancel = document.querySelector("#cancel");
    cancel.style.display = "block";

    cancel.addEventListener("click", () => {
        cancel.style.display = "none";
        editId = null
        addProductBtn.innerHTML = "Add Product"
        resetForm()
    })
    addProductBtn.innerHTML = "Update Product"
    document.getElementById("productName").value = currentProduct.productName
    document.getElementById("productPrice").value = currentProduct.price
    document.getElementById("productDescription").value = currentProduct.description
    document.getElementById("productImage").value = currentProduct.image

}

// delete function 
window.delItem = async (id) => {
    const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
        try {
            await deleteDoc(doc(db, "restaurantsProducts", id));

            Swal.fire({
                icon: 'success',
                title: 'Deleted!',
                text: 'Product deleted successfully!',
                showConfirmButton: true
            });

            renderRestaurantProducts();
        } catch (error) {
            console.error("Error deleting product:", error);
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Error deleting product. Please try again.',
                showConfirmButton: true
            });
        }
    }
}

// render all products for users 
window.renderAllProducts = async () => {
    // console.log("hi");

    const foodGrid = document.getElementById('foodGrid');
    foodGrid.innerHTML = '';


    const querySnapshot = await getDocs(collection(db, "restaurantsProducts"));
    querySnapshot.forEach((doc) => {
        let data = doc.data();

        // console.log(data);
        // console.log(doc.id);
        const foodCard = document.createElement('div');
        foodCard.className = 'food-card';
        foodCard.innerHTML += `
            <img src="${data.image}" alt="${data.productName}" class="food-img">
            <div class="food-info">
                <h3 class="food-name">${data.productName}</h3>
                <h3 class="food-name">${"Restaurant " + data.restaurantName}</h3>
                <p class="food-desc">${data.description}</p>
                <p class="food-price">Rs ${data.price}</p>
                <button class="add-to-cart"  onclick='addCart("${doc.id}", ${JSON.stringify(data)})'>Add to Cart</button>
                
            </div>
        `;
        foodGrid.appendChild(foodCard);
    });


    // console.log("running");
}
// console.log("running");


// 


// add cart 
let productQuantity = 1;
window.addCart = async (id, data) => {
    // console.log(id);
    // console.log(data);

    onAuthStateChanged(auth, async (user) => {
        if (!user) {
            Swal.fire({
                icon: 'info',
                title: 'Please login first!',
                text: 'You need to log in to add items to your cart.',
                confirmButtonText: 'OK'
            });
            return;
        }

        const cartRef = collection(db, "carts", user.uid, "items");

        // Check if already in cart
        const snapshot = await getDocs(cartRef);
        let exists = false;
        snapshot.forEach(docSnap => {
            if (docSnap.data().productId === data.productId) {
                exists = true;
            }
        });

        if (exists) {
            Swal.fire({
                icon: 'warning',
                title: 'Already in Cart',
                text: 'This product is already in your cart.',
                confirmButtonText: 'OK'
            });
            return;
        } else {

            await addDoc(cartRef, {
                userEmail: user.email,
                userUid: user.uid,
                productQuantity,
                ...data

            });
            Swal.fire({
                icon: 'success',
                title: 'Added to Cart',
                text: 'The product has been added to your cart successfully!',
                confirmButtonText: 'OK'
            });
        }
        closee();
        cartCount()

    });
};
// cart count function 
window.cartCount = async () => {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            // console.log(user);

            const cartRef = collection(db, "carts", user.uid, "items");
            console.log(cartRef);

            const updatedSnapshot = await getDocs(cartRef);
            const cartCount = document.getElementById("cartCount");
            if (cartCount) {
                // console.log(updatedSnapshot);
                // console.log(updatedSnapshot.docs);
                // console.log(updatedSnapshot.docs.length);

                cartCount.innerHTML = updatedSnapshot.docs.length;
            }

        }
    })

}

window.showCartItems = async () => {
    onAuthStateChanged(auth, async (user) => {
        if (user) {





            let cartItems = document.getElementById("cartItems")
            console.log(cartItems);

            const cartRef = collection(db, "carts", user.uid, "items");


            const snapshot = await getDocs(cartRef);
            console.log(snapshot.docs);
            let fee = 99;
            let grandTotal = 0;

            if (snapshot.docs.length === 0) {
                console.log(cartItems);
                cartItems.innerHTML = ` <p class="empty-cart-message">Your cart is empty</p>`
                document.getElementById("checkoutSidebar").style.display = "block";
                document.querySelector(".checkout-summary").style.display = "none";
                return;

            }

            cartItems.innerHTML = ""
            snapshot.docs.forEach(doc => {
                let item = doc.data()
                // console.log(doc.data());
                // console.log(item.productQuantity);
                let quantity = item.productQuantity || 1;

                let subtotal = item.price * quantity
                grandTotal += subtotal;


                console.log(item.productId);

                const cartItem = document.createElement('div');
                cartItem.className = 'cart-item';
                cartItem.innerHTML = `
                    <img src="${item.image}" alt="${item.productName}" class="cart-item-img">
                    <div class="cart-item-details">
                            <h3 class="cart-item-name">${item.productName}</h3>
                            <p class="cart-item-price">Rs ${item.price}</p>
                         <div class="quantity-control">
                            <button class="quantity-btn minus" onclick='minus("${doc.id}", ${JSON.stringify(doc.data())})'>-</button>
                            <span class="item-qty">${item.productQuantity}</span>
                            <button class="quantity-btn plus" onclick='plus("${doc.id}", ${JSON.stringify(doc.data())})'>+</button>
                        </div>
                        <p class="remove-item" onclick='removeItemForUser("${doc.id}")'>Remove</p>
                    </div>
                    `;

                cartItems.appendChild(cartItem);
                console.log(grandTotal);


            })
            let totalWithFee = grandTotal + fee;
            document.getElementById("subtotal").innerHTML = `Rs ${grandTotal}`
            document.getElementById("total").innerHTML = `Rs ${totalWithFee}`
            console.log(grandTotal);
            // console.log(user);
            document.getElementById("checkoutSidebar").style.display = "block";
            document.querySelector(".checkout-summary").style.display = "block";

        }
    })
}


window.minus = async (id, data) => {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            console.log(id, data);
            // productQuantity--

            const itemRef = doc(db, "carts", user.uid, "items", id);
            console.log("itemref", itemRef);

            const itemSnap = await getDoc(itemRef);
            console.log(itemSnap);

            if (itemSnap.exists()) {
                const currentQty = itemSnap.data().productQuantity || 1;
                if (currentQty > 1) {
                    await updateDoc(itemRef, {
                        productQuantity: currentQty - 1
                    });
                    showCartItems();
                    console.log(data);

                } else {
                    removeItemForUser(id)

                }


                // cartCount();


            }




        }
    })


}
window.plus = async (id, data) => {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            console.log(id, data);
            // productQuantity--

            const itemRef = doc(db, "carts", user.uid, "items", id);
            const itemSnap = await getDoc(itemRef);
            console.log(itemSnap);

            if (itemSnap.exists()) {
                const currentQty = itemSnap.data().productQuantity || 1;
                await updateDoc(itemRef, {
                    productQuantity: currentQty + 1
                });
                showCartItems();
                // cartCount();
                console.log(data);

            }




        }
    })


}
let cartIcon = document.getElementById("cartIcon")
if (cartIcon) {
    cartIcon.addEventListener("click", showCartItems)
}

// remove item for users 
window.removeItemForUser = async (id) => {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            const result = await Swal.fire({
                title: 'Are you sure?',
                text: "You want to remove this item from your cart?",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, remove it!',
                cancelButtonText: 'Cancel'
            });

            if (result.isConfirmed) {
                await deleteDoc(doc(db, "carts", user.uid, "items", id));
                Swal.fire(
                    'Removed!',
                    'Item has been removed from your cart.',
                    'success'
                );
                showCartItems();
                cartCount();
            }
        }
    });
};


window.closee = () => {
    document.getElementById("checkoutSidebar").style.display = "none";
    // alert("hello")
}



// checkout 

window.checkout = () => {
    onAuthStateChanged(auth, async (user) => {
        if (!user) {
            Swal.fire({
                icon: 'warning',
                title: 'Login Required',
                text: 'Please login first to place an order.',
                confirmButtonText: 'Login'
            });
            return;
        }

        try {
            const cartItemsRef = collection(db, "carts", user.uid, "items");
            const cartSnapshot = await getDocs(cartItemsRef);

            if (cartSnapshot.empty) {
                Swal.fire({
                    icon: 'info',
                    title: 'Cart Empty',
                    text: 'Your cart is empty. Please add items before checkout.',
                    confirmButtonText: 'OK'
                });
                return;
            }

            let orders = [];
            cartSnapshot.forEach((docSnap) => {
                orders.push(docSnap.data());
            });


            let totalItems = orders.length;


            Swal.fire({
                title: 'Confirm Your Order',
                html: `<p>You have <strong>${totalItems} item(s)</strong> in your cart.</p>
               <p>Are you sure you want to place the order?</p>`,
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#aaa',
                confirmButtonText: 'Yes, place order',
                cancelButtonText: 'Cancel',
                reverseButtons: true
            }).then(async (result) => {
                if (result.isConfirmed) {
                    await addDoc(collection(db, "orders"), {
                        orders,
                        orderDate: new Date(),
                        orderId: generateOrderId(),
                        status: "Pending",
                        userId: user.uid,
                        userEmail: user.email
                    });


                    for (const docSnap of cartSnapshot.docs) {
                        await deleteDoc(doc(db, "carts", user.uid, "items", docSnap.id));
                    }

                    Swal.fire({
                        icon: 'success',
                        title: 'Order Placed!',
                        text: 'Your order has been placed successfully.',
                        timer: 2000,
                        showConfirmButton: false
                    });
                    closee()


                    cartCount()
                } else if (result.dismiss === Swal.DismissReason.cancel) {
                    Swal.fire({
                        icon: 'info',
                        title: 'Order Cancelled',
                        text: 'You can continue shopping.',
                        timer: 1500,
                        showConfirmButton: false
                    });
                }
            });
        } catch (err) {
            console.error(err);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Something went wrong! Please try again later.',
                confirmButtonText: 'OK'
            });
        }
    });
};

function generateOrderId() {
    const now = new Date();
    const year = now.getFullYear().toString().slice(2);
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hour = String(now.getHours()).padStart(2, '0');
    const minute = String(now.getMinutes()).padStart(2, '0');
    const second = String(now.getSeconds()).padStart(2, '0');
    const randomPart = Math.floor(100000 + Math.random() * 900000);

    return `${year}${month}${day}${hour}${minute}${second}${randomPart}`;
}


window.logout = () => {
    Swal.fire({
        title: 'Sign Out?',
        text: 'Are you sure you want to sign out?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, sign out'
    }).then((result) => {
        if (result.isConfirmed) {
            auth.signOut()
                .then(() => {
                    window.location.href = './login.html';
                })
                .catch((error) => {
                    // Optional: handle error on sign out
                    Swal.fire('Error', 'Failed to sign out. Please try again.', 'error');
                });
        }
    });
}


// window.addCart=async (id,data)=>{
// //     console.log("hello");
// // console.log(id);
// // console.log(data);
//  onAuthStateChanged(auth,async (user)=>{
//     console.log(user);
//     if(user){


//         try {
//              const docRef = await addDoc(collection(db, "usersCart"), {
//                 userId:user.uid,
//                 userEmil:user.email,
//                 productId:id,
//                 productName:data.productName,
//                 productPrice:data.price,
//                 productDescriptione:data.description,
//                 productImage:data.image,

//          });

//             console.log("Document written with ID: ", docRef.id);
//         } catch (e) {
//             console.error("Error adding document: ", e);
//         }

//     }

//  })

// }

//  onclick="addCart(${k})"
// renderAllProducts();

// onAuthStateChanged(auth, async (user) => {
//     if (user) {
//         console.log(user);
//     }


// })










// let users = JSON.parse(localStorage.getItem("users")) || [];
// let restaurants = JSON.parse(localStorage.getItem("restaurants")) || [];
// let orders = JSON.parse(localStorage.getItem("orders")) || [];
// let cart = JSON.parse(localStorage.getItem("cart")) || [];



// let adminEmail = "admin@gmail.com";
// let adminPassword = "admin123";

// function signUp() {
//     let accountType = document.getElementById("account-type");
//     let name = document.getElementById("name");
//     let email = document.getElementById("email");
//     let phone = document.getElementById("phone");
//     let password = document.getElementById("password");
//     let restaurant = document.getElementById("restaurant-name");

//     let user = {
//         name: name.value,
//         email: email.value,
//         phone: phone.value,
//         password: password.value,
//         accountType: accountType.value
//     };

//     let restaurantData = {
//         restaurantName: restaurant.value,
//         name: name.value,
//         email: email.value,
//         phone: phone.value,
//         password: password.value,
//         accountType: accountType.value
//     };

//     let userValid = accountType.value === "user" && name.value && email.value && phone.value && password.value;
//     let restaurantValid = accountType.value === "restaurant" && name.value && email.value && phone.value && password.value && restaurant.value;

//     if (userValid || restaurantValid) {
//         let emailExists = false;

//         if (email.value === adminEmail) {
//             emailExists = true;
//         }

//         for (let i = 0; i < users.length; i++) {
//             console.log(users[i].email);

//             if (users[i].email === email.value) {
//                 emailExists = true;
//                 break;
//             }
//         }

//         for (let j = 0; j < restaurants.length; j++) {
//             console.log(restaurants[j].email);
//             if (restaurants[j].email === email.value) {
//                 emailExists = true;
//                 break;
//             }
//         }

//         if (emailExists) {
//             Swal.fire({
//                 title: "Error",
//                 text: "Email already exists",
//                 icon: "error"
//             });
//             return;
//         }

//         if (accountType.value === "user") {
//             users.push(user);
//             localStorage.setItem("users", JSON.stringify(users));
//         } else {
//             restaurants.push(restaurantData);
//             localStorage.setItem("restaurants", JSON.stringify(restaurants));
//         }

//         Swal.fire({
//             title: "Sign Up Success",
//             text: "Redirecting to login...",
//             icon: "success"
//         }).then(() => {
//             window.location.href = "./login.html";
//         });

//     } else {
//         Swal.fire({
//             title: "Error",
//             text: "Please fill all the fields",
//             icon: "error"
//         });
//     }
// }


// function login() {
//     let loginEmail = document.getElementById("login-email");
//     let loginPassword = document.getElementById("login-password");
//     if (loginEmail.value !== "" && loginPassword.value !== "") {
//         if (loginEmail.value === adminEmail && loginPassword.value === adminPassword) {
//             localStorage.setItem("loggedInAdmin", JSON.stringify({ email: adminEmail, password: adminPassword, accountType: "admin", }));
//             Swal.fire({
//                 title: "Login Success",
//                 text: "Redirecting to Admin Dashboard...",
//                 icon: "success"
//             }).then(() => {
//                 window.location.href = "./admin.html";
//             });
//             return;
//         }

//         let userFound = users.filter(function (data) {
//             return data.email === loginEmail.value && data.password === loginPassword.value;

//         })
//         let restaurantFound = restaurants.filter(function (data) {
//             return data.email === loginEmail.value && data.password === loginPassword.value;
//         })
//         if (userFound.length > 0) {
//             localStorage.setItem("loggedInUser", JSON.stringify(userFound[0]));
//             Swal.fire({
//                 title: "Login Success",
//                 text: "Redirecting to Dashborad...",
//                 icon: "success"
//             }).then(() => {
//                 window.location.href = "./user.html";
//             });
//         } else if (restaurantFound.length > 0) {
//             localStorage.setItem("loggedInUser", JSON.stringify(restaurantFound[0]));
//             Swal.fire({
//                 title: "Login Success",
//                 text: "Redirecting to Dashborad...",
//                 icon: "success"
//             }).then(() => {
//                 window.location.href = "./restaurant.html";
//             });
//         }
//         else {
//             Swal.fire({
//                 title: "Credentials Not Match",
//                 text: "Check Your Email and Password",
//                 icon: "error"
//             });
//         }

//     } else {
//         Swal.fire({
//             title: "Error",
//             text: "Please fill all the fields",
//             icon: "error"
//         });
//     }



// }


// function renderProduct() {
//     let loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
//     // console.log(loggedInUser);

//     let userEmail = loggedInUser.email;
//     // console.log(userEmail);

//     let productsGrid = document.getElementById("productsGrid")
//     productsGrid.innerHTML = ""


//     let products = JSON.parse(localStorage.getItem("products_" + userEmail)) || [];

//     if (products.length === 0) {
//         productsGrid.innerHTML = '<p class="empty-message">No products added yet</p>';
//     }


//     // for (let key in products) {
//     //     console.log(products[key]);

//     // }
//     for (let i = 0; i < products.length; i++) {
//         console.log(products[i]);
//         console.log(i);


//         let prooduct = products[i];
//         let productCard = document.createElement('div');
//         productCard.className = "product-card";
//         productCard.innerHTML += `
//     <img src="${prooduct.image}" alt="${prooduct.name}" class="product-img">
//     <div class="product-info">
//         <h3 class="product-name">${prooduct.name}</h3>
//         <p class="product-price">Rs ${prooduct.price}</p>
//         <div class="product-actions">
//             <button class="edit-btn" onclick="editItem(${i})">Edit</button>
//             <button class="delete-btn" onclick="delItem(${i})">Delete</button>
//         </div>
//     </div>
// `;

//         productsGrid.appendChild(productCard);

//     }

// }
// function delItem(e) {
//     Swal.fire({
//         title: 'Are you sure?',
//         text: "You won't be able to revert this!",
//         icon: 'warning',
//         showCancelButton: true,
//         confirmButtonColor: '#3085d6',
//         cancelButtonColor: '#d33',
//         confirmButtonText: 'Yes, delete it!'
//     }).then((result) => {
//         if (result.isConfirmed) {
//             let loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
//             let userEmail = loggedInUser.email;
//             let products = JSON.parse(localStorage.getItem("products_" + userEmail)) || [];


//             products.splice(e, 1);

//             // Update localStorage
//             localStorage.setItem("products_" + userEmail, JSON.stringify(products));


//             Swal.fire(
//                 'Deleted!',
//                 'Your product has been deleted.',
//                 'success'
//             ).then(() => {

//                 renderProduct();

//             });
//         }
//     });
// }
// let editingIndex = null;

// function editItem(index) {
//     let loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
//     let userEmail = loggedInUser.email;

//     let products = JSON.parse(localStorage.getItem("products_" + userEmail)) || [];
//     let product = products[index];


//     document.getElementById("productName").value = product.name;
//     document.getElementById("productPrice").value = product.price;
//     document.getElementById("productDescription").value = product.description;
//     document.getElementById("productCategory").value = product.category;
//     document.getElementById("productImage").value = product.image;
//     document.getElementById("productId").value = product.id;

//     editingIndex = index;
// }
// function addProduct() {
//     let loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
//     let userEmail = loggedInUser.email;

//     let productName = document.getElementById("productName");
//     let productPrice = document.getElementById("productPrice");
//     let productDescription = document.getElementById("productDescription");
//     let productCategory = document.getElementById("productCategory");
//     let productImage = document.getElementById("productImage");

//     let product = {
//         id: editingIndex !== null ? parseInt(document.getElementById("productId").value) : Math.floor(Math.random() * 1000000),
//         name: productName.value,
//         price: productPrice.value,
//         description: productDescription.value,
//         category: productCategory.value,
//         image: productImage.value
//     };

//     let fieldsCheck = productName.value !== "" && productPrice.value !== "" &&
//         productDescription.value !== "" && productCategory.value !== "" &&
//         productImage.value !== "";

//     if (fieldsCheck) {
//         let products = JSON.parse(localStorage.getItem("products_" + userEmail)) || [];

//         let msg;
//         if (editingIndex !== null) {
//             products[editingIndex] = product;
//             msg = "Product Updated";
//             editingIndex = null; 
//         } else {
//             products.push(product);
//             msg = "Product Added";
//         }

//         localStorage.setItem("products_" + userEmail, JSON.stringify(products));

//         Swal.fire({
//             title: msg,
//             text: "Product Saved Successfully",
//             icon: "success"
//         }).then(() => {
//             productName.value = "";
//             productPrice.value = "";
//             productDescription.value = "";
//             productCategory.value = "";
//             productImage.value = "";
//             document.getElementById("productId").value = "";

//             renderProduct();
//         });
//     } else {
//         Swal.fire({
//             title: "Error",
//             text: "Please fill all the fields",
//             icon: "error"
//         });
//     }
// }

// let allProducts = [];
// function renderFoodItems() {
//     const foodGrid = document.getElementById('foodGrid');
//     foodGrid.innerHTML = '';

//     let restaurants = JSON.parse(localStorage.getItem("restaurants")) || [];
//     // let allProducts = [];

//     // Loop through each restaurant
//     for (let i = 0; i < restaurants.length; i++) {
//         let restaurant = restaurants[i];
//         let restaurantEmail = restaurant.email;
//         let restaurantName = restaurant.restaurantName;

//         let products = JSON.parse(localStorage.getItem("products_" + restaurantEmail)) || [];

//         // Loop through each product of this restaurant
//         for (let j = 0; j < products.length; j++) {
//             let product = products[j];
//             product.restaurantName = restaurantName;
//             allProducts.push(product);
//         }
//     }

//     localStorage.setItem("allProduct", JSON.stringify(allProducts));

//     if (allProducts.length === 0) {
//         foodGrid.innerHTML = '<p class="empty-cart-message">No products found</p>';

//     } else {

//     }

//     for (let k = 0; k < allProducts.length; k++) {
//         let product = allProducts[k];
//         console.log(product.id);

//         const foodCard = document.createElement('div');
//         foodCard.className = 'food-card';
//         foodCard.innerHTML += `
//             <img src="${product.image}" alt="${product.name}" class="food-img">
//             <div class="food-info">
//                 <h3 class="food-name">${product.name}</h3>
//                 <h3 class="food-name">${"Restaurant " + product.restaurantName}</h3>
//                 <p class="food-desc">${product.description}</p>
//                 <p class="food-price">Rs ${product.price}</p>
//                 <button class="add-to-cart" onclick="addCart(${k})">Add to Cart</button>
//             </div>
//         `;
//         foodGrid.appendChild(foodCard);
//     }
// }
// function addCart(e) {
//     let allProducts = JSON.parse(localStorage.getItem("allProduct")) || [];
//     let product = allProducts[e];
//     let loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
//     let userEmail = loggedInUser.email;
//     let cart = JSON.parse(localStorage.getItem("cart_" + userEmail)) || [];


//     let existingProduct = cart.find(item => item.id === product.id);

//     if (existingProduct) {
//         Swal.fire({

//             icon: 'info',
//             title: 'Item already in cart',
//             showConfirmButton: false,
//             timer: 1500
//         });
//         return;
//     }

//     let cartItem = {
//         id: product.id,
//         name: product.name,
//         price: product.price,
//         description: product.description,
//         category: product.category,
//         image: product.image,
//         quantity: 1
//     };

//     cart.push(cartItem);
//     localStorage.setItem("cart_" + userEmail, JSON.stringify(cart));

//     updateCartCount();
//     cartItems();

//     Swal.fire({

//         icon: 'success',
//         title: 'Added to cart',
//         showConfirmButton: false,
//         timer: 1500
//     });
// }


// function updateCartCount() {
//     let loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
//     let userEmail = loggedInUser.email;
//     let cart = JSON.parse(localStorage.getItem("cart_" + userEmail)) || [];
//     let cartCountt = document.getElementById("cartCount");

//     // ✅ Sum of all item quantities
//     const totalItems = cart.reduce((total, item) => total + item.quantity, 0);

//     cartCountt.innerHTML = totalItems;
// }


// function cartItems() {
//     let loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
//     let userEmail = loggedInUser.email;
//     let cart = JSON.parse(localStorage.getItem("cart_" + userEmail)) || [];
//     let cartItems = document.getElementById("cartItems");

//     if (cart.length === 0) {
//         cartItems.innerHTML = '<p class="empty-cart-message">Your cart is empty</p>';
//     } else {
//         cartItems.innerHTML = '';
//         for (let i = 0; i < cart.length; i++) {
//             let item = cart[i];
//             const cartItem = document.createElement('div');
//             cartItem.className = 'cart-item';
//             cartItem.innerHTML = `
//                 <img src="${item.image}" alt="${item.name}" class="cart-item-img">
//                 <div class="cart-item-details">
//                     <h3 class="cart-item-name">${item.name}</h3>
//                     <p class="cart-item-price">Rs ${item.price}</p>
//                     <div class="quantity-control">
//                         <button class="quantity-btn minus" data-id="${item.id}">-</button>
//                         <span class="item-qty">${item.quantity}</span>
//                         <button class="quantity-btn plus" data-id="${item.id}">+</button>
//                     </div>
//                     <p class="remove-item" data-id="${item.id}">Remove</p>
//                 </div>
//             `;
//             cartItems.appendChild(cartItem);
//         }


//         attachCartEvents();

//         updateCartSummary();
//     }
// }
// cartItems()

// function attachCartEvents() {
//     let loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
//     let userEmail = loggedInUser.email;
//     let cart = JSON.parse(localStorage.getItem("cart_" + userEmail)) || [];

//     let plusButtons = document.getElementsByClassName("quantity-btn plus");
//     for (let i = 0; i < plusButtons.length; i++) {
//         plusButtons[i].onclick = function () {
//             let id = parseInt(this.getAttribute("data-id"));
//             for (let j = 0; j < cart.length; j++) {
//                 if (cart[j].id === id) {
//                     cart[j].quantity++;
//                     break;
//                 }
//             }
//             localStorage.setItem("cart_" + userEmail, JSON.stringify(cart));
//             cartItems();
//             // updateCartCount();
//         };
//     }

//     let minusButtons = document.getElementsByClassName("quantity-btn minus");
//     for (let i = 0; i < minusButtons.length; i++) {
//         minusButtons[i].onclick = function () {
//             let id = parseInt(this.getAttribute("data-id"));
//             for (let j = 0; j < cart.length; j++) {
//                 if (cart[j].id === id) {
//                     if (cart[j].quantity > 1) {
//                         cart[j].quantity--;
//                     } else {
//                         cart.splice(j, 1);
//                     }
//                     break;
//                 }
//             }
//             localStorage.setItem("cart_" + userEmail, JSON.stringify(cart));
//             cartItems();
//             updateCartCount();
//         };
//     }

//     let removeItems = document.getElementsByClassName("remove-item");
//     for (let i = 0; i < removeItems.length; i++) {
//         removeItems[i].onclick = function () {
//             let id = parseInt(this.getAttribute("data-id"));
//             for (let j = 0; j < cart.length; j++) {
//                 if (cart[j].id === id) {
//                     cart.splice(j, 1);
//                     break;
//                 }
//             }
//             localStorage.setItem("cart_" + userEmail, JSON.stringify(cart));
//             cartItems();
//             updateCartCount();
//         };
//     }
// }


// function closee() {
//     document.getElementById("checkoutSidebar").style.display = "none";
//     // alert("hello")
// }
// function toggleCart() {
//     // alert("hello")
//     document.getElementById("checkoutSidebar").style.display = "block";
//     // document.getElementById("cartSidebar").style.display = "block";
// }

// function updateCartSummary() {
//     let loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
//     let userEmail = loggedInUser.email;
//     let cart = JSON.parse(localStorage.getItem("cart_" + userEmail)) || [];
//     let subtotal = 0;

//     for (let i = 0; i < cart.length; i++) {
//         subtotal += cart[i].price * cart[i].quantity;
//     }

//     let deliveryFee = 99;
//     let total = subtotal + deliveryFee;

//     // DOM elements update karein
//     document.getElementById("subtotal").innerText = "Rs " + subtotal;
//     document.getElementById("total").innerText = "Rs " + total;
// }
// cartItems();
// updateCartSummary();

// function checkOut() {
//     let loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
//     let userEmail = loggedInUser.email;
//     let cart = JSON.parse(localStorage.getItem("cart_" + userEmail)) || [];

//     if (cart.length === 0) {
//         Swal.fire({
//             title: 'Empty Cart',
//             text: 'Your cart is empty. Please add items before checkout.',
//             icon: 'warning'
//         });
//         return;
//     }

//     let totalAmount = cart.reduce((total, item) => total + item.price * item.quantity, 0);
//     let deliveryFee = 99;
//     let grandTotal = totalAmount + deliveryFee;

//     Swal.fire({
//         title: 'Confirm Order',
//         html: `
//             <div style="text-align:left; margin:10px 0;">
//                 <p><strong>Items:</strong> ${cart.length}</p>
//                 <p><strong>Subtotal:</strong> Rs ${totalAmount}</p>
//                 <p><strong>Delivery Fee:</strong> Rs ${deliveryFee}</p>
//                 <p><strong>Total:</strong> Rs ${grandTotal}</p>
//             </div>
//             <p>Are you sure you want to place this order?</p>
//         `,
//         icon: 'question',
//         showCancelButton: true,
//         confirmButtonColor: '#e21b70',
//         cancelButtonColor: '#666',
//         confirmButtonText: 'Place Order',
//         cancelButtonText: 'Cancel'
//     }).then((result) => {
//         if (result.isConfirmed) {
//             // Create new order
//             let newOrder = {
//                 id: Date.now(),
//                 date: new Date().toLocaleString(),
//                 items: cart,
//                 totalAmount: grandTotal
//             };

//             // Save to orders
//             let existingOrders = JSON.parse(localStorage.getItem("order_" + userEmail)) || [];
//             existingOrders.push(newOrder);
//             localStorage.setItem("order_" + userEmail, JSON.stringify(existingOrders));

//             localStorage.removeItem("cart_" + userEmail);

//             // Update UI
//             updateCartCount();
//             cartItems();
//             updateCartSummary();

//             Swal.fire({
//                 title: 'Order Placed!',
//                 text: 'Your order has been placed successfully',
//                 icon: 'success'
//             }).then(() => {

//                 closee();
//             });
//         }
//     });
// }
// function logout() {
//     Swal.fire({
//         title: 'Are you sure?',
//         text: "You will be logged out from your account",
//         icon: 'warning',
//         showCancelButton: true,
//         confirmButtonColor: '#e21b70',
//         cancelButtonColor: '#666',
//         confirmButtonText: 'Yes, logout!',
//         cancelButtonText: 'Cancel'
//     }).then((result) => {
//         if (result.isConfirmed) {

//             localStorage.removeItem("loggedInUser");
//             localStorage.removeItem("loggedInAdmin");

//             Swal.fire({
//                 title: 'Logged Out!',
//                 text: 'You have been successfully logged out',
//                 icon: 'success'
//             }).then(() => {

//                 window.location.href = "./login.html";
//             });
//         }
//     });
// }


// function searchItem() {

//     var searchInput = document.getElementById("search").value.toLowerCase();

//     var foodGrid = document.getElementById("foodGrid");


//     let allProducts = JSON.parse(localStorage.getItem("allProduct")) || [];


//     var searchResults = allProducts.filter(function(product) {
//         return (
//             product.name.toLowerCase().includes(searchInput) ||
//             product.description.toLowerCase().includes(searchInput) ||
//             product.restaurantName.toLowerCase().includes(searchInput) ||
//             product.price.toString().includes(searchInput)
//         );
//     });


//     foodGrid.innerHTML = '';

//     // If no results found
//     if (searchResults.length === 0) {
//         foodGrid.innerHTML = '<p class="empty-message">No items found matching your search</p>';
//         return;
//     }

//     // Display the search results
//     searchResults.forEach(product => {
//         const foodCard = document.createElement('div');
//         foodCard.className = 'food-card';
//         foodCard.innerHTML = `
//             <img src="${product.image}" alt="${product.name}" class="food-img">
//             <div class="food-info">
//                 <h3 class="food-name">${product.name}</h3>
//                 <h3 class="food-name">${"Restaurant " + product.restaurantName}</h3>
//                 <p class="food-desc">${product.description}</p>
//                 <p class="food-price">Rs ${product.price}</p>
//                 <button class="add-to-cart" onclick="addCart(${allProducts.indexOf(product)})">Add to Cart</button>
//             </div>

//         `;
//         foodGrid.appendChild(foodCard);
//     });
// }

