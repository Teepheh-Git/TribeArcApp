// @flow
import React, {useContext, useEffect, useState} from 'react';
import {Image, ScrollView, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import BackButton from "../../components/BackButton";
import {COLORS, icons, SIZES} from "../../constants";
import {UserContext} from "../../context/UserContext";
import {handleQuery} from "../../graphql/requests";
import {launchImageLibrary} from "react-native-image-picker";
import {BASE_URL} from "../../config";
import CustomTextInput from "../../components/CustomTextInput";
import CustomButton from "../../components/CustomButton";
import FastImage from 'react-native-fast-image'

import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
import NotchResponsive from "../../components/NotchResponsive";


const tabs = [
    {
        key: "1",
        tabStatus: "Personal Info",
        isTab: "TabOne"
    },
    {
        key: "2",
        tabStatus: "Work Info",
        isTab: "TabTwo"

    },
];


const EditProfile = ({navigation}) => {


    const user = useContext(UserContext);

    useEffect(() => {

        GetUserData()
        // GetImg()
    }, []);


    const [tabStatus, setTabStatus] = useState("Personal Info");


    const [isLoading, setIsLoading] = useState(false)
    const [firstName, setFirstName] = useState(" ")
    const [lastName, setLastName] = useState(" ")
    const [email, setEmail] = useState(" ")
    const [phoneNum, setPhoneNum] = useState(" ")
    const [profession, setProfession] = useState(" ")
    const [designation, setDesignation] = useState(" ")
    const [remuneration, setRemuneration] = useState(" ")
    const [filePath, setFilePath] = useState(null);
    const [imageInfo, setImageInfo] = useState('');
    const [avatar, setAvatar] = useState(null);
    const [nextOfKin, setNextOfKin] = useState(" ")
    const [nextOfKinPhoneNum, setNextOfKinPhoneNum] = useState(" ")


    // const GetImg = async () => {
    //
    //     const value = await AsyncStorage.getItem("ImageLocal")
    //
    //     try {
    //
    //         if (value !== null) {
    //             await setAvatar(value)
    //         }
    //
    //     } catch (e) {
    //         console.log(e, "")
    //     }
    //
    // }

    const GetUserData = async () => {
        let qry = `query{
            users(where:{id:${user.id}}){
            firstname
            lastname
            avatar
            email
            phone_number
            profession
            next_of_kin
            next_of_kin_number
            designation
            remuneration
                }
                    }`
        try {

            let res = await handleQuery(qry, user.token, false)
            // console.log(res.data.users[0].profession, "REZZZ")
            await setEmail(res.data.users[0].email)
            await setFirstName(res.data.users[0].firstname)
            await setLastName(res.data.users[0].lastname)
            await setAvatar(res.data.users[0].avatar)
            await setPhoneNum(res.data.users[0].phone_number)
            await setProfession(res.data.users[0].profession)
            await setNextOfKin(res.data.users[0].next_of_kin)
            await setNextOfKinPhoneNum(res.data.users[0].next_of_kin_number)
            await setDesignation(res.data.users[0].designation)
            await setRemuneration(res.data.users[0].remuneration)


        } catch (e) {
            console.log(e, "GetUserDataError")
        }
    }

    const UpdateUserData = async () => {


        let qry = `mutation {
  updateUser(
    input: {
      where: { id: ${user.id} }
      data: {
        firstname: "${firstName}"
        lastname: "${lastName}"
        phone_number: "${phoneNum}"
        profession: "${profession}"
        next_of_kin: "${nextOfKin}"
        next_of_kin_number: "${nextOfKinPhoneNum}"
        designation: "${designation}"
        remuneration: "${remuneration}"
      }
    }
  ) {
    user {
      firstname
      lastname
      email
    }
  }
}`


        try {

            // console.log(qry)
            setIsLoading(true)

            let res = await handleQuery(qry, user.token, false)
            console.log(res.data.updateUser.user)
            await setIsLoading(false)


        } catch (e) {
            console.log(e, "GetUserDataError")
        }
    }

    const ChooseFile = async () => {

        await launchImageLibrary("", (response) => {
            console.log("Response = ", response);

            if (response.didCancel) {
                console.log("User cancelled image picker");
            } else if (response.error) {
                console.log("ImagePicker Error: ", response.error);
            } else if (response.customButton) {
                console.log(
                    "User tapped custom button: ",
                    response.customButton,
                );
                alert(response.customButton);
            } else {
                let source = response.assets[0].uri;
                setFilePath(source);
                setImageInfo(response.assets[0]);
            }
        });


    };

    const UploadFile = async () => {

        const formData = new FormData();
        formData.append('files', {
            uri: imageInfo.uri,
            name: imageInfo.fileName,
            type: imageInfo.type,
        });

        try {
            setIsLoading(true)


            await fetch(`${BASE_URL}/upload/`, {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
                method: "POST",
                body: formData,
            }).then((res) => {
                return res.json()
            }).then(async (response) => {
                await UploadNow(response[0].url)
                await setIsLoading(false)
                // console.log(response[0].url, "IMG")
            })


        } catch (e) {
            // setLoading(false);
            console.log('e', e);
            console.log('e', e.response);
        }
    };

    const UploadNow = async (link) => {

        let query = `mutation {
                        updateUser(input: { where: { id: ${user.id} },
                         data: { avatar: "${link}" } }) {
                        user {
                        id
                        avatar
                            }
                          }
                        }`

        try {


            let {data} = await handleQuery(query, user.token, false);

            // console.log(data, "DAYTAA")

        } catch (e) {
            console.log('e', e);
            console.log('e', e.response);
        }
    };


    const TabOne = () => {

        return (
            <View showsVerticalScrollIndicator={false} style={styles.tabOneContainer}>

                <KeyboardAwareScrollView showsVerticalScrollIndicator={false}>

                    <CustomTextInput
                        initialValue={firstName}
                        onFocus={() => setFirstName("")}
                        onChange={value => setFirstName(value)}
                        placeholderText={"First Name"}
                        // onFocus={() => setFirstName(firstName)}
                        title={"First Name"}/>


                    <CustomTextInput
                        title={"Last Name"}
                        onFocus={() => setLastName("")}
                        initialValue={lastName}
                        onChange={value => setLastName(value)}
                        placeholderText={"Last Name"}

                    />

                    <CustomTextInput
                        title={"Email"}
                        initialValue={email}
                        onChange={value => setEmail(value)}
                        placeholderText={"Email Address"}
                        props={{
                            editable: false
                        }}

                    />

                    <CustomTextInput
                        title={"Phone Number"}
                        initialValue={phoneNum}
                        onFocus={() => setPhoneNum("")}
                        onChange={value => setPhoneNum(value)}
                        placeholderText={"Phone Number"}
                        props={{
                            keyboardType: "numeric",
                            maxLength: 11
                        }}
                    />


                    <CustomTextInput
                        title={"Next of kin's Name"}
                        initialValue={nextOfKin}
                        onFocus={() => setNextOfKin("")}
                        onChange={value => setNextOfKin(value)}
                        placeholderText={"Next of kin's Name"}
                    />


                    <CustomTextInput
                        title={"Next of kin's Phone Number"}
                        initialValue={nextOfKinPhoneNum}
                        onFocus={() => setNextOfKinPhoneNum("")}
                        onChange={value => setNextOfKinPhoneNum(value)}
                        placeholderText={"Next of kin's Phone Number"}
                        props={{
                            keyboardType: "numeric",
                            maxLength: 11
                        }}
                    />

                </KeyboardAwareScrollView>
            </View>
        )
    }

    const TabTwo = () => {

        return (
            <View style={styles.tabOneContainer}>
                <KeyboardAwareScrollView showsVerticalScrollIndicator={false}>

                    <CustomTextInput
                        initialValue={profession}
                        onChange={value => setProfession(value)}
                        onFocus={() => setProfession("")}
                        placeholderText={"Profession"}
                        title={"Profession"}/>

                    <CustomTextInput
                        title={"Designation"}
                        initialValue={designation}
                        onFocus={() => setDesignation("")}
                        onChange={value => setDesignation(value)}
                        placeholderText={"Designation"}/>

                    <CustomTextInput
                        title={"Monthly Remuneration"}
                        initialValue={remuneration}
                        onFocus={() => setRemuneration("")}
                        onChange={value => setRemuneration(value)}
                        placeholderText={"Enter Monthly Remuneration"}
                        props={{
                            keyboardType: "numeric"
                        }}
                    />

                </KeyboardAwareScrollView>
            </View>
        )
    }

    function TopTab() {
        return (

            <View style={{flexDirection: "row", justifyContent: "space-between"}}>


                {tabs.map((item, index) => (

                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => {
                            setTabStatus(item.tabStatus)
                        }}
                        key={index}
                        style={{
                            width: "45%",
                            height: 60,
                            justifyContent: "center",
                        }}>
                        <View style={{width: "100%", alignItems: "center", marginVertical: 5}}>
                            <Text style={styles.tabStatusText}>{item.tabStatus}</Text>
                        </View>
                        <View style={[styles.btnTab, tabStatus === item.tabStatus && styles.btnTabActive]}/>
                    </TouchableOpacity>


                ))}
            </View>

        );
    }


    return (
        <>
            <NotchResponsive color={COLORS.white}/>
        <ScrollView style={styles.container}>
            <BackButton onPress={() => navigation.pop()}/>
            <Text style={styles.myProfile}>My Profile</Text>

            {/*<View>*/}
            <View style={{
                flexDirection: "row", marginBottom: 20, alignItems: "center", justifyContent: "center"
            }}>

                <FastImage
                    // resizeMode={"contain"}
                    resizeMode={FastImage.resizeMode.cover}
                    source={filePath ? {uri: filePath} : avatar ? {
                        uri: avatar,
                        priority: FastImage.priority.normal
                    } : require("../../assets/images/userImg.png")}
                    style={{
                        width: SIZES.width * 0.25,
                        height: SIZES.width * 0.25,
                        borderRadius: 130,
                        alignSelf: "center",
                    }}>

                </FastImage>

                <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => ChooseFile()}
                    style={{
                        backgroundColor: "#EFF2FF",
                        width: SIZES.width * 0.08,
                        height: SIZES.width * 0.08,
                        alignSelf: "center",
                        alignItems: "center",
                        justifyContent: "center",
                        right: 40,
                        top: 40,
                        borderRadius: 40,
                        // flex:1
                    }}>
                    <Image
                        source={icons.camera}
                        resizeMode={"contain"}
                        style={{width: 20, height: 20}}
                    />
                </TouchableOpacity>

            </View>


            {TopTab()}

            {tabStatus === "Personal Info" ? TabOne() : TabTwo()}

            <CustomButton
                onPress={async () => {

                    try {
                        await UpdateUserData()
                        await UploadFile()
                        navigation.navigate("BottomTabs")
                        setIsLoading(false)


                    } catch (e) {
                        console.log(e, "UpdateUserError")
                    }

                }}
                loading={isLoading}
                filled text={"Update Profile"}
            />

            {/*</View>*/}


        </ScrollView>
</>

    );
};

export default EditProfile


const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
        // paddingVertical: 20,
        height: SIZES.height,
        backgroundColor: COLORS.white
    },
    myProfile: {
        color: COLORS.primary,
        fontFamily: "Nexa-Bold",
        fontSize: SIZES.width * 0.06,
        marginVertical: 10
    },
    tabOneContainer: {
        // flex: 1,
        backgroundColor: COLORS.white,
        // paddingTop: 10
    },
    btnTab: {
        height: 3,
        borderRadius: 5,
    },
    btnTabActive: {
        backgroundColor: COLORS.primary,
    },
    tabStatusText: {
        fontSize: 16,
        fontFamily: "Nexa-Bold",
        color: COLORS.black
    }


})
