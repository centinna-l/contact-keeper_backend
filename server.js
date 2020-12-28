const express = require("express");
let app = express();
const PORT = process.env.PORT || 5000;
app.get("/", (req, res)=>{
    res.json({
        "message": "Hello World"
    })
});
//Define Routes
app.use("/api/users", require("./routes/users"));
app.use("/api/contacts", require("./routes/contacts"));
app.use("/api/auth", require("./routes/auth"));
app.listen(PORT, ()=>{
    console.log(`Server Is Up and Running on Port: ${PORT}`)
})