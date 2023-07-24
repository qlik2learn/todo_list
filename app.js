const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname+"/date.js");
const mongoose = require('mongoose');
const _ = require("lodash");

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://zoulfikar:70317583@atlascluster.bxts06y.mongodb.net/todolistDB", { useNewUrlParser: true });

const itemSchema = {
    name: String
}

const Item = mongoose.model("Item", itemSchema);


const item1 = new Item ({
    name: "Welcome to your to do list"
});

const item2 = new Item ({
    name: "Hit plus button"
});

const item3 = new Item ({
    name: "Hit checkbox"
});

const defaultArray = [item1, item2, item3];

const listSchema = {
    name: String,
    items: [itemSchema]
}

const List = mongoose.model("List", listSchema);

let WorkItems = [];

app.get("/", function (req, res) {
    
    Item.find({}).then( function(items) {

        if (items.length === 0){
            Item.insertMany(defaultArray).then( function() {
                console.log("Succesfully saved to ItemDB");
                }).catch(function(err){
                  console.log(err);
                });
        } else{
            
            res.render("list", {
                listTitle: "Today",
                newListItem: items
            });
        }

        }).catch(function(err){
          console.log(err);
      });


});

app.get("/:customListName", function(req, res){
    const customListName = _.capitalize(req.params.customListName);
    

    List.findOne({name: customListName}).then( function(foundList) {
        if(!foundList){
            //insert list
            console.log(foundList);
            const list = new List({
                name: customListName,
                items: defaultArray
            });
            list.save();
            res.redirect("/"+ customListName);
            
        } else{
            //show list
            console.log(foundList);
            res.render("list", {
                listTitle: foundList.name,
                newListItem: foundList.items
            });
     
        }
        }).catch(function(err){
          console.log(err);
        });

    
});

app.post("/", function (req, res) {
    let itemName = req.body.newItem;
    let ListName = req.body.list;

    const item = new Item ({
        name: itemName
    });

    if(ListName === "Today"){
        item.save();
        res.redirect("/");
    } else{
        List.findOne({name: ListName}).then( function(foundList) {
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + ListName);
        });
    }

});

app.post("/delete", function(req, res){
    let checkedItemId = req.body.checkbox;
    let ListName = req.body.listName;

    if(ListName === "Today"){
        Item.findByIdAndRemove(req.body.checkbox).then( function() {
            console.log("Succesfully deleted from ItemDB");
            res.redirect("/");
            }).catch(function(err){
              console.log(err);
            });
    } else{
        List.findOneAndUpdate({name: ListName}, {$pull: {items: {_id: checkedItemId}}}).then( function(err, foundList) {
           
            res.redirect("/"+ListName);
            }).catch(function(err){
              console.log(err);
            });
    }
    
});


app.listen(3000, function (res) {
    console.log("server running on port 3000");

});