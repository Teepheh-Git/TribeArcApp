import React, {useEffect, useMemo, useReducer} from "react";
import {sleep} from "../utils/sleep";
import {createAction} from "../utils/createAction";
import {handleQuery, handleQueryNoToken} from "../graphql/requests";
import SecureStorage from "react-native-secure-storage";

export const useAuth = () => {

    function randomString(length, chars) {
        let result = '';
        for (let i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
        return result;
    }


    const [state, dispatch] = useReducer(
        (state, action) => {
            switch (action.type) {
                case "SET_USER":
                    return {
                        ...state,
                        loading: false,
                        user: {...action.payload},
                    };
                case "REMOVE_USER":
                    return {
                        ...state,
                        user: undefined,
                    };
                case "SET_LOADING":
                    return {
                        ...state,
                        loading: action.payload,
                    };
                default:
                    return state;
            }
        },
        {
            user: undefined,
            loading: true,
        },
    );


    const auth = useMemo(() => ({


            login: async (email, password) => {

                let qry = `mutation {
                login(input: { identifier: "${email}", password: "${password}" }) {
                 jwt
                 user{
                   username
                   id
                   confirmed
                   email
                   firstname
                   lastname
                        }
                            }
                                }`

                // console.log(qry)


                try {
                    let res = await handleQueryNoToken(qry);
                    // console.log(res.data, "QQQQQQ")


                    // let queryCommunityId = `query{
                    //     users(where:{id:${res.data.login.user.id}}){
                    //                 id
                    //                 communities{
                    //                 id
                    //                     }
                    //                    }
                    //                   }`


                    // let qryRes = await handleQuery(queryCommunityId, res.data.login.jwt, false)
                    // console.log(qryRes.data.users[0].communities, "DAtATATTATA")

                    // const arr = qryRes.data.users[0].communities.map((item) => {
                    //     return Number(item.id)
                    // })

                    // arr.push(15)
                    // let updateCommunities = `mutation {
                    //     updateUser(
                    //     input: { where: { id: ${res.data.login.user.id} },
                    //     data: { communities: [${arr}] }}
                    //     ) {
                    //     user {
                    //     id
                    //     communities {
                    //     id
                    //         }
                    //            }
                    //               }
                    //                  }`

                    // let newComm = await handleQuery(updateCommunities, res.data.login.jwt, false)


                    let qrySavingsAcc = `query {
                            users(where: { id: ${res.data.login.user.id} }) {
                            id
                            email
                            saving_account {
                            id
                                    }
                                 }
                               }`

                    let qrySavingsRes = await handleQuery(qrySavingsAcc, res.data.login.jwt, false)

                    const savingAcctCheck = await qrySavingsRes.data.users[0].saving_account

                    if (!savingAcctCheck) {

                        let createSavingAcct = `mutation {
                                                createSavingAccount(input: {
                                                data: { amount_saved: 0.0, user_id: ${res.data.login.user.id}, community_id: 15 } }) {
                                                savingAccount {
                                                id
                                                    }
                                                  }
                                               }`

                        let createSavingAcctRes = await handleQuery(createSavingAcct, res.data.login.jwt, false)
                    }

                    // console.log(qrySavingsRes.data.users[0].saving_account, "REZXXX")

                    const user = {
                        token: res.data.login.jwt,
                        id: res.data.login.user.id,
                        email: res.data.login.user.email,
                        // avatar: res.data.login.user.avatar

                    };

                    await SecureStorage.setItem("user", JSON.stringify(user));
                    dispatch(createAction("SET_USER", user));

                } catch (e) {
                    console.log(e, "error @login")
                }
            },


            register: async (email, password, referredBy) => {
                const rString = randomString(5, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');


                let codeVerification = `mutation {
                                        referralCheck(referral_code: "${referredBy}") {
                                                ok
                                                    }
                                                  }`

                let qry = `mutation {
                                register(
                                    input: {
                                    email: "${email}"
                                    username: "${email}"
                                    password: "${password}"
                                    referred_by: "${referredBy}"
                                    referral_code:"${rString}"
                                    domain_url:"investment.triberarc.com"
                                         }
                                     ) {
                                  jwt
                                  user {
                                  id
                                   email
                                   username
                                   confirmed
                                    }
                                      }
                                       }`


                let otpQuery = `mutation{
                                    sendOtp(email:"${email}"){
                                        ok
                                            }
                                                }`


                try {

                    // console.log(updateRefAndRefBY)
                    let codeVerificationRes = await handleQueryNoToken(codeVerification);

                    // console.log(codeVerificationRes.data.referralCheck.ok)


                    if (codeVerificationRes.data.referralCheck.ok) {

                        let res = await handleQueryNoToken(qry);


                        // let updateRefAndRefBY = `mutation {
                        //             updateUser(
                        //                 input: {
                        //                 where: { id: ${res.data.register.user.id} }
                        //                 data: { referred_by: "${referredBy}", referral_code: "${rString}" }
                        //                 }
                        //                 ) {
                        //                 user {
                        //                     id
                        //                         }
                        //                      }
                        //                   }`
                        //
                        //
                        // console.log(updateRefAndRefBY)
                        // console.log(res.data.register.jwt)


                        // let updateRefCodesRes = await handleQuery(updateRefAndRefBY, res.data.register.jwt, false)
                        // console.log(updateRefCodesRes.errors)


                        let otpQryRes = await handleQueryNoToken(otpQuery);


                    }


                } catch (e) {
                    console.log(e, "error @login")

                }


            },

            logout: async () => {
                await SecureStorage.removeItem("user");
                dispatch(createAction("REMOVE_USER"));
            },

        }), [],
    );


    useEffect(() => {
        sleep(700).then(() => {
            SecureStorage.getItem("user").then(user => {
                // console.log(user, "STORED USERRR");

                if (user) {
                    dispatch(createAction("SET_USER", JSON.parse(user)));
                } else {
                    dispatch(createAction("SET_LOADING", false));
                }

            });
        });


    }, []);


    return {auth, state};

}
