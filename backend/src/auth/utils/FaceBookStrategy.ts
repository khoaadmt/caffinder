import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-facebook';
import { VerifyCallback } from 'passport-google-oauth20';
require('dotenv').config();
console.log(
  ' callbackURL fb:',
  `${process.env.SERVER_URL}/api/auth/facebook/redirect`,
);

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor() {
    super({
      clientID: process.env.CLIENT_ID_FB,
      clientSecret: process.env.CLIENT_SECRET_FB,
      callbackURL: `${process.env.SERVER_URL}/api/auth/facebook/redirect`,
      // callbackURL: `http://localhost:5000/api/auth/facebook/redirect`,
      scope: 'email',
      profileFields: ['emails', 'name'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<any> {
    return profile;
  }
}
