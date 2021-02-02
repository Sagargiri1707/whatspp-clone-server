const express=require('express')
const router=express.Router()

router.get('/',(req,res)=>{
    res.send('server is up to date')
})


module.exports=router