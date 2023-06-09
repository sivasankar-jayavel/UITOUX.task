const sendToken = (user,statusCode,res) => {

    // Creating Jwt Token 
    const token = user.getJwtToken();

    // setting cookies
   const options = {
    expires:new Date( 
        Date.now() + process.env.COOKIE_EXPIRES_TIME * 24 * 60 * 60 * 1000   //after 7 days this cookies will expired so only this line
    ),
    httpOnly:true,
   }

    res.status(statusCode)
    .cookie("token",token,options)  //here first token is key name of token and value is token of jwt and options are above
    .json({
        success:true,
        token,
        user
    })
}

module.exports = sendToken