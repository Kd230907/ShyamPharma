/* =====================================================
   SHYAM PHARMA
   PUBLIC WEBSITE

   Products are read from Supabase. This file only ever
   reads - nothing on the public site can write to the
   database, and the Row Level Security policies
   enforce that on the server as well.
   ===================================================== */


/* =====================================================
   PRODUCT CACHE

   Filled once on page load so the details modal does
   not need a second network round trip.
   ===================================================== */

let websiteProducts = [];


/* =====================================================
   WEBSITE PRODUCT DISPLAY
   ===================================================== */

async function displayProducts() {

    const productGrid =
        document.getElementById(
            "productsGrid"
        );


    if (!productGrid) {
        return;
    }


    /* =====================================
       LOADING STATE
       ===================================== */

    productGrid.innerHTML = `

        <p class="products-message">
            Loading products…
        </p>

    `;


    try {

        websiteProducts =
            await fetchProducts();

    }

    catch (error) {

        console.error(
            "Could not load products:",
            error
        );


        productGrid.innerHTML = `

            <p class="products-message">
                Products are unavailable right now.
                Please try again later.
            </p>

        `;


        return;

    }


    if (websiteProducts.length === 0) {

        productGrid.innerHTML = `

            <p class="products-message">
                No products have been added yet.
            </p>

        `;


        return;

    }


    productGrid.innerHTML = "";


    websiteProducts.forEach(
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
                        src="${escapeHTML(product.image)}"
                        alt="${escapeHTML(product.name)}"
                        loading="lazy"
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

    const product =
        websiteProducts.find(
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


    /* =====================================
       TEXT FIELDS
       ===================================== */

    setModalText(
        "modalProductName",
        product.name || ""
    );


    setModalText(
        "modalProductDescription",
        product.description ||
        product.composition ||
        ""
    );


    setModalText(
        "modalComposition",
        product.composition || "—"
    );


    setModalText(
        "modalMRP",
        "₹" +
        Number(
            product.mrp || 0
        ).toFixed(0)
    );


    setModalText(
        "modalRate",
        "₹" +
        Number(
            product.rate || 0
        ).toFixed(0)
    );


    setModalText(
        "modalPackSize",
        product.packSize || "—"
    );


    setModalText(
        "modalManufacturer",
        product.manufacturer || "—"
    );


    /* =====================================
       IMAGE
       ===================================== */

    const imageElement =
        document.getElementById(
            "modalProductImage"
        );


    const placeholderElement =
        document.getElementById(
            "modalProductPlaceholder"
        );


    if (
        imageElement &&
        placeholderElement
    ) {

        if (product.image) {

            imageElement.src =
                product.image;

            imageElement.alt =
                product.name || "Product Image";

            imageElement.style.display =
                "block";

            placeholderElement.style.display =
                "none";

        }

        else {

            imageElement.removeAttribute("src");

            imageElement.style.display =
                "none";

            placeholderElement.style.display =
                "flex";

        }

    }


    /* =====================================
       STATUS
       ===================================== */

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
            "modal-status " +
            (available
                ? "available"
                : "out-stock"
            );

    }


    modal.classList.add(
        "show"
    );


    document.body.style.overflow =
        "hidden";

}


/* =====================================================
   MODAL TEXT HELPER
   ===================================================== */

function setModalText(elementId, value) {

    const element =
        document.getElementById(
            elementId
        );


    if (element) {

        element.textContent = value;

    }

}


/* =====================================================
   OPEN PRODUCT BY NAME
   ===================================================== */

function openProduct(productName) {

    const product =
        websiteProducts.find(
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
   HTML SECURITY
   ===================================================== */

function escapeHTML(value) {

    return String(value)

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


        if (!isSupabaseConfigured()) {

            console.error(
                "Supabase is not configured. Add your key to supabase-config.js."
            );

        }


        displayProducts();


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

    }
);
