import { User } from '../../models/user.model';
import bcrypt from 'bcrypt';
import { generateToken } from '../../utils/jwt';

export const registerUser = async (data: any) => {
    const { username, email, password } = data;

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
        throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
        username,
        email,
        password: hashedPassword,
    });

    const token = generateToken(user.id, user.username);

    return {
        user: {
            id: user.id,
            username: user.username,
            email: user.email,
        },
        token,
    };
};

export const loginUser = async (data: any) => {
    const { email, password } = data;

    const user = await User.findOne({ email });
    if (!user || !user.password) {
        throw new Error('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new Error('Invalid credentials');
    }

    const token = generateToken(user.id, user.username);

    return {
        user: {
            id: user.id,
            username: user.username,
            email: user.email,
        },
        token,
    };
};
