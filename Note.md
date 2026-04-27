1. So first make frontend which sends login username and password to beckend.

2. Then at backend it will check if that combination of username and password exists or not
    1. In login route compare the entered password with the hashed password in the database. If they match generate a JSON Web Token (JWT) and send it back to the React app to keep the user logged in.

3. Creation of new user will happen at signup page 
    1. Use bcrypt library to hash the Mpassword before storing it in database

    <!-- Is it safe to store the actual passwords in plain text in the database, or should I encrypt them too? -->

    <!-- How can I show a real-time password strength indicator (weak, medium, strong) as the user types? -->
    
    <!-- How can I implement a Protected Route in App.jsx instead? -->


<!-- Useful Notes -->

<!-- ok what even is saltRounds = 10 what is it doing?

That is a fantastic question! To understand what saltRounds = 10 is doing, we have to break down how bcrypt actually secures a password.

It involves two main concepts: Salting and Rounds.

1. What is a "Salt"?
If two users both choose the password "password123", a standard hashing algorithm would output the exact same gibberish for both of them. Hackers use massive, pre-computed databases of hashes (called "rainbow tables") to instantly reverse these common passwords.

To stop this, bcrypt adds a Salt—a completely random string of characters—to the password before it hashes it.

"password123" + RandomSaltA = HashA
"password123" + RandomSaltB = HashB
Now, even if two users have the same password, their final hashes in your database will look entirely different!

2. What are the "Rounds" (Cost Factor)?
Hashing algorithms are actually designed to be slow on purpose. If a hashing algorithm is too fast, a hacker who steals your database could use powerful graphics cards to guess millions of passwords per second (brute-forcing) until they find matches.

The "rounds" tell bcrypt exactly how slow to be. It is a logarithmic cost factor, meaning the algorithm is run 2^rounds times.

saltRounds = 10 means the algorithm runs 2^10 (1,024) times.
If you changed it to 11, it would run 2,048 times (taking twice as long).
If you changed it to 12, it would run 4,096 times (taking four times as long).
Why 10?
10 is the standard default used across the industry. It strikes the perfect balance between user experience and security:

For your server: It takes roughly 100 milliseconds to hash the password. The user clicking "Sign Up" or "Login" won't even notice the delay.
For a hacker: If they steal your database and want to guess passwords, that 100-millisecond delay applies to every single guess. Guessing 1 billion common passwords against just one user's hash would take them years, making it mathematically unfeasible to crack.
So, const saltRounds = 10; is simply you telling bcrypt: "Generate a random salt, and hash this password 1,024 times so that it's secure against hackers, but still fast enough for a good login experience!" -->


<!-- **************************************************************************************************** -->



<!-- so shouldn't we be doin this for all the passwords inside password vault or just for master password?

That is an incredibly smart question, and it brings us to the most important concept in building a password manager!

The short answer is NO, you should not use bcrypt (hashing) for the passwords inside the user's vault.

Instead, you must use Encryption for the vault passwords. Here is why:

Hashing vs. Encryption: The Crucial Difference
1. Hashing (bcrypt) is a ONE-WAY street. When you hash the Master Password, it turns into gibberish ($2b$10$...), and it is mathematically impossible to turn that gibberish back into the original password.

Why we use it for the Master Password: We only ever need to ask, "Did the user type the same thing they typed when they signed up?" We never actually need to see or retrieve their Master Password.
Why we CAN'T use it for the Vault Passwords: If you hash the passwords a user saves for Facebook or Netflix, you can never un-hash them. The user would never be able to copy and paste their saved passwords!
2. Encryption is a TWO-WAY street. Encryption turns text into gibberish, but it uses a Secret Key. If you have that Secret Key, you can decrypt the gibberish back into the original text.

Why we use it for Vault Passwords: You want to store the passwords in your database as locked boxes (encrypted). When the user wants to see their Netflix password, they use their "key" to unlock the box (decrypt) so they can read it.
How real Password Managers do this (Zero-Knowledge Architecture)
In a professional password manager (like Bitwarden or 1Password), the backend database never knows the user's actual passwords—not even the encrypted ones.

Here is how the flow usually works:

The user types their Master Password on the frontend (React).
The frontend uses the Master Password to generate a Secret Encryption Key.
When the user saves a new password (e.g., for Facebook), the React frontend encrypts it using that Secret Key before sending it to the Express backend.
Your Node.js backend just receives a blob of encrypted gibberish and saves it to MongoDB.
When the user views their vault, the backend sends the gibberish back to React, and React decrypts it using the Secret Key.
This means if a hacker steals your MongoDB database, all they get are hashed Master Passwords and encrypted Vault Passwords. Without the user's actual brain (knowing the Master Password to unlock the encryption key), the hacker gets absolutely nothing useful!

For now, as you build out your Tier 1 security, you can use built-in Node.js libraries like crypto to encrypt the vault passwords on your backend before saving them, and decrypt them before sending them to the frontend. -->


<!-- **************************************************************************************************** -->

<!-- should I test my "/signup" API using Postman?

Yes, absolutely! Testing your API with Postman (or a similar tool like Insomnia or VS Code's Thunder Client) before connecting it to your React frontend is a highly recommended best practice.

Testing the backend in isolation ensures that your server logic, database connection, and password hashing are working perfectly. If you run into an error later when connecting React, you will know for a fact the issue is in the frontend code, not the backend.

Here is exactly how you can test your new /signup route in Postman:

1. Set up the Request
Open Postman and click the + button to create a new request.
Change the HTTP method from GET to POST.
Enter your API URL: http://localhost:3000/signup
2. Add the JSON Body
Right below the URL bar, click the Body tab.
Select the raw radio button.
On the right side of those radio buttons, click the dropdown that says Text and change it to JSON.
Paste this exact JSON object into the text area (Notice it perfectly matches the Name, Email, and Mpassword fields your backend expects):
json
{
  "Name": "John Doe",
  "Email": "john@example.com",
  "Mpassword": "mySecurePassword123"
}
3. Send the Request and Verify
Click the blue Send button.

Test Case 1: First time signup You should get a 200 OK status and a response that looks like this:

json
{
    "success": true,
    "result": {
        "acknowledged": true,
        "insertedId": "651a..." 
    }
}
Test Case 2: Duplicate Email Without changing anything, click Send again. Because of the duplicate check you added, you should get a 400 Bad Request status and this response:

json
{
    "success": false,
    "message": "User already exists with this email"
}
4. The Final Check (MongoDB)
Open MongoDB Compass (or Atlas in your browser), go to your passop database, and open the users collection. Look at the document that was just created. You should see that Mpassword is not "mySecurePassword123", but rather a long string of gibberish starting with $2b$10$....

If you see that, congratulations! Your backend signup flow is perfectly secure and ready to be connected to React! -->


<!-- ************************************************************************************************* -->

<!-- explain this JWT middleware to me -->

<!-- 1. Extracting the Token
javascript
const authHeader = req.headers['authorization'];
const token = authHeader && authHeader.split(' ')[1]; // Format is "Bearer <token>"
When your frontend makes an authenticated request to the backend, it usually sends the JWT inside the HTTP Authorization header. The standard format for this header is the word Bearer, followed by a space, followed by the token itself (e.g., Bearer eyJhbGciOiJIUz...).

authHeader grabs the entire string.
.split(' ')[1] splits the string at the space and grabs the second part (the actual token). The authHeader && part is a safeguard to prevent a crash if the header is completely missing.
2. Checking for Missing Tokens
javascript
if (token == null) return res.status(401).send({ success: false, message: "No token provided" });
If the token isn't there (meaning the user isn't logged in or the frontend forgot to send it), the server immediately stops processing the request and sends back a 401 Unauthorized response.

3. Verifying the Token
javascript
jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
This is where the magic happens. The jsonwebtoken library mathematically verifies the token using your secret key (process.env.JWT_SECRET). It checks two things:

Was this token actually created by your server? (If a hacker tampered with it, the math won't add up).
Has the token expired? (In your login route, you set it to expire in 1 hour).
4. Handling Invalid Tokens
javascript
if (err) return res.status(403).send({ success: false, message: "Invalid or expired token" });
If the verification fails (either because the token was faked, tampered with, or the 1 hour is up), it sends back a 403 Forbidden response and stops the request.

5. Passing Data to the Route
javascript
req.user = decoded.user;
next(); // Move on to the actual route handler
If the token is valid, jwt.verify spits out the decoded payload. If you look at your /login route, you packed the user's id and email into this token when you created it.

req.user = decoded.user; takes that data and attaches it directly to the Express request object.
next(); is the final green light. It tells Express, "This user is good to go, move them along to the actual route they were trying to access."
Because of this middleware, when your code reaches the app.get('/') or app.post('/') routes, you can safely use req.user.id knowing with 100% certainty that the user is exactly who they claim to be! -->

<!-- **************************************************************************************************** -->

<!-- explain me the whole work flow of login process like which method or middleware is working when -->

<!-- Phase 1: The Login Request
When the user clicks "Login" on your frontend, a POST request is sent to /login. Here is exactly what happens, in order:

1. Global Middlewares Run First Before the request even reaches your /login code, it passes through two global middlewares at the top of your file:

app.use(cors()): This checks if the request is coming from an allowed origin (like your React app's URL) and lets it through.
app.use(express.json()): This takes the raw data sent by the frontend, parses it into a JavaScript object, and attaches it to req.body. Without this, your app wouldn't know what email or password was sent!
2. The /login Route Handler Executes The request matches app.post('/login', ...), and your asynchronous function begins:

Database Setup: It connects to the passop database and the users collection.
Extract Data: It pulls the Email and Mpassword (Master Password) out of req.body.
3. Database Lookup

collection.findOne({ Email: Email }): The server queries MongoDB to see if an account with this email exists.
If the user does not exist, it immediately sends back a 401 Unauthorized response: "Invalid email or password".
4. Password Verification (bcrypt)

If the user exists, the server takes the plain-text password the user just typed (Mpassword) and compares it to the encrypted, hashed password saved in the database (existingUser.Mpassword).
It uses bcrypt.compare() to safely do this math.
If the passwords do not match, it sends back a 401 Unauthorized response.
5. Token Generation (jsonwebtoken)

If the passwords match, the user is authenticated! Now, the server needs to give the user a "VIP pass" so they don't have to log in again on the next page click.
It creates a payload containing the user's MongoDB _id and Email.
It uses jwt.sign() to cryptographically sign this payload using your secret key (process.env.JWT_SECRET), setting it to expire in 1 hour ({ expiresIn: '1h' }).
6. The Response

The server sends a 200 OK response back to the frontend containing success: true, the generated token, and some basic user details (Name, Email).
Phase 2: Post-Login (Where the Custom Middleware comes in)
You might be wondering: "Wait, when does authenticateToken run?"

The authenticateToken middleware does not run during the /login process. It runs after the user is successfully logged in, whenever they try to access protected data.

For example, when the frontend tries to fetch the user's saved passwords, it sends a GET request to /:

The Request: The frontend sends a request to / and includes the JWT it got during login inside the HTTP Authorization header.
The Route: The request hits app.get('/', authenticateToken, async (req, res) => {...}). Notice how authenticateToken is sandwiched in the middle!
The Middleware (authenticateToken) Intercepts:
It grabs the token from the header.
It uses jwt.verify() to check if the token is valid, wasn't tampered with, and hasn't expired.
If it's invalid, it kicks the user out with a 403 Forbidden response.
If it's valid, it unpacks the payload, attaches the user's ID to req.user = decoded.user, and calls next().
The Final Route Runs: next() tells Express to move on to your actual async (req, res) function. Because of the middleware, your route can confidently use req.user.id to fetch only the passwords belonging to that specific user! -->