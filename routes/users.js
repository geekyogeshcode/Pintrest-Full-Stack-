const mongoose=require("mongoose")
const plm=require("passport-local-mongoose")

mongoose.connect("mongodb://127.0.0.1:27017/Pin")

const userSchema=new mongoose.Schema({
  fullname:{
    type:String
  },
  username:{
    type:String
  },
  email:{
    type:String
  },
  password:{
    type:String
  },
  profileimage:{
    type:String
  },
  boards:{
    type:Array,
    default:[]
  },
  posts:[
    {
      type:mongoose.Schema.Types.ObjectId,
      ref:'Post'
    }
  ]
})

userSchema.plugin(plm)

module.exports  = mongoose.model('User',userSchema)