// @flow
import React, {useCallback, useContext, useEffect, useRef, useState} from 'react';
import {Image, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {COLORS, icons, SIZES} from "../../constants";
import {UserContext} from "../../context/UserContext";
import AccountOptions from "../../components/AccountOptions";
import {AuthContext} from "../../context/AuthContext";
import CustomButton from "../../components/CustomButton";
import {Modalize} from "react-native-modalize";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {handleQuery} from "../../graphql/requests";
import FastImage from 'react-native-fast-image'

import {useFocusEffect} from "@react-navigation/native";
import {FONTS} from "../../constants/theme";
import NotchResponsive from "../../components/NotchResponsive";


const Profile = ({navigation, route}) => {

    const user = useContext(UserContext)
    // console.log(user)

    const [avatar, setAvatar] = useState(null)
    const [firstname, setFirstname] = useState("")
    const [lastname, setLastname] = useState("")
    const [bvn, setBvn] = useState(false)

    const [paidRegFee, setPaidRegFee] = useState(false);


    useFocusEffect(
        useCallback(() => {

            ChkRegFee()

            GetName()

        }, []))

    const GetName = async () => {

        let qry = `query{
              qry1:  users(where:{id:${user.id}}){
                 firstname
                lastname
                avatar
                        }
               qry2: savingAccounts(where: { user_id: ${user.id} }) {
                    id
                     bvn_status
                        }
                        
                        
                       }`

        try {

            const name = await handleQuery(qry, user.token, false)

            // console.log(name.data.qry2[0].bvn_status, "iiii")
            await setFirstname(name.data.qry1[0].firstname)
            await setLastname(name.data.qry1[0].lastname)
            await setAvatar(name.data.qry1[0].avatar)
            await setBvn(name.data.qry2[0].bvn_status)


        } catch (e) {

            console.log(e, "GetNameErr")
        }

    }


    const ChkRegFee = async () => {

        let qry = `query {
                    users(where: { id: ${user.id} }) {
                        paid_reg_fee
                                    }
                                }`


        try {
            const qryRes = await handleQuery(qry, user.token, false)
            // console.log(qryRes.data.users[0].paid_reg_fee)
            await setPaidRegFee(qryRes.data.users[0].paid_reg_fee)
            // console.log(qryRes.data.users[0].paid_reg_fee)


        } catch (e) {
            console.log(e, "ChkRegFeeErr")
        }

    }


    // console.log(name)

    const modalizeRef = useRef<Modalize>(null);

    const OpenModal = () => {
        modalizeRef.current?.open();
    };

    const CloseModal = () => {
        modalizeRef.current?.close();
    };


    const {logout} = useContext(AuthContext)

    //
    // const GetImg = async () => {
    //
    //     const value = await AsyncStorage.getItem("ImageLocal")
    //
    //     try {
    //
    //         if (value !== null) {
    //             setAvatar(value)
    //         }
    //
    //     } catch (e) {
    //         console.log(e, "")
    //     }
    //
    // }


    const renderHeader = () => (

        <View style={{
            padding: 20,
            borderTopRightRadius: 25,
            borderTopLeftRadius: 25,
            width: SIZES.width,
        }}>

            <TouchableOpacity onPress={() => CloseModal()}>
                <Text style={{
                    alignSelf: "flex-end",
                    color: "black",
                    fontFamily: "Nexa-Bold",
                    fontSize: 28,
                    right: 15
                }}>x</Text>

            </TouchableOpacity>

        </View>

    );


    const renderInner = () => (
        <View style={{
            paddingHorizontal: 20,
            height: 410,
            alignItems: "center",
        }}>

            <Text style={{fontSize: SIZES.width * 0.05, color: COLORS.black, fontFamily: "Nexa-Bold"}}>Logout?</Text>
            <Text style={{fontSize: 16, color: "#999999", fontFamily: "Nexa-Book", marginVertical: 30}}>Are you sure you
                want to logout?</Text>

            <View style={{width: SIZES.width * 0.9, marginVertical: 10}}>
                <CustomButton
                    onPress={() => {
                        logout();
                    }}
                    filled
                    text={"Confirm"}/>

            </View>
        </View>
    );

    return (
        <>
            <NotchResponsive color={COLORS.white}/>
            <ScrollView style={{backgroundColor: COLORS.white, flex: 1}}>


                <View style={styles.container}>
                    <Modalize

                        modalHeight={SIZES.height * 0.5}
                        handleStyle={{backgroundColor: 'transparent'}}
                        childrenStyle={{
                            backgroundColor: COLORS.white,
                            borderRadius: 55,
                        }}
                        ref={modalizeRef}>
                        {renderHeader()}
                        {renderInner()}
                    </Modalize>

                    {/*<BackButton onPress={() => navigation.pop()}/>*/}
                    <Text style={styles.myAccount}>My Account</Text>

                    <Pressable onPress={() => {
                        navigation.navigate("EditProfile")
                    }} style={styles.userDetails}>
                        <View style={styles.imgContainer}>
                            <FastImage style={styles.img} resizeMode={"cover"}
                                       source={avatar ? {
                                           uri: avatar,
                                           priority: FastImage.priority.normal
                                       } : require("../../assets/images/userImg.png")}/>
                        </View>

                        <View style={styles.fullNameContainer}>
                            <Text style={styles.fullName}>{firstname? firstname:"User"} {lastname?lastname:"Name"}</Text>
                            <Text style={styles.editProfile}>Edit Profile</Text>
                        </View>

                        <Image source={icons.arrowRight} style={{width: 20, height: 20}}
                               resizeMode={"contain"}/>


                    </Pressable>


                    {!bvn && <AccountOptions onPress={() => {
                        navigation.navigate(paidRegFee ? "AddBvn" : "RegistrationFee")
                    }} image={icons.addBvn} text={"Add your BVN"}/>}

                    <AccountOptions onPress={() => {
                        navigation.navigate(paidRegFee ? "AccountDetailsPage" : "RegistrationFee")
                    }} image={icons.acctDet} text={"Account Details"}/>

                    <AccountOptions onPress={() => {
                        navigation.navigate(paidRegFee ? "CardSettings" : "RegistrationFee")

                    }} image={icons.linkCard} text={"Card Settings"}/>
                    <AccountOptions onPress={() => {
                        navigation.navigate("ChangePassword")

                    }} image={icons.key} text={"Password Settings"}/>
                    <AccountOptions onPress={() => {
                        navigation.navigate("ReferralPage")
                    }} image={icons.refer} text={"Refer your friends"}/>
                    <AccountOptions
                        image={icons.logout}
                        text={"Logout"}
                        onPress={() => OpenModal()}

                    />
                </View>

                {/*<View style={{height: 20, marginBottom: 30,}}/>*/}

            </ScrollView>
        </>
    );
};

export default Profile


const styles = StyleSheet.create({
    container: {
        // flex:1,
        paddingHorizontal: 20,
        height: SIZES.height,
        backgroundColor: COLORS.white

    },
    myAccount: {
        color: COLORS.primary,
        ...FONTS.h3,
        marginVertical: 15
    },
    userDetails: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        height: SIZES.height * 0.12,
        width: "100%",
        backgroundColor: 'white',
        borderRadius: 15,
        paddingHorizontal: 20,
        marginVertical: 10,
        elevation: 2,
        shadowColor: "black",
        shadowRadius: 5,
        shadowOpacity: 0.15,
        shadowOffset: {
            width: 0,
            height: 0
        }
    },
    img: {
        width: SIZES.width * 0.15,
        height: SIZES.width * 0.15,
        borderRadius: 50
    },
    fullNameContainer: {
        width: SIZES.width * 0.55,
        height: 50,
        justifyContent: "space-between",
        paddingHorizontal: 10
    },
    fullName: {
        ...FONTS.h8,
        color: COLORS.black
    },

    editProfile: {
        ...FONTS.body9,
        color: COLORS.primary,
    }
})
