<?php

include "db.php";

$result = $conn->query("SELECT * FROM products ORDER BY id DESC");

if (!$result) {
    die("Database Error: " . $conn->error);
}

?>

<!DOCTYPE html>
<html lang="en">
<head>

    <meta charset="UTF-8">

    <meta name="viewport"
          content="width=device-width, initial-scale=1.0">

    <title>SHYAM PHARMA - Products</title>

    <style>

        * {
            box-sizing: border-box;
        }

        body {
            margin: 0;
            font-family: Arial, sans-serif;
            background: #f5f6f8;
            color: #222;
        }

        .container {
            width: 92%;
            max-width: 1200px;
            margin: 50px auto;
        }

        h1 {
            font-size: 36px;
            margin-bottom: 8px;
        }

        .subtitle {
            color: #777;
            margin-bottom: 35px;
        }

        .products-grid {
            display: grid;
            grid-template-columns: repeat(
                auto-fit,
                minmax(280px, 1fr)
            );
            gap: 25px;
        }

        .product-card {
            background: white;
            border-radius: 16px;
            overflow: hidden;
            border: 1px solid #e5e5e5;
            box-shadow: 0 8px 25px rgba(0,0,0,0.06);
        }

        .product-image {
            height: 240px;
            background: #f3f3f3;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .product-image img {
            width: 100%;
            height: 100%;
            object-fit: contain;
        }

        .placeholder {
            font-size: 45px;
            font-weight: bold;
            color: #aaa;
        }

        .product-content {
            padding: 25px;
        }

        .category {
            font-size: 13px;
            font-weight: bold;
            letter-spacing: 2px;
            color: #777;
            text-transform: uppercase;
        }

        .product-name {
            font-size: 25px;
            margin: 10px 0 20px;
        }

        .details {
            display: grid;
            gap: 12px;
        }

        .detail {
            display: flex;
            justify-content: space-between;
            gap: 20px;
            border-bottom: 1px solid #eee;
            padding-bottom: 9px;
        }

        .label {
            color: #777;
        }

        .value {
            font-weight: 600;
            text-align: right;
        }

        .status {
            display: inline-block;
            padding: 8px 14px;
            border-radius: 30px;
            font-weight: bold;
            font-size: 13px;
        }

        .available {
            background: #e7f7ed;
            color: #16803c;
        }

        .out-stock {
            background: #fdeaea;
            color: #c62828;
        }

    </style>

</head>

<body>

<div class="container">

    <h1>SHYAM PHARMA - Products</h1>

    <div class="subtitle">
        Manage your pharmaceutical product catalogue
    </div>

    <div class="products-grid">

        <?php while ($row = $result->fetch_assoc()): ?>

            <?php

                $status = trim(
                    strtolower(
                        $row["status"] ?? ""
                    )
                );

                $isAvailable =
                    ($status === "available");

            ?>

            <div class="product-card">

                <div class="product-image">

                    <?php if (!empty($row["image"])): ?>

                        <img
                            src="<?= htmlspecialchars($row["image"]) ?>"
                            alt="<?= htmlspecialchars($row["product_name"]) ?>"
                        >

                    <?php else: ?>

                        <div class="placeholder">
                            P
                        </div>

                    <?php endif; ?>

                </div>


                <div class="product-content">

                    <div class="category">

                        <?= htmlspecialchars(
                            $row["category"] ?? ""
                        ) ?>

                    </div>


                    <div class="product-name">

                        <?= htmlspecialchars(
                            $row["product_name"] ?? ""
                        ) ?>

                    </div>


                    <div class="details">

                        <div class="detail">

                            <span class="label">
                                Composition
                            </span>

                            <span class="value">

                                <?= htmlspecialchars(
                                    $row["composition"] ?? "-"
                                ) ?>

                            </span>

                        </div>


                        <div class="detail">

                            <span class="label">
                                MRP
                            </span>

                            <span class="value">

                                ₹<?= htmlspecialchars(
                                    $row["mrp"] ?? "0"
                                ) ?>

                            </span>

                        </div>


                        <div class="detail">

                            <span class="label">
                                Rate
                            </span>

                            <span class="value">

                                ₹<?= htmlspecialchars(
                                    $row["rate"] ?? "0"
                                ) ?>

                            </span>

                        </div>


                        <div class="detail">

                            <span class="label">
                                Pack Size
                            </span>

                            <span class="value">

                                <?= htmlspecialchars(
                                    $row["pack_size"] ?? "-"
                                ) ?>

                            </span>

                        </div>


                        <div class="detail">

                            <span class="label">
                                Manufacturer
                            </span>

                            <span class="value">

                                <?= htmlspecialchars(
                                    $row["manufacturer"] ?? "-"
                                ) ?>

                            </span>

                        </div>


                        <div class="detail">

                            <span class="label">
                                Status
                            </span>

                            <span class="value">

                                <span class="status
                                    <?= $isAvailable
                                        ? "available"
                                        : "out-stock"
                                    ?>"
                                >

                                    <?= $isAvailable
                                        ? "Available"
                                        : "Out of Stock"
                                    ?>

                                </span>

                            </span>

                        </div>

                    </div>

                </div>

            </div>

        <?php endwhile; ?>

    </div>

</div>

</body>
</html>