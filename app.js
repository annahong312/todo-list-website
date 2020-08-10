//jshint esversion:6

// Children
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

app.set('view engine', 'ejs');

mongoose.connect("mongodb+srv://admin-anna:Test123@cluster0.w5iip.mongodb.net/todolistDB", {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  useFindAndModify: false
});



// Variables:
const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

const code = new Item({
  name: "Code for 1 hour"
});

const lunch = new Item({
  name: "make lunch"
});

const water = new Item({
  name: "water your plants"
});

// Add items
const defaultItems = [code, lunch, water];


const listSchema = {
  name: String,
  items: [itemsSchema]
};
const List = mongoose.model("List", listSchema);


// Functions

app.get("/", function(req, res) {
  // Render variable properly
  Item.find({}, function(err, foundItems) {
    if (err) {
      console.log(err);
    } else if (foundItems.length === 0) {
      // Only insert default items if empty
      Item.insertMany(defaultItems, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("successfully added items");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", {
        listTitle: "Today",
        newItems: foundItems
      });
    }
  });


});


app.post("/", function(req, res) {
  const listName = req.body.listTitle;
  const item = new Item({
    name: req.body.newItem
  });

  if (listName === "Today") {
    console.log("saving " + item.name);
    item.save();
    res.redirect("/")
  } else {
    List.findOne({
      name: listName
    }, function(err, foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/delete", function(req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listTitle;
  console.log(req.body);
  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId, function(err) {
      if (err) {
        console.log(err);
      }
    });
    res.redirect("/");
  }
  else {
    // Custom List
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList) {
      if (!err) {
        res.redirect("/" + listName);
      }
    });
  }

});
// Item.deleteMany({name:"asdf"}, function(err){});

// Work route
// app.get("/work", function(req, res){
//   res.render("list",{listTitle: "Work List", newItems: workItems})
// });

app.get("/:listName", function(req, res) {
  const listName = _.capitalize(req.params.listName);

  // if find one returns true, do this
  List.findOne({
    name: listName
  }, function(err, foundList) {
    if (!err && listName !== "favicon.ico") {

      if (!foundList) {
        const list = new List({
          name: listName,
          items: defaultItems
        });
        list.save();
        res.redirect("/");
      } else {
        res.render("list", {
          listTitle: listName,
          newItems: foundList.items
        });

      }
    }
  });


  // else render the existing one



});

// About route
app.get("/about", function(req, res) {
  res.render("About");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}
app.listen(port);

app.listen(port, function() {
  console.log("server started");
});
