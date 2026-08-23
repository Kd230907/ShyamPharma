<?php

header("Content-Type: application/json");

include "db.php";

if ($conn->connect_error) {
    echo json_encode([
        "success" => false,
        "message" => "Database connection failed"
    ]);
    exit;
}


/* =====================================================
   GET ALL PRODUCTS
   ===================================================== */

if ($_SERVER["REQUEST_METHOD"] === "GET") {

    $result = $conn->query(
        "SELECT * FROM products ORDER BY id DESC"
    );

    $products = [];

    while ($row = $result->fetch_assoc()) {

        $products[] = [

            "id" => (int)$row["id"],

            "name" => $row["product_name"] ?? "",

            "category" => $row["category"] ?? "",

            "composition" => $row["composition"] ?? "",

            "mrp" => (float)($row["mrp"] ?? 0),

            "rate" => (float)($row["rate"] ?? 0),

            "packSize" => $row["pack_size"] ?? "",

            "manufacturer" => $row["manufacturer"] ?? "",

            "image" => $row["image"] ?? "",

            "status" => $row["status"] ?? "Out of Stock"

        ];

    }

    echo json_encode([
        "success" => true,
        "products" => $products
    ]);

    exit;
}


/* =====================================================
   POST DATA
   ===================================================== */

if ($_SERVER["REQUEST_METHOD"] === "POST") {

    $input = json_decode(
        file_get_contents("php://input"),
        true
    );


    if (!$input) {

        echo json_encode([
            "success" => false,
            "message" => "Invalid JSON data"
        ]);

        exit;
    }


    $action = $input["action"] ?? "";


    /* =================================================
       ADD PRODUCT
       ================================================= */

    if ($action === "add") {

        $name =
            trim($input["name"] ?? "");

        $category =
            trim($input["category"] ?? "");

        $composition =
            trim($input["composition"] ?? "");

        $mrp =
            (float)($input["mrp"] ?? 0);

        $rate =
            (float)($input["rate"] ?? 0);

        $packSize =
            trim($input["packSize"] ?? "");

        $manufacturer =
            trim($input["manufacturer"] ?? "");

        $image =
            $input["image"] ?? "";

        $status =
            trim($input["status"] ?? "Out of Stock");


        if (
            strtolower($status)
            !== "available"
        ) {

            $status = "Out of Stock";

        }

        else {

            $status = "Available";

        }


        $stmt = $conn->prepare(

            "INSERT INTO products
            (
                product_name,
                category,
                composition,
                mrp,
                rate,
                pack_size,
                manufacturer,
                image,
                status
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"

        );


        $stmt->bind_param(
            "sssddssss",
            $name,
            $category,
            $composition,
            $mrp,
            $rate,
            $packSize,
            $manufacturer,
            $image,
            $status
        );


        if ($stmt->execute()) {

            echo json_encode([
                "success" => true,
                "message" => "Product added successfully",
                "id" => $conn->insert_id
            ]);

        }

        else {

            echo json_encode([
                "success" => false,
                "message" => $stmt->error
            ]);

        }


        $stmt->close();

        exit;
    }


    /* =================================================
       UPDATE PRODUCT
       ================================================= */

    if ($action === "update") {

        $id =
            (int)($input["id"] ?? 0);

        $name =
            trim($input["name"] ?? "");

        $category =
            trim($input["category"] ?? "");

        $composition =
            trim($input["composition"] ?? "");

        $mrp =
            (float)($input["mrp"] ?? 0);

        $rate =
            (float)($input["rate"] ?? 0);

        $packSize =
            trim($input["packSize"] ?? "");

        $manufacturer =
            trim($input["manufacturer"] ?? "");

        $image =
            $input["image"] ?? "";

        $status =
            trim($input["status"] ?? "Out of Stock");


        if (
            strtolower($status)
            === "available"
        ) {

            $status = "Available";

        }

        else {

            $status = "Out of Stock";

        }


        $stmt = $conn->prepare(

            "UPDATE products SET

                product_name = ?,
                category = ?,
                composition = ?,
                mrp = ?,
                rate = ?,
                pack_size = ?,
                manufacturer = ?,
                image = ?,
                status = ?

             WHERE id = ?"

        );


        $stmt->bind_param(
            "sssddssssi",
            $name,
            $category,
            $composition,
            $mrp,
            $rate,
            $packSize,
            $manufacturer,
            $image,
            $status,
            $id
        );


        if ($stmt->execute()) {

            echo json_encode([
                "success" => true,
                "message" => "Product updated successfully"
            ]);

        }

        else {

            echo json_encode([
                "success" => false,
                "message" => $stmt->error
            ]);

        }


        $stmt->close();

        exit;
    }


    /* =================================================
       DELETE PRODUCT
       ================================================= */

    if ($action === "delete") {

        $id =
            (int)($input["id"] ?? 0);


        $stmt = $conn->prepare(
            "DELETE FROM products WHERE id = ?"
        );


        $stmt->bind_param(
            "i",
            $id
        );


        if ($stmt->execute()) {

            echo json_encode([
                "success" => true,
                "message" => "Product deleted successfully"
            ]);

        }

        else {

            echo json_encode([
                "success" => false,
                "message" => $stmt->error
            ]);

        }


        $stmt->close();

        exit;
    }


    echo json_encode([
        "success" => false,
        "message" => "Invalid action"
    ]);

    exit;
}


echo json_encode([
    "success" => false,
    "message" => "Invalid request"
]);

?>