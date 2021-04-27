const express = require("express")
const app = express()
const MongoClient = require("mongodb").MongoClient
const PORT = 1337
require("dotenv").config()

let db,
    dbConnectionStr = process.env.DB_STRING,
    dbName = "todo"

MongoClient.connect(dbConnectionStr, {useUnifiedTopology: true})
    .then(client => {
        console.log(`Oh snap! Connected to ${dbName} database!`)
        db = client.db(dbName)
    })
    .catch(err => {
        console.log(err)
    })

app.set("view engine", "ejs")
app.use(express.static("public"))
app.use(express.urlencoded({extended: true}))
app.use(express.json())

app.get("/", async(req, res) => {
    const todoItems = await db.collection("todos").find().toArray()
    const itemsLeft = await db.collection("todos").countDocuments({completed: false})
    res.render("index.ejs", {zebra: todoItems, left: itemsLeft})
})

app.post("/createTodo", (req, res) => {
    console.log(req.body.todoItem)
    db.collection("todos").insertOne({todo: req.body.todoItem, completed: false})
    .then(result => {
        console.log("Todo has been added, yo!")
        res.redirect("/")
    })
})

app.put("/markComplete", (req, res) => {
    db.collection("todos").updateOne({todo: req.body.rainbowUnicorn}, {
        $set: {
            completed: true
        }
    })
    .then(result => {
        console.log("Marked that as done, son!")
        res.json("Marked Complete")
    })
})

app.put("/undo", (req, res) => {
    db.collection("todos").updateOne({todo: req.body.rainbowUnicorn}, {
        $set: {
            completed: false
        }
    })
    .then(result => {
        console.log("Now it's undone, son!")
        res.json("Marked Complete")
    })
})

app.delete("/deleteTodo", (req, res) => {
    console.log(req.body.rainbowUnicorn)
    db.collection("todos").deleteOne({todo: req.body.rainbowUnicorn})
    .then(result => {
        console.log("Got rid of that todo")
        res.json("Deleted It")
    })
    .catch(err => {
        console.log(err)
    })
})

app.listen(process.env.PORT || PORT, ()=> {
    console.log("Server is running, better catch it!")
})