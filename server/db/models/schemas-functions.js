var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//for example values for each schema, take a look
//at defaultInstantiator.js.

var modelSchema = mongoose.Schema({
  username: {type: String, required: true, index: { unique: true }},
  companyName: String,
  startingCash: 0,
  settings: {
    benefits: [{type: Schema.Types.ObjectId, ref: 'Benefit'}],
    taxes: [{type: Schema.Types.ObjectId, ref: 'Tax'}]
  }, //these are arrays of foreign keys.
  expenses: {
    gAndA: [{type: Schema.Types.ObjectId, ref: 'GAndA'}],
    employees: [{type: Schema.Types.ObjectId, ref: 'Employee'}],
    startupCosts: [{type: Schema.Types.ObjectId, ref: 'StartupCost'}]
  },
  debtsAndEquities: [{type: Schema.Types.ObjectId, ref: 'DebtAndEquity'}],
  products: [{type: Schema.Types.ObjectId, ref: 'Product'}]
});

var benefitSchema = mongoose.Schema({
  _parentModel: {type: Schema.Types.ObjectId, ref: "Model"},
  name: String,
  dollarsPerMonth: Number, //each benefit has either a fixed dollars per month...
  percentageOfPay: Number, //...or a percentage of pay.
  increasePerYear: Number //how much each benefit increases per year.
});

var taxSchema = mongoose.Schema({
  _parentModel: {type: Schema.Types.ObjectId, ref: "Model"},
  name: String,
  percentageOfPay: Number,
  upTo: Number,
});

var gAndASchema = mongoose.Schema({
  _parentModel: {type: Schema.Types.ObjectId, ref: "Model"},
  category: String,
  name: String,
  description: String,
  money: [{}] //An array of objects--mixed data type. Checkout http://mongoosejs.com/docs/schematypes.html
});

var employeeSchema = mongoose.Schema({
  _parentModel: {type: Schema.Types.ObjectId, ref: "Model"},
  title: String,
  yearlySalary: Number,
  startDate: {
    year: Number, //YYYY
    month: String //'jan', 'feb', etc.
  },
  endDate: {
    year: Number,
    month: String
  }
});


var startupCostSchema = mongoose.Schema({
  _parentModel: {type: Schema.Types.ObjectId, ref: "Model"},
  name: String,
  money: String //A JSON string.
});

var debtAndEquitySchema = mongoose.Schema({
  _parentModel: {type: Schema.Types.ObjectId, ref: "Model"},
  name: String,
  type: String, //'loan' or 'equity'
  principal: Number,
  startYear: Number,
  startMonth: String,
  interest: Number,
  months: Number,
  payment: Number
});

var productSchema = mongoose.Schema({
  _parentModel: {type: Schema.Types.ObjectId, ref: "Model"},
  productName: String,
  pricePerUnit: Number,
  costOfProductionPerUnit: Number,
  commission: Number,
  years: [Number],
  sales: {} //mixed data type. Check out http://mongoosejs.com/docs/schematypes.html
});

//constructors below.
var Benefit = mongoose.model("Benefit", benefitSchema);
var Tax = mongoose.model("Tax", taxSchema);
var GAndA = mongoose.model("GAndA", gAndASchema);
var Employee = mongoose.model("Employee", employeeSchema);
var StartupCost = mongoose.model("StartupCost", startupCostSchema);
var DebtAndEquity = mongoose.model("DebtAndEquity", debtAndEquitySchema);
var Product = mongoose.model("Product", productSchema);
var Model = mongoose.model("Model", modelSchema);

//Functions to add and delete items from an existing financial model should be declared below.

//Functions to update the values for a model should be declared below. See http://mongoosejs.com/docs/2.7.x/docs/updating-documents.html

var getModel = function(req, res){
  // username = req.body.username;
  Model.findOne({username: "mack"}) //right now, "mack" is hard coded in. later, make it so that username value comes from req.body.username.
    .populate("settings.benefits settings.taxes expenses.gAndA expenses.employees expenses.startupCosts debtsAndEquities products")
    .exec(function(err, model) {
      console.log('Model from the database', model);
      res.status(200).send(model);
    });
};

//Exports below.

exports.Benefit = Benefit;
exports.Tax = Tax;
exports.GAndA = GAndA;
exports.Employee = Employee;
exports.StartupCost = StartupCost;
exports.DebtAndEquity = DebtAndEquity;
exports.Product = Product;
exports.Model = Model;

exports.getModel = getModel;
