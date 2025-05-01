export async function createOrder(req,res){
    if(req.user == null){
        res.status(403).json({
            message : "Please login and try again"
        })
        return

    }
    const orderInfo = req.body
    if(orderInfo.name == null){
        orderInfo.name = req.user.firstName + " " + req.user.lastName
    }
}
    
