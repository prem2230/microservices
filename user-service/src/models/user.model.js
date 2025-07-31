import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    email:{
        type:String,
        required:[true,'Email is required'],
        unique:true,
        trim: true,
        lowercase: true,
        match:[/.+\@.+\..+/,'Please provide a valid email address']
    },
    name:{
        type:String,
        trim:true,
        required:[true,'name is required'],
        maxlength:[20,'Username cannot exceed 20 characters']
    },
    password:{
        type:String,
        required:[true,'Password is required'],
        minlength:[8,'Password must be at least 8 characters long']
    },
    role:{
        type:String,
        enum:{
            values:['admin','customer','restaurant_owner'],
            message:'Role must be either admin, customer or restaurant_owner'
        },
        default:'customer'
    },
    number:{
        type: Number,
        unique:true,
        sparse: true,
        validate:{
            validator:function(v){
                return /^\d{10}$/.test(v);
            },
            message:'Phone number must be 10 digits'
        },
        required:[true, 'Phone number is required'],
        match:[/^[0-9]{10}$/,'Phone number must be 10 digits']
    },
},{
    timestamps:true,
})

userSchema.index({email:1,name:1,number:1});

const User = mongoose.model('User',userSchema);

export default User;