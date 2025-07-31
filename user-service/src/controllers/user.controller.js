import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';


const registerUser = async (req, res) => {
    try {
        const { email, name, password, role, number } = req.body;

        const requiredFields = ['email', 'name', 'password', 'role', 'number'];
        const missingFields = requiredFields.filter(field => !req.body[field]);
        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false, message: `Missing required fields`, requiredfields: missingFields
            });
        }
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            email,
            name,
            password: hashedPassword,
            role,
            number,
        });

        await newUser.save();

        const userData = {
            id: newUser._id,
            email: newUser.email,
            name: newUser.name,
            role: newUser.role,
            number: newUser.number,
        }
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            user: userData
        });
    } catch (error) {
        console.error('Error registering user:', error);

        if (error.name === 'ValidationError') {
           const errorMessages = [];
            for (let key in error.errors) {
                errorMessages.push(`${error.errors[key].message}`);
            }
            return res.status(400).json({
                success: false,
               message: `Validation failed. ${errorMessages.join('. ')}`,
            });
        }

        if (error.code === 11000) {
            const duplicateField = Object.keys(error.keyValue)[0];
            const duplicateValue = error.keyValue[duplicateField];

            return res.status(409).json({
                success: false,
                message: `${duplicateField.charAt(0).toUpperCase() + duplicateField.slice(1)} already exists`,
                field: duplicateField,
                value: duplicateValue
            });
        }

        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: `Invalid value for field "${error.path}"`,
                field: error.path,
                value: error.value
            });
        }
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, number, password } = req.body;


        const loginCredential = email || number;

        if (!loginCredential || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email or number and password'
            });
        }

        let query = {};
        let credentialType = '';
        if (email) {
            query = { email };
            credentialType = 'email';
        }
        if (number) {
            query = { number };
            credentialType = 'number';
        }

        const user = await User.findOne(query);

        if (!user) {
            let errorMessage = '';
            switch (credentialType) {
                case 'email':
                    errorMessage = 'Email not found';
                    break;
                case 'number':
                    errorMessage = 'Number not found';
                    break;
                default:
                    errorMessage = 'Invalid credentials';
            }
            return res.status(401).json({
                success: false,
                message: errorMessage,
                field: credentialType
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Incorrect password',
                field: 'password'
            });
        }

        const token = jwt.sign(
            {
                userId: user._id,
                role: user.role
            },
            process.env.SECRET_KEY,
            { expiresIn: '1h' }
        );

        res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
                number: user.number
            }
        });

    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

const getUser = async (req, res) => {
    try {
        const user = req.user;

        res.status(200).json({
            success: true,
            message: 'User profile retrieved successfully',
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
                number: user.number,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            }
        });
    } catch (error) {
        console.error('Error getting user profile:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}

export { registerUser, loginUser, getUser };