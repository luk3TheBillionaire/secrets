const mongoose = require('mongoose');;


const dbConnect = async()=>{
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/userDB');

    }catch(err){
        console.error(err)
    }   
   
}
module.exports=dbConnect