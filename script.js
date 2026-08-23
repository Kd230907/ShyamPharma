/* =====================================================
   SHYAM PHARMA
   LOCAL PRODUCT MANAGEMENT SYSTEM
   ===================================================== */


/* =====================================================
   DEFAULT PRODUCTS
   ===================================================== */

const defaultProducts = [

    {
        id: 1,
        name: "AMLODIN-5",
        category: "tablets",
        composition: "Amlodipine 5 mg",
        mrp: 200,
        rate: 150,
        packSize: "10 Tablets",
        manufacturer: "SHYAM PHARMA",
        status: "Available",
        description: "Amlodipine 5 mg Tablets",
        image: ""
    },

    {
        id: 2,
        name: "ACECLOFENAC-SP",
        category: "tablets",
        composition: "Aceclofenac + Paracetamol",
        mrp: 165,
        rate: 125,
        packSize: "10 Tablets",
        manufacturer: "SHYAM PHARMA",
        status: "Available",
        description: "Aceclofenac and Paracetamol Tablets",
        image: ""
    },

    {
        id: 3,
        name: "VITAMIN SYRUP",
        category: "syrup",
        composition: "Multivitamin & Multimineral",
        mrp: 120,
        rate: 95,
        packSize: "200 ml",
        manufacturer: "SHYAM PHARMA",
        status: "Available",
        description: "Multivitamin & Multimineral Syrup",
        image: ""
    }

];


/* =====================================================
   STATUS CHECK
   ===================================================== */

function isProductAvailable(status) {

    return String(status)
        .trim()
        .toLowerCase() === "available";

}


/* =====================================================
   NORMALIZE PRODUCT
   ===================================================== */

function normalizeProduct(product) {

    return {

        ...product,

        category:
            String(product.category || "")
                .trim()
                .toLowerCase(),

        status:
            isProductAvailable(product.status)
                ? "Available"
                : "Out of Stock"

    };

}


/* =====================================================
   LOCAL STORAGE
   ===================================================== */

function getProducts() {

    const savedProducts =
        localStorage.getItem(
            "shyamPharmaProducts"
        );


    if (savedProducts) {

        try {

            const products =
                JSON.parse(savedProducts);


            if (Array.isArray(products)) {

                return products.map(
                    function(product) {

                        return normalizeProduct(
                            product
                        );

                    }
                );

            }

        }

        catch (error) {

            console.error(
                "Error reading products:",
                error
            );

        }

    }


    const normalizedDefaults =
        defaultProducts.map(
            function(product) {

                return normalizeProduct(
                    product
                );

            }
        );


    localStorage.setItem(
        "shyamPharmaProducts",
        JSON.stringify(
            normalizedDefaults
        )
    );


    return normalizedDefaults;

}


/* =====================================================
   SAVE PRODUCTS
   ===================================================== */

function saveProducts(products) {

    const normalizedProducts =
        products.map(
            function(product) {

                return normalizeProduct(
                    product
                );

            }
        );


    localStorage.setItem(
        "shyamPharmaProducts",
        JSON.stringify(
            normalizedProducts
        )
    );

}


/* =====================================================
   WEBSITE PRODUCT DISPLAY
   ===================================================== */

function displayProducts() {

    const productGrid =
        document.getElementById(
            "productsGrid"
        );


    if (!productGrid) {
        return;
    }


    const products =
        getProducts();


    productGrid.innerHTML = "";


    products.forEach(
        function(product) {


            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "product-card";


            card.dataset.name =
                String(
                    product.name || ""
                ).toLowerCase();


            card.dataset.category =
                String(
                    product.category || ""
                ).toLowerCase();


            /* =====================================
               PRODUCT IMAGE
               ===================================== */

            let imageHTML = "";


            if (product.image) {

                imageHTML = `

                    <img
                        src="${product.image}"
                        alt="${escapeHTML(product.name)}"
                        style="
                            width:100%;
                            height:100%;
                            object-fit:contain;
                        "
                    >

                `;

            }

            else {

                imageHTML = `

                    <div class="product-placeholder">
                        PRODUCT
                    </div>

                `;

            }


            /* =====================================
               STATUS
               ===================================== */

            const available =
                isProductAvailable(
                    product.status
                );


            const statusText =
                available
                    ? "Available"
                    : "Out of Stock";


            /* =====================================
               PRODUCT CARD
               ===================================== */

            card.innerHTML = `

                <div class="product-image">

                    ${imageHTML}

                    <span
                        class="stock-badge
                        ${available
                            ? "available"
                            : "out-of-stock"
                        }"
                    >

                        ${statusText}

                    </span>

                </div>


                <div class="product-info">

                    <span class="product-category">

                        ${escapeHTML(
                            String(
                                product.category || ""
                            ).toUpperCase()
                        )}

                    </span>


                    <h3>

                        ${escapeHTML(
                            product.name || ""
                        )}

                    </h3>


                    <p>

                        ${escapeHTML(
                            product.composition || ""
                        )}

                    </p>


                    <div class="product-price">

                        <div>

                            <small>
                                MRP
                            </small>

                            <strong>
                                ₹${Number(
                                    product.mrp || 0
                                ).toFixed(0)}
                            </strong>

                        </div>


                        <div>

                            <small>
                                RATE
                            </small>

                            <strong>
                                ₹${Number(
                                    product.rate || 0
                                ).toFixed(0)}
                            </strong>

                        </div>

                    </div>


                    <button
                        class="details-button"
                        onclick="openProductById(${product.id})"
                    >

                        View Details →

                    </button>

                </div>

            `;


            productGrid.appendChild(
                card
            );

        }
    );


    filterWebsiteProducts();

}


/* =====================================================
   PRODUCT SEARCH
   ===================================================== */

function filterWebsiteProducts() {

    const searchInput =
        document.getElementById(
            "searchInput"
        );


    const categoryFilter =
        document.getElementById(
            "categoryFilter"
        );


    if (!searchInput) {
        return;
    }


    const search =
        searchInput.value
            .toLowerCase()
            .trim();


    const category =
        categoryFilter
            ? categoryFilter.value
                .toLowerCase()
                .trim()
            : "all";


    const cards =
        document.querySelectorAll(
            "#productsGrid .product-card"
        );


    cards.forEach(
        function(card) {


            const name =
                String(
                    card.dataset.name || ""
                ).toLowerCase();


            const cardCategory =
                String(
                    card.dataset.category || ""
                ).toLowerCase();


            const composition =
                card
                    .querySelector(
                        ".product-info p"
                    );


            const compositionText =
                composition
                    ? composition.textContent
                        .toLowerCase()
                    : "";


            const searchMatch =

                name.includes(search)

                ||

                compositionText.includes(
                    search
                );


            const categoryMatch =

                category === "all"

                ||

                cardCategory === category;


            if (
                searchMatch &&
                categoryMatch
            ) {

                card.style.display = "";

            }

            else {

                card.style.display = "none";

            }

        }
    );

}


/* =====================================================
   PRODUCT DETAILS
   ===================================================== */

function openProductById(id) {

    const products =
        getProducts();


    const product =
        products.find(
            function(item) {

                return Number(item.id) ===
                    Number(id);

            }
        );


    if (!product) {
        return;
    }


    const modal =
        document.getElementById(
            "productModal"
        );


    if (!modal) {
        return;
    }


    const nameElement =
        document.getElementById(
            "modalProductName"
        );


    const descriptionElement =
        document.getElementById(
            "modalProductDescription"
        );


    const mrpElement =
        document.getElementById(
            "modalMRP"
        );


    const rateElement =
        document.getElementById(
            "modalRate"
        );


    if (nameElement) {

        nameElement.textContent =
            product.name || "";

    }


    if (descriptionElement) {

        descriptionElement.textContent =
            product.description ||
            product.composition ||
            "";

    }


    if (mrpElement) {

        mrpElement.textContent =
            "₹" +
            Number(
                product.mrp || 0
            ).toFixed(0);

    }


    if (rateElement) {

        rateElement.textContent =
            "₹" +
            Number(
                product.rate || 0
            ).toFixed(0);

    }


    const statusElement =
        document.getElementById(
            "modalAvailability"
        );


    if (statusElement) {

        const available =
            isProductAvailable(
                product.status
            );


        statusElement.textContent =
            available
                ? "Available"
                : "Out of Stock";


        statusElement.className =
            available
                ? "available"
                : "out-stock";

    }


    modal.classList.add(
        "show"
    );


    document.body.style.overflow =
        "hidden";

}


/* =====================================================
   OPEN PRODUCT BY NAME
   ===================================================== */

function openProduct(productName) {

    const products =
        getProducts();


    const product =
        products.find(
            function(item) {

                return String(
                    item.name
                ).toLowerCase() ===
                    String(
                        productName
                    ).toLowerCase();

            }
        );


    if (!product) {
        return;
    }


    openProductById(
        product.id
    );

}


/* =====================================================
   CLOSE PRODUCT MODAL
   ===================================================== */

function closeProduct() {

    const modal =
        document.getElementById(
            "productModal"
        );


    if (!modal) {
        return;
    }


    modal.classList.remove(
        "show"
    );


    document.body.style.overflow =
        "";

}


/* =====================================================
   ADMIN DASHBOARD
   ===================================================== */

function displayAdminProducts() {

    const tableBody =
        document.getElementById(
            "productTableBody"
        );


    if (!tableBody) {
        return;
    }


    const products =
        getProducts();


    tableBody.innerHTML = "";


    products.forEach(
        function(product) {


            const row =
                document.createElement(
                    "tr"
                );


            row.dataset.productName =
                String(
                    product.name || ""
                ).toLowerCase();


            row.dataset.productCategory =
                String(
                    product.category || ""
                ).toLowerCase();


            const available =
                isProductAvailable(
                    product.status
                );


            const statusText =
                available
                    ? "Available"
                    : "Out of Stock";


            row.innerHTML = `

                <td>

                    <div class="table-product">

                        <div class="table-product-image">

                            ${
                                product.image

                                ?

                                `<img
                                    src="${product.image}"
                                    alt="${escapeHTML(
                                        product.name
                                    )}"
                                    style="
                                        width:100%;
                                        height:100%;
                                        object-fit:contain;
                                        border-radius:6px;
                                    "
                                >`

                                :

                                "P"

                            }

                        </div>


                        <div>

                            <strong>

                                ${escapeHTML(
                                    product.name || ""
                                )}

                            </strong>


                            <small>

                                ${escapeHTML(
                                    product.composition || ""
                                )}

                            </small>

                        </div>

                    </div>

                </td>


                <td>

                    ${escapeHTML(
                        product.category || ""
                    )}

                </td>


                <td>

                    ₹${Number(
                        product.mrp || 0
                    ).toFixed(0)}

                </td>


                <td>

                    ₹${Number(
                        product.rate || 0
                    ).toFixed(0)}

                </td>


                <td>

                    <span
                        class="status
                        ${
                            available
                                ? "available-status"
                                : "out-stock-status"
                        }"
                    >

                        ${statusText}

                    </span>

                </td>


                <td>

                    <div class="action-buttons">

                        <button
                            class="edit-button"
                            onclick="editProduct(${product.id})"
                        >

                            Edit

                        </button>


                        <button
                            class="delete-button"
                            onclick="deleteProduct(${product.id})"
                        >

                            Delete

                        </button>

                    </div>

                </td>

            `;


            tableBody.appendChild(
                row
            );

        }
    );


    updateProductCount();

}


/* =====================================================
   PRODUCT COUNT
   ===================================================== */

function updateProductCount() {

    const products =
        getProducts();


    const total =
        products.length;


    const available =
        products.filter(
            function(product) {

                return isProductAvailable(
                    product.status
                );

            }
        ).length;


    const outOfStock =
        products.filter(
            function(product) {

                return !isProductAvailable(
                    product.status
                );

            }
        ).length;


    const totalCounter =
        document.getElementById(
            "totalProducts"
        );


    const availableCounter =
        document.getElementById(
            "availableProducts"
        );


    const outCounter =
        document.getElementById(
            "outProducts"
        );


    if (totalCounter) {

        totalCounter.textContent =
            total;

    }


    if (availableCounter) {

        availableCounter.textContent =
            available;

    }


    if (outCounter) {

        outCounter.textContent =
            outOfStock;

    }

}


/* =====================================================
   ADMIN SEARCH
   ===================================================== */

function searchAdminProducts() {

    const searchElement =
        document.getElementById(
            "adminSearch"
        );


    const categoryElement =
        document.getElementById(
            "adminCategory"
        );


    if (!searchElement) {
        return;
    }


    const search =
        searchElement.value
            .toLowerCase()
            .trim();


    const category =
        categoryElement
            ? categoryElement.value
                .toLowerCase()
                .trim()
            : "all";


    const rows =
        document.querySelectorAll(
            "#productTableBody tr"
        );


    rows.forEach(
        function(row) {


            const name =
                row.dataset.productName ||
                "";


            const rowCategory =
                row.dataset.productCategory ||
                "";


            const searchMatch =
                name.includes(
                    search
                );


            const categoryMatch =

                category === "all"

                ||

                rowCategory ===
                    category;


            if (
                searchMatch &&
                categoryMatch
            ) {

                row.style.display = "";

            }

            else {

                row.style.display =
                    "none";

            }

        }
    );

}


/* =====================================================
   DELETE PRODUCT
   ===================================================== */

function deleteProduct(id) {

    const products =
        getProducts();


    const product =
        products.find(
            function(item) {

                return Number(item.id) ===
                    Number(id);

            }
        );


    if (!product) {
        return;
    }


    const confirmation =
        confirm(
            `Delete "${product.name}"?`
        );


    if (!confirmation) {
        return;
    }


    const updatedProducts =
        products.filter(
            function(item) {

                return Number(item.id) !==
                    Number(id);

            }
        );


    saveProducts(
        updatedProducts
    );


    displayAdminProducts();

    displayProducts();


    alert(
        "Product deleted successfully."
    );

}


/* =====================================================
   EDIT PRODUCT
   ===================================================== */

function editProduct(id) {

    const products =
        getProducts();


    const product =
        products.find(
            function(item) {

                return Number(item.id) ===
                    Number(id);

            }
        );


    if (!product) {
        return;
    }


    const productName =
        document.getElementById(
            "productName"
        );


    const productCategory =
        document.getElementById(
            "productCategory"
        );


    const category =
        document.getElementById(
            "category"
        );


    const composition =
        document.getElementById(
            "composition"
        );


    const productMRP =
        document.getElementById(
            "productMRP"
        );


    const mrp =
        document.getElementById(
            "mrp"
        );


    const productRate =
        document.getElementById(
            "productRate"
        );


    const rate =
        document.getElementById(
            "rate"
        );


    const packSize =
        document.getElementById(
            "packSize"
        );


    const manufacturer =
        document.getElementById(
            "manufacturer"
        );


    const productStatus =
        document.getElementById(
            "productStatus"
        );


    const status =
        document.getElementById(
            "status"
        );


    const productDescription =
        document.getElementById(
            "productDescription"
        );


    const description =
        document.getElementById(
            "description"
        );


    if (productName) {

        productName.value =
            product.name || "";

    }


    if (productCategory) {

        productCategory.value =
            product.category || "";

    }


    if (category) {

        category.value =
            product.category || "";

    }


    if (composition) {

        composition.value =
            product.composition || "";

    }


    if (productMRP) {

        productMRP.value =
            product.mrp || "";

    }


    if (mrp) {

        mrp.value =
            product.mrp || "";

    }


    if (productRate) {

        productRate.value =
            product.rate || "";

    }


    if (rate) {

        rate.value =
            product.rate || "";

    }


    if (packSize) {

        packSize.value =
            product.packSize || "";

    }


    if (manufacturer) {

        manufacturer.value =
            product.manufacturer || "";

    }


    if (productStatus) {

        productStatus.value =
            isProductAvailable(
                product.status
            )
                ? "Available"
                : "Out of Stock";

    }


    if (status) {

        status.value =
            isProductAvailable(
                product.status
            )
                ? "Available"
                : "Out of Stock";

    }


    if (productDescription) {

        productDescription.value =
            product.description || "";

    }


    if (description) {

        description.value =
            product.description || "";

    }


    const form =
        document.getElementById(
            "productForm"
        );


    if (form) {

        form.dataset.editId =
            id;

    }


    const addProductSection =
        document.getElementById(
            "add-product"
        );


    const addProductSection2 =
        document.getElementById(
            "addProductSection"
        );


    if (addProductSection) {

        addProductSection.scrollIntoView({
            behavior: "smooth"
        });

    }

    else if (addProductSection2) {

        addProductSection2.scrollIntoView({
            behavior: "smooth"
        });

    }


    const submitButton =
        document.querySelector(
            "#productForm .dashboard-primary-button"
        );


    const saveButton =
        document.querySelector(
            "#productForm .save-btn"
        );


    if (submitButton) {

        submitButton.textContent =
            "Update Product";

    }


    if (saveButton) {

        saveButton.textContent =
            "Update Product";

    }

}


/* =====================================================
   ADD / UPDATE PRODUCT
   ===================================================== */

function setupProductForm() {

    const form =
        document.getElementById(
            "productForm"
        );


    if (!form) {
        return;
    }


    form.addEventListener(
        "submit",
        function(event) {

            event.preventDefault();


            /* =====================================
               GET FORM VALUES
               ===================================== */

            const nameElement =
                document.getElementById(
                    "productName"
                );


            const categoryElement =
                document.getElementById(
                    "productCategory"
                );


            const categoryElement2 =
                document.getElementById(
                    "category"
                );


            const compositionElement =
                document.getElementById(
                    "composition"
                );


            const mrpElement =
                document.getElementById(
                    "productMRP"
                );


            const mrpElement2 =
                document.getElementById(
                    "mrp"
                );


            const rateElement =
                document.getElementById(
                    "productRate"
                );


            const rateElement2 =
                document.getElementById(
                    "rate"
                );


            const packSizeElement =
                document.getElementById(
                    "packSize"
                );


            const manufacturerElement =
                document.getElementById(
                    "manufacturer"
                );


            const statusElement =
                document.getElementById(
                    "productStatus"
                );


            const statusElement2 =
                document.getElementById(
                    "status"
                );


            const descriptionElement =
                document.getElementById(
                    "productDescription"
                );


            const descriptionElement2 =
                document.getElementById(
                    "description"
                );


            const imageInput =
                document.getElementById(
                    "productImage"
                );


            /* =====================================
               VALUES
               ===================================== */

            const name =
                nameElement
                    ? nameElement.value.trim()
                    : "";


            const category =
                (
                    categoryElement
                        ? categoryElement.value
                        : categoryElement2
                            ? categoryElement2.value
                            : ""
                )
                .toLowerCase()
                .trim();


            const composition =
                compositionElement
                    ? compositionElement.value.trim()
                    : "";


            const mrp =
                Number(
                    mrpElement
                        ? mrpElement.value
                        : mrpElement2
                            ? mrpElement2.value
                            : 0
                );


            const rate =
                Number(
                    rateElement
                        ? rateElement.value
                        : rateElement2
                            ? rateElement2.value
                            : 0
                );


            const packSize =
                packSizeElement
                    ? packSizeElement.value.trim()
                    : "";


            const manufacturer =
                manufacturerElement
                    ? manufacturerElement.value.trim()
                    : "";


            const rawStatus =
                statusElement
                    ? statusElement.value
                    : statusElement2
                        ? statusElement2.value
                        : "Available";


            const status =
                isProductAvailable(
                    rawStatus
                )
                    ? "Available"
                    : "Out of Stock";


            const description =
                descriptionElement
                    ? descriptionElement.value.trim()
                    : descriptionElement2
                        ? descriptionElement2.value.trim()
                        : "";


            const editId =
                form.dataset.editId;


            let products =
                getProducts();


            /* =====================================
               SAVE PRODUCT
               ===================================== */

            function saveProduct(image) {

                const productData = {

                    name:
                        name,

                    category:
                        category,

                    composition:
                        composition,

                    mrp:
                        mrp,

                    rate:
                        rate,

                    packSize:
                        packSize,

                    manufacturer:
                        manufacturer,

                    status:
                        status,

                    description:
                        description,

                    image:
                        image

                };


                /* =================================
                   UPDATE
                   ================================= */

                if (editId) {

                    products =
                        products.map(
                            function(product) {


                                if (
                                    Number(
                                        product.id
                                    ) === Number(
                                        editId
                                    )
                                ) {

                                    return {

                                        ...product,

                                        ...productData

                                    };

                                }


                                return product;

                            }
                        );


                    alert(
                        "Product updated successfully."
                    );

                }


                /* =================================
                   ADD
                   ================================= */

                else {

                    productData.id =
                        Date.now();


                    products.push(
                        productData
                    );


                    alert(
                        "Product added successfully."
                    );

                }


                /* =================================
                   SAVE LOCAL STORAGE
                   ================================= */

                saveProducts(
                    products
                );


                /* =================================
                   SYNC PRODUCT WITH MYSQL
                   ================================= */

                const savedProduct =
                    editId

                        ? products.find(
                            function(product) {

                                return Number(
                                    product.id
                                ) === Number(
                                    editId
                                );

                            }
                        )

                        : productData;


                const data = {

                    action:
                        editId
                            ? "update"
                            : "add",

                    id:
                        editId
                            ? Number(editId)
                            : 0,

                    name:
                        savedProduct.name || "",

                    category:
                        savedProduct.category || "",

                    composition:
                        savedProduct.composition || "",

                    mrp:
                        Number(
                            savedProduct.mrp || 0
                        ),

                    rate:
                        Number(
                            savedProduct.rate || 0
                        ),

                    packSize:
                        savedProduct.packSize || "",

                    manufacturer:
                        savedProduct.manufacturer || "",

                    image:
                        savedProduct.image || "",

                    status:
                        isProductAvailable(
                            savedProduct.status
                        )
                            ? "Available"
                            : "Out of Stock"

                };


                fetch("api.php", {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(data)

                })

                .then(function(response) {

                    return response.json();

                })

                .then(function(result) {

                    console.log(
                        "Database:",
                        result
                    );

                })

                .catch(function(error) {

                    console.error(
                        "Database sync error:",
                        error
                    );

                });


                /* =================================
                   RESET
                   ================================= */

                form.reset();


                delete form.dataset.editId;


                /* =================================
                   RESET BUTTON
                   ================================= */

                const submitButton =
                    document.querySelector(
                        "#productForm .dashboard-primary-button"
                    );


                const saveButton =
                    document.querySelector(
                        "#productForm .save-btn"
                    );


                if (submitButton) {

                    submitButton.textContent =
                        "Save Product";

                }


                if (saveButton) {

                    saveButton.textContent =
                        "Save Product";

                }


                /* =================================
                   REFRESH
                   ================================= */

                displayAdminProducts();

                displayProducts();

            }


            /* =====================================
               IMAGE
               ===================================== */

            if (
                imageInput &&
                imageInput.files.length > 0
            ) {


                const file =
                    imageInput.files[0];


                const reader =
                    new FileReader();


                reader.onload =
                    function(event) {

                        saveProduct(
                            event.target.result
                        );

                    };


                reader.readAsDataURL(
                    file
                );

            }

            else {

                saveProduct(
                    ""
                );

            }

        }
    );

}


/* =====================================================
   MOBILE MENU
   ===================================================== */

function setupMobileMenu() {

    const menuButton =
        document.getElementById(
            "menuButton"
        );


    const navMenu =
        document.querySelector(
            ".nav-menu"
        );


    if (
        menuButton &&
        navMenu
    ) {

        menuButton.addEventListener(
            "click",
            function() {

                navMenu.classList.toggle(
                    "show"
                );

            }
        );

    }

}


/* =====================================================
   LOGOUT
   ===================================================== */

function logout() {

    const confirmLogout =
        confirm(
            "Are you sure you want to logout?"
        );


    if (confirmLogout) {

        window.location.href =
            "admin.html";

    }

}


/* =====================================================
   MODAL CLOSE
   ===================================================== */

document.addEventListener(
    "click",
    function(event) {


        const modal =
            document.getElementById(
                "productModal"
            );


        if (
            modal &&
            event.target === modal
        ) {

            closeProduct();

        }

    }
);


/* =====================================================
   ESC KEY - CLOSE MODAL
   ===================================================== */

document.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key === "Escape"
        ) {

            closeProduct();

        }

    }
);


/* =====================================================
   HTML SECURITY
   ===================================================== */

function escapeHTML(value) {

    return String(
        value || ""
    )

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


/* =====================================================
   INITIALIZE WEBSITE
   ===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function() {


        displayProducts();


        displayAdminProducts();


        setupProductForm();


        setupMobileMenu();


        /* =====================================
           WEBSITE SEARCH
           ===================================== */

        const searchInput =
            document.getElementById(
                "searchInput"
            );


        if (searchInput) {

            searchInput.addEventListener(
                "input",
                filterWebsiteProducts
            );

        }


        /* =====================================
           WEBSITE CATEGORY FILTER
           ===================================== */

        const categoryFilter =
            document.getElementById(
                "categoryFilter"
            );


        if (categoryFilter) {

            categoryFilter.addEventListener(
                "change",
                filterWebsiteProducts
            );

        }


        /* =====================================
           ADMIN SEARCH
           ===================================== */

        const adminSearch =
            document.getElementById(
                "adminSearch"
            );


        if (adminSearch) {

            adminSearch.addEventListener(
                "input",
                searchAdminProducts
            );

        }


        /* =====================================
           ADMIN CATEGORY
           ===================================== */

        const adminCategory =
            document.getElementById(
                "adminCategory"
            );


        if (adminCategory) {

            adminCategory.addEventListener(
                "change",
                searchAdminProducts
            );

        }

    }
);