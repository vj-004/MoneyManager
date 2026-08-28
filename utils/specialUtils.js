export const returnResponse = (res,code,result,message,data) => {
    return res.status(code).json({
        success: result,
        message: message,
        data
    });
}