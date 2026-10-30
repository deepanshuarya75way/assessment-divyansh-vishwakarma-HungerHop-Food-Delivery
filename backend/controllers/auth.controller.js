import { ApiError } from "../config/apierror.js";
import { ApiResponse } from "../config/apiresponse.js";
import { asyncHandler } from "../config/asynchandler.js";
import { User } from "../models/user.model.js";
import { sentOtp } from "../utils/mail.js";
import { genToken } from "../utils/token.js";
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
dotenv.config();

export const signup=asyncHandler(async(req,res)=>{
    const {fullName,email,password,phone,role}=req.body;
    let user=await User.findOne({email});
    if(user){
        throw new ApiError(401,"User already present")
    }
    if(password.length<6){
        throw new ApiError(400,"Password must be atleast 6 characters")
    }
    if(phone.length!=10){
        throw new ApiError(400,"Enter Valid Mobile number")
    }
    const hashedPassword=await bcrypt.hash(password,10);
    user=await User.create({
        fullName,
        password:hashedPassword,
        email,
        phone,
        role
    })
    const token=await genToken(user._id)
    res.cookie("token",token,{
        httpOnly:true,
        secure:false,
        maxAge:7*24*60*60*1000,
        sameSite:"strict"
    })
    return res.status(201).json(
        new ApiResponse(201,user,"User Signed Up successfully")
    )
})
export const login=asyncHandler(async(req,res)=>{
    const {email,password}=req.body;
    const user=await User.findOne({email});
    if(!user){
        throw new ApiError(401,"User does not exists")
    }
    const isCorrect=await bcrypt.compare(password,user.password);
    if(!isCorrect){
        throw new ApiError(401,"Invalid credentials")
    }
    const token=await genToken(user._id)
    res.cookie("token",token,{
        httpOnly:true,
        secure:true,
        maxAge:7*24*60*60*1000,
        sameSite:"strict"
    })
    return res.status(200).json(
        new ApiResponse(200,user,"User Logged in successfully")
    )
})
export const logout = asyncHandler(async (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: true,
        sameSite: "none"
    });

    return res.status(200).json(
        new ApiResponse(200, {}, "User logged out")
    );
});
export const sentOtpMail=asyncHandler(async(req,res)=>{
    const {email}=req.body
    const user=await User.findOne({email}).select("-password");
    if(!user){
        throw new ApiError(400,"User not found")
    }
    const otp=Math.floor(Math.random()*9000+1000).toString();
    user.userOtp=otp;
    user.otpVerified=false
    user.otpExpired=Date.now()+5*60*1000;
    await user.save();
    await sentOtp(email,otp);
    return res.status(200).json(new ApiResponse(200,{},"Otp sent successfully"))

})
export const verifyOtp=asyncHandler(async(req,res)=>{
    const {email,otp}=req.body;
    const user=await User.findOne({email})
    if(!user || user.userOtp!=otp|| user.otpExpired < Date.now()){
        throw new ApiError(400,"Otp is invalid or Expired")
    }
    user.userOtp=undefined
    user.otpExpired=undefined;
    user.otpVerified=true;
    await user.save();
    return res.status(200).json( new ApiResponse(200,{},"Otp verified successfully"))
})
export const resetPassword=asyncHandler(async(req,res)=>{
    const {email,newPassword}=req.body;
    const user=await User.findOne({email});
    if(!user||!user.otpVerified){
        throw new ApiError(400,"User not found or Not verified")
    }
    const hashedPassword=await bcrypt.hash(newPassword,10);
    user.password=hashedPassword;
    user.otpVerified=false;
    await user.save();
    return res.status(200).json( new ApiResponse(200,{},"User Password has been changed"))

})
export const googleAuth=asyncHandler(async(req,res)=>{
    const {fullName,email,phone,role}=req.body;
    let user=await User.findOne({email});
    if(!user){
       user=await User.create({
        fullName,
        email,
        phone,
        role
       })
    }
    const token=await genToken(user._id)
    res.cookie("token",token,{
        httpOnly:true,
        secure:false,
        maxAge:7*24*60*60*1000,
        sameSite:"strict"
    })
    return res.status(201).json(
        new ApiResponse(201,user,"User Signed Up successfully")
    )

})