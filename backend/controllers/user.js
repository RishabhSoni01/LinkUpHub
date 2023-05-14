const Post = require('../models/Post');
const { findOne } = require('../models/User');
const User = require('../models/User');
const {sendEmail} = require('../middlewares/sendEmail')
const crypto = require('crypto');

exports.register = async(req,res)=>{
    try{
        const {name,email,password} = req.body;
         
        let user = await User.findOne({email});

        if(user){
            return res
                .status(400)
                .json({success:false ,message:"User Already exits"});
        }

        user = await User.create({
            name,
            email,
            password,
            avatar:{public_id:"sample_id",url:"sampleurl"}
        });

        res.status(201).json({
            success:true,
            user
        });
    }
    catch(error){
        res.status(500).json({
            success:false,
            message:error.message
        });
    }
};

exports.login = async(req,res)=>{
    try{
        const {email,password} = req.body;
        const user = await User.findOne({email}).select("+password");

        if(!user){
            return res.status(400).json({
                success:false,
                message:"user does not exist"
            });
        }
        const isMatch = await user.matchPassword(password);
        
        if(!isMatch){
            return res.status(400).json({
                success:false,
                message:"password incorrect"
            });
        }

        const token = await user.generateToken();
        const options = {
            expires : new Date(Date.now()+90*24*60*60*1000),
            httpOnly:true,
        }
        res.status(200).cookie("token",token,options).json({
            success:true,
            user,
            token
        });
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:error.message,
        });
    }
}

exports.logout = async(req,res)=>{
    try {
        res
            .status(200)
            .cookie("token",null,{expires:new Date(Date.now()),httpOnly:"true"})
            .json({
                success:true,
                message:"Logged Out Successfully"
            });
    } catch (error) {
        res.status(500).json({
            success:false,
            message:error.message,
        });
    }
}

exports.followUser = async(req,res)=>{
    try{
        const userToFollow=await User.findById(req.params.id);
        const loggedInUser=await User.findById(req.user._id);

        if(!userToFollow){
            return res.status(404).json({
                success:false,
                message:"User Not Found",
            })
        }

        

        if(loggedInUser.following.includes(userToFollow._id)){
            const indexFollowing = loggedInUser.following.indexOf(userToFollow._id);
            loggedInUser.following.splice(indexFollowing,1);

            const indexFollowers = userToFollow.followers.indexOf(loggedInUser._id);
            userToFollow.followers.splice(indexFollowers,1);

            await loggedInUser.save();
            await userToFollow.save();

            res.status(200).json({
                success:true,
                message:"UnFollow User Successfully"
            })
        }
        else{
            loggedInUser.following.push(userToFollow._id);
            userToFollow.followers.push(loggedInUser._id);
            
            await loggedInUser.save();
            await userToFollow.save();

            res.status(200).json({
                success:true,
                message:"Follow User Successfully"
            })
        }
        
    }
    catch(error){
        res.status(500).json({
            success:false,
            message:error.message,
        });
    }
}

exports.updatePassword = async(req,res)=>{
    try {
        const user = await User.findById(req.user._id).select("+password");

        const {oldpassword,newpassword} = req.body;
        const isMatch = await user.matchPassword(oldpassword);

        if(!isMatch){
            res.status(400).json({
                success:false,
                message:"Incorrect Old Password",
            })
        }

        user.password = newpassword;

        await user.save();

        res.status(200).json({
            success:true,
            message:"Password Updated Successfully",
        });

    } catch (error) {
        res.status(500).json({
            success:false,
            message:error.message,
        });
    }
}

exports.updateProfile = async(req,res)=>{
    try {
        const user = await User.findById(req.user._id);

        const {name,email}=req.body;

        if(name){
            user.name = name;         
        }
        
        if(email){
            user.email = email;
        }

        await user.save();

        res.status(200).json({
            success:true,
            message:"Profile Updated Successfully",
        });

    } catch (error) {
        res.status(500).json({
            success:false,
            message:error.message,
        });
    }
}

exports.deleteMyProfile = async(req,res)=>{
    try {
        const user=await User.findById(req.user._id);
        const posts=user.posts;
        const followers=user.followers;
        const following = user.following; 
        const Userid=user._id;
        await user.remove();

        res.cookie("token",null,{
            expires:new Date(Date.now()),
            httpOnly:"true"
        });

        for(let i=0;i<posts.length;i++){
            const post=await Post.findById(posts[i]);
            await post.remove();
        }

        for(let i=0;i<followers.length;i++){
            const follower = await user.findById(followers[i]);
            const index=follower.following.indexOf(Userid);
            follower.following.splice(index,1);
            await follower.save();
        }

        for(let i=0;i<following.length;i++){
            const follows = await user.findById(following[i]);
            const index=follows.followers.indexOf(Userid);
            follows.followers.splice(index,1);
            await follows.save();
        }

        res.status(200).json({
            success:true,
            message:"Profile deleted",
        })
    } catch (error) {
        res.status(500).json({
            success:false,
            message:error.message,
        });
    }
}

exports.myProfile = async(req,res)=>{
    try {
        const user = await User.findById(req.user._id).populate("posts");

        res.status(200).json({
            success:true,
            user,
        });
    } catch (error) {
        res.status(500).json({
            success:false,
            message:error.message,
        });
    }
}

exports.getUserProfile = async(req,res)=>{
    try {
        const user = await User.findById(req.params.id).populate("posts");

        
        if(!user){
            return res.status(400).json({                    
                success:false,
                message:"user does not exist"
            });
        }

        res.status(200).json({
            success:true,
            user,
        });
    } catch (error) {
        res.status(500).json({
            success:false,
            message:error.message,
        });
    }
}

exports.getAllUsers = async(req,res)=>{
    try {
        const user = await User.find({});

        res.status(200).json({
            success:true,
            user,
        });
    } catch (error) {
        res.status(500).json({
            success:false,
            message:error.message,
        });
    }
}

exports.forgotPassword = async(req,res)=>{
    try {
        const user = await User.findOne({email:req.body.email});

        
        if(!user){
            return res.status(400).json({                    
                success:false,
                message:"user does not found"
            });
        }

        const resetPasswordToken = user.getResetPasswordToken();
        await user.save();
        const resetUrl=`${req.protocol}://${req.get("host")}/password/reset/${resetPasswordToken}`;

        const message=`reset your password by clicking on this link below \n\n${resetUrl}`;

        try {
            await sendEmail({
                email:user.email,
                subject:"reset password",
                message
            })
            res.status(200).json({
                success:true,
                message:`Email sent to ${user.email}`,
            });
        } catch (error) {
                user.resetPasswordToken=undefined;
                user.resetPasswordExpire=undefined;

                await user.save();
                res.status(500).json({
                    success:false,
                    message:error.message,
                })
        }
       
    } catch (error) {
        res.status(500).json({
            success:false,
            message:error.message,
        });
    }
}

exports.resetpassword = async(req,res)=>{
    try {
        const resetPasswordToken=crypto.createHash("sha256").update(req.params.token).digest("hex");
        const user = user.findOne({
            resetPasswordToken,
            resetpasswordExpire:{$gt :Date.now()}
        })
        if(!user){
            return res.status(401).json({                    
                success:false,
                message:"Token is invalid or expire"
            });
        }
        user.password = req.body.password;
        user.resetPasswordToken=undefined;
        user.resetpasswordExpire=undefined;
        await user.save();
        res.status(200).json({
            success:true,
            message:"password updated"
        });
    } catch (error) {
        res.status(500).json({
            success:false,
            message:error.message,
        });
    }
}