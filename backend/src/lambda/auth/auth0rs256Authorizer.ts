import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda';
import 'source-map-support/register';

import { verify, decode } from 'jsonwebtoken';
import { createLogger } from '../../utils/logger';
//import Axios from 'axios';
import { Jwt } from '../../auth/Jwt';
import { JwtPayload } from '../../auth/JwtPayload';

const logger = createLogger('auth');

// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
//const jwksUrl = 'https://dev-50-bb05b.us.auth0.com/.well-known/jwks.json';
//const authSecret = process.env.AUTH_0_SECRET
const cert = `-----BEGIN CERTIFICATE-----
MIIDDTCCAfWgAwIBAgIJAg0w2nrZ+1uQMA0GCSqGSIb3DQEBCwUAMCQxIjAgBgNV
BAMTGWRldi01MC1iYjA1Yi51cy5hdXRoMC5jb20wHhcNMjAxMTIzMTY0MTE5WhcN
MzQwODAyMTY0MTE5WjAkMSIwIAYDVQQDExlkZXYtNTAtYmIwNWIudXMuYXV0aDAu
Y29tMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA4kKXJe3s8q13hP+C
eykzIR2OHerW/8JmIagUEK9v3IqqXw8QvdrV+yQ+6Z7dOc+4g/RLjGQCWGolap3w
13S3DCMu0RPE2Tg70uLnhv1YHsCXKTl22QWopnduz6ASGE6vBzZEr+ySGSvQF6EK
tnNH0G2CcewkTklvgJw24KJSQBPIL1NYSECkI255BZs5URVS3k64ptyD5a2XEmuB
fz19+5E7qPBmhWw4o2gMCgt8xBi1mM3W9291dV1ZSed/r+O6NbTvCChlK0NgyQwi
DEpg7eZR/W4zzNQjAb3dpM0255Vrp/kIVN0Ce2dKxi6JObvGnisf4Wk/7pQ9T+P8
TRgYzwIDAQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBS/nY1bLKCo
y1KnUFMNK3dY9qcB/zAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEB
ANm2BnvpM7kft2SBMfOe+5TWj514nHWYTKZWdo33JquXTZPdC1jC49OJ60YgKu7n
dZW2X31fWzEIUlmS/dqrGFn0lAiWdwDjrrMHMNqRFws8rT3WWj3z4o+fH6h3RQte
w8cENNK7azPR5oPlHpB6QyYpdK716urSfebe1TCwSc61BE7nZfR/WAyxo8WPANHl
D0McCMMIbt9RyTIFKng0qMhd4KXZjb3A2KrahthzUc+s5hets0sRTidwHzZajuYK
Ut81v2sdIx4tricnZxFQDkq0F2DJFIqKQ1cfApht7zRDSSlZVAsz2m3QgoBsEQJe
dAPqwO/asVRzw5/RD81/0vI=
-----END CERTIFICATE-----`

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken);
    logger.info('User was authorized', jwtToken);

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message });

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader);
  const jwt: Jwt = decode(token, { complete: true }) as Jwt;

  // TODO: Implement token verification
  // You should implement it similarly to how it was implemented for the exercise for the lesson 5
  // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/
  if(!jwt){
    throw new Error("jwt do be!!")
  }
  console.log("verifying token...");
  var tokenVerified = verify(token, cert, { algorithms: ['RS256'] });
  console.log("tokenVerified:",tokenVerified);

  return tokenVerified as JwtPayload;
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ');
  const token = split[1];

  return token;
}
/*
function getJwks() {
  const request = require('request');
  request({
    uri: jwksUrl,
    json: true
  }, (err, res) => {
    if (err || res.statusCode < 200 || res.statusCode >= 300) {
      console.log("error encountered while retrieving Jwks", err);
      return err;
    }

    var jwks = res.body.keys;
    return jwks;
  });
}

getSigningKey = (kid, cb) => {
  const callback = (err, keys) => {
    if (err) {
      return cb(err);
    }

    const signingKey = keys.find(key => key.kid === kid);

    if (!signingKey) {
      var error = new SigningKeyNotFoundError(`Unable to find a signing key that matches '${kid}'`);
      return cb(error);
    }

    return cb(null, signingKey);
  };
*/