var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
    host: "localhost",
  
    port: 3306,
  
    user: "root",
  
    password: "root",
    database: "bamazon_db"
  });


// promptUserPurchase will prompt the user for the item/quantity they would like to purchase
function promptUserPurchase() {

	// Prompt the user to select an item
	inquirer.prompt([
		{
			type: 'input',
			name: 'id',
			message: 'Please enter the Item ID which you would like to purchase.'
		},
		{
			type: 'input',
			name: 'quantity',
			message: 'How many do you need?'
		}
	]).then(function(input) {

		var item = input.id;
		var quantity = input.quantity;

		// Query db to check if the item has enough stock
		var queryStr = 'SELECT * FROM products WHERE ?';

		connection.query(queryStr, {id: item}, function(err, data) {
			if (err) throw err;


			if (data.length === 0) {
				console.log('ERROR: Invalid Item ID. Please select a valid Item ID.');
				displayInventory();

			} else {
				var productData = data[0];


				// If the quantity requested by the user is in stock
				if (quantity <= productData.stock_quantity) {

					var updateQueryStr = 'UPDATE products SET stock_quantity = ' + (productData.stock_quantity - quantity) + ' WHERE id = ' + item;

					// Update the inventory
					connection.query(updateQueryStr, function(err, data) {
						if (err) throw err;

						console.log('Your oder has been placed. Your total is $' + productData.price * quantity);
						console.log("\n---------------------------------------------------------------------\n");

						// End the database connection
						connection.end();
					})
				} else {
					console.log('Not enough stock. Please select a different amount.');
					console.log("\n---------------------------------------------------------------------\n");

					displayInventory();
				}
			}
		})
	})
}

// displayInventory will retrieve the current inventory from the database and output it to the console
function displayInventory() {

	queryStr = 'SELECT * FROM products';

	connection.query(queryStr, function(err, data) {
		if (err) throw err;

		console.log('Current stock: ');
		console.log('...................\n');

		var strOut = '';
		for (var i = 0; i < data.length; i++) {
			strOut = '';
			strOut += 'Item ID: ' + data[i].id + '  //  ';
			strOut += 'Product Name: ' + data[i].product_name + '  //  ';
			strOut += 'Department: ' + data[i].department_name + '  //  ';
			strOut += 'Price: $' + data[i].price + '\n';

			console.log(strOut);
		}

	  	console.log("---------------------------------------------------------------------\n");

	  	//Prompt the user for item/quantity they would like to purchase
	  	promptUserPurchase();
	})
}

// runBamazon will execute the main application logic
function runBamazon() {
	// console.log('___ENTER runBamazon___');

	// Display the available inventory
	displayInventory();
}

// Run the application logic
runBamazon();
  