import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
    public async hashPassword(memberPassword: string): Promise<string> {
        const salt = await bcrypt.genSalt();
        const hash = await bcrypt.hash(memberPassword, salt);
        return hash;
    }

    public async comparePasswords(password: string, hashedPassword: string): Promise<boolean> {
        return await bcrypt.compare(password, hashedPassword);
    }
}
