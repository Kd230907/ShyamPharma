/* =====================================================
   SHYAM PHARMA
   SUPABASE DATA LAYER

   Every database, storage and authentication call in
   this project goes through this file. The pages
   themselves never talk to Supabase directly.

   Load order on every page:

       supabase-js (CDN)
       supabase-config.js
       supabase-data.js
   ===================================================== */


/* =====================================================
   CLIENT

   The supabase-js UMD build puts createClient on the
   global "supabase" object, so the client instance is
   named sbClient to avoid shadowing it.
   ===================================================== */

const sbClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY,
        {
            auth: {
                persistSession: true,
                autoRefreshToken: true
            }
        }
    );


/* =====================================================
   CONFIGURATION CHECK
   ===================================================== */

function isSupabaseConfigured() {

    const key =
        String(SUPABASE_ANON_KEY || "").trim();


    /* =====================================
       The key's shape is checked rather
       than comparing it against the
       placeholder text, because a project
       wide find and replace of the
       placeholder would otherwise rewrite
       the comparison here too and leave
       this check permanently false.

       Publishable keys start with
       sb_publishable_ and legacy anon keys
       are JWTs, which start with eyJ.
       ===================================== */

    return (
        key.startsWith("sb_publishable_") ||
        key.startsWith("eyJ")
    );

}


/* =====================================================
   STATUS NORMALIZATION

   The database only accepts these two exact strings,
   so everything is funnelled through here before it
   is written.
   ===================================================== */

function isProductAvailable(status) {

    return String(status || "")
        .trim()
        .toLowerCase() === "available";

}


function normalizeStatus(status) {

    return isProductAvailable(status)
        ? "Available"
        : "Out of Stock";

}


/* =====================================================
   ROW  ->  APP SHAPE

   The database uses snake_case columns. The rest of
   the application uses camelCase.
   ===================================================== */

function toAppProduct(row) {

    return {

        id:
            Number(row.id),

        name:
            row.product_name || "",

        category:
            row.category || "",

        composition:
            row.composition || "",

        mrp:
            Number(row.mrp || 0),

        rate:
            Number(row.rate || 0),

        packSize:
            row.pack_size || "",

        manufacturer:
            row.manufacturer || "",

        description:
            row.description || "",

        image:
            row.image_url || "",

        status:
            normalizeStatus(row.status)

    };

}


/* =====================================================
   APP SHAPE  ->  ROW
   ===================================================== */

function toDbProduct(product) {

    return {

        product_name:
            String(product.name || "").trim(),

        category:
            String(product.category || "").trim(),

        composition:
            String(product.composition || "").trim(),

        mrp:
            Number(product.mrp || 0),

        rate:
            Number(product.rate || 0),

        pack_size:
            String(product.packSize || "").trim(),

        manufacturer:
            String(product.manufacturer || "").trim(),

        description:
            String(product.description || "").trim(),

        image_url:
            String(product.image || ""),

        status:
            normalizeStatus(product.status)

    };

}


/* =====================================================
   FETCH ALL PRODUCTS
   ===================================================== */

async function fetchProducts() {

    const { data, error } =
        await sbClient
            .from("products")
            .select("*")
            .order("created_at", { ascending: false });


    if (error) {

        throw error;

    }


    return (data || []).map(toAppProduct);

}


/* =====================================================
   INSERT PRODUCT
   ===================================================== */

async function insertProduct(product) {

    const { data, error } =
        await sbClient
            .from("products")
            .insert(toDbProduct(product))
            .select()
            .single();


    if (error) {

        throw error;

    }


    return toAppProduct(data);

}


/* =====================================================
   UPDATE PRODUCT
   ===================================================== */

async function updateProduct(id, product) {

    const { data, error } =
        await sbClient
            .from("products")
            .update(toDbProduct(product))
            .eq("id", Number(id))
            .select()
            .single();


    if (error) {

        throw error;

    }


    return toAppProduct(data);

}


/* =====================================================
   DELETE PRODUCT
   ===================================================== */

async function deleteProductRow(id) {

    const { error } =
        await sbClient
            .from("products")
            .delete()
            .eq("id", Number(id));


    if (error) {

        throw error;

    }

}


/* =====================================================
   DELETE EVERY PRODUCT
   ===================================================== */

async function deleteAllProducts() {

    const { error } =
        await sbClient
            .from("products")
            .delete()
            .gte("id", 0);


    if (error) {

        throw error;

    }

}


/* =====================================================
   BYTE FORMATTING
   ===================================================== */

function formatBytes(bytes) {

    if (bytes < 1024) {

        return bytes + " B";

    }


    if (bytes < 1024 * 1024) {

        return Math.round(bytes / 1024) + " KB";

    }


    return (bytes / (1024 * 1024)).toFixed(1) + " MB";

}


/* =====================================================
   WEBP SUPPORT

   WebP is roughly 25-35% smaller than JPEG at the same
   quality and, unlike JPEG, keeps transparency. Every
   current browser supports it, but the check costs
   nothing and the JPEG path is a safe fallback.
   ===================================================== */

let webPSupport = null;


function supportsWebP() {

    if (webPSupport !== null) {

        return webPSupport;

    }


    const canvas =
        document.createElement("canvas");


    canvas.width = 1;

    canvas.height = 1;


    webPSupport =
        canvas
            .toDataURL("image/webp")
            .indexOf("data:image/webp") === 0;


    return webPSupport;

}


/* =====================================================
   DECODE AN IMAGE FILE

   createImageBitmap is preferred because it applies the
   EXIF orientation flag, which is what stops portrait
   photos from a phone arriving sideways.
   ===================================================== */

async function decodeImageFile(file) {

    if (typeof createImageBitmap === "function") {

        try {

            return await createImageBitmap(
                file,
                {
                    imageOrientation: "from-image"
                }
            );

        }

        catch (error) {

            /* Older browsers reject the options
               argument. Fall through to the <img>
               path, which applies EXIF orientation
               by default in current browsers. */

        }

    }


    return await new Promise(
        function(resolve, reject) {

            const objectUrl =
                URL.createObjectURL(file);


            const image = new Image();


            image.onload =
                function() {

                    URL.revokeObjectURL(objectUrl);

                    resolve(image);

                };


            image.onerror =
                function() {

                    URL.revokeObjectURL(objectUrl);

                    reject(
                        new Error(
                            "That file could not be read as an image."
                        )
                    );

                };


            image.src = objectUrl;

        }
    );

}


/* =====================================================
   CANVAS -> BLOB
   ===================================================== */

function canvasToBlob(canvas, type, quality) {

    return new Promise(
        function(resolve) {

            canvas.toBlob(
                function(blob) {

                    resolve(blob);

                },
                type,
                quality
            );

        }
    );

}


/* =====================================================
   COMPRESS AN IMAGE

   Scales the longest edge down to IMAGE_MAX_DIMENSION
   and re-encodes at IMAGE_QUALITY. Returns the original
   file untouched whenever compressing would not
   actually help.
   ===================================================== */

async function compressImage(file) {

    /* =====================================
       PASS THROUGH WHAT SHOULD NOT BE
       RE-ENCODED

       SVG is vector and would be rasterised.
       GIF may be animated and canvas would
       flatten it to a single frame.
       ===================================== */

    if (
        !file.type.startsWith("image/") ||
        file.type === "image/svg+xml" ||
        file.type === "image/gif"
    ) {

        return file;

    }


    let source;


    try {

        source = await decodeImageFile(file);

    }

    catch (error) {

        console.error(
            "Could not decode image, uploading original:",
            error
        );


        return file;

    }


    /* =====================================
       TARGET SIZE
       ===================================== */

    const longestEdge =
        Math.max(
            source.width,
            source.height
        );


    const scale =
        Math.min(
            1,
            IMAGE_MAX_DIMENSION / longestEdge
        );


    const width =
        Math.max(
            1,
            Math.round(source.width * scale)
        );


    const height =
        Math.max(
            1,
            Math.round(source.height * scale)
        );


    /* =====================================
       DRAW
       ===================================== */

    const canvas =
        document.createElement("canvas");


    canvas.width = width;

    canvas.height = height;


    const context =
        canvas.getContext("2d");


    context.imageSmoothingQuality = "high";


    const useWebP = supportsWebP();


    /* JPEG has no alpha channel, so anything
       transparent would turn black without a
       white background painted underneath. */

    if (!useWebP) {

        context.fillStyle = "#ffffff";

        context.fillRect(0, 0, width, height);

    }


    context.drawImage(
        source,
        0, 0,
        width, height
    );


    if (typeof source.close === "function") {

        source.close();

    }


    /* =====================================
       ENCODE
       ===================================== */

    const type =
        useWebP
            ? "image/webp"
            : "image/jpeg";


    const blob =
        await canvasToBlob(
            canvas,
            type,
            IMAGE_QUALITY
        );


    /* =====================================
       KEEP WHICHEVER IS SMALLER

       An already optimised file can come out
       larger after re-encoding. When that
       happens the original wins.
       ===================================== */

    if (
        !blob ||
        blob.size >= file.size
    ) {

        return file;

    }


    const extension =
        useWebP
            ? "webp"
            : "jpg";


    const baseName =
        (file.name || "product")
            .replace(/\.[^.]+$/, "");


    return new File(
        [blob],
        baseName + "." + extension,
        {
            type: type
        }
    );

}


/* =====================================================
   UPLOAD PRODUCT IMAGE

   Compresses first, then stores the result and returns
   its public URL. onProgress, if supplied, is called
   with a short status message for the toast.
   ===================================================== */

async function uploadProductImage(file, onProgress) {

    if (onProgress) {

        onProgress("Optimising image...");

    }


    const compressed =
        await compressImage(file);


    if (onProgress) {

        if (compressed.size < file.size) {

            onProgress(
                "Uploading " +
                formatBytes(compressed.size) +
                " (was " +
                formatBytes(file.size) +
                ")..."
            );

        }

        else {

            onProgress(
                "Uploading " +
                formatBytes(compressed.size) +
                "..."
            );

        }

    }


    const extension =
        (compressed.name.split(".").pop() || "webp")
            .toLowerCase();


    const fileName =
        "product-" +
        Date.now() +
        "-" +
        Math.random().toString(36).slice(2, 8) +
        "." +
        extension;


    const { error } =
        await sbClient
            .storage
            .from(SUPABASE_IMAGE_BUCKET)
            .upload(fileName, compressed, {
                cacheControl: "3600",
                contentType: compressed.type,
                upsert: false
            });


    if (error) {

        throw error;

    }


    const { data } =
        sbClient
            .storage
            .from(SUPABASE_IMAGE_BUCKET)
            .getPublicUrl(fileName);


    return data.publicUrl;

}


/* =====================================================
   STORAGE PATH FROM A PUBLIC URL

   Returns null for anything that is not a file in our
   own bucket, so an image referenced by a relative
   repository path is never treated as deletable.
   ===================================================== */

function storagePathFromUrl(url) {

    const marker =
        "/storage/v1/object/public/" +
        SUPABASE_IMAGE_BUCKET +
        "/";


    const value = String(url || "");


    const index = value.indexOf(marker);


    if (index === -1) {

        return null;

    }


    return decodeURIComponent(
        value
            .slice(index + marker.length)
            .split("?")[0]
    );

}


/* =====================================================
   DELETE A PRODUCT IMAGE

   Called when an image is replaced or its product is
   removed, so the bucket does not accumulate files that
   nothing references any more.

   Deliberately does not throw. Losing the row but
   keeping a stray file is a far better outcome than
   failing the delete the admin actually asked for.
   ===================================================== */

async function deleteProductImage(url) {

    const path = storagePathFromUrl(url);


    if (!path) {

        return;

    }


    const { error } =
        await sbClient
            .storage
            .from(SUPABASE_IMAGE_BUCKET)
            .remove([path]);


    if (error) {

        console.error(
            "Could not delete stored image:",
            error
        );

    }

}


/* =====================================================
   DELETE MANY PRODUCT IMAGES
   ===================================================== */

async function deleteProductImages(urls) {

    const paths =
        (urls || [])
            .map(storagePathFromUrl)
            .filter(function(path) {

                return path !== null;

            });


    if (paths.length === 0) {

        return;

    }


    const { error } =
        await sbClient
            .storage
            .from(SUPABASE_IMAGE_BUCKET)
            .remove(paths);


    if (error) {

        console.error(
            "Could not delete stored images:",
            error
        );

    }

}


/* =====================================================
   SITE SETTINGS
   ===================================================== */

async function fetchSettings() {

    const { data, error } =
        await sbClient
            .from("site_settings")
            .select("*")
            .eq("id", 1)
            .maybeSingle();


    if (error) {

        throw error;

    }


    if (!data) {

        return null;

    }


    return {

        companyName:
            data.company_name || "",

        phone:
            data.phone || "",

        email:
            data.email || "",

        address:
            data.address || "",

        websiteTitle:
            data.website_title || "",

        tagline:
            data.tagline || "",

        description:
            data.description || "",

        theme:
            data.theme === "dark"
                ? "dark"
                : "light"

    };

}


async function saveSettingsRow(settings) {

    const { error } =
        await sbClient
            .from("site_settings")
            .update({

                company_name:
                    String(settings.companyName || "").trim(),

                phone:
                    String(settings.phone || "").trim(),

                email:
                    String(settings.email || "").trim(),

                address:
                    String(settings.address || "").trim(),

                website_title:
                    String(settings.websiteTitle || "").trim(),

                tagline:
                    String(settings.tagline || "").trim(),

                description:
                    String(settings.description || "").trim(),

                theme:
                    settings.theme === "dark"
                        ? "dark"
                        : "light"

            })
            .eq("id", 1);


    if (error) {

        throw error;

    }

}


/* =====================================================
   AUTHENTICATION
   ===================================================== */

async function signIn(email, password) {

    const { data, error } =
        await sbClient
            .auth
            .signInWithPassword({
                email: email,
                password: password
            });


    if (error) {

        throw error;

    }


    return data;

}


async function signOut() {

    await sbClient.auth.signOut();

}


async function getSession() {

    const { data } =
        await sbClient.auth.getSession();


    return data.session;

}


/* =====================================================
   CHANGE PASSWORD

   The current password is verified by signing in with
   it first, because Supabase does not require the old
   password on an update.
   ===================================================== */

async function changePassword(currentPassword, newPassword) {

    const session =
        await getSession();


    if (!session) {

        throw new Error(
            "You are not signed in."
        );

    }


    await signIn(
        session.user.email,
        currentPassword
    );


    const { error } =
        await sbClient
            .auth
            .updateUser({
                password: newPassword
            });


    if (error) {

        throw error;

    }

}


/* =====================================================
   PAGE GUARD

   Sends the visitor back to the login page unless a
   valid Supabase session exists.
   ===================================================== */

async function requireAdminSession() {

    const session =
        await getSession();


    if (!session) {

        window.location.replace("admin.html");

        return null;

    }


    return session;

}
