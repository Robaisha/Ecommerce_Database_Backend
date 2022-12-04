const { application } = require("express");
const express = require("express");
const App = express();
const mysql = require("mysql");
App.use(express.json());
const bd = require("body-parser");
const cors = require("cors");
App.use(cors());
App.use(
  bd.urlencoded({
    urlencoded: false,
    extended: true,
  })
);
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "ecommerce",
});
db.connect(function (err) {
  if (err) {
    console.log(err);
  } else {
    console.log("connected");
  }
});
App.listen(8000, function (err) {
  if (err) {
    console.log(err);
  } else {
    console.log("App listening on port 8000");
  }
});
//to view all customers frontend required  JOIN LAGAO
App.get("/getcustomers", (req, res) => {
  const id = req.body.id;

  db.query(
    "SELECT Count(O.order_detail_id) AS OrderCount, C.customer_id,C.customer_name,C.customer_phone_no,C.customer_email,C.customer_address FROM customer C JOIN order_details O ON C.customer_id=O.customer_id GROUP BY C.customer_id",
    function (err, result, fields) {
      if (err) throw err;
      // db.query("SELECT Count(O.order_detail_id) FROM customer C JOIN order_details O ON C.customer_id=O.customer_id where C.customer_id=?", [id],function (err, result_count, fields) {
      //   if (err) throw err;

      //   res.send(result,result_count);
      // });

      res.send(result);
    }
  );
});
//to view order detail from order details table   JOIN LGAO  front end required
App.get("/orderdetails", (req, res) => {
  db.query(
    "SELECT * FROM order_details where order_detail_id=?",
    function (err, result, fields) {
      if (err) throw err;
      console.log(result);
    }
  );
});
//to add customer into customer table for register page
App.post("/postcustomer", (req, res) => {
  let customer = req.body;
  db.query(
    "INSERT INTO customer(customer_name,customer_email,customer_password,customer_phone_no,customer_address) VALUES(?,?,?,?,?)",
    [
      customer.customer_name,
      customer.customer_email,
      customer.customer_password,
      customer.customer_phone_no,
      customer.customer_address,
    ],
    function (err, result, fields) {
      if (err) {
        if (err.errno == 1062) {
          res.send({ message: "This Email Already Exists" });
          return;
        }
      }
      console.log(result);
      res.send({ message: "Customer added Login to Continue" });
    }
  );
});
//to add admin LOGIN PAGE
App.post("/postadmin", (req, res) => {
  console.log(req.body);
  let admin = req.body;
  db.query(
    "INSERT INTO admin (email,password,role) VALUES(?,?,?)",
    [admin.email, admin.password, admin.role],
    function (err, result, fields) {
      if (err) throw err;
      res.send({ message: "Admin added" });
    }
  );
});
//to add products to database (admin)
App.post("/addproduct", (req, res) => {
  console.log(req.body);
  let product = req.body;
  db.query(
    "INSERT INTO product (product_size,product_price,product_name,product_color,quantity,category_name,product_desc) VALUES(?,?,?,?,?,?,?)",
    [
      product.product_size,
      product.product_price,
      product.product_name,
      product.product_color,
      product.quantity,
      product.category_name,
      product.product_desc,
    ],
    function (err, result, fields) {
      if (err) throw err;
      res.send({ message: "Product Added" });
    }
  );
});
//to delete products from database (admin) frontend required
App.delete("/deleteproduct/:id", (req, res) => {
  console.log(req.body);
  const id = req.params.id;
  let product = req.body;
  db.query(
    "DELETE FROM product WHERE product_no=?",
    [id],
    function (err, result, fields) {
      if (err) throw err;
      res.send({ message: "Product Deleted" });
    }
  );
});

//to update products in database (admin)  front end required
App.patch("/updateproduct/:id", (req, res) => {
  console.log(req.body);
  const id = req.params.id;
  let product = req.body;
  db.query(
    "UPDATE `product` SET `product_size`=?,`product_price`=?,`product_name`=?,`product_color`=?,`quantity`=?,`category_name`=?,`product_desc`=? where product_no=?",
    [
      product.product_size,
      product.product_price,
      product.product_name,
      product.product_color,
      product.quantity,
      product.category_name,
      product.product_desc,
      id,
    ],
    function (err, result, fields) {
      if (err) throw err;
      res.send({ message: "Product Updated" });
    }
  );
});
//to view products from product table
App.get("/getproduct", (req, res) => {
  db.query("SELECT * FROM product", function (err, result, fields) {
    if (err) throw err;
    res.send(result);
    //console.log(result)
  });
});

//to insert into order_details for each order by customer place order
App.post("/postorderdetail", (req, res) => {
  let order = req.body;
  db.query(
    "INSERT INTO order_details(product_no,quantity,total_amount,customer_id,customer_address,status) VALUES(?,?,?,?,?,?)",
    [
      order.product_no,
      order.quantity,
      order.total_amount,
      order.customer_id,
      order.customer_address,
      order.status,
    ],
    function (err, result, fields) {
      if (err) throw err;
      res.send({ message: "Your order has been placed" });
    }
  );
});

//to insert into transaction on order payment checkbox lgadeny
App.post("/addtransaction", (req, res) => {
  // console.log("==========>", req.body);
  let trans = req.body;
  prod_array = req.body.product_no.split(",");

  if (req.body.payment_method == "COD") {
    db.query(
      "INSERT INTO order_details(product_no,quantity,total_amount,customer_id,status,paymentmethod) VALUES(?,?,?,?,?,?)",
      [
        trans.product_no,
        trans.quantity,
        trans.total_amount,
        trans.customer_id,
        "PENDING",
        trans.payment_method,
      ],
      function (err, result, fields) {
        if (err) throw err;
        for (i = 0; i < prod_array.length; i++) {
          db.query(
            "UPDATE product SET quantity=quantity-1 where product_no=?",
            [prod_array[i]],
            function (err, result, fields) {
              if (err) throw err;

              console.log("Done");
            }
          );
        }
        res.send({ message: "Your order has been placed" });
      }
    );
    // db.query("INSERT INTO transaction(card_pin,card_no,card_expiry_date,payment_method,customer_id) VALUES(?,?,?,?,?)",[trans.card_pin,trans.card_no,trans.card_expiry_date,trans.payment_method,trans.customer_id],function (err, result, fields){
    // if (err) throw err;
    // res.send({message:"Thank you for your Order. Successfully Placed!"})
    //  });
  } else if (req.body.payment_method == "CARD") {
    db.query(
      "SELECT * FROM transaction WHERE card_no=? and card_pin=? and card_expiry_date=?",
      [trans.card_no, trans.card_pin, trans.card_expiry_date],
      function (err, result, fields) {
        if (err) throw err;
        console.log(result.length);

        if (result.length == 1) {
          db.query(
            "INSERT INTO order_details(product_no,quantity,total_amount,customer_id,status,paymentmethod) VALUES(?,?,?,?,?,?)",
            [
              trans.product_no,
              trans.quantity,
              trans.total_amount,
              trans.customer_id,
              trans.status,
              trans.payment_method,
            ],
            function (err, result, fields) {
              if (err) throw err;
              for (i = 0; i < prod_array.length; i++) {
                db.query(
                  "UPDATE product SET quantity=quantity-1 where product_no=?",
                  [prod_array[i]],
                  function (err, result, fields) {
                    if (err) throw err;
      
                    console.log("Done");
                  }
                );
              }
              console.log("Placed", result);
            }
          );
          res.send({
            message: "Thank you for your Order Payment Received",
            success: 1,
          });
        } else {
          res.send({ message: "Invalid Credentials", success: 0 });
        }
      }
    );
  }
});
//to view transactions(admin)  TABLE
App.get("/gettransactions", (req, res) => {
  db.query("SELECT * FROM transaction", function (err, result, fields) {
    if (err) throw err;
    console.log(result);
  });
});

//----------Login Admin API-----------------
App.post("/loginadmin", (req, res) => {
  let user = req.body;
  db.query(
    "SELECT * FROM admin WHERE email=? and password=?",
    [user.email, user.password],
    function (err, result, fields) {
      if (err) throw err;
      console.log(result.length);
      if (result.length == 1) {
        res.send({ result, success: 1 });
      } else {
        res.send({ message: "invalid credentials", success: 0 });
      }
    }
  );
});

App.post("/logincustomer", (req, res) => {
  let user = req.body;
  res.setHeader("Content-Type", "application/json");

  db.query(
    "SELECT * FROM customer WHERE customer_email=? and customer_password=?",
    [user.email, user.password],
    function (err, result, fields) {
      if (err) throw err;
      console.log(result.length);
      if (result.length == 1) {
        res.send({ result, success: 1 });
      } else {
        res.send({ message: "invalid credentials", success: 0 });
      }
    }
  );
});

App.get("/getorderdetails/:id", (req, res) => {
  let id = req.params.id;
  db.query(
    "SELECT * FROM order_details where customer_id=? ORDER BY order_detail_id DESC",
    [id],
    function (err, result, fields) {
      if (err) throw err;
      res.send(result);
    }
  );
});

App.put("/confirmorder/:id", (req, res) => {
  let id = req.params.id;
  db.query(
    "UPDATE order_details SET status='CONFIRMED' where order_detail_id=?",
    [id],
    function (err, result, fields) {
      if (err) throw err;
      res.send({ message: "Order Confirmed" });
    }
  );
});
