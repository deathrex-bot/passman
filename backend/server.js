const express = require('express')
const dotenv = require('dotenv')
const { MongoClient } = require('mongodb');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

dotenv.config()

// Connection URL
const url = process.env.MONGO_URI; // Get the MongoDB connection string from environment variables for better security and flexibility
const client = new MongoClient(url); // Create a new MongoClient

// Database Name
const dbName = 'passop';
const app = express()
const port = 3000
app.use(cors()); // Middleware to enable CORS

app.use(express.json()) // Middleware to parse incoming JSON request bodies

client.connect(); // Initialize the connection to MongoDB

// Encryption setup
const algorithm = 'aes-256-cbc';
// We use scryptSync to ensure the key is exactly 32-bytes long, which aes-256 requires
const encryptionKey = crypto.scryptSync(process.env.ENCRYPTION_KEY || 'fallback_dev_secret', 'salt', 32);

const encrypt = (text) => {
    const iv = crypto.randomBytes(16); // Initialization vector for added security
    const cipher = crypto.createCipheriv(algorithm, encryptionKey, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted; // Store IV and encrypted text together
};

const decrypt = (text) => {
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv(algorithm, encryptionKey, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
};

// Middleware to authenticate and verify the JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Format is "Bearer <token>"

    if (token == null) return res.status(401).send({ success: false, message: "No token provided" });

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(403).send({ success: false, message: "Invalid or expired token" });
        
        // Attach the user info (id, email) from the token payload to the request object
        req.user = decoded.user;
        next(); // Move on to the actual route handler
    });
};

//Get all the passwords
app.get('/', authenticateToken, async (req, res) => {
    const db = client.db(dbName);
    const collection = db.collection('passwords'); // Change 'passwords' to your actual collection name
    
    // Only find passwords where the userId matches the logged-in user
    const findResult = await collection.find({ userId: req.user.id }).toArray();
    
    // Decrypt the passwords before sending them to the frontend
    const decryptedResult = findResult.map(item => {
        if (item.password) {
            try {
                item.password = decrypt(item.password);
            } catch (err) {
                console.error("Error decrypting password for item:", item._id);
            }
        }
        return item;
    });
    res.json(decryptedResult); // Send the database array back as a JSON response
})

//Save a password
app.post('/', authenticateToken, async (req, res) => {
    const db = client.db(dbName);
    const collection = db.collection('passwords'); // Change 'passwords' to your actual collection name
    
    // Combine the incoming password data with the logged-in user's ID
    const passwordData = { ...req.body, userId: req.user.id };
    
    // Encrypt the password before saving it to the database
    if (passwordData.password) {
        passwordData.password = encrypt(passwordData.password);
    }
    
    const insertResult = await collection.insertOne(passwordData); 
    res.send({ success: true, result: insertResult }); // Send a success message back to the client
})

//Delete password
app.delete('/', authenticateToken, async (req, res) => {
    const db = client.db(dbName);
    const collection = db.collection('passwords'); // Change 'passwords' to your actual collection name
    
    // Only allow deleting if BOTH the password data matches AND it belongs to the logged-in user
    const deleteResult = await collection.deleteOne({ ...req.body, userId: req.user.id }); 
    res.send({ success: true, result: deleteResult }); // Send a success message back to the client
})

//Signup API

app.post('/signup', async (req, res) => {
    try {
        const db = client.db(dbName);
        const collection = db.collection('users');

        // Destructure only what we need from req.body (ignoring Cpassword)
        const { Name, Email, Mpassword } = req.body;

        // 1. Check if a user with this email already exists
        const existingUser = await collection.findOne({ Email: Email });
        if (existingUser) {
            return res.status(400).send({ success: false, message: "User already exists with this email" });
        }

        // 2. Hash the Master Password before saving
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(Mpassword, saltRounds);

        // 3. Save the new user to the database
        const insertResult = await collection.insertOne({ Name, Email, Mpassword: hashedPassword });
        res.send({ success: true, result: insertResult });

    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).send({ success: false, message: "Internal server error" });
    }
})

//Login API

app.post('/login', async (req, res) => {
    try {
        const db = client.db(dbName);
        const collection = db.collection('users');

        // 1. Destructure Email and Mpassword from req.body
        const { Email, Mpassword } = req.body; 

        // 2. Find the user by email
        const existingUser = await collection.findOne({ Email: Email });
        if (!existingUser) {
            return res.status(401).send({ success: false, message: "Invalid email or password" });
        }

        // 3. Compare the provided password with the hashed password in the database
        const isPasswordValid = await bcrypt.compare(Mpassword, existingUser.Mpassword);
        
        if (!isPasswordValid) {
            return res.status(401).send({ success: false, message: "Invalid email or password" });
        }

        // 4. If credentials are correct, create a JWT
        const payload = {
            user: {
                id: existingUser._id, // Use the user's unique MongoDB ID
                email: existingUser.Email
            }
        };
        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '1h' } // Good practice: token expires in 1 hour
        );

        // 5. Send a success response with the token and user details
        res.send({ success: true, message: "Login successful", token: token, user: { Name: existingUser.Name, Email: existingUser.Email } });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).send({ success: false, message: "Internal server error" });
    }
})



app.listen(port, () => {
    console.log(`Example app listening on port http://localhost:${port}`)
})
