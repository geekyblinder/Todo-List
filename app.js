//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const { default: mongoose } = require("mongoose");
const _=require("lodash");

const app=express();

const port = process.env.PORT || 3000;



app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));


mongoose.connect("mongodb+srv://geekyblinder:ManUTD22@cluster0.22fb1.mongodb.net/totdolistDB");

const ItemsSchema={
name:String
};

const Item=mongoose.model("Item",ItemsSchema);

const item1=new Item({
    name:"Welcome to Todo List!"
});

const item2=new Item({
    name:"Hit + button to add a new item in the todo list."
});

const item3=new Item({
    name:"<-- Hit this to delete an item."
});

const defaultItems=[item1,item2,item3];

const listSchema={
    name:String,
    items:[ItemsSchema]

};

const List=mongoose.model("List",listSchema);


app.get("/",(req,res)=>{
    Item.find({},function(err,foundItems){
    if(foundItems.length===0){
        Item.insertMany(defaultItems,function(err){
    if(err){
        console.log(err);
    }
    else
    {
        console.log("Success");
    }
    res.redirect("/");
});
    }else{

    
        res.render("list",{listTitle:"Today",newlistItems:foundItems});
}});
    
});
app.get("/:customlistName",(req,res)=>{
    const customListName=_.capitalize(req.params.customlistName);
    List.findOne({name:customListName},function(err,foundList){
        if(!err){
            if(!foundList){
                const list=new List({
                    name:customListName,
                    items:defaultItems
                });
                list.save();
                res.redirect("/"+customListName);
            }
           
            else{
                res.render("list",{listTitle:foundList.name,newlistItems:foundList.items});
            }
        }
    });
    
   
});

app.post("/",(req,res)=>{
const newItem=req.body.newItem;
const listName=req.body.list;

const item=new Item({
    name:newItem
});
if(listName==="Today")
{
    item.save();
    res.redirect("/");
    
}
else{
List.findOne({name:listName},function(err,foundList){
    foundList.items.push(item);
    foundList.save();
    res.redirect("/"+listName);
});
}

    // if(req.body.list==="Work"){
    //     workItems.push(item);
    //     res.redirect("/work");
    // }
    // else{
    // items.push(item);
    // res.redirect("/");}
});
app.post("/delete",(req,res)=>{
const checkeditemID=req.body.checkbox;
const listName=req.body.listName;

if(listName==="Today"){
    Item.findByIdAndRemove(checkeditemID,function(err){
        if(err){
            console.log(err);
        }
        else{
            res.redirect("/");
        }
    });
}
else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkeditemID}}},function(err,foundList){
        if(!err){
            res.redirect("/"+listName);
        }

    })

}
});

app.get("/work",(req,res)=>{
res.render("list",{listTitle:"Work List",newlistItems:workItems});
});

app.post("/work",(req,res)=>{
    let item=req.body.newItem;
    workItems.push(item);
    res.redirect("/work");
});


app.listen(port, () => console.log(`Server started at port: ${port}`)
);