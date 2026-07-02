import {
    CognitoUserPool,
    AuthenticationDetails,
    CognitoUser,
    CognitoUserAttribute
} from "amazon-cognito-identity-js";

const poolData = {
    UserPoolId: import.meta.env.VITE_USER_POOL_ID,
    ClientId: import.meta.env.VITE_USER_POOL_CLIENT_ID
};

const userpool = new CognitoUserPool(poolData);

const getCognitoUser = (email) =>
    new CognitoUser({
        Username: email,
        Pool: userpool
    });


// ====================== SIGN UP ======================

export const signUpWithCognito = async (email, password) => {
    email = String(email || '').trim().toLowerCase();
    password = String(password || '');

    try {

        const attributes = [
            new CognitoUserAttribute({
                Name: "email",
                Value: email
            })
        ];

        const result = await new Promise((resolve, reject) => {

            userpool.signUp(
                email,
                password,
                attributes,
                null,
                (err, result) => {

                    if (err) {
                        reject(
                            new Error(
                                err
                            )
                        );
                        return;
                    }

                    resolve(result);
                }
            );
        });

        return result;

    } catch (error) {

        throw error;

    }
};


// ====================== CONFIRM SIGNUP ======================

export const confirmSignUpCognito = async (email, code) => {
    email = String(email || '').trim().toLowerCase();

    try {

        const cognitoUser = getCognitoUser(email);

        const result = await new Promise((resolve, reject) => {

            cognitoUser.confirmRegistration(
                code,
                true,
                (err, result) => {

                    if (err) {
                        reject(err);
                        return;
                    }

                    resolve(result);
                }
            );
        });

        return result;

    } catch (error) {

        throw error;

    }
};


// ====================== RESEND OTP ======================

export const resendConfirmationCode = async (email) => {
    email = String(email || '').trim().toLowerCase();

    try {

        const cognitoUser = getCognitoUser(email);

        const result = await new Promise((resolve, reject) => {

            cognitoUser.resendConfirmationCode(
                (err, result) => {

                    if (err) {
                        reject(err);
                        return;
                    }

                    resolve(result);
                }
            );
        });

        return result;

    } catch (error) {

        throw error;

    }
};


// ====================== SIGN IN ======================

export const signInWithCognito = async (
    email,
    password
) => {
    email = String(email || '').trim().toLowerCase();
    password = String(password || '');

    if (!email || !password) {
        throw new Error('Email and password are required for sign-in');
    }

    try {

        const authenticationDetails =
            new AuthenticationDetails({
                Username: email,
                Password: password
            });

        const cognitoUser = getCognitoUser(email);

        const result = await new Promise((resolve, reject) => {

            cognitoUser.authenticateUser(
                authenticationDetails,
                {

                    onSuccess: (result) => {

                        resolve({
                            accessToken:
                                result
                                    .getAccessToken()
                                    .getJwtToken(),

                            idToken:
                                result
                                    .getIdToken()
                                    .getJwtToken(),

                            refreshToken:
                                result
                                    .getRefreshToken()
                                    .getToken()
                        });
                    },

                    onFailure: (err) => {
                        reject(err);
                    },

                    newPasswordRequired:
                        (
                            userAttributes,
                            requiredAttributes
                        ) => {

                            resolve({
                                newPasswordRequired: true,
                                userAttributes,
                                requiredAttributes,
                                user: cognitoUser
                            });
                        }
                }
            );
        });

        return result;

    } catch (error) {

        throw error;

    }
};


// ====================== FORGOT PASSWORD ======================

export const forgotPasswordCognito = async (
    email
) => {

    try {

        const cognitoUser =
            getCognitoUser(email);

        const result = await new Promise(
            (resolve, reject) => {

                cognitoUser.forgotPassword({

                    onSuccess: (data) => {
                        resolve(data);
                    },

                    onFailure: (err) => {
                        reject(err);
                    },

                    inputVerificationCode:
                        (data) => {
                            resolve(data);
                        }
                });
            }
        );

        return result;

    } catch (error) {

        throw error;

    }
};


// ====================== CONFIRM NEW PASSWORD ======================

export const confirmNewPasswordCognito = async (
    email,
    verificationCode,
    newPassword
) => {

    try {

        const cognitoUser =
            getCognitoUser(email);

        const result =
            await new Promise(
                (resolve, reject) => {

                    cognitoUser.confirmPassword(
                        verificationCode,
                        newPassword,
                        {

                            onSuccess: () => {
                                resolve(
                                    "Password reset successfully"
                                );
                            },

                            onFailure: (err) => {
                                reject(err);
                            }
                        }
                    );
                }
            );

        return result;

    } catch (error) {

        throw error;

    }
};

// delete cognito user

export const deleteCognitoUser = async (email) => {
    try {

        const cognitoUser = getCognitoUser(email);
        if (!cognitoUser) {
            throw new Error("No authenticated user found");
        }

        // Ensure session is valid
        await new Promise((resolve, reject) => {

            cognitoUser.getSession((err, session) => {

                if (err || !session?.isValid()) {
                    reject(
                        new Error("User session is invalid")
                    );
                    return;
                }

                resolve(session);
            });
        });

        // Delete user
        await new Promise((resolve, reject) => {

            cognitoUser.deleteUser((err, result) => {

                if (err) {
                    reject(err);
                    return;
                }

                resolve(result);
            });
        });

        // remove local session
        cognitoUser.signOut();

        return {
            success: true,
            message: "User deleted successfully"
        };

    } catch (error) {

        throw error;

    }
};