const {Pool}= require('pg');
const express = require('express');
const { default: bcrypt } = require('bcryptjs');
const app = express();
const port = 3000;

app.use(express.json());

const pool = new Pool({
    user: 'neondb_owner',
    password: 'npg_S4yLFuUtomQ6',
    host: 'ep-noisy-lake-a1y0x3al-pooler.ap-southeast-1.aws.neon.tech',
    database: 'neondb',
    port: 5432,
    ssl: true,
});

//register server
app.post('/user/register', async (req, res) => {
    const{userName, password, email, name} = req.body;

    try{
        if(!userName || !password || !email || !name){
            return res.status(400).json({
                message: 'No data provided!!'
            });
        }

        const salt = await bcrypt.genSalt(10);
        const secPass = await bcrypt.hash(password, salt);

        const result = await pool.query('INSERT INTO newusers (user_name, password, email, name) VALUES ($1,$2,$3,$4) RETURNING *', [userName,secPass,email,name]);
        if(!result){
            return res.status(401).json({
                message: 'Login Faild!!'
            });
        }else{
            return res.status(200).json({
                message: 'Login Successful.'
            })
        }
    } catch(err){
        return res.status(400).json(err);
    }
})

//login server
app.post('/user/login', async (req, res) => {
    const { userName, password } = req.body;

    try {
        if (!userName || !password) {
            return res.status(400).json({
                message: 'Both userId and password are required.' 
            });
        }

        const { rows } = await pool.query('select * from users where user_name = $1', [userName]);

        //User checking
        if (rows.length === 0) {
            return res.status(401).json({
                message: 'User not found.'
            });
        }
        
        const user = rows[0]; 
        const valid_password = user.password;

        //Password checking
        if (password === valid_password) {
            // Remove the password before sending
            delete user.password; 
            return res.status(200).json({
                message: 'Login Successful!',
                user: user
            });
        } else {
            return res.status(401).json({
                message: 'Incorrect Password.' 
            });
        }
        
    } catch(err) {
        console.error(err); 
        return res.status(400).json(err);
    }
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
    console.log(`API endpoint: POST http://localhost:${port}/api/login`);
});