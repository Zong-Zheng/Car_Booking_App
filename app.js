// Import the Express.js framework
const express = require('express');
const mysql = require('mysql2');
const multer = require('multer');
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public/images");
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
})
const upload = multer({ storage: storage });

//TODO: Include code for body-parser
const bodyParser = require("body-parser");// parse the incoming request bodies in a middleware before your handlers
// Create an instance of the Express application. This app variable will be used to define routes and configure the server.
const app = express();
// Create MySQL connection
const connection = mysql.createConnection({
    host: 'db4free.net',
    user: 'carbookingapp',
    password: 'carbookingapp',
    database: 'carbookingapp'
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL database');
});
//TODO: Include code for Middleware to parse request bodies
app.use(bodyParser.urlencoded({ extended: true }));//use the module as a middleware
// Specify the port for the server to listen on
const port = 3001;

//TODO: Include code to set EJS as the view engine
app.set("view engine", "ejs");
// enable static files
app.use(express.static('public'));

app.use(express.urlencoded({
    extended: false
}));



// Routes for CRUD operations
// Route to retrieve and display all students
app.get('/', function (req, res) {
    const sql = "SELECT * FROM booking INNER JOIN car ON booking.number = car.number";
    //TODO: Insert code to render a view called "index" and pass the variable 'products' to the view for rendering
    connection.query(sql, function (error, results) {
        if (error) {
            console.error("ERROR", error.message);
            return res.status(500).send("Error retriving products");
        }
        res.render("index", { bookings: results })
    });
});








// Route to get a specific product by ID
app.get('/bookings/:id', function (req, res) {
    // Extracting the 'id' parameter from the request parameters and converting it to an integer
    const booking_Id = parseInt(req.params.id);
    const sql = "SELECT * FROM booking INNER JOIN car ON booking.number = car.number WHERE booking_id = ?";

    connection.query(sql, [booking_Id], function (error, results) {
        if (error) {
            console.error("ERROR", error.message);
            return res.status(500).send("Error retriving student");
        }

        if (results.length > 0) {
            res.render("bookingInfo", { booking: results[0] });
        } else {
            res.status(404).send("Student is not found.");
        }
    })
});




// Add a new product form
app.get('/add', function (req, res) {
    //TODO: Insert code to render a view called "addProduct"
    const sql = "SELECT * FROM car";
    connection.query(sql, function (error, results) {
        if (error) {
            console.error("ERROR", error.message);
            return res.status(500).send("Error retriving student");
        }

        res.render("addBooking", { cars: results });
    })
});



// Add a new product
app.post('/bookings', upload.single("image"), function (req, res) {

    const { number, bookingdate, bookedby, startdate, enddate } = req.body
    let image;
    if (req.file) {
        image = req.file.filename
    } else {
        image = null
    }
    const sql = "INSERT INTO booking (number, bookingdate, bookedby, startdate , enddate , image) VALUES (?, ?, ?, ?, ?, ?)";

    connection.query(sql, [number, bookingdate, bookedby, startdate, enddate, image], (error, results) => {
        if (error) {
            console.error("ERROR", error.message);
            return res.status(500).send("Error adding product", error.message);
        } else {
            res.redirect("/");
        }
    });
});













//Update a product by ID - First Find the product
app.get('/bookings/:id/update', function (req, res) {
    //TODO: Insert code to find product to update based on product ID selected
    const booking_Id = parseInt(req.params.id);// 从路由参数中提取物品ID，并将其转换为整数
    const sql = "SELECT * FROM booking INNER JOIN car ON booking.number = car.number WHERE booking_id = ?";
    connection.query(sql, [booking_Id], function (error, results) {
        if (error) {
            console.error("An error", error.message);
            return res.status(500).send("Error retrieve by ID");
        }

        if (results.length > 0) {
            res.render("updateBooking", { updatebooking: results[0] });
        } else {
            res.status(404).send("Booking not found");
        }
    })

});









// Update a product by ID - Update the product information
app.post('/bookings/:id/update', upload.single("image"), function (req, res) {
    //TODO: Insert code to update product information entered in updateProduct form
    const booking_Id = parseInt(req.params.id);// 从路由参数中提取物品ID，并将其转换为整数
    const number = req.body.number;
    const bookingdate = req.body.bookingdate;
    const bookedby = req.body.bookedby;
    const startdate = req.body.startdate; // 从请求体中解构新的物品名称
    const enddate = req.body.enddate;// 从请求体中解构新的物品数量
    let image = req.body.currentImage;
    if (req.file) {
        image = req.file.filename
    }
    const sql = "UPDATE booking SET number = ? , bookingdate = ? , bookedby = ? , startdate = ? , enddate = ? , image = ? WHERE booking_id = ?";
    connection.query(sql, [number, bookingdate, bookedby, startdate, enddate, image, booking_Id], function (error, result) {
        if (error) {
            console.error("Error there", error)
            res.status(500).send("Error updting")
        } else {
            res.redirect("/")
        }
    })
});









// Delete a product by ID
app.get('/bookings/:id/delete', function (req, res) {
    const booking_Id = parseInt(req.params.id);
    const sql = "DELETE FROM booking WHERE booking_id = ?";
    connection.query(sql, [booking_Id], function (error, result) {
        if (error) {
            console.error("Error there", error.message)
            res.status(500).send("Error deleting")
        } else {
            res.redirect("/")
        }
    })
});







// Start the server and listen on the specified port
app.listen(port, function () {
    // Log a message when the server is successfully started
    console.log(`Server is running at http://localhost:${port}`);
});
