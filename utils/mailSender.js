import nodemailer from 'nodemailer';

export const mailSender = async (email,title,body) => {
    try{

        let transporter = nodemailer.createTransport({
            host:process.env.MAIL_HOST,
            auth:{
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            },
            port: 587,
            secure: false,
            requireTLS: true,
        });

        let info = await transporter.sendMail({
            from:`CourseX`,
            to:`${email}`,
            subject:`${title}`,
            html: `${body}`
        });

        //console.log('info ', info);

        return info;

    }catch(error){
        console.log('Error in sending mail to user');
        console.log(error);
    }


}